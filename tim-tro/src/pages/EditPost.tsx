import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api';  // Import API configuration



interface Post {
  id?: string | number;
  title?: string;
  description?: string;
  price?: string | number;
  area?: string | number;
  location?: string;
  district?: string;
  city?: string;
  images?: string[];
  contactPhone?: string;
  status?: string;
  authorId?: string;
}

interface PostForm {
  title: string;
  description: string;
  price: string;
  area: string;
  location: string;
  district: string;
  city: string;
  images: string[];
  contactPhone: string;
  status: string;
}

const EditPost: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<PostForm>({
    title: '',
    description: '',
    price: '',
    area: '',
    location: '',
    district: '',
    city: '',
    images: [],
    contactPhone: '',
    status: 'active',
  });

  useEffect(() => {
    const fetchPost = async () => {
  try {
    const response = await api.get(`/posts/${id}`);  // Thay axios bằng api
    const fetchedPost: Post = response.data as Post;
    setPost(fetchedPost);
    setFormData({
      title: fetchedPost.title || '',
      description: fetchedPost.description || '',
      price: String(fetchedPost.price ?? ''),
      area: String(fetchedPost.area ?? ''),
      location: fetchedPost.location || '',
      district: fetchedPost.district || '',
      city: fetchedPost.city || '',
      images: fetchedPost.images || [],
      contactPhone: fetchedPost.contactPhone || '',
      status: fetchedPost.status || 'active',
    });
  } catch (err) {
    setError('Không thể tải tin đăng. Vui lòng thử lại.');
    console.error('Error fetching post:', err);
  } finally {
    setLoading(false);
  }
};

    fetchPost();
  }, [id, navigate]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [name]: value } as unknown as PostForm));
  };

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  try {
    setLoading(true);
    await api.put(`/posts/${id}`, {  // Thay axios bằng api
      ...formData,
      updatedAt: new Date().toISOString(), // Thêm timestamp cập nhật
    });
    alert('Cập nhật tin đăng thành công!');
    navigate('/my-posts');
  } catch (err) {
    setError('Không thể cập nhật tin đăng. Vui lòng thử lại.');
    console.error('Error updating post:', err);
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Đang tải tin đăng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <p>Không tìm thấy tin đăng.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Chỉnh sửa tin đăng</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Giá (VND)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                  Diện tích (m²)
                </label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Thành phố
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ cụ thể
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại liên hệ
              </label>
              <input
                type="text"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Đang hiển thị</option>
                <option value="paused">Tạm dừng</option>
                <option value="expired">Hết hạn</option>
              </select>
            </div>

            {/* Image upload section - simplified for now */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hình ảnh (URLs)
              </label>
              {formData.images.map((img, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={img}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const newImages = [...formData.images];
                      newImages[index] = e.target.value;
                      setFormData((prev) => ({ ...prev, images: newImages }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = formData.images.filter((_, i) => i !== index);
                      setFormData((prev) => ({ ...prev, images: newImages }));
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Xóa
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }))}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Thêm ảnh
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/my-posts')}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Cập nhật tin đăng
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
