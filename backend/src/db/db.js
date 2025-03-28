const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  position: String,
  city: String,
  email: String,
  password: String,
  profilePicture: { type: String, default: "" },
  experience: [Object],
  education: [Object],
  connections: { type: Array, default: [] },
  connectionRequests: { type: Array, default: [] },
  pendingRequests: { type: Array, default: [] },
});

const companySchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  industry: String,
  location: String,
  website: String,
  description: String,
});

const postSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    image: { type: String, default: "" },
    author: String,
    likes: { type: Array, default: [] },
    comments: [
      {
        user: String,
        text: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  }
);

const applicationSchema = new mongoose.Schema({
  username: String,
  email: String,
  phone: String,
  experience: [String],
  education: [String],
  skills: [String],
  projects: [String],
  certifications: [String],
  summary: String,
  appliedAt: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  type: String,
  salary: String,
  description: String,
  postedAt: { type: Date, default: Date.now },
  applications: [applicationSchema]
});

module.exports = {
  company: mongoose.model("Company", companySchema),
  user: mongoose.model("User", userSchema),
  post: mongoose.model("Post", postSchema),
  job: mongoose.model("Job", jobSchema),
};
