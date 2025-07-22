import { ObjectId } from 'mongoose';
import db from '../../config/db';
import { BlogCategories } from '../../types/blog.enums';
import { AuditInfo } from '../../types/express';
import { UserRole } from '../../types/user.enums';
import auditLogUtils from '../../utils/general/auditLogUtils';
import { LogAction } from '../../types/auditlog.enums';

type BlogFilter = {
    category?: BlogCategories,
    isReviewed?: boolean;
    isPublished?: boolean;
}
const getAllBlogs = async () => {
    try {
        // Get blogs
        const blogs = await db.V2Blog.find({})
            .populate([
                { path: 'author', select: 'name email role' }
            ]);

        // Return success
        return { 
            success: true,
            message: 'Blogs Acquired',
            data: blogs
        }
    } catch ( err ) {
        console.error('Error Fextching Blogs', err);
        throw new Error('Error Fetching Blogs')
    }
}

const getBlogByID = async ({ blogId }: { blogId: string; }) => {
    try {
        // Check if blog exists
        const foundBlog = await db.V2Blog.findById(blogId)
            .populate([
                { path: 'author', select: 'name email role' }
            ]);
        if(!foundBlog) return { success: false, message: 'Invlaid Blog' };

        // Increment views
        foundBlog.views = foundBlog.views+1;
        await foundBlog.save();

        // Return success
        return { success: true, message: 'Blog Acquired', data: foundBlog };
    } catch ( err ) {
        console.error('Error Fextching Blog By ID', err);
        throw new Error('Error Fetching Blogs')
    }
}

const createBlog = async (
    { title, content, coverImage, category }: { title: string; content: string; coverImage: string; category: BlogCategories },
    { userId, role, auditInfo }: { userId: ObjectId, role: UserRole, auditInfo: AuditInfo }
) => {
    try {
        // Validate fields
        if(!title || !content) return { success: false, message: 'Missing Required Field' };
        if(!category || !Object.values(BlogCategories).includes(category)) return { success: false, message: 'Invalid Category' };

        // Create blog
        const blog = new db.V2Blog({ 
            title, content, coverImage, category,
            author: userId,
            isReviewed: role === UserRole.HEAD_MEDIA_ADMIN ? true : false,
        });
        await blog.save();

        // Log action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.CREATE,
            entity: 'V2Blog',
            entityId: blog._id,
            message: `New Blog ${ blog.title } Created By ${ userId }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: undefined,
            newValues: blog.toObject()
        });

        // Return success
        return { success: true, message: 'Blog Created', data: blog.toObject() };
    } catch ( err ) {
        console.error('Error Creating Blog', err);
        throw new Error('Error Creating Blog')
    }
}

const editBlog = async (
    { blogId }: { blogId: string; },
    { title, content, coverImage, category }: { title?: string; content?: string; coverImage?: string; category?: BlogCategories },
    { userId, auditInfo }: { userId: ObjectId, auditInfo: AuditInfo }
) => {
    try {
        // Check if blog exists
        const foundBlog = await db.V2Blog.findById(blogId);
        if(!foundBlog) return { success: false, message: 'Invlaid Blog' };
        const oldBlog = await db.V2Blog.findById(blogId);

        // Edit fields
        if( title ) foundBlog.title = title;
        if( content ) foundBlog.content = content;
        if( coverImage ) foundBlog.coverImage = coverImage;
        if( category ) foundBlog.category = category;
        await foundBlog.save();

        // Log Action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2Blog',
            entityId: foundBlog._id,
            message: `${ foundBlog.title } Edited By ${ userId }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: oldBlog!.toObject(),
            newValues: foundBlog.toObject()
        });

        // Return success
        return { success: true, message: 'Blog Updated', data: foundBlog };
    } catch ( err ) {
        console.error('Error Fextching Blog By ID', err);
        throw new Error('Error Fetching Blogs')
    }
}

const deleteBlog = async (
    { blogId }: { blogId: string; },
    { userId, role, auditInfo }: { userId: ObjectId, role: UserRole, auditInfo: AuditInfo }
) => {
    try {
        // Find blog
        const foundBlog = await db.V2Blog.findById( blogId );
        if( !foundBlog ) return { success: false, message: 'Invalid Blog' };
        if(( ![UserRole.SUPER_ADMIN, UserRole.HEAD_MEDIA_ADMIN].includes(role) ) && foundBlog.author.toString() !== userId.toString() ) return { success: false, message: 'Invalid User Permissions' };

        // Delete blog
        await db.V2Blog.findByIdAndDelete( blogId );

        // Log Action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.DELETE,
            entity: 'V2Blog',
            entityId: foundBlog._id,
            message: `${ foundBlog.title } Edited By ${ userId }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: foundBlog.toObject(),
            newValues: undefined
        });

        // Return success
        return { success: true, message: 'Blog Deleted', data: null }
    } catch ( err ) {
        console.error('Error Fextching Blog By ID', err);
        throw new Error('Error Fetching Blogs')
    }
}

const publishBlog = async (
    { blogId }: { blogId: string; },
    { userId, role, auditInfo }: { userId: ObjectId, role: UserRole, auditInfo: AuditInfo }
) => {
    try {
        // Find blog
        const foundBlog = await db.V2Blog.findById( blogId );
        if( !foundBlog ) return { success: false, message: 'Invalid Blog' };

        // Publish blog
        foundBlog.isPublished = true;
        await foundBlog.save();

        // Log Action
        await auditLogUtils.logAction({
            userId,
            action: LogAction.UPDATE,
            entity: 'V2Blog',
            entityId: foundBlog._id,
            message: `${ foundBlog.title } Published By ${ userId }`,
            ipAddress: auditInfo.ipAddress,
            userAgent: auditInfo.userAgent,
            previousValues: {
                ...foundBlog.toObject(),
                isPublished: false
            },
            newValues: foundBlog.toObject()
        });

        // Return success
        return { success: true, message: 'Blog Published', data: foundBlog }
    } catch ( err ) {
        console.error('Error Publishing Blog', err);
        throw new Error('Error Publishing Blogs')
    }
}

const blogService = {
    getAllBlogs,
    getBlogByID,
    createBlog,
    editBlog,
    deleteBlog,
    publishBlog,

}

export default blogService;