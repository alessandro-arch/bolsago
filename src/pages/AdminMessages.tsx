import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComposeMessageDialog } from "@/components/messages/ComposeMessageDialog";
import { Send, Mail, Clock, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminMessages() {
  const { user } = useAuth();
  const [composeOpen, setComposeOpen] = useState(false);

  const { data: sentMessages = [], isLoading } = useQuery({
    queryKey: ["sent-messages", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("sender_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch recipient names
      const recipientIds = [...new Set((data || []).map(m => m.recipient_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", recipientIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      return (data || []).map(m => ({
        ...m,
        recipient_profile: profileMap.get(m.recipient_id) || null,
      }));
    },
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Mensagens Enviadas</h1>
                <p className="text-muted-foreground">
                  Gerencie as mensagens enviadas aos bolsistas
                </p>
              </div>
              <Button onClick={() => setComposeOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Mensagem
              </Button>
            </div>

            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Carregando mensagens...
                </CardContent>
              </Card>
            ) : sentMessages.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Send className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma mensagem enviada</h3>
                  <p className="text-muted-foreground mb-4">Envie sua primeira mensagem para um bolsista.</p>
                  <Button onClick={() => setComposeOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Mensagem
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {sentMessages.map((message: any) => (
                  <Card key={message.id} className="transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Send className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-foreground truncate">
                              {message.subject}
                            </h3>
                            <Badge variant={message.read ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0 shrink-0">
                              {message.read ? "Lida" : "Não lida"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Para: {message.recipient_profile?.full_name || "Bolsista"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {message.body}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {format(new Date(message.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      <ComposeMessageDialog open={composeOpen} onOpenChange={setComposeOpen} />
    </div>
  );
}
