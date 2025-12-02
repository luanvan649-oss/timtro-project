import React, { useState } from 'react';
import UserManagement from './UserManagement';
import PostManagement from './PostManagement';
import BlogManagement from './BlogManagement'; // Import BlogManagement

type AdminTab = 'userManagement' | 'postManagement' | 'blogManagement';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('userManagement'); // 'userManagement', 'postManagement', or 'blogManagement'

  const handleTabClick = (tab: AdminTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Bảng điều khiển Admin</h2>
        <nav>
          <ul>
            <li className="mb-2">
              <button
                onClick={() => handleTabClick('userManagement')}
                className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${
                  activeTab === 'userManagement'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                tabIndex={0}
                aria-label="Quản lý người dùng"
              >
                Quản lý người dùng
              </button>
            </li>
            <li className="mb-2">
              <button
                onClick={() => handleTabClick('postManagement')}
                className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${
                  activeTab === 'postManagement'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                tabIndex={0}
                aria-label="Quản lý bài đăng"
              >
                Quản lý bài đăng
              </button>
            </li>
            <li className="mb-2">
              <button
                onClick={() => handleTabClick('blogManagement')}
                className={`w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${
                  activeTab === 'blogManagement'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                tabIndex={0}
                aria-label="Quản lý blog"
              >
                Quản lý Blog
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8">
        {activeTab === 'userManagement' && <UserManagement />}
        {activeTab === 'postManagement' && <PostManagement />}
        {activeTab === 'blogManagement' && <BlogManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;
