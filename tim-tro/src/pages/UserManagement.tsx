import React, { useState, useEffect } from "react";
import api from "../api";
import Button from "../components/ui/Button";

const UserManagement = () => {
  const [users, setUsers] = useState([]);

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

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const userToUpdate = users.find((user) => user.id === userId);
      if (userToUpdate) {
        const updatedUser = { ...userToUpdate, isActive: !currentStatus };
        await api.put(`http://localhost:3001/users/${userId}`, updatedUser);
        fetchUsers();
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Có lỗi xảy ra khi thay đổi trạng thái tài khoản.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Quản lý người dùng</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Họ và tên</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Vai trò</th>
              <th className="py-3 px-6 text-left">Thời gian tạo</th>
              <th className="py-3 px-6 text-center">Trạng thái tài khoản</th>
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
                        handleToggleActive(user.id, user.isActive ?? true);
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
