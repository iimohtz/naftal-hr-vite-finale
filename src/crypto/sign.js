import { loadPrivateKey } from "./keys";

function hexToBytes(hex) {
  if (typeof hex !== 'string') return new Uint8Array();
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function signApproval(requestId, validatorId) {
  // Get current user ID from localStorage (set during login)
  const userStr = localStorage.getItem("user");
  if (!userStr) throw new Error("No user found");
  const user = JSON.parse(userStr);
  const userId = user.id;

  // Load the private key from IndexedDB
  const privateKey = await loadPrivateKey(userId);
  if (!privateKey) throw new Error("Digital signature key not found. Please log out and log in again.");

  // Build the message to sign (must match verification on backend)
  const signedData = `approve:request_id:${requestId}:validator_id:${validatorId}:${new Date().toISOString().slice(0, 10)}`;

  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(signedData);

  const signatureBuffer = await window.crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    dataBytes
  );

  const signature = bytesToHex(new Uint8Array(signatureBuffer));

  return { signature, signed_data: signedData };
}