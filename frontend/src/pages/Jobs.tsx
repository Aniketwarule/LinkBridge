import axios from "axios";
import { useState, useEffect } from "react";
import { FaBookmark, FaSearch} from "react-icons/fa";
import { BaseUrl } from "../App";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  postedAt: string;
  applications: { username: string, email: string }[];
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all"); // "all", "job", "internship"
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  // Get current user information on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {

        const username = localStorage.getItem("username");
        setCurrentUser(username);
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    }
  }, []);

  // Fetch jobs and check if the current user has applied to them
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BaseUrl}/jobs/getJobs`, {
          headers: { Authorization: token }
        });
  
        let data = response.data;
        
        // Apply filtering only if needed
        if (filterType !== "all") {
          data = data.filter((job: Job) => job.type.toLowerCase() === filterType);
        }
  
        setJobs(data);
        
        // Check which jobs the current user has applied to
        if (currentUser) {
          // Option 1: Using local storage with user-specific key
          const userAppliedJobsKey = `appliedJobs_${currentUser}`;
          const savedJobs = localStorage.getItem(userAppliedJobsKey);
          if (savedJobs) {
            setAppliedJobs(JSON.parse(savedJobs));
          } else {
            setAppliedJobs([]);
          }
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchJobs();
  }, [filterType, currentUser]);

  const handleApply = async (jobId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BaseUrl}/jobs/apply`, {
        jobId,
      }, {
        headers: {
          Authorization: token,
        },
      });
  
      const data = await response.data;
      if (!response) throw new Error(data.message);

      // Update the applied jobs list with user-specific key
      if (currentUser) {
        const userAppliedJobsKey = `appliedJobs_${currentUser}`;
        const updatedAppliedJobs = [...appliedJobs, jobId];
        setAppliedJobs(updatedAppliedJobs);
        localStorage.setItem(userAppliedJobsKey, JSON.stringify(updatedAppliedJobs));
      }

      alert("Successfully applied for the job!");
    } catch (error) {
      alert("Failed to apply for job");
    }
  };
  
  // Check if user has applied to a specific job
  const hasAppliedToJob = (jobId: string) => {
    return appliedJobs.includes(jobId);
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
                {hasAppliedToJob(job._id) ? (
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