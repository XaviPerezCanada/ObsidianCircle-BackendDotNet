import type { Juego } from "@/src/services/juego.service";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { UsersIcon, UsersRound, CalendarDays } from "lucide-react";

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
          <div className="aspect-[4/3] bg-muted overflow-hidden">
            <img
              src={juego.imagenUrl || "/placeholder.svg"}
              alt={juego.titulo}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-lg line-clamp-2">{juego.titulo}</h3>
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
          <Button variant="outline" className="w-75 mt-2 hover:bg-primary/10" onClick={() => {
            // navigate(`/shop/${juego.slug}`);
          }}>
            <UsersIcon className="w-4 h-4" /> Ver partidas abiertas
          </Button>
          <Button variant="outline" className="w-75 mt-2 hover:bg-primary/10" onClick={() => {
            // navigate(`/shop/${juego.slug}`);
          }}>
            <CalendarDays className="w-4 h-4" /> Realizar una reserva para este juego
          </Button>
          
            
        </Card>
      ))}
    </div>
  );
}
