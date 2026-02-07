import { Link } from "react-router-dom";
import { GraduationCap, Users, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoIcca from "@/assets/logo-icca.png";

export default function Access() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Top Bar */}
      <header className="w-full border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          {/* Mobile: stacked layout, Desktop: side by side */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src={logoIcca} 
                alt="ICCA" 
                className="h-8 sm:h-10 w-auto"
              />
              <span className="hidden sm:inline text-xl font-semibold text-foreground">SisConnecta</span>
            </div>
            <nav className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <Link 
                to="/recuperar-senha" 
                className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                Esqueci minha senha
              </Link>
              <a 
                href="mailto:suporte@icca.org.br" 
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <Mail className="h-4 w-4" />
                Suporte
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            SisConnecta
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Plataforma de gestão de bolsas vinculadas a projetos científicos e de inovação. 
            Cadastro, acompanhamento, avaliação e liberação de pagamento mediante relatórios.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* Scholar Portal Card */}
          <div className="bg-card rounded-xl border border-border p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Portal do Bolsista</h2>
            </div>
            <p className="text-muted-foreground mb-6 flex-1">
              Envie relatórios mensais, acompanhe o status da sua bolsa e consulte pagamentos.
            </p>
            <Button asChild size="lg" className="w-full mb-3">
              <Link to="/bolsista/login">
                Acessar Portal do Bolsista
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Acesso exclusivo para bolsistas vinculados a projetos ativos.
            </p>
          </div>

          {/* Admin Portal Card */}
          <div className="bg-card rounded-xl border border-border p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-secondary">
                <Users className="h-6 w-6 text-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Portal do Administrador</h2>
            </div>
            <p className="text-muted-foreground mb-6 flex-1">
              Gerencie projetos temáticos, subprojetos, bolsistas, relatórios e liberação de pagamentos.
            </p>
            <Button asChild variant="secondary" size="lg" className="w-full mb-3 border border-primary/20 hover:bg-primary/10">
              <Link to="/admin/login">
                Acessar Portal do Administrador
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Acesso restrito a administradores e gestores da organização.
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-12 flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span>Acesso seguro · Autenticação protegida</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-card/50 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © ICCA · Instituto de Inovação, Conhecimento e Ciências Aplicadas
          </p>
        </div>
      </footer>
    </div>
  );
}
