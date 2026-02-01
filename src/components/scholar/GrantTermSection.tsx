import { FileText, Download, Eye, CheckCircle, Clock, Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DocumentStatus = "available" | "pending_signature" | "signed";

interface GrantDocument {
  id: string;
  name: string;
  type: string;
  status: DocumentStatus;
  signedAt?: string;
  fileSize: string;
}

const documents: GrantDocument[] = [
  {
    id: "1",
    name: "Termo de Outorga - Bolsa IC 2024",
    type: "Contrato Principal",
    status: "signed",
    signedAt: "15/01/2024",
    fileSize: "245 KB",
  },
  {
    id: "2",
    name: "Termo de Compromisso do Bolsista",
    type: "Anexo I",
    status: "signed",
    signedAt: "15/01/2024",
    fileSize: "128 KB",
  },
  {
    id: "3",
    name: "Declaração de Vínculo Institucional",
    type: "Anexo II",
    status: "signed",
    signedAt: "15/01/2024",
    fileSize: "98 KB",
  },
  {
    id: "4",
    name: "Aditivo de Prorrogação",
    type: "Aditivo",
    status: "pending_signature",
    fileSize: "156 KB",
  },
];

const statusConfig: Record<DocumentStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  available: { 
    label: "Disponível", 
    icon: FileText, 
    className: "bg-info/10 text-info" 
  },
  pending_signature: { 
    label: "Pendente Assinatura", 
    icon: Clock, 
    className: "bg-warning/10 text-warning" 
  },
  signed: { 
    label: "Assinado", 
    icon: CheckCircle, 
    className: "bg-success/10 text-success" 
  },
};

function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.className)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

export function GrantTermSection() {
  const pendingCount = documents.filter(d => d.status === "pending_signature").length;

  return (
    <div className="card-institutional mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Termo de Outorga (Contrato)</h3>
            <p className="text-sm text-muted-foreground">
              Documentos oficiais da sua bolsa
            </p>
          </div>
        </div>
        
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">
              {pendingCount} documento(s) pendente(s)
            </span>
          </div>
        )}
      </div>

      {/* Info message */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border mb-5">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Estes documentos estão disponíveis para consulta a qualquer momento. 
          Guarde uma cópia para seus registros pessoais.
        </p>
      </div>

      {/* Documents list */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <div 
            key={doc.id}
            className={cn(
              "flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border transition-colors",
              doc.status === "pending_signature" 
                ? "bg-warning/5 border-warning/20" 
                : "bg-card border-border hover:bg-muted/30"
            )}
          >
            {/* Document icon */}
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>

            {/* Document info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap">
                <p className="font-medium text-foreground">{doc.name}</p>
                <DocumentStatusBadge status={doc.status} />
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>{doc.type}</span>
                <span>•</span>
                <span>{doc.fileSize}</span>
                {doc.signedAt && (
                  <>
                    <span>•</span>
                    <span>Assinado em {doc.signedAt}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {doc.status === "pending_signature" ? (
                <Button size="sm" className="gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Assinar Documento
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Visualizar</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Baixar</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
