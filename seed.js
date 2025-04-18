import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("greentree_app");

    // Clear existing data
    await Promise.all([
      db.collection("admins").deleteMany({}),
      db.collection("users").deleteMany({}),
      db.collection("categories").deleteMany({}),
      db.collection("plants").deleteMany({}),
      db.collection("infor").deleteMany({}),
      db.collection("products").deleteMany({}),
      db.collection("usercarts").deleteMany({}),
      db.collection("sellers").deleteMany({}),
      db.collection("contacts").deleteMany({}),
    ]);

    // Seed Admins
    const admins = [
      {
        _id: new ObjectId(),
        email: "admin001@gmail.com",
        password: await bcrypt.hash("admin001", 10),
        name: "Admin One",
        role: "superadmin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        email: "admin002@gmail.com",
        password: await bcrypt.hash("admin002", 10),
        name: "Admin Two",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("admins").insertMany(admins);

    // Seed Users
    const users = [
      {
        _id: new ObjectId(),
        email: "binhnguyenpk24@gmail.com",
        password: await bcrypt.hash("123456", 10),
        profile: {
          full_name: "Nguyen Van Binh",
          username: "binhnguyen",
          gender: "male",
          birthday: new Date("1995-06-05"),
          phone: "0394865791",
          avatar: "",
          address: "470 Tran Dai Nghia, Hòa Quý, Ngũ Hành Sơn, Đà Nẵng",
        },
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        email: "lethithuvi2507@gmail.com",
        password: await bcrypt.hash("vigamai", 10),
        profile: {
          full_name: "Le Thi Thu Vi",
          username: "thuvi",
          gender: "female",
          birthday: new Date("1997-07-25"),
          phone: "0987654321",
          avatar: "",
          address: "123 Le Loi, Hai Chau, Đà Nẵng",
        },
        isActive: true,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        email: "nguyenbi379@gmail.com",
        password: await bcrypt.hash("123456", 10),
        profile: {
          full_name: "Nguyen Van Bi",
          username: "nguyenbi",
          gender: "male",
          birthday: new Date("1990-03-15"),
          phone: "0912345678",
          avatar: "",
          address: "456 Nguyen Van Linh, Thanh Khe, Đà Nẵng",
        },
        isActive: true,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("users").insertMany(users);

    // Seed Categories
    const categories = [
      {
        _id: new ObjectId(),
        name: "Cây ăn quả",
        status: "active",
        description: "Các loại cây ăn quả như xoài, cam",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cây công nghiệp",
        status: "active",
        description: "Các loại cây công nghiệp như cà phê, cao su",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cây lương thực",
        status: "active",
        description: "Các loại cây lương thực như lúa, sắn",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Rau củ",
        status: "active",
        description: "Các loại rau củ như rau muống, cải xanh",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("categories").insertMany(categories);

    // Seed Plants
    const plants = [
      {
        _id: new ObjectId(),
        name: "Cây cà phê",
        avgPriceYesterday: 58000,
        avgPriceNow: 58300,
        category: categories[1]._id,
        description: "Cây cà phê chất lượng cao, phù hợp vùng cao nguyên",
        image: "https://res.cloudinary.com/dc4w5fgc3/image/upload/v1715331730/products/coffee.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cây xoài",
        avgPriceYesterday: 34500,
        avgPriceNow: 35000,
        category: categories[0]._id,
        description: "Cây xoài ngọt, thích hợp trồng ở miền Nam",
        image: "https://res.cloudinary.com/dc4w5fgc3/image/upload/v1715331731/products/mangiferaIndica_yqi8lv.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cây lúa",
        avgPriceYesterday: 13500,
        avgPriceNow: 13400,
        category: categories[2]._id,
        description: "Cây lúa năng suất cao, thích hợp đồng bằng",
        image: "https://res.cloudinary.com/dc4w5fgc3/image/upload/v1715331732/products/om7347_ruutwy.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cam sành",
        avgPriceYesterday: 25000,
        avgPriceNow: 27000,
        category: categories[0]._id,
        description: "Cây cam sành ngọt, mọng nước",
        image: "https://example.com/images/cam.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Rau muống",
        avgPriceYesterday: 8000,
        avgPriceNow: 9000,
        category: categories[3]._id,
        description: "Rau muống tươi, dễ trồng",
        image: "https://example.com/images/raumuong.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("plants").insertMany(plants);

    // Seed Infor (Plant Information)
    const infor = [
      {
        _id: new ObjectId(),
        climate: "Nhiệt độ 18-28°C, thích hợp cho Arabica hoặc Robusta",
        land: "Đất giàu chất hữu cơ, pH 6-6.5, thoát nước tốt",
        target: "Sản xuất cà phê chất lượng cao",
        time: "Trồng vào mùa xuân hoặc mùa mưa",
        water: "Tưới đều đặn, đặc biệt trong mùa khô",
        fertilize: "Sử dụng phân hữu cơ và NPK",
        grass: "Cắt cỏ hoặc dùng thuốc diệt cỏ an toàn",
        insect: "Kiểm soát côn trùng bằng phương pháp hữu cơ hoặc hóa học",
        disease: "Phòng bệnh nấm, sương mai bằng thuốc trừ nấm",
        harvest: "Thu hoạch khi quả chín đỏ (80-90%)",
        preserve: "Phơi khô, đóng gói kín để bảo quản",
        plant: plants[0]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        climate: "Nhiệt đới, nhiệt độ 25-35°C",
        land: "Đất phù sa, thoát nước tốt",
        target: "Sản xuất xoài ngọt, chất lượng cao",
        time: "Trồng vào mùa xuân",
        water: "Tưới đều, tránh ngập úng",
        fertilize: "Phân hữu cơ và NPK theo mùa",
        grass: "Cắt cỏ định kỳ",
        insect: "Phòng sâu đục thân, rệp",
        disease: "Phòng bệnh thán thư, đốm lá",
        harvest: "Thu hoạch khi quả chín vàng",
        preserve: "Bảo quản ở nhiệt độ mát, đóng gói cẩn thận",
        plant: plants[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        climate: "Nhiệt đới",
        land: "Phù sa",
        target: "Trồng kinh tế",
        time: "6 tháng",
        water: "Mỗi ngày",
        fertilize: "Hữu cơ",
        grass: "Nhổ tay",
        insect: "Phun thuốc",
        disease: "Thối rễ",
        harvest: "Sau 6 tháng",
        preserve: "Kho mát",
        plant: plants[3]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        climate: "Ôn đới",
        land: "Đất mùn",
        target: "Tiêu dùng gia đình",
        time: "1 tháng",
        water: "2 ngày/lần",
        fertilize: "NPK",
        grass: "Cắt định kỳ",
        insect: "Sâu lá",
        disease: "Vàng lá",
        harvest: "Sau 30 ngày",
        preserve: "Tủ lạnh",
        plant: plants[4]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("infor").insertMany(infor);

    // Seed Products
    const products = [
      {
        _id: new ObjectId(),
        name: "Cà phê Arabica",
        price: 20000,
        info: "Cà phê Arabica có hương vị tinh tế, chất lượng cao",
        image: "https://res.cloudinary.com/dc4w5fgc3/image/upload/v1715331730/products/arabica_ydjfq6.jpg",
        status: "available",
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[1]._id,
        plant: plants[0]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Xoài cát Hòa Lộc",
        price: 20000,
        info: "Xoài cát Hòa Lộc ngọt, thơm",
        image: "https://res.cloudinary.com/dc4w5fgc3/image/upload/v1715331730/products/xoaicat_inciuv.jpg",
        status: "available",
evaluate: Math.random() * (5 - 4) + 4,
        category: categories[0]._id,
        plant: plants[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Lúa OM7347",
        price: 5000,
        info: "Giống lúa năng suất cao, chất lượng xuất khẩu",
        image: "https://res.cloudinary.com/dc4w5fgc3/image/upload/v1715331732/products/om7347_ruutwy.jpg",
        status: "available",
evaluate: Math.random() * (5 - 4) + 4,
        category: categories[2]._id,
        plant: plants[2]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cam sành loại 1",
        price: 27000,
        info: "Cam ngọt, sạch, mọng nước",
        image: "https://example.com/images/cam.jpg",
        status: "available",
evaluate: Math.random() * (5 - 4) + 4,
        category: categories[0]._id,
        plant: plants[3]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Rau muống sạch",
        price: 9000,
        info: "Rau muống tươi mỗi sáng",
        image: "https://example.com/images/raumuong.jpg",
        status: "available",
evaluate: Math.random() * (5 - 4) + 4,
        category: categories[3]._id,
        plant: plants[4]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("products").insertMany(products);

    // Seed UserCarts
    const userCarts = [
      {
        _id: new ObjectId(),
        product: products[0]._id,
        quantity: 2,
        user: users[0]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        product: products[1]._id,
        quantity: 3,
        user: users[0]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        product: products[3]._id,
        quantity: 5,
        user: users[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        product: products[4]._id,
        quantity: 10,
        user: users[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("usercarts").insertMany(userCarts);

    // Seed Sellers (Orders)
    const sellers = [
      {
        _id: new ObjectId(),
        user: users[0]._id,
        product: products[0]._id,
        quantity: 2,
        price: 20000,
        status: "pending",
        orderCode: "ORD001",
        dateOrder: new Date("2024-06-05"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        user: users[0]._id,
        product: products[1]._id,
        quantity: 3,
        price: 20000,
        status: "shipped",
        orderCode: "ORD002",
        dateOrder: new Date("2024-06-06"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        user: users[1]._id,
        product: products[3]._id,
        quantity: 5,
        price: 27000,
        status: "delivered",
        orderCode: "ORD003",
        dateOrder: new Date("2024-06-07"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        user: users[1]._id,
        product: products[4]._id,
        quantity: 10,
        price: 9000,
        status: "confirmed",
        orderCode: "ORD004",
        dateOrder: new Date("2024-06-08"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("sellers").insertMany(sellers);

    // Seed Contacts
    const contacts = [
      {
        _id: new ObjectId(),
        content: "Tôi muốn biết thêm thông tin về cà phê Arabica",
        user: users[0]._id,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        content: "Tôi cần tư vấn về cách trồng rau muống sạch",
        user: users[1]._id,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        content: "Cam sành có sẵn quanh năm không?",
        user: users[2]._id,
        status: "resolved",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("contacts").insertMany(contacts);

    console.log("✅ Đã thêm đầy đủ dữ liệu mẫu!");
  } catch (error) {
    console.error("Lỗi khi thêm dữ liệu:", error);
  } finally {
    await client.close();
  }
}

run();