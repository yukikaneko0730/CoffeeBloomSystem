// functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const deleteUser = functions.https.onRequest(async (req, res): Promise<void> => {
  try {
    const { uid } = req.body;
    if (!uid) {
      res.status(400).send({ error: "Missing uid" });
      return; // 👈 void を返す
    }

    await admin.auth().deleteUser(uid);

    res.status(200).send({ message: "✅ User deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting user:", err);
    res.status(500).send({ error: err.message });
  }
});
