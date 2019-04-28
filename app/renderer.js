const { ipcRenderer } = require('electron');

ipcRenderer.on(
    'show-notification',
    (event, title, body, onClick = () => {}) => {
        const notification = new Notification(title, { body });
        notification.onclick = onClick;
    }
);
