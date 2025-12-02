import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Star, 
  Heart, 
  MapPin, 
  DollarSign, 
  Users, 
  Eye,
  RefreshCw
} from 'lucide-react';
import { useMemo } from 'react'; 

function Suggestions({ userLookingFor, userInterests, userMajor, userYear }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const userPreferences = useMemo(() => {
    const safeUserLookingFor = userLookingFor || {};
    return {
      desiredBudget: (() => {
        switch (safeUserLookingFor.budget) {
          case 'under-2m': return 1500000;
          case '2-3m': return 2500000;
          case '3-4m': return 3500000;
          case '4-5m': return 4500000;
          case 'above-5m': return 5500000;
          default: return null;
        }
      })(),
      desiredLocation: safeUserLookingFor.location || '',
      desiredGender: safeUserLookingFor.gender || '',
      desiredLifestyle: safeUserLookingFor.lifestyle || [],
      desiredInterests: userInterests || [],
      desiredMajor: userMajor,
      desiredYear: userYear,
    };
  }, [userLookingFor, userInterests, userMajor, userYear]);

  useEffect(() => {
    console.log('Suggestions component received userLookingFor:', userLookingFor);
    console.log('Suggestions component userPreferences:', userPreferences);
    
    // Always fetch suggestions regardless of criteria completeness
    fetchSuggestions();
  }, [userLookingFor, userInterests, userMajor, userYear]);

  const fetchSuggestions = async () => {
    setLoading(true);
    
    try {
      const allPostsResponse = await fetch('http://localhost:3001/posts'); // Fetch from API
      const allPostsFromDb = await allPostsResponse.json();

      const allPosts = allPostsFromDb;
      
      // Calculate match scores based on user preferences
      const postsWithScores = allPosts.map(post => {
        let matchScore = 0;
        let totalWeight = 0; // To normalize the score later
        let primaryMatchCount = 0; // Counter for the new requirement

        // Budget compatibility (Weight: 0.25)
        let budgetScore = 0;
        if (post.price && userPreferences.desiredBudget) {
            const priceDifference = Math.abs(post.price - userPreferences.desiredBudget);
            // Assuming a max reasonable price difference for normalization, e.g., 5,000,000 VND
            budgetScore = Math.max(0, 1 - (priceDifference / 5000000)); // Normalize to 0-1
            if (budgetScore > 0) primaryMatchCount++;
        }
        matchScore += budgetScore * 0.25;
        totalWeight += 0.25;

        // Location match (Weight: 0.25)
        let locationScore = 0;
        if (userPreferences.desiredLocation && (post.location || post.district)) {
            const desiredLocationLower = userPreferences.desiredLocation.toLowerCase();
            if (post.district && post.district.toLowerCase().includes(desiredLocationLower)) {
                locationScore = 1; // Direct district match
            } else if (post.location && post.location.toLowerCase().includes(desiredLocationLower)) {
                locationScore = 0.5; // Broader location match
            }
            if (locationScore > 0) primaryMatchCount++;
        }
        matchScore += locationScore * 0.25;
        totalWeight += 0.25;

        // Gender compatibility (Weight: 0.15)
        let genderScore = 0;
        if (userPreferences.desiredGender) { // Check if a gender is desired
            if (userPreferences.desiredGender === 'any' || (post.genderPreference && (post.genderPreference === 'any' || post.genderPreference === userPreferences.desiredGender))) {
                genderScore = 1;
            }
            // Only count as a "primary match" if a specific gender was desired and matched
            if (userPreferences.desiredGender !== 'any' && genderScore === 1) {
                primaryMatchCount++;
            }
        } else { // If user doesn't specify gender, it's a non-factor or neutral match
            genderScore = 0.5; // Neutral small weight if no preference
        }
        matchScore += genderScore * 0.15;
        totalWeight += 0.15;

        // Lifestyle compatibility (Weight: 0.15)
        let lifestyleScore = 0;
        if (userPreferences.desiredLifestyle && userPreferences.desiredLifestyle.length > 0) {
            let postAttributesForLifestyle = [];
            // Map amenities/lifestyle from post to common lifestyle options
            if (post.lifestyle && Array.isArray(post.lifestyle)) {
                postAttributesForLifestyle = post.lifestyle;
            } else if (post.amenities && Array.isArray(post.amenities)) {
                postAttributesForLifestyle = post.amenities.map(amenity => {
                    if (amenity.toLowerCase().includes('yên tĩnh')) return 'Yên tĩnh';
                    if (amenity.toLowerCase().includes('sạch sẽ')) return 'Sạch sẽ';
                    if (amenity.toLowerCase().includes('không hút thuốc')) return 'Không hút thuốc';
                    if (amenity.toLowerCase().includes('học tập nhiều')) return 'Học tập nhiều';
                    if (amenity.toLowerCase().includes('thích nấu ăn')) return 'Thích nấu ăn';
                    return null;
                }).filter(Boolean);
            }

            if (postAttributesForLifestyle.length > 0) {
                const commonLifestyles = postAttributesForLifestyle.filter(attr =>
                    userPreferences.desiredLifestyle.includes(attr)
                );
                lifestyleScore = commonLifestyles.length / userPreferences.desiredLifestyle.length; // Normalize to 0-1
                if (lifestyleScore > 0) primaryMatchCount++;
            }
        }
        matchScore += lifestyleScore * 0.15;
        totalWeight += 0.15;

        // Interests overlap (Weight: 0.10)
        let interestsScore = 0;
        if (post.interests && userPreferences.desiredInterests && userPreferences.desiredInterests.length > 0) {
            const commonInterests = post.interests.filter(interest =>
                userPreferences.desiredInterests.includes(interest)
            );
            interestsScore = commonInterests.length / userPreferences.desiredInterests.length; // Normalize to 0-1
        }
        matchScore += interestsScore * 0.10;
        totalWeight += 0.10;

        // Major compatibility (Weight: 0.05)
        let majorScore = 0;
        if (userPreferences.desiredMajor && post.major) {
            if (userPreferences.desiredMajor.toLowerCase() === post.major.toLowerCase()) {
                majorScore = 1;
            }
        }
        matchScore += majorScore * 0.05;
        totalWeight += 0.05;

        // Year compatibility (Weight: 0.05)
        let yearScore = 0;
        if (userPreferences.desiredYear && post.year) {
            if (userPreferences.desiredYear === post.year) {
                yearScore = 1;
            }
        }
        matchScore += yearScore * 0.05;
        totalWeight += 0.05;

        // Normalize final matchScore to be out of 100
        const finalMatchScore = (totalWeight > 0) ? (matchScore / totalWeight) * 100 : 0; // Avoid division by zero
        
        return {
          ...post,
          matchScore: Math.min(100, Math.max(0, finalMatchScore)),
          primaryMatchCount: primaryMatchCount // Include the new counter
        };
      });
      
      // Sort by match score and filter based on new criteria
      const sortedSuggestions = postsWithScores
        .filter(post => post.primaryMatchCount >= 2 || post.matchScore > 30) // New filter condition
        .sort((a, b) => b.matchScore - a.matchScore);
      
      setSuggestions(sortedSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshSuggestions = async () => {
    setRefreshing(true);
    
    try {
      // Re-fetch suggestions from mock data
      await fetchSuggestions();
    } catch (error) {
      console.error('Error refreshing suggestions:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleFavorite = (postId) => {
    setFavorites(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const formatPrice = (price) => {
    return (price / 1000000).toFixed(1) + ' triệu';
  };

  const getGenderLabel = (gender) => {
    const genders = {
      'male': 'Nam',
      'female': 'Nữ'
    };
    return genders[gender] || 'Không quan trọng';
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getMatchScoreLabel = (score) => {
    if (score >= 90) return 'Rất phù hợp';
    if (score >= 80) return 'Phù hợp';
    if (score >= 70) return 'Khá phù hợp';
    return 'Có thể phù hợp';
  };

  const checkLookingForCriteriaComplete = () => {
    // This function is no longer used to gate fetchSuggestions,
    // but can be used for UI messaging.
    if (!userLookingFor) {
      return false;
    }
    const { desiredGender, desiredBudget, desiredLocation, desiredLifestyle } = userPreferences;
    
    // Consider criteria complete if at least one core preference is set.
    // This allows partial preferences to still trigger suggestions.
    const hasAnyCorePreference = 
      (desiredGender && desiredGender !== '') ||
      (desiredBudget !== null) ||
      (desiredLocation && desiredLocation !== '') ||
      (desiredLifestyle && desiredLifestyle.length > 0);

    return hasAnyCorePreference;
  };

  const filteredSuggestions = suggestions; 
  return (
    <div className="py-6">
      <div className="mb-6 flex justify-end">
        <button
          onClick={refreshSuggestions}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Làm mới gợi ý</span>
        </button>
      </div>

      {!checkLookingForCriteriaComplete() ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md flex items-center space-x-2">
          <Brain size={48} className="mx-auto" />
          <p>
            Vui lòng nhập đầy đủ thông tin vào phần "Tiêu chí tìm bạn" trong hồ sơ của bạn để nhận gợi ý.
            <Link to="/profile" className="text-blue-700 hover:underline ml-1">Cập nhật hồ sơ</Link>
          </p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-gray-400 mb-4">
            <Brain size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Chưa có trọ phù hợp với bạn
          </h3>
          <p className="text-gray-600">
            Thử cập nhật lại tiêu chí tìm bạn ghép trọ của bạn hoặc quay lại sau.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src={suggestion.images?.[0] || '/placeholder-image.jpg'}
                  alt={suggestion.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(suggestion.matchScore)}`}>
                    {suggestion.matchScore.toFixed(0)}% {getMatchScoreLabel(suggestion.matchScore)}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button
                    onClick={() => toggleFavorite(suggestion.id)}
                    className={`p-2 rounded-full ${
                      favorites.includes(suggestion.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-600 hover:text-red-500'
                    } transition-colors`}
                  >
                    <Heart size={16} />
                  </button>
                  <div className="p-2 bg-white rounded-full text-gray-600">
                    <Eye size={16} />
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                  <Link to={`/post/${suggestion.id}`} className="hover:text-blue-600">
                    {suggestion.title}
                  </Link>
                </h3>
                <div className="space-y-1 text-gray-600 text-sm">
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-2" />
                    <span>{suggestion.location || suggestion.address}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign size={14} className="mr-2" />
                    <span className="font-semibold text-green-600">
                      {formatPrice(suggestion.price || suggestion.budget)}/tháng
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users size={14} className="mr-2" />
                    <span>{getGenderLabel(suggestion.genderPreference)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/post/${suggestion.id}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Suggestions;
