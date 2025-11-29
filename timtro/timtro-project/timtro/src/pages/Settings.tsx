import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Lock, User, Globe, Mail } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const Settings = () => {
  const [currentUser, setCurrentUser] = useState(null); // Will load from localStorage
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      showPhone: false,
      showEmail: false,
      profileVisible: true
    },
    language: 'vi',
    theme: 'light'
  });

  useEffect(() => {
    // Load current user from localStorage (e.g., after login)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    // Load settings from db.json for the current user
    const fetchSettings = async () => {
      if (storedUser) {
        const user = JSON.parse(storedUser);
        try {
          const response = await axios.get(`${API_BASE_URL}/settings/${user.id}`);
          setSettings(response.data);
        } catch (error) {
          console.error('Error loading settings:', error);
          // If no settings found, use default and create
          const defaultSettings = {
            id: user.id,
            notifications: { email: true, push: true, sms: false },
            privacy: { showPhone: false, showEmail: false, profileVisible: true },
            language: 'vi',
            theme: 'light'
          };
          await axios.post(`${API_BASE_URL}/settings`, defaultSettings);
          setSettings(defaultSettings);
        }
      }
    };
    fetchSettings();
  }, []);

  const handleNotificationChange = (type, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }));
  };

  const handlePrivacyChange = (type, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để lưu cài đặt.');
      return;
    }
    try {
      // Save settings to db.json
      await axios.put(`${API_BASE_URL}/settings/${currentUser.id}`, settings);
      alert('Cài đặt đã được lưu!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Lỗi khi lưu cài đặt. Vui lòng thử lại.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center">
            <SettingsIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Cài đặt</h1>
              <p className="text-gray-600">Quản lý tùy chọn và quyền riêng tư của bạn</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Bell className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Thông báo</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Thông báo Email</label>
                  <p className="text-xs text-gray-500">Nhận thông báo về tin nhắn và cập nhật qua email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.email}
                    onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Thông báo Push</label>
                  <p className="text-xs text-gray-500">Nhận thông báo trên trình duyệt</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.push}
                    onChange={(e) => handleNotificationChange('push', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Thông báo SMS</label>
                  <p className="text-xs text-gray-500">Nhận thông báo qua tin nhắn</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.sms}
                    onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Lock className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Quyền riêng tư</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Hiển thị số điện thoại</label>
                  <p className="text-xs text-gray-500">Cho phép người khác xem số điện thoại của bạn</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.privacy.showPhone}
                    onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Hiển thị email</label>
                  <p className="text-xs text-gray-500">Cho phép người khác xem email của bạn</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.privacy.showEmail}
                    onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Hồ sơ công khai</label>
                  <p className="text-xs text-gray-500">Cho phép người khác tìm thấy hồ sơ của bạn</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.privacy.profileVisible}
                    onChange={(e) => handlePrivacyChange('profileVisible', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Language & Theme */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Ngôn ngữ & Giao diện</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giao diện</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Sáng</option>
                  <option value="dark">Tối</option>
                  <option value="auto">Tự động</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Thông tin tài khoản</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium text-gray-900">{currentUser?.email}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Tên hiển thị:</span>
                <span className="text-sm font-medium text-gray-900">{currentUser?.displayName || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Ngày tham gia:</span>
                <span className="text-sm font-medium text-gray-900">
                  {currentUser?.metadata?.creationTime 
                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('vi-VN')
                    : 'Không xác định'}
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
