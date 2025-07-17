FROM node:18

# Cài Python + pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install --upgrade pip

# Tạo thư mục làm việc
WORKDIR /app

# Copy toàn bộ mã nguồn vào Docker container
COPY . .

# Cài thư viện Python
RUN pip3 install -r requirements.txt

# Cài Node.js packages
RUN npm install

# Mở port
EXPOSE 3000

# Khởi chạy app (tuỳ bạn dùng gì: server.js hoặc index.js)
CMD ["npm", "start"]
