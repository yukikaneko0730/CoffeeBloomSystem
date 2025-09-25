// src/lib/authService.ts
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

type RegisterInput = {
  email: string;
  password: string;
  store: string;
  roles?: string[];
};

export async function registerUser({ email, password, store, roles = ["staff"] }: RegisterInput) {
  
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    store,
    roles,
    notifications: true,
    createdAt: new Date().toISOString(),
  });

  return cred.user;
}
