import React, { useState, useEffect } from "react";
import api from "../api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "user", // default role
    isActive: true, // New field for user status
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("http://localhost:3001/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    // Coerce isActive select value to boolean
    const parsedValue = name === "isActive" ? value === "true" : value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: parsedValue,
    }));
  };

  const validateForm = () => {
    const { email, password } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{6,}$/;

    if (!emailRegex.test(email)) {
      alert("Email không hợp lệ. Vui lòng nhập đúng định dạng email.");
      return false;
    }
    if (!passwordRegex.test(password)) {
      alert(
        "Mật khẩu không hợp lệ. Mật khẩu phải có ít nhất 6 ký tự, bao gồm ít nhất một chữ hoa, một chữ thường và một số."
      );
      return false;
    }
    return true;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const newUser = { ...formData, creationTime: new Date().toISOString() }; // Add creation time
      await api.post("http://localhost:3001/users", newUser); // Use api.post instead of axios
      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "user",
        isActive: true,
      });
      fetchUsers();
      alert("Thêm người dùng thành công!"); // Add success message
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Có lỗi xảy ra khi thêm người dùng."); // Add error message
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user.id);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: user.password, // In a real app, you wouldn't edit passwords like this
      role: user.role,
      isActive: user.isActive,
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      await api.put(`http://localhost:3001/users/${editingUser}`, formData); // Use api.put instead of axios
      setEditingUser(null);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: "user",
        isActive: true,
      });
      fetchUsers();
      alert("Cập nhật người dùng thành công!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Có lỗi xảy ra khi cập nhật người dùng.");
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const userToUpdate = users.find((user) => user.id === userId);
      if (userToUpdate) {
        const updatedUser = { ...userToUpdate, isActive: !currentStatus };
        await api.put(`http://localhost:3001/users/${userId}`, updatedUser); // Use api.put instead of axios
        fetchUsers();
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleResetPassword = async (userId: string) => {
    const userToUpdate = users.find((user) => user.id === userId);
    if (!userToUpdate) {
      alert("Không tìm thấy người dùng.");
      return;
    }

    // Nhập mật khẩu mới
    const newPassword = window.prompt(
      "Nhập mật khẩu mới (ít nhất 6 ký tự, gồm chữ hoa, chữ thường và số):"
    );

    if (newPassword === null) return; // User bấm Cancel

    // Validate giống validateForm
    const passwordRegex = /^\d{6,}$/;

    if (!passwordRegex.test(newPassword)) {
      alert("Mật khẩu không hợp lệ. Mật khẩu phải có ít nhất 6 số");
      return;
    }

    try {
      await api.put(`http://localhost:3001/users/${userId}`, {
        ...userToUpdate,
        password: newPassword.trim(),
      });

      alert("Cập nhật mật khẩu thành công!");
      fetchUsers();
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Có lỗi xảy ra khi đặt lại mật khẩu.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Quản lý người dùng</h1>

      <Card className="mb-8 p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {editingUser ? "Sửa người dùng" : "Thêm người dùng mới"}
        </h2>
        <form
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Tên đầy đủ
            </label>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300"
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Vai trò
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="user">Người dùng</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {editingUser && (
            <div>
              <label
                htmlFor="isActive"
                className="block text-sm font-medium text-gray-700"
              >
                Trạng thái tài khoản
              </label>
              <select
                id="isActive"
                name="isActive"
                value={String(formData.isActive)}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="true">Kích hoạt</option>
                <option value="false">Chặn</option>
              </select>
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            {editingUser ? "Cập nhật người dùng" : "Thêm người dùng"}
          </Button>
          {editingUser && (
            <Button
              onClick={() => {
                setEditingUser(null);
                setFormData({
                  fullName: "",
                  email: "",
                  password: "",
                  role: "user",
                  isActive: true,
                });
              }}
              className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Hủy
            </Button>
          )}
        </form>
      </Card>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Họ và tên</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Vai trò</th>
              <th className="py-3 px-6 text-left">Thời gian tạo</th>
              <th className="py-3 px-6 text-left">Trạng thái tài khoản</th>
              <th className="py-3 px-6 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6 text-left">{user.fullName}</td>
                <td className="py-3 px-6 text-left">{user.email}</td>
                <td className="py-3 px-6 text-left">{user.role}</td>
                <td className="py-3 px-6 text-left">
                  {user.creationTime
                    ? new Date(user.creationTime).toLocaleString()
                    : "N/A"}
                </td>
                <td className="py-3 px-6 text-center">
                  <Button
                    onClick={() => {
                      const confirmMessage = user.isActive
                        ? "Bạn muốn chặn người dùng này?"
                        : "Bạn muốn kích hoạt người dùng này?";
                      if (window.confirm(confirmMessage)) {
                        handleToggleActive(user.id, user.isActive);
                      }
                    }}
                    className={`font-bold py-2 px-4 rounded text-xs ${
                      user.isActive
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    } text-white`}
                  >
                    {user.isActive ? "Kích hoạt" : "Chặn"}
                  </Button>
                </td>
                <td className="py-3 px-6 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      onClick={() => handleEditUser(user)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-xs"
                    >
                      Sửa
                    </Button>
                    <Button
                      onClick={() => handleResetPassword(user.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-xs"
                    >
                      Đặt lại mật khẩu
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
