import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Search, MoreHorizontal, Shield, GraduationCap, RefreshCw, Clock, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { AssignScholarshipDialog } from "./AssignScholarshipDialog";
import { useAuth } from "@/contexts/AuthContext";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  cpf: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AppRole;
  created_at: string;
  has_active_enrollment: boolean;
}

const ROLE_CONFIG: Record<AppRole, { label: string; variant: "default" | "secondary" | "outline"; icon: React.ReactNode }> = {
  admin: { label: "Administrador", variant: "default", icon: <Shield className="w-3 h-3" /> },
  manager: { label: "Gestor", variant: "secondary", icon: <Shield className="w-3 h-3" /> },
  scholar: { label: "Bolsista", variant: "outline", icon: <GraduationCap className="w-3 h-3" /> },
};

type FilterType = "all" | AppRole | "egresso" | "awaiting";

export function UsersManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<FilterType>("all");
  
  // Selection state
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email, cpf, phone, avatar_url, created_at");

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Fetch active enrollments to identify egressos
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("user_id, status")
        .eq("status", "active");

      if (enrollmentsError) throw enrollmentsError;

      const activeEnrollmentUserIds = new Set(enrollments?.map(e => e.user_id) || []);
      const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        email: profile.email,
        cpf: profile.cpf,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        role: rolesMap.get(profile.user_id) || "scholar",
        created_at: profile.created_at,
        has_active_enrollment: activeEnrollmentUserIds.has(profile.user_id),
      }));

      setUsers(usersWithRoles);
      setSelectedUserIds(new Set()); // Clear selection on refresh
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      !searchTerm ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === "all") return true;
    if (roleFilter === "awaiting") {
      return user.role === "scholar" && !user.has_active_enrollment;
    }
    if (roleFilter === "egresso") {
      return user.role === "scholar" && !user.has_active_enrollment;
    }
    if (roleFilter === "scholar") {
      return user.role === "scholar" && user.has_active_enrollment;
    }
    return user.role === roleFilter;
  });

  // Filter out current user from selectable users
  const selectableUsers = filteredUsers.filter(u => u.user_id !== currentUser?.id);

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getUserStatus = (user: UserWithRole) => {
    if (user.role === "admin" || user.role === "manager") {
      return ROLE_CONFIG[user.role];
    }
    if (user.role === "scholar" && !user.has_active_enrollment) {
      return { label: "Aguardando Atribuição", variant: "outline" as const, icon: <Clock className="w-3 h-3" /> };
    }
    return ROLE_CONFIG.scholar;
  };

  const isAwaitingAssignment = (user: UserWithRole) => {
    return user.role === "scholar" && !user.has_active_enrollment;
  };

  const handleAssignScholarship = (user: UserWithRole) => {
    setSelectedUser(user);
    setAssignDialogOpen(true);
  };

  // Selection handlers
  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedUserIds.size === selectableUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(selectableUsers.map(u => u.user_id)));
    }
  };

  const generateReferenceCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ERR-${timestamp}-${random}`;
  };

  const handleDeleteUsers = async () => {
    if (selectedUserIds.size === 0) return;
    
    const targetUserIds = Array.from(selectedUserIds);
    setDeleting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("delete-users", {
        body: { userIds: targetUserIds },
      });

      // Handle function invocation errors (network, etc.)
      if (error) {
        const referenceCode = generateReferenceCode();
        
        console.error("[DELETE_USERS_ERROR]", {
          statusCode: error.status || "N/A",
          payload: error,
          targetUserIds,
          referenceCode,
        });

        toast.error("Erro ao excluir usuários", {
          description: `${error.message || "Falha na comunicação com o servidor"}. Código de referência: ${referenceCode}`,
          duration: 10000,
        });
        return;
      }

      // Check if the response indicates an error (non-2xx from edge function)
      if (data?.error) {
        const referenceCode = generateReferenceCode();
        
        console.error("[DELETE_USERS_ERROR]", {
          statusCode: data.statusCode || "N/A",
          payload: data,
          targetUserIds,
          referenceCode,
        });

        toast.error("Não foi possível excluir os usuários", {
          description: `${data.error}. Código de referência: ${referenceCode}`,
          duration: 10000,
        });
        return;
      }

      // Success case
      console.info("[DELETE_USERS_SUCCESS]", {
        deletedCount: data.results?.success?.length || 0,
        failedCount: data.results?.failed?.length || 0,
        targetUserIds,
      });

      toast.success(data.message || "Usuários excluídos com sucesso");
      setSelectedUserIds(new Set());
      setDeleteDialogOpen(false);
      fetchUsers();
      
    } catch (error: any) {
      const referenceCode = generateReferenceCode();
      
      console.error("[DELETE_USERS_ERROR]", {
        statusCode: error?.status || "UNKNOWN",
        payload: error,
        targetUserIds,
        referenceCode,
      });

      toast.error("Erro inesperado ao excluir usuários", {
        description: `Ocorreu um erro inesperado. Código de referência: ${referenceCode}`,
        duration: 10000,
      });
    } finally {
      setDeleting(false);
    }
  };

  const stats = {
    total: users.length,
    managers: users.filter(u => u.role === "manager" || u.role === "admin").length,
    scholars: users.filter(u => u.role === "scholar" && u.has_active_enrollment).length,
    awaiting: users.filter(u => u.role === "scholar" && !u.has_active_enrollment).length,
  };

  const selectedCount = selectedUserIds.size;
  const isAllSelected = selectableUsers.length > 0 && selectedUserIds.size === selectableUsers.length;
  const isSomeSelected = selectedUserIds.size > 0 && selectedUserIds.size < selectableUsers.length;

  return (
    <>
      <Card className="mt-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Usuários da Plataforma</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {stats.total} usuários • {stats.managers} gestores • {stats.scholars} bolsistas ativos • {stats.awaiting} aguardando atribuição
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir ({selectedCount})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as FilterType)}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="manager">Gestores</SelectItem>
                <SelectItem value="scholar">Bolsistas Ativos</SelectItem>
                <SelectItem value="awaiting">Aguardando Atribuição</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-muted-foreground">Nenhum usuário encontrado</h3>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {searchTerm || roleFilter !== "all" 
                  ? "Tente ajustar os filtros de busca"
                  : "Importe dados via planilha para adicionar usuários"}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={isAllSelected}
                        onCheckedChange={toggleAllSelection}
                        aria-label="Selecionar todos"
                        className={isSomeSelected ? "data-[state=checked]:bg-primary/50" : ""}
                      />
                    </TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const status = getUserStatus(user);
                    const awaiting = isAwaitingAssignment(user);
                    const isCurrentUser = user.user_id === currentUser?.id;
                    const isSelected = selectedUserIds.has(user.user_id);
                    
                    return (
                      <TableRow 
                        key={user.id} 
                        className={`${awaiting ? "bg-warning/5" : ""} ${isSelected ? "bg-primary/5" : ""}`}
                      >
                        <TableCell>
                          {!isCurrentUser ? (
                            <Checkbox 
                              checked={isSelected}
                              onCheckedChange={() => toggleUserSelection(user.user_id)}
                              aria-label={`Selecionar ${user.full_name}`}
                            />
                          ) : (
                            <div className="w-4 h-4" /> // Placeholder for current user
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(user.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{user.full_name || "Sem nome"}</span>
                              {isCurrentUser && (
                                <span className="text-xs text-muted-foreground">(você)</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {user.cpf || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={status.variant} 
                            className={`gap-1 ${awaiting ? "bg-warning/10 text-warning border-warning/20" : ""}`}
                          >
                            {status.icon}
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {awaiting && (
                                <>
                                  <DropdownMenuItem 
                                    className="gap-2 text-primary"
                                    onClick={() => handleAssignScholarship(user)}
                                  >
                                    <Plus className="w-4 h-4" />
                                    Atribuir Bolsa
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                              <DropdownMenuItem>Editar perfil</DropdownMenuItem>
                              {!isCurrentUser && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="gap-2 text-destructive focus:text-destructive"
                                    onClick={() => {
                                      setSelectedUserIds(new Set([user.user_id]));
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir usuário
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir <strong>{selectedCount} usuário(s)</strong>. 
              Esta ação não pode ser desfeita e irá remover permanentemente:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Dados do perfil</li>
                <li>Matrículas e pagamentos</li>
                <li>Relatórios enviados</li>
                <li>Dados bancários</li>
                <li>Acesso à plataforma</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUsers}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Confirmar Exclusão
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Scholarship Dialog */}
      {selectedUser && (
        <AssignScholarshipDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          userId={selectedUser.user_id}
          userName={selectedUser.full_name}
          onSuccess={fetchUsers}
        />
      )}
    </>
  );
}
