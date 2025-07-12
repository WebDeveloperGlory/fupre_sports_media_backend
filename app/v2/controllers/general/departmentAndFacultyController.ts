import { Request, RequestHandler, Response } from "express";
import departmentAndFacultyService from "../../services/general/departmentAndFacultyService";
import { success, error, serverError } from "../../utils/general/responseUtils";
import { AuditInfo } from "../../types/express";
import { ObjectId } from "mongoose";
import { TeamTypes } from "../../types/team.enums";

interface AuditRequest extends Request {
    auditInfo: AuditInfo;
    user?: {
        userId: ObjectId;
        email: string;
        role: string;
    };
}

type FacultyId = { facultyId: string };
type DepartmentId = { departmentId: string };
export const createFaculty = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await departmentAndFacultyService.createFaculty(
            req.body,
            { 
                userId: req.user!.userId,
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            success( res, result.message, result.data, 201 );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}

export const createDepartment = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await departmentAndFacultyService.createDepartment(
            req.body,
            { 
                userId: req.user!.userId,
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            success( res, result.message, result.data, 201 );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}

export const updateFaculty = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await departmentAndFacultyService.updateFaculty(
            req.params as unknown as FacultyId,
            req.body,
            { 
                userId: req.user!.userId,
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            success( res, result.message, result.data, 201 );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}

export const updateDepartment = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await departmentAndFacultyService.updateDepartment(
            req.params as unknown as DepartmentId,
            req.body,
            { 
                userId: req.user!.userId,
                auditInfo: req.auditInfo 
            }
        );

        if( result.success ) {
            success( res, result.message, result.data, 201 );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}

export const getAllFaculties = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await departmentAndFacultyService.getAllFaculties();

        if( result.success ) {
            success( res, result.message, result.data );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}

export const getAllDepartments = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await departmentAndFacultyService.getAllDepartments();

        if( result.success ) {
            success( res, result.message, result.data );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}

export const deleteFaculty = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await departmentAndFacultyService.deleteFaculty( req.params as unknown as FacultyId );

        if( result.success ) {
            success( res, result.message, result.data );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}

export const deleteDepartment = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await departmentAndFacultyService.deleteDepartment( req.params as unknown as DepartmentId );

        if( result.success ) {
            success( res, result.message, result.data );
            return;
        }
        error( res, result.message );
        return;
    } catch ( err: Error | any ) {
        serverError( res, err );
    }
}