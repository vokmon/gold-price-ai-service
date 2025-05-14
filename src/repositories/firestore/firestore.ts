import { Firestore } from "firebase-admin/firestore";
import {
  firebaseConfig,
  firestoreDatabase,
} from "../firebase/firebase.config.ts";

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
    endDate: Date,
    {
      fields,
      pageSize,
    }: {
      fields?: string[];
      pageSize?: number;
    } = {
      pageSize: 80,
    }
  ): Promise<T[]> {
    if (!this.isInitialized) {
      console.log("Firestore is not initialized");
      return [];
    }

    const results: T[] = [];
    const collectionRef = this.db!.collection(collectionName);

    let query = collectionRef
      .where("createdDateTime", ">=", startDate)
      .where("createdDateTime", "<=", endDate)
      .orderBy("createdDateTime");

    // Only apply select if fields are specified
    if (fields && fields.length > 0) {
      query = query.select(...fields);
    }

    query = query.limit(pageSize!);

    let lastDoc = null;
    let hasMoreData = true;

    while (hasMoreData) {
      // Apply pagination cursor if not the first page
      if (lastDoc) {
        query = collectionRef
          .where("createdDateTime", ">=", startDate)
          .where("createdDateTime", "<=", endDate)
          .orderBy("createdDateTime");

        // Only apply select if fields are specified
        if (fields && fields.length > 0) {
          query = query.select(...fields);
        }

        // Continue building the query with pagination
        query = query.startAfter(lastDoc).limit(pageSize!);
      }

      const querySnapshot = await query.get();

      console.log(
        `querySnapshot for ${collectionName}: `,
        querySnapshot.docs.length
      );

      if (querySnapshot.empty) {
        hasMoreData = false;
        break;
      }

      const docs = querySnapshot.docs;
      lastDoc = docs[docs.length - 1];

      const pageResults = docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as T)
      );

      results.push(...pageResults);

      // Stop if we got fewer documents than requested (last page)
      if (docs.length < pageSize!) {
        hasMoreData = false;
      }
    }

    return results;
  }
}
