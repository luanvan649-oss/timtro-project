import React, { useState, useEffect, useRef } from 'react';
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
import { VIETNAM_PROVINCES, VIETNAM_DISTRICTS, VIETNAM_WARDS, VIETNAM_STREETS, getDefaultWards, getDefaultStreets } from '../constants/vietnamLocations';

// Declare Google Maps types
declare global {
    interface Window {
        google: any;
    }
}

const LOCATIONS = VIETNAM_PROVINCES;
const DISTRICTS: Record<string, string[]> = VIETNAM_DISTRICTS;

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
    ward?: string; // Phường/Xã
    street?: string; // Đường/Phố
    houseNumber?: string; // Số nhà
    latitude?: number;
    longitude?: number;
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
        ward: '',
        street: '',
        houseNumber: '',
        genderPreference: '',
        school: '',
        major: '',
        year: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
    const [districtSearchTerm, setDistrictSearchTerm] = useState('');
    const [showWardDropdown, setShowWardDropdown] = useState(false);
    const [wardSearchTerm, setWardSearchTerm] = useState('');
    const [showStreetDropdown, setShowStreetDropdown] = useState(false);
    const [streetSearchTerm, setStreetSearchTerm] = useState('');
    const districtDropdownRef = useRef<HTMLDivElement>(null);
    const wardDropdownRef = useRef<HTMLDivElement>(null);
    const streetDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target as Node)) {
                setShowDistrictDropdown(false);
            }
            if (wardDropdownRef.current && !wardDropdownRef.current.contains(event.target as Node)) {
                setShowWardDropdown(false);
            }
            if (streetDropdownRef.current && !streetDropdownRef.current.contains(event.target as Node)) {
                setShowStreetDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    // Function to update address and geocode
    const updateAddressAndGeocode = async (location: string, district: string, ward: string, street: string, houseNumber: string) => {
        const addressParts = [];
        if (houseNumber) addressParts.push(houseNumber);
        if (street) addressParts.push(street);
        if (ward) addressParts.push(ward);
        if (district) addressParts.push(district);
        if (location) addressParts.push(location);
        
        const fullAddress = addressParts.join(', ') + ', Việt Nam';
        
        if (fullAddress === ', Việt Nam') return; // Don't geocode empty address
        
        if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address: fullAddress, region: 'VN' }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const location = results[0].geometry.location;
                    const lat = location.lat();
                    const lng = location.lng();
                    
                    setFormData(prev => ({
                        ...prev,
                        address: fullAddress,
                        latitude: lat,
                        longitude: lng
                    }));

                    // Update map marker if map is initialized
                    if (mapInstanceRef.current && markerRef.current) {
                        const position = { lat, lng };
                        markerRef.current.setPosition(position);
                        mapInstanceRef.current.setCenter(position);
                        mapInstanceRef.current.setZoom(15);
                    }
                }
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Reset các trường con khi thay đổi tỉnh/thành phố
        if (name === 'location') {
            setFormData(prev => ({
                ...prev,
                location: value,
                district: '',
                ward: '',
                street: '',
                address: ''
            }));
            setShowDistrictDropdown(false);
            setShowWardDropdown(false);
            setShowStreetDropdown(false);
            return;
        }

        // Reset phường/xã và đường/phố khi thay đổi quận/huyện
        if (name === 'district') {
            setFormData(prev => {
                const newData = {
                    ...prev,
                    district: value,
                    ward: '',
                    street: ''
                };
                // Update address and geocode
                setTimeout(() => {
                    updateAddressAndGeocode(newData.location, value, '', '', newData.houseNumber || '');
                }, 100);
                return newData;
            });
            setShowWardDropdown(false);
            setShowStreetDropdown(false);
            return;
        }

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

    // Auto-generate address from selected fields and update map
    useEffect(() => {
        const addressParts = [];
        if (formData.houseNumber) addressParts.push(formData.houseNumber);
        if (formData.street) addressParts.push(formData.street);
        if (formData.ward) addressParts.push(formData.ward);
        if (formData.district) addressParts.push(formData.district);
        if (formData.location) addressParts.push(formData.location);
        
        const fullAddress = addressParts.join(', ');
        
        if (fullAddress) {
            setFormData(prev => ({
                ...prev,
                address: fullAddress
            }));

            // Geocode address to get coordinates and update map
            if (window.google && window.google.maps && fullAddress.length > 5) {
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ address: fullAddress, region: 'VN' }, (results, status) => {
                    if (status === 'OK' && results && results[0]) {
                        const location = results[0].geometry.location;
                        const lat = location.lat();
                        const lng = location.lng();
                        
                        setFormData(prev => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng
                        }));

                        // Update map marker if map is initialized
                        if (mapInstanceRef.current && markerRef.current) {
                            const position = { lat, lng };
                            markerRef.current.setPosition(position);
                            mapInstanceRef.current.setCenter(position);
                            mapInstanceRef.current.setZoom(15);
                        }
                    }
                });
            }
        }
    }, [formData.houseNumber, formData.street, formData.ward, formData.district, formData.location]);

    // Initialize Google Maps
    const initializeMap = () => {
        try {
            if (!mapRef.current) {
                console.error('Map ref is not available');
                setError('Không thể khởi tạo bản đồ. Vui lòng thử lại.');
                return;
            }
            
            if (!window.google || !window.google.maps) {
                console.error('Google Maps API not loaded');
                setError('Google Maps API chưa được tải. Vui lòng kiểm tra kết nối internet hoặc thử lại sau.');
                return;
            }

            // Default to Ho Chi Minh City if no location selected
            const defaultLat = formData.latitude || 10.8231;
            const defaultLng = formData.longitude || 106.6297;

            let map;
            try {
                map = new window.google.maps.Map(mapRef.current, {
                    center: { lat: defaultLat, lng: defaultLng },
                    zoom: 15,
                    mapTypeControl: true,
                    streetViewControl: true,
                    fullscreenControl: true
                });
                
                // Check for InvalidKeyMapError immediately after map creation
                // Google Maps throws this error synchronously, so we need to check the console
                setTimeout(() => {
                    // Check if map div shows error (Google Maps displays error in the map container)
                    if (mapRef.current) {
                        const mapDiv = mapRef.current;
                        const hasError = mapDiv.innerHTML.includes('Rất tiếc') || 
                                       mapDiv.innerHTML.includes('Đã xảy ra lỗi') ||
                                       mapDiv.innerHTML.includes('did not load Google Maps correctly');
                        if (hasError) {
                            console.error('Google Maps error detected in map container');
                            setError('API key Google Maps không hợp lệ hoặc đã hết hạn. Vui lòng:\n1. Truy cập Google Cloud Console (https://console.cloud.google.com/)\n2. Vào "APIs & Services" > "Credentials"\n3. Kiểm tra hoặc tạo API key mới\n4. Đảm bảo "Maps JavaScript API" đã được kích hoạt\n5. Cập nhật API key trong file .env hoặc liên hệ quản trị viên.');
                        }
                    }
                }, 500);
                
                // Listen for map errors (like InvalidKeyMapError)
                map.addListener('error', (error: any) => {
                    console.error('Google Maps error event:', error);
                    if (error && error.message) {
                        if (error.message.includes('InvalidKey') || error.message.includes('InvalidKeyMapError')) {
                            setError('API key Google Maps không hợp lệ hoặc đã hết hạn. Vui lòng cập nhật API key mới trong Google Cloud Console.');
                        } else {
                            setError(`Lỗi Google Maps: ${error.message}`);
                        }
                    }
                });
            } catch (mapError: any) {
                console.error('Error creating map:', mapError);
                const errorMsg = mapError.message || mapError.toString() || 'Lỗi không xác định';
                if (errorMsg.includes('InvalidKey') || errorMsg.includes('InvalidKeyMapError')) {
                    throw new Error('API key Google Maps không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra API key trong Google Cloud Console và đảm bảo "Maps JavaScript API" đã được kích hoạt.');
                }
                throw new Error(`Không thể tạo bản đồ: ${errorMsg}. Có thể do API key không hợp lệ.`);
            }

            mapInstanceRef.current = map;

            // Add marker
            const marker = new window.google.maps.Marker({
                map: map,
                position: { lat: defaultLat, lng: defaultLng },
                draggable: true,
                title: 'Vị trí phòng trọ'
            });

            markerRef.current = marker;

            // Update form data when marker is dragged
            marker.addListener('dragend', () => {
                const position = marker.getPosition();
                if (position) {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.lat(),
                        longitude: position.lng()
                    }));
                }
            });

            // Update marker position when map is clicked
            map.addListener('click', (e: any) => {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                marker.setPosition({ lat, lng });
                setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng
                }));

                // Reverse geocoding to get address
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results && results[0]) {
                        setFormData(prev => ({
                            ...prev,
                            address: results[0].formatted_address
                        }));
                    }
                });
            });

            // Add search box (optional, may fail if Places API is not available)
            try {
                if (window.google.maps.places && window.google.maps.places.SearchBox) {
                    const searchBox = new window.google.maps.places.SearchBox(
                        document.createElement('input')
                    );
                    map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(searchBox);

                    searchBox.addListener('places_changed', () => {
                        const places = searchBox.getPlaces();
                        if (places && places.length > 0) {
                            const place = places[0];
                            if (place.geometry && place.geometry.location) {
                                const lat = place.geometry.location.lat();
                                const lng = place.geometry.location.lng();
                                marker.setPosition({ lat, lng });
                                map.setCenter({ lat, lng });
                                map.setZoom(17);
                                setFormData(prev => ({
                                    ...prev,
                                    latitude: lat,
                                    longitude: lng,
                                    address: place.formatted_address || prev.address
                                }));
                            }
                        }
                    });
                } else {
                    console.warn('Places API is not available, search box will not be shown');
                }
            } catch (searchBoxError) {
                console.warn('SearchBox initialization failed:', searchBoxError);
                // SearchBox is optional, so we continue without it
            }

            setError(''); // Clear any previous errors
            console.log('Map initialized successfully');
        } catch (error: any) {
            console.error('Error initializing map:', error);
            setError(`Không thể khởi tạo bản đồ: ${error.message || 'Lỗi không xác định'}. Vui lòng kiểm tra console (F12) để biết thêm chi tiết.`);
        }
    };

    // Load Google Maps script
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            if (window.google && window.google.maps) {
                setMapLoaded(true);
                setTimeout(initializeMap, 100);
            } else {
                existingScript.addEventListener('load', () => {
                    setMapLoaded(true);
                    setTimeout(initializeMap, 100);
                });
            }
            return;
        }

        // Load Google Maps script
        // Try to get API key from environment variable, fallback to hardcoded key
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6M4kZWL5XjE';
        
        if (!apiKey || apiKey === '') {
            setError('Google Maps API key chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
            return;
        }
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=vi`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            console.log('Google Maps script loaded, checking API availability...');
            
            // Override console.error temporarily to catch InvalidKeyMapError
            const originalConsoleError = console.error;
            let invalidKeyErrorDetected = false;
            
            const errorInterceptor = (...args: any[]) => {
                const errorStr = args.join(' ');
                if (errorStr.includes('InvalidKeyMapError') || errorStr.includes('InvalidKey')) {
                    invalidKeyErrorDetected = true;
                    setError('API key Google Maps không hợp lệ hoặc đã hết hạn. Vui lòng:\n1. Truy cập Google Cloud Console (https://console.cloud.google.com/)\n2. Vào "APIs & Services" > "Credentials"\n3. Kiểm tra hoặc tạo API key mới\n4. Đảm bảo "Maps JavaScript API" đã được kích hoạt\n5. Cập nhật API key trong file .env hoặc liên hệ quản trị viên.');
                }
                originalConsoleError.apply(console, args);
            };
            
            // Temporarily override console.error
            console.error = errorInterceptor;
            
            // Wait for Google Maps API to be fully loaded
            const checkGoogleMaps = (attempts = 0) => {
                console.log(`Checking Google Maps API (attempt ${attempts + 1}/30)...`);
                
                if (window.google && window.google.maps && window.google.maps.Map) {
                    console.log('Google Maps API is available, initializing map...');
                    setMapLoaded(true);
                    setTimeout(() => {
                        try {
                            initializeMap();
                            console.log('Map initialized successfully');
                            
                            // Check for error after initialization
                            setTimeout(() => {
                                if (invalidKeyErrorDetected) {
                                    // Error already set by interceptor
                                } else if (mapRef.current) {
                                    const mapDiv = mapRef.current;
                                    const hasError = mapDiv.innerHTML.includes('Rất tiếc') || 
                                                   mapDiv.innerHTML.includes('Đã xảy ra lỗi') ||
                                                   mapDiv.innerHTML.includes('did not load Google Maps correctly');
                                    if (hasError) {
                                        setError('API key Google Maps không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra API key trong Google Cloud Console.');
                                    }
                                }
                                // Restore original console.error after checking
                                console.error = originalConsoleError;
                            }, 1000);
                        } catch (err: any) {
                            console.error('Error initializing map:', err);
                            let errorMessage = `Không thể khởi tạo bản đồ: ${err.message || 'Lỗi không xác định'}.`;
                            
                            // Check for specific Google Maps errors
                            const errMsg = err.message || err.toString() || '';
                            if (errMsg.includes('InvalidKey') || errMsg.includes('InvalidKeyMapError')) {
                                errorMessage = 'API key Google Maps không hợp lệ hoặc đã hết hạn. Vui lòng:\n1. Truy cập Google Cloud Console (https://console.cloud.google.com/)\n2. Vào "APIs & Services" > "Credentials"\n3. Kiểm tra hoặc tạo API key mới\n4. Đảm bảo "Maps JavaScript API" đã được kích hoạt\n5. Cập nhật API key trong file .env hoặc liên hệ quản trị viên.';
                            } else if (errMsg.includes('RefererNotAllowedMapError')) {
                                errorMessage = 'Domain không được phép sử dụng API key này. Vui lòng thêm domain vào "Application restrictions" trong Google Cloud Console.';
                            } else if (errMsg.includes('ApiNotActivatedMapError')) {
                                errorMessage = 'Google Maps JavaScript API chưa được kích hoạt. Vui lòng kích hoạt API này trong Google Cloud Console.';
                            }
                            
                            setError(errorMessage);
                            console.error = originalConsoleError;
                        }
                    }, 100);
                } else if (attempts < 30) {
                    // Retry up to 30 times (3 seconds total)
                    setTimeout(() => checkGoogleMaps(attempts + 1), 100);
                } else {
                    console.error('Google Maps API failed to load after 30 attempts');
                    console.error('window.google:', window.google);
                    console.error('window.google.maps:', window.google?.maps);
                    setError('Google Maps API không tải được sau nhiều lần thử. Có thể do: (1) API key không hợp lệ hoặc đã hết hạn, (2) Google Maps JavaScript API chưa được kích hoạt trong Google Cloud Console, (3) Kết nối internet bị gián đoạn, (4) Billing account chưa được thiết lập. Vui lòng mở Console (F12) để xem lỗi cụ thể từ Google Maps API.');
                    console.error = originalConsoleError;
                }
            };
            checkGoogleMaps();
        };
        
        script.onerror = (error) => {
            console.error('Failed to load Google Maps API script:', error);
            console.error('API Key used (first 10 chars):', apiKey.substring(0, 10) + '...');
            setError('Không thể tải Google Maps. Có thể do: (1) API key không hợp lệ hoặc đã hết hạn, (2) Kết nối internet bị gián đoạn, (3) Google Maps JavaScript API chưa được kích hoạt trong Google Cloud Console, (4) Domain restrictions trên API key, (5) Billing account chưa được thiết lập. Vui lòng mở Console (F12) để xem lỗi cụ thể từ Google Maps API.');
            setMapLoaded(false);
        };
        
        // Add error listener for script loading errors
        script.addEventListener('error', (e) => {
            console.error('Script loading error event:', e);
            setError('Không thể tải script Google Maps. Vui lòng kiểm tra kết nối internet hoặc API key.');
        });
        
        document.head.appendChild(script);
        
        // Cleanup
        return () => {
            // Clean up if component unmounts
        };
    }, []);

    // Update map when location changes
    useEffect(() => {
        if (mapInstanceRef.current && markerRef.current && formData.latitude && formData.longitude) {
            const position = { lat: formData.latitude, lng: formData.longitude };
            markerRef.current.setPosition(position);
            mapInstanceRef.current.setCenter(position);
        }
    }, [formData.latitude, formData.longitude]);

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
                                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">-- Chọn Tỉnh/TP --</option>
                                    {LOCATIONS.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative" ref={districtDropdownRef}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quận/Huyện <span className="text-red-500">*</span>
                                </label>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (formData.location) {
                                            setShowDistrictDropdown(!showDistrictDropdown);
                                            setDistrictSearchTerm('');
                                        }
                                    }}
                                    className={`w-full px-3 py-2 border rounded-lg cursor-pointer bg-white flex items-center justify-between ${
                                        showDistrictDropdown ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'
                                    } ${!formData.location ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {formData.location && DISTRICTS[formData.location] && DISTRICTS[formData.location].length > 0 ? (
                                        <span className={formData.district ? 'text-gray-900' : 'text-gray-400'}>
                                            {formData.district || '-- Chọn quận huyện --'}
                                        </span>
                                    ) : (
                                        <input
                                            type="text"
                                            name="district"
                                            value={formData.district}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleInputChange(e);
                                            }}
                                            placeholder="Nhập quận/huyện"
                                            className="flex-1 outline-none bg-transparent"
                                            onClick={(e) => e.stopPropagation()}
                                            onFocus={(e) => {
                                                e.stopPropagation();
                                                if (formData.location) {
                                                    setShowDistrictDropdown(true);
                                                }
                                            }}
                                            disabled={!formData.location}
                                        />
                                    )}
                                    <svg 
                                        className={`w-4 h-4 text-gray-400 transition-transform ${showDistrictDropdown ? 'transform rotate-180' : ''}`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                {showDistrictDropdown && formData.location && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                                        <div className="p-2 border-b border-gray-200">
                                            <input
                                                type="text"
                                                placeholder="Nhập từ khóa để tìm kiếm"
                                                value={districtSearchTerm}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    setDistrictSearchTerm(e.target.value);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                onFocus={(e) => e.stopPropagation()}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {formData.location && DISTRICTS[formData.location] && DISTRICTS[formData.location].length > 0 ? (
                                                <>
                                                    {DISTRICTS[formData.location]
                                                        .filter(d => d.toLowerCase().includes(districtSearchTerm.toLowerCase()))
                                                        .map(d => (
                                                            <div
                                                                key={d}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setFormData(prev => {
                                                                        const newData = { ...prev, district: d, ward: '', street: '' };
                                                                        setTimeout(() => {
                                                                            updateAddressAndGeocode(
                                                                                newData.location || '',
                                                                                d,
                                                                                '',
                                                                                '',
                                                                                newData.houseNumber || ''
                                                                            );
                                                                        }, 100);
                                                                        return newData;
                                                                    });
                                                                    setShowDistrictDropdown(false);
                                                                    setDistrictSearchTerm('');
                                                                }}
                                                                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                                                                    formData.district === d ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-900'
                                                                }`}
                                                            >
                                                                {d}
                                                            </div>
                                                        ))}
                                                    {DISTRICTS[formData.location].filter(d => d.toLowerCase().includes(districtSearchTerm.toLowerCase())).length === 0 && (
                                                        <div className="px-4 py-2 text-gray-500 text-sm text-center">
                                                            Không tìm thấy
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="px-4 py-2 text-gray-500 text-sm text-center">
                                                    Nhập quận/huyện vào ô trên
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative" ref={wardDropdownRef}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phường/Xã
                                </label>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (formData.district) {
                                            setShowWardDropdown(!showWardDropdown);
                                            setWardSearchTerm('');
                                        }
                                    }}
                                    className={`w-full px-3 py-2 border rounded-lg cursor-pointer bg-white flex items-center justify-between ${
                                        showWardDropdown ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'
                                    } ${!formData.district ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {formData.district && (VIETNAM_WARDS[formData.district] || getDefaultWards(formData.district)) && (VIETNAM_WARDS[formData.district] || getDefaultWards(formData.district)).length > 0 ? (
                                        <span className={formData.ward ? 'text-gray-900' : 'text-gray-400'}>
                                            {formData.ward || '-- Phường/Xã --'}
                                        </span>
                                    ) : (
                                        <input
                                            type="text"
                                            name="ward"
                                            value={formData.ward || ''}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleInputChange(e);
                                            }}
                                            placeholder="Nhập phường/xã"
                                            className="flex-1 outline-none bg-transparent"
                                            onClick={(e) => e.stopPropagation()}
                                            onFocus={(e) => {
                                                e.stopPropagation();
                                                if (formData.district) {
                                                    setShowWardDropdown(true);
                                                }
                                            }}
                                            disabled={!formData.district}
                                        />
                                    )}
                                    <svg 
                                        className={`w-4 h-4 text-gray-400 transition-transform ${showWardDropdown ? 'transform rotate-180' : ''}`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                {showWardDropdown && formData.district && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                                        <div className="p-2 border-b border-gray-200">
                                            <input
                                                type="text"
                                                placeholder="Nhập từ khóa để tìm kiếm"
                                                value={wardSearchTerm}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    setWardSearchTerm(e.target.value);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                onFocus={(e) => e.stopPropagation()}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {formData.district && (VIETNAM_WARDS[formData.district] || getDefaultWards(formData.district)) && (VIETNAM_WARDS[formData.district] || getDefaultWards(formData.district)).length > 0 ? (
                                                <>
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFormData(prev => ({ ...prev, ward: '' }));
                                                            setShowWardDropdown(false);
                                                            setWardSearchTerm('');
                                                        }}
                                                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-500"
                                                    >
                                                        -- Phường/Xã --
                                                    </div>
                                                    {(VIETNAM_WARDS[formData.district] || getDefaultWards(formData.district))
                                                        .filter(w => w.toLowerCase().includes(wardSearchTerm.toLowerCase()))
                                                        .map(w => (
                                                            <div
                                                                key={w}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setFormData(prev => {
                                                                        const newData = { ...prev, ward: w };
                                                                        setTimeout(() => {
                                                                            updateAddressAndGeocode(
                                                                                newData.location || '',
                                                                                newData.district || '',
                                                                                w,
                                                                                newData.street || '',
                                                                                newData.houseNumber || ''
                                                                            );
                                                                        }, 100);
                                                                        return newData;
                                                                    });
                                                                    setShowWardDropdown(false);
                                                                    setWardSearchTerm('');
                                                                }}
                                                                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                                                                    formData.ward === w ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-900'
                                                                }`}
                                                            >
                                                                {w}
                                                            </div>
                                                        ))}
                                                    {(VIETNAM_WARDS[formData.district] || getDefaultWards(formData.district)).filter(w => w.toLowerCase().includes(wardSearchTerm.toLowerCase())).length === 0 && (
                                                        <div className="px-4 py-2 text-gray-500 text-sm text-center">
                                                            Không tìm thấy
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="px-4 py-2 text-gray-500 text-sm text-center">
                                                    Nhập phường/xã vào ô trên (có thể nhập tay)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative" ref={streetDropdownRef}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Đường/Phố
                                </label>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (formData.district) {
                                            setShowStreetDropdown(!showStreetDropdown);
                                            setStreetSearchTerm('');
                                        }
                                    }}
                                    className={`w-full px-3 py-2 border rounded-lg cursor-pointer bg-white flex items-center justify-between ${
                                        showStreetDropdown ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'
                                    } ${!formData.district ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {formData.district && (VIETNAM_STREETS[formData.district] || getDefaultStreets(formData.district)) && (VIETNAM_STREETS[formData.district] || getDefaultStreets(formData.district)).length > 0 ? (
                                        <span className={formData.street ? 'text-gray-900' : 'text-gray-400'}>
                                            {formData.street || '-- Đường/Phố --'}
                                        </span>
                                    ) : (
                                        <input
                                            type="text"
                                            name="street"
                                            value={formData.street || ''}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleInputChange(e);
                                            }}
                                            placeholder="Nhập đường/phố"
                                            className="flex-1 outline-none bg-transparent"
                                            onClick={(e) => e.stopPropagation()}
                                            onFocus={(e) => {
                                                e.stopPropagation();
                                                if (formData.district) {
                                                    setShowStreetDropdown(true);
                                                }
                                            }}
                                            disabled={!formData.district}
                                        />
                                    )}
                                    <svg 
                                        className={`w-4 h-4 text-gray-400 transition-transform ${showStreetDropdown ? 'transform rotate-180' : ''}`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                {showStreetDropdown && formData.district && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                                        <div className="p-2 border-b border-gray-200">
                                            <input
                                                type="text"
                                                placeholder="Nhập từ khóa để tìm kiếm"
                                                value={streetSearchTerm}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    setStreetSearchTerm(e.target.value);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                onFocus={(e) => e.stopPropagation()}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {formData.district && (VIETNAM_STREETS[formData.district] || getDefaultStreets(formData.district)) && (VIETNAM_STREETS[formData.district] || getDefaultStreets(formData.district)).length > 0 ? (
                                                <>
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFormData(prev => ({ ...prev, street: '' }));
                                                            setShowStreetDropdown(false);
                                                            setStreetSearchTerm('');
                                                        }}
                                                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-500"
                                                    >
                                                        -- Đường/Phố --
                                                    </div>
                                                    {(VIETNAM_STREETS[formData.district] || getDefaultStreets(formData.district))
                                                        .filter(s => s.toLowerCase().includes(streetSearchTerm.toLowerCase()))
                                                        .map(s => (
                                                            <div
                                                                key={s}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setFormData(prev => {
                                                                        const newData = { ...prev, street: s };
                                                                        setTimeout(() => {
                                                                            updateAddressAndGeocode(
                                                                                newData.location || '',
                                                                                newData.district || '',
                                                                                newData.ward || '',
                                                                                s,
                                                                                newData.houseNumber || ''
                                                                            );
                                                                        }, 100);
                                                                        return newData;
                                                                    });
                                                                    setShowStreetDropdown(false);
                                                                    setStreetSearchTerm('');
                                                                }}
                                                                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                                                                    formData.street === s ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-900'
                                                                }`}
                                                            >
                                                                {s}
                                                            </div>
                                                        ))}
                                                    {(VIETNAM_STREETS[formData.district] || getDefaultStreets(formData.district)).filter(s => s.toLowerCase().includes(streetSearchTerm.toLowerCase())).length === 0 && (
                                                        <div className="px-4 py-2 text-gray-500 text-sm text-center">
                                                            Không tìm thấy
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="px-4 py-2 text-gray-500 text-sm text-center">
                                                    Nhập đường/phố vào ô trên
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số nhà
                                </label>
                                <input
                                    type="text"
                                    name="houseNumber"
                                    value={formData.houseNumber || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập số nhà"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Địa chỉ
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                    placeholder="Địa chỉ"
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Google Maps */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chọn vị trí trên bản đồ
                            </label>
                            <div className="relative">
                                <div 
                                    ref={mapRef}
                                    className="w-full h-96 rounded-lg border border-gray-300 overflow-hidden"
                                    style={{ minHeight: '400px' }}
                                />
                                {error && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
                                        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-lg border border-red-200">
                                            <div className="text-red-500 text-5xl mb-4">⚠️</div>
                                            <p className="text-red-600 font-semibold mb-2 text-lg">Rất tiếc! Đã xảy ra lỗi.</p>
                                            <p className="text-gray-700 mb-4 text-sm">{error}</p>
                                            <div className="space-y-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setError('');
                                                        setMapLoaded(false);
                                                        // Remove existing script and reload
                                                        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
                                                        if (existingScript) {
                                                            existingScript.remove();
                                                        }
                                                        window.location.reload();
                                                    }}
                                                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2"
                                                >
                                                    Thử lại
                                                </button>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Mở Console (F12) để xem chi tiết lỗi
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!mapLoaded && !error && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                            <p className="text-gray-600">Đang tải bản đồ...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {formData.latitude && formData.longitude && (
                                <p className="text-sm text-gray-600 mt-2">
                                    Tọa độ: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                </p>
                            )}
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
