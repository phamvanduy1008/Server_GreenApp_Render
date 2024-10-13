import express from "express";
import mysql from "mysql";
import cors from "cors";
import seedrandom from "seedrandom";

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  port: 3306,
  database: "tech_store_db",
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

// Middleware
app.use(express.json());

//Login
app.post("/login", (req, res) => {
  const { UserEmail, UserPass } = req.body;
  const sql = `SELECT * FROM user WHERE UserEmail = ? AND UserPass = ?`;
  db.query(sql, [UserEmail, UserPass], (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error retrieving data" });
      throw err;
    }
    if (result.length > 0) {
      const user = result[0];
      res.status(200).send({
        success: true,
        message: "Login successful",
        UserID: user.UserID,
      });
    } else {
      res
        .status(401)
        .send({ success: false, message: "Email hoặc Mật khẩu không đúng" });
    }
  });
});

//signup
app.post("/signup", (req, res) => {
  const { UserEmail, UserPass } = req.body;

  const checkEmailSql = `SELECT * FROM user WHERE UserEmail = ?`;
  db.query(checkEmailSql, [UserEmail], (err, result) => {
    if (err) {
      res.status(500).send({ success: false, message: "Error checking email" });
      throw err;
    }
    if (result.length > 0) {
      res.status(400).send({
        success: false,
        message: "Email đã được đăng ký. Vui lòng đăng ký bằng Email khác!",
      });
    } else {
      const sql = `INSERT INTO user (UserEmail, UserPass) VALUES (?, ?)`;
      db.query(sql, [UserEmail, UserPass], (err, result) => {
        if (err) {
          res.status(500).send({ success: false, message: "Đăng ký thất bại" });
          throw err;
        }
        res.status(200).send({ success: true, message: "Đăng ký thành công" });
      });
    }
  });
});

//Update password
app.post("/update-password", (req, res) => {
  const { userID, currentPassword, newPassword } = req.body;
  const checkPasswordSql = `SELECT * FROM user WHERE UserID = ? AND UserPass = ?`;

  db.query(checkPasswordSql, [userID, currentPassword], (err, result) => {
    if (err) {
      res
        .status(500)
        .send({ success: false, message: "Error checking current password" });
      throw err;
    }
    if (result.length === 0) {
      res
        .status(401)
        .send({ success: false, message: "Mật khẩu hiện tại không đúng" });
    } else {
      const updatePasswordSql = `UPDATE user SET UserPass = ? WHERE UserID = ?`;
      db.query(updatePasswordSql, [newPassword, userID], (err, result) => {
        if (err) {
          res
            .status(500)
            .send({ success: false, message: "Error updating password" });
          throw err;
        }
        res
          .status(200)
          .send({ success: true, message: "Cập nhật mật khẩu thành công" });
      });
    }
  });
});

// Insert data category
app.post("/category", (req, res) => {
  const { CategoryID, CategoryName } = req.body;
  const sql = `INSERT INTO category (CategoryID, CategoryName) VALUES (?, ?)`;
  db.query(sql, [CategoryID, CategoryName], (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error inserting data" });
      throw err;
    }
    res.status(200).send({ message: "Data inserted successfully" });
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

// Select full data product
app.get("/category/brand/product", (req, res) => {
  let sql = `
                SELECT 
                c.CategoryID,
                c.CategoryName,
                p.BrandID,
                p.BrandName,
                pr.ProductID,
                pr.ProductName,
                pr.Price,
                pr.ProductInfo,
                pr.Status,
                pr.Image
                FROM 
                    category c
                JOIN 
                    brand p ON c.CategoryID = p.CategoryID
                JOIN 
                    product pr ON p.BrandID = pr.BrandID`;
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
      p.BrandID,
      p.BrandName,
      pr.ProductID,
      pr.ProductName,
      pr.Price,
      pr.ProductInfo,
      pr.Status,
      pr.Image
    FROM 
      category c
    JOIN 
      brand p ON c.CategoryID = p.CategoryID
    JOIN 
      product pr ON p.BrandID = pr.BrandID
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
app.get("/category/brand/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const sql = `SELECT * FROM Brand WHERE CategoryID = ?`;
    db.query(sql, [categoryId], (err, result) => {
      if (err) {
        res.status(500).send({ message: "Error retrieving data" });
        throw err;
      }
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new endpoint to handle products by categoryId
app.get("/api/products/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const sql = `
        SELECT *
        FROM product
        WHERE BrandID IN (
            SELECT BrandID
            FROM brand
            WHERE CategoryID = ?
        )
    `;
    db.query(sql, [categoryId], (err, result) => {
      if (err) {
        res.status(500).send({ message: "Error retrieving data" });
        throw err;
      }
      res.status(200).json(result); // Trả lại dữ liệu sản phẩm dưới dạng JSON
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new endpoint to handle products by PlantID
app.get("/products/byBrand/:brandID", async (req, res) => {
  try {
    const brandID = req.params.brandID;
    const sql = `
        SELECT *
        FROM product
        WHERE BrandID = ?
    `;
    db.query(sql, [brandID], (err, result) => {
      if (err) {
        res.status(500).send({ message: "Error retrieving data" });
        throw err;
      }
      res.status(200).json(result);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Server error" });
  }
});

//Thêm sản phẩm vào giỏ hàng
app.post("/add-to-cart", (req, res) => {
  const { ProductName, Image, Price, Quantity, TotalPrice, UserID } = req.body;

  if (Quantity <= 0) {
    return res
      .status(400)
      .send({ success: false, message: "Quantity must be greater than 0" });
  }

  const checkSql = "SELECT * FROM cart WHERE ProductName = ? AND UserID = ?";
  db.query(checkSql, [ProductName, UserID], (checkErr, checkResult) => {
    if (checkErr) {
      res.status(500).send({ success: false, message: "Database query error" });
      throw checkErr;
    }

    if (checkResult.length > 0) {
      res
        .status(400)
        .send({ success: false, message: "Sản phẩm đã có trong giỏ hàng" });
    } else {
      const insertSql =
        "INSERT INTO cart (ProductName, Image, Price, Quantity, TotalPrice, UserID) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(
        insertSql,
        [ProductName, Image, Price, Quantity, TotalPrice, UserID],
        (insertErr, insertResult) => {
          if (insertErr) {
            res
              .status(500)
              .send({ success: false, message: "Failed to add to cart" });
            throw insertErr;
          }
          res
            .status(200)
            .send({ success: true, message: "Thêm vào giỏ hàng thành công" });
        }
      );
    }
  });
});

//Lấy dữ liệu giỏ hàng người dùng
app.get("/cart", (req, res) => {
  const userID = req.query.userID;
  if (!userID) {
    return res.status(400).send({ message: "UserID is required" });
  }

  const sql = `SELECT * FROM cart WHERE UserID = ?`;
  db.query(sql, [userID], (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error retrieving data" });
      throw err;
    }
    res.status(200).send(result);
  });
});

//Xóa khỏi giỏ hàng
app.delete("/delete-from-cart/:cartID", (req, res) => {
  const cartID = req.params.cartID;

  const deleteSql = "DELETE FROM cart WHERE CartID = ?";
  db.query(deleteSql, [cartID], (deleteErr, deleteResult) => {
    if (deleteErr) {
      res
        .status(500)
        .send({ success: false, message: "Failed to delete from cart" });
      throw deleteErr;
    }
    res.status(200).send({
      success: true,
      message: "Xóa sản phẩm khỏi giỏ hàng thành công",
    });
  });
});

// Mua hàng
const generateRandomNumber = (seed) => {
  const rng = seedrandom(seed);
  const min = 100000000000;
  const max = 999999999999;
  return Math.floor(rng() * (max - min + 1)) + min;
};

app.post("/purchase", (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    city,
    district,
    ward,
    ProductName,
    Price,
    Quantity,
    Image,
    UserID,
  } = req.body;

  const formattedAddress = `${address}, ${ward}, ${district}, ${city}`;
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  const currentTime = new Date().toLocaleTimeString();

  // Tạo hạt giống từ currentDate và currentTime
  const seed = `${currentDate}-${currentTime}`;
  const orderCode = generateRandomNumber(seed);

  const insertSql =
    "INSERT INTO order_detail (UserName, UserNumber, UserAddress, UserEmail, DateOrder, TimeOrder, ProductName, Price, Quantity, Image, Status, OrderCode, UserID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    insertSql,
    [
      name,
      phone,
      formattedAddress,
      email,
      currentDate,
      currentTime,
      ProductName,
      Price,
      Quantity,
      Image,
      "Đang xử lý",
      orderCode,
      UserID,
    ],
    (insertErr, insertResult) => {
      if (insertErr) {
        res
          .status(500)
          .send({ success: false, message: "Failed to make purchase" });
        throw insertErr;
      }

      const deleteSql = "DELETE FROM cart WHERE ProductName = ? AND UserID = ?";
      db.query(deleteSql, [ProductName, UserID], (deleteErr, deleteResult) => {
        if (deleteErr) {
          res
            .status(500)
            .send({ success: false, message: "Failed to delete from cart" });
          throw deleteErr;
        }
        res.status(200).send({
          success: true,
          message: "Mua hàng thành công và xóa khỏi giỏ hàng",
        });
      });
    }
  );
});

// New endpoint for submitting support requests
app.post("/support", (req, res) => {
  const { UserName, UserNumber, UserEmail, Content, UserID } = req.body;

  if (!UserName || !UserNumber || !UserEmail || !Content || !UserID) {
    return res
      .status(400)
      .send({ success: false, message: "All fields are required" });
  }

  const insertSql =
    "INSERT INTO contact (UserName, UserNumber, UserEmail, Content, UserID) VALUES (?, ?, ?, ?, ?)";
  db.query(
    insertSql,
    [UserName, UserNumber, UserEmail, Content, UserID],
    (insertErr, insertResult) => {
      if (insertErr) {
        res.status(500).send({
          success: false,
          message: "Failed to submit support request",
        });
        throw insertErr;
      }
      res.status(200).send({
        success: true,
        message: "Support request submitted successfully",
      });
    }
  );
});

// Get user information by UserID
app.get("/user/:userID", (req, res) => {
  const { userID } = req.params;
  const sql = `SELECT UserName, Sex, Birthday, Number, UserEmail FROM user WHERE UserID = ?`;

  db.query(sql, [userID], (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error retrieving data" });
      throw err;
    }
    if (result.length > 0) {
      res.status(200).send(result[0]);
    } else {
      res.status(404).send({ message: "User not found" });
    }
  });
});

//Cập nhật thông tin người dùng
app.post("/user/:userID", (req, res) => {
  const { userID } = req.params;
  const fields = req.body;

  const allowedFields = ["UserName", "Sex", "Birthday", "Number", "UserEmail"];
  const updates = Object.keys(fields)
    .filter((key) => allowedFields.includes(key))
    .map((key) => `${key} = ?`)
    .join(", ");

  if (updates.length === 0) {
    return res.status(400).send({ message: "No valid fields to update" });
  }

  const values = Object.values(fields);
  values.push(userID);

  const sql = `UPDATE user SET ${updates} WHERE UserID = ?`;

  db.query(sql, values, (err, result) => {
    if (err) {
      res.status(500).send({ message: "Error updating data" });
      throw err;
    }
    if (result.affectedRows > 0) {
      res.status(200).send({ message: "User updated successfully" });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  });
});

//Select user Information cho các form điền
app.get("/userInfor/:userID", (req, res) => {
  const userID = req.params.userID;
  const query = "SELECT UserName, UserEmail, Number FROM user WHERE UserID = ?";
  db.query(query, [userID], (err, result) => {
    if (err) {
      res
        .status(500)
        .send({ success: false, message: "Failed to fetch user data" });
      throw err;
    }
    if (result.length > 0) {
      res.status(200).send({ success: true, data: result[0] });
    } else {
      res.status(404).send({ success: false, message: "User not found" });
    }
  });
});

// Endpoint for fetching unique OrderCodes and all related status data
app.get("/api/sellers/:userID/:status", (req, res) => {
  const userID = req.params.userID;
  const status = req.params.status;

  const orderCodeQuery = `
    SELECT DISTINCT OrderCode
    FROM order_detail
    WHERE UserID = ? AND Status = ?
  `;

  db.query(orderCodeQuery, [userID, status], (err, orderCodes) => {
    if (err) {
      console.error("Error fetching OrderCodes:", err);
      res.status(500).send("Error fetching OrderCodes");
      return;
    }

    if (orderCodes.length === 0) {
      res.json([]);
      return;
    }

    // For each OrderCode, get all related status data
    const orderDataPromises = orderCodes.map((orderCode) => {
      return new Promise((resolve, reject) => {
        const allStatusQuery = `
          SELECT * 
          FROM order_detail 
          WHERE OrderCode = ?
        `;

        db.query(allStatusQuery, [orderCode.OrderCode], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    });

    Promise.all(orderDataPromises)
      .then((orderData) => {
        // Flatten the array of arrays
        const flattenedData = [].concat(...orderData);
        res.json(flattenedData);
      })
      .catch((error) => {
        console.error("Error fetching status data:", error);
        res.status(500).send("Error fetching status data");
      });
  });
});

//Hủy đơn hàng
app.delete("/api/delete-seller/:OrderCode", (req, res) => {
  const OrderCode = req.params.OrderCode;

  const deleteOrder = "DELETE FROM order_detail WHERE OrderCode = ?";
  db.query(deleteOrder, [OrderCode], (deleteErr, deleteResult) => {
    if (deleteErr) {
      res
        .status(500)
        .send({ success: false, message: "Failed to delete from cart" });
      throw deleteErr;
    }
    res.status(200).send(deleteResult);
  });
});

//set status
app.put("/api/orders/update-status/:orderCode", (req, res) => {
  const orderCode = req.params.orderCode;
  const updateStatusQuery = `
    UPDATE order_detail
    SET Status = 'Đã nhận hàng'
    WHERE OrderCode = ?
  `;

  db.query(updateStatusQuery, [orderCode], (err, result) => {
    if (err) {
      console.error("Error updating order status:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      const rowsAffected = result.affectedRows;
      console.log(rowsAffected);
      if (rowsAffected > 0) {
        res
          .status(200)
          .json({ message: "Đã cập nhật trạng thái đơn hàng thành công" });
      } else {
        res.status(404).json({ error: "Không tìm thấy đơn hàng để cập nhật" });
      }
    }
  });
});

//Lấy dữ liệu đơn hàng theo mã đơn hàng
app.get("/api/product/:ordercode", (req, res) => {
  try {
    const orderCode = req.params.ordercode;

    const query = `SELECT * FROM order_detail WHERE OrderCode = ?`;
    db.query(query, [orderCode], (error, results) => {
      if (error) {
        console.error("Error querying database:", error);
        res.status(500);
        return;
      }
      if (results.length === 0) {
        res
          .status(404)
          .json({ error: "Không tìm thấy sản phẩm cho OrderCode đã cho." });
        return;
      }

      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi khi xử lý yêu cầu." });
  }
});

//badge
app.get("/api/orders/count/:userID", (req, res) => {
  const userID = req.params.userID;

  const count1Query = `SELECT COUNT(DISTINCT OrderCode) AS count1 FROM order_detail WHERE Status = 'Đang xử lý' AND UserID = ?`;
  const count2Query = `SELECT COUNT(DISTINCT OrderCode) AS count2 FROM order_detail WHERE Status = 'Đã gửi hàng' AND UserID = ?`;
  const count3Query = `SELECT COUNT(DISTINCT OrderCode) AS count3 FROM order_detail WHERE Status = 'Đã nhận hàng' AND UserID = ?`;

  db.query(count1Query, userID, (err1, result1) => {
    if (err1) {
      console.error("Error executing count1 query:", err1);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    db.query(count2Query, userID, (err2, result2) => {
      if (err2) {
        console.error("Error executing count2 query:", err2);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      db.query(count3Query, userID, (err3, result3) => {
        if (err3) {
          console.error("Error executing count3 query:", err3);
          res.status(500).json({ error: "Internal server error" });
          return;
        }

        const count1 = result1[0].count1;
        const count2 = result2[0].count2;
        const count3 = result3[0].count3;

        res.json({ count1, count2, count3 });
      });
    });
  });
});

//Tính tổng tiền
app.get("/api/orders/total/:orderCode", (req, res) => {
  const orderCode = req.params.orderCode;
  const totalPaymentSql = `
      SELECT OrderCode, SUM(Price * Quantity) AS Total, 
      (SELECT SUM(Price * Quantity) 
       FROM order_detail s2 
       WHERE s2.OrderCode = s1.OrderCode) AS TotalPayment 
      FROM order_detail s1 
      WHERE OrderCode = ? 
      GROUP BY OrderCode`;
  db.query(totalPaymentSql, [orderCode], (err, results) => {
    if (err) {
      res
        .status(500)
        .send({ success: false, message: "Failed to retrieve total payment" });
      throw err;
    }
    if (results.length > 0) {
      res
        .status(200)
        .send({ success: true, totalPayment: results[0].TotalPayment });
    } else {
      res.status(404).send({ success: false, message: "Order not found" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});