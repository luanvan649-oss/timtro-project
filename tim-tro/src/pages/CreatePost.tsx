import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';  // Import API configuration

import {
  User,
  MapPin,
  DollarSign,
  School,
  Users,
  Calendar,
  Heart,
  Home,
  Plus,
  X,
  Phone
} from 'lucide-react';

const LOCATIONS = [
  "Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Quy Nhơn"
];

const DISTRICTS = {
  "Hồ Chí Minh": [
    "Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 9", "Quận 10", "Quận 11", "Quận 12",
    "Bình Thạnh", "Phú Nhuận", "Tân Bình", "Tân Phú", "Gò Vấp", "Bình Tân", "Thủ Đức",
    "Bình Chánh", "Nhà Bè", "Hóc Môn", "Củ Chi", "Cần Giờ"
  ],
  "Hà Nội": [
    "Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Long Biên", "Cầu Giấy", "Đống Đa", "Hai Bà Trưng", "Hoàng Mai", "Thanh Xuân", "Hà Đông",
    "Nam Từ Liêm", "Bắc Từ Liêm", "Thanh Trì", "Gia Lâm", "Đông Anh", "Sóc Sơn", "Mê Linh", "Sơn Tây",
    "Ba Vì", "Phúc Thọ", "Đan Phượng", "Hoài Đức", "Quốc Oai", "Thạch Thất", "Chương Mỹ", "Thanh Oai",
    "Thường Tín", "Phú Xuyên", "Ứng Hòa", "Mỹ Đức"
  ],
  "Đà Nẵng": [
    "Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ", "Hòa Vang", "Hoàng Sa"
  ],
  "Cần Thơ": [
    "Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn", "Thốt Nốt", "Phong Điền", "Cờ Đỏ", "Vĩnh Thạnh", "Thới Lai"
  ],
  "Quy Nhơn": [
    "Quy Nhơn", "An Nhơn", "Tuy Phước", "Phù Cát", "Phù Mỹ", "Hoài Nhơn", "Hoài Ân", "Tây Sơn", "Vân Canh", "Vĩnh Thạnh", "An Lão"
  ]
};

const CreatePost = () => {
  const navigate = useNavigate();
  const { postId } = useParams();

  type CurrentUser = { id: string;[key: string]: any } | null;
  const currentUser = useState<CurrentUser>(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? (JSON.parse(storedUser) as CurrentUser) : null;
  })[0];

  interface PostForm {
    id?: string;
    title: string;
    description: string;
    budget: string | number;
    isFree?: boolean;
    location: string;
    district: string;
    roomType: string;
    genderPreference: string;
    myGender: string;
    school: string;
    major: string;
    year: string;
    availableFrom: string;
    contactName: string;
    contactPhone: string;
    interests: string[];
    lifestyle: string[];
    images: string[]; // store image URLs
    createdAt?: string;
    updatedAt?: string;
    status?: string;
    views?: number;
    likes?: number;
    [key: string]: any;
  }

  const [formData, setFormData] = useState<PostForm>({
    title: '',
    description: '',
    budget: '',
    isFree: false,
    location: '',
    district: '',
    roomType: 'double',
    genderPreference: '',
    myGender: '',
    school: '',
    major: '',
    year: '',
    availableFrom: '',
    contactName: '',
    contactPhone: '',
    interests: [],
    lifestyle: [],
    images: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Keep for general loading, not image specific
  const [newImageUrl, setNewImageUrl] = useState('');

  // Load post data if editing
  useEffect(() => {
    const fetchPost = async () => {
      if (postId) {
        setLoading(true);
        try {
          const response = await api.get(`/posts/${postId}`); // Thay axios bằng api
          const post = response.data;
          if (post) {
            setFormData(post);
          } else {
            alert('Bài đăng không tồn tại hoặc bạn không có quyền chỉnh sửa.');
            navigate('/my-posts');
          }
        } catch (err) {
          alert('Không thể tải bài đăng để chỉnh sửa.');
          navigate('/my-posts');
          console.error('Error fetching post:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPost();
  }, [navigate, postId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value } = target;
    setFormData(prev => ({
      ...prev,
      [name]: value || ''
    } as PostForm));
  };

  const handleArrayToggle = (field: 'interests' | 'lifestyle', item: string) => {
    setFormData(prev => {
      const arr = prev[field] as string[];
      return ({
        ...prev,
        [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]
      } as PostForm);
    });
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    const files = filesList ? Array.from(filesList) : [];
    if (files.length === 0) return;

    setIsLoading(true);
    setError('');

    try {
      // Upload each file to server
      const uploadPromises = files.map(async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Return full URL to uploaded image
        return `http://localhost:3002${response.data.url}`;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      } as PostForm));

    } catch (err) {
      setError('Lỗi tải ảnh lên. Vui lòng thử lại.');
      console.error('Error uploading image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      const urlObject = new URL(url);
      // Check for common image extensions
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const pathname = urlObject.pathname.toLowerCase();
      return imageExtensions.some(ext => pathname.endsWith(ext));
    } catch {
      return false;
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim() === '') {
      setError('Vui lòng nhập URL hình ảnh.');
      return;
    }
    if (!isValidUrl(newImageUrl.trim())) {
      setError('URL hình ảnh không hợp lệ. Vui lòng nhập URL hợp lệ kết thúc bằng .jpg, .jpeg, .png, .gif, .webp, hoặc .svg.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()]
    } as PostForm));
    setNewImageUrl(''); // Clear input after adding
    setError('');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    } as PostForm));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề bài đăng');
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('Vui lòng nhập mô tả');
      setLoading(false);
      return;
    }
    if (!formData.isFree && !formData.budget) {
      setError('Vui lòng nhập ngân sách hoặc chọn miễn phí');
      setLoading(false);
      return;
    }
    if (!formData.contactName.trim()) {
      setError('Vui lòng nhập tên liên hệ');
      setLoading(false);
      return;
    }
    if (!formData.contactPhone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      setLoading(false);
      return;
    }
    if (!formData.location) {
      setError('Vui lòng chọn tỉnh/thành phố');
      setLoading(false);
      return;
    }
    if (!formData.district) {
      setError('Vui lòng chọn quận/huyện');
      setLoading(false);
      return;
    }

    try {
      // Get current user role
      const userRole = currentUser?.role || 'user';
      
      const postData = {
        ...formData,
        location: formData.location || '',
        district: formData.district || '',
        budget: formData.isFree ? 0 : parseInt(String(formData.budget) || '0'),
        isFree: formData.isFree || false,
        userId: currentUser ? currentUser.id : 'anonymous',
        createdAt: formData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // If user is admin, set status to 'approved', otherwise 'pending'
        status: userRole === 'admin' ? 'approved' : (formData.status || 'pending'),
        views: formData.views || 0,
        likes: formData.likes || 0,
      };

      if (postId) {
        await api.put(`/posts/${postId}`, postData);
        alert('Cập nhật bài đăng thành công!');
      } else {
        await api.post(`/posts`, postData);
        if (userRole === 'admin') {
          alert('Đăng bài thành công!');
        } else {
          alert('Đăng bài thành công! Bài đăng của bạn đang chờ được phê duyệt bởi quản trị viên.');
        }
      }
      navigate('/my-posts');
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu bài đăng.');
      console.error('Error saving post:', err);
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

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Tìm bạn ghép trọ</h1>
              <p className="text-gray-600">Tạo bài đăng để tìm bạn ghép trọ phù hợp</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Thông tin cơ bản
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề bài đăng *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="VD: Nữ sinh viên tìm bạn ghép trọ quận 1..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính của bạn *
                </label>
                <select
                  name="myGender"
                  value={formData.myGender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm bạn giới tính *
                </label>
                <select
                  name="genderPreference"
                  value={formData.genderPreference}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="any">Không quan trọng</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngân sách (VNĐ/tháng) *
                </label>
                <div className="flex gap-3 mb-3">
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    disabled={formData.isFree}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="VD: 3000000"
                    required={!formData.isFree}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFree"
                    checked={formData.isFree || false}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        isFree: e.target.checked,
                        budget: e.target.checked ? '' : formData.budget
                      });
                    }}
                    className="rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Miễn phí</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại phòng *
                </label>
                <select
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="single">Phòng đơn</option>
                  <option value="double">Phòng đôi</option>
                  <option value="dorm">Phòng tập thể</option>
                  <option value="studio">Studio</option>
                  <option value="apartment">Căn hộ</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mô tả về bản thân, điều kiện sống mong muốn..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Location & Education */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Vị trí & Học tập
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn tỉnh/thành phố</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!formData.location}
                >
                  <option value="">Chọn quận/huyện</option>
                  {(DISTRICTS as Record<string, string[]>)[formData.location]?.map((d: string) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trường học *
                </label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="VD: Đại học FPT"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngành học *
                </label>
                <select
                  name="major"
                  value={formData.major}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
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
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm học *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Chọn năm</option>
                  <option value="1">Năm 1</option>
                  <option value="2">Năm 2</option>
                  <option value="3">Năm 3</option>
                  <option value="4">Năm 4</option>
                  <option value="5">Năm 5</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Có thể dọn vào từ *
                </label>
                <input
                  type="date"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Sở thích
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {commonInterests.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleArrayToggle('interests', interest)}
                  className={`p-3 text-sm rounded-lg border transition-colors ${formData.interests.includes(interest)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Lifestyle */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Lối sống
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {lifestyleOptions.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleArrayToggle('lifestyle', option)}
                  className={`p-3 text-sm rounded-lg border transition-colors ${formData.lifestyle.includes(option)
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Thông tin liên hệ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên người liên hệ *
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="VD: Nguyễn Văn A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="VD: 0123456789"
                  required
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Hình ảnh</h2>

            {/* Add Image from URL */}
            <div className="mb-6">
              <label htmlFor="image-url" className="block text-sm font-medium text-gray-700 mb-2">
                Thêm ảnh từ URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="image-url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dán URL hình ảnh vào đây (ví dụ: https://example.com/image.jpg)"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newImageUrl.trim()}
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* Upload File Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors bg-gray-50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFileUpload}
                className="hidden"
                id="image-file-upload"
              />
              <label
                htmlFor="image-file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-gray-600 font-medium text-base">Hoặc nhấp để chọn hình ảnh từ máy tính</span>
                <span className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</span>
              </label>
            </div>

            {/* Selected Images */}
            {formData.images.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Hình ảnh đã chọn ({formData.images.length}):</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full aspect-square rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
                        <img
                          src={image}
                          alt={`Hình ảnh ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Xóa hình ảnh"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-gray-500 mt-1 block text-center">Ảnh {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-600">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading || isLoading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang đăng tin...
                  </>
                ) : (
                  'Đăng tin'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
