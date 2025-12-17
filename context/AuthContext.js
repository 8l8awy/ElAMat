"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/firebase"; // 👈 تأكدي من المسار (غالباً @/lib/firebase أفضل)
import { collection, query, where, getDocs } from "firebase/firestore";

// ✅ التعديل 1: إضافة قيم افتراضية للسياق
// هذا يمنع الانهيار إذا تم استدعاء السياق بدون Provider (في وضع الصيانة)
const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // التأكد من وجود window/localStorage (لتجنب أخطاء السيرفر)
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("userEmail");
      if (savedEmail) {
        checkUser(savedEmail);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const checkUser = async (email) => {
    try {
      // حماية إضافية في حال لم يتم تهيئة db
      if (!db) { 
          setLoading(false);
          return; 
      }

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
      console.error("Auth check error:", error);
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

// ✅ التعديل 2: دالة useAuth الآمنة
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // إذا لم نجد السياق (لأن الموقع مغلق والـ Provider غير موجود)
  // نعيد كائن وهمي بدلاً من undefined
  if (!context) {
    return { 
      user: null, 
      loading: true, 
      login: () => {}, 
      logout: () => {} 
    };
  }
  
  return context;
};
