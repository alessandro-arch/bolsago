export type ImportType = 'scholars' | 'bank_accounts' | 'projects' | 'enrollments';

export interface ImportTypeConfig {
  label: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
}

export const IMPORT_TYPES: Record<ImportType, ImportTypeConfig> = {
  scholars: {
    label: 'Bolsistas',
    description: 'Dados pessoais dos bolsistas (nome, email, CPF, telefone)',
    requiredFields: ['full_name', 'email', 'cpf'],
    optionalFields: ['phone', 'avatar_url'],
  },
  bank_accounts: {
    label: 'Dados Bancários',
    description: 'Informações bancárias dos bolsistas',
    requiredFields: ['user_email', 'bank_code', 'bank_name', 'agency', 'account_number'],
    optionalFields: ['account_type', 'pix_key', 'pix_key_type'],
  },
  projects: {
    label: 'Projetos',
    description: 'Projetos de pesquisa e bolsas',
    requiredFields: ['code', 'title', 'proponent_name', 'start_date', 'end_date'],
    optionalFields: ['description', 'proponent_email', 'proponent_cpf', 'modalities'],
  },
  enrollments: {
    label: 'Vínculos',
    description: 'Vínculos entre bolsistas e projetos',
    requiredFields: ['user_email', 'project_code', 'modality', 'grant_value', 'start_date', 'end_date', 'total_installments'],
    optionalFields: ['observations'],
  },
};

export interface ParsedRow {
  rowNumber: number;
  data: Record<string, unknown>;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

export interface ImportPreview {
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: ParsedRow[];
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  rejectedCount: number;
  importedRecords: Array<{
    rowNumber: number;
    data: Record<string, unknown>;
  }>;
  rejectedRecords: Array<{
    rowNumber: number;
    data: Record<string, unknown>;
    reasons: string[];
  }>;
  summary: {
    startedAt: string;
    completedAt: string;
    importType: ImportType;
    fileName: string;
    totalProcessed: number;
  };
}
