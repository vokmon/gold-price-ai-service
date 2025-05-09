import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { FirestoreRepo } from "../../../src/repositories/firestore/firestore";
import { initializeApp } from "firebase/app";

// Mock firebase modules
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getFirestore: vi.fn(),
  setDoc: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(),
}));

// Nest the describe blocks to control execution order
describe("FirestoreRepo - when config is available", () => {
  const mockApp = "mocked-firebase-app";
  const mockDb = "mocked-db";
  const mockDocRef = "mocked-doc-reference";
  let repo: FirestoreRepo;

  // Setup mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    // Mock firebase config
    vi.mock("../../../src/repositories/firestore/firestore.config.ts", () => ({
      firebaseConfig: {
        apiKey: "test-api-key",
        authDomain: "test-domain",
        projectId: "test-project",
      },
    }));

    // Mock timestamp for consistent testing
    const mockTimestamp = "1234567890";
    vi.spyOn(Date.prototype, "getTime").mockReturnValue(
      parseInt(mockTimestamp)
    );

    // Setup mock return values
    (initializeApp as unknown as Mock).mockReturnValue(mockApp);
    (getFirestore as unknown as Mock).mockReturnValue(mockDb);
    (doc as unknown as Mock).mockReturnValue(mockDocRef);
    (setDoc as unknown as Mock).mockResolvedValue(undefined);

    // Create repository instance for tests
    repo = new FirestoreRepo();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize Firebase when config is available", () => {
    expect(initializeApp).toHaveBeenCalled();
    expect(getFirestore).toHaveBeenCalledWith(mockApp);
  });

  it("should save data to Firestore with timestamp", async () => {
    // Arrange
    const testCollection = "test-collection";
    const testData = { name: "Test Name", value: 123 };
    const timestamp = new Date().getTime().toString();

    // Act
    await repo.saveDataToFireStore(testCollection, testData);

    // Assert
    expect(doc).toHaveBeenCalledWith(mockDb, testCollection, timestamp);
    expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
      ...testData,
      createdAt: timestamp,
    });
  });
});
