import { Firestore } from "firebase-admin/firestore";
import { firebaseConfig, firestoreDatabase } from "./firestore.config.ts";

export class FirestoreRepo {
  private readonly isInitialized: boolean = false;
  private readonly db: Firestore | null = null;

  constructor() {
    if (!firebaseConfig.projectId) {
      return;
    }

    this.isInitialized = true;
    this.db = firestoreDatabase;
  }

  async saveDataToFireStore<T>(collectionName: string, data: T) {
    if (!this.isInitialized) {
      console.log("Firestore is not initialized");
      return;
    }

    const date = new Date();
    const timestamp = date.getTime().toString();
    const docRef = this.db!.collection(collectionName).doc(timestamp);
    await docRef.set({
      ...data,
      createdDateTime: date,
    });
  }

  async getDocumentsByDatetime<T>(
    collectionName: string,
    startDate: Date,
    endDate: Date
  ): Promise<T[]> {
    if (!this.isInitialized) {
      console.log("Firestore is not initialized");
      return [];
    }

    const collectionRef = this.db!.collection(collectionName);
    const q = collectionRef
      .where("createdDateTime", ">=", startDate)
      .where("createdDateTime", "<=", endDate);

    const querySnapshot = await q.get();
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as T)
    );
  }
}
