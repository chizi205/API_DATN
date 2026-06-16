const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = require("../thongbao-27dcc-firebase-adminsdk-fbsvc-f0ba2f487f.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin đã khởi tạo thành công");
}

module.exports = admin;
