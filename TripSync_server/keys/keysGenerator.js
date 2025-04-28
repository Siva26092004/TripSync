import { generateKeyPairSync } from 'crypto';
import { writeFileSync } from 'fs';

export function generateKeys(privateKeyPath = 'private.key', publicKeyPath = 'public.key') {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  writeFileSync(privateKeyPath, privateKey);
  writeFileSync(publicKeyPath, publicKey);

  console.log(`✅ Keys generated and saved to ${privateKeyPath} and ${publicKeyPath}`);
}

generateKeys();