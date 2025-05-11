const URLS = {
  // Property
  property: "/properties",

  // Category
  categories: "/category",

  // File
  file_upload: "/files/upload",

  // Search Filter
  search_filter_recent: "/search-filters/recent",
  search_filter_all: "/search-filters",

  // Auth
  auth_me: "/auth/me",
  auth_send_otp: "/auth/send-otp",
  auth_verify_otp: "/auth/verify-otp",
  auth_create_password: "/auth/create-password",
  auth_login: "/auth/login",

  // Products
  products: "/products",
  product_create: "/products",
  product_liked_by_user: "/products/liked",
  product_filter: "/products/filter",
  product_detail: "/products/by-id",

  // Profiles
  profile_create: "/profiles",
  profiles: "/profiles",
  profile_me: "/profiles/me",
  profile_me_update: "/profiles/me",
  profile_me_delete: "/profiles/me",

  // Comments
  comments: "/comments",
  comment_create: "/comments",

  // Likes
  like: "/likes/like", // agar umumiy like endpoint bo‘lsa

  // Location
  location_region_create: "/location/region",
  location_district_create: "/location/district",
  location_regions: "/location/regions",
  location_districts_by_region: "/location/districts", // regionId paramsiz
};

export default URLS;
