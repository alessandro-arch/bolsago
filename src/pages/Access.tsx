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
      <footer className="w-full bg-[hsl(220,20%,14%)] text-gray-300 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            {/* Coluna 1 - Sobre */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src={logoIcca} alt="ICCA" className="h-8 w-auto brightness-0 invert" />
                <span className="text-white font-semibold text-lg">SisConnecta</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Plataforma de gestão de bolsas vinculadas a projetos científicos e de inovação.
              </p>
            </div>

            {/* Coluna 2 - Acesso Rápido */}
            <div>
              <h4 className="text-white font-semibold mb-3">Acesso Rápido</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/bolsista/login" className="hover:text-white transition-colors">
                    Portal do Bolsista
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="hover:text-white transition-colors">
                    Portal do Administrador
                  </Link>
                </li>
                <li>
                  <Link to="/recuperar-senha" className="hover:text-white transition-colors">
                    Esqueci minha senha
                  </Link>
                </li>
                <li>
                  <a href="mailto:suporte@icca.org.br" className="hover:text-white transition-colors">
                    Suporte
                  </a>
                </li>
              </ul>
            </div>

            {/* Coluna 3 - Redes e Links */}
            <div>
              <h4 className="text-white font-semibold mb-3">Siga o ICCA</h4>
              <div className="flex items-center gap-3 mb-4">
                <a href="https://www.instagram.com/institutoicca/" target="_blank" rel="noopener noreferrer" aria-label="Instagram do ICCA" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://www.linkedin.com/company/instituto-icca/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn do ICCA" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://icca.org.br/" target="_blank" rel="noopener noreferrer" aria-label="Site do ICCA" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div className="text-sm space-y-1">
                <a href="https://sisconnecta.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  sisconnecta.com
                </a>
                <a href="https://icca.org.br/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  icca.org.br
                </a>
              </div>
            </div>
          </div>

          {/* Divider + Copyright */}
          <div className="border-t border-white/10 pt-6 text-center text-sm text-gray-500">
            © ICCA – Instituto de Inovação, Conhecimento e Ciências Aplicadas (
            <a href="https://www.icca.org.br" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
              www.icca.org.br
            </a>
            )
          </div>
        </div>
      </footer>
    </div>
  );
}
