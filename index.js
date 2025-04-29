import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import cors from "cors";
import multer from "multer";
import path from "path";
import {
  User,
  Admin,
  Category,
  Contact,
  Infor,
  Plant,
  Product,
  Seller,
  UserCart,
} from "./schema.js";

// Tạo thư mục images/profile nếu chưa tồn tại
import fs from "fs";
const profileDir = "images/profile";
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

const app = express();
const port = process.env.PORT || 3000;

// Cấu hình multer để lưu ảnh vào thư mục images/profile
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/profile/"); // Thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Đặt tên file duy nhất
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ file ảnh định dạng JPEG, JPG hoặc PNG!"));
    }
  },
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoURI = "mongodb://127.0.0.1:27017/greentree_app";
mongoose.connect(mongoURI);

mongoose.connection.on("connected", () => {
  console.log("Kết nối MongoDB thành công!");
});
mongoose.connection.on("error", (err) => {
  console.error("Lỗi kết nối MongoDB: ", err);
});

app.use("/images", express.static("images"));

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

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/plants", async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json(plants);
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

// Cập nhật endpoint để lấy thông tin chi tiết người dùng, bao gồm avatar
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

// Endpoint để cập nhật thông tin người dùng (giữ nguyên)
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

// Endpoint để upload ảnh avatar
app.post(
  "/api/user/:userId/upload-avatar",
  upload.single("avatar"),
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

      // Chỉ lưu tên ảnh vào database
      const imageName = req.file.filename;
      user.profile.avatar = imageName;
      await user.save();

      res.json({
        success: true,
        avatar: imageName, // Trả về tên ảnh
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

// Khởi động server
app.listen(port, () => {
  console.log(`Server chạy trên port ${port}`);
});
