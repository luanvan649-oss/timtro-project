import React, { useEffect, useState } from 'react';

interface BlogItem {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  images?: string[];
  tags?: string[];
}

const Blog = () => {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // In a real application, this would be a fetch call to your API, e.g.,
        // const response = await fetch('http://localhost:3000/blogs');
        // const data = await response.json();
        // For now, we'll simulate fetching from db.json by directly using the data structure.
        // Assuming db.json content is available or a mock API is running.
        const mockData = {
          "blogs": [
            {
              "id": "blog1",
              "title": "Bí quyết tìm phòng trọ ưng ý cho sinh viên FPT",
              "author": "FPTro Admin",
              "date": "2025-07-17",
              "content": "Việc tìm kiếm một căn phòng trọ phù hợp là một trong những ưu tiên hàng đầu của sinh viên khi bắt đầu cuộc sống tự lập. Đặc biệt đối với sinh viên FPT, việc tìm phòng trọ gần trường, thuận tiện di chuyển và đảm bảo an ninh là vô cùng quan trọng. Bài viết này sẽ chia sẻ những bí quyết giúp bạn tìm được căn phòng ưng ý nhất.",
              "images": [
                "https://images.unsplash.com/photo-1549517045-bc93de0e06ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              ],
              "tags": [
                "phòng trọ",
                "sinh viên",
                "FPT",
                "bí quyết"
              ]
            },
            {
              "id": "blog2",
              "title": "5 mẹo tiết kiệm chi phí sinh hoạt khi ở trọ",
              "author": "FPTro Admin",
              "date": "2025-07-10",
              "content": "Cuộc sống sinh viên xa nhà luôn đi kèm với nhiều khoản chi phí. Làm thế nào để quản lý tài chính hiệu quả và tiết kiệm chi phí sinh hoạt khi ở trọ? Dưới đây là 5 mẹo nhỏ mà bạn có thể áp dụng ngay hôm nay.",
              "images": [
                "https://images.unsplash.com/photo-1593062095908-1647f3a8b276?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              ],
              "tags": [
                "tiết kiệm",
                "chi phí",
                "sinh hoạt",
                "ở trọ"
              ]
            },
            {
              "id": "blog3",
              "title": "Làm sao để hòa nhập với bạn cùng phòng mới?",
              "author": "FPTro Admin",
              "date": "2025-07-01",
              "content": "Việc có bạn cùng phòng có thể mang lại nhiều lợi ích nhưng cũng tiềm ẩn những mâu thuẫn nếu không biết cách hòa nhập. Bài viết này sẽ giúp bạn xây dựng mối quan hệ tốt đẹp với bạn cùng phòng, tạo nên một không gian sống thoải mái và vui vẻ.",
              "images": [
                "https://images.unsplash.com/photo-1521742918805-f933b0064d30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              ],
              "tags": [
                "bạn cùng phòng",
                "hòa nhập",
                "sinh hoạt",
                "kinh nghiệm"
              ]
            }
          ]
        };
        setBlogs(mockData.blogs as BlogItem[]);
      } catch (err) {
        setError("Failed to fetch blog posts.");
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-gray-700">Đang tải bài viết...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Blog</h1>
      <p className="text-gray-700 mb-8">
        Đây là trang Blog. Nội dung blog sẽ được cập nhật tại đây.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {blog.images && blog.images.length > 0 && (
              <img
                className="w-full h-48 object-cover"
                src={blog.images[0]}
                alt={blog.title}
              />
            )}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h2>
              <p className="text-gray-600 text-sm mb-3">
                Bởi <span className="font-medium">{blog.author}</span> vào ngày {blog.date}
              </p>
              <p className="text-gray-700 text-base mb-4 line-clamp-3">{blog.content}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags && blog.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <a
                href={`/blog/${blog.id}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
                aria-label={`Đọc thêm về ${blog.title}`}
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent<HTMLAnchorElement>) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    window.location.href = `/blog/${blog.id}`;
                  }
                }}
              >
                Đọc thêm
              </a>
            </div>
          </div>
        ))}
      </div>

      {blogs.length === 0 && !loading && !error && (
        <p className="text-gray-700 mt-8">Không có bài viết nào để hiển thị.</p>
      )}
    </div>
  );
};

export default Blog;
