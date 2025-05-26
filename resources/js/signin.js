async function getCustomDataPath() {
  const envs = await Neutralino.os.getEnvs();
  const osInfo = await Neutralino.computer.getInfo();
  const isWindows = osInfo.osName.toLowerCase().includes('windows');
  const separator = isWindows ? '\\' : '/';
  const basePath = envs.APPDATA || envs.HOME || '.';
  return `${basePath}${separator}pVault`;
}

async function loadScreen(file) {
  try {
    const content = await Neutralino.filesystem.readFile(
      `resources/screens/${file}`
    );
    document.getElementById('neutralinoapp').innerHTML = content;
  } catch (err) {
    console.error('Error loading screen:', err);
    document.getElementById('neutralinoapp').innerHTML =
      '<p>Error loading screen. Please check the console.</p>';
  }
}

document.getElementById('signin-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const masterPw = document.getElementById('login-master-pw').value;
  const feedback = document.getElementById('feedback');

  try {
    const fileContent = await Neutralino.filesystem.readFile(
      'resources/data.enc'
    );
    const data = JSON.parse(fileContent);
    const decryptedMasterPw = CryptoJS.AES.decrypt(
      data.masterPw,
      masterPw
    ).toString(CryptoJS.enc.Utf8);
    if (decryptedMasterPw === masterPw) {
      const dataPath = await getCustomDataPath();
      await Neutralino.filesystem.createDirectory(dataPath);
      const pcInfo = await Neutralino.computer.getInfo();
      const username =
        (await Neutralino.os.getEnv('USERNAME')) ||
        (await Neutralino.os.getEnv('USER'));
      const hashInput = `${username || 'unknown'}-${pcInfo.osName}-${
        pcInfo.osVersion
      }`;
      const sessionHash = CryptoJS.SHA256(hashInput).toString();
      await Neutralino.filesystem.writeFile(
        `${dataPath}/session.key`,
        sessionHash
      );
      feedback.style.color = 'green';
      feedback.textContent =
        'Authentication successful! Loading main screen...';
      await new Promise((resolve) => setTimeout(resolve, 500));
      await loadScreen('screens/main.html');
    } else {
      feedback.style.color = 'red';
      feedback.textContent = 'Incorrect master password.';
    }
  } catch (err) {
    feedback.style.color = 'red';
    feedback.textContent = 'Data file not found or corrupted.';
  }
});

document
  .getElementById('forgot-password')
  .addEventListener('click', async (e) => {
    e.preventDefault();
    await loadScreen('screens/recovery.html');
  });
