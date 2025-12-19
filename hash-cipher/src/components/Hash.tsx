import React, { useState } from 'react';

const Hash: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [hashResult, setHashResult] = useState<string>('');

  const handleComputeHash = async (): Promise<void> => {
    if (!inputText.trim()) {
      setHashResult('');
      return;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);

      const hashBuffer = await crypto.subtle.digest('SHA-256', data);

      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

      setHashResult(hashHex);
    } catch (error) {
      setHashResult('Ошибка: хеширование не поддерживается');
    }
  };

  const handleClear = (): void => {
    setInputText('');
    setHashResult('');
  };

  return (
    <div className="hash-card">
      <h1 className="hash-title">Хеширование (SHA-256)</h1>

      <div className="input-group">
        <label className="input-label" htmlFor="input-text">
          Исходный текст:
        </label>
        <input
          id="input-text"
          type="text"
          className="input-field"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Введите текст для хеширования"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleComputeHash();
          }}
        />
      </div>

      <div className="button-group">
        <button
          className="action-button action-button--primary"
          onClick={handleComputeHash}
          aria-label="Вычислить хеш SHA-256 от введённого текста"
        >
          Вычислить хеш
        </button>

        <button
          className="action-button action-button--secondary"
          onClick={handleClear}
          aria-label="Очистить ввод и результат"
        >
          Очистить
        </button>
      </div>

      {hashResult && (
        <div className="result-box" aria-live="polite">
          {hashResult}
        </div>
      )}

      <p className="info-note">
        Хеш-функция необратима — по хешу невозможно восстановить исходный текст.
      </p>
    </div>
  );
};

export default Hash;