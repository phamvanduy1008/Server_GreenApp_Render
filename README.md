
# 🌱 PlantServer

Đây là một server **Node.js** tích hợp **MongoDB** để quản lý dữ liệu và hỗ trợ dự đoán bệnh cây trồng thông qua mô hình **AI**. Dự án sử dụng **Python** để xử lý AI (thông qua `predict.py`) và cung cấp cơ chế seeding dữ liệu vào **MongoDB** bằng file `seed.js`.

---

## 🚀 Bắt đầu

### 1. Cài đặt dependencies

Cài đặt các thư viện **Node.js**:

```bash
npm install
```

Đảm bảo đã cài **Python** (cho `predict.py`) và các thư viện **Python** cần thiết (nếu có). Ví dụ:

```bash
pip install -r requirements.txt
```

(Lưu ý: Tạo file `requirements.txt` nếu cần thiết cho Python).

### 2. Cấu hình môi trường

Tạo file `.env` (nếu chưa có) và thêm các biến môi trường, ví dụ:

```env
MONGODB_URI=mongodb://localhost:27017/plant_disease_db
PORT=3000
```

Cấu hình kết nối **MongoDB** trong `configs.js` nếu cần.

### 3. Chạy dự án

#### Bước 1: Khởi động MongoDB

Đảm bảo MongoDB đang chạy trên máy của bạn. Nếu chưa cài, tải và cài đặt từ **MongoDB**. Chạy MongoDB với lệnh:

```bash
mongod
```

Kiểm tra kết nối MongoDB bằng `MONGODB_URI` đã định nghĩa trong `.env`.

#### Bước 2: Khởi động server

Có hai tùy chọn để chạy server:

**Chạy trực tiếp**:

```bash
node index.js
```

**Chạy với nodemon** (dành cho phát triển, tự động reload khi có thay đổi):

Cài **nodemon** nếu chưa có:

```bash
npm install -g nodemon
```

Sau đó chạy:

```bash
nodemon index.js
```

Server sẽ chạy trên `http://localhost:3000` (hoặc cổng được định nghĩa trong `.env`).

#### Bước 3: Kiểm tra server

Mở trình duyệt hoặc dùng công cụ như **Postman** để kiểm tra API tại `http://localhost:3000`. Đảm bảo server phản hồi đúng.

---

## 🌱 Seeding dữ liệu

Dự án có file `seed.js` để thêm dữ liệu mẫu vào **MongoDB**. Để chạy seeding:

```bash
node seed.js
```

Đảm bảo **MongoDB** đang chạy trước khi thực hiện lệnh này.

---

## 🗂 Cấu trúc thư mục

```plaintext
SERVER/
├── AI/                     # Mô hình AI và script Python
│   ├── plant-disease-model... # Mô hình dự đoán bệnh cây trồng
│   └── predict.py          # Script Python xử lý dự đoán
├── images/                 # Lưu trữ hình ảnh (nếu có)
├── node_modules/           # Thư viện Node.js
├── configs.js              # Cấu hình (MongoDB, port,...)
├── index.js                # File chính khởi động server
├── package-lock.json       # Khóa phiên bản dependencies
├── package.json            # Dependencies và scripts
├── schema.js               # Định nghĩa schema MongoDB
└── seed.js                 # Script seeding dữ liệu
```

---

## 🧱 Công nghệ sử dụng

- **Node.js**: Xây dựng server.
- **MongoDB**: Cơ sở dữ liệu.
- **Python**: Xử lý AI (`predict.py`).
- **JavaScript**: Logic chính của server.

---

## 📝 Ghi chú

- Đảm bảo đã cài **Node.js** và **MongoDB**.
- Cài **Python** và các thư viện cần thiết (nếu `predict.py` yêu cầu).
- Kiểm tra kết nối **MongoDB** trước khi chạy server hoặc seeding.

---

## ✍️ Tác giả

- Nhóm: Green
- Email: [phamvanduy.dev@gmail.com](mailto:phamvanduy.dev@gmail.com)
- GitHub: [GreenTreeApp](https://github.com/GreenTreeApp)

Cảm ơn bạn đã sử dụng dự án! 🌟
