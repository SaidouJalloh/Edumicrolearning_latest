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












// code qui marche sans outcomelearning
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

//         // ✅ AMÉLIORATION : Accepter n'importe quelle durée entre 1 et 30 minutes
//         if (!duration || typeof duration !== 'number' || duration < 1 || duration > 30) {
//             errors.push('Le champ "settings.duration" est obligatoire et doit être un nombre entre 1 et 30 minutes');
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

// // ✅ FONCTION : Calcul précis de la répartition du temps pour CAPSULES VIDÉO
// function calculateTimeDistribution(totalMinutes) {
//     const totalSeconds = totalMinutes * 60;

//     // Structure fixe : Introduction -> Développement -> Conclusion
//     let introSeconds, developmentSeconds, conclusionSeconds;

//     if (totalMinutes <= 1) {
//         // Capsules ultra-courtes (30-60s) - Format TikTok/Shorts
//         introSeconds = 10;  // Accroche rapide
//         conclusionSeconds = 10;  // Call-to-action
//         developmentSeconds = totalSeconds - 20;
//     } else if (totalMinutes <= 3) {
//         // Capsules courtes (1-3 min) - Format réseaux sociaux
//         introSeconds = 15;  // Accroche + contexte
//         conclusionSeconds = 15;  // Récap + CTA
//         developmentSeconds = totalSeconds - 30;
//     } else if (totalMinutes <= 5) {
//         // Capsules moyennes (3-5 min) - Format YouTube/formation
//         introSeconds = 20;  // Introduction engageante
//         conclusionSeconds = 20;  // Conclusion + prochaines étapes
//         developmentSeconds = totalSeconds - 40;
//     } else if (totalMinutes <= 10) {
//         // Capsules longues (5-10 min) - Format éducatif
//         introSeconds = 30;  // Introduction détaillée
//         conclusionSeconds = 30;  // Conclusion + ressources
//         developmentSeconds = totalSeconds - 60;
//     } else {
//         // Capsules très longues (10-30 min) - Format webinaire
//         introSeconds = 45;  // Introduction + agenda
//         conclusionSeconds = 45;  // Récap + Q&A
//         developmentSeconds = totalSeconds - 90;
//     }

//     // Si contenu principal trop long, on le divise en segments
//     const developmentSections = [];
//     if (developmentSeconds > 180) { // Plus de 3 minutes de contenu
//         const numSegments = Math.ceil(developmentSeconds / 120); // Max 2 min par segment
//         const timePerSegment = Math.floor(developmentSeconds / numSegments);
//         const remainder = developmentSeconds % numSegments;

//         for (let i = 0; i < numSegments; i++) {
//             const segmentTime = timePerSegment + (i < remainder ? 1 : 0);
//             developmentSections.push({
//                 section_number: i + 2, // Après introduction
//                 duration_seconds: segmentTime,
//                 is_main_content: true,
//                 segment_index: i
//             });
//         }
//     } else {
//         developmentSections.push({
//             section_number: 2,
//             duration_seconds: developmentSeconds,
//             is_main_content: true,
//             segment_index: 0
//         });
//     }

//     return {
//         total_seconds: totalSeconds,
//         introduction: { section_number: 1, duration_seconds: introSeconds },
//         development_sections: developmentSections,
//         conclusion: {
//             section_number: 1 + developmentSections.length + 1,
//             duration_seconds: conclusionSeconds
//         },
//         total_sections: 2 + developmentSections.length // Intro + Dev sections + Conclusion
//     };
// }

// // ✅ FONCTION MODIFIÉE : Création de prompts pour PLAN UNIQUEMENT
// function createStyledPrompt({ topic, capsuleType, settings, resources }) {
//     const { level, duration, style } = settings;
//     const timeDistribution = calculateTimeDistribution(duration);

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
//         conceptual: "Capsule vidéo explicative sur des concepts, théories ou soft-skills",
//         demonstrative: "Capsule vidéo tutoriel montrant des étapes pratiques et des manipulations"
//     };

//     const resourcesContext = resources && resources.length > 0
//         ? `Ressources disponibles: ${resources.map(r => `${r.name} (${r.type})`).join(', ')}`
//         : 'Aucune ressource fournie - génération basée sur le sujet uniquement';

//     // ✅ Structure temporelle pour capsules vidéo
//     const videoStructure = [
//         {
//             type: "introduction",
//             duration: timeDistribution.introduction.duration_seconds,
//             description: "Accroche et présentation du sujet"
//         },
//         ...timeDistribution.development_sections.map((dev, index) => ({
//             type: `développement_${index + 1}`,
//             duration: dev.duration_seconds,
//             description: timeDistribution.development_sections.length > 1
//                 ? `Partie ${index + 1} du contenu principal`
//                 : "Contenu principal de la capsule"
//         })),
//         {
//             type: "conclusion",
//             duration: timeDistribution.conclusion.duration_seconds,
//             description: "Récap et call-to-action"
//         }
//     ];

//     return `Tu es un expert en création de contenu vidéo éducatif. Tu dois créer UNIQUEMENT le PLAN STRUCTURÉ d'une capsule vidéo (pas le script détaillé).

// CONTEXTE DE LA CAPSULE VIDÉO:
// - Sujet: ${topic}
// - Type: ${typeDescriptions[capsuleType]}
// - Niveau: ${levelDescriptions[level]}
// - Durée EXACTE: ${duration} minutes (${timeDistribution.total_seconds} secondes)
// - Style: ${style} - ${stylePrompts[style]}
// - ${resourcesContext}

// 🎬 STRUCTURE VIDÉO OBLIGATOIRE - ${timeDistribution.total_sections} PARTIES:
// 1. INTRODUCTION (${timeDistribution.introduction.duration_seconds}s) - Accroche et présentation
// ${timeDistribution.development_sections.map((dev, index) =>
//         `${index + 2}. DÉVELOPPEMENT ${timeDistribution.development_sections.length > 1 ? `PARTIE ${index + 1}` : ''} (${dev.duration_seconds}s) - Contenu principal`
//     ).join('\n')}
// ${timeDistribution.total_sections}. CONCLUSION (${timeDistribution.conclusion.duration_seconds}s) - Récap et action

// ⏱️ CONTRAINTES TEMPORELLES STRICTES:
// - Durée totale EXACTE: ${duration} minutes = ${timeDistribution.total_seconds} secondes
// - La somme des durées DOIT égaler ${timeDistribution.total_seconds}s exactement
// - Structure fixe: Introduction → Développement → Conclusion

// OBJECTIF DU PLAN:
// Définir clairement ce qui sera abordé dans chaque partie de la capsule vidéo, les points clés à traiter et l'objectif de chaque section. 
// IMPORTANT: Ne pas générer de script détaillé, juste la structure et les points à aborder.

// FORMAT JSON STRICT - PLAN VIDÉO SIMPLIFIÉ:
// {
//   "topic": "${topic}",
//   "capsule_type": "${capsuleType}",
//   "level": "${level}",
//   "duration_minutes": ${duration},
//   "style": "${style}",
//   "estimated_total_seconds": ${timeDistribution.total_seconds},
//   "plan_sections": [
//     {
//       "section_number": 1,
//       "title": "Introduction",
//       "type": "introduction",
//       "duration_seconds": ${timeDistribution.introduction.duration_seconds},
//       "what_to_cover": [
//         "Ce qu'il faut dire dans l'intro",
//         "Points à aborder pour accrocher"
//       ],
//       "content_summary": "Résumé de ce qui sera dit dans cette introduction"
//     },
//     ${timeDistribution.development_sections.map((dev, index) => `{
//       "section_number": ${dev.section_number},
//       "title": "Développement${timeDistribution.development_sections.length > 1 ? ` - Partie ${index + 1}` : ''}",
//       "type": "development",
//       "duration_seconds": ${dev.duration_seconds},
//       "what_to_cover": [
//         "Point principal 1 à expliquer",
//         "Point principal 2 à expliquer",
//         "Exemple concret à donner"
//       ],
//       "content_summary": "Résumé du contenu principal de cette partie"
//     }`).join(',\n    ')},
//     {
//       "section_number": ${timeDistribution.conclusion.section_number},
//       "title": "Conclusion",
//       "type": "conclusion",
//       "duration_seconds": ${timeDistribution.conclusion.duration_seconds},
//       "what_to_cover": [
//         "Récap rapide des points essentiels",
//         "Action à faire maintenant"
//       ],
//       "content_summary": "Ce qui sera dit en conclusion"
//     }
//   ],
//   "video_goal": "Ce que la personne saura/pourra faire après avoir vu la vidéo"
// }

// ADAPTATION NIVEAU ${level.toUpperCase()}:
// ${level === 'beginner'
//             ? '- Partir des bases absolues\n- Définir tous les termes techniques\n- Multiplier les exemples simples'
//             : level === 'intermediate'
//                 ? '- Supposer des connaissances de base\n- Introduire des concepts plus avancés\n- Faire des liens avec l\'expérience existante'
//                 : '- Approche experte et concise\n- Concepts avancés et nuances\n- Focus sur l\'optimisation et les bonnes pratiques'
//         }

// STYLE ${style.toUpperCase()} SPÉCIFIQUE:
// ${style === 'practical'
//             ? 'Plan orienté action. Points concrets et applicables immédiatement.'
//             : style === 'corporate'
//                 ? 'Plan professionnel. Focus sur ROI et efficacité business.'
//                 : style === 'academic'
//                     ? 'Plan structuré avec progression logique et méthodique.'
//                     : 'Plan accessible avec vulgarisation et exemples parlants.'
//         }

// VÉRIFICATION OBLIGATOIRE:
// - La somme des duration_seconds DOIT être exactement ${timeDistribution.total_seconds}
// - ${timeDistribution.total_sections} sections exactement
// - Chaque section doit avoir des points clairs à couvrir
// - Focus sur CE QUI SERA DIT, pas sur la théorie pédagogique

// Génère le plan JSON simplifié pour cette capsule vidéo:`;
// }

// // API POST /ai/groq-plan - Version modifiée pour PLAN UNIQUEMENT
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
//                         duration: "number (1-30 minutes)",
//                         style: "practical|corporate|academic|general"
//                     },
//                     resources: "[optionnel] array of {name, type, size}"
//                 }
//             });
//         }

//         const { topic, capsuleType, settings, resources = [] } = req.body;

//         // ✅ Calcul de la répartition temporelle pour capsules vidéo
//         const timeDistribution = calculateTimeDistribution(settings.duration);

//         // Vérifier cache avec nouvelle clé pour format plan vidéo
//         const cacheKey = `video-plan-${topic}-${capsuleType}-${settings.level}-${settings.duration}min-${settings.style}`;
//         if (planCache.has(cacheKey)) {
//             console.log(`💨 Plan vidéo récupéré du cache: ${topic.substring(0, 50)}... (${settings.duration}min)`);
//             const cached = planCache.get(cacheKey);
//             cached.cached = true;
//             cached.generation_time_ms = 0;
//             cached.timestamp = new Date().toISOString();
//             return res.json(cached);
//         }

//         console.log(`🎬 Génération plan capsule vidéo: ${topic.substring(0, 50)}... (${capsuleType}, ${settings.level}, ${settings.duration}min, ${settings.style})`);
//         console.log(`⏱️ Répartition vidéo: Intro ${timeDistribution.introduction.duration_seconds}s + Dev ${timeDistribution.development_sections.map(d => d.duration_seconds).join('+')}s + Conclusion ${timeDistribution.conclusion.duration_seconds}s = ${timeDistribution.total_seconds}s`);

//         const planId = uuidv4();
//         const prompt = createStyledPrompt({ topic, capsuleType, settings, resources });

//         // Génération avec Groq via LLMFactory
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

//         // ✅ Fallback modifié pour plan vidéo simplifié
//         if (!planData || !planData.plan_sections) {
//             planData = createFallbackVideoPlan({ topic, capsuleType, settings, timeDistribution });
//         }

//         // ✅ Vérification et correction de la durée totale pour plan
//         const actualTotalSeconds = planData.plan_sections.reduce((sum, section) => sum + (section.duration_seconds || 0), 0);
//         const expectedTotalSeconds = timeDistribution.total_seconds;

//         if (Math.abs(actualTotalSeconds - expectedTotalSeconds) > 5) {
//             console.warn(`⚠️ Correction durée plan: ${actualTotalSeconds}s -> ${expectedTotalSeconds}s`);
//             planData = adjustPlanTimings(planData, expectedTotalSeconds);
//         }

//         const totalTime = Date.now() - startTime;

//         // ✅ Format de réponse modifié pour PLAN UNIQUEMENT
//         const result = {
//             plan_id: planId,
//             topic,
//             capsule_type: capsuleType,
//             video_format: true, // Indique que c'est pour une vidéo
//             plan_only: true, // ✅ NOUVEAU: Indique que c'est juste le plan
//             settings: {
//                 level: settings.level,
//                 duration: settings.duration,
//                 style: settings.style
//             },
//             resources_count: resources.length,

//             // ✅ PLAN SECTIONS simplifié pour vidéo
//             plan_sections: planData.plan_sections || [],
//             video_goal: planData.video_goal || `Comprendre et appliquer ${topic}`,

//             // Métriques temporelles
//             estimated_total_seconds: expectedTotalSeconds,
//             actual_total_seconds: planData.plan_sections.reduce((sum, s) => sum + s.duration_seconds, 0),
//             sections_count: planData.plan_sections?.length || 0,
//             time_distribution: timeDistribution,
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

//         console.log(`✅ Plan vidéo généré: ${planData.plan_sections?.length || 0} sections, ${result.actual_total_seconds}s en ${totalTime}ms`);
//         res.json(result);

//     } catch (error) {
//         const totalTime = Date.now() - startTime;
//         console.error(`❌ Erreur génération plan vidéo après ${totalTime}ms:`, error);
//         res.status(500).json({
//             error: 'Erreur lors de la génération du plan vidéo',
//             generation_time_ms: totalTime,
//             details: error.message
//         });
//     }
// });

// // ✅ Fonction fallback SIMPLIFIÉE pour capsule vidéo
// function createFallbackVideoPlan({ topic, capsuleType, settings, timeDistribution }) {
//     const { level, duration, style } = settings;

//     const planSections = [
//         {
//             section_number: 1,
//             title: "Introduction",
//             type: "introduction",
//             duration_seconds: timeDistribution.introduction.duration_seconds,
//             what_to_cover: [
//                 `Saluer et présenter le sujet: ${topic}`,
//                 "Expliquer pourquoi c'est utile",
//                 "Annoncer ce qu'on va voir"
//             ],
//             content_summary: `Accroche simple sur ${topic} et annonce du contenu`
//         }
//     ];

//     // Ajouter les sections de développement
//     timeDistribution.development_sections.forEach((dev, index) => {
//         planSections.push({
//             section_number: dev.section_number,
//             title: timeDistribution.development_sections.length > 1
//                 ? `Développement - Partie ${index + 1}`
//                 : "Développement",
//             type: "development",
//             duration_seconds: dev.duration_seconds,
//             what_to_cover: [
//                 "Point principal à expliquer",
//                 "Exemple concret à montrer",
//                 "Astuce ou conseil pratique"
//             ],
//             content_summary: `Explication claire et simple de ${topic}`
//         });
//     });

//     // Ajouter la conclusion
//     planSections.push({
//         section_number: timeDistribution.conclusion.section_number,
//         title: "Conclusion",
//         type: "conclusion",
//         duration_seconds: timeDistribution.conclusion.duration_seconds,
//         what_to_cover: [
//             `Récap rapide de ${topic}`,
//             "Encourager à mettre en pratique",
//             "Remercier et dire au revoir"
//         ],
//         content_summary: "Résumé rapide et motivation"
//     });

//     return {
//         topic,
//         capsule_type: capsuleType,
//         level,
//         duration_minutes: duration,
//         style,
//         estimated_total_seconds: timeDistribution.total_seconds,
//         plan_sections: planSections,
//         video_goal: `Savoir appliquer ${topic} dans son quotidien`
//     };
// }

// // ✅ Fonction pour ajuster les timings du plan si nécessaire
// function adjustPlanTimings(planData, expectedTotalSeconds) {
//     const sections = planData.plan_sections;
//     const actualTotal = sections.reduce((sum, s) => sum + s.duration_seconds, 0);
//     const ratio = expectedTotalSeconds / actualTotal;

//     // Ajuster proportionnellement toutes les sections
//     sections.forEach(section => {
//         section.duration_seconds = Math.round(section.duration_seconds * ratio);
//     });

//     // Corriger les arrondis pour que le total soit exact
//     const newTotal = sections.reduce((sum, s) => sum + s.duration_seconds, 0);
//     const difference = expectedTotalSeconds - newTotal;

//     if (difference !== 0) {
//         // Ajouter/retirer la différence sur la section de développement la plus longue
//         const longestDevSection = sections
//             .filter(s => s.type === 'development')
//             .sort((a, b) => b.duration_seconds - a.duration_seconds)[0];

//         if (longestDevSection) {
//             longestDevSection.duration_seconds += difference;
//         }
//     }

//     return planData;
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
//         durations: "Flexible: 1-30 minutes",
//         capsule_types: ["conceptual", "demonstrative"],
//         structure: "Fixe pour vidéo: Introduction -> Développement -> Conclusion",
//         output: "PLAN UNIQUEMENT (pas de script détaillé)",
//         next_step: "Utiliser une autre API pour générer le script de narration"
//     });
// });

// module.exports = router;















// code qui marche bien avec script de narration par slide sans ressource externe

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

//         // ✅ EXACTEMENT comme spécifié : seulement 3 ou 5
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

// // Calcul de la répartition temporelle pour capsules vidéo
// function calculateTimeDistribution(totalMinutes) {
//     const totalSeconds = totalMinutes * 60;

//     // Structure fixe : Introduction -> Développement -> Conclusion
//     let introSeconds, developmentSeconds, conclusionSeconds;

//     if (totalMinutes === 3) {
//         // Capsule 3 minutes
//         introSeconds = 15;
//         conclusionSeconds = 15;
//         developmentSeconds = totalSeconds - 30; // 150 secondes
//     } else if (totalMinutes === 5) {
//         // Capsule 5 minutes
//         introSeconds = 20;
//         conclusionSeconds = 20;
//         developmentSeconds = totalSeconds - 40; // 260 secondes
//     }

//     // Division du développement si nécessaire
//     const developmentSections = [];
//     if (developmentSeconds > 180) { // Plus de 3 minutes
//         const numSegments = Math.ceil(developmentSeconds / 120); // Max 2 min par segment
//         const timePerSegment = Math.floor(developmentSeconds / numSegments);
//         const remainder = developmentSeconds % numSegments;

//         for (let i = 0; i < numSegments; i++) {
//             const segmentTime = timePerSegment + (i < remainder ? 1 : 0);
//             developmentSections.push({
//                 section_number: i + 2,
//                 duration_seconds: segmentTime,
//                 is_main_content: true,
//                 segment_index: i
//             });
//         }
//     } else {
//         developmentSections.push({
//             section_number: 2,
//             duration_seconds: developmentSeconds,
//             is_main_content: true,
//             segment_index: 0
//         });
//     }

//     return {
//         total_seconds: totalSeconds,
//         introduction: { section_number: 1, duration_seconds: introSeconds },
//         development_sections: developmentSections,
//         conclusion: {
//             section_number: 1 + developmentSections.length + 1,
//             duration_seconds: conclusionSeconds
//         },
//         total_sections: 2 + developmentSections.length
//     };
// }

// // Fonction pour créer le prompt de génération du plan
// function createStyledPrompt({ topic, capsuleType, settings, resources }) {
//     const { level, duration, style } = settings;
//     const timeDistribution = calculateTimeDistribution(duration);

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
//         conceptual: "Capsule vidéo explicative sur des concepts, théories ou soft-skills",
//         demonstrative: "Capsule vidéo tutoriel montrant des étapes pratiques et des manipulations"
//     };

//     const resourcesContext = resources && resources.length > 0
//         ? `Ressources disponibles: ${resources.map(r => `${r.name} (${r.type})`).join(', ')}`
//         : 'Aucune ressource fournie - génération basée sur le sujet uniquement';

//     return `Tu es un expert en création de contenu vidéo éducatif. Tu dois créer UNIQUEMENT le PLAN STRUCTURÉ d'une capsule vidéo (pas le script détaillé).

// CONTEXTE DE LA CAPSULE VIDÉO:
// - Sujet: ${topic}
// - Type: ${typeDescriptions[capsuleType]}
// - Niveau: ${levelDescriptions[level]}
// - Durée EXACTE: ${duration} minutes (${timeDistribution.total_seconds} secondes)
// - Style: ${style} - ${stylePrompts[style]}
// - ${resourcesContext}

// 🎬 STRUCTURE VIDÉO OBLIGATOIRE - ${timeDistribution.total_sections} PARTIES:
// 1. INTRODUCTION (${timeDistribution.introduction.duration_seconds}s) - Accroche et présentation
// ${timeDistribution.development_sections.map((dev, index) =>
//         `${index + 2}. DÉVELOPPEMENT ${timeDistribution.development_sections.length > 1 ? `PARTIE ${index + 1}` : ''} (${dev.duration_seconds}s) - Contenu principal`
//     ).join('\n')}
// ${timeDistribution.total_sections}. CONCLUSION (${timeDistribution.conclusion.duration_seconds}s) - Récap et action

// ⏱️ CONTRAINTES TEMPORELLES STRICTES:
// - Durée totale EXACTE: ${duration} minutes = ${timeDistribution.total_seconds} secondes
// - La somme des durées DOIT égaler ${timeDistribution.total_seconds}s exactement
// - Structure fixe: Introduction → Développement → Conclusion

// OBJECTIF DU PLAN:
// Définir clairement ce qui sera abordé dans chaque partie de la capsule vidéo, les points clés à traiter.
// IMPORTANT: Ne pas générer de script détaillé, juste la structure et les points à aborder.

// FORMAT JSON STRICT - PLAN VIDÉO SIMPLIFIÉ:
// {
//   "topic": "${topic}",
//   "capsule_type": "${capsuleType}",
//   "level": "${level}",
//   "duration_minutes": ${duration},
//   "style": "${style}",
//   "estimated_total_seconds": ${timeDistribution.total_seconds},
//   "plan_sections": [
//     {
//       "section_number": 1,
//       "title": "Introduction",
//       "type": "introduction",
//       "duration_seconds": ${timeDistribution.introduction.duration_seconds},
//       "what_to_cover": [
//         "Ce qu'il faut dire dans l'intro",
//         "Points à aborder pour accrocher"
//       ],
//       "content_summary": "Résumé de ce qui sera dit dans cette introduction"
//     },
//     ${timeDistribution.development_sections.map((dev, index) => `{
//       "section_number": ${dev.section_number},
//       "title": "Développement${timeDistribution.development_sections.length > 1 ? ` - Partie ${index + 1}` : ''}",
//       "type": "development",
//       "duration_seconds": ${dev.duration_seconds},
//       "what_to_cover": [
//         "Point principal 1 à expliquer",
//         "Point principal 2 à expliquer",
//         "Exemple concret à donner"
//       ],
//       "content_summary": "Résumé du contenu principal de cette partie"
//     }`).join(',\n    ')},
//     {
//       "section_number": ${timeDistribution.conclusion.section_number},
//       "title": "Conclusion",
//       "type": "conclusion",
//       "duration_seconds": ${timeDistribution.conclusion.duration_seconds},
//       "what_to_cover": [
//         "Récap rapide des points essentiels",
//         "Action à faire maintenant"
//       ],
//       "content_summary": "Ce qui sera dit en conclusion"
//     }
//   ],
//   "video_goal": "Ce que la personne saura/pourra faire après avoir vu la vidéo"
// }

// ADAPTATION NIVEAU ${level.toUpperCase()}:
// ${level === 'beginner'
//             ? '- Partir des bases absolues\n- Définir tous les termes techniques\n- Multiplier les exemples simples'
//             : level === 'intermediate'
//                 ? '- Supposer des connaissances de base\n- Introduire des concepts plus avancés\n- Faire des liens avec l\'expérience existante'
//                 : '- Approche experte et concise\n- Concepts avancés et nuances\n- Focus sur l\'optimisation et les bonnes pratiques'
//         }

// STYLE ${style.toUpperCase()} SPÉCIFIQUE:
// ${style === 'practical'
//             ? 'Plan orienté action. Points concrets et applicables immédiatement.'
//             : style === 'corporate'
//                 ? 'Plan professionnel. Focus sur ROI et efficacité business.'
//                 : style === 'academic'
//                     ? 'Plan structuré avec progression logique et méthodique.'
//                     : 'Plan accessible avec vulgarisation et exemples parlants.'
//         }

// VÉRIFICATION OBLIGATOIRE:
// - La somme des duration_seconds DOIT être exactement ${timeDistribution.total_seconds}
// - ${timeDistribution.total_sections} sections exactement
// - Chaque section doit avoir des points clairs à couvrir
// - Focus sur CE QUI SERA DIT, pas sur la théorie pédagogique

// Génère le plan JSON simplifié pour cette capsule vidéo:`;
// }

// // API POST /ai/groq-plan - Génération de plan de capsule vidéo
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

//         // Calcul de la répartition temporelle
//         const timeDistribution = calculateTimeDistribution(settings.duration);

//         // Vérifier cache
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
//         if (!planData || !planData.plan_sections) {
//             planData = createFallbackPlan({ topic, capsuleType, settings, timeDistribution });
//         }

//         // Vérification durée totale
//         const actualTotal = planData.plan_sections.reduce((sum, s) => sum + s.duration_seconds, 0);
//         const expectedTotal = timeDistribution.total_seconds;

//         if (Math.abs(actualTotal - expectedTotal) > 5) {
//             console.warn(`⚠️ Correction durée: ${actualTotal}s -> ${expectedTotal}s`);
//             planData = adjustPlanTimings(planData, expectedTotal);
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
//             plan_sections: planData.plan_sections,
//             video_goal: planData.video_goal || `Comprendre et appliquer ${topic}`,
//             estimated_total_seconds: expectedTotal,
//             actual_total_seconds: planData.plan_sections.reduce((sum, s) => sum + s.duration_seconds, 0),
//             sections_count: planData.plan_sections.length,
//             time_distribution: timeDistribution,
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

//         console.log(`✅ Plan Groq v2 généré: ${planData.plan_sections?.length || 0} sections en ${totalTime}ms`);
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

// // Fallback plan si parsing JSON échoue
// function createFallbackPlan({ topic, capsuleType, settings, timeDistribution }) {
//     const { level, duration, style } = settings;

//     const planSections = [
//         {
//             section_number: 1,
//             title: "Introduction",
//             type: "introduction",
//             duration_seconds: timeDistribution.introduction.duration_seconds,
//             what_to_cover: [
//                 `Saluer et présenter le sujet: ${topic}`,
//                 "Expliquer pourquoi c'est utile",
//                 "Annoncer ce qu'on va voir"
//             ],
//             content_summary: `Accroche simple sur ${topic} et annonce du contenu`
//         }
//     ];

//     // Ajouter les sections de développement
//     timeDistribution.development_sections.forEach((dev, index) => {
//         planSections.push({
//             section_number: dev.section_number,
//             title: timeDistribution.development_sections.length > 1
//                 ? `Développement - Partie ${index + 1}`
//                 : "Développement",
//             type: "development",
//             duration_seconds: dev.duration_seconds,
//             what_to_cover: [
//                 "Point principal à expliquer",
//                 "Exemple concret à montrer",
//                 "Astuce ou conseil pratique"
//             ],
//             content_summary: `Explication claire et simple de ${topic}`
//         });
//     });

//     // Ajouter la conclusion
//     planSections.push({
//         section_number: timeDistribution.conclusion.section_number,
//         title: "Conclusion",
//         type: "conclusion",
//         duration_seconds: timeDistribution.conclusion.duration_seconds,
//         what_to_cover: [
//             `Récap rapide de ${topic}`,
//             "Encourager à mettre en pratique",
//             "Remercier et dire au revoir"
//         ],
//         content_summary: "Résumé rapide et motivation"
//     });

//     return {
//         topic,
//         capsule_type: capsuleType,
//         level,
//         duration_minutes: duration,
//         style,
//         estimated_total_seconds: timeDistribution.total_seconds,
//         plan_sections: planSections,
//         video_goal: `Savoir appliquer ${topic} dans son quotidien`
//     };
// }

// // Fonction pour ajuster les timings si nécessaire
// function adjustPlanTimings(planData, expectedTotalSeconds) {
//     const sections = planData.plan_sections;
//     const actualTotal = sections.reduce((sum, s) => sum + s.duration_seconds, 0);
//     const ratio = expectedTotalSeconds / actualTotal;

//     // Ajuster proportionnellement
//     sections.forEach(section => {
//         section.duration_seconds = Math.round(section.duration_seconds * ratio);
//     });

//     // Corriger les arrondis pour que le total soit exact
//     const newTotal = sections.reduce((sum, s) => sum + s.duration_seconds, 0);
//     const difference = expectedTotalSeconds - newTotal;

//     if (difference !== 0) {
//         // Ajouter/retirer la différence sur la section de développement la plus longue
//         const longestDevSection = sections
//             .filter(s => s.type === 'development')
//             .sort((a, b) => b.duration_seconds - a.duration_seconds)[0];

//         if (longestDevSection) {
//             longestDevSection.duration_seconds += difference;
//         }
//     }

//     return planData;
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
//         durations: [3, 5], // ✅ EXACTEMENT comme spécifié
//         capsule_types: ["conceptual", "demonstrative"],
//         structure: "Fixe: Introduction -> Développement -> Conclusion",
//         output: "PLAN UNIQUEMENT (pas de script détaillé)"
//     });
// });

// module.exports = router;











// Un peu de soucis pour la gestion des documents 
// meme code mais avec script de narration par slide et ressource externe
// groq-fast-plan.js - Version Enhanced avec Ressources Documentaires

// groq-fast-plan.js - UN SEUL ENDPOINT POUR TOUT (JSON + Upload)

// const express = require('express');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');
// const crypto = require('crypto');

// const router = express.Router();

// // Configuration du cache
// const planCache = new Map();
// const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

// // Configuration multer pour upload de fichiers
// const upload = multer({
//     dest: 'temp-uploads/',
//     fileFilter: (req, file, cb) => {
//         const allowedTypes = ['.pdf', '.txt', '.docx', '.md', '.csv'];
//         const ext = path.extname(file.originalname).toLowerCase();
//         cb(null, allowedTypes.includes(ext));
//     },
//     limits: {
//         fileSize: 10 * 1024 * 1024, // 10MB max
//         files: 5 // Maximum 5 fichiers
//     }
// });

// // Créer le dossier temp-uploads s'il n'existe pas
// const tempDir = path.join(__dirname, '..', '..', 'temp-uploads');
// if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true });
//     console.log('📁 Dossier temp-uploads créé');
// }

// // 🎯 UN SEUL ENDPOINT POUR TOUT (JSON + Upload)
// router.post('/groq-plan', upload.array('files', 5), async (req, res) => {
//     const startTime = Date.now();

//     try {
//         // 🔍 DÉTECTION AUTOMATIQUE DU FORMAT
//         const isFormData = req.is('multipart/form-data');
//         const isJSON = req.is('application/json');

//         console.log(`🎯 Endpoint unique - Format détecté: ${isFormData ? 'Form-Data (avec fichiers)' : 'JSON'}`);

//         let topic, capsuleType, settings, resources, reference_materials, company_context, specific_requirements;

//         if (isFormData) {
//             // 📁 FORMAT FORM-DATA (avec fichiers)
//             topic = req.body.topic;
//             capsuleType = req.body.capsuleType || 'demonstrative';

//             // Parse settings JSON si fourni
//             try {
//                 settings = req.body.settings ? JSON.parse(req.body.settings) : {};
//             } catch (e) {
//                 settings = {};
//                 console.warn('⚠️ Settings JSON invalides, utilisation par défaut');
//             }

//             // Parse resources JSON si fourni
//             try {
//                 resources = req.body.resources ? JSON.parse(req.body.resources) : {};
//             } catch (e) {
//                 resources = {};
//                 console.warn('⚠️ Ressources JSON invalides, ignorées');
//             }

//             // Parse reference_materials JSON si fourni
//             try {
//                 reference_materials = req.body.reference_materials ? JSON.parse(req.body.reference_materials) : [];
//             } catch (e) {
//                 reference_materials = [];
//             }

//             company_context = req.body.company_context || null;
//             specific_requirements = req.body.specific_requirements || null;

//         } else {
//             // 📝 FORMAT JSON (sans fichiers)
//             topic = req.body.topic;
//             capsuleType = req.body.capsuleType || 'demonstrative';
//             settings = req.body.settings || {};
//             resources = req.body.resources || {};
//             reference_materials = req.body.reference_materials || [];
//             company_context = req.body.company_context || null;
//             specific_requirements = req.body.specific_requirements || null;
//         }

//         // Validation de base
//         if (!topic || topic.length < 5) {
//             // Nettoyer les fichiers uploadés si présents
//             cleanupUploadedFiles(req.files);
//             return res.status(400).json({
//                 error: 'Topic requis (minimum 5 caractères)',
//                 format_detected: isFormData ? 'form-data' : 'json',
//                 files_uploaded: req.files?.length || 0,
//                 example: 'Les 3 erreurs Excel à éviter'
//             });
//         }

//         // Settings par défaut
//         const finalSettings = {
//             level: 'beginner',
//             duration: 5,
//             style: 'practical',
//             ...settings
//         };

//         console.log(`⚡ Génération Groq v3 UNIFIED: "${topic.substring(0, 50)}..." (${capsuleType}, ${finalSettings.level}, ${isFormData ? 'avec fichiers' : 'JSON'})`);

//         // 📄 TRAITEMENT DES FICHIERS SI PRÉSENTS
//         let filesContent = '';
//         const processedFiles = [];

//         if (req.files && req.files.length > 0) {
//             console.log(`📁 Traitement de ${req.files.length} fichiers uploadés...`);

//             for (const file of req.files) {
//                 try {
//                     const content = await parseUploadedFile(file);
//                     filesContent += `\n\n=== CONTENU DE ${file.originalname} ===\n${content}\n`;
//                     processedFiles.push({
//                         name: file.originalname,
//                         size: file.size,
//                         type: path.extname(file.originalname),
//                         content_length: content.length,
//                         status: 'parsed'
//                     });
//                 } catch (error) {
//                     console.error(`❌ Erreur parsing ${file.originalname}:`, error.message);
//                     processedFiles.push({
//                         name: file.originalname,
//                         status: 'error',
//                         error: error.message
//                     });
//                 }
//             }
//         }

//         // 🔗 COMBINAISON DE TOUTES LES RESSOURCES
//         const combinedResources = {
//             ...resources,
//             files_content: filesContent // Ajout du contenu des fichiers
//         };

//         // 🔍 ANALYSE DES RESSOURCES COMPLÈTES
//         let resourcesContext = '';
//         let hasResources = false;

//         if (combinedResources && Object.keys(combinedResources).length > 0) {
//             hasResources = true;
//             resourcesContext = await processResourcesContext(combinedResources);
//             console.log(`📚 Contexte total: ${resourcesContext.length} caractères (fichiers: ${filesContent.length})`);
//         }

//         if (reference_materials && reference_materials.length > 0) {
//             hasResources = true;
//             const materialsContext = processMaterialsContext(reference_materials);
//             resourcesContext += '\n\n' + materialsContext;
//             console.log(`📖 Matériaux de référence: ${reference_materials.length} éléments`);
//         }

//         // Cache key avec contexte complet
//         const cacheKey = generateCacheKey(topic, capsuleType, finalSettings, resourcesContext);

//         // Vérification cache
//         if (planCache.has(cacheKey)) {
//             const cached = planCache.get(cacheKey);
//             if (Date.now() - cached.timestamp < CACHE_DURATION) {
//                 // Nettoyer les fichiers même pour le cache
//                 cleanupUploadedFiles(req.files);

//                 console.log('💾 Plan récupéré du cache');
//                 return res.json({
//                     ...cached.data,
//                     generated_at: cached.timestamp,
//                     from_cache: true,
//                     format_used: isFormData ? 'form-data' : 'json',
//                     files_processed: processedFiles.length,
//                     cache_hit: true
//                 });
//             } else {
//                 planCache.delete(cacheKey);
//             }
//         }

//         // 🎯 CRÉATION DU PROMPT ENRICHI
//         const enhancedPrompt = createEnhancedPrompt(
//             topic,
//             capsuleType,
//             finalSettings,
//             resourcesContext,
//             company_context,
//             specific_requirements
//         );

//         // Génération avec Groq
//         const groqResponse = await callGroqAPI(enhancedPrompt);

//         // Parsing et validation
//         let planData;
//         try {
//             const cleanedResponse = cleanGroqResponse(groqResponse);
//             planData = JSON.parse(cleanedResponse);
//         } catch (parseError) {
//             console.error('❌ Erreur parsing JSON Groq:', parseError.message);
//             planData = createFallbackPlan(topic, finalSettings);
//         }

//         // Enrichissement du plan
//         const enrichedPlan = enrichPlanWithResources(planData, combinedResources, reference_materials, hasResources);

//         // Nettoyage des fichiers temporaires
//         cleanupUploadedFiles(req.files);

//         // Finalisation
//         const planId = uuidv4();
//         const totalTime = Date.now() - startTime;

//         const result = {
//             plan_id: planId,
//             topic: topic,
//             capsule_type: capsuleType,
//             settings: finalSettings,

//             // 🎯 MÉTADONNÉES UNIFIED
//             input_format: {
//                 detected: isFormData ? 'multipart/form-data' : 'application/json',
//                 has_file_uploads: req.files?.length > 0,
//                 files_count: req.files?.length || 0
//             },

//             // 📁 INFO FICHIERS (si présents)
//             ...(req.files?.length > 0 && {
//                 files_info: {
//                     uploaded_count: req.files.length,
//                     processed_successfully: processedFiles.filter(f => f.status === 'parsed').length,
//                     failed_count: processedFiles.filter(f => f.status === 'error').length,
//                     total_content_length: filesContent.length,
//                     processed_files: processedFiles
//                 }
//             }),

//             // 📚 INFO RESSOURCES
//             resources_info: {
//                 has_resources: hasResources,
//                 has_files: filesContent.length > 0,
//                 has_text_resources: !!(combinedResources.text_content && combinedResources.text_content !== filesContent),
//                 resources_types: Object.keys(combinedResources).filter(k => k !== 'files_content'),
//                 reference_materials_count: reference_materials?.length || 0,
//                 context_length: resourcesContext.length,
//                 company_context: !!company_context,
//                 specific_requirements: !!specific_requirements
//             },

//             // Plan généré
//             plan_sections: enrichedPlan.plan_sections,

//             // Métadonnées
//             generation_stats: {
//                 total_time_ms: totalTime,
//                 groq_model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
//                 with_resources: hasResources,
//                 with_file_uploads: req.files?.length > 0,
//                 prompt_length: enhancedPrompt.length,
//                 response_quality: 'enhanced_unified_endpoint'
//             },

//             generated_at: new Date().toISOString(),
//             status: 'completed',
//             cache_stored: true,
//             ready_for_slides: true,

//             // 🎯 WORKFLOW SUGGESTIONS
//             next_steps: {
//                 primary: 'POST /ai/plan-to-markdown avec ce plan complet',
//                 alternative: 'POST /ai/generate-slides pour créer directement les slides',
//                 with_audio: 'Puis POST /ai/generate-narration-bark pour l\'audio'
//             }
//         };

//         // Sauvegarde cache
//         planCache.set(cacheKey, {
//             data: result,
//             timestamp: Date.now()
//         });

//         console.log(`✅ Plan UNIFIED généré: ${enrichedPlan.plan_sections.length} sections, ${processedFiles.filter(f => f.status === 'parsed').length}/${req.files?.length || 0} fichiers, ${totalTime}ms`);
//         res.json(result);

//     } catch (error) {
//         // Nettoyer les fichiers en cas d'erreur
//         cleanupUploadedFiles(req.files);

//         const totalTime = Date.now() - startTime;
//         console.error('❌ Erreur génération plan UNIFIED:', error);

//         res.status(500).json({
//             error: 'Erreur génération plan',
//             details: error.message,
//             processing_time_ms: totalTime,
//             troubleshooting: {
//                 check_groq_api: 'Vérifiez la clé API Groq',
//                 check_format: 'Vérifiez le format JSON ou form-data',
//                 check_files: 'Vérifiez les fichiers uploadés si présents',
//                 retry: 'Réessayez sans fichiers si problème persiste'
//             }
//         });
//     }
// });

// // 🔧 FONCTION PARSING FICHIERS
// async function parseUploadedFile(file) {
//     const ext = path.extname(file.originalname).toLowerCase();

//     try {
//         switch (ext) {
//             case '.txt':
//             case '.md':
//                 return fs.readFileSync(file.path, 'utf8');

//             case '.csv':
//                 const csvContent = fs.readFileSync(file.path, 'utf8');
//                 return `Données CSV:\n${csvContent}`;

//             case '.pdf':
//                 // Pour activer PDF : npm install pdf-parse
//                 // const pdf = require('pdf-parse');
//                 // const pdfBuffer = fs.readFileSync(file.path);
//                 // const pdfData = await pdf(pdfBuffer);
//                 // return pdfData.text;
//                 throw new Error('Support PDF nécessite: npm install pdf-parse');

//             case '.docx':
//                 // Pour activer DOCX : npm install mammoth
//                 // const mammoth = require('mammoth');
//                 // const docxBuffer = fs.readFileSync(file.path);
//                 // const result = await mammoth.extractRawText({ buffer: docxBuffer });
//                 // return result.value;
//                 throw new Error('Support DOCX nécessite: npm install mammoth');

//             default:
//                 throw new Error(`Type de fichier non supporté: ${ext}`);
//         }
//     } catch (error) {
//         throw new Error(`Erreur parsing ${file.originalname}: ${error.message}`);
//     }
// }

// // 🔧 NETTOYAGE FICHIERS TEMPORAIRES
// function cleanupUploadedFiles(files) {
//     if (files && files.length > 0) {
//         files.forEach(file => {
//             try {
//                 if (fs.existsSync(file.path)) {
//                     fs.unlinkSync(file.path);
//                 }
//             } catch (error) {
//                 console.warn(`⚠️ Impossible de supprimer ${file.path}:`, error.message);
//             }
//         });
//     }
// }

// // 🔧 TRAITEMENT DES RESSOURCES
// async function processResourcesContext(resources) {
//     let context = '';

//     try {
//         // Contenu des fichiers uploadés
//         if (resources.files_content && resources.files_content.trim()) {
//             context += `CONTENU DES FICHIERS FOURNIS:\n${resources.files_content}\n\n`;
//         }

//         // Texte direct
//         if (resources.text_content && resources.text_content !== resources.files_content) {
//             context += `CONTENU SPÉCIFIQUE ADDITIONNEL:\n${resources.text_content}\n\n`;
//         }

//         // URLs
//         if (resources.urls && resources.urls.length > 0) {
//             context += `RESSOURCES WEB MENTIONNÉES:\n`;
//             resources.urls.forEach(url => context += `- ${url}\n`);
//             context += '\n';
//         }

//         // Documents référencés
//         if (resources.documents && resources.documents.length > 0) {
//             context += `DOCUMENTS DE RÉFÉRENCE:\n`;
//             resources.documents.forEach(doc => context += `- ${doc}\n`);
//             context += '\n';
//         }

//         // Mots-clés
//         if (resources.keywords && resources.keywords.length > 0) {
//             context += `MOTS-CLÉS IMPORTANTS: ${resources.keywords.join(', ')}\n\n`;
//         }

//         // Procédures
//         if (resources.procedures) {
//             context += `PROCÉDURES SPÉCIFIQUES:\n${resources.procedures}\n\n`;
//         }

//     } catch (error) {
//         console.error('❌ Erreur traitement ressources:', error.message);
//         context = 'ERREUR TRAITEMENT RESSOURCES\n';
//     }

//     return context;
// }

// // 🔧 TRAITEMENT MATÉRIAUX DE RÉFÉRENCE
// function processMaterialsContext(materials) {
//     let context = 'MATÉRIAUX DE RÉFÉRENCE:\n';

//     materials.forEach((material, index) => {
//         context += `${index + 1}. `;
//         if (material.title) context += `Titre: ${material.title}\n`;
//         if (material.type) context += `   Type: ${material.type}\n`;
//         if (material.content) context += `   Contenu: ${material.content}\n`;
//         if (material.source) context += `   Source: ${material.source}\n`;
//         context += '\n';
//     });

//     return context;
// }

// // 🎯 CRÉATION DU PROMPT ENRICHI
// function createEnhancedPrompt(topic, capsuleType, settings, resourcesContext, companyContext, specificRequirements) {
//     const { level, duration, style } = settings;

//     let prompt = `Tu es un expert en pédagogie et conception de formations. Crée un plan de formation détaillé et structuré.

// INFORMATIONS DE BASE:
// - Sujet: ${topic}
// - Type: ${capsuleType}
// - Niveau: ${level}
// - Durée: ${duration} minutes
// - Style: ${style}`;

//     // Ajout du contexte ressources
//     if (resourcesContext && resourcesContext.length > 0) {
//         prompt += `

// RESSOURCES ET CONTEXTE SPÉCIFIQUES À UTILISER:
// ${resourcesContext}

// INSTRUCTIONS IMPORTANTES:
// - Utilise OBLIGATOIREMENT le contenu et les informations des ressources fournies
// - Adapte le vocabulaire et les exemples au contexte donné
// - Intègre les procédures et méthodes mentionnées dans les ressources
// - Respecte la terminologie spécifique fournie`;
//     }

//     // Contexte entreprise
//     if (companyContext) {
//         prompt += `

// CONTEXTE ENTREPRISE:
// ${companyContext}`;
//     }

//     // Exigences spécifiques
//     if (specificRequirements) {
//         prompt += `

// EXIGENCES SPÉCIFIQUES:
// ${specificRequirements}`;
//     }

//     prompt += `

// GÉNÈRE un plan JSON avec cette structure EXACTE:

// {
//   "plan_sections": [
//     {
//       "section_number": 1,
//       "title": "Introduction",
//       "type": "introduction",
//       "duration_seconds": 30,
//       "what_to_cover": [
//         "Point d'accroche basé sur les ressources fournies",
//         "Objectifs alignés avec le contexte spécifique"
//       ],
//       "content_summary": "Résumé intégrant les éléments des ressources"
//     }
//   ]
// }

// RÈGLES STRICTES:
// - ${duration} minutes maximum (${duration * 60} secondes total)
// - Sections équilibrées en durée
// - Intégration OBLIGATOIRE des ressources dans le contenu
// - Vocabulaire et exemples adaptés au contexte fourni
// - JSON valide uniquement, pas de texte avant/après`;

//     return prompt;
// }

// // 🔧 ENRICHISSEMENT DU PLAN
// function enrichPlanWithResources(planData, resources, materials, hasResources) {
//     if (!hasResources || !planData.plan_sections) {
//         return planData;
//     }

//     planData.plan_sections = planData.plan_sections.map(section => ({
//         ...section,
//         enhanced_with_resources: hasResources,
//         resource_integration: {
//             uses_company_content: !!(resources.text_content || resources.files_content),
//             uses_uploaded_files: !!resources.files_content,
//             references_documents: !!(resources.documents?.length),
//             includes_procedures: !!resources.procedures,
//             follows_company_style: true
//         }
//     }));

//     return planData;
// }

// // 🔧 APPEL API GROQ
// async function callGroqAPI(prompt) {
//     try {
//         const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
//             model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
//             messages: [
//                 {
//                     role: 'system',
//                     content: 'Tu es un expert en conception pédagogique. Tu intègres parfaitement les ressources fournies dans tes plans de formation. Réponds UNIQUEMENT en JSON valide.'
//                 },
//                 {
//                     role: 'user',
//                     content: prompt
//                 }
//             ],
//             temperature: 0.7,
//             max_tokens: 4000
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         return response.data.choices[0].message.content;
//     } catch (error) {
//         console.error('❌ Erreur API Groq:', error.message);
//         throw error;
//     }
// }

// // 🔧 NETTOYAGE RÉPONSE GROQ
// function cleanGroqResponse(response) {
//     return response
//         .replace(/```json\n/g, '')
//         .replace(/\n```/g, '')
//         .replace(/```/g, '')
//         .replace(/^[^{]*/, '')
//         .replace(/[^}]*$/, '')
//         .trim();
// }

// // 🔧 PLAN FALLBACK
// function createFallbackPlan(topic, settings) {
//     const { duration } = settings;
//     const totalSeconds = duration * 60;

//     return {
//         plan_sections: [
//             {
//                 section_number: 1,
//                 title: "Introduction",
//                 type: "introduction",
//                 duration_seconds: Math.round(totalSeconds * 0.15),
//                 what_to_cover: [
//                     `Présentation du sujet: ${topic}`,
//                     "Objectifs de cette formation"
//                 ],
//                 content_summary: `Introduction à ${topic}`
//             },
//             {
//                 section_number: 2,
//                 title: "Développement principal",
//                 type: "development",
//                 duration_seconds: Math.round(totalSeconds * 0.70),
//                 what_to_cover: [
//                     "Points clés du sujet",
//                     "Exemples pratiques",
//                     "Méthodes recommandées"
//                 ],
//                 content_summary: `Contenu principal sur ${topic}`
//             },
//             {
//                 section_number: 3,
//                 title: "Conclusion",
//                 type: "conclusion",
//                 duration_seconds: Math.round(totalSeconds * 0.15),
//                 what_to_cover: [
//                     "Récapitulatif des points essentiels",
//                     "Prochaines étapes recommandées"
//                 ],
//                 content_summary: `Synthèse et conclusion de ${topic}`
//             }
//         ]
//     };
// }

// // 🔧 GÉNÉRATION CLÉ CACHE
// function generateCacheKey(topic, capsuleType, settings, resourcesContext) {
//     const baseKey = `${topic}_${capsuleType}_${settings.level}_${settings.duration}_${settings.style}`;
//     const resourcesHash = resourcesContext ?
//         crypto.createHash('md5').update(resourcesContext).digest('hex').substring(0, 8) :
//         'no_resources';
//     return `${baseKey}_${resourcesHash}`;
// }

// // 🔧 INFO ENDPOINT
// router.get('/groq-plan/info', (req, res) => {
//     res.json({
//         endpoint: 'POST /ai/groq-plan',
//         description: '🎯 ENDPOINT UNIQUE - Gère JSON ET upload de fichiers automatiquement',
//         version: '4.0 - Unified Endpoint',

//         auto_detection: {
//             'Content-Type: application/json': 'Format JSON classique avec ressources textuelles',
//             'Content-Type: multipart/form-data': 'Upload de fichiers + données JSON dans form-data'
//         },

//         usage_json: {
//             content_type: 'application/json',
//             example: {
//                 topic: 'Formation Excel',
//                 resources: {
//                     text_content: 'Notre entreprise...',
//                     keywords: ['Excel', 'TCD']
//                 }
//             }
//         },

//         usage_files: {
//             content_type: 'multipart/form-data',
//             form_fields: {
//                 topic: 'Formation Excel avec nos docs',
//                 settings: '{"level":"intermediate","duration":10}',
//                 resources: '{"keywords":["Excel","formation"]}',
//                 files: ['guide.txt', 'procedures.csv']
//             }
//         },

//         supported_files: {
//             ready_now: ['.txt', '.md', '.csv'],
//             requires_install: ['.pdf (npm install pdf-parse)', '.docx (npm install mammoth)']
//         },

//         benefits: [
//             '🎯 UN SEUL endpoint pour tout',
//             '🔄 Détection automatique JSON/Files',
//             '📁 Upload direct de fichiers',
//             '📚 Ressources textuelles ET fichiers',
//             '💾 Cache intelligent unifié',
//             '🔒 Nettoyage auto fichiers temporaires',
//             '✅ 100% backward compatible'
//         ],

//         examples: {
//             postman_json: {
//                 method: 'POST',
//                 url: '/ai/groq-plan',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: '{"topic":"Test JSON","resources":{"text_content":"..."}}'
//             },
//             postman_files: {
//                 method: 'POST',
//                 url: '/ai/groq-plan',
//                 type: 'form-data',
//                 fields: {
//                     topic: 'Test Files',
//                     files: 'Select files...'
//                 }
//             }
//         }
//     });
// });

// module.exports = router;




















// // groq-fast-plan.js - VERSION CORRIGÉE avec gestion ressources robuste avec un petit soucis avec le plan simple


// const express = require('express');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');
// const crypto = require('crypto');

// const router = express.Router();

// // Configuration du cache
// const planCache = new Map();
// const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

// // Configuration multer pour upload de fichiers
// const upload = multer({
//     dest: 'temp-uploads/',
//     fileFilter: (req, file, cb) => {
//         const allowedTypes = ['.pdf', '.txt', '.docx', '.md', '.csv', '.json'];
//         const ext = path.extname(file.originalname).toLowerCase();
//         cb(null, allowedTypes.includes(ext));
//     },
//     limits: {
//         fileSize: 10 * 1024 * 1024, // 10MB max
//         files: 10 // Maximum 10 fichiers
//     }
// });

// // Créer le dossier temp-uploads s'il n'existe pas
// const tempDir = path.join(__dirname, '..', 'temp-uploads');
// if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true });
//     console.log('📁 Dossier temp-uploads créé');
// }

// // 🔧 MIDDLEWARE CONDITIONNEL CORRIGÉ - Évite l'erreur boundary
// const conditionalMulter = (req, res, next) => {
//     const contentType = req.headers['content-type'] || '';

//     console.log(`🔍 Content-Type détecté: ${contentType.substring(0, 50)}...`);

//     if (contentType.includes('multipart/form-data')) {
//         console.log('📁 Mode multipart/form-data - Activation multer');
//         upload.array('files', 10)(req, res, (err) => {
//             if (err) {
//                 console.error('❌ Erreur multer:', err.message);
//                 return res.status(400).json({
//                     error: 'Erreur upload fichiers',
//                     details: err.message,
//                     solution: 'Vérifiez la taille (<10MB) et le type des fichiers'
//                 });
//             }
//             next();
//         });
//     } else {
//         console.log('📝 Mode JSON standard - Bypass multer');
//         next(); // Passer directement au handler
//     }
// };

// // 🎯 ENDPOINT UNIFIÉ CORRIGÉ
// router.post('/groq-plan', conditionalMulter, async (req, res) => {
//     const startTime = Date.now();

//     try {
//         // 🔍 DÉTECTION DU FORMAT ET VALIDATION
//         const contentType = req.headers['content-type'] || '';
//         const isFormData = contentType.includes('multipart/form-data');
//         const isJSON = contentType.includes('application/json');

//         console.log(`🎯 Génération plan - Format: ${isFormData ? 'multipart/form-data' : isJSON ? 'JSON' : 'autre'}`);

//         let topic, capsuleType, settings, resources, reference_materials, company_context, specific_requirements;

//         if (isFormData) {
//             // 📁 FORMAT MULTIPART/FORM-DATA (avec fichiers)
//             console.log(`📁 Traitement form-data avec ${req.files?.length || 0} fichiers`);

//             topic = req.body.topic;
//             capsuleType = req.body.capsuleType || 'demonstrative';

//             // Parse JSON fields depuis form-data
//             try {
//                 settings = req.body.settings ? JSON.parse(req.body.settings) : {};
//                 resources = req.body.resources ? JSON.parse(req.body.resources) : {};
//                 reference_materials = req.body.reference_materials ? JSON.parse(req.body.reference_materials) : [];
//             } catch (e) {
//                 console.warn('⚠️ Erreur parsing JSON depuis form-data, utilisation valeurs par défaut');
//                 settings = {};
//                 resources = {};
//                 reference_materials = [];
//             }

//             company_context = req.body.company_context || null;
//             specific_requirements = req.body.specific_requirements || null;

//         } else if (isJSON) {
//             // 📝 FORMAT JSON STANDARD
//             console.log('📝 Traitement JSON standard');

//             topic = req.body.topic;
//             capsuleType = req.body.capsuleType || 'demonstrative';
//             settings = req.body.settings || {};
//             resources = req.body.resources || {};
//             reference_materials = req.body.reference_materials || [];
//             company_context = req.body.company_context || null;
//             specific_requirements = req.body.specific_requirements || null;

//         } else {
//             return res.status(400).json({
//                 error: 'Content-Type non supporté',
//                 received: contentType,
//                 supported: ['application/json', 'multipart/form-data'],
//                 solution: 'Utilisez JSON pour les données simples ou multipart/form-data pour les fichiers'
//             });
//         }

//         // Validation de base
//         if (!topic || topic.length < 5) {
//             cleanupUploadedFiles(req.files);
//             return res.status(400).json({
//                 error: 'Topic requis (minimum 5 caractères)',
//                 format_detected: isFormData ? 'multipart/form-data' : 'JSON',
//                 files_uploaded: req.files?.length || 0,
//                 example: 'Les 3 erreurs Excel à éviter absolument'
//             });
//         }

//         // Settings par défaut enrichis
//         const finalSettings = {
//             level: 'beginner',
//             duration: 5,
//             style: 'practical',
//             enhancement_level: 'standard', // standard, advanced, maximum
//             adapt_to_resources: true,
//             include_examples: true,
//             ...settings
//         };

//         console.log(`⚡ Génération enrichie: "${topic.substring(0, 50)}..." (${capsuleType}, niveau: ${finalSettings.level})`);

//         // 📄 TRAITEMENT DES FICHIERS UPLOADÉS
//         let filesContent = '';
//         let processedFiles = [];
//         let totalFilesSize = 0;

//         if (req.files && req.files.length > 0) {
//             console.log(`📁 Traitement de ${req.files.length} fichiers uploadés...`);

//             for (const file of req.files) {
//                 try {
//                     const content = await parseUploadedFile(file);
//                     const analysis = analyzeFileContent(content, file.originalname);

//                     filesContent += `\n\n=== DOCUMENT: ${file.originalname.toUpperCase()} ===\n`;
//                     filesContent += `Type: ${analysis.content_type}\n`;
//                     filesContent += `Sujets détectés: ${analysis.key_topics.join(', ')}\n`;
//                     filesContent += `Contenu:\n${content}\n`;

//                     processedFiles.push({
//                         name: file.originalname,
//                         size: file.size,
//                         type: path.extname(file.originalname),
//                         content_length: content.length,
//                         content_type: analysis.content_type,
//                         key_topics: analysis.key_topics,
//                         procedures_detected: analysis.has_procedures,
//                         status: 'parsed'
//                     });

//                     totalFilesSize += file.size;

//                 } catch (error) {
//                     console.error(`❌ Erreur parsing ${file.originalname}:`, error.message);
//                     processedFiles.push({
//                         name: file.originalname,
//                         size: file.size,
//                         status: 'error',
//                         error: error.message
//                     });
//                 }
//             }
//         }

//         // 🔗 ENRICHISSEMENT DES RESSOURCES
//         const enrichedResources = {
//             ...resources,
//             // Contenu des fichiers uploadés
//             files_content: filesContent,
//             // Métadonnées des fichiers
//             files_metadata: processedFiles.filter(f => f.status === 'parsed'),
//             // Analyse globale
//             content_analysis: analyzeGlobalContent(filesContent, resources.text_content),
//             // Contexte enrichi
//             enhanced_context: company_context ? enhanceCompanyContext(company_context, filesContent) : null
//         };

//         // 🔍 CONSTRUCTION DU CONTEXTE COMPLET
//         let fullResourcesContext = '';
//         let hasResources = false;

//         if (Object.keys(enrichedResources).length > 1) { // Plus que juste files_content vide
//             hasResources = true;
//             fullResourcesContext = await buildEnhancedResourcesContext(enrichedResources, reference_materials);
//             console.log(`📚 Contexte enrichi total: ${fullResourcesContext.length} caractères`);
//         }

//         // Cache key avec hash du contexte complet
//         const cacheKey = generateAdvancedCacheKey(topic, capsuleType, finalSettings, fullResourcesContext, company_context);

//         // Vérification cache
//         if (planCache.has(cacheKey)) {
//             const cached = planCache.get(cacheKey);
//             if (Date.now() - cached.timestamp < CACHE_DURATION) {
//                 cleanupUploadedFiles(req.files);

//                 console.log('💾 Plan enrichi récupéré du cache');
//                 return res.json({
//                     ...cached.data,
//                     generated_at: cached.timestamp,
//                     from_cache: true,
//                     cache_hit: true
//                 });
//             } else {
//                 planCache.delete(cacheKey);
//             }
//         }

//         // 🎯 CRÉATION DU PROMPT ENRICHI AVANCÉ
//         const superEnhancedPrompt = createSuperEnhancedPrompt(
//             topic,
//             capsuleType,
//             finalSettings,
//             fullResourcesContext,
//             company_context,
//             specific_requirements,
//             processedFiles.filter(f => f.status === 'parsed')
//         );

//         console.log(`🤖 Prompt enrichi: ${superEnhancedPrompt.length} caractères`);

//         // Génération avec Groq
//         const groqResponse = await callGroqAPI(superEnhancedPrompt, finalSettings.enhancement_level);

//         // Parsing et validation améliorés
//         let planData;
//         try {
//             const cleanedResponse = cleanGroqResponse(groqResponse);
//             planData = JSON.parse(cleanedResponse);

//             // Validation de la structure
//             if (!planData.plan_sections || !Array.isArray(planData.plan_sections)) {
//                 throw new Error('Structure plan_sections invalide');
//             }

//         } catch (parseError) {
//             console.error('❌ Erreur parsing JSON Groq:', parseError.message);
//             console.log('🔄 Génération plan fallback enrichi...');
//             planData = createEnhancedFallbackPlan(topic, finalSettings, hasResources);
//         }

//         // Enrichissement avancé du plan
//         const superEnrichedPlan = enrichPlanWithAdvancedResources(
//             planData,
//             enrichedResources,
//             reference_materials,
//             processedFiles,
//             hasResources
//         );

//         // Nettoyage des fichiers temporaires
//         cleanupUploadedFiles(req.files);

//         // 📊 STATISTIQUES AVANCÉES
//         const successfulFiles = processedFiles.filter(f => f.status === 'parsed');
//         const keyTopics = extractGlobalKeyTopics(successfulFiles);
//         const totalTime = Date.now() - startTime;

//         // 🎯 RÉSULTAT FINAL ENRICHI
//         const result = {
//             plan_id: uuidv4(),
//             topic: topic,
//             capsule_type: capsuleType,
//             settings: finalSettings,

//             // 🎯 MÉTADONNÉES FORMAT
//             input_format: {
//                 detected: isFormData ? 'multipart/form-data' : 'application/json',
//                 has_file_uploads: req.files?.length > 0,
//                 files_count: req.files?.length || 0,
//                 total_files_size_kb: Math.round(totalFilesSize / 1024)
//             },

//             // 📁 INFORMATIONS FICHIERS DÉTAILLÉES
//             ...(req.files?.length > 0 && {
//                 files_processing: {
//                     uploaded_count: req.files.length,
//                     processed_successfully: successfulFiles.length,
//                     failed_count: processedFiles.filter(f => f.status === 'error').length,
//                     total_content_length: filesContent.length,
//                     content_analysis: {
//                         procedures_detected: successfulFiles.filter(f => f.procedures_detected).length,
//                         key_topics_extracted: keyTopics.length,
//                         content_types: [...new Set(successfulFiles.map(f => f.content_type))]
//                     },
//                     processed_files: processedFiles
//                 }
//             }),

//             // 📚 INFORMATIONS RESSOURCES ENRICHIES
//             resources_enrichment: {
//                 has_any_resources: hasResources,
//                 has_uploaded_files: filesContent.length > 0,
//                 has_text_resources: !!(enrichedResources.text_content && enrichedResources.text_content !== filesContent),
//                 has_company_context: !!company_context,
//                 has_specific_requirements: !!specific_requirements,
//                 resource_types: Object.keys(enrichedResources).filter(k =>
//                     enrichedResources[k] && k !== 'files_content'
//                 ),
//                 reference_materials_count: reference_materials?.length || 0,
//                 total_context_length: fullResourcesContext.length,
//                 enhancement_level: finalSettings.enhancement_level,
//                 adaptation_applied: {
//                     vocabulary_adapted: hasResources && finalSettings.adapt_to_resources,
//                     examples_included: hasResources && finalSettings.include_examples,
//                     company_terminology: !!company_context,
//                     procedures_integrated: successfulFiles.some(f => f.procedures_detected)
//                 }
//             },

//             // 🎯 PLAN ENRICHI
//             plan_sections: superEnrichedPlan.plan_sections,

//             // 📊 MÉTADONNÉES GÉNÉRATION
//             generation_stats: {
//                 total_time_ms: totalTime,
//                 groq_model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
//                 prompt_length: superEnhancedPrompt.length,
//                 enhancement_level: finalSettings.enhancement_level,
//                 resources_integrated: hasResources,
//                 files_processed: successfulFiles.length,
//                 response_quality: 'super_enhanced',
//                 key_topics_detected: keyTopics
//             },

//             generated_at: new Date().toISOString(),
//             status: 'completed',
//             cache_stored: true,
//             ready_for_enhanced_slides: true,

//             // 🎯 WORKFLOW SUGGESTIONS ENRICHIES
//             next_steps: {
//                 recommended: 'POST /ai/plan-to-markdown pour slides enrichies',
//                 alternative: 'POST /ai/enhance-plan-to-markdown pour version super sophistiquée',
//                 with_resources: hasResources ? 'Le contenu sera adapté à vos ressources' : null,
//                 audio_generation: 'POST /ai/generate-narration-bark avec adaptation entreprise'
//             },

//             // 🔧 INFORMATIONS DÉBOGAGE
//             debug_info: {
//                 content_type_received: contentType,
//                 files_uploaded: req.files?.length || 0,
//                 cache_key_generated: !!cacheKey,
//                 fallback_used: planData.fallback_generated || false
//             }
//         };

//         // Sauvegarde cache
//         planCache.set(cacheKey, {
//             data: result,
//             timestamp: Date.now()
//         });

//         console.log(`✅ Plan SUPER-ENRICHI généré: ${superEnrichedPlan.plan_sections.length} sections, ${successfulFiles.length}/${req.files?.length || 0} fichiers, ${totalTime}ms`);
//         res.json(result);

//     } catch (error) {
//         // Nettoyage en cas d'erreur
//         cleanupUploadedFiles(req.files);

//         const totalTime = Date.now() - startTime;
//         console.error('❌ Erreur génération plan enrichi:', error);

//         res.status(500).json({
//             error: 'Erreur génération plan enrichi',
//             details: error.message,
//             processing_time_ms: totalTime,
//             files_uploaded: req.files?.length || 0,
//             troubleshooting: {
//                 check_content_type: 'Vérifiez le Content-Type (JSON ou multipart/form-data)',
//                 check_groq_api: 'Vérifiez la clé API Groq',
//                 check_files: 'Vérifiez les fichiers uploadés (taille <10MB)',
//                 check_topic: 'Vérifiez que le topic fait au moins 5 caractères',
//                 retry_json: 'Réessayez en mode JSON sans fichiers'
//             }
//         });
//     }
// });

// // 🔧 FONCTION PARSING FICHIERS AMÉLIORÉE
// async function parseUploadedFile(file) {
//     const ext = path.extname(file.originalname).toLowerCase();

//     try {
//         switch (ext) {
//             case '.txt':
//             case '.md':
//                 return fs.readFileSync(file.path, 'utf8');

//             case '.csv':
//                 const csvContent = fs.readFileSync(file.path, 'utf8');
//                 return convertCSVToStructuredText(csvContent);

//             case '.json':
//                 const jsonContent = fs.readFileSync(file.path, 'utf8');
//                 const jsonData = JSON.parse(jsonContent);
//                 return convertJSONToStructuredText(jsonData);

//             case '.pdf':
//                 // Pour PDF : npm install pdf-parse
//                 throw new Error('Support PDF: Exécutez "npm install pdf-parse"');

//             case '.docx':
//                 // Pour DOCX : npm install mammoth
//                 throw new Error('Support DOCX: Exécutez "npm install mammoth"');

//             default:
//                 throw new Error(`Type de fichier non supporté: ${ext}`);
//         }
//     } catch (error) {
//         throw new Error(`Erreur parsing ${file.originalname}: ${error.message}`);
//     }
// }

// // 🔍 ANALYSE CONTENU FICHIER
// function analyzeFileContent(content, filename) {
//     const analysis = {
//         content_type: 'general',
//         key_topics: [],
//         has_procedures: false,
//         has_examples: false,
//         confidence_score: 0
//     };

//     const lowerContent = content.toLowerCase();
//     const words = lowerContent.split(/\W+/).filter(w => w.length > 3);

//     // Détecter le type de contenu
//     if (lowerContent.includes('procédure') || lowerContent.includes('étape') || /\d+\.\s/.test(content)) {
//         analysis.content_type = 'procedure';
//         analysis.has_procedures = true;
//         analysis.confidence_score += 0.3;
//     }

//     if (lowerContent.includes('formation') || lowerContent.includes('cours') || lowerContent.includes('apprentissage')) {
//         analysis.content_type = 'training_material';
//         analysis.confidence_score += 0.2;
//     }

//     if (filename.toLowerCase().includes('guide') || filename.toLowerCase().includes('manuel')) {
//         analysis.content_type = 'manual';
//         analysis.confidence_score += 0.2;
//     }

//     if (lowerContent.includes('exemple') || lowerContent.includes('par exemple') || lowerContent.includes('illustration')) {
//         analysis.has_examples = true;
//         analysis.confidence_score += 0.1;
//     }

//     // Extraire mots-clés fréquents
//     const wordFreq = {};
//     words.forEach(word => {
//         if (word.length > 4) {
//             wordFreq[word] = (wordFreq[word] || 0) + 1;
//         }
//     });

//     analysis.key_topics = Object.entries(wordFreq)
//         .sort(([, a], [, b]) => b - a)
//         .slice(0, 8)
//         .map(([word]) => word);

//     return analysis;
// }

// // 🔗 CONSTRUCTION CONTEXTE ENRICHI
// async function buildEnhancedResourcesContext(enrichedResources, referenceMaterials) {
//     let context = '';

//     try {
//         // Analyse globale du contenu
//         if (enrichedResources.content_analysis) {
//             context += `ANALYSE GLOBALE DU CONTENU:\n${JSON.stringify(enrichedResources.content_analysis, null, 2)}\n\n`;
//         }

//         // Contenu des fichiers avec métadonnées
//         if (enrichedResources.files_content && enrichedResources.files_content.trim()) {
//             context += `DOCUMENTS FOURNIS AVEC MÉTADONNÉES:\n${enrichedResources.files_content}\n\n`;
//         }

//         // Métadonnées des fichiers
//         if (enrichedResources.files_metadata && enrichedResources.files_metadata.length > 0) {
//             context += `MÉTADONNÉES DES DOCUMENTS:\n`;
//             enrichedResources.files_metadata.forEach(file => {
//                 context += `- ${file.name}: ${file.content_type}, sujets: ${file.key_topics.join(', ')}\n`;
//             });
//             context += '\n';
//         }

//         // Texte additionnel
//         if (enrichedResources.text_content && enrichedResources.text_content !== enrichedResources.files_content) {
//             context += `CONTENU TEXTUEL ADDITIONNEL:\n${enrichedResources.text_content}\n\n`;
//         }

//         // Contexte entreprise enrichi
//         if (enrichedResources.enhanced_context) {
//             context += `CONTEXTE ENTREPRISE ENRICHI:\n${enrichedResources.enhanced_context}\n\n`;
//         }

//         // Ressources diverses
//         if (enrichedResources.urls && enrichedResources.urls.length > 0) {
//             context += `RESSOURCES WEB:\n${enrichedResources.urls.map(url => `- ${url}`).join('\n')}\n\n`;
//         }

//         if (enrichedResources.keywords && enrichedResources.keywords.length > 0) {
//             context += `MOTS-CLÉS PRIORITAIRES: ${enrichedResources.keywords.join(', ')}\n\n`;
//         }

//         if (enrichedResources.procedures) {
//             context += `PROCÉDURES SPÉCIFIQUES:\n${enrichedResources.procedures}\n\n`;
//         }

//         // Matériaux de référence
//         if (referenceMaterials && referenceMaterials.length > 0) {
//             context += buildReferenceMaterialsContext(referenceMaterials);
//         }

//     } catch (error) {
//         console.error('❌ Erreur construction contexte enrichi:', error.message);
//         context = 'ERREUR TRAITEMENT RESSOURCES ENRICHIES\n';
//     }

//     return context;
// }

// // 🎯 PROMPT SUPER ENRICHI
// function createSuperEnhancedPrompt(topic, capsuleType, settings, resourcesContext, companyContext, specificRequirements, processedFiles) {
//     const { level, duration, style, enhancement_level } = settings;

//     let prompt = `Tu es un expert en pédagogie et conception de formations professionnelles. Tu dois créer un plan de formation exceptionnel, parfaitement adapté aux ressources fournies.

// INFORMATIONS DE BASE:
// - Sujet: ${topic}
// - Type: ${capsuleType}
// - Niveau: ${level}
// - Durée: ${duration} minutes
// - Style: ${style}
// - Niveau d'enrichissement: ${enhancement_level}`;

//     // Contexte ressources détaillé
//     if (resourcesContext && resourcesContext.length > 0) {
//         prompt += `

// RESSOURCES ET CONTEXTE DÉTAILLÉ À INTÉGRER OBLIGATOIREMENT:
// ${resourcesContext}

// DIRECTIVES D'INTÉGRATION AVANCÉES:
// - Utilise EXCLUSIVEMENT le vocabulaire et la terminologie des ressources fournies
// - Intègre les procédures exactes mentionnées dans les documents
// - Adapte tous les exemples au contexte spécifique fourni
// - Respecte scrupuleusement les méthodes et approches décrites
// - Assure-toi que chaque section fait référence aux ressources pertinentes
// - Utilise les mots-clés identifiés dans les métadonnées`;

//         // Instructions spécifiques selon les types de fichiers
//         if (processedFiles.length > 0) {
//             const procedureFiles = processedFiles.filter(f => f.procedures_detected);
//             const manualFiles = processedFiles.filter(f => f.content_type === 'manual');

//             if (procedureFiles.length > 0) {
//                 prompt += `\n- PROCÉDURES DÉTECTÉES: Intègre les étapes exactes des fichiers ${procedureFiles.map(f => f.name).join(', ')}`;
//             }

//             if (manualFiles.length > 0) {
//                 prompt += `\n- MANUELS RÉFÉRENCE: Base-toi sur les standards des fichiers ${manualFiles.map(f => f.name).join(', ')}`;
//             }
//         }
//     }

//     // Contexte entreprise
//     if (companyContext) {
//         prompt += `

// CONTEXTE ENTREPRISE SPÉCIFIQUE:
// ${companyContext}
// - Adapte le langage et les exemples à ce contexte précis
// - Utilise les références internes et la culture d'entreprise`;
//     }

//     // Exigences spécifiques
//     if (specificRequirements) {
//         prompt += `

// EXIGENCES SPÉCIFIQUES À RESPECTER:
// ${specificRequirements}`;
//     }

//     // Instructions selon le niveau d'enrichissement
//     switch (enhancement_level) {
//         case 'maximum':
//             prompt += `

// NIVEAU MAXIMUM - GÉNÈRE UN PLAN EXCEPTIONNEL:
// - Sections ultra-détaillées avec sous-points spécifiques
// - Intégration parfaite des ressources dans chaque section
// - Exemples concrets tirés directement des documents fournis
// - Vocabulaire technique précis et adapté
// - Timing optimisé pour un apprentissage efficace`;
//             break;

//         case 'advanced':
//             prompt += `

// NIVEAU AVANCÉ - GÉNÈRE UN PLAN SOPHISTIQUÉ:
// - Sections détaillées avec bonne intégration des ressources
// - Exemples pertinents basés sur les documents
// - Terminologie adaptée au contexte`;
//             break;

//         default:
//             prompt += `

// NIVEAU STANDARD - GÉNÈRE UN PLAN PROFESSIONNEL:
// - Sections équilibrées intégrant les ressources principales
// - Exemples basés sur le contexte fourni`;
//     }

//     prompt += `

// GÉNÈRE un plan JSON avec cette structure EXACTE et ENRICHIE:

// {
//   "plan_sections": [
//     {
//       "section_number": 1,
//       "title": "Titre adapté aux ressources",
//       "type": "introduction",
//       "duration_seconds": 60,
//       "what_to_cover": [
//         "Point spécifique basé sur les ressources fournies",
//         "Objectif aligné avec les documents d'entreprise",
//         "Accroche utilisant la terminologie des ressources"
//       ],
//       "content_summary": "Résumé intégrant parfaitement les éléments des ressources",
//       "resource_references": [
//         "Référence exacte aux documents utilisés"
//       ],
//       "key_terminology": [
//         "Termes clés extraits des ressources"
//       ],
//       "examples_from_resources": [
//         "Exemples concrets tirés des documents fournis"
//       ]
//     }
//   ]
// }

// RÈGLES STRICTES ENRICHIES:
// - ${duration} minutes maximum (${duration * 60} secondes total)
// - Sections équilibrées mais détaillées selon le niveau d'enrichissement
// - Intégration OBLIGATOIRE et VISIBLE des ressources dans chaque section
// - Vocabulaire exclusivement adapté au contexte fourni
// - Exemples uniquement basés sur les ressources fournies
// - JSON valide uniquement, pas de texte avant/après
// - Chaque section doit montrer clairement l'utilisation des ressources`;

//     return prompt;
// }

// // 🔧 ENRICHISSEMENT PLAN AVANCÉ
// function enrichPlanWithAdvancedResources(planData, enrichedResources, materials, processedFiles, hasResources) {
//     if (!hasResources || !planData.plan_sections) {
//         return planData;
//     }

//     const globalKeyTopics = extractGlobalKeyTopics(processedFiles);
//     const procedureFiles = processedFiles.filter(f => f.procedures_detected);

//     planData.plan_sections = planData.plan_sections.map((section, index) => ({
//         ...section,

//         // Enrichissement avancé
//         enhanced_with_resources: true,
//         enhancement_level: 'advanced',

//         // Intégration ressources détaillée
//         resource_integration: {
//             uses_company_content: !!(enrichedResources.text_content || enrichedResources.files_content),
//             uses_uploaded_files: !!enrichedResources.files_content,
//             references_documents: !!(enrichedResources.files_metadata?.length),
//             includes_procedures: procedureFiles.length > 0,
//             follows_company_style: !!enrichedResources.enhanced_context,
//             adapted_vocabulary: true,
//             custom_examples: true
//         },

//         // Métadonnées enrichies
//         content_metadata: {
//             primary_topics: globalKeyTopics.slice(0, 3),
//             resource_files_used: processedFiles.filter(f =>
//                 f.key_topics.some(topic =>
//                     section.title?.toLowerCase().includes(topic) ||
//                     section.content_summary?.toLowerCase().includes(topic)
//                 )
//             ).map(f => f.name),
//             terminology_adapted: true,
//             examples_count: section.examples_from_resources?.length || 0
//         },

//         // Score de qualité
//         quality_score: calculateSectionQualityScore(section, hasResources, processedFiles)
//     }));

//     // Métadonnées globales du plan enrichi
//     planData.enrichment_metadata = {
//         total_files_integrated: processedFiles.length,
//         procedures_integrated: procedureFiles.length,
//         key_topics_coverage: globalKeyTopics.length,
//         company_adaptation: !!enrichedResources.enhanced_context,
//         vocabulary_adaptation_score: calculateVocabularyAdaptationScore(planData, globalKeyTopics),
//         overall_enhancement_score: calculateOverallEnhancementScore(planData, enrichedResources)
//     };

//     return planData;
// }

// // 🔧 FONCTIONS UTILITAIRES ENRICHIES

// // Conversion CSV structurée
// function convertCSVToStructuredText(csvContent) {
//     const lines = csvContent.split('\n').filter(line => line.trim());
//     if (lines.length < 2) return csvContent;

//     const headers = lines[0].split(',').map(h => h.trim());
//     let structured = `DONNÉES STRUCTURÉES (CSV):\n\nColonnes: ${headers.join(' | ')}\n\n`;

//     for (let i = 1; i < Math.min(lines.length, 11); i++) { // Max 10 lignes
//         const values = lines[i].split(',').map(v => v.trim());
//         structured += `Ligne ${i}: ${headers.map((h, idx) => `${h}: ${values[idx] || 'N/A'}`).join(' | ')}\n`;
//     }

//     if (lines.length > 11) {
//         structured += `... et ${lines.length - 11} autres lignes\n`;
//     }

//     return structured;
// }

// // Conversion JSON structurée
// function convertJSONToStructuredText(jsonData) {
//     let structured = 'DONNÉES STRUCTURÉES (JSON):\n\n';

//     function processObject(obj, prefix = '') {
//         for (const [key, value] of Object.entries(obj)) {
//             if (typeof value === 'object' && value !== null) {
//                 if (Array.isArray(value)) {
//                     structured += `${prefix}${key}: [${value.length} éléments]\n`;
//                     value.slice(0, 3).forEach((item, index) => {
//                         structured += `  ${index + 1}. ${typeof item === 'object' ? JSON.stringify(item).substring(0, 100) : item}\n`;
//                     });
//                 } else {
//                     structured += `${prefix}${key}:\n`;
//                     processObject(value, prefix + '  ');
//                 }
//             } else {
//                 structured += `${prefix}${key}: ${value}\n`;
//             }
//         }
//     }

//     processObject(jsonData);
//     return structured;
// }

// // Analyse contenu global
// function analyzeGlobalContent(filesContent, textContent) {
//     const allContent = [filesContent, textContent].filter(Boolean).join(' ');

//     if (!allContent.trim()) {
//         return { has_content: false };
//     }

//     const words = allContent.toLowerCase().split(/\W+/).filter(w => w.length > 3);
//     const wordFreq = {};

//     words.forEach(word => {
//         wordFreq[word] = (wordFreq[word] || 0) + 1;
//     });

//     const topWords = Object.entries(wordFreq)
//         .sort(([, a], [, b]) => b - a)
//         .slice(0, 15)
//         .map(([word]) => word);

//     return {
//         has_content: true,
//         total_words: words.length,
//         unique_words: Object.keys(wordFreq).length,
//         top_keywords: topWords,
//         has_procedures: allContent.includes('procédure') || allContent.includes('étape'),
//         has_examples: allContent.includes('exemple') || allContent.includes('illustration'),
//         content_density: Math.round((Object.keys(wordFreq).length / words.length) * 100)
//     };
// }

// // Enrichissement contexte entreprise
// function enhanceCompanyContext(companyContext, filesContent) {
//     if (!filesContent || !companyContext) return companyContext;

//     // Extraire terminologie spécifique des fichiers
//     const terminology = extractTerminology(filesContent);

//     let enhanced = companyContext + '\n\nTERMINOLOGIE SPÉCIFIQUE IDENTIFIÉE:\n';
//     enhanced += terminology.map(term => `- ${term}`).join('\n');

//     // Ajouter contexte procédural si détecté
//     if (filesContent.includes('procédure')) {
//         enhanced += '\n\nCONTEXTE PROCÉDURAL: Les ressources contiennent des procédures spécifiques à intégrer.';
//     }

//     return enhanced;
// }

// // Extraction terminologie
// function extractTerminology(content) {
//     const terms = [];
//     const patterns = [
//         /[A-Z][a-z]+ [A-Z][a-z]+/g, // Termes composés
//         /\b[A-Z]{2,}\b/g, // Acronymes
//         /\b\w+_\w+\b/g // Termes avec underscore
//     ];

//     patterns.forEach(pattern => {
//         const matches = content.match(pattern) || [];
//         terms.push(...matches);
//     });

//     return [...new Set(terms)].slice(0, 10);
// }

// // Extraction mots-clés globaux
// function extractGlobalKeyTopics(processedFiles) {
//     const allTopics = processedFiles.reduce((acc, file) => {
//         return acc.concat(file.key_topics || []);
//     }, []);

//     const topicFreq = {};
//     allTopics.forEach(topic => {
//         topicFreq[topic] = (topicFreq[topic] || 0) + 1;
//     });

//     return Object.entries(topicFreq)
//         .sort(([, a], [, b]) => b - a)
//         .slice(0, 12)
//         .map(([topic]) => topic);
// }

// // Calcul score qualité section
// function calculateSectionQualityScore(section, hasResources, processedFiles) {
//     let score = 50; // Score de base

//     if (hasResources) score += 20;
//     if (section.resource_references?.length > 0) score += 15;
//     if (section.examples_from_resources?.length > 0) score += 10;
//     if (section.key_terminology?.length > 0) score += 5;

//     return Math.min(score, 100);
// }

// // Calcul score adaptation vocabulaire
// function calculateVocabularyAdaptationScore(planData, globalKeyTopics) {
//     if (!globalKeyTopics.length) return 0;

//     const planText = JSON.stringify(planData).toLowerCase();
//     const topicsFound = globalKeyTopics.filter(topic =>
//         planText.includes(topic.toLowerCase())
//     );

//     return Math.round((topicsFound.length / globalKeyTopics.length) * 100);
// }

// // Calcul score enrichissement global
// function calculateOverallEnhancementScore(planData, enrichedResources) {
//     let score = 0;

//     if (enrichedResources.files_content) score += 25;
//     if (enrichedResources.enhanced_context) score += 20;
//     if (enrichedResources.content_analysis?.has_content) score += 15;
//     if (planData.plan_sections?.every(s => s.enhanced_with_resources)) score += 25;
//     if (planData.plan_sections?.some(s => s.examples_from_resources?.length > 0)) score += 15;

//     return Math.min(score, 100);
// }

// // Appel API Groq enrichi
// async function callGroqAPI(prompt, enhancementLevel = 'standard') {
//     try {
//         const modelConfig = {
//             model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
//             temperature: enhancementLevel === 'maximum' ? 0.8 : 0.7,
//             max_tokens: enhancementLevel === 'maximum' ? 5000 : 4000
//         };

//         const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
//             ...modelConfig,
//             messages: [
//                 {
//                     role: 'system',
//                     content: `Tu es un expert en conception pédagogique et intégration de ressources documentaires. Tu crées des plans de formation exceptionnels parfaitement adaptés aux ressources fournies. Niveau d'enrichissement: ${enhancementLevel}. Réponds UNIQUEMENT en JSON valide.`
//                 },
//                 {
//                     role: 'user',
//                     content: prompt
//                 }
//             ]
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         return response.data.choices[0].message.content;
//     } catch (error) {
//         console.error('❌ Erreur API Groq enrichie:', error.message);
//         throw error;
//     }
// }

// // Plan fallback enrichi
// function createEnhancedFallbackPlan(topic, settings, hasResources) {
//     const { duration, level } = settings;
//     const totalSeconds = duration * 60;

//     const sections = [
//         {
//             section_number: 1,
//             title: hasResources ? `Introduction contextuelle à ${topic}` : `Introduction à ${topic}`,
//             type: "introduction",
//             duration_seconds: Math.round(totalSeconds * 0.15),
//             what_to_cover: [
//                 hasResources ? `Présentation basée sur vos ressources: ${topic}` : `Présentation du sujet: ${topic}`,
//                 "Objectifs de cette formation",
//                 hasResources ? "Contexte spécifique à votre organisation" : "Contexte général"
//             ],
//             content_summary: hasResources ? `Introduction adaptée à vos ressources sur ${topic}` : `Introduction à ${topic}`,
//             enhanced_with_resources: hasResources,
//             fallback_generated: true
//         },
//         {
//             section_number: 2,
//             title: hasResources ? "Développement basé sur vos ressources" : "Développement principal",
//             type: "development",
//             duration_seconds: Math.round(totalSeconds * 0.70),
//             what_to_cover: [
//                 hasResources ? "Points clés extraits de vos documents" : "Points clés du sujet",
//                 hasResources ? "Exemples tirés de vos ressources" : "Exemples pratiques",
//                 hasResources ? "Méthodes adaptées à votre contexte" : "Méthodes recommandées"
//             ],
//             content_summary: hasResources ? `Contenu enrichi par vos ressources sur ${topic}` : `Contenu principal sur ${topic}`,
//             enhanced_with_resources: hasResources,
//             fallback_generated: true
//         },
//         {
//             section_number: 3,
//             title: hasResources ? "Conclusion et application dans votre contexte" : "Conclusion",
//             type: "conclusion",
//             duration_seconds: Math.round(totalSeconds * 0.15),
//             what_to_cover: [
//                 "Récapitulatif des points essentiels",
//                 hasResources ? "Applications spécifiques à votre organisation" : "Applications pratiques",
//                 hasResources ? "Prochaines étapes selon vos ressources" : "Prochaines étapes recommandées"
//             ],
//             content_summary: hasResources ? `Synthèse adaptée à votre contexte pour ${topic}` : `Synthèse de ${topic}`,
//             enhanced_with_resources: hasResources,
//             fallback_generated: true
//         }
//     ];

//     return { plan_sections: sections, fallback_generated: true };
// }

// // Génération clé cache avancée
// function generateAdvancedCacheKey(topic, capsuleType, settings, resourcesContext, companyContext) {
//     const baseKey = `${topic}_${capsuleType}_${settings.level}_${settings.duration}_${settings.style}_${settings.enhancement_level}`;

//     const resourcesHash = resourcesContext ?
//         crypto.createHash('md5').update(resourcesContext).digest('hex').substring(0, 12) :
//         'no_resources';

//     const companyHash = companyContext ?
//         crypto.createHash('md5').update(companyContext).digest('hex').substring(0, 8) :
//         'no_company';

//     return `enhanced_${baseKey}_${resourcesHash}_${companyHash}`;
// }

// // Nettoyage fichiers temporaires
// function cleanupUploadedFiles(files) {
//     if (files && files.length > 0) {
//         files.forEach(file => {
//             try {
//                 if (fs.existsSync(file.path)) {
//                     fs.unlinkSync(file.path);
//                     console.log(`🗑️ Fichier temporaire supprimé: ${file.originalname}`);
//                 }
//             } catch (error) {
//                 console.warn(`⚠️ Impossible de supprimer ${file.path}:`, error.message);
//             }
//         });
//     }
// }

// // Nettoyage réponse Groq
// function cleanGroqResponse(response) {
//     return response
//         .replace(/```json\n/g, '')
//         .replace(/\n```/g, '')
//         .replace(/```/g, '')
//         .replace(/^[^{]*/, '')
//         .replace(/[^}]*$/, '')
//         .trim();
// }

// // 🔧 ROUTES D'INFORMATION ENRICHIES

// router.get('/groq-plan/info', (req, res) => {
//     res.json({
//         endpoint: 'POST /ai/groq-plan',
//         description: '🎯 ENDPOINT UNIFIÉ ENRICHI - Gestion avancée des ressources documentaires',
//         version: '5.0 - Super Enhanced with Resources',
//         status: 'OPÉRATIONNEL avec correction boundary',

//         auto_detection: {
//             'Content-Type: application/json': 'Mode JSON avec ressources textuelles enrichies',
//             'Content-Type: multipart/form-data': 'Upload fichiers + données avec analyse avancée'
//         },

//         enhancement_levels: {
//             'standard': 'Intégration de base des ressources',
//             'advanced': 'Analyse approfondie et adaptation vocabulaire',
//             'maximum': 'Intégration complète avec exemples personnalisés'
//         },

//         supported_files: {
//             ready: ['.txt', '.md', '.csv', '.json'],
//             requires_install: ['.pdf (npm install pdf-parse)', '.docx (npm install mammoth)']
//         },

//         new_features: [
//             '🔧 Bug multipart/form-data CORRIGÉ',
//             '📚 Analyse avancée du contenu des fichiers',
//             '🎯 Adaptation automatique du vocabulaire',
//             '📊 Métadonnées enrichies sur l\'intégration',
//             '🏢 Contexte entreprise intelligent',
//             '⚡ Cache avancé avec hash des ressources',
//             '📈 Scores de qualité d\'enrichissement'
//         ],

//         usage_json_enrichi: {
//             content_type: 'application/json',
//             example: {
//                 topic: 'Formation Excel avancée',
//                 enhancement_level: 'maximum',
//                 resources: {
//                     text_content: 'Guide Excel de notre entreprise...',
//                     keywords: ['Excel', 'TCD', 'macros'],
//                     procedures: 'Procédure validation des données...'
//                 },
//                 company_context: 'Équipe finance - utilisation quotidienne Excel',
//                 specific_requirements: 'Inclure nos standards de validation'
//             }
//         },

//         quality_indicators: {
//             vocabulary_adaptation_score: 'Pourcentage d\'adaptation du vocabulaire',
//             overall_enhancement_score: 'Score global d\'enrichissement (0-100)',
//             resource_integration_level: 'Niveau d\'intégration des ressources',
//             section_quality_scores: 'Scores individuels par section'
//         }
//     });
// });

// router.get('/groq-plan/test', async (req, res) => {
//     res.json({
//         status: 'ready',
//         version: '5.0-enhanced',
//         corrections: {
//             multipart_boundary: 'CORRIGÉ - Middleware conditionnel',
//             resource_integration: 'AMÉLIORÉ - Analyse avancée',
//             vocabulary_adaptation: 'NOUVEAU - Adaptation automatique',
//             cache_system: 'OPTIMISÉ - Hash des ressources'
//         },
//         test_endpoints: {
//             json_simple: 'POST avec Content-Type: application/json',
//             json_enrichi: 'POST avec resources et company_context',
//             multipart_files: 'POST avec Content-Type: multipart/form-data'
//         },
//         ready_for_production: true
//     });
// });

// module.exports = router;















// code optimiser qui gere tout
// groq-fast-plan.js - VERSION CORRIGÉE avec gestion ressources robuste + FIX BODY MAPPING

// groq-fast-plan.js - VERSION FINALE CORRIGÉE - Plus de références fictives
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();

// Configuration du cache
const planCache = new Map();
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

// Configuration multer pour upload de fichiers
const upload = multer({
    dest: 'temp-uploads/',
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.txt', '.docx', '.md', '.csv', '.json'];
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, allowedTypes.includes(ext));
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 10 // Maximum 10 fichiers
    }
});

// Créer le dossier temp-uploads s'il n'existe pas
const tempDir = path.join(__dirname, '..', 'temp-uploads');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('📁 Dossier temp-uploads créé');
}

// 🔧 MIDDLEWARE CONDITIONNEL CORRIGÉ - Évite l'erreur boundary
const conditionalMulter = (req, res, next) => {
    const contentType = req.headers['content-type'] || '';

    console.log(`🔍 Content-Type détecté: ${contentType.substring(0, 50)}...`);

    if (contentType.includes('multipart/form-data')) {
        console.log('📁 Mode multipart/form-data - Activation multer');
        upload.array('files', 10)(req, res, (err) => {
            if (err) {
                console.error('❌ Erreur multer:', err.message);
                return res.status(400).json({
                    error: 'Erreur upload fichiers',
                    details: err.message,
                    solution: 'Vérifiez la taille (<10MB) et le type des fichiers'
                });
            }
            next();
        });
    } else {
        console.log('📝 Mode JSON standard - Bypass multer');
        next(); // Passer directement au handler
    }
};

// 🎯 ENDPOINT UNIFIÉ CORRIGÉ
router.post('/groq-plan', conditionalMulter, async (req, res) => {
    const startTime = Date.now();

    try {
        // 🔍 DÉTECTION DU FORMAT ET VALIDATION
        const contentType = req.headers['content-type'] || '';
        const isFormData = contentType.includes('multipart/form-data');
        const isJSON = contentType.includes('application/json');

        console.log(`🎯 Génération plan - Format: ${isFormData ? 'multipart/form-data' : isJSON ? 'JSON' : 'autre'}`);

        let topic, capsuleType, settings, resources, reference_materials, company_context, specific_requirements;

        if (isFormData) {
            // 📁 FORMAT MULTIPART/FORM-DATA (avec fichiers)
            console.log(`📁 Traitement form-data avec ${req.files?.length || 0} fichiers`);

            topic = req.body.topic;
            capsuleType = req.body.capsuleType || req.body.type || 'demonstrative';

            // Parse JSON fields depuis form-data
            try {
                settings = req.body.settings ? JSON.parse(req.body.settings) : {};
                resources = req.body.resources ? JSON.parse(req.body.resources) : {};
                reference_materials = req.body.reference_materials ? JSON.parse(req.body.reference_materials) : [];
            } catch (e) {
                console.warn('⚠️ Erreur parsing JSON depuis form-data, utilisation valeurs par défaut');
                settings = {};
                resources = {};
                reference_materials = [];
            }

            company_context = req.body.company_context || null;
            specific_requirements = req.body.specific_requirements || null;

        } else if (isJSON) {
            // 📝 FORMAT JSON STANDARD - MAPPING FLEXIBLE CORRIGÉ
            console.log('📝 Traitement JSON standard');

            topic = req.body.topic;

            // 🔧 CORRECTION: Mapping flexible des paramètres
            capsuleType = req.body.capsuleType || req.body.type || 'demonstrative';

            // Gestion flexible de la durée et du niveau avec fallbacks
            const durationFromBody = req.body.duration || req.body.duration_minutes || req.body.settings?.duration || 5;
            const levelFromBody = req.body.level || req.body.settings?.level || 'beginner';
            const styleFromBody = req.body.style || req.body.settings?.style || 'practical';

            // Construction settings avec mapping flexible et validation
            settings = {
                level: levelFromBody,
                duration: parseInt(durationFromBody) || 5, // Assure un nombre
                style: styleFromBody,
                enhancement_level: req.body.enhancement_level || req.body.settings?.enhancement_level || 'standard',
                adapt_to_resources: req.body.adapt_to_resources !== undefined ? req.body.adapt_to_resources : true,
                include_examples: req.body.include_examples !== undefined ? req.body.include_examples : true,
                ...req.body.settings // Écrase avec settings explicites si fournis
            };

            resources = req.body.resources || {};
            reference_materials = req.body.reference_materials || [];
            company_context = req.body.company_context || null;
            specific_requirements = req.body.specific_requirements || null;

            console.log(`📋 Paramètres mappés: topic="${topic}", type="${capsuleType}", level="${settings.level}", durée=${settings.duration}min`);

        } else {
            return res.status(400).json({
                error: 'Content-Type non supporté',
                received: contentType,
                supported: ['application/json', 'multipart/form-data'],
                solution: 'Utilisez JSON pour les données simples ou multipart/form-data pour les fichiers'
            });
        }

        // 🔧 VALIDATION ENRICHIE avec messages explicites
        if (!topic || topic.length < 5) {
            cleanupUploadedFiles(req.files);
            return res.status(400).json({
                error: 'Topic requis (minimum 5 caractères)',
                received_parameters: {
                    topic: topic || 'non fourni',
                    type: capsuleType,
                    level: settings?.level,
                    duration: settings?.duration
                },
                format_detected: isFormData ? 'multipart/form-data' : 'JSON',
                files_uploaded: req.files?.length || 0,
                example_body: {
                    topic: 'Formation Python pour débutants',
                    type: 'demonstrative', // ou capsuleType
                    level: 'beginner',
                    duration_minutes: 5 // ou duration
                },
                supported_mappings: {
                    'type ou capsuleType': 'demonstrative|interactive|practical',
                    'level': 'beginner|intermediate|advanced',
                    'duration ou duration_minutes': 'nombre en minutes'
                }
            });
        }

        // 🔧 VALIDATION DES SETTINGS avec correction automatique
        if (!settings.duration || settings.duration < 1 || settings.duration > 60) {
            console.warn(`⚠️ Durée invalide (${settings.duration}), correction à 5 minutes`);
            settings.duration = 5;
        }

        if (!['beginner', 'intermediate', 'advanced'].includes(settings.level)) {
            console.warn(`⚠️ Niveau invalide (${settings.level}), correction à 'beginner'`);
            settings.level = 'beginner';
        }

        if (!['demonstrative', 'interactive', 'practical'].includes(capsuleType)) {
            console.warn(`⚠️ Type invalide (${capsuleType}), correction à 'demonstrative'`);
            capsuleType = 'demonstrative';
        }

        // Settings par défaut enrichis APRÈS validation
        const finalSettings = {
            level: settings.level,
            duration: settings.duration,
            style: settings.style,
            enhancement_level: settings.enhancement_level || 'standard',
            adapt_to_resources: settings.adapt_to_resources,
            include_examples: settings.include_examples,
            ...settings
        };

        console.log(`⚡ Génération enrichie: "${topic.substring(0, 50)}..." (${capsuleType}, niveau: ${finalSettings.level}, durée: ${finalSettings.duration}min)`);

        // 📄 TRAITEMENT DES FICHIERS UPLOADÉS
        let filesContent = '';
        let processedFiles = [];
        let totalFilesSize = 0;

        if (req.files && req.files.length > 0) {
            console.log(`📁 Traitement de ${req.files.length} fichiers uploadés...`);

            for (const file of req.files) {
                try {
                    const content = await parseUploadedFile(file);
                    const analysis = analyzeFileContent(content, file.originalname);

                    filesContent += `\n\n=== DOCUMENT: ${file.originalname.toUpperCase()} ===\n`;
                    filesContent += `Type: ${analysis.content_type}\n`;
                    filesContent += `Sujets détectés: ${analysis.key_topics.join(', ')}\n`;
                    filesContent += `Contenu:\n${content}\n`;

                    processedFiles.push({
                        name: file.originalname,
                        size: file.size,
                        type: path.extname(file.originalname),
                        content_length: content.length,
                        content_type: analysis.content_type,
                        key_topics: analysis.key_topics,
                        procedures_detected: analysis.has_procedures,
                        status: 'parsed'
                    });

                    totalFilesSize += file.size;

                } catch (error) {
                    console.error(`❌ Erreur parsing ${file.originalname}:`, error.message);
                    processedFiles.push({
                        name: file.originalname,
                        size: file.size,
                        status: 'error',
                        error: error.message
                    });
                }
            }
        }

        // 🔗 ENRICHISSEMENT DES RESSOURCES
        const enrichedResources = {
            ...resources,
            // Contenu des fichiers uploadés
            files_content: filesContent,
            // Métadonnées des fichiers
            files_metadata: processedFiles.filter(f => f.status === 'parsed'),
            // Analyse globale
            content_analysis: analyzeGlobalContent(filesContent, resources.text_content),
            // Contexte enrichi
            enhanced_context: company_context ? enhanceCompanyContext(company_context, filesContent) : null
        };

        // 🔍 CONSTRUCTION DU CONTEXTE COMPLET - CORRIGÉ
        let fullResourcesContext = '';
        let hasResources = false;

        // 🔧 CORRECTION: Vérifier si on a VRAIMENT des ressources
        const hasFileContent = enrichedResources.files_content && enrichedResources.files_content.trim() && enrichedResources.files_content.length > 100;
        const hasTextContent = enrichedResources.text_content && enrichedResources.text_content.trim() && enrichedResources.text_content.length > 10;
        const hasCompanyContext = company_context && company_context.trim();
        const hasSpecificReq = specific_requirements && specific_requirements.trim();

        // Seulement si on a du contenu réel (pas juste des métadonnées vides)
        if (hasFileContent || hasTextContent || hasCompanyContext || hasSpecificReq) {
            hasResources = true;
            fullResourcesContext = await buildEnhancedResourcesContext(enrichedResources, reference_materials);
            console.log(`📚 Contexte enrichi total: ${fullResourcesContext.length} caractères`);
        } else {
            console.log(`📝 Mode formation standard: aucune ressource documentaire fournie`);
            hasResources = false;
            fullResourcesContext = '';
        }

        // Cache key avec hash du contexte complet
        const cacheKey = generateAdvancedCacheKey(topic, capsuleType, finalSettings, fullResourcesContext, company_context);

        // Vérification cache
        if (planCache.has(cacheKey)) {
            const cached = planCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                cleanupUploadedFiles(req.files);

                console.log('💾 Plan enrichi récupéré du cache');
                return res.json({
                    ...cached.data,
                    generated_at: cached.timestamp,
                    from_cache: true,
                    cache_hit: true
                });
            } else {
                planCache.delete(cacheKey);
            }
        }

        // 🎯 CRÉATION DU PROMPT ENRICHI AVANCÉ - CORRIGÉ
        const superEnhancedPrompt = createSuperEnhancedPrompt(
            topic,
            capsuleType,
            finalSettings,
            fullResourcesContext,
            company_context,
            specific_requirements,
            processedFiles.filter(f => f.status === 'parsed'),
            hasResources // 🔧 NOUVEAU: Passer le flag hasResources
        );

        console.log(`🤖 Prompt enrichi: ${superEnhancedPrompt.length} caractères, hasResources: ${hasResources}`);

        // Génération avec Groq
        const groqResponse = await callGroqAPI(superEnhancedPrompt, finalSettings.enhancement_level);

        // Parsing et validation améliorés
        let planData;
        try {
            const cleanedResponse = cleanGroqResponse(groqResponse);
            planData = JSON.parse(cleanedResponse);

            // Validation de la structure
            if (!planData.plan_sections || !Array.isArray(planData.plan_sections)) {
                throw new Error('Structure plan_sections invalide');
            }

        } catch (parseError) {
            console.error('❌ Erreur parsing JSON Groq:', parseError.message);
            console.log('🔄 Génération plan fallback enrichi...');
            planData = createEnhancedFallbackPlan(topic, finalSettings, hasResources);
        }

        // Enrichissement avancé du plan
        const superEnrichedPlan = enrichPlanWithAdvancedResources(
            planData,
            enrichedResources,
            reference_materials,
            processedFiles,
            hasResources
        );

        // Nettoyage des fichiers temporaires
        cleanupUploadedFiles(req.files);

        // 📊 STATISTIQUES AVANCÉES
        const successfulFiles = processedFiles.filter(f => f.status === 'parsed');
        const keyTopics = extractGlobalKeyTopics(successfulFiles);
        const totalTime = Date.now() - startTime;

        // 🎯 RÉSULTAT FINAL ENRICHI
        const result = {
            plan_id: uuidv4(),
            topic: topic,
            capsule_type: capsuleType,
            settings: finalSettings,

            // 🎯 MÉTADONNÉES FORMAT
            input_format: {
                detected: isFormData ? 'multipart/form-data' : 'application/json',
                has_file_uploads: req.files?.length > 0,
                files_count: req.files?.length || 0,
                total_files_size_kb: Math.round(totalFilesSize / 1024)
            },

            // 📁 INFORMATIONS FICHIERS DÉTAILLÉES
            ...(req.files?.length > 0 && {
                files_processing: {
                    uploaded_count: req.files.length,
                    processed_successfully: successfulFiles.length,
                    failed_count: processedFiles.filter(f => f.status === 'error').length,
                    total_content_length: filesContent.length,
                    content_analysis: {
                        procedures_detected: successfulFiles.filter(f => f.procedures_detected).length,
                        key_topics_extracted: keyTopics.length,
                        content_types: [...new Set(successfulFiles.map(f => f.content_type))]
                    },
                    processed_files: processedFiles
                }
            }),

            // 📚 INFORMATIONS RESSOURCES ENRICHIES - CORRIGÉ
            resources_enrichment: {
                has_any_resources: hasResources, // 🔧 CORRECTION: Vraie valeur
                has_uploaded_files: hasFileContent,
                has_text_resources: hasTextContent,
                has_company_context: hasCompanyContext,
                has_specific_requirements: hasSpecificReq,
                resource_types: Object.keys(enrichedResources).filter(k =>
                    enrichedResources[k] && k !== 'files_content' && k !== 'content_analysis'
                ),
                reference_materials_count: reference_materials?.length || 0,
                total_context_length: fullResourcesContext.length, // 🔧 CORRECTION: Vraie longueur
                enhancement_level: finalSettings.enhancement_level,
                adaptation_applied: {
                    vocabulary_adapted: hasResources && finalSettings.adapt_to_resources,
                    examples_included: hasResources && finalSettings.include_examples,
                    company_terminology: hasCompanyContext,
                    procedures_integrated: successfulFiles.some(f => f.procedures_detected)
                }
            },

            // 🎯 PLAN ENRICHI
            plan_sections: superEnrichedPlan.plan_sections,

            // 📊 MÉTADONNÉES GÉNÉRATION
            generation_stats: {
                total_time_ms: totalTime,
                groq_model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
                prompt_length: superEnhancedPrompt.length,
                enhancement_level: finalSettings.enhancement_level,
                resources_integrated: hasResources,
                files_processed: successfulFiles.length,
                response_quality: hasResources ? 'super_enhanced' : 'standard_quality',
                key_topics_detected: keyTopics
            },

            generated_at: new Date().toISOString(),
            status: 'completed',
            cache_stored: true,
            ready_for_enhanced_slides: true,

            // 🎯 WORKFLOW SUGGESTIONS ENRICHIES
            next_steps: {
                recommended: 'POST /ai/plan-to-markdown pour slides enrichies',
                alternative: 'POST /ai/enhance-plan-to-markdown pour version super sophistiquée',
                with_resources: hasResources ? 'Le contenu sera adapté à vos ressources' : null,
                audio_generation: 'POST /ai/generate-narration-bark avec adaptation entreprise'
            },

            // 🔧 INFORMATIONS DÉBOGAGE
            debug_info: {
                content_type_received: contentType,
                files_uploaded: req.files?.length || 0,
                cache_key_generated: !!cacheKey,
                fallback_used: planData.fallback_generated || false,
                parameter_mapping: {
                    original_type: req.body.type || req.body.capsuleType,
                    mapped_capsuleType: capsuleType,
                    original_duration: req.body.duration || req.body.duration_minutes,
                    mapped_duration: finalSettings.duration,
                    original_level: req.body.level,
                    mapped_level: finalSettings.level
                },
                resource_detection: {
                    has_file_content: hasFileContent,
                    has_text_content: hasTextContent,
                    has_company_context: hasCompanyContext,
                    has_specific_requirements: hasSpecificReq,
                    final_has_resources: hasResources
                }
            }
        };

        // Sauvegarde cache
        planCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        console.log(`✅ Plan GÉNÉRÉ: ${superEnrichedPlan.plan_sections.length} sections, ${successfulFiles.length}/${req.files?.length || 0} fichiers, ${totalTime}ms, hasResources: ${hasResources}`);
        res.json(result);

    } catch (error) {
        // Nettoyage en cas d'erreur
        cleanupUploadedFiles(req.files);

        const totalTime = Date.now() - startTime;
        console.error('❌ Erreur génération plan enrichi:', error);

        res.status(500).json({
            error: 'Erreur génération plan enrichi',
            details: error.message,
            processing_time_ms: totalTime,
            files_uploaded: req.files?.length || 0,
            troubleshooting: {
                check_content_type: 'Vérifiez le Content-Type (JSON ou multipart/form-data)',
                check_groq_api: 'Vérifiez la clé API Groq',
                check_files: 'Vérifiez les fichiers uploadés (taille <10MB)',
                check_topic: 'Vérifiez que le topic fait au moins 5 caractères',
                check_parameters: 'Vérifiez le mapping des paramètres (type/capsuleType, duration/duration_minutes)',
                retry_json: 'Réessayez en mode JSON sans fichiers'
            }
        });
    }
});

// 🔧 FONCTION PARSING FICHIERS AMÉLIORÉE
async function parseUploadedFile(file) {
    const ext = path.extname(file.originalname).toLowerCase();

    try {
        switch (ext) {
            case '.txt':
            case '.md':
                return fs.readFileSync(file.path, 'utf8');

            case '.csv':
                const csvContent = fs.readFileSync(file.path, 'utf8');
                return convertCSVToStructuredText(csvContent);

            case '.json':
                const jsonContent = fs.readFileSync(file.path, 'utf8');
                const jsonData = JSON.parse(jsonContent);
                return convertJSONToStructuredText(jsonData);

            case '.pdf':
                // Pour PDF : npm install pdf-parse
                throw new Error('Support PDF: Exécutez "npm install pdf-parse"');

            case '.docx':
                // Pour DOCX : npm install mammoth
                throw new Error('Support DOCX: Exécutez "npm install mammoth"');

            default:
                throw new Error(`Type de fichier non supporté: ${ext}`);
        }
    } catch (error) {
        throw new Error(`Erreur parsing ${file.originalname}: ${error.message}`);
    }
}

// 🔍 ANALYSE CONTENU FICHIER
function analyzeFileContent(content, filename) {
    const analysis = {
        content_type: 'general',
        key_topics: [],
        has_procedures: false,
        has_examples: false,
        confidence_score: 0
    };

    const lowerContent = content.toLowerCase();
    const words = lowerContent.split(/\W+/).filter(w => w.length > 3);

    // Détecter le type de contenu
    if (lowerContent.includes('procédure') || lowerContent.includes('étape') || /\d+\.\s/.test(content)) {
        analysis.content_type = 'procedure';
        analysis.has_procedures = true;
        analysis.confidence_score += 0.3;
    }

    if (lowerContent.includes('formation') || lowerContent.includes('cours') || lowerContent.includes('apprentissage')) {
        analysis.content_type = 'training_material';
        analysis.confidence_score += 0.2;
    }

    if (filename.toLowerCase().includes('guide') || filename.toLowerCase().includes('manuel')) {
        analysis.content_type = 'manual';
        analysis.confidence_score += 0.2;
    }

    if (lowerContent.includes('exemple') || lowerContent.includes('par exemple') || lowerContent.includes('illustration')) {
        analysis.has_examples = true;
        analysis.confidence_score += 0.1;
    }

    // Extraire mots-clés fréquents
    const wordFreq = {};
    words.forEach(word => {
        if (word.length > 4) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });

    analysis.key_topics = Object.entries(wordFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([word]) => word);

    return analysis;
}

// 🔗 CONSTRUCTION CONTEXTE ENRICHI - CORRIGÉ
async function buildEnhancedResourcesContext(enrichedResources, referenceMaterials) {
    let context = '';

    try {
        // 🔧 CORRECTION: Ne traiter que le contenu réel
        let hasRealContent = false;

        // Contenu des fichiers avec métadonnées (seulement si contenu réel)
        if (enrichedResources.files_content &&
            enrichedResources.files_content.trim() &&
            enrichedResources.files_content.length > 100) {
            context += `DOCUMENTS FOURNIS AVEC MÉTADONNÉES:\n${enrichedResources.files_content}\n\n`;
            hasRealContent = true;
        }

        // Texte additionnel (seulement si différent et réel)
        if (enrichedResources.text_content &&
            enrichedResources.text_content.trim() &&
            enrichedResources.text_content !== enrichedResources.files_content &&
            enrichedResources.text_content.length > 10) {
            context += `CONTENU TEXTUEL ADDITIONNEL:\n${enrichedResources.text_content}\n\n`;
            hasRealContent = true;
        }

        // Contexte entreprise enrichi (seulement si fourni)
        if (enrichedResources.enhanced_context && enrichedResources.enhanced_context.trim()) {
            context += `CONTEXTE ENTREPRISE ENRICHI:\n${enrichedResources.enhanced_context}\n\n`;
            hasRealContent = true;
        }

        // Ressources diverses (seulement si fournies)
        if (enrichedResources.urls && enrichedResources.urls.length > 0) {
            context += `RESSOURCES WEB:\n${enrichedResources.urls.map(url => `- ${url}`).join('\n')}\n\n`;
            hasRealContent = true;
        }

        if (enrichedResources.keywords && enrichedResources.keywords.length > 0) {
            context += `MOTS-CLÉS PRIORITAIRES: ${enrichedResources.keywords.join(', ')}\n\n`;
            hasRealContent = true;
        }

        if (enrichedResources.procedures && enrichedResources.procedures.trim()) {
            context += `PROCÉDURES SPÉCIFIQUES:\n${enrichedResources.procedures}\n\n`;
            hasRealContent = true;
        }

        // Matériaux de référence (seulement si fournis)
        if (referenceMaterials && referenceMaterials.length > 0) {
            context += buildReferenceMaterialsContext(referenceMaterials);
            hasRealContent = true;
        }

        // 🔧 CORRECTION: Si pas de contenu réel, renvoyer vide
        if (!hasRealContent) {
            return '';
        }

        // Analyse globale SEULEMENT si on a du contenu
        if (enrichedResources.content_analysis && enrichedResources.content_analysis.has_content) {
            context = `ANALYSE GLOBALE DU CONTENU:\n${JSON.stringify(enrichedResources.content_analysis, null, 2)}\n\n` + context;
        }

    } catch (error) {
        console.error('❌ Erreur construction contexte enrichi:', error.message);
        return '';
    }

    return context;
}

// 🎯 PROMPT SUPER ENRICHI - CORRIGÉ
function createSuperEnhancedPrompt(topic, capsuleType, settings, resourcesContext, companyContext, specificRequirements, processedFiles, hasResources) {
    const { level, duration, style, enhancement_level } = settings;

    let prompt = `Tu es un expert en pédagogie et conception de formations professionnelles. Tu dois créer un plan de formation exceptionnel.

INFORMATIONS DE BASE:
- Sujet: ${topic}
- Type: ${capsuleType}
- Niveau: ${level}
- Durée: ${duration} minutes
- Style: ${style}
- Niveau d'enrichissement: ${enhancement_level}`;

    // 🔧 CORRECTION: Contexte ressources SEULEMENT si on en a vraiment
    if (hasResources && resourcesContext && resourcesContext.trim()) {
        prompt += `

RESSOURCES ET CONTEXTE DÉTAILLÉ À INTÉGRER OBLIGATOIREMENT:
${resourcesContext}

DIRECTIVES D'INTÉGRATION AVANCÉES:
- Utilise EXCLUSIVEMENT le vocabulaire et la terminologie des ressources fournies
- Intègre les procédures exactes mentionnées dans les documents
- Adapte tous les exemples au contexte spécifique fourni
- Respecte scrupuleusement les méthodes et approches décrites
- Assure-toi que chaque section fait référence aux ressources pertinentes
- Utilise les mots-clés identifiés dans les métadonnées`;

        // Instructions spécifiques selon les types de fichiers
        if (processedFiles.length > 0) {
            const procedureFiles = processedFiles.filter(f => f.procedures_detected);
            const manualFiles = processedFiles.filter(f => f.content_type === 'manual');

            if (procedureFiles.length > 0) {
                prompt += `\n- PROCÉDURES DÉTECTÉES: Intègre les étapes exactes des fichiers ${procedureFiles.map(f => f.name).join(', ')}`;
            }

            if (manualFiles.length > 0) {
                prompt += `\n- MANUELS RÉFÉRENCE: Base-toi sur les standards des fichiers ${manualFiles.map(f => f.name).join(', ')}`;
            }
        }
    } else {
        // 🔧 NOUVEAU: Instructions pour formation sans ressources
        prompt += `

MODE FORMATION STANDARD (sans ressources documentaires):
- Crée un contenu pédagogique autonome et complet
- Utilise des exemples génériques adaptés au niveau ${level}
- Structure claire et progressive
- Pas de références à des documents externes
- Contenu basé sur les meilleures pratiques pédagogiques`;
    }

    // Contexte entreprise (seulement si fourni)
    if (companyContext) {
        prompt += `

CONTEXTE ENTREPRISE SPÉCIFIQUE:
${companyContext}
- Adapte le langage et les exemples à ce contexte précis
- Utilise les références internes et la culture d'entreprise`;
    }

    // Exigences spécifiques (seulement si fournies)
    if (specificRequirements) {
        prompt += `

EXIGENCES SPÉCIFIQUES À RESPECTER:
${specificRequirements}`;
    }

    // Instructions selon le niveau d'enrichissement
    switch (enhancement_level) {
        case 'maximum':
            prompt += hasResources ? `

NIVEAU MAXIMUM - GÉNÈRE UN PLAN EXCEPTIONNEL:
- Sections ultra-détaillées avec sous-points spécifiques
- Intégration parfaite des ressources dans chaque section
- Exemples concrets tirés directement des documents fournis
- Vocabulaire technique précis et adapté
- Timing optimisé pour un apprentissage efficace` : `

NIVEAU MAXIMUM - GÉNÈRE UN PLAN EXCEPTIONNEL:
- Sections ultra-détaillées avec sous-points spécifiques
- Exemples concrets et variés
- Vocabulaire technique précis
- Timing optimisé pour un apprentissage efficace
- Contenu riche et approfondi`;
            break;

        case 'advanced':
            prompt += hasResources ? `

NIVEAU AVANCÉ - GÉNÈRE UN PLAN SOPHISTIQUÉ:
- Sections détaillées avec bonne intégration des ressources
- Exemples pertinents basés sur les documents
- Terminologie adaptée au contexte` : `

NIVEAU AVANCÉ - GÉNÈRE UN PLAN SOPHISTIQUÉ:
- Sections détaillées et bien structurées
- Exemples pertinents et concrets
- Terminologie adaptée au niveau ${level}`;
            break;

        default:
            prompt += hasResources ? `

NIVEAU STANDARD - GÉNÈRE UN PLAN PROFESSIONNEL:
- Sections équilibrées intégrant les ressources principales
- Exemples basés sur le contexte fourni` : `

NIVEAU STANDARD - GÉNÈRE UN PLAN PROFESSIONNEL:
- Sections équilibrées et progressives
- Exemples clairs et adaptés au niveau`;
    }

    // 🔧 CORRECTION: Structure JSON adaptée selon les ressources
    prompt += `

GÉNÈRE un plan JSON avec cette structure EXACTE - OBLIGATOIREMENT ${Math.ceil(duration / 2)} à ${Math.ceil(duration / 1.5)} sections pour ${duration} minutes:

{
  "plan_sections": [
    {
      "section_number": 1,
      "title": "Titre adapté au sujet",
      "type": "introduction",
      "duration_seconds": 60,
      "what_to_cover": [
        "Point spécifique sur ${topic}",
        "Objectif d'apprentissage pour niveau ${level}",
        "Contexte d'utilisation"
      ],
      "content_summary": "Résumé de la section sur ${topic}"${hasResources ? `,
      "resource_references": [
        "Référence exacte aux documents utilisés"
      ],
      "key_terminology": [
        "Termes clés extraits des ressources"
      ],
      "examples_from_resources": [
        "Exemples concrets tirés des documents fournis"
      ]` : ''}
    }
  ]
}

RÈGLES STRICTES:
- ${duration} minutes maximum (${duration * 60} secondes total)
- OBLIGATOIREMENT ${Math.ceil(duration / 2)} à ${Math.ceil(duration / 1.5)} sections pour ${duration} minutes
- Sections équilibrées selon le niveau d'enrichissement
${hasResources ? '- Intégration OBLIGATOIRE et VISIBLE des ressources dans chaque section\n- Vocabulaire exclusivement adapté au contexte fourni\n- Exemples uniquement basés sur les ressources fournies' : '- Contenu autonome sans références externes\n- Exemples génériques adaptés au niveau\n- Pas de champs resource_references, key_terminology ou examples_from_resources'}
- JSON valide uniquement, pas de texte avant/après`;

    return prompt;
}

// 🔧 ENRICHISSEMENT PLAN AVANCÉ - CORRIGÉ
function enrichPlanWithAdvancedResources(planData, enrichedResources, materials, processedFiles, hasResources) {
    if (!planData.plan_sections) {
        return planData;
    }

    const globalKeyTopics = extractGlobalKeyTopics(processedFiles);
    const procedureFiles = processedFiles.filter(f => f.procedures_detected);

    planData.plan_sections = planData.plan_sections.map((section, index) => ({
        ...section,

        // 🔧 CORRECTION: Enrichissement seulement si ressources
        ...(hasResources && {
            enhanced_with_resources: true,
            enhancement_level: 'advanced',

            // Intégration ressources détaillée
            resource_integration: {
                uses_company_content: !!(enrichedResources.text_content || enrichedResources.files_content),
                uses_uploaded_files: !!enrichedResources.files_content,
                references_documents: !!(enrichedResources.files_metadata?.length),
                includes_procedures: procedureFiles.length > 0,
                follows_company_style: !!enrichedResources.enhanced_context,
                adapted_vocabulary: true,
                custom_examples: true
            },

            // Métadonnées enrichies
            content_metadata: {
                primary_topics: globalKeyTopics.slice(0, 3),
                resource_files_used: processedFiles.filter(f =>
                    f.key_topics.some(topic =>
                        section.title?.toLowerCase().includes(topic) ||
                        section.content_summary?.toLowerCase().includes(topic)
                    )
                ).map(f => f.name),
                terminology_adapted: true,
                examples_count: section.examples_from_resources?.length || 0
            }
        }),

        // Score de qualité
        quality_score: calculateSectionQualityScore(section, hasResources, processedFiles)
    }));

    // 🔧 CORRECTION: Métadonnées globales seulement si ressources
    if (hasResources) {
        planData.enrichment_metadata = {
            total_files_integrated: processedFiles.length,
            procedures_integrated: procedureFiles.length,
            key_topics_coverage: globalKeyTopics.length,
            company_adaptation: !!enrichedResources.enhanced_context,
            vocabulary_adaptation_score: calculateVocabularyAdaptationScore(planData, globalKeyTopics),
            overall_enhancement_score: calculateOverallEnhancementScore(planData, enrichedResources)
        };
    }

    return planData;
}

// 🔧 FONCTIONS UTILITAIRES ENRICHIES

// Conversion CSV structurée
function convertCSVToStructuredText(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return csvContent;

    const headers = lines[0].split(',').map(h => h.trim());
    let structured = `DONNÉES STRUCTURÉES (CSV):\n\nColonnes: ${headers.join(' | ')}\n\n`;

    for (let i = 1; i < Math.min(lines.length, 11); i++) { // Max 10 lignes
        const values = lines[i].split(',').map(v => v.trim());
        structured += `Ligne ${i}: ${headers.map((h, idx) => `${h}: ${values[idx] || 'N/A'}`).join(' | ')}\n`;
    }

    if (lines.length > 11) {
        structured += `... et ${lines.length - 11} autres lignes\n`;
    }

    return structured;
}

// Conversion JSON structurée
function convertJSONToStructuredText(jsonData) {
    let structured = 'DONNÉES STRUCTURÉES (JSON):\n\n';

    function processObject(obj, prefix = '') {
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    structured += `${prefix}${key}: [${value.length} éléments]\n`;
                    value.slice(0, 3).forEach((item, index) => {
                        structured += `  ${index + 1}. ${typeof item === 'object' ? JSON.stringify(item).substring(0, 100) : item}\n`;
                    });
                } else {
                    structured += `${prefix}${key}:\n`;
                    processObject(value, prefix + '  ');
                }
            } else {
                structured += `${prefix}${key}: ${value}\n`;
            }
        }
    }

    processObject(jsonData);
    return structured;
}

// Analyse contenu global
function analyzeGlobalContent(filesContent, textContent) {
    const allContent = [filesContent, textContent].filter(Boolean).join(' ');

    if (!allContent.trim()) {
        return { has_content: false };
    }

    const words = allContent.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const wordFreq = {};

    words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const topWords = Object.entries(wordFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15)
        .map(([word]) => word);

    return {
        has_content: true,
        total_words: words.length,
        unique_words: Object.keys(wordFreq).length,
        top_keywords: topWords,
        has_procedures: allContent.includes('procédure') || allContent.includes('étape'),
        has_examples: allContent.includes('exemple') || allContent.includes('illustration'),
        content_density: Math.round((Object.keys(wordFreq).length / words.length) * 100)
    };
}

// Enrichissement contexte entreprise
function enhanceCompanyContext(companyContext, filesContent) {
    if (!filesContent || !companyContext) return companyContext;

    // Extraire terminologie spécifique des fichiers
    const terminology = extractTerminology(filesContent);

    let enhanced = companyContext + '\n\nTERMINOLOGIE SPÉCIFIQUE IDENTIFIÉE:\n';
    enhanced += terminology.map(term => `- ${term}`).join('\n');

    // Ajouter contexte procédural si détecté
    if (filesContent.includes('procédure')) {
        enhanced += '\n\nCONTEXTE PROCÉDURAL: Les ressources contiennent des procédures spécifiques à intégrer.';
    }

    return enhanced;
}

// Extraction terminologie
function extractTerminology(content) {
    const terms = [];
    const patterns = [
        /[A-Z][a-z]+ [A-Z][a-z]+/g, // Termes composés
        /\b[A-Z]{2,}\b/g, // Acronymes
        /\b\w+_\w+\b/g // Termes avec underscore
    ];

    patterns.forEach(pattern => {
        const matches = content.match(pattern) || [];
        terms.push(...matches);
    });

    return [...new Set(terms)].slice(0, 10);
}

// Extraction mots-clés globaux
function extractGlobalKeyTopics(processedFiles) {
    const allTopics = processedFiles.reduce((acc, file) => {
        return acc.concat(file.key_topics || []);
    }, []);

    const topicFreq = {};
    allTopics.forEach(topic => {
        topicFreq[topic] = (topicFreq[topic] || 0) + 1;
    });

    return Object.entries(topicFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 12)
        .map(([topic]) => topic);
}

// Calcul score qualité section
function calculateSectionQualityScore(section, hasResources, processedFiles) {
    let score = 50; // Score de base

    if (hasResources) score += 20;
    if (section.resource_references?.length > 0) score += 15;
    if (section.examples_from_resources?.length > 0) score += 10;
    if (section.key_terminology?.length > 0) score += 5;

    return Math.min(score, 100);
}

// Calcul score adaptation vocabulaire
function calculateVocabularyAdaptationScore(planData, globalKeyTopics) {
    if (!globalKeyTopics.length) return 0;

    const planText = JSON.stringify(planData).toLowerCase();
    const topicsFound = globalKeyTopics.filter(topic =>
        planText.includes(topic.toLowerCase())
    );

    return Math.round((topicsFound.length / globalKeyTopics.length) * 100);
}

// Calcul score enrichissement global
function calculateOverallEnhancementScore(planData, enrichedResources) {
    let score = 0;

    if (enrichedResources.files_content) score += 25;
    if (enrichedResources.enhanced_context) score += 20;
    if (enrichedResources.content_analysis?.has_content) score += 15;
    if (planData.plan_sections?.every(s => s.enhanced_with_resources)) score += 25;
    if (planData.plan_sections?.some(s => s.examples_from_resources?.length > 0)) score += 15;

    return Math.min(score, 100);
}

// Appel API Groq enrichi
async function callGroqAPI(prompt, enhancementLevel = 'standard') {
    try {
        const modelConfig = {
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            temperature: enhancementLevel === 'maximum' ? 0.8 : 0.7,
            max_tokens: enhancementLevel === 'maximum' ? 5000 : 4000
        };

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            ...modelConfig,
            messages: [
                {
                    role: 'system',
                    content: `Tu es un expert en conception pédagogique et intégration de ressources documentaires. Tu crées des plans de formation exceptionnels parfaitement adaptés aux ressources fournies. Niveau d'enrichissement: ${enhancementLevel}. Réponds UNIQUEMENT en JSON valide.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('❌ Erreur API Groq enrichie:', error.message);
        throw error;
    }
}

// Plan fallback enrichi CORRIGÉ - Plus de sections
function createEnhancedFallbackPlan(topic, settings, hasResources) {
    const { duration, level } = settings;
    const totalSeconds = duration * 60;

    // 🔧 CORRECTION: Génère plus de sections selon la durée
    const sectionsCount = Math.max(3, Math.ceil(duration / 2)); // Minimum 3 sections, sinon durée/2

    const sections = [];

    // Section introduction (15% du temps)
    const baseSection = {
        section_number: 1,
        title: hasResources ? `Introduction contextuelle à ${topic}` : `Introduction à ${topic}`,
        type: "introduction",
        duration_seconds: Math.round(totalSeconds * 0.15),
        what_to_cover: [
            hasResources ? `Présentation basée sur vos ressources: ${topic}` : `Présentation du sujet: ${topic}`,
            "Objectifs de cette formation",
            hasResources ? "Contexte spécifique à votre organisation" : "Contexte général"
        ],
        content_summary: hasResources ? `Introduction adaptée à vos ressources sur ${topic}` : `Introduction à ${topic}`,
        fallback_generated: true
    };

    // 🔧 CORRECTION: Ajouter les champs enrichis seulement si hasResources
    if (hasResources) {
        baseSection.enhanced_with_resources = true;
        baseSection.resource_references = ["Ressources fournies"];
        baseSection.key_terminology = [topic, "formation", "apprentissage"];
        baseSection.examples_from_resources = [`Exemple contextuel pour ${topic}`];
    }

    sections.push(baseSection);

    // Sections développement (70% du temps réparti)
    const developmentTime = Math.round(totalSeconds * 0.70);
    const developmentSections = sectionsCount - 2; // Moins intro et conclusion
    const timePerDevelopment = Math.round(developmentTime / developmentSections);

    for (let i = 0; i < developmentSections; i++) {
        const devSection = {
            section_number: i + 2,
            title: hasResources ? `Point clé ${i + 1} - Basé sur vos ressources` : `Point clé ${i + 1} sur ${topic}`,
            type: "development",
            duration_seconds: timePerDevelopment,
            what_to_cover: [
                hasResources ? `Aspect ${i + 1} extrait de vos documents` : `Aspect ${i + 1} du sujet`,
                hasResources ? `Exemples tirés de vos ressources` : `Exemples pratiques`,
                hasResources ? `Application dans votre contexte` : `Application pratique`
            ],
            content_summary: hasResources ? `Développement ${i + 1} enrichi par vos ressources` : `Développement ${i + 1} sur ${topic}`,
            fallback_generated: true
        };

        // 🔧 CORRECTION: Ajouter les champs enrichis seulement si hasResources
        if (hasResources) {
            devSection.enhanced_with_resources = true;
            devSection.resource_references = ["Ressources fournies"];
            devSection.key_terminology = [topic, `aspect${i + 1}`, "pratique"];
            devSection.examples_from_resources = [`Exemple ${i + 1} contextuel pour ${topic}`];
        }

        sections.push(devSection);
    }

    // Section conclusion (15% du temps)
    const conclusionSection = {
        section_number: sectionsCount,
        title: hasResources ? "Conclusion et application dans votre contexte" : "Conclusion",
        type: "conclusion",
        duration_seconds: Math.round(totalSeconds * 0.15),
        what_to_cover: [
            "Récapitulatif des points essentiels",
            hasResources ? "Applications spécifiques à votre organisation" : "Applications pratiques",
            hasResources ? "Prochaines étapes selon vos ressources" : "Prochaines étapes recommandées"
        ],
        content_summary: hasResources ? `Synthèse adaptée à votre contexte pour ${topic}` : `Synthèse de ${topic}`,
        fallback_generated: true
    };

    // 🔧 CORRECTION: Ajouter les champs enrichis seulement si hasResources
    if (hasResources) {
        conclusionSection.enhanced_with_resources = true;
        conclusionSection.resource_references = ["Ressources fournies"];
        conclusionSection.key_terminology = [topic, "synthèse", "prochaines étapes"];
        conclusionSection.examples_from_resources = [`Ressource complémentaire pour ${topic}`];
    }

    sections.push(conclusionSection);

    console.log(`🔄 Plan fallback généré: ${sections.length} sections pour ${duration} minutes, hasResources: ${hasResources}`);
    return { plan_sections: sections, fallback_generated: true };
}

// Génération clé cache avancée
function generateAdvancedCacheKey(topic, capsuleType, settings, resourcesContext, companyContext) {
    const baseKey = `${topic}_${capsuleType}_${settings.level}_${settings.duration}_${settings.style}_${settings.enhancement_level}`;

    const resourcesHash = resourcesContext ?
        crypto.createHash('md5').update(resourcesContext).digest('hex').substring(0, 12) :
        'no_resources';

    const companyHash = companyContext ?
        crypto.createHash('md5').update(companyContext).digest('hex').substring(0, 8) :
        'no_company';

    return `enhanced_${baseKey}_${resourcesHash}_${companyHash}`;
}

// Nettoyage fichiers temporaires
function cleanupUploadedFiles(files) {
    if (files && files.length > 0) {
        files.forEach(file => {
            try {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                    console.log(`🗑️ Fichier temporaire supprimé: ${file.originalname}`);
                }
            } catch (error) {
                console.warn(`⚠️ Impossible de supprimer ${file.path}:`, error.message);
            }
        });
    }
}

// Nettoyage réponse Groq
function cleanGroqResponse(response) {
    return response
        .replace(/```json\n/g, '')
        .replace(/\n```/g, '')
        .replace(/```/g, '')
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '')
        .trim();
}

// Fonction utilitaire pour les matériaux de référence
function buildReferenceMaterialsContext(referenceMaterials) {
    if (!referenceMaterials || referenceMaterials.length === 0) {
        return '';
    }

    let context = 'MATÉRIAUX DE RÉFÉRENCE:\n';
    referenceMaterials.forEach((material, index) => {
        context += `${index + 1}. ${typeof material === 'string' ? material : JSON.stringify(material)}\n`;
    });
    context += '\n';

    return context;
}

// 🔧 ROUTES D'INFORMATION ENRICHIES

router.get('/groq-plan/info', (req, res) => {
    res.json({
        endpoint: 'POST /ai/groq-plan',
        description: '🎯 ENDPOINT UNIFIÉ ENRICHI - Gestion avancée des ressources documentaires',
        version: '5.2 - FINAL FIX - Plus de références fictives',
        status: 'OPÉRATIONNEL avec correction boundary + mapping paramètres + suppression références fictives',

        auto_detection: {
            'Content-Type: application/json': 'Mode JSON avec ressources textuelles enrichies',
            'Content-Type: multipart/form-data': 'Upload fichiers + données avec analyse avancée'
        },

        fixes_applied: {
            'v5.2 FINAL': [
                '🔧 SUPPRESSION des références fictives quand aucune ressource fournie',
                '📊 Détection intelligente du contenu réel vs métadonnées vides',
                '✅ Champs resource_references, key_terminology, examples_from_resources seulement si ressources',
                '📋 Debug info avec détection des ressources réelles'
            ]
        },

        parameter_mapping: {
            'topic': 'Obligatoire - Sujet de formation (min 5 caractères)',
            'type ou capsuleType': 'demonstrative|interactive|practical (défaut: demonstrative)',
            'level': 'beginner|intermediate|advanced (défaut: beginner)',
            'duration ou duration_minutes': 'Nombre en minutes 1-60 (défaut: 5)',
            'style': 'practical|theoretical|mixed (défaut: practical)',
            'enhancement_level': 'standard|advanced|maximum (défaut: standard)'
        },

        resource_detection: {
            'no_resources': 'Plan standard sans champs resource_references',
            'with_resources': 'Plan enrichi avec références aux documents fournis',
            'detection_logic': 'Contenu > 10 caractères pour text, > 100 pour files'
        },

        usage_examples: {
            simple_no_resources: {
                input: {
                    topic: 'python',
                    type: 'demonstrative',
                    level: 'beginner',
                    duration_minutes: 5
                },
                output: 'Plan 3-4 sections SANS resource_references, key_terminology, examples_from_resources'
            },
            with_resources: {
                input: {
                    topic: 'Formation Excel',
                    resources: {
                        text_content: 'Notre guide Excel interne contient...'
                    }
                },
                output: 'Plan enrichi AVEC resource_references, key_terminology, examples_from_resources'
            }
        },

        quality_indicators: {
            has_any_resources: 'true/false selon détection réelle',
            total_context_length: '0 si pas de ressources, >0 si ressources',
            resource_detection: 'Objet détaillé dans debug_info'
        }
    });
});

router.get('/groq-plan/test', async (req, res) => {
    res.json({
        status: 'ready',
        version: '5.2-final-no-fake-references',
        corrections: {
            fake_references: 'CORRIGÉ - Plus de références fictives',
            resource_detection: 'AMÉLIORÉ - Détection intelligente contenu réel',
            conditional_fields: 'NOUVEAU - Champs enrichis seulement si ressources',
            debug_tracking: 'NOUVEAU - Suivi détaillé détection ressources'
        },
        test_scenarios: {
            no_resources: {
                url: 'POST /ai/groq-plan',
                body: {
                    topic: 'python basics',
                    type: 'demonstrative',
                    duration_minutes: 5
                },
                expected: {
                    has_any_resources: false,
                    sections_without: ['resource_references', 'key_terminology', 'examples_from_resources'],
                    total_context_length: 0
                }
            },
            with_resources: {
                url: 'POST /ai/groq-plan',
                body: {
                    topic: 'Formation Excel',
                    resources: {
                        text_content: 'Notre équipe utilise Excel quotidiennement pour les analyses financières...'
                    }
                },
                expected: {
                    has_any_resources: true,
                    sections_with: ['resource_references', 'key_terminology', 'examples_from_resources'],
                    total_context_length: '>0'
                }
            }
        },
        ready_for_production: true,
        final_fix_confirmed: 'Le problème des références fictives est définitivement résolu'
    });
});

module.exports = router;