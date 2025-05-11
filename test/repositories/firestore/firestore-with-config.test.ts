import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FirestoreRepo } from "../../../src/repositories/firestore/firestore";

// Mock the required firebase-admin modules first
vi.mock("firebase-admin/firestore");
vi.mock("firebase-admin/app");
vi.mock("../../../src/repositories/firestore/firestore.config.ts", () => ({
  firebaseConfig: {
    projectId: "test-project",
    clientEmail: "test@example.com",
    privateKey: "test-private-key",
  },
}));

describe("FirestoreRepo - when config is available", () => {
  // Define all mock objects
  const mockCollection = {
    doc: vi.fn(),
    where: vi.fn(),
  };
  const mockQuery = {
    where: vi.fn(),
    get: vi.fn(),
  };
  const mockDocRef = {
    set: vi.fn(),
  };
  const mockDb = {
    collection: vi.fn(),
  };

  let repo: FirestoreRepo;

  // Setup mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock timestamp for consistent testing
    const mockTimestamp = "1234567890";
    vi.spyOn(Date.prototype, "getTime").mockReturnValue(
      parseInt(mockTimestamp)
    );

    // Setup mock return values
    mockDb.collection.mockReturnValue(mockCollection);
    mockCollection.doc.mockReturnValue(mockDocRef);
    mockDocRef.set.mockResolvedValue(undefined);

    mockCollection.where.mockReturnValue(mockQuery);
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

    // Mock the internal db property since we cannot access the real Firestore instance
    Object.defineProperty(repo, "db", {
      value: mockDb,
      writable: true,
    });

    // Set isInitialized to true
    Object.defineProperty(repo, "isInitialized", {
      value: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize Firebase when config is available", () => {
    // Verify the properties were set correctly
    expect(repo["isInitialized"]).toBe(true);
    expect(repo["db"]).toBe(mockDb);
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
