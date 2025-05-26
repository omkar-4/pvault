function showInfo() {
  document.createElement('pre').innerHTML = `
      ${NL_APPID} is running on port ${NL_PORT} inside ${NL_OS}
      <br/><br/>
      <span>server: v${NL_VERSION} . client: v${NL_CVERSION}</span>
    `;
}

function openDocs() {
  Neutralino.os.open('https://neutralino.js.org/docs');
}

function openTutorial() {
  Neutralino.os.open('https://www.youtube.com/c/CodeZri');
}

async function getCustomDataPath() {
  const envs = await Neutralino.os.getEnvs();
  const osInfo = await Neutralino.computer.getInfo();
  const isWindows = osInfo.osName.toLowerCase().includes('windows');
  const separator = isWindows ? '\\' : '/';
  const basePath = envs.APPDATA || envs.HOME || '.';
  return `${basePath}${separator}pVault`;
}

function setTray() {
  if (NL_MODE != 'window') {
    console.log('INFO: Tray menu is only available in the window mode.');
    return;
  }
  let tray = {
    icon: '/resources/icons/appsIcon.png',
    menuItems: [
      { id: 'OPEN PVAULT', text: 'Open pVault' },
      { id: 'SEP', text: '-' },
      { id: 'ABOUT', text: 'About' },
      { id: 'SEP', text: '-' },
      { id: 'VERSION', text: 'Get version' },
      { id: 'SEP', text: '-' },
      { id: 'QUIT', text: 'Quit' },
    ],
  };
  Neutralino.os.setTray(tray);
}

async function onTrayMenuItemClicked(event) {
  switch (event.detail.id) {
    case 'OPEN PVAULT':
      await Neutralino.window.center();
      await Neutralino.window.focus();
      await Neutralino.window.show();
      break;
    case 'VERSION':
      await Neutralino.os.showMessageBox(
        'Version information',
        `Neutralinojs server: v${NL_VERSION} | Neutralinojs client: v${NL_CVERSION}`
      );
      break;
    case 'ABOUT':
      await Neutralino.os.showMessageBox(
        'About',
        `Neutralinojs is a cross-platform desktop application framework.`
      );
      break;
    case 'QUIT':
      await Neutralino.app.exit();
      break;
  }
}

async function onWindowClose() {
  await Neutralino.window.hide();
}

async function onAppExit() {
  const response = await Neutralino.os.showMessageBox(
    'Confirm Logout',
    'Do you want to log out now?',
    ['Yes', 'No'],
    'QUESTION'
  );
  if (response === 'Yes') {
    try {
      const dataPath = await getCustomDataPath();
      await Neutralino.filesystem.remove(`${dataPath}/session.key`);
      console.log('Session key deleted on logout');
    } catch (err) {
      console.error('Error deleting session.key:', err);
    }
  }
  await Neutralino.app.exit();
}

// Register event listeners
Neutralino.events.on('trayMenuItemClicked', onTrayMenuItemClicked);
Neutralino.events.on('windowClose', onWindowClose);
Neutralino.events.on('appExit', onAppExit);

if (NL_OS != 'Darwin') {
  setTray();
}

showInfo();
