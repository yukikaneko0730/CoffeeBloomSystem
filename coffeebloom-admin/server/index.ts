// server/index.ts
import express from "express";
import cors from "cors";
import admin from "firebase-admin";

admin.initializeApp({
  // 環境変数 GOOGLE_APPLICATION_CREDENTIALS or サービスアカウントJSONを使う
});

const app = express();
app.use(cors());
app.use(express.json());

app.post("/deleteUser", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    await admin.auth().deleteUser(uid);
    res.json({ message: "User deleted successfully" });
  } catch (e:any) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 8080, () => {
  console.log("server started");
});
