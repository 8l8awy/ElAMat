"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { FaUserShield, FaUserEdit, FaTrash, FaUserGraduate, FaSearch, FaUsers } from "react-icons/fa";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // الدولة الخاصة بالبحث
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. جلب كل المستخدمين من Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setFilteredUsers(usersData); // القائمة الافتراضية هي كل اليوزرز
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. منطق البحث (تحديث القائمة بناءً على الاسم أو الإيميل)
  useEffect(() => {
    const results = users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  // 3. دالة تغيير الرتبة
  const changeRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      alert(`تم التحديث إلى رتبة ${newRole} بنجاح ✅`);
    } catch (err) {
      alert("حدث خطأ في تحديث البيانات");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen  text-white p-6 md:p-10 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* الهيدر */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black italic text-purple-500 uppercase flex items-center gap-3">
              <FaUsers className="text-white"/> إدارة الأعضاء
            </h1>
            <p className="text-gray-500 text-xs mt-2 font-bold uppercase tracking-widest">إجمالي المسجلين: {users.length} طالب</p>
          </div>

          {/* شريط البحث الاحترافي */}
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input 
              type="text" 
              placeholder="ابحث بالاسم أو البريد الإلكتروني..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111] border border-white/5 p-4 pr-12 rounded-2xl outline-none focus:border-purple-500/50 transition-all text-sm font-bold"
            />
          </div>
        </div>

        {/* عرض النتائج */}
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(u => (
              <div key={u.id} className="bg-[#111] border border-white/5 p-6 rounded-[2.5rem] shadow-xl hover:border-purple-500/20 transition-all group relative overflow-hidden">
                
                {/* خلفية جمالية خفيفة لكل كارت */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl group-hover:bg-purple-600/10 transition-all"></div>

                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg ${
                    u.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                    u.role === 'moderator' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                    'bg-gray-500/10 text-gray-500 border border-white/5'
                  }`}>
                    {u.role === 'admin' ? <FaUserShield /> : u.role === 'moderator' ? <FaUserEdit /> : <FaUserGraduate />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white truncate text-sm uppercase">{u.name || "مستخدم مجهول"}</h3>
                    <p className="text-[9px] text-gray-600 font-bold truncate tracking-tighter">{u.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5 relative z-10">
                  <button 
                    onClick={() => changeRole(u.id, 'admin')} 
                    className={`px-3 py-2 rounded-xl text-[9px] font-black transition-all ${u.role === 'admin' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                  >
                    مدير
                  </button>
                  <button 
                    onClick={() => changeRole(u.id, 'moderator')} 
                    className={`px-3 py-2 rounded-xl text-[9px] font-black transition-all ${u.role === 'moderator' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                  >
                    مشرف
                  </button>
                  <button 
                    onClick={() => changeRole(u.id, 'student')} 
                    className={`px-3 py-2 rounded-xl text-[9px] font-black transition-all ${(!u.role || u.role === 'student') ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                  >
                    طالب
                  </button>
                  
                  <button 
                    onClick={() => { if(confirm("هل أنت متأكد من حذف هذا العضو؟")) deleteDoc(doc(db, "users", u.id)) }} 
                    className="mr-auto p-2 text-red-500/20 hover:text-red-500 transition-all"
                  >
                    <FaTrash size={12}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#111] rounded-[2.5rem] border border-dashed border-white/10">
            <p className="text-gray-500 font-bold italic">لا يوجد مستخدمين يطابقون بحثك..</p>
          </div>
        )}
      </div>
    </div>
  );
}
