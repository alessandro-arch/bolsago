import { Bell, Search, ChevronDown, LogOut, Shield, User, Camera, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useEffect, useRef } from "react";

export function Header() {
  const { user, signOut } = useAuth();
  const { hasManagerAccess, role } = useUserRole();
  const { avatarUrl, uploading, uploadAvatar, refreshAvatar } = useAvatarUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshAvatar();
  }, [refreshAvatar]);

  const getInitials = (email: string) => {
    return email?.substring(0, 2).toUpperCase() || "US";
  };

  const getRoleLabel = () => {
    if (role === "admin") return "Administrador";
    if (role === "manager") return "Gestor";
    return "Bolsista";
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar bolsistas, bolsas, documentos..." 
          className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Avatar className="w-8 h-8">
                {avatarUrl && <AvatarImage src={avatarUrl} alt="Foto de perfil" />}
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(user?.email || "")}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Avatar upload section */}
            <div className="px-2 py-2 flex items-center gap-3">
              <div className="relative group">
                <Avatar className="w-12 h-12">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt="Foto de perfil" />}
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(user?.email || "")}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {hasManagerAccess ? (
                    <Shield className="w-3 h-3 text-primary" />
                  ) : (
                    <User className="w-3 h-3 text-info" />
                  )}
                  <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
