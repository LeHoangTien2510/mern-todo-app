# === STAGE 1: Build source code thành file tĩnh ===
FROM node:18-alpine AS build-stage
WORKDIR /app

# Sao chép package.json để cài đặt thư viện
COPY package*.json ./
RUN npm install

# Sao chép toàn bộ source code và thực hiện build
COPY . .
RUN npm run build

# === STAGE 2: Chạy ứng dụng bằng Nginx siêu nhẹ ===
FROM nginx:1.25-alpine

# Copy các file tĩnh đã build từ STAGE 1 sang thư mục gốc của Nginx
# Lưu ý: Thay "build" thành "dist" nếu dự án của bạn dùng Vite thay vì Create React App
COPY --from=build-stage /app/build /usr/share/nginx/html

# Expose port 80 (Port mặc định của Nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]