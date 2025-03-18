import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import Network from './pages/Network';
import Jobs from './pages/Jobs';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import { useEffect } from 'react';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import { userState } from './store/atoms/user';
import axios from 'axios';
import Register from './pages/Register';
import Cregister from './pages/company/Register';
import Dashboard from './pages/company/Dashboard';
import AddJob from './pages/company/AddJob';
import Chat from './pages/Chat';

export const BaseUrl = "http://localhost:3000";

function App() {

  useEffect(() => {
    // Function to handle theme switching
    const applyTheme = () => {
      if (localStorage.theme === 'dark' || 
          (!('theme' in localStorage) && 
           window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme();

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <RecoilRoot>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-primary text-gray-900 dark:text-gray-100">
          <Navbar />
          <InitUser />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/company/dashboard" element={<Dashboard />} />
              <Route path="/company/addjob" element={<AddJob />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path="/company/register" element={<Cregister />} />
              <Route path="/network" element={<Network />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<Chat />} />
            </Routes>
          </main>
        </div>
      </Router>
    </RecoilRoot>
  );
}

function InitUser() {
  const setUser = useSetRecoilState(userState);

  const init = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/auth/me`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      if (response.data) {
        setUser({
          isLoading: false,
          userName: response.data.username,
          isCompany: false,
        });
      } else {
        setUser({
          isLoading: false,
          userName: "",
          isCompany: false,
        });
      }
    } catch (e) {
      setUser({
        isLoading: false,
        userName: "",
        isCompany: false,
      });
    }
  };

  useEffect(() => {
    init();
  }, []);

  return <div></div>;
}

export default App;
