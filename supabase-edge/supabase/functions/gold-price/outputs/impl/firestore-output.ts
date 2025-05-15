import { FirestoreRepo } from "../../repositories/firestore.ts";
import { OutputInterface } from "../output-interface.ts";

export default class FirestoreOutput implements OutputInterface {
  private readonly firestoreRepo: FirestoreRepo;
  private readonly collectionName: string;

  constructor(collectionName: string) {
    this.firestoreRepo = new FirestoreRepo();
    this.collectionName = collectionName;
  }

  async outputMessage<T>(_message: string, object?: T): Promise<void> {
    console.log("🔥 Output message to Firestore with object: ", object);
    await this.firestoreRepo.saveDataToFireStore(this.collectionName, object);
  }

  async outputImage(_imageBuffer: Buffer, description: string): Promise<void> {
    console.log(
      "(Not implemented) Output image to Firestore with description: ",
      description
    );
  }

  toString() {
    return `FirestoreOutput(collectionName: ${this.collectionName})`;
  }
}
