import { Router } from "express";
import { authenticateUser } from "../../middlewares/general/authMiddleware";
import { hasGeneralBlogPermissions, isHeadMediaAdmin, isMediaAdmin } from "../../middlewares/general/adminMiddleware";
import { createBlog, deleteBlog, editBlog, getAllBlogs, getBlogByID, publishBlog } from "../../controllers/general/blogController";

const router = Router();

// USER ROUTES //
// END OF USER ROUTES //

// GENERAL ROUTES //
router.get('/', getAllBlogs);
router.get('/:blogId', getBlogByID);
// END OF GENERAL ROUTES //

// ADMIN ROUTES //
router.post('/', authenticateUser, hasGeneralBlogPermissions, createBlog);
router.put('/:blogId', authenticateUser, hasGeneralBlogPermissions, editBlog);
router.delete('/:blogId', authenticateUser, hasGeneralBlogPermissions, deleteBlog);
router.put('/:blogId/publish', authenticateUser, isHeadMediaAdmin, publishBlog);
// END OF ADMIN ROUTES //

export default router;