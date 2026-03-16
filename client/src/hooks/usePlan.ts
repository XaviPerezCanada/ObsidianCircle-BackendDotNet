import { useState, useEffect } from "react";
import { planService, type Plan, type CreatePlanRequest, type UpdatePlanRequest } from "@/src/services/plan.service";

export function usePlan() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getPlans = async () => {
        try {
            setLoading(true);
            setError(null);
            const plansData = await planService.getActive();
            setPlans(plansData);
            return plansData;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al obtener los planes';
            setError(errorMessage);
            setPlans([]); // Establecer array vacío en caso de error
            throw err;
        } finally { 
            setLoading(false);
        }
    };

    const getPlanBySlug = async (slug: string) => {
        try {
            setLoading(true);
            setError(null);
            const plan = await planService.getBySlug(slug);
            return plan;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al obtener el plan';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createPlan = async (data: CreatePlanRequest) => {
        try {
            setLoading(true);
            setError(null);
            await planService.create(data);    
            const refreshed = await getPlans();
            return refreshed;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al crear el plan';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePlan = async (slug: string, data: UpdatePlanRequest) => {
        try {
            setLoading(true);
            setError(null);
            // En este momento no usamos update en el front público,
            // pero mantenemos la firma por si se reutiliza.
            // Para mantener consistencia, refrescamos la lista.
            // Necesitarías el id del plan para actualizar en /admin/plans/{id}.
            console.warn('updatePlan no está completamente implementado para admin.');
            return;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al actualizar el plan';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deletePlan = async (slug: string) => {
        try {
            setLoading(true);
            setError(null);
            await planService.delete(slug);
            const refreshed = await getPlans();
            return refreshed;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al eliminar el plan';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Cargar planes al montar
    useEffect(() => {
        getPlans();
    }, []);

    return {
        plans,
        loading,
        error,
        getPlans,
        getPlanBySlug,
        createPlan,
        updatePlan,
        deletePlan,
    };
}      