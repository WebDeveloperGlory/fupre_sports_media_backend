import { Request, RequestHandler, Response } from "express";
import blogService from "../../services/general/blogService";
import { success, error, serverError } from "../../utils/general/responseUtils";
import { AuditInfo } from "../../types/express";
import { ObjectId } from "mongoose";
import { BlogCategories } from "../../types/blog.enums";
import { UserRole } from "../../types/user.enums";

interface AuditRequest extends Request {
    auditInfo: AuditInfo;
    user?: {
        userId: ObjectId;
        email: string;
        role: string;
    };
}

type BlogId = { blogId: string };
type AllBlogQuery = { category?: BlogCategories, limit: number, page: number, isReviewed: boolean, isPublished: boolean };

export const getAllBlogs = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await blogService.getAllBlogs();

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

export const getBlogByID = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await blogService.getBlogByID( req.params as unknown as BlogId );

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

export const createBlog = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await blogService.createBlog(
            req.body,
            { 
                userId: req.user!.userId,
                auditInfo: req.auditInfo,
                role: req.user!.role as UserRole
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

export const editBlog = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await blogService.editBlog(
            req.params as unknown as BlogId,
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

export const deleteBlog = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await blogService.deleteBlog(
            req.params as unknown as BlogId,
            { 
                userId: req.user!.userId,
                auditInfo: req.auditInfo,
                role: req.user!.role as UserRole
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

export const publishBlog = async ( req: AuditRequest, res: Response ) => {
    try {
        const result = await blogService.publishBlog(
            req.params as unknown as BlogId,
            { 
                userId: req.user!.userId,
                auditInfo: req.auditInfo,
                role: req.user!.role as UserRole
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