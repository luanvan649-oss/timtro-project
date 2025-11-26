
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Heart, MapPin, DollarSign, Users, Eye, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

function Suggestions({ userLookingFor, userInterests, userMajor, userYear }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  
  const userPreferences = useMemo(() => {
    const storedUser = localStorage.getItem('currentUser');
    let fallback = {};
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        fallback = parsed.lookingFor || {};
      } catch {
        fallback = {};
      }
    }
  
    const safeLookingFor = userLookingFor || fallback;
  
    return {
      desiredBudget: (() => {
        switch (safeLookingFor.budget) {
          case 'under-2m': return 1500000;
          case '2-3m': return 2500000;
          case '3-4m': return 3500000;
          case '4-5m': return 4500000;
          case 'above-5m': return 5500000;
          default: return null;
        }
      })(),
      desiredLocation: safeLookingFor.location || '',
      desiredGender: safeLookingFor.gender || '',
      desiredLifestyle: safeLookingFor.lifestyle || [],
      desiredInterests: userInterests || [],
      desiredMajor: userMajor || null,
      desiredYear: userYear || null
    };
  }, [userLookingFor, userInterests, userMajor, userYear]);
  
  useEffect(() => {
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPreferences]);
  
  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/posts`);
      const allPosts = await res.json();
  
      const postsWithScores = allPosts.map(post => {
        let matchScore = 0;
        let totalWeight = 0;
        let primaryMatchCount = 0;
  
        // Budget (0.25)
        let budgetScore = 0;
        if (post.price && userPreferences.desiredBudget) {
          const diff = Math.abs(post.price - userPreferences.desiredBudget);
          budgetScore = Math.max(0, 1 - (diff / 5000000));
          if (budgetScore > 0) primaryMatchCount++;
        }
        matchScore += budgetScore * 0.25;
        totalWeight += 0.25;
  
        // Location (0.25)
        let locationScore = 0;
        if (userPreferences.desiredLocation && (post.district || post.location)) {
          const dl = userPreferences.desiredLocation.toLowerCase();
          if (post.district && post.district.toLowerCase().includes(dl)) locationScore = 1;
          else if (post.location && post.location.toLowerCase().includes(dl)) locationScore = 0.5;
          if (locationScore > 0) primaryMatchCount++;
        }
        matchScore += locationScore * 0.25;
        totalWeight += 0.25;
  
        // Gender (0.15)
        let genderScore = 0;
        if (userPreferences.desiredGender) {
          if (userPreferences.desiredGender === 'any' || !post.genderPreference) genderScore = 1;
          else if (post.genderPreference === 'any' || post.genderPreference === userPreferences.desiredGender) genderScore = 1;
        }
        matchScore += genderScore * 0.15;
        totalWeight += 0.15;
  
        // Lifestyle (0.15)
        let lifestyleScore = 0;
        if (userPreferences.desiredLifestyle && userPreferences.desiredLifestyle.length > 0) {
          let postAttributesForLifestyle = [];
          if (post.lifestyle && Array.isArray(post.lifestyle)) {
            postAttributesForLifestyle = post.lifestyle;
          } else if (post.amenities && Array.isArray(post.amenities)) {
            postAttributesForLifestyle = post.amenities.map(a => {
              if (a.toLowerCase().includes('yên tĩnh')) return 'Yên tĩnh';
              if (a.toLowerCase().includes('sạch')) return 'Sạch sẽ';
              if (a.toLowerCase().includes('không hút thuốc')) return 'Không hút thuốc';
              if (a.toLowerCase().includes('học tập')) return 'Học tập nhiều';
              if (a.toLowerCase().includes('nấu ăn')) return 'Thích nấu ăn';
              return null;
            }).filter(Boolean);
          }
          if (postAttributesForLifestyle.length > 0) {
            const common = postAttributesForLifestyle.filter(attr => userPreferences.desiredLifestyle.includes(attr));
            lifestyleScore = common.length / userPreferences.desiredLifestyle.length;
            if (lifestyleScore > 0) primaryMatchCount++;
          }
        }
        matchScore += lifestyleScore * 0.15;
        totalWeight += 0.15;
  
        // Interests (0.10)
        let interestsScore = 0;
        if (post.interests && userPreferences.desiredInterests && userPreferences.desiredInterests.length > 0) {
          const common = post.interests.filter(i => userPreferences.desiredInterests.includes(i));
          interestsScore = common.length / userPreferences.desiredInterests.length;
        }
        matchScore += interestsScore * 0.1;
        totalWeight += 0.1;
  
        // Major (0.05)
        let majorScore = 0;
        if (userPreferences.desiredMajor && post.major) {
          if (userPreferences.desiredMajor.toLowerCase() === post.major.toLowerCase()) majorScore = 1;
        }
        matchScore += majorScore * 0.05;
        totalWeight += 0.05;
  
        // Year (0.05)
        let yearScore = 0;
        if (userPreferences.desiredYear && post.year) {
          if (userPreferences.desiredYear === post.year) yearScore = 1;
        }
        matchScore += yearScore * 0.05;
        totalWeight += 0.05;
  
        const finalScore = totalWeight > 0 ? (matchScore / totalWeight) * 100 : 0;
  
        return {
          ...post,
          matchScore: Math.min(100, Math.max(0, finalScore)),
          primaryMatchCount
        };
      });
  
      const sorted = postsWithScores
        .filter(p => p.primaryMatchCount >= 2 || p.matchScore > 30)
        .sort((a, b) => b.matchScore - a.matchScore);
  
      setSuggestions(sorted);
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
      await fetchSuggestions();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };
  
  const toggleFavorite = (postId) => {
    setFavorites(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
  };
  
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'N/A';
    return (price / 1000000).toFixed(1) + ' triệu';
  };
  
  const getGenderLabel = (gender) => {
    const genders = { male: 'Nam', female: 'Nữ' };
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
  
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {new Array(3).fill(null).map((_, i) => (
            <div key={`skeleton-${i}`} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-gray-400 mb-4">
            <Brain size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có trọ phù hợp với bạn</h3>
          <p className="text-gray-600">Thử cập nhật lại tiêu chí tìm bạn ghép trọ của bạn hoặc quay lại sau.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img src={suggestion.images?.[0] || '/placeholder-image.jpg'} alt={suggestion.title} className="w-full h-48 object-cover" />
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(suggestion.matchScore)}`}>
                    {suggestion.matchScore.toFixed(0)}% {getMatchScoreLabel(suggestion.matchScore)}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button onClick={() => toggleFavorite(suggestion.id)} className={`p-2 rounded-full ${favorites.includes(suggestion.id) ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'} transition-colors`}>
                    <Heart size={16} />
                  </button>
                  <div className="p-2 bg-white rounded-full text-gray-600"><Eye size={16} /></div>
                </div>
              </div>
  
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                  <Link to={`/post/${suggestion.id}`} className="hover:text-blue-600">{suggestion.title}</Link>
                </h3>
                <div className="space-y-1 text-gray-600 text-sm">
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-2" />
                    <span>{suggestion.location || suggestion.address || suggestion.district}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign size={14} className="mr-2" />
                    <span className="font-semibold text-green-600">{formatPrice(suggestion.price || suggestion.budget)}/tháng</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={14} className="mr-2" />
                    <span>{getGenderLabel(suggestion.genderPreference)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to={`/post/${suggestion.id}`} className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors">Xem chi tiết</Link>
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
