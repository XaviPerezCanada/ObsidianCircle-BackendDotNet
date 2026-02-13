import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useEffect, useState } from "react";

import type { GameRoom } from "@/src/services/sala.service";
import { gameRoomQueries } from "../../admin";
import { Button } from "@/src/components/ui/button";
import { getGameRoomImageUrl } from "@/src/utils/gameRoomImages";

export type CardGameRoomsProps = {
  /** Si se pasan, se usan estos datos (ej. desde useGameRoomSearch) y no se hace fetch interno. */
  gameRooms?: GameRoom[];
  loading?: boolean;
  error?: string | null;
};

export default function CardGameRooms({
  gameRooms: gameRoomsProp,
  loading: loadingProp,
  error: errorProp,
}: CardGameRoomsProps = {}) {
  const [gameRoomsLocal, setGameRoomsLocal] = useState<GameRoom[]>([]);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  // const [selectedRoomSlug, setSelectedRoomSlug] = useState<string | null>(null);

  const isControlled = gameRoomsProp !== undefined;
  const gameRooms = isControlled ? gameRoomsProp : gameRoomsLocal;
  const loading = isControlled ? (loadingProp ?? false) : loadingLocal;
  const error = isControlled ? errorProp : errorLocal;

  const getGameRooms = async () => {
    try {
      setLoadingLocal(true);
      setErrorLocal(null);
      const response = await gameRoomQueries.getAll();
      setGameRoomsLocal(response);
    } catch (err: unknown) {
      setErrorLocal((err as Error).message);
    } finally {
      setLoadingLocal(false);
    }
  };

  useEffect(() => {
    if (!isControlled) void getGameRooms();
  }, [isControlled]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!gameRooms?.length) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No hay salas disponibles.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {gameRooms.map((gameRoom) => {
              // const isSelected = selectedRoomSlug === gameRoom.slug;

              return (
                <Card
                  key={gameRoom.slug}
                  className="overflow-hidden group hover:border-primary/40 transition-colors"
                >
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    <img
                      src={getGameRoomImageUrl(gameRoom.name, gameRoom.slug, gameRoom.capacity)}
                      alt={`Sala ${gameRoom.name} - ${gameRoom.capacity} personas`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error(`Error cargando imagen para sala: ${gameRoom.name} (slug: ${gameRoom.slug})`);
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                      onLoad={() => {
                        console.log(`Imagen cargada correctamente para: ${gameRoom.name}`);
                      }}
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{gameRoom.name}</CardTitle>
                    <CardDescription>{gameRoom.description}</CardDescription>
                    <CardContent className="text-sm text-muted-foreground items-center justify-center flex flex-col gap-2">
                      <p>{gameRoom.capacity} personas</p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      <Button className="w-full" variant="outline">
                        Reservar
                      </Button>
                      <Button className="w-full" variant="outline">
                        Ver partidas abiertas
                      </Button>
                    </CardFooter>
                  </CardHeader>
                </Card>
              );
            })}
    </div>
  );
}