import React, { useState, useEffect } from 'react';
import api from '../api';

import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../components/ui/Modal';
import Button from '../components/ui/Button';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const fetchPosts = async () => {
    try {
      const response = await api.get('http://localhost:3001/posts');
      let allPosts = response.data;
      
      // Filter by status if needed
      if (statusFilter !== 'all') {
        allPosts = allPosts.filter(post => post.status === statusFilter);
      }
      
      setPosts(allPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
  
  const handleApprovePost = async (postId: string) => {
    try {
      const postToUpdate = posts.find((post) => post.id === postId);
      if (postToUpdate) {
        const updatedPost = { ...postToUpdate, status: 'approved' };
        await api.put(`http://localhost:3001/posts/${postId}`, updatedPost);
        alert('Phê duyệt bài đăng thành công!');
        fetchPosts();
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(updatedPost);
        }
      }
    } catch (error) {
      console.error('Error approving post:', error);
      alert('Có lỗi xảy ra khi phê duyệt bài đăng.');
    }
  };
  
  const handleRejectPost = async (postId: string) => {
    try {
      const postToUpdate = posts.find((post) => post.id === postId);
      if (postToUpdate) {
        const updatedPost = { ...postToUpdate, status: 'rejected' };
        await api.put(`http://localhost:3001/posts/${postId}`, updatedPost);
        alert('Từ chối bài đăng thành công!');
        fetchPosts();
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(updatedPost);
        }
      }
    } catch (error) {
      console.error('Error rejecting post:', error);
      alert('Có lỗi xảy ra khi từ chối bài đăng.');
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

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Chờ phê duyệt', color: 'bg-yellow-500' },
      'approved': { label: 'Đã phê duyệt', color: 'bg-green-500' },
      'rejected': { label: 'Đã từ chối', color: 'bg-red-500' },
    };
    const statusInfo = statusMap[status] || { label: 'Chưa xác định', color: 'bg-gray-500' };
    return (
      <span className={`px-2 py-1 rounded text-white text-xs ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Quản lý bài đăng</h1>
      
      {/* Status Filter */}
      <div className="mb-4 flex gap-2">
        <Button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded ${statusFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Tất cả
        </Button>
        <Button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded ${statusFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Chờ phê duyệt
        </Button>
        <Button
          onClick={() => setStatusFilter('approved')}
          className={`px-4 py-2 rounded ${statusFilter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Đã phê duyệt
        </Button>
        <Button
          onClick={() => setStatusFilter('rejected')}
          className={`px-4 py-2 rounded ${statusFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Đã từ chối
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">Tiêu đề</th>
              <th className="py-3 px-6 text-left">Người dùng ID</th>
              <th className="py-3 px-6 text-left">Trạng thái</th>
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
                <td className="py-3 px-6 text-left">{getStatusBadge(post.status || 'pending')}</td>
                <td className="py-3 px-6 text-left">{post.featured ? 'Có' : 'Không'}</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Button onClick={() => handleViewDetails(post)} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded text-xs">
                      Xem chi tiết
                    </Button>
                    {post.status === 'pending' && (
                      <>
                        <Button onClick={() => {
                          if (window.confirm('Bạn có chắc muốn phê duyệt bài đăng này?')) {
                            handleApprovePost(post.id);
                          }
                        }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-xs">
                          Phê duyệt
                        </Button>
                        <Button onClick={() => {
                          if (window.confirm('Bạn có chắc muốn từ chối bài đăng này?')) {
                            handleRejectPost(post.id);
                          }
                        }} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-xs">
                          Từ chối
                        </Button>
                      </>
                    )}
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
                <p><strong>Trạng thái:</strong> {getStatusBadge(selectedPost.status || 'pending')}</p>
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
            <div className="flex justify-between w-full">
              <div>
                {selectedPost.status === 'pending' && (
                  <>
                    <Button onClick={() => {
                      if (window.confirm('Bạn có chắc muốn phê duyệt bài đăng này?')) {
                        handleApprovePost(selectedPost.id);
                      }
                    }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2">
                      Phê duyệt
                    </Button>
                    <Button onClick={() => {
                      if (window.confirm('Bạn có chắc muốn từ chối bài đăng này?')) {
                        handleRejectPost(selectedPost.id);
                      }
                    }} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                      Từ chối
                    </Button>
                  </>
                )}
              </div>
              <Button onClick={closeModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
                Đóng
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default PostManagement;
