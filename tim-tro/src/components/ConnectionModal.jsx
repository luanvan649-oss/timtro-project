import { useState, useEffect } from 'react';
import { X, Send, User, MessageCircle, Heart } from 'lucide-react';
import { useSocket } from '../hooks/useSocket'; // Import useSocket hook

function ConnectionModal({ isOpen, onClose, post, targetUser, currentUser }) { // Add currentUser prop
  const { socket } = useSocket(); // Use the socket hook
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (socket) {
      socket.on('connectionRequestSent', (data) => {
        console.log('Connection request sent successfully:', data);
        setIsLoading(false);
        onClose();
        alert('Đã gửi lời mời kết nối thành công!');
      });

      socket.on('connectionRequestFailed', (errorMsg) => {
        console.error('Connection request failed:', errorMsg);
        setError(errorMsg);
        setIsLoading(false);
      });

      // Clean up socket listeners on unmount
      return () => {
        socket.off('connectionRequestSent');
        socket.off('connectionRequestFailed');
      };
    }
  }, [socket, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Vui lòng nhập lời nhắn');
      return;
    }

    if (!socket) {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const requestData = {
        senderId: currentUser.id, // Use current user's ID
        receiverId: targetUser?.uid,
        postId: post.id,
        message: message.trim(),
      };
      
      console.log('Emitting sendConnectionRequest:', requestData);
      socket.emit('sendConnectionRequest', requestData); // Emit socket event

    } catch (err) {
      console.error('Error emitting connection request:', err);
      setError('Có lỗi xảy ra khi gửi lời mời. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Gửi lời mời kết nối</h3>
              <p className="text-sm text-gray-600">Kết nối với {targetUser?.fullName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Post Info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Heart size={20} className="text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm">
                  {post?.title || 'Bài đăng'}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {post?.location || 'Địa điểm'} • {post?.budget ? `${post.budget.toLocaleString()}đ` : 'Giá liên hệ'}
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={targetUser?.avatar || '/api/placeholder/40/40'}
                alt={targetUser?.fullName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">
                  {targetUser?.fullName}
                </h4>
                <p className="text-xs text-gray-600">
                  {targetUser?.school} - {targetUser?.major}
                </p>
              </div>
            </div>
          </div>

          {/* Message Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lời nhắn của bạn
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Giới thiệu bản thân và lý do muốn kết nối..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">
                  {message.length}/500 ký tự
                </span>
                {error && (
                  <span className="text-xs text-red-500">{error}</span>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <MessageCircle size={16} className="text-yellow-600 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <p className="font-medium mb-1">Gợi ý viết lời nhắn:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Giới thiệu bản thân ngắn gọn</li>
                    <li>• Nêu lý do quan tâm đến bài đăng</li>
                    <li>• Đề xuất thời gian gặp mặt</li>
                    <li>• Thể hiện sự tôn trọng và chân thành</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Gửi lời mời</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ConnectionModal;
