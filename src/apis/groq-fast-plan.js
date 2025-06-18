// src/apis/groq-fast-plan.js - Version Groq de votre API

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const LLMFactory = require('../utils/llm-factory');

const router = express.Router();
const llmFactory = new LLMFactory();

// Cache (même principe qu'avant)
const planCache = new Map();

function createOptimizedPrompt({ topic, type, level, duration_minutes }) {
    return `Tu es un expert en pédagogie. Crée un plan de formation micro-learning.

SUJET: ${topic}
TYPE: ${type === 'conceptual' ? 'Conceptuel (théorie)' : 'Démonstratif (logiciels)'}
NIVEAU: ${level}  
DURÉE: ${duration_minutes} minutes

INSTRUCTIONS:
- Plan structuré en 3-4 sections maximum
- Format JSON uniquement
- Total ${duration_minutes * 60} secondes

FORMAT RÉPONSE:
[
  {"title":"Introduction","objective":"Présenter le sujet","duration_seconds":30},
  {"title":"Point clé 1","objective":"Objectif précis","duration_seconds":120},
  {"title":"Point clé 2","objective":"Objectif précis","duration_seconds":120},
  {"title":"Conclusion","objective":"Récapituler","duration_seconds":30}
]

Réponse JSON directe:`;
}

// API /ai/groq-plan - Version ultra-rapide avec Groq
router.post('/groq-plan', async (req, res) => {
    const startTime = Date.now();

    try {
        const { topic, type, level, duration_minutes = 5 } = req.body;

        if (!topic || !type || !level) {
            return res.status(400).json({
                error: 'Paramètres manquants: topic, type, level requis'
            });
        }

        // Vérifier cache
        const cacheKey = `groq-${topic}-${type}-${level}-${duration_minutes}`;
        if (planCache.has(cacheKey)) {
            console.log(`💨 Plan Groq récupéré du cache: ${topic}`);
            const cached = planCache.get(cacheKey);
            cached.cached = true;
            cached.generation_time_ms = 0;
            return res.json(cached);
        }

        console.log(`⚡ Génération Groq: ${topic} (${type}, ${level})`);

        const planId = uuidv4();
        const prompt = createOptimizedPrompt({ topic, type, level, duration_minutes });

        // Génération avec Groq (ultra-rapide)
        const generation = await llmFactory.generateText(prompt, {
            temperature: 0.6,
            max_tokens: 500
        });

        // Parse JSON
        let sections;
        try {
            const jsonMatch = generation.text.match(/\[[\s\S]*\]/);
            sections = jsonMatch ? JSON.parse(jsonMatch[0]) : [
                { title: "Introduction", objective: "Présenter", duration_seconds: 30 },
                { title: "Développement", objective: "Apprendre", duration_seconds: duration_minutes * 60 - 60 },
                { title: "Conclusion", objective: "Conclure", duration_seconds: 30 }
            ];
        } catch (e) {
            sections = [
                { title: "Introduction", objective: "Présenter le sujet", duration_seconds: 30 },
                { title: "Contenu principal", objective: "Maîtriser l'essentiel", duration_seconds: duration_minutes * 60 - 60 },
                { title: "Conclusion", objective: "Récapituler", duration_seconds: 30 }
            ];
        }

        const totalTime = Date.now() - startTime;

        const result = {
            plan_id: planId,
            topic,
            type,
            level,
            duration_minutes,
            total_duration_seconds: sections.reduce((sum, s) => sum + s.duration_seconds, 0),
            sections_count: sections.length,
            sections,
            generation_time_ms: totalTime,
            llm_generation_time_ms: generation.duration_ms,
            provider: generation.provider,
            cached: false,
            generated_at: new Date().toISOString(),
            status: 'completed'
        };

        // Cache 1 heure
        planCache.set(cacheKey, { ...result });
        setTimeout(() => planCache.delete(cacheKey), 3600000);

        console.log(`✅ Plan Groq généré en ${totalTime}ms (LLM: ${generation.duration_ms}ms)`);
        res.json(result);

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`❌ Erreur Groq après ${totalTime}ms:`, error);
        res.status(500).json({
            error: 'Erreur génération plan Groq',
            generation_time_ms: totalTime,
            details: error.message
        });
    }
});

// API de santé pour vérifier providers
router.get('/health', async (req, res) => {
    try {
        const health = await llmFactory.healthCheck();
        res.json({
            status: 'ok',
            providers: health,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

module.exports = router;