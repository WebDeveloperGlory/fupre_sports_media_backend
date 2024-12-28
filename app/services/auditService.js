const db = require('../config/db');

exports.logEvent = async ({ userId }, { action, targetEntity, entityType, description }) => {
    const performedBy = userId;
    let basicDescription
    if( action === 'create' || action === 'update' || action === 'delete' ) {
        return `${ action } ${ entityType.toLowerCase() } performed by ${ performedBy } for ${ targetEntity }`
    } else if( action === 'invite' ) {
        return `${ entityType === 'Competition' ? entityType : 'Friendly' } invitation sent to ${ targetEntity }`
    }
}

module.exports = exports;