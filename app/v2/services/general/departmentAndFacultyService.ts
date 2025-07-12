import { ObjectId } from 'mongoose';
import db from '../../config/db';
import { AuditInfo } from '../../types/express';
import auditLogUtils from '../../utils/general/auditLogUtils';
import { LogAction } from '../../types/auditlog.enums';

const createFaculty = async (
    { name }: { name: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check for reuired fields
        if( !name ) return { success: false, message: 'Missing Required Field Name' };
       
        // Check uniqueness of name
        const sameNameFaculty = await db.V2Faculty.findOne({ name });
        if( sameNameFaculty ) return { success: false, message: `Faculty With ${ name } Already Exists` };


        // Create faculty
        const createdFaculty = new db.V2Faculty({ name });
        await createdFaculty.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.CREATE,
            entity: 'V2Faculty',
            entityId: createdFaculty._id,
            message: `New Faculty ${ createdFaculty.name } Created By ${ userId }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: undefined,
            newValues: createdFaculty.toObject()
        });

        // Return success
        return { success: true, message: 'Faculty Created', data: createdFaculty.toObject() };
    } catch( err ) {
        console.error('Error during faculty creation', err );
        throw new Error('Error With Faculty creation');
    }
}

const createDepartment = async (
    { name, faculty }: { name: string, faculty: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check for reuired fields
        if( !name || !faculty ) return { success: false, message: 'Missing Required Field' };
       
        // Check uniqueness of name
        const sameNameDepartment = await db.V2Department.findOne({ name });
        if( sameNameDepartment ) return { success: false, message: `Department With ${ name } Already Exists` };

        if( faculty ) {
            const isValidFaculty = await db.V2Faculty.findById( faculty );
            if( !isValidFaculty ) return { success: false, message: 'Invalid Faculty' }
        }

        // Create department
        const createdDepartment = new db.V2Department({
            name, faculty
        });
        await createdDepartment.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.CREATE,
            entity: 'V2Department',
            entityId: createdDepartment._id,
            message: `New Department ${ createdDepartment.name } Created By ${ userId }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: undefined,
            newValues: createdDepartment.toObject()
        });

        // Return success
        return { success: true, message: 'Department Created', data: createdDepartment.toObject() };
    } catch( err ) {
        console.error('Error during faculty creation', err );
        throw new Error('Error With Faculty creation');
    }
}

const getAllFaculties = async () => {
    try {
        // Get faculties
        const allFaculties = await db.V2Faculty.find().sort({ createdAt: -1 });

        // Return success
        return { success: true, message: 'All Faculty Acquired', data: allFaculties }
    } catch( err ) {
        console.error('Error during all faculty fetch', err );
        throw new Error('Error With Faculty Fetching');
    }
}

const getAllDepartments = async () => {
    try {
        // Get departments
        const allDepartments = await db.V2Department.find()
            .populate([
                {
                    path: 'faculty',
                    select: 'name'
                }
            ])
            .sort({ createdAt: -1 });

        // Return success
        return { success: true, message: 'All Departments Acquired', data: allDepartments }
    } catch( err ) {
        console.error('Error during all departments fetch', err );
        throw new Error('Error With Departments Fetching');
    }
}

const updateFaculty = async (
    { facultyId }: { facultyId: string },
    { name }: { name: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check for reuired fields
        if( !name ) return { success: false, message: 'Missing Required Field Name' };
       
        // Check if faculty exists
        const foundFaculty = await db.V2Faculty.findById( facultyId );
        if( !foundFaculty ) return { success: false, message: 'Invalid Faculty' };

        // Update faculty
        const updatedFaculty = await db.V2Faculty.findByIdAndUpdate(
            facultyId,
            { name },
            { new: true }
        );
        if( !updatedFaculty ) return { success: false, message: 'Error Updating Faculty' }

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.CREATE,
            entity: 'V2Faculty',
            entityId: foundFaculty._id,
            message: `${ updatedFaculty.name } Updated`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundFaculty.name,
            newValues: updatedFaculty.name,
        });

        // Return success
        return { success: true, message: 'Department Created', data: updatedFaculty };
    } catch( err ) {
        console.error('Error during faculty update', err );
        throw new Error('Error With Faculty update');
    }
}

const updateDepartment = async (
    { departmentId }: { departmentId: string },
    { name, faculty }: { name: string, faculty: string },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check for reuired fields
        if( !name ) return { success: false, message: 'Missing Required Field Name' };
       
        // Check if department exists
        const foundDepartment = await db.V2Department.findById( departmentId );
        if( !foundDepartment ) return { success: false, message: 'Invalid Department' };

        // Check if faculty exists
        const foundFaculty = await db.V2Faculty.findById( faculty );
        if( !foundFaculty ) return { success: false, message: 'Invalid Faculty' };

        // Update department
        const updatedDepartment = await db.V2Department.findByIdAndUpdate(
            departmentId,
            { name, faculty },
            { new: true }
        );
        if( !updatedDepartment ) return { success: false, message: 'Error Updating Department' }

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.CREATE,
            entity: 'V2Department',
            entityId: foundDepartment._id,
            message: `${ updatedDepartment.name } Updated`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundDepartment.name,
            newValues: updatedDepartment.name,
        });

        // Return success
        return { success: true, message: 'Department Created', data: updatedDepartment };
    } catch( err ) {
        console.error('Error during department update', err );
        throw new Error('Error With Department update');
    }
}

const deleteFaculty = async ({ facultyId }: { facultyId: string }) => {
    try {
        // Find faculty
        const foundFaculty = await db.V2Faculty.findById( facultyId );
        if( !foundFaculty ) return { success: false, message: 'Invalid Faculty' };

        // Delete faculty
        await db.V2Faculty.findByIdAndDelete( facultyId );

        // Return success
        return { success: true, message: 'Faculty Deleted', data: null }
    } catch( err ) {
        console.error('Error during faculty delete', err );
        throw new Error('Error With Faculty Deletion');
    }
}

const deleteDepartment = async ({ departmentId }: { departmentId: string }) => {
    try {
        // Find department
        const foundDepartment = await db.V2Department.findById( departmentId );
        if( !foundDepartment ) return { success: false, message: 'Invalid Department' };

        // Delete department
        await db.V2Department.findByIdAndDelete( departmentId );

        // Return success
        return { success: true, message: 'Department Deleted', data: null }
    } catch( err ) {
        console.error('Error during department delete', err );
        throw new Error('Error With Department Deletion');
    }
}

const departmentAndFacultyService = {
    createFaculty,
    createDepartment,
    getAllFaculties,
    getAllDepartments,
    updateFaculty,
    updateDepartment,
    deleteFaculty,
    deleteDepartment,
}

export default departmentAndFacultyService;