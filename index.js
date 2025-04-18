import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
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




// Khởi động server
app.listen(port, () => {
  console.log(`Server chạy trên port ${port}`);
});
