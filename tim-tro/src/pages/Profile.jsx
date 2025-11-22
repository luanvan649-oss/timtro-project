import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, School, MapPin, Edit, Save, X, Camera, Star, Heart, Home, CheckCircle, Upload, AlertCircle } from 'lucide-react';
import axios from 'axios';
const API_BASE_URL = 'http://localhost:3001';

function Profile() {
  const navigate = useNavigate();
  // We'll assume a user is "logged in" for now, as Firebase auth was removed.
  // In a real scenario, this would come from a global state or context.
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Simulate getting current user from local storage or context
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      // If no user is logged in, redirect to login page
      navigate('/login');
    }
  }, [navigate]);

  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    school: '',
    major: '',
    year: '',
    gender: '',
    city: '',
    bio: '',
    interests: [],
    lookingFor: {
      gender: '',
      ageRange: '',
      budget: '',
      location: '',
      lifestyle: []
    }
  });
  const [userStats, setUserStats] = useState({
    postsCount: 0,
    connectionsCount: 0,
    rating: 0
  });

  useEffect(() => {
    if (currentUser) {
      loadUserProfile();
      loadUserStats();
    }
  }, [currentUser]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users?email=${currentUser.email}`);
      if (response.data.length > 0) {
        const userData = response.data[0];
        setProfileData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          school: userData.school || '',
          major: userData.major || '',
          year: userData.year || '',
          gender: userData.gender || '',
          city: userData.city || '',
          bio: userData.bio || '',
          interests: userData.interests || [],
          lookingFor: userData.lookingFor || {
            gender: '',
            ageRange: '',
            budget: '',
            location: '',
            lifestyle: []
          }
        });
        // Initial stats load based on profile data if available
        setUserStats(prev => ({
          ...prev,
          connectionsCount: userData.connectionsCount || 0,
          rating: userData.rating || 4.5,
          profileViews: userData.profileViews || 0,
          joinDate: userData.createdAt || ''
        }));
      } else {
        setMessage({ type: 'error', text: 'Không tìm thấy thông tin hồ sơ người dùng.' });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setMessage({ type: 'error', text: 'Không thể tải thông tin hồ sơ' });
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    if (!currentUser) return;
    try {
      const postsResponse = await axios.get(`${API_BASE_URL}/posts?authorId=${currentUser.id}`);
      const userPosts = postsResponse.data;

      setUserStats(prev => ({
        ...prev,
        postsCount: userPosts.length,
        // For now, keep mock/default values if no real data is available
        connectionsCount: prev.connectionsCount || 0, 
        rating: prev.rating || 4.5,
        profileViews: prev.profileViews || 0
      }));
    } catch (error) {
      console.error('Error loading user stats:', error);
      setMessage({ type: 'error', text: 'Không thể tải số liệu thống kê người dùng' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLookingForChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      lookingFor: {
        ...prev.lookingFor,
        [name]: value
      }
    }));
  };

  const handleInterestToggle = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleLifestyleToggle = (lifestyle) => {
    setProfileData(prev => ({
      ...prev,
      lookingFor: {
        ...prev.lookingFor,
        lifestyle: prev.lookingFor.lifestyle.includes(lifestyle)
          ? prev.lookingFor.lifestyle.filter(l => l !== lifestyle)
          : [...prev.lookingFor.lifestyle, lifestyle]
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (!currentUser || !currentUser.id) {
        setMessage({ type: 'error', text: 'Người dùng chưa đăng nhập hoặc ID không hợp lệ.' });
        return;
      }

      // Send updated profileData to the API
      const response = await axios.put(`${API_BASE_URL}/users/${currentUser.id}`, profileData);
      
      // Update local storage and state with the new profile data
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      setCurrentUser(response.data);
      setProfileData(response.data); // Ensure profileData state reflects the saved data

      setIsEditing(false);
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const commonInterests = [
    'Đọc sách', 'Xem phim', 'Nghe nhạc', 'Du lịch', 'Thể thao', 'Nấu ăn',
    'Chơi game', 'Nhiếp ảnh', 'Học ngoại ngữ', 'Yoga', 'Gym', 'Vẽ'
  ];

  const lifestyleOptions = [
    'Sạch sẽ', 'Yên tĩnh', 'Thân thiện', 'Không hút thuốc', 'Không uống rượu',
    'Dậy sớm', 'Đi ngủ muộn', 'Thích nấu ăn', 'Thích tiệc tùng', 'Học tập nhiều'
  ];

  const tabs = [
    { id: 'info', label: 'Thông tin cá nhân', icon: <User size={20} /> },
    { id: 'preferences', label: 'Tiêu chí tìm bạn', icon: <Heart size={20} /> },
    { id: 'interests', label: 'Sở thích', icon: <Star size={20} /> }
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Vui lòng đăng nhập để xem hồ sơ</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-md flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} className="mr-2" />
          ) : (
            <AlertCircle size={20} className="mr-2" />
          )}
          {message.text}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User size={40} className="text-blue-600" />
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                <Camera size={16} />
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {profileData.fullName || 'Chưa cập nhật tên'}
              </h1>
              <p className="text-blue-100">{profileData.email}</p>
              <p className="text-blue-100">{profileData.school || 'Chưa cập nhật trường'}</p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-6 pt-4 border-t border-blue-400">
                <div className="text-center">
                  <div className="text-2xl font-bold">{userStats.postsCount || 0}</div>
                  <div className="text-blue-100 text-sm">Bài đăng</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{userStats.connectionsCount || 0}</div>
                  <div className="text-blue-100 text-sm">Kết nối</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center text-2xl font-bold">
                    {(userStats.rating || 0).toFixed(1)}
                    <Star size={18} className="ml-1" fill="currentColor" />
                  </div>
                  <div className="text-blue-100 text-sm">Đánh giá</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  {isEditing ? <X size={20} /> : <Edit size={20} />}
                  <span>{isEditing ? 'Hủy' : 'Chỉnh sửa'}</span>
                </button>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trường học
                    </label>
                    <input
                      type="text"
                      name="school"
                      value={profileData.school}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngành học
                    </label>
                    <select
                      name="major"
                      value={profileData.major}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn ngành học</option>
                      <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                      <option value="Kinh tế">Kinh tế</option>
                      <option value="Y học">Y học</option>
                      <option value="Luật">Luật</option>
                      <option value="Kỹ thuật">Kỹ thuật</option>
                      <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
                      <option value="Ngoại ngữ">Ngoại ngữ</option>
                      <option value="Thiết kế">Thiết kế</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Năm học
                    </label>
                    <select
                      name="year"
                      value={profileData.year}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn năm</option>
                      <option value="1">Năm 1</option>
                      <option value="2">Năm 2</option>
                      <option value="3">Năm 3</option>
                      <option value="4">Năm 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thành phố
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới thiệu bản thân
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Hãy viết vài dòng về bản thân..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save size={20} />
                      <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{profileData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        <p className="font-medium">{profileData.phone || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <School className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Trường học</p>
                        <p className="font-medium">{profileData.school || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Thành phố</p>
                        <p className="font-medium">{profileData.city || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Giới tính</p>
                        <p className="font-medium">
                          {profileData.gender === 'male' ? 'Nam' : 
                           profileData.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <School className="text-gray-400" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Ngành học - Năm {profileData.year}</p>
                        <p className="font-medium">{profileData.major || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </div>
                  {profileData.bio && (
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium mb-2">Giới thiệu</h3>
                      <p className="text-gray-700">{profileData.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Tiêu chí tìm bạn ghép trọ</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính mong muốn
                  </label>
                  <select
                    name="gender"
                    value={profileData.lookingFor.gender}
                    onChange={handleLookingForChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Không quan trọng</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngân sách
                  </label>
                  <select
                    name="budget"
                    value={profileData.lookingFor.budget}
                    onChange={handleLookingForChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn ngân sách</option>
                    <option value="under-2m">Dưới 2 triệu</option>
                    <option value="2-3m">2-3 triệu</option>
                    <option value="3-4m">3-4 triệu</option>
                    <option value="4-5m">4-5 triệu</option>
                    <option value="above-5m">Trên 5 triệu</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khu vực mong muốn
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={profileData.lookingFor.location}
                    onChange={handleLookingForChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ví dụ: Quận 1, gần trường học..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lối sống mong muốn
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {lifestyleOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => handleLifestyleToggle(option)}
                        className={`p-2 text-sm rounded-md border ${
                          profileData.lookingFor.lifestyle.includes(option)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={20} />
                  <span>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'interests' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Sở thích của bạn</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {commonInterests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-3 text-sm rounded-lg border ${
                      profileData.interests.includes(interest)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              
              {profileData.interests.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Sở thích đã chọn:</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests.map(interest => (
                      <span
                        key={interest}
                        className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default Profile;
