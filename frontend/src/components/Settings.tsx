import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaUser, FaSignOutAlt, FaTrash, FaBriefcase, FaKey, FaMapMarkerAlt, FaGraduationCap } from 'react-icons/fa';
import { BaseUrl } from '../App';
import AppliedJobs from "./AppliedJobs"; // Import the new component


interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdateUser: (user: any) => void;
}

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

interface ProfileResponse {
     userdata: {
       education: Education[];
       experience: Experience[];
     };
}

const Settings = ({ isOpen, onClose, user, onUpdateUser }: SettingsProps) => {
     
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [formData, setFormData] = useState({
    name: user.name,
    position: user.position,
    city: user.city,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleDelEdu = async (index: number) => {
     try {
           const response = await axios.post(
           `${BaseUrl}/working/deleteEducation`,
           {
                username: user.username,
                index: index,
           },
           {
                headers: { Authorization: localStorage.getItem("token") },
           }
           );
           if (response.data) {
           alert("Education deleted successfully!");
           setEducation(education.filter((_, i) => i !== index));
           }
      } catch (error) {
           console.log("Failed to delete education:", error);
          alert("Failed to delete education");
     }
  };

     const handleDelExp = async (index: number) => {
      try {
                const response = await axios.post(
                `${BaseUrl}/working/deleteExperience`,
                {
                    username: user.username,
                    index: index,
                },
                {
                    headers: { Authorization: localStorage.getItem("token") },
                }
                );
                if (response.data) {
                alert("Experience deleted successfully!");
                setExperience(experience.filter((_, i) => i !== index));
                }
          } catch (error) {
                console.log("Failed to delete experience:", error);
               alert("Failed to delete experience");
      }
     };

  const loadProfile = async () => {
     try {
       const response = await axios.get<ProfileResponse>(`${BaseUrl}/working/getUser`, {
         headers: {
           Authorization: localStorage.getItem("token"),
         },
       });
       if (response.data) {
         console.log(response.data);
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

  const handleUpdateInfo = async () => {
     onUpdateUser({
       ...user,
       name: formData.name,
       position: formData.position,
       city: formData.city
     });
     try {
          console.log("User: ", user);
          const response = await axios.post(
            `${BaseUrl}/working/updateProfile`,
            {
              username: user.username,
              name: formData.name,
              position: formData.position,
              city: formData.city,
            },
            {
              headers: { Authorization: localStorage.getItem("token") },
            }
          );
    
          if (response.data) {
            alert("Profile updated successfully!");
          }
        } catch (error) {
          console.error("Failed to update profile:", error);
          alert("Failed to update profile");
        }
  };

  const handleChangePassword = async () => {
     if (formData.newPassword !== formData.confirmPassword) {
     alert("Passwords do not match!");
     return;
     }
     try {
     const response = await axios.post(`${BaseUrl}/working/changePassword`, {
          username: user.username,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
     }, {
          headers: { Authorization: localStorage.getItem("token") },
     });
     if (response.data) {
          alert("Password changed successfully!");
          setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
     }
     } catch (error) {
     console.log("Failed to change password:", error);
     alert("Failed to change password");
     }
  };

  const handleDeleteAccount = async() => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
     try {
          await axios.post(`${BaseUrl}/working/deleteAccount`, {
            username: user.username,
          }, {
            headers: { Authorization: localStorage.getItem("token") },
          });
          alert("Account deleted successfully.");
          localStorage.removeItem("token");
          window.location.href = "/login";
        } catch (error) {
          console.error("Failed to delete account:", error);
          alert("Failed to delete account");
        }
    }
  };

  const handleLogout = () => {
     localStorage.removeItem('token');
     window.location.href = '/login';
   };

  const menuItems = [
    { id: 'profile', label: 'Update Info', icon: FaUser },
    { id: 'location', label: 'Update Location', icon: FaMapMarkerAlt },
    { id: 'position', label: 'Update Position', icon: FaBriefcase },
    { id: 'education', label: 'Update Education', icon: FaGraduationCap },
    { id: 'experience', label: 'Update Experience', icon: FaBriefcase },
    { id: 'password', label: 'Change Password', icon: FaKey },
    { id: 'logout', label: 'Logout', icon: FaSignOutAlt },
    { id: 'delete', label: 'Delete Account', icon: FaTrash },
  ];

  useEffect(() => {
      setFormData({
          name: user.name,
          position: user.position,
          city: user.city,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
      });
    }, [user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg mb-2 ${
                  activeSection === item.id
                    ? 'bg-accent text-white'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {menuItems.find(item => item.id === activeSection)?.label}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {activeSection === 'profile' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                  <button
                    onClick={handleUpdateInfo}
                    className="w-full bg-accent hover:bg-dark text-white py-2 rounded-lg"
                  >
                    Update Information
                  </button>
                </div>
              )}

              {activeSection === 'location' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                  <button
                    onClick={handleUpdateInfo}
                    className="w-full bg-accent hover:bg-dark text-white py-2 rounded-lg"
                  >
                    Update Location
                  </button>
                </div>
              )}

              {activeSection === 'position' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                  <button
                    onClick={handleUpdateInfo}
                    className="w-full bg-accent hover:bg-dark text-white py-2 rounded-lg"
                  >
                    Update Position
                  </button>
                </div>
              )}

              {activeSection === 'education' && (
               <div className="mb-4 relative">
                    {education.map((edu, index) => (
                    <div className='relative' key={index}>
                         <div key={index} className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mb-2">
                              <h3 className="font-semibold dark:text-white">{edu.degree}</h3>
                              <p className="text-gray-600 dark:text-gray-400">{edu.school}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{edu.year}</p>
                         </div>
                         <FaTrash onClick={() => handleDelEdu(index)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                    </div>
                    ))}
                    
               </div>
              )}

               {activeSection === 'experience' && (
               <div className="mb-4 relative">
                    {experience.map((exp, index) => (
                    <div className='relative' key={index}>
                         <div key={index} className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mb-2">
                              <h3 className="font-semibold dark:text-white">{exp.title}</h3>
                              <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{exp.from} - {exp.to}</p>
                         </div>
                         <FaTrash onClick={() => handleDelExp(index)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                    </div>
                    ))}
                    
               </div>
               )}

              {activeSection === 'password' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                         <input
                         id='currentPassword'
                         type={showPassword ? "text" : "password"}
                         value={formData.currentPassword}
                         onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                         className="w-full p-2 pl-5 border rounded-lg dark:bg-gray-700"
                         placeholder="Enter your current password"
                         />
                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                         </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                         <input
                         id='newPassword'
                         type={showPassword ? "text" : "password"}
                         value={formData.newPassword}
                         onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                         className="w-full p-2 pl-5 border rounded-lg dark:bg-gray-700"
                         placeholder="Enter new password"
                         />
                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                         </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                         <input
                         id='confirmPassword'
                         type={showPassword ? "text" : "password"}
                         value={formData.confirmPassword}
                         onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                         className="w-full p-2 pl-5 border rounded-lg dark:bg-gray-700"
                         placeholder="Confirm New Password"
                         />
                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                         </div>
                    </div>
                  </div>
                  <button
                    onClick={handleChangePassword}
                    className="w-full bg-accent hover:bg-dark text-white py-2 rounded-lg"
                  >
                    Change Password
                  </button>
                </div>
              )}

              {activeSection === 'delete' && (
                <div className="space-y-4">
                  <p className="text-red-600 dark:text-red-400">
                    Warning: This action cannot be undone. All your data will be permanently deleted.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                  >
                    Delete Account
                  </button>
                </div>
              )}

              {activeSection === 'logout' && (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Are you sure you want to log out?
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-accent hover:bg-dark text-white py-2 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              )}

              {/* Add other sections as needed */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;