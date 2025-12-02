import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom'; // Import useSearchParams
import axios from 'axios';
import { useSocket } from '../hooks/useSocket';
import {
  MessageCircle,
  UserPlus,
  Heart,
  Clock,
  Check,
  X,
  Send,
  Star,
  MapPin,
  Calendar,
  Eye,
  CheckCircle,
  AlertCircle,
  Users,
  Filter,
  Search
} from 'lucide-react';
import ChatWindow from '../components/ChatWindow'; // Import ChatWindow

const API_BASE_URL = 'http://localhost:3001'; // API server running on port 3001

function Connections() {
  // Lấy currentUser từ localStorage một lần và lưu vào state
  interface User {
    id: string;
    fullName?: string;
    avatar?: string;
    status?: string;
    verified?: boolean;
    school?: string;
    major?: string;
    [key: string]: any;
  }

  interface Conversation {
    id: string;
    otherUser?: User | null;
    postTitle?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unread?: boolean;
    conversation?: any[];
    conversationId?: string;
    [key: string]: any;
  }

  interface Invitation {
    id: string;
    senderId?: string;
    receiverId?: string;
    fromUser?: User | null;
    toUser?: User | null;
    postId?: string;
    postTitle?: string;
    status?: string;
    createdAt?: string;
    message?: string;
    rejectionCount?: number;
    [key: string]: any;
  }

  interface MatchType {
    id: string;
    user: User;
    postTitle?: string;
    matchScore?: number;
    status?: string;
    timestamp?: string;
    mutualInterests?: string[];
    postId?: string;
    [key: string]: any;
  }

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const { socket } = useSocket() as any;
  const [activeTab, setActiveTab] = useState<'messages' | 'invitations' | 'matches'>('messages');
  const [messages, setMessages] = useState<Conversation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [invitationTab, setInvitationTab] = useState<'received' | 'sent'>('received');

  // Effect to load currentUser from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser) as User);
    }
  }, []);

  // Effect to fetch connections when currentUser or searchParams change
  useEffect(() => {
    if (currentUser?.id) {
      fetchConnections();
    }
  }, [currentUser?.id, searchParams]); // Add searchParams as a dependency

  // Effect to handle conversationId from URL
  useEffect(() => {
    const conversationIdFromUrl = searchParams.get('conversationId');
    if (conversationIdFromUrl && messages.length > 0) {
      const conv = messages.find((msg) => msg.id === conversationIdFromUrl);
      if (conv) {
        setSelectedConversation(conv);
        setActiveTab('messages');
        // Clear the conversationId from URL after processing
        setSearchParams({}, { replace: true });
      }
    }
  }, [messages, searchParams, setSearchParams]); // Add messages as dependency

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket || !currentUser?.id) return;

    // Join room for the selected conversation when it changes
    if (selectedConversation?.id) {
      socket.emit('joinRoom', selectedConversation.id);
      console.log(`Joined room: ${selectedConversation.id}`);
    }

    // Lắng nghe lời mời kết nối mới
    socket.on('newConnectionRequest', async (newRequest: any) => {
      console.log('Received new connection request via socket:', newRequest);
      if (newRequest.receiverId === currentUser.id) {
        let processedRequest = { ...newRequest };
        try {
          const userRes = await axios.get(`${API_BASE_URL}/users/${processedRequest.senderId}`);
          processedRequest.fromUser = userRes.data;
          const postRes = await axios.get(`${API_BASE_URL}/posts/${processedRequest.postId}`);
          processedRequest.postTitle = postRes.data?.title || 'Bài đăng không xác định';
        } catch (err) {
          console.error('Error fetching related data for new connection request:', err);
        }
        setReceivedInvitations((prev) => {
          if (!prev.some(inv => inv.id === processedRequest.id)) {
            console.log('Adding new received invitation:', processedRequest.fromUser?.fullName, processedRequest.postTitle);
            return [...prev, { ...processedRequest, type: 'received' }];
          }
          return prev;
        });
      }
    });

    // Lắng nghe khi lời mời được chấp nhận
    socket.on('connectionAccepted', async (acceptedConnection: any) => {
      console.log('Connection accepted via socket:', acceptedConnection);
      // If current user is the sender, add to messages list
      if (acceptedConnection.senderId === currentUser.id) {
        try {
          const otherUser = await axios.get(`${API_BASE_URL}/users/${acceptedConnection.receiverId}`).then(res => res.data);
          const postData = await axios.get(`${API_BASE_URL}/posts/${acceptedConnection.postId}`).then(res => res.data);
          const newConversation = {
            id: acceptedConnection.id,
            otherUser: otherUser,
            postTitle: postData?.title || 'Bài đăng không xác định',
            lastMessage: acceptedConnection.firstMessage?.content || acceptedConnection.message,
            lastMessageTime: acceptedConnection.firstMessage?.timestamp || acceptedConnection.createdAt,
            unread: false,
            conversation: acceptedConnection.firstMessage ? [acceptedConnection.firstMessage] : []
          };
          setMessages((prev) => {
            if (!prev.some(msg => msg.id === newConversation.id)) {
              return [...prev, newConversation];
            }
            return prev;
          });
        } catch (error) {
          console.error('Error processing accepted connection for messages:', error);
        }
      }
      fetchConnections(); // Re-fetch all connections to ensure UI is consistent
    });

    // Lắng nghe khi lời mời bị từ chối
    socket.on('connectionRejected', (rejectedConnection: any) => {
      console.log('Connection rejected via socket:', rejectedConnection);
      fetchConnections(); // Re-fetch connections to update UI
    });

    socket.on('newNotification', (notification: any) => {
      console.log('Received new notification:', notification);
    });

    socket.on('receiveMessage', (newMessage: any) => {
      console.log('Received message:', newMessage);
      setSelectedConversation(prev => {
        if (prev && prev.id === newMessage.conversationId) {
          return {
            ...prev,
            conversation: [...(prev.conversation || []), newMessage]
          };
        }
        return prev;
      });
      // Update last message and time in the messages list for preview
      setMessages(prev => prev.map(conv => {
        if (conv.id === newMessage.conversationId) {
          return { ...conv, lastMessage: newMessage.content, lastMessageTime: newMessage.timestamp };
        }
        return conv;
      }));
    });

    // Cleanup function for socket listeners
    return () => {
      if (selectedConversation?.id) {
        socket.emit('leaveRoom', selectedConversation.id);
      }
      socket.off('newConnectionRequest');
      socket.off('connectionAccepted');
      socket.off('connectionRejected');
      socket.off('newNotification');
      socket.off('receiveMessage');
    };
  }, [socket, currentUser, selectedConversation?.id]); // Add selectedConversation.id to dependencies

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchConversationMessages = async () => {
      if (selectedConversation && selectedConversation.id) {
        console.log(`Fetching messages for conversation ID: ${selectedConversation.id}`);
        try {
          // Use query parameter for conversationId
          const response = await axios.get(`${API_BASE_URL}/messages?conversationId=${selectedConversation.id}`);
          setSelectedConversation(prev => ({
            ...prev!,
            conversation: response.data
          }));
          console.log(`Successfully fetched ${response.data.length} messages.`);
        } catch (error) {
          console.error('Error fetching messages:', error);
          setSelectedConversation(prev => ({ ...prev!, conversation: [] }));
        }
      }
    };
    fetchConversationMessages();
  }, [selectedConversation?.id]);

  const fetchConnections = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch full currentUser details to ensure fullName and avatar are available
      const fullCurrentUserRes = await axios.get(`${API_BASE_URL}/users/${currentUser.id}`);
      const fullCurrentUser = fullCurrentUserRes.data;

      // Fetch all connections where currentUser is sender or receiver using JSON Server's _or operator
      // Note: json-server's _or operator expects a query parameter like ?senderId=1&_or_receiverId=2
      // For simplicity and direct compatibility, we'll make two separate calls or rely on backend's /connections route logic
      // Fetch connections where currentUser is the sender
      const sentConnectionsRes = await axios.get(`${API_BASE_URL}/connections?senderId=${currentUser.id}`);
      const sentConnections = sentConnectionsRes.data;

      // Fetch connections where currentUser is the receiver
      const receivedConnectionsRes = await axios.get(`${API_BASE_URL}/connections?receiverId=${currentUser.id}`);
      const receivedConnections = receivedConnectionsRes.data;

      // Combine and filter out duplicates (though json-server queries should prevent direct duplicates from separate calls)
      const allConnections = [...sentConnections, ...receivedConnections.filter((recConn: any) => !sentConnections.some((senConn: any) => senConn.id === recConn.id))];

      const processedSent: Invitation[] = [];
      const processedReceived: Invitation[] = [];
      const mappedConversations: Conversation[] = [];

      await Promise.all(allConnections.map(async (conn: any) => {
        const isSender = conn.senderId === currentUser.id;
        const otherUserId = isSender ? conn.receiverId : conn.senderId;
        
        let otherUser = null;
        let postData = null;

        try {
          if (otherUserId) {
            try {
              const userRes = await axios.get(`${API_BASE_URL}/users/${otherUserId}`);
              otherUser = userRes.data;
              console.log(`Fetched user for connection ${conn.id}:`, otherUser.fullName);
            } catch (userError: any) {
              console.warn(`Error fetching user ${otherUserId} for connection ${conn.id}:`, userError?.message || userError);
              otherUser = { id: otherUserId, fullName: 'Người dùng không xác định', avatar: 'https://via.placeholder.com/48', school: 'Không xác định', major: 'Không xác định', verified: false, status: 'offline' }; // Fallback with all expected fields
            }
          } else {
            console.warn(`Missing otherUserId for connection ${conn.id}. Skipping user fetch.`);
            otherUser = { id: otherUserId, fullName: 'Người dùng không xác định', avatar: 'https://via.placeholder.com/48', school: 'Không xác định', major: 'Không xác định', verified: false, status: 'offline' }; // Fallback with all expected fields
          }

            if (conn.postId) {
            try {
              const postRes = await axios.get(`${API_BASE_URL}/posts/${conn.postId}`);
              postData = postRes.data;
              console.log(`Fetched post for connection ${conn.id}:`, postData.title);
            } catch (postError: any) {
              console.warn(`Error fetching post ${conn.postId} for connection ${conn.id}:`, postError?.message || postError);
              postData = { id: conn.postId, title: 'Bài đăng không xác định', userId: '', images: [], address: '', price: 0 }; // Fallback with all expected fields
            }
          } else {
            console.warn(`Missing postId for connection ${conn.id}. Skipping post fetch.`);
            postData = { id: conn.postId, title: 'Bài đăng không xác định', userId: '', images: [], address: '', price: 0 }; // Fallback with all expected fields
          }

          const processedConn = {
            ...conn,
            fromUser: isSender ? fullCurrentUser : otherUser, // Use fullCurrentUser
            toUser: isSender ? otherUser : fullCurrentUser,   // Use fullCurrentUser
            postTitle: postData?.title || 'Bài đăng không xác định',
          };

          if (isSender) {
            processedSent.push(processedConn);
            console.log('Processed sent invitation:', processedConn.toUser?.fullName, processedConn.postTitle);
          } else {
            processedReceived.push(processedConn);
            console.log('Processed received invitation:', processedConn.fromUser?.fullName, processedConn.postTitle);
          }

          // If connection is accepted, add to messages list
          if (conn.status === 'accepted') {
            // Fetch messages using conversationId query parameter
            const messagesRes = await axios.get(`${API_BASE_URL}/messages?conversationId=${conn.id}`);
            const conversationMessages = messagesRes.data;
            const lastMessage = conversationMessages.length > 0 ? conversationMessages[conversationMessages.length - 1] : null;

            mappedConversations.push({
              id: conn.id,
              otherUser: otherUser,
              postTitle: postData?.title || 'Bài đăng không xác định',
              lastMessage: lastMessage?.content || conn.message,
              lastMessageTime: lastMessage?.timestamp || conn.createdAt,
              unread: false,
              conversation: conversationMessages
            });
            console.log('Processed accepted conversation:', otherUser?.fullName, postData?.title);
          }
            } catch (error: any) {
          console.error(`Error processing connection ${conn.id}:`, error);
          if (error?.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
          }
          // Continue processing other connections even if one fails
        }
      }));

      // Sort by createdAt for consistent display
      processedSent.sort((a: any,b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      processedReceived.sort((a: any,b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      mappedConversations.sort((a: any,b: any) => new Date(b.lastMessageTime || b.createdAt).getTime() - new Date(a.lastMessageTime || a.createdAt).getTime());


      setSentInvitations(processedSent);
      setReceivedInvitations(processedReceived);
      // Ensure unique conversations
      const uniqueConversations = Array.from(new Map(mappedConversations.map(conv => [conv.id, conv])).values());
      setMessages(uniqueConversations);

    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleInvitationResponse = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      const invitationToUpdate = receivedInvitations.find(inv => inv.id === invitationId);
      if (!invitationToUpdate) {
        console.error('Invitation not found:', invitationId);
        return;
      }

      const newStatus = action === 'accept' ? 'accepted' : 'rejected';
      
      // Create a new object with all existing fields and the updated status
      const updatedConnection = {
        ...invitationToUpdate,
        status: newStatus,
      };

      // If rejecting, increment rejectionCount
      if (action === 'decline') { // Use 'decline' for rejecting
        updatedConnection.rejectionCount = (invitationToUpdate.rejectionCount || 0) + 1;
      } else if (action === 'accept') {
        // If accepting, ensure rejectionCount is removed if it exists
        if (Object.prototype.hasOwnProperty.call(updatedConnection, 'rejectionCount')) {
          delete updatedConnection.rejectionCount;
        }
      }

      const url = `${API_BASE_URL}/connections/${invitationId}`;
      await axios.put(url, updatedConnection); // Send the full updated object
      fetchConnections(); // Re-fetch all connections to update state

      // If accepted, add to messages tab and set as selected conversation
      if (action === 'accept') { // Use 'action' instead of 'response'
        const acceptedInvitation = receivedInvitations.find(inv => inv.id === invitationId);
        if (acceptedInvitation) {
          // Fetch the full user details for the other user
          const userRes = await axios.get(`${API_BASE_URL}/users/${acceptedInvitation.senderId}`);
          const otherUser = userRes.data;
          
          // Fetch the post data for the accepted invitation
          let postData = null;
          if (acceptedInvitation.postId) {
            try {
              const postRes = await axios.get(`${API_BASE_URL}/posts/${acceptedInvitation.postId}`);
              postData = postRes.data;
            } catch (postError: any) {
              console.warn(`Error fetching post ${acceptedInvitation.postId} for accepted invitation:`, postError?.message || postError);
              postData = { id: acceptedInvitation.postId, title: 'Bài đăng không xác định' }; // Fallback
            }
          } else {
            postData = { title: 'Bài đăng không xác định' }; // Fallback if no postId
          }

          const newConversation: Conversation = {
            id: acceptedInvitation.id,
            otherUser: otherUser, // otherUser đã được fetch đầy đủ
            postTitle: postData?.title || 'Bài đăng không xác định', // postTitle đã được fetch đầy đủ
            lastMessage: acceptedInvitation.message, // Tin nhắn ban đầu
            lastMessageTime: new Date().toISOString(),
            unread: false,
            conversation: [{ // Tin nhắn ban đầu trong cuộc hội thoại
              id: Date.now().toString(),
              senderId: acceptedInvitation.senderId,
              content: acceptedInvitation.message,
              timestamp: acceptedInvitation.createdAt,
            }]
          };
          setMessages((prev) => {
            // Đảm bảo không thêm trùng lặp và cập nhật nếu đã tồn tại
            const existingIndex = prev.findIndex(msg => msg.id === newConversation.id);
            if (existingIndex > -1) {
              const updatedMessages = [...prev];
              updatedMessages[existingIndex] = newConversation;
              return updatedMessages;
            }
            return [...prev, newConversation];
          });
          setSelectedConversation(newConversation);
          setActiveTab('messages');
        }
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
    }
  };

  const formatTime = (timestamp: string | number | undefined) => {
    if (timestamp === undefined || timestamp === null) return 'Ngày không hợp lệ';
    const date = new Date(timestamp as string | number);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid timestamp provided to formatTime: ${timestamp}`);
      return 'Ngày không hợp lệ';
    }
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
    return `${diffInYears} năm trước`;
  };

  const getUnreadCount = (type: 'messages' | 'invitations' | 'matches') => {
    switch (type) {
      case 'messages':
        return messages.filter(msg => msg.unread).length;
      case 'invitations':
        return [...sentInvitations, ...receivedInvitations].filter(inv => inv.status === 'pending').length;
      case 'matches':
        return matches.filter(match => match.status === 'new').length;
      default:
        return 0;
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.otherUser?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.postTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMatches = matches.filter(match => 
    (match.user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (match.postTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs: { id: 'messages' | 'invitations' | 'matches'; label: string; icon: React.ReactNode; count: number }[] = [
    { 
      id: 'messages', 
      label: 'Tin nhắn', 
      icon: <MessageCircle size={20} />,
      count: getUnreadCount('messages')
    },
    { 
      id: 'invitations', 
      label: 'Lời mời', 
      icon: <UserPlus size={20} />,
      count: getUnreadCount('invitations')
    },
    { 
      id: 'matches', 
      label: 'Gợi ý kết nối', 
      icon: <Heart size={20} />,
      count: getUnreadCount('matches')
    }
  ];

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Kết nối</h2>
        <p className="text-gray-600 mb-6">
          Đăng nhập để quản lý tin nhắn và kết nối với các bạn ghép trọ
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kết nối</h1>
        <p className="text-gray-600">Quản lý tin nhắn, lời mời và gợi ý kết nối</p>
      </div>
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tìm kiếm..."
            />
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
              {/* Messages Tab */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Chưa có tin nhắn nào</p>
                    </div>
                  ) : (
                    filteredMessages.map(message => (
                      <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start space-x-4">
                          <div className="relative">
              <img
                src={message.otherUser?.avatar || 'https://via.placeholder.com/48'}
                alt={message.otherUser?.fullName || 'Người dùng'}
                className="w-12 h-12 rounded-full object-cover"
              />
                            {message.otherUser?.status === 'online' && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900">
                                  {message.otherUser?.fullName || 'Người dùng'}
                                </h3>
                                {message.otherUser?.verified && (
                                  <CheckCircle size={16} className="text-green-500" />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                  {formatTime(message.lastMessageTime)}
                                </span>
                                {message.unread && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-1">
                              Về: {message.postTitle}
                            </p>
                            
                            <p className="text-gray-700 mb-3">
                              {message.lastMessage}
                            </p>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  console.log('Setting selected conversation:', message);
                                  setSelectedConversation(message);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Xem cuộc trò chuyện
                              </button>
                              <span className="text-gray-300">•</span>
                              {message.conversationId && (
                                <Link
                                  to={`/post/${message.conversationId}`}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  Xem bài đăng
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              {/* Invitations Tab */}
              {activeTab === 'invitations' && (
                <div>
                  {/* Tabs con */}
                  <div className="flex space-x-4 mb-4">
                    <button
                      className={`px-4 py-2 rounded-md font-medium text-sm ${invitationTab === 'received' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => setInvitationTab('received')}
                    >
                      Lời mời đã nhận
                    </button>
                    <button
                      className={`px-4 py-2 rounded-md font-medium text-sm ${invitationTab === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                      onClick={() => setInvitationTab('sent')}
                    >
                      Lời mời đã gửi
                    </button>
                  </div>
                  {/* Danh sách lời mời */}
                  <div className="space-y-4">
                    {invitationTab === 'received' ? (
                      receivedInvitations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Chưa có lời mời nào được nhận</div>
                      ) : (
                        receivedInvitations.map(inv => (
                          <div key={inv.id} className="border rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-start space-x-4">
                              <img
                                src={inv.fromUser?.avatar || 'https://via.placeholder.com/48'}
                                alt={inv.fromUser?.fullName || 'Người dùng'}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div>
                                <div className="font-semibold">
                                  {inv.fromUser?.fullName || 'Người gửi không xác định'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Về: {inv.postTitle || 'Bài đăng không xác định'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {formatTime(inv.createdAt)}
                                </div>
                                <div className="text-sm mt-1">
                                  {inv.message || 'Không có lời nhắn'}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {inv.status === 'pending' && (
                                <>
                                  <button onClick={() => handleInvitationResponse(inv.id, 'accept')} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs">Chấp nhận</button>
                                  <button onClick={() => handleInvitationResponse(inv.id, 'decline')} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs">Từ chối</button>
                                </>
                              )}
                              {inv.status === 'accepted' && <span className="text-green-600 text-xs font-medium">Đã chấp nhận</span>}
                              {inv.status === 'rejected' && <span className="text-red-600 text-xs font-medium">Đã từ chối</span>} {/* Use 'rejected' consistently */}
                              {inv.status === 'cancelled' && <span className="text-gray-600 text-xs font-medium">Đã hủy</span>}
                            </div>
                          </div>
                        ))
                      )
                    ) : (
                      sentInvitations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Chưa có lời mời nào đã gửi</div>
                      ) : (
                        sentInvitations.map(inv => (
                          <div key={inv.id} className="border rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-start space-x-4">
                              <img
                                src={inv.toUser?.avatar || 'https://via.placeholder.com/48'}
                                alt={inv.toUser?.fullName || 'Người nhận'}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div>
                                <div className="font-semibold">
                                  {inv.toUser?.fullName || 'Người nhận không xác định'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Về: {inv.postTitle || 'Bài đăng không xác định'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {formatTime(inv.createdAt)}
                                </div>
                                <div className="text-sm mt-1">
                                  {inv.message || 'Không có lời nhắn'}
                                </div>
                              </div>
                            </div>
                            <div>
                              {inv.status === 'pending' && <span className="text-yellow-600 text-xs font-medium">Đang chờ</span>}
                              {inv.status === 'accepted' && <span className="text-green-600 text-xs font-medium">Đã chấp nhận</span>}
                              {inv.status === 'rejected' && <span className="text-red-600 text-xs font-medium">Đã từ chối</span>} {/* Use 'rejected' consistently */}
                              {inv.status === 'cancelled' && <span className="text-gray-600 text-xs font-medium">Đã hủy</span>}
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </div>
                </div>
              )}
              {/* Matches Tab */}
              {activeTab === 'matches' && (
                <div className="space-y-4">
                  {filteredMatches.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Chưa có gợi ý kết nối nào</p>
                    </div>
                  ) : (
                    <div>
                      {filteredMatches.map(match => (
                        <div key={match.id} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-4">
                            <img
                              src={match.user.avatar}
                              alt={match.user.fullName}
                              className="w-12 h-12 rounded-full"
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {match.user.fullName}
                                </h3>
                                {match.user.verified && (
                                  <CheckCircle size={16} className="text-green-500" />
                                )}
                                <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                  <Star size={12} fill="currentColor" />
                                  <span>{match.matchScore}% phù hợp</span>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatTime(match.timestamp)}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              <p>{match.user.school} - {match.user.major}</p>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              Về: {match.postTitle}
                            </p>
                            
                            {match.mutualInterests && match.mutualInterests.length > 0 && (
                              <div className="mb-3">
                                <div className="text-sm font-medium text-gray-700 mb-1">
                                  Sở thích chung:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {match.mutualInterests.map((interest, index) => (
                                    <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                                      {interest}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <Link
                                to={`/post/${match.postId}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Xem bài đăng
                              </Link>
                              
                              <div className="flex items-center space-x-2">
                                {match.status === 'new' && (
                                  <button
                                    onClick={() => {
                                      const updatedMatches = matches.map(m => 
                                        m.id === match.id ? { ...m, status: 'contacted' } : m
                                      );
                                      setMatches(updatedMatches);
                                    }}
                                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                                  >
                                    Gửi lời mời
                                  </button>
                                )}
                                
                                {match.status === 'contacted' && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                    Đã liên hệ
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Conversation Modal */}
      {selectedConversation && selectedConversation.otherUser && (
        <ChatWindow 
          conversation={selectedConversation as any} 
          currentUser={currentUser as any} 
          onClose={() => setSelectedConversation(null)} 
        />
      )}
    </div>
  );
}

export default Connections;
