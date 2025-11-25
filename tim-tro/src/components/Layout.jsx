// src/components/Layout.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Icons đơn giản thay thế (vì chưa cài lucide-react)
const UserIcon = () => <span className="inline-block w-5 h-5">Người dùng</span>;
const LogOutIcon = () => <span className="inline-block w-5 h-5">Ra</span>;
const DownIcon = () => <span className="inline-block w-4 h-4 ml-1">▼</span>;

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState(''); // Dùng cái này thôi
  const [showLoginModal, setShowLoginModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) setCurrentUser(JSON.parse(user));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/login');
  };

  const handleCreatePost = () => {
    if (!currentUser) {
      setShowLoginModal(true);
    } else {
      navigate('/create-post');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top blue bar */}
      <div className="bg-blue-600 text-white text-xs py-2">
        <div className="max-w-6xl mx-auto px-4 text-center">
          Kênh thông tin Phòng Trọ số 1 Việt Nam
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
          <Link to="/" className="text-3xl font-bold text-blue-600">FPTro</Link>

          {/* Search Bar - DÙNG globalSearchTerm */}
          <div className="flex-1 max-w-2xl">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Tìm kiếm tin đăng..."
                className="flex-1 px-4 py-2 text-sm focus:outline-none"
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
              />
              <button className="px-5 bg-orange-500 text-white hover:bg-orange-600">
                Tìm
              </button>
            </div>
          </div>

          {/* Right menu */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded"
                >
                  <UserIcon />
                  <span className="text-sm">{currentUser.email || 'User'}</span>
                  <DownIcon />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100 text-sm">
                      Thông tin cá nhân
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
                    >
                      <LogOutIcon /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm hover:text-blue-600">Đăng nhập</Link>
                <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded text-sm">
                  Đăng ký
                </Link>
              </>
            )}

            <button
              onClick={handleCreatePost}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded text-sm font-medium"
            >
              Đăng tin miễn phí
            </button>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-8">
            <Link
              to="/"
              className={`py-3 text-sm font-medium border-b-2 ${
                location.pathname === '/' 
                  ? 'text-orange-500 border-orange-500' 
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Phòng trọ
            </Link>
            <Link
              to="/blog"
              className={`py-3 text-sm font-medium border-b-2 ${
                location.pathname === '/blog'
                  ? 'text-orange-500 border-orange-500'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Blog
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content - truyền search term xuống Home */}
      <main className="flex-1 bg-gray-50">
        {React.Children.map(children, child =>
          React.isValidElement(child)
            ? React.cloneElement(child, { globalSearchTerm, setGlobalSearchTerm })
            : child
        )}
      </main>

      {/* Footer giữ nguyên đẹp */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-2xl font-bold mb-2">FPTro</p>
          <p className="text-sm">© 2024 FPTro. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>

      {/* Modal đơn giản thay thế */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Yêu cầu đăng nhập</h3>
            <p className="text-gray-600 mb-6">Bạn cần đăng nhập để đăng tin mới.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;