import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaGraduationCap, FaBriefcase, FaCamera, FaCog } from 'react-icons/fa';
import { Plus } from 'lucide-react';
import Settings from '../components/Settings';
import { BaseUrl } from '../App';

interface Education {
  degree: string;
  school: string;
  year: string;
}

interface Experience {
  title: string;
  company: string;
  from: string;
  to: string;
}

interface User {
  username?: string;
  name?: string;
  position?: string;
  city?: string;
  education?: Education[];
  experience?: Experience[];
}

interface ProfileResponse {
  userdata: {
    education: Education[];
    experience: Experience[];
  };
}

const Profile = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<User>({});
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [showEduForm, setShowEduForm] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [newEducation, setNewEducation] = useState<Education>({ degree: '', school: '', year: '' });
  const [newExperience, setNewExperience] = useState<Experience>({ title: '', company: '', from: '', to: '' });

  const loadProfile = async () => {
    try {
      const response = await axios.get<ProfileResponse>(`${BaseUrl}/working/getUser`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      if (response.data) {
        console.log(response.data);
        setUser(response.data.userdata);
        setEducation(response.data.userdata.education);
        setExperience(response.data.userdata.experience);
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAddEducation = async () => {
    if (newEducation.degree && newEducation.school && newEducation.year) {
      try {
        const response = await axios.post(`${BaseUrl}/working/addEducation`, {
          username: user.username,
          education: JSON.stringify(newEducation),
        }, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        
        if (response.data) {
          setEducation(prev => [...prev, newEducation]);
          setNewEducation({ degree: '', school: '', year: '' });
          setShowEduForm(false);
        }
      } catch (e) {
        console.error('Failed to add education:', e);
        alert('Failed to add education');
      }
    } else {
      alert('Please fill all the fields');
    }
  };

  const handleAddExperience = async () => {
    if (newExperience.title && newExperience.company && newExperience.from && newExperience.to) {
      try {
        const response = await axios.post(`${BaseUrl}/working/addExperience`, {
          username: user.username,
          experience: JSON.stringify(newExperience),
        }, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        
        if (response.data) {
          setExperience(prev => [...prev, newExperience]);
          setNewExperience({ title: '', company: '', from: '', to: '' });
          setShowExpForm(false);
        }
      } catch (e) {
        console.error('Failed to add experience:', e);
        alert('Failed to add experience');
      }
    } else {
      alert('Please fill all the fields');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative mb-8">
          <div className="h-32 bg-gradient-to-r from-primary to-accent rounded-t-lg"></div>
          <div className="absolute left-6 -bottom-6">
            <div className="relative group">
              <div className="w-24 h-24 bg-secondary rounded-full overflow-hidden border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <FaCamera className="text-white text-xl" />
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="absolute right-6 bottom-6">
            <button 
              onClick={() => setShowSettings(true)}
              className="bg-secondary hover:bg-dark text-white px-4 py-2 rounded-lg flex items-center dark:text-white"
            >
              <FaCog className="mr-2" />
              Settings
            </button>
          </div>
        </div>

        <div className="border-t mt-6 pt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-dark dark:text-white">
            <FaGraduationCap className="mr-2 text-dark dark:text-white" />
            Education
          </h2>
          <div className="mb-4">
            {education.map((edu, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-2">
                <h3 className="font-semibold dark:text-white">{edu.degree}</h3>
                <p className="text-gray-600 dark:text-gray-400">{edu.school}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{edu.year}</p>
              </div>
            ))}
          </div>
          {showEduForm ? (
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
              <input type="text" placeholder="Degree" value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} className="w-full mb-2 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              <input type="text" placeholder="School/University" value={newEducation.school} onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })} className="w-full mb-2 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              <input type="text" placeholder="Year" value={newEducation.year} onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })} className="w-full mb-2 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowEduForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded-lg dark:bg-gray-700">Cancel</button>
                <button onClick={handleAddEducation} className="bg-accent hover:bg-dark text-white px-4 py-2 rounded-lg">Add</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowEduForm(true)} className="flex items-center text-dark hover:text-accent dark:text-white">
              <Plus className="mr-2" /> Add Education
            </button>
          )}
        </div>

        <div className="border-t mt-6 pt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-dark dark:text-white">
            <FaBriefcase className="mr-2 text-dark dark:text-white" />
            Experience
          </h2>
          <div className="mb-4">
            {experience.map((exp, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-2">
                <h3 className="font-semibold dark:text-white">{exp.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{exp.from} - {exp.to}</p>
              </div>
            ))}
          </div>
          {showExpForm ? (
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
              <input type="text" placeholder="Title" value={newExperience.title} onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })} className="w-full mb-2 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              <input type="text" placeholder="Company" value={newExperience.company} onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })} className="w-full mb-2 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              <input type="text" placeholder="From" value={newExperience.from} onChange={(e) => setNewExperience({ ...newExperience, from: e.target.value })} className="w-full mb-2 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              <input type="text" placeholder="To" value={newExperience.to} onChange={(e) => setNewExperience({ ...newExperience, to: e.target.value })} className="w-full mb-2 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowExpForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded-lg dark:bg-gray-700">Cancel</button>
                <button onClick={handleAddExperience} className="bg-accent hover:bg-dark text-white px-4 py-2 rounded-lg">Add</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowExpForm(true)} className="flex items-center text-dark hover:text-accent dark:text-white">
              <Plus className="mr-2" /> Add Experience
            </button>
          )}
        </div>
      </div>
      
      {showSettings && (
        <Settings 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          user={user}
          onUpdateUser={setUser}
        />
      )}
    </div>
  );
};

export default Profile;