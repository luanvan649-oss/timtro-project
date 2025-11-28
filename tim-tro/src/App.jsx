import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';

import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';

import PostDetail from './pages/PostDetail';
import { useState, useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';
import axios from 'axios';

import './App.css';

const API_BASE_URL = 'http://localhost:3001';

function App() {
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // Load user profile if stored in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setCurrentUser(parsed);

      const fetchProfile = async () => {
        try {
          const resp = await axios.get(`${API_BASE_URL}/users?email=${parsed.email}`);
          if (resp.data.length > 0) setProfileData(resp.data[0]);
        } catch (err) {
          console.error('Error fetching profile data:', err);
        }
      };

      fetchProfile();
    }
  }, []);

  const handleGlobalSearchSubmit = (term) => {
    setGlobalSearchTerm(term);
  };

  // Wrapper để Home luôn có đủ props
  const HomeWrapper = () => (
    <Home
      globalSearchTerm={globalSearchTerm}
      setGlobalSearchTerm={setGlobalSearchTerm}
    />
  );

  return (
    <ErrorBoundary>
      <SocketProvider currentUser={currentUser}>
        <Router>
          <Routes>

            {/* LOGIN & REGISTER (không có Layout) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* APP ROUTES (có Layout) */}
            <Route
              path="*"
              element={
                <Layout
                  searchTermValue={globalSearchTerm}
                  onSearchSubmit={handleGlobalSearchSubmit}
                >
                  <Routes>
                    <Route path="/" element={<HomeWrapper />} />
                    <Route path="/create-post" element={<CreatePost />} />
                    <Route path="/post/:id" element={<PostDetail />} />

                    {/* Các trang danh mục → dùng lại Home */}
                    <Route path="/nha-nguyen-can" element={<HomeWrapper />} />
                    <Route path="/can-ho-chung-cu" element={<HomeWrapper />} />
                    <Route path="/can-ho-mini" element={<HomeWrapper />} />
                    <Route path="/can-ho-dich-vu" element={<HomeWrapper />} />
                    <Route path="/mat-bang" element={<HomeWrapper />} />
                    <Route path="/bang-gia" element={<HomeWrapper />} />

                    {/* Địa điểm */}
                    <Route path="/ho-chi-minh" element={<HomeWrapper />} />
                    <Route path="/ha-noi" element={<HomeWrapper />} />
                    <Route path="/da-nang" element={<HomeWrapper />} />
                    <Route path="/saved" element={<HomeWrapper />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </Router>
      </SocketProvider>
    </ErrorBoundary>
  );
}

export default App;
