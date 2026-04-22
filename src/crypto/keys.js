function openKeyDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SignatureKeys", 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── IDBRequest Promise wrappers ──────────────────────────────────────────────
// Native IndexedDB methods return IDBRequest objects, NOT Promises.
// Awaiting them directly returns the IDBRequest itself (an object), which
// caused loadPrivateKey to always hit the "corrupted object" branch and
// delete valid keys. These helpers fix that.

function idbGet(store, key) {
  return new Promise((resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(store, value, key) {
  return new Promise((resolve, reject) => {
    const req = store.put(value, key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbDelete(store, key) {
  return new Promise((resolve, reject) => {
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
// ────────────────────────────────────────────────────────────────────────────

export async function generateKeyPair() {
  return await window.crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true, // extractable so we can export as JWK for storage
    ["sign", "verify"]
  );
}

export async function exportPublicKey(publicKey) {
  return await window.crypto.subtle.exportKey("jwk", publicKey);
}

async function exportPrivateKey(privateKey) {
  return await window.crypto.subtle.exportKey("jwk", privateKey);
}

export async function savePrivateKey(privateKey, userId) {
  const jwk = await exportPrivateKey(privateKey);
  const jwkString = JSON.stringify(jwk);
  JSON.parse(jwkString); // validate it's serializable before storing

  const db = await openKeyDB();
  const tx = db.transaction("keys", "readwrite");
  const store = tx.objectStore("keys");
  await idbPut(store, jwkString, String(userId)); // ← was: store.put() not awaited properly
}

export async function loadPrivateKey(userId) {
  const db = await openKeyDB();
  const tx = db.transaction("keys", "readonly");
  const store = tx.objectStore("keys");
  const stored = await idbGet(store, String(userId)); // ← was: returning IDBRequest object

  if (!stored) return null;

  let jwk;
  if (typeof stored === "string") {
    try {
      jwk = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse JWK string", e);
      const delTx = db.transaction("keys", "readwrite");
      const delStore = delTx.objectStore("keys");
      await idbDelete(delStore, String(userId));
      return null;
    }
  } else {
    // Unexpected format — delete and bail
    console.warn("Unexpected stored format, deleting");
    const delTx = db.transaction("keys", "readwrite");
    const delStore = delTx.objectStore("keys");
    await idbDelete(delStore, String(userId));
    return null;
  }

  // Validate required JWK fields
  if (!jwk.kty || jwk.kty !== "EC" || !jwk.crv || jwk.crv !== "P-256" || !jwk.d) {
    console.warn("Invalid JWK structure, deleting");
    const delTx = db.transaction("keys", "readwrite");
    const delStore = delTx.objectStore("keys");
    await idbDelete(delStore, String(userId));
    return null;
  }

  try {
    return await window.crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    );
  } catch (err) {
    console.error("Failed to import private key:", err);
    const delTx = db.transaction("keys", "readwrite");
    const delStore = delTx.objectStore("keys");
    await idbDelete(delStore, String(userId));
    return null;
  }
}

export async function hasKeyPair(userId) {
  const key = await loadPrivateKey(userId);
  return key !== null;
}