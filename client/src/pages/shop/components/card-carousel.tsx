import type { Juego } from "@/src/services/juego.service";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { UsersIcon, UsersRound, Timer } from "lucide-react";
import { Link } from "react-router-dom";

type CardCarouselProps = {
  juegos: Juego[];
};

export default function CardCarousel({ juegos }: CardCarouselProps) {
  if (!juegos?.length) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No hay juegos disponibles.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {juegos.map((juego) => (
        <Card
          key={juego.id}
          className="overflow-hidden group hover:border-primary/40 transition-colors"
        >
          <h2 className="text-2xl text-center font-bold">{juego.titulo}</h2>
          <div className="aspect-[4/3] bg-muted overflow-hidden">
            <img
              src={juego.imagenUrl || "/images/juegos/Catan.jpg"}
              alt={juego.titulo}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Timer className="w-4 h-4 shrink-0" />
              {juego.duracionMinutos} minutos
            </p>
          </CardContent>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground line-clamp-3">{juego.descripcion}</p>
            <div className="flex flex-wrap gap-1.5">
              {juego.categoria && (
                <Badge variant="secondary" className="text-xs">
                  {juego.categoria}
                </Badge>
              )}
              {juego.genero && (
                <Badge variant="outline" className="text-xs">
                  {juego.genero}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {juego.descripcion ? (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {juego.descripcion}
              </p>
            ) : null}
            {(juego.jugadoresMin != null || juego.jugadoresMax != null) && (
              <p className="text-xs text-muted-foreground mt-2">
                {juego.jugadoresMin ?? "?"}–{juego.jugadoresMax ?? "?"} <UsersRound className="w-4 h-4" />
              </p>
            )}
          
          </CardContent>
          <div className="flex flex-col items-center gap-2 mt-2">
            <Button asChild variant="outline" size="sm" className="hover:bg-primary/10">
              <Link to={`/shop/events?juego=${encodeURIComponent(juego.slug)}`}>
                <UsersIcon className="w-3.5 h-3.5 mr-1.5" /> Ver partidas abiertas
              </Link>
            </Button>
            {/* <Button variant="outline" size="sm" className="hover:bg-primary/10" onClick={() => {
              // navigate(`/shop/${juego.slug}`);
            }}>
              <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Realizar una reserva
            </Button> */}
          </div>
          
            
        </Card>
      ))}
    </div>
  );
}
