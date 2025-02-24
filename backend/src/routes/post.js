const express = require('express');
const mongoose = require('mongoose');
const { VERIFYWITHJWT } = require('./auth'); // Corrected import path
const { post } = require('../db/db');

const router = express.Router();

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await post.find();
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new post
router.post('/', VERIFYWITHJWT, async (req, res) => {
  try {
    const { description, image } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const newpost = new post({
      description,
      image: image || '',
      author: req.headers["user"],
    });

    await newpost.save();

    // Populate author details before sending response
    const populatedpost = await post.findById(newpost._id)
      .populate('author', 'name title profileImage')
      .exec();

    res.status(201).json(populatedpost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Like/Unlike a post
router.post('/:postId/like', VERIFYWITHJWT, async (req, res) => {
  try {
    const temp_post = await post.findById(req.params.postId);
    console.log(temp_post)
    if (!temp_post) {
      return res.status(404).json({ message: 'post not found' });
    }

    const likeIndex = temp_post.likes.indexOf(req.headers["user"]);

    if (likeIndex === -1) {
      // Like the post
      temp_post.likes.push(req.headers["user"]);
    } else {
      // Unlike the post
      temp_post.likes.splice(likeIndex, 1);
    }

    await temp_post.save();
    res.json({ likes: temp_post.likes });
  } catch (error) {
    console.error('Error updating post likes:', error);
    res.status(500).json({ message: 'Error updating post likes' });
  }
});

// Add a comment to a post
router.post('/:postId/comment', VERIFYWITHJWT, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const temp_post = await post.findById(req.params.postId);
    
    if (!temp_post) {
      return res.status(404).json({ message: 'post not found' });
    }

    const newComment = {
      user: req.headers["user"],
      text,
      createdAt: new Date()
    };

    temp_post.comments.push(newComment);
    await temp_post.save();

    // // Populate user details for the new comment
    // const populatedpost = await post.findById(post._id)
    //   .populate('comments.user', 'name profileImage')
    //   .exec();

    // const addedComment = populatedpost.comments[populatedpost.comments.length - 1];
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Delete a post
router.delete('/:postId', VERIFYWITHJWT, async (req, res) => {
  try {
    const post = await post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'post not found' });
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== req.headers["user"].toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// Delete a comment
router.delete('/:postId/comments/:commentId', VERIFYWITHJWT, async (req, res) => {
  try {
    const post = await post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the author of the comment
    if (comment.user.toString() !== req.headers["user"].toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await post.save();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

module.exports = router;