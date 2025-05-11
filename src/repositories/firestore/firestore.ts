import { getFirestore } from "firebase-admin/firestore";
import { Firestore } from "firebase-admin/firestore";
import { firebaseConfig } from "./firestore.config.ts";
import { cert, initializeApp } from "firebase-admin/app";

const app = initializeApp({
  credential: cert({
    projectId: firebaseConfig.projectId,
    clientEmail: firebaseConfig.clientEmail,
    privateKey: firebaseConfig.privateKey,
  }),
  databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
});
const db = getFirestore(app);
export class FirestoreRepo {
  private readonly isInitialized: boolean = false;
  private readonly db: Firestore | null = null;

  constructor() {
    if (!firebaseConfig.projectId) {
      return;
    }

    this.isInitialized = true;
    this.db = db;
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
