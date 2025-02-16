const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const User = require('../db/db').user

const JWT_SECRET = 'Se3Cr3tK3y'

const VERIFYWITHJWT = async (req, res, next) => {
    try {
        console.log(req.headers.authorization)
        const token = req.headers.authorization.split(' ')[1]
        console.log(token)
        if (!token) {
            return res.status(401).json({ message: 'No token provided' })
        }
    
        const decoded = jwt.verify(token, JWT_SECRET)
        console.log(decoded)
        req.headers["user"] = decoded.id
        next()
    } catch (err) {
        console.error(err)
        res.status(401).json({ message: 'Invalid token' })
    }
}

router.get('/me', VERIFYWITHJWT, async (req, res) => {
    console.log(req.headers["user"])
    
    const user = await User.findOne({ username: req.headers["user"] });
    if (!user) {
      res.status(403).json({ msg: "User doesnt exist" })
      return
    }
    res.json({
      username: user.username
    })
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body
    // console.log(username, password)
    if (!username || !password) {
        return res.status(400).json({ message: 'username and password are required' })
    }
    try {
        const user = await User.findOne({
            username: username,
            password: password,
        })
        // console.log(user)
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' })
        }
        if (!user.password) {
            return res.status(401).json({ message: 'Invalid username or password' })
        }
        const token = jwt.sign({ id: user.username}, JWT_SECRET)
        res.status(200).json({ token })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

router.post('/register', async (req, res) => {
    const { username, password, email } = req.body
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'username, password and email are required' })
    }
    try {
        const user = await User.findOne({ username })
        if (user) {
            return res.status(400).json({ message: 'User already exists' })
        }
        const newUser = new User({ username, password, email })
        await newUser.save()
        const token = jwt.sign({ id: newUser.username }, JWT_SECRET)
        res.status(200).json({ token })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
})

module.exports = {
    router,
    VERIFYWITHJWT
};