import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold tracking-wide text-foreground">
            REALM OF LEGENDS
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">
            Privacidad
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Términos
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Contacto
          </a>
        </div>

        {/* Copyright */}
        <p className="text-sm text-muted-foreground">
          © 2026 Realm of Legends
        </p>
      </div>
    </footer>
  );
}
