import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/src/components/ui/select";
import { juegoService, type CreateJuegoRequest } from "@/src/services/juego.service";
import { toast } from "@/src/hooks/use-toast";
import { useAuth } from "@/src/context/auth-context";

interface AddArticleProps {
  onSuccess?: () => void;
}

export function AddArticle({ onSuccess }: AddArticleProps) {
    const { user } = useAuth();

    const [titulo, setTitulo] = useState("");
    const [content, setContent] = useState("");
    const [minPlayers, setMinPlayers] = useState("");
    const [maxPlayers, setMaxPlayers] = useState("");
    const [date, setDate] = useState("");
    const [tipo, setTipo] = useState<"MESA" | "ROL" | "">("");
    const [edad_minima, setEdad_minima] = useState("");
    const [duracion_min, setDuracion_min] = useState("");
    const [sistema, setSistema] = useState("");
    const [ambientacion, setAmbientacion] = useState("");
    const [nivel_inicial, setNivel_inicial] = useState("");
    const [estado, setEstado] = useState<"ACTIVO" | "INACTIVO">("ACTIVO");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const now = new Date();
        const formattedDate = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        setDate(formattedDate);
    }, []);

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

        const socio = user?.username || user?.slug || user?.email;
        if (!socio) {
            toast({
                title: 'Error',
                description: 'No se pudo determinar el socio. Inicia sesión de nuevo.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const jugadoresMin = parseInt(minPlayers, 10);
            const jugadoresMax = parseInt(maxPlayers, 10);

            const juegoData: CreateJuegoRequest = {
                Titulo: titulo.trim(),
                Socio: socio,
                JugadoresMin: jugadoresMin,
                JugadoresMax: jugadoresMax,
                descripcion: content.trim() || undefined,
                tipo: tipo as "MESA" | "ROL",
                edad_minima: edad_minima ? parseInt(edad_minima, 10) : undefined,
                duracion_min: duracion_min ? parseInt(duracion_min, 10) : undefined,
                sistema: sistema.trim() || undefined,
                ambientacion: ambientacion.trim() || undefined,
                nivel_inicial: nivel_inicial ? parseInt(nivel_inicial, 10) : undefined,
                estado: estado,
            };

            await juegoService.create(juegoData);

            toast({
                title: 'Éxito',
                description: 'Juego agregado correctamente',
            });

            // Limpiar formulario
            setTitulo("");
            setContent("");
            setMinPlayers("");
            setMaxPlayers("");
            setTipo("");
            setEdad_minima("");
            setDuracion_min("");
            setSistema("");
            setAmbientacion("");
            setNivel_inicial("");
            setEstado("ACTIVO");

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
                        placeholder="Sistema" 
                        value={sistema} 
                        onChange={(e) => setSistema(e.target.value)} 
                    />
                    <Input 
                        type="text" 
                        placeholder="Ambientación" 
                        value={ambientacion} 
                        onChange={(e) => setAmbientacion(e.target.value)} 
                    />
                    <Input 
                        type="number" 
                        placeholder="Dificultad (1-Fácil, 10-Difícil)" 
                        value={nivel_inicial} 
                        onChange={(e) => setNivel_inicial(e.target.value)}
                        min="1"
                        max="10"
                    />
                    <Select value={estado} onValueChange={(value) => setEstado(value as "ACTIVO" | "INACTIVO")}>
                        <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                            <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                        </SelectContent>
                    </Select>
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