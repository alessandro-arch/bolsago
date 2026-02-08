import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  Mail, 
  Menu, 
  X, 
  ExternalLink,
  FolderOpen,
  FileText,
  Shield,
  Eye,
  CheckCircle2,
  ArrowRight,
  Lock,
  ClipboardCheck,
  Wallet,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import logoIcca from "@/assets/logo-icca.png";
import heroBackground from "@/assets/hero-background.png";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const navLinks = [
  { label: "Sobre", href: "#sobre" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Pilares", href: "#pilares" },
  { label: "Segurança", href: "#seguranca" },
  { label: "Contato", href: "#contato" },
];

const timelineSteps = [
  { step: 1, title: "Projeto Temático cadastrado pela organização" },
  { step: 2, title: "Bolsista cria conta com código de convite" },
  { step: 3, title: "Gestor atribui subprojeto e modalidade de bolsa" },
  { step: 4, title: "Bolsista envia relatório mensal em PDF" },
  { step: 5, title: "Gestor avalia e libera pagamento" },
];

const pillars = [
  { icon: FolderOpen, title: "Cadastro e Gestão", description: "Projetos e Bolsas" },
  { icon: FileText, title: "Acompanhamento e Avaliação", description: "Por Relatórios" },
  { icon: Shield, title: "Segurança e Governança", description: "Conformidade com LGPD" },
  { icon: Wallet, title: "Transparência e Controle", description: "Financeiro" },
];

const securityItems = [
  "Controle de acesso por perfil (bolsista, gestor, administrador)",
  "Proteção de dados sensíveis e conformidade com LGPD",
  "Trilhas de auditoria para ações críticas",
  "Armazenamento seguro de documentos",
  "Rastreabilidade de relatórios e pagamentos",
];

export default function Access() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const scrollToAccess = () => {
    const element = document.querySelector("#acesso-cards");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{ 
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px]" />
      {/* Sticky Header */}
      <header 
        className={`sticky top-0 z-50 w-full border-b border-border bg-card/98 backdrop-blur-md transition-shadow duration-300 ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src={logoIcca} 
                alt="ICCA" 
                className="h-8 sm:h-10 w-auto"
              />
              <span className="text-lg sm:text-xl font-semibold text-foreground">SisConnecta</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <Button size="sm" onClick={scrollToAccess}>
                Acessar
              </Button>
            </nav>

            {/* Mobile Hamburger Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Abrir menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader className="text-left border-b border-border pb-4 mb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <img src={logoIcca} alt="ICCA" className="h-6 w-auto" />
                    SisConnecta
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => scrollToSection(link.href)}
                      className="text-left px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                  <div className="pt-4 border-t border-border mt-2">
                    <Button className="w-full" onClick={scrollToAccess}>
                      Acessar
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="px-4 py-12 sm:py-16 relative">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              SisConnecta
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Plataforma de gestão de bolsas vinculadas a projetos científicos e de inovação. 
              Cadastro, acompanhamento, avaliação e liberação de pagamento mediante relatórios.
            </p>
          </div>
        </section>

        {/* Access Cards Section */}
        <section id="acesso-cards" className="px-4 pb-16 scroll-mt-20">
          <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
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
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span>Acesso seguro · Autenticação protegida</span>
          </div>
        </section>

        {/* Sobre Section */}
        <section id="sobre" className="px-4 py-16 bg-muted/30 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Sobre</h2>
            <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <p className="text-muted-foreground leading-relaxed mb-6">
                <strong className="text-foreground">SisConnecta</strong> é uma plataforma para cadastro, acompanhamento, avaliação e liberação de pagamento de bolsas vinculadas a projetos científicos e de inovação, mediante envio e análise de relatórios.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A plataforma é uma iniciativa do <strong className="text-foreground">Instituto de Inovação, Conhecimento e Ciências Aplicadas (ICCA)</strong>, uma instituição privada, sem fins lucrativos, dedicada à pesquisa científica, tecnologia e inovação, tendo a sustentabilidade como um pilar central.
              </p>
              <a 
                href="https://icca.org.br/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                <Building2 className="h-4 w-4" />
                Conheça o ICCA
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </section>

        {/* Como Funciona Section */}
        <section id="como-funciona" className="px-4 py-16 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Como funciona</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-border sm:-translate-x-0.5" />
              
              {/* Timeline steps */}
              <div className="space-y-8">
                {timelineSteps.map((item, index) => (
                  <div 
                    key={item.step}
                    className={`relative flex items-center gap-4 sm:gap-8 ${
                      index % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                    }`}
                  >
                    {/* Step circle */}
                    <div className="absolute left-4 sm:left-1/2 w-8 h-8 -translate-x-1/2 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm z-10">
                      {item.step}
                    </div>
                    
                    {/* Content */}
                    <div className={`ml-16 sm:ml-0 sm:w-[calc(50%-2rem)] ${
                      index % 2 === 0 ? "sm:pr-8 sm:text-right" : "sm:pl-8"
                    }`}>
                      <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
                        <p className="text-foreground font-medium">{item.title}</p>
                      </div>
                    </div>
                    
                    {/* Spacer for alternating layout */}
                    <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pilares Section */}
        <section id="pilares" className="px-4 py-16 bg-muted/30 scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Pilares</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((pillar, index) => (
                <div 
                  key={index}
                  className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <pillar.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Segurança Section */}
        <section id="seguranca" className="px-4 py-16 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-10 text-center">Segurança</h2>
            <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-success/10 shrink-0">
                  <Lock className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Proteção e Conformidade</h3>
                  <p className="text-muted-foreground text-sm">
                    O SisConnecta foi desenvolvido com foco em segurança da informação e conformidade regulatória.
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                {securityItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Contato Section */}
        <section id="contato" className="px-4 py-16 bg-muted/30 scroll-mt-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Contato</h2>
            <p className="text-muted-foreground mb-8">
              Tem dúvidas sobre a plataforma ou quer saber mais sobre como o SisConnecta pode ajudar sua organização? Entre em contato conosco.
            </p>
            <Button asChild size="lg">
              <a href="mailto:contato@icca.org.br" className="inline-flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Falar com o ICCA
              </a>
            </Button>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="px-4 py-12 bg-primary/5">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Pronto para começar?</h3>
            <p className="text-muted-foreground mb-6">
              Acesse o SisConnecta e gerencie suas bolsas de forma simples e segura.
            </p>
            <Button size="lg" onClick={scrollToAccess} className="inline-flex items-center gap-2">
              Acessar SisConnecta
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-card py-6">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <button 
            onClick={scrollToAccess}
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            Acessar SisConnecta
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-sm text-muted-foreground">
            © ICCA · Instituto de Inovação, Conhecimento e Ciências Aplicadas
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/recuperar-senha" className="hover:text-foreground transition-colors">
              Esqueci minha senha
            </Link>
            <a 
              href="mailto:suporte@icca.org.br" 
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Mail className="h-3 w-3" />
              Suporte
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
