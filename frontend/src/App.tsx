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

function App() {
  return (
    <RecoilRoot>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <InitUser />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Feed />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path="/network" element={<Network />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/profile" element={<Profile />} />
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
      const response = await axios.get(`http://localhost:3000/auth/me`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      if (response.data) {
        setUser({
          isLoading: false,
          userName: response.data.username,
        });
      } else {
        setUser({
          isLoading: false,
          userName: "",
        });
      }
    } catch (e) {
      setUser({
        isLoading: false,
        userName: "",
      });
    }
  };

  useEffect(() => {
    init();
  }, []);

  return <div></div>;
}

export default App;