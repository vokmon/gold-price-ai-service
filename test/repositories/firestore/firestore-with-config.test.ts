import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FirestoreRepo } from "../../../src/repositories/firestore/firestore";
import * as firebaseApp from "firebase-admin/app";
import * as firebaseFirestore from "firebase-admin/firestore";
import * as firestoreConfig from "../../../src/repositories/firestore/firestore.config";

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
    };

    mockCollection = {
      doc: vi.fn().mockReturnValue(mockDocRef),
      where: vi.fn().mockReturnValue(mockQuery),
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
    mockQuery.where.mockReturnValue(mockQuery);
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
});
