import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import cors from "cors";
const app = express();
const port = process.env.PORT || 3000;
import path from "path";
import { fileURLToPath } from "url";

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
db.getConnection((err, connection) => {
  if (err) {
    console.error("Kết nối MySQL lỗi: ", err);
  } else {
    console.log("Kết nối MySQL thành công!");
    connection.release();
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Thiếu email hoặc mật khẩu!" });
  }

  const sql = `SELECT * FROM users WHERE email = ? AND password_hash = ?`;
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn: ", err);
      return res.status(500).json({ success: false, message: "Lỗi server!" });
    }
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu!" });
    }
  });
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Thiếu email hoặc mật khẩu!" });
  }

  const checkSql = `SELECT * FROM users WHERE email = ?`;
  db.query(checkSql, [email], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Lỗi truy vấn kiểm tra email: ", checkErr);
      return res.status(500).json({ success: false, message: "Lỗi server!" });
    }
    if (checkResults.length > 0) {
      return res.status(409).json({ success: false, message: "Email đã được sử dụng!" });
    }

    const sql = `INSERT INTO users (email, password_hash) VALUES (?,?)`;
    db.query(sql, [email, password], (err, result) => {
      if (err) {
        console.error("Lỗi chèn dữ liệu: ", err);
        return res.status(500).json({ success: false, message: "Lỗi server khi đăng ký!" });
      }
      res.status(201).json({ success: true, userId: result.insertId });
    });
  });
});

app.post("/complete-onboarding", async (req, res) => {
  const { email, full_name, username, gender } = req.body;

  if (!email || !full_name || !username || !gender) {
    return res.status(400).json({ error: "Thiếu dữ liệu bắt buộc" });
  }

  try {
    await db.execute(
      "INSERT INTO users (email, password_hash, onboarding_completed) VALUES (?, ?, ?)",
      [email, "user123", 0]
    );
    await db.execute(
      `INSERT INTO infor (email, full_name, username, gender)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), username = VALUES(username), gender = VALUES(gender)`,
      [email, full_name, username, gender]
    );

    await db.execute(
      `UPDATE users SET onboarding_completed = 1 WHERE email = ?`,
      [email]
    );

    return res.json({ success: true, message: "Onboarding completed!" });
  } catch (error) {
    console.error("Lỗi khi cập nhật database:", error);
    return res.status(500).json({ success: false, message: "Lỗi server khi cập nhật onboarding!" });
  }
});


app.post("/infor", (req, res) => {
  const { email} = req.body;

  if (!email ) {
    return res.status(400).json({ success: false, message: "Thiếu email" });
  }

  const sql = `SELECT * FROM infor WHERE email = ?`;
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn: ", err);
      return res.status(500).json({ success: false, message: "Lỗi server!" });
    }
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu!" });
    }
  });
});



app.get("/get_userid", (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, message: "Thiếu email!" });
  }
  const sql = "SELECT UserID FROM users WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Lỗi truy vấn SQL: ", err);
      return res.status(500).json({ success: false, message: "Lỗi server!" });
    }

    if (result.length === 0) {
      return res.json({ success: false, message: "Không tìm thấy người dùng." });
    }

    console.log("Query Result:", result);
    res.json({ success: true, userData: result[0] });
  });
});

app.listen(port, () => {
  console.log(`Server chạy trên cổng ${port}`);
});
