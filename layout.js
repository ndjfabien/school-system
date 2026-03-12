function getLayout(content, role = "Guest", name = "Welcome") {
    return `
    <html>
    <head>
        <title>School System</title>
        <link rel="stylesheet" href="/style.css">
    </head>
    <body>
        <div class="sidebar">
            <div class="profile-section">
                <img id="sideProfile" src="https://via.placeholder.com/100" class="profile-img">
                <label class="upload-label" for="pcUpload">Upload Photo</label>
                <input type="file" id="pcUpload" hidden accept="image/*" onchange="uploadImage(this)">
                <h3 style="margin-top:10px;">${name}</h3>
                <p style="color:var(--accent)">${role}</p>
            </div>
            <div class="nav-links">
                <a href="/">🏠 Home</a>
              
           <a href="/about">About</a>

                ${role !== 'Guest' ? '<a href="/logout">🚪 Logout</a>' : ''}
            </div>
        </div>

        <div class="main-content">
            ${content}
        </div>

        <footer>
            <b>NDAYAMBAJE Fabien</b> | 📧 fabien@gmail.com | 📱 WhatsApp: 0795533685 
        </footer>

        <script>
            function uploadImage(input) {
                if (input.files && input.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        document.getElementById('sideProfile').src = e.target.result;
                        localStorage.setItem('savedProfileImg', e.target.result);
                    }
                    reader.readAsDataURL(input.files[0]);
                }
            }
            window.onload = function() {
                const img = localStorage.getItem('savedProfileImg');
                if(img) document.getElementById('sideProfile').src = img;
            }
        </script>
    </body>
    </html>
    `;
}

module.exports = getLayout;