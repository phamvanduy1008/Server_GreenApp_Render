import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import crypto from 'crypto';
import config from './config.js';
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import { exec } from 'child_process';


import {
  User,
  Admin,
  Category,
  Infor,
  Plant,
  Product,
  Seller,
  UserCart,
  Favourite,
  Message,
  Notice,
  Shipper,
  Review,
} from "./schema.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));

const storage = multer.memoryStorage(); 



// Tạo thư mục images/profile nếu chưa tồn tại
const profileDir = "images/profile";
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

// Tạo thư mục images/product nếu chưa tồn tại
const productDir = "images/product";
if (!fs.existsSync(productDir)) {
  fs.mkdirSync(productDir, { recursive: true });
}


const io = new Server(httpServer, {
  cors: {
    origin: "*", // Cập nhật origin khi triển khai thực tế
    methods: ["GET", "POST"],
  },
});


// Cấu hình multer để lưu ảnh vào thư mục images/profile
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/profile/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname || ""));
  },
});

// Cấu hình multer để lưu ảnh sản phẩm vào thư mục images/product
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/product/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname || ""));
  },
});

const predictStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const predictDir = 'images/predict';
    if (!fs.existsSync(predictDir)) {
      fs.mkdirSync(predictDir, { recursive: true });
    }
    cb(null, predictDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname || ''));
  },
});


const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: (req, file, cb) => {
    if (!file || !file.originalname) {
      return cb(null, true); // Cho phép bỏ qua nếu không có file
    }
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname.toLowerCase())
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ file ảnh định dạng JPEG, JPG hoặc PNG!"));
    }
  },
});

const uploadProduct = multer({
  storage: productStorage,
  fileFilter: (req, file, cb) => {
    if (!file || !file.originalname) {
      return cb(null, true); // Cho phép bỏ qua nếu không có file
    }
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname.toLowerCase())
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ file ảnh định dạng JPEG, JPG hoặc PNG!"));
    }
  },
});

const uploadPredict = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log('🔍 File nhận được:', file);
    if (!file || !file.originalname) return cb(null, false);
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error('Sai định dạng ảnh'));
  },
}).single('image');


// Kết nối MongoDB
const mongoURI = "mongodb+srv://phamvanduydev:htS20FO4VPfsgmpv@cluster0.ujkwflo.mongodb.net/greentree_app?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI);

mongoose.connection.on("connected", () => {
  console.log("Kết nối MongoDB thành công!");
});
mongoose.connection.on("error", (err) => {
  console.error("Lỗi kết nối MongoDB: ", err);
});

// Hàm lưu tin nhắn vào MongoDB
async function saveMessage(userId, message) {
  try {
    const newMessage = new Message({
      userId,
      sender: message.sender,
      receiver: message.receiver,
      content: message.content,
      timestamp: new Date(),
    });
    await newMessage.save();
  } catch (err) {
    console.error(`Lỗi khi lưu tin nhắn cho user ${userId}:`, err);
  }
}

// Hàm lấy tin nhắn từ MongoDB
async function getMessages(userId, adminId) {
  try {
    const messages = await Message.find({
      userId,
      $or: [
        { sender: `user:${userId}`, receiver: `admin:${adminId}` },
        { sender: `admin:${adminId}`, receiver: `user:${userId}` },
      ],
    })
      .sort({ timestamp: 1 })
      .lean();
    return messages.map(({ sender, content, timestamp }) => ({
      sender,
      content,
      timestamp: timestamp.toISOString(),
    }));
  } catch (err) {
    console.error(
      `Lỗi khi đọc tin nhắn cho user ${userId} và admin ${adminId}:`,
      err
    );
    return [];
  }
}

// Xử lý WebSocket cho chat
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("register", async ({ userId, role }) => {
    try {
      if (role === "user" && !mongoose.Types.ObjectId.isValid(userId)) {
        socket.emit("error", { message: "ID người dùng không hợp lệ" });
        return;
      }

      let admins = [];
      if (role === "user") {
        const user = await User.findById(userId);
        if (!user) {
          socket.emit("error", { message: "Người dùng không tồn tại" });
          return;
        }
        admins = await Admin.find().select("_id email name");
        socket.emit("loadAdmins", admins);
      }

      socket.join(role === "user" ? `user:${userId}` : "admin");
      socket.userId = userId;
      socket.role = role;

      if (role === "user" && admins.length > 0) {
        const messages = await getMessages(userId, admins[0]._id);
        socket.emit("loadMessages", messages);
      }
    } catch (err) {
      console.error("Lỗi khi đăng ký client:", err);
      socket.emit("error", { message: "Lỗi server khi đăng ký" });
    }
  });

  socket.on("sendMessage", async ({ userId, sender, receiver, content }) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        socket.emit("error", { message: "ID người dùng không hợp lệ" });
        return;
      }

      if (!/^(user|admin):[0-9a-fA-F]{24}$/.test(receiver)) {
        socket.emit("error", { message: "Receiver không hợp lệ" });
        return;
      }

      const message = {
        sender,
        receiver,
        content,
        timestamp: new Date().toISOString(),
      };
      await saveMessage(userId, message);

      const user = await User.findById(userId).select(
        "email profile.full_name"
      );
      const userInfo = {
        userId,
        email: user.email,
        full_name: user.profile?.full_name || "",
      };

      io.to(`user:${userId}`).emit("receiveMessage", {
        user: userInfo,
        ...message,
      });
      const [receiverType, receiverId] = receiver.split(":");
      if (receiverType === "admin") {
        io.to(`admin:${receiverId}`).emit("receiveMessage", {
          user: userInfo,
          ...message,
        });
      }
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err);
      socket.emit("error", { message: "Lỗi server khi gửi tin nhắn" });
    }
  });

  socket.on("selectAdmin", async ({ userId, adminId }) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(adminId)
      ) {
        socket.emit("error", {
          message: "ID người dùng hoặc admin không hợp lệ",
        });
        return;
      }

      const messages = await getMessages(userId, adminId);
      socket.emit("loadMessages", messages);
    } catch (err) {
      console.error("Lỗi khi chọn admin:", err);
      socket.emit("error", { message: "Lỗi server khi chọn admin" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('✅ Server đã deploy thành công trên Render!');
});


// Endpoint để thêm sản phẩm mới
app.post("/api/products", uploadProduct.single("image"), async (req, res) => {
  const { name, price, info, status, sold, category } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin bắt buộc (name, price, category)",
    });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res
        .status(400)
        .json({ success: false, message: "ID danh mục không hợp lệ" });
    }

    const newProduct = new Product({
      name,
      price: parseFloat(price),
      info: info || "",
      image: req.file ? `images/product/${req.file.filename}` : "",
      status: status || "available",
      sold: parseInt(sold) || 0,
      category,
    });

    const result = await newProduct.save();
    res.status(201).json({
      success: true,
      product: result,
      message: "Thêm sản phẩm thành công",
    });
  } catch (err) {
    console.error("Lỗi khi thêm sản phẩm:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi thêm sản phẩm" });
  }
});

// Endpoint để cập nhật sản phẩm
app.put(
  "/api/products/:id",
  uploadProduct.single("image"),
  async (req, res) => {
    const { id } = req.params;
    const { name, price, info, status, sold, category } = req.body;

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ success: false, message: "ID sản phẩm không hợp lệ" });
      }

      const product = await Product.findById(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy sản phẩm" });
      }

      product.name = name || product.name;
      product.price = price ? parseFloat(price) : product.price;
      product.info = info || product.info;
      product.status = status || product.status;
      product.sold = sold ? parseInt(sold) : product.sold;
      product.category = category || product.category;
      if (req.file) {
        // Xóa ảnh cũ nếu có
        if (product.image) {
          const oldImagePath = path.join(__dirname, product.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        product.image = `images/product/${req.file.filename}`;
      }

      const updatedProduct = await product.save();
      res.json({
        success: true,
        product: updatedProduct,
        message: "Cập nhật sản phẩm thành công",
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật sản phẩm:", err);
      res
        .status(500)
        .json({ success: false, message: "Lỗi server khi cập nhật sản phẩm" });
    }
  }
);

// Endpoint để xóa sản phẩm
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    // Xóa ảnh nếu có
    if (product.image) {
      const imagePath = path.join(__dirname, product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: "Xóa sản phẩm thành công" });
  } catch (err) {
    console.error("Lỗi khi xóa sản phẩm:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi xóa sản phẩm" });
  }
});

// Endpoint đăng nhập admin
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu email hoặc mật khẩu!" });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Sai email hoặc mật khẩu!" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Sai email hoặc mật khẩu!" });
    }

    res.json({
      success: true,
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Lỗi server khi đăng nhập admin:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

app.post("/get-user-info", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint lấy danh sách cuộc trò chuyện của admin
app.get("/api/conversations/:adminId", async (req, res) => {
  const { adminId } = req.params;

  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: `admin:${adminId}` },
            { receiver: `admin:${adminId}` },
          ],
        },
      },
      {
        $group: {
          _id: "$userId",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          userId: "$_id",
          email: "$user.email",
          full_name: "$user.profile.full_name",
        },
      },
    ]);

    console.log("Conversations:", conversations);
    res.json({ success: true, conversations });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách cuộc trò chuyện:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách cuộc trò chuyện",
    });
  }
});

// Endpoint lấy lịch sử tin nhắn giữa admin và user
app.get("/api/messages/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      userId,
      $or: [
        { sender: `user:${userId}`, receiver: { $regex: "^admin:" } },
        { sender: { $regex: "^admin:" }, receiver: `user:${userId}` },
      ],
    })
      .sort({ timestamp: 1 })
      .lean();

    const formattedMessages = messages.map(
      ({ sender, content, timestamp }) => ({
        sender,
        content,
        timestamp: timestamp.toISOString(),
      })
    );

    console.log("Messages for user:", formattedMessages);
    res.json({ success: true, messages: formattedMessages });
  } catch (err) {
    console.error(`Lỗi khi đọc tin nhắn cho user ${userId}:`, err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy tin nhắn",
    });
  }
});

app.get("/api/recent-messages/:adminId", async (req, res) => {
  const { adminId } = req.params;

  try {
    const recentMessages = await Message.aggregate([
      {
        $match: {
          receiver: `admin:${adminId}`,
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: "$userId",
          message: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: {
            userId: "$_id",
            email: "$user.email",
            full_name: "$user.profile.full_name",
          },
          message: {
            sender: "$message.sender",
            content: "$message.content",
            timestamp: "$message.timestamp",
          },
        },
      },
      {
        $limit: 10,
      },
    ]);

    console.log("Recent Messages:", recentMessages);
    res.json({ success: true, recentMessages });
  } catch (err) {
    console.error("Lỗi khi lấy tin nhắn gần đây:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy tin nhắn gần đây",
    });
  }
});

// Endpoint lấy danh sách người dùng
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().select("_id email profile");
    res.json({ success: true, users });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách người dùng:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách người dùng",
    });
  }
});

// Endpoint để cập nhật giá cây trồng
app.put("/api/plants/:id", async (req, res) => {
  const { id } = req.params;
  const { avgPriceNow } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID cây trồng không hợp lệ" });
    }

    const plant = await Plant.findById(id);
    if (!plant) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy cây trồng" });
    }

    // Lấy giá trị cũ của avgPriceNow và gán vào avgPriceYesterday
    plant.avgPriceYesterday = plant.avgPriceNow;
    // Cập nhật avgPriceNow bằng giá trị mới từ client
    plant.avgPriceNow = avgPriceNow;

    const updatedPlant = await plant.save();
    res.json({
      success: true,
      plant: updatedPlant,
      message: "Cập nhật giá thành công",
    });
  } catch (err) {
    console.error("Lỗi khi cập nhật giá cây trồng:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi cập nhật giá" });
  }
});

// Endpoint lấy danh sách cây trồng với populate category
app.get("/api/plants", async (req, res) => {
  try {
    const plants = await Plant.find().populate("category");
    res.json(plants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Các endpoint hiện có (giữ nguyên)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu email hoặc mật khẩu!" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Sai email hoặc mật khẩu!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Sai email hoặc mật khẩu!" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        onboarding_completed : user.onboarding_completed,
        profile: user.profile,
      },
    });
  } catch (err) {
    console.error("Lỗi server khi đăng nhập:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu email hoặc mật khẩu!" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email đã được sử dụng!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      profile: {
        full_name: "",
        username: "",
        gender: "",
      },
    });

    const result = await newUser.save();
    res.status(201).json({ success: true, userId: result._id });
  } catch (err) {
    console.error("Lỗi khi đăng ký:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi đăng ký!" });
  }
});

app.post("/change-password", async (req, res) => {
  const { user_id, currentPassword, newPassword } = req.body;

  try {
    if (!user_id || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/update-infor", async (req, res) => {
  try {
    const { email, full_name, username, gender } = req.body;

    if (!email || !full_name || !username || !gender) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const DEFAULT_PASSWORD = "user123";
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(DEFAULT_PASSWORD, salt);

      user = new User({
        email,
        password: hashed,
        profile: { full_name, username, gender },
      });

      await user.save();
      return res.status(201).json({ message: "Tạo user mới thành công", user });
    }

    user.onboarding_completed = 1;
    user.profile.full_name = full_name;
    user.profile.username = username;
    user.profile.gender = gender;

    await user.save();
    return res.json({ message: "Cập nhật thông tin thành công", user });
  } catch (err) {
    console.error("Lỗi /update-infor:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/infor-plants", async (req, res) => {
  try {
    const inforPlants = await Infor.find().populate("plant");
    res.json(inforPlants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID sản phẩm không hợp lệ" });
  }
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }
    res.json(product);
  } catch (err) {
    console.error("Lỗi khi lấy sản phẩm:", err.message, err.stack);
    res.status(500).json({ error: "Lỗi server", details: err.message });
  }
});

app.get("/api/infor-plants/:plantId", async (req, res) => {
  const { plantId } = req.params;
  try {
    const inforPlant = await Infor.findOne({ plant: plantId }).populate(
      "plant"
    );
    if (!inforPlant) {
      return res.status(404).json({ error: "Infor plant not found" });
    }
    res.json(inforPlant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/categories/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "ID danh mục không hợp lệ" });
    }
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin danh mục:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

app.get("/api/products/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "ID danh mục không hợp lệ" });
    }

    const products = await Product.find({ category: categoryId });

    return res.status(200).json(products);
  } catch (error) {
    console.error("Lỗi khi tìm sản phẩm theo danh mục:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
});

app.get("/api/user-cart/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const cartItems = await UserCart.find({ user: userId }).populate("product");
    if (!cartItems) {
      return res.status(404).json({ error: "Cart not found" });
    }
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/user-cart/:cartId", async (req, res) => {
  const { cartId } = req.params;
  const { quantity } = req.body;
  try {
    const cartItem = await UserCart.findByIdAndUpdate(
      cartId,
      { quantity: quantity },
      { new: true }
    ).populate("product");
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    res.json(cartItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/user-cart/:cartId", async (req, res) => {
  const { cartId } = req.params;
  try {
    const cartItem = await UserCart.findByIdAndDelete(cartId);
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    res.json({ success: true, message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/products/search", async (req, res) => {
  const query = String(req.query.q || "").trim();
  console.log("Search query:", query);

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { info: { $regex: query, $options: "i" } },
      ],
    }).exec();
    return res.json(products);
  } catch (err) {
    console.error("Search error:", err.message, err.stack);
    return res
      .status(500)
      .json({ error: "Something went wrong", details: err.message });
  }
});

app.get("/products/suggest", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);

  const suggestions = await Product.find({ name: new RegExp(q, "i") })
    .select("name image")
    .limit(5);

  res.json(suggestions);
});

app.get("/api/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID người dùng không hợp lệ" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        profile: user.profile,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Lỗi khi lấy thông tin người dùng:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin người dùng",
    });
  }
});

app.put("/api/user/:userId/update", async (req, res) => {
  const { userId } = req.params;
  const { profile, email } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID người dùng không hợp lệ" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    user.email = email || user.email;
    user.profile.full_name = profile.full_name || user.profile.full_name;
    user.profile.bio = profile.bio || user.profile.bio;
    user.profile.gender = profile.gender || user.profile.gender;
    user.profile.birthday = profile.birthday || user.profile.birthday;
    user.profile.phone = profile.phone || user.profile.phone;

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        profile: updatedUser.profile,
      },
      message: "Cập nhật thông tin người dùng thành công",
    });
  } catch (err) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật thông tin người dùng",
    });
  }
});
app.post("/api/cart", async (req, res) => {
  const { user, product, quantity } = req.body;

  if (!user || !product || !quantity) {
    return res.status(400).json({ error: "Thiếu thông tin giỏ hàng" });
  }

  try {
    const existingCartItem = await UserCart.findOne({ user, product });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
      return res.status(200).json(existingCartItem);
    } else {
      const newCartItem = new UserCart({ user, product, quantity });
      await newCartItem.save();
      return res.status(201).json(newCartItem);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Lỗi khi thêm vào giỏ hàng" });
  }
});

app.post(
  "/api/user/:userId/upload-avatar",
  uploadProfile.single("avatar"),
  async (req, res) => {
    const { userId } = req.params;

    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res
          .status(400)
          .json({ success: false, message: "ID người dùng không hợp lệ" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy người dùng" });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Không có file ảnh được gửi lên" });
      }

      const imageName = req.file.filename;
      user.profile.avatar = imageName;
      await user.save();

      res.json({
        success: true,
        avatar: imageName,
        message: "Upload ảnh avatar thành công",
      });
    } catch (err) {
      console.error("Lỗi khi upload ảnh avatar:", err);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi upload ảnh avatar",
      });
    }
  }
);

app.post("/api/sellers", async (req, res) => {
  try {
    const {
      userId,
      items,
      name,
      address,
      phone,
      paymentMethod,
      fee,
      total_price,
    } = req.body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin userId hoặc items không hợp lệ",
      });
    }
    if (
      !name ||
      !address ||
      !phone ||
      !paymentMethod ||
      fee === undefined ||
      total_price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng điền đủ thông tin",
      });
    }

    let newOrderCode;
    let isUnique = false;
    while (!isUnique) {
      const randomNum = Math.floor(Math.random() * 1000);
      newOrderCode = `ORD${String(randomNum).padStart(3, "0")}`;
      const existingOrder = await Seller.findOne({ orderCode: newOrderCode });
      if (!existingOrder) {
        isUnique = true;
      }
    }

    const currentDate = new Date();

    const newOrder = {
      user: userId,
      products: items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      status: "pending",
      orderCode: newOrderCode,
      full_name: name,
      address: address,
      phone: phone,
      paymentMethod: paymentMethod,
      fee: fee,
      total_price: total_price,
      dateOrder: currentDate,
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    const result = await Seller.create(newOrder);

    // Cập nhật số lượng sold của các sản phẩm
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.sold = (product.sold || 0) + item.quantity;
        await product.save();
      } else {
        console.warn(`Không tìm thấy sản phẩm với ID ${item.productId}`);
      }
    }

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      order: result,
    });
  } catch (err) {
    console.error("Lỗi khi tạo đơn hàng:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo đơn hàng",
      error: err.message,
    });
  }
});

app.get("/api/seller/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Seller.find({ user: userId })
    .populate("products.product") 
    .sort({ createdAt: -1 });

    const categorized = {
      pending: [],
      resolved: [],
      processing: [],
      delivered: [],
      cancelled: [],
    };

    orders.forEach((order) => {
      const orderWithId = {
        _id: order._id,
        ...order.toObject(),
      };

      if (order.status === "pending") categorized.pending.push(orderWithId);
      else if (order.status === "resolved")
        categorized.resolved.push(orderWithId);
      else if (order.status === "processing")
        categorized.processing.push(orderWithId);
      else if (order.status === "delivered")
        categorized.delivered.push(orderWithId);
      else if (order.status === "cancelled")
        categorized.cancelled.push(orderWithId);
    });

    res.status(200).json(categorized);
  } catch (error) {
    console.error("Error fetching seller data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/seller", async (req, res) => {
  try {
    // Lấy tất cả đơn hàng và populate thông tin user và product
    const sellers = await Seller.find()
      .populate("user", "email profile") // Populate thông tin user (email, profile)
      .populate("products.product"); // Populate thông tin product

    if (!sellers || sellers.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng nào" });
    }

    res.json({ success: true, sellers });
  } catch (error) {
    console.error("Lỗi khi lấy tất cả đơn hàng:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy tất cả đơn hàng" });
  }
});

app.put("/api/seller/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID đơn hàng không hợp lệ" });
    }

    const updatedSeller = await Seller.findByIdAndUpdate(
      orderId,
      { status: status || "processing" }, // Mặc định cập nhật thành "processing"
      { new: true, runValidators: true }
    );

    if (!updatedSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({ success: true, seller: updatedSeller });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi cập nhật trạng thái" });
  }
});

app.delete("/api/seller/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID đơn hàng không hợp lệ" });
    }

    const deletedSeller = await Seller.findByIdAndDelete(orderId);

    if (!deletedSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({ success: true, message: "Đơn hàng đã được xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa đơn hàng:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi xóa đơn hàng" });
  }
});

app.patch("/api/orders/:orderId/confirm", async (req, res) => {
  const { orderId } = req.params;

  try {
    const updatedOrder = await Seller.findByIdAndUpdate(
      orderId,
      { status: "delivered" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order cancelled", order: updatedOrder });
  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/api/orders/:orderId/cancel", async (req, res) => {
  const { orderId } = req.params;

  try {
    const updatedOrder = await Seller.findByIdAndUpdate(
      orderId,
      { status: "cancelled" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order cancelled", order: updatedOrder });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/favourites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("userId", userId);

    const favourite = await Favourite.findOne({ user: userId }).populate(
      "products"
    );

    if (!favourite) {
      return res.status(200).json({ user: userId, products: [] });
    }

    res.status(200).json(favourite);
  } catch (error) {
    console.error("Error fetching favourites:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách yêu thích" });
  }
});

app.post("/api/favourites", async (req, res) => {
  try {
    const { user, product } = req.body;
    console.log("user:", user);
    console.log("product:", product);

    if (!user || !product) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin user hoặc product" });
    }

    let favourite = await Favourite.findOne({ user });

    if (!favourite) {
      favourite = new Favourite({
        user,
        products: [product],
      });
    } else {
      if (favourite.products.includes(product)) {
        return res
          .status(400)
          .json({ message: "Sản phẩm đã có trong danh sách yêu thích" });
      }
      favourite.products.push(product);
    }

    await favourite.save();
    res
      .status(201)
      .json({ message: "Đã thêm sản phẩm vào danh sách yêu thích", favourite });
  } catch (error) {
    console.error("Error adding to favourites:", error);
    res.status(500).json({
      message: "Lỗi server khi thêm sản phẩm vào danh sách yêu thích",
    });
  }
});

app.delete("/api/favourites/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const favourite = await Favourite.findOne({ user: userId });

    if (!favourite) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy danh sách yêu thích" });
    }

    const productIndex = favourite.products.indexOf(productId);
    if (productIndex === -1) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không có trong danh sách yêu thích" });
    }

    favourite.products.splice(productIndex, 1);
    await favourite.save();

    res
      .status(200)
      .json({ message: "Đã xóa sản phẩm khỏi danh sách yêu thích", favourite });
  } catch (error) {
    console.error("Error removing from favourites:", error);
    res.status(500).json({
      message: "Lỗi server khi xóa sản phẩm khỏi danh sách yêu thích",
    });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "ID đơn hàng không hợp lệ" });
    }

    const order = await Seller.findById(orderId)
      .populate("products.product", "name price image info")
      .lean();

    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    if (order.dateOrder) {
      order.dateOrder = order.dateOrder.toISOString();
    }
    order.createdAt = order.createdAt.toISOString();
    order.updatedAt = order.updatedAt.toISOString();

    res.json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Không thể tải thông tin đơn hàng" });
  }
});

app.get("/products/top-sold", async (req, res) => {
  try {
    const products = await Product.find().sort({ sold: -1 }).limit(5);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching top sold products:", error);
    res.status(500).json({ message: "Lỗi server khi lấy sản phẩm bán chạy" });
  }
});

app.get("/notice/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "userId không hợp lệ" });
  }

  try {
    const notices = await Notice.find({ user: userId })
      .populate("order", "orderCode status")
      .sort({ createdAt: -1 });

    res.status(200).json(notices);
  } catch (error) {
    console.error("Lỗi lấy thông báo:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

app.patch("/notice/read/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({ message: "Thông báo không tồn tại." });
    }

    notice.isRead = true;
    await notice.save();

    return res
      .status(200)
      .json({ message: "Thông báo đã được đánh dấu là đã đọc." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống khi cập nhật thông báo." });
  }
});

app.post("/api/notices", async (req, res) => {
  try {
    const { user, order, title, message, type } = req.body;
    const newNotice = new Notice({ user, order, title, message, type });
    await newNotice.save();
    res.status(201).json(newNotice);
  } catch (err) {
    console.error("Error creating notice:", err);
    res.status(500).json({ message: "Lỗi server khi tạo thông báo." });
  }
});

app.get("/api/reviews/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    const reviews = await Review.find({ product: productId }).populate({
      path: "user",
      select: "profile.full_name",
    });

    if (!reviews || reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đánh giá nào cho sản phẩm này" });
    }

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Endpoint thêm đánh giá sản phẩm
app.post("/api/reviews", async (req, res) => {
  try {
    const { productId, user, rating, comment, characteristic, fit } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!productId || !user || !rating || !comment) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc: productId, user, rating, comment",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(user)
    ) {
      return res
        .status(400)
        .json({ message: "ID sản phẩm hoặc ID người dùng không hợp lệ" });
    }

    // Kiểm tra user có tồn tại không
    const existingUser = await User.findById(user).select("profile");
    if (!existingUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Tạo đánh giá mới
    const newReview = new Review({
      user,
      product: productId,
      rating: Number(rating),
      comment,
      characteristic: characteristic || "Nâu đậm",
      fit: fit || "Đúng chuẩn",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Lưu đánh giá vào database
    const savedReview = await newReview.save();

    // Populate thông tin user để trả về
    const populatedReview = await Review.findById(savedReview._id).populate({
      path: "user",
      select: "profile.full_name",
    });

    if (!populatedReview) {
      return res
        .status(500)
        .json({ message: "Không thể tìm thấy đánh giá vừa lưu" });
    }

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("Lỗi khi lưu đánh giá:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi lưu đánh giá", error: error.message });
  }
});

//Shipper

app.get("/api/shipper", async (req, res) => {
  try {
    const orders = await Seller.find({ status: "resolved" }).populate(
      "products.product"
    );
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching seller data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/shipper_status/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const shipper = await Shipper.findById(id)
      .populate("assignedOrders.sellers") // Populating sellers here
      .lean();

    if (!shipper) {
      return res.status(404).json({ message: "Shipper not found" });
    }

    const ordersByStatus = {
      processing: [],
      delivered: [],
      cancelled: [],
    };

    for (const order of shipper.assignedOrders || []) {
      if (["processing", "delivered", "cancelled"].includes(order.status)) {
        ordersByStatus[order.status].push(order);
      }
    }

    res.status(200).json(ordersByStatus);
  } catch (error) {
    console.error("Error fetching shipper orders by status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login_shipper", async (req, res) => {
  const { email, password } = req.body;

  console.log("Email nhận được:", email);
  console.log("password nhận được:", password);

  if (!email || !password)
    return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });

  try {
    const shipper = await Shipper.findOne({ email });

    if (!shipper)
      return res.status(404).json({ message: "Tài khoản không tồn tại" });

    const isMatch = await bcrypt.compare(password, shipper.password);
    if (!isMatch)
      return res.status(401).json({ message: "Mật khẩu không đúng" });

    const { password: _, ...shipperInfo } = shipper.toObject();

    res
      .status(200)
      .json({ message: "Đăng nhập thành công", user: shipperInfo });
  } catch (err) {
    console.error("Lỗi đăng nhập shipper:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
});

app.get("/api/shipper_status/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const shipper = await Shipper.findById(id)
      .populate("assignedOrders.sellers") // Populating sellers here
      .lean();

    if (!shipper) {
      return res.status(404).json({ message: "Shipper not found" });
    }

    const ordersByStatus = {
      processing: [],
      delivered: [],
      cancelled: [],
    };

    for (const order of shipper.assignedOrders || []) {
      if (["processing", "delivered", "cancelled"].includes(order.status)) {
        ordersByStatus[order.status].push(order);
      }
    }

    res.status(200).json(ordersByStatus);
  } catch (error) {
    console.error("Error fetching shipper orders by status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/api/shipper_accept", async (req, res) => {
  const { id, orderID } = req.body;

  try {
    const updatedSeller = await Seller.findByIdAndUpdate(
      orderID,
      { status: "processing" },
      { new: true }
    );

    if (!updatedSeller) {
      return res.status(404).json({ message: "Order not found" });
    }

    const shipper = await Shipper.findById(id);
    if (!shipper) {
      return res.status(404).json({ message: "Shipper not found" });
    }

    shipper.assignedOrders.push({
      sellers: orderID,
      status: "processing",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await shipper.save();

    const sellerUser = updatedSeller.user;

    const newNotice = new Notice({
      user: sellerUser,
      order: updatedSeller._id,
      title: "Đơn hàng đã giao cho đơn vị vận chuyển",
      message: `Đơn hàng ${updatedSeller.orderCode} đã giao cho đơn vị vận chuyển và đang trên đường đến chỗ bạn. Vui lòng chú ý điện thoại!`,
      type: "processing",
    });

    await newNotice.save();
    res.status(200).json({ message: "Order processing", order: updatedSeller });
  } catch (error) {
    console.error("Error processing order:", error);
    res.status(500).json({ message: "Server error" });
  }
});
app.patch("/api/shipper_complete", async (req, res) => {
  const { id, orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "Missing orderId in request body" });
  }

  try {
    const shipper = await Shipper.findById(id);
    if (!shipper) {
      return res.status(404).json({ message: "Shipper not found" });
    }

    const orderIndex = shipper.assignedOrders.findIndex(
      (order) => order.sellers?.toString() === orderId
    );

    if (orderIndex === -1) {
      return res
        .status(404)
        .json({ message: "Order not found in shipper's assignedOrders" });
    }

    shipper.assignedOrders[orderIndex].status = "delivered";
    shipper.assignedOrders[orderIndex].updatedAt = new Date();
    await shipper.save();

    const updatedSeller = await Seller.findByIdAndUpdate(
      orderId,
      { status: "delivered", updatedAt: new Date() },
      { new: true }
    );

    if (!updatedSeller) {
      return res.status(404).json({ message: "Seller (order) not found" });
    }

    const sellerUser = updatedSeller.user;

    if (!sellerUser) {
      return res
        .status(400)
        .json({ message: "Seller does not have a user reference" });
    }

    const newNotice = new Notice({
      user: sellerUser,
      order: updatedSeller._id,
      title: "Đơn hàng đã hoàn thành",
      message: `Đơn hàng ${updatedSeller.orderCode} đã được giao thành công.`,
      type: "delivered",
    });

    await newNotice.save();

    res.status(200).json({
      message: "Order marked as delivered and notice created",
      shipper: shipper,
      order: updatedSeller,
      notice: newNotice,
    });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/api/shipper_cancel", async (req, res) => {
  const { id, orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "Missing orderId in request body" });
  }

  try {
    const shipper = await Shipper.findById(id);
    if (!shipper) {
      return res.status(404).json({ message: "Shipper not found" });
    }

    const orderIndex = shipper.assignedOrders.findIndex(
      (order) => order.sellers?.toString() === orderId
    );

    if (orderIndex === -1) {
      return res
        .status(404)
        .json({ message: "Order not found in shipper's assignedOrders" });
    }

    shipper.assignedOrders[orderIndex].status = "cancelled";
    shipper.assignedOrders[orderIndex].updatedAt = new Date();
    await shipper.save();

    const updatedSeller = await Seller.findByIdAndUpdate(
      orderId,
      { status: "cancelled", updatedAt: new Date() },
      { new: true }
    );

    if (!updatedSeller) {
      return res.status(404).json({ message: "Seller (order) not found" });
    }

    const sellerUser = updatedSeller.user;

    if (!sellerUser) {
      return res
        .status(400)
        .json({ message: "Seller does not have a user reference" });
    }

    const newNotice = new Notice({
      user: sellerUser,
      order: updatedSeller._id,
      title: "Đơn hàng đã bị hủy",
      message: `Đơn hàng ${updatedSeller.orderCode} giao không thành công thành công.`,
      type: "cancelled",
    });

    await newNotice.save();

    res.status(200).json({
      message: "Order marked as delivered and notice created",
      shipper: shipper,
      order: updatedSeller,
      notice: newNotice,
    });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/dashboard", async (req, res) => {
  try {
    // Tổng số người dùng
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Tổng số đơn hàng và trạng thái
    const totalOrders = await Seller.countDocuments();
    const orderStatus = {
      pending: await Seller.countDocuments({ status: "pending" }),
      resolved: await Seller.countDocuments({ status: "resolved" }),
      processing: await Seller.countDocuments({ status: "processing" }),
      delivered: await Seller.countDocuments({ status: "delivered" }),
      cancelled: await Seller.countDocuments({ status: "cancelled" }),
    };

    // Tổng doanh thu (từ đơn hàng delivered)
    const totalRevenue = await Seller.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$total_price" } } },
    ]).then((result) => result[0]?.total || 0);

    // Doanh thu theo ngày (7 ngày gần nhất)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const revenueByDay = await Seller.aggregate([
      {
        $match: {
          status: "delivered",
          dateOrder: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$dateOrder" } },
          total: { $sum: "$total_price" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Tạo danh sách đầy đủ 7 ngày
    const revenueByDayFull = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      const found = revenueByDay.find((r) => r._id === dateStr);
      revenueByDayFull.push({
        date: dateStr,
        total: found ? found.total : 0,
      });
    }

    // Tổng số sản phẩm
    const totalProducts = await Product.countDocuments();
    const availableProducts = await Product.countDocuments({
      status: "available",
    });

    // Top 5 sản phẩm bán chạy
    const topProducts = await Product.find()
      .sort({ sold: -1 })
      .limit(5)
      .select("name sold price _id");

    // Số shipper hoạt động
    const activeShippers = await Shipper.countDocuments({ isActive: true });

    // 5 đơn hàng gần đây
    const recentOrders = await Seller.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "email profile.full_name")
      .select("orderCode full_name total_price status dateOrder createdAt");

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalOrders,
        orderStatus,
        totalRevenue,
        revenueByDay: revenueByDayFull,
        totalProducts,
        availableProducts,
        activeShippers,
        recentOrders: recentOrders.map((o) => ({
          _id: o._id,
          orderCode: o.orderCode,
          full_name: o.full_name,
          total_price: o.total_price,
          status: o.status,
          dateOrder: o.dateOrder,
        })),
        topProducts: topProducts.map((p) => ({
          _id: p._id,
          name: p.name,
          sold: p.sold,
          price: p.price,
        })),
      },
    });
  } catch (err) {
    console.error("Lỗi endpoint /api/dashboard:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tải dữ liệu dashboard",
    });
  }
});

// Endpoint lấy danh sách địa chỉ nhận hàng của người dùng
app.get("/api/user/addresses/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID người dùng không hợp lệ" });
    }

    const user = await User.findById(userId).select("addresses");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách địa chỉ:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách địa chỉ",
    });
  }
});

// Endpoint thêm địa chỉ nhận hàng mới
app.post("/api/add_addresses/:userId", async (req, res) => {
  const { userId } = req.params;
  const { name, phone, address, ward, district, city } = req.body;

  // Kiểm tra thông tin bắt buộc
  if (!name || !phone || !address) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin bắt buộc: name, phone, address",
    });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "ID người dùng không hợp lệ" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const newAddress = {
      _id: new mongoose.Types.ObjectId(), // Tạo ID mới cho địa chỉ
      name,
      phone,
      address,
      ward: ward || "",
      district: district || "",
      city: city || "",
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      address: newAddress,
      message: "Thêm địa chỉ thành công",
    });
  } catch (error) {
    console.error("Lỗi khi thêm địa chỉ:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi thêm địa chỉ" });
  }
});

// Endpoint cập nhật địa chỉ nhận hàng
app.put("/api/edit_addresses/:userId/:addressId", async (req, res) => {
  const { userId, addressId } = req.params;
  const { name, phone, address, ward, district, city } = req.body;

  try {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(addressId)
    ) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng hoặc địa chỉ không hợp lệ",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const addressToUpdate = user.addresses.id(addressId);
    if (!addressToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy địa chỉ" });
    }

    // Cập nhật thông tin địa chỉ
    addressToUpdate.name = name || addressToUpdate.name;
    addressToUpdate.phone = phone || addressToUpdate.phone;
    addressToUpdate.address = address || addressToUpdate.address;
    addressToUpdate.ward = ward || addressToUpdate.ward;
    addressToUpdate.district = district || addressToUpdate.district;
    addressToUpdate.city = city || addressToUpdate.city;

    await user.save();

    res.status(200).json({
      success: true,
      address: addressToUpdate,
      message: "Cập nhật địa chỉ thành công",
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật địa chỉ:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi cập nhật địa chỉ" });
  }
});

// Endpoint xóa địa chỉ nhận hàng
app.delete("/api/delete_addresses/:userId/:addressId", async (req, res) => {
  const { userId, addressId } = req.params;

  try {
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(addressId)
    ) {
      return res.status(400).json({
        success: false,
        message: "ID người dùng hoặc địa chỉ không hợp lệ",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const addressToDelete = user.addresses.id(addressId);
    if (!addressToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy địa chỉ" });
    }

    user.addresses.pull(addressId); // Xóa địa chỉ khỏi mảng
    await user.save();

    res.status(200).json({
      success: true,
      message: "Xóa địa chỉ thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa địa chỉ:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi xóa địa chỉ" });
  }
});

app.post('/predict', uploadPredict, async (req, res) => {
  console.log('🔔 Received predict request');
  console.log('📝 req.body:', req.body);
  console.log('🖼️ req.file:', req.file);

  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  // Ghi file ảnh tạm vào ổ đĩa
  const imagePath = `temp_${Date.now()}.jpg`;
  fs.writeFileSync(imagePath, req.file.buffer);

  const command = `python3 AI/predict.py "${imagePath}"`;
  exec(command, (err, stdout, stderr) => {
    fs.unlinkSync(imagePath); // xóa ảnh sau khi xử lý

    if (err) {
      console.error('Python script error:', err);
      return res.status(500).json({ error: 'Prediction failed', details: stderr });
    }

    try {
      const result = JSON.parse(stdout.trim());
      return res.json(result);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid prediction result', details: parseErr.message });
    }
  });
});



// Xử lý payment momo
app.post('/payment', async (req, res) => {
  let {
    accessKey,
    secretKey,
    orderInfo,
    partnerCode,
    redirectUrl,
    ipnUrl,
    requestType,
    extraData,
    orderGroupId,
    autoCapture,
    lang,
  } = config;

  const orderData = req.body;  
  
  var amount = orderData.total_price;
  var orderId = orderData.userId + new Date().getTime();
  var requestId = orderId;

  var rawSignature =
    'accessKey=' +
    accessKey +
    '&amount=' +
    amount +
    '&extraData=' +
    extraData +
    '&ipnUrl=' +
    ipnUrl +
    '&orderId=' +
    orderId +
    '&orderInfo=' +
    orderInfo +
    '&partnerCode=' +
    partnerCode +
    '&redirectUrl=' +
    redirectUrl +
    '&requestId=' +
    requestId +
    '&requestType=' +
    requestType;

  //signature
  var signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  //json object send to MoMo endpoint
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    partnerName: 'Test',
    storeId: 'MomoTestStore',
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    orderGroupId: orderGroupId,
    signature: signature,
  });

  const options = {
    method: 'POST',
    url: 'https://test-payment.momo.vn/v2/gateway/api/create',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody),
    },
    data: requestBody,
  };
  let result;
  try {
    result = await axios(options);
    return res.status(200).json(result.data);
  } catch (error) {
    return res.status(500).json({ statusCode: 500, message: error.message });
  }
});

app.post('/check-status-transaction', async (req, res) => {
    const { orderId } = req.body;
    // const signature = accessKey=$accessKey&orderId=$orderId&partnerCode=$partnerCode
    // &requestId=$requestId
    var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    var accessKey = 'F8BBA842ECF85';
    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;
  
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
  
    const requestBody = JSON.stringify({
      partnerCode: 'MOMO',
      requestId: orderId,
      orderId: orderId,
      signature: signature,
      lang: 'vi',
    });
      const options = {
      method: 'POST',
      url: 'https://test-payment.momo.vn/v2/gateway/api/query',
      headers: {
        'Content-Type': 'application/json',
      },
      data: requestBody,
    };
  
    const result = await axios(options);
    return res.status(200).json(result.data);
  });


// Khởi động server
httpServer.listen(port, () => {
  console.log(`Server chạy trên port ${port}`);
});
