import axios from "axios";
import { useState, useEffect } from "react";
import { BaseUrl } from "../App";
import { FaBriefcase, FaBuilding, FaMapMarkerAlt, FaRegCalendarAlt, FaMoneyBillWave } from "react-icons/fa";

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

interface AppliedJobsProps {
  username: string;
}

const AppliedJobs = ({ username }: AppliedJobsProps) => {
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [jobDetails, setJobDetails] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get applied job IDs from localStorage
        const userAppliedJobsKey = `appliedJobs_${username}`;
        const savedJobs = localStorage.getItem(userAppliedJobsKey);
        const jobIds = savedJobs ? JSON.parse(savedJobs) : [];
        setAppliedJobs(jobIds);
        
        if (jobIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch all jobs from the API
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BaseUrl}/jobs/getJobs`, {
          headers: { Authorization: token }
        });
        
        if (!response.data) {
          throw new Error("Failed to fetch jobs");
        }
        
        // Filter only the jobs that the user has applied to
        const appliedJobDetails = response.data.filter((job: Job) => 
          jobIds.includes(job._id)
        );
        
        setJobDetails(appliedJobDetails);
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
        setError("Failed to load your applied jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchAppliedJobs();
    }
  }, [username]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
        <span className="ml-2">Loading your applications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg text-red-700 dark:text-red-200">
        {error}
      </div>
    );
  }

  if (appliedJobs.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <FaBriefcase className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-3" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          You haven't applied to any jobs yet.
        </p>
        <a 
          href="/jobs" 
          className="text-accent hover:underline"
        >
          Browse available jobs
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
        You've applied to {jobDetails.length} {jobDetails.length === 1 ? 'job' : 'jobs'}
      </h3>
      
      {jobDetails.map((job) => (
        <div 
          key={job._id} 
          className="bg-white dark:bg-gray-700 p-5 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {job.title}
            </h4>
            <span className="px-3 py-1 text-xs rounded-full bg-accent text-white">
              {job.type}
            </span>
          </div>
          
          <div className="space-y-2 mt-3">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FaBuilding className="mr-2" />
              <span>{job.company}</span>
            </div>
            
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FaMapMarkerAlt className="mr-2" />
              <span>{job.location}</span>
            </div>
            
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FaMoneyBillWave className="mr-2" />
              <span className="text-accent font-medium">{job.salary}</span>
            </div>
            
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <FaRegCalendarAlt className="mr-2" />
              <span>Applied on: {formatDate(job.postedAt)}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
              {job.description}
            </p>
            
            <div className="mt-3 text-right">
              <button className="text-accent hover:underline text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppliedJobs;