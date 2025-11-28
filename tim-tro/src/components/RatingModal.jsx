import React, { useState } from 'react';
import { X, Star, Send, ThumbsUp, ThumbsDown } from 'lucide-react';

function RatingModal({ isOpen, onClose, roommate, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [categories, setCategories] = useState({
    cleanliness: 0,
    communication: 0,
    respectfulness: 0,
    quietness: 0,
    reliability: 0
  });
  const [recommend, setRecommend] = useState(null);
  const [loading, setLoading] = useState(false);

  const categoryLabels = {
    cleanliness: 'Vệ sinh',
    communication: 'Giao tiếp',
    respectfulness: 'Tôn trọng',
    quietness: 'Yên tĩnh',
    reliability: 'Đáng tin cậy'
  };

  const handleCategoryRating = (category, value) => {
    setCategories(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Vui lòng chọn đánh giá tổng thể');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        rating,
        review,
        categories,
        recommend,
        roommateId: roommate.id
      });
      onClose();
      // Reset form
      setRating(0);
      setReview('');
      setCategories({
        cleanliness: 0,
        communication: 0,
        respectfulness: 0,
        quietness: 0,
        reliability: 0
      });
      setRecommend(null);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Đánh giá bạn ghép trọ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Roommate Info */}
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
            <img
              src={roommate?.avatar || '/api/placeholder/60/60'}
              alt={roommate?.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-lg">{roommate?.name}</h3>
              <p className="text-gray-600">{roommate?.school}</p>
              <p className="text-sm text-gray-500">
                Thời gian ở cùng: {roommate?.duration || '6 tháng'}
              </p>
            </div>
          </div>

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Đánh giá tổng thể *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  <Star fill={star <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-600">
                {rating === 0 ? 'Chưa đánh giá' : 
                 rating === 1 ? 'Rất tệ' :
                 rating === 2 ? 'Tệ' :
                 rating === 3 ? 'Bình thường' :
                 rating === 4 ? 'Tốt' : 'Rất tốt'}
              </span>
            </div>
          </div>

          {/* Category Ratings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Đánh giá chi tiết
            </label>
            <div className="space-y-4">
              {Object.entries(categoryLabels).map(([category, label]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 w-24">{label}</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleCategoryRating(category, star)}
                        className={`text-lg ${
                          star <= categories[category] ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      >
                        <Star size={20} fill={star <= categories[category] ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Bạn có muốn giới thiệu người này cho bạn khác không?
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setRecommend(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  recommend === true 
                    ? 'bg-green-100 border-green-300 text-green-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ThumbsUp size={20} />
                <span>Có</span>
              </button>
              <button
                type="button"
                onClick={() => setRecommend(false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  recommend === false 
                    ? 'bg-red-100 border-red-300 text-red-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ThumbsDown size={20} />
                <span>Không</span>
              </button>
            </div>
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nhận xét chi tiết (tùy chọn)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Chia sẻ trải nghiệm của bạn với bạn ghép trọ này..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
              <span>{loading ? 'Đang gửi...' : 'Gửi đánh giá'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RatingModal;
