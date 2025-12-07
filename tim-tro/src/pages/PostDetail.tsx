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
  MessageCircle,
  Camera,
  Edit2,
  Check,
  X as XIcon
} from 'lucide-react';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [authorInfo, setAuthorInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // Thêm state isConnected
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  
  useEffect(() => {
    if (currentUser) {
      const userId = currentUser.id || currentUser.uid || null;
      setCurrentUserId(userId);
    }
  }, [currentUser]);
  
  useEffect(() => {
    // Load liked posts for this user
    if (currentUserId && post && post.id) {
      const likedKey = `likedPosts_${currentUserId}`;
      const savedLikes = localStorage.getItem(likedKey);
      if (savedLikes) {
        try {
          const likedArray = JSON.parse(savedLikes);
          setIsLiked(likedArray.includes(post.id));
        } catch (e) {
          console.error('Error parsing liked posts:', e);
        }
      }
    }
  }, [currentUserId, post]);

  // Fallback contact phone: prefer author profile phone, then post.contactPhone or post.contact.phone
  const contactPhone = (authorInfo && (authorInfo.phone || authorInfo.contactPhone)) ||
    (post && (post.contactPhone || post.contact?.phone || post.contact?.contactPhone)) || null;

  const fetchPost = useCallback(async () => {
    setLoading(true);
    let postData = null;

    try {
      if (!id) {
        navigate('/');
        return;
      }

      const response = await api.get(`/posts/${id}`); // Sử dụng api.get thay vì axios.get
      postData = response.data;
      console.log('Fetched post data:', postData);
      console.log('Post userId:', postData?.userId);
      console.log('Post authorId:', postData?.authorId);

      if (!postData) {
        console.error('Post not found');
        navigate('/');
        return;
      }

      const postWithDefaults = {
        ...postData,
        views: postData.views || 0,
        likes: postData.likes || 0,
      };

      setPost(postWithDefaults);
      
      // Increment views when viewing detail (only once per session)
      const viewKey = `post_viewed_${id}`;
      if (!sessionStorage.getItem(viewKey)) {
        const newViews = (postWithDefaults.views || 0) + 1;
        setPost((prev: any) => prev ? { ...prev, views: newViews } : null); // Optimistic update
        api.patch(`/posts/${id}`, {
          views: newViews
        }).then(() => {
          sessionStorage.setItem(viewKey, 'true');
        }).catch((viewError) => {
          console.error('Error updating views:', viewError);
          setPost((prev: any) => prev ? { ...prev, views: postWithDefaults.views || 0 } : null); // Revert on error
        });
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/');
      return; // Stop execution if post fetch fails
    }

    // Separate try-catch for author fetching so it doesn't block the post from showing
    const authorId = postData?.userId || postData?.authorId;
    if (authorId) {
      try {
        console.log('Fetching author info for userId:', authorId);
        const authorResponse = await api.get(`/users/${authorId}`);
        console.log('Fetched author info:', authorResponse.data);
        setAuthorInfo(authorResponse.data);
      } catch (error) {
        console.error('Error fetching author info:', error);
        // Try to get from currentUser if it's the same user
        if (currentUser && (currentUser.id === authorId || currentUser.uid === authorId)) {
          console.log('Using currentUser as authorInfo');
          setAuthorInfo(currentUser);
        }
      }
    } else {
      console.warn('Post has no userId or authorId');
      // If no authorId, try to use currentUser if they are viewing their own post
      if (currentUser) {
        console.log('No authorId found, checking if currentUser is the author');
        // This is a fallback - ideally post should have userId/authorId
      }
    }

    setLoading(false);
  }, [id, navigate, currentUser]);
  
  // Function to reload author info
  const reloadAuthorInfo = useCallback(async () => {
    if (post && (post.userId || post.authorId)) {
      try {
        const authorId = post.userId || post.authorId;
        const authorResponse = await api.get(`/users/${authorId}`);
        console.log('Reloaded author info:', authorResponse.data);
        setAuthorInfo(authorResponse.data);
      } catch (error) {
        console.error('Error reloading author info:', error);
      }
    } else if (currentUser && currentUser.id) {
      // If post doesn't have userId, try to reload from currentUser
      try {
        const authorResponse = await api.get(`/users/${currentUser.id}`);
        console.log('Reloaded author info from currentUser:', authorResponse.data);
        setAuthorInfo(authorResponse.data);
      } catch (error) {
        console.error('Error reloading author info from currentUser:', error);
      }
    }
  }, [post, currentUser]);

  useEffect(() => {
    fetchPost();
  }, [id, navigate, fetchPost]);
  
  // Reload author info when currentUser changes (e.g., after login or profile update)
  useEffect(() => {
    if (post && currentUser && (post.userId || post.authorId)) {
      const authorId = post.userId || post.authorId;
      // Only reload if currentUser is the author
      if (currentUser.id === authorId || currentUser.uid === authorId) {
        reloadAuthorInfo();
      }
    }
  }, [currentUser, post, reloadAuthorInfo]);

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
          text: `${post.title} - ${post.type === 'room_listing' ? formatPrice(post.price, post.type) : formatPrice(post.budget, post.type, post.isFree)}`,
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
  
  const handleLike = async () => {
    if (!currentUserId) {
      alert('Vui lòng đăng nhập để thích bài đăng.');
      return;
    }
    
    if (!post) return;
    
    try {
      const wasLiked = isLiked;
      const newLikes = wasLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1;
      
      // Optimistic update
      setPost((prev: any) => prev ? { ...prev, likes: newLikes } : null);
      setIsLiked(!wasLiked);
      
      // Update in database
      await api.patch(`/posts/${post.id}`, {
        likes: newLikes
      });
      
      // Update localStorage
      const likedKey = `likedPosts_${currentUserId}`;
      const likedPosts = JSON.parse(localStorage.getItem(likedKey) || '[]');
      if (wasLiked) {
        const updated = likedPosts.filter((postId: string) => postId !== post.id);
        localStorage.setItem(likedKey, JSON.stringify(updated));
      } else {
        if (!likedPosts.includes(post.id)) {
          likedPosts.push(post.id);
          localStorage.setItem(likedKey, JSON.stringify(likedPosts));
        }
      }
      
      // Create notification for admin and post author when user likes (only if liking, not unliking)
      if (!wasLiked) {
        try {
          console.log('Creating notification for post like...');
          
          // Get current user info
          const userResponse = await api.get(`/users/${currentUserId}`);
          const user = userResponse.data;
          
          // Find admin users and post author
          const adminsResponse = await api.get(`/users?role=admin`);
          const admins = Array.isArray(adminsResponse.data) ? adminsResponse.data : [];
          
          // Get post author
          const authorResponse = await api.get(`/users/${post.userId || post.authorId}`);
          const author = authorResponse.data;
          
          // List of users to notify: admins + post author (if not already admin)
          const usersToNotify = [...admins];
          if (author && author.id && !admins.some((a: any) => a.id === author.id)) {
            usersToNotify.push(author);
          }
          
          console.log('Users to notify:', usersToNotify.map((u: any) => u.id));
          
          if (usersToNotify.length === 0) {
            console.warn('No users to notify.');
            return;
          }
          
          // Create notification for each user (admin + author)
          const notificationPromises = usersToNotify.map((targetUser: any) => {
            const notificationId = `post_liked_${Date.now()}_${targetUser.id}_${post.id}`;
            return api.post(`/notifications`, {
              id: notificationId,
              type: 'post_liked',
              userId: targetUser.id,
              fromUser: {
                fullName: user.fullName || user.email || 'Người dùng',
                id: user.id || currentUserId
              },
              data: {
                postTitle: post.title,
                postId: post.id
              },
              isRead: false,
              createdAt: new Date().toISOString()
            }).then(res => {
              console.log(`Notification created for user ${targetUser.id}:`, res.data);
              return res.data;
            }).catch(err => {
              console.error(`Error creating notification for user ${targetUser.id}:`, err);
              return null;
            });
          });
          
          const createdNotifications = await Promise.all(notificationPromises);
          console.log('All notifications created:', createdNotifications.filter(n => n !== null));
          
          // Emit socket event if available
          if ((window as any).socket) {
            usersToNotify.forEach((targetUser: any) => {
              (window as any).socket.emit('newNotification', {
                id: `post_liked_${Date.now()}_${targetUser.id}_${post.id}`,
                type: 'post_liked',
                userId: targetUser.id,
                fromUser: {
                  fullName: user.fullName || user.email || 'Người dùng',
                  id: user.id || currentUserId
                },
                data: {
                  postTitle: post.title,
                  postId: post.id
                },
                isRead: false,
                createdAt: new Date().toISOString()
              });
            });
            console.log('Socket events emitted');
          }
        } catch (notifError) {
          console.error('Error creating like notification:', notifError);
        }
      }
    } catch (error) {
      console.error('Error updating likes:', error);
      // Revert optimistic update on error
      if (post) {
        setPost((prev: any) => prev ? { ...prev, likes: post.likes || 0 } : null);
        setIsLiked(isLiked);
      }
      alert('Có lỗi xảy ra khi cập nhật lượt thích. Vui lòng thử lại.');
    }
  };

  const getZaloHref = (phone) => {
    if (!phone) return null;
    // Keep only digits
    let digits = String(phone).replace(/\D/g, '');
    // If local Vietnamese number starting with 0 and length 10, convert to country code 84
    if (digits.length === 10 && digits.startsWith('0')) {
      digits = '84' + digits.slice(1);
    }
    // If already starts with country code (e.g., 84...), leave as-is
    // Prefer Zalo Web chat URL
    const webHref = `https://chat.zalo.me/?phone=${digits}`;
    // Fallback to zalo.me if needed
    const fallback = `https://zalo.me/${digits}`;
    return { webHref, fallback };
  };

  const formatPrice = (value, type, isFree = false) => {
    if (isFree) {
      return 'Miễn phí';
    }
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
            onClick={handleLike}
            className={`p-2 rounded-full flex items-center gap-2 ${isLiked
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            <span className="text-sm">{post?.likes || 0}</span>
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
                ${post.type === 'room_listing' ? formatPrice(post.price, post.type) : formatPrice(post.budget, post.type, post.isFree)}
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
              <div className="relative group">
                <img
                  key={authorInfo?.avatar || 'default'}
                  src={authorInfo?.avatar || '/default-avatar.png'}
                  alt={authorInfo?.fullName || authorInfo?.email || 'Người dùng'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.png';
                  }}
                />
                {currentUser && currentUser.id === authorInfo?.id && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="avatar-upload"
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
                        
                        // Convert to base64 or upload to server
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          const base64String = reader.result as string;
                          try {
                            console.log('Updating avatar for user:', currentUser.id);
                            
                            // Update avatar in database
                            const response = await api.patch(`/users/${currentUser.id}`, {
                              avatar: base64String
                            });
                            
                            console.log('Avatar update response:', response.data);
                            
                            // Update localStorage first
                            const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                            const updatedUser = {
                              ...storedUser,
                              ...response.data,
                              avatar: base64String
                            };
                            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                            setCurrentUser(updatedUser);
                            
                            // Reload author info from server to get latest data
                            await reloadAuthorInfo();
                            
                            alert('Cập nhật avatar thành công!');
                          } catch (error: any) {
                            console.error('Error updating avatar:', error);
                            console.error('Error details:', error.response?.data || error.message);
                            alert(`Có lỗi xảy ra khi cập nhật avatar: ${error.response?.data?.message || error.message || 'Vui lòng thử lại'}`);
                          }
                        };
                        reader.onerror = () => {
                          alert('Có lỗi xảy ra khi đọc file. Vui lòng thử lại.');
                        };
                        reader.readAsDataURL(file);
                        
                        // Reset input để có thể chọn lại file cùng tên
                        e.target.value = '';
                      }}
                    />
                    <span className="sr-only">Cập nhật avatar</span>
                  </label>
                )}
              </div>
              <div className="flex-1">
                {isEditingName && currentUser && currentUser.id === authorInfo?.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Nhập tên của bạn"
                      autoFocus
                    />
                    <button
                      onClick={async () => {
                        try {
                          const response = await api.patch(`/users/${currentUser.id}`, {
                            fullName: editingName
                          });
                          
                          // Update localStorage first
                          const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                          const updatedUser = {
                            ...storedUser,
                            ...response.data,
                            fullName: editingName
                          };
                          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                          setCurrentUser(updatedUser);
                          
                          // Reload author info from server to get latest data
                          await reloadAuthorInfo();
                          
                          setIsEditingName(false);
                          alert('Cập nhật tên thành công!');
                        } catch (error: any) {
                          console.error('Error updating name:', error);
                          alert(`Có lỗi xảy ra: ${error.response?.data?.message || error.message || 'Vui lòng thử lại'}`);
                        }
                      }}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setEditingName(authorInfo?.fullName || '');
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                ) : (
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span>{authorInfo?.fullName || authorInfo?.email || 'Người dùng ẩn danh'}</span>
                    {authorInfo?.verified && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                    {currentUser && currentUser.id === authorInfo?.id && (
                      <button
                        onClick={() => {
                          setEditingName(authorInfo?.fullName || '');
                          setIsEditingName(true);
                        }}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Chỉnh sửa tên"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </h3>
                )}
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
                    type="button"
                    onClick={() => window.location.href = `tel:${contactPhone}`}
                    className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
                  >
                    <Phone size={20} />
                    <span>Gọi điện</span>
                  </button>
                  {/* Zalo Web button - opens chat.zalo.me in a new tab */}
                  {contactPhone && (
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          const urls = getZaloHref(contactPhone);
                          if (urls && urls.webHref) window.open(urls.webHref, '_blank');
                          else alert('Số điện thoại không hợp lệ để mở Zalo Web.');
                        }}
                        className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 flex items-center justify-center space-x-2"
                      >
                        <MessageCircle size={20} />
                        <span>Mở Zalo Web</span>
                      </button>

                      <div className="mt-2 text-sm text-center">
                        <p>Nếu Zalo Web không mở được, thử liên kết thay thế:</p>
                        <div className="flex items-center justify-center space-x-2 mt-1">
                          <a
                            href={getZaloHref(contactPhone).fallback}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            Mở Zalo.me
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              const urls = getZaloHref(contactPhone);
                              const toCopy = (urls && urls.webHref) || (urls && urls.fallback) || '';
                              if (toCopy) {
                                navigator.clipboard.writeText(toCopy).then(() => {
                                  alert('Đã sao chép liên kết Zalo vào clipboard');
                                }).catch(() => {
                                  alert('Không thể sao chép liên kết');
                                });
                              }
                            }}
                            className="px-2 py-1 bg-gray-100 rounded border text-sm"
                          >
                            Sao chép liên kết
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
