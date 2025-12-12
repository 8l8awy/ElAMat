"use client";
import Navbar from "../../components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="main-layout">
      <Navbar />
      <div className="container" style={{paddingTop: '20px'}}>
        {children}
      </div>
    </div>
  );
}