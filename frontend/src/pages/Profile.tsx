import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaEdit, FaGraduationCap, FaBriefcase, FaCamera } from 'react-icons/fa';
import { Plus } from 'lucide-react';

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
  const [user, setUser] = useState<User>({});
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [showEduForm, setShowEduForm] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [newEducation, setNewEducation] = useState<Education>({ degree: '', school: '', year: '' });
  const [newExperience, setNewExperience] = useState<Experience>({ title: '', company: '', from: '', to: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({
    name: "",
    position: "",
    city: "",
  });

  const loadProfile = async () => {
    try {
      const response = await axios.get<ProfileResponse>('http://localhost:3000/working/getUser', {
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

  
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleAddEducation = async () => {
    if (newEducation.degree && newEducation.school && newEducation.year) {
      try {
        const response = await axios.post('http://localhost:3000/working/addEducation', {
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
        const response = await axios.post('http://localhost:3000/working/addExperience', {
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

  

  useEffect(() => {
    setUpdatedProfile({
      name: user?.name || "",
      position: user?.position || "",
      city: user?.city || "",
    });
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      console.log("User: ", user);
      const response = await axios.post(
        "http://localhost:3000/working/updateProfile",
        {
          username: user.username,
          name: updatedProfile.name,
          position: updatedProfile.position,
          city: updatedProfile.city,
        },
        {
          headers: { Authorization: localStorage.getItem("token") },
        }
      );

      if (response.data) {
        alert("Profile updated successfully!");
        setIsEditing(false);
        loadProfile(); // Refresh profile data
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
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

          <div className="absolute right-6 bottom-6 flex space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-accent hover:bg-dark text-white px-4 py-2 rounded-lg flex items-center"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdateProfile}
                  className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            )}
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
              Logout
            </button>
          </div>


        </div>

        <div className="mt-8">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Full Name"
                value={updatedProfile.name}
                onChange={(e) => setUpdatedProfile({ ...updatedProfile, name: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Position"
                value={updatedProfile.position}
                onChange={(e) => setUpdatedProfile({ ...updatedProfile, position: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="City"
                value={updatedProfile.city}
                onChange={(e) => setUpdatedProfile({ ...updatedProfile, city: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-800">{user.name || "Your Name"}</h1>
              <p className="text-gray-600">{user.position || "Your Position"}</p>
              <p className="text-accent">{user.city || "Your City"}</p>
            </>
          )}
        </div>


        <div className="border-t mt-6 pt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaGraduationCap className="mr-2 text-dark" />
            Education
          </h2>
          <div className="mb-4">
            {education.map((edu, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg mb-2">
                <h3 className="font-semibold">{edu.degree}</h3>
                <p className="text-gray-600">{edu.school}</p>
                <p className="text-sm text-gray-500">{edu.year}</p>
              </div>
            ))}
          </div>
          {showEduForm ? (
            <div className="bg-gray-100 p-4 rounded-lg">
              <input type="text" placeholder="Degree" value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} className="font-semibold w-full bg-transparent border-0 focus:ring-2 focus:ring-accent" />
              <input type="text" placeholder="School/University" value={newEducation.school} onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })} className="w-full mb-2 p-2 border rounded-lg" />
              <input type="text" placeholder="Year" value={newEducation.year} onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })} className="w-full mb-2 p-2 border rounded-lg" />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowEduForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={handleAddEducation} className="bg-accent hover:bg-dark text-white px-4 py-2 rounded-lg">Add</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowEduForm(true)} className="flex items-center text-dark hover:text-accent">
              <Plus className="mr-2" /> Add Education
            </button>
          )}
        </div>

        <div className="border-t mt-6 pt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaBriefcase className="mr-2 text-dark" />
            Experience
          </h2>
          <div className="mb-4">
            {experience.map((exp, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg mb-2">
                <h3 className="font-semibold">{exp.title}</h3>
                <p className="text-gray-600">{exp.company}</p>
                <p className="text-sm text-gray-500">{exp.from}-{exp.to}</p>
              </div>
            ))}
          </div>
          {showExpForm ? (
            <div className="bg-gray-100 p-4 rounded-lg">
              <input type="text" placeholder="Title" value={newExperience.title} onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })} className="w-full mb-2 p-2 border rounded-lg" />
              <input type="text" placeholder="Company" value={newExperience.company} onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })} className="w-full mb-2 p-2 border rounded-lg" />
              <input type="text" placeholder="From" value={newExperience.from} onChange={(e) => setNewExperience({ ...newExperience, from: e.target.value })} className="w-full mb-2 p-2 border rounded-lg" />
              <input type="text" placeholder="To" value={newExperience.to} onChange={(e) => setNewExperience({ ...newExperience, to: e.target.value })} className="w-full mb-2 p-2 border rounded-lg" />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowExpForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={handleAddExperience} className="bg-accent hover:bg-dark text-white px-4 py-2 rounded-lg">Add</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowExpForm(true)} className="flex items-center text-dark hover:text-accent">
              <Plus className="mr-2" /> Add Experience
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;