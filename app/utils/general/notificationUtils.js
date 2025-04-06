const notificationService = require('../../services/general/notificationService');

const sendNotification = ({ recipient, title, message }) => {
    return notificationService.createNotification({ recipient, title, message });
}

module.exports = {
    sendNotification
};