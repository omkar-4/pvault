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
    if (file === 'screens/recovery.html') {
      const recoveryQuestion = document.getElementById('recovery-question');
      try {
        const data = JSON.parse(
          await Neutralino.filesystem.readFile('resources/data.enc')
        );
        recoveryQuestion.textContent =
          data.recovery.question || 'No question found';
      } catch (err) {
        recoveryQuestion.textContent = 'Error loading question';
        console.error('Error loading question:', err);
      }
    }
  } catch (err) {
    console.error('Error loading screen:', err);
    document.getElementById('neutralinoapp').innerHTML =
      '<p>Error loading screen. Please check the console.</p>';
  }
}

document
  .getElementById('recovery-form')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const recoveryAnswer = document.getElementById('recovery-answer').value;
    const feedback = document.getElementById('feedback');

    try {
      const fileContent = await Neutralino.filesystem.readFile(
        'resources/data.enc'
      );
      const data = JSON.parse(fileContent);
      const decryptedAnswer = CryptoJS.AES.decrypt(
        data.recovery.answer,
        recoveryAnswer
      ).toString(CryptoJS.enc.Utf8);
      if (decryptedAnswer === recoveryAnswer) {
        const resetForm = document.createElement('div');
        resetForm.id = 'reset-form';
        resetForm.innerHTML =
          '<input type="password" id="new-master-pw" placeholder="New Master Password" required><button type="submit">Submit</button><br><p id="reset-feedback"></p>';
        document.getElementById('recovery-form').replaceWith(resetForm);
        document
          .getElementById('reset-form')
          .addEventListener('submit', async (e) => {
            e.preventDefault();
            const newMasterPw = document.getElementById('new-master-pw').value;
            const resetFeedback = document.getElementById('reset-feedback');
            if (newMasterPw.length < 8) {
              resetFeedback.style.color = 'red';
              resetFeedback.textContent =
                'Password must be at least 8 characters.';
              return;
            }
            try {
              const encryptedNewPw = CryptoJS.AES.encrypt(
                newMasterPw,
                newMasterPw
              ).toString();
              data.masterPw = encryptedNewPw;
              await Neutralino.filesystem.writeFile(
                'resources/data.enc',
                JSON.stringify(data)
              );
              resetFeedback.style.color = 'green';
              resetFeedback.textContent =
                'Password reset successful! Signing in...';
              await new Promise((resolve) => setTimeout(resolve, 500));
              await loadScreen('screens/signin.html');
            } catch (err) {
              resetFeedback.style.color = 'red';
              resetFeedback.textContent =
                'Error resetting password: ' + err.message;
            }
          });
        feedback.style.color = 'green';
        feedback.textContent = 'Please set a new master password.';
      } else {
        feedback.style.color = 'red';
        feedback.textContent = 'Incorrect answer.';
      }
    } catch (err) {
      feedback.style.color = 'red';
      feedback.textContent = 'Data file invalid. Starting fresh...';
      await loadScreen('screens/onboarding.html');
    }
  });
