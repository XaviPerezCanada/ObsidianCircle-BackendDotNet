import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";


export default function ShopEvents() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold">Eventos</h1>

      <div className="flex gap-4 overflow-x-auto pb-2">
        <Card className="min-w-[260px] max-w-xs flex-shrink-0">
          <CardHeader>
            <CardTitle>Partida abierta en la Sala Principal</CardTitle>
            <CardDescription>Partida abierta del Catan</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Fecha: 12/12/2026</p>
            <p>Hora: 12:00</p>
            <p>Lugar: Sala 1</p>
            <p>Jugadores: 4 de 10</p>
            <Button variant="outline">Asistir a la partida</Button>
          </CardContent>
        </Card>

        <Card className="min-w-[260px] max-w-xs flex-shrink-0">
          <CardHeader>
            <CardTitle>Torneo de Warhammer 40000</CardTitle>
            <CardDescription>Se requiere pertenecer al club</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Fecha: 12/12/2026</p>
            <p>Hora: 12:00</p>
            <p>Lugar: Sala 2</p>
            <p>Jugadores: 4 de 10</p>
            <Button variant="outline">Asistir al torneo</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}