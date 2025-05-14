import { SignJWT } from "npm:jose@5.2.3";
import { importPKCS8 } from "npm:jose@5.2.3";

async function getAccessToken(): Promise<string> {
  const serviceAccount = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT")!);
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/datastore",
    iat: now,
    exp: now + 3600,
  };

  const alg = "RS256";
  const privateKey = await importPKCS8(serviceAccount.private_key, alg);

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .sign(privateKey);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const json = await res.json();
  if (!res.ok) {
    console.error(json);
    throw new Error("Failed to get access token");
  }

  return json.access_token;
}

function inferFirestoreValue(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    return { stringValue: value };
  } else if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: value.toString() }
      : { doubleValue: value };
  } else if (typeof value === "boolean") {
    return { booleanValue: value };
  } else if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  } else if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((v) => inferFirestoreValue(v)),
      },
    };
  } else if (typeof value === "object" && value !== null) {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, inferFirestoreValue(v)])
        ),
      },
    };
  } else {
    return { nullValue: null };
  }
}

function parseFirestoreValue(value: any): any {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return parseInt(value.integerValue, 10);
  if ("doubleValue" in value) return parseFloat(value.doubleValue);
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return new Date(value.timestampValue);
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields).map(([k, v]) => [
        k,
        parseFirestoreValue(v),
      ])
    );
  }
  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map(parseFirestoreValue);
  }
  return null; // fallback
}

function parseFirestoreDocument(fields: Record<string, any>): any {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      parseFirestoreValue(value),
    ])
  );
}

export { getAccessToken, inferFirestoreValue, parseFirestoreDocument };
