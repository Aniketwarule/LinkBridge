const express = require("express");
const router = express.Router();
const { post: Post } = require("../db/db");
const { VERIFYWITHJWT } = require("./auth");

// **Create a new post**
router.post("/create", VERIFYWITHJWT, async (req, res) => {
    try {
        const { title, description, image, category } = req.body;
        if (!title || !description || !category) {
            return res.status(400).json({ message: "Title, description, and category are required" });
        }

        const newPost = new Post({
            title,
            description,
            image: image || "",
            category,
            author: req.user.id, // Using JWT to get user ID
            likes: 0,
            comments: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await newPost.save();
        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/all", async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        res.status(200).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/:id", VERIFYWITHJWT, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Only the author can update the post
        if (post.author !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to update this post" });
        }

        const { title, description, image, category } = req.body;
        post.title = title || post.title;
        post.description = description || post.description;
        post.image = image || post.image;
        post.category = category || post.category;
        post.updatedAt = new Date();

        await post.save();
        res.status(200).json({ message: "Post updated successfully", post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/:id", VERIFYWITHJWT, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.author !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to delete this post" });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
