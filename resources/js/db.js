export async function initDB() {
  let db;

  try {
    let encryptedData = await Neutralino.filesystem.readFile('db.bin', 'binary');
    // read file db.bin (database file) of read-mode binary = raw bytes

    let key = await crypto.subtle.importKey(
      // await waits for promise from crypto.subtle.importKey which is a Web Crypto API method to create a cryptographic key of raw byte array format
      'raw',
      new TextEncoder().encode('temp-master-key'), // Creates a TextEncoder object to convert strings to Uint8Array byte arrays
      { name: 'AES-GCM' }, // algorithm (AES-GCM encryption mode)
      false, // key is not extractable (cannot be exported)
      ['encrypt', 'decrypt']
    );

    let iv = encryptedData.slice(0, 12);
    let encryptedContent = encryptedData.slice(12);
    let plainData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedContent);
    db = new SQL.Database(new Uint8Array(plainData));
  } catch (e) {
    // If file doesn’t exist or decryption fails, create new DB
    db = new SQL.Database();
    db.run('CREATE TABLE app_state (firstTime BOOLEAN DEFAULT true)');
    db.run('CREATE TABLE passwords (id INTEGER PRIMARY KEY, site TEXT, username TEXT, password TEXT)');
  }
  return db;
}

export async function checkFirstTime() {
  const db = await initDB();
  const result = db.exec('SELECT firstTime FROM app_state LIMIT 1');
  return result[0]?.values[0][0] || true; // Default to true if table empty
}
