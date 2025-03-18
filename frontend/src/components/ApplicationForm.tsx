import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import { BaseUrl } from "../App";

interface ApplicationFormProps {
  jobId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ApplicationForm = ({ jobId, onClose, onSuccess }: ApplicationFormProps) => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    experience: "",
    education: "",
    skills: "",
    projects: "",
    certifications: "",
    summary: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${BaseUrl}/jobs/apply`, 
        {
          jobId,
          ...formData
        },
        {
          headers: {
            Authorization: localStorage.getItem("token")
          }
        }
      );

      if (response.status === 200) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Complete Your Application</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <FaTimes className="text-xl" />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="(123) 456-7890"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Experience *</label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent h-24"
                placeholder="List your work experience"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Education *</label>
              <textarea
                name="education"
                value={formData.education}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent h-24"
                placeholder="List your educational background"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Skills *</label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent h-24"
                placeholder="List your relevant skills"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Projects</label>
              <textarea
                name="projects"
                value={formData.projects}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent h-24"
                placeholder="Describe any relevant projects"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Certifications</label>
              <textarea
                name="certifications"
                value={formData.certifications}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent h-24"
                placeholder="List any certifications you have"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Professional Summary *</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent h-24"
                placeholder="Brief professional summary"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded shadow-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-accent hover:bg-dark text-white rounded shadow-sm disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;