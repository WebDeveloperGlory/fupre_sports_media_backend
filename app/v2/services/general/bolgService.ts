import db from '../../config/db';
import { BlogCategories } from '../../types/blog.enums';

type BlogFilter = {
    category?: BlogCategories
}
const getAllBlogs = async (
    { category, limit=10, page=1 }: 
    { category?: BlogCategories, limit: number, page: number }
) => {
    try {
        // Define filters
        const skip = ( page - 1 ) * limit;
        const filters: BlogFilter = {};
        if( category ) filters.category = category;

        // Get blogs
        const totalBlogs = await db.V2Blog.countDocuments({ filters });
        const blogs = await db.V2Blog.find({ filters })
            .populate([
                { path: 'author', select: 'name email' }
            ])
            .skip( skip )
            .limit( limit );

        // Return success
        return { 
            success: true,
            message: 'Blogs Acquired', 
            data: {
                blogs,
                pagination: {
                    total: totalBlogs,
                    page,
                    limit,
                    pages: Math.ceil(totalBlogs / limit),
                }
        } }
    } catch ( err ) {
        console.error('Error Fextching Blogs', err);
        throw new Error('Error Fetching Blogs')
    }
}