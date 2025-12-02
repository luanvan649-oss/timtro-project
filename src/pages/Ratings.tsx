import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RatingModal from '../components/RatingModal';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Plus, 
  Eye, 
  MessageCircle,
  Award,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

function Ratings() {
  // currentUser sẽ cần được cung cấp thông qua một cơ chế khác
  // Tạm thời để trống hoặc gán giá trị mặc định để tránh lỗi
  const currentUser = { uid: 'fake-uid-123', email: 'user@example.com', displayName: 'Example User', metadata: { creationTime: new Date().toISOString() } };
  const [activeTab, setActiveTab] = useState('received');
  const [receivedRatings, setReceivedRatings] = useState<any[]>([]);
  const [givenRatings, setGivenRatings] = useState<any[]>([]);
  const [pendingRatings, setPendingRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRoommate, setSelectedRoommate] = useState(null);
  const [stats, setStats] = useState<{ averageRating: number; totalRatings: number; recommendationRate: number; categoryAverages: Record<string, number> }>({
    averageRating: 0,
    totalRatings: 0,
    recommendationRate: 0,
    categoryAverages: {}
  });

  // Mock data
  const mockReceivedRatings = [
    {
      id: 1,
      from: {
        id: 'user123',
        name: 'Minh Anh',
        avatar: '/api/placeholder/40/40',
        school: 'ĐH Khoa học Tự nhiên'
      },
      rating: 5,
      review: 'Bạn rất tuyệt vời! Sạch sẽ, thân thiện và rất tôn trọng không gian chung. Tôi rất recommend bạn cho những người khác.',
      categories: {
        cleanliness: 5,
        communication: 5,
        respectfulness: 5,
        quietness: 4,
        reliability: 5
      },
      recommend: true,
      createdAt: '2024-01-15T10:30:00Z',
      duration: '6 tháng'
    },
    {
      id: 2,
      from: {
        id: 'user456',
        name: 'Thu Hà',
        avatar: '/api/placeholder/40/40',
        school: 'ĐH Bách Khoa'
      },
      rating: 4,
      review: 'Bạn khá ổn, chỉ có điều thỉnh thoảng hơi ồn một chút vào ban đêm. Nhưng nhìn chung là một roommate tốt.',
      categories: {
        cleanliness: 4,
        communication: 4,
        respectfulness: 4,
        quietness: 3,
        reliability: 4
      },
      recommend: true,
      createdAt: '2024-01-10T14:20:00Z',
      duration: '3 tháng'
    },
    {
      id: 3,
      from: {
        id: 'user789',
        name: 'Quang Minh',
        avatar: '/api/placeholder/40/40',
        school: 'ĐH Kinh tế'
      },
      rating: 3,
      review: 'Bình thường, không có gì đặc biệt.',
      categories: {
        cleanliness: 3,
        communication: 3,
        respectfulness: 3,
        quietness: 3,
        reliability: 3
      },
      recommend: false,
      createdAt: '2024-01-05T09:15:00Z',
      duration: '2 tháng'
    }
  ];

  const mockGivenRatings = [
    {
      id: 1,
      to: {
        id: 'user111',
        name: 'Phương Linh',
        avatar: '/api/placeholder/40/40',
        school: 'ĐH Công nghệ'
      },
      rating: 4,
      review: 'Bạn rất tốt, chỉ có điều thỉnh thoảng quên dọn dẹp nhà bếp.',
      categories: {
        cleanliness: 3,
        communication: 5,
        respectfulness: 4,
        quietness: 4,
        reliability: 4
      },
      recommend: true,
      createdAt: '2024-01-12T16:45:00Z',
      duration: '4 tháng'
    }
  ];

  const mockPendingRatings = [
    {
      id: 1,
      roommate: {
        id: 'user222',
        name: 'Lan Anh',
        avatar: '/api/placeholder/40/40',
        school: 'ĐH Khoa học Tự nhiên'
      },
      endDate: '2024-01-20T00:00:00Z',
      duration: '5 tháng'
    },
    {
      id: 2,
      roommate: {
        id: 'user333',
        name: 'Hoàng Long',
        avatar: '/api/placeholder/40/40',
        school: 'ĐH Kinh tế'
      },
      endDate: '2024-01-25T00:00:00Z',
      duration: '3 tháng'
    }
  ];

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setReceivedRatings(mockReceivedRatings);
      setGivenRatings(mockGivenRatings);
      setPendingRatings(mockPendingRatings);
      
      // Calculate stats
      const totalRatings = mockReceivedRatings.length;
      const averageRating = totalRatings > 0 
        ? mockReceivedRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
        : 0;
      const recommendationRate = totalRatings > 0 
        ? (mockReceivedRatings.filter(r => r.recommend).length / totalRatings) * 100 
        : 0;
      
      // Calculate category averages
      const categoryAverages = {};
      if (totalRatings > 0) {
        const categories = ['cleanliness', 'communication', 'respectfulness', 'quietness', 'reliability'];
        categories.forEach(cat => {
          categoryAverages[cat] = mockReceivedRatings.reduce((sum, r) => sum + r.categories[cat], 0) / totalRatings;
        });
      }
      
      setStats({
        averageRating,
        totalRatings,
        recommendationRate,
        categoryAverages
      });
      
      setLoading(false);
    }, 1000);
  };

  const handleSubmitRating = async (ratingData) => {
    // Simulate API call
    console.log('Submitting rating:', ratingData);
    
    // Add to given ratings
    const newRating = {
      id: Date.now(),
      to: selectedRoommate,
      ...ratingData,
      createdAt: new Date().toISOString()
    };
    
    setGivenRatings(prev => [newRating, ...prev]);
    
    // Remove from pending
    setPendingRatings(prev => prev.filter(p => p.roommate.id !== selectedRoommate.id));
    
    setShowRatingModal(false);
    setSelectedRoommate(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={16} 
            className={`${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill={star <= rating ? 'currentColor' : 'none'}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const categoryLabels = {
    cleanliness: 'Vệ sinh',
    communication: 'Giao tiếp',
    respectfulness: 'Tôn trọng',
    quietness: 'Yên tĩnh',
    reliability: 'Đáng tin cậy'
  };

  const tabs = [
    { id: 'received', label: 'Đánh giá nhận được', count: receivedRatings.length },
    { id: 'given', label: 'Đánh giá đã cho', count: givenRatings.length },
    { id: 'pending', label: 'Chờ đánh giá', count: pendingRatings.length }
  ];

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đánh giá</h2>
        <p className="text-gray-600 mb-6">
          Đăng nhập để xem đánh giá từ bạn ghép trọ
        </p>
        <Link 
          to="/login" 
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header & Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Đánh giá</h1>
            <p className="text-gray-600">Quản lý đánh giá từ bạn ghép trọ</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-500">Điểm trung bình</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.recommendationRate.toFixed(0)}%</div>
              <div className="text-sm text-gray-500">Tỷ lệ giới thiệu</div>
            </div>
          </div>
        </div>

        {/* Category Stats */}
        {Object.keys(stats.categoryAverages).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.categoryAverages).map(([category, average]) => (
              <div key={category} className="text-center">
                <div className="text-lg font-semibold text-gray-900">{average.toFixed(1)}</div>
                <div className="text-sm text-gray-500">{categoryLabels[category]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
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
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : (
            <>
              {/* Received Ratings */}
              {activeTab === 'received' && (
                <div className="space-y-4">
                  {receivedRatings.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Chưa có đánh giá nào</p>
                    </div>
                  ) : (
                    receivedRatings.map(rating => (
                      <div key={rating.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <img
                            src={rating.from.avatar}
                            alt={rating.from.name}
                            className="w-12 h-12 rounded-full"
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900">
                                  {rating.from.name}
                                </h3>
                                <span className="text-sm text-gray-500">
                                  {rating.from.school}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                  {formatDate(rating.createdAt)}
                                </span>
                                {rating.recommend ? (
                                  <ThumbsUp size={16} className="text-green-500" />
                                ) : (
                                  <ThumbsDown size={16} className="text-red-500" />
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 mb-3">
                              {renderStars(rating.rating)}
                              <span className="text-sm text-gray-500">
                                Thời gian ở cùng: {rating.duration}
                              </span>
                            </div>
                            
                            <p className="text-gray-700 mb-3">{rating.review}</p>
                            
                            {/* Category Ratings */}
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                                {Object.entries(rating.categories).map(([category, score]) => (
                                  <div key={category} className="text-center">
                                    <div className="font-medium text-gray-900">{String(score)}</div>
                                    <div className="text-gray-500">{categoryLabels[category]}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Given Ratings */}
              {activeTab === 'given' && (
                <div className="space-y-4">
                  {givenRatings.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Chưa đánh giá ai</p>
                    </div>
                  ) : (
                    givenRatings.map(rating => (
                      <div key={rating.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <img
                            src={rating.to.avatar}
                            alt={rating.to.name}
                            className="w-12 h-12 rounded-full"
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900">
                                  {rating.to.name}
                                </h3>
                                <span className="text-sm text-gray-500">
                                  {rating.to.school}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(rating.createdAt)}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 mb-3">
                              {renderStars(rating.rating)}
                              <span className="text-sm text-gray-500">
                                Thời gian ở cùng: {rating.duration}
                              </span>
                            </div>
                            
                            <p className="text-gray-700 mb-3">{rating.review}</p>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Giới thiệu:</span>
                              {rating.recommend ? (
                                <span className="text-green-600 text-sm">Có</span>
                              ) : (
                                <span className="text-red-600 text-sm">Không</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Pending Ratings */}
              {activeTab === 'pending' && (
                <div className="space-y-4">
                  {pendingRatings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Không có đánh giá nào chờ xử lý</p>
                    </div>
                  ) : (
                    pendingRatings.map(pending => (
                      <div key={pending.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={pending.roommate.avatar}
                              alt={pending.roommate.name}
                              className="w-12 h-12 rounded-full"
                            />
                            
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {pending.roommate.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {pending.roommate.school}
                              </p>
                              <p className="text-sm text-gray-500">
                                Thời gian ở cùng: {pending.duration}
                              </p>
                              <p className="text-sm text-gray-500">
                                Kết thúc: {formatDate(pending.endDate)}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              setSelectedRoommate(pending.roommate);
                              setShowRatingModal(true);
                            }}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                          >
                            <Plus size={16} />
                            <span>Đánh giá</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setSelectedRoommate(null);
        }}
        roommate={selectedRoommate}
        onSubmit={handleSubmitRating}
      />
    </div>
  );
}

export default Ratings;
