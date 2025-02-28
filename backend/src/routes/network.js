const express = require("express");
const router = express.Router();
const User = require("../db/db").user;
const { VERIFYWITHJWT } = require("./auth");
const mongoose = require("mongoose");

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

        const sender = await User.findOne({ username: senderUsername });
        
        // Check if they are already connected
        if (sender.connections.includes(recipientUsername)) {
            return res.status(400).json({ message: "You are already connected with this user" });
        }

        // Check if the user has already sent a connection request
        if (sender.pendingRequests.includes(recipientUsername)) {
            return res.status(400).json({ message: "You have already sent a connection request" });
        }
        
        // Check if there's a pending request from the other user
        if (sender.connectionRequests.includes(recipientUsername)) {
            return res.status(400).json({ message: "This user has already sent you a connection request. Please check your connection requests." });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            await User.updateOne(
                { username: recipientUsername }, 
                { $addToSet: { connectionRequests: senderUsername } },
                { session }
            );
            
            await User.updateOne(
                { username: senderUsername }, 
                { $addToSet: { pendingRequests: recipientUsername } },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ message: "Connection request sent" });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Transaction error:", error);
            res.status(500).json({ message: "Server error" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/accept-request", VERIFYWITHJWT, async (req, res) => {
    const { requesterUsername } = req.body;
    const recipientUsername = req.headers["user"];

    try {
        console.log("Requester:", requesterUsername, "Recipient:", recipientUsername);

        const requester = await User.findOne({ username: requesterUsername });
        const recipient = await User.findOne({ username: recipientUsername });

        if (!requester || !recipient) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!recipient.connectionRequests.includes(requesterUsername)) {
            return res.status(400).json({ message: "No such connection request" });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update requester: remove from pending, add to connections
            await User.updateOne(
                { username: requesterUsername },
                {
                    $pull: { pendingRequests: recipientUsername },
                    $addToSet: { connections: recipientUsername }
                },
                { session }
            );
            // Update recipient: remove from requests, add to connections
            await User.updateOne(
                { username: recipientUsername },
                {
                    $pull: { connectionRequests: requesterUsername },
                    $addToSet: { connections: requesterUsername }
                },
                { session }
            );
            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ 
                message: "Connection request accepted",
                requester: requesterUsername,
                recipient: recipientUsername
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Transaction error:", error);
            res.status(500).json({ message: "Server error during transaction" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

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

router.get("/pending-requests", VERIFYWITHJWT, async (req, res) => {
    const username = req.headers["user"];

    try {
        const user = await User.findOne({ username }).select("pendingRequests");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ pendingRequests: user.pendingRequests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/connection-requests", VERIFYWITHJWT, async (req, res) => {
    const username = req.headers["user"];

    try {
        const user = await User.findOne({ username }).select("connectionRequests");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ connectionRequests: user.connectionRequests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/delete-pending-request", VERIFYWITHJWT, async (req, res) => {
    const { recipientUsername } = req.body;
    const senderUsername = req.headers["user"];

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            await User.updateOne(
                { username: senderUsername }, 
                { $pull: { pendingRequests: recipientUsername } },
                { session }
            );
            
            await User.updateOne(
                { username: recipientUsername }, 
                { $pull: { connectionRequests: senderUsername } },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ message: "Pending request deleted" });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Transaction error:", error);
            res.status(500).json({ message: "Server error" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/delete-connection", VERIFYWITHJWT, async (req, res) => {
    const { connectionUsername } = req.body;
    const username = req.headers["user"];

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            await User.updateOne(
                { username }, 
                { $pull: { connections: connectionUsername } },
                { session }
            );
            
            await User.updateOne(
                { username: connectionUsername }, 
                { $pull: { connections: username } },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ 
                message: "Connection removed",
                user: username,
                removed: connectionUsername
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Transaction error:", error);
            res.status(500).json({ message: "Server error" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/people-you-may-know", VERIFYWITHJWT, async (req, res) => {
    const username = req.headers["user"];

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get users who are not in the user's connections, pending requests, or connection requests
        const suggestions = await User.find({
            username: { 
                $ne: username, 
                $nin: [...user.connections, ...user.pendingRequests, ...user.connectionRequests] 
            }
        })
            .limit(10)
            .select("username name position city")
            .lean();

        // Format the response to match the expected Connection interface
        const formattedSuggestions = suggestions.map(user => ({
            id: user._id,
            name: user.name || user.username,
            username: user.username,
            title: user.position || '',
            avatar: user.name ? user.name.charAt(0) : user.username.charAt(0),
            mutualConnections: 0 // You can calculate this if needed
        }));

        res.status(200).json({ suggestions: formattedSuggestions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;