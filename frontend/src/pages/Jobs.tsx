import axios from "axios";
import { useState, useEffect } from "react";
import { FaBookmark, FaSearch, FaFilter, FaPlus } from "react-icons/fa";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  postedAt: string;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    salary: "",
    description: "",
  });

  // ✅ Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios("http://localhost:3000/jobs/getJobs");
        const data = await response.data;
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);


  const [filterType, setFilterType] = useState<string>("all"); // "all", "job", "internship"

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await axios("http://localhost:3000/jobs/getJobs");
        let data = response.data;
  
        // ✅ Apply filtering if a specific type is selected
        if (filterType !== "all") {
          data = data.filter((job: Job) => job.type.toLowerCase() === filterType);
        }
  
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchJobs();
  }, [filterType]); // ✅ Refetch when filter changes
  

  // ✅ Handle adding job to backend
  const handleAddJob = async () => {
    if (!newJob.title || !newJob.company || !newJob.location || !newJob.type || !newJob.salary || !newJob.description) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/jobs/addJob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      });

      if (!response.ok) throw new Error("Failed to add job");

      const addedJob = await response.json();
      setJobs((prev) => [...prev, addedJob.job]); // ✅ Update UI with new job
      setNewJob({ title: "", company: "", location: "", type: "", salary: "", description: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding job:", error);
      alert("Failed to add job");
    }
  };

  const [appliedJobs, setAppliedJobs] = useState<string[]>(() => {
    const savedJobs = localStorage.getItem("appliedJobs");
    return savedJobs ? JSON.parse(savedJobs) : [];
  });

  const handleApply = async (jobId: string) => {
    try {
      const response = await axios.post("http://localhost:3000/jobs/apply", {
        jobId,
      }, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
  
      const data = await response.data;
      if (!response) throw new Error(data.message);

      const updatedAppliedJobs = [...appliedJobs, jobId];
      setAppliedJobs(updatedAppliedJobs);
      localStorage.setItem("appliedJobs", JSON.stringify(updatedAppliedJobs));

      alert("Successfully applied for the job!");
    } catch (error) {
      alert("Failed to apply for job");
    }
  };
  

  return (
    <div className="max-w-4xl mx-auto">
      {/* 🔍 Search & Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center space-x-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* 🔄 Filter Buttons */}
        <button 
          onClick={() => setFilterType("all")} 
          className={`px-4 py-2 border rounded-lg ${filterType === "all" ? "bg-accent text-white" : "hover:bg-gray-50"}`}>
          All
        </button>

        <button 
          onClick={() => setFilterType("job")} 
          className={`px-4 py-2 border rounded-lg ${filterType === "job" ? "bg-accent text-white" : "hover:bg-gray-50"}`}>
          Jobs
        </button>

        <button 
          onClick={() => setFilterType("internship")} 
          className={`px-4 py-2 border rounded-lg ${filterType === "internship" ? "bg-accent text-white" : "hover:bg-gray-50"}`}>
          Internships
        </button>
      </div>


      {/* ➕ Add Job Button */}
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(true)} className="flex items-center bg-accent text-white px-4 py-2 rounded-lg hover:bg-dark transition-colors">
          <FaPlus className="mr-2" /> Add Job
        </button>
      </div>

      {/* 📝 Job Form */}
      {showForm && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          {["title", "company", "location", "type", "salary", "description"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={(newJob as any)[field]}
              onChange={(e) => setNewJob({ ...newJob, [field]: e.target.value })}
              className="w-full mb-2 p-2 border rounded-lg"
            />
          ))}
          <div className="flex justify-end space-x-2">
            <button onClick={() => setShowForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded-lg">Cancel</button>
            <button onClick={handleAddJob} className="bg-accent hover:bg-dark text-white px-4 py-2 rounded-lg">Add</button>
          </div>
        </div>
      )}

      {/* 📜 Job Listings */}
      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-dark">{job.title}</h2>
                  <p className="text-gray-600">{job.company}</p>
                  <p className="text-gray-500">{job.location} • {job.type}</p>
                  <p className="text-accent font-semibold mt-2">{job.salary}</p>
                </div>
                <button className="text-gray-400 hover:text-accent">
                  <FaBookmark className="text-xl" />
                </button>
              </div>
              <p className="text-gray-600 mt-4">{job.description}</p>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="text-sm text-gray-500">Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                {appliedJobs.includes(job._id) ? (
                <button className="bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed">
                  Applied
                </button>
              ) : (
                <button
                  onClick={() => handleApply(job._id)}
                  className="bg-accent hover:bg-dark text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Apply Now
                </button>
              )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
