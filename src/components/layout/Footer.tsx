export function Footer() {
  return (
    <footer className="py-4 px-6 border-t border-border bg-background">
      <p className="text-xs text-muted-foreground text-center">
        © ICCA – Instituto de Inovação, Conhecimento e Ciências Aplicadas (
        <a 
          href="https://www.icca.org.br" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
        >
          www.icca.org.br
        </a>
        )
      </p>
    </footer>
  );
}
