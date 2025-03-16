const { logActionManually } = require('../../middlewares/auditMiddleware');

exports.dynamicUpdate = async ( 
    document, 
    { updates }, 
    restrictedFields = [],
    {
        entityName = '', 
        updateMessage = 'Updates Performed',
        userId, auditInfo
    }
) => {
    // Validate input
    if ( !document ) return { success: false, message: 'Invalid Document' };
    if( !updates ) return { success: false, message: 'Updates Not Provided' };

    // Capture previous values of the document
    const previousValues = { ...document.toObject() };
    // Prepare the affected fields log, excluding restricted fields
    let affectedFields = {};

    // Iterate over update keys and validate
    Object.keys( updates ).forEach( ( field ) => {
        if ( restrictedFields.includes( field ) ) {
            // Send console error and skip field
            console.error( `Restricted Field: ${ field }` );
            return;
        }

        // Update the document field
        document[ field ] = updates[ field ];
        // Log the affected field only if it is not restricted
        affectedFields[field] = `${field}`;
    });

    // Save the document after applying updates
    const updatedDocument = await document.save();

    // Log action
    logActionManually({
        userId, auditInfo,
        action: 'UPDATE',
        entity: entityName,
        entityId: document._id,
        details: {
            message: updateMessage,
            affectedFields,
        },
        previousValues,
        newValues: { ...updatedDocument.toObject() },
    });

    return { success: true, message: updateMessage, data: updatedDocument };
};

module.exports = exports;