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
  UserCircle,
  Upload
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  managerOnly?: boolean;
  scholarOnly?: boolean;
}

const navigation: NavItem[] = [
  { name: "Meu Painel", icon: LayoutDashboard, href: "/" },
  { name: "Painel Gestor", icon: Users, href: "/painel-gestor", managerOnly: true },
  { name: "Importar Dados", icon: Upload, href: "/importar", managerOnly: true },
  { name: "Meu Perfil", icon: UserCircle, href: "/perfil-bolsista" },
  { name: "Meus Pagamentos", icon: Receipt, href: "/pagamentos-relatorios" },
  { name: "Documentos", icon: FileText, href: "/documentos" },
];

const secondaryNavigation = [
  { name: "Notificações", icon: Bell, href: "#" },
  { name: "Configurações", icon: Settings, href: "#" },
  { name: "Ajuda", icon: HelpCircle, href: "#" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { hasManagerAccess, loading } = useUserRole();

  const filteredNavigation = navigation.filter(item => {
    if (item.managerOnly && !hasManagerAccess) return false;
    if (item.scholarOnly && hasManagerAccess) return false;
    return true;
  });

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

      {/* Role Badge */}
      {!collapsed && !loading && (
        <div className="px-4 py-2 border-b border-border">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
            hasManagerAccess 
              ? "bg-primary/10 text-primary" 
              : "bg-info/10 text-info"
          )}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {hasManagerAccess ? "Gestor" : "Bolsista"}
          </span>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          
          const linkClasses = cn(
            "nav-item",
            isActive && "active",
            collapsed && "justify-center px-2"
          );
          
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
    </aside>
  );
}
