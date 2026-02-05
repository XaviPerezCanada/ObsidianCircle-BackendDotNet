import { useState, useEffect } from "react";
import { useJuegoSearch } from "@/src/hooks/useJuegoSearch";
import { Button } from "@/src/components/ui/button";
import CardCarousel from "./card-carousel";

export default function CarrouselList() {
  const { juegos, loading, error, totalCount } = useJuegoSearch();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [juegos]);

  const selectedJuego = juegos?.length ? juegos[selectedIndex] : null;

  const previousJuegoHandler = () => {
    if (!juegos?.length) return;
    setSelectedIndex((i) => (i === 0 ? juegos.length - 1 : i - 1));
  };

  const nextJuegoHandler = () => {
    if (!juegos?.length) return;
    setSelectedIndex((i) => (i === juegos.length - 1 ? 0 : i + 1));
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Cargando juegos...
      </div>
    );
  }
  if (error) {
    return (
      <div className="py-12 text-center text-destructive">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Carrusel destacado (un juego a la vez) */}
      {selectedJuego && juegos.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Destacado</h2>
          <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
            <Button
              variant="outline"
              size="icon"
              onClick={previousJuegoHandler}
              aria-label="Anterior"
            >
              ‹
            </Button>
            <div className="flex-1 min-w-0 flex items-center gap-6">
              <div className="aspect-video w-48 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img
                  src={selectedJuego.imagenUrl || "/placeholder.svg"}
                  alt={selectedJuego.titulo}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-lg">{selectedJuego.titulo}</h3>
                {selectedJuego.descripcion && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {selectedJuego.descripcion}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedIndex + 1} / {juegos.length} {totalCount > juegos.length && `(de ${totalCount} total)`}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={nextJuegoHandler}
              aria-label="Siguiente"
            >
              ›
            </Button>
          </div>
        </section>
      )}

      {/* Grid de todas las cartas de juegos */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Todos los juegos {totalCount > 0 && `(${totalCount})`}
        </h2>
        <CardCarousel juegos={juegos ?? []} />
      </section>
    </div>
  );
}