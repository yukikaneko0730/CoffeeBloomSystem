// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// 🔹 Firestore User Profile
export type Profile = {
  uid: string;
  username?: string;
  email: string;
  roles: string[]; // e.g. ["honbu"], ["manager"], ["store"]
  store?: string | null | undefined;   // allow null & undefined
  region?: string | null | undefined;
  defaultStore?: string | null | undefined;
  notifications?: boolean;
};

// 🔹 Context Type
type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

// 🔹 Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

          if (userDoc.exists()) {
            const data = userDoc.data();

            const profileData: Profile = {
              uid: firebaseUser.uid,
              username:
                data.username || firebaseUser.email?.split("@")[0] || "Guest",
              email: data.email || firebaseUser.email || "unknown",
              roles: Array.isArray(data.roles)
                ? data.roles
                : data.role
                ? [data.role]
                : ["store"], // デフォルトは store
              store: data.store ?? null,
              region: data.region ?? null,
              defaultStore: data.defaultStore ?? null,
              notifications: data.notifications ?? true,
            };

            setProfile(profileData);
          } else {
            // user document not found in Firestore → fallback profile
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "unknown",
              roles: ["store"], // デフォルト
              store: null,
              region: null,
              defaultStore: null,
              notifications: true,
            });
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setProfile(null);
        }
      } else {
        // user logged out
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 🔹 Custom Hook
export const useAuth = () => useContext(AuthContext);
