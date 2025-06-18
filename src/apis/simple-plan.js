// src/apis/simple-plan.js
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

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
                max_tokens: options.max_tokens || 800
            }
        });

        return response.data.response;
    } catch (error) {
        console.error('Erreur Llama:', error.message);
        throw new Error('Erreur génération IA');
    }
}

// API POST /ai/simple-plan
router.post('/simple-plan', async (req, res) => {
    try {
        const {
            topic,
            type,           // "conceptual" ou "demonstrative"
            level,          // "beginner", "intermediate", "advanced"
            duration_minutes = 5
        } = req.body;

        // Validation
        if (!topic || !type || !level) {
            return res.status(400).json({
                error: 'Paramètres manquants: topic, type, level requis'
            });
        }

        console.log(`📋 Génération plan simple: ${topic} (${type}, ${level}, ${duration_minutes}min)`);

        const planId = uuidv4();

        // Prompt simplifié pour plan seulement
        const prompt = `Tu es un expert en pédagogie. Crée un plan de formation micro-learning.

SUJET: ${topic}
TYPE: ${type === 'conceptual' ? 'Formation conceptuelle (théorie, soft-skills)' : 'Formation démonstrative (logiciels, procédures)'}
NIVEAU: ${level}
DURÉE: ${duration_minutes} minutes

CONSIGNE:
Génère un plan structuré avec 3-4 sections maximum. Chaque section doit avoir:
- Un titre clair et accrocheur
- Une durée en secondes
- Un objectif pédagogique précis

FORMAT DE RÉPONSE (JSON uniquement):
[
  {
    "title": "Titre de la section",
    "objective": "Objectif pédagogique de cette section",
    "duration_seconds": 30
  }
]

Le total des durées doit faire ${duration_minutes * 60} secondes maximum.

${type === 'demonstrative' ?
                'SPÉCIAL DÉMONSTRATIF: Les titres doivent indiquer les actions concrètes (ex: "Ouvrir Excel", "Créer le tableau", etc.)' :
                'SPÉCIAL CONCEPTUEL: Les titres doivent couvrir la compréhension et l\'application pratique.'}

Réponds UNIQUEMENT avec le JSON:`;

        const response = await callLlama(prompt, {
            temperature: 0.6,
            max_tokens: 600
        });

        // Parse du JSON
        let planSections;
        try {
            // Extraction du JSON
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            planSections = jsonMatch ? JSON.parse(jsonMatch[0]) : [
                {
                    title: "Introduction",
                    objective: "Présenter le sujet et les objectifs",
                    duration_seconds: 30
                },
                {
                    title: "Développement principal",
                    objective: "Maîtriser les points clés",
                    duration_seconds: 240
                },
                {
                    title: "Conclusion",
                    objective: "Récapituler et donner les prochaines étapes",
                    duration_seconds: 30
                }
            ];
        } catch (e) {
            console.warn('Erreur parsing JSON, utilisation plan par défaut');
            planSections = [
                {
                    title: "Introduction",
                    objective: "Présenter le sujet",
                    duration_seconds: 30
                },
                {
                    title: "Points clés",
                    objective: "Maîtriser l'essentiel",
                    duration_seconds: duration_minutes * 60 - 60
                },
                {
                    title: "Conclusion",
                    objective: "Récapituler",
                    duration_seconds: 30
                }
            ];
        }

        // Validation des durées
        const totalDuration = planSections.reduce((sum, section) => sum + section.duration_seconds, 0);

        const result = {
            plan_id: planId,
            topic,
            type,
            level,
            duration_minutes,
            total_duration_seconds: totalDuration,
            sections_count: planSections.length,
            sections: planSections,
            generated_at: new Date().toISOString(),
            status: 'completed'
        };

        console.log(`✅ Plan simple généré: ${planSections.length} sections, ${totalDuration}s total`);
        res.json(result);

    } catch (error) {
        console.error('Erreur génération plan simple:', error);
        res.status(500).json({
            error: 'Erreur lors de la génération du plan',
            details: error.message
        });
    }
});

module.exports = router;

// Mise à jour src/server.js - Ajouter cette ligne:
// const simplePlanRouter = require('./apis/simple-plan');
// app.use('/ai', simplePlanRouter);

/*
TEST POSTMAN:

POST http://localhost:3001/ai/simple-plan
Content-Type: application/json

Body:
{
  "topic": "Créer un TCD sur Excel",
  "type": "demonstrative",
  "level": "beginner",
  "duration_minutes": 5
}

RÉPONSE ATTENDUE:
{
  "plan_id": "uuid-généré",
  "topic": "Créer un TCD sur Excel",
  "type": "demonstrative",
  "level": "beginner", 
  "duration_minutes": 5,
  "total_duration_seconds": 300,
  "sections_count": 4,
  "sections": [
    {
      "title": "🎯 Introduction aux TCD",
      "objective": "Comprendre l'utilité des tableaux croisés dynamiques",
      "duration_seconds": 30
    },
    {
      "title": "📊 Sélectionner les données",
      "objective": "Apprendre à choisir et préparer les données sources",
      "duration_seconds": 90
    },
    {
      "title": "⚙️ Créer le TCD",
      "objective": "Insérer et configurer le tableau croisé dynamique",
      "duration_seconds": 150
    },
    {
      "title": "✅ Finalisation",
      "objective": "Personnaliser et valider le résultat",
      "duration_seconds": 30
    }
  ],
  "generated_at": "2025-06-16T...",
  "status": "completed"
}
*/