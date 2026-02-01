import { ImportPreview } from '@/types/import';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertTriangle, FileSpreadsheet } from 'lucide-react';

interface ImportSummaryProps {
  preview: ImportPreview;
}

export function ImportSummary({ preview }: ImportSummaryProps) {
  const warningRows = preview.rows.filter(r => r.isValid && r.warnings.length > 0).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{preview.totalRows}</p>
              <p className="text-sm text-muted-foreground">Total de Linhas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{preview.validRows}</p>
              <p className="text-sm text-muted-foreground">Válidos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{warningRows}</p>
              <p className="text-sm text-muted-foreground">Com Avisos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{preview.invalidRows}</p>
              <p className="text-sm text-muted-foreground">Com Erros</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
