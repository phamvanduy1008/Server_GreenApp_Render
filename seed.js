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
        name: "Hỗ trợ viên",
        role: "superadmin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        email: "admin002@gmail.com",
        password: await bcrypt.hash("admin002", 10),
        name: "Chăm sóc khách hàng",
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
        email: "duy@gmail.com",
        password: await bcrypt.hash("123456", 10),
        profile: {
          full_name: "Phạm Văn Duy ",
          username: "duyduy",
          gender: "male",
          birthday: new Date("1995-06-05"),
          phone: "0394865791",
          avatar: "",
        },
        isActive: true,
        isVerified: true,
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
        image: "images/category/cayanqua.png",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cây công nghiệp",
        status: "active",
        image: "images/category/caycongnghiep.png",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cây lương thực",
        status: "active",
        image: "images/category/cayluongthuc.png",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Rau củ",
        status: "active",
        image: "images/category/raucu.png",
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cây cao su",
        avgPriceYesterday: 34500,
        avgPriceNow: 35000,
        category: categories[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cây Xoài",
        avgPriceYesterday: 13500,
        avgPriceNow: 13400,
        category: categories[0]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cây lúa",
        avgPriceYesterday: 25000,
        avgPriceNow: 27000,
        category: categories[2]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cây mía",
        avgPriceYesterday: 8000,
        avgPriceNow: 9000,
        category: categories[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cây tiêu",
        avgPriceYesterday: 8000,
        avgPriceNow: 9000,
        category: categories[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cây Điều",
        avgPriceYesterday: 8000,
        avgPriceNow: 9000,
        category: categories[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cây sầu riêng",
        avgPriceYesterday: 8000,
        avgPriceNow: 9000,
        category: categories[0]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cây thông",
        avgPriceYesterday: 8000,
        avgPriceNow: 9000,
        category: categories[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("plants").insertMany(plants);

    // Seed Infor (Plant Information)
    const infors = [
      {
        _id: new ObjectId(),
        climate: "Cà phê thích nhiệt độ ổn định, không quá nóng hay quá lạnh. Nhiệt độ tốt cho cây cà phê là từ 18-28 độ C.\r\nĐối với các khu vực có khí hậu nóng, nên chọn giống cà phê chịu nhiệt như Robusta. Nếu khí hậu mát mẻ, Arabica là lựa chọn phổ biến hơn.",
        land: "Cà phê cần đất có độ dẫn nước tốt và thoát nước tốt.\r\nĐất nên giàu chất hữu cơ và có pH từ 6-6.5. Nếu đất quá nghèo, cần phân bón để bổ sung chất dinh dưỡng cần thiết cho cây.",
        target: "Nếu bạn muốn sản xuất cà phê chất lượng cao, Arabica là giống thích hợp.\r\nNếu bạn muốn cây cà phê chịu được điều kiện khí hậu khắc nghiệt và có sản lượng cao hơn, Robusta là lựa chọn tốt.",
        time: "Về thời điểm trồng cây cà phê, nó có thể thay đổi tùy theo vùng và loại giống. Tuy nhiên, thường thì cà phê được trồng vào mùa xuân hoặc mùa mưa.\r\nĐể biết thời điểm cụ thể, tốt nhất là tham khảo ý kiến của các chuyên gia nông nghiệp địa phương hoặc nghiên cứu thêm thông tin về khu vực trồng cây cà phê mà bạn quan tâm.",
        water: "Mùa mưa: Trong mùa mưa, tưới nước có thể dựa vào lượng mưa tự nhiên. Nếu lượng mưa không đủ, cần tưới thêm để đảm bảo độ ẩm cho cây.\r\nMùa khô: Trong mùa khô, tưới nước cần được thực hiện đều đặn, đặc biệt là vào các tháng khô hạn. Đảm bảo cây cà phê nhận đủ nước để phát triển.",
        fertilize: "Mùa mưa: Trong mùa mưa, cây cà phê cần được bón phân để đảm bảo sự phát triển tốt. Có thể sử dụng phân hữu cơ và phân NPK (Nitơ, Phốt pho, Kali) để cung cấp dinh dưỡng cho cây.\r\nMùa khô: Trong mùa khô, cây cà phê cần nhận được phân bón để duy trì sức khỏe. Cũng có thể sử dụng phân hữu cơ và phân NPK để bón cho cây.",
        grass: "Giữ vùng gốc cây cà phê sạch sẽ bằng cách cắt bỏ cỏ hoặc dùng phương pháp phun thuốc diệt cỏ an toàn cho cây cà phê.",
        insect: "Theo dõi và kiểm tra cây thường xuyên để phát hiện sự hiện diện của côn trùng.\r\nSử dụng phương pháp hữu cơ hoặc hóa học để kiểm soát côn trùng gây hại.",
        disease: "1. Bệnh nhiễm trùng nấm:\r\nDấu hiệu: Lá cây có các vết đốm màu nâu, trắng, hoặc đen. Lá có thể bị héo và rụng sớm.\r\nCách khắc phục: Sử dụng thuốc trừ nấm phù hợp để kiểm soát nhiễm trùng. Loại bỏ những lá bị nhiễm trùng và tiến hành vệ sinh vùng gốc.\r\n\r\n2. Bệnh nhiễm khuẩn:\r\nDấu hiệu: Lá cây có các vết đốm màu nâu đen, thường có một vòng màu sáng ở xung quanh. Cây có thể bị chết từ nhánh đến cả cây trưởng thành.\r\nCách khắc phục: Loại bỏ và tiêu hủy các cây bị nhiễm khuẩn. Sử dụng thuốc trừ khuẩn để ngăn chặn sự lây lan.\r\n\r\n3. Bệnh sương mai:\r\nDấu hiệu: Lá cây có các đốm trắng như vết sương, sau đó chuyển thành màu nâu đen. Lá bị héo và có thể rụng.\r\nCách khắc phục: Sử dụng thuốc trừ nấm để kiểm soát sương mai. Thông thoáng không gian quanh cây để giảm độ ẩm và sự lây lan của bệnh.\r\n\r\n4. Côn trùng gây hại:\r\nDấu hiệu: Cây bị tấn công bởi sâu bướm, rệp, hay côn trùng nhỏ khác. Có thể thấy tổ và vết ăn trên lá, thân cây hoặc quả.\r\nCách khắc phục: Sử dụng phương pháp kiểm soát côn trùng an toàn như sử dụng thuốc trừ côn trùng hữu cơ hoặc sử dụng một số loại vi khuẩn hoặc loài côn trùng có lợi để tiêu diệt côn trùng gây hại.",
        harvest: "Cà phê Robusta thường được thu hoạch khi quả đã chín đến 80-90%. Quả chín có màu đỏ hoặc tím tùy thuộc vào giống cây.\r\nCà phê Arabica được thu hoạch khi quả đã chín hoàn toàn, có màu đỏ tươi.",
        preserve: "Loại bỏ lớp vỏ và mầm: Sau khi thu hoạch, lớp vỏ và mầm của quả cà phê cần được loại bỏ. Có thể sử dụng các thiết bị như máy lột vỏ để giúp tách lớp vỏ và mầm ra khỏi hạt cà phê.\r\n\r\nLàm sạch và phơi khô: Hạt cà phê sau khi được tách lớp vỏ cần được làm sạch và phơi khô. Có thể sử dụng các bàn phơi hoặc hệ thống phơi tự động để đảm bảo hạt cà phê khô hoàn toàn trước khi đóng gói.\r\n\r\nĐóng gói: Hạt cà phê sau khi đã được làm sạch và phơi khô cần được đóng gói kín để bảo quản chất lượng. Sử dụng túi chống ẩm và bọc ngoài để ngăn tiếp xúc với độ ẩm và ánh sáng.",
        plant: plants[0]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        climate: "- Cây cao su thích nhiệt đới và nhiệt đới gió mùa với nhiệt độ trung bình hàng năm từ 20-34°C. Đối với cây cao su, lượng mưa trung bình hàng năm cần dao động từ 1.500mm đến 3.500mm. Ngoài ra, cây cao su cần có thời kỳ khô rõ rệt để sinh trưởng tốt. Vì vậy, hãy chọn giống cây cao su phù hợp với điều kiện khí hậu của vùng bạn muốn trồng.",
        land: "- Cây cao su cần đất có độ pH từ 4,5-6,5 và có độ thoát nước tốt. Đất cần có khả năng thoát nước tốt để tránh tình trạng ngập úng và đảm bảo sự phát triển của hệ rễ cây cao su. Ngoài ra, đất nên giàu chất hữu cơ và có khả năng cung cấp các chất dinh dưỡng cần thiết.",
        target: "- Có những giống cây cao su được phát triển để sản xuất mủ cao su, trong khi những giống khác có khả năng tạo ra cây trồng to và mạnh mẽ. Hãy xác định rõ mục tiêu kinh doanh của bạn, liệu bạn muốn tập trung vào sản xuất mủ cao su hay muốn có cây cao su lớn để khai thác gỗ.",
        time: "- Mùa xuân: Thời gian từ tháng 2 đến tháng 4 là một thời điểm phổ biến để trồng cây cao su ở khu vực này. Trong giai đoạn này, thời tiết ấm áp và độ ẩm tương đối cao, điều kiện lý tưởng cho cây cao su phát triển. Tuy nhiên, bạn cần xem xét các yếu tố khí hậu đặc thù của vùng cụ thể bạn định trồng để chọn thời điểm phù hợp.\r\n- Mùa hè: Thời gian từ tháng 6 đến tháng 8 cũng là một thời điểm thích hợp để trồng cây cao su. Trong mùa hè, nhiệt độ cao và lượng mưa thường ít hơn so với mùa xuân, nhưng vẫn đủ để hỗ trợ sự sinh trưởng của cây cao su.",
        water: "- Mùa mưa: Trong mùa mưa, tưới nước có thể dựa vào lượng mưa tự nhiên. Nếu lượng mưa không đủ, cần tưới thêm để đảm bảo độ ẩm cho cây.\r\n- Mùa khô: Trong mùa khô, tưới nước cần được thực hiện đều đặn, đặc biệt là vào các tháng khô hạn. Đảm bảo cây cà phê nhận đủ nước để phát triển.",
        fertilize: "- Mùa mưa: Trong mùa mưa, cây cà phê cần được bón phân để đảm bảo sự phát triển tốt. Có thể sử dụng phân hữu cơ và phân NPK (Nitơ, Phốt pho, Kali) để cung cấp dinh dưỡng cho cây.\r\n- Mùa khô: Trong mùa khô, cây cà phê cần nhận được phân bón để duy trì sức khỏe. Cũng có thể sử dụng phân hữu cơ và phân NPK để bón cho cây.",
        grass: "Để kiểm soát cỏ xung quanh cây cao su, có thể sử dụng các phương pháp như cỏ vụn, đắp trấu, phun thuốc diệt cỏ hoặc tưới chất diệt cỏ.",
        insect: "Để kiểm soát côn trùng gây hại cho cây cao su, có thể sử dụng các biện pháp như phun thuốc trừ sâu hoặc sử dụng các loại thuốc trừ sâu hóa học.",
        disease: "1. Dấu hiệu bệnh: Lá và thân cây có màu vàng, héo, khô.\r\n- Khắc phục: Kiểm tra và xác định nguyên nhân gây ra tình trạng này. Có thể là do thiếu nước, bệnh nấm, sâu bệnh, hoặc thiếu dinh dưỡng. Thực hiện phun thuốc trừ sâu, điều chỉnh việc tưới nước và bón phân phù hợp.\r\n2. Dấu hiệu bệnh: Rễ bị mục, nứt, sưng, hoặc bị nhiễm trùng.\r\n- Khắc phục: Kiểm tra hệ thống thoát nước, đảm bảo cung cấp đủ oxy cho rễ. Thực hiện xử lý vết thương, vệ sinh rễ và bón phân hữu cơ để tái tạo sức khỏe cho cây.\r\n3. Dấu hiệu bệnh: Lá bị đốm, nhiễm trùng, và có mảng trắng, đen hoặc nâu.\r\n- Khắc phục: Xác định loại bệnh gây ra dấu hiệu này (như bệnh nấm, vi khuẩn). Sử dụng phương pháp kiểm soát bệnh tương ứng, chẳng hạn như sử dụng thuốc diệt nấm hoặc thuốc diệt vi khuẩn, điều chỉnh độ ẩm và thông gió để giảm môi trường lý tưởng cho sự phát triển của bệnh.\r\n4. Dấu hiệu bệnh: Cây bị tấn công bởi côn trùng gây hại như sâu đục thân, rệp cánh, bọ trĩ,…\r\n- Khắc phục: Sử dụng các biện pháp kiểm soát côn trùng như phun thuốc trừ sâu, dùng mối cản truyền để ngăn chặn sự lây lan của côn trùng, và thực hiện kiểm tra định kỳ để phát hiện và xử lý vấn đề kịp thời.",
        harvest: "- Khi cây cao su đạt độ tuổi thu hoạch (thường từ 6-7 năm trở lên), đoạn thời gian tốt nhất để thu hoạch là vào mùa khô.\r\n- Sử dụng dao cạo để cạo vỏ cao su trên thân cây. Vết cạo được thực hiện dọc theo chiều vòng quanh cây và có độ sâu tùy thuộc vào yêu cầu của nhà sản xuất.",
        preserve: "- Sau khi thu hoạch, cao su được chế biến thành các dạng sản phẩm khác nhau như lá cao su, hạt cao su, mủ cao su, hoặc các sản phẩm cao su công nghiệp khác.\r\n- Đối với mủ cao su, nó được đông lạnh để ngăn chặn sự phát triển của vi khuẩn và nấm, sau đó được vận chuyển đến các nhà máy chế biến.\r\n- Các sản phẩm cao su khác, như lá cao su hoặc hạt cao su, cần được đóng gói và bảo quản trong điều kiện khô ráo, thoáng mát và không bị ẩm ướt.",
        plant: plants[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        climate: "- Giống cây tiêu có thể khá nhạy cảm với điều kiện khí hậu. Tiêu thích hợp trồng ở vùng nhiệt đới và cận nhiệt đới, nơi có nhiệt độ trung bình từ 20 đến 35 độ C và độ ẩm tương đối cao. Ngoài ra, tiêu cũng cần ánh sáng mặt trời đầy đủ và không chịu được động lạnh.",
        land: "- Đất phù hợp cho trồng tiêu là đất có độ thoát nước tốt, giàu chất hữu cơ, pH từ 5.5 đến 7.0 và có khả năng giữ ẩm. Các giống tiêu có thể có sự khác biệt trong việc đánh giá đất. Ví dụ, một số giống tiêu có thể phát triển tốt trên đất cát, trong khi một số giống khác có thể phù hợp hơn với đất phù sa.",
        target: "- Một số giống tiêu có năng suất cao và thời gian sinh trưởng ngắn, là lựa chọn tốt cho những người muốn đạt hiệu suất kinh doanh cao và thu hoạch nhanh. Trong khi đó, có những giống tiêu chuyên dùng cho mục đích chế biến như làm gia vị, chất làm kem, hay chất tạo màu, nên được chọn tùy theo mục đích kinh doanh cụ thể.",
        time: "- Thường diễn ra vào khoảng tháng 3 đến tháng 5 hàng năm. Đây là giai đoạn mùa xuân, khi thời tiết ổn định và nhiệt độ cao, tạo điều kiện thuận lợi cho sự phát triển của cây tiêu.",
        water: "- Mùa mưa: Trong mùa mưa, cây tiêu thường không cần tưới nước thêm do có đủ lượng nước từ mưa.\r\n- Mùa khô: Trong mùa khô, tưới nước cho cây tiêu cần được thực hiện một cách đều đặn. Tốt nhất là tưới sâu vào gốc cây và tránh tưới lên lá để tránh các bệnh nấm.",
        fertilize: "- Mùa mưa: Trong mùa mưa, cây tiêu cần bón phân hữu cơ để cung cấp dinh dưỡng cho cây. Có thể sử dụng phân chuồn chuồn, phân bò, phân heo, hoặc phân rơm để bón cho cây tiêu.\r\n- Mùa khô: Trong mùa khô, cây tiêu cần bón phân hỗn hợp chứa các nguyên tố dinh dưỡng chính như Nitơ (N), Phốtpho (P), Kali (K). Có thể sử dụng phân NPK hoặc phân hữu cơ để bón cho cây tiêu.",
        grass: "Để kiểm soát cỏ xung quanh cây tiêu, có thể sử dụng phương pháp chướng ngại vật vật lý (ví dụ: đặt vật liệu che phủ dưới cây tiêu) hoặc sử dụng thuốc diệt cỏ mà không gây ảnh hưởng đến cây tiêu.",
        insect: "Kiểm soát côn trùng gây hại như sâu bệnh bệnh đục thân cây, sâu xanh và ve cây tiêu có thể được thực hiện bằng cách sử dụng thuốc trừ sâu an toàn cho cây tiêu.",
        disease: "1. Bệnh lá khô:\r\n- Dấu hiệu: Lá cây tiêu bị khô, héo và chết từ cành gốc lên đến ngọn.\r\n- Khắc phục: Loại bỏ và tiêu hủy những cây bị nhiễm bệnh. Sử dụng thuốc phun chống nấm để ngăn chặn sự lây lan của bệnh.\r\n2. Bệnh đốm lá:\r\n- Dấu hiệu: Xuất hiện các đốm màu nâu hoặc đen trên lá cây. Các đốm có thể lớn dần và kéo dài trên toàn bộ lá.\r\n- Khắc phục: Cắt bỏ và tiêu hủy những lá bị nhiễm bệnh. Sử dụng thuốc phun chống nấm để ngăn chặn sự lây lan của bệnh.\r\n3. Bệnh thối rễ:\r\n- Dấu hiệu: Rễ cây tiêu bị sưng to, chuyển sang màu nâu hoặc đen. Rễ mục nát và phân hủy.\r\n- Khắc phục: Điều chỉnh lượng nước tưới phù hợp. Tránh tưới nước quá nhiều và cải thiện thông thoáng cho đất trồng. Sử dụng các loại thuốc phun chống nấm có tác dụng chống lại bệnh thối rễ.\r\n4. Bệnh sâu cuốn lá:\r\n- Dấu hiệu: Các sâu cuốn lá gấp và tạo nơi ẩn náu bên trong cuốn lá, gây ra hỏng hóc và chết lá.\r\n- Khắc phục: Sử dụng thuốc trừ sâu hữu cơ hoặc hóa học an toàn để tiêu diệt sâu cuốn lá. Thực hiện kiểm tra định kỳ và loại bỏ các cuốn lá bị nhiễm sâu.",
        harvest: "- Thời điểm thu hoạch: Cây tiêu thường được thu hoạch khi quả tiêu đã chuyển từ màu xanh sang màu đỏ đậm. Thời điểm thu hoạch thường dao động từ 7 đến 9 tháng sau khi trồng.\r\n- Phương pháp thu hoạch: Quả tiêu được cắt từ cành bằng kéo hoặc dao sắc. Cần đảm bảo không gây tổn thương đến cây và quả tiêu.",
        preserve: "- Loại bỏ các chất còn dính trên bề mặt quả tiêu bằng cách rửa sạch quả trong nước.\r\n- Phơi quả tiêu dưới ánh nắng mặt trời trong khoảng 2-3 ngày để làm khô bề mặt và giảm độ ẩm.\r\n- Lựa chọn quả tiêu khỏe mạnh và không bị hư hỏng để lưu trữ. Loại bỏ những quả tiêu bị nứt, sâu bệnh hoặc có bất kỳ dấu hiệu hỏng hóc nào.\r\n- Để quả tiêu trong các túi lưới hoặc thùng gỗ để tạo điều kiện thông gió và giữ được độ ẩm tương đối hợp lý. Đồng thời, tránh đặt quả tiêu trực tiếp trên mặt đất để tránh nấm mốc và vi khuẩn.\r\n- Đặt quả tiêu trong điều kiện thoáng mát, khô ráo và tránh tiếp xúc trực tiếp với ánh sáng mặt trời.\r\n- Theo dõi thường xuyên quả tiêu đã thu hoạch để phát hiện sớm bất kỳ quả bị hư hỏng hoặc nhiễm bệnh. Loại bỏ ngay những quả tiêu đó để không ảnh hưởng đến quả còn lại.",
        plant: plants[5]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        climate: "- Nếu khu vực có khí hậu nóng, khô và có mùa mưa ngắn, bạn có thể xem xét chọn giống cây điều kháng hạn, chịu được nhiệt đới như W320, W240, SW320, SW240, WS, SP, LWP.\r\n- Nếu khu vực có khí hậu ẩm ướt với mưa quanh năm, giống cây chịu ẩm có thể là lựa chọn tốt, ví dụ như giống BB, BTR, W450.",
        land: "- Điều có thể được trồng trên các loại đất khác nhau, nhưng đất cát, đất phù sa hoặc đất sét cát có độ thoát nước tốt là lựa chọn tốt cho cây điều.\r\n- Nếu đất có độ pH cao, bạn có thể xem xét chọn giống cây điều chịu kiềm như W320, W240.",
        target: "- Nếu mục tiêu kinh doanh của bạn là sản xuất điều rang muối, các giống cây điều lớn như LWP, SW320, SW240 sẽ cho năng suất cao.\r\n- Nếu bạn muốn sản xuất điều hạt, các giống cây điều nhỏ như WW180, WW210 sẽ phù hợp.",
        time: "- Thời điểm trồng cây điều phụ thuộc vào vùng địa lý và điều kiện thời tiết của khu vực đó. Tuy nhiên, thông thường cây điều thường được trồng vào mùa xuân hoặc mùa đông. Ở các vùng khí hậu ôn đới, thường trồng vào khoảng tháng 3 đến tháng 4. Trong khi ở các vùng nhiệt đới, có thể trồng quanh năm.",
        water: "- Mùa mưa: Trong mùa mưa, cây điều thường không cần tưới nước bổ sung, vì lượng mưa đủ đáp ứng nhu cầu nước của cây.\r\n- Mùa khô: Trong mùa khô, tưới nước cây điều cần tuân theo nguyên tắc tưới ít nhưng thường xuyên. Tưới vào buổi sáng sớm hoặc buổi tối để tránh bốc hơi nhanh.",
        fertilize: "- Mùa mưa: Trong mùa mưa, bạn có thể sử dụng phân hữu cơ, phân bón tổng hợp hoặc phân hữu cơ pha phân bón hóa học. Cách bón phân tùy thuộc vào từng loại phân cụ thể, nhưng thường phân được bón xung quanh gốc cây và sau đó đào nhẹ đất để phân hòa vào đất.\r\n- Mùa khô: Trong mùa khô, bạn có thể sử dụng phân bón hữu cơ hoặc phân bón tổng hợp. Cách bón phân cũng tương tự như trong mùa mưa.",
        grass: "Trong quá trình trồng và nuôi cây điều, cần tiến hành kiểm soát cỏ bằng cách cắt cỏ hoặc sử dụng thuốc diệt cỏ.",
        insect: "Có thể sử dụng các loại thuốc diệt côn trùng để ngăn chặn sự tấn công của côn trùng gây hại như bọ xít, rầy nâu, sâu cuốn lá, và sâu bệnh.",
        disease: "Cây điều có thể bị các bệnh như đốm lá, đạo ôn...",
        harvest: "- Thời điểm thu hoạch cây điều phụ thuộc vào giống và điều kiện trồng, nhưng thường diễn ra sau khoảng 3-4 năm sau khi cây được trồng.\r\n- Cây điều được thu hoạch khi quả đã chín đạt màu nâu đỏ hoặc vàng nâu. Kiểm tra bằng cách chạm nhẹ vào quả, nếu quả rụng dễ dàng và không còn cảm giác mềm mại quá mức thì đã đến lúc thu hoạch.\r\n- Sử dụng công cụ như gậy đánh, cây cưa hoặc kéo để thu hoạch quả từ cây điều.",
        preserve: "- Sau khi thu hoạch, cây điều cần được xử lý và bảo quản để duy trì chất lượng.\r\n- Loại bỏ những quả bị hỏng, nứt, hoặc nhiễm bệnh.\r\n- Làm sạch quả bằng cách rửa nhẹ hoặc lau khô.\r\n- Để quả điều trong một nơi khô ráo, thông gió và không tiếp xúc với ánh nắng mặt trời trực tiếp.\r\n- Quả điều có thể được bảo quản trong các túi lưới hoặc hộp gỗ để giữ cho quả thông thoáng và tránh hư hỏng.",
        plant: plants[6]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        climate: "- Cây thông có thể sinh trưởng tốt trong nhiều điều kiện khí hậu khác nhau, nhưng vẫn có một số giống thông phù hợp hơn trong một số điều kiện cụ thể. Ví dụ, cây thông Douglas thích hợp với khí hậu mát mẻ và ẩm ướt, trong khi cây thông Aleppo có khả năng chịu hạn tốt hơn.",
        land: "- Cây thông có thể sinh trưởng trên nhiều loại đất, từ đất cát đến đất sét. Tuy nhiên, một số giống thông có khả năng chịu đựng đất ẩm tốt hơn, trong khi một số giống khác phát triển tốt trên đất cạn khô. Ví dụ, cây thông Sitka thích hợp với đất ẩm, trong khi cây thông loblolly thích hợp với đất sét nhiều chất hữu cơ.",
        target: "- Một số giống thông được trồng chủ yếu để cung cấp gỗ xây dựng, trong khi những giống khác thích hợp cho mục tiêu sản xuất gỗ nhanh chóng hoặc gỗ trang trí. Ví dụ, cây thông taeda thích hợp cho mục tiêu sản xuất gỗ nhanh chóng, trong khi cây thông balsam thường được trồng cho mục đích trang trí.",
        time: "- Thường diễn ra vào thời gian từ tháng 10 đến tháng 12 hàng năm. Đây là giai đoạn mùa đông, khi thời tiết có khí hậu mát mẻ và đủ độ ẩm để hỗ trợ sự phát triển ban đầu của cây thông.",
        water: "- Mùa mưa: Trong mùa mưa, thông thường không cần tưới nước bổ sung do lượng mưa đủ đáp ứng nhu cầu nước của cây.\r\n- Mùa khô: Trong mùa khô, cần tưới nước đều đặn để đảm bảo cây thông không bị thiếu nước. Hình thức tưới nước phù hợp là tưới sâu vào gốc cây và tránh tưới vào lá cây. Thời gian tưới nước nên chọn buổi sáng sớm hoặc chiều tối để tránh mất nước do bay hơi.",
        fertilize: "- Mùa mưa: Trong mùa mưa, cây thông có thể được bón phân hữu cơ như phân chuồn chuồn, phân bò, hoặc phân trâu để cung cấp dinh dưỡng cho cây.\r\n- Mùa khô: Trong mùa khô, có thể sử dụng phân bón hóa học hoặc phân hữu cơ để bổ sung chất dinh dưỡng cho cây thông. Một số loại phân bón cụ thể có thể sử dụng là phân NPK (Nitơ, Phốt pho, Kali), phân bón chuối (hoặc phân chuồn chuồn), phân bón hữu cơ từ rơm rạ, phân bón hữu cơ từ phân bò/trâu.",
        grass: "Đảm bảo vùng xung quanh cây thông không có quá nhiều cỏ dại cạnh tranh nguồn dinh dưỡng và không gian sinh trưởng của cây. Có thể dùng cỏ lục bình hoặc các phương pháp cơ bản khác để kiểm soát cỏ.",
        insect: "Theo dõi và kiểm tra cây thường xuyên để phát hiện sự hiện diện của côn trùng. Sử dụng thuốc trừ sâu để tiêu diệt chúng , sử dụng phương pháp sinh học , loại bỏ những cây bị nhiễm bệnh",
        disease: "1. Sâu bướm đục thân:\r\n- Dấu hiệu: Các lỗ nhỏ trên thân cây, bọt nhựa hoặc phân bẩn dính trên vỏ cây, sự yếu đuối và chết của cây.\r\n- Cách khắc phục: Kiểm tra thường xuyên và tiêu diệt bướm và sâu bằng cách thu thập và tiêu hủy chúng. Sử dụng thuốc trừ sâu hữu cơ nếu cần thiết.\r\n2. Bệnh nấm rụng lá:\r\n- Dấu hiệu: Lá cây thông bị nấm phát triển, có vết đốm màu nâu hoặc đen, lá rụng sớm.\r\n- Cách khắc phục: Thu gom và tiêu hủy lá rụng để ngăn chặn sự lây lan của nấm. Sử dụng thuốc trừ nấm hữu cơ và tuân thủ lịch trình phun thuốc chống nấm.\r\n3. Bệnh mục trên lá:\r\n- Dấu hiệu: Các vết đốm mục trên lá, có thể trở thành lỗ lớn và gây chết lá.\r\n- Cách khắc phục: Loại bỏ lá bị nhiễm bệnh và tiêu hủy để ngăn chặn sự lây lan. Sử dụng thuốc trừ nấm hữu cơ để kiểm soát bệnh.\r\n4. Rệp cánh màng:\r\n- Dấu hiệu: Lá cây thông bị bạc màu và mất sức sống, rệp nhỏ màu trắng hoặc xám chạy trên lá.\r\n- Cách khắc phục: Dùng cánh màng hoặc cây cỏ truyền thống để kiểm soát rệp. Nếu bệnh nặng, sử dụng thuốc trừ sâu thích hợp để tiêu diệt rệp.\r\n5. Bệnh nhiễm trùng rễ:\r\n- Dấu hiệu: Cây thông mất sức sống, lá và thân cây mất màu, gốc cây thối rữa.\r\n- Cách khắc phục: Tránh tình trạng dư nước và tăng cường thoáng khí cho rễ. Sử dụng chất trị bệnh như trichoderma để ngăn chặn sự phát triển của bệnh.",
        harvest: "- Thời điểm thu hoạch: Thông thường, thời điểm thu hoạch cây thông nằm trong khoảng từ 15-20 năm sau khi trồng tùy thuộc vào mục đích sử dụng và kích thước cây.\r\n- Kỹ thuật thu hoạch: Quá trình thu hoạch bao gồm chặt gốc cây thông và cắt nhánh để lấy gỗ thông. Cần sử dụng công cụ sắc bén và kỹ thuật an toàn để tránh gây tổn thương đến người và cây.",
        preserve: "- Tẩy tàn cây: Sau khi thu hoạch, tẩy tàn cây bằng cách loại bỏ các cành và lá cây không cần thiết để giảm nguy cơ lây nhiễm sâu bệnh và côn trùng.\r\n- Tạo bó: Gỗ thông sau khi thu hoạch có thể được tạo thành các bó gỗ thông để dễ dàng vận chuyển và bảo quản.\r\n- Lưu trữ: Cần lưu trữ gỗ thông ở một nơi khô ráo, thoáng mát và không tiếp xúc trực tiếp với đất. Đảm bảo không có ẩm ướt và môi trường phù hợp để tránh sự mục nát và nấm mốc.\r\n- Xử lý chống mối mọt: Để ngăn chặn mối mọt tấn công gỗ thông, có thể sử dụng các phương pháp xử lý chống mối mọt như sử dụng chất chống mối mọt, hấp thụ hoặc xử lý",
        plant: plants[8]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        climate: "- Cây mía thích nhiệt đới và khá nhạy cảm đối với nhiệt độ và lượng mưa. Hãy tìm hiểu về điều kiện khí hậu của khu vực trồng mía để chọn giống cây mía phù hợp. Một số giống cây mía chịu nhiệt đới như mía ROC22, mía ROC26 có khả năng chịu nhiệt tốt hơn so với các giống khác.",
        land: "- Cây mía cần đất có độ thông thoáng tốt, giàu chất hữu cơ và có khả năng giữ nước. Trước khi chọn giống mía, nên xác định đặc điểm đất của khu vực trồng. Mía GT11 có khả năng chịu đất nghèo và mía CP 72-2086 thích hợp với đất phù sa.",
        target: "- Mỗi giống mía có đặc điểm và tiềm năng kinh doanh riêng. Bạn cần xác định mục tiêu kinh doanh của bạn để chọn giống cây mía thích hợp. Ví dụ, nếu bạn muốn sản xuất đường mía, có thể lựa chọn giống cây mía có hàm lượng đường cao như mía CP 72-2086 hoặc mía ROC22.",
        time: "- Ở Miền Trung và Tây Nguyên Việt Nam, thời điểm trồng cây mía thường diễn ra từ cuối tháng 10 đến đầu tháng 12. Đây là mùa thu và đông, khi mà lượng mưa giảm và nhiệt độ thấp hơn so với mùa hè.\r\n- Trong khu vực này, mùa đông là thời điểm lý tưởng để trồng cây mía. Điều kiện khí hậu ở Miền Trung và Tây Nguyên trong thời gian này đáp ứng các yếu tố quan trọng cho sự phát triển của cây mía, bao gồm độ ẩm và nhiệt độ. Mùa đông cũng giúp cây mía phát triển rễ mạnh mẽ trước khi mùa mưa đến vào mùa hè.",
        water: "- Mùa mưa: Trong mùa mưa, cây mía thường không cần tưới nước thêm do có đủ lượng nước từ mưa.\r\n- Mùa khô: Trong mùa khô, tưới nước cho cây mía cần được thực hiện một cách đều đặn. Tưới nước bằng phương pháp tưới sâu vào gốc cây và tránh tưới lên lá để tránh gây bệnh và tiết kiệm nước.",
        fertilize: "- Mùa mưa: Trong mùa mưa, cây mía cần bón phân hữu cơ để cung cấp dinh dưỡng cho cây. Có thể sử dụng phân chuồn chuồn, phân bò, phân heo, hoặc phân rơm để bón cho cây mía.\r\n- Mùa khô: Trong mùa khô, cây mía cần bón phân hỗn hợp chứa các nguyên tố dinh dưỡng chính như Nitơ (N), Phốtpho (P), Kali (K). Có thể sử dụng phân NPK hoặc phân hữu cơ để bón cho cây mía.",
        grass: "Để kiểm soát cỏ xung quanh cây mía, có thể sử dụng phương pháp chướng ngại vật vật lý (ví dụ: đặt vật liệu che phủ dưới cây mía) hoặc sử dụng thuốc diệt cỏ mà không gây ảnh hưởng đến cây mía.",
        insect: "Kiểm soát côn trùng gây hại như sâu cuốn lá, mối, và bọ trĩ có thể được thực hiện bằng cách sử dụng thuốc trừ sâu an toàn cho cây mía.",
        disease: "1. Bệnh sương mai:\r\n- Dấu hiệu: Mặt lá mía bị phủ bởi một lớp mờ mờ hoặc trắng. Lá cây mía trở nên khô và chết dần.\r\n- Khắc phục: Phun thuốc chống sương mai lên mặt lá cây mía để ngăn chặn sự lây lan của bệnh. Loại bỏ và tiêu hủy những lá cây bị nhiễm bệnh.\r\n2. Bệnh đốm nâu lá:\r\n- Dấu hiệu: Xuất hiện các đốm nâu trên lá mía. Các đốm có thể mở rộng và làm cho lá bị cháy, khô và rụng.\r\n- Khắc phục: Cắt bỏ và tiêu hủy những lá mía bị nhiễm bệnh. Sử dụng thuốc phun chống nấm để ngăn chặn sự lây lan của bệnh.\r\n3. Bệnh cháy lá:\r\n- Dấu hiệu: Lá mía chuyển từ màu xanh sang màu nâu và cuối cùng là màu đen. Lá cây khô và chết từ cành gốc lên đến ngọn.\r\n- Khắc phục: Loại bỏ và tiêu hủy những cây bị nhiễm bệnh. Tránh tưới quá nhiều nước và đảm bảo thông thoáng cho cây. Sử dụng thuốc phun chống nấm để ngăn chặn sự lây lan của bệnh.\r\n4.Bệnh thối rễ:\r\n- Dấu hiệu: Rễ mía bị thối, đen và mục nát. Cây mía trở nên yếu đuối và có dấu hiệu suy nhược\r\n- Khắc phục: Điều chỉnh lượng nước tưới phù hợp. Tránh tưới quá nhiều nước và cải thiện thông thoáng cho đất trồng. Sử dụng các loại thuốc phun chống nấm có tác dụng chống lại bệnh thối rễ.",
        harvest: "- Thời điểm thu hoạch: Cây mía thường được thu hoạch khi tuổi cây khoảng 10-12 tháng sau khi trồng. Quả mía nên đạt độ chín đủ để có hàm lượng đường cao.\r\n- Phương pháp thu hoạch: Dùng dao lưỡi sắc hoặc máy cắt mía để cắt bỏ gốc cây mía ở phần gốc gần mặt đất. Sau đó, loại bỏ những lá bên ngoài và cắt cắp đầu và đuôi mía.",
        preserve: "- Rửa sạch: Rửa sạch mía bằng nước để loại bỏ bụi bẩn và cặn bẩn trên bề mặt cây mía.\r\n- Cắt ngắn: Cắt mía thành khúc nhỏ hoặc khúc vừa để tiện cho việc sử dụng sau này.\r\n- Đóng gói: Đóng gói mía trong bao nylon hoặc giấy bạc để giữ cho mía tươi mát và ngăn chặn mất nước.\r\n- Bảo quản lạnh: Nếu có điều kiện, có thể lưu trữ mía trong tủ lạnh để kéo dài thời gian bảo quản.",
        plant: plants[4]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

    ]
    await db.collection("infors").insertMany(infors);

    // Seed Products
    const products = [
      {
        _id: new ObjectId(),
        name: "Cà phê Arabica",
        price: 20000,
        info: "Cà phê Arabica có hương vị tinh tế, chất lượng cao, vị chua nhẹ và hậu vị ngọt.",
        image: "images/product/arabica.png",
        status: "available",
        sold :50,
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cà phê Robusta",
        price: 18000,
        info: "Cà phê Robusta đậm đà, hương vị mạnh mẽ, hàm lượng caffeine cao, phù hợp cho pha phin.",
        image: "images/product/robusta.png",
        status: "available",
        sold :32,
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cà phê Liberica",
        price: 22000,
        info: "Cà phê Liberica có hương thơm độc đáo, vị đậm với chút hương trái cây và socola.",
        image: "images/product/liberica.png",
        status: "available",
        sold :10,
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cà phê Culi",
        price: 25000,
        info: "Cà phê Culi là hạt cà phê tròn đặc biệt, vị đắng đậm, hương thơm nồng, ít chua.",
        image: "images/product/culi.png",
        sold :18,
        status: "available",
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cao su PB235",
        price: 150000,
        info: "Cao su PB235 cho năng suất mủ cao, kháng bệnh tốt, phù hợp với nhiều loại đất.",
        image: "images/product/pb235.jpg",
        status: "available",
        sold :20,
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Cao su PB255",
        price: 160000,
        info: "Cao su PB255 có khả năng chịu hạn tốt, mủ chất lượng cao, phù hợp vùng khô hạn.",
        image: "images/product/pb255.png",
        status: "available",
        sold :12,
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Xoài Cát Chu",
        price: 35000,
        info: "Xoài Cát Chu ngọt thanh, thịt chắc, thơm nồng, đặc sản vùng Đồng bằng sông Cửu Long.",
        image: "images/product/catchu.png",
        status: "available",
        sold :45,
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[0]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Xoài Cát Hòa Lộc",
        price: 45000,
        info: "Xoài Cát Hòa Lộc nổi tiếng với vị ngọt đậm, thịt dày, ít xơ, hương thơm quyến rũ.",
        image: "images/product/hoaloc.png",
        status: "available",
        sold :43,
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[0]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Xoài Keo",
        price: 30000,
        info: "Xoài Keo có vị ngọt nhẹ, hơi chua, thịt giòn, phù hợp ăn tươi hoặc làm gỏi.",
        image: "images/product/keo.png",
        status: "available",
        sold :22,
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[0]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Xoài Indica",
        price: 32000,
        info: "Xoài Indica ngọt vừa, thịt mềm, nhiều nước, thường dùng làm sinh tố hoặc ăn trực tiếp.",
        image: "images/product/indica.png",
        status: "available",
        evaluate: Math.random() * (5 - 4) + 4,
        sold :8,
        category: categories[0]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Rau Muống",
        price: 10000,
        info: "Rau muống tươi ngon, lá xanh, thân giòn, phù hợp xào, luộc hoặc ăn lẩu.",
        image: "images/product/muong.png",
        status: "available",
        sold :34,
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[3]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Rau Cải Ngọt",
        price: 12000,
        info: "Rau cải ngọt có vị ngọt nhẹ, lá mềm, giàu dinh dưỡng, dùng trong canh hoặc xào.",
        image: "images/product/ngot.png",
        status: "available",
        sold :21,
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[3]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Rau Đay",
        price: 8000,
        info: "Rau đay mềm, nhớt nhẹ, thường dùng nấu canh cua, giàu vitamin và khoáng chất.",
        image: "images/product/day.png",
        status: "available",
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[3]._id,
        sold :0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Rau Xà Lách",
        price: 15000,
        info: "Rau xà lách giòn, tươi, dùng trong salad, cuốn bánh tráng hoặc ăn kèm lẩu.",
        image: "images/product/xalach.png",
        status: "available",
        sold :11,
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[3]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Lúa ST21",
        price: 20000,
        info: "Lúa ST21 cho hạt gạo dẻo, thơm, năng suất cao, phù hợp vùng Đồng bằng sông Cửu Long.",
        image: "images/product/st21.png",
        status: "available",
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[2]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Lúa OM7347",
        price: 22000,
        info: "Lúa OM7347 kháng sâu bệnh tốt, hạt gạo dài, trắng, thích hợp xuất khẩu.",
        image: "images/product/om7347.png",
        status: "available",
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[2]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Lúa KC06",
        price: 21000,
        info: "Lúa KC06 cho gạo thơm, dẻo, chịu hạn tốt, phù hợp vùng đất nhiễm phèn.",
        image: "images/product/kc06.png",
        status: "available",
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[2]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Lúa 8 Thơm",
        price: 23000,
        info: "Lúa 8 Thơm nổi bật với hương thơm tự nhiên, gạo dẻo, ngọt, chất lượng cao.",
        image: "images/product/8thom.png",
        status: "available",
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[2]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Mía Comus",
        price: 12000,
        info: "Mía Comus ngọt đậm, nhiều nước, thân to, thường dùng ép nước hoặc ăn trực tiếp.",
        image: "images/product/comus.png",
        status: "available",
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        name: "Mía Officinarum",
        price: 13000,
        info: "Mía Officinarum có vị ngọt thanh, ít xơ, phù hợp làm nước mía hoặc chế biến đường.",
        image: "images/product/officinarum.png",
        status: "available",
        evaluate: Math.random() * (5 - 4) + 4,
        category: categories[1]._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection("products").insertMany(products);

    //Seed favourites
    const favourites = [
      {
        user: users[0]._id,
        products: [products[0]._id, products[1]._id],
      },
    ];
    

    await db.collection("favourites").insertMany(favourites);

    // Seed UserCarts
    const userCarts = [
    ];
    await db.collection("usercarts").insertMany(userCarts);

   // Seed Sellers (Orders)
const sellers = [
];

await db.collection("sellers").insertMany(sellers);


       const notices = [
      
    ];
    await db.collection("notices").insertMany(notices);

    const shippers = [
      {
        email: 'shipper@gmail.com',
        password: await bcrypt.hash('shipper001', 10),
        full_name: 'Nguyễn Văn An',
        phone: '0901234567',
        avatar: '',
        isActive: true,
        assignedOrders: []
      },
      
    ];
    await db.collection("shippers").insertMany(shippers);

    
    console.log("✅ Đã thêm đầy đủ dữ liệu mẫu!");
  } catch (error) {
    console.error("Lỗi khi thêm dữ liệu:", error);
  } finally {
    await client.close();
  }
}

run();