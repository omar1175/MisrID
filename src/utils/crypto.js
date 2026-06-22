const crypto = require('crypto');

const normalizeValue = (value) => String(value || '').trim().toUpperCase();

const getEncryptionKey = () => {
  const secret = process.env.DATA_ENCRYPTION_KEY;

  if (!secret) {
    throw new Error('DATA_ENCRYPTION_KEY is required to encrypt sensitive profile data');
  }

  // 64 hex chars = 32 bytes
  if (/^[a-f0-9]{64}$/i.test(secret)) {
    return Buffer.from(secret, 'hex');
  }

  // base64 32 bytes
  const base64Buffer = Buffer.from(secret, 'base64');
  if (base64Buffer.length === 32) {
    return base64Buffer;
  }

  // Fallback: derive a stable 32-byte key from any long secret.
  return crypto.createHash('sha256').update(secret).digest();
};

const encryptText = (plainText) => {
  const value = normalizeValue(plainText);
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':');
};

const decryptText = (encryptedValue) => {
  const [ivHex, authTagHex, encryptedHex] = String(encryptedValue).split(':');

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Invalid encrypted value format');
  }

  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
};

const hashValue = (value) => {
  return crypto
    .createHash('sha256')
    .update(normalizeValue(value))
    .digest('hex');
};

const maskPassportNumber = (passportNumber) => {
  const value = normalizeValue(passportNumber);
  if (!value) return null;
  if (value.length <= 4) return `${value[0]}***`;
  return `${value.slice(0, 4)}****`;
};

module.exports = {
  normalizeValue,
  encryptText,
  decryptText,
  hashValue,
  maskPassportNumber,
};
