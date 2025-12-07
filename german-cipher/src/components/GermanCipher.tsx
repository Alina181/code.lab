import React, { useState } from 'react';

class ADFGVXCipher {
  private readonly AdfgvxCipher: string[][] = [
    ['A', 'D', 'F', 'G', 'V', 'X'],
    ['p', 'h', '0', 'q', 'g', '6'],
    ['4', 'm', 'e', 'a', '1', 'y'],
    ['l', '2', 'n', 'o', 'f', 'd'],
    ['x', 'k', 'r', '3', 'c', 'v'],
    ['s', '5', 'z', 'w', '7', 'b'],
    ['j', '9', 'u', 't', 'i', '8']
  ];

  private buildCharToCodeMap(): Record<string, string> {
    const map: Record<string, string> = {};
    const headers = this.AdfgvxCipher[0]; // ['A','D','F','G','V','X']

    for (let row = 1; row < this.AdfgvxCipher.length; row++) {
      for (let col = 0; col < headers.length; col++) {
        const char = this.AdfgvxCipher[row][col].toLowerCase();
        const code = headers[row - 1] + headers[col];
        map[char] = code;
      }
    }
    return map;
  }

  public encrypt(plaintext: string): string {
    const cleanText = plaintext.toLowerCase().replace(/[^a-z0-9]/g, '');
    const map = this.buildCharToCodeMap();
    let result = '';
    for (const char of cleanText) {
      if (map[char]) result += map[char];
    }
    return result;
  }

  public decrypt(encoded: string): string {
    const cleanEncoded = encoded.toUpperCase().replace(/[^ADFGVX]/g, '');
    if (cleanEncoded.length % 2 !== 0) {
      return 'Ошибка: чётное число символов ADFGVX требуется';
    }

    const map = this.buildCharToCodeMap();
    const reverseMap: Record<string, string> = {};
    for (const [char, code] of Object.entries(map)) {
      reverseMap[code] = char;
    }

    let result = '';
    for (let i = 0; i < cleanEncoded.length; i += 2) {
      const pair = cleanEncoded.slice(i, i + 2);
      if (reverseMap[pair]) result += reverseMap[pair];
    }
    return result;
  }
}

const GermanCipher: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');

  const cipher = new ADFGVXCipher();

  const handleEncrypt = (): void => {
    const result = cipher.encrypt(inputText);
    setOutputText(result);
  };

  const handleDecrypt = (): void => {
    const result = cipher.decrypt(inputText);
    setOutputText(result);
  };

  return (
    <div className="cipher-container">
      <h1>Немецкий шифр ADFGVX</h1>
      <p>Шифр Первой мировой войны (1918)</p>

      <div className="input-group">
        <label htmlFor="inputText">Текст:</label>
        <textarea
          id="inputText"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Введите текст или шифротекст..."
        />
      </div>

      <div className="button-group">
        <button className="action-button encrypt" onClick={handleEncrypt}>
          Зашифровать
        </button>
        <button className="action-button decrypt" onClick={handleDecrypt}>
          Расшифровать
        </button>
      </div>

      {outputText && (
        <div className="output-group">
          <label>Результат:</label>
          <div className="output-text">{outputText}</div>
        </div>
      )}
    </div>
  );
};

export default GermanCipher;