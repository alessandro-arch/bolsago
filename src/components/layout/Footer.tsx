export function Footer() {
  return (
    <footer className="py-4 px-6 border-t border-border bg-background">
      <p className="text-xs text-muted-foreground text-center">
        © InnovaGO – Sistema de Gestão de Bolsas Institucionais (
        <a 
          href="https://innovago.com.br" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          innovago.com.br
        </a>
        )
      </p>
    </footer>
  );
}
