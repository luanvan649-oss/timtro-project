import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import SearchFilter from "../components/SearchFilter";
import Pagination from "../components/Pagination";
import api from "../api";
import {
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Star,
  Heart,
  Eye,
  Search,
} from "lucide-react";  

interface Filters {
  district?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  amenities?: string[];
  [key: string]: any;
}

function SearchPosts() {
  const location = useLocation(); // Initialize useLocation
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);

  const postsPerPage = 9;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const q = queryParams.get("q");
    if (q) {
      setSearchTerm(q);
    }
    fetchPosts();
  }, [searchTerm, filters, sortBy, currentPage, location.search]); // Add location.search to dependencies

  const fetchPosts = async () => {
    setLoading(true);

    let queryParams: Record<string, any> = {
      // Define queryParams outside try block
      _page: currentPage,
      _limit: postsPerPage,
    };

    try {
      // Use searchTerm from state, which might be initialized from URL query param
      // Using title_like for specific title search as requested
      if (searchTerm.trim()) {
        queryParams.title_like = searchTerm.trim();
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

      if (sortBy === "newest" || sortBy === "createdAt") {
        queryParams._sort = "createdAt";
        queryParams._order = "desc";
      } else if (sortBy === "price") {
        queryParams._sort = "price";
        queryParams._order = "asc";
      } else if (sortBy === "priceDesc") {
        queryParams._sort = "price";
        queryParams._order = "desc";
      }

      console.log("Fetching posts with query:", queryParams); // Log the query for debugging
      const response = await api.get("/posts", {
        params: queryParams,
      });
      const totalCount = parseInt(response.headers["x-total-count"], 10);

      let fetchedPosts = response.data;

      if (filters.amenities && filters.amenities.length > 0) {
        fetchedPosts = fetchedPosts.filter((post) =>
          filters.amenities.every((amenity) =>
            post.amenities?.includes(amenity)
          )
        );
      }

      setPosts(fetchedPosts);
      setTotalPosts(totalCount);
    } catch (error) {
      console.error("Error fetching posts:", error);
      console.log("Query parameters sent:", queryParams); // Log query parameters for debugging
      setPosts([]);
      setTotalPosts(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFavorite = (postId) => {
    setFavorites((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const formatPrice = (price) => {
    return (price / 1000000).toFixed(1) + " triệu";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getGenderLabel = (gender) => {
    const genders = {
      male: "Nam",
      female: "Nữ",
    };
    return genders[gender] || "Không quan trọng";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-80">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Bộ lọc</h2>
            </div>

            <div className="space-y-6">
              {/* SearchFilter Component */}
              <SearchFilter
                onSearch={handleSearch}
                onFilter={handleFilterChange}
                initialFilters={filters}
              />

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sắp xếp theo
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price">Giá tăng dần</option>
                  <option value="priceDesc">Giá giảm dần</option>
                  <option value="hasVideo">Có video</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Results Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Kết quả tìm kiếm
                </h1>
                <p className="text-gray-600 mt-1">
                  Tìm thấy {totalPosts} tin đăng
                </p>
              </div>

              {searchTerm && (
                <div className="mt-4 sm:mt-0">
                  <span className="text-sm text-gray-500">
                    Từ khóa:{" "}
                    <span className="font-medium text-blue-600">
                      "{searchTerm}"
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-6 animate-pulse"
                >
                  <div className="space-y-4">
                    <div className="h-48 bg-gray-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Search size={64} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-600 mb-4">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilters({});
                  setCurrentPage(1);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <>
              {/* Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Post Image */}
                    <div className="relative">
                      <img
                        src={post.images?.[0] || "/placeholder-image.jpg"}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 right-3 flex space-x-2">
                        <button
                          onClick={() => toggleFavorite(post.id)}
                          className={`p-2 rounded-full ${
                            favorites.includes(post.id)
                              ? "bg-red-500 text-white"
                              : "bg-white text-gray-600 hover:text-red-500"
                          } transition-colors`}
                        >
                          <Heart size={16} />
                        </button>
                        <div className="p-2 bg-white rounded-full text-gray-600">
                          <Eye size={16} />
                        </div>
                      </div>
                      {post.hasVideo && (
                        <div className="absolute top-3 left-3">
                          <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                            Có video
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          <Link
                            to={`/post/${post.id}`}
                            className="hover:text-blue-600"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <Star size={16} fill="currentColor" />
                          <span className="text-sm text-gray-600">4.5</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600">
                          <MapPin size={16} className="mr-2" />
                          <span className="text-sm">
                            {post.location || post.address}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign size={16} className="mr-2" />
                          <span className="text-sm font-semibold text-green-600">
                            {formatPrice(post.price || post.budget)}/tháng
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users size={16} className="mr-2" />
                          <span className="text-sm">
                            {getGenderLabel(post.genderPreference)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar size={16} className="mr-2" />
                          <span className="text-sm">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Amenities */}
                      {post.amenities && post.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.amenities.slice(0, 4).map((amenity, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                              {amenity}
                            </span>
                          ))}
                          {post.amenities.length > 4 && (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              +{post.amenities.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Link
                          to={`/post/${post.id}`}
                          className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        >
                          Xem chi tiết
                        </Link>
                        <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                          <Heart size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {posts.length > 0 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalPosts / postsPerPage)}
                    onPageChange={handlePageChange}
                    hasNextPage={
                      currentPage < Math.ceil(totalPosts / postsPerPage)
                    }
                    hasPreviousPage={currentPage > 1}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPosts;
