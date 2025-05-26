import { initDB, checkFirstTime } from './db.js';

(async () => {
  await initDB();
  const isFirstTime = await checkFirstTime();
  console.log('Is First Time:', isFirstTime);
})();

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
    const content = await Neutralino.filesystem.readFile(`resources/screens/${file}`);

    document.getElementById('neutralinoapp').innerHTML = content;

    if (file === 'screens/main.html') {
      try {
        const dataPath = await getCustomDataPath();

        const lockContent = await Neutralino.filesystem.readFile(`${dataPath}/session.key`);

        const pcInfo = await Neutralino.computer.getInfo();

        const username = (await Neutralino.os.getEnv('USERNAME')) || (await Neutralino.os.getEnv('USER'));

        const testHash = CryptoJS.SHA256(`${username || 'unknown'}-${pcInfo.osName}-${pcInfo.osVersion}`).toString();

        if (lockContent !== testHash) {
          await loadScreen('screens/signin.html');
        }
      } catch (err) {
        console.error('Session validation error:', err);

        await loadScreen('screens/signin.html');
      }

      await Neutralino.window.setSize({ width: 800, height: 600 });
    }

    if (file === 'screens/main.html') {
      await import('./main.js'); // Self-import for main screen logic
    }
  } catch (err) {
    console.error('Error loading screen:', err);
    document.getElementById('neutralinoapp').innerHTML = '<p>Error loading screen. Please check the console.</p>';
  }
}

document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    const dataPath = await getCustomDataPath();

    await Neutralino.filesystem.remove(`${dataPath}/session.key`);

    await loadScreen('screens/signin.html');
  } catch (err) {
    console.error('Error during logout:', err);
  }
});

// Placeholder for password list (to be expanded)
document.getElementById('password-list')?.addEventListener('click', () => {
  console.log('Password list clicked');
});
