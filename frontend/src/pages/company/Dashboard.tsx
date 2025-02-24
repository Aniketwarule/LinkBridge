import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaUser, FaTimes } from "react-icons/fa";

interface Applicant {
  _id: string;
  username: string;
  email: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  postedAt: string;
  applicants: Applicant[];
}

const Dashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/jobs/company/jobs", {
          headers: { Authorization: localStorage.getItem("token") },
        });
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const getApplicants = async (job: Job) => {
    try {
      const response = await axios.get(`http://localhost:3000/jobs/company/applicants/${job._id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });

      console.log(response.data);
      if (response.data) {
        setSelectedJob(job);
        setApplicants(response.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
    setApplicants([]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Company Dashboard</h1>

        {loading ? (
          <p>Loading jobs...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-primary bg-opacity-20 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Active Jobs</h3>
                <p className="text-3xl font-bold text-accent">{jobs.length}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Posted Jobs</h2>
        <Link to="/company/addjob" className="bg-accent hover:bg-dark text-white px-4 py-2 rounded-lg flex items-center">
          <FaPlus className="mr-2" />
          Post New Job
        </Link>
      </div>

      <div className="space-y-6">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-50"
            onClick={() => getApplicants(job)} 
          >
            <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
            <p className="text-gray-600">{job.location} • {job.type}</p>
            <p className="text-accent font-medium">{job.salary}</p>
            <p className="text-sm text-gray-500 mt-2">Posted on {new Date(job.postedAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      {/* Modal for Applicants */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Applicants for {selectedJob?.title}</h2>
              <button onClick={handleCloseModal} className="text-red-500 text-xl">
                <FaTimes />
              </button>
            </div>

            <div className="mt-4">
              {applicants.length > 0 ? (
                <ul>
                  {applicants.map((applicant) => (
                    <li key={applicant._id} className="border-b py-2 flex items-center">
                      <FaUser className="text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium">{applicant.username}</p>
                        <p className="text-sm text-gray-500">{applicant.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No applicants yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end w-full mt-6">
        <button onClick={() => localStorage.removeItem("token")} className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
