import { FileText, Book, FileCheck, Eye, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DocumentType = "manual" | "template" | "termo";

interface Document {
  id: string;
  type: DocumentType;
  title: string;
  description: string;
  updatedAt: string;
  size: string;
}

const documents: Document[] = [
  {
    id: "1",
    type: "manual",
    title: "Manual do Bolsista",
    description: "Guia completo com todas as orientações para bolsistas, incluindo direitos, deveres e procedimentos.",
    updatedAt: "15/01/2026",
    size: "2.4 MB",
  },
  {
    id: "2",
    type: "template",
    title: "Modelo de Relatório Mensal",
    description: "Template padrão para elaboração do relatório mensal de atividades.",
    updatedAt: "10/01/2026",
    size: "156 KB",
  },
  {
    id: "3",
    type: "termo",
    title: "Termo de Compromisso",
    description: "Documento oficial de vínculo entre o bolsista e a instituição.",
    updatedAt: "05/01/2026",
    size: "89 KB",
  },
  {
    id: "4",
    type: "template",
    title: "Modelo de Plano de Trabalho",
    description: "Template para elaboração do plano de trabalho semestral.",
    updatedAt: "20/01/2026",
    size: "245 KB",
  },
  {
    id: "5",
    type: "manual",
    title: "Guia de Prestação de Contas",
    description: "Orientações sobre como realizar a prestação de contas da bolsa.",
    updatedAt: "12/01/2026",
    size: "1.8 MB",
  },
  {
    id: "6",
    type: "termo",
    title: "Termo de Confidencialidade",
    description: "Documento de sigilo para projetos com informações sensíveis.",
    updatedAt: "08/01/2026",
    size: "67 KB",
  },
  {
    id: "7",
    type: "template",
    title: "Modelo de Relatório Final",
    description: "Template para elaboração do relatório final de atividades da bolsa.",
    updatedAt: "25/01/2026",
    size: "312 KB",
  },
  {
    id: "8",
    type: "manual",
    title: "FAQ - Perguntas Frequentes",
    description: "Documento com as dúvidas mais comuns dos bolsistas e suas respostas.",
    updatedAt: "18/01/2026",
    size: "890 KB",
  },
];

const typeConfig: Record<DocumentType, { label: string; icon: typeof FileText; className: string }> = {
  manual: { 
    label: "Manual", 
    icon: Book, 
    className: "bg-info/10 text-info" 
  },
  template: { 
    label: "Template", 
    icon: FileText, 
    className: "bg-primary/10 text-primary" 
  },
  termo: { 
    label: "Termo", 
    icon: FileCheck, 
    className: "bg-success/10 text-success" 
  },
};

function DocumentCard({ document }: { document: Document }) {
  const config = typeConfig[document.type];
  const Icon = config.icon;

  return (
    <div className="card-stat flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", config.className)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <span className={cn("inline-block px-2 py-0.5 rounded text-xs font-medium mb-1", config.className)}>
            {config.label}
          </span>
          <h3 className="font-semibold text-foreground leading-tight">{document.title}</h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
        {document.description}
      </p>

      {/* Meta info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
        <span>Atualizado: {document.updatedAt}</span>
        <span>{document.size}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex-1 gap-1.5">
          <Eye className="w-4 h-4" />
          Visualizar
        </Button>
        <Button variant="default" size="sm" className="flex-1 gap-1.5">
          <Download className="w-4 h-4" />
          Baixar
        </Button>
      </div>
    </div>
  );
}

export function DocumentsGrid() {
  return (
    <div className="space-y-6">
      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {documents.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>

      {/* Important Notice */}
      <div className="card-institutional bg-warning/5 border-warning/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Importante</h4>
            <p className="text-sm text-muted-foreground">
              Sempre utilize a <strong className="text-foreground">versão mais recente</strong> dos documentos disponibilizados. 
              Documentos desatualizados podem conter informações incorretas ou procedimentos que não são mais válidos. 
              Verifique a data de atualização antes de utilizar qualquer documento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
