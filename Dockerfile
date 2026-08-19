# Sử dụng Node.js phiên bản 20 nhẹ (alpine) làm base image
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Chỉ copy package.json và package-lock.json trước để tận dụng cache của Docker
COPY package*.json ./

# Cài đặt các thư viện (dependencies)
RUN npm install

# Copy toàn bộ mã nguồn còn lại vào container
COPY . .

# Mở cổng 3100 (cổng ứng dụng chạy trong file .env của bạn)
EXPOSE 3100

# Lệnh khởi chạy ứng dụng khi container bắt đầu chạy
CMD ["npm", "start"]
