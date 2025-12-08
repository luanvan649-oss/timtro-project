import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, User } from 'lucide-react';
import ConnectionModal from './ConnectionModal';
import api from '../api';

interface Post {
  id: string;
  title: string;
  type:  'room_listing' | 'roommate_finding';
  price?: number;
  budget?: number;
  isFree?: boolean;
  area?: number;
  location: string;
  district?: string;
  images?: string[];
  description: string;
  authorId?: string;
  userId?: string; // db.json uses userId
  authorName?: string;
  authorAvatar?: string;
  createdAt: string;
  author?: any;
  contactPhone?: string;
  contact?: { phone: string };
  roomType?: string;
  genderPreference?: string;
  school?: string;
  major?: string;
  year?: string;
  amenities?: string[];
  views?: number;
  likes?: number;
}

interface CurrentUser {
  uid?: string;
  id?: string;
  fullName?: string;
  email?: string;
  [key: string]: any;
}

interface PostCardProps {
  post: Post;
}
const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [postLikes, setPostLikes] = useState(post.likes || 0);
  const [postViews, setPostViews] = useState(post.views || 0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authorInfo, setAuthorInfo] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        const userId = user.id || user.uid || null;
        setCurrentUserId(userId);
        
        // Load liked posts for this user
        if (userId) {
          const likedKey = `likedPosts_${userId}`;
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
      } catch (error) {
        console.error('Error parsing currentUser from localStorage:', error);
      }
    }
    
    // Initialize views and likes
    setPostLikes(post.likes || 0);
    setPostViews(post.views || 0);
  }, [post.id, post.likes, post.views]);

  // Fetch author info
  useEffect(() => {
    const fetchAuthorInfo = async () => {
      // Try both authorId and userId (db.json uses userId)
      const authorId = (post as any).authorId || (post as any).userId;
      if (!authorId) {
        console.log('PostCard: No authorId/userId found for post:', post.id);
        setAuthorInfo(null);
        return;
      }

      try {
        console.log('PostCard: Fetching author info for userId:', authorId);
        const response = await api.get(`/users/${authorId}`);
        console.log('PostCard: Author info fetched:', response.data);
        setAuthorInfo(response.data);
      } catch (error) {
        console.error('PostCard: Error fetching author info for userId:', authorId, error);
        setAuthorInfo(null);
      }
    };

    fetchAuthorInfo();
  }, [(post as any).authorId, (post as any).userId, post.id]);
 const getCurrentUserId = () => {
    return currentUser?.id || currentUser?.uid || '';
  };

  const isOwnPost = currentUser && ((post as any).authorId || (post as any).userId) === getCurrentUserId();

    const formatPrice = (price: number | undefined, type: Post['type'], isFree: boolean | undefined = false) => {
    if (isFree) {
      return 'Miễn phí';
    }
    if (price === undefined || price === null) {
      return 'N/A';
    }
    if (type === 'room_listing') {
      if (price >= 1_000_000) {
        return `${(price / 1_000_000).toFixed(1)} triệu/tháng`;
      }
      return `${price.toLocaleString()} đồng/tháng`;
    } else if (type === 'roommate_finding') {
      if (price >= 1_000_000_000) {
        return `${(price / 1_000_000_000).toFixed(1)} tỷ`;
      }
      if (price >= 1_000_000) {
        return `${(price / 1_000_000).toFixed(1)} triệu`;
      }
      return `${price.toLocaleString()} đồng`;
    }
    return 'N/A';
  };

    const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Không rõ thời gian';

    // Always return the actual date in format: dd/mm/yyyy
    return date.toLocaleDateString('vi-VN');
  };

   const nextImage = () => {
    if (post.images && post.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === (post.images?.length ?? 0) - 1 ? 0 : prev + 1
      );
    }
  };

 const prevImage = () => {
    if (post.images && post.images.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? (post.images?.length ?? 1) - 1 : prev - 1
      );
    }
  };

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    if (!currentUserId) {
      alert('Vui lòng đăng nhập để thích bài đăng.');
      return;
    }
    
    try {
      const wasLiked = isLiked;
      const newLikes = wasLiked ? postLikes - 1 : postLikes + 1;
      
      // Update in database
      await api.patch(`/posts/${post.id}`, {
        likes: newLikes
      });
      
      // Update local state
      setPostLikes(newLikes);
      setIsLiked(!wasLiked);
      
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
          
          // Get post author (try both authorId and userId)
          const authorId = (post as any).authorId || (post as any).userId;
          if (authorId) {
            try {
              const authorResponse = await api.get(`/users/${authorId}`);
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
            } catch (authorError) {
              console.error('Error fetching author:', authorError);
              // Still notify admins even if author fetch fails
              if (admins.length > 0) {
                const notificationPromises = admins.map((targetUser: any) => {
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
                  }).catch(err => {
                    console.error(`Error creating notification for admin ${targetUser.id}:`, err);
                    return null;
                  });
                });
                await Promise.all(notificationPromises);
              }
            }
          } else {
            // No authorId, only notify admins
            if (admins.length > 0) {
              const notificationPromises = admins.map((targetUser: any) => {
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
                }).catch(err => {
                  console.error(`Error creating notification for admin ${targetUser.id}:`, err);
                  return null;
                });
              });
              await Promise.all(notificationPromises);
            }
          }
        } catch (notifError) {
          console.error('Error creating like notification:', notifError);
        }
      }
    } catch (error) {
      console.error('Error updating likes:', error);
      alert('Có lỗi xảy ra khi cập nhật lượt thích. Vui lòng thử lại.');
    }
  };
  
  const handleViewDetails = async () => {
    try {
      const viewerId = currentUserId || 'guest';
      const viewKey = `post_viewed_${post.id}_${viewerId}`;

      if (!localStorage.getItem(viewKey)) {
        const newViews = (postViews || 0) + 1;
        try {
          await api.patch(`/posts/${post.id}`, { views: newViews });
          setPostViews(newViews);
          localStorage.setItem(viewKey, 'true');
        } catch (err) {
          console.error('Error updating views:', err);
        }
      }

      navigate(`/post/${post.id}`);
    } catch (error) {
      console.error('Error updating views:', error);
      // Still navigate even if update fails
      navigate(`/post/${post.id}`);
    }
  };

  return (
    <div className="bg-white rounded shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex space-x-4">
        {/* Image Gallery */}
        <div className="relative flex-shrink-0">
          <div className="w-48 h-36 rounded overflow-hidden bg-gray-100 relative">
            {post.images && post.images.length > 0 ? (
              <>
                <img
                  src={post.images[currentImageIndex]}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />

                {/* Image Counter */}
                {post.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    {post.images.length}
                  </div>
                )}

                {/* Navigation Arrows */}
                {post.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title with VIP Badge */}
          <div className="mb-2">
            <h3 
              onClick={handleViewDetails}
              className="text-lg font-medium text-red-600 hover:text-red-700 cursor-pointer line-clamp-2 transition-colors"
            >
              <span className="inline-flex items-center mr-2">
                {/* Star Rating */}
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </span>
              {post.title}
            </h3>
          </div>

          {/* Price and Details */}
          {post.type === 'room_listing' && (
            <div className="mb-2 flex items-center text-sm">
              <span className="text-green-600 font-semibold text-lg">
                {formatPrice(post.price, post.type)}
              </span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-600">
                {post.area} m²
              </span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-600">
                {post.district ? `${post.district}, ${post.location}` : post.location}
              </span>
            </div>
          )}

          {post.type === 'roommate_finding' && (
            <div className="mb-2 flex items-center text-sm">
              <span className="text-green-600 font-semibold text-lg">
                {formatPrice(post.budget, post.type, post.isFree)}
              </span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-600">
                {post.roomType || 'N/A'}
              </span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-600">
                {post.genderPreference || 'N/A'}
              </span>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
            {post.description}
          </p>

          {/* Amenities for room_listing */}
          {post.type === 'room_listing' && post.amenities && post.amenities.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {post.amenities.slice(0, 4).map((amenity, index) => (
                  <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                    {amenity}
                  </span>
                ))}
                {post.amenities.length > 4 && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    +{post.amenities.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Additional details for roommate_finding */}
          {post.type === 'roommate_finding' && (
            <div className="text-sm text-gray-600 mb-3">
              <p><strong>Trường:</strong> {post.school || 'N/A'}</p>
              <p><strong>Ngành:</strong> {post.major || 'N/A'}</p>
              <p><strong>Năm học:</strong> {post.year || 'N/A'}</p>
            </div>
          )}


          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Author and Date */}
            <div className="flex items-center space-x-2 flex-1">
              {authorInfo && authorInfo.avatar ? (
                <img
                  key={`author-avatar-${authorInfo.id}-${authorInfo.avatar?.substring(0, 20)}`}
                  src={authorInfo.avatar}
                  alt={authorInfo.fullName || authorInfo.email || 'Chủ nhà'}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.parentElement?.querySelector('.author-avatar-placeholder') as HTMLElement;
                    if (placeholder) {
                      placeholder.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div 
                className={`author-avatar-placeholder w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-gray-100 ${authorInfo && authorInfo.avatar ? 'hidden' : 'flex'}`}
              >
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-gray-800 line-clamp-1 font-semibold">
                  {authorInfo ? (authorInfo.fullName || authorInfo.email || 'Chủ nhà') : (post.authorName || 'Chủ nhà')}
                </div>
                <div className="text-xs text-gray-500">
                  {post?.createdAt ? formatDate(post.createdAt) : 'Không rõ thời gian'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Contact Button */}
              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {post.contactPhone || post.contact?.phone || '0123456789'}
              </button>

              {/* Connection Button */}
              {currentUser && currentUser.uid !== post.authorId && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowConnectionModal(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center"
                >
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  Kết nối
                </button>
              )}

              {/* Like and View Icons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`p-2 rounded border transition-colors flex items-center gap-1 ${isLiked
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  aria-label="Thích bài đăng"
                >
                  <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                  <span className="text-xs">{postLikes}</span>
                </button>
                <div className="p-2 rounded border bg-gray-50 border-gray-200 text-gray-600 flex items-center gap-1">
                  <Eye size={16} />
                  <span className="text-xs">{postViews}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Modal */}
      {showConnectionModal && (
        <ConnectionModal
          isOpen={showConnectionModal}
          onClose={() => setShowConnectionModal(false)}
          post={post}
          targetUser={post.author}
          currentUser={currentUser as any}
        />
      )}
    </div>
  );
};

export default PostCard;
