const express = require('express');
const router = express.Router();
const db = require('../db');
const getLayout = require('../layout');

// Middleware yo kurinda inzira
function protect(role) {
    return (req, res, next) => {
        if (!req.session.user || req.session.user.role !== role) {
            return res.send("Access Denied");
        }
        next();
    };
}

// ================= TEACHER DASHBOARD =================
router.get("/:id", protect("teacher"), async (req, res) => {
    try {

        const selectedClass = req.query.class || "";

        // Courses
        const [courses] = await db.query("SELECT id, course_name FROM courses WHERE class=?",
[selectedClass]
);

        // Students depending on class
        let students = [];
        if (selectedClass) {
            const [rows] = await db.query(
                "SELECT id, name FROM students WHERE class=?",
                [selectedClass]
            );
            students = rows;
        }

        let studentOps = students.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
        let courseOps = courses.map(c => `<option value="${c.id}">${c.course_name}</option>`).join("");

        const content = `
        <div class="container">

        <h2>Teacher Dashboard</h2>

        <div class="card" style="max-width:500px">

        <h3>Select Class</h3>

        <form method="GET">

        <select name="class" required>

        <option value="">Select Class</option>
        <option value="S1" ${selectedClass=="S1"?"selected":""}>S1</option>
        <option value="S2" ${selectedClass=="S2"?"selected":""}>S2</option>
        <option value="S3" ${selectedClass=="S3"?"selected":""}>S3</option>
        <option value="S4" ${selectedClass=="S4"?"selected":""}>S4</option>
        <option value="S5" ${selectedClass=="S5"?"selected":""}>S5</option>
        <option value="S6" ${selectedClass=="S6"?"selected":""}>S6</option>

        </select>

        <button type="submit">Show Students</button>

        </form>

        </div>
        `;

        let marksForm = "";

        if (students.length > 0) {

            marksForm = `
            <div class="card" style="max-width:500px">

            <h3>Record Marks</h3>

            <form method="POST" action="/teacher/${req.params.id}/add-marks">

            <label>Student Name:</label>
            <select name="student_id">${studentOps}</select>

            <label>Course Name:</label>
            <select name="course_id">${courseOps}</select>

            <label>Term:</label>
            <select name="term">
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
            </select>

            <label>Marks (%):</label>
            <input type="number" name="marks" min="0" max="100" required>

            <button type="submit">Upload Marks</button>

            </form>

            </div>
            `;
        }

        res.send(getLayout(content + marksForm, "Teacher", req.session.user.name || "Instructor"));

    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
});

// ================= SAVE MARKS =================
router.post("/:id/add-marks", protect("teacher"), async (req, res) => {
    try {

        const { student_id, course_id, marks, term } = req.body;

        await db.query(
            "INSERT INTO marks(student_id, course_id, marks, term) VALUES(?,?,?,?)",
            [student_id, course_id, marks, term]
        );

        res.redirect(`/teacher/${req.params.id}`);

    } catch (err) {
        console.error(err);
        res.send("Error saving marks.");
    }
});

module.exports = router;