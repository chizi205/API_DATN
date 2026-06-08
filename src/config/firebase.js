const admin = require("firebase-admin");

let messaging;

if (!admin.apps.length) {
  const serviceAccount = require("../thongbao-27dcc-firebase-adminsdk-fbsvc-47614809aa.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin đã khởi tạo thành công");
}

messaging = admin.messaging();

module.exports = {
  admin,
  messaging,
};
