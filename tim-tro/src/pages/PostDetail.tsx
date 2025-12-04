import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; // Đảm bảo bạn đã import API client của mình
import ConnectionModal from '../components/ConnectionModal';
import {
  MapPin,
  DollarSign,
  Heart,
  Eye,
  Share2,
  Phone,
  ArrowLeft,
  CheckCircle,
  Home,
  Wifi,
  Car,
  Coffee,
  Snowflake,
  Shirt,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  MessageCircle
} from 'lucide-react';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  })[0];

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [authorInfo, setAuthorInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // Thêm state isConnected

  const fetchPost = useCallback(async () => {
    setLoading(true);
    let postData = null;

    try {
      if (!id) {
        navigate('/');
        return;
      }

      const response = await api.get(`/posts/${id}`); // Sử dụng api.get thay vì axios.get
      const postData = response.data;
      console.log('Fetched post data:', postData);

      if (!postData) {
        console.error('Post not found');
        navigate('/');
        return;
      }

      setPost(postData);
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/');
      return; // Stop execution if post fetch fails
    }

    // Separate try-catch for author fetching so it doesn't block the post from showing
    if (postData && postData.userId) {
      try {
        const authorResponse = await api.get(`/users/${postData.userId}`); // Sử dụng api.get thay vì axios.get
        setAuthorInfo(authorResponse.data);
      } catch (error) {
        console.error('Error fetching author info:', error);
        // Do NOT navigate away if author info fails to load
      }
    }

    setLoading(false);
  }, [id, navigate]);

  useEffect(() => {
    fetchPost();
  }, [id, navigate, fetchPost]);

  // Thêm hàm fetchConnectionStatus phần kiểm tra trạng thái kết nối:
  const fetchConnectionStatus = useCallback(async () => {
    if (currentUser && authorInfo) {
      try {
        const response = await api.get(`/connections/status/${currentUser.id}/${authorInfo.id}`); // Sử dụng api.get thay vì axios.get
        setIsConnected(response.data.isConnected);
      } catch (error) {
        console.error('Error checking connection status:', error);
        setIsConnected(false);
      }
    }
  }, [currentUser, authorInfo]);

  // Gọi fetchConnectionStatus trong useEffect
  useEffect(() => {
    if (currentUser && authorInfo) {
      fetchConnectionStatus();
    }
  }, [currentUser, authorInfo, fetchConnectionStatus]);

  // Debugging logs
  useEffect(() => {
    console.log('currentUser:', currentUser);
    console.log('authorInfo:', authorInfo);
    if (currentUser && authorInfo) {
      console.log('currentUser.id:', currentUser.id); // Sửa từ .uid sang .id
      console.log('authorInfo.id:', authorInfo.id);
      console.log('currentUser.id !== authorInfo.id:', currentUser.id !== authorInfo.id); // Sửa từ .uid sang .id
    }
    console.log('isConnected:', isConnected);
  }, [currentUser, authorInfo, isConnected]);


  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `${post.title} - ${post.type === 'room_listing' ? formatPrice(post.price, post.type) : formatPrice(post.budget, post.type)}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã copy link bài đăng!');
    }
  };

  // Thay đổi trạng thái bài đăng
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const formatPrice = (value, type) => {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    // For roommate_finding budget, display as raw number with 'triệu' suffix if applicable
    if (type === 'roommate_finding') {
      if (value >= 1000000) {
        if (value % 1000000 === 0) {
          return `${value}.0 triệu`;
        }
        return `${(value / 1000000).toFixed(1)} triệu`;
      }
      return `${value.toLocaleString('vi-VN')} đồng`;
    } else { // For room_listing price
      if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)} tỷ`;
      }
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)} triệu`;
      }
      return `${value.toLocaleString('vi-VN')} đồng`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === post.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? post.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài đăng</h2>
        <p className="text-gray-600 mb-4">Bài đăng có thể đã được xóa hoặc không tồn tại.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Quay lại
        </button>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-full ${isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
          >
            <Share2 size={20} />
          </button>

          <div className="flex items-center text-gray-500">
            <Eye size={16} className="mr-1" />
            <span>{post.views} lượt xem</span>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="mb-8">
        {post.images && post.images.length > 0 ? (
          <div className="relative">
            <img
              src={post.images[currentImageIndex]}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg cursor-pointer"
              onClick={() => setShowImageModal(true)}
            />

            {post.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  tabIndex={0}
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  tabIndex={0}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {post.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  tabIndex={0}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-96 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500">
            Không có hình ảnh
          </div>
        )}

        {post.images && post.images.length > 1 && (
          <div className="flex space-x-2 mt-4 overflow-x-auto">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${post.title} ${index + 1}`}
                className={`w-20 h-20 object-cover rounded-lg cursor-pointer ${index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                  }`}
                onClick={() => setCurrentImageIndex(index)}
                tabIndex={0}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
            <p className="text-sm text-gray-500 mb-4">Ngày đăng: {formatDate(post.createdAt)}</p>

            {/* Price, Location, Type */}
            <div className="flex items-center text-blue-600 mb-2">
              <span className="text-2xl font-bold">
                ${post.type === 'room_listing' ? formatPrice(post.price, post.type) : formatPrice(post.budget, post.type)}
              </span>
              <span className="text-gray-600 ml-6 text-base">
                {post.district}, {post.location}
                {post.type === 'roommate_finding' && (
                  <span> &bull; Tìm bạn ghép</span>
                )}
              </span>
            </div>

            <div className="prose max-w-none mb-6">
              <h3 className="text-lg font-semibold mb-2">Mô tả chi tiết</h3>
              <p className="text-gray-700 leading-relaxed">{post.description}</p>
            </div>

            {/* Property Details / Roommate Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Thông tin tìm bạn ghép</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loại phòng:</span>
                    <span className="font-medium">{post.roomType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giới tính mong muốn:</span>
                    <span className="font-medium">{post.genderPreference || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trường:</span>
                    <span className="font-medium">{post.school || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngành:</span>
                    <span className="font-medium">{post.major || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Năm học:</span>
                    <span className="font-medium">{post.year || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Có thể vào ở từ:</span>
                    <span className="font-medium">{formatDate(post.availableFrom) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên liên hệ:</span>
                    <span className="font-medium">{post.contactName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số điện thoại:</span>
                    <span className="font-medium">{post.contactPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interests & Lifestyle - Only for roommate_finding posts */}
            {post.type === 'roommate_finding' && (post.interests?.length > 0 || post.lifestyle?.length > 0) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Sở thích & Lối sống</h3>
                <div className="space-y-3">
                  {post.interests?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Sở thích:</h4>
                      <div className="flex flex-wrap gap-2">
                        {post.interests.map(interest => (
                          <span key={interest} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {post.lifestyle?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Lối sống:</h4>
                      <div className="flex flex-wrap gap-2">
                        {post.lifestyle.map(item => (
                          <span key={item} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rules (Removed as not in db.json) */}

            {/* Nearby Places (Removed as not in db.json) */}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={authorInfo?.avatar || '/default-avatar.png'}
                alt={authorInfo?.fullName || 'Người dùng'}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center">
                  {authorInfo?.fullName || 'Người dùng ẩn danh'}
                  {authorInfo?.verified && (
                    <CheckCircle size={16} className="ml-1 text-green-500" />
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  Tham gia từ {formatDate(authorInfo?.createdAt || new Date())}
                </p>
              </div>
            </div>


            <div className="space-y-3">
              {currentUser && currentUser.id !== authorInfo?.id ? ( // Sửa từ .uid sang .id
                <>
                  {!isConnected && ( // Chỉ hiển thị nút kết nối nếu chưa kết nối
                    <button
                      onClick={() => setShowConnectionModal(true)}
                      className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 flex items-center justify-center space-x-2"
                    >
                      <UserPlus size={20} />
                      <span>Gửi lời mời kết nối</span>
                    </button>
                  )}

                  {authorInfo?.zalo && (
                    <button
                      onClick={() => window.open(`https://zalo.me/${authorInfo.zalo}`, '_blank')}
                      className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 flex items-center justify-center space-x-2"
                    >
                      <MessageCircle size={20} />
                      <span>Nhắn Zalo</span>
                    </button>
                  )}

                  <button
                    onClick={() => window.location.href = `tel:${authorInfo.phone}`}
                    className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
                  >
                    <Phone size={20} />
                    <span>Gọi điện</span>
                  </button>
                </>
              ) : (
                <p className="text-center text-gray-500">Đây là bài đăng của bạn.</p>
              )}
            </div>
          </div>

          {/* Safety Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Lưu ý an toàn</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Gặp mặt tại nơi công cộng</li>
              <li>• Kiểm tra giấy tờ chủ nhà</li>
              <li>• Không chuyển tiền trước khi xem phòng</li>
              <li>• Báo cáo hành vi đáng ngờ</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full mx-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X size={24} />
            </button>

            <img
              src={post.images[currentImageIndex]}
              alt={post.title}
              className="w-full h-auto max-h-screen object-contain"
            />

            {post.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  tabIndex={0}
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  tabIndex={0}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {post.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  tabIndex={0}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Connection Modal */}
      {showConnectionModal && (
        <ConnectionModal
          isOpen={showConnectionModal}
          onClose={() => setShowConnectionModal(false)}
          post={post}
          targetUser={{
            uid: authorInfo?.id,
            fullName: authorInfo?.fullName || '',
            avatar: authorInfo?.avatar || '',
            school: authorInfo?.school || '',
            major: authorInfo?.major || ''
          }}
          currentUser={currentUser} // Pass currentUser to ConnectionModal
        />
      )}
    </div>
  );
}

export default PostDetail;
