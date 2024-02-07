import {Menu, app, dialog, shell} from 'electron';

import config, {languageList} from '../configs/app.config';
import i18n from '../configs/i18next.config';
import {checkNewUpdates} from './auto-updater';
import {APPIUM_SESSION_EXTENSION} from './helpers';
import {launchNewSessionWindow} from './windows';

let menuTemplates = {mac: {}, other: {}};

function t(string, params = null) {
  return i18n.t(string, params);
}

function separator() {
  return {
    type: 'separator',
  };
}

function optionAbout() {
  return {
    label: t('About Appium Inspector'),
    click: () => {
      dialog.showMessageBox({
        title: t('appiumInspector'),
        message: t('showAppInfo', {
          appVersion: app.getVersion(),
          electronVersion: process.versions.electron,
          nodejsVersion: process.versions.node,
        }),
      });
    },
  };
}

function optionCheckForUpdates() {
  return {
    label: t('Check for updates'),
    click() {
      checkNewUpdates(true);
    },
  };
}

function optionCheckForUpdatesOther() {
  return {
    label: '&' + t('Check for updates'),
    click() {
      checkNewUpdates(true);
    },
  };
}

function optionHide() {
  return {
    label: t('Hide Appium Inspector'),
    role: 'hide',
  };
}

function optionHideOthers() {
  return {
    label: t('Hide Others'),
    role: 'hideOthers',
  };
}

function optionShowAll() {
  return {
    label: t('Show All'),
    role: 'unhide',
  };
}

function optionQuit() {
  return {
    label: t('Quit Appium Inspector'),
    role: 'quit',
  };
}

function optionNewWindow() {
  return {
    label: t('New Session Window…'),
    accelerator: 'Command+N',
    click: launchNewSessionWindow,
  };
}

function optionNewWindowOther() {
  return {
    label: t('New Session Window…'),
    accelerator: 'Ctrl+N',
    click: launchNewSessionWindow,
  };
}

async function openFileCallback(mainWindow) {
  const {canceled, filePaths} = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{name: 'Appium Session Files', extensions: [APPIUM_SESSION_EXTENSION]}],
  });
  if (!canceled) {
    const filePath = filePaths[0];
    mainWindow.webContents.send('open-file', filePath);
  }
}

function optionOpen(mainWindow) {
  return {
    label: t('Open'),
    accelerator: 'Command+O',
    click: () => openFileCallback(mainWindow),
  };
}

function optionOpenOther(mainWindow) {
  return {
    label: t('Open'),
    accelerator: 'Ctrl+O',
    click: () => openFileCallback(mainWindow),
  };
}

function optionSave(mainWindow) {
  return {
    label: t('Save'),
    accelerator: 'Command+S',
    click: () => mainWindow.webContents.send('save-file'),
  };
}

function optionSaveOther(mainWindow) {
  return {
    label: t('Save'),
    accelerator: 'Ctrl+S',
    click: () => mainWindow.webContents.send('save-file'),
  };
}

async function saveAsCallback(mainWindow) {
  const {canceled, filePath} = await dialog.showSaveDialog({
    title: t('saveAs'),
    filters: [{name: 'Appium', extensions: [APPIUM_SESSION_EXTENSION]}],
  });
  if (!canceled) {
    mainWindow.webContents.send('save-file', filePath);
  }
}

function optionSaveAs(mainWindow) {
  return {
    label: t('saveAs'),
    accelerator: 'Command+Shift+S',
    click: () => saveAsCallback(mainWindow),
  };
}

function optionSaveAsOther(mainWindow) {
  return {
    label: t('saveAs'),
    accelerator: 'Ctrl+Shift+S',
    click: () => saveAsCallback(mainWindow),
  };
}

function optionUndo() {
  return {
    label: t('Undo'),
    role: 'undo',
  };
}

function optionRedo() {
  return {
    label: t('Redo'),
    role: 'redo',
  };
}

function optionCut() {
  return {
    label: t('Cut'),
    role: 'cut',
  };
}

function optionCopy() {
  return {
    label: t('Copy'),
    role: 'copy',
  };
}

function optionPaste() {
  return {
    label: t('Paste'),
    role: 'paste',
  };
}

function optionSelectAll() {
  return {
    label: t('Select All'),
    role: 'selectAll',
  };
}

function optionReload() {
  return {
    label: t('Reload'),
    role: 'reload',
  };
}

function optionReloadOther() {
  return {
    label: '&' + t('Reload'),
    role: 'reload',
  };
}

function optionToggleDevTools() {
  return {
    label: t('Toggle Developer Tools'),
    role: 'toggleDevTools',
  };
}

function optionToggleDevToolsOther() {
  return {
    label: t('Toggle &Developer Tools'),
    role: 'toggleDevTools',
  };
}

function optionToggleFullscreen() {
  return {
    label: t('Toggle Full Screen'),
    role: 'togglefullscreen',
  };
}

function optionToggleFullscreenOther() {
  return {
    label: t('Toggle &Full Screen'),
    role: 'togglefullscreen',
  };
}

function optionLanguages() {
  return {
    label: t('Languages'),
    submenu: languageList.map((language) => ({
      label: `${language.name} (${language.original})`,
      type: 'radio',
      checked: i18n.language === language.code,
      click: () => i18n.changeLanguage(language.code),
    })),
  };
}

function optionMinimize() {
  return {
    label: t('Minimize'),
    role: 'minimize',
  };
}

function optionClose() {
  return {
    label: t('Close Window'),
    role: 'close',
  };
}

function optionCloseOther() {
  return {
    label: '&' + t('Close Window'),
    role: 'close',
  };
}

function optionBringAllToFront() {
  return {
    label: t('Bring All to Front'),
    role: 'front',
  };
}

function optionInspectorDocumentation() {
  return {
    label: t('Inspector Documentation'),
    click() {
      shell.openExternal('https://github.com/appium/appium-inspector');
    },
  };
}

function optionAppiumDocumentation() {
  return {
    label: t('Appium Documentation'),
    click() {
      shell.openExternal('https://appium.io');
    },
  };
}

function optionOpenIssues() {
  return {
    label: t('Search Issues'),
    click() {
      shell.openExternal('https://github.com/appium/appium-inspector/issues');
    },
  };
}

function optionImproveTranslations() {
  return {
    label: t('Add Or Improve Translations'),
    click() {
      shell.openExternal('https://crowdin.com/project/appium-desktop');
    },
  };
}

function dropdownMacAppiumInspector() {
  return {
    label: t('appiumInspector'),
    submenu: [
      optionAbout(),
      optionCheckForUpdates(),
      separator(),
      optionHide(),
      optionHideOthers(),
      optionShowAll(),
      separator(),
      optionQuit(),
    ],
  };
}

function dropdownMacFile(mainWindow) {
  return {
    label: t('File'),
    submenu: [
      optionNewWindow(),
      optionOpen(mainWindow),
      optionSave(mainWindow),
      optionSaveAs(mainWindow),
    ],
  };
}

function dropdownMacEdit() {
  return {
    label: t('Edit'),
    submenu: [
      optionUndo(),
      optionRedo(),
      separator(),
      optionCut(),
      optionCopy(),
      optionPaste(),
      optionSelectAll(),
    ],
  };
}

function dropdownMacView() {
  const submenu = [];
  if (process.env.NODE_ENV === 'development') {
    submenu.push(optionReload());
    submenu.push(optionToggleDevTools());
  }
  submenu.push(optionToggleFullscreen());
  submenu.push(optionLanguages());

  return {
    label: t('View'),
    submenu,
  };
}

function dropdownMacWindow() {
  return {
    label: t('Window'),
    submenu: [
      optionMinimize(),
      optionClose(),
      separator(),
      optionBringAllToFront(),
    ],
  };
}

function dropdownMacHelp() {
  return {
    label: t('Help'),
    submenu: [
      optionInspectorDocumentation(),
      optionAppiumDocumentation(),
      optionOpenIssues(),
      optionImproveTranslations(),
    ],
  };
}

function dropdownOtherFile(mainWindow) {
  let fileSubmenu = [
    optionNewWindowOther(),
    optionOpenOther(mainWindow),
    optionSaveOther(mainWindow),
    optionSaveAsOther(mainWindow),
    optionAbout(),
    separator(),
    optionCloseOther(),
  ];

  // If it's Windows, add a 'Check for Updates' menu option
  if (process.platform === 'win32') {
    fileSubmenu.splice(1, 0, optionCheckForUpdatesOther());
  }

  return {
    label: '&' + t('File'),
    submenu: fileSubmenu,
  };
}

function dropdownOtherView() {
  const submenu = [];
  submenu.push(optionToggleFullscreenOther());
  submenu.push(optionLanguages());

  if (process.env.NODE_ENV === 'development') {
    submenu.push(optionReloadOther());
    submenu.push(optionToggleDevToolsOther());
  }

  return {
    label: '&' + t('View'),
    submenu,
  };
}

function dropdownOtherHelp() {
  // just the same as mac menus for now since we don't have any hotkeys for this menu
  return dropdownMacHelp();
}

menuTemplates.mac = (mainWindow) => [
  dropdownMacAppiumInspector(),
  dropdownMacFile(mainWindow),
  dropdownMacEdit(),
  dropdownMacView(),
  dropdownMacWindow(),
  dropdownMacHelp(),
];

menuTemplates.other = (mainWindow) => [
  dropdownOtherFile(mainWindow),
  dropdownOtherView(),
  dropdownOtherHelp(),
];

export function rebuildMenus(mainWindow) {
  if (!mainWindow) {
    return;
  }

  if (config.platform === 'darwin') {
    const template = menuTemplates.mac(mainWindow);
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    const template = menuTemplates.other(mainWindow);
    const menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);
  }
}
