import { StatusBadge, StatusType } from "./StatusBadge";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Scholar {
  id: string;
  name: string;
  email: string;
  course: string;
  scholarshipType: string;
  monthlyValue: number;
  status: StatusType;
  startDate: string;
}

const scholars: Scholar[] = [
  {
    id: "1",
    name: "Ana Carolina Silva",
    email: "ana.silva@email.com",
    course: "Engenharia de Software",
    scholarshipType: "Iniciação Científica",
    monthlyValue: 700,
    status: "active",
    startDate: "01/03/2024",
  },
  {
    id: "2",
    name: "Bruno Oliveira Santos",
    email: "bruno.santos@email.com",
    course: "Ciência da Computação",
    scholarshipType: "Extensão",
    monthlyValue: 500,
    status: "active",
    startDate: "15/02/2024",
  },
  {
    id: "3",
    name: "Carla Mendes Ferreira",
    email: "carla.ferreira@email.com",
    course: "Administração",
    scholarshipType: "Monitoria",
    monthlyValue: 400,
    status: "pending",
    startDate: "01/04/2024",
  },
  {
    id: "4",
    name: "Daniel Costa Lima",
    email: "daniel.lima@email.com",
    course: "Medicina",
    scholarshipType: "Pesquisa",
    monthlyValue: 900,
    status: "suspended",
    startDate: "10/01/2024",
  },
  {
    id: "5",
    name: "Elena Rodrigues Souza",
    email: "elena.souza@email.com",
    course: "Direito",
    scholarshipType: "Assistência Estudantil",
    monthlyValue: 600,
    status: "active",
    startDate: "20/03/2024",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ScholarsTable() {
  return (
    <div className="card-institutional overflow-hidden p-0">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Bolsistas Recentes</h3>
          <p className="text-sm text-muted-foreground">Últimos bolsistas cadastrados no sistema</p>
        </div>
        <Button variant="outline" size="sm">
          Ver todos
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="table-institutional">
          <thead>
            <tr>
              <th>Bolsista</th>
              <th>Curso</th>
              <th>Tipo de Bolsa</th>
              <th>Valor Mensal</th>
              <th>Data Início</th>
              <th>Status</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {scholars.map((scholar) => (
              <tr key={scholar.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {scholar.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{scholar.name}</p>
                      <p className="text-xs text-muted-foreground">{scholar.email}</p>
                    </div>
                  </div>
                </td>
                <td className="text-muted-foreground">{scholar.course}</td>
                <td className="text-muted-foreground">{scholar.scholarshipType}</td>
                <td className="font-medium text-foreground">{formatCurrency(scholar.monthlyValue)}</td>
                <td className="text-muted-foreground">{scholar.startDate}</td>
                <td>
                  <StatusBadge status={scholar.status} />
                </td>
                <td>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded hover:bg-muted transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="w-4 h-4" />
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Edit className="w-4 h-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="w-4 h-4" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
