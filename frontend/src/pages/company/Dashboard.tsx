import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaUser, FaTimes, FaDownload, FaExternalLinkAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import { BaseUrl } from "../../App";

interface Application {
  username: string;
  email: string;
  phone: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
  certifications: string;
  summary: string;
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
  applications: Application[];
}

const Dashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [showApplicantDetails, setShowApplicantDetails] = useState(false);
  const [stats, setStats] = useState({
    totalApplicants: 0,
    averageApplicantsPerJob: 0
  });

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const response = await axios.get(`${BaseUrl}/auth/companyprofile`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        
        if (response.data && response.data.company) {
          setCompanyName(response.data.company);
        }
      } catch (error) {
        console.error("Error fetching company profile:", error);
        setError("Failed to load company profile");
      }
    };
    
    fetchCompanyProfile();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BaseUrl}/jobs/company/jobs`, {
          headers: { Authorization: localStorage.getItem("token") },
        });
        setJobs(response.data);
        
        // Calculate stats from jobs data
        if (response.data.length > 0) {
          const totalApplicants = response.data.reduce(
            (sum: number, job: Job) => sum + (job.applications?.length || 0), 
            0
          );
          
          setStats({
            totalApplicants,
            averageApplicantsPerJob: totalApplicants / response.data.length
          });
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const getApplicants = async (job: Job) => {
    try {
      const response = await axios.get(`${BaseUrl}/jobs/company/applicants/${job._id}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });

      if (response.data) {
        setSelectedJob(job);
        setApplicants(response.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setError("Failed to load applicants");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
    setApplicants([]);
  };

  const handleViewApplicantDetails = (applicant: Application) => {
    setSelectedApplicant(applicant);
    setShowApplicantDetails(true);
  };

  const handleCloseApplicantDetails = () => {
    setSelectedApplicant(null);
    setShowApplicantDetails(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{companyName} Dashboard</h1>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 p-4 bg-red-50 dark:bg-red-900 rounded-lg">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-primary bg-opacity-10 dark:bg-opacity-20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Active Jobs</h3>
                <p className="text-3xl font-bold text-accent">{jobs.length}</p>
              </div>
              <div className="bg-green-500 bg-opacity-10 dark:bg-opacity-20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Total Applicants</h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalApplicants}</p>
              </div>
              <div className="bg-blue-500 bg-opacity-10 dark:bg-opacity-20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Avg. Applicants/Job</h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.averageApplicantsPerJob.toFixed(1)}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Posted Jobs</h2>
        <Link 
          to="/company/addjob" 
          className="bg-accent hover:bg-dark text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <FaPlus className="mr-2" />
          Post New Job
        </Link>
      </div>

      {jobs.length === 0 && !loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't posted any jobs yet.</p>
          <Link 
            to="/company/addjob" 
            className="bg-accent hover:bg-dark text-white px-6 py-3 rounded-lg inline-flex items-center transition-colors"
          >
            <FaPlus className="mr-2" />
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{job.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{job.location} • {job.type}</p>
                  <p className="text-accent">{job.salary}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Posted on {formatDate(job.postedAt)}</p>
                </div>
                <div className="flex items-center">
                  <span className="bg-accent bg-opacity-20 text-accent dark:text-accent dark:bg-opacity-30 px-3 py-1 rounded-full font-medium">
                    {job.applications?.length || 0} Applicants
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button
                  onClick={() => getApplicants(job)}
                  className="bg-accent hover:bg-dark text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <FaUser className="mr-2" />
                  View Applicants
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applicants Modal */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Applicants for {selectedJob.title}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="mt-4">
              {applicants.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {applicants.map((applicant, index) => (
                    <div key={index} className="py-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3 mr-4">
                          <FaUser className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{applicant.username}</p>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <FaEnvelope className="mr-1" /> {applicant.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <FaPhone className="mr-1" /> {applicant.phone}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewApplicantDetails(applicant)}
                        className="bg-accent hover:bg-dark text-white px-3 py-2 rounded-lg flex items-center transition-colors"
                      >
                        <FaExternalLinkAlt className="mr-2" />
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">No applicants yet for this position.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Applicant Details Modal */}
      {showApplicantDetails && selectedApplicant && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Application Details
              </h2>
              <button 
                onClick={handleCloseApplicantDetails}
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{selectedApplicant.username}</h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mt-1">
                    <FaEnvelope className="mr-2" /> {selectedApplicant.email}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mt-1">
                    <FaPhone className="mr-2" /> {selectedApplicant.phone}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Professional Summary</h3>
                <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedApplicant.summary}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Experience</h3>
                <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg whitespace-pre-line">{selectedApplicant.experience}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Education</h3>
                <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg whitespace-pre-line">{selectedApplicant.education}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Skills</h3>
                <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg whitespace-pre-line">{selectedApplicant.skills}</p>
              </div>
              
              {selectedApplicant.projects && (
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Projects</h3>
                  <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg whitespace-pre-line">{selectedApplicant.projects}</p>
                </div>
              )}
              
              {selectedApplicant.certifications && (
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Certifications</h3>
                  <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg whitespace-pre-line">{selectedApplicant.certifications}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCloseApplicantDetails}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded shadow-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;