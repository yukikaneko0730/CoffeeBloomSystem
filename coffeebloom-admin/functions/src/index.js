import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Example: Hello World
export const helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Firebase Functions!");
});

// Example: user cleanup when deleted
export const deleteUser = functions.auth.user().onDelete(async (user) => {
  await admin.firestore().collection("users").doc(user.uid).delete();
});
