"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { FaUserShield, FaUserEdit, FaTrash, FaUserGraduate } from "react-icons/fa";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب كل المستخدمين من Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // دالة تغيير الرتبة
  const changeRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      alert(`تم تغيير الرتبة إلى ${newRole} بنجاح ✅`);
    } catch (err) { alert("حدث خطأ في التعديل"); }
  };

  return (
    <div className="min-h-screen  text-white p-6 md:p-10 font-sans" dir="rtl">
      <h1 className="text-3xl font-black mb-10 italic text-purple-500">إدارة صلاحيات المنصة 👑</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <div key={u.id} className="bg-[#111] border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl">
                {u.role === 'admin' ? <FaUserShield className="text-red-500"/> : u.role === 'moderator' ? <FaUserEdit className="text-blue-400"/> : <FaUserGraduate className="text-gray-500"/>}
              </div>
              <div>
                <h3 className="font-bold text-lg">{u.name || "مستخدم بدون اسم"}</h3>
                <p className="text-[10px] text-gray-500 uppercase">{u.email || "بدون إيميل"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <button onClick={() => changeRole(u.id, 'admin')} className={`px-4 py-2 rounded-xl text-[10px] font-bold ${u.role === 'admin' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>مدير</button>
              <button onClick={() => changeRole(u.id, 'moderator')} className={`px-4 py-2 rounded-xl text-[10px] font-bold ${u.role === 'moderator' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>مشرف</button>
              <button onClick={() => changeRole(u.id, 'student')} className={`px-4 py-2 rounded-xl text-[10px] font-bold ${u.role === 'student' || !u.role ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}>طالب</button>
              
              <button onClick={() => deleteDoc(doc(db, "users", u.id))} className="mr-auto p-2 text-red-500/30 hover:text-red-500 transition-all"><FaTrash size={14}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
