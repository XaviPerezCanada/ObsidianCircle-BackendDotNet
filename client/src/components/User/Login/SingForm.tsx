import { useState } from "react";
import { Shield, Mail, Lock } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useLogin } from "@/src/hooks/useAuth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card";

type SignFormProps = {
  onSuccess?: () => void;
};

export function SignForm({ onSuccess }: SignFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const loginData = {
        email,
        password,
      };
      await login(loginData);
      console.log("Login exitoso:", { email, password });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(" Error en el login:", error);
    }
    console.log("Iniciar sesión:", { email, password });
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
          Iniciar Sesión
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Accede a tu cuenta para continuar tu aventura
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Correo Electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-background/50 border-border focus-visible:border-primary focus-visible:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border bg-background/50 text-primary focus:ring-primary/50"
              />
              <span className="text-muted-foreground">Recordarme</span>
            </label>
            <a
              href="#"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            size="lg"
          >
            Iniciar Sesión
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
