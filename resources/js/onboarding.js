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

document
  .getElementById('onboarding-form')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const masterPw = document.getElementById('master-pw').value;
    const recoveryQuestion = document.getElementById('recovery-question').value;
    const recoveryAnswer = document.getElementById('recovery-answer').value;
    const feedback = document.getElementById('feedback');

    if (masterPw.length < 8) {
      feedback.style.color = 'red';
      feedback.textContent = 'Password must be at least 8 characters.';
      return;
    }

    try {
      const encryptedPw = CryptoJS.AES.encrypt(masterPw, masterPw).toString();
      const encryptedAnswer = CryptoJS.AES.encrypt(
        recoveryAnswer,
        masterPw
      ).toString();
      const data = {
        masterPw: encryptedPw,
        recovery: { question: recoveryQuestion, answer: encryptedAnswer },
        isFirstTime: false,
      };
      await Neutralino.filesystem.writeFile(
        'resources/data.enc',
        JSON.stringify(data)
      );
      feedback.style.color = 'green';
      feedback.textContent = 'Onboarding complete! Loading sign-in...';
      await new Promise((resolve) => setTimeout(resolve, 500));
      await loadScreen('screens/signin.html');
    } catch (err) {
      feedback.style.color = 'red';
      feedback.textContent = 'Error saving data: ' + err.message;
    }
  });
