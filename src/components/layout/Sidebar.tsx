import { NavLink } from "react-router-dom";
import { Home, User, Star, Briefcase, Mail, Settings, Code } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Profil Diri", href: "/profile", icon: User },
  { name: "Skill", href: "/skills", icon: Star },
  { name: "Proyek", href: "/projects", icon: Briefcase },
  { name: "Pengalaman", href: "/experience", icon: Code },
  { name: "Pesan Kontak", href: "/messages", icon: Mail },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-gray-50 border-r border-gray-200">
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900">Portfolio Admin</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3" aria-hidden="true" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;