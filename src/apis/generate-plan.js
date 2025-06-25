
// src/apis/generate-plan.js - VERSION OPTIMISÉE
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const {
    createPlanPrompt,
    createScriptPrompt
} = require('../prompts/plan-generator');

const router = express.Router();

// Fonction pour appeler Groq
async function callGroq(prompt, options = {}) {
    try {
        console.log('🚀 Calling Groq API...');

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert educational content creator. Always respond in French and follow the exact format requested.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 2000
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Groq response received');
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('❌ Erreur Groq:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
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

        // Étape 1: Génération du plan pédagogique amélioré
        const planPrompt = `
Crée un plan pédagogique structuré pour une micro-capsule de formation de ${duration_minutes} minutes sur le sujet : "${topic}".

Type de capsule : ${type}
Niveau : ${level}
Ressources : ${resources.length > 0 ? 'Ressources pédagogiques fournies' : 'Aucune ressource'}

Réponds UNIQUEMENT avec un JSON valide au format suivant :
[
  {
    "title": "Introduction",
    "content": "Description détaillée de l'introduction",
    "duration_seconds": 30
  },
  {
    "title": "Étape 1",
    "content": "Description détaillée de l'étape 1",
    "duration_seconds": 120
  },
  {
    "title": "Étape 2",
    "content": "Description détaillée de l'étape 2",
    "duration_seconds": 120
  },
  {
    "title": "Conclusion",
    "content": "Description détaillée de la conclusion",
    "duration_seconds": 30
  }
]

Le contenu doit être en français, pratique et adapté au niveau ${level}.
`;

        const planResponse = await callGroq(planPrompt, {
            temperature: 0.7,
            max_tokens: 1500
        });

        // Parse du plan généré (amélioré)
        let outline;
        try {
            // Nettoyage de la réponse pour extraire le JSON
            const cleanResponse = planResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            // Extraction du JSON du plan
            const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                outline = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found');
            }

            console.log('✅ Plan JSON parsed successfully');
        } catch (e) {
            console.warn('⚠️ JSON parsing failed, using structured fallback');

            // Fallback structuré plus intelligent
            const duration_per_section = Math.floor((duration_minutes * 60) / 4);
            outline = [
                {
                    title: "Introduction",
                    content: `Introduction au sujet : ${topic}. Présentation des objectifs et du plan de la session.`,
                    duration_seconds: 30
                },
                {
                    title: "Étape 1 - Préparation",
                    content: `Première étape pratique pour ${topic}. Préparation et mise en place des outils nécessaires.`,
                    duration_seconds: duration_per_section
                },
                {
                    title: "Étape 2 - Réalisation",
                    content: `Étape principale de réalisation pour ${topic}. Application pratique des concepts.`,
                    duration_seconds: duration_per_section
                },
                {
                    title: "Conclusion",
                    content: `Récapitulatif des points clés de ${topic} et prochaines étapes recommandées.`,
                    duration_seconds: 30
                }
            ];
        }

        // Étape 2: Génération du script de narration amélioré
        const scriptPrompt = `
Crée un script de narration pour une micro-capsule de formation de ${duration_minutes} minutes sur "${topic}".

Plan de la formation :
${outline.map((section, index) => `${index + 1}. ${section.title} (${section.duration_seconds}s): ${section.content}`).join('\n')}

Type : ${type}
Niveau : ${level}

Le script doit être :
- En français
- Engageant et dynamique
- Adapté à une narration audio
- Structuré avec des transitions fluides
- Incluant des appels à l'action
- D'une durée totale de ${duration_minutes} minutes

Format attendu : Script complet avec indications de timing et de tonalité.
`;

        const scriptResponse = await callGroq(scriptPrompt, {
            temperature: 0.6,
            max_tokens: 1500
        });

        // Réponse finale optimisée
        const result = {
            plan_id: planId,
            topic,
            type,
            level,
            duration_minutes,
            outline,
            script: scriptResponse.trim(),
            generated_at: new Date().toISOString(),
            status: 'completed',
            powered_by: 'Groq',
            model_used: process.env.GROQ_MODEL || 'llama3-8b-8192',
            total_sections: outline.length,
            estimated_total_duration: outline.reduce((sum, section) => sum + (section.duration_seconds || 0), 0)
        };

        console.log(`✅ Plan généré avec succès: ${planId}`);
        console.log(`📊 Sections: ${result.total_sections}, Durée estimée: ${result.estimated_total_duration}s`);

        res.json(result);

    } catch (error) {
        console.error('❌ Erreur génération plan:', error);
        res.status(500).json({
            error: 'Erreur lors de la génération du plan',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// API GET /ai/plans/:id (pour récupérer un plan existant)
router.get('/plans/:id', (req, res) => {
    // TODO: Implémenter stockage en base de données
    res.json({
        message: 'Récupération plan - À implémenter avec base de données',
        plan_id: req.params.id,
        status: 'not_implemented'
    });
});

module.exports = router;