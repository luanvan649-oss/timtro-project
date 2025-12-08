import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  Star,
  Heart,
  MapPin,
  DollarSign,
  Users,
  Eye,
  RefreshCw,
} from "lucide-react";
// Use Vite env variable if provided, fallback to localhost
const API_URL =
  (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3001";

type Maybe<T> = T | null | undefined;

interface Post {
  id: string | number;
  title?: string;
  price?: number;
  budget?: number;
  location?: string;
  district?: string;
  city?: string;
  address?: string;
  genderPreference?: string;
  lifestyle?: string[];
  amenities?: string[];
  interests?: string[];
  major?: string;
  year?: string | number;
  images?: string[];
  matchScore?: number;
  primaryMatchCount?: number;
  matchFactors?: number;
  matchPercentage?: number;
  criteriaMatchCount?: number;
}

interface LookingFor {
  budget?: string;
  location?: string;
  gender?: string;
  lifestyle?: string[];
}

interface Props {
  userLookingFor?: Maybe<LookingFor>;
  userInterests?: Maybe<string[]>;
  userMajor?: Maybe<string>;
  userYear?: Maybe<string | number>;
}

function Suggestions({
  userLookingFor,
  userInterests,
  userMajor,
  userYear,
}: Props) {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [likedPosts, setLikedPosts] = useState<Set<string | number>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [localUserLookingFor, setLocalUserLookingFor] =
    useState<LookingFor | null>(userLookingFor || null);
  const [localUserInterests, setLocalUserInterests] = useState<string[] | null>(
    userInterests || null
  );

  // Fetch latest profile data when component mounts or when user returns to page
  useEffect(() => {
    const fetchLatestProfile = async () => {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          const uid = user.id || user.uid || "";
          if (uid) {
            try {
              const userResponse = await fetch(`${API_URL}/users/${uid}`);
              if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.lookingFor) {
                  setLocalUserLookingFor(userData.lookingFor);
                }
                if (userData.interests) {
                  setLocalUserInterests(userData.interests);
                }
              }
            } catch (err) {
              console.error("Error fetching latest profile:", err);
            }
          }
        } catch (err) {
          console.error("Error parsing currentUser", err);
        }
      }
    };

    fetchLatestProfile();

    // Also fetch when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLatestProfile();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []); // Fetch on mount

  // Use local state if available, otherwise fall back to props
  const effectiveUserLookingFor = localUserLookingFor || userLookingFor || {};
  const effectiveUserInterests = localUserInterests || userInterests || [];

  const userPreferences = useMemo(() => {
    const safeUserLookingFor = effectiveUserLookingFor || {};
    return {
      desiredBudget: (() => {
        switch (safeUserLookingFor.budget) {
          case "under-2m":
            return 1500000;
          case "2-3m":
            return 2500000;
          case "3-4m":
            return 3500000;
          case "4-5m":
            return 4500000;
          case "above-5m":
            return 5500000;
          default:
            return null;
        }
      })(),
      desiredLocation: safeUserLookingFor.location || "", // Khu vực mong muốn từ profile
      desiredGender: safeUserLookingFor.gender || "",
      desiredLifestyle: safeUserLookingFor.lifestyle || [],
      desiredInterests: effectiveUserInterests || [],
      desiredMajor: userMajor,
      desiredYear: userYear,
    };
  }, [effectiveUserLookingFor, effectiveUserInterests, userMajor, userYear]);

  // fetchSuggestions is stable via useCallback and accepts an optional AbortSignal
  const fetchSuggestions = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const allPostsResponse = await fetch(`${API_URL}/posts`, { signal });
        const allPostsFromDb = await allPostsResponse.json();

        // Deduplicate by id to avoid repeated posts
        const uniqueById = new Map<string | number, Post>();
        (allPostsFromDb as Post[]).forEach((p) => {
          if (!uniqueById.has(p.id)) uniqueById.set(p.id, p);
        });
        const allPosts: Post[] = Array.from(uniqueById.values());

        // ============================================
        // CÁCH TÍNH PHẦN TRĂM PHÙ HỢP (MỚI):
        // ============================================
        // BƯỚC 1: BẮT BUỘC cùng thành phố (từ profile)
        // - Chỉ hiển thị các bài post cùng thành phố với user
        // - Lấy thành phố từ trường "city" trong profile của user
        //
        // BƯỚC 2: Đếm số yếu tố khớp (tối đa 3 yếu tố):
        // 1. Giới tính mong muốn (Gender Preference)
        //    - Khớp nếu: user muốn "any" HOẶC post là "any" HOẶC giống nhau
        // 2. Lối sống mong muốn (Lifestyle)
        //    - Khớp nếu: có ít nhất một lối sống trùng với post.lifestyle
        // 3. Sở thích (Interests)
        //    - Khớp nếu: có ít nhất một sở thích trùng với post.interests
        //
        // BƯỚC 3: Tính phần trăm phù hợp
        // Công thức: Phần trăm = (Số yếu tố khớp / 3) × 100
        //
        // Ví dụ:
        // - Khớp 0 yếu tố: 0% (không hiển thị vì không có yếu tố nào khớp)
        // - Khớp 1 yếu tố: (1/3) × 100 = 33.33%
        // - Khớp 2 yếu tố: (2/3) × 100 = 66.67%
        // - Khớp 3 yếu tố: (3/3) × 100 = 100%
        //
        // Sắp xếp: Ưu tiên bài có nhiều yếu tố khớp hơn
        // ============================================

        // Calculate match scores based on user preferences
        const postsWithScores = allPosts.map((post) => {
          let matchScore = 0;
          let totalWeight = 0; // To normalize the score later
          let primaryMatchCount = 0; // Counter for the new requirement

          // Budget compatibility (Weight: 0.25)
          let budgetScore = 0;
          if (post.price && userPreferences.desiredBudget) {
            const priceDifference = Math.abs(
              post.price - userPreferences.desiredBudget
            );
            // Assuming a max reasonable price difference for normalization, e.g., 5,000,000 VND
            budgetScore = Math.max(0, 1 - priceDifference / 5000000); // Normalize to 0-1
            if (budgetScore > 0) primaryMatchCount++;
          }
          matchScore += budgetScore * 0.25;
          totalWeight += 0.25;

          // Location match (Weight: 0.25)
          let locationScore = 0;
          if (
            userPreferences.desiredLocation &&
            (post.location || post.district)
          ) {
            const desiredLocationLower =
              userPreferences.desiredLocation.toLowerCase();
            if (
              post.district &&
              post.district.toLowerCase().includes(desiredLocationLower)
            ) {
              locationScore = 1; // Direct district match
            } else if (
              post.location &&
              post.location.toLowerCase().includes(desiredLocationLower)
            ) {
              locationScore = 0.5; // Broader location match
            }
            if (locationScore > 0) primaryMatchCount++;
          }
          matchScore += locationScore * 0.25;
          totalWeight += 0.25;

          // Gender compatibility (Weight: 0.15)
          let genderScore = 0;
          if (userPreferences.desiredGender) {
            // Check if a gender is desired
            if (
              userPreferences.desiredGender === "any" ||
              (post.genderPreference &&
                (post.genderPreference === "any" ||
                  post.genderPreference === userPreferences.desiredGender))
            ) {
              genderScore = 1;
            }
            // Only count as a "primary match" if a specific gender was desired and matched
            if (userPreferences.desiredGender !== "any" && genderScore === 1) {
              primaryMatchCount++;
            }
          } else {
            // If user doesn't specify gender, it's a non-factor or neutral match
            genderScore = 0.5; // Neutral small weight if no preference
          }
          matchScore += genderScore * 0.15;
          totalWeight += 0.15;

          // Lifestyle compatibility (Weight: 0.10 - giảm từ 0.15 để cân bằng với sở thích)
          let lifestyleScore = 0;
          if (
            userPreferences.desiredLifestyle &&
            userPreferences.desiredLifestyle.length > 0
          ) {
            let postAttributesForLifestyle: string[] = [];
            // Map amenities/lifestyle from post to common lifestyle options
            if (post.lifestyle && Array.isArray(post.lifestyle)) {
              postAttributesForLifestyle = post.lifestyle;
            } else if (post.amenities && Array.isArray(post.amenities)) {
              postAttributesForLifestyle = post.amenities
                .map((amenity) => {
                  if (amenity.toLowerCase().includes("yên tĩnh"))
                    return "Yên tĩnh";
                  if (amenity.toLowerCase().includes("sạch sẽ"))
                    return "Sạch sẽ";
                  if (amenity.toLowerCase().includes("không hút thuốc"))
                    return "Không hút thuốc";
                  if (amenity.toLowerCase().includes("học tập nhiều"))
                    return "Học tập nhiều";
                  if (amenity.toLowerCase().includes("thích nấu ăn"))
                    return "Thích nấu ăn";
                  return null;
                })
                .filter(Boolean) as string[];
            }

            if (postAttributesForLifestyle.length > 0) {
              const commonLifestyles = postAttributesForLifestyle.filter(
                (attr) => userPreferences.desiredLifestyle.includes(attr)
              );
              lifestyleScore =
                commonLifestyles.length /
                userPreferences.desiredLifestyle.length; // Normalize to 0-1
              if (lifestyleScore > 0) primaryMatchCount++;
            }
          }
          matchScore += lifestyleScore * 0.1; // Giảm từ 0.15 xuống 0.10
          totalWeight += 0.1; // Giảm từ 0.15 xuống 0.10

          // Interests overlap (Weight: 0.15 - tăng từ 0.10 để ưu tiên sở thích)
          let interestsScore = 0;
          if (
            post.interests &&
            userPreferences.desiredInterests &&
            userPreferences.desiredInterests.length > 0
          ) {
            const commonInterests = post.interests.filter((interest) =>
              userPreferences.desiredInterests.includes(interest)
            );
            interestsScore =
              commonInterests.length / userPreferences.desiredInterests.length; // Normalize to 0-1
            if (interestsScore > 0) primaryMatchCount++;
          }
          matchScore += interestsScore * 0.15; // Tăng từ 0.10 lên 0.15
          totalWeight += 0.15; // Tăng từ 0.10 lên 0.15

          // Major compatibility (Weight: 0.05)
          let majorScore = 0;
          if (userPreferences.desiredMajor && post.major) {
            if (
              userPreferences.desiredMajor.toLowerCase() ===
              post.major.toLowerCase()
            ) {
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
          const finalMatchScore =
            totalWeight > 0 ? (matchScore / totalWeight) * 100 : 0; // Avoid division by zero

          return {
            ...post,
            matchScore: Math.min(100, Math.max(0, finalMatchScore)),
            primaryMatchCount: primaryMatchCount, // Include the new counter
          } as Post;
        });

        // Filter: BẮT BUỘC cùng thành phố với "Khu vực mong muốn" từ profile, sau đó đếm số yếu tố khớp
        const filteredByProfile = postsWithScores
          .map((post) => {
            // BƯỚC 1: Kiểm tra thành phố từ "Khu vực mong muốn" trong profile (BẮT BUỘC)
            let matchesCity = false;
            if (
              userPreferences.desiredLocation &&
              userPreferences.desiredLocation.trim() !== ""
            ) {
              // Normalize tên thành phố: loại bỏ dấu và chuyển về lowercase
              const normalizeCityName = (city: string): string => {
                return city
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
                  .trim();
              };

              const desiredLocationNormalized = normalizeCityName(
                userPreferences.desiredLocation
              );
              const postLocationNormalized = normalizeCityName(
                post.location || ""
              );
              const postCityNormalized = normalizeCityName(post.city || "");

              // Chỉ match nếu post.location hoặc post.city chứa tên thành phố mong muốn
              // Và đảm bảo tên thành phố đủ dài (>= 3 ký tự) để tránh false positive
              const locationMatches =
                postLocationNormalized &&
                postLocationNormalized.length > 0 &&
                desiredLocationNormalized.length >= 3 &&
                postLocationNormalized.includes(desiredLocationNormalized);

              const cityMatches =
                postCityNormalized &&
                postCityNormalized.length > 0 &&
                desiredLocationNormalized.length >= 3 &&
                postCityNormalized.includes(desiredLocationNormalized);

              if (locationMatches || cityMatches) {
                matchesCity = true;
              }
            } else {
              // Nếu user chưa có "Khu vực mong muốn" trong profile, không hiển thị gì
              return null;
            }

            // Nếu không cùng thành phố, loại bỏ
            if (!matchesCity) {
              return null;
            }

            // BƯỚC 2: Tính phần trăm phù hợp dựa trên các yếu tố
            // Các yếu tố tính điểm (tổng 100%):
            // 1. Cùng khu vực mong muốn (20%) - đã kiểm tra ở BƯỚC 1, nên luôn có điểm này
            // 2. Ngân sách (20%) - phải khớp chính xác với giá thuê
            // 3. Giới tính mong muốn (20%) - phải khớp
            // 4. Sở thích (20%) - tính theo tỷ lệ số sở thích khớp
            // 5. Lối sống mong muốn (20%) - tính theo tỷ lệ số lối sống khớp

            let totalScore = 0;

            // 1. Cùng khu vực mong muốn (20%) - đã pass qua filter, nên luôn có điểm
            totalScore += 20;

            // 2. Ngân sách (20%) - phải khớp chính xác với giá thuê
            if (userPreferences.desiredBudget && post.price) {
              // Cho phép sai số nhỏ (100,000 VND) để linh hoạt
              const priceDifference = Math.abs(
                post.price - userPreferences.desiredBudget
              );
              if (priceDifference <= 100000) {
                totalScore += 20;
              }
            }

            // 3. Giới tính mong muốn (20%) - phải khớp
            if (userPreferences.desiredGender && post.genderPreference) {
              const wantGender = userPreferences.desiredGender.toLowerCase();
              const postGender = post.genderPreference.toLowerCase();
              // Khớp nếu: user muốn "any" HOẶC post là "any" HOẶC giống nhau
              if (
                wantGender === "any" ||
                postGender === "any" ||
                postGender === wantGender
              ) {
                totalScore += 20;
              }
            }

            // 4. Sở thích (20%) - tính theo tỷ lệ số sở thích khớp
            if (
              userPreferences.desiredInterests &&
              userPreferences.desiredInterests.length > 0 &&
              post.interests &&
              Array.isArray(post.interests) &&
              post.interests.length > 0
            ) {
              const commonInterests = post.interests.filter((interest) =>
                userPreferences.desiredInterests.includes(interest)
              );
              // Tính tỷ lệ: số sở thích khớp / số sở thích mong muốn
              // Càng nhiều sở thích khớp thì điểm càng cao
              const interestRatio =
                commonInterests.length /
                userPreferences.desiredInterests.length;
              totalScore += interestRatio * 20;
            }

            // 5. Lối sống mong muốn (20%) - tính theo tỷ lệ số lối sống khớp
            if (
              userPreferences.desiredLifestyle &&
              userPreferences.desiredLifestyle.length > 0
            ) {
              let postLifestyle: string[] = [];
              if (post.lifestyle && Array.isArray(post.lifestyle)) {
                postLifestyle = post.lifestyle;
              }

              if (postLifestyle.length > 0) {
                const commonLifestyle = postLifestyle.filter((lifestyle) =>
                  userPreferences.desiredLifestyle.includes(lifestyle)
                );
                // Tính tỷ lệ: số lối sống khớp / số lối sống mong muốn
                // Càng nhiều lối sống khớp thì điểm càng cao
                const lifestyleRatio =
                  commonLifestyle.length /
                  userPreferences.desiredLifestyle.length;
                totalScore += lifestyleRatio * 20;
              }
            }

            // Tính phần trăm phù hợp (tối đa 100%)
            const matchPercentage = Math.min(100, Math.round(totalScore));

            return {
              ...post,
              images: post.images || [], // Đảm bảo images luôn tồn tại
              matchPercentage: matchPercentage, // Phần trăm phù hợp (0-100)
              criteriaMatchCount: Math.round(totalScore / 20), // Số yếu tố khớp (để tương thích)
            };
          })
          .filter(
            (
              post
            ): post is Post & {
              images?: string[];
              matchPercentage: number;
              criteriaMatchCount: number;
            } => post !== null
          );

        // Sort by: Phần trăm phù hợp (giảm dần - càng cao càng tốt)
        // Thứ tự ưu tiên:
        // - 100%: Cùng khu vực + Ngân sách + Giới tính + Tất cả sở thích + Tất cả lối sống
        // - Càng nhiều yếu tố khớp thì phần trăm càng cao
        const sortedSuggestions = filteredByProfile.sort((a, b) => {
          // Sắp xếp theo phần trăm phù hợp giảm dần
          return (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0);
        });

        setSuggestions(sortedSuggestions);
      } catch (error) {
        if ((error as any)?.name === "AbortError") {
          // aborted — ignore
          return;
        }
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [userPreferences]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchSuggestions(controller.signal);
    return () => controller.abort();
  }, [fetchSuggestions]);

  // Force reload when desiredLocation changes
  useEffect(() => {
    if (userPreferences.desiredLocation) {
      const controller = new AbortController();
      fetchSuggestions(controller.signal);
      return () => controller.abort();
    }
  }, [userPreferences.desiredLocation, fetchSuggestions]);

  // Load current user (for per-user like/view) and liked list
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const uid = user.id || user.uid || "";
        setCurrentUserId(uid);

        if (uid) {
          // Load liked posts
          const likedKey = `likedPosts_${uid}`;
          const saved = localStorage.getItem(likedKey);
          if (saved) {
            const arr = JSON.parse(saved);
            setLikedPosts(new Set(arr));
          }
        }
      } catch (err) {
        console.error("Error parsing currentUser", err);
      }
    }
  }, []);

  const refreshSuggestions = async () => {
    setRefreshing(true);

    try {
      // Re-fetch suggestions from mock data
      await fetchSuggestions();
    } catch (error) {
      console.error("Error refreshing suggestions:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleFavorite = (postId) => {
    setFavorites((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  // Like/Unlike a post (toggle)
  const handleLike = async (post) => {
    if (!currentUserId) {
      alert("Vui lòng đăng nhập để thả tim.");
      return;
    }

    const isLiked = likedPosts.has(post.id);
    const newLikes = isLiked
      ? Math.max(0, (post.likes || 0) - 1)
      : (post.likes || 0) + 1;

    try {
      await fetch(`${API_URL}/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: newLikes }),
      });

      // Update UI list
      setSuggestions((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, likes: newLikes } : p))
      );

      // Update local liked set
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (isLiked) {
          next.delete(post.id);
        } else {
          next.add(post.id);
        }
        const likedKey = `likedPosts_${currentUserId}`;
        localStorage.setItem(likedKey, JSON.stringify(Array.from(next)));
        return next;
      });

      // Only create notifications when liking (not unliking)
      if (!isLiked) {
        // Create notifications for post owner and admins
        try {
          // Get current user info
          const userResponse = await fetch(`${API_URL}/users/${currentUserId}`);
          const user = await userResponse.json();

          // Get post details to find owner
          const postResponse = await fetch(`${API_URL}/posts/${post.id}`);
          const postData = await postResponse.json();
          const postOwnerId = postData.userId || postData.authorId;

          // Get admin users
          const adminsResponse = await fetch(`${API_URL}/users?role=admin`);
          const admins = await adminsResponse.json();
          const adminsList = Array.isArray(admins) ? admins : [];

          const notificationPromises = [];

          // Create notification for post owner (if exists and not the same as liker)
          if (postOwnerId && postOwnerId !== currentUserId) {
            const ownerNotificationId = `post_liked_${Date.now()}_${postOwnerId}_${
              post.id
            }`;
            notificationPromises.push(
              fetch(`${API_URL}/notifications`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: ownerNotificationId,
                  type: "post_liked",
                  userId: postOwnerId,
                  fromUser: {
                    fullName: user.fullName || user.email || "Người dùng",
                    id: user.id || currentUserId,
                  },
                  data: {
                    postTitle: postData.title || post.title,
                    postId: post.id,
                  },
                  isRead: false,
                  createdAt: new Date().toISOString(),
                }),
              }).catch((err) => {
                console.error(
                  "Error creating notification for post owner:",
                  err
                );
                return null;
              })
            );
          }

          // Create notification for each admin
          adminsList.forEach((admin) => {
            const adminNotificationId = `post_liked_${Date.now()}_${admin.id}_${
              post.id
            }`;
            notificationPromises.push(
              fetch(`${API_URL}/notifications`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: adminNotificationId,
                  type: "post_liked",
                  userId: admin.id,
                  fromUser: {
                    fullName: user.fullName || user.email || "Người dùng",
                    id: user.id || currentUserId,
                  },
                  data: {
                    postTitle: postData.title || post.title,
                    postId: post.id,
                  },
                  isRead: false,
                  createdAt: new Date().toISOString(),
                }),
              }).catch((err) => {
                console.error(
                  `Error creating notification for admin ${admin.id}:`,
                  err
                );
                return null;
              })
            );
          });

          await Promise.all(notificationPromises);

          // Emit socket events if available
          if ((window as any).socket) {
            // Emit for post owner
            if (postOwnerId && postOwnerId !== currentUserId) {
              (window as any).socket.emit("newNotification", {
                id: `post_liked_${Date.now()}_${postOwnerId}_${post.id}`,
                type: "post_liked",
                userId: postOwnerId,
                fromUser: {
                  fullName: user.fullName || user.email || "Người dùng",
                  id: user.id || currentUserId,
                },
                data: {
                  postTitle: postData.title || post.title,
                  postId: post.id,
                },
                isRead: false,
                createdAt: new Date().toISOString(),
              });
            }

            // Emit for admins
            adminsList.forEach((admin) => {
              (window as any).socket.emit("newNotification", {
                id: `post_liked_${Date.now()}_${admin.id}_${post.id}`,
                type: "post_liked",
                userId: admin.id,
                fromUser: {
                  fullName: user.fullName || user.email || "Người dùng",
                  id: user.id || currentUserId,
                },
                data: {
                  postTitle: postData.title || post.title,
                  postId: post.id,
                },
                isRead: false,
                createdAt: new Date().toISOString(),
              });
            });
          }
        } catch (notifError) {
          console.error("Error creating like notifications:", notifError);
          // Don't block the like action if notification fails
        }
      }
    } catch (err) {
      console.error("Error liking post:", err);
      alert("Không thể thả tim lúc này, thử lại sau.");
    }
  };

  // View detail: navigate to detail page (view will be incremented in PostDetail.tsx)
  const handleViewAndNavigate = (post) => {
    navigate(`/post/${post.id}`);
  };

  const formatPrice = (price) => {
    return (price / 1000000).toFixed(1) + " triệu";
  };

  const getGenderLabel = (gender) => {
    const genders = {
      male: "Nam",
      female: "Nữ",
    };
    return genders[gender] || "Không quan trọng";
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  const getMatchScoreLabel = (score) => {
    if (score >= 90) return "Rất phù hợp";
    if (score >= 80) return "Phù hợp";
    if (score >= 70) return "Khá phù hợp";
    return "Có thể phù hợp";
  };

  const checkLookingForCriteriaComplete = () => {
    // This function is no longer used to gate fetchSuggestions,
    // but can be used for UI messaging.
    if (!userLookingFor) {
      return false;
    }
    const { desiredGender, desiredBudget, desiredLocation, desiredLifestyle } =
      userPreferences;

    // Consider criteria complete if at least one core preference is set.
    // This allows partial preferences to still trigger suggestions.
    const hasAnyCorePreference =
      (desiredGender && desiredGender !== "") ||
      desiredBudget !== null ||
      (desiredLocation && desiredLocation !== "") ||
      (desiredLifestyle && desiredLifestyle.length > 0);

    return hasAnyCorePreference;
  };

  const filteredSuggestions = useMemo(() => suggestions, [suggestions]);
  return (
    <div className="py-6">
      <div className="mb-6 flex justify-end">
        <button
          onClick={refreshSuggestions}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>Làm mới gợi ý</span>
        </button>
      </div>

      {!checkLookingForCriteriaComplete() ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md flex items-center space-x-2">
          <Brain size={48} className="mx-auto" />
          <p>
            Vui lòng nhập đầy đủ thông tin vào phần "Tiêu chí tìm bạn" trong hồ
            sơ của bạn để nhận gợi ý.
            <Link to="/profile" className="text-blue-700 hover:underline ml-1">
              Cập nhật hồ sơ
            </Link>
          </p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-white rounded-lg shadow-lg p-6 animate-pulse"
            >
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
            Thử cập nhật lại tiêu chí tìm bạn ghép trọ của bạn hoặc quay lại
            sau.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full"
            >
              <div className="relative">
                <img
                  src={suggestion.images?.[0] || "/placeholder-image.jpg"}
                  alt={suggestion.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(
                      suggestion.matchPercentage || 0
                    )}`}
                  >
                    {suggestion.matchPercentage?.toFixed(0) || 0}%{" "}
                    {getMatchScoreLabel(suggestion.matchPercentage || 0)}
                  </span>
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  {/* Like button without showing count on listing */}
                  <button
                    onClick={() => handleLike(suggestion)}
                    className={`p-2 rounded-full transition-colors ${
                      likedPosts.has(suggestion.id)
                        ? "bg-red-500 text-white"
                        : "bg-white bg-opacity-80 text-gray-700 hover:bg-opacity-100"
                    }`}
                    aria-label="Thả tim"
                  >
                    <Heart
                      size={16}
                      fill={
                        likedPosts.has(suggestion.id) ? "currentColor" : "none"
                      }
                    />
                  </button>
                  {/* View badge still shows count */}
                  <div className="p-2 rounded-full bg-white bg-opacity-80 text-gray-700 flex items-center gap-1">
                    <Eye size={16} />
                    <span className="text-xs font-medium">
                      {suggestion.views || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow w-full">
                {/* Tiêu đề - chiều cao cố định để tất cả card có cùng vị trí bắt đầu */}
                <div className="mb-3 h-[3.5rem] w-full">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 w-full h-full">
                    <button
                      onClick={() => handleViewAndNavigate(suggestion)}
                      className="text-left hover:text-blue-600 w-full h-full transition-colors"
                    >
                      {suggestion.title}
                    </button>
                  </h3>
                </div>

                {/* Mô tả - chiều cao cố định (kể cả khi không có mô tả) để tất cả card thẳng hàng */}
                <div className="mb-4 h-[2.5rem] w-full">
                  {suggestion.description ? (
                    <div className="text-gray-600 text-sm line-clamp-2 w-full h-full">
                      {suggestion.description}
                    </div>
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>

                {/* Thành phố, Giá tiền, Giới tính - cùng một div với width cố định để thẳng hàng */}
                <div className="space-y-2.5 text-gray-600 mb-4 flex-grow w-full">
                  <div className="flex items-center min-h-[1.5rem] w-full">
                    <div className="w-5 h-5 mr-2.5 flex-shrink-0 flex items-center justify-center">
                      <MapPin size={16} className="text-gray-500" />
                    </div>
                    <span className="line-clamp-1 flex-1 text-sm">
                      {suggestion.location ||
                        suggestion.address ||
                        "Chưa có địa chỉ"}
                    </span>
                  </div>
                  <div className="flex items-center min-h-[1.5rem] w-full">
                    <div className="w-5 h-5 mr-2.5 flex-shrink-0 flex items-center justify-center">
                      <DollarSign size={16} className="text-gray-500" />
                    </div>
                    <span className="font-semibold text-green-600 flex-1 text-sm">
                      {formatPrice(suggestion.price || suggestion.budget)}/tháng
                    </span>
                  </div>
                  <div className="flex items-center min-h-[1.5rem] w-full">
                    <div className="w-5 h-5 mr-2.5 flex-shrink-0 flex items-center justify-center">
                      <Users size={16} className="text-gray-500" />
                    </div>
                    <span className="flex-1 text-sm">
                      {getGenderLabel(suggestion.genderPreference)}
                    </span>
                  </div>
                </div>

                <div className="mt-auto w-full">
                  <button
                    onClick={() => handleViewAndNavigate(suggestion)}
                    className="block w-full bg-blue-600 text-white text-center py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Xem chi tiết
                  </button>
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
