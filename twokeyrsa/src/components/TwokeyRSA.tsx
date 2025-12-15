import React, { useState, useEffect } from 'react';

const TwokeyRSA: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('Результат...');
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);

  useEffect(() => {
    const generateKeys = async () => {
      try {
        const keys = await window.crypto.subtle.generateKey(
          {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
          },
          true,
          ['encrypt', 'decrypt']
        );
        setKeyPair(keys);
      } catch (err) {
        console.error('Ошибка генерации ключей:', err);
        setOutputText('Ошибка: не удалось сгенерировать ключи RSA');
      }
    };
    generateKeys();
  }, []);

  const strToUtf8Array = (str: string): Uint8Array => {
    return new TextEncoder().encode(str);
  };

  const utf8ArrayToStr = (buffer: ArrayBuffer): string => {
    return new TextDecoder().decode(buffer);
  };

  const arrayBufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ');
  };

  const hexToArrayBuffer = (hex: string): ArrayBuffer => {
    const hexStr = hex.trim();
    if (!hexStr) {
      return new ArrayBuffer(0);
    }
    const bytes = hexStr.split(/\s+/).map(byte => {
      const val = parseInt(byte, 16);
      if (isNaN(val) || val < 0 || val > 255) {
        throw new Error(`Некорректный байт: ${byte}`);
      }
      return val;
    });

    const buffer = new ArrayBuffer(bytes.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      view[i] = bytes[i];
    }
    return buffer;
  };

  const handleEncrypt = async (): Promise<void> => {
    if (!keyPair) {
      setOutputText('Ошибка: ключи ещё не готовы');
      return;
    }
    if (inputText.trim() === '') {
      setOutputText('Введите текст для шифрования');
      return;
    }

    try {
      const encoded = strToUtf8Array(inputText);
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        keyPair.publicKey,
        encoded as BufferSource
      );
      const hexResult = arrayBufferToHex(encryptedBuffer);
      setOutputText(hexResult);
    } catch (err) {
      console.error('Ошибка шифрования:', err);
      setOutputText('Ошибка: не удалось зашифровать текст (слишком длинный?)');
    }
  };

  const handleDecrypt = async (): Promise<void> => {
    if (!keyPair) {
      setOutputText('Ошибка: ключи ещё не готовы');
      return;
    }
    if (inputText.trim() === '') {
      setOutputText('Введите шифротекст (например: 48 65 6c 6c 6f)');
      return;
    }

    try {
      const buffer = hexToArrayBuffer(inputText);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        keyPair.privateKey,
        buffer
      );
      const plainText = utf8ArrayToStr(decryptedBuffer);
      setOutputText(plainText);
    } catch (err) {
      console.error('Ошибка расшифровки:', err);
      setOutputText('Ошибка: недопустимый формат шифротекста или ошибка расшифровки');
    }
  };

  return (
    <div className="rsa-card">
      <h1 className="rsa-title">Двухключевой шифр (RSA)</h1>

      <textarea
        className="rsa-input"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Введите текст или шифротекст"
        rows={4}
      />

      <div className="button-group">
        <button className="rsa-button" onClick={handleEncrypt} type="button">
          Зашифровать
        </button>
        <button className="rsa-button" onClick={handleDecrypt} type="button">
          Расшифровать
        </button>
      </div>

      <div className="rsa-result">
        {outputText}
      </div>
    </div>
  );
};

export default TwokeyRSA;