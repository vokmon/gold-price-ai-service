import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { FirestoreRepo } from "../../../src/repositories/firebase/firestore/firestore";

// Mock firebase-admin modules
vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(),
}));

vi.mock("firebase-admin/app", () => ({
  cert: vi.fn(),
  initializeApp: vi.fn(),
}));

describe("FirestoreRepo - when config is not available", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.mock("../../../src/repositories/firebase/firebase.config.ts", () => ({
      firebaseConfig: {
        projectId: "",
        clientEmail: "test@example.com",
        privateKey: "test-private-key",
      },
    }));
  });

  it("should not initialize Firebase when config is missing projectId", () => {
    // Create new instance with empty projectId config
    const uninitializedRepo = new FirestoreRepo();

    // Verify repository is not initialized
    expect(uninitializedRepo["isInitialized"]).toBe(false);
    expect(uninitializedRepo["db"]).toBeNull();
  });

  it("should not attempt to save data when not initialized", async () => {
    // Arrange
    const uninitializedRepo = new FirestoreRepo();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Act
    await uninitializedRepo.saveDataToFireStore("test-collection", {
      test: "data",
    });

    // Assert
    // We don't need to check Firebase methods since they're not being called
    expect(consoleSpy).toHaveBeenCalledWith("Firestore is not initialized");
  });

  it("should not attempt to get documents by datetime when not initialized", async () => {
    // Arrange
    const uninitializedRepo = new FirestoreRepo();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);

    // Act
    const result = await uninitializedRepo.getDocumentsByDatetime(
      "test-collection",
      startDate,
      endDate
    );

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith("Firestore is not initialized");
    expect(result).toEqual([]);
  });
});
