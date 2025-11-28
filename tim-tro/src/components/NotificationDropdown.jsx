import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, UserPlus, MessageCircle, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import axios from 'axios';
import { useSocket } from '../hooks/useSocket';

const API_BASE_URL = 'http://localhost:3001';

function NotificationDropdown() {
  const currentUser = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  })[0];
  const { socket } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.id) return;

    loadNotifications();

    if (socket) {
      // Listen for new notifications from the server
      socket.on('newNotification', async (newNotification) => {
        console.log('New notification received:', newNotification);
        let processedNotification = { ...newNotification };

        // Ensure fromUser is populated for connection_request types
        if (processedNotification.type === 'connection_request' && processedNotification.relatedEntity?.id) {
          // Only fetch if fromUser is not already present (e.g., from server-side enrichment)
          if (!processedNotification.fromUser || !processedNotification.fromUser.fullName) {
            try {
              const connectionRes = await axios.get(`${API_BASE_URL}/connections/${processedNotification.relatedEntity.id}`);
              const connection = connectionRes.data;
              if (connection && connection.senderId) {
                const senderRes = await axios.get(`${API_BASE_URL}/users/${connection.senderId}`);
                processedNotification.fromUser = senderRes.data; // Attach sender info
              }
            } catch (err) {
              console.error('Error fetching connection/sender for new notification:', err);
            }
          }
        }
        // Ensure fromUser is populated for connection_accepted notifications (where fromUser is the acceptor)
        else if (processedNotification.type === 'connection_accepted' && processedNotification.relatedEntity?.id) {
            if (!processedNotification.fromUser || !processedNotification.fromUser.fullName) {
                try {
                    const connectionRes = await axios.get(`${API_BASE_URL}/connections/${processedNotification.relatedEntity.id}`);
                    const connection = connectionRes.data;
                    if (connection && connection.receiverId) { // FromUser in accepted notification is the receiver
                        const receiverRes = await axios.get(`${API_BASE_URL}/users/${connection.receiverId}`);
                        processedNotification.fromUser = receiverRes.data;
                    }
                } catch (err) {
                    console.error('Error fetching receiver for accepted notification:', err);
                }
            }
        }


        setNotifications((prev) => {
          // Prevent duplicates if notification is already there
          if (prev.some(n => n.id === processedNotification.id)) return prev;
          // Add new notification to the top
          return [processedNotification, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });
        setUnreadCount(prev => prev + 1); // Increment unread count
      });

      // Clean up socket listener
      return () => {
        socket.off('newNotification');
      };
    }
  }, [currentUser, socket]);

  const loadNotifications = async () => {
    if (!currentUser?.id) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications?userId=${currentUser.id}&_sort=createdAt&_order=desc`);
      const fetchedNotifications = response.data;
      
      // Fetch sender info for connection requests if not already included
      const notificationsWithSender = await Promise.all(fetchedNotifications.map(async (notif) => {
        if (notif.type === 'connection_request' && notif.relatedEntity?.id) {
          try {
            const connectionRes = await axios.get(`${API_BASE_URL}/connections/${notif.relatedEntity.id}`);
            const connection = connectionRes.data;
            if (connection && connection.senderId) {
              const senderRes = await axios.get(`${API_BASE_URL}/users/${connection.senderId}`);
              notif.fromUser = senderRes.data; // Attach sender info
            }
          } catch (err) {
            console.error('Error fetching connection/sender for notification:', err);
          }
        }
        return notif;
      }));

      setNotifications(notificationsWithSender);
      setUnreadCount(notificationsWithSender.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/${notificationId}`, { isRead: true });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(n => axios.patch(`${API_BASE_URL}/notifications/${n.id}`, { isRead: true }))
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request':
        return <UserPlus size={16} className="text-blue-600" />;
      case 'connection_accepted':
        return <Check size={16} className="text-green-600" />;
      case 'connection_declined':
        return <X size={16} className="text-red-600" />;
      case 'connection_cancelled':
        return <X size={16} className="text-gray-600" />;
      default:
        return <MessageCircle size={16} className="text-gray-600" />;
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'connection_request':
        return `${notification.fromUser?.fullName || 'Ai đó'} đã gửi lời mời kết nối`;
      case 'connection_accepted':
        return `${notification.data?.toUser?.fullName || 'Ai đó'} đã chấp nhận lời mời kết nối`;
      case 'connection_declined':
        return `${notification.data?.toUser?.fullName || 'Ai đó'} đã từ chối lời mời kết nối`;
      case 'connection_cancelled':
        return `${notification.data?.fromUser?.fullName || 'Ai đó'} đã hủy lời mời kết nối`;
      default:
        return 'Bạn có thông báo mới';
    }
  };

  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case 'connection_request':
        return `/connections`;
      case 'connection_accepted':
      case 'connection_declined':
      case 'connection_cancelled':
        return `/connections`;
      default:
        return '/';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">
                <Bell size={24} className="mx-auto" />
                <p className="text-sm text-gray-600">Chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={clsx(
                      "p-4 hover:bg-gray-50 transition-colors",
                      !notification.isRead && "bg-blue-50"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-900">
                            {getNotificationText(notification)}
                          </p>
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Đánh dấu đã đọc
                            </button>
                          )}
                        </div>
                        
                        {notification.data?.message && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            "{notification.data.message}"
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                          
                          <Link
                            to={getNotificationLink(notification)}
                            onClick={() => {
                              setIsOpen(false);
                              handleMarkAsRead(notification.id);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <Link
                to="/connections"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-blue-600 hover:text-blue-800"
              >
                Xem tất cả thông báo
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) return 'Vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

export default NotificationDropdown;
