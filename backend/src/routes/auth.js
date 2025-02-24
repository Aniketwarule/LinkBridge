const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../db/db').user;
const Company = require('../db/db').company; // ✅ Fix: Import Company model

const JWT_SECRET = 'Se3Cr3tK3y';

const VERIFYWITHJWT = async (req, res, next) => {
    try {
        // console.log(req.headers.authorization);
        const token = req.headers.authorization?.split(' ')[1]; // ✅ Fix: Optional chaining to prevent undefined error
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ username: decoded.id });
        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.headers["username"] = user;
        req.headers["user"] = decoded.id;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Invalid token' });
    }
};

router.get('/me', VERIFYWITHJWT, async (req, res) => {

    const user = await User.findOne({ username: req.headers["user"] });
    if (!user) {
        return res.status(403).json({ msg: "User doesn't exist" });
    }
    res.json({ username: user.username });
});

// ✅ Fix: Make sure `identifier` is used for consistency
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body; // ✅ Fix: Change `username` to `identifier`
    
    if (!identifier || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const user = await User.findOne({ username: identifier, password }); // ✅ Fix: Match field to `identifier`
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ id: user.username, type: "user" }, JWT_SECRET);
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Fix: Company Login (Use `identifier` instead of `name`)
router.post('/company/login', async (req, res) => {
    const { identifier, password } = req.body; // ✅ Fix: Use `identifier`

    if (!identifier || !password) {
        return res.status(400).json({ message: 'Company name and password are required' });
    }
    try {
        const company = await Company.findOne({ name: identifier, password }); // ✅ Fix: Match field
        if (!company) {
            return res.status(401).json({ message: 'Invalid company name or password' });
        }
        const token = jwt.sign({ id: company.name, type: "company" }, JWT_SECRET);
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Fix: Company Registration
router.post('/company/register', async (req, res) => {
    const { name, password, email, industry, location, website, description } = req.body;
    
    if (!name || !password || !email) {
        return res.status(400).json({ message: 'Company name, password, and email are required' });
    }
    try {
        const existingCompany = await Company.findOne({ name });
        if (existingCompany) {
            return res.status(400).json({ message: 'Company already exists' });
        }
        const newCompany = new Company({
            name,
            password,
            email,
            industry,
            location,
            website,
            description
        });
        await newCompany.save();
        const token = jwt.sign({ id: newCompany.name, type: "company" }, JWT_SECRET);
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = {
    router,
    VERIFYWITHJWT
};
