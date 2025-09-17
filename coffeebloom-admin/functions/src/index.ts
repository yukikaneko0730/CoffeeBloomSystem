// functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// ✅ Delete user from Firebase Auth
export const deleteUser = functions.https.onRequest(async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      res.status(400).send({ error: "Missing uid" });
      return;
    }
    await admin.auth().deleteUser(uid);
    res.status(200).send({ message: "✅ User deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting user:", err);
    res.status(500).send({ error: err.message });
  }
});

// ✅ Disable / Enable user
export const setUserDisabled = functions.https.onRequest(async (req, res) => {
  try {
    const { uid, disabled } = req.body;
    if (!uid || disabled === undefined) {
      res.status(400).send({ error: "Missing uid or disabled flag" });
      return;
    }

    await admin.auth().updateUser(uid, { disabled });
    res
      .status(200)
      .send({ message: `✅ User ${disabled ? "disabled" : "enabled"} successfully` });
  } catch (err: any) {
    console.error("Error updating user status:", err);
    res.status(500).send({ error: err.message });
  }
});

// ✅ Send password reset link
export const resetPassword = functions.https.onRequest(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).send({ error: "Missing email" });
      return;
    }

    const link = await admin.auth().generatePasswordResetLink(email);
    res.status(200).send({ message: "✅ Reset link generated", link });
  } catch (err: any) {
    console.error("Error generating reset link:", err);
    res.status(500).send({ error: err.message });
  }
});
