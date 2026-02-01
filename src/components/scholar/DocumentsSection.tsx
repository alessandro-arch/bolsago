import { FileText, Download, Eye, BookOpen, FileSpreadsheet, File, Calendar, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DocumentType = "manual" | "template" | "institutional";

interface InstitutionalDocument {
  id: string;
  type: DocumentType;
  title: string;
  description: string;
  updatedAt: string;
  fileSize: string;
  fileFormat: string;
}

const documents: InstitutionalDocument[] = [
  {
    id: "1",
    type: "manual",
    title: "Manual de Preenchimento do Relatório Mensal",
    description: "Guia completo com instruções passo a passo para preenchimento correto do relatório de atividades.",
    updatedAt: "15/01/2024",
    fileSize: "1.2 MB",
    fileFormat: "PDF",
  },
  {
    id: "2",
    type: "template",
    title: "Template do Relatório Mensal",
    description: "Modelo oficial para elaboração do relatório mensal de atividades do bolsista.",
    updatedAt: "10/01/2024",
    fileSize: "256 KB",
    fileFormat: "DOCX",
  },
  {
    id: "3",
    type: "institutional",
    title: "Regulamento do Programa de Bolsas",
    description: "Normas, direitos e deveres dos bolsistas vinculados ao programa institucional.",
    updatedAt: "01/01/2024",
    fileSize: "890 KB",
    fileFormat: "PDF",
  },
  {
    id: "4",
    type: "institutional",
    title: "Calendário de Prazos 2024",
    description: "Datas importantes para envio de relatórios, renovações e demais obrigações.",
    updatedAt: "05/01/2024",
    fileSize: "145 KB",
    fileFormat: "PDF",
  },
  {
    id: "5",
    type: "template",
    title: "Modelo de Justificativa de Ausência",
    description: "Formulário para casos de afastamento temporário das atividades.",
    updatedAt: "01/12/2023",
    fileSize: "98 KB",
    fileFormat: "DOCX",
  },
  {
    id: "6",
    type: "institutional",
    title: "FAQ - Perguntas Frequentes",
    description: "Respostas para as dúvidas mais comuns sobre o programa de bolsas.",
    updatedAt: "20/01/2024",
    fileSize: "320 KB",
    fileFormat: "PDF",
  },
];

const typeConfig: Record<DocumentType, { label: string; icon: typeof BookOpen; className: string }> = {
  manual: {
    label: "Manual",
    icon: BookOpen,
    className: "bg-primary/10 text-primary",
  },
  template: {
    label: "Template",
    icon: FileSpreadsheet,
    className: "bg-success/10 text-success",
  },
  institutional: {
    label: "Institucional",
    icon: File,
    className: "bg-info/10 text-info",
  },
};

function DocumentTypeBadge({ type }: { type: DocumentType }) {
  const config = typeConfig[type];
  
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}

function DocumentCard({ document }: { document: InstitutionalDocument }) {
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
          <DocumentTypeBadge type={document.type} />
          <h4 className="font-medium text-foreground mt-1.5 line-clamp-2 leading-snug">
            {document.title}
          </h4>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
        {document.description}
      </p>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{document.updatedAt}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5" />
          <span>{document.fileSize}</span>
        </div>
        <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
          {document.fileFormat}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="flex-1 gap-1.5">
          <Eye className="w-4 h-4" />
          Visualizar
        </Button>
        <Button variant="outline" size="sm" className="flex-1 gap-1.5">
          <Download className="w-4 h-4" />
          Baixar
        </Button>
      </div>
    </div>
  );
}

export function DocumentsSection() {
  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Anexos e Documentos</h3>
          <p className="text-sm text-muted-foreground">
            Manuais, templates e documentos institucionais
          </p>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
}
