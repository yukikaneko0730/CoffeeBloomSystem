"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.setUserDisabled = exports.deleteUser = void 0;
// functions/src/index.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// ✅ Delete user from Firebase Auth
exports.deleteUser = functions.https.onRequest(async (req, res) => {
    try {
        const { uid } = req.body;
        if (!uid) {
            res.status(400).send({ error: "Missing uid" });
            return;
        }
        await admin.auth().deleteUser(uid);
        res.status(200).send({ message: "✅ User deleted successfully" });
    }
    catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).send({ error: err.message });
    }
});
// ✅ Disable / Enable user
exports.setUserDisabled = functions.https.onRequest(async (req, res) => {
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
    }
    catch (err) {
        console.error("Error updating user status:", err);
        res.status(500).send({ error: err.message });
    }
});
// ✅ Send password reset link
exports.resetPassword = functions.https.onRequest(async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).send({ error: "Missing email" });
            return;
        }
        const link = await admin.auth().generatePasswordResetLink(email);
        res.status(200).send({ message: "✅ Reset link generated", link });
    }
    catch (err) {
        console.error("Error generating reset link:", err);
        res.status(500).send({ error: err.message });
    }
});
