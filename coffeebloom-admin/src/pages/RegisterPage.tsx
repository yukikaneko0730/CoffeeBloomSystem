// src/pages/RegisterPage.tsx
import { useState } from "react";
import { registerUser } from "../lib/authService";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [store, setStore] = useState("Mitte");
  

  const handleRegister = async () => {
    try {
      await registerUser({ email, password, store });
      alert("✅ User registered successfully!");
      setEmail(""); setPassword("");
    } catch (error: any) {
      alert("❌ Failed: " + error.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">📝 Register New User</h1>

      <label className="block mb-2">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border px-3 py-2 rounded w-full mb-4"
      />

      <label className="block mb-2">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border px-3 py-2 rounded w-full mb-4"
      />

      <label className="block mb-2">Store</label>
      <select
        value={store}
        onChange={(e) => setStore(e.target.value)}
        className="border px-3 py-2 rounded w-full mb-4"
      >
        <option value="Mitte">Mitte</option>
        <option value="Kreuzberg">Kreuzberg</option>
        <option value="Neukölln">Neukölln</option>
        <option value="Charlottenburg">Charlottenburg</option>
        <option value="Prenzlauer Berg">Prenzlauer Berg</option>
      </select>

      
      <button
        onClick={handleRegister}
        className="bg-green-500 text-white px-4 py-2 rounded w-full"
      >
        Register User
      </button>
    </div>
  );
}
