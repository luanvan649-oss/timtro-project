# 🚀 Quick Start Guide - Firebase Setup

## 📋 Checklist Setup

### ✅ 1. Firebase Console Setup
- [ ] Tạo project Firebase tại https://console.firebase.google.com/
- [ ] Thêm Web App và copy config
- [ ] Bật Authentication (Email/Password + Google)
- [ ] Tạo Firestore Database (test mode)
- [ ] Tạo Storage (test mode) - **OPTIONAL**

### ✅ 2. Cấu hình Local
- [ ] Cập nhật `src/firebase/config.js` với config thật
- [ ] Chạy `npm install` (Firebase đã có sẵn)
- [ ] Test connection tại `/firebase-test`

### ✅ 3. Cấu hình Rules
- [ ] Firestore Rules (xem bên dưới)
- [ ] Storage Rules (xem bên dưới)

## 🔧 Firebase Config

Thay thế trong `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 🛡️ Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
      allow create: if request.auth != null;
    }
    match /connections/{connectionId} {
      allow read, write: if request.auth != null;
    }
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    match /test/{testId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📦 Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🧪 Test Firebase

1. Chạy development server:
```bash
npm run dev
```

2. Truy cập: `http://localhost:5173/firebase-test`

3. Click "Run All Tests" để kiểm tra:
   - ✅ Authentication
   - ✅ Firestore
   - ✅ Storage (hoặc ⚠️ unavailable - vẫn OK)

## 🏗️ Cấu trúc Database

### Users Collection
```javascript
users/{userId} {
  uid: string,
  email: string,
  fullName: string,
  phone: string,
  school: string,
  major: string,
  yearOfStudy: string,
  gender: string,
  dateOfBirth: string,
  avatar: string,
  bio: string,
  isVerified: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Posts Collection
```javascript
posts/{postId} {
  authorId: string,
  title: string,
  description: string,
  location: string,
  budget: number,
  roomType: string,
  amenities: array,
  images: array,
  contactInfo: {
    phone: string,
    zalo: string,
    facebook: string
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 💡 Sử dụng Authentication

### Đăng ký
```javascript
import { useAuth } from './contexts/AuthContext';

const { register } = useAuth();

await register(email, password, {
  fullName: 'Tên đầy đủ',
  phone: '0123456789',
  school: 'Tên trường',
  major: 'Ngành học',
  yearOfStudy: '2',
  gender: 'Nam',
  dateOfBirth: '2000-01-01'
});
```

### Đăng nhập
```javascript
const { login } = useAuth();
await login(email, password);
```

### Đăng xuất
```javascript
const { logout } = useAuth();
await logout();
```

## 📊 Sử dụng Firestore

### Tạo bài đăng
```javascript
import { createPost } from './utils/firebase';

const postId = await createPost({
  title: 'Tìm bạn ghép trọ',
  description: 'Mô tả...',
  location: 'Quận 1, TP.HCM',
  budget: 3000000,
  roomType: 'Phòng đôi',
  amenities: ['wifi', 'dieu-hoa'],
  images: ['url1', 'url2'],
  contactInfo: {
    phone: '0123456789',
    zalo: '0123456789',
    facebook: 'fb.com/user'
  }
}, userId);
```

### Lấy danh sách bài đăng
```javascript
import { getPosts } from './utils/firebase';

const { posts, hasMore } = await getPosts({
  location: 'Quận 1',
  budget: 5000000
}, 10);
```

## 🚨 Troubleshooting

### 1. "Firebase: Error (auth/configuration-not-found)"
- Kiểm tra config trong `firebase/config.js`
- Đảm bảo Authentication đã bật trong Console

### 2. "Missing permissions"
- Kiểm tra Firestore Rules
- Đảm bảo user đã đăng nhập

### 3. "CORS error"
- Kiểm tra domain whitelist trong Firebase Console
- Đảm bảo chạy trên localhost:5173

### 4. "Storage không khả dụng"
- App vẫn hoạt động bình thường
- Sử dụng URL hình ảnh trực tiếp thay vì upload
- Xem section "Giải pháp thay thế Storage" bên dưới

## 🖼️ Giải pháp thay thế Storage

Nếu không có Storage, bạn có thể sử dụng:

### 1. URL hình ảnh trực tiếp
```javascript
// Thay vì upload, sử dụng URL có sẵn
const imageUrl = "https://example.com/image.jpg";
```

### 2. Placeholder images
```javascript
import { getPlaceholderImage, getDefaultImages } from './utils/firebase';

// Tạo placeholder
const placeholderUrl = getPlaceholderImage(400, 300, 'Phòng trọ');

// Sử dụng default images
const defaultImages = getDefaultImages();
const avatarUrl = defaultImages.avatar;
```

### 3. Base64 (chỉ cho hình nhỏ)
```javascript
import { fileToBase64 } from './utils/firebase';

const base64 = await fileToBase64(file);
// Lưu base64 vào Firestore
```

### 4. Dịch vụ thứ 3
- **Cloudinary**: Upload và CDN
- **ImgBB**: Free image hosting
- **Imgur**: Free image hosting

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Firebase Tutorial](https://firebase.google.com/docs/web/setup)

## 🎯 Next Steps

1. ✅ Setup Firebase (bạn đang ở đây)
2. Test các chức năng đăng ký/đăng nhập
3. Tạo bài đăng đầu tiên
4. Test tìm kiếm và kết nối
5. Deploy lên Vercel/Netlify

## 📞 Support

Nếu gặp vấn đề, check:
1. Browser Console (F12)
2. Firebase Console > Usage
3. Network tab để xem request/response 