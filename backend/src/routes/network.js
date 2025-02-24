const express = require("express");
const router = express.Router();
const User = require("../db/db").user;
const { VERIFYWITHJWT } = require("./auth");

/**
 * @route POST /network/send-request
 * @desc Send a connection request
 */
router.post("/send-request", VERIFYWITHJWT, async (req, res) => {
    const { recipientUsername } = req.body;
    const senderUsername = req.headers["user"];

    try {
        if (senderUsername === recipientUsername) {
            return res.status(400).json({ message: "You cannot connect with yourself" });
        }

        const recipient = await User.findOne({ username: recipientUsername });
        if (!recipient) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update recipient's pending requests
        await User.updateOne(
            { username: recipientUsername },
            { $addToSet: { pendingRequests: senderUsername } }
        );

        res.status(200).json({ message: "Connection request sent" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * @route POST /network/accept-request
 * @desc Accept a connection request
 */
router.post("/accept-request", VERIFYWITHJWT, async (req, res) => {
    const { requesterUsername } = req.body;
    const recipientUsername = req.headers["user"];

    try {
        const recipient = await User.findOne({ username: recipientUsername });
        if (!recipient || !recipient.pendingRequests.includes(requesterUsername)) {
            return res.status(400).json({ message: "No such connection request" });
        }

        // Add both users to each other's connections
        await User.updateOne(
            { username: recipientUsername },
            {
                $pull: { pendingRequests: requesterUsername },
                $addToSet: { connections: requesterUsername }
            }
        );

        await User.updateOne(
            { username: requesterUsername },
            { $addToSet: { connections: recipientUsername } }
        );

        res.status(200).json({ message: "Connection request accepted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * @route GET /network/connections
 * @desc Get user's connections
 */
router.get("/connections", VERIFYWITHJWT, async (req, res) => {
    const username = req.headers["user"];

    try {
        const user = await User.findOne({ username }).select("connections");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ connections: user.connections });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * @route GET /network/people-you-may-know
 * @desc Suggest people to connect with
 */
router.get("/people-you-may-know", VERIFYWITHJWT, async (req, res) => {
    const username = req.headers["user"];

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get all users except the current user and their connections
        const suggestions = await User.find({
            username: { $ne: username, $nin: user.connections }
        })
            .limit(10)
            .select("username name position city");

        res.status(200).json({ suggestions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
