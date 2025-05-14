import {
  getAccessToken,
  inferFirestoreValue,
  parseFirestoreDocument,
} from "../utils/firebase-utils.ts";

export class FirestoreRepo {
  private readonly projectId = Deno.env.get("FIREBASE_PROJECT_ID")!;

  async saveDataToFireStore<T>(
    collectionName: string,
    data: T,
    { id }: { id?: string } = { id: undefined }
  ) {
    const date = new Date();
    const docId = id || date.getTime().toString();

    const token = await getAccessToken();

    const body = {
      id: docId,
      ...data,
      createdDateTime: date,
    };

    const firestoreBody = {
      fields: Object.fromEntries(
        Object.entries(body).map(([k, v]) => [k, inferFirestoreValue(v)])
      ),
    };

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/${collectionName}?documentId=${docId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(firestoreBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Error saving data: ${response.statusText}`);
    }
    return body as T;
  }

  async updateDataToFireStore<T>(collectionName: string, data: T, id: string) {
    const date = new Date();

    const token = await getAccessToken();

    const body = {
      ...data,
      createdDateTime: date,
    };

    const firestoreBody = {
      fields: Object.fromEntries(
        Object.entries(body).map(([k, v]) => [k, inferFirestoreValue(v)])
      ),
    };

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/${collectionName}/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(firestoreBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating data: ${response.statusText}`);
    }

    return body as T;
  }

  async getDataFromFireStoreById<T>(collectionName: string, id: string) {
    const token = await getAccessToken();

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/${collectionName}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.log(
        "🔴 Error getting data from firestore: ",
        response.statusText
      );
      return null;
    }

    const json = await response.json();
    const parsed = parseFirestoreDocument(json.fields);
    return parsed as T;
  }
}
