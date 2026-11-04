// src/layouts/UserDashboardLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "../components/user/UserSidebar"; 
import UserTopbar from "../components/user/UserTopbar";

function UserDashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <UserSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div className="md:ml-[260px] min-h-screen flex flex-col bg-[#f8fafc]">
        <UserTopbar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserDashboardLayout;