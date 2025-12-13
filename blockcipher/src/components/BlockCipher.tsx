import React from 'react';

class BlockCipher extends React.Component {
  state = {
    inputText: '',      
    key: '',     
    outputText: '',    
  };

  onInputTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ inputText: e.target.value });
  };

  onKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ key: e.target.value });
  };

  encrypt = (text: string, key: string): string => {
    const textBytes = new TextEncoder().encode(text);
    const keyBytes = new TextEncoder().encode(key);
    const encryptedBytes = new Uint8Array(textBytes.length);

    for (let i = 0; i < textBytes.length; i++) {
      encryptedBytes[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    return btoa(String.fromCharCode(...Array.from(encryptedBytes)));
  };

  decrypt = (encryptedText: string, key: string): string => {
    try {
      const binaryString = atob(encryptedText);
      const encryptedBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        encryptedBytes[i] = binaryString.charCodeAt(i);
      }

      const keyBytes = new TextEncoder().encode(key);
      const decryptedBytes = new Uint8Array(encryptedBytes.length);

      for (let i = 0; i < encryptedBytes.length; i++) {
        decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
      }

      return new TextDecoder().decode(decryptedBytes);
    } catch {
      return '[Ошибка: недопустимый шифротекст]';
    }
  };

  onEncryptClick = () => {
    const { inputText, key } = this.state;
    const encrypted = this.encrypt(inputText, key);
    this.setState({ outputText: encrypted });
  };

  onDecryptClick = () => {
    const { inputText, key } = this.state;
    const decrypted = this.decrypt(inputText, key);
    this.setState({ outputText: decrypted });
  };

  render() {
    const { inputText, key, outputText } = this.state;

    return (
      <div className="cipher-container">
        <h1 className="app-title">Блочный шифр</h1>

        <input
          type="text"
          className="key-input"
          placeholder="Ключ"
          value={key}
          onChange={this.onKeyChange} 
          aria-label="Ключ шифрования"
        />

        <textarea
          className="input-area"
          placeholder="Введите текст для шифрования или расшифровки"
          value={inputText}
          onChange={this.onInputTextChange}
          aria-label="Текст для обработки"
        />

        <textarea
          className="output-area"
          placeholder="Результат...."
          value={outputText}
          readOnly 
          aria-label="Результат шифрования или расшифровки"
        />

        <div className="button-group">
          <button
            className="action-button"
            onClick={this.onEncryptClick}
            aria-label="Зашифровать текст"
          >
            Зашифровать
          </button>

          <button
            className="action-button"
            onClick={this.onDecryptClick}
            aria-label="Расшифровать текст"
          >
            Расшифровать
          </button>
        </div>
      </div>
    );
  }
}

export default BlockCipher;