import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; 
import { ArrowLeft, Heart, Eye } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001'; // Assuming your JSON server runs on port 3001

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

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const userId = user.id || user.uid || 'anonymous';
        setCurrentUserId(userId);
      } catch (error) {
        console.error('Error parsing currentUser:', error);
      }
    }
  }, []);

  const fetchBlog = useCallback(async () => {
    setLoading(true);
    try {
      if (!id) {
        navigate('/blog'); // Redirect to blog list if no ID
        return;
      }
      
      const response = await api.get(`${API_BASE_URL}/blogs/${id}`);
      const blogData = response.data;
      
      if (!blogData) {
        console.error('Blog post not found');
        navigate('/blog'); // Redirect if blog not found
        return;
      }
      
      // Initialize views and likes if not present
      const blogWithDefaults = {
        ...blogData,
        views: blogData.views || 0,
        likes: blogData.likes || 0,
      };
      
      setBlog(blogWithDefaults);
      
      // Check if blog is liked by current user (from localStorage)
      // This will be updated when currentUserId is available
      
      // Increment views when viewing detail (only once per page load)
      // Check if we've already incremented views for this session
      const viewKey = `blog_viewed_${id}`;
      const hasViewed = sessionStorage.getItem(viewKey);
      
      if (!hasViewed) {
        // Mark as viewed in this session
        sessionStorage.setItem(viewKey, 'true');
        
        // Increment views
        const newViews = (blogWithDefaults.views || 0) + 1;
        setBlog(prev => prev ? { ...prev, views: newViews } : null);
        
        // Update views in database in background
        api.patch(`${API_BASE_URL}/blogs/${id}`, {
          views: newViews
        }).catch((viewError) => {
          console.error('Error updating views:', viewError);
          // Revert on error
          setBlog(prev => prev ? { ...prev, views: blogWithDefaults.views || 0 } : null);
          sessionStorage.removeItem(viewKey);
        });
      }
    } catch (err) {
      setError("Failed to fetch blog post.");
      console.error("Error fetching blog post:", err);
      navigate('/blog'); // Redirect on error
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  // Check if blog is liked when currentUserId is available
  useEffect(() => {
    if (currentUserId && id) {
      try {
        const likedKey = `likedBlogs_${currentUserId}`;
        const likedBlogs = JSON.parse(localStorage.getItem(likedKey) || '[]');
        setIsLiked(likedBlogs.includes(id));
      } catch (e) {
        console.error('Error reading liked blogs:', e);
      }
    }
  }, [currentUserId, id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleLike = async () => {
    if (!blog || !id) return;
    
    // Check if user is logged in
    if (!currentUserId) {
      alert('Vui lòng đăng nhập để thích bài viết.');
      return;
    }
    
    try {
      // If already liked, only allow to unlike (decrease by 1)
      // If not liked, allow to like (increase by 1)
      const newLikes = isLiked ? (blog.likes || 0) - 1 : (blog.likes || 0) + 1;
      
      // Update in database
      await api.patch(`${API_BASE_URL}/blogs/${id}`, {
        likes: newLikes
      });

      // Create notification for admin when user likes a blog (only if liking, not unliking)
      if (!isLiked) {
        try {
          // Get current user info
          const userResponse = await api.get(`${API_BASE_URL}/users/${currentUserId}`);
          const user = userResponse.data;
          
          // Find admin users
          const adminsResponse = await api.get(`${API_BASE_URL}/users?role=admin`);
          const admins = adminsResponse.data;
          
          // Create notification for each admin
          const notificationPromises = admins.map((admin: any) => 
            api.post(`${API_BASE_URL}/notifications`, {
              id: Date.now().toString() + '_' + admin.id + '_' + id,
              type: 'blog_liked',
              userId: admin.id,
              fromUser: {
                fullName: user.fullName || user.email || 'Người dùng',
                id: user.id
              },
              data: {
                blogTitle: blog.title,
                blogId: id
              },
              isRead: false,
              createdAt: new Date().toISOString()
            }).catch(err => {
              console.error('Error creating notification for admin:', err);
            })
          );
          
          const createdNotifications = await Promise.all(notificationPromises);
          console.log('Notifications created for admins:', createdNotifications);
          
          // Emit socket event if available
          if ((window as any).socket) {
            admins.forEach((admin: any) => {
              (window as any).socket.emit('newNotification', {
                id: Date.now().toString() + '_' + admin.id + '_' + id,
                type: 'blog_liked',
                userId: admin.id,
                fromUser: {
                  fullName: user.fullName || user.email || 'Người dùng',
                  id: user.id
                },
                data: {
                  blogTitle: blog.title,
                  blogId: id
                },
                isRead: false,
                createdAt: new Date().toISOString()
              });
            });
          }
        } catch (notifError) {
          console.error('Error creating like notification:', notifError);
          // Don't block the like action if notification fails
        }
      }

      // Update local state
      setBlog(prev => prev ? { ...prev, likes: newLikes } : null);
      setIsLiked(!isLiked);

      // Update localStorage for this user
      const likedKey = `likedBlogs_${currentUserId}`;
      const likedBlogs = JSON.parse(localStorage.getItem(likedKey) || '[]');
      if (isLiked) {
        // Unlike: remove from array
        const updated = likedBlogs.filter((blogId: string) => blogId !== id);
        localStorage.setItem(likedKey, JSON.stringify(updated));
      } else {
        // Like: add to array (only if not already in array)
        if (!likedBlogs.includes(id)) {
          likedBlogs.push(id);
          localStorage.setItem(likedKey, JSON.stringify(likedBlogs));
        }
      }
    } catch (error) {
      console.error('Error updating likes:', error);
      alert('Có lỗi xảy ra khi cập nhật lượt thích. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-gray-700">Đang tải bài viết...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => navigate('/blog')}
          className="text-blue-600 hover:text-blue-800 font-medium mt-4"
        >
          Quay lại danh sách blog
        </button>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài viết</h2>
        <p className="text-gray-600 mb-4">Bài viết có thể đã được xóa hoặc không tồn tại.</p>
        <button
          onClick={() => navigate('/blog')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Quay lại danh sách blog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate('/blog')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Quay lại danh sách blog
      </button>

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{blog.title}</h1>
          <p className="text-gray-600 text-sm">
            Bởi <span className="font-medium">{blog.author}</span> vào ngày {formatDate(blog.date)}
          </p>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isLiked
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
            aria-label="Thích bài viết"
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{blog.likes || 0}</span>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 border border-gray-200">
            <Eye size={20} />
            <span>{blog.views || 0} lượt xem</span>
          </div>
        </div>
      </div>

      {blog.images && blog.images.length > 0 && (
        <img
          className="w-full h-auto object-cover rounded-lg mb-6"
          src={blog.images[0]}
          alt={blog.title}
        />
      )}

      <div 
        className="prose max-w-none text-gray-800 leading-relaxed mb-6 blog-content"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
      <style>{`
        .blog-content h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          line-height: 1.2;
          color: #111827;
        }
        .blog-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          line-height: 1.3;
          color: #111827;
        }
        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
          color: #111827;
        }
        .blog-content p {
          margin-top: 1rem;
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        .blog-content ul, .blog-content ol {
          margin-top: 1rem;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .blog-content ul {
          list-style-type: disc;
        }
        .blog-content ol {
          list-style-type: decimal;
        }
        .blog-content li {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .blog-content li p {
          margin: 0;
        }
        .blog-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          font-style: italic;
          color: #4b5563;
        }
        .blog-content blockquote p {
          margin: 0.5rem 0;
        }
        .blog-content strong {
          font-weight: 700;
        }
        .blog-content em {
          font-style: italic;
        }
        .blog-content u {
          text-decoration: underline;
        }
        .blog-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        .blog-content a:hover {
          color: #1d4ed8;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          border-radius: 0.5rem;
        }
      `}</style>

      <div className="flex flex-wrap gap-2 mb-6">
        {blog.tags && blog.tags.map((tag: string) => (
          <span
            key={tag}
            className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BlogDetail;
