const express = require("express");
const router = express.Router();
const User = require("../db/db").user;
const { VERIFYWITHJWT } = require("./auth");
const { default: mongoose } = require("mongoose");

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

        // check if the user has already sent a connection request
        const existingPendingRequest = await User.findOne({ username: senderUsername }).select("pendingRequests");
        console.log(existingPendingRequest);
        if (existingPendingRequest.pendingRequests.includes(recipientUsername)) {
            return res.status(400).json({ message: "You have already sent a connection request" });
        }
        // check if the user has already accepted a connection request
        const existingConnectionRequest = await User.findOne({ username: recipientUsername }).select("connectionRequests");
        if (existingConnectionRequest.connectionRequests.includes(senderUsername)) {
            return res.status(400).json({ message: "You have already accepted a connection request" });
        }


        await User.updateOne({ username: recipientUsername }, { $push: { connectionRequests: senderUsername } });
        await User.updateOne({ username: senderUsername }, { $push: { pendingRequests: recipientUsername } });

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
        console.log("Requester:", requesterUsername, "Recipient:", recipientUsername);

        const requester = await User.findOne({ username: requesterUsername });
        const recipient = await User.findOne({ username: recipientUsername });

        if (!requester || !recipient) {
            return res.status(400).json({ message: "Invalid usernames" });
        }

        if (!recipient.connectionRequests.includes(requesterUsername)) {
            return res.status(400).json({ message: "No such connection request" });
        }


        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            await User.updateOne(
                { username: requesterUsername },
                {
                    $pull: { pendingRequests: recipientUsername },
                    $addToSet: { connections: recipientUsername }
                },
                { session }
            );

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

            res.status(200).json({ message: "Connection request accepted" });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Transaction error:", error);
            res.status(500).json({ message: "Server error" });
        }

        // res.status(200).json({ message: "Connection request accepted" });
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
 * @route GET /network/pending-requests
 * @desc Get pending requests sent by the user
 */
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

/**
 * @route GET /network/connection-requests
 * @desc Get connection requests received by the user
 */
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

/**
 * @route DELETE /network/delete-pending-request
 * @desc Delete a pending request sent by the user
 */
router.delete("/delete-pending-request", VERIFYWITHJWT, async (req, res) => {
    const { recipientUsername } = req.body;
    const senderUsername = req.headers["user"];

    try {
        await User.updateOne({ username: senderUsername }, { $pull: { pendingRequests: recipientUsername } });
        await User.updateOne({ username: recipientUsername }, { $pull: { connectionRequests: senderUsername } });

        res.status(200).json({ message: "Pending request deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * @route DELETE /network/delete-connection
 * @desc Delete a connection
 */
router.delete("/delete-connection", VERIFYWITHJWT, async (req, res) => {
    const { connectionUsername } = req.body;
    const username = req.headers["user"];

    try {
        await User.updateOne({ username }, { $pull: { connections: connectionUsername } });
        await User.updateOne({ username: connectionUsername }, { $pull: { connections: username } });

        res.status(200).json({ message: "Connection removed" });
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
