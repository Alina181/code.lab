import React, { useState } from 'react';

const TwokeyRSA: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');

  const [outputText, setOutputText] = useState<string>('Результат...');

  const mockEncrypt = (text: string): string => {
    return text
      .split('')
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(' ');
  };

  const mockDecrypt = (hexString: string): string => {
    try {
      return hexString
        .split(' ')
        .map(hex => String.fromCharCode(parseInt(hex, 16)))
        .join('');
    } catch {
      return 'Ошибка: недопустимый формат шифротекста';
    }
  };

  const handleEncrypt = (): void => {
    if (inputText.trim() === '') {
      setOutputText('Введите текст для шифрования');
      return;
    }
    const encrypted = mockEncrypt(inputText);
    setOutputText(encrypted);
  };

  const handleDecrypt = (): void => {
    if (inputText.trim() === '') {
      setOutputText('Введите шифротекст (например: 48 65 6c 6c 6f)');
      return;
    }
    const decrypted = mockDecrypt(inputText);
    setOutputText(decrypted);
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