import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  hasNextPage, 
  hasPreviousPage,
  isLoading = false 
}) {
  // Generate page numbers array
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show page numbers with ellipsis
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 py-6">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage || isLoading}
        className={`
          flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${!hasPreviousPage || isLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Trước
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[40px]
                  ${page === currentPage
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-300 hover:border-gray-400 hover:shadow-sm'
                  }
                `}
              >
                {page}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage || isLoading}
        className={`
          flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${!hasNextPage || isLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-300 hover:border-gray-400'
          }
        `}
      >
        Sau
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center ml-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Đang tải...</span>
        </div>
      )}
    </div>
  );
}

export default Pagination; 