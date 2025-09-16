// src/pages/SignupPage.tsx
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useNavigate, Link } from "react-router-dom";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [registrationKey, setRegistrationKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const PASSWORD_ROLES: Record<string, { role: string; store: string | null }> = {
    Honbu123: { role: "honbu", store: null },
    Shiten456: { role: "manager", store: null },
    Kojin789: { role: "employee", store: null },
    ShitenKojin456789: { role: "employee+manager", store: null },
    Honbukojin123789: { role: "employee+honbu", store: null },
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!PASSWORD_ROLES[registrationKey]) {
        throw new Error("❌ Invalid registration key. Please check again.");
      }

      const { role, store } = PASSWORD_ROLES[registrationKey];

      const cred = await createUserWithEmailAndPassword(auth, email, userPassword);

      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        role,
        store,
        createdAt: new Date().toISOString(),
      });

      navigate("/");
    } catch (err: any) {
      console.error("Signup error:", err.code, err.message);
      if (err.code === "auth/invalid-email") {
        setError("❌ The email address is invalid.");
      } else if (err.code === "auth/weak-password") {
        setError("❌ Password should be at least 6 characters.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("❌ This email is already registered.");
      } else if (err.code === "auth/configuration-not-found") {
        setError("⚠️ Firebase Auth is not configured. Please enable Email/Password in Firebase Console.");
      } else {
        setError(err.message || "❌ Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Create Account</h2>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            className="w-full border px-3 py-2 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Your Password (min 6 chars)"
            className="w-full border px-3 py-2 rounded-md"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            required
          />

          <input
            id="registrationKey"
            name="registrationKey"
            type="text"
            placeholder="Registration Key (e.g. Honbu123)"
            className="w-full border px-3 py-2 rounded-md"
            value={registrationKey}
            onChange={(e) => setRegistrationKey(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        {/* 👇 追加 */}
        <p className="text-sm text-gray-600 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
