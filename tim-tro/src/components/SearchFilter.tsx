import { useState, useEffect } from 'react';
import { Search, Filter, X, MapPin, DollarSign, Home, Star, Heart, Sparkles } from 'lucide-react';
import { VIETNAM_PROVINCES } from '../constants/vietnamLocations';

interface Filters {
  location: string;
  category: string;
  priceRange: string;
  areaRange: string;
  amenities: string[];
  interests: string[];
  lifestyle: string[];
}

type OnFilterFn = (apiFilters: Record<string, any>) => void;

interface SearchFilterProps {
  onSearch?: (term: string) => void;
  onFilter?: OnFilterFn;
  initialFilters?: Partial<Filters>;
  onApplyCategory?: (category: string) => void; // callback to navigate when category applied/reset
}

function SearchFilter({
  onSearch,
  onFilter,
  initialFilters = {},
  onApplyCategory,
}: SearchFilterProps) {
  const LOCATIONS = VIETNAM_PROVINCES;

  const CATEGORIES = [
    "Phòng trọ",
    "Nhà nguyên căn",
    "Căn hộ chung cư",
    "Căn hộ mini",
    "Căn hộ dịch vụ",
    "Tìm người ở ghép",
    "Mặt bằng"
  ];

  const PRICE_RANGES = [
    { label: "Dưới 1 triệu", min: 0, max: 1000000 },
    { label: "Từ 1 - 2 triệu", min: 1000000, max: 2000000 },
    { label: "Từ 2 - 3 triệu", min: 2000000, max: 3000000 },
    { label: "Từ 3 - 5 triệu", min: 3000000, max: 5000000 },
    { label: "Từ 5 - 7 triệu", min: 5000000, max: 7000000 },
    { label: "Trên 7 triệu", min: 7000000, max: 1.7976931348623157e+308 }
  ];

  const AREA_RANGES = [
    { label: "Dưới 20 m²", min: 0, max: 20 },
    { label: "Từ 20 - 30m²", min: 20, max: 30 },
    { label: "Từ 30 - 50m²", min: 30, max: 50 },
    { label: "Trên 50m²", min: 50, max: 1.7976931348623157e+308 }
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

  const COMMON_INTERESTS = [
    'Đọc sách', 'Xem phim', 'Nghe nhạc', 'Du lịch', 'Thể thao', 'Nấu ăn',
    'Chơi game', 'Nhiếp ảnh', 'Học ngoại ngữ', 'Yoga', 'Gym', 'Vẽ'
  ];

  const LIFESTYLE_OPTIONS = [
    'Sạch sẽ', 'Yên tĩnh', 'Thân thiện', 'Không hút thuốc', 'Không uống rượu',
    'Dậy sớm', 'Đi ngủ muộn', 'Thích nấu ăn', 'Thích tiệc tùng', 'Học tập nhiều'
  ];
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const baselineCategory = initialFilters.category || '';

  const [filters, setFilters] = useState<Filters>({
    location: '',
    category: baselineCategory, // default from parent if any
    priceRange: '',
    areaRange: '',
    amenities: [],
    interests: [],
    lifestyle: [],
    ...initialFilters,
  });

  const [tempFilters, setTempFilters] = useState<Filters>(filters);

  // Sync internal state when parent updates initialFilters (e.g., change tab/category)
  useEffect(() => {
    const nextCategory = initialFilters.category || '';
    setFilters(prev => ({ ...prev, ...initialFilters, category: nextCategory }));
    setTempFilters(prev => ({ ...prev, ...initialFilters, category: nextCategory }));
  }, [initialFilters]);

  // Helper: convert internal Filters shape to API-friendly payload
  const convertFiltersToApi = (f: Partial<Filters>) => {
    const apiFilters: Record<string, any> = {};
    if (f.location) apiFilters.location = f.location;
    if (f.category) apiFilters.category = f.category;

    if (f.priceRange) {
      const priceRange = PRICE_RANGES.find(p => p.label === f.priceRange);
      if (priceRange) {
        apiFilters.priceMin = priceRange.min;
        apiFilters.priceMax = priceRange.max;
      }
    }

    if (f.areaRange) {
      const areaRange = AREA_RANGES.find(a => a.label === f.areaRange);
      if (areaRange) {
        apiFilters.areaMin = areaRange.min;
        apiFilters.areaMax = areaRange.max;
      }
    }

    if (f.amenities && f.amenities.length > 0) apiFilters.amenities = f.amenities;
    if (f.interests && f.interests.length > 0) apiFilters.interests = f.interests;
    if (f.lifestyle && f.lifestyle.length > 0) apiFilters.lifestyle = f.lifestyle;

    return apiFilters;
  };

  // Handle filter changes
  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value
    } as Filters));
  };

  // Handle amenities toggle
  const toggleAmenity = (amenity: string) => {
    setTempFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Handle interests toggle
  const toggleInterest = (interest: string) => {
    setTempFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  // Handle lifestyle toggle
  const toggleLifestyle = (lifestyle: string) => {
    setTempFilters(prev => ({
      ...prev,
      lifestyle: prev.lifestyle.includes(lifestyle)
        ? prev.lifestyle.filter(l => l !== lifestyle)
        : [...prev.lifestyle, lifestyle]
    }));
  };

  // Apply filters
  const applyFilters = () => {
    // Commit temp filters to active filters, then send API payload
    setFilters(tempFilters);
    const apiPayload = convertFiltersToApi(tempFilters);
    if (onFilter) onFilter(apiPayload);
    if (onApplyCategory) onApplyCategory(tempFilters.category || '');
    setShowFilters(false);
  };

  // Reset filters (restore baseline category)
  const resetFilters = () => {
    const baseFilters: Filters = {
      location: '',
      category: baselineCategory,
      priceRange: '',
      areaRange: '',
      amenities: [],
      interests: [],
      lifestyle: []
    };

    setTempFilters(baseFilters);
    setFilters(baseFilters);

    if (onFilter) {
      const payload = convertFiltersToApi(baseFilters);
      onFilter(payload);
    }
    if (onApplyCategory) {
      onApplyCategory(baselineCategory);
    }
    if (onSearch) {
      onSearch('');
    }
    setSearchTerm('');
  };

  // Count active filters (include category only if different from baseline)
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'category') {
      return value !== '' && value !== baselineCategory;
    }
    return Array.isArray(value) ? value.length > 0 : value !== '';
  }).length;

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        {/* <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm phòng trọ, địa chỉ, tiện ích..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (onSearch) {
                onSearch(e.target.value);
              }
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div> */}
        {/* <button
          type="button"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => onSearch?.(searchTerm)} // Still allow explicit search on button click
        >
          Tìm kiếm
        </button> */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg transform hover:scale-105 ${
            showFilters 
              ? 'bg-primary-800 text-white border-2 border-primary-900 shadow-xl hover:bg-primary-900' 
              : 'bg-primary-700 text-white border-2 border-primary-800 hover:bg-primary-800 hover:shadow-xl'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="text-sm">Bộ lọc</span>
          {activeFiltersCount > 0 && (
            <span className="bg-red-600 text-white text-xs rounded-full px-2.5 py-1 font-bold shadow-md">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.location && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <MapPin className="w-3 h-3" />
              {filters.location}
              <button
                onClick={() => {
                  const newFilters: Filters = { ...filters, location: '' };
                  setFilters(newFilters);
                  setTempFilters(newFilters);
                  if (onFilter) onFilter(convertFiltersToApi(newFilters));
                }}
                className="ml-1 hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.category && filters.category !== baselineCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <Home className="w-3 h-3" />
              {filters.category}
              <button
                onClick={() => {
                  const newFilters: Filters = { ...filters, category: baselineCategory };
                  setFilters(newFilters);
                  setTempFilters(newFilters);
                  if (onFilter) onFilter(convertFiltersToApi(newFilters));
                  if (onApplyCategory) onApplyCategory(baselineCategory);
                }}
                className="ml-1 hover:text-green-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.priceRange && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              <DollarSign className="w-3 h-3" />
              {filters.priceRange}
              <button
                onClick={() => {
                  const newFilters: Filters = { ...filters, priceRange: '' };
                  setFilters(newFilters);
                  setTempFilters(newFilters);
                  if (onFilter) onFilter(convertFiltersToApi(newFilters));
                }}
                className="ml-1 hover:text-yellow-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.areaRange && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              {filters.areaRange}
              <button
                onClick={() => {
                  const newFilters: Filters = { ...filters, areaRange: '' };
                  setFilters(newFilters);
                  setTempFilters(newFilters);
                  if (onFilter) onFilter(convertFiltersToApi(newFilters));
                }}
                className="ml-1 hover:text-purple-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.amenities.map(amenity => (
            <span key={amenity} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
              {amenity}
              <button
                onClick={() => {
                  const newAmenities = filters.amenities.filter(a => a !== amenity);
                  const newFilters: Filters = { ...filters, amenities: newAmenities };
                  setFilters(newFilters);
                  setTempFilters(newFilters);
                  if (onFilter) onFilter(convertFiltersToApi(newFilters));
                }}
                className="ml-1 hover:text-indigo-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.interests.map(interest => (
            <span key={interest} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <Star className="w-3 h-3" />
              {interest}
              <button
                onClick={() => {
                  const newInterests = filters.interests.filter(i => i !== interest);
                  const newFilters: Filters = { ...filters, interests: newInterests };
                  setFilters(newFilters);
                  setTempFilters(newFilters);
                  if (onFilter) onFilter(convertFiltersToApi(newFilters));
                }}
                className="ml-1 hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.lifestyle.map(lifestyle => (
            <span key={lifestyle} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <Heart className="w-3 h-3" />
              {lifestyle}
              <button
                onClick={() => {
                  const newLifestyle = filters.lifestyle.filter(l => l !== lifestyle);
                  const newFilters: Filters = { ...filters, lifestyle: newLifestyle };
                  setFilters(newFilters);
                  setTempFilters(newFilters);
                  if (onFilter) onFilter(convertFiltersToApi(newFilters));
                }}
                className="ml-1 hover:text-green-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={resetFilters}
            className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm underline"
          >
            Xóa tất cả
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="border-t pt-4 animate-in slide-in-from-top-2 duration-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Bộ lọc nâng cao</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-4 border rounded-lg p-4 bg-gray-50">
            {/* Location Filter */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
              <select
                value={tempFilters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                {LOCATIONS.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            {/* Category Filter */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại hình</label>
              <select
                value={tempFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            {/* Price Range Filter */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng giá</label>
              <select
                value={tempFilters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                {PRICE_RANGES.map(range => (
                  <option key={range.label} value={range.label}>{range.label}</option>
                ))}
              </select>
            </div>
            {/* Area Range Filter */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích</label>
              <select
                value={tempFilters.areaRange}
                onChange={(e) => handleFilterChange('areaRange', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                {AREA_RANGES.map(range => (
                  <option key={range.label} value={range.label}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amenities Filter */}
          <div className="mb-4 border rounded-lg p-4 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
              Tiện ích
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {AMENITIES_LIST.map(amenity => (
                <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempFilters.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Interests Filter */}
          <div className="mb-4 border rounded-lg p-4 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Sở thích
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {COMMON_INTERESTS.map(interest => (
                <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempFilters.interests.includes(interest)}
                    onChange={() => toggleInterest(interest)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lifestyle Filter */}
          <div className="mb-4 border rounded-lg p-4 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Heart className="w-4 h-4 mr-2 text-red-500" />
              Lối sống
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {LIFESTYLE_OPTIONS.map(lifestyle => (
                <label key={lifestyle} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempFilters.lifestyle.includes(lifestyle)}
                    onChange={() => toggleLifestyle(lifestyle)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{lifestyle}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center mt-4 gap-2">
            <div className="flex gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg"
              >
                Đặt lại
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
            </div>
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchFilter;
