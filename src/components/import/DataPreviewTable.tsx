import { ParsedRow, ImportType, DuplicateAction, IMPORT_TYPES } from '@/types/import';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, UserPlus, Users, AlertOctagon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DuplicateActionSelector } from './DuplicateActionSelector';

interface DataPreviewTableProps {
  rows: ParsedRow[];
  importType: ImportType;
  onActionChange?: (rowNumber: number, action: DuplicateAction) => void;
}

export function DataPreviewTable({ rows, importType, onActionChange }: DataPreviewTableProps) {
  const config = IMPORT_TYPES[importType];
  const allFields = [...config.requiredFields, ...config.optionalFields];
  const showDuplicateColumn = importType === 'scholars';

  const getStatusIcon = (row: ParsedRow) => {
    if (!row.isValid) {
      return <XCircle className="w-4 h-4 text-destructive" />;
    }
    if (row.duplicateInfo?.status === 'duplicate') {
      return <Users className="w-4 h-4 text-amber-500" />;
    }
    if (row.duplicateInfo?.status === 'conflict') {
      return <AlertOctagon className="w-4 h-4 text-orange-500" />;
    }
    if (row.warnings.length > 0) {
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    }
    if (row.duplicateInfo?.status === 'new') {
      return <UserPlus className="w-4 h-4 text-success" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-success" />;
  };

  const getStatusBadge = (row: ParsedRow) => {
    if (!row.isValid) {
      return <Badge variant="destructive">Erro</Badge>;
    }
    if (row.duplicateInfo?.status === 'duplicate') {
      return <Badge className="bg-amber-500 text-white hover:bg-amber-600">Duplicado</Badge>;
    }
    if (row.duplicateInfo?.status === 'conflict') {
      return <Badge className="bg-orange-500 text-white hover:bg-orange-600">Conflito</Badge>;
    }
    if (row.warnings.length > 0) {
      return <Badge className="bg-warning text-warning-foreground">Aviso</Badge>;
    }
    if (row.duplicateInfo?.status === 'new') {
      return <Badge className="bg-success text-success-foreground">Novo</Badge>;
    }
    return <Badge className="bg-success text-success-foreground">OK</Badge>;
  };

  const getRowBackground = (row: ParsedRow) => {
    if (!row.isValid) return 'bg-destructive/5';
    if (row.duplicateInfo?.status === 'duplicate') return 'bg-amber-500/5';
    if (row.duplicateInfo?.status === 'conflict') return 'bg-orange-500/5';
    if (row.warnings.length > 0) return 'bg-warning/5';
    return '';
  };

  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum dado para visualizar
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-16">Linha</TableHead>
            <TableHead className="w-24">Status</TableHead>
            {showDuplicateColumn && (
              <TableHead className="w-36">Ação</TableHead>
            )}
            {allFields.map((field) => (
              <TableHead key={field} className="min-w-[120px]">
                {field}
                {config.requiredFields.includes(field) && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </TableHead>
            ))}
            <TableHead className="min-w-[200px]">Observações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow 
              key={row.rowNumber}
              className={getRowBackground(row)}
            >
              <TableCell className="font-mono text-sm">{row.rowNumber}</TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(row)}
                      {getStatusBadge(row)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    {row.errors.length > 0 && (
                      <div className="text-destructive">
                        <strong>Erros:</strong>
                        <ul className="list-disc list-inside">
                          {row.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {row.duplicateInfo?.conflictReason && (
                      <div className="text-amber-600 mt-1">
                        <strong>Motivo:</strong> {row.duplicateInfo.conflictReason}
                      </div>
                    )}
                    {row.warnings.length > 0 && (
                      <div className="text-warning mt-1">
                        <strong>Avisos:</strong>
                        <ul className="list-disc list-inside">
                          {row.warnings.map((warn, i) => (
                            <li key={i}>{warn}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {row.isValid && row.warnings.length === 0 && row.duplicateInfo?.status === 'new' && (
                      <span className="text-success">Novo registro - será importado</span>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              {showDuplicateColumn && (
                <TableCell>
                  {row.isValid && row.duplicateInfo && (
                    <DuplicateActionSelector
                      status={row.duplicateInfo.status}
                      action={row.duplicateInfo.action}
                      onChange={(action) => onActionChange?.(row.rowNumber, action)}
                    />
                  )}
                </TableCell>
              )}
              {allFields.map((field) => (
                <TableCell key={field} className="font-mono text-sm">
                  {row.data[field] !== undefined && row.data[field] !== null 
                    ? String(row.data[field]) 
                    : <span className="text-muted-foreground italic">—</span>
                  }
                </TableCell>
              ))}
              <TableCell>
                {row.errors.length > 0 && (
                  <ul className="text-xs text-destructive list-disc list-inside">
                    {row.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
                {row.duplicateInfo?.conflictReason && (
                  <p className="text-xs text-amber-600">{row.duplicateInfo.conflictReason}</p>
                )}
                {row.warnings.length > 0 && (
                  <ul className="text-xs text-warning list-disc list-inside">
                    {row.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
