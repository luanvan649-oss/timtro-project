import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import SearchPosts from './pages/SearchPosts';
import PostDetail from './pages/PostDetail';
import Suggestions from './pages/Suggestions';
import Connections from './pages/Connections';
import MyConnections from './pages/MyConnections';
import Login from './pages/Login';
import Register from './pages/Register';
import Ratings from './pages/Ratings';
import MyPosts from './pages/MyPosts';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import EditPost from './pages/EditPost';
import ErrorBoundary from './components/ErrorBoundary';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import PostManagement from './pages/PostManagement';
import BlogManagement from './pages/BlogManagement';
import ProtectedRoute from './components/ProtectedRoute';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import Blog from './pages/Blog'; // Import Blog component
import BlogDetail from './pages/BlogDetail'; // Import BlogDetail component
import './App.css';
import { SocketProvider } from './context/SocketContext';
import axios from 'axios'; // Import axios

import { API_BASE_URL } from './config'; // Import API base URL from config

function App() {
  const [globalSearchTerm, setGlobalSearchTerm] = useState(''); // Global search term state
  const [currentUser, setCurrentUser] = useState(null); // Current user state
  const [profileData, setProfileData] = useState(null); // User profile data

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

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
              <Route path="/admin/users" element={<Layout><UserManagement /></Layout>} />
              <Route path="/admin/posts" element={<Layout><PostManagement /></Layout>} />
              <Route path="/admin/blogs" element={<Layout><BlogManagement /></Layout>} />
            </Route>

            {/* App Routes - with Layout */}
            {/* Pass globalSearchTerm and handleGlobalSearchSubmit to Layout */}
            <Route path="*" element={
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
                  <Route
                    path="/suggestions"
                    element={<Suggestions
                      userLookingFor={profileData?.lookingFor}
                      userInterests={profileData?.interests}
                      userMajor={profileData?.major}
                      userYear={profileData?.year}
                    />}
                  />
                  <Route path="/connections" element={<Connections />} />
                  <Route path="/my-connections" element={<MyConnections />} />
                  <Route path="/ratings" element={<Ratings />} />
                  <Route path="/my-posts" element={<MyPosts currentUser={currentUser} />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/edit-post/:id" element={<EditPost />} />

                  {/* Blog Routes */}
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogDetail />} />

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
