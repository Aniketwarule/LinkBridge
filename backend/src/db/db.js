const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  position: String,
  city: String,
  email: String,
  password: String,
  experience: [Object],
  education: [Object],
});

const postSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  category: String,
  author: String,
  likes: Number,
  comments: Number,
  createdAt: Date,
  updatedAt: Date,
});

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  type: String,
  salary: String,
  description: String,
  postedAt: { type: Date, default: Date.now },
  applications: [{ username: String, email: String }] 
});

module.exports = {
  user: mongoose.model("User", userSchema),
  post: mongoose.model("Post", postSchema),
  job: mongoose.model("Job", jobSchema),
};