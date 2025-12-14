import React from 'react';

class GostBlockCipher extends React.Component {
  state = {
    inputText: '',       
    encryptionKey: '',    
    outputText: '',       
  };

  private readonly gostSubstitutionBoxes: number[][] = [
    [4, 10, 9, 2, 13, 8, 0, 14, 6, 11, 1, 12, 7, 15, 5, 3],  
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6], 
    [5, 8, 1, 13, 10, 3, 4, 2, 14, 15, 12, 7, 6, 0, 9, 11], 
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15], 
    [6, 12, 7, 1, 5, 15, 13, 8, 4, 10, 9, 14, 0, 3, 11, 2], 
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1], 
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6], 
    [1, 4, 6, 8, 11, 3, 15, 0, 9, 12, 13, 7, 10, 14, 5, 2], 
  ];

  handleInputTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ inputText: event.target.value });
  };

  handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ encryptionKey: event.target.value });
  };

  private convertStringToBytes(text: string): Uint8Array {
    return new TextEncoder().encode(text);
  };

  private convertBytesToString(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
  };

  private normalizeKeyToGost256Bit(key: string): Uint32Array {
    const keyBytes = this.convertStringToBytes(key);
    const normalizedKeyWords = new Uint32Array(8);

    const extendedKeyBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      extendedKeyBytes[i] = keyBytes.length > 0 ? keyBytes[i % keyBytes.length] : 0;
    }

    for (let wordIndex = 0; wordIndex < 8; wordIndex++) {
      normalizedKeyWords[wordIndex] =
        (extendedKeyBytes[wordIndex * 4]) |               
        (extendedKeyBytes[wordIndex * 4 + 1] << 8) |     
        (extendedKeyBytes[wordIndex * 4 + 2] << 16) |     
        (extendedKeyBytes[wordIndex * 4 + 3] << 24);      
    }

    return normalizedKeyWords;
  };

  private addGostPadding(data: Uint8Array): Uint8Array {
    const paddingLength = 8 - (data.length % 8);
    const paddedData = new Uint8Array(data.length + paddingLength);
    paddedData.set(data);
    for (let i = data.length; i < paddedData.length; i++) {
      paddedData[i] = paddingLength;
    }
    return paddedData;
  };

  private removeGostPadding(paddedData: Uint8Array): Uint8Array {
    const paddingLength = paddedData[paddedData.length - 1];
    if (paddingLength < 1 || paddingLength > 8) {
      return paddedData;
    }
    return paddedData.slice(0, paddedData.length - paddingLength);
  };

  private gostFeistelFunction(value: number, roundKeys: Uint32Array): number {
    let currentValue = value;

    for (let subRound = 0; subRound < 4; subRound++) {
      let sumWithKey = (currentValue + roundKeys[subRound]) >>> 0;

      let substitutedValue = 0;
      for (let nibbleIndex = 0; nibbleIndex < 8; nibbleIndex++) {
        const nibble = (sumWithKey >> (4 * nibbleIndex)) & 0xf;
        const substitutedNibble = this.gostSubstitutionBoxes[nibbleIndex][nibble];
        substitutedValue |= substitutedNibble << (4 * nibbleIndex);
      }

      currentValue = ((substitutedValue << 11) | (substitutedValue >>> (32 - 11))) >>> 0;
    }

    return currentValue;
  };

  private encryptGostBlock(leftWord: number, rightWord: number, keyWords: Uint32Array): [number, number] {
    let left = leftWord;
    let right = rightWord;

    for (let round = 0; round < 32; round++) {
      const tempRight = right;
      const roundKeyArray = new Uint32Array(1);
      roundKeyArray[0] = keyWords[round % 8];right = (left ^ this.gostFeistelFunction(right, roundKeyArray)) >>> 0;
      left = tempRight;
    }

    return [right, left];
  };

  private decryptGostBlock(leftWord: number, rightWord: number, keyWords: Uint32Array): [number, number] {
    let left = leftWord;
    let right = rightWord;

    for (let round = 31; round >= 0; round--) {
      const tempRight = right;
      const roundKeyArray = new Uint32Array(1);
      roundKeyArray[0] = keyWords[round % 8];
      right = (left ^ this.gostFeistelFunction(right, roundKeyArray)) >>> 0;
      left = tempRight;
    }

    return [right, left];
  };

  private bytesToGostWords(block: Uint8Array): [number, number] {
    const word1 =
      (block[0]) |
      (block[1] << 8) |
      (block[2] << 16) |
      (block[3] << 24);
    const word2 =
      (block[4]) |
      (block[5] << 8) |
      (block[6] << 16) |
      (block[7] << 24);
    return [word1 >>> 0, word2 >>> 0];
  };

  private gostWordsToBytes(word1: number, word2: number): Uint8Array {
    const block = new Uint8Array(8);
    block[0] = word1 & 0xff;
    block[1] = (word1 >> 8) & 0xff;
    block[2] = (word1 >> 16) & 0xff;
    block[3] = (word1 >> 24) & 0xff;
    block[4] = word2 & 0xff;
    block[5] = (word2 >> 8) & 0xff;
    block[6] = (word2 >> 16) & 0xff;
    block[7] = (word2 >> 24) & 0xff;
    return block;
  };

  private performGostEncryption(plainText: string, key: string): string {
    if (!key) return '[Ошибка: ключ не задан]';

    try {
      const normalizedKey = this.normalizeKeyToGost256Bit(key);
      const paddedBytes = this.addGostPadding(this.convertStringToBytes(plainText));
      const encryptedBytes = new Uint8Array(paddedBytes.length);

      for (let offset = 0; offset < paddedBytes.length; offset += 8) {
        const block = paddedBytes.slice(offset, offset + 8);
        const [left, right] = this.bytesToGostWords(block);
        const [encryptedLeft, encryptedRight] = this.encryptGostBlock(left, right, normalizedKey);
        const encryptedBlock = this.gostWordsToBytes(encryptedLeft, encryptedRight);
        encryptedBytes.set(encryptedBlock, offset);
      }

      return btoa(String.fromCharCode(...Array.from(encryptedBytes)));
    } catch (error) {
      return '[Ошибка шифрования]';
    }
  };

  private performGostDecryption(encryptedBase64: string, key: string): string {
    if (!key) return '[Ошибка: ключ не задан]';

    try {
      const binaryString = atob(encryptedBase64);
      const encryptedBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        encryptedBytes[i] = binaryString.charCodeAt(i);
      }

      if (encryptedBytes.length % 8 !== 0) {
        return '[Ошибка: длина шифротекста не кратна 8 байтам (размеру блока ГОСТ)]';
      }

      const normalizedKey = this.normalizeKeyToGost256Bit(key);
      const decryptedBytes = new Uint8Array(encryptedBytes.length);

      for (let offset = 0; offset < encryptedBytes.length; offset += 8) {
        const block = encryptedBytes.slice(offset, offset + 8);
        const [left, right] = this.bytesToGostWords(block);
        const [decryptedLeft, decryptedRight] = this.decryptGostBlock(left, right, normalizedKey);
        const decryptedBlock = this.gostWordsToBytes(decryptedLeft, decryptedRight);
        decryptedBytes.set(decryptedBlock, offset);
      }

      const unpaddedBytes = this.removeGostPadding(decryptedBytes);
      return this.convertBytesToString(unpaddedBytes);
    } catch (error) {
      return '[Ошибка расшифровки: проверьте ключ и шифротекст]';
    }
  };

  handleEncryptClick = () => {
    const { inputText, encryptionKey } = this.state;
    const result = this.performGostEncryption(inputText, encryptionKey);
    this.setState({ outputText: result });
  };

  handleDecryptClick = () => {
    const { inputText, encryptionKey } = this.state;
    const result = this.performGostDecryption(inputText, encryptionKey);
    this.setState({ outputText: result });
  };

  render() {
    const { inputText, encryptionKey, outputText } = this.state;

    return (
      <div className="cipher-container">
        <h1 className="app-title"> ГОСТ 28147-89 </h1>

        <input
          type="text"
          className="key-input"
          placeholder="Ключ (любая строка, будет приведена к 32 байтам)"
          value={encryptionKey}            
          onChange={this.handleKeyChange}   
          aria-label="Ключ шифрования"   
        />

        <textarea
          className="input-area"
          placeholder="Введите текст для шифрования или расшифровки"
          value={inputText}
          onChange={this.handleInputTextChange}
          aria-label="Входной текст"
        />

        <textarea
          className="output-area"
          placeholder="Результат..."
          value={outputText}
          readOnly
          aria-label="Результат операции"
        />

        <div className="button-group">
          <button className="action-button" onClick={this.handleEncryptClick}>
            Зашифровать
          </button>
          <button className="action-button" onClick={this.handleDecryptClick}>
            Расшифровать
          </button>
        </div>
      </div>
    );
  }
}

export default GostBlockCipher;