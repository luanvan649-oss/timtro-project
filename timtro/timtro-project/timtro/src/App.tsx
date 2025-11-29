import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import SearchPosts from './pages/SearchPosts';
import PostDetail from './pages/PostDetail';

import MyConnections from './pages/MyConnections';
import Login from './pages/Login';
import Register from './pages/Register';

import MyPosts from './pages/MyPosts';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

import ErrorBoundary from './components/ErrorBoundary';

import ProtectedRoute from './components/ProtectedRoute';
import { useState, useEffect } from 'react'; 
import './App.css';
import { SocketProvider } from './context/SocketContext';
import axios from 'axios'; 

const API_BASE_URL = 'http://localhost:3001'; 

function App() {
  const [globalSearchTerm, setGlobalSearchTerm] = useState(''); 
  const [currentUser, setCurrentUser] = useState(null); 
  const [profileData, setProfileData] = useState(null); 

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      // Fetch profile data once currentUser is set
      const fetchProfile = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/users?email=${parsedUser.email}`);
          if (response.data.length > 0) {
            setProfileData(response.data[0]);
          }
        } catch (error) {
          console.error('Error fetching profile data in App.jsx:', error);
        }
      };
      fetchProfile();
    }
  }, []); // Run once on mount

  const handleGlobalSearchSubmit = (term) => {
    setGlobalSearchTerm(term);
  };

  return (
    <ErrorBoundary>
      {/* AuthProvider removed as per user request */}
      <SocketProvider currentUser={currentUser}> {/* Wrap the entire application with SocketProvider */}
        <Router>
          <Routes>
            {/* Auth Routes - without Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          
       

         
          <Route  path="*" element={
            <Layout
              searchTermValue={globalSearchTerm}
              onSearchSubmit={handleGlobalSearchSubmit}
            >
              <Routes>
                {/* Pass globalSearchTerm and setGlobalSearchTerm to Home */}
                <Route path="/" element={<Home globalSearchTerm={globalSearchTerm} setGlobalSearchTerm={setGlobalSearchTerm} />} />
                <Route path="/create-post" element={<CreatePost />} />
                {/* <Route path="/search-posts" element={<SearchPosts />} /> */}
                <Route path="/post/:id" element={<PostDetail />} />
               
               
                <Route path="/my-connections" element={<MyConnections />} />
               
                <Route path="/my-posts" element={<MyPosts currentUser={currentUser} />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
               
                
            

                {/* Category Routes */}
                <Route path="/nha-nguyen-can" element={<Home />} />
                <Route path="/can-ho-chung-cu" element={<Home />} />
                <Route path="/can-ho-mini" element={<Home />} />
                <Route path="/can-ho-dich-vu" element={<Home />} />
                <Route path="/mat-bang" element={<Home />} />
                <Route path="/bang-gia" element={<Home />} />
                
                {/* Location Routes */}
                <Route path="/ho-chi-minh" element={<Home />} />
                <Route path="/ha-noi" element={<Home />} />
                <Route path="/da-nang" element={<Home />} />
                <Route path="/saved" element={<Home />} />
              </Routes>
            </Layout>
          } />
          </Routes>
        </Router>
      </SocketProvider> {/* Close SocketProvider */}
    </ErrorBoundary>
  );
}

export default App;
