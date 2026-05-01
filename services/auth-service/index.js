const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const proxy = require('express-http-proxy');
const rateLimit = require('express-rate-limit');

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const blacklist = [];

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: { message: "Terlalu banyak permintaan (Rate limit 60/menit), coba lagi nanti." }
});
app.use(limiter);

const gatewayAuth = (req, res, next) => {
    if (req.method === 'GET') {
        return next();
    }

    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token || blacklist.includes(token)) {
        return res.status(401).json({ message: "Akses ditolak: Gateway memerlukan token valid" });
    }

    try {
        const decoded = jwt.verify(token, "rahasia_jwt_123"); 
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

        const payload = {
            id: userRes.data.id,
            username: userRes.data.login,
            role: 'mahasiswa' 
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.json({
            message: "Login Berhasil",
            token: token,
            user: payload
        });
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