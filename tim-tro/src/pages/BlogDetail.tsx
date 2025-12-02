import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
      
      const response = await axios.get(`${API_BASE_URL}/blogs/${id}`);
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

      <div className="prose max-w-none text-gray-800 leading-relaxed mb-6">
        <p>{blog.content}</p>
      </div>

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
