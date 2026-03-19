import React, { useState } from "react";
import { SquarePen, NotebookPen, TriangleAlert } from "lucide-react";
import AddBlog from "../components/admin/AddBlog";
import EditBlog from "../components/admin/EditBlog";
import DeleteBlog from "../components/admin/DeleteBlog";

const NavItem = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
      isActive
        ? "text-stone-950 font-semibold border-r-2 border-stone-900 bg-stone-50"
        : "text-stone-500 font-medium hover:bg-stone-50 hover:text-stone-900"
    }`}
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="font-serif text-sm tracking-tight">{label}</span>
  </button>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("generate"); 
  const [secretKey, setSecretKey] = useState("");

  return (
    <div className="flex h-screen bg-surface-container-lowest text-on-surface font-body overflow-hidden">
      {/* SIDEBAR */}
      <aside className="h-screen w-64 border-r border-stone-200 bg-white flex-col py-6 shrink-0 z-20 hidden md:flex">
        <div className="px-6 mb-10">
          <h1 className="text-xl font-bold font-headline text-stone-900">
            Editorial CMS
          </h1>
          <p className="text-xs text-stone-500 font-headline italic">
            Admin Dashboard
          </p>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          <NavItem
            icon= <SquarePen className="w-5 h-5" />
            label="Generate Blog"
            isActive={activeTab === "generate"}
            onClick={() => setActiveTab("generate")}
          />
          <NavItem
            icon= <NotebookPen className="w-5 h-5" />
            label="Live Editor"
            isActive={activeTab === "edit"}
            onClick={() => setActiveTab("edit")}
          />
          <NavItem
            icon= <TriangleAlert className="w-5 h-5" />
            label="Danger Zone"
            isActive={activeTab === "delete"}
            onClick={() => setActiveTab("delete")}
          />
        </nav>

        {/* Global Admin Key Input */}
        <div className="px-6 mt-auto pt-6 border-t border-stone-100">
          <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">
            Master Key
          </label>
          <input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Enter key..."
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded text-sm mb-2 focus:border-primary focus:ring-0"
          />
          <button
            onClick={() => setSecretKey("admin_demo_2026")}
            className="w-full text-left text-[10px] text-primary hover:underline font-bold uppercase tracking-wider"
          >
            Autofill Key
          </button>
        </div>
      </aside>

      {/* MOBILE NAV */}
      <div className="md:hidden bg-white w-full p-4 flex gap-2 overflow-x-auto text-sm absolute top-0 z-20 border-b border-stone-200 shadow-sm">
        <button
          onClick={() => setActiveTab("generate")}
          className={`px-4 py-2 rounded-lg font-bold ${activeTab === "generate" ? "bg-primary text-on-primary" : "text-secondary"}`}
        >
          Add
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`px-4 py-2 rounded-lg font-bold ${activeTab === "edit" ? "bg-primary text-on-primary" : "text-secondary"}`}
        >
          Edit
        </button>
        <button
          onClick={() => setActiveTab("delete")}
          className={`px-4 py-2 rounded-lg font-bold ${activeTab === "delete" ? "bg-error text-on-error" : "text-secondary"}`}
        >
          Delete
        </button>
      </div>

      {/* DYNAMIC MAIN CANVAS */}
      <main className="flex-1 h-screen overflow-y-auto bg-surface-container-low pt-16 md:pt-0">
        {activeTab === "generate" && <AddBlog secretKey={secretKey} />}
        {activeTab === "edit" && <EditBlog secretKey={secretKey} />}
        {activeTab === "delete" && <DeleteBlog secretKey={secretKey} />}
      </main>
    </div>
  );
}
