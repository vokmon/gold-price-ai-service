import { doc, Firestore, getFirestore, setDoc } from "firebase/firestore";
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
}
