import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, School, MapPin, Edit, Save, X, Camera, Star, Heart, Home, CheckCircle, Upload, AlertCircle } from 'lucide-react';
import api from '../api';  // Đảm bảo API client được import




function Profile() {
  const navigate = useNavigate();
  // We'll assume a user is "logged in" for now, as Firebase auth was removed.
  // In a real scenario, this would come from a global state or context.
  const [currentUser, setCurrentUser] = useState<any>(null);


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
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [profileData, setProfileData] = useState<any>({
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
  const [userStats, setUserStats] = useState<any>({
    postsCount: 0,
    connectionsCount: 0,
    rating: 0,
    profileViews: 0,
    joinDate: ''
  });


  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);


  // Reset load flag when user ID changes (new login)
  useEffect(() => {
    setHasLoadedProfile(false);
  }, [currentUser?.id]);


  useEffect(() => {
    if (currentUser && !hasLoadedProfile) {
      loadUserProfile();
      loadUserStats();
    }
  }, [currentUser, hasLoadedProfile]);


  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // Fetch by ID is more reliable than email
      const response = await api.get(`/users/${currentUser.id}`);
      if (response.data) {
        const userData = response.data;


        // Update localStorage to keep it in sync
        const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const updatedUser = { ...storedUser, ...userData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Update currentUser state with avatar
        setCurrentUser(updatedUser);

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
        setUserStats(prev => ({
          ...prev,
          connectionsCount: userData.connectionsCount || 0,
          rating: userData.rating || 4.5,
          profileViews: userData.profileViews || 0,
          joinDate: userData.createdAt || ''
        }));
        setHasLoadedProfile(true);
      } else {
        // User not found in db.json, use data from localStorage (for Google/Facebook login)
        setProfileData({
          fullName: currentUser.fullName || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          school: currentUser.school || '',
          major: currentUser.major || '',
          year: currentUser.year || '',
          gender: currentUser.gender || '',
          city: currentUser.city || '',
          bio: currentUser.bio || '',
          interests: currentUser.interests || [],
          lookingFor: currentUser.lookingFor || {
            gender: '',
            ageRange: '',
            budget: '',
            location: '',
            lifestyle: []
          }
        });
        setHasLoadedProfile(true);
      }
    } catch (error) {
      console.error('Error loading user profile:', (error as any).response?.data || (error as any).message || error);
      // If API fails (404 or network error), use currentUser data from localStorage
      setProfileData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        school: currentUser.school || '',
        major: currentUser.major || '',
        year: currentUser.year || '',
        gender: currentUser.gender || '',
        city: currentUser.city || '',
        bio: currentUser.bio || '',
        interests: currentUser.interests || [],
        lookingFor: currentUser.lookingFor || {
          gender: '',
          ageRange: '',
          budget: '',
          location: '',
          lifestyle: []
        }
      });
      setHasLoadedProfile(true);
    } finally {
      setLoading(false);
    }
  };




  const loadUserStats = async () => {
    if (!currentUser) return;
    try {
      const postsResponse = await api.get(`/posts?userId=${encodeURIComponent(currentUser.id)}`);  // Sử dụng api.get thay vì axios.get
      const userPosts = postsResponse.data;


      setUserStats(prev => ({
        ...prev,
        postsCount: userPosts.length,
        connectionsCount: prev.connectionsCount || 0,
        rating: prev.rating || 4.5,
        profileViews: prev.profileViews || 0
      }));
    } catch (error) {
      console.error('Error loading user stats:', (error as any).response?.data || (error as any).message || error);
      setMessage({ type: 'error', text: 'Không thể tải số liệu thống kê người dùng' });
    }
  };




  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleLookingForChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setProfileData(prev => ({
      ...prev,
      lookingFor: {
        ...prev.lookingFor,
        [name]: value
      }
    }));
  };


  const handleInterestToggle = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };


  const handleLifestyleToggle = (lifestyle: string) => {
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
        console.error('Missing user ID:', currentUser);
        setMessage({ type: 'error', text: 'Người dùng chưa đăng nhập hoặc ID không hợp lệ.' });
        return;
      }


      let response;
      // Prepare complete user data for saving
      const completeUserData = {
        ...currentUser,
        ...profileData,
        updatedAt: new Date().toISOString()
      };


      try {
        // Try to update existing user (PATCH)
        response = await api.patch(`/users/${currentUser.id}`, completeUserData);
      } catch (error: any) {
        if (error.response?.status === 404) {
          // User not in db.json, create new user (POST)
          const newUserData = {
            ...completeUserData,
            createdAt: currentUser.createdAt || new Date().toISOString()
          };
          response = await api.post('/users', newUserData);
        } else {
          throw error; // Re-throw if not 404
        }
      }


      // Update localStorage and state
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setProfileData(prev => ({ ...prev, ...response.data }));


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

  const vietnamCities = [
    'Hà Nội',
    'Hồ Chí Minh',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'An Giang',
    'Bà Rịa - Vũng Tàu',
    'Bạc Liêu',
    'Bắc Giang',
    'Bắc Kạn',
    'Bắc Ninh',
    'Bến Tre',
    'Bình Định',
    'Bình Dương',
    'Bình Phước',
    'Bình Thuận',
    'Cà Mau',
    'Cao Bằng',
    'Đắk Lắk',
    'Đắk Nông',
    'Điện Biên',
    'Đồng Nai',
    'Đồng Tháp',
    'Gia Lai',
    'Hà Giang',
    'Hà Nam',
    'Hà Tĩnh',
    'Hải Dương',
    'Hậu Giang',
    'Hòa Bình',
    'Hưng Yên',
    'Khánh Hòa',
    'Kiên Giang',
    'Kon Tum',
    'Lai Châu',
    'Lâm Đồng',
    'Lạng Sơn',
    'Lào Cai',
    'Long An',
    'Nam Định',
    'Nghệ An',
    'Ninh Bình',
    'Ninh Thuận',
    'Phú Thọ',
    'Phú Yên',
    'Quảng Bình',
    'Quảng Nam',
    'Quảng Ngãi',
    'Quảng Ninh',
    'Quảng Trị',
    'Sóc Trăng',
    'Sơn La',
    'Tây Ninh',
    'Thái Bình',
    'Thái Nguyên',
    'Thanh Hóa',
    'Thừa Thiên Huế',
    'Tiền Giang',
    'Trà Vinh',
    'Tuyên Quang',
    'Vĩnh Long',
    'Vĩnh Phúc',
    'Yên Bái'
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
          <div className={`mb-6 p-4 rounded-md flex items-center ${message.type === 'success'
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
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={profileData.fullName || 'Avatar'}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowAvatarModal(true)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        const fallback = parent.querySelector('.avatar-fallback') as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className={`w-20 h-20 bg-white rounded-full flex items-center justify-center ${currentUser?.avatar ? 'hidden avatar-fallback' : ''}`}>
                  <User size={40} className="text-blue-600" />
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 cursor-pointer shadow-lg">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Kích thước ảnh không được vượt quá 5MB');
                        return;
                      }
                      
                      // Validate file type
                      if (!file.type.startsWith('image/')) {
                        alert('Vui lòng chọn file ảnh');
                        return;
                      }
                      
                      // Convert to base64
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        const base64String = reader.result as string;
                        try {
                          setLoading(true);
                          setMessage({ type: '', text: '' });
                          
                          console.log('Updating avatar for user:', currentUser.id);
                          
                          // Update avatar in database
                          const response = await api.patch(`/users/${currentUser.id}`, {
                            avatar: base64String
                          });
                          
                          console.log('Avatar update response:', response.data);
                          
                          // Update currentUser state
                          const updatedUser = {
                            ...currentUser,
                            ...response.data,
                            avatar: base64String
                          };
                          setCurrentUser(updatedUser);
                          
                          // Update localStorage
                          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                          
                          // Reload profile to get latest data
                          await loadUserProfile();
                          
                          setMessage({ type: 'success', text: 'Cập nhật avatar thành công!' });
                          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                        } catch (error: any) {
                          console.error('Error updating avatar:', error);
                          console.error('Error details:', error.response?.data || error.message);
                          setMessage({ 
                            type: 'error', 
                            text: `Có lỗi xảy ra: ${error.response?.data?.message || error.message || 'Vui lòng thử lại'}` 
                          });
                        } finally {
                          setLoading(false);
                          // Reset input để có thể chọn lại file cùng tên
                          e.target.value = '';
                        }
                      };
                      reader.onerror = () => {
                        setMessage({ type: 'error', text: 'Có lỗi xảy ra khi đọc file. Vui lòng thử lại.' });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
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
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${activeTab === tab.id
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
                    type="button"
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
                      <select
                        name="city"
                        value={profileData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn thành phố</option>
                        {vietnamCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
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
                        type="button"
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
                    <select
                      name="location"
                      value={profileData.lookingFor.location}
                      onChange={handleLookingForChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn thành phố</option>
                      {vietnamCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lối sống mong muốn
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {lifestyleOptions.map(option => (
                        <button
                          type="button"
                          key={option}
                          onClick={() => handleLifestyleToggle(option)}
                          className={`p-2 text-sm rounded-md border ${profileData.lookingFor.lifestyle.includes(option)
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
                    type="button"
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
                      type="button"
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      className={`p-3 text-sm rounded-lg border ${profileData.interests.includes(interest)
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
                <div className="mt-4 md:col-span-2">
                  <button
                    type="button"
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
          </div>
        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && currentUser?.avatar && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowAvatarModal(false)}>
          <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-200 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <img
              src={currentUser.avatar}
              alt={profileData.fullName || 'Avatar'}
              className="max-w-full max-h-[90vh] rounded-lg object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.png';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}


export default Profile;
