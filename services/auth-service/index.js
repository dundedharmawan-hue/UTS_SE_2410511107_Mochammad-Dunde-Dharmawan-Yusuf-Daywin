const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

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
            role: 'mahasiswa' // Default role sesuai studi kasus
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

const blacklist = [];

app.post('/auth/logout', (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        blacklist.push(token);
        return res.json({ message: "Logout berhasil, token telah di-blacklist" });
    }
    res.status(400).json({ message: "Token tidak ditemukan" });
});

app.listen(PORT, () => {
    console.log(`Auth Service running on http://localhost:${PORT}`);
});