import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import FirestoreOutput from "../../src/services/outputs/impl/firestore-output";
import { FirestoreRepo } from "../../src/repositories/firestore/firestore";

// Mock the FirestoreRepo
// vi.mock("../../src/repositories/firestore/firestore", () => ({
//   FirestoreRepo: vi.fn().mockImplementation(() => ({
//     saveDataToFireStore: vi.fn().mockResolvedValue(undefined),
//   })),
// }));

describe("FirestoreOutput", () => {
  let firestoreOutput: FirestoreOutput;
  const testCollectionName = "test-collection";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(FirestoreRepo.prototype, "saveDataToFireStore").mockResolvedValue(
      undefined
    );
    firestoreOutput = new FirestoreOutput(testCollectionName);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should log message and save object to Firestore", async () => {
    // Arrange
    const testMessage = "Test message";
    const testObject = { id: 1, name: "Test data" };
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Act
    await firestoreOutput.outputMessage(testMessage, testObject);

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith(
      "Output message to Firestore with object: ",
      testObject
    );
    expect(
      firestoreOutput["firestoreRepo"].saveDataToFireStore
    ).toHaveBeenCalledWith(testCollectionName, testObject);
  });

  it("should handle undefined object parameter", async () => {
    // Arrange
    const testMessage = "Test message without object";
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Act
    await firestoreOutput.outputMessage(testMessage);

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith(
      "Output message to Firestore with object: ",
      undefined
    );
    expect(
      firestoreOutput["firestoreRepo"].saveDataToFireStore
    ).toHaveBeenCalledWith(testCollectionName, undefined);
  });

  it("should propagate errors from FirestoreRepo", async () => {
    // Arrange
    const testMessage = "Test error message";
    const testError = new Error("Firestore error");

    // Mock the saveDataToFireStore method to throw an error
    (
      firestoreOutput["firestoreRepo"].saveDataToFireStore as Mock
    ).mockRejectedValueOnce(testError);

    // Act & Assert
    await expect(firestoreOutput.outputMessage(testMessage)).rejects.toThrow(
      testError
    );
  });

  it("should output image to Firestore", async () => {
    // Arrange
    const testImage = Buffer.from("testImage", "utf-8");
    const testDescription = "Test image description";
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Act
    await firestoreOutput.outputImage(testImage, testDescription);

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith(
      "(Not implemented) Output image to Firestore with description: ",
      testDescription
    );
  });
});
