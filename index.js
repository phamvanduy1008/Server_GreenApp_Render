import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import multer from "multer";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static("D:/Couse/Couse6/Đa nền tảng/MidTerm/midterm/assets/images"));

const mongoURI = "mongodb://127.0.0.1:27017/productmaneger";
mongoose.connect(mongoURI);

mongoose.connection.on("connected", () => {
  console.log("Kết nối MongoDB thành công!");
});
mongoose.connection.on("error", (err) => {
  console.error("Lỗi kết nối MongoDB: ", err);
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    full_name: { type: String, default: "" },
    username: { type: String, default: "" },
    gender: { type: String, default: "" },
  },
});
const productSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tensp: { type: String, required: true, unique: true }, 
  loaisp: { type: String, required: true },
  gia: { type: Number, required: true },
  hinhanh: { type: String, default: "" }
});

const User = mongoose.model("User", userSchema);
const Products = mongoose.model("Products", productSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.use('/uploads', express.static('uploads'));

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Thiếu email hoặc mật khẩu!" });
  }

  try {
    const user = await User.findOne({ email, password }); 
    if (!user) {
      return res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu!" });
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
    return res.status(400).json({ success: false, message: "Thiếu email hoặc mật khẩu!" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email đã được sử dụng!" });
    }

    const newUser = new User({
      email,
      password, 
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
    res.status(500).json({ success: false, message: "Lỗi server khi đăng ký!" });
  }
});

app.post("/update-infor", async (req, res) => {
  try {
    const { email, full_name, username, gender } = req.body;

    if (!email) return res.status(400).json({ error: "Email thieu" });

    let user = await User.findOne({ email });

    if (user) {
      user.profile.full_name = full_name;
      user.profile.username = username;
      user.profile.gender = gender;
    } else {
      user = new User({
        email,
        password: "user123",
        profile: { full_name, username, gender },
      });
    }

    await user.save();
    res.json({ success: true, message: "successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: "Thiếu user_id!" });
    }

    const userId = mongoose.Types.ObjectId.isValid(user_id) ? new mongoose.Types.ObjectId(user_id) : user_id;
    let products = await Products.find({ user_id: userId });

    products = products.map((product) => ({
      ...product.toObject(),
      hinhanh: Array.isArray(product.hinhanh) ? product.hinhanh.join(", ") : product.hinhanh,
    }));

    console.log("Dữ liệu trả về:", products);

    res.json({
      success: true,
      products,
    });

  } catch (err) {
    console.error("Lỗi server khi lấy sản phẩm:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

app.get("/get_userid", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, message: "Thiếu email" });
  }

  try {
    console.log("Email nhận được:", email); // Debug

    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });

    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy user" });
    }

    res.status(200).json({ success: true, user_id: user._id });
  } catch (err) {
    console.error("Lỗi server:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

app.delete("/delete-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ!" });
    }

    const product = await Products.findByIdAndDelete(new mongoose.Types.ObjectId(productId));

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
    }

    res.json({ message: "Xóa sản phẩm thành công!" });
  } catch (error) {
    console.error("Lỗi xóa sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
});

app.post("/add_product", upload.single("hinhanh"), async (req, res) => {
  try {
    const { user_id, tensp, loaisp, gia } = req.body;

    if (!user_id || !tensp || !loaisp || !gia) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin sản phẩm" });
    }
    const newProduct = new Products({
      user_id,
      tensp,
      loaisp,
      gia,
      hinhanh: req.file ? req.file.filename : "",
    });

    const result = await newProduct.save();
    res.status(201).json({ success: true, product: result });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

app.put("/update-product/:id", upload.single("hinhanh"), async (req, res) => {
  try {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ!" });
    }
    const { tensp, loaisp, gia } = req.body;
    let updatedData = {
      tensp,
      loaisp,
      gia: parseFloat(gia),
    };
    if (req.file) {
      updatedData.hinhanh = req.file.filename;
    }
    const updatedProduct = await Products.findByIdAndUpdate(
      productId,
      { $set: updatedData },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
    }

    res.json({ message: "Cập nhật sản phẩm thành công!", product: updatedProduct });
  } catch (error) {
    console.error("Lỗi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
});
app.post("/change-password", async (req, res) => {
  try {
    const { user_id, currentPassword, newPassword } = req.body;

    if (!user_id || !currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.password !== currentPassword) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    console.error("Error in /change-password:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: "Thiếu user_id!" });
    }

    const userId = mongoose.Types.ObjectId.isValid(user_id) ? new mongoose.Types.ObjectId(user_id) : user_id;
    const categories = await Products.find({ user_id: userId }).select("loaisp -_id");
    const uniqueCategories = [...new Set(categories.map((item) => item.loaisp))];

    res.json({
      success: true,
      categories: uniqueCategories,
    });
  } catch (err) {
    console.error("Lỗi server khi lấy danh sách loại sản phẩm:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

app.get("/search-products", async (req, res) => {
  try {
    const { user_id, search, category } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: "Thiếu user_id!" });
    }

    const userId = mongoose.Types.ObjectId.isValid(user_id)
      ? new mongoose.Types.ObjectId(user_id)
      : user_id;

    let query = { user_id: userId };

    if (search) {
      query.tensp = { $regex: search, $options: "i" }; 
    }
    if (category && category !== "All") {
      query.loaisp = category;
    }

    const products = await Products.find(query);

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    console.error("Lỗi server khi tìm kiếm sản phẩm:", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});


// Khởi động server
app.listen(port, () => {
  console.log(`Server chạy trên port ${port}`);
});
