import { Link, useLocation } from "react-router-dom";
import { FaHome, FaGraduationCap, FaUser, FaUserFriends, FaBriefcase, FaBuilding, FaLock } from "react-icons/fa";
import { useRecoilState } from "recoil";
import { userState } from "../store/atoms/user";
import { IconType } from "react-icons";
import ThemeToggle from './ThemeToggle';

interface NavItemProps {
  to: string;
  icon: IconType;
  label: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, active }) => (
  <Link to={to} className={`flex flex-col items-center px-3 py-2 rounded-lg ${active ? "text-dark font-bold" : "text-gray-600 hover:text-blue-500"}`}>
    <Icon className="text-xl" />
    <span className="text-xs">{label}</span>
  </Link>
);

const Navbar = () => {
  const [{ isLoading, userName }] = useRecoilState(userState);
  const location = useLocation();
  const isCompanyRoute = location.pathname.startsWith("/company");

  if (isLoading) return null; // Don't render navbar until loading is finished

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
          {/* ✅ App Logo */}
            <img src="/logo.png" alt="LinkBridge" className="h-10 flex space-x-2" />
            <Link to={isCompanyRoute ? "/company/dashboard" : "/"} className="text-2xl font-bold text-dark">
              LinkBridge {isCompanyRoute && <span className="text-blue-500">(Company login)</span>}
            </Link>
          </div>

          {/* ✅ Dynamic Navigation */}
          <div className="flex space-x-2">
            {isCompanyRoute ? (
              <>
                <NavItem to="/company/dashboard" icon={FaBuilding} label="Dashboard" active={location.pathname === "/company/dashboard"} />
                <NavItem to="/company/addjob" icon={FaBriefcase} label="Add Job" active={location.pathname === "/company/addjob"} />
              </>
            ) : userName ? (
              <>
                <NavItem to="/feed" icon={FaHome} label="Home" active={location.pathname === "/dashboard"} />
                <NavItem to="/network" icon={FaUserFriends} label="Network" active={location.pathname === "/network"} />
                <NavItem to="/jobs" icon={FaBriefcase} label="Jobs" active={location.pathname === "/jobs"} />
                <NavItem to="/courses" icon={FaGraduationCap} label="Courses" active={location.pathname === "/courses"} />
                <NavItem to="/profile" icon={FaUser} label="Profile" active={location.pathname === "/profile"} />
              </>
            ) : (
              <>
                <NavItem to="/login" icon={FaUser} label="Login" active={location.pathname === "/login"} />
                <NavItem to="/register" icon={FaLock} label="Register" active={location.pathname === "/register"} />
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
