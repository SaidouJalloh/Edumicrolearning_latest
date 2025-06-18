// src/apis/generate-plan.js
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const {
    createPlanPrompt,
    createScriptPrompt
} = require('../prompts/plan-generator');

const router = express.Router();

// Fonction pour appeler Ollama
async function callLlama(prompt, options = {}) {
    try {
        const response = await axios.post(`${process.env.OLLAMA_URL}/api/generate`, {
            model: process.env.LLAMA_MODEL,
            prompt: prompt,
            stream: false,
            options: {
                temperature: options.temperature || 0.7,
                top_p: options.top_p || 0.9,
                max_tokens: options.max_tokens || 2000
            }
        });

        return response.data.response;
    } catch (error) {
        console.error('Erreur Llama:', error.message);
        throw new Error('Erreur génération IA');
    }
}

// API POST /ai/generate-plan
router.post('/generate-plan', async (req, res) => {
    try {
        const {
            topic,
            type,           // "conceptual" ou "demonstrative"
            resources = [], // URLs des ressources uploadées
            level,          // "beginner", "intermediate", "advanced"
            duration_minutes = 5
        } = req.body;

        // Validation
        if (!topic || !type || !level) {
            return res.status(400).json({
                error: 'Paramètres manquants: topic, type, level requis'
            });
        }

        console.log(`🎯 Génération plan: ${topic} (${type}, ${level}, ${duration_minutes}min)`);

        const planId = uuidv4();

        // Étape 1: Génération du plan pédagogique
        const planPrompt = createPlanPrompt({
            topic,
            type,
            level,
            duration_minutes,
            resources: resources.length > 0 ? 'Ressources pédagogiques fournies' : 'Aucune ressource'
        });

        const planResponse = await callLlama(planPrompt, {
            temperature: 0.7,
            max_tokens: 1500
        });

        // Parse du plan généré (structure JSON)
        let outline;
        try {
            // Extraction du JSON du plan
            const jsonMatch = planResponse.match(/\[[\s\S]*\]/);
            outline = jsonMatch ? JSON.parse(jsonMatch[0]) : [
                { title: "Introduction", content: "Introduction au sujet" },
                { title: "Développement", content: "Contenu principal" },
                { title: "Conclusion", content: "Récapitulatif et prochaines étapes" }
            ];
        } catch (e) {
            // Fallback si parsing JSON échoue
            outline = [
                { title: "Introduction", content: planResponse.substring(0, 200) },
                { title: "Développement", content: planResponse.substring(200, 800) },
                { title: "Conclusion", content: planResponse.substring(800, 1000) }
            ];
        }

        // Étape 2: Génération du script de narration
        const scriptPrompt = createScriptPrompt({
            topic,
            type,
            outline,
            duration_minutes
        });

        const scriptResponse = await callLlama(scriptPrompt, {
            temperature: 0.6,
            max_tokens: 1200
        });

        // Réponse finale
        const result = {
            plan_id: planId,
            topic,
            type,
            level,
            duration_minutes,
            outline,
            script: scriptResponse.trim(),
            generated_at: new Date().toISOString(),
            status: 'completed'
        };

        console.log(`✅ Plan généré avec succès: ${planId}`);
        res.json(result);

    } catch (error) {
        console.error('Erreur génération plan:', error);
        res.status(500).json({
            error: 'Erreur lors de la génération du plan',
            details: error.message
        });
    }
});

// API GET /ai/plans/:id (pour récupérer un plan existant)
router.get('/plans/:id', (req, res) => {
    // TODO: Implémenter stockage en base de données
    res.json({ message: 'Récupération plan - À implémenter avec base de données' });
});

module.exports = router;