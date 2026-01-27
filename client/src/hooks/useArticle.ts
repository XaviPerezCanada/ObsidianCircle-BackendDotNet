import { useState } from "react";
import { articleService, type Article, type CreateArticleRequest, type UpdateArticleRequest } from "@/src/services/article.service";

export function useArticle() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getArticles = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await articleService.getAll();
            setArticles(response.data);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al obtener los artículos';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getArticleById = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await articleService.getById(id);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al obtener el artículo';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createArticle = async (data: CreateArticleRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await articleService.create(data);
            setArticles(prev => [...prev, response.data]);
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al crear el artículo';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateArticle = async (id: number, data: UpdateArticleRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await articleService.update(id, data);
            setArticles(prev => prev.map(article => 
                article.id === id ? response.data : article
            ));
            return response.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al actualizar el artículo';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteArticle = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            await articleService.delete(id);
            setArticles(prev => prev.filter(article => article.id !== id));
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al eliminar el artículo';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        articles,
        loading,
        error,
        getArticles,
        getArticleById,
        createArticle,
        updateArticle,
        deleteArticle,
    };
}

