import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/src/context/auth-context";
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldLabel,
    FieldLegend,
    FieldSet,
  } from "@/src/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { usePlan } from "@/src/hooks/usePlan";
import { subscriptionService } from "@/src/services/subscription.service";
import { toast } from "@/src/components/ui/use-toast";

export function PaySubscriptionPage() {
    const { isAuthenticated, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { plans, loading, error } = usePlan();
    const [selectedPlan, setSelectedPlan] = useState<string>("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        // Seleccionar el primer plan activo por defecto
        if (plans.length > 0 && !selectedPlan) {
            const firstActivePlan = plans.find(plan => plan.activo === 1);
            if (firstActivePlan) {
                setSelectedPlan(firstActivePlan.slug);
            }
        }
    }, [plans, selectedPlan]);

    // Manejar redirección después del pago exitoso
    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
            handlePaymentSuccess();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Filtrar solo planes activos
    const activePlans = (plans || []).filter(plan => plan.activo === 1);

    // Función para formatear el precio
    const formatPrice = (precioCent: number) => {
        return (precioCent / 100).toFixed(2);
    };

    // Función para obtener el texto del periodo
    const getPeriodoText = (periodo: string) => {
        const periodoMap: Record<string, string> = {
            'MENSUAL': 'mes',
            'TRIMESTRAL': '3 meses',
            'ANUAL': 'año',
        };
        return periodoMap[periodo] || periodo;
    };

    const handleSubscribe = async () => {
        if (!selectedPlan) {
            toast({
                title: 'Error',
                description: 'Por favor selecciona un plan',
                variant: 'destructive',
            });
            return;
        }

        setProcessing(true);

        try {
            // Crear sesión de checkout
            const response = await subscriptionService.createCheckoutSession({
                planSlug: selectedPlan,
            });

            // Redirigir a Stripe Checkout
            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error('No se recibió URL de checkout');
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Error al crear sesión de pago';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
            setProcessing(false);
        }
    };

    const handlePaymentSuccess = async () => {
        try {
            // Confirmar el pago en el backend
            const response = await subscriptionService.confirmPayment();
            
            if (response.data.success) {
                // Refrescar los datos del usuario para obtener el nuevo tipo
                await refreshUser();
                
                toast({
                    title: '¡Pago exitoso!',
                    description: 'Tu suscripción ha sido activada. Ahora eres SOCIO.',
                });

                // Redirigir al perfil después de 2 segundos
                setTimeout(() => {
                    navigate('/profile');
                }, 2000);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Error al confirmar el pago';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    return (
        <div 
            className="flex items-center justify-center min-h-screen pt-20 px-6 pb-6 bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: "url('/images/Suscripcion.png')" }}
            >
                        
            <Card className="w-full max-w-xl bg-card/50 backdrop-blur-sm border-border">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">Únete a nuestra comunidad</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Cargando planes...</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="text-center py-8">
                            <p className="text-destructive">Error: {error}</p>
                        </div>
                    )}

                    {!loading && !error && activePlans.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No hay planes disponibles en este momento</p>
                        </div>
                    )}

                    {!loading && !error && activePlans.length > 0 && (
                        <div className="flex items-center justify-center pt-4 mb-6">
                            <FieldSet className="w-full max-w-lg">
                                <FieldLegend variant="label">Planes de Suscripción</FieldLegend>
                                <FieldDescription>
                                    Elige el plan que mejor se adapte a tus necesidades.
                                </FieldDescription>
                                <RadioGroup 
                                    value={selectedPlan} 
                                    onValueChange={setSelectedPlan}
                                >
                                    {activePlans.map((plan) => (
                                        <Field key={plan.id} orientation="horizontal" className="items-center">
                                            <RadioGroupItem 
                                                value={plan.slug} 
                                                id={`plan-${plan.slug}`}
                                            />
                                            <FieldLabel 
                                                htmlFor={`plan-${plan.slug}`}
                                                className="font-normal flex-1 ml-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-lg font-bold">{plan.nombre}</span>
                                                        <span className="text-foreground/80 ml-2">
                                                            ({formatPrice(plan.precio_cent)}€/{getPeriodoText(plan.periodo)})
                                                        </span>
                                                    </div>
                                                   
                                                </div>
                                            </FieldLabel>
                                        </Field>
                                    ))}
                                </RadioGroup>
                            </FieldSet>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex items-center justify-center">
                    {searchParams.get('session_id') ? (
                        <div className="text-center">
                            <p className="text-green-600 font-semibold mb-2">Procesando pago...</p>
                            <p className="text-sm text-muted-foreground">Por favor espera...</p>
                        </div>
                    ) : (
                        <Button 
                            onClick={handleSubscribe}
                            disabled={!selectedPlan || loading || processing}
                            className="w-full max-w-md"
                        >
                            {processing ? 'Redirigiendo a pago...' : loading ? 'Cargando...' : 'Suscribirse'}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}