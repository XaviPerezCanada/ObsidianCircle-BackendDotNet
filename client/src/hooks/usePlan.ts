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
            const response = await planService.getAll();
            // planService.getAll() ya devuelve el array directamente, no response.data
            const plansData = Array.isArray(response) ? response : [];
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
            const response = await planService.getBySlug(slug);
            return response.data;
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
            const response = await planService.create(data);    
            setPlans(prev => [...prev, response.data]);
            return response.data;
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
            const response = await planService.update(slug, data);
            setPlans(prev => prev.map(plan => plan.slug === slug ? response.data : plan));
            return response.data;
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
            setPlans(prev => prev.filter(plan => plan.slug !== slug));
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