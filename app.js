
const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./db'); // Import database
const getLayout = require('./layout'); // Import layout

const app = express();

// ================= MIDDLEWARES =================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(session({
    secret: "school-secret-key",
    resave: false,
    saveUninitialized: false
}));
const aboutRoute = require('./routes/about');
app.use('/about', aboutRoute);

// ================= ROUTES IMPORT =================
// Hano niho tuhamagara amafayilo ari muri folder ya routes
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');

// Guhuza inzira (Mounting Routes)
app.use('/admin', adminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);

// ================= PROTECT ROUTES =================
function protect(role) {
    return (req, res, next) => {
        if (!req.session.user || req.session.user.role !== role) {
            return res.send("Access Denied");
        }
        next();
    };
}

// ================= HOME =================
app.get("/", (req, res) => {
    const content = `
        <div class="container">
            <h2>Welcome to School System</h2>
            <div class="form-grid">
                <div class="card"><h3>Admin</h3><a href="/login/admin"><button>Login</button></a></div>
                <div class="card"><h3>Teacher</h3><a href="/login/teacher"><button style="background:#10b981">Login</button></a></div>
                <div class="card"><h3>Student</h3><a href="/login/student"><button style="background:#3b82f6">Login</button></a></div>
            </div>
        </div>
        <div style="text-align:center; margin-top:20px;">
            <img src="converted_image.jpg" style="width190px;height:200px;border-radius:10px;border:2px solid #f4f1f8;object-fit:cover;">
            <p style="font-weight:bold;">Developer by ndayambaje</p>
        </div>
        <p>
        <div class="slider">
            <div class="slides">
                <div class="slide" style="background-image:linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('https://images.unsplash.com/photo-1523050853063-bd8012fbb72b?w=800')">Quality Education</div>
                <div class="slide" style="background-image:linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800')">Expert Teachers</div>
                <div class="slide" style="background-image:linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800')">Student Success</div>
            </div>
        </div>
    `;
    res.send(getLayout(content));
});

// ================= LOGIN & LOGOUT =================
app.get("/login/:role", (req, res) => {
    const role = req.params.role;
    res.send(getLayout(`
        <div class="container" style="max-width:400px;margin:auto;">
            <h2>${role.toUpperCase()} Login</h2>
            <form method="POST" action="/login">
                <input type="hidden" name="role" value="${role}">
                <input type="email" name="email" placeholder="Email">
                <input type="password" name="password" placeholder="Password">
                <button>Login</button>
            </form>
        </div>
    `));
});

app.post("/login", async (req, res) => {
    const { role, email, password } = req.body;
    let table = role === 'admin' ? 'admins' :
                role === 'teacher' ? 'teachers' : 'students';

    try {
        const [rows] = await db.query(`SELECT * FROM ${table} WHERE email=?`, [email]);
        if (rows.length === 0) return res.send("User not found");

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send("Wrong password");

        req.session.user = { id: user.id, role: role, name: user.name };
        res.redirect(`/${role}/${user.id}`);
    } catch (err) {
        res.send("Error during login: " + err.message);
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});