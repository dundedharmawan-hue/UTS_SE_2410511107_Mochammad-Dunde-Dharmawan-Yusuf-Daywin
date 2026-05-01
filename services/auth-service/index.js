const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const proxy = require('express-http-proxy');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise'); //
const bcrypt = require('bcryptjs');      //

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const blacklist = [];

// Koneksi Database (Poin 2 & 5)
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pengaduan_db'
});

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: { message: "Terlalu banyak permintaan (Rate limit 60/menit), coba lagi nanti." }
});
app.use(limiter);

const gatewayAuth = (req, res, next) => {
    if (req.method === 'GET') return next();

    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token || blacklist.includes(token)) {
        return res.status(401).json({ message: "Akses ditolak: Gateway memerlukan token valid" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa" });
    }
};

app.get('/auth/github', (req, res) => {
    const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
    res.redirect(url);
});

app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const response = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, { headers: { accept: 'application/json' } });

        const githubToken = response.data.access_token;
        const userRes = await axios.get('https://github.com/user', {
            headers: { Authorization: `token ${githubToken}` }
        });

        // Debugging untuk cek data yang masuk (Lihat di Terminal)
        console.log("Data GitHub:", userRes.data);

        const { login, email, avatar_url, id } = userRes.data;
        
        // FIX: Proteksi agar tidak undefined saat bind ke SQL
        const finalEmail = email || `${login || id}@github.com`;
        const finalUsername = login || `user_${id}`;
        const finalPhoto = avatar_url || '';

        // MAPPING KE USER LOKAL (Poin 5)
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [finalEmail]);
        let userId;

        if (rows.length === 0) {
            const [result] = await db.execute(
                'INSERT INTO users (username, email, profile_photo, oauth_provider) VALUES (?, ?, ?, ?)',
                [finalUsername, finalEmail, finalPhoto, 'github']
            );
            userId = result.insertId;
        } else {
            userId = rows[0].id;
        }

        const payload = { id: userId, username: finalUsername, role: 'mahasiswa' };
        
        // Poin 4: Access Token & Refresh Token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, "RefreshSecretKey", { expiresIn: '7d' });

        res.json({
            message: "Login GitHub Berhasil",
            token: token,
            refreshToken: refreshToken,
            user: payload
        });
    } catch (error) {
        console.error("Auth Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Login Manual (Poin 4)
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: "User tidak ditemukan" });

        const user = rows[0];

        if (user.oauth_provider === 'manual') {
            const validPass = await bcrypt.compare(password, user.password);
            if (!validPass) return res.status(401).json({ message: "Password salah" });
        }

        const payload = { id: user.id, username: user.username, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
        
        res.json({ message: "Login Manual Berhasil", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/auth/logout', (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        blacklist.push(token);
        return res.json({ message: "Logout berhasil, token telah di-blacklist" });
    }
    res.status(400).json({ message: "Token tidak ditemukan" });
});

app.use('/api/pengaduan', gatewayAuth, proxy('http://localhost:8000', {
    proxyReqPathResolver: (req) => {
        return `/api/pengaduan${req.url}`;
    }
}));

app.listen(PORT, () => {
    console.log(`API Gateway & Auth Service running on http://localhost:${PORT}`);
});