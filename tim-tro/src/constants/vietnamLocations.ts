// Helper function to generate default wards for districts without data
export const getDefaultWards = (districtName: string): string[] => {
  // Check if it's a city/town (Thành phố/Thị xã)
  if (districtName.includes('Thành phố') || districtName.includes('Thị xã')) {
    return [
      'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5',
      'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10',
      'Phường Trung Tâm', 'Phường Đông', 'Phường Tây', 'Phường Nam', 'Phường Bắc'
    ];
  }
  // Check if it's a district (Quận)
  if (districtName.includes('Quận')) {
    return [
      'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5',
      'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10',
      'Phường Trung Tâm', 'Phường Đông', 'Phường Tây', 'Phường Nam', 'Phường Bắc'
    ];
  }
  // For counties (Huyện), return communes
  return [
    'Xã Trung Tâm', 'Xã Đông', 'Xã Tây', 'Xã Nam', 'Xã Bắc',
    'Xã 1', 'Xã 2', 'Xã 3', 'Xã 4', 'Xã 5',
    'Thị trấn', 'Xã Hòa Bình', 'Xã An Phú', 'Xã Phú Hòa', 'Xã Tân Hưng'
  ];
};

// Helper function to generate default streets for districts without data
export const getDefaultStreets = (districtName: string): string[] => {
  return [
    'Đường Trung Tâm', 'Đường Chính', 'Đường Quốc Lộ', 'Đường Tỉnh Lộ',
    'Đường Nguyễn Du', 'Đường Lê Lợi', 'Đường Trần Hưng Đạo', 'Đường Quang Trung',
    'Đường Hoàng Diệu', 'Đường Cách Mạng Tháng 8', 'Đường 3 Tháng 2', 'Đường Nguyễn Trãi',
    'Đường Phạm Văn Đồng', 'Đường Lý Thường Kiệt', 'Đường Hùng Vương', 'Đường Bạch Đằng'
  ];
};

// Tất cả các tỉnh thành của Việt Nam
export const VIETNAM_PROVINCES = [
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bạc Liêu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Dương",
  "Hải Phòng",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
  "Hồ Chí Minh"
];

// Quận/Huyện cho các thành phố lớn (có thể mở rộng sau)
export const VIETNAM_DISTRICTS: Record<string, string[]> = {
  "Hồ Chí Minh": [
    "Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 9", "Quận 10", "Quận 11", "Quận 12",
    "Bình Thạnh", "Phú Nhuận", "Tân Bình", "Tân Phú", "Gò Vấp", "Bình Tân", "Thủ Đức",
    "Bình Chánh", "Nhà Bè", "Hóc Môn", "Củ Chi", "Cần Giờ"
  ],
  "Hà Nội": [
    "Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Tây Hồ", "Quận Long Biên", "Quận Cầu Giấy", "Quận Đống Đa", 
    "Quận Hai Bà Trưng", "Quận Hoàng Mai", "Quận Thanh Xuân", "Quận Hà Đông",
    "Quận Nam Từ Liêm", "Quận Bắc Từ Liêm", "Quận Thanh Trì", "Quận Gia Lâm", "Quận Đông Anh", 
    "Quận Sóc Sơn", "Quận Mê Linh", "Thị xã Sơn Tây",
    "Huyện Ba Vì", "Huyện Phúc Thọ", "Huyện Đan Phượng", "Huyện Hoài Đức", "Huyện Quốc Oai", 
    "Huyện Thạch Thất", "Huyện Chương Mỹ", "Huyện Thanh Oai",
    "Huyện Thường Tín", "Huyện Phú Xuyên", "Huyện Ứng Hòa", "Huyện Mỹ Đức"
  ],
  "Đà Nẵng": [
    "Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ", "Hòa Vang", "Hoàng Sa"
  ],
  "Cần Thơ": [
    "Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn", "Thốt Nốt", "Phong Điền", "Cờ Đỏ", "Vĩnh Thạnh", "Thới Lai"
  ],
  "Hải Phòng": [
    "Hồng Bàng", "Ngô Quyền", "Lê Chân", "Hải An", "Kiến An", "Đồ Sơn", "Dương Kinh", "Thuỷ Nguyên", "An Dương", "An Lão", "Kiến Thuỵ", "Tiên Lãng", "Vĩnh Bảo", "Cát Hải", "Bạch Long Vĩ"
  ],
  "Đà Lạt": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12"
  ],
  // Thêm dữ liệu mẫu cho các tỉnh thành khác (có thể mở rộng sau)
  "An Giang": ["Thành phố Long Xuyên", "Thành phố Châu Đốc", "Thị xã Tân Châu", "Huyện An Phú", "Huyện Châu Phú", "Huyện Châu Thành", "Huyện Chợ Mới", "Huyện Phú Tân", "Huyện Thoại Sơn", "Huyện Tịnh Biên", "Huyện Tri Tôn"],
  "Bà Rịa - Vũng Tàu": ["Thành phố Vũng Tàu", "Thành phố Bà Rịa", "Thị xã Phú Mỹ", "Huyện Châu Đức", "Huyện Côn Đảo", "Huyện Đất Đỏ", "Huyện Long Điền", "Huyện Tân Thành", "Huyện Xuyên Mộc"],
  "Bạc Liêu": ["Thành phố Bạc Liêu", "Huyện Hồng Dân", "Huyện Phước Long", "Huyện Vĩnh Lợi", "Huyện Giá Rai", "Huyện Đông Hải", "Huyện Hoà Bình"],
  "Bắc Giang": ["Thành phố Bắc Giang", "Huyện Yên Thế", "Huyện Tân Yên", "Huyện Lạng Giang", "Huyện Lục Nam", "Huyện Lục Ngạn", "Huyện Sơn Động", "Huyện Yên Dũng", "Huyện Việt Yên", "Huyện Hiệp Hoà"],
  "Bắc Kạn": ["Thành phố Bắc Kạn", "Huyện Pác Nặm", "Huyện Ba Bể", "Huyện Ngân Sơn", "Huyện Bạch Thông", "Huyện Chợ Đồn", "Huyện Chợ Mới", "Huyện Na Rì"],
  "Bắc Ninh": ["Thành phố Bắc Ninh", "Thị xã Từ Sơn", "Huyện Yên Phong", "Huyện Quế Võ", "Huyện Tiên Du", "Huyện Gia Bình", "Huyện Lương Tài"],
  "Bến Tre": ["Thành phố Bến Tre", "Huyện Châu Thành", "Huyện Chợ Lách", "Huyện Mỏ Cày Bắc", "Huyện Mỏ Cày Nam", "Huyện Giồng Trôm", "Huyện Bình Đại", "Huyện Ba Tri", "Huyện Thạnh Phú"],
  "Bình Định": ["Thành phố Quy Nhơn", "Huyện An Lão", "Huyện Hoài Ân", "Huyện Hoài Nhơn", "Huyện Phù Cát", "Huyện Phù Mỹ", "Huyện Tây Sơn", "Huyện Tuy Phước", "Huyện Vân Canh", "Huyện Vĩnh Thạnh"],
  "Bình Dương": ["Thành phố Thủ Dầu Một", "Thị xã Dĩ An", "Thị xã Tân Uyên", "Thị xã Thuận An", "Huyện Bàu Bàng", "Huyện Bến Cát", "Huyện Dầu Tiếng", "Huyện Phú Giáo"],
  "Bình Phước": ["Thị xã Đồng Xoài", "Thị xã Bình Long", "Huyện Bù Đăng", "Huyện Bù Đốp", "Huyện Bù Gia Mập", "Huyện Chơn Thành", "Huyện Đồng Phú", "Huyện Hớn Quản", "Huyện Lộc Ninh"],
  "Bình Thuận": ["Thành phố Phan Thiết", "Thị xã La Gi", "Huyện Bắc Bình", "Huyện Đức Linh", "Huyện Hàm Tân", "Huyện Hàm Thuận Bắc", "Huyện Hàm Thuận Nam", "Huyện Phú Quí", "Huyện Tánh Linh", "Huyện Tuy Phong"],
  "Cà Mau": ["Thành phố Cà Mau", "Huyện Cái Nước", "Huyện Đầm Dơi", "Huyện Ngọc Hiển", "Huyện Năm Căn", "Huyện Phú Tân", "Huyện Thới Bình", "Huyện Trần Văn Thời", "Huyện U Minh"],
  "Cao Bằng": ["Thành phố Cao Bằng", "Huyện Bảo Lạc", "Huyện Bảo Lâm", "Huyện Hạ Lang", "Huyện Hà Quảng", "Huyện Hoà An", "Huyện Nguyên Bình", "Huyện Quảng Uyên", "Huyện Thạch An", "Huyện Trùng Khánh"],
  "Đắk Lắk": ["Thành phố Buôn Ma Thuột", "Thị xã Buôn Hồ", "Huyện Cư Kuin", "Huyện Cư M'gar", "Huyện Ea H'leo", "Huyện Ea Kar", "Huyện Ea Súp", "Huyện Krông A Na", "Huyện Krông Bông", "Huyện Krông Búk", "Huyện Krông Năng", "Huyện Krông Pắk", "Huyện Lắk", "Huyện M'Đrắk"],
  "Đắk Nông": ["Thị xã Gia Nghĩa", "Huyện Cư Jút", "Huyện Đắk Glong", "Huyện Đắk Mil", "Huyện Đắk R'Lấp", "Huyện Đắk Song", "Huyện Krông Nô", "Huyện Tuy Đức"],
  "Điện Biên": ["Thành phố Điện Biên Phủ", "Thị xã Mường Lay", "Huyện Điện Biên", "Huyện Điện Biên Đông", "Huyện Mường Ảng", "Huyện Mường Chà", "Huyện Mường Nhé", "Huyện Nậm Pồ", "Huyện Tủa Chùa", "Huyện Tuần Giáo"],
  "Đồng Nai": ["Thành phố Biên Hòa", "Thành phố Long Khánh", "Thị xã Tân Phú", "Huyện Cẩm Mỹ", "Huyện Định Quán", "Huyện Long Thành", "Huyện Nhơn Trạch", "Huyện Tân Phú", "Huyện Thống Nhất", "Huyện Vĩnh Cửu", "Huyện Xuân Lộc"],
  "Đồng Tháp": ["Thành phố Cao Lãnh", "Thành phố Sa Đéc", "Thị xã Hồng Ngự", "Huyện Cao Lãnh", "Huyện Châu Thành", "Huyện Hồng Ngự", "Huyện Lai Vung", "Huyện Lấp Vò", "Huyện Tam Nông", "Huyện Tân Hồng", "Huyện Tân Hưng", "Huyện Thanh Bình", "Huyện Tháp Mười"],
  "Gia Lai": ["Thành phố Pleiku", "Thị xã An Khê", "Thị xã Ayun Pa", "Huyện Chư Păh", "Huyện Chư Prông", "Huyện Chư Sê", "Huyện Đăk Đoa", "Huyện Đăk Pơ", "Huyện Đức Cơ", "Huyện Ia Grai", "Huyện Ia Pa", "Huyện KBang", "Huyện Kông Chro", "Huyện Krông Pa", "Huyện Mang Yang", "Huyện Phú Thiện"],
  "Hà Giang": ["Thành phố Hà Giang", "Huyện Bắc Mê", "Huyện Bắc Quang", "Huyện Đồng Văn", "Huyện Hoàng Su Phì", "Huyện Mèo Vạc", "Huyện Quản Bạ", "Huyện Quang Bình", "Huyện Vị Xuyên", "Huyện Xín Mần", "Huyện Yên Minh"],
  "Hà Nam": ["Thành phố Phủ Lý", "Thị xã Duy Tiên", "Huyện Bình Lục", "Huyện Kim Bảng", "Huyện Lý Nhân", "Huyện Thanh Liêm"],
  "Hà Tĩnh": ["Thành phố Hà Tĩnh", "Thị xã Hồng Lĩnh", "Thị xã Kỳ Anh", "Huyện Can Lộc", "Huyện Cẩm Xuyên", "Huyện Đức Thọ", "Huyện Hương Khê", "Huyện Hương Sơn", "Huyện Kỳ Anh", "Huyện Lộc Hà", "Huyện Nghi Xuân", "Huyện Thạch Hà", "Huyện Vũ Quang"],
  "Hải Dương": ["Thành phố Hải Dương", "Thị xã Chí Linh", "Huyện Bình Giang", "Huyện Cẩm Giàng", "Huyện Gia Lộc", "Huyện Kim Thành", "Huyện Kinh Môn", "Huyện Nam Sách", "Huyện Ninh Giang", "Huyện Thanh Hà", "Huyện Thanh Miện", "Huyện Tứ Kỳ"],
  "Hậu Giang": ["Thành phố Vị Thanh", "Thành phố Ngã Bảy", "Thị xã Long Mỹ", "Huyện Châu Thành", "Huyện Châu Thành A", "Huyện Phụng Hiệp", "Huyện Vị Thủy"],
  "Hòa Bình": ["Thành phố Hòa Bình", "Huyện Đà Bắc", "Huyện Kim Bôi", "Huyện Cao Phong", "Huyện Kỳ Sơn", "Huyện Lạc Sơn", "Huyện Lạc Thủy", "Huyện Lương Sơn", "Huyện Mai Châu", "Huyện Tân Lạc", "Huyện Yên Thủy"],
  "Hưng Yên": ["Thành phố Hưng Yên", "Huyện Văn Lâm", "Huyện Văn Giang", "Huyện Yên Mỹ", "Huyện Mỹ Hào", "Huyện Ân Thi", "Huyện Khoái Châu", "Huyện Kim Động", "Huyện Tiên Lữ", "Huyện Phù Cừ"],
  "Khánh Hòa": ["Thành phố Nha Trang", "Thành phố Cam Ranh", "Thị xã Ninh Hòa", "Huyện Cam Lâm", "Huyện Diên Khánh", "Huyện Khánh Sơn", "Huyện Khánh Vĩnh", "Huyện Trường Sa", "Huyện Vạn Ninh"],
  "Kiên Giang": ["Thành phố Rạch Giá", "Thành phố Hà Tiên", "Thị xã Phú Quốc", "Huyện An Biên", "Huyện An Minh", "Huyện Châu Thành", "Huyện Giồng Riềng", "Huyện Gò Quao", "Huyện Hòn Đất", "Huyện Kiên Hải", "Huyện Kiên Lương", "Huyện Tân Hiệp", "Huyện U Minh Thượng", "Huyện Vĩnh Thuận"],
  "Kon Tum": ["Thành phố Kon Tum", "Huyện Đắk Glei", "Huyện Đắk Hà", "Huyện Đắk Tô", "Huyện Ia H'Drai", "Huyện Kon Plông", "Huyện Kon Rẫy", "Huyện Ngọc Hồi", "Huyện Sa Thầy", "Huyện Tu Mơ Rông"],
  "Lai Châu": ["Thành phố Lai Châu", "Huyện Mường Tè", "Huyện Nậm Nhùn", "Huyện Phong Thổ", "Huyện Sìn Hồ", "Huyện Tam Đường", "Huyện Tân Uyên", "Huyện Than Uyên"],
  "Lâm Đồng": ["Thành phố Đà Lạt", "Thành phố Bảo Lộc", "Huyện Bảo Lâm", "Huyện Cát Tiên", "Huyện Đạ Huoai", "Huyện Đạ Tẻh", "Huyện Đam Rông", "Huyện Đơn Dương", "Huyện Đức Trọng", "Huyện Lạc Dương", "Huyện Lâm Hà"],
  "Lạng Sơn": ["Thành phố Lạng Sơn", "Huyện Bắc Sơn", "Huyện Bình Gia", "Huyện Cao Lộc", "Huyện Chi Lăng", "Huyện Đình Lập", "Huyện Hữu Lũng", "Huyện Lộc Bình", "Huyện Tràng Định", "Huyện Văn Lãng", "Huyện Văn Quan"],
  "Lào Cai": ["Thành phố Lào Cai", "Thị xã Sa Pa", "Huyện Bắc Hà", "Huyện Bảo Thắng", "Huyện Bảo Yên", "Huyện Bát Xát", "Huyện Mường Khương", "Huyện Si Ma Cai", "Huyện Văn Bàn"],
  "Long An": ["Thành phố Tân An", "Thị xã Kiến Tường", "Huyện Bến Lức", "Huyện Cần Đước", "Huyện Cần Giuộc", "Huyện Châu Thành", "Huyện Đức Hòa", "Huyện Đức Huệ", "Huyện Mộc Hóa", "Huyện Tân Hưng", "Huyện Tân Thạnh", "Huyện Tân Trụ", "Huyện Thạnh Hóa", "Huyện Thủ Thừa", "Huyện Vĩnh Hưng"],
  "Nam Định": ["Thành phố Nam Định", "Huyện Mỹ Lộc", "Huyện Vụ Bản", "Huyện Ý Yên", "Huyện Nghĩa Hưng", "Huyện Nam Trực", "Huyện Trực Ninh", "Huyện Xuân Trường", "Huyện Giao Thủy", "Huyện Hải Hậu"],
  "Nghệ An": ["Thành phố Vinh", "Thị xã Cửa Lò", "Thị xã Hoàng Mai", "Thị xã Thái Hòa", "Huyện Anh Sơn", "Huyện Con Cuông", "Huyện Diễn Châu", "Huyện Đô Lương", "Huyện Hưng Nguyên", "Huyện Kỳ Sơn", "Huyện Nam Đàn", "Huyện Nghi Lộc", "Huyện Nghĩa Đàn", "Huyện Quế Phong", "Huyện Quỳ Châu", "Huyện Quỳ Hợp", "Huyện Quỳnh Lưu", "Huyện Tân Kỳ", "Huyện Thanh Chương", "Huyện Tương Dương", "Huyện Yên Thành"],
  "Ninh Bình": ["Thành phố Ninh Bình", "Thành phố Tam Điệp", "Huyện Gia Viễn", "Huyện Hoa Lư", "Huyện Kim Sơn", "Huyện Nho Quan", "Huyện Yên Khánh", "Huyện Yên Mô"],
  "Ninh Thuận": ["Thành phố Phan Rang-Tháp Chàm", "Huyện Bác Ái", "Huyện Ninh Hải", "Huyện Ninh Phước", "Huyện Ninh Sơn", "Huyện Thuận Bắc", "Huyện Thuận Nam"],
  "Phú Thọ": ["Thành phố Việt Trì", "Thị xã Phú Thọ", "Huyện Cẩm Khê", "Huyện Đoan Hùng", "Huyện Hạ Hòa", "Huyện Lâm Thao", "Huyện Phù Ninh", "Huyện Tam Nông", "Huyện Tân Sơn", "Huyện Thanh Ba", "Huyện Thanh Sơn", "Huyện Thanh Thủy", "Huyện Yên Lập"],
  "Phú Yên": ["Thành phố Tuy Hòa", "Thị xã Sông Cầu", "Huyện Đông Hòa", "Huyện Phú Hòa", "Huyện Sơn Hòa", "Huyện Sông Hinh", "Huyện Tây Hòa", "Huyện Tuy An"],
  "Quảng Bình": ["Thành phố Đồng Hới", "Thị xã Ba Đồn", "Huyện Bố Trạch", "Huyện Lệ Thủy", "Huyện Minh Hóa", "Huyện Quảng Ninh", "Huyện Quảng Trạch", "Huyện Tuyên Hóa"],
  "Quảng Nam": ["Thành phố Tam Kỳ", "Thành phố Hội An", "Huyện Bắc Trà My", "Huyện Đại Lộc", "Huyện Đông Giang", "Huyện Duy Xuyên", "Huyện Hiệp Đức", "Huyện Nam Giang", "Huyện Nam Trà My", "Huyện Phước Sơn", "Huyện Phú Ninh", "Huyện Tây Giang", "Huyện Thăng Bình", "Huyện Tiên Phước"],
  "Quảng Ngãi": ["Thành phố Quảng Ngãi", "Huyện Ba Tơ", "Huyện Bình Sơn", "Huyện Đức Phổ", "Huyện Lý Sơn", "Huyện Minh Long", "Huyện Mộ Đức", "Huyện Nghĩa Hành", "Huyện Sơn Hà", "Huyện Sơn Tịnh", "Huyện Sơn Tây", "Huyện Tây Trà", "Huyện Trà Bồng", "Huyện Tư Nghĩa"],
  "Quảng Ninh": ["Thành phố Hạ Long", "Thành phố Móng Cái", "Thành phố Cẩm Phả", "Thành phố Uông Bí", "Thị xã Bình Liêu", "Thị xã Đông Triều", "Thị xã Quảng Yên", "Huyện Ba Chẽ", "Huyện Cô Tô", "Huyện Đầm Hà", "Huyện Hải Hà", "Huyện Hoành Bồ", "Huyện Tiên Yên", "Huyện Vân Đồn"],
  "Quảng Trị": ["Thành phố Đông Hà", "Thị xã Quảng Trị", "Huyện Cam Lộ", "Huyện Cồn Cỏ", "Huyện Đa Krông", "Huyện Gio Linh", "Huyện Hải Lăng", "Huyện Hướng Hóa", "Huyện Triệu Phong", "Huyện Vĩnh Linh"],
  "Sóc Trăng": ["Thành phố Sóc Trăng", "Huyện Châu Thành", "Huyện Cù Lao Dung", "Huyện Kế Sách", "Huyện Long Phú", "Huyện Mỹ Tú", "Huyện Mỹ Xuyên", "Huyện Ngã Năm", "Huyện Thạnh Trị", "Huyện Trần Đề", "Huyện Vĩnh Châu"],
  "Sơn La": ["Thành phố Sơn La", "Huyện Mai Sơn", "Huyện Mộc Châu", "Huyện Mường La", "Huyện Mường Tè", "Huyện Phù Yên", "Huyện Quỳnh Nhai", "Huyện Sông Mã", "Huyện Sốp Cộp", "Huyện Thuận Châu", "Huyện Vân Hồ", "Huyện Yên Châu"],
  "Tây Ninh": ["Thành phố Tây Ninh", "Huyện Bến Cầu", "Huyện Châu Thành", "Huyện Dương Minh Châu", "Huyện Gò Dầu", "Huyện Hòa Thành", "Huyện Tân Biên", "Huyện Tân Châu", "Huyện Trảng Bàng"],
  "Thái Bình": ["Thành phố Thái Bình", "Huyện Đông Hưng", "Huyện Hưng Hà", "Huyện Kiến Xương", "Huyện Quỳnh Phụ", "Huyện Thái Thụy", "Huyện Tiền Hải", "Huyện Vũ Thư"],
  "Thái Nguyên": ["Thành phố Thái Nguyên", "Thành phố Sông Công", "Thị xã Phổ Yên", "Huyện Đại Từ", "Huyện Định Hóa", "Huyện Đồng Hỷ", "Huyện Phú Bình", "Huyện Phú Lương", "Huyện Võ Nhai"],
  "Thanh Hóa": ["Thành phố Thanh Hóa", "Thành phố Sầm Sơn", "Thị xã Bỉm Sơn", "Huyện Bá Thước", "Huyện Cẩm Thủy", "Huyện Đông Sơn", "Huyện Hà Trung", "Huyện Hậu Lộc", "Huyện Hoằng Hóa", "Huyện Lang Chánh", "Huyện Mường Lát", "Huyện Nga Sơn", "Huyện Ngọc Lặc", "Huyện Như Thanh", "Huyện Như Xuân", "Huyện Nông Cống", "Huyện Quan Hóa", "Huyện Quan Sơn", "Huyện Quảng Xương", "Huyện Thạch Thành", "Huyện Thiệu Hóa", "Huyện Thọ Xuân", "Huyện Thường Xuân", "Huyện Tĩnh Gia", "Huyện Triệu Sơn", "Huyện Vĩnh Lộc", "Huyện Yên Định"],
  "Thừa Thiên Huế": ["Thành phố Huế", "Thị xã Hương Thủy", "Thị xã Hương Trà", "Huyện A Lưới", "Huyện Nam Đông", "Huyện Phong Điền", "Huyện Phú Lộc", "Huyện Phú Vang", "Huyện Quảng Điền"],
  "Tiền Giang": ["Thành phố Mỹ Tho", "Thị xã Gò Công", "Thị xã Cai Lậy", "Huyện Cái Bè", "Huyện Châu Thành", "Huyện Chợ Gạo", "Huyện Gò Công Đông", "Huyện Gò Công Tây", "Huyện Tân Phú Đông", "Huyện Tân Phước"],
  "Trà Vinh": ["Thành phố Trà Vinh", "Huyện Càng Long", "Huyện Cầu Kè", "Huyện Cầu Ngang", "Huyện Châu Thành", "Huyện Duyên Hải", "Huyện Tiểu Cần", "Huyện Trà Cú"],
  "Tuyên Quang": ["Thành phố Tuyên Quang", "Huyện Chiêm Hóa", "Huyện Hàm Yên", "Huyện Lâm Bình", "Huyện Na Hang", "Huyện Sơn Dương", "Huyện Yên Sơn"],
  "Vĩnh Long": ["Thành phố Vĩnh Long", "Huyện Bình Minh", "Huyện Bình Tân", "Huyện Long Hồ", "Huyện Mang Thít", "Huyện Tam Bình", "Huyện Trà Ôn", "Huyện Vũng Liêm"],
  "Vĩnh Phúc": ["Thành phố Vĩnh Yên", "Thành phố Phúc Yên", "Huyện Bình Xuyên", "Huyện Lập Thạch", "Huyện Sông Lô", "Huyện Tam Đảo", "Huyện Tam Dương", "Huyện Vĩnh Tường", "Huyện Yên Lạc"],
  "Yên Bái": ["Thành phố Yên Bái", "Thị xã Nghĩa Lộ", "Huyện Lục Yên", "Huyện Mù Cang Chải", "Huyện Trạm Tấu", "Huyện Trấn Yên", "Huyện Văn Chấn", "Huyện Văn Yên", "Huyện Yên Bình"]
};

// Phường/Xã cho các quận/huyện (mẫu cho Hà Nội)
export const VIETNAM_WARDS: Record<string, string[]> = {
  "Quận Ba Đình": [
    "Phường Phúc Xá", "Phường Trúc Bạch", "Phường Vĩnh Phúc", "Phường Cống Vị", "Phường Liễu Giai",
    "Phường Nguyễn Trung Trực", "Phường Quán Thánh", "Phường Ngọc Hà", "Phường Điện Biên",
    "Phường Đội Cấn", "Phường Ngọc Khánh", "Phường Kim Mã", "Phường Giảng Võ", "Phường Thành Công"
  ],
  "Quận Hoàn Kiếm": [
    "Phường Phúc Tân", "Phường Đồng Xuân", "Phường Hàng Mã", "Phường Hàng Buồm", "Phường Hàng Đào",
    "Phường Hàng Bồ", "Phường Cửa Đông", "Phường Lý Thái Tổ", "Phường Hàng Bạc", "Phường Hàng Gai",
    "Phường Chương Dương Độ", "Phường Hàng Trống", "Phường Cửa Nam", "Phường Hàng Bông",
    "Phường Tràng Tiền", "Phường Trần Hưng Đạo", "Phường Phan Chu Trinh", "Phường Hàng Bài"
  ],
  "Quận Tây Hồ": [
    "Phường Phú Thượng", "Phường Nhật Tân", "Phường Tứ Liên", "Phường Quảng An", "Phường Xuân La",
    "Phường Yên Phụ", "Phường Bưởi", "Phường Thụy Khuê"
  ],
  "Quận Long Biên": [
    "Phường Thượng Thanh", "Phường Ngọc Thụy", "Phường Giang Biên", "Phường Đức Giang", "Phường Việt Hưng",
    "Phường Gia Thụy", "Phường Ngọc Lâm", "Phường Phúc Lợi", "Phường Bồ Đề", "Phường Sài Đồng",
    "Phường Long Biên", "Phường Thạch Bàn", "Phường Phúc Đồng", "Phường Cự Khối"
  ],
  "Quận Cầu Giấy": [
    "Phường Nghĩa Đô", "Phường Nghĩa Tân", "Phường Mai Dịch", "Phường Dịch Vọng", "Phường Dịch Vọng Hậu",
    "Phường Quan Hoa", "Phường Yên Hòa", "Phường Trung Hòa"
  ],
  "Quận Đống Đa": [
    "Phường Cát Linh", "Phường Văn Miếu", "Phường Quốc Tử Giám", "Phường Láng Thượng", "Phường Ô Chợ Dừa",
    "Phường Văn Chương", "Phường Hàng Bột", "Phường Láng Hạ", "Phường Khâm Thiên", "Phường Thổ Quan",
    "Phường Nam Đồng", "Phường Trung Phụng", "Phường Quang Trung", "Phường Trung Liệt", "Phường Phương Liên",
    "Phường Thịnh Quang", "Phường Trung Tự", "Phường Kim Liên", "Phường Phương Mai", "Phường Ngã Tư Sở",
    "Phường Khương Thượng"
  ],
  "Quận Hai Bà Trưng": [
    "Phường Nguyễn Du", "Phường Bạch Đằng", "Phường Phạm Đình Hổ", "Phường Lê Đại Hành", "Phường Đồng Nhân",
    "Phường Phố Huế", "Phường Đống Mác", "Phường Thanh Lương", "Phường Thanh Nhàn", "Phường Cầu Dền",
    "Phường Bách Khoa", "Phường Đồng Tâm", "Phường Vĩnh Tuy", "Phường Bạch Mai", "Phường Quỳnh Mai",
    "Phường Quỳnh Lôi", "Phường Minh Khai", "Phường Trương Định"
  ],
  "Quận Hoàng Mai": [
    "Phường Thanh Trì", "Phường Vĩnh Hưng", "Phường Định Công", "Phường Mai Động", "Phường Tương Mai",
    "Phường Đại Kim", "Phường Tân Mai", "Phường Hoàng Văn Thụ", "Phường Giáp Bát", "Phường Lĩnh Nam",
    "Phường Thịnh Liệt", "Phường Trần Phú", "Phường Hoàng Liệt", "Phường Yên Sở"
  ],
  "Quận Thanh Xuân": [
    "Phường Nhân Chính", "Phường Thượng Đình", "Phường Khương Trung", "Phường Khương Mai", "Phường Thanh Xuân Trung",
    "Phường Phương Liệt", "Phường Hạ Đình", "Phường Khương Đình", "Phường Thanh Xuân Bắc", "Phường Thanh Xuân Nam",
    "Phường Kim Giang"
  ],
  "Quận Hà Đông": [
    "Phường La Khê", "Phường Phú La", "Phường Phúc La", "Phường Hà Cầu", "Phường Yên Nghĩa",
    "Phường Kiến Hưng", "Phường Phú Lãm", "Phường Phú Lương", "Phường Dương Nội", "Phường Đồng Mai",
    "Phường Biên Giang", "Phường Vạn Phúc", "Phường Trung Văn"
  ],
  // Thêm dữ liệu mẫu cho các quận/huyện phổ biến khác
  "Quận Nam Từ Liêm": ["Phường Mỹ Đình 1", "Phường Mỹ Đình 2", "Phường Cầu Diễn", "Phường Xuân Phương", "Phường Phương Canh", "Phường Mễ Trì", "Phường Đại Mỗ", "Phường Tây Mỗ"],
  "Quận Bắc Từ Liêm": ["Phường Cổ Nhuế 1", "Phường Cổ Nhuế 2", "Phường Xuân Đỉnh", "Phường Xuân Tảo", "Phường Liên Mạc", "Phường Đông Ngạc", "Phường Thụy Phương", "Phường Minh Khai"],
  "Quận Thanh Trì": ["Xã Thanh Liệt", "Xã Tả Thanh Oai", "Xã Hữu Hoà", "Xã Tam Hiệp", "Xã Tứ Hiệp", "Xã Yên Mỹ", "Xã Vĩnh Quỳnh", "Xã Ngũ Hiệp"],
  "Quận Gia Lâm": ["Thị trấn Yên Viên", "Xã Cổ Bi", "Xã Đặng Xá", "Xã Phú Thị", "Xã Kim Sơn", "Xã Dương Hà", "Xã Đình Xuyên", "Xã Đa Tốn"],
  "Quận Đông Anh": ["Thị trấn Đông Anh", "Xã Việt Hùng", "Xã Nguyên Khê", "Xã Nam Hồng", "Xã Tiên Dương", "Xã Vân Hà", "Xã Uy Nỗ", "Xã Vân Nội"],
  "Quận Sóc Sơn": ["Thị trấn Sóc Sơn", "Xã Bắc Sơn", "Xã Minh Trí", "Xã Hồng Kỳ", "Xã Nam Sơn", "Xã Trung Giã", "Xã Tân Hưng", "Xã Minh Phú"],
  "Quận Mê Linh": ["Xã Đại Thịnh", "Xã Kim Hoa", "Xã Thạch Đà", "Xã Tiến Thắng", "Xã Tự Lập", "Xã Quang Minh", "Xã Thanh Lâm", "Xã Tam Đồng"],
  "Thị xã Sơn Tây": ["Phường Lê Lợi", "Phường Phú Thịnh", "Phường Ngô Quyền", "Phường Quang Trung", "Phường Sơn Lộc", "Phường Xuân Khanh", "Phường Đường Lâm", "Xã Viên Sơn"],
  "Quận 1": ["Phường Bến Nghé", "Phường Đa Kao", "Phường Bến Thành", "Phường Nguyễn Thái Bình", "Phường Phạm Ngũ Lão", "Phường Cầu Ông Lãnh", "Phường Cô Giang", "Phường Cầu Kho"],
  "Quận 2": ["Phường An Phú", "Phường An Khánh", "Phường Bình An", "Phường Bình Khánh", "Phường Bình Trưng Đông", "Phường Bình Trưng Tây", "Phường Cát Lái", "Phường Thạnh Mỹ Lợi"],
  "Quận 3": ["Phường Võ Thị Sáu", "Phường Đa Kao", "Phường Cô Giang", "Phường Nguyễn Cư Trinh", "Phường Cầu Kho", "Phường Cầu Ông Lãnh", "Phường Nguyễn Thái Bình", "Phường Phạm Ngũ Lão"],
  "Quận 4": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 8", "Phường 9", "Phường 10", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 18"],
  "Quận 5": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
  "Quận 6": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
  "Quận 7": ["Phường Tân Thuận Đông", "Phường Tân Thuận Tây", "Phường Tân Kiểng", "Phường Tân Hưng", "Phường Bình Thuận", "Phường Tân Quy", "Phường Phú Thuận", "Phường Tân Phong", "Phường Phú Mỹ"],
  "Quận 8": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"],
  "Quận 9": ["Phường Hiệp Phú", "Phường Long Bình", "Phường Long Thạnh Mỹ", "Phường Tân Phú", "Phường Tăng Nhơn Phú A", "Phường Tăng Nhơn Phú B", "Phường Phước Long A", "Phường Phước Long B", "Phường Trường Thạnh", "Phường Long Phước", "Phường Long Trường", "Phường Phước Bình", "Phường Phú Hữu"],
  "Quận 10": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
  "Quận 11": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"],
  "Quận 12": ["Phường An Phú Đông", "Phường Đông Hưng Thuận", "Phường Hiệp Thành", "Phường Tân Chánh Hiệp", "Phường Tân Hưng Thuận", "Phường Tân Thới Hiệp", "Phường Tân Thới Nhất", "Phường Thạnh Lộc", "Phường Thạnh Xuân", "Phường Thới An", "Phường Trung Mỹ Tây"],
  "Bình Thạnh": ["Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 6", "Phường 7", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 17", "Phường 19", "Phường 21", "Phường 22", "Phường 24", "Phường 25", "Phường 26", "Phường 27", "Phường 28"],
  "Phú Nhuận": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 13", "Phường 15", "Phường 17"],
  "Tân Bình": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
  "Tân Phú": ["Phường Hiệp Tân", "Phường Hòa Thạnh", "Phường Phú Thạnh", "Phường Phú Thọ Hòa", "Phường Phú Trung", "Phường Sơn Kỳ", "Phường Tân Hưng Thuận", "Phường Tân Quý", "Phường Tân Sơn Nhì", "Phường Tân Thành", "Phường Tân Thới Hòa", "Phường Tây Thạnh"],
  "Gò Vấp": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 17"],
  "Bình Tân": ["Phường An Lạc", "Phường An Lạc A", "Phường Bình Hưng Hòa", "Phường Bình Hưng Hòa A", "Phường Bình Hưng Hòa B", "Phường Bình Trị Đông", "Phường Bình Trị Đông A", "Phường Bình Trị Đông B", "Phường Tân Tạo", "Phường Tân Tạo A"],
  "Thủ Đức": ["Phường An Khánh", "Phường An Lợi Đông", "Phường An Phú", "Phường Bình Chiểu", "Phường Bình Thọ", "Phường Bình Trưng Đông", "Phường Bình Trưng Tây", "Phường Cát Lái", "Phường Hiệp Bình Chánh", "Phường Hiệp Bình Phước", "Phường Linh Chiểu", "Phường Linh Đông", "Phường Linh Tây", "Phường Linh Trung", "Phường Linh Xuân", "Phường Long Bình", "Phường Long Phước", "Phường Long Thạnh Mỹ", "Phường Long Trường", "Phường Phú Hữu", "Phường Phước Long A", "Phường Phước Long B", "Phường Tam Bình", "Phường Tam Phú", "Phường Tăng Nhơn Phú A", "Phường Tăng Nhơn Phú B", "Phường Tân Phú", "Phường Trường Thạnh"],
  // Thêm dữ liệu mẫu cho Vĩnh Phúc
  "Huyện Tam Đảo": ["Thị trấn Tam Đảo", "Xã Bồ Lý", "Xã Đại Đình", "Xã Đạo Trù", "Xã Hồ Sơn", "Xã Hợp Châu", "Xã Minh Quang", "Xã Tam Quan", "Xã Yên Dương"],
  "Thành phố Vĩnh Yên": ["Phường Đồng Tâm", "Phường Hội Hợp", "Phường Khai Quang", "Phường Liên Bảo", "Phường Ngô Quyền", "Phường Tích Sơn", "Xã Định Trung"],
  "Thành phố Phúc Yên": ["Phường Hùng Vương", "Phường Phúc Thắng", "Phường Trưng Nhị", "Phường Trưng Trắc", "Phường Xuân Hòa", "Xã Cao Minh", "Xã Nam Viêm", "Xã Ngọc Thanh", "Xã Tiền Châu"],
  "Huyện Bình Xuyên": ["Thị trấn Gia Khánh", "Thị trấn Hương Canh", "Xã Bá Hiến", "Xã Đạo Đức", "Xã Hương Sơn", "Xã Phú Xuân", "Xã Quất Lưu", "Xã Sơn Lôi", "Xã Tam Hợp", "Xã Tân Phong", "Xã Thanh Lãng", "Xã Thiện Kế", "Xã Trung Mỹ"],
  "Huyện Lập Thạch": ["Thị trấn Lập Thạch", "Xã Bắc Bình", "Xã Bàn Giản", "Xã Đình Chu", "Xã Đồng Ích", "Xã Hợp Lý", "Xã Liên Hòa", "Xã Liễn Sơn", "Xã Ngọc Mỹ", "Xã Quang Sơn", "Xã Sơn Đông", "Xã Thái Hòa", "Xã Tiên Lữ", "Xã Triệu Đề", "Xã Tử Du", "Xã Văn Quán", "Xã Vân Trục", "Xã Xuân Hòa", "Xã Xuân Lôi"],
  "Huyện Sông Lô": ["Xã Bạch Lưu", "Xã Cao Phong", "Xã Đôn Nhân", "Xã Đồng Quế", "Xã Đồng Thịnh", "Xã Đức Bác", "Xã Hải Lựu", "Xã Lãng Công", "Xã Nhân Đạo", "Xã Nhạo Sơn", "Xã Như Thụy", "Xã Phương Khoan", "Xã Quang Yên", "Xã Tân Lập", "Xã Tứ Yên", "Xã Yên Thạch"],
  "Huyện Tam Dương": ["Thị trấn Hợp Hòa", "Xã An Hòa", "Xã Đạo Tú", "Xã Đồng Tĩnh", "Xã Duy Phiên", "Xã Hoàng Đan", "Xã Hoàng Hoa", "Xã Hoàng Lâu", "Xã Hợp Thịnh", "Xã Hướng Đạo", "Xã Kim Long", "Xã Thanh Vân", "Xã Vân Hội", "Xã Yên Dương"],
  "Huyện Vĩnh Tường": ["Thị trấn Vĩnh Tường", "Thị trấn Thổ Tang", "Xã An Tường", "Xã Bình Dương", "Xã Bồ Sao", "Xã Cao Đại", "Xã Chấn Hưng", "Xã Đại Đồng", "Xã Kim Xá", "Xã Lũng Hòa", "Xã Lý Nhân", "Xã Nghĩa Hưng", "Xã Ngũ Kiên", "Xã Phú Đa", "Xã Phú Thịnh", "Xã Tam Phúc", "Xã Tân Cương", "Xã Tân Tiến", "Xã Thượng Trưng", "Xã Tuân Chính", "Xã Vân Xuân", "Xã Việt Xuân", "Xã Vĩnh Ninh", "Xã Vĩnh Sơn", "Xã Vĩnh Thịnh", "Xã Vũ Di", "Xã Yên Bình", "Xã Yên Lập"],
  "Huyện Yên Lạc": ["Thị trấn Yên Lạc", "Xã Bình Định", "Xã Đại Tự", "Xã Đồng Cương", "Xã Đồng Văn", "Xã Hồng Châu", "Xã Hồng Phương", "Xã Liên Châu", "Xã Nguyệt Đức", "Xã Tam Hồng", "Xã Tề Lỗ", "Xã Trung Hà", "Xã Trung Kiên", "Xã Trung Nguyên", "Xã Văn Tiến", "Xã Yên Đồng", "Xã Yên Phương"],
  // Thêm dữ liệu cho Bà Rịa - Vũng Tàu
  "Thành phố Bà Rịa": ["Phường Phước Hưng", "Phường Long Hương", "Phường Long Toàn", "Phường Kim Dinh", "Phường Long Tâm", "Phường Phước Hiệp", "Phường Long Phước", "Phường Hòa Long", "Xã Long Hòa", "Xã Tân Hưng", "Xã Long Tân", "Xã Phước Tân"],
  "Thành phố Vũng Tàu": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường Thắng Nhất", "Phường Thắng Nhì", "Phường Thắng Tam", "Phường Rạch Dừa", "Phường Nguyễn An Ninh"],
  "Thị xã Phú Mỹ": ["Phường Mỹ Xuân", "Phường Phú Mỹ", "Phường Tân Phước", "Phường Hắc Dịch", "Phường Châu Pha", "Phường Tóc Tiên", "Xã Sông Xoài", "Xã Tân Hải", "Xã Tân Hòa"],
  "Huyện Châu Đức": ["Thị trấn Ngãi Giao", "Xã Bình Ba", "Xã Bình Giã", "Xã Bình Trung", "Xã Cù Bị", "Xã Đá Bạc", "Xã Kim Long", "Xã Láng Lớn", "Xã Nghĩa Thành", "Xã Quảng Thành", "Xã Sơn Bình", "Xã Suối Nghệ", "Xã Suối Rao", "Xã Xà Bang"],
  "Huyện Đất Đỏ": ["Thị trấn Đất Đỏ", "Xã Láng Dài", "Xã Lộc An", "Xã Long Mỹ", "Xã Phước Hội", "Xã Phước Long Thọ", "Xã Suối Đá"],
  "Huyện Long Điền": ["Thị trấn Long Điền", "Thị trấn Long Hải", "Xã An Ngãi", "Xã An Nhứt", "Xã Phước Hưng", "Xã Phước Tỉnh", "Xã Tam Phước"],
  "Huyện Tân Thành": ["Thị trấn Phú Mỹ", "Xã Châu Pha", "Xã Hắc Dịch", "Xã Mỹ Xuân", "Xã Phước Hòa", "Xã Sông Xoài", "Xã Tân Hải", "Xã Tân Hòa", "Xã Tân Phước", "Xã Tóc Tiên"],
  "Huyện Xuyên Mộc": ["Thị trấn Phước Bửu", "Xã Bông Trang", "Xã Bưng Riềng", "Xã Hòa Bình", "Xã Hòa Hưng", "Xã Hòa Hiệp", "Xã Phước Tân", "Xã Phước Thuận", "Xã Tân Lâm", "Xã Xuyên Mộc"],
  // Thêm dữ liệu mẫu cho các huyện phổ biến (có thể mở rộng)
  "Huyện Bảo Lạc": ["Xã Bảo Lạc", "Xã Cốc Pàng", "Xã Thượng Hà", "Xã Cô Ba", "Xã Bảo Toàn", "Xã Khánh Xuân", "Xã Xuân Trường", "Xã Hồng Trị", "Xã Kim Cúc", "Xã Phan Thanh", "Xã Hưng Đạo", "Xã Sơn Lộ", "Xã Minh Tâm", "Xã Phục Hòa", "Xã Hưng Thịnh"],
  "Huyện Bảo Lâm": ["Xã Bảo Lâm", "Xã Lý Bôn", "Xã Bằng Lũng", "Xã Đức Vân", "Xã Thượng Quan", "Xã Hiệp Lực", "Xã Thuần Mang", "Xã Thượng Ân", "Xã Hữu Vinh", "Xã Quảng Bạch", "Xã Mông Ân", "Xã Thượng Giáo", "Xã Đồng Lạc", "Xã Cốc Mỳ", "Xã Thượng Tân"],
  "Thành phố Cao Bằng": ["Phường Sông Bằng", "Phường Sông Hiến", "Phường Tân Giang", "Phường Ngọc Xuân", "Phường Đề Thám", "Phường Hoà Chung", "Phường Duyệt Trung", "Xã Hưng Đạo", "Xã Chu Trinh", "Xã Vĩnh Quang"]
};

// Đường/Phố phổ biến (có thể mở rộng)
export const VIETNAM_STREETS: Record<string, string[]> = {
  "Quận Ba Đình": [
    "Đường Hoàng Diệu", "Đường Điện Biên Phủ", "Đường Nguyễn Trãi", "Đường Láng Hạ", "Đường Giảng Võ",
    "Đường Kim Mã", "Đường Liễu Giai", "Đường Ngọc Hà", "Đường Đội Cấn", "Đường Thành Công"
  ],
  "Quận Hoàn Kiếm": [
    "Phố Hàng Bạc", "Phố Hàng Đào", "Phố Hàng Gai", "Phố Hàng Mã", "Phố Hàng Buồm",
    "Phố Hàng Bồ", "Phố Hàng Trống", "Phố Hàng Bài", "Phố Tràng Tiền", "Phố Lý Thái Tổ"
  ],
  "Quận Tây Hồ": [
    "Đường Thụy Khuê", "Đường Âu Cơ", "Đường Xuân La", "Đường Nhật Tân", "Đường Tứ Liên",
    "Đường Quảng An", "Đường Yên Phụ", "Đường Bưởi", "Đường Phú Thượng"
  ],
  "Quận Long Biên": [
    "Đường Nguyễn Văn Cừ", "Đường Ngọc Lâm", "Đường Ngọc Thụy", "Đường Sài Đồng", "Đường Bồ Đề",
    "Đường Việt Hưng", "Đường Gia Thụy", "Đường Phúc Lợi", "Đường Đức Giang"
  ],
  "Quận Cầu Giấy": [
    "Đường Trần Duy Hưng", "Đường Hoàng Quốc Việt", "Đường Phạm Văn Đồng", "Đường Dịch Vọng",
    "Đường Nghĩa Tân", "Đường Mai Dịch", "Đường Quan Hoa", "Đường Yên Hòa"
  ],
  "Quận Đống Đa": [
    "Đường Láng", "Đường Khâm Thiên", "Đường Tây Sơn", "Đường Nguyễn Chí Thanh", "Đường Láng Hạ",
    "Đường Thái Hà", "Đường Phạm Ngọc Thạch", "Đường Trường Chinh", "Đường Giải Phóng"
  ],
  "Quận Hai Bà Trưng": [
    "Đường Bạch Mai", "Đường Minh Khai", "Đường Trương Định", "Đường Lê Đại Hành", "Đường Phố Huế",
    "Đường Đại Cồ Việt", "Đường Bùi Thị Xuân", "Đường Nguyễn Du", "Đường Vĩnh Tuy"
  ],
  "Quận Hoàng Mai": [
    "Đường Giải Phóng", "Đường Tam Trinh", "Đường Minh Khai", "Đường Định Công", "Đường Hoàng Liệt",
    "Đường Tân Mai", "Đường Đại Kim", "Đường Lĩnh Nam"
  ],
  "Quận Thanh Xuân": [
    "Đường Nguyễn Trãi", "Đường Lê Văn Lương", "Đường Khuất Duy Tiến", "Đường Nguyễn Xiển",
    "Đường Khương Đình", "Đường Phương Canh", "Đường Thanh Xuân"
  ],
  "Quận Hà Đông": [
    "Đường Quang Trung", "Đường Nguyễn Trãi", "Đường La Khê", "Đường Phú Lương", "Đường Dương Nội",
    "Đường Kiến Hưng", "Đường Phú Lãm", "Đường Vạn Phúc"
  ],
  // Thêm dữ liệu mẫu đường/phố cho các quận/huyện phổ biến khác
  "Quận Nam Từ Liêm": ["Đường Phạm Hùng", "Đường Mỹ Đình", "Đường Cầu Diễn", "Đường Xuân Phương", "Đường Phương Canh", "Đường Mễ Trì", "Đường Đại Mỗ", "Đường Tây Mỗ"],
  "Quận Bắc Từ Liêm": ["Đường Cổ Nhuế", "Đường Xuân Đỉnh", "Đường Xuân Tảo", "Đường Liên Mạc", "Đường Đông Ngạc", "Đường Thụy Phương", "Đường Minh Khai"],
  "Quận 1": ["Đường Nguyễn Huệ", "Đường Lê Lợi", "Đường Đồng Khởi", "Đường Pasteur", "Đường Nguyễn Du", "Đường Lý Tự Trọng", "Đường Điện Biên Phủ", "Đường Hai Bà Trưng"],
  "Quận 2": ["Đường Nguyễn Duy Trinh", "Đường Nguyễn Thị Định", "Đường Mai Chí Thọ", "Đường Nguyễn Văn Hưởng", "Đường Lương Định Của", "Đường Đỗ Xuân Hợp"],
  "Quận 3": ["Đường Võ Thị Sáu", "Đường Lý Chính Thắng", "Đường Nguyễn Đình Chiểu", "Đường Cách Mạng Tháng 8", "Đường Lê Văn Sỹ", "Đường Nguyễn Thị Minh Khai"],
  "Quận 4": ["Đường Khánh Hội", "Đường Hoàng Diệu", "Đường Nguyễn Tất Thành", "Đường Võ Văn Tần", "Đường Nguyễn Khoái"],
  "Quận 5": ["Đường Nguyễn Trãi", "Đường Hải Thượng Lãn Ông", "Đường Trần Hưng Đạo", "Đường Châu Văn Liêm", "Đường An Dương Vương"],
  "Quận 6": ["Đường Hậu Giang", "Đường Lê Quang Sung", "Đường Phạm Đình Hổ", "Đường Nguyễn Văn Luông", "Đường Tân Hương"],
  "Quận 7": ["Đường Nguyễn Thị Thập", "Đường Huỳnh Tấn Phát", "Đường Nguyễn Văn Linh", "Đường Lê Văn Lương", "Đường Tôn Dật Tiên"],
  "Quận 8": ["Đường Dương Bá Trạc", "Đường Tạ Quang Bửu", "Đường Bùi Minh Trực", "Đường Phạm Thế Hiển", "Đường Nguyễn Văn Cừ"],
  "Quận 9": ["Đường Nguyễn Xiển", "Đường Đỗ Xuân Hợp", "Đường Lê Văn Việt", "Đường Đỗ Phúc Thịnh", "Đường Nguyễn Văn Tăng"],
  "Quận 10": ["Đường 3 Tháng 2", "Đường Lý Thái Tổ", "Đường Nguyễn Chí Thanh", "Đường Lê Hồng Phong", "Đường Ngô Gia Tự"],
  "Quận 11": ["Đường Lạc Long Quân", "Đường Nguyễn Oanh", "Đường Lê Đức Thọ", "Đường Tân Hương", "Đường Nguyễn Thị Nhỏ"],
  "Quận 12": ["Đường Nguyễn Ảnh Thủ", "Đường Tân Thới Nhất", "Đường Trường Chinh", "Đường Nguyễn Văn Quá", "Đường Đỗ Văn Dậy"],
  "Bình Thạnh": ["Đường Xô Viết Nghệ Tĩnh", "Đường Điện Biên Phủ", "Đường Bạch Đằng", "Đường Nguyễn Xí", "Đường Ung Văn Khiêm"],
  "Phú Nhuận": ["Đường Phan Xích Long", "Đường Hoàng Văn Thụ", "Đường Nguyễn Văn Trỗi", "Đường Phan Đình Phùng", "Đường Nguyễn Đình Chiểu"],
  "Tân Bình": ["Đường Cộng Hòa", "Đường Hoàng Văn Thụ", "Đường Trường Chinh", "Đường Lý Thường Kiệt", "Đường Nguyễn Văn Cừ"],
  "Tân Phú": ["Đường Tân Hương", "Đường Tân Sơn Nhì", "Đường Lũy Bán Bích", "Đường Tây Thạnh", "Đường Hòa Bình"],
  "Gò Vấp": ["Đường Quang Trung", "Đường Nguyễn Oanh", "Đường Phạm Văn Chiêu", "Đường Lê Đức Thọ", "Đường Nguyễn Văn Nghi"],
  "Bình Tân": ["Đường Tân Hương", "Đường Bình Long", "Đường Tân Tạo", "Đường Lê Trọng Tấn", "Đường Hương Lộ 2"],
  "Thủ Đức": ["Đường Võ Văn Ngân", "Đường Nguyễn Duy Trinh", "Đường Võ Chí Công", "Đường Lê Văn Việt", "Đường Hoàng Diệu 2"],
  // Thêm dữ liệu mẫu đường/phố cho Vĩnh Phúc
  "Huyện Tam Đảo": ["Đường Tam Đảo", "Đường Bồ Lý", "Đường Đại Đình", "Đường Đạo Trù", "Đường Hồ Sơn", "Đường Hợp Châu", "Đường Minh Quang", "Đường Tam Quan", "Đường Yên Dương"],
  "Thành phố Vĩnh Yên": ["Đường Ngô Quyền", "Đường Tích Sơn", "Đường Đồng Tâm", "Đường Hội Hợp", "Đường Khai Quang", "Đường Liên Bảo", "Đường Định Trung"],
  "Thành phố Phúc Yên": ["Đường Hùng Vương", "Đường Phúc Thắng", "Đường Trưng Nhị", "Đường Trưng Trắc", "Đường Xuân Hòa", "Đường Cao Minh", "Đường Nam Viêm"],
  "Huyện Bình Xuyên": ["Đường Gia Khánh", "Đường Hương Canh", "Đường Bá Hiến", "Đường Đạo Đức", "Đường Hương Sơn", "Đường Phú Xuân", "Đường Quất Lưu"],
  "Huyện Lập Thạch": ["Đường Lập Thạch", "Đường Bắc Bình", "Đường Bàn Giản", "Đường Đình Chu", "Đường Đồng Ích", "Đường Hợp Lý", "Đường Liên Hòa"],
  "Huyện Sông Lô": ["Đường Bạch Lưu", "Đường Cao Phong", "Đường Đôn Nhân", "Đường Đồng Quế", "Đường Đồng Thịnh", "Đường Đức Bác", "Đường Hải Lựu"],
  "Huyện Tam Dương": ["Đường Hợp Hòa", "Đường An Hòa", "Đường Đạo Tú", "Đường Đồng Tĩnh", "Đường Duy Phiên", "Đường Hoàng Đan", "Đường Hoàng Hoa"],
  "Huyện Vĩnh Tường": ["Đường Vĩnh Tường", "Đường Thổ Tang", "Đường An Tường", "Đường Bình Dương", "Đường Bồ Sao", "Đường Cao Đại", "Đường Chấn Hưng"],
  "Huyện Yên Lạc": ["Đường Yên Lạc", "Đường Bình Định", "Đường Đại Tự", "Đường Đồng Cương", "Đường Đồng Văn", "Đường Hồng Châu", "Đường Hồng Phương"],
  // Thêm dữ liệu đường/phố cho Bà Rịa - Vũng Tàu
  "Thành phố Bà Rịa": ["Đường 27 Tháng 4", "Đường Cách Mạng Tháng 8", "Đường Nguyễn Hữu Thọ", "Đường Trương Công Định", "Đường Lê Lợi", "Đường Nguyễn Du", "Đường Phạm Văn Đồng", "Đường Trần Hưng Đạo"],
  "Thành phố Vũng Tàu": ["Đường Trần Phú", "Đường Lê Lợi", "Đường Quang Trung", "Đường Thùy Vân", "Đường Bãi Sau", "Đường Bãi Trước", "Đường Hạ Long", "Đường Trần Hưng Đạo", "Đường Nguyễn Thái Học"],
  "Thị xã Phú Mỹ": ["Đường Quốc Lộ 51", "Đường Phú Mỹ", "Đường Mỹ Xuân", "Đường Tân Phước", "Đường Hắc Dịch", "Đường Châu Pha"],
  "Huyện Châu Đức": ["Đường Ngãi Giao", "Đường Bình Ba", "Đường Bình Giã", "Đường Bình Trung", "Đường Cù Bị", "Đường Đá Bạc"],
  "Huyện Đất Đỏ": ["Đường Đất Đỏ", "Đường Láng Dài", "Đường Lộc An", "Đường Long Mỹ", "Đường Phước Hội"],
  "Huyện Long Điền": ["Đường Long Điền", "Đường Long Hải", "Đường An Ngãi", "Đường An Nhứt", "Đường Phước Hưng"],
  "Huyện Tân Thành": ["Đường Phú Mỹ", "Đường Châu Pha", "Đường Hắc Dịch", "Đường Mỹ Xuân", "Đường Phước Hòa"],
  "Huyện Xuyên Mộc": ["Đường Phước Bửu", "Đường Bông Trang", "Đường Bưng Riềng", "Đường Hòa Bình", "Đường Hòa Hưng"],
  // Thêm dữ liệu mẫu đường/phố cho các huyện phổ biến
  "Huyện Bảo Lạc": ["Đường Trung Tâm", "Đường Quốc Lộ 4", "Đường Sông Bằng", "Đường Thị Trấn", "Đường Cốc Pàng", "Đường Thượng Hà", "Đường Cô Ba", "Đường Bảo Toàn"],
  "Huyện Bảo Lâm": ["Đường Trung Tâm", "Đường Quốc Lộ 3", "Đường Lý Bôn", "Đường Bằng Lũng", "Đường Đức Vân", "Đường Thượng Quan", "Đường Hiệp Lực"],
  "Thành phố Cao Bằng": ["Đường Hoàng Văn Thụ", "Đường Kim Đồng", "Đường Bế Văn Đàn", "Đường Trần Hưng Đạo", "Đường Lê Lợi", "Đường Nguyễn Du", "Đường Phan Đình Phùng", "Đường Lý Tự Trọng"]
};

