import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/src/components/ui/select";
import { toast } from "@/src/hooks/use-toast";
import { useMyBoardGames, type NewBoardGameFormData } from "@/src/hooks/useMyBoardGames";
import { juegoService, type Juego } from "@/src/services/juego.service";

interface AddArticleProps {
  onSuccess?: () => void;
  mode?: "create" | "edit";
  initialJuego?: Juego | null;
}

export function AddArticle({ onSuccess, mode = "create", initialJuego }: AddArticleProps) {
    const { addGame } = useMyBoardGames(false);

    const [titulo, setTitulo] = useState("");
    const [content, setContent] = useState("");
    const [minPlayers, setMinPlayers] = useState("");
    const [maxPlayers, setMaxPlayers] = useState("");
    const [date, setDate] = useState("");
    const [tipo, setTipo] = useState<"MESA" | "ROL" | "">("");
    const [edad_minima, setEdad_minima] = useState("");
    const [duracion_min, setDuracion_min] = useState("");
    const [categoria, setCategoria] = useState("");
    const [ubicacion, setUbicacion] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [editorial, setEditorial] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const now = new Date();
        const formattedDate = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        setDate(formattedDate);
    }, []);

    // Rellenar datos cuando estamos en modo edición
    useEffect(() => {
        if (mode === "edit" && initialJuego) {
            setTitulo(initialJuego.titulo ?? "");
            setContent(initialJuego.descripcion ?? "");
            setMinPlayers(initialJuego.jugadoresMin?.toString() ?? "");
            setMaxPlayers(initialJuego.jugadoresMax?.toString() ?? "");
            setTipo((initialJuego.genero as "MESA" | "ROL") ?? "");
            setCategoria(initialJuego.categoria ?? "");
            setUbicacion(initialJuego.ubicacion ?? "");
            setObservaciones(initialJuego.observaciones ?? "");
            setEditorial(initialJuego.editorial ?? "");
        }
    }, [mode, initialJuego]);

    const handleMinPlayersChange = (value: string) => {
        setMinPlayers(value);
        // Si el mínimo es mayor que el máximo, resetear el máximo
        if (maxPlayers && parseInt(value) > parseInt(maxPlayers)) {
            setMaxPlayers("");
        }
    };

    const handleMaxPlayersChange = (value: string) => {
        setMaxPlayers(value);
        // Si el máximo es menor que el mínimo, resetear el mínimo
        if (minPlayers && parseInt(value) < parseInt(minPlayers)) {
            setMinPlayers("");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validaciones básicas
        if (!titulo.trim()) {
            toast({
                title: 'Error',
                description: 'El nombre es requerido',
                variant: 'destructive',
            });
            return;
        }

        if (!tipo) {
            toast({
                title: 'Error',
                description: 'El tipo es requerido',
                variant: 'destructive',
            });
            return;
        }

        if (!minPlayers || !maxPlayers) {
            toast({
                title: 'Error',
                description: 'Debes indicar el número mínimo y máximo de jugadores',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const jugadoresMin = parseInt(minPlayers, 10);
            const jugadoresMax = parseInt(maxPlayers, 10);

            if (mode === "edit" && initialJuego) {
                await juegoService.update(initialJuego.slug, {
                    Titulo: titulo.trim(),
                    JugadoresMin: jugadoresMin,
                    JugadoresMax: jugadoresMax,
                });

                toast({
                    title: "Éxito",
                    description: "Juego actualizado correctamente",
                });
            } else {
                const juegoData: NewBoardGameFormData = {
                    titulo: titulo.trim(),
                    jugadoresMin,
                    jugadoresMax,
                    descripcion: content.trim() || undefined,
                    tipo: tipo as "MESA" | "ROL",
                    edadRecomendada: edad_minima ? parseInt(edad_minima, 10) : undefined,
                    duracionMinutos: duracion_min ? parseInt(duracion_min, 10) : undefined,
                    categoria: categoria.trim() || undefined,
                    ubicacion: ubicacion.trim() || undefined,
                    observaciones: observaciones.trim() || undefined,
                    editorial: editorial.trim() || undefined,
                };

                await addGame(juegoData);

                toast({
                    title: 'Éxito',
                    description: 'Juego agregado correctamente',
                });

                // Limpiar formulario tras crear
                setTitulo("");
                setContent("");
                setMinPlayers("");
                setMaxPlayers("");
                setTipo("");
                setEdad_minima("");
                setDuracion_min("");
                setCategoria("");
                setUbicacion("");
                setObservaciones("");
                setEditorial("");
            }

            // Cerrar dialog si hay callback
            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            const backendErrors = error?.response?.data?.errors;
            const backendTitle = error?.response?.data?.title;

            const errorMessage =
                backendErrors?.Socio?.[0] ||
                backendErrors?.Titulo?.[0] ||
                backendTitle ||
                error?.response?.data?.message ||
                error?.message ||
                "Error al agregar juego";

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    // Generar opciones dinámicamente basadas en las restricciones
    const playerOptions = Array.from({ length: 10 }, (_, i) => i + 1);
    
    // Filtrar opciones de máximo basadas en el mínimo seleccionado
    const maxPlayerOptions = minPlayers 
        ? playerOptions.filter(num => num >= parseInt(minPlayers))
        : playerOptions;
    
    // Filtrar opciones de mínimo basadas en el máximo seleccionado
    const minPlayerOptions = maxPlayers
        ? playerOptions.filter(num => num <= parseInt(maxPlayers))
        : playerOptions;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Add Article</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent>
                    <Input 
                        type="text" 
                        placeholder="Nombre del Juego *" 
                        value={titulo} 
                        onChange={(e) => setTitulo(e.target.value)} 
                        required
                    />
                    <Input 
                        type="text" 
                        placeholder="Descripción" 
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                    />
                    <Select 
                        value={tipo || undefined} 
                        onValueChange={(value) => setTipo(value as "MESA" | "ROL")} 
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Tipo *" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MESA">MESA</SelectItem>
                            <SelectItem value="ROL">ROL</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input 
                        type="text" 
                        placeholder="Editorial" 
                        value={editorial} 
                        onChange={(e) => setEditorial(e.target.value)} 
                    />
                    <Input 
                        type="text" 
                        placeholder="Categoría" 
                        value={categoria} 
                        onChange={(e) => setCategoria(e.target.value)} 
                    />
                    <Input 
                        type="text" 
                        placeholder="Ubicación" 
                        value={ubicacion} 
                        onChange={(e) => setUbicacion(e.target.value)} 
                    />
                    <Input 
                        type="text" 
                        placeholder="Observaciones" 
                        value={observaciones} 
                        onChange={(e) => setObservaciones(e.target.value)} 
                    />
                    <Input 
                        type="number" 
                        placeholder="Edad Mínima" 
                        value={edad_minima} 
                        onChange={(e) => setEdad_minima(e.target.value)}
                        min="0"
                    />
                    <Input 
                        type="number" 
                        placeholder="Tiempo de Juego Mínimo (Minutos)" 
                        value={duracion_min} 
                        onChange={(e) => setDuracion_min(e.target.value)}
                        min="1"
                    />
                    <Select value={minPlayers} onValueChange={handleMinPlayersChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Minimo de Jugadores" />
                        </SelectTrigger>
                        <SelectContent>
                            {minPlayerOptions.map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                    {num}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={maxPlayers} onValueChange={handleMaxPlayersChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Maximo de Jugadores" />
                        </SelectTrigger>
                        <SelectContent>
                            {maxPlayerOptions.map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                    {num}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input type="date" placeholder="Fecha de Creación" value={date} readOnly />
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Agregando...' : 'Agregar Juego'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}