const { ipcRenderer } = require('electron');

ipcRenderer.on(
    'show-notification',
    (event, title, body, onClick = () => { console.log('Notification clicked')}) => {
        Notification.requestPermission()
        const myNotification = new Notification(title, { body });
        myNotification.onclick = onClick;
    }
);

