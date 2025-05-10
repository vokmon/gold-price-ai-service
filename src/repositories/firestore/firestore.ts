import {
  collection,
  doc,
  Firestore,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { firebaseConfig } from "./firestore.config.ts";
import { FirebaseApp, initializeApp } from "firebase/app";

export class FirestoreRepo {
  private readonly isInitialized: boolean = false;
  private readonly app: FirebaseApp | null = null;
  private readonly db: Firestore | null = null;

  constructor() {
    if (!firebaseConfig.apiKey) {
      return;
    }
    this.isInitialized = true;
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
  }

  async saveDataToFireStore<T>(collectionName: string, data: T) {
    if (!this.isInitialized) {
      console.log("Firestore is not initialized");
      return;
    }

    const date = new Date();
    const timestamp = date.getTime().toString();
    await setDoc(doc(this.db!, collectionName, timestamp), {
      ...data,
      createdDateTime: date,
    } as any);
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

    const collectionRef = collection(this.db!, collectionName);
    const q = query(
      collectionRef,
      where("createdDateTime", ">=", startDate),
      where("createdDateTime", "<=", endDate)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as T)
    );
  }
}
