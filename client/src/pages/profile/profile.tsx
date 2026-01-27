
import { useAuth } from "@/src/context/auth-context";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";




export function ProfilePage() {
  const { user, isAuthenticated ,logout} = useAuth();
  const navigate = useNavigate();
 


 
  // esto son los juegos que el usuario tiene a futuro los pillara de la base de datos
  
  return (
    isAuthenticated ? (
    <div className="pt-20 px-6 pb-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/Taberna.png')" }}>
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <div className="flex content-center justify-center flex-row gap-4">
                <Button>Editar Perfil</Button>
                <Button>Cambiar Contraseña</Button> 
                {user?.tipo === 'SOCIO' && (
                  <Button onClick={() => navigate("/user-dashboard")}>Area Socio</Button>
                )}
                {user?.tipo === 'ADMIN' && (
                  <Button onClick={() => navigate("/admin-dashboard")}>Area Admin</Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
          <p>Name: {user?.name}</p>
          <p>Email: {user?.email}</p>
          <p>Tipo de usuario: {user?.tipo}</p>
          <br />
          {user?.tipo === 'BASICO' && (
            <Button onClick={() => navigate("/pay-subscription")}>HAZTE SOCIO</Button>
          )}
        </CardContent>
        
        
   
        <CardFooter>
            <div className="flex content-center justify-center flex-row gap-4">
                <Button onClick={logout}>Logout</Button>
                <Button>Eliminar Cuenta</Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  ) : (
    <div className="flex content-center justify-center flex-row gap-4">
      <h1>No estás autenticado</h1>
    <Button onClick={() => navigate("/login")}>Ir a Login</Button>
    </div>
  )
  );
}