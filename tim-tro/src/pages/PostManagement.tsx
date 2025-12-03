import React, { useState, useEffect } from 'react';
import api from '../api';  // Đảm bảo bạn đã import API client của mình

import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../components/ui/Modal';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    area: 0,
    location: '',
    district: '',
    category: '',
    images: [],
    amenities: [],
    utilities: [],
    deposit: 0,
    contact: {
      name: '',
      phone: '',
      email: ''
    },
    address: '',
    userId: '',
    featured: false,
    rating: 0,
    views: 0,
    likes: 0
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
  try {
    const response = await api.get('http://localhost:3001/posts'); // Sử dụng api.get thay vì axios.get
    setPosts(response.data);
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prevData) => ({
        ...prevData,
        [parent]: {
          ...prevData[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value.split(',').map(item => item.trim());
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleEditPost = (post) => {
    setEditingPost(post.id);
    setFormData({
      title: post.title,
      description: post.description,
      price: post.price,
      area: post.area,
      location: post.location,
      district: post.district,
      category: post.category,
      images: post.images,
      amenities: post.amenities,
      utilities: post.utilities,
      deposit: post.deposit,
      contact: post.contact,
      address: post.address,
      userId: post.userId,
      featured: post.featured,
      rating: post.rating,
      views: post.views,
      likes: post.likes
    });
  };

  const handleUpdatePost = async (e) => {
  e.preventDefault();
  try {
    await api.put(`http://localhost:3001/posts/${editingPost}`, formData); // Sử dụng api.put thay vì axios.put
    setEditingPost(null);
    setFormData({
      title: '', description: '', price: 0, area: 0, location: '', district: '', category: '', images: [], amenities: [], utilities: [], deposit: 0, contact: { name: '', phone: '', email: '' }, address: '', userId: '', featured: false, rating: 0, views: 0, likes: 0
    });
    fetchPosts();
  } catch (error) {
    console.error('Error updating post:', error);
  }
};


  const handleDeletePost = async (postId) => {
  try {
    await api.delete(`http://localhost:3001/posts/${postId}`); // Sử dụng api.delete thay vì axios.delete
    fetchPosts();
  } catch (error) {
    console.error('Error deleting post:', error);
  }
};


  const handleViewDetails = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Quản lý bài đăng</h1>

      <Card className="mb-8 p-6">
        <h2 className="text-2xl font-semibold mb-4">{editingPost ? 'Sửa bài đăng' : 'Thêm bài đăng mới'}</h2>
        <form onSubmit={handleUpdatePost} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề</label>
            <Input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Giá</label>
            <Input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700">Diện tích (m²)</label>
            <Input type="number" id="area" name="area" value={formData.area} onChange={handleChange} required className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Địa điểm</label>
            <Input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">Quận/Huyện</label>
            <Input type="text" id="district" name="district" value={formData.district} onChange={handleChange} required className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Danh mục</label>
            <Input type="text" id="category" name="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700">Hình ảnh (URL, cách nhau bởi dấu phẩy)</label>
            <Input type="text" id="images" name="images" value={formData.images.join(', ')} onChange={(e) => handleArrayChange(e, 'images')} className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="amenities" className="block text-sm font-medium text-gray-700">Tiện nghi (cách nhau bởi dấu phẩy)</label>
            <Input type="text" id="amenities" name="amenities" value={formData.amenities.join(', ')} onChange={(e) => handleArrayChange(e, 'amenities')} className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="utilities" className="block text-sm font-medium text-gray-700">Chi phí khác (cách nhau bởi dấu phẩy)</label>
            <Input type="text" id="utilities" name="utilities" value={formData.utilities.join(', ')} onChange={(e) => handleArrayChange(e, 'utilities')} className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="deposit" className="block text-sm font-medium text-gray-700">Tiền đặt cọc</label>
            <Input type="number" id="deposit" name="deposit" value={formData.deposit} onChange={handleChange} className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="contact.name" className="block text-sm font-medium text-gray-700">Tên liên hệ</label>
            <Input type="text" id="contact.name" name="contact.name" value={formData.contact.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="contact.phone" className="block text-sm font-medium text-gray-700">Số điện thoại liên hệ</label>
            <Input type="text" id="contact.phone" name="contact.phone" value={formData.contact.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="contact.email" className="block text-sm font-medium text-gray-700">Email liên hệ</label>
            <Input type="email" id="contact.email" name="contact.email" value={formData.contact.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
            <Input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">ID người dùng</label>
            <Input type="text" id="userId" name="userId" value={formData.userId} onChange={handleChange} required className="mt-1 block w-full border border-gray-300" />
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleCheckboxChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">Nổi bật</label>
          </div>
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Đánh giá</label>
            <Input type="number" id="rating" name="rating" value={formData.rating} onChange={handleChange} className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="views" className="block text-sm font-medium text-gray-700">Lượt xem</label>
            <Input type="number" id="views" name="views" value={formData.views} onChange={handleChange} className="mt-1 block w-full border border-gray-300" />
          </div>
          <div>
            <label htmlFor="likes" className="block text-sm font-medium text-gray-700">Lượt thích</label>
            <Input type="number" id="likes" name="likes" value={formData.likes} onChange={handleChange} className="mt-1 block w-full border border-gray-300" />
          </div>

          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            {editingPost ? 'Cập nhật bài đăng' : 'Thêm bài đăng'}
          </Button>
          {editingPost && (
            <Button onClick={() => { 
              setEditingPost(null); 
              setFormData({ 
                title: '', description: '', price: 0, area: 0, location: '', district: '', category: '', images: [], amenities: [], utilities: [], deposit: 0, contact: { name: '', phone: '', email: '' }, address: '', userId: '', featured: false, rating: 0, views: 0, likes: 0 
              }); 
            }} className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
              Hủy
            </Button>
          )}
        </form>
      </Card>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">Tiêu đề</th>
              <th className="py-3 px-6 text-left">Người dùng ID</th>
              <th className="py-3 px-6 text-left">Nổi bật</th>
              <th className="py-3 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">{post.id}</td>
                <td className="py-3 px-6 text-left">{post.title}</td>
                <td className="py-3 px-6 text-left">{post.userId}</td>
                <td className="py-3 px-6 text-left">{post.featured ? 'Có' : 'Không'}</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Button onClick={() => handleEditPost(post)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-xs">
                      Sửa
                    </Button>
                    <Button onClick={() => handleDeletePost(post.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-xs">
                      Xóa
                    </Button>
                    <Button onClick={() => handleViewDetails(post)} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded text-xs">
                      Xem chi tiết
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <Modal isOpen={showModal} onClose={closeModal} size="lg">
          <ModalHeader onClose={closeModal}>
            <ModalTitle>Chi tiết bài đăng: {selectedPost.title}</ModalTitle>
          </ModalHeader>
          <ModalContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>ID:</strong> {selectedPost.id}</p>
                <p><strong>Mô tả:</strong> {selectedPost.description}</p>
                <p><strong>Giá:</strong> {selectedPost.price} VNĐ</p>
                <p><strong>Diện tích:</strong> {selectedPost.area} m²</p>
                <p><strong>Địa điểm:</strong> {selectedPost.location}</p>
                <p><strong>Quận/Huyện:</strong> {selectedPost.district}</p>
                <p><strong>Danh mục:</strong> {selectedPost.category}</p>
                <p><strong>Tiền đặt cọc:</strong> {selectedPost.deposit} VNĐ</p>
                <p><strong>ID người dùng:</strong> {selectedPost.userId}</p>
                <p><strong>Nổi bật:</strong> {selectedPost.featured ? 'Có' : 'Không'}</p>
                <p><strong>Đánh giá:</strong> {selectedPost.rating}</p>
                <p><strong>Lượt xem:</strong> {selectedPost.views}</p>
                <p><strong>Lượt thích:</strong> {selectedPost.likes}</p>
              </div>
              <div>
                <p><strong>Tên liên hệ:</strong> {selectedPost.contact.name}</p>
                <p><strong>Số điện thoại:</strong> {selectedPost.contact.phone}</p>
                <p><strong>Email liên hệ:</strong> {selectedPost.contact.email}</p>
                <p><strong>Địa chỉ:</strong> {selectedPost.address}</p>
                <p><strong>Hình ảnh:</strong></p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedPost.images.map((img, index) => (
                    <img key={index} src={img} alt={`Post image ${index + 1}`} className="w-24 h-24 object-cover rounded-md" />
                  ))}
                </div>
                <p className="mt-2"><strong>Tiện nghi:</strong> {selectedPost.amenities.join(', ')}</p>
                <p><strong>Chi phí khác:</strong> {selectedPost.utilities.join(', ')}</p>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button onClick={closeModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
              Đóng
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default PostManagement;
