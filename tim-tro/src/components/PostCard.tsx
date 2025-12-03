import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ConnectionModal from './ConnectionModal';

interface Post {
  id: string;
  title: string;
  type: string;
  price?: number;
  budget?: number;
  area?: number;
  location: string;
  district?: string;
  images?: string[];
  description: string;
  authorId: string;
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
}

interface CurrentUser {
  uid?: string;
  id?: string;
  fullName?: string;
  email?: string;
  [key: string]: any;
}

const PostCard = ({ post }: { post: Post }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null); // Simulated currentUser
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  useEffect(() => {
    // Load current user from localStorage (simulating auth)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const formatPrice = (price: number | undefined, type: string) => {
    if (price === undefined || price === null) {
      return 'N/A';
    }
    if (type === 'room_listing') {
      if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1)} triệu/tháng`;
      }
      return `${price.toLocaleString()} đồng/tháng`;
    } else if (type === 'roommate_finding') {
      if (price >= 1000000000) {
        return `${(price / 1000000000).toFixed(1)} tỷ`;
      }
      if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1)} triệu`;
      }
      return `${price.toLocaleString()} đồng`;
    }
    return 'N/A';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hôm nay';
    } else if (diffDays <= 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
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

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
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
            <h3 className="text-lg font-medium text-red-600 hover:text-red-700 cursor-pointer line-clamp-2 transition-colors">
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
                {formatPrice(post.budget, post.type)}
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
              <img
                src={post.authorAvatar || '/default-avatar.png'}
                alt={post.authorName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-gray-800 line-clamp-1">
                  {post.authorName || 'Chủ nhà'}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(post.createdAt)}
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

              {/* Save Button */}
              <button
                onClick={handleLike}
                className={`p-2 rounded border transition-colors ${isLiked
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                aria-label="Lưu tin này"
              >
                <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
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
