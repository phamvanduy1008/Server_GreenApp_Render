import mysql from 'mysql';

const connection = mysql.createConnection({
  host: '45.76.159.39', 
  user: 'phamvan_duy', 
  password: 'Duy@10082004', 
  database: 'phamvan_server' 
});

// Kết nối database
connection.connect(err => {
  if (err) {
    console.error('Lỗi kết nối database:', err);
    return;
  }
  console.log('Kết nối database thành công!');

  // Lấy dữ liệu từ bảng 'admin'
  const query = 'SELECT * FROM user';
  connection.query(query, (err, results, fields) => {
    if (err) {
      console.error('Lỗi truy vấn dữ liệu:', err);
      return;
    }
    console.log('Dữ liệu từ bảng "user":');
    console.log(results);

    // Đóng kết nối database
    connection.end();
  });
});