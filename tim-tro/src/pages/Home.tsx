import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import SearchFilter from '../components/SearchFilter';
import Pagination from '../components/Pagination';

import ChatWindow from '../components/ChatWindow';
import api from '../api';  // Import API configuration

const LOCATIONS = [
  "Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Quy Nhơn"
];


interface Post {
  id?: string | number;
  title?: string;
  amenities?: string[];
  createdAt?: string;
  price?: number | string;
  type?: string;
  location?: string;
  description?: string;
  authorId?: string;
  images?: string[];
  district?: string;
  [key: string]: any;
}

interface Filters {
  location?: string;
  district?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  amenities?: string[];
  [key: string]: any;
}

interface HomeProps {
  globalSearchTerm?: string;
  setGlobalSearchTerm?: (term: string) => void;
}

const Home: React.FC<HomeProps> = ({ globalSearchTerm = '', setGlobalSearchTerm = () => {} }) => { // Receive globalSearchTerm and setGlobalSearchTerm
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  // Use globalSearchTerm as the primary source of truth for search term
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [totalPosts, setTotalPosts] = useState<number>(0);

 const loadPosts = useCallback(async () => {
  try {
    setLoading(true);
    console.log('Loading posts with filters:', filters, 'search:', globalSearchTerm);

    const queryParams: Record<string, any> = {
      _page: currentPage,
      _limit: 10000, // Fetch a large number of posts for client-side filtering
    };

    // Các bộ lọc
    if (filters.location) {
      queryParams.location = filters.location;
    }
    if (filters.district) {
      queryParams.district = filters.district;
    }
    if (filters.category) {
      queryParams.category = filters.category;
    }

    if (filters.priceMin !== undefined) {
      queryParams.price_gte = filters.priceMin;
    }
    if (filters.priceMax !== undefined) {
      queryParams.price_lte = filters.priceMax;
    }
    if (filters.areaMin !== undefined) {
      queryParams.area_gte = filters.areaMin;
    }
    if (filters.areaMax !== undefined) {
      queryParams.area_lte = filters.areaMax;
    }

    // Logic sắp xếp
    if (sortBy === 'newest' || sortBy === 'createdAt') {
      queryParams._sort = 'createdAt';
      queryParams._order = 'desc';
    } else if (sortBy === 'price') {
      queryParams._sort = 'price';
      queryParams._order = 'asc';
    } else if (sortBy === 'priceDesc') {
      queryParams._sort = 'price';
      queryParams._order = 'desc';
    }

    console.log('Fetching posts with query:', queryParams);

    // Sử dụng api.get thay vì axios.get
    const response = await api.get('/posts', { params: queryParams });

    let fetchedPosts: Post[] = response.data as Post[];
    
    // Only show approved posts to regular users
    fetchedPosts = fetchedPosts.filter(post => post.status === 'approved' || !post.status);

    // Client-side filtering based on globalSearchTerm (by title)
    if (globalSearchTerm && globalSearchTerm.trim()) {
      const lowerCaseSearchTerm = globalSearchTerm.trim().toLowerCase();
      fetchedPosts = fetchedPosts.filter(post =>
        post.title && String(post.title).toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Client-side filtering for amenities
    if (filters.amenities && filters.amenities.length > 0) {
      fetchedPosts = fetchedPosts.filter(post =>
        filters.amenities?.every(amenity => post.amenities?.includes(amenity))
      );
    }

    // Calculate total count after client-side filtering
    const filteredTotalCount = fetchedPosts.length;

    // Implement pagination client-side
    const startIndex = (currentPage - 1) * 20;
    const endIndex = startIndex + 20;
    const paginatedPosts = fetchedPosts.slice(startIndex, endIndex);

    setPosts(paginatedPosts);
    setTotalPages(Math.ceil(filteredTotalCount / 20));
    setTotalPosts(filteredTotalCount);
  } catch (err) {
    setError('Có lỗi xảy ra khi tải dữ liệu');
    console.error('Error loading posts:', err);
    setPosts([]);
    setTotalPages(1);
    setTotalPosts(0);
  } finally {
    setLoading(false);
  }
}, [filters, currentPage, sortBy, globalSearchTerm]);


  useEffect(() => {
    console.log('Home component: loading posts due to dependency change...');
    loadPosts();

    // Loại bỏ real-time listener của Firebase
    return () => {};
  }, [loadPosts, filters, globalSearchTerm]); // Add globalSearchTerm to dependencies

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearch = (term: string) => {
    setGlobalSearchTerm(term); // Update global search term
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLocationFilter = (location?: string) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters } as Filters;
      if (location) {
        newFilters.location = location;
      } else {
        delete newFilters.location;
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Có lỗi xảy ra</div>
          <button 
            onClick={loadPosts}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Page Title */}
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            Cho thuê phòng trọ, nhà nguyên căn, căn hộ
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Hiện có <span className="font-semibold text-orange-500">{(totalPosts || 0).toLocaleString()}</span> tin đăng
          </p>

          {/* Location Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Địa điểm
            </h3>
            <div className="flex overflow-x-auto gap-2 pb-2">
              {LOCATIONS.map((location) => (
                <button
                  key={location}
                  onClick={() => handleLocationFilter(location)}
                  className={`flex-shrink-0 bg-white border border-gray-200 rounded px-4 py-3 text-sm hover:shadow-md transition-shadow ${
                    filters.location === location ? 'bg-blue-50 border-blue-300 text-blue-600' : ''
                  }`}
                >
                  <div className="text-xs text-gray-500">Phòng trọ</div>
                  <div className="font-medium text-gray-800">{location}</div>
                </button>
              ))}
              <button
                onClick={() => handleLocationFilter('')}
                className="flex-shrink-0 bg-white border border-gray-200 rounded px-4 py-3 text-sm text-blue-600 hover:shadow-md transition-colors"
              >
                Tất cả
                <svg className="w-3 h-3 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sort Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                onClick={() => handleSortChange('createdAt')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  sortBy === 'createdAt'
                    ? 'text-gray-800 border-gray-800'
                    : 'text-gray-600 border-transparent hover:text-gray-800'
                }`}
              >
                Đề xuất
              </button>
              <button
                onClick={() => handleSortChange('newest')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  sortBy === 'newest'
                    ? 'text-gray-800 border-gray-800'
                    : 'text-gray-600 border-transparent hover:text-gray-800'
                }`}
              >
                Mới đăng
              </button>
              <button
                onClick={() => handleSortChange('hasVideo')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  sortBy === 'hasVideo'
                    ? 'text-gray-800 border-gray-800'
                    : 'text-gray-600 border-transparent hover:text-gray-800'
                }`}
              >
                Có video
              </button>
            </div>
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-white rounded p-4 shadow-sm animate-pulse">
                  <div className="flex space-x-4">
                    <div className="bg-gray-200 rounded w-48 h-36"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded p-12 text-center shadow-sm">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Không tìm thấy bài đăng nào</h3>
              <p className="text-gray-600 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button
                onClick={() => {
                  setFilters({});
                  setGlobalSearchTerm(''); // Use globalSearchTerm
                  setCurrentPage(1);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, idx) => (
                <Link to={`/post/${post.id}`} key={post.id ?? idx} className="block">
                  <PostCard post={post as any} />
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && posts.length > 0 && (
            <div className="mt-8">
              <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    hasNextPage={currentPage < totalPages}
                    hasPreviousPage={currentPage > 1}
                  />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 lg:flex-shrink-0 space-y-6">
          {/* Search Filter */}
          <SearchFilter 
            onSearch={handleSearch} 
            onFilter={handleFilterChange} 
            initialFilters={filters} 
          />

          {/* Blog Posts */}
          <div className="bg-white rounded shadow-sm p-4">
            <h3 className="font-medium text-gray-800 mb-4">Bài viết mới</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-800 transition-colors block py-1">
                  5 điều cần lưu ý khi thuê phòng trọ 
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-800 transition-colors block py-1">
                  Hướng dẫn tính tiền điện nước phòng trọ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-800 transition-colors block py-1">
                  Kinh nghiệm thuê phòng trọ cho sinh viên
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-800 transition-colors block py-1">
                  Những khu vực cho thuê phòng trọ giá rẻ
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Add ChatWindow component for testing */}
      <div className="mt-8 h-[600px]"> {/* Added a fixed height for demonstration */}
        <ChatWindow />
      </div>
    </div>
  );
};

export default Home;
