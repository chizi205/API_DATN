const admin = require("firebase-admin");

if (!admin.apps.length) {
  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = require("../thongbao-27dcc-firebase-adminsdk-fbsvc-1fcb514bcd.json");
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin đã khởi tạo thành công");
}

module.exports = admin;
