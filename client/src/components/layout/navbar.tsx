import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/button";
import { Menu, X, ShipWheel } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import { SignForm } from "@/src/components/User/Login/SingForm";
import { RegisterForm } from "@/src/components/User/Login/RegisterForm";
import { useAuth } from "@/src/context/auth-context";
import { toast } from "@/src/components/ui/use-toast";

const navLinks = [
  
  // La URL real para "Hoja de Personaje" se decide en función de si el usuario está logueado
  { label: "Hoja de Personaje", href: "/profile" },
  { label: "Juegos ", href: "/shop/games" },
  { label: "Salas de juego", href: "/shop/rooms" },
  { label: "Eventos", href: "/shop/events" },
  { label: "Admin", href: "/admin-dashboard" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();

  const visibleLinks = navLinks.filter((link) => {
 
    if (link.label === "Admin") {
      return isAuthenticated && user?.type === "ADMIN"; 
    }
    if (link.label === "Hoja de Personaje") {
      return isAuthenticated;
    }
   
    return true;
  })

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  }


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          < ShipWheel className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold tracking-wide text-foreground">
            OBSIDIAN CIRCLE
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {visibleLinks.map((link) => {
            const targetHref =
              link.label === "Hoja de Personaje" && isAuthenticated
                ? "/profile"
                : link.href;

            const isHashLink = targetHref.startsWith("#");

            return isHashLink ? (
              <a
                key={link.label}
                href={targetHref}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={targetHref}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            );
          })}
        </div>
            
        {/* Escritorio de usuario */}
        {isAuthenticated ? (
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>
                  {(user?.username ?? "OC").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground">
                {user?.username ?? "Usuario"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick= {() => {
                handleLogout()
                toast({
                  title: 'Sesión cerrada',
                  description: 'Cerraste sesión correctamente',
                })
              }}
            >
              Cerrar Sesión
            </Button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setIsLoginOpen(true)}
            >
              Iniciar Sesión
            </Button>
            <Button size="sm" onClick={() => setIsRegisterOpen(true)}>
              Registrarse
            </Button>
          </div>
        )}
        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-6 py-4 space-y-4">
            {visibleLinks.map((link) => {
              const targetHref =
                link.label === "Hoja de Personaje" && isAuthenticated
                  ? "/profile"
                  : link.href;

              const isHashLink = targetHref.startsWith("#");

              return isHashLink ? (
                <a
                  key={link.label}
                  href={targetHref}
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={targetHref}
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full bg-transparent"
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsOpen(false);
                }}
              >
                Iniciar Sesión
              </Button>
              <Button 
                className="w-full"
                onClick={() => {
                  setIsRegisterOpen(true);
                  setIsOpen(false);
                }}
              >
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent 
          className="max-w-md p-0 bg-background/95 backdrop-blur-md border-border shadow-xl"
          showCloseButton={true}
        >
          <div className="p-0">
            <SignForm onSuccess={() => setIsLoginOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent 
          className="max-w-md p-0 bg-background/50 backdrop-blur-md border-border shadow-xl"
          showCloseButton={true}
        >
          <div className="p-0 ">
            <RegisterForm onSuccess={() => setIsRegisterOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
