const express = require("express");
const { job, user } = require("../db/db");
const { USERTOKEN, COMPANYTOKEN } = require("./auth");

const router = express.Router();

router.post('/apply', USERTOKEN, async (req, res) => {
  try {
    const { 
      jobId,
      email,
      phone,
      experience,
      education,
      skills,
      projects,
      certifications,
      summary
    } = req.body;
    
    const username = req.headers["user"];

    // Find the job
    const jobData = await job.findById(jobId);
    if (!jobData) return res.status(404).json({ message: "Job not found" });

    // Find the user applying
    const userData = await user.findOne({ username });
    if (!userData) return res.status(404).json({ message: "User not found" });

    // Check if the user already applied
    if (jobData.applications.some(applicant => applicant.username === username)) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    // Add user to applications with all the additional details
    jobData.applications.push({
      username: userData.username,
      email: email || userData.email,
      phone,
      experience,
      education,
      skills,
      projects,
      certifications,
      summary
    });
    
    await jobData.save();

    res.status(200).json({ message: "Applied successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create a New Job
router.post("/addJob", COMPANYTOKEN, async (req, res) => {
  try {
    const { title, company, location, type, salary, description } = req.body;

    if (!title || !company || !location || !type || !salary || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newJob = new job({
      title,
      company,
      location,
      type,
      salary,
      description,
    });

    await newJob.save();
    res.status(201).json({ message: "Job added successfully", job: newJob });
  } catch (error) {
    console.error("Error adding job:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get All Jobs
router.get("/getJobs", USERTOKEN, async (req, res) => {
  try {
    const jobs = await job.find().sort({ postedAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/company/jobs", COMPANYTOKEN, async (req, res) => {
  try {
    const companyName = req.headers["user"];

    if (!companyName) {
      return res.status(400).json({ message: "Company name is required" });
    }

    const jobs = await job.find({ company: companyName }).sort({ postedAt: -1 });

    if (!jobs.length) {
      return res.status(200).json([]);
    }

    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching company jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/company/applicants/:jobId", COMPANYTOKEN, async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobData = await job.findById(jobId);
    if (!jobData) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(jobData.applications);
  } catch (error) {
    console.error("Error fetching", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;