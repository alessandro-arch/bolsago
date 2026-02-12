import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, MailOpen, Inbox, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Message {
  id: string;
  sender_id: string;
  subject: string;
  body: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
  sender_profile?: { full_name: string | null } | null;
}

export default function ScholarMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["scholar-messages", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("recipient_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch sender names
      const senderIds = [...new Set((data || []).map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", senderIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      return (data || []).map(m => ({
        ...m,
        sender_profile: profileMap.get(m.sender_id) || null,
      }));
    },
    enabled: !!user?.id,
  });

  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ read: true, read_at: new Date().toISOString() })
        .eq("id", messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scholar-messages"] });
    },
  });

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      markAsRead.mutate(message.id);
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Mensagens</h1>
                <p className="text-muted-foreground">
                  {unreadCount > 0
                    ? `Você tem ${unreadCount} mensagem(ns) não lida(s)`
                    : "Todas as mensagens foram lidas"}
                </p>
              </div>
              <Badge variant={unreadCount > 0 ? "default" : "secondary"} className="text-sm px-3 py-1">
                <Inbox className="w-4 h-4 mr-1" />
                {messages.length} mensagem(ns)
              </Badge>
            </div>

            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Carregando mensagens...
                </CardContent>
              </Card>
            ) : messages.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma mensagem</h3>
                  <p className="text-muted-foreground">Você ainda não recebeu nenhuma mensagem.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <Card
                    key={message.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !message.read ? "border-primary/50 bg-primary/5" : ""
                    }`}
                    onClick={() => openMessage(message)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {message.read ? (
                            <MailOpen className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <Mail className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className={`text-sm truncate ${!message.read ? "font-semibold text-foreground" : "text-foreground"}`}>
                              {message.subject}
                            </h3>
                            {!message.read && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0 shrink-0">Nova</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            De: {message.sender_profile?.full_name || "Gestor"}
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

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(v) => { if (!v) setSelectedMessage(null); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>De: <strong>{selectedMessage.sender_profile?.full_name || "Gestor"}</strong></span>
                <span>{format(new Date(selectedMessage.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed">
                {selectedMessage.body}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
