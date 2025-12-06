import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; 
import { ArrowLeft } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001'; // Assuming your JSON server runs on port 3001

interface BlogItem {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  images?: string[];
  tags?: string[];
}

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      setBlog(blogData);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
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

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
      <p className="text-gray-600 text-sm mb-4">
        Bởi <span className="font-medium">{blog.author}</span> vào ngày {formatDate(blog.date)}
      </p>

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
