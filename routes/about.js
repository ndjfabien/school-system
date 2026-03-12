const express = require('express');
const router = express.Router();
const getLayout = require('../layout');

router.get("/", (req, res) => {

const content = `
<div class="container about-page" style="line-height: 1.6;">

    <h2 style="color: var(--primary); border-bottom: 2px solid #ddd; padding-bottom: 10px;">
        About Our School Management System
    </h2>

    <p style="font-size: 1.1em; margin-top: 20px;">
        The <b>Student Marks Management System</b> is a comprehensive digital solution designed to streamline school administration. 
        It centralizes the management of students, teachers, courses, and academic performance, 
        ensuring data accuracy and easy accessibility for all users.
    </p>

    <h3 style="margin-top: 30px; color: var(--secondary);">Key System Features</h3>
    <ul style="list-style-type: square; padding-left: 20px;">
        <li><b>User Management:</b> Full control over Student and Teacher profiles.</li>
        <li><b>Course Coordination:</b> Efficiently organize and manage school subjects.</li>
        <li><b>Academic Grading:</b> Digital recording and real-time calculation of student marks.</li>
        <li><b>Performance Analytics:</b> View and track student progress over time.</li>
        <li><b>Admin Dashboard:</b> High-level statistics showing school data at a glance.</li>
    </ul>

    <h3 style="margin-top: 30px; color: var(--secondary);">User Roles</h3>
    <ul>
        <li><b>Administrator:</b> Exercises full control over the system, managing users, courses, and core data.</li>
        <li><b>Teacher:</b> Responsible for inputting and managing student marks for assigned classes.</li>
        <li><b>Student:</b> Accesses a personalized dashboard to view academic results and performance history.</li>
    </ul>

    <h3 style="margin-top: 30px; color: var(--secondary);">Technologies Used</h3>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-weight: bold;">
        <div>• Node.js & Express.js</div>
        <div>• MySQL Database</div>
        <div>• HTML5 & CSS3</div>
        <div>• JavaScript (ES6+)</div>
    </div>

    <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;">

    <div style="margin-top: 20px; background: #f9f9f9; padding: 20px; border-radius: 10px;">
        <h3>Developer Information</h3>
        <p><b>Name:</b> Ndayambaje Fabien</p>
        <p><b>Project:</b> School Management System</p>
        <p><b>Year:</b> 2026</p>
    </div>

</div>
`;

res.send(getLayout(content, "About", "System Information"));

});

module.exports = router;