import { ImportResult, IMPORT_TYPES } from '@/types/import';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  Download, 
  FileText,
  Clock,
  Hash,
  FileSpreadsheet
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ImportResultReportProps {
  result: ImportResult;
  onClose: () => void;
  onNewImport: () => void;
}

export function ImportResultReport({ result, onClose, onNewImport }: ImportResultReportProps) {
  const typeConfig = IMPORT_TYPES[result.summary.importType];
  
  const downloadReport = () => {
    const reportData = {
      ...result,
      generatedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-importacao-${result.summary.importType}-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCSVReport = () => {
    const headers = ['Linha', 'Status', 'Motivos'];
    const allFields = [...typeConfig.requiredFields, ...typeConfig.optionalFields];
    
    const rows: string[][] = [];
    
    // Add imported records
    result.importedRecords.forEach(record => {
      rows.push([
        String(record.rowNumber),
        'Importado',
        '',
        ...allFields.map(f => String(record.data[f] ?? ''))
      ]);
    });
    
    // Add rejected records
    result.rejectedRecords.forEach(record => {
      rows.push([
        String(record.rowNumber),
        'Rejeitado',
        record.reasons.join('; '),
        ...allFields.map(f => String(record.data[f] ?? ''))
      ]);
    });
    
    const csvContent = [
      [...headers, ...allFields].join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-importacao-${result.summary.importType}-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with result status */}
      <Card className={result.success ? 'border-success/50 bg-success/5' : 'border-warning/50 bg-warning/5'}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              result.success ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'
            }`}>
              {result.success ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {result.success ? 'Importação Concluída' : 'Importação Parcial'}
              </h2>
              <p className="text-muted-foreground">
                {result.importedCount} registro(s) importado(s) com sucesso
                {result.rejectedCount > 0 && `, ${result.rejectedCount} rejeitado(s)`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadCSVReport}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={downloadReport}>
                <FileText className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Arquivo</p>
              <p className="font-medium truncate max-w-[150px]" title={result.summary.fileName}>
                {result.summary.fileName}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Hash className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium">{typeConfig.label}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Início</p>
              <p className="font-medium">
                {format(new Date(result.summary.startedAt), 'HH:mm:ss', { locale: ptBR })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Conclusão</p>
              <p className="font-medium">
                {format(new Date(result.summary.completedAt), 'HH:mm:ss', { locale: ptBR })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed results */}
      <Tabs defaultValue="rejected" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="imported" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            Importados ({result.importedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive" />
            Rejeitados ({result.rejectedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="imported">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registros Importados com Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              {result.importedRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum registro foi importado
                </p>
              ) : (
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Linha</TableHead>
                        {typeConfig.requiredFields.slice(0, 3).map(field => (
                          <TableHead key={field}>{field}</TableHead>
                        ))}
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.importedRecords.map(record => (
                        <TableRow key={record.rowNumber}>
                          <TableCell className="font-mono">{record.rowNumber}</TableCell>
                          {typeConfig.requiredFields.slice(0, 3).map(field => (
                            <TableCell key={field} className="truncate max-w-[150px]">
                              {String(record.data[field] ?? '—')}
                            </TableCell>
                          ))}
                          <TableCell>
                            <Badge className="bg-success text-success-foreground">
                              Importado
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registros Rejeitados</CardTitle>
            </CardHeader>
            <CardContent>
              {result.rejectedRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum registro foi rejeitado 🎉
                </p>
              ) : (
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Linha</TableHead>
                        {typeConfig.requiredFields.slice(0, 2).map(field => (
                          <TableHead key={field}>{field}</TableHead>
                        ))}
                        <TableHead>Motivo da Rejeição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.rejectedRecords.map(record => (
                        <TableRow key={record.rowNumber} className="bg-destructive/5">
                          <TableCell className="font-mono">{record.rowNumber}</TableCell>
                          {typeConfig.requiredFields.slice(0, 2).map(field => (
                            <TableCell key={field} className="truncate max-w-[120px]">
                              {String(record.data[field] ?? '—')}
                            </TableCell>
                          ))}
                          <TableCell>
                            <ul className="text-sm text-destructive list-disc list-inside">
                              {record.reasons.map((reason, i) => (
                                <li key={i}>{reason}</li>
                              ))}
                            </ul>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button onClick={onNewImport}>
          Nova Importação
        </Button>
      </div>
    </div>
  );
}
