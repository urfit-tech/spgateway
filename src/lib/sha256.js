const crypto = require("crypto");

class SHA256 {
  constructor(key, iv) {
    this.key = key;
    this.iv = iv;
  }

  encrypt(plainText) {
    let sha = crypto.createHash("sha256");
    return sha.update(plainText).digest("hex");
  }

  encryptWithKeyIv(plainText) {
    const hashString = `HashKey=${this.key}&${plainText}&HashIV=${this.iv}`;

    let sha = crypto.createHash("sha256");
    return sha.update(hashString).digest("hex");
  }
}

module.exports = SHA256;

