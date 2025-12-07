import React, { useState } from 'react';

const EN_ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

const RU_ALPHABET = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';

const getAlphabet = (character: string): string | null => {
  const lowerCharacter = character.toLowerCase();
  if (EN_ALPHABET.includes(lowerCharacter)) {
    return EN_ALPHABET;
  }
  if (RU_ALPHABET.includes(lowerCharacter)) {
    return RU_ALPHABET;
  }
  return null;
};

const shiftLetter = (letter: string, shift: number): string => {
  const alphabet = getAlphabet(letter);
  if (!alphabet) {
    return letter;
  }

  const wasUpperCase = letter === letter.toUpperCase();
  const lowerLetter = letter.toLowerCase();

  const currentIndex = alphabet.indexOf(lowerLetter);

  const newIndex = (currentIndex + shift + alphabet.length) % alphabet.length;

  let newLetter = alphabet[newIndex];

  if (wasUpperCase) {
    newLetter = newLetter.toUpperCase();
  }

  return newLetter;
};

const CaesarCipher: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [shift, setShift] = useState<number>(3);
  const [resultText, setResultText] = useState<string>('');

  const encrypt = () => {
    const inputCharacters = inputText.split('');
    const encryptedCharacters: string[] = [];

    for (const character of inputCharacters) {
      const encryptedChar = shiftLetter(character, shift);
      encryptedCharacters.push(encryptedChar);
    }

    const encryptedText = encryptedCharacters.join('');
    setResultText(encryptedText);
  };

  const decrypt = () => {
    const inputCharacters = inputText.split('');
    const decryptedCharacters: string[] = [];

    for (const character of inputCharacters) {
      const decryptedChar = shiftLetter(character, -shift);
      decryptedCharacters.push(decryptedChar);
    }

    const decryptedText = decryptedCharacters.join('');
    setResultText(decryptedText);
  };

  const bruteForce = () => {
    const maxShift = Math.max(EN_ALPHABET.length, RU_ALPHABET.length);
    let allResults = '';

    for (let shiftValue = 1; shiftValue <= maxShift; shiftValue++) {
      const inputCharacters = inputText.split('');
      const decryptedCharacters: string[] = [];

      for (const character of inputCharacters) {
        const decryptedChar = shiftLetter(character, -shiftValue);
        decryptedCharacters.push(decryptedChar);
      }

      const variant = decryptedCharacters.join('');
      allResults += `Сдвиг ${shiftValue}: ${variant}\n`;
    }

    setResultText(allResults.trim());
  };

  return (
    <div className="cipher-container">
      <h1>Шифр Цезаря</h1>

      <textarea
        className="input-field"
        placeholder="Введите текст для шифрования/расшифровки..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={4}
      />

      <input
        type="number"
        className="shift-input"
        value={shift}
        onChange={(e) => {
          const value = parseInt(e.target.value, 10);
          setShift(isNaN(value) ? 0 : value);
        }}
        min="-100"
        max="100"
        placeholder="Сдвиг"
      />

      <div className="button-group">
        <button className="action-button encrypt" onClick={encrypt}>
          Зашифровать
        </button>
        <button className="action-button decrypt" onClick={decrypt}>
          Расшифровать
        </button>
        <button className="action-button brute-force" onClick={bruteForce}>
          Взломать
        </button>
      </div>

      <textarea
        className="result-field"
        placeholder="Результат..."
        value={resultText}
        readOnly
        rows={6}
      />
    </div>
  );
};

export default CaesarCipher;