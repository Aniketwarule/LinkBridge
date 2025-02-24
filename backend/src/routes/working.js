const express = require("express");
const User = require("../db/db").user;
const router = express.Router();
const middleware = require("./auth");


router.get('/getUser', middleware.VERIFYWITHJWT, async (req, res) => {
    const userdata = await User.findOne({ username: req.headers["user"] });
    if (!userdata) {
      res.status(403).json({ msg: "User doesnt exist" })
      return
    }
    res.json({
      userdata
    })
});

// const userSchema = new mongoose.Schema({
//   username: String,
//   email: String,
//   password: String,
//   experience: [String],
//   education: [String],
// });

router.post('/deleteAccount', middleware.VERIFYWITHJWT, async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        const user = await User.findOneAndDelete({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/addExperience', middleware.VERIFYWITHJWT, async (req, res) => {
    try {
        // const { username } = req.headers["user"];
        const {  username, experience } = req.body;
        if (!username || !experience) {
            return res.status(400).json({ message: "username and experience are required" });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.experience.push(JSON.parse(experience));
        await user.save();
        res.status(200).json({ message: "Experience added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/deleteExperience', middleware.VERIFYWITHJWT, async (req, res) => {
    try {
        const { username, index } = req.body;
        if (!username || index === undefined) {
            return res.status(400).json({ message: "Username and index are required" });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (index < 0 || index >= user.experience.length) {
            return res.status(400).json({ message: "Invalid index" });
        }
        user.experience.splice(index, 1);
        await user.save();

        res.status(200).json({ message: "Experience deleted successfully" });
    } catch (error) {
        console.error("Error deleting experience:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/addEducation', middleware.VERIFYWITHJWT, async (req, res) => {
    try {
        // const { username } = req.headers["user"];
        const { username, education } = req.body;
        console.log(username, education);
        if (!username || !education) {
            return res.status(400).json({ message: "username and education are required" });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.education.push(JSON.parse(education));
        await user.save();
        res.status(200).json({ message: "Education added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/deleteEducation', middleware.VERIFYWITHJWT, async (req, res) => {
    try {
        const { username, index } = req.body;
        if (!username || index === undefined) {
            return res.status(400).json({ message: "Username and index are required" });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (index < 0 || index >= user.education.length) {
            return res.status(400).json({ message: "Invalid index" });
        }
        user.education.splice(index, 1);
        await user.save();

        res.status(200).json({ message: "Education deleted successfully" });
    } catch (error) {
        console.error("Error deleting education:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.post('/updateProfile', middleware.VERIFYWITHJWT, async (req, res) => {
    try {
        const { username, name, position, city } = req.body;
        console.log(username, name, position, city);
        const updatedUser = await User.findOneAndUpdate(
            { username },
            { name, position, city },
            { new: true }
        );
        console.log(updatedUser);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
});

router.post('/changePassword', middleware.VERIFYWITHJWT, async (req, res) => {``
    try {
        const { username, currentPassword, newPassword } = req.body;

        if (!username || !currentPassword || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password (without hashing)
        if (user.password !== currentPassword) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Update the password directly
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;