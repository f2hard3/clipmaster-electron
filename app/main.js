const path = require('path');
const {
    app,
    clipboard,
    globalShortcut,
    BrowserWindow,
    Menu,
    Tray,
    systemPreferences
} = require('electron');

let tray = null;
let browserWindow = null;

const getIcon = () =>
    process.platform === 'win32'
        ? 'icon-light@sx.ico'
        : systemPreferences.isDarkMode()
        ? 'icon-light.png'
        : 'icon-dark.png';

app.on('ready', () => {    
    if (app.dock) app.dock.hide();

    tray = new Tray(path.join(__dirname, getIcon()));
    tray.setPressedImage(path.join(__dirname, 'icon-light.png'));

    if (process.platform === 'win32') tray.on('click', tray.popUpContextMenu);

    browserWindow = new BrowserWindow({ show: false });

    browserWindow.loadURL(`file://${__dirname}/index.html`);

    const activationShortcut = globalShortcut.register(
        'CmdOrCtrl+Option+C',
        () => tray.popUpContextMenu()
    );

    if (!activationShortcut)
        console.error('Global activation shortcut failed to register');

    const newClippingShortcut = globalShortcut.register(
        'CmdOrCtrl+Shift+Option+C',
        () => showNotification(addClipping())
    );

    if (!newClippingShortcut)
        console.error('Global new clipping shortcut failed to register');

    updateMenu();

    tray.setToolTip('Clipmaster');    
});

const clippings = [];

const addClipping = () => {
    const clipping = clipboard.readText();
    if (clippings.includes(clipping)) return;
    clippings.unshift(clipping);
    updateMenu();
    return clipping;
};

const truncateClippingLabel = clipping =>
    clipping.length > 20 ? `${clipping.substring(0, 20)}...` : clipping;

const createClippingMenuItem = (clipping, index) => ({
    label: truncateClippingLabel(clipping),
    click: () => clipboard.writeText(clipping),
    accelerator: `CmdOrCtrl+${index}`
});

const getTemplate = () => [
    {
        label: 'Create New Clipping',
        click: addClipping,
        accelerator: 'CommandOrControl+Shift+C'
    },
    { type: 'separator' },
    ...clippings.slice(0, 10).map(createClippingMenuItem),
    {
        label: 'Quit',
        click: () => app.quit(),
        accelerator: 'CommandOrControl+Q'
    }
];

const updateMenu = () => {
    const menu = Menu.buildFromTemplate(getTemplate());
    tray.setContextMenu(menu);
};

const showNotification = clipping => {
    if (clipping)
        browserWindow.webContents.send(
            'show-notification',
            'Clipping Added',
            clipping
        );
};
