// // src/apis/groq-fast-plan.js - Version Groq de votre API

// const express = require('express');
// const { v4: uuidv4 } = require('uuid');
// const LLMFactory = require('../utils/llm-factory');

// const router = express.Router();
// const llmFactory = new LLMFactory();

// // Cache (même principe qu'avant)
// const planCache = new Map();

// function createOptimizedPrompt({ topic, type, level, duration_minutes }) {
//     return `Tu es un expert en pédagogie. Crée un plan de formation micro-learning.

// SUJET: ${topic}
// TYPE: ${type === 'conceptual' ? 'Conceptuel (théorie)' : 'Démonstratif (logiciels)'}
// NIVEAU: ${level}  
// DURÉE: ${duration_minutes} minutes

// INSTRUCTIONS:
// - Plan structuré en 3-4 sections maximum
// - Format JSON uniquement
// - Total ${duration_minutes * 60} secondes

// FORMAT RÉPONSE:
// [
//   {"title":"Introduction","objective":"Présenter le sujet","duration_seconds":30},
//   {"title":"Point clé 1","objective":"Objectif précis","duration_seconds":120},
//   {"title":"Point clé 2","objective":"Objectif précis","duration_seconds":120},
//   {"title":"Conclusion","objective":"Récapituler","duration_seconds":30}
// ]

// Réponse JSON directe:`;
// }

// // API /ai/groq-plan - Version ultra-rapide avec Groq
// router.post('/groq-plan', async (req, res) => {
//     const startTime = Date.now();

//     try {
//         const { topic, type, level, duration_minutes = 5 } = req.body;

//         if (!topic || !type || !level) {
//             return res.status(400).json({
//                 error: 'Paramètres manquants: topic, type, level requis'
//             });
//         }

//         // Vérifier cache
//         const cacheKey = `groq-${topic}-${type}-${level}-${duration_minutes}`;
//         if (planCache.has(cacheKey)) {
//             console.log(`💨 Plan Groq récupéré du cache: ${topic}`);
//             const cached = planCache.get(cacheKey);
//             cached.cached = true;
//             cached.generation_time_ms = 0;
//             return res.json(cached);
//         }

//         console.log(`⚡ Génération Groq: ${topic} (${type}, ${level})`);

//         const planId = uuidv4();
//         const prompt = createOptimizedPrompt({ topic, type, level, duration_minutes });

//         // Génération avec Groq (ultra-rapide)
//         const generation = await llmFactory.generateText(prompt, {
//             temperature: 0.6,
//             max_tokens: 500
//         });

//         // Parse JSON
//         let sections;
//         try {
//             const jsonMatch = generation.text.match(/\[[\s\S]*\]/);
//             sections = jsonMatch ? JSON.parse(jsonMatch[0]) : [
//                 { title: "Introduction", objective: "Présenter", duration_seconds: 30 },
//                 { title: "Développement", objective: "Apprendre", duration_seconds: duration_minutes * 60 - 60 },
//                 { title: "Conclusion", objective: "Conclure", duration_seconds: 30 }
//             ];
//         } catch (e) {
//             sections = [
//                 { title: "Introduction", objective: "Présenter le sujet", duration_seconds: 30 },
//                 { title: "Contenu principal", objective: "Maîtriser l'essentiel", duration_seconds: duration_minutes * 60 - 60 },
//                 { title: "Conclusion", objective: "Récapituler", duration_seconds: 30 }
//             ];
//         }

//         const totalTime = Date.now() - startTime;

//         const result = {
//             plan_id: planId,
//             topic,
//             type,
//             level,
//             duration_minutes,
//             total_duration_seconds: sections.reduce((sum, s) => sum + s.duration_seconds, 0),
//             sections_count: sections.length,
//             sections,
//             generation_time_ms: totalTime,
//             llm_generation_time_ms: generation.duration_ms,
//             provider: generation.provider,
//             cached: false,
//             generated_at: new Date().toISOString(),
//             status: 'completed'
//         };

//         // Cache 1 heure
//         planCache.set(cacheKey, { ...result });
//         setTimeout(() => planCache.delete(cacheKey), 3600000);

//         console.log(`✅ Plan Groq généré en ${totalTime}ms (LLM: ${generation.duration_ms}ms)`);
//         res.json(result);

//     } catch (error) {
//         const totalTime = Date.now() - startTime;
//         console.error(`❌ Erreur Groq après ${totalTime}ms:`, error);
//         res.status(500).json({
//             error: 'Erreur génération plan Groq',
//             generation_time_ms: totalTime,
//             details: error.message
//         });
//     }
// });

// // API de santé pour vérifier providers
// router.get('/health', async (req, res) => {
//     try {
//         const health = await llmFactory.healthCheck();
//         res.json({
//             status: 'ok',
//             providers: health,
//             timestamp: new Date().toISOString()
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: 'error',
//             error: error.message
//         });
//     }
// });

// module.exports = router;








// code qui marche mais ne respecte pas la durée donner et non seulement le plan du cours il le traitee
// src/apis/groq-fast-plan.js - Version améliorée avec nouveau format
// const express = require('express');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
// const LLMFactory = require('../utils/llm-factory');

// const router = express.Router();
// const llmFactory = new LLMFactory();

// // Cache spécialisé pour les plans
// const planCache = new Map();

// // Validation des champs obligatoires
// function validatePayload(payload) {
//     const errors = [];

//     // Validation topic
//     if (!payload.topic || typeof payload.topic !== 'string') {
//         errors.push('Le champ "topic" est obligatoire et doit être une chaîne de caractères');
//     } else if (payload.topic.length < 10 || payload.topic.length > 500) {
//         errors.push('Le champ "topic" doit contenir entre 10 et 500 caractères');
//     }

//     // Validation capsuleType
//     if (!payload.capsuleType || !['conceptual', 'demonstrative'].includes(payload.capsuleType)) {
//         errors.push('Le champ "capsuleType" est obligatoire et doit être "conceptual" ou "demonstrative"');
//     }

//     // Validation settings
//     if (!payload.settings || typeof payload.settings !== 'object') {
//         errors.push('Le champ "settings" est obligatoire et doit être un objet');
//     } else {
//         const { level, duration, style } = payload.settings;

//         if (!level || !['beginner', 'intermediate', 'advanced'].includes(level)) {
//             errors.push('Le champ "settings.level" est obligatoire et doit être "beginner", "intermediate" ou "advanced"');
//         }

//         if (!duration || ![3, 5].includes(duration)) {
//             errors.push('Le champ "settings.duration" est obligatoire et doit être 3 ou 5');
//         }

//         if (!style || !['practical', 'corporate', 'academic', 'general'].includes(style)) {
//             errors.push('Le champ "settings.style" est obligatoire et doit être "practical", "corporate", "academic" ou "general"');
//         }
//     }

//     // Validation resources (optionnel)
//     if (payload.resources && !Array.isArray(payload.resources)) {
//         errors.push('Le champ "resources" doit être un tableau');
//     }

//     return errors;
// }

// // Fonction pour créer des prompts adaptés au style
// function createStyledPrompt({ topic, capsuleType, settings, resources }) {
//     const { level, duration, style } = settings;

//     // Adaptation du style pédagogique
//     const stylePrompts = {
//         practical: "Focus sur l'application concrète et immédiate. Privilégier les exemples pratiques et les cas d'usage réels.",
//         corporate: "Adopter un ton professionnel et formel. Mettre l'accent sur la productivité et l'efficacité en entreprise.",
//         academic: "Approche théorique et structurée. Inclure les concepts fondamentaux et les références.",
//         general: "Ton accessible et pédagogique pour le grand public. Vulgariser les concepts complexes."
//     };

//     const levelDescriptions = {
//         beginner: "débutant (aucune expérience préalable)",
//         intermediate: "intermédiaire (quelques connaissances de base)",
//         advanced: "avancé (expérience confirmée)"
//     };

//     const typeDescriptions = {
//         conceptual: "Formation conceptuelle (théories, soft-skills, concepts)",
//         demonstrative: "Formation démonstrative (logiciels, procédures, manipulations)"
//     };

//     const resourcesContext = resources && resources.length > 0
//         ? `Ressources disponibles: ${resources.map(r => `${r.name} (${r.type})`).join(', ')}`
//         : 'Aucune ressource fournie - génération basée sur le sujet uniquement';

//     return `Tu es un expert en pédagogie et conception de formations micro-learning.

// CONTEXTE DE GÉNÉRATION:
// - Sujet: ${topic}
// - Type: ${typeDescriptions[capsuleType]}
// - Niveau: ${levelDescriptions[level]}
// - Durée: ${duration} minutes
// - Style: ${style} - ${stylePrompts[style]}
// - ${resourcesContext}

// OBJECTIFS PÉDAGOGIQUES:
// ${capsuleType === 'demonstrative'
//             ? '- Permettre à l\'apprenant de reproduire les actions montrées\n- Fournir des étapes concrètes et actionables\n- Inclure les points d\'attention et erreurs courantes'
//             : '- Faire comprendre les concepts clés\n- Permettre l\'application dans le contexte professionnel\n- Favoriser la mémorisation et la réflexion'
//         }

// ADAPTATION NIVEAU ${level.toUpperCase()}:
// ${level === 'beginner'
//             ? '- Définir tous les termes techniques\n- Partir des bases absolues\n- Multiplier les exemples simples'
//             : level === 'intermediate'
//                 ? '- Supposer des connaissances de base\n- Introduire des concepts plus avancés\n- Faire des liens avec l\'expérience existante'
//                 : '- Approche experte et concise\n- Concepts avancés et nuances\n- Focus sur l\'optimisation et les bonnes pratiques'
//         }

// CONTRAINTES TEMPORELLES:
// - Durée totale: ${duration} minutes (${duration * 60} secondes)
// - 3-4 sections maximum pour respecter le timing
// - Introduction: 30 secondes maximum
// - Conclusion: 30 secondes maximum
// - Développement: ${(duration * 60) - 60} secondes

// FORMAT RÉPONSE JSON STRICT:
// {
//   "topic": "${topic}",
//   "capsule_type": "${capsuleType}",
//   "level": "${level}",
//   "duration_minutes": ${duration},
//   "style": "${style}",
//   "estimated_total_seconds": ${duration * 60},
//   "sections": [
//     {
//       "section_number": 1,
//       "title": "Titre engageant de la section",
//       "objective": "Objectif pédagogique précis de cette section",
//       "content": "Contenu détaillé adapté au style ${style}",
//       "duration_seconds": 30,
//       "key_points": ["Point clé 1", "Point clé 2", "Point clé 3"]
//     }
//   ],
//   "learning_outcomes": [
//     "Résultat d'apprentissage 1",
//     "Résultat d'apprentissage 2"
//   ],
//   "assessment_suggestions": [
//     "Question ou exercice pour valider la compréhension"
//   ]
// }

// STYLE ${style.toUpperCase()} SPÉCIFIQUE:
// ${style === 'practical'
//             ? 'Contenu axé sur le "comment faire". Exemples concrets, étapes actionables, conseils pratiques.'
//             : style === 'corporate'
//                 ? 'Langage professionnel. ROI, efficacité, productivité. Exemples en contexte entreprise.'
//                 : style === 'academic'
//                     ? 'Approche structurée et théorique. Définitions précises, références, méthodologie.'
//                     : 'Ton accessible et bienveillant. Vulgarisation, analogies, encouragements.'
//         }

// Génère le plan JSON complet pour cette formation micro-learning:`;
// }

// // API POST /ai/groq-plan - Version améliorée
// router.post('/groq-plan', async (req, res) => {
//     const startTime = Date.now();

//     try {
//         // Validation du payload
//         const validationErrors = validatePayload(req.body);
//         if (validationErrors.length > 0) {
//             return res.status(400).json({
//                 error: 'Erreurs de validation',
//                 details: validationErrors,
//                 expected_format: {
//                     topic: "string (10-500 caractères)",
//                     capsuleType: "conceptual|demonstrative",
//                     settings: {
//                         level: "beginner|intermediate|advanced",
//                         duration: "3|5",
//                         style: "practical|corporate|academic|general"
//                     },
//                     resources: "[optionnel] array of {name, type, size}"
//                 }
//             });
//         }

//         const { topic, capsuleType, settings, resources = [] } = req.body;

//         // Vérifier cache avec nouvelle clé incluant style
//         const cacheKey = `groq-v2-${topic}-${capsuleType}-${settings.level}-${settings.duration}-${settings.style}`;
//         if (planCache.has(cacheKey)) {
//             console.log(`💨 Plan récupéré du cache: ${topic.substring(0, 50)}...`);
//             const cached = planCache.get(cacheKey);
//             cached.cached = true;
//             cached.generation_time_ms = 0;
//             cached.timestamp = new Date().toISOString();
//             return res.json(cached);
//         }

//         console.log(`⚡ Génération Groq v2: ${topic.substring(0, 50)}... (${capsuleType}, ${settings.level}, ${settings.style})`);

//         const planId = uuidv4();
//         const prompt = createStyledPrompt({ topic, capsuleType, settings, resources });

//         // Génération avec Groq
//         const generation = await llmFactory.generateText(prompt, {
//             temperature: 0.6,
//             max_tokens: 2000
//         });

//         // Parse JSON avec gestion d'erreurs robuste
//         let planData;
//         try {
//             const jsonMatch = generation.text.match(/\{[\s\S]*\}/);
//             planData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
//         } catch (e) {
//             console.warn('Erreur parsing JSON, génération fallback');
//             planData = null;
//         }

//         // Fallback si parsing échoue
//         if (!planData || !planData.sections) {
//             planData = createFallbackPlan({ topic, capsuleType, settings });
//         }

//         const totalTime = Date.now() - startTime;

//         const result = {
//             plan_id: planId,
//             topic,
//             capsule_type: capsuleType,
//             settings: {
//                 level: settings.level,
//                 duration: settings.duration,
//                 style: settings.style
//             },
//             resources_count: resources.length,
//             sections: planData.sections || [],
//             learning_outcomes: planData.learning_outcomes || [],
//             assessment_suggestions: planData.assessment_suggestions || [],
//             estimated_total_seconds: planData.estimated_total_seconds || (settings.duration * 60),
//             sections_count: planData.sections?.length || 0,
//             generation_time_ms: totalTime,
//             llm_generation_time_ms: generation.duration_ms,
//             provider: generation.provider,
//             cached: false,
//             generated_at: new Date().toISOString(),
//             status: 'completed'
//         };

//         // Cache pendant 1 heure
//         planCache.set(cacheKey, { ...result });
//         setTimeout(() => planCache.delete(cacheKey), 3600000);

//         console.log(`✅ Plan Groq v2 généré: ${planData.sections?.length || 0} sections en ${totalTime}ms`);
//         res.json(result);

//     } catch (error) {
//         const totalTime = Date.now() - startTime;
//         console.error(`❌ Erreur génération Groq v2 après ${totalTime}ms:`, error);
//         res.status(500).json({
//             error: 'Erreur lors de la génération du plan',
//             generation_time_ms: totalTime,
//             details: error.message
//         });
//     }
// });

// // Fonction fallback si parsing JSON échoue
// function createFallbackPlan({ topic, capsuleType, settings }) {
//     const { level, duration, style } = settings;

//     return {
//         topic,
//         capsule_type: capsuleType,
//         level,
//         duration_minutes: duration,
//         style,
//         estimated_total_seconds: duration * 60,
//         sections: [
//             {
//                 section_number: 1,
//                 title: "Introduction",
//                 objective: "Présenter le sujet et les objectifs",
//                 content: `Introduction au sujet: ${topic}`,
//                 duration_seconds: 30,
//                 key_points: ["Présentation du contexte", "Objectifs d'apprentissage"]
//             },
//             {
//                 section_number: 2,
//                 title: "Développement principal",
//                 objective: "Maîtriser les concepts ou actions essentiels",
//                 content: `Développement du contenu principal selon le style ${style}`,
//                 duration_seconds: (duration * 60) - 60,
//                 key_points: ["Concept principal", "Application pratique", "Points d'attention"]
//             },
//             {
//                 section_number: 3,
//                 title: "Conclusion",
//                 objective: "Synthétiser et donner les prochaines étapes",
//                 content: "Récapitulatif et recommandations pour la suite",
//                 duration_seconds: 30,
//                 key_points: ["Synthèse", "Prochaines étapes"]
//             }
//         ],
//         learning_outcomes: [
//             `Comprendre les bases de ${topic}`,
//             "Être capable d'appliquer les concepts présentés"
//         ],
//         assessment_suggestions: [
//             "Quiz de vérification des concepts clés",
//             "Exercice pratique d'application"
//         ]
//     };
// }

// // API GET pour tester les différents styles
// router.get('/groq-plan/styles', (req, res) => {
//     res.json({
//         available_styles: {
//             practical: {
//                 name: "Pratique",
//                 description: "Focus sur l'application concrète et immédiate",
//                 best_for: ["Formations techniques", "Procédures", "Outils"]
//             },
//             corporate: {
//                 name: "Corporate",
//                 description: "Ton professionnel axé productivité",
//                 best_for: ["Formation entreprise", "Management", "Processus"]
//             },
//             academic: {
//                 name: "Académique",
//                 description: "Approche théorique et structurée",
//                 best_for: ["Concepts complexes", "Fondamentaux", "Recherche"]
//             },
//             general: {
//                 name: "Général",
//                 description: "Accessible au grand public",
//                 best_for: ["Vulgarisation", "Sensibilisation", "Culture générale"]
//             }
//         },
//         levels: ["beginner", "intermediate", "advanced"],
//         durations: [3, 5],
//         capsule_types: ["conceptual", "demonstrative"]
//     });
// });

// module.exports = router;

// /*
// TESTS POSTMAN NOUVEAUX:

// 1. Test nouveau format basique:
// POST https://edupro-ai.onrender.com/ai/groq-plan
// {
//   "topic": "Une introduction à la programmation asynchrone en JavaScript, en expliquant les concepts de promesses et d'async/await.",
//   "capsuleType": "conceptual",
//   "settings": {
//     "level": "beginner",
//     "duration": 5,
//     "style": "practical"
//   }
// }

// 2. Test avec ressources:
// POST https://edupro-ai.onrender.com/ai/groq-plan  
// {
//   "topic": "Créer un tableau croisé dynamique Excel pour analyser les ventes",
//   "capsuleType": "demonstrative",
//   "settings": {
//     "level": "intermediate", 
//     "duration": 3,
//     "style": "corporate"
//   },
//   "resources": [
//     {"name": "exemple-ventes.xlsx", "type": "excel", "size": 1024},
//     {"name": "guide-tcd.pdf", "type": "pdf", "size": 2048}
//   ]
// }

// 3. Test style académique:
// POST https://edupro-ai.onrender.com/ai/groq-plan
// {
//   "topic": "Les principes fondamentaux de la gestion de projet agile et méthodologie Scrum",
//   "capsuleType": "conceptual", 
//   "settings": {
//     "level": "advanced",
//     "duration": 5,
//     "style": "academic"
//   }
// }

// 4. Test validation erreurs:
// POST https://edupro-ai.onrender.com/ai/groq-plan
// {
//   "topic": "test",
//   "capsuleType": "invalid",
//   "settings": {
//     "level": "expert",
//     "duration": 10,
//     "style": "custom"
//   }
// }

// 5. Test styles disponibles:
// GET https://edupro-ai.onrender.com/ai/groq-plan/styles
// */








// src/apis/groq-fast-plan.js - Version améliorée avec nouveau format
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const LLMFactory = require('../utils/llm-factory');

const router = express.Router();
const llmFactory = new LLMFactory();

// Cache spécialisé pour les plans
const planCache = new Map();

// Validation des champs obligatoires
function validatePayload(payload) {
    const errors = [];

    // Validation topic
    if (!payload.topic || typeof payload.topic !== 'string') {
        errors.push('Le champ "topic" est obligatoire et doit être une chaîne de caractères');
    } else if (payload.topic.length < 10 || payload.topic.length > 500) {
        errors.push('Le champ "topic" doit contenir entre 10 et 500 caractères');
    }

    // Validation capsuleType
    if (!payload.capsuleType || !['conceptual', 'demonstrative'].includes(payload.capsuleType)) {
        errors.push('Le champ "capsuleType" est obligatoire et doit être "conceptual" ou "demonstrative"');
    }

    // Validation settings
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

    // Validation resources (optionnel)
    if (payload.resources && !Array.isArray(payload.resources)) {
        errors.push('Le champ "resources" doit être un tableau');
    }

    return errors;
}

// Fonction pour créer des prompts pour PLAN SEULEMENT (pas contenu complet)
function createStyledPrompt({ topic, capsuleType, settings, resources }) {
    const { level, duration, style } = settings;

    const stylePrompts = {
        practical: "Plan orienté application pratique immédiate",
        corporate: "Plan professionnel axé efficacité et productivité",
        academic: "Plan structuré avec approche méthodologique",
        general: "Plan accessible et pédagogique"
    };

    const resourcesContext = resources && resources.length > 0
        ? `Ressources disponibles: ${resources.map(r => `${r.name} (${r.type})`).join(', ')}`
        : 'Aucune ressource fournie';

    return `Tu es un expert en conception pédagogique. Tu dois créer UN PLAN STRUCTURÉ de formation, PAS le contenu complet.

IMPORTANT: TU NE RÉDIGES PAS LE COURS, TU CRÉÉS SEULEMENT LE PLAN !

CONTEXTE:
- Sujet: ${topic}
- Type: ${capsuleType}
- Niveau: ${level}
- Durée cible: ${duration} minutes EXACTEMENT (${duration * 60} secondes)
- Style: ${style} - ${stylePrompts[style]}
- ${resourcesContext}

CONSIGNES CRITIQUES:
1. RESPECTER EXACTEMENT ${duration} minutes (${duration * 60} secondes total)
2. Créer UN PLAN avec titres et objectifs SEULEMENT
3. NE PAS rédiger le contenu détaillé
4. Structure obligatoire: Introduction → Développement → Synthèse

RÉPARTITION TEMPORELLE EXACTE pour ${duration} minutes:
- Introduction: ${Math.round(duration * 60 * 0.15)} secondes (15%)
- Développement: ${Math.round(duration * 60 * 0.70)} secondes (70%) 
- Synthèse: ${Math.round(duration * 60 * 0.15)} secondes (15%)
- TOTAL: ${duration * 60} secondes EXACTEMENT

FORMAT RÉPONSE JSON STRICT:
{
  "topic": "${topic}",
  "capsule_type": "${capsuleType}",
  "level": "${level}",
  "duration_minutes": ${duration},
  "style": "${style}",
  "total_duration_seconds": ${duration * 60},
  "structure": {
    "introduction": {
      "title": "Introduction",
      "objective": "Présenter le contexte et les objectifs",
      "duration_seconds": ${Math.round(duration * 60 * 0.15)},
      "key_elements": ["Contexte", "Enjeux", "Objectifs d'apprentissage"]
    },
    "development": {
      "title": "Développement",
      "objective": "Aborder les points clés du sujet",
      "duration_seconds": ${Math.round(duration * 60 * 0.70)},
      "sub_sections": [
        {
          "title": "Point clé 1",
          "objective": "Premier aspect essentiel à couvrir",
          "duration_seconds": ${Math.round(duration * 60 * 0.35)}
        },
        {
          "title": "Point clé 2", 
          "objective": "Deuxième aspect essentiel à couvrir",
          "duration_seconds": ${Math.round(duration * 60 * 0.35)}
        }
      ]
    },
    "synthesis": {
      "title": "Synthèse",
      "objective": "Récapituler et donner les prochaines étapes",
      "duration_seconds": ${Math.round(duration * 60 * 0.15)},
      "key_elements": ["Récapitulatif", "Points à retenir", "Prochaines étapes"]
    }
  },
  "learning_outcomes": [
    "À la fin de cette formation, l'apprenant sera capable de...",
    "L'apprenant aura une compréhension claire de..."
  ],
  "validation_method": "Méthode suggérée pour valider l'acquisition"
}

ADAPTATION NIVEAU ${level.toUpperCase()}:
${level === 'beginner'
            ? 'Plan avec définitions de base et approche progressive'
            : level === 'intermediate'
                ? 'Plan supposant des prérequis et allant vers des concepts plus poussés'
                : 'Plan expert avec focus sur optimisation et nuances avancées'
        }

ADAPTATION TYPE ${capsuleType.toUpperCase()}:
${capsuleType === 'demonstrative'
            ? 'Plan pour démonstration pratique avec étapes actionables'
            : 'Plan pour formation conceptuelle avec progression logique des idées'
        }

IMPORTANT: Génère UNIQUEMENT le plan de formation, pas le contenu pédagogique complet !`;
}

// API POST /ai/groq-plan - Version améliorée
router.post('/groq-plan', async (req, res) => {
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
                    resources: "[optionnel] array of {name, type, size}"
                }
            });
        }

        const { topic, capsuleType, settings, resources = [] } = req.body;

        // Vérifier cache avec nouvelle clé incluant style
        const cacheKey = `groq-v2-${topic}-${capsuleType}-${settings.level}-${settings.duration}-${settings.style}`;
        if (planCache.has(cacheKey)) {
            console.log(`💨 Plan récupéré du cache: ${topic.substring(0, 50)}...`);
            const cached = planCache.get(cacheKey);
            cached.cached = true;
            cached.generation_time_ms = 0;
            cached.timestamp = new Date().toISOString();
            return res.json(cached);
        }

        console.log(`⚡ Génération Groq v2: ${topic.substring(0, 50)}... (${capsuleType}, ${settings.level}, ${settings.style})`);

        const planId = uuidv4();
        const prompt = createStyledPrompt({ topic, capsuleType, settings, resources });

        // Génération avec Groq
        const generation = await llmFactory.generateText(prompt, {
            temperature: 0.6,
            max_tokens: 2000
        });

        // Parse JSON avec gestion d'erreurs robuste
        let planData;
        try {
            const jsonMatch = generation.text.match(/\{[\s\S]*\}/);
            planData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch (e) {
            console.warn('Erreur parsing JSON, génération fallback');
            planData = null;
        }

        // Fallback si parsing échoue
        if (!planData || !planData.structure) {
            planData = createFallbackPlan({ topic, capsuleType, settings });
        }

        // Validation durée totale
        const actualDuration = planData.total_duration_seconds || planData.structure?.introduction?.duration_seconds +
            planData.structure?.development?.duration_seconds +
            planData.structure?.synthesis?.duration_seconds;

        const result = {
            plan_id: planId,
            topic,
            capsule_type: capsuleType,
            settings: {
                level: settings.level,
                duration: settings.duration,
                style: settings.style
            },
            resources_count: resources.length,
            plan_structure: {
                introduction: planData.structure?.introduction || {},
                development: planData.structure?.development || {},
                synthesis: planData.structure?.synthesis || {}
            },
            total_duration_seconds: actualDuration,
            duration_validation: {
                requested_seconds: settings.duration * 60,
                actual_seconds: actualDuration,
                difference: Math.abs((settings.duration * 60) - actualDuration),
                meets_requirement: Math.abs((settings.duration * 60) - actualDuration) <= 10
            },
            learning_outcomes: planData.learning_outcomes || [],
            validation_method: planData.validation_method || "Quiz de validation",
            generation_time_ms: totalTime,
            llm_generation_time_ms: generation.duration_ms,
            provider: generation.provider,
            cached: false,
            generated_at: new Date().toISOString(),
            status: 'completed'
        };

        // Cache pendant 1 heure
        planCache.set(cacheKey, { ...result });
        setTimeout(() => planCache.delete(cacheKey), 3600000);

        console.log(`✅ Plan Groq v2 généré: ${planData.sections?.length || 0} sections en ${totalTime}ms`);
        res.json(result);

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`❌ Erreur génération Groq v2 après ${totalTime}ms:`, error);
        res.status(500).json({
            error: 'Erreur lors de la génération du plan',
            generation_time_ms: totalTime,
            details: error.message
        });
    }
});

// Fonction fallback si parsing JSON échoue - VERSION PLAN SEULEMENT
function createFallbackPlan({ topic, capsuleType, settings }) {
    const { level, duration, style } = settings;
    const totalSeconds = duration * 60;
    const introSeconds = Math.round(totalSeconds * 0.15);
    const developmentSeconds = Math.round(totalSeconds * 0.70);
    const synthesisSeconds = Math.round(totalSeconds * 0.15);

    return {
        topic,
        capsule_type: capsuleType,
        level,
        duration_minutes: duration,
        style,
        total_duration_seconds: totalSeconds,
        structure: {
            introduction: {
                title: "Introduction",
                objective: "Présenter le contexte et les objectifs",
                duration_seconds: introSeconds,
                key_elements: ["Contexte du sujet", "Enjeux", "Objectifs d'apprentissage"]
            },
            development: {
                title: "Développement",
                objective: "Aborder les points clés du sujet",
                duration_seconds: developmentSeconds,
                sub_sections: [
                    {
                        title: "Premier aspect essentiel",
                        objective: `Première dimension importante de ${topic}`,
                        duration_seconds: Math.round(developmentSeconds / 2)
                    },
                    {
                        title: "Deuxième aspect essentiel",
                        objective: `Deuxième dimension cruciale de ${topic}`,
                        duration_seconds: Math.round(developmentSeconds / 2)
                    }
                ]
            },
            synthesis: {
                title: "Synthèse",
                objective: "Récapituler et donner les prochaines étapes",
                duration_seconds: synthesisSeconds,
                key_elements: ["Récapitulatif des points clés", "Points à retenir", "Prochaines étapes suggérées"]
            }
        },
        learning_outcomes: [
            `À la fin de cette formation, l'apprenant aura une compréhension claire de ${topic}`,
            "L'apprenant sera capable d'identifier les éléments clés du sujet"
        ],
        validation_method: "Quiz de validation des concepts abordés"
    };
}

// API GET pour tester les différents styles
router.get('/groq-plan/styles', (req, res) => {
    res.json({
        available_styles: {
            practical: {
                name: "Pratique",
                description: "Focus sur l'application concrète et immédiate",
                best_for: ["Formations techniques", "Procédures", "Outils"]
            },
            corporate: {
                name: "Corporate",
                description: "Ton professionnel axé productivité",
                best_for: ["Formation entreprise", "Management", "Processus"]
            },
            academic: {
                name: "Académique",
                description: "Approche théorique et structurée",
                best_for: ["Concepts complexes", "Fondamentaux", "Recherche"]
            },
            general: {
                name: "Général",
                description: "Accessible au grand public",
                best_for: ["Vulgarisation", "Sensibilisation", "Culture générale"]
            }
        },
        levels: ["beginner", "intermediate", "advanced"],
        durations: [3, 5],
        capsule_types: ["conceptual", "demonstrative"]
    });
});

module.exports = router;

/*
TESTS POSTMAN NOUVEAUX:

1. Test nouveau format basique:
POST https://edupro-ai.onrender.com/ai/groq-plan
{
  "topic": "Une introduction à la programmation asynchrone en JavaScript, en expliquant les concepts de promesses et d'async/await.",
  "capsuleType": "conceptual",
  "settings": {
    "level": "beginner",
    "duration": 5,
    "style": "practical"
  }
}

2. Test avec ressources:
POST https://edupro-ai.onrender.com/ai/groq-plan  
{
  "topic": "Créer un tableau croisé dynamique Excel pour analyser les ventes",
  "capsuleType": "demonstrative",
  "settings": {
    "level": "intermediate", 
    "duration": 3,
    "style": "corporate"
  },
  "resources": [
    {"name": "exemple-ventes.xlsx", "type": "excel", "size": 1024},
    {"name": "guide-tcd.pdf", "type": "pdf", "size": 2048}
  ]
}

3. Test style académique:
POST https://edupro-ai.onrender.com/ai/groq-plan
{
  "topic": "Les principes fondamentaux de la gestion de projet agile et méthodologie Scrum",
  "capsuleType": "conceptual", 
  "settings": {
    "level": "advanced",
    "duration": 5,
    "style": "academic"
  }
}

4. Test validation erreurs:
POST https://edupro-ai.onrender.com/ai/groq-plan
{
  "topic": "test",
  "capsuleType": "invalid",
  "settings": {
    "level": "expert",
    "duration": 10,
    "style": "custom"
  }
}

5. Test styles disponibles:
GET https://edupro-ai.onrender.com/ai/groq-plan/styles
*/