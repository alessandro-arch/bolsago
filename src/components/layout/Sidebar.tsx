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
  Upload,
  FolderOpen,
  ShieldAlert,
  Ticket,
  Building2,
  Globe
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { OrganizationSwitcher } from "@/components/organizations/OrganizationSwitcher";
import logoIcca from "@/assets/logo-icca.png";

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  managerOnly?: boolean;
  adminOnly?: boolean;
  scholarOnly?: boolean;
  section?: string;
}

const scholarNavigation: NavItem[] = [
  { name: "Meu Painel", icon: LayoutDashboard, href: "/bolsista/painel" },
  { name: "Meu Perfil", icon: UserCircle, href: "/bolsista/perfil" },
  { name: "Meus Pagamentos", icon: Receipt, href: "/bolsista/pagamentos-relatorios" },
  { name: "Documentos", icon: FileText, href: "/bolsista/documentos" },
  { name: "Manual", icon: HelpCircle, href: "/bolsista/manual" },
];

const adminNavigation: NavItem[] = [
  { name: "Dashboard ICCA", icon: Globe, href: "/admin/dashboard-icca", adminOnly: true, section: "Governança" },
  { name: "Painel Gestor", icon: Users, href: "/admin/painel", managerOnly: true },
  { name: "Projetos Temáticos", icon: FolderOpen, href: "/admin/projetos-tematicos", managerOnly: true },
  { name: "Documentos", icon: FileText, href: "/admin/documentos", managerOnly: true },
  { name: "Códigos de Convite", icon: Ticket, href: "/admin/codigos-convite", managerOnly: true, section: "Gestão Institucional" },
  { name: "Importar Dados", icon: Upload, href: "/admin/importar", managerOnly: true },
  { name: "Organizações", icon: Building2, href: "/admin/organizacoes", adminOnly: true },
  { name: "Trilha de Auditoria", icon: ShieldAlert, href: "/admin/trilha-auditoria", adminOnly: true },
];

// Secondary nav is built dynamically based on role

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { hasManagerAccess, isAdmin, loading } = useUserRole();

  // Select navigation based on user role
  const baseNavigation = hasManagerAccess ? adminNavigation : scholarNavigation;

  const secondaryNavigation: NavItem[] = [
    { name: "Configurações", icon: Settings, href: "/alterar-senha" },
    ...(hasManagerAccess ? [] : [{ name: "Ajuda", icon: HelpCircle, href: "/bolsista/manual" } as NavItem]),
  ];
  
  const filteredNavigation = baseNavigation.filter(item => {
    if (item.managerOnly && !hasManagerAccess) return false;
    if (item.adminOnly && !isAdmin) return false;
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
          <div className="flex items-center gap-3">
            <img 
              src={logoIcca} 
              alt="ICCA" 
              className="h-8 w-auto"
            />
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-lg hover:bg-muted transition-colors",
            collapsed && "absolute right-1"
          )}
        >
          {collapsed ? (
            <Menu className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Platform Name & Role Badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              SisConnecta
            </span>
            {!loading && (
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                hasManagerAccess 
                  ? "bg-primary/10 text-primary" 
                  : "bg-info/10 text-info"
              )}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {hasManagerAccess ? "Gestor" : "Bolsista"}
              </span>
            )}
          </div>
          <OrganizationSwitcher collapsed={collapsed} />
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {filteredNavigation.map((item, index) => {
          const isActive = location.pathname === item.href;
          const prevItem = filteredNavigation[index - 1];
          const showSectionHeader = item.section && (!prevItem || prevItem.section !== item.section);
          
          const linkClasses = cn(
            "nav-item",
            isActive && "active",
            collapsed && "justify-center px-2"
          );
          
          return (
            <div key={item.name}>
              {showSectionHeader && !collapsed && (
                <div className="px-3 py-2 mt-3 mb-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.section}
                  </span>
                </div>
              )}
              <Link
                to={item.href}
                className={linkClasses}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="p-3 border-t border-border space-y-1">
        {secondaryNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "nav-item",
                isActive && "active",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
