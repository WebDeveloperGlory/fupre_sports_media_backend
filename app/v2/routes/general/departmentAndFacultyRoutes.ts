import { Router } from "express";
import { authenticateUser } from "../../middlewares/general/authMiddleware";
import { isSuperAdmin } from "../../middlewares/general/adminMiddleware";
import { createDepartment, createFaculty, deleteDepartment, deleteFaculty, getAllDepartments, getAllFaculties, updateDepartment, updateFaculty } from "../../controllers/general/departmentAndFacultyController";

const router = Router();

// USER ROUTES //
// END OF USER ROUTES //

// GENERAL ROUTES //
router.get('/faculty', getAllFaculties);
router.get('/department', getAllDepartments);
// END OF GENERAL ROUTES //

// ADMIN ROUTES //
router.post('/faculty', authenticateUser, isSuperAdmin, createFaculty);
router.post('/department', authenticateUser, isSuperAdmin, createDepartment);
router.put('/faculty/:facultyId', authenticateUser, isSuperAdmin, updateFaculty);
router.put('/department/:departmentId', authenticateUser, isSuperAdmin, updateDepartment);
router.delete('/faculty/:facultyId', authenticateUser, isSuperAdmin, deleteFaculty);
router.delete('/department/:departmentId', authenticateUser, isSuperAdmin, deleteDepartment);
// END OF ADMIN ROUTES //

export default router;