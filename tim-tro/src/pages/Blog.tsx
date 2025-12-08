import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import api from '../api';
interface BlogItem {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  images?: string[];
  tags?: string[];
  views?: number;
  likes?: number;
}

const Blog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [likedBlogs, setLikedBlogs] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const userId = user.id || user.uid || 'anonymous';
        setCurrentUserId(userId);
        
        // Load liked blogs for this user
        const likedKey = `likedBlogs_${userId}`;
        const savedLikes = localStorage.getItem(likedKey);
        if (savedLikes) {
          try {
            const likedArray = JSON.parse(savedLikes);
            setLikedBlogs(new Set(likedArray));
          } catch (e) {
            console.error('Error parsing liked blogs:', e);
          }
        }
      } catch (error) {
        console.error('Error parsing currentUser:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
      const response = await api.get('/blogs');
        // In a real application, this would be a fetch call to your API, e.g.,
        // const response = await fetch('http://localhost:3000/blogs');
        // const data = await response.json();
        // For now, we'll simulate fetching from db.json by directly using the data structure.
        // Assuming db.json content is available or a mock API is running.
        const mockData = {
          "blogs": [
            {
              
              "id": "blog1",
              "title": "Bí quyết tìm phòng trọ ưng ý cho sinh viên FPT",
              "author": "FPTro Admin",
              "date": "2025-07-17",
              "content": "Việc tìm kiếm một căn phòng trọ phù hợp là một trong những ưu tiên hàng đầu của sinh viên khi bắt đầu cuộc sống tự lập. Đặc biệt đối với sinh viên FPT, việc tìm phòng trọ gần trường, thuận tiện di chuyển và đảm bảo an ninh là vô cùng quan trọng. Bài viết này sẽ chia sẻ những bí quyết giúp bạn tìm được căn phòng ưng ý nhất.",
              "images": [
                "https://images.unsplash.com/photo-1549517045-bc93de0e06ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              ],
              "tags": [
                "phòng trọ",
                "sinh viên",
                "FPT",
                "bí quyết"
              ]
            },
            {
              "id": "blog2",
              "title": "5 mẹo tiết kiệm chi phí sinh hoạt khi ở trọ",
              "author": "FPTro Admin",
              "date": "2025-07-10",
              "content": "Cuộc sống sinh viên xa nhà luôn đi kèm với nhiều khoản chi phí. Làm thế nào để quản lý tài chính hiệu quả và tiết kiệm chi phí sinh hoạt khi ở trọ? Dưới đây là 5 mẹo nhỏ mà bạn có thể áp dụng ngay hôm nay.",
              "images": [
                "https://images.unsplash.com/photo-1593062095908-1647f3a8b276?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              ],
              "tags": [
                "tiết kiệm",
                "chi phí",
                "sinh hoạt",
                "ở trọ"
              ]
            },
            {
              "id": "blog3",
              "title": "Làm sao để hòa nhập với bạn cùng phòng mới?",
              "author": "FPTro Admin",
              "date": "2025-07-01",
              "content": "Việc có bạn cùng phòng có thể mang lại nhiều lợi ích nhưng cũng tiềm ẩn những mâu thuẫn nếu không biết cách hòa nhập. Bài viết này sẽ giúp bạn xây dựng mối quan hệ tốt đẹp với bạn cùng phòng, tạo nên một không gian sống thoải mái và vui vẻ.",
              "images": [
                "https://images.unsplash.com/photo-1521742918805-f933b0064d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              ],
              "tags": [
                "bạn cùng phòng",
                "hòa nhập",
                "sinh hoạt",
                "kinh nghiệm"
              ]
            }
          ]
        };
          const blogsData = response.data.map((blog: BlogItem) => ({
            ...blog,
            views: blog.views || 0,
            likes: blog.likes || 0,
          }));
          setBlogs(blogsData);
     } catch (err) {
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleLike = async (e: React.MouseEvent, blogId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    if (!currentUserId) {
      alert('Vui lòng đăng nhập để thích bài viết.');
      return;
    }
    
    try {
      const blog = blogs.find(b => b.id === blogId);
      if (!blog) return;

      const isLiked = likedBlogs.has(blogId);
      
      // If already liked, only allow to unlike (decrease by 1)
      // If not liked, allow to like (increase by 1)
      const newLikes = isLiked ? (blog.likes || 0) - 1 : (blog.likes || 0) + 1;

      // Update in database
      await api.patch(`http://localhost:3001/blogs/${blogId}`, {
        likes: newLikes
      });

      // Create notification for admin when user likes a blog (only if liking, not unliking)
      if (!isLiked) {
        try {
          console.log('Creating notification for blog like...');
          
          // Get current user info
          const userResponse = await api.get(`http://localhost:3001/users/${currentUserId}`);
          const user = userResponse.data;
          console.log('Current user:', user);
          
          // Get blog info
          const blogResponse = await api.get(`http://localhost:3001/blogs/${blogId}`);
          const blogData = blogResponse.data;
          console.log('Blog data:', blogData);
          
          // Find admin users
          const adminsResponse = await api.get(`http://localhost:3001/users?role=admin`);
          const admins = Array.isArray(adminsResponse.data) ? adminsResponse.data : [];
          console.log('Admin users found:', admins);
          
          if (admins.length === 0) {
            console.warn('No admin users found. Notification will not be created.');
            return;
          }
          
          // Create notification for each admin
          const notificationPromises = admins.map((admin: any) => {
            const notificationId = `blog_liked_${Date.now()}_${admin.id}_${blogId}`;
            return api.post(`http://localhost:3001/notifications`, {
              id: notificationId,
              type: 'blog_liked',
              userId: admin.id,
              fromUser: {
                fullName: user.fullName || user.email || 'Người dùng',
                id: user.id || currentUserId
              },
              data: {
                blogTitle: blogData.title,
                blogId: blogId
              },
              isRead: false,
              createdAt: new Date().toISOString()
            }).then(res => {
              console.log(`Notification created for admin ${admin.id}:`, res.data);
              return res.data;
            }).catch(err => {
              console.error(`Error creating notification for admin ${admin.id}:`, err);
              return null;
            });
          });
          
          const createdNotifications = await Promise.all(notificationPromises);
          console.log('All notifications created:', createdNotifications.filter(n => n !== null));
          
          // Emit socket event if available
          if ((window as any).socket) {
            admins.forEach((admin: any) => {
              (window as any).socket.emit('newNotification', {
                id: `blog_liked_${Date.now()}_${admin.id}_${blogId}`,
                type: 'blog_liked',
                userId: admin.id,
                fromUser: {
                  fullName: user.fullName || user.email || 'Người dùng',
                  id: user.id || currentUserId
                },
                data: {
                  blogTitle: blogData.title,
                  blogId: blogId
                },
                isRead: false,
                createdAt: new Date().toISOString()
              });
            });
            console.log('Socket events emitted for admins');
          } else {
            console.log('Socket not available, notifications will be loaded on next refresh');
          }
        } catch (notifError) {
          console.error('Error creating like notification:', notifError);
          // Don't block the like action if notification fails
        }
      }

      // Update local state
      setBlogs(prevBlogs =>
        prevBlogs.map(b =>
          b.id === blogId ? { ...b, likes: newLikes } : b
        )
      );

      // Update liked blogs for this user
      const likedKey = `likedBlogs_${currentUserId}`;
      if (isLiked) {
        // Unlike: remove from set
        setLikedBlogs(prev => {
          const newSet = new Set(prev);
          newSet.delete(blogId);
          // Save to localStorage
          localStorage.setItem(likedKey, JSON.stringify(Array.from(newSet)));
          return newSet;
        });
      } else {
        // Like: add to set
        setLikedBlogs(prev => {
          const newSet = new Set(prev).add(blogId);
          // Save to localStorage
          localStorage.setItem(likedKey, JSON.stringify(Array.from(newSet)));
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error updating likes:', error);
      alert('Có lỗi xảy ra khi cập nhật lượt thích. Vui lòng thử lại.');
    }
  };

  const handleViewDetails = (blogId: string) => {
    // Just navigate, don't update views here
    // Views will be updated in BlogDetail page
    navigate(`/blog/${blogId}`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-gray-700">Đang tải bài viết...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Blog</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative">
              {blog.images && blog.images.length > 0 && (
                <img
                  className="w-full h-48 object-cover"
                  src={blog.images[0]}
                  alt={blog.title}
                />
              )}
              {/* Like and View Icons */}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={(e) => handleLike(e, blog.id)}
                  className={`p-2 rounded-full transition-colors ${
                    likedBlogs.has(blog.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white bg-opacity-80 text-gray-700 hover:bg-opacity-100'
                  }`}
                  aria-label="Thích bài viết"
                >
                  <Heart size={16} fill={likedBlogs.has(blog.id) ? 'currentColor' : 'none'} />
                </button>
                <div className="p-2 rounded-full bg-white bg-opacity-80 text-gray-700 flex items-center gap-1">
                  <Eye size={16} />
                  <span className="text-xs">{blog.views || 0}</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h2>
              <p className="text-gray-600 text-sm mb-3">
                Bởi <span className="font-medium">{blog.author}</span> vào ngày {blog.date}
              </p>
              <p className="text-gray-700 text-base mb-4 line-clamp-3">{blog.content}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags && blog.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleViewDetails(blog.id)}
                className="text-blue-600 hover:text-blue-800 font-medium"
                aria-label={`Xem chi tiết ${blog.title}`}
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {blogs.length === 0 && !loading && !error && (
        <p className="text-gray-700 mt-8">Không có bài viết nào để hiển thị.</p>
      )}
    </div>
  );
};

export default Blog;
