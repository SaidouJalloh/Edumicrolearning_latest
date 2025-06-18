// src/apis/fast-simple-plan.js
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Cache simple en mémoire pour éviter les re-générations
const planCache = new Map();

// Configuration optimisée pour vitesse
const FAST_CONFIG = {
    temperature: 0.3,        // Moins créatif = plus rapide
    top_p: 0.8,
    max_tokens: 400,         // Réponses plus courtes
    repeat_penalty: 1.1,
    num_predict: 400,
    num_ctx: 1024,          // Contexte réduit
    num_thread: 8           // Utiliser tous les cores CPU
};

// Fonction Llama optimisée
async function callLlamaFast(prompt) {
    try {
        const response = await axios.post(`${process.env.OLLAMA_URL}/api/generate`, {
            model: process.env.LLAMA_MODEL,
            prompt: prompt,
            stream: false,
            options: FAST_CONFIG
        });

        return response.data.response;
    } catch (error) {
        console.error('Erreur Llama:', error.message);
        throw new Error('Erreur génération IA');
    }
}

// Prompt optimisé (plus court et direct)
function createFastPlanPrompt({ topic, type, level, duration_minutes }) {
    const typeText = type === 'conceptual' ? 'théorique' : 'pratique';

    return `Plan formation ${typeText} "${topic}" niveau ${level}, ${duration_minutes}min.

Format JSON uniquement:
[
  {"title":"Introduction","objective":"Présenter","duration_seconds":30},
  {"title":"Point clé 1","objective":"Apprendre X","duration_seconds":120},
  {"title":"Point clé 2","objective":"Maîtriser Y","duration_seconds":120},
  {"title":"Conclusion","objective":"Récapituler","duration_seconds":30}
]

Total: ${duration_minutes * 60}s max. Réponse JSON directe:`;
}

// API POST /ai/fast-plan (version ultra-rapide)
router.post('/fast-plan', async (req, res) => {
    const startTime = Date.now();

    try {
        const { topic, type, level, duration_minutes = 5 } = req.body;

        if (!topic || !type || !level) {
            return res.status(400).json({
                error: 'Paramètres manquants: topic, type, level requis'
            });
        }

        // Vérifier le cache
        const cacheKey = `${topic}-${type}-${level}-${duration_minutes}`;
        if (planCache.has(cacheKey)) {
            console.log(`💨 Plan récupéré du cache: ${topic}`);
            const cachedResult = planCache.get(cacheKey);
            cachedResult.cached = true;
            cachedResult.generation_time_ms = 0;
            return res.json(cachedResult);
        }

        console.log(`⚡ Génération rapide: ${topic} (${type}, ${level})`);

        const planId = uuidv4();
        const prompt = createFastPlanPrompt({ topic, type, level, duration_minutes });

        // Génération avec config optimisée
        const response = await callLlamaFast(prompt);

        // Parse rapide du JSON
        let sections;
        try {
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            sections = jsonMatch ? JSON.parse(jsonMatch[0]) : [
                { title: "Introduction", objective: "Présenter", duration_seconds: 30 },
                { title: "Développement", objective: "Apprendre", duration_seconds: duration_minutes * 60 - 60 },
                { title: "Conclusion", objective: "Récapituler", duration_seconds: 30 }
            ];
        } catch (e) {
            sections = [
                { title: "Introduction", objective: "Présenter le sujet", duration_seconds: 30 },
                { title: "Contenu principal", objective: "Maîtriser l'essentiel", duration_seconds: duration_minutes * 60 - 60 },
                { title: "Conclusion", objective: "Récapituler", duration_seconds: 30 }
            ];
        }

        const generationTime = Date.now() - startTime;

        const result = {
            plan_id: planId,
            topic,
            type,
            level,
            duration_minutes,
            total_duration_seconds: sections.reduce((sum, s) => sum + s.duration_seconds, 0),
            sections_count: sections.length,
            sections,
            generation_time_ms: generationTime,
            cached: false,
            generated_at: new Date().toISOString(),
            status: 'completed'
        };

        // Mise en cache pour 1 heure
        planCache.set(cacheKey, { ...result });
        setTimeout(() => planCache.delete(cacheKey), 3600000);

        console.log(`✅ Plan rapide généré en ${generationTime}ms`);
        res.json(result);

    } catch (error) {
        const generationTime = Date.now() - startTime;
        console.error(`❌ Erreur après ${generationTime}ms:`, error);
        res.status(500).json({
            error: 'Erreur génération plan',
            generation_time_ms: generationTime,
            details: error.message
        });
    }
});

module.exports = router;