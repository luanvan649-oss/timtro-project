const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-8">
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          className={`px-4 py-2 rounded ${currentPage === i + 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};

export default Pagination;