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

describe("FirestoreRepo - when config is not available", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.mock("../../../src/repositories/firestore/firestore.config.ts", () => ({
      firebaseConfig: {
        apiKey: "",
        authDomain: "test-domain",
        projectId: "test-project",
      },
    }));
  });

  it("should not initialize Firebase when config is missing API key", () => {
    // Create new instance with empty API key config
    const uninitializedRepo = new FirestoreRepo();
    // Verify Firebase was not initialized
    expect(initializeApp).not.toHaveBeenCalled();
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
    expect(setDoc).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("Firestore is not initialized");
  });
});
