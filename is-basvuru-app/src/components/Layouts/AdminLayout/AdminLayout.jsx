import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F5F8] text-gray-900">
      <Navbar />

      <main className="flex-1 w-full bg-[#F3F5F8]">
        <div className="mx-auto w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
