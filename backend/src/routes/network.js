const express = require("express");
const router = express.Router();
const User = require("../db/db");
const Message = require("../db/db");
const authMiddleware = require("../middleware/auth");

// Send a connection request
router.post("/sendrequest", authMiddleware, async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent duplicate requests
    if (receiver.connectionRequests.includes(senderId)) {
      return res.status(400).json({ message: "Connection request already sent" });
    }

    receiver.connectionRequests.push(senderId);
    await receiver.save();

    res.status(200).json({ message: "Connection request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending connection request", error });
  }
});

// Accept a connection request
router.post("/acceptrequest", authMiddleware, async (req, res) => {
  const { userId, senderId } = req.body;

  try {
    const user = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!user || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove request from pending list
    user.connectionRequests = user.connectionRequests.filter((id) => id.toString() !== senderId);

    // Add each other as connections
    user.connections.push(senderId);
    sender.connections.push(userId);

    await user.save();
    await sender.save();

    res.status(200).json({ message: "Connection accepted" });
  } catch (error) {
    res.status(500).json({ message: "Error accepting connection", error });
  }
});

// Get user connections
router.get("/connections/:userId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("connections", "name position");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ connections: user.connections });
  } catch (error) {
    res.status(500).json({ message: "Error fetching connections", error });
  }
});

// Send a message
router.post("/sendmessage", authMiddleware, async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    await message.save();
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
  }
});

// Get messages between two users
router.get("/messages/:userId/:contactId", authMiddleware, async (req, res) => {
  const { userId, contactId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: contactId },
        { sender: contactId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
});

module.exports = router;
