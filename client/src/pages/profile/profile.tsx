
import { useState } from "react";
import { useAuth } from "@/src/context/auth-context";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/src/hooks/useProfile";
import { useToast } from "@/src/hooks/use-toast";

export const ProfilePage = () => {
  const { user, isAuthenticated, logout, logoutAll } = useAuth();
  const navigate = useNavigate();
  const { profile, loading, error, updateProfile } = useProfile(isAuthenticated);
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState<string | null>(null);

  // Inicializar campos cuando cargue el perfil
  if (profile && username === "" && email === "" && bio === null) {
    setUsername(profile.username ?? user?.name ?? "");
    setEmail(profile.email ?? user?.email ?? "");
    setBio(profile.bio ?? null);
  }
  //No deberia salir, ya que el boton esta oculto, pero si alguien no autenicado intenta acceder a la pagina, deberia salir este mensaje


  if (loading && !profile) {
    return (
      <div className="flex content-center justify-center flex-row gap-4 pt-20">
        <h1>Cargando perfil...</h1>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex content-center justify-center flex-row gap-4 pt-20">
        <h1>Error al cargar el perfil</h1>
        <p>{error}</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        username,
        email,
        bio,
      });
      toast({
        title: "Perfil actualizado",
        description: "Tus datos se han guardado correctamente.",
      });
    } catch (err: any) {
      const backendDetail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo actualizar el perfil.";

      toast({
        variant: "destructive",
        title: "Error al actualizar el perfil",
        description: backendDetail,
      });
    }
  };

  return (
    <div
      className="pt-20 px-6 pb-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/Taberna.png')" }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <div className="flex content-center justify-center flex-row gap-4">
            {user?.tipo === "SOCIO" && (
              <Button onClick={() => navigate("/user-dashboard")}>Área Socio</Button>
            )}
            {user?.tipo === "ADMIN" && (
              <Button onClick={() => navigate("/admin-dashboard")}>Área Admin</Button>
            )}
          </div>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                disabled
                readOnly
                value={username}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                disabled
                readOnly
                value={email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={bio ?? ""}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <p>Tipo de usuario: {profile?.type ?? user?.tipo}</p>
            {user?.tipo === "BASICO" && (
              <Button type="button" onClick={() => navigate("/pay-subscription")}>
                HAZTE SOCIO
              </Button>
            )}
          </CardContent>
          <CardFooter className="flex content-center justify-between flex-row gap-4">
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                Guardar cambios
              </Button>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" type="button" onClick={logout}>
                Logout
              </Button>
              <Button variant="destructive" type="button" onClick={logoutAll}>
                Logout en todos los dispositivos
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;