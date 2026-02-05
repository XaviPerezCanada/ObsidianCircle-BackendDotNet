import { useState } from "react";
import { Shield, User, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,  
  CardDescription,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card";
import { useRegister } from "@/src/hooks/useAuth";

type RegisterFormProps = {
  onSuccess?: () => void;
};

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { register } = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      console.log("📝 Intentando registrar usuario:", {
        name: formData.name,
        email: formData.email,
        password: "***", // No loguear la contraseña real
      });

      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      await register(registerData);

      console.log("✅ Registro exitoso!");
      setSuccess(true);

      if (onSuccess) onSuccess();

      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("❌ Error en el registro:", err);
      setError(err instanceof Error ? err.message : "Error al registrar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
   
    if (error) setError(null);
  }; 

  return (
    <Card className="w-full max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">
          Crear Cuenta
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Únete a la comunidad y comienza tu aventura
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Nombre
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleChange}
                required
                className="pl-10 bg-background/50 border-border focus-visible:border-primary focus-visible:ring-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Correo Electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="pl-10 bg-background/50 border-border focus-visible:border-primary focus-visible:ring-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="pl-10 bg-background/50 border-border focus-visible:border-primary focus-visible:ring-primary/50"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Mínimo 6 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">
              Confirmar Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="pl-10 bg-background/50 border-border focus-visible:border-primary focus-visible:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm pt-2">
            <input
              type="checkbox"
              required
              className="mt-0.5 w-4 h-4 rounded border-border bg-background/50 text-primary focus:ring-primary/50"
            />
            <span className="text-muted-foreground leading-relaxed">
              Acepto los{" "}
              <a href="#" className="text-primary hover:text-primary/80">
                términos y condiciones
              </a>{" "}
              y la{" "}
              <a href="#" className="text-primary hover:text-primary/80">
                política de privacidad
              </a>
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
              ✅ ¡Registro exitoso! Bienvenido a Realm of Legends
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold disabled:opacity-50"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              "Crear Cuenta"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
