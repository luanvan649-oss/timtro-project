# Hướng dẫn dự án: fer202_datphong

Tài liệu này cung cấp hướng dẫn toàn diện về dự án `fer202_datphong`, bao gồm mục đích, ngăn xếp công nghệ, cấu trúc dự án và cách bắt đầu phát triển.

## 1. Tổng quan dự án

Dự án `fer202_datphong` là một ứng dụng web được thiết kế để [**TODO: Thêm mô tả ngắn gọn về mục đích và các tính năng chính của dự án, ví dụ: "quản lý đặt phòng", "nền tảng mạng xã hội", v.v.**]. Nó tận dụng các công nghệ web hiện đại để cung cấp trải nghiệm người dùng tương tác và phản hồi nhanh.

## 2. Ngăn xếp công nghệ

Dự án này được xây dựng bằng một ngăn xếp công nghệ mạnh mẽ và hiện đại:

### Giao diện người dùng (Frontend):
*   **ReactJS**: Một thư viện JavaScript để xây dựng giao diện người dùng.
*   **Vite**: Một công cụ xây dựng nhanh cung cấp trải nghiệm phát triển cực nhanh.
*   **JavaScript/TypeScript**: Ngôn ngữ lập trình chính cho logic frontend. TypeScript được sử dụng để tăng cường an toàn kiểu dữ liệu và trải nghiệm lập trình viên.
*   **HTML**: Ngôn ngữ đánh dấu tiêu chuẩn để tạo các trang web.
*   **CSS**: Ngôn ngữ tạo kiểu, chủ yếu được triển khai bằng Tailwind CSS.
*   **TailwindCSS**: Một framework CSS tiện ích để xây dựng nhanh chóng các thiết kế tùy chỉnh.
*   **Shadcn/Radix UI**: (Nếu có, chỉ định các thành phần được sử dụng) Các thư viện thành phần UI hiện đại được xây dựng trên các nguyên tắc Radix UI, được tạo kiểu bằng Tailwind CSS, cung cấp các yếu tố UI có thể truy cập và tùy chỉnh.

### Phụ trợ (Backend):
*   **Node.js/Express**: (Dựa trên `server/index.js` và `package.json`) Một môi trường chạy JavaScript và framework ứng dụng web cho API backend.
*   **Socket.IO**: Một thư viện để giao tiếp thời gian thực, hai chiều, dựa trên sự kiện. Được sử dụng cho các tính năng như trò chuyện, thông báo hoặc cập nhật trực tiếp.
*   **JSON Server / Cơ sở dữ liệu**: (Dựa trên `db.json`) Một API REST giả lập để tạo mẫu nhanh, hoặc chỗ dành sẵn cho một giải pháp cơ sở dữ liệu thực sự.

### Các công cụ khác:
*   **ESLint**: Để kiểm tra lỗi mã nguồn và duy trì chất lượng mã.
*   **Prettier**: Để định dạng mã.
*   **Vite**: Công cụ xây dựng.

## 3. Cấu trúc dự án

Dự án tuân theo cấu trúc ứng dụng React tiêu chuẩn với sự tách biệt rõ ràng về các mối quan tâm:

*   **`/public`**: Các tài nguyên tĩnh như `logo-fptro.svg`, `vite.svg`.
*   **`/server`**: Chứa triển khai máy chủ backend.
    *   `server/index.js`: Điểm vào chính cho máy chủ backend.
*   **`/src`**: Chứa tất cả mã nguồn frontend.
    *   **`src/App.jsx`**: Thành phần ứng dụng chính.
    *   **`src/main.jsx`**: Điểm vào cho ứng dụng React.
    *   **`src/index.css` / `src/App.css`**: Các kiểu CSS toàn cục và các kiểu dành riêng cho ứng dụng.
    *   **`src/assets`**: Các tài nguyên tĩnh như hình ảnh và biểu tượng.
        *   `src/assets/images/`: Chứa các hình ảnh được sử dụng trong ứng dụng.
    *   **`src/components`**: Các thành phần UI có thể tái sử dụng.
        *   `src/components/ui/`: Chứa các nguyên tắc UI thường dựa trên Shadcn/Radix UI.
            *   `Button.jsx`, `Card.jsx`, `Input.jsx`, `Modal.jsx`: Ví dụ về các thành phần UI chung.
    *   **`src/context`**: Các nhà cung cấp React Context API để quản lý trạng thái toàn cục.
        *   `SocketContext.jsx`, `SocketContextObject.js`: Context cho tích hợp Socket.IO.
    *   **`src/hooks`**: Các hook React tùy chỉnh cho logic có thể tái sử dụng.
        *   `useSocket.js`: Hook tùy chỉnh để quản lý kết nối Socket.IO.
    *   **`src/pages`**: Các thành phần cấp cao nhất đại diện cho các chế độ xem/trang khác nhau của ứng dụng.
        *   `Home.jsx`, `Login.jsx`, `Register.jsx`, `Profile.jsx`, `Connections.jsx`, v.v.: Ví dụ về các thành phần trang.

## 4. Bắt đầu

Làm theo các bước sau để thiết lập và chạy dự án cục bộ:

### Điều kiện tiên quyết:
*   Node.js (khuyến nghị phiên bản LTS)
*   npm hoặc Yarn

### Cài đặt:

1.  **Clone kho lưu trữ (nếu có):**
    ```bash
    git clone [repository-url]
    cd fer202_datphong
    ```
2.  **Cài đặt các phụ thuộc:**
    Điều hướng đến thư mục gốc của dự án và chạy:
    ```bash
    npm install
    # hoặc yarn install
    ```

### Chạy ứng dụng:

Dự án thường bao gồm việc chạy cả máy chủ frontend và backend.

1.  **Khởi động máy chủ Backend:**
    ```bash
    node server/index.js
    ```
    (Hoặc kiểm tra các script trong `package.json` để tìm lệnh khởi động backend cụ thể, ví dụ: `npm run start-server`)

2.  **Khởi động máy chủ phát triển Frontend:**
    ```bash
    npm run dev
    # hoặc yarn dev
    ```
    Thao tác này thường sẽ khởi động frontend trên `http://localhost:5173` (hoặc một cổng khác).

### Xây dựng cho sản phẩm:
Để tạo bản dựng sẵn sàng cho sản phẩm của frontend:
```bash
npm run build
# hoặc yarn build
```
Thao tác này sẽ tạo các tài sản tĩnh được tối ưu hóa trong thư mục `dist`.

## 5. Hướng dẫn phát triển

*   **Phong cách mã**: Tuân thủ cấu hình ESLint và Prettier.
*   **Cấu trúc thành phần**: Giữ các thành phần nhỏ, tập trung và có thể tái sử dụng.
*   **Tạo kiểu**: Sử dụng các lớp tiện ích Tailwind CSS. Tránh các tệp CSS tùy chỉnh trừ khi thực sự cần thiết cho các kiểu phức tạp, độc đáo.
*   **Khả năng truy cập**: Đảm bảo tất cả các phần tử tương tác đều có `aria-label`, `tabIndex` và hỗ trợ điều hướng bằng bàn phím phù hợp.
*   **Quy ước đặt tên**:
    *   Biến và hằng số: `camelCase` (ví dụ: `userName`, `API_URL`).
    *   Tên hàm: `camelCase`. Các hàm xử lý sự kiện nên được đặt tên với tiền tố `handle` (ví dụ: `handleClick`, `handleInputChange`).
    *   Tên thành phần: `PascalCase` (ví dụ: `MyComponent`, `UserProfile`).
*   **Trả về sớm**: Sử dụng câu lệnh `return` sớm để dễ đọc hơn và logic điều kiện sạch hơn.

## 6. Đóng góp

[**TODO: Thêm hướng dẫn đóng góp nếu đây là dự án mã nguồn mở hoặc dự án nhóm.**]

## 7. Khắc phục sự cố

*   **Xung đột cổng**: Nếu `npm run dev` hoặc `node server/index.js` gặp lỗi do cổng đang được sử dụng, hãy thay đổi số cổng trong `vite.config.js` (cho frontend) hoặc `server/index.js` (cho backend).
*   **Sự cố phụ thuộc**: Thử xóa `node_modules` và `package-lock.json` (hoặc `yarn.lock`) và cài đặt lại:
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```

Hướng dẫn này sẽ cung cấp nền tảng vững chắc để hiểu và đóng góp vào dự án `fer202_datphong`.
