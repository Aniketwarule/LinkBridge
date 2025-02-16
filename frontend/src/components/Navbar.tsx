import { Link } from 'react-router-dom';
import { FaHome, FaGraduationCap, FaUser, FaUserFriends, FaBriefcase } from 'react-icons/fa';
import { useRecoilState } from 'recoil';
import { userState } from '../store/atoms/user';
import { LogInIcon } from 'lucide-react';
import { SiGnuprivacyguard } from 'react-icons/si';

const Navbar = () => {

  const isLoading = useRecoilState(userState)[0].isLoading;
  const userName = useRecoilState(userState)[0].userName;


  if(userName && !isLoading) {
    return (
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="text-2xl font-bold text-dark">
              LinkBridge
            </Link>
            <div className="flex space-x-6">
              <Link to="/dashboard" className="flex flex-col items-center text-gray-600 hover:text-dark">
                <FaHome className="text-xl" />
                <span className="text-xs">Home</span>
              </Link>
              <Link to="/network" className="flex flex-col items-center text-gray-600 hover:text-dark">
                <FaUserFriends className="text-xl" />
                <span className="text-xs">Network</span>
              </Link>
              <Link to="/jobs" className="flex flex-col items-center text-gray-600 hover:text-dark">
                <FaBriefcase className="text-xl" />
                <span className="text-xs">Jobs</span>
              </Link>
              <Link to="/courses" className="flex flex-col items-center text-gray-600 hover:text-dark">
                <FaGraduationCap className="text-xl" />
                <span className="text-xs">Courses</span>
              </Link>
              <Link to="/profile" className="flex flex-col items-center text-gray-600 hover:text-dark">
                <FaUser className="text-xl" />
                <span className="text-xs">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }else {
    return (
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-dark">
              LinkBridge
            </Link>
            <div className="flex space-x-8">
              <Link to="/login" className="flex flex-col items-center text-gray-600 hover:text-dark">
                <LogInIcon className="text-xl" />
                <span className="text-xs">Login</span>
              </Link>
              <Link to="/register" className="flex flex-col items-center text-gray-600 hover:text-dark">
                <SiGnuprivacyguard className="text-xl" />
                <span className="text-xs">Register</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }  
}

export default Navbar