const express = require('express');
const mongoose = require('mongoose');
const { auth } = require('../routes/auth');

const router = express.Router();

// Post Schema
const postSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    image: { type: String, default: "" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

// Get all posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name title profileImage')
      .populate('comments.user', 'name profileImage')
      .exec();

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Create a new post
router.post('/', auth, async (req, res) => {
  try {
    const { description, image } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const newPost = new Post({
      description,
      image: image || '',
      author: req.user._id
    });

    await newPost.save();

    // Populate author details before sending response
    const populatedPost = await Post.findById(newPost._id)
      .populate('author', 'name title profileImage')
      .exec();

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Like/Unlike a post
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      // Like the post
      post.likes.push(req.user._id);
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    console.error('Error updating post likes:', error);
    res.status(500).json({ message: 'Error updating post likes' });
  }
});

// Add a comment to a post
router.post('/:postId/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user._id,
      text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Populate user details for the new comment
    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'name profileImage')
      .exec();

    const addedComment = populatedPost.comments[populatedPost.comments.length - 1];
    res.status(201).json(addedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Delete a post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// Delete a comment
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the author of the comment
    if (comment.user.toString() !== req.user._id.toString()) {
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