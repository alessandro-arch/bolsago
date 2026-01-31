import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  DollarSign, 
  Calendar, 
  Settings,
  GraduationCap,
  Bell,
  HelpCircle,
  ChevronLeft,
  Menu,
  Receipt,
  UserCircle
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Bolsistas", icon: Users, href: "#" },
  { name: "Perfil Bolsista", icon: UserCircle, href: "/perfil-bolsista" },
  { name: "Bolsas", icon: GraduationCap, href: "#" },
  { name: "Pagamentos", icon: DollarSign, href: "#" },
  { name: "Meus Pagamentos", icon: Receipt, href: "/pagamentos-relatorios" },
  { name: "Documentos", icon: FileText, href: "/documentos" },
  { name: "Calendário", icon: Calendar, href: "#" },
];

const secondaryNavigation = [
  { name: "Notificações", icon: Bell, href: "#" },
  { name: "Configurações", icon: Settings, href: "#" },
  { name: "Ajuda", icon: HelpCircle, href: "#" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "flex flex-col bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">BolsaGestão</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <Menu className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const isLink = item.href !== "#";
          
          const linkClasses = cn(
            "nav-item",
            isActive && "active",
            collapsed && "justify-center px-2"
          );
          
          if (isLink) {
            return (
              <Link
                key={item.name}
                to={item.href}
                className={linkClasses}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          }
          
          return (
            <a
              key={item.name}
              href={item.href}
              className={linkClasses}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </a>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="p-3 border-t border-border space-y-1">
        {secondaryNavigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "nav-item",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? item.name : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </a>
        ))}
      </div>

      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Admin</p>
              <p className="text-xs text-muted-foreground truncate">admin@instituicao.edu.br</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
