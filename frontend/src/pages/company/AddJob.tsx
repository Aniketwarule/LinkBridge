import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { BaseUrl } from "../../App";

const AddJob = () => {
  const [companyName, setCompanyName] = useState("");
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Job",
    salary: "",
    description: "",
  });

  // Load company name on component mount
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
          setJobForm(prev => ({ ...prev, company: response.data.company }));
        }
      } catch (error) {
        console.error("Error fetching company profile:", error);
      }
    };
    
    fetchCompanyProfile();
  }, []);

  // ✅ Handle form submission & update job list
  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company || !jobForm.location || !jobForm.type || !jobForm.salary || !jobForm.description) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await axios.post(`${BaseUrl}/jobs/addJob`, jobForm, {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
      });

      if (response.status === 201) {
        alert("Job posted successfully!");
        
        // Update company name if returned from API
        if (response.data.company) {
          setCompanyName(response.data.company);
        }

        // ✅ Reset form after submission
        setJobForm({
          title: "",
          company: response.data.company || companyName,
          location: "",
          type: "Job",
          salary: "",
          description: "",
        });
      }
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to post job");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Display company name at the top */}
        {companyName && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium text-gray-700">
              Posting for : <span className="text-accent">{companyName}</span>
            </h2>
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Post a New Job</h1>
        
        <form onSubmit={handleAddJob} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
            <input type="text" name="title" value={jobForm.title} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-accent" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <input 
              type="text" 
              name="company" 
              value={jobForm.company} 
              onChange={handleChange} 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-accent" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input type="text" name="location" value={jobForm.location} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-accent" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
              <select name="type" value={jobForm.type} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-accent">
                <option value="Job">Job</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
            <input type="text" name="salary" value={jobForm.salary} onChange={handleChange} placeholder="e.g., $80,000 - $100,000" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-accent" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea name="description" value={jobForm.description} onChange={handleChange} rows={4} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-accent" required />
          </div>

          <button type="submit" className="w-full bg-accent hover:bg-dark text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center">
            <FaPlus className="mr-2" /> Post Job
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddJob;