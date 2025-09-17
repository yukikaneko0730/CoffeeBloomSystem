// server/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 1. Get all users (Firestore only)
app.get("/users", async (_req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 2. Delete user (Firestore + Auth)
app.delete("/users/:uid", async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;

    // Delete from Firestore
    await db.collection("users").doc(uid).delete();

    // Delete from Firebase Auth
    await admin.auth().deleteUser(uid);

    res.json({ message: "✅ User deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 3. Update user (Firestore only)
app.put("/users/:uid", async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { email, roles, store } = req.body;

    await db.collection("users").doc(uid).update({
      email,
      roles,
      store,
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: "✅ User updated successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
