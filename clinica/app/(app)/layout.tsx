"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pacientes", href: "/pacientes", icon: Users },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const pathname = usePathname();

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className={`${sidebarAberta ? "w-56" : "w-16"} transition-all duration-200 bg-white border-r flex flex-col`}>
        <div className="h-16 flex items-center px-4">
          <span className="text-xl font-bold text-slate-800">
            {sidebarAberta ? "Clínica" : "C"}
          </span>
        </div>

        <Separator />

        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const ativo = pathname === item.href;
            return (

              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  ativo
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                {sidebarAberta && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarAberta(!sidebarAberta)}
            className="text-slate-500 hover:text-slate-900"
          >
            {sidebarAberta ? <X size={20} /> : <Menu size={20} />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>F</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                <LogOut size={16} className="mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}