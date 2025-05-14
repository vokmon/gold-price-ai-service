import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FirestoreRepo } from "../../../src/repositories/firebase/firestore/firestore";
import * as firebaseApp from "firebase-admin/app";
import * as firebaseFirestore from "firebase-admin/firestore";
import * as firestoreConfig from "../../../src/repositories/firebase/firebase.config";

vi.mock("firebase-admin/firestore");
vi.mock("firebase-admin/app");

describe("FirestoreRepo - when config is available", () => {
  let repo: FirestoreRepo;
  let mockCollection: any;
  let mockDocRef: any;
  let mockQuery: any;
  let mockDb: any;

  beforeEach(() => {
    // Create mock objects
    mockDocRef = {
      set: vi.fn().mockResolvedValue(undefined),
    };

    mockQuery = {
      where: vi.fn(),
      get: vi.fn(),
      orderBy: vi.fn(),
      select: vi.fn(),
      limit: vi.fn(),
      startAfter: vi.fn(),
    };

    // Ensure each method returns the mockQuery for proper chaining
    mockQuery.where.mockReturnValue(mockQuery);
    mockQuery.orderBy.mockReturnValue(mockQuery);
    mockQuery.select.mockReturnValue(mockQuery);
    mockQuery.limit.mockReturnValue(mockQuery);
    mockQuery.startAfter.mockReturnValue(mockQuery);

    mockCollection = {
      doc: vi.fn().mockReturnValue(mockDocRef),
      where: vi.fn().mockReturnValue(mockQuery),
      orderBy: vi.fn().mockReturnValue(mockQuery),
      limit: vi.fn().mockReturnValue(mockQuery),
      startAfter: vi.fn().mockReturnValue(mockQuery),
    };

    mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    };

    // Set up spies
    vi.spyOn(firebaseApp, "initializeApp").mockReturnValue({} as any);
    vi.spyOn(firebaseApp, "cert").mockReturnValue({} as any);
    vi.spyOn(firebaseFirestore, "getFirestore").mockReturnValue(mockDb as any);

    // Mock the config
    vi.spyOn(firestoreConfig, "firebaseConfig", "get").mockReturnValue({
      projectId: "test-project",
      clientEmail: "test@example.com",
      privateKey: "test-key",
    });
    vi.spyOn(firestoreConfig, "firestoreDatabase", "get").mockReturnValue(
      mockDb as any
    );

    // Mock timestamp for consistent testing
    const mockTimestamp = "1234567890";
    vi.spyOn(Date.prototype, "getTime").mockReturnValue(
      parseInt(mockTimestamp)
    );

    // Set up the mock behaviors for query
    mockQuery.get.mockResolvedValue({
      docs: [
        {
          id: "doc-id-1",
          data: () => ({ name: "Test Name", value: 123 }),
        },
      ],
    });

    // Create repository instance for tests
    repo = new FirestoreRepo();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with proper configuration", () => {
    expect(repo["isInitialized"]).toBe(true);
  });

  it("should save data to Firestore with timestamp", async () => {
    // Arrange
    const testCollection = "test-collection";
    const testData = { name: "Test Name", value: 123 };
    const timestamp = new Date().getTime().toString();

    // Act
    await repo.saveDataToFireStore(testCollection, testData);

    // Assert
    expect(mockDb.collection).toHaveBeenCalledWith(testCollection);
    expect(mockCollection.doc).toHaveBeenCalledWith(timestamp);
    expect(mockDocRef.set).toHaveBeenCalledWith({
      ...testData,
      createdDateTime: expect.any(Date),
    });
  });

  it("should get documents by datetime", async () => {
    // Arrange
    const testCollection = "test-collection";
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);

    // Act
    const result = await repo.getDocumentsByDatetime(
      testCollection,
      startDate,
      endDate
    );

    // Assert
    expect(mockDb.collection).toHaveBeenCalledWith(testCollection);
    expect(mockCollection.where).toHaveBeenCalledWith(
      "createdDateTime",
      ">=",
      startDate
    );
    expect(mockQuery.where).toHaveBeenCalledWith(
      "createdDateTime",
      "<=",
      endDate
    );
    expect(result).toEqual([
      {
        id: "doc-id-1",
        name: "Test Name",
        value: 123,
      },
    ]);
  });

  it("should retrieve documents by datetime with pagination", async () => {
    // Arrange
    const testCollection = "test-collection";
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    const pageSize = 2;

    // Create mock data for first and second pages
    const page1Docs = [
      {
        id: "doc-id-1",
        data: () => ({ name: "Test Name 1", value: 123 }),
      },
      {
        id: "doc-id-2",
        data: () => ({ name: "Test Name 2", value: 456 }),
      },
    ];

    const page2Docs = [
      {
        id: "doc-id-3",
        data: () => ({ name: "Test Name 3", value: 789 }),
      },
    ];

    // Set up the first query result (full page)
    mockQuery.get.mockResolvedValueOnce({
      empty: false,
      docs: page1Docs,
    });

    // Set up the second query result (partial page - last page)
    mockQuery.get.mockResolvedValueOnce({
      empty: false,
      docs: page2Docs,
    });

    // Set up the third query result (empty - should not be reached)
    mockQuery.get.mockResolvedValueOnce({
      empty: true,
      docs: [],
    });

    // Act
    const result = await repo.getDocumentsByDatetime(
      testCollection,
      startDate,
      endDate,
      {
        fields: ["createdDateTime", "currentPrice"],
        pageSize: 2,
      }
    );

    // Assert
    // First page query creation
    expect(mockDb.collection).toHaveBeenCalledWith(testCollection);
    expect(mockCollection.where).toHaveBeenCalledWith(
      "createdDateTime",
      ">=",
      startDate
    );
    expect(mockQuery.where).toHaveBeenCalledWith(
      "createdDateTime",
      "<=",
      endDate
    );
    expect(mockQuery.orderBy).toHaveBeenCalledWith("createdDateTime");
    expect(mockQuery.limit).toHaveBeenCalledWith(pageSize);

    // Second page query should use startAfter with the last doc from first page
    expect(mockQuery.startAfter).toHaveBeenCalledWith(page1Docs[1]);

    // Should have fetched all documents across both pages
    expect(result).toEqual([
      { id: "doc-id-1", name: "Test Name 1", value: 123 },
      { id: "doc-id-2", name: "Test Name 2", value: 456 },
      { id: "doc-id-3", name: "Test Name 3", value: 789 },
    ]);

    // Should have made exactly 2 get calls (2 pages of data)
    expect(mockQuery.get).toHaveBeenCalledTimes(2);
  });

  it("should handle empty query results during pagination", async () => {
    // Arrange
    const testCollection = "test-collection";
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);

    // Create mock data for first page only
    const page1Docs = [
      {
        id: "doc-id-1",
        data: () => ({ name: "Test Name 1", value: 123 }),
      },
      {
        id: "doc-id-2",
        data: () => ({ name: "Test Name 2", value: 456 }),
      },
    ];

    // Set up the first query result (full page)
    mockQuery.get.mockResolvedValueOnce({
      empty: false,
      docs: page1Docs,
    });

    // Set up the second query result (empty result - no more pages)
    mockQuery.get.mockResolvedValueOnce({
      empty: true,
      docs: [],
    });

    // Act
    const result = await repo.getDocumentsByDatetime(
      testCollection,
      startDate,
      endDate,
      {
        pageSize: 2,
      }
    );

    // Assert
    // Should have two get calls, one for first page and one for second empty page
    expect(mockQuery.get).toHaveBeenCalledTimes(2);

    // Should have stopped processing after empty result
    expect(mockQuery.startAfter).toHaveBeenCalledTimes(1);
    expect(mockQuery.startAfter).toHaveBeenCalledWith(page1Docs[1]);

    // Should return just the first page results
    expect(result).toEqual([
      { id: "doc-id-1", name: "Test Name 1", value: 123 },
      { id: "doc-id-2", name: "Test Name 2", value: 456 },
    ]);

    // The empty docs case should trigger these lines in firestore.ts:
    // if (querySnapshot.empty) {
    //   hasMoreData = false;
    //   break;
    // }
  });
});
