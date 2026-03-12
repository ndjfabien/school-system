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

// DASHBOARD Y'UMUNYESHURI
router.get("/:id", protect("student"), async (req, res) => {
    try {

        const term = req.query.term;

        let rows = [];
        let total = 0;
        let average = 0;

        if(term){
            const [data] = await db.query(`
                SELECT courses.course_name, marks.marks 
                FROM marks 
                JOIN courses ON marks.course_id = courses.id 
                WHERE marks.student_id=? AND marks.term=?`,
                [req.params.id, term]
            );

            rows = data;

            rows.forEach(r=>{
                total += r.marks;
            });

            if(rows.length > 0){
                average = (total / rows.length).toFixed(2);
            }
        }

        let content = `
            <div class="container">
                <h2>My Academic Results</h2>

                <form method="GET">
                    <label>Select Term:</label>

                    <select name="term" required>
                        <option value="">Choose Term</option>
                        <option value="Term 1" ${term==="Term 1"?"selected":""}>Term 1</option>
                        <option value="Term 2" ${term==="Term 2"?"selected":""}>Term 2</option>
                        <option value="Term 3" ${term==="Term 3"?"selected":""}>Term 3</option>
                    </select>

                    <button type="submit">View Marks</button>
                </form>

                <div class="form-grid" style="margin-top:20px;">
        `;

        if (term && rows.length === 0) {
            content += `<p>No marks recorded for this term.</p>`;
        } 
        else if(term){

            rows.forEach(r => {

                let grade = r.marks >= 80 ? "A" :
                            r.marks >= 70 ? "B" :
                            r.marks >= 60 ? "C" :
                            r.marks >= 50 ? "D" : "F";

                let color = grade === "F" ? "#ef4444" : "#10b981";

                content += `
                    <div class="card" style="border-left:5px solid ${color}">
                        <b style="font-size: 1.1em;">${r.course_name}</b><br>
                        <div style="margin-top:10px;">
                            Marks: <b>${r.marks}%</b><br>
                            Grade: <span style="color:${color}; font-weight:bold;">${grade}</span>
                        </div>
                    </div>
                `;
            });

            content += `
                <div class="card">
                    <h3>Total Marks: ${total}</h3>
                    <h3>Average: ${average}%</h3>
                </div>
            `;
        }

        content += `</div></div>`;

        res.send(getLayout(content, "Student", req.session.user.name || "Learner"));

    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
});

module.exports = router;