const PostCard = ({ post }) => (
  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex gap-4">
    <img
      src={post.images?.[0] || 'https://via.placeholder.com/400x300'}
      alt={post.title}
      className="w-48 h-36 object-cover rounded"
    />
    <div className="flex-1">
      <h3 className="font-medium text-gray-900 line-clamp-2">{post.title}</h3>
      <p className="text-orange-500 font-bold text-lg mt-1">
        {(post.price / 1000000).toFixed(1)} triệu/tháng
      </p>
      <p className="text-sm text-gray-600">{post.area}m² • {post.location}</p>
    </div>
  </div>
);

export default PostCard;