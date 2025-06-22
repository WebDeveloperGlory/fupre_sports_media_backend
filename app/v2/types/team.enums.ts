export enum TeamTypes {
    DEPARTMENT_LEVEL = 'departmental-level',  // CS 100L
    DEPARTMENT_GENERAL = 'departmental-general', // CS Dept
    FACULTY_GENERAL = 'faculty-general',    // Engineering Faculty
    LEVEL_GENERAL = 'level-general',      // All 100L students
    SCHOOL_GENERAL = 'school-general',     // University-wide
    CLUB = 'club'                // Cross-department clubs
}

export enum FriendlyRequestStatus {
    PENDING = 'pending', 
    ACCEPTED = 'accepted', 
    REJECTED = 'rejected'
}

export enum CoachRoles {
    HEAD = 'head', 
    ASSISTANT = 'assistant', 
    GOALKEEPING = 'goalkeeping', 
    FITNESS = 'fitness'
}