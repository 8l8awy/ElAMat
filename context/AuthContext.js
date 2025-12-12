
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      checkUser(savedEmail);
    } else {
      setLoading(false);
    }
  }, []);

  const checkUser = async (email) => {
    try {
      const codesRef = collection(db, "allowedCodes");
      const q = query(codesRef, where("code", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setUser({ name: data.name, email, isAdmin: data.admin || false });
      } else {
         const usersRef = collection(db, "users");
         const qUser = query(usersRef, where("email", "==", email));
         const userSnap = await getDocs(qUser);
         if(!userSnap.empty) {
            const userData = userSnap.docs[0].data();
            setUser({ ...userData, isAdmin: userData.isAdmin || false });
         }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("userEmail", userData.email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userEmail");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
