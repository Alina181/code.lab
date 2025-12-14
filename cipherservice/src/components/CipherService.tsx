import React, { useState } from 'react';

class RC4Cipher {

  private static generateNonce(length: number = 16): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  private static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private static hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) {
      throw new Error('Некорректная строка: нечётное количество символов');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  }

  private static async deriveKey(originalKey: string, nonce: Uint8Array): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(originalKey);
    const combined = new Uint8Array(keyData.length + nonce.length);
    combined.set(keyData);
    combined.set(nonce, keyData.length);
    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    return new Uint8Array(hashBuffer);
  }

  public static async encrypt(text: string, key: string): Promise<string> {
    const nonce = this.generateNonce();
    const effectiveKey = await this.deriveKey(key, nonce);
    const textBytes = new TextEncoder().encode(text);

    const s = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      s[i] = i;
    }

    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + s[i] + effectiveKey[i % effectiveKey.length]) % 256;
      const temp = s[i];
      s[i] = s[j];
      s[j] = temp;
    }

    const result = new Uint8Array(textBytes.length);
    let i = 0; 
    j = 0;
    for (let k = 0; k < textBytes.length; k++) {
      i = (i + 1) % 256;
      j = (j + s[i]) % 256;
      const temp = s[i];
      s[i] = s[j];
      s[j] = temp;
      const randomByte = s[(s[i] + s[j]) % 256];
      result[k] = textBytes[k] ^ randomByte;
    }

    const nonceHex = this.bytesToHex(nonce);
    const encryptedHex = this.bytesToHex(result);
    return `${nonceHex}:${encryptedHex}`;
  }

  public static async decrypt(encryptedWithNonce: string, key: string): Promise<string> {
    const parts = encryptedWithNonce.split(':');
    if (parts.length !== 2) {
      throw new Error('Формат должен быть: nonce:hex');
    }
    const [nonceHex, encryptedHex] = parts;
    const nonce = this.hexToBytes(nonceHex);
    const encryptedBytes = this.hexToBytes(encryptedHex);
    const effectiveKey = await this.deriveKey(key, nonce);

    const s = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      s[i] = i;
    }

    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + s[i] + effectiveKey[i % effectiveKey.length]) % 256;
      const temp = s[i];
      s[i] = s[j];
      s[j] = temp;
    }

    const result = new Uint8Array(encryptedBytes.length);
    let i = 0; 
    j = 0;
    for (let k = 0; k < encryptedBytes.length; k++) {
      i = (i + 1) % 256;
      j = (j + s[i]) % 256;
      const temp = s[i];
      s[i] = s[j];
      s[j] = temp;
      const randomByte = s[(s[i] + s[j]) % 256];
      result[k] = encryptedBytes[k] ^ randomByte;
    }

    return new TextDecoder().decode(result);
  }
}

const CipherService: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [key, setKey] = useState<string>('');

  const handleEncrypt = async (): Promise<void> => {
    if (!inputText.trim() || !key.trim()) {
      setOutputText('');
      return;
    }
    try {
      const result = await RC4Cipher.encrypt(inputText, key);
      setOutputText(result);
    } catch (err) {
      setOutputText('Ошибка шифрования');
    }
  };

  const handleDecrypt = async (): Promise<void> => {
    if (!inputText.trim() || !key.trim()) {
      setOutputText('');
      return;
    }
    try {
      const result = await RC4Cipher.decrypt(inputText, key);
      setOutputText(result);
    } catch (err) {
      setOutputText('Ошибка: проверьте формат (nonce:hex) и ключ');
    }
  };

  return (
    <div className="cipher-service">
      <h1>RC4 + Вероятностное Шифрование</h1>

      <textarea
        className="text-input"
        placeholder="Текст для шифрования ИЛИ зашифрованная строка"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        aria-label="Входные данные"
      />

      <input
        type="text"
        className="text-input"
        placeholder="Ключ шифрования"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        aria-label="Ключ"
      />

      <textarea
        className="text-output"
        placeholder="Результат..."
        value={outputText}
        readOnly
        aria-label="Результат"
      />

      <div className="button-group">
        <button className="action-button" onClick={handleEncrypt}>
          Зашифровать
        </button>
        <button className="action-button" onClick={handleDecrypt}>
          Расшифровать
        </button>
      </div>
    </div>
  );
};

export default CipherService;