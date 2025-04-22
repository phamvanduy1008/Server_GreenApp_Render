import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import cors from "cors";
import { User,Admin,Category,Contact,Infor,Plant,Product, Seller, UserCart } from "./schema.js";

const app = express();
const port = process.env.PORT || 3000;

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

app.use('/images', express.static('images'));


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Thiếu email hoặc mật khẩu!" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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
    res.status(500).json({ success: false, message: "Lỗi server khi đăng ký!" });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/plants', async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json(plants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/infor-plants', async (req, res) => {
  try {
    const inforPlants = await Infor.find().populate('plant');
    res.json(inforPlants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params; 

  try {
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/infor-plants/:plantId', async (req, res) => {
  const { plantId } = req.params;
  try {
    const inforPlant = await Infor.findOne({ plant: plantId }).populate('plant');
    if (!inforPlant) {
      return res.status(404).json({ error: 'Infor plant not found' });
    }
    res.json(inforPlant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'ID danh mục không hợp lệ' });
    }
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin danh mục:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

app.get('/api/products/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'ID danh mục không hợp lệ' });
    }

    const products = await Product.find({ category: categoryId });

    return res.status(200).json(products);
  } catch (error) {
    console.error('Lỗi khi tìm sản phẩm theo danh mục:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});


// Khởi động server
app.listen(port, () => {
  console.log(`Server chạy trên port ${port}`);
});
