const db = require('../config/db');

const auditPlugin = function( schema, options ) {
    // Add pre-save middleware to capture changes
    schema.pre('save', function( next ) {
    if ( this.isNew ) {
        this._wasNew = true;
    } else {
        // Store the modified paths and their previous values
        this._modifiedPaths = this.modifiedPaths();
        this._previousValues = {};
        this._newValues = {};
        
        this._modifiedPaths.forEach(path => {
            this._previousValues[path] = this.get(path, { getters: false });
            this._newValues[path] = this._doc[path];
        });
    }
      next();
    });
  
    // Add post-save middleware to create audit logs
    schema.post('save', async function( doc ) {
        if ( !this._wasNew && !this._modifiedPaths ) return;
      
        try {
            const currentUser = global.currentUser || { _id: 'system' };
            
            if ( this._wasNew ) {
                // Create a new document
                await db.AuditLog.create({
                    userId: currentUser._id,
                    action: 'CREATE',
                    entity: options.modelName || this.constructor.modelName,
                    entityId: this._id,
                    newValues: this.toObject(),
                    timestamp: new Date()
                });
            } else {
                // Update existing document
                await db.AuditLog.create({
                    userId: currentUser._id,
                    action: 'UPDATE',
                    entity: options.modelName || this.constructor.modelName,
                    entityId: this._id,
                    previousValues: this._previousValues,
                    newValues: this._newValues,
                    details: { modifiedFields: this._modifiedPaths },
                    timestamp: new Date()
                });
            }
        } catch (error) {
            console.error('Error creating audit log:', error);
        }
    });
  
    // Add pre-remove middleware
    schema.pre('remove', function(next) {
        this._wasRemoved = true;
        this._originalDoc = this.toObject();
        next();
    });
  
    // Add post-remove middleware
    schema.post('remove', async function(doc) {
        if ( !this._wasRemoved ) return;
        
        try {
            const currentUser = global.currentUser || { _id: 'system' };
            
            await db.AuditLog.create({
                userId: currentUser._id,
                action: 'DELETE',
                entity: options.modelName || this.constructor.modelName,
                entityId: this._id,
                previousValues: this._originalDoc,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error creating audit log:', error);
        }
    });
  };
  
module.exports = auditPlugin;