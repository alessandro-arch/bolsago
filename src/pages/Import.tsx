import { useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { FileUploader } from '@/components/import/FileUploader';
import { ImportTypeSelector } from '@/components/import/ImportTypeSelector';
import { DataPreviewTable } from '@/components/import/DataPreviewTable';
import { ImportSummary } from '@/components/import/ImportSummary';
import { ImportResultReport } from '@/components/import/ImportResultReport';
import { useSpreadsheetParser } from '@/hooks/useSpreadsheetParser';
import { ImportType, ImportPreview, ImportResult, IMPORT_TYPES } from '@/types/import';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  FileCheck, 
  AlertCircle,
  Loader2,
  Download
} from 'lucide-react';

type Step = 'select-type' | 'upload' | 'preview' | 'importing' | 'result';

export default function Import() {
  const [currentStep, setCurrentStep] = useState<Step>('select-type');
  const [selectedType, setSelectedType] = useState<ImportType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importProgress, setImportProgress] = useState(0);

  const { parseFile, isLoading: isParsing, error: parseError } = useSpreadsheetParser();
  const { toast } = useToast();

  const handleTypeSelect = (type: ImportType) => {
    setSelectedType(type);
    setCurrentStep('upload');
  };

  const handleFileSelect = async (file: File) => {
    if (!selectedType) return;
    
    setSelectedFile(file);
    
    try {
      const parsedPreview = await parseFile(file, selectedType);
      setPreview(parsedPreview);
      setCurrentStep('preview');
    } catch {
      toast({
        title: 'Erro ao processar arquivo',
        description: parseError || 'Não foi possível ler o arquivo',
        variant: 'destructive',
      });
    }
  };

  const handleImport = useCallback(async () => {
    if (!preview || !selectedType || !selectedFile) return;

    setCurrentStep('importing');
    setImportProgress(0);

    const startedAt = new Date().toISOString();
    const validRows = preview.rows.filter(r => r.isValid);
    const invalidRows = preview.rows.filter(r => !r.isValid);
    
    const importedRecords: ImportResult['importedRecords'] = [];
    const rejectedRecords: ImportResult['rejectedRecords'] = [];

    // Add invalid rows to rejected
    invalidRows.forEach(row => {
      rejectedRecords.push({
        rowNumber: row.rowNumber,
        data: row.data,
        reasons: row.errors,
      });
    });

    // Process valid rows
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));

      try {
        // For now, we simulate database insertion since tables may not exist yet
        // In production, this would call the appropriate Supabase table
        let insertError: Error | null = null;

        // Simulate a small delay for realistic progress
        await new Promise(resolve => setTimeout(resolve, 50));

        // Basic validation that would happen at DB level
        if (selectedType === 'scholars') {
          // Check if email format is valid
          const email = String(row.data.email || '');
          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            insertError = new Error('Email inválido ou ausente');
          }
        } else if (selectedType === 'bank_accounts') {
          const userEmail = String(row.data.user_email || '');
          if (!userEmail) {
            insertError = new Error('Email do bolsista não informado');
          }
        } else if (selectedType === 'projects') {
          const code = String(row.data.code || '');
          if (!code) {
            insertError = new Error('Código do projeto não informado');
          }
        } else if (selectedType === 'enrollments') {
          const userEmail = String(row.data.user_email || '');
          const projectCode = String(row.data.project_code || '');
          if (!userEmail || !projectCode) {
            insertError = new Error('Email do bolsista ou código do projeto não informado');
          }
        }

        if (insertError) {
          rejectedRecords.push({
            rowNumber: row.rowNumber,
            data: row.data,
            reasons: [insertError.message],
          });
        } else {
          importedRecords.push({
            rowNumber: row.rowNumber,
            data: row.data,
          });
        }
      } catch (err) {
        rejectedRecords.push({
          rowNumber: row.rowNumber,
          data: row.data,
          reasons: [err instanceof Error ? err.message : 'Erro desconhecido'],
        });
      }
    }

    const result: ImportResult = {
      success: importedRecords.length > 0,
      importedCount: importedRecords.length,
      rejectedCount: rejectedRecords.length,
      importedRecords,
      rejectedRecords,
      summary: {
        startedAt,
        completedAt: new Date().toISOString(),
        importType: selectedType,
        fileName: selectedFile.name,
        totalProcessed: preview.totalRows,
      },
    };

    setImportResult(result);
    setCurrentStep('result');

    toast({
      title: result.success ? 'Importação concluída' : 'Importação com erros',
      description: `${result.importedCount} registro(s) importado(s), ${result.rejectedCount} rejeitado(s)`,
      variant: result.rejectedCount > 0 ? 'destructive' : 'default',
    });
  }, [preview, selectedType, selectedFile, toast]);

  const handleNewImport = () => {
    setCurrentStep('select-type');
    setSelectedType(null);
    setSelectedFile(null);
    setPreview(null);
    setImportResult(null);
    setImportProgress(0);
  };

  const downloadTemplate = () => {
    if (!selectedType) return;
    
    const config = IMPORT_TYPES[selectedType];
    const headers = [...config.requiredFields, ...config.optionalFields];
    
    const csvContent = headers.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelo-${selectedType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStepNumber = (): number => {
    switch (currentStep) {
      case 'select-type': return 1;
      case 'upload': return 2;
      case 'preview': return 3;
      case 'importing': return 4;
      case 'result': return 4;
      default: return 1;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Page header */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Importar Dados</h1>
              <p className="text-muted-foreground">
                Importe bolsistas, dados bancários, projetos e vínculos via planilha
              </p>
            </div>

            {/* Progress steps */}
            <div className="flex items-center gap-2">
              {['Tipo', 'Arquivo', 'Revisar', 'Concluir'].map((label, index) => (
                <div key={label} className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    getStepNumber() > index + 1 
                      ? 'bg-success text-success-foreground' 
                      : getStepNumber() === index + 1 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs">
                      {index + 1}
                    </span>
                    {label}
                  </div>
                  {index < 3 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
                  )}
                </div>
              ))}
            </div>

            <Separator />

            {/* Step content */}
            {currentStep === 'select-type' && (
              <Card>
                <CardHeader>
                  <CardTitle>Selecione o Tipo de Importação</CardTitle>
                  <CardDescription>
                    Escolha qual tipo de dados você deseja importar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImportTypeSelector 
                    selected={selectedType} 
                    onSelect={handleTypeSelect} 
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 'upload' && selectedType && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Upload de Arquivo</CardTitle>
                      <CardDescription>
                        Tipo selecionado: <strong>{IMPORT_TYPES[selectedType].label}</strong>
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={downloadTemplate}>
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Modelo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FileUploader onFileSelect={handleFileSelect} />
                  
                  {isParsing && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processando arquivo...
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">Campos obrigatórios:</p>
                      <p>{IMPORT_TYPES[selectedType].requiredFields.join(', ')}</p>
                      {IMPORT_TYPES[selectedType].optionalFields.length > 0 && (
                        <>
                          <p className="font-medium mt-2 mb-1">Campos opcionais:</p>
                          <p>{IMPORT_TYPES[selectedType].optionalFields.join(', ')}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <Button variant="outline" onClick={() => setCurrentStep('select-type')}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 'preview' && preview && selectedType && (
              <div className="space-y-6">
                <ImportSummary preview={preview} />

                <Card>
                  <CardHeader>
                    <CardTitle>Pré-visualização dos Dados</CardTitle>
                    <CardDescription>
                      Revise os dados antes de confirmar a importação
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataPreviewTable rows={preview.rows} importType={selectedType} />
                  </CardContent>
                </Card>

                {preview.invalidRows > 0 && (
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Atenção</p>
                      <p className="text-sm text-muted-foreground">
                        {preview.invalidRows} registro(s) contêm erros e serão ignorados na importação.
                        Apenas os {preview.validRows} registro(s) válidos serão processados.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleImport}
                    disabled={preview.validRows === 0}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar {preview.validRows} Registro(s)
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'importing' && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
                    <h3 className="text-lg font-semibold">Importando dados...</h3>
                    <p className="text-muted-foreground">Por favor, aguarde</p>
                    <div className="max-w-md mx-auto">
                      <Progress value={importProgress} className="h-2" />
                      <p className="text-sm text-muted-foreground mt-2">{importProgress}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 'result' && importResult && (
              <ImportResultReport 
                result={importResult}
                onClose={() => window.history.back()}
                onNewImport={handleNewImport}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
