import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Home,
    MapPin,
    DollarSign,
    Maximize,
    Plus,
    X,
    Phone,
    Image as ImageIcon
} from 'lucide-react';

const LOCATIONS = [
    "Hồ Chí Minh",
    "Hà Nội",
    "Đà Nẵng",
    "Cần Thơ",
    "Quy Nhơn"
];

const DISTRICTS: Record<string, string[]> = {
    "Hồ Chí Minh": [
        "Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 9", "Quận 10", "Quận 11", "Quận 12",
        "Bình Thạnh", "Phú Nhuận", "Tân Bình", "Tân Phú", "Gò Vấp", "Bình Tân", "Thủ Đức",
        "Bình Chánh", "Nhà Bè", "Hóc Môn", "Củ Chi", "Cần Giờ"
    ],
    "Hà Nội": [
        "Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Long Biên", "Cầu Giấy", "Đống Đa", "Hai Bà Trưng", "Hoàng Mai", "Thanh Xuân", "Hà Đông",
        "Nam Từ Liêm", "Bắc Từ Liêm", "Thanh Trì", "Gia Lâm", "Đông Anh", "Sóc Sơn", "Mê Linh", "Sơn Tây",
        "Ba Vì", "Phúc Thọ", "Đan Phượng", "Hoài Đức", "Quốc Oai", "Thạch Thất", "Chương Mỹ", "Thanh Oai",
        "Thường Tín", "Phú Xuyên", "Ứng Hòa", "Mỹ Đức"
    ],
    "Đà Nẵng": [
        "Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ", "Hòa Vang", "Hoàng Sa"
    ],
    "Cần Thơ": [
        "Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn", "Thốt Nốt", "Phong Điền", "Cờ Đỏ", "Vĩnh Thạnh", "Thới Lai"
    ],
    "Quy Nhơn": [
        "Quy Nhơn", "An Nhơn", "Tuy Phước", "Phù Cát", "Phù Mỹ", "Hoài Nhơn", "Hoài Ân", "Tây Sơn", "Vân Canh", "Vĩnh Thạnh", "An Lão"
    ]
};

const CATEGORIES = [
    "Phòng trọ",
    "Nhà nguyên căn",
    "Căn hộ chung cư",
    "Căn hộ mini",
    "Căn hộ dịch vụ",
    "Ở ghép",
    "Mặt bằng"
];

const AMENITIES_LIST = [
    "Máy lạnh",
    "Wifi",
    "Giường",
    "Tủ quần áo",
    "Bàn học",
    "Tủ lạnh",
    "Máy giặt",
    "Bếp",
    "Ban công",
    "Thang máy",
    "Sân vườn",
    "Bãi đậu xe",
    "An ninh 24/7"
];

const API_BASE_URL = 'http://localhost:3001';

interface PostForm {
    id?: string;
    title: string;
    description: string;
    price: number | string;
    area: number | string;
    location: string;
    district: string;
    category: string;
    images: string[];
    amenities: string[];
    utilities: string[];
    deposit: number | string;
    contact: {
        name: string;
        phone: string;
        email: string;
    };
    address: string;
    genderPreference?: string;
    school?: string;
    major?: string;
    year?: string;
    userId?: string;
    featured?: boolean;
    rating?: number;
    views?: number;
    likes?: number;
    type?: string;
    city?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    contactPhone?: string;
    contactName?: string;
}

const CreateRoomListing = () => {
    const navigate = useNavigate();
    const { postId } = useParams();

    const currentUser = useState<{ id: string;[key: string]: any } | null>(() => {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    })[0];

    const [formData, setFormData] = useState<PostForm>({
        title: '',
        description: '',
        price: '',
        area: '',
        location: '',
        district: '',
        category: 'Phòng trọ',
        images: [],
        amenities: [],
        utilities: ['Điện', 'Nước', 'Internet'],
        deposit: '',
        contact: {
            name: '',
            phone: '',
            email: ''
        },
        address: '',
        genderPreference: '',
        school: '',
        major: '',
        year: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');

    // Load post data if editing
    useEffect(() => {
        const fetchPost = async () => {
            if (postId) {
                setLoading(true);
                try {
                    const response = await axios.get(`${API_BASE_URL}/posts/${postId}`);
                    const post = response.data;
                    if (post) {
                        setFormData(post);
                    } else {
                        alert('Bài đăng không tồn tại hoặc bạn không có quyền chỉnh sửa.');
                        navigate('/my-posts');
                    }
                } catch (err) {
                    alert('Không thể tải bài đăng để chỉnh sửa.');
                    navigate('/my-posts');
                    console.error('Error fetching post:', err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchPost();
    }, [navigate, postId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name.includes('contact.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                contact: {
                    ...prev.contact,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const isValidUrl = (url: string) => {
        try {
            const urlObject = new URL(url);
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
            const pathname = urlObject.pathname.toLowerCase();
            return imageExtensions.some(ext => pathname.endsWith(ext));
        } catch {
            return false;
        }
    };

    const handleAddImageUrl = () => {
        if (newImageUrl.trim() === '') {
            setError('Vui lòng nhập URL hình ảnh.');
            return;
        }
        if (!isValidUrl(newImageUrl.trim())) {
            setError('URL hình ảnh không hợp lệ. Vui lòng nhập URL hợp lệ kết thúc bằng .jpg, .jpeg, .png, .gif, .webp, hoặc .svg.');
            return;
        }
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, newImageUrl.trim()]
        }));
        setNewImageUrl('');
        setError('');
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate required fields
        if (!formData.title.trim()) {
            setError('Vui lòng nhập tiêu đề bài đăng');
            setLoading(false);
            return;
        }
        if (!formData.description.trim()) {
            setError('Vui lòng nhập mô tả');
            setLoading(false);
            return;
        }
        if (!formData.price) {
            setError('Vui lòng nhập giá thuê');
            setLoading(false);
            return;
        }
        if (!formData.area) {
            setError('Vui lòng nhập diện tích');
            setLoading(false);
            return;
        }
        if (!formData.contact.name.trim()) {
            setError('Vui lòng nhập tên liên hệ');
            setLoading(false);
            return;
        }
        if (!formData.contact.phone.trim()) {
            setError('Vui lòng nhập số điện thoại');
            setLoading(false);
            return;
        }
        if (!formData.location) {
            setError('Vui lòng chọn tỉnh/thành phố');
            setLoading(false);
            return;
        }
        if (!formData.district) {
            setError('Vui lòng chọn quận/huyện');
            setLoading(false);
            return;
        }

        try {
            // Get current user role
            const userRole = currentUser?.role || 'user';
            
            const postData = {
                ...formData,
                price: parseInt(String(formData.price)),
                area: parseInt(String(formData.area)),
                deposit: parseInt(String(formData.deposit) || '0'),
                userId: currentUser ? currentUser.id : 'anonymous',
                type: 'room_listing',
                city: formData.location,
                // If user is admin, set status to 'approved', otherwise 'pending'
                status: userRole === 'admin' ? 'approved' : (formData.status || 'pending'),
                createdAt: formData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                views: formData.views || 0,
                likes: formData.likes || 0,
                rating: formData.rating || 0,
                featured: formData.featured || false,
                contactPhone: formData.contact.phone,
                contactName: formData.contact.name
            };

            if (postId) {
                await axios.put(`${API_BASE_URL}/posts/${postId}`, postData);
                alert('Cập nhật bài đăng thành công!');
            } else {
                await axios.post(`${API_BASE_URL}/posts`, postData);
                if (userRole === 'admin') {
                    alert('Đăng bài thành công!');
                } else {
                    alert('Đăng bài thành công! Bài đăng của bạn đang chờ được phê duyệt bởi quản trị viên.');
                }
            }
            navigate('/my-posts');
        } catch (err) {
            setError('Có lỗi xảy ra khi lưu bài đăng.');
            console.error('Error saving post:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center mb-4">
                        <Home className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800">
                                {postId ? 'Chỉnh sửa bài đăng' : 'Đăng tin cho thuê phòng trọ'}
                            </h1>
                            <p className="text-gray-600">Điền đầy đủ thông tin để đăng tin cho thuê</p>
                        </div>
                    </div>
                </div>

                {/* Roommate Preferences (Optional) */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Home className="w-5 h-5 mr-2" />
                        Yêu cầu người thuê (Tùy chọn)
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">Thông tin này giúp bạn tìm người thuê phù hợp hơn</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Giới tính mong muốn
                            </label>
                            <select
                                name="genderPreference"
                                value={formData.genderPreference || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Không yêu cầu</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trường (nếu ưu tiên sinh viên)
                            </label>
                            <input
                                type="text"
                                name="school"
                                value={formData.school || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="VD: ĐH Bách Khoa"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngành
                            </label>
                            <input
                                type="text"
                                name="major"
                                value={formData.major || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="VD: Công nghệ thông tin"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Năm học
                            </label>
                            <select
                                name="year"
                                value={formData.year || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Chọn năm học</option>
                                <option value="Năm 1">Năm 1</option>
                                <option value="Năm 2">Năm 2</option>
                                <option value="Năm 3">Năm 3</option>
                                <option value="Năm 4">Năm 4</option>
                                <option value="Năm 5">Năm 5</option>
                                <option value="Sau đại học">Sau đại học</option>
                            </select>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Home className="w-5 h-5 mr-2" />
                            Thông tin cơ bản
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tiêu đề bài đăng *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="VD: Phòng trọ mới xây, đầy đủ nội thất gần trường ĐH..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại hình *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    {CATEGORIES.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giá thuê (VNĐ/tháng) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="VD: 3000000"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Diện tích (m²) *
                                </label>
                                <input
                                    type="number"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="VD: 25"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tiền đặt cọc (VNĐ)
                                </label>
                                <input
                                    type="number"
                                    name="deposit"
                                    value={formData.deposit}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="VD: 1000000"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả chi tiết *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Mô tả về phòng trọ, vị trí, tiện ích xung quanh..."
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            Vị trí
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tỉnh/Thành phố *
                                </label>
                                <select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {LOCATIONS.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quận/Huyện *
                                </label>
                                <select
                                    name="district"
                                    value={formData.district}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={!formData.location}
                                >
                                    <option value="">Chọn quận/huyện</option>
                                    {DISTRICTS[formData.location]?.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa chỉ chi tiết
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="VD: 123 Đường ABC, Phường XYZ"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Maximize className="w-5 h-5 mr-2" />
                            Tiện ích
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {AMENITIES_LIST.map(amenity => (
                                <label
                                    key={amenity}
                                    className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.amenities.includes(amenity)}
                                        onChange={() => toggleAmenity(amenity)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{amenity}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Phone className="w-5 h-5 mr-2" />
                            Thông tin liên hệ
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên người liên hệ *
                                </label>
                                <input
                                    type="text"
                                    name="contact.name"
                                    value={formData.contact.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="VD: Nguyễn Văn A"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại *
                                </label>
                                <input
                                    type="tel"
                                    name="contact.phone"
                                    value={formData.contact.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="VD: 0123456789"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="contact.email"
                                    value={formData.contact.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="VD: example@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <ImageIcon className="w-5 h-5 mr-2" />
                            Hình ảnh
                        </h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thêm ảnh từ URL
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Dán URL hình ảnh vào đây (ví dụ: https://example.com/image.jpg)"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddImageUrl}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!newImageUrl.trim()}
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>

                        {formData.images.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Hình ảnh đã chọn:</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {formData.images.map((image, index) => (
                                        <div key={index} className="relative rounded-lg overflow-hidden border border-gray-300">
                                            <img
                                                src={image}
                                                alt={`Hình ảnh ${index + 1}`}
                                                className="w-full h-32 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-red-600">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang đăng tin...
                                    </>
                                ) : (
                                    postId ? 'Cập nhật' : 'Đăng tin'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomListing;
