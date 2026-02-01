import { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Building2, 
  Key,
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface PersonalData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

interface BankData {
  bankName: string;
  agency: string;
  account: string;
  accountType: string;
  pixKey: string;
}

interface EditScholarDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "personal" | "bank";
  personalData?: PersonalData;
  bankData?: BankData;
  onSave: (data: PersonalData | BankData) => void;
}

const banks = [
  "Banco do Brasil",
  "Bradesco",
  "Caixa Econômica Federal",
  "Itaú",
  "Santander",
  "Nubank",
  "Inter",
  "C6 Bank",
  "PicPay",
  "Mercado Pago",
];

const accountTypes = [
  "Conta Corrente",
  "Conta Poupança",
  "Conta Salário",
];

export function EditScholarDataDialog({
  open,
  onOpenChange,
  type,
  personalData,
  bankData,
  onSave,
}: EditScholarDataDialogProps) {
  const [formData, setFormData] = useState<PersonalData | BankData>(
    type === "personal" 
      ? personalData || { name: "", cpf: "", email: "", phone: "" }
      : bankData || { bankName: "", agency: "", account: "", accountType: "", pixKey: "" }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSave(formData);
    setIsSubmitting(false);
    onOpenChange(false);
    
    toast({
      title: "Dados atualizados",
      description: type === "personal" 
        ? "Seus dados pessoais foram atualizados com sucesso."
        : "Seus dados bancários foram atualizados com sucesso. A validação será realizada em até 48h.",
    });
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  if (type === "personal") {
    const data = formData as PersonalData;
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Editar Dados Pessoais
              </DialogTitle>
              <DialogDescription>
                Atualize suas informações pessoais. O CPF não pode ser alterado.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  CPF
                </Label>
              <Input
                  id="cpf"
                  value={data.cpf}
                  readOnly
                  disabled
                  className="bg-muted cursor-not-allowed opacity-70"
                />
                <p className="text-xs text-muted-foreground">
                  O CPF não pode ser alterado pelo bolsista. Caso necessário, solicite ao gestor responsável.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="seu.email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  value={data.phone}
                  onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  const data = formData as BankData;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-success" />
              Editar Dados Bancários
            </DialogTitle>
            <DialogDescription>
              Atualize seus dados bancários. Após alteração, seus dados passarão por validação.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bankName" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Banco
              </Label>
              <Select value={data.bankName} onValueChange={(value) => handleChange("bankName", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agency" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Agência
                </Label>
                <Input
                  id="agency"
                  value={data.agency}
                  onChange={(e) => handleChange("agency", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="0000-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Conta
                </Label>
                <Input
                  id="account"
                  value={data.account}
                  onChange={(e) => handleChange("account", e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="00000-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Tipo de Conta
              </Label>
              <Select value={data.accountType} onValueChange={(value) => handleChange("accountType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pixKey" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Chave Pix
              </Label>
              <Input
                id="pixKey"
                value={data.pixKey}
                onChange={(e) => handleChange("pixKey", e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
              />
              <p className="text-xs text-muted-foreground">
                Informe sua chave Pix para recebimento dos pagamentos.
              </p>
            </div>
          </div>

          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-warning-foreground">
              <strong>Atenção:</strong> Após a alteração, seus dados bancários serão validados em até 48 horas. 
              Durante esse período, o status será "Pendente".
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
