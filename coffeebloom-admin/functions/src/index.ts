//functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK once
admin.initializeApp();

/**
 * HTTPS Callable Function:
 * Delete a user from Firebase Authentication
 */
export const deleteUser = functions.https.onRequest(async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      res.status(400).send("❌ Missing uid");
      return;
    }

    await admin.auth().deleteUser(uid);

    res.status(200).send({ message: "✅ User deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting user:", err);
    res.status(500).send({ error: err.message });
  }
});
