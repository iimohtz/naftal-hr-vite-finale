// Convert hex string to Uint8Array
function hexToBytes(hex) {
  if (typeof hex !== 'string') return new Uint8Array();
  // Remove 0x prefix if it exists
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
  let privateKeyHex = localStorage.getItem('private_key');
  if (!privateKeyHex) throw new Error('No private key found in storage');

  privateKeyHex = privateKeyHex.trim().replace(/^0x/, '');
  const privateKeyBytes = hexToBytes(privateKeyHex);

  // The string that acts as the "contract"
  const signedData = `approve:request_id:${requestId}:validator_id:${validatorId}:${new Date().toISOString().slice(0, 10)}`;

  try {
    // HMAC is much more stable in Web Crypto for raw 32-byte keys
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      privateKeyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(signedData);

    const signatureBuffer = await window.crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      dataBytes
    );

    return {
      signature: bytesToHex(new Uint8Array(signatureBuffer)),
      signed_data: signedData,
    };
  } catch (cryptoError) {
    console.error("Crypto Error Details:", cryptoError);
    throw new Error(`Signature failed: ${cryptoError.message}`);
  }
}