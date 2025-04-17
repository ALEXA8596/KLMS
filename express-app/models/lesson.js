// Format
// Course => Unit => Lesson

const lesson = {
    title: "Lesson Title",
    description: "Lesson Description",
    content: "Lesson Content",
    createdBy: "User ID",
    id: "Lesson ID", //uuiv4 or similar
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["tag1", "tag2"],
    likes: ["User ID"],
    dislikes: ["User ID"],
    parent: "Parent Unit ID", // or null if no parent
    children: ["Child Lesson ID"], // or empty array if no children
    visibility: "PUBLIC", // "PUBLIC", "PRIVATE", or "UNLISTED"
};

const unit = {
    title: "Unit Title",
    description: "Unit Description",
    id: "Unit ID", // uuiv4 or similar
    lessons: [lesson], // Array of lesson objects
    createdBy: "User ID",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["tag1", "tag2"],
    visibility: "PUBLIC", // "PUBLIC", "PRIVATE", or "UNLISTED"
    parent: "Parent Course ID", // or null if no parent
    children: ["Child Lesson ID"], // or empty array if no children
};

const course = {
    title: "Course Title",
    description: "Course Description",
    id: "Course ID", // uuiv4 or similar
    units: [unit], // Array of unit objects
    createdBy: "User ID",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["tag1", "tag2"],
    visibility: "PUBLIC", // "PUBLIC", "PRIVATE", or "UNLISTED"
    level: "beginner" // beginner, intermediate, advanced
}