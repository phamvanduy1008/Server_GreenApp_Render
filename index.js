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

app.get("/notes", (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ success: false, message: "Thiếu user_id" });
  }

  const sql = `
    SELECT notes.*, images.image_path 
    FROM notes 
    LEFT JOIN images ON notes.NoteID = images.note_id
    WHERE notes.UserID = ?`;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn SQL: ", err);
      return res.status(500).json({ success: false, message: "Lỗi server!" });
    }

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

app.post("/add-note", (req, res) => {
  const { UserID, title, content } = req.body;

  if (!UserID || !title || !content) {
    return res.status(400).json({ success: false, message: "Thiếu dữ liệu!" });
  }

  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  const sql = `INSERT INTO notes (UserID, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [UserID, title, content, timestamp, timestamp], (err, result) => {
    if (err) {
      console.error("Lỗi khi thêm ghi chú:", err);
      return res.status(500).json({ success: false, message: "Lỗi server!" });
    }

    res.json({ success: true, message: "Thêm ghi chú thành công!", note_id: result.insertId });
  });
});

app.delete("/delete-note", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: "Thiếu note_id!" });
  }
  const sql = "DELETE FROM notes WHERE NoteID = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Lỗi khi xóa ghi chú:", err);
      return res.status(500).json({ success: false, message: "Lỗi server!" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Ghi chú không tồn tại!" });
    }
    res.json({ success: true, message: "Xóa ghi chú thành công!" });
  });
});


app.put("/update-note",(req,res) =>{
  const {note_id, title, content} = req.body;
  if(!note_id || !title || !content ){
    return res.status(400).json({success:false, message:"Thieu du lieu"});
  }
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  const sql = "UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE NoteID =? ";
  db.query(sql, [title, content, timestamp, note_id], (err, result) =>{
    if (err) {
      console.error("Lỗi khi sua ghi chú:", err);
      return res.status(500).json({ success: false, message: "Lỗi server!" });
    }
    res.json({ success: true, message: "Sua ghi chú thành công!" });
  })
})

app.use("/images", express.static(path.join(__dirname, "assets", "images", "picture")));

app.listen(port, () => {
  console.log(`Server chạy trên cổng ${port}`);
});
