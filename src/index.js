// 'use strict';

const {
  app,
  BrowserWindow,
  globalShortcut
} = require('electron');
const path = require('path');

// require('electron-reload')(__dirname);

// const isDev = require('electron-is-dev');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  globalShortcut.register('CommandOrControl+I', () => {
    mainWindow.webContents.openDevTools({
      mode: 'undocked'
    });
  })

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 854,
    height: 533,
    minWidth: 854,
    minHeight: 533,
    frame: false,
    // titleBarStyle: 'hidden',
    backgroundColor: '#202225',
    show: false,
    icon: path.join(__dirname, 'assets/icons/ico/logo_only_sagiblue_inverted_64x64.ico'),
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.focus();
    mainWindow.show();
  });

  // and load the index.html of the app.
  mainWindow.loadURL(path.join(__dirname, 'components/index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
