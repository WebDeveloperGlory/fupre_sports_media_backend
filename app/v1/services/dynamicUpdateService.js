exports.dynamicUpdate = async ( document, { updates }, restrictedFields = [] ) => {
    // Validate input
    if ( !document ) return { success: false, message: 'Invalid Document' };
    if( !updates ) return { success: false, message: 'Updates Not Provided' };

    // Iterate over update keys and validate
    Object.keys( updates ).forEach( ( field ) => {
        if ( restrictedFields.includes( field ) ) {
            return { success: false, message: `Invalid Update Field: ${ field }` };
        }

        document[ field ] = updates[ field ];
    });

    // Save the document after applying updates
    const updatedDocument = await document.save();

    return { success: true, message: 'Updates Performed', data: updatedDocument };
};

module.exports = exports;