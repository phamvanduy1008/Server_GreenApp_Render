import express from "express";
import mysql from "mysql";
import cors from "cors";
const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  port: 3306,
  database: "agriculture_db",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("MySQL Connection Error:", err);
    throw err;
  }
  console.log("MySQL Connected");
});

app.use(cors());
app.use(express.json());

// Login
app.post("/login", (req, res) => {
  const { UserEmail, UserPass } = req.body;
  const sql = `SELECT * FROM user WHERE UserEmail = ? AND UserPass = ?`;
  db.query(sql, [UserEmail, UserPass], (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error retrieving data" });
      throw err;
    }
    if (result.length > 0) {
      res.status(200).send({ success: true, message: "Login successful" });
    } else {
      res
        .status(401)
        .send({ success: false, message: "Email hoặc Mật khẩu không đúng" });
    }
  });
});

// Signup
app.post("/signup", (req, res) => {
  const { UserEmail, UserPass } = req.body;
  const sql = `INSERT INTO user (UserEmail, UserPass) VALUES (?, ?)`;
  db.query(sql, [UserEmail, UserPass], (err, result) => {
    if (err) {
      res.status(500).send({ success: false, message: "Đăng ký thất bại" });
      throw err;
    }
    res.status(200).send({ success: true, message: "Đăng ký thành công" });
  });
});

// Add a new endpoint to handle "All" request
app.get("/category/allPlants", (req, res) => {
  const sql = `
        SELECT c.CategoryID, c.CategoryName, p.PlantID, p.PlantName, p.AVGPriceNow, (p.AVGPriceNow - p.AVGPriceYesterday) AS Fluctuations
        FROM category c
        INNER JOIN plant p ON c.CategoryID = p.CategoryID
    `;
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error retrieving data" });
      throw err;
    }
    res.status(200).send(result);
  });
});

// Select data category
app.get("/category", (req, res) => {
  const sql = `SELECT * FROM category`;
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error retrieving data" });
      throw err;
    }
    res.status(200).send(result);
  });
});

// Select data infor
app.get("/infor", (req, res) => {
  const sql = `SELECT * FROM infor`;
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error retrieving data" });
      throw err;
    }
    res.status(200).send(result);
  });
});

// Select data price from plant
app.get("/category/plants", (req, res) => {
  const sql = `
        SELECT c.CategoryID, c.CategoryName, p.PlantID, p.PlantName, p.AVGPriceNow, (p.AVGPriceNow - p.AVGPriceYesterday) AS Fluctuations
        FROM category c
        INNER JOIN plant p ON c.CategoryID = p.CategoryID
    `;
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error retrieving data" });
      throw err;
    }
    res.status(200).send(result);
  });
});

// Select full data product
app.get("/category/plant/product", (req, res) => {
  let sql = `
                SELECT 
                c.CategoryID,
                c.CategoryName,
                p.PlantID,
                p.PlantName,
                p.AVGPriceYesterday,
                p.AVGPriceNow,
                pr.ProductID,
                pr.ProductName,
                pr.Price,
                pr.ProductInfo,
                pr.Image
                FROM 
                    category c
                JOIN 
                    plant p ON c.CategoryID = p.CategoryID
                JOIN 
                    product pr ON p.PlantID = pr.PlantID`;
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error retrieving data" });
      throw err;
    }
    res.status(200).send(result);
  });
});
// Select data product based on category
app.get("/category/plants", (req, res) => {
  const id = req.query.id;

  const sql = `
                SELECT product.*
                FROM product
                INNER JOIN plant ON product.PlantID = plant.PlantID
                INNER JOIN category ON plant.CategoryID = category.CategoryID
                WHERE category.CategoryID = '${id}'
            `;
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error retrieving data" });
      throw err;
    }
    res.status(200).send(result);
  });
});
// Search endpoint
app.get("/search", (req, res) => {
  const searchQuery = req.query.q;
  const sql = `
    SELECT 
      c.CategoryID,
      c.CategoryName,
      p.PlantID,
      p.PlantName,
      p.AVGPriceYesterday,
      p.AVGPriceNow,
      pr.ProductID,
      pr.ProductName,
      pr.Price,
      pr.ProductInfo,
      pr.Image
    FROM 
      category c
    JOIN 
      plant p ON c.CategoryID = p.CategoryID
    JOIN 
      product pr ON p.PlantID = pr.PlantID
    WHERE 
      pr.ProductName LIKE ?`;

  db.query(sql, [`%${searchQuery}%`], (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error retrieving data" });
      throw err;
    }
    res.status(200).send(result);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
