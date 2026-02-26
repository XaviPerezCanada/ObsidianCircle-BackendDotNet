import { useAuth } from "@/src/context/auth-context";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/button";
import { AddArticle } from "@/src/components/profile/AddArticle";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/src/components/ui/card";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import { useJuego } from "@/src/hooks/useJuego";
import { Dice6, BookOpen } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";

export function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAddArticle, setShowAddArticle] = useState(false);

  const { juegos, loading, error, getJuegos } = useJuego();



  const handleShowAddArticle = () => {
    setShowAddArticle(true);
  }

  const handleJuegoAdded = () => {
    setShowAddArticle(false);
    // Recargar la lista de juegos
    getJuegos();
  }

  // Función para obtener el icono según el tipo de juego
  const getJuegoIcon = (tipo: 'MESA' | 'ROL') => {
    return tipo === 'MESA' ? Dice6 : BookOpen;
  }

  if (!user) {
    return <div>No user found</div>;
  }

 
  if (user.tipo !== 'SOCIO') {
    return <div>Acceso restringido: Solo para usuarios SOCIO</div>;
  }

  // Filtrar solo los juegos que pertenecen al usuario autenticado
  const misJuegos = juegos.filter(juego => juego.socio === user.username);

  return (
    <div className="pt-20 px-6 pb-6 content-center justify-center flex-row gap-4 items-center" >
      <Card>
        <CardHeader>
          <CardTitle>User Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Bienvenido, {user.username}</p>
          <p>Tipo de usuario: {user.tipo}</p>
        </CardContent>
        <CardContent>
          <Button onClick={handleShowAddArticle}>Agregar Juego</Button>
        </CardContent>
        <CardContent>
          {loading && <p className="text-muted-foreground">Cargando juegos...</p>}
          {error && <p className="text-destructive">Error: {error}</p>}
          {!loading && !error && misJuegos.length === 0 && (
            <p className="text-muted-foreground">No tienes juegos agregados aún</p>
          )}
        </CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {misJuegos.map((juego) => {
              const Icon = getJuegoIcon(juego.genero as 'MESA' | 'ROL');
              return (
                <div
                  key={juego.id}
                  className="group p-6 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {juego.titulo}
                  </h3>
                  {juego.descripcion && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                      {juego.descripcion}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline">{juego.genero}</Badge>
                    <Badge className={juego.estado === 'ACTIVO' ? 'bg-emerald-600' : 'bg-slate-600'}>
                      {juego.estado}
                    </Badge>
                  </div>
                  {(juego.jugadoresMin || juego.jugadoresMax) && (
                    <p className="text-xs text-muted-foreground">
                      Jugadores: {juego.jugadoresMin || '?'} - {juego.jugadoresMax || '?'}
                    </p>
                  )}
                  {juego.edadRecomendada && (
                    <p className="text-xs text-muted-foreground">
                      Edad recomendada: {juego.edadRecomendada}
                    </p>
                  )}
                  {juego.duracionMinutos && (
                    <p className="text-xs text-muted-foreground">
                      Duracion: {juego.duracionMinutos} minutos
                    </p>
                  )}
                  {juego.categoria && (
                    <p className="text-xs text-muted-foreground">
                      Categoria: {juego.categoria}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <CardFooter>
            <Button onClick={() => navigate("/profile")}>Volver</Button>
        </CardFooter>
      </Card>

      {/* Dialog para Agregar Juego */}
      <Dialog open={showAddArticle} onOpenChange={setShowAddArticle}>
        <DialogContent 
          className="max-w-md p-0 bg-background/95 backdrop-blur-md border-border shadow-xl"
          showCloseButton={true}
        >
          <div className="p-0">
            <AddArticle onSuccess={handleJuegoAdded} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
