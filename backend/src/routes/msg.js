const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { USERTOKEN } = require("./auth");

// Message Schema
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

// Get all conversations for current user
router.get('/conversations', USERTOKEN, async (req, res) => {
  try {
    const username = req.headers["user"];
    
    // Find all unique conversations where the user is either sender or recipient
    const messages = await Message.find({
      $or: [{ sender: username }, { recipient: username }]
    }).sort({ createdAt: -1 });
    
    // Extract unique usernames the current user has chatted with
    const conversations = [];
    const uniqueUsers = new Set();
    
    messages.forEach(msg => {
      const otherUser = msg.sender === username ? msg.recipient : msg.sender;
      if (!uniqueUsers.has(otherUser)) {
        uniqueUsers.add(otherUser);
        conversations.push({
          username: otherUser,
          lastMessage: msg.content,
          timestamp: msg.createdAt,
          unread: msg.recipient === username && !msg.read ? true : false
        });
      }
    });
    
    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between two users
router.get('/messages/:otherUser', USERTOKEN, async (req, res) => {
  try {
    const username = req.headers["user"];
    const otherUser = req.params.otherUser;
    
    // Find all messages between these two users
    const messages = await Message.find({
      $or: [
        { sender: username, recipient: otherUser },
        { sender: otherUser, recipient: username }
      ]
    }).sort({ createdAt: 1 });
    
    // Mark all unread messages as read
    await Message.updateMany(
      { sender: otherUser, recipient: username, read: false },
      { $set: { read: true } }
    );
    
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a new message
router.post('/send', USERTOKEN, async (req, res) => {
  try {
    const { recipientUsername, content } = req.body;
    if (!recipientUsername || !content) {
      return res.status(400).json({ message: 'Recipient and message content are required' });
    }
    
    const newMessage = new Message({
      sender: req.headers["user"],
      recipient: recipientUsername,
      content: content
    });
    
    await newMessage.save();
    
    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    console.log('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count
router.get('/unread-count', USERTOKEN, async (req, res) => {
  try {
    const username = req.headers["user"];
    
    const count = await Message.countDocuments({
      recipient: username,
      read: false
    });
    
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;