# Nginx asosida qurilish
FROM nginx:alpine

# Build natijalarini Nginx'ga ko'chirish
COPY dist /usr/share/nginx/html

# Nginx portini ochish
EXPOSE 80

# Nginx serverini ishga tushirish
CMD ["nginx", "-g", "daemon off;"]