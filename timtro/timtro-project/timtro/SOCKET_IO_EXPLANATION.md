# Giải thích về Socket.IO

Tài liệu này cung cấp giải thích toàn diện về Socket.IO, các khái niệm cốt lõi của nó và việc triển khai trong dự án `fer202_datphong`.

## 1. Socket.IO là gì?

Socket.IO là một thư viện JavaScript dành cho các ứng dụng web thời gian thực. Nó cho phép **giao tiếp hai chiều, dựa trên sự kiện** giữa các máy khách web (trình duyệt) và máy chủ. Nó được xây dựng dựa trên API WebSockets (khi có sẵn) và sẽ tự động chuyển sang các công nghệ thời gian thực khác như long-polling khi WebSockets không được hỗ trợ bởi máy khách hoặc môi trường máy chủ.

### Tại sao lại sử dụng Socket.IO?

Các yêu cầu HTTP truyền thống là không trạng thái và đơn hướng (máy khách yêu cầu, máy chủ phản hồi). Đối với các ứng dụng yêu cầu cập nhật tức thì, trò chuyện trực tiếp, thông báo hoặc các tính năng cộng tác, việc liên tục thăm dò máy chủ để lấy dữ liệu mới là không hiệu quả và tốn tài nguyên. Socket.IO giải quyết vấn đề này bằng cách cung cấp một kết nối ổn định, độ trễ thấp cho phép cả máy khách và máy chủ đẩy dữ liệu cho nhau bất cứ lúc nào.

## 2. Các khái niệm chính của Socket.IO

*   **Thời gian thực**: Dữ liệu được trao đổi tức thì giữa máy khách và máy chủ mà không cần yêu cầu rõ ràng từ máy khách.
*   **Giao tiếp hai chiều**: Cả máy khách và máy chủ đều có thể gửi và nhận tin nhắn một cách độc lập.
*   **Dựa trên sự kiện**: Giao tiếp dựa trên việc phát và lắng nghe các sự kiện tùy chỉnh, tương tự như cách các sự kiện DOM hoạt động trong JavaScript.
*   **Ưu tiên WebSockets**: Socket.IO cố gắng thiết lập kết nối WebSocket trước. Nếu không thành công, nó sẽ tự động chuyển sang các cơ chế truyền tải khác (ví dụ: long-polling, JSONP polling) để đảm bảo khả năng kết nối trên các trình duyệt và điều kiện mạng khác nhau.
*   **Phòng (Rooms) và Không gian tên (Namespaces)**:
    *   **Phòng (Rooms)**: Cho phép bạn nhóm các socket lại với nhau. Bạn có thể phát các sự kiện tới tất cả các socket trong một phòng cụ thể, điều này hữu ích cho các tính năng như phòng trò chuyện hoặc tin nhắn riêng tư.
    *   **Không gian tên (Namespaces)**: Cung cấp một cách để tách logic ứng dụng của bạn trên một kết nối dùng chung duy nhất. Ví dụ, bạn có thể có một không gian tên cho trò chuyện và một không gian tên khác cho thông báo.

## 3. Triển khai Socket.IO trong `fer202_datphong`

Dự án `fer202_datphong` tận dụng Socket.IO cho các chức năng thời gian thực, chủ yếu được quản lý thông qua một ngữ cảnh chuyên dụng ở frontend và một máy chủ Express ở backend.

### 3.1. Triển khai Backend (`server/index.js`)

Máy chủ backend chịu trách nhiệm khởi tạo máy chủ Socket.IO, quản lý các kết nối và xử lý các sự kiện thời gian thực.

*   **Khởi tạo**:
    ```javascript
    const express = require('express');
    const http = require('http');
    const { Server } = require('socket.io');

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173", // Cho phép nguồn frontend
            methods: ["GET", "POST"]
        }
    });

    // ... các thiết lập máy chủ khác (middleware, routes) ...

    io.on('connection', (socket) => {
        console.log('Một người dùng đã kết nối:', socket.id);

        // Lắng nghe các sự kiện tùy chỉnh từ máy khách
        socket.on('chatMessage', (msg) => {
            console.log('tin nhắn: ' + msg);
            io.emit('chatMessage', msg); // Phát sóng tới tất cả các máy khách đã kết nối
        });

        socket.on('disconnect', () => {
            console.log('Người dùng đã ngắt kết nối:', socket.id);
        });
    });

    server.listen(3000, () => {
        console.log('đang lắng nghe trên *:3000');
    });
    ```
    *   `http.createServer(app)`: Một máy chủ HTTP được tạo bằng ứng dụng Express. Socket.IO gắn vào máy chủ HTTP này.
    *   `new Server(server, { cors: ... })`: Máy chủ Socket.IO được khởi tạo, cho phép Chia sẻ tài nguyên giữa các nguồn gốc (CORS) để cho phép kết nối từ frontend (chạy trên `http://localhost:5173`).
    *   `io.on('connection', (socket) => { ... })`: Đây là trình lắng nghe sự kiện chính cho các kết nối máy khách mới. Khi một máy khách kết nối, hàm callback được thực thi, cung cấp một đối tượng `socket` dành riêng cho máy khách đó.
    *   `socket.on('eventName', (data) => { ... })`: Bên trong trình xử lý `connection`, máy chủ lắng nghe các sự kiện cụ thể (`chatMessage` trong ví dụ) được phát ra bởi từng máy khách.
    *   `io.emit('eventName', data)`: Đối tượng `io` (thể hiện máy chủ Socket.IO chính) được sử dụng để phát các sự kiện tới *tất cả* các máy khách đã kết nối. Đây là cách tin nhắn được phát sóng trong một ứng dụng trò chuyện.
    *   `socket.emit('eventName', data)`: Đối tượng `socket` (đại diện cho một kết nối máy khách duy nhất) được sử dụng để phát các sự kiện chỉ tới máy khách cụ thể đó.
    *   `socket.on('disconnect', () => { ... })`: Lắng nghe khi một máy khách ngắt kết nối khỏi máy chủ.

### 3.2. Triển khai Frontend (`src/context/SocketContext.jsx` và `src/hooks/useSocket.js`)

Frontend sử dụng React Context và một hook tùy chỉnh để quản lý kết nối máy khách Socket.IO và cung cấp nó cho các thành phần.

*   **`src/context/SocketContext.jsx`**:
    *   **Mục đích**: Tạo một React Context để làm cho thể hiện máy khách Socket.IO (`socket`) có sẵn trên toàn cầu cho bất kỳ thành phần nào cần nó.
    *   **Khởi tạo và vòng đời**:
        ```javascript
        import React, { createContext, useEffect, useState } from 'react';
        import io from 'socket.io-client';

        export const SocketContext = createContext();

        export const SocketProvider = ({ children }) => {
            const [socket, setSocket] = useState(null);
            const [isConnected, setIsConnected] = useState(false);

            useEffect(() => {
                const newSocket = io('http://localhost:3000'); // Kết nối đến backend

                newSocket.on('connect', () => {
                    setIsConnected(true);
                    console.log('Đã kết nối tới Socket.IO');
                });

                newSocket.on('disconnect', () => {
                    setIsConnected(false);
                    console.log('Đã ngắt kết nối từ Socket.IO');
                });

                setSocket(newSocket);

                // Dọn dẹp khi unmount
                return () => {
                    newSocket.disconnect();
                };
            }, []); // Chạy một lần khi thành phần được gắn

            return (
                <SocketContext.Provider value={{ socket, isConnected }}>
                    {children}
                </SocketContext.Provider>
            );
        };
        ```
        *   `io('http://localhost:3000')`: Khởi tạo máy khách Socket.IO, kết nối nó với máy chủ backend.
        *   `useEffect` hook: Đảm bảo kết nối socket được thiết lập khi `SocketProvider` được gắn và được dọn dẹp khi nó bị gỡ.
        *   `newSocket.on('connect', ...)` / `newSocket.on('disconnect', ...)`: Các trình lắng nghe phía máy khách cho trạng thái kết nối.
        *   `SocketContext.Provider`: Làm cho thể hiện `socket` và trạng thái `isConnected` có sẵn cho tất cả các thành phần con được bao bọc bởi provider này.

*   **`src/hooks/useSocket.js`**:
    *   **Mục đích**: Một React Hook tùy chỉnh đơn giản hóa việc sử dụng `SocketContext` và cung cấp các phương thức tiện lợi cho các hoạt động Socket.IO phổ biến.
    *   **Ví dụ sử dụng**:
        ```javascript
        import { useContext } from 'react';
        import { SocketContext } from '../context/SocketContext';

        export const useSocket = () => {
            const { socket, isConnected } = useContext(SocketContext);

            // Bạn có thể thêm các hàm trợ giúp khác ở đây, ví dụ: để phát ra các sự kiện cụ thể
            const emitEvent = (eventName, data) => {
                if (socket) {
                    socket.emit(eventName, data);
                }
            };

            const onEvent = (eventName, callback) => {
                if (socket) {
                    socket.on(eventName, callback);
                }
            };

            const offEvent = (eventName, callback) => {
                if (socket) {
                    socket.off(eventName, callback);
                }
            };

            return { socket, isConnected, emitEvent, onEvent, offEvent };
        };
        ```
        *   `useContext(SocketContext)`: Lấy đối tượng `socket` và trạng thái `isConnected` từ ngữ cảnh.
        *   `emitEvent`, `onEvent`, `offEvent`: Các hàm bao bọc để đơn giản hóa việc gửi và nhận sự kiện, trừu tượng hóa các lệnh gọi `socket.emit` và `socket.on` trực tiếp.

### 3.3. Sử dụng ở cấp độ thành phần (ví dụ: `src/components/ChatWindow.jsx`)

Các thành phần cần tính năng thời gian thực sử dụng hook `useSocket`.

```javascript
import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

const ChatWindow = () => {
    const { socket, isConnected, onEvent, emitEvent } = useSocket();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        if (!socket) return;

        // Lắng nghe tin nhắn trò chuyện đến
        onEvent('chatMessage', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        // Dọn dẹp trình lắng nghe khi unmount hoặc socket thay đổi
        return () => {
            offEvent('chatMessage'); // Điều này yêu cầu offEvent được trả về bởi useSocket
        };
    }, [socket, onEvent]); // Phụ thuộc vào socket và onEvent

    const handleSendMessage = () => {
        if (input.trim() && socket) {
            emitEvent('chatMessage', input); // Phát tin nhắn tới máy chủ
            setInput('');
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-md p-4">
            <div className="flex-1 overflow-y-auto mb-4">
                {messages.map((msg, index) => (
                    <div key={index} className="mb-2 p-2 bg-gray-100 rounded-md">
                        {msg}
                    </div>
                ))}
            </div>
            <div className="flex">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r-md"
                >
                    Gửi
                </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">Trạng thái: {isConnected ? 'Đã kết nối' : 'Đã ngắt kết nối'}</p>
        </div>
    );
};

export default ChatWindow;
```
*   `useSocket()`: Lấy thể hiện socket và các hàm trợ giúp.
*   `useEffect`: Được sử dụng để đăng ký sự kiện `chatMessage` từ máy chủ. Hàm dọn dẹp (`offEvent('chatMessage')`) rất quan trọng để ngăn chặn rò rỉ bộ nhớ và đảm bảo các trình lắng nghe sự kiện được loại bỏ khi thành phần bị gỡ.
*   `emitEvent('chatMessage', input)`: Gửi tin nhắn của người dùng đến máy chủ.

## 4. Các trường hợp sử dụng phổ biến trong `fer202_datphong`

Dựa trên cấu trúc dự án, Socket.IO có thể được sử dụng cho:

*   **Trò chuyện thời gian thực**: Như đã thấy trong `ChatWindow.jsx`, cho phép nhắn tin tức thì giữa những người dùng.
*   **Thông báo**: Đẩy các thông báo mới đến người dùng (ví dụ: yêu cầu kết nối mới, bình luận bài đăng) mà không yêu cầu tải lại trang. `NotificationDropdown.jsx` và `NotificationModal.jsx` sẽ lắng nghe các sự kiện này.
*   **Cập nhật trực tiếp**: Đối với các tính năng như hiển thị ai đang trực tuyến, cập nhật trực tiếp lượt thích/bình luận bài đăng hoặc thay đổi trạng thái (ví dụ: trạng thái kết nối).
*   **Quản lý kết nối**: Có thể là cập nhật thời gian thực cho các yêu cầu kết nối (đã gửi, đã nhận, đã chấp nhận, đã từ chối) trong `ConnectionModal.jsx` hoặc `Connections.jsx`.

Socket.IO là một công cụ mạnh mẽ để xây dựng các tính năng động, tương tác và thời gian thực vào các ứng dụng web, nâng cao đáng kể trải nghiệm người dùng.
