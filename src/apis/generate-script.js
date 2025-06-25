// src/apis/generate-script.js - Génère PLAN + CONTENU + SCRIPT complet en une fois
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Cache pour les scripts
const scriptCache = new Map();

// Fonction pour appeler Groq
async function callGroq(prompt, options = {}) {
    try {
        console.log('🚀 Calling Groq API...');

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'Tu es un expert en création de contenu vidéo éducatif. Tu génères des plans structurés ET des scripts de narration complets. Réponds toujours en français avec un format JSON valide.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: options.temperature || 0.6,
            max_tokens: options.max_tokens || 3500
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

// Validation des champs obligatoires
function validatePayload(payload) {
    const errors = [];

    if (!payload.topic || typeof payload.topic !== 'string') {
        errors.push('Le champ "topic" est obligatoire et doit être une chaîne de caractères');
    } else if (payload.topic.length < 10 || payload.topic.length > 500) {
        errors.push('Le champ "topic" doit contenir entre 10 et 500 caractères');
    }

    if (!payload.capsuleType || !['conceptual', 'demonstrative'].includes(payload.capsuleType)) {
        errors.push('Le champ "capsuleType" est obligatoire et doit être "conceptual" ou "demonstrative"');
    }

    if (!payload.settings || typeof payload.settings !== 'object') {
        errors.push('Le champ "settings" est obligatoire et doit être un objet');
    } else {
        const { level, duration, style } = payload.settings;

        if (!level || !['beginner', 'intermediate', 'advanced'].includes(level)) {
            errors.push('Le champ "settings.level" est obligatoire et doit être "beginner", "intermediate" ou "advanced"');
        }

        if (!duration || ![3, 5].includes(duration)) {
            errors.push('Le champ "settings.duration" est obligatoire et doit être 3 ou 5');
        }

        if (!style || !['practical', 'corporate', 'academic', 'general'].includes(style)) {
            errors.push('Le champ "settings.style" est obligatoire et doit être "practical", "corporate", "academic" ou "general"');
        }
    }

    return errors;
}

// Calcul de la répartition temporelle
function calculateTimeDistribution(totalMinutes) {
    const totalSeconds = totalMinutes * 60;
    let introSeconds, developmentSeconds, conclusionSeconds;

    if (totalMinutes === 3) {
        introSeconds = 15;
        conclusionSeconds = 15;
        developmentSeconds = 150;
    } else if (totalMinutes === 5) {
        introSeconds = 20;
        conclusionSeconds = 20;
        developmentSeconds = 260;
    }

    return {
        total_seconds: totalSeconds,
        introduction: { duration_seconds: introSeconds },
        development: { duration_seconds: developmentSeconds },
        conclusion: { duration_seconds: conclusionSeconds }
    };
}

// API POST /ai/generate-script - Génère PLAN + CONTENU + SCRIPT complet
router.post('/generate-script', async (req, res) => {
    const startTime = Date.now();

    try {
        // Validation du payload
        const validationErrors = validatePayload(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Erreurs de validation',
                details: validationErrors,
                expected_format: {
                    topic: "string (10-500 caractères)",
                    capsuleType: "conceptual|demonstrative",
                    settings: {
                        level: "beginner|intermediate|advanced",
                        duration: "3|5",
                        style: "practical|corporate|academic|general"
                    },
                    script_style: "[optionnel] conversational|professional|energetic|educational"
                }
            });
        }

        const {
            topic,
            capsuleType,
            settings,
            script_style = 'conversational',
            resources = []
        } = req.body;

        const timeDistribution = calculateTimeDistribution(settings.duration);

        // Vérifier cache
        const cacheKey = `script-${topic}-${capsuleType}-${settings.level}-${settings.duration}-${settings.style}-${script_style}`;
        if (scriptCache.has(cacheKey)) {
            console.log(`💨 Script récupéré du cache: ${topic.substring(0, 50)}...`);
            const cached = scriptCache.get(cacheKey);
            cached.cached = true;
            cached.generation_time_ms = 0;
            cached.timestamp = new Date().toISOString();
            return res.json(cached);
        }

        console.log(`🎬 Génération PLAN + SCRIPT pour: ${topic} (${settings.duration}min, ${capsuleType})`);

        const planId = uuidv4();
        const scriptId = uuidv4();

        // Créer le prompt pour générer PLAN + SCRIPT complet
        const completePrompt = createCompletePrompt({
            topic,
            capsuleType,
            settings,
            script_style,
            timeDistribution,
            resources
        });

        // Génération avec Groq
        const response = await callGroq(completePrompt, {
            temperature: 0.6,
            max_tokens: 4000
        });

        // Parse de la réponse JSON
        let contentData;
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            contentData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (e) {
            console.warn('⚠️ JSON parsing failed, using fallback');
            contentData = null;
        }

        // Fallback si parsing échoue
        if (!contentData || !contentData.plan_sections || !contentData.script_sections) {
            contentData = createFallbackContent({ topic, capsuleType, settings, timeDistribution, script_style });
        }

        // Vérification durée totale
        const actualTotal = contentData.plan_sections.reduce((sum, s) => sum + s.duration_seconds, 0);
        const expectedTotal = timeDistribution.total_seconds;

        if (Math.abs(actualTotal - expectedTotal) > 5) {
            console.warn(`⚠️ Correction durée: ${actualTotal}s -> ${expectedTotal}s`);
            contentData = adjustTimings(contentData, expectedTotal);
        }

        const totalTime = Date.now() - startTime;

        // Générer le script complet unifié
        const fullScript = generateFullScript(contentData.script_sections);

        const result = {
            // IDs
            plan_id: planId,
            script_id: scriptId,

            // Informations de base
            topic,
            capsule_type: capsuleType,
            settings,
            script_style,

            // PLAN STRUCTURÉ
            plan_sections: contentData.plan_sections,
            video_goal: contentData.video_goal,

            // SCRIPT COMPLET
            script_sections: contentData.script_sections,
            full_script: fullScript,

            // Métriques
            total_duration_seconds: expectedTotal,
            sections_count: contentData.plan_sections.length,
            estimated_words: countWords(fullScript),
            speaking_pace: calculateSpeakingPace(fullScript, expectedTotal),

            // Conseils de narration
            narration_tips: contentData.narration_tips || [],

            // Métadonnées
            generation_time_ms: totalTime,
            provider: 'Groq',
            cached: false,
            generated_at: new Date().toISOString(),
            status: 'completed'
        };

        // Cache pendant 1 heure
        scriptCache.set(cacheKey, { ...result });
        setTimeout(() => scriptCache.delete(cacheKey), 3600000);

        console.log(`✅ PLAN + SCRIPT générés: ${result.sections_count} sections, ${result.estimated_words} mots en ${totalTime}ms`);
        res.json(result);

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`❌ Erreur génération complète:`, error);
        res.status(500).json({
            error: 'Erreur lors de la génération du plan et script',
            generation_time_ms: totalTime,
            details: error.message
        });
    }
});

// Fonction pour créer le prompt complet (plan + script)
function createCompletePrompt({ topic, capsuleType, settings, script_style, timeDistribution, resources }) {
    const { level, duration, style } = settings;

    const styleDescriptions = {
        practical: "Focus application concrète, exemples pratiques",
        corporate: "Ton professionnel, efficacité entreprise",
        academic: "Approche théorique structurée",
        general: "Accessible grand public, vulgarisation"
    };

    const scriptStyleDescriptions = {
        conversational: "Ton naturel et conversationnel, comme une discussion amicale",
        professional: "Ton professionnel mais accessible",
        energetic: "Ton dynamique et enthousiaste",
        educational: "Ton pédagogique clair et structuré"
    };

    const typeDescriptions = {
        conceptual: "Capsule explicative sur des concepts, théories ou soft-skills",
        demonstrative: "Capsule tutoriel montrant des étapes pratiques"
    };

    return `Tu dois créer un PLAN STRUCTURÉ + SCRIPT DE NARRATION COMPLET pour une capsule vidéo éducative.

CONTEXTE:
- Sujet: ${topic}
- Type: ${typeDescriptions[capsuleType]}
- Niveau: ${level}
- Durée: ${duration} minutes (${timeDistribution.total_seconds} secondes)
- Style contenu: ${style} - ${styleDescriptions[style]}
- Style script: ${script_style} - ${scriptStyleDescriptions[script_style]}
- Ressources: ${resources.length > 0 ? 'Ressources fournies' : 'Aucune ressource'}

STRUCTURE OBLIGATOIRE (3 parties):
1. INTRODUCTION (${timeDistribution.introduction.duration_seconds}s) - Accroche et présentation
2. DÉVELOPPEMENT (${timeDistribution.development.duration_seconds}s) - Contenu principal
3. CONCLUSION (${timeDistribution.conclusion.duration_seconds}s) - Récap et action

OBJECTIFS:
1. Créer un PLAN détaillé de ce qui sera abordé
2. Créer un SCRIPT complet prêt à être lu/enregistré
3. Timing précis respecté pour chaque partie
4. Ton ${script_style} adapté au niveau ${level}

FORMAT JSON OBLIGATOIRE:
{
  "plan_sections": [
    {
      "section_number": 1,
      "title": "Introduction",
      "type": "introduction",
      "duration_seconds": ${timeDistribution.introduction.duration_seconds},
      "what_to_cover": [
        "Point 1 à aborder dans l'intro",
        "Point 2 à aborder dans l'intro"
      ],
      "content_summary": "Résumé de ce qui sera expliqué"
    },
    {
      "section_number": 2,
      "title": "Développement",
      "type": "development",
      "duration_seconds": ${timeDistribution.development.duration_seconds},
      "what_to_cover": [
        "Concept principal 1",
        "Concept principal 2",
        "Exemple concret"
      ],
      "content_summary": "Résumé du contenu principal"
    },
    {
      "section_number": 3,
      "title": "Conclusion",
      "type": "conclusion",
      "duration_seconds": ${timeDistribution.conclusion.duration_seconds},
      "what_to_cover": [
        "Récapitulatif des points clés",
        "Call-to-action motivant"
      ],
      "content_summary": "Résumé de la conclusion"
    }
  ],
  "script_sections": [
    {
      "section_number": 1,
      "title": "Introduction",
      "duration_seconds": ${timeDistribution.introduction.duration_seconds},
      "script_text": "Texte EXACT à dire pendant l'introduction, adapté au timing. [PAUSE] Avec pauses marquées. Ton ${script_style}.",
      "timing_notes": "Indications de rythme et d'intonation",
      "visual_cues": "Suggestions d'éléments visuels"
    },
    {
      "section_number": 2,
      "title": "Développement",
      "duration_seconds": ${timeDistribution.development.duration_seconds},
      "script_text": "Script complet du développement, respectant les ${timeDistribution.development.duration_seconds} secondes. [PAUSE] Texte fluide et naturel.",
      "timing_notes": "Notes de timing spécifiques",
      "visual_cues": "Éléments visuels suggérés"
    },
    {
      "section_number": 3,
      "title": "Conclusion",
      "duration_seconds": ${timeDistribution.conclusion.duration_seconds},
      "script_text": "Script de conclusion motivant et conclusif. [PAUSE] Call-to-action clair.",
      "timing_notes": "Ton conclusif et motivant",
      "visual_cues": "Récap visuel et CTA"
    }
  ],
  "video_goal": "Objectif simple que l'utilisateur atteindra après la vidéo",
  "narration_tips": [
    "Conseil 1 pour la narration",
    "Conseil 2 pour le rythme",
    "Conseil 3 pour l'intonation"
  ]
}

CONTRAINTES:
- Durée totale EXACTE: ${timeDistribution.total_seconds} secondes
- Script prêt à lire à voix haute
- Rythme ~150 mots/minute
- Ton ${script_style} constant
- Transitions fluides entre sections

Génère le JSON complet avec PLAN + SCRIPT:`;
}

// Fonction fallback pour créer le contenu complet
function createFallbackContent({ topic, capsuleType, settings, timeDistribution, script_style }) {
    const { level, duration, style } = settings;

    // Plan structuré
    const planSections = [
        {
            section_number: 1,
            title: "Introduction",
            type: "introduction",
            duration_seconds: timeDistribution.introduction.duration_seconds,
            what_to_cover: [
                `Présentation du sujet: ${topic}`,
                "Pourquoi c'est important",
                "Annonce du plan"
            ],
            content_summary: `Introduction engageante sur ${topic}`
        },
        {
            section_number: 2,
            title: "Développement",
            type: "development",
            duration_seconds: timeDistribution.development.duration_seconds,
            what_to_cover: [
                "Points essentiels du sujet",
                "Exemples concrets",
                "Applications pratiques"
            ],
            content_summary: `Explication complète de ${topic} avec exemples`
        },
        {
            section_number: 3,
            title: "Conclusion",
            type: "conclusion",
            duration_seconds: timeDistribution.conclusion.duration_seconds,
            what_to_cover: [
                `Récap des points clés sur ${topic}`,
                "Encouragement à la pratique"
            ],
            content_summary: "Synthèse motivante et call-to-action"
        }
    ];

    // Script de narration
    const scriptSections = [
        {
            section_number: 1,
            title: "Introduction",
            duration_seconds: timeDistribution.introduction.duration_seconds,
            script_text: `Bonjour et bienvenue ! Aujourd'hui, nous allons explorer ${topic}. [PAUSE] ${duration === 3 ? 'En 3 minutes' : 'En 5 minutes'}, vous allez découvrir l'essentiel de ce sujet. C'est parti !`,
            timing_notes: "Ton accueillant et énergique",
            visual_cues: "Titre principal + intro visuelle"
        },
        {
            section_number: 2,
            title: "Développement",
            duration_seconds: timeDistribution.development.duration_seconds,
            script_text: `Rentrons maintenant dans le vif du sujet. [PAUSE] ${topic}, c'est un domaine fascinant qui mérite qu'on s'y attarde. [PAUSE] Voici les points essentiels que vous devez retenir. Premièrement... [PAUSE] Deuxièmement... [PAUSE] Et enfin, n'oubliez pas que...`,
            timing_notes: "Rythme régulier, bien articuler les points clés",
            visual_cues: "Démonstrations, schémas, exemples visuels"
        },
        {
            section_number: 3,
            title: "Conclusion",
            duration_seconds: timeDistribution.conclusion.duration_seconds,
            script_text: `Voilà ! Nous arrivons à la fin de cette capsule sur ${topic}. [PAUSE] J'espère que ces informations vous seront utiles. Votre mission maintenant : mettez en pratique ce que vous venez d'apprendre. À bientôt !`,
            timing_notes: "Ton conclusif et motivant",
            visual_cues: "Récap visuel + call-to-action"
        }
    ];

    return {
        plan_sections: planSections,
        script_sections: scriptSections,
        video_goal: `Comprendre et appliquer les bases de ${topic}`,
        narration_tips: [
            "Maintenir un rythme de 150 mots par minute",
            "Respecter les pauses marquées [PAUSE]",
            "Adapter l'intonation au contenu"
        ]
    };
}

// Fonctions utilitaires
function adjustTimings(contentData, expectedTotal) {
    const sections = contentData.plan_sections;
    const actualTotal = sections.reduce((sum, s) => sum + s.duration_seconds, 0);
    const ratio = expectedTotal / actualTotal;

    sections.forEach(section => {
        section.duration_seconds = Math.round(section.duration_seconds * ratio);
    });

    // Appliquer la même correction au script
    contentData.script_sections.forEach((scriptSection, index) => {
        scriptSection.duration_seconds = sections[index].duration_seconds;
    });

    return contentData;
}

function generateFullScript(scriptSections) {
    return scriptSections
        .map(section => `[${section.title}]\n${section.script_text}`)
        .join('\n\n');
}

function countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

function calculateSpeakingPace(text, durationSeconds) {
    const words = countWords(text);
    const wordsPerMinute = Math.round((words / durationSeconds) * 60);
    return {
        words_per_minute: wordsPerMinute,
        total_words: words,
        duration_seconds: durationSeconds,
        pace_assessment: wordsPerMinute < 130 ? 'lent' : wordsPerMinute > 170 ? 'rapide' : 'optimal'
    };
}

// API GET pour récupérer un script existant
router.get('/scripts/:id', (req, res) => {
    // TODO: Implémenter stockage en base de données
    res.json({
        message: 'Récupération script - À implémenter avec base de données',
        script_id: req.params.id,
        status: 'not_implemented'
    });
});

// API GET pour les informations sur les styles de script
router.get('/generate-script/info', (req, res) => {
    res.json({
        endpoint: "POST /ai/generate-script",
        description: "Génère PLAN + CONTENU + SCRIPT complet en une seule fois",
        features: [
            "Plan structuré avec timing précis",
            "Script de narration prêt à lire",
            "Adaptation au niveau et style",
            "Timing optimisé (3 ou 5 minutes)",
            "Conseils de narration inclus"
        ],
        example_request: {
            topic: "Les bases de la communication efficace",
            capsuleType: "conceptual",
            settings: {
                level: "beginner",
                duration: 5,
                style: "practical"
            },
            script_style: "conversational"
        },
        script_styles: {
            conversational: "Ton naturel et amical",
            professional: "Ton corporate accessible",
            energetic: "Ton dynamique et enthousiaste",
            educational: "Ton pédagogique structuré"
        },
        payload_format: {
            topic: "string (10-500 caractères)",
            capsuleType: "conceptual|demonstrative",
            settings: {
                level: "beginner|intermediate|advanced",
                duration: "3|5",
                style: "practical|corporate|academic|general"
            },
            script_style: "[optionnel] conversational|professional|energetic|educational"
        }
    });
});

module.exports = router;