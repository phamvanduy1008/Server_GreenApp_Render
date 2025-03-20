import express from "express";
import mysql from "mysql2/promise"; 
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "noteapp",
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log("Kết nối MySQL thành công!");
    connection.release();
  } catch (err) {
    console.error("Kết nối MySQL lỗi: ", err);
  }
})();

// Cấu hình multer để lưu ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "D:/Couse/Couse6/Đa nền tảng/MidTerm/midterm/assets/images");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Đăng nhập
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Thiếu email hoặc mật khẩu!" });
  }

  try {
    const [results] = await db.query("SELECT * FROM users WHERE email = ? AND password_hash = ?", [email, password]);
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu!" });
    }
  } catch (err) {
    console.error("Lỗi truy vấn: ", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

// Đăng ký
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Thiếu email hoặc mật khẩu!" });
  }

  try {
    const [checkResults] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (checkResults.length > 0) {
      return res.status(409).json({ success: false, message: "Email đã được sử dụng!" });
    }

    const [result] = await db.query("INSERT INTO users (email, password_hash) VALUES (?, ?)", [email, password]);
    res.status(201).json({ success: true, userId: result.insertId });
  } catch (err) {
    console.error("Lỗi khi đăng ký: ", err);
    res.status(500).json({ success: false, message: "Lỗi server khi đăng ký!" });
  }
});

// Hoàn thành onboarding
app.post("/complete-onboarding", async (req, res) => {
  const { email, full_name, username, gender } = req.body;
  if (!email || !full_name || !username || !gender) {
    return res.status(400).json({ success: false, message: "Thiếu dữ liệu bắt buộc" });
  }

  try {
    await db.query(
      "INSERT INTO infor (email, full_name, username, gender) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name = ?, username = ?, gender = ?",
      [email, full_name, username, gender, full_name, username, gender]
    );
    await db.query("UPDATE users SET onboarding_completed = 1 WHERE email = ?", [email]);
    res.json({ success: true, message: "Onboarding completed!" });
  } catch (err) {
    console.error("Lỗi khi cập nhật onboarding: ", err);
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật onboarding!" });
  }
});

// Lấy thông tin người dùng
app.post("/infor", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Thiếu email" });
  }

  try {
    const [results] = await db.query("SELECT * FROM infor WHERE email = ?", [email]);
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.status(404).json({ success: false, message: "Không tìm thấy thông tin người dùng!" });
    }
  } catch (err) {
    console.error("Lỗi truy vấn: ", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

// Lấy ghi chú
app.get("/notes", async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ success: false, message: "Thiếu user_id" });
  }

  try {
    const [results] = await db.query(
      "SELECT notes.*, images.image_path FROM notes LEFT JOIN images ON notes.NoteID = images.note_id WHERE notes.UserID = ?",
      [user_id]
    );

    const notesMap = new Map();
    results.forEach((row) => {
      if (!notesMap.has(row.NoteID)) {
        notesMap.set(row.NoteID, {
          NoteID: row.NoteID,
          UserID: row.UserID,
          title: row.title,
          content: row.content,
          created_at: row.created_at,
          images: [],
        });
      }
      if (row.image_path) {
        notesMap.get(row.NoteID).images.push(row.image_path);
      }
    });

    res.json({ success: true, notes: Array.from(notesMap.values()) });
  } catch (err) {
    console.error("Lỗi truy vấn SQL: ", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

// Lấy UserID
app.get("/get_userid", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ success: false, message: "Thiếu email!" });
  }

  try {
    const [result] = await db.query("SELECT UserID FROM users WHERE email = ?", [email]);
    if (result.length === 0) {
      return res.json({ success: false, message: "Không tìm thấy người dùng." });
    }
    res.json({ success: true, userData: result[0] });
  } catch (err) {
    console.error("Lỗi truy vấn SQL: ", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

// Thêm ghi chú với ảnh
app.post("/add-note", upload.single("image"), async (req, res) => {
  const { UserID, title, content } = req.body;
  const image_path = req.file ? req.file.filename : null;

  if (!UserID || !title || !content) {
    return res.status(400).json({ success: false, message: "Thiếu dữ liệu!" });
  }

  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const [noteResult] = await db.query(
      "INSERT INTO notes (UserID, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      [UserID, title, content, timestamp, timestamp]
    );
    const noteId = noteResult.insertId;

    if (image_path) {
      await db.query("INSERT INTO images (note_id, image_path) VALUES (?, ?)", [noteId, image_path]);
    }

    res.json({ success: true, message: "Thêm ghi chú thành công!", note_id: noteId, image_path });
  } catch (err) {
    console.error("Lỗi khi thêm ghi chú: ", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

// Xóa ghi chú
app.delete("/delete-note", async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: "Thiếu note_id!" });
  }

  try {
    const [result] = await db.query("DELETE FROM notes WHERE NoteID = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Ghi chú không tồn tại!" });
    }
    res.json({ success: true, message: "Xóa ghi chú thành công!" });
  } catch (err) {
    console.error("Lỗi khi xóa ghi chú: ", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

// Sửa ghi chú
app.put("/update-note", async (req, res) => {
  const { note_id, title, content } = req.body;
  if (!note_id || !title || !content) {
    return res.status(400).json({ success: false, message: "Thiếu dữ liệu!" });
  }

  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    await db.query("UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE NoteID = ?", [
      title,
      content,
      timestamp,
      note_id,
    ]);
    res.json({ success: true, message: "Sửa ghi chú thành công!" });
  } catch (err) {
    console.error("Lỗi khi sửa ghi chú: ", err);
    res.status(500).json({ success: false, message: "Lỗi server!" });
  }
});

app.use("/images", express.static("D:/Couse/Couse6/Đa nền tảng/MidTerm/midterm/assets/images"));

app.listen(port, () => {
  console.log(`Server chạy trên cổng ${port}`);
});