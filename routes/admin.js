const express = require('express');
const router = express.Router();
const db = require('../db');
const getLayout = require('../layout');
const bcrypt = require('bcryptjs');

// ================= PROTECT ROUTES =================
function protect(role) {
    return (req, res, next) => {
        if (!req.session.user || req.session.user.role !== role) {
            return res.send("Access Denied");
        }
        next();
    };
}
router.get("/about", (req, res) => {

const content = `

<div class="container about-page">

<h2>About Our School Management System</h2>

<p>
This system helps schools manage students, teachers,
courses and student marks efficiently.
</p>

<h3>Features</h3>

<ul>
<li>Student Management</li>
<li>Teacher Management</li>
<li>Course Management</li>
<li>Record Student Marks</li>
<li>Class Management</li>
</ul>

<h3>Technologies Used</h3>

<ul>
<li>Node.js</li>
<li>Express.js</li>
<li>MySQL</li>
<li>HTML & CSS</li>
</ul>

<h3>Developer</h3>

<p>Name: Ndayambaje Fabien</p>
<p>Project: School Management System</p>
<p>Year: 2026</p>

</div>

`;

res.send(getLayout(content,"About","System"));

});

// ================= ADMIN DASHBOARD =================
router.get("/:id", protect("admin"), async (req, res) => {
    try {
        // Counts
        const [[{studentCount}]] = await db.query("SELECT COUNT(*) as studentCount FROM students");
        const [[{teacherCount}]] = await db.query("SELECT COUNT(*) as teacherCount FROM teachers");
        const [[{courseCount}]] = await db.query("SELECT COUNT(*) as courseCount FROM courses");

        // Tables
        const [students] = await db.query("SELECT * FROM students");
        const [teachers] = await db.query("SELECT * FROM teachers");
        const [courses] = await db.query("SELECT * FROM courses");

        // Rows for HTML table
        let studentRows = students.map(s => `
            <tr>
                <td>${s.id}</td>
                <td><input type="text" name="name" value="${s.name}"></td>
                <td><input type="email" name="email" value="${s.email}"></td>
                <td>
                    <button formaction="/admin/${req.params.id}/update-student/${s.id}" formmethod="POST">Update</button>
                    <button formaction="/admin/${req.params.id}/delete-student/${s.id}" formmethod="POST" style="background:red;">Delete</button>
                </td>
            </tr>
        `).join("");

        let teacherRows = teachers.map(t => `
            <tr>
                <td>${t.id}</td>
                <td><input type="text" name="name" value="${t.name}"></td>
                <td><input type="email" name="email" value="${t.email}"></td>
                <td>
                    <button formaction="/admin/${req.params.id}/update-teacher/${t.id}" formmethod="POST">Update</button>
                    <button formaction="/admin/${req.params.id}/delete-teacher/${t.id}" formmethod="POST" style="background:red;">Delete</button>
                </td>
            </tr>
        `).join("");

        let courseRows = courses.map(c => `
            <tr>
                <td>${c.id}</td>
                <td><input type="text" name="course_name" value="${c.course_name}"></td>
                <td>
                    <button formaction="/admin/${req.params.id}/update-course/${c.id}" formmethod="POST">Update</button>
                    <button formaction="/admin/${req.params.id}/delete-course/${c.id}" formmethod="POST" style="background:red;">Delete</button>
                </td>
            </tr>
        `).join("");

        // ================== PERFORMANCE DATA FOR CHARTS ==================
       // ================== PERFORMANCE DATA FOR CHARTS ==================
const [performance] = await db.query(`
SELECT students.name, AVG(marks.marks) as average
FROM students
JOIN marks ON students.id = marks.student_id
GROUP BY students.id
`);

const studentNames = performance.map(p => p.name);
const averages = performance.map(p => p.average);

const [termData] = await db.query(`
SELECT term, AVG(marks) AS avgMarks
FROM marks
GROUP BY term
`);

const terms = termData.map(t => t.term);
const termAvg = termData.map(t => t.avgMarks);

        const [topStudents] = await db.query(`
            SELECT students.name, AVG(marks.marks) as average
            FROM students
            JOIN marks ON students.id = marks.student_id
            GROUP BY students.id
            ORDER BY average DESC
            LIMIT 5
        `);
        const topNames = topStudents.map(s => s.name);
        const topMarks = topStudents.map(s => s.average);

        const [[pass]] = await db.query(`SELECT COUNT(*) as total FROM marks WHERE marks >=50`);
        const [[fail]] = await db.query(`SELECT COUNT(*) as total FROM marks WHERE marks <50`);

        // ================== HTML CONTENT ==================
        const content = `
        <div class="container">
            <h2>Admin Dashboard</h2>

            <div class="form-grid">
                <div class="card"><h3>Total Students</h3><h2>${studentCount}</h2></div>
                <div class="card"><h3>Total Teachers</h3><h2>${teacherCount}</h2></div>
                <div class="card"><h3>Total Courses</h3><h2>${courseCount}</h2></div>
            </div>

            <div class="form-grid">
                <div class="card">
                    <h3>Add Student</h3>
                   
<form method="POST" action="/admin/${req.params.id}/add-student">

<input name="name" placeholder="Name"required>
<input name="email" placeholder="Email"required>
<input name="password" placeholder="Password">

<select name="class">
<option value="">Select Class</option>
<option>S1</option>
<option>S2</option>
<option>S3</option>
<option>S4</option>
<option>S5</option>
<option>S6</option>
<option value="">Select Level</option>
<option>Level 3</option>
<option>Level 4</option>
<option>Level 5</option>
</select>
<select name="trade" required>

<option value="">Select Trade</option>

<option>Software Development</option>
<option>Multimedia</option>
<option>Tourism</option>
<option>Accounting</option>
<option>Building Construction</option>
<option>Automobile Technology</option>

</select>

<button>Save Student</button>

</form>
                </div>

                <div class="card">
                    <h3>Add Teacher</h3>
<form method="POST" action="/admin/${req.params.id}/add-teacher">

<input name="name" placeholder="Name"required>
<input name="email" placeholder="Email"required>
<input name="password" placeholder="Password">

<select name="class">
<option value="">Class Teaching</option>
<option>S1</option>
<option>S2</option>
<option>S3</option>
<option>S4</option>
<option>S5</option>
<option>S6</option>
<option value="">select level>
<option>Level 5</option>
<option>Level 3</option>
<option>Level 4</option>
<option>Level 5</option>
</select>

<button style="background:#10b981">Save Teacher</button>

</form>
                </div>

                <div class="card">
                
            <h3>Add Course</h3>

<form method="POST" action="/admin/${req.params.id}/add-course">

<input name="course_name" placeholder="Course Name"required>

<select name="class" required>
<option value="">Select Class</option>
<option>S1</option>
<option>S2</option>
<option>S3</option>
<option>S4</option>
<option>S5</option>
<option>S6</option>
<option value="">select level>
<option>Level 5</option>
<option>Level 3</option>
<option>Level 4</option>
<option>Level 5</option>
</select>

<button type="submit">Save Course</button>

</form>
                </div>
            </div>

            <div class="card">
                <h3>Update Students</h3>
                <form><table border="1" cellpadding="5"><tr><th>ID</th><th>Name</th><th>Email</th><th>Action</th></tr>${studentRows}</table></form>
            </div>

            <div class="card">
                <h3>Update Teachers</h3>
                <form><table border="1" cellpadding="5"><tr><th>ID</th><th>Name</th><th>Email</th><th>Action</th></tr>${teacherRows}</table></form>
            </div>

            <div class="card">
                <h3>Update Courses</h3>
                <form><table border="1" cellpadding="5"><tr><th>ID</th><th>Course Name</th><th>Action</th></tr>${courseRows}</table></form>
            </div>

            <!-- ========== GRAPHS ========== -->
            <div class="card"><h3>Student Performance</h3><canvas id="studentChart"></canvas></div>
            <div class="card"><h3>Performance by Term</h3><canvas id="termChart"></canvas></div>
            <div class="card"><h3>Top 5 Students</h3><canvas id="topChart"></canvas></div>
            <div class="card"><h3>Pass vs Fail</h3><canvas id="passFailChart"></canvas></div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
            new Chart(document.getElementById("studentChart"),{
                type:"bar",
                data:{labels:${JSON.stringify(studentNames)},datasets:[{label:"Average Marks",data:${JSON.stringify(averages)},backgroundColor:'#2563eb'}]},
                options:{scales:{y:{beginAtZero:true,max:100}}}
            });

            new Chart(document.getElementById("termChart"),{
                type:"line",
                data:{labels:${JSON.stringify(terms)},datasets:[{label:"Term Average",data:${JSON.stringify(termAvg)},borderColor:'#f59e0b',fill:false}]},
                options:{scales:{y:{beginAtZero:true,max:100}}}
            });

            new Chart(document.getElementById("topChart"),{
                type:"bar",
                data:{labels:${JSON.stringify(topNames)},datasets:[{label:"Top Students",data:${JSON.stringify(topMarks)},backgroundColor:'#10b981'}]},
                options:{scales:{y:{beginAtZero:true,max:100}}}
            });

            new Chart(document.getElementById("passFailChart"),{
                type:"pie",
                data:{labels:["Pass","Fail"],datasets:[{data:[${pass.total},${fail.total}],backgroundColor:['#10b981','#ef4444']}]}
            });
        </script>
        `;

        res.send(getLayout(content, "Admin", "Super Admin"));
    } catch(err){
        console.error(err);
        res.status(500).send("Database Error");
    }
});

// ================= ADMIN INSERT =================
router.post("/:id/add-student", protect("admin"), async(req,res)=>{
   const {name,email,password,class:studentClass,level,trade}=req.body;
const hash=await bcrypt.hash(password,10);
await db.query(
"INSERT INTO students(name,email,password,class,level,trade) VALUES(?,?,?,?,?,?)",
[name,email,hash,studentClass,level,trade]
);
res.redirect(`/admin/${req.params.id}`);
});

router.post("/:id/add-teacher", protect("admin"), async(req,res)=>{

const {name,email,password,class:teacherClass}=req.body;

const hash=await bcrypt.hash(password,10);

await db.query(
"INSERT INTO teachers(name,email,password,class) VALUES(?,?,?,?)",
[name,email,hash,teacherClass]
);

res.redirect(`/admin/${req.params.id}`);

});

router.post("/:id/add-course", protect("admin"), async (req, res) => {

const { course_name, class: courseClass } = req.body;

await db.query(
"INSERT INTO courses(course_name, class) VALUES(?,?)",
[course_name, courseClass]
);

res.redirect(`/admin/${req.params.id}`);

});
// ================= ADMIN UPDATE =================
router.post("/:id/update-student/:studentId", protect("admin"), async(req,res)=>{
    const {name,email} = req.body;
    await db.query("UPDATE students SET name=?, email=? WHERE id=?",[name,email,req.params.studentId]);
    res.redirect(`/admin/${req.params.id}`);
});

router.post("/:id/update-teacher/:teacherId", protect("admin"), async(req,res)=>{
    const {name,email} = req.body;
    await db.query("UPDATE teachers SET name=?, email=? WHERE id=?",[name,email,req.params.teacherId]);
    res.redirect(`/admin/${req.params.id}`);
});

router.post("/:id/update-course/:courseId", protect("admin"), async(req,res)=>{
    const {course_name} = req.body;
    await db.query("UPDATE courses SET course_name=? WHERE id=?",[course_name,req.params.courseId]);
    res.redirect(`/admin/${req.params.id}`);
});

// ================= ADMIN DELETE =================
router.post("/:id/delete-student/:studentId", protect("admin"), async(req,res)=>{
    await db.query("DELETE FROM students WHERE id=?", [req.params.studentId]);
    res.redirect(`/admin/${req.params.id}`);
});

router.post("/:id/delete-teacher/:teacherId", protect("admin"), async(req,res)=>{
    await db.query("DELETE FROM teachers WHERE id=?", [req.params.teacherId]);
    res.redirect(`/admin/${req.params.id}`);
});

router.post("/:id/delete-course/:courseId", protect("admin"), async(req,res)=>{
    await db.query("DELETE FROM courses WHERE id=?", [req.params.courseId]);
    res.redirect(`/admin/${req.params.id}`);
});

module.exports = router;
router.post("/:id/add-course", protect("admin"), async (req, res) => {

const { course_name, class: courseClass } = req.body;

await db.query(
"INSERT INTO courses(course_name, class) VALUES(?,?)",
[course_name, courseClass]
);

res.redirect(`/admin/${req.params.id}`);

});