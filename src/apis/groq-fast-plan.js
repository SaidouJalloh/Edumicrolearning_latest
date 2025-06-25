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












// meme code mais avec script de narration par slide et ressource externe
// groq-fast-plan.js - Version Enhanced avec Ressources Documentaires

// groq-fast-plan.js - UN SEUL ENDPOINT POUR TOUT (JSON + Upload)
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
        const allowedTypes = ['.pdf', '.txt', '.docx', '.md', '.csv'];
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, allowedTypes.includes(ext));
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 5 // Maximum 5 fichiers
    }
});

// Créer le dossier temp-uploads s'il n'existe pas
const tempDir = path.join(__dirname, '..', '..', 'temp-uploads');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('📁 Dossier temp-uploads créé');
}

// 🎯 UN SEUL ENDPOINT POUR TOUT (JSON + Upload)
router.post('/groq-plan', upload.array('files', 5), async (req, res) => {
    const startTime = Date.now();

    try {
        // 🔍 DÉTECTION AUTOMATIQUE DU FORMAT
        const isFormData = req.is('multipart/form-data');
        const isJSON = req.is('application/json');

        console.log(`🎯 Endpoint unique - Format détecté: ${isFormData ? 'Form-Data (avec fichiers)' : 'JSON'}`);

        let topic, capsuleType, settings, resources, reference_materials, company_context, specific_requirements;

        if (isFormData) {
            // 📁 FORMAT FORM-DATA (avec fichiers)
            topic = req.body.topic;
            capsuleType = req.body.capsuleType || 'demonstrative';

            // Parse settings JSON si fourni
            try {
                settings = req.body.settings ? JSON.parse(req.body.settings) : {};
            } catch (e) {
                settings = {};
                console.warn('⚠️ Settings JSON invalides, utilisation par défaut');
            }

            // Parse resources JSON si fourni
            try {
                resources = req.body.resources ? JSON.parse(req.body.resources) : {};
            } catch (e) {
                resources = {};
                console.warn('⚠️ Ressources JSON invalides, ignorées');
            }

            // Parse reference_materials JSON si fourni
            try {
                reference_materials = req.body.reference_materials ? JSON.parse(req.body.reference_materials) : [];
            } catch (e) {
                reference_materials = [];
            }

            company_context = req.body.company_context || null;
            specific_requirements = req.body.specific_requirements || null;

        } else {
            // 📝 FORMAT JSON (sans fichiers)
            topic = req.body.topic;
            capsuleType = req.body.capsuleType || 'demonstrative';
            settings = req.body.settings || {};
            resources = req.body.resources || {};
            reference_materials = req.body.reference_materials || [];
            company_context = req.body.company_context || null;
            specific_requirements = req.body.specific_requirements || null;
        }

        // Validation de base
        if (!topic || topic.length < 5) {
            // Nettoyer les fichiers uploadés si présents
            cleanupUploadedFiles(req.files);
            return res.status(400).json({
                error: 'Topic requis (minimum 5 caractères)',
                format_detected: isFormData ? 'form-data' : 'json',
                files_uploaded: req.files?.length || 0,
                example: 'Les 3 erreurs Excel à éviter'
            });
        }

        // Settings par défaut
        const finalSettings = {
            level: 'beginner',
            duration: 5,
            style: 'practical',
            ...settings
        };

        console.log(`⚡ Génération Groq v3 UNIFIED: "${topic.substring(0, 50)}..." (${capsuleType}, ${finalSettings.level}, ${isFormData ? 'avec fichiers' : 'JSON'})`);

        // 📄 TRAITEMENT DES FICHIERS SI PRÉSENTS
        let filesContent = '';
        const processedFiles = [];

        if (req.files && req.files.length > 0) {
            console.log(`📁 Traitement de ${req.files.length} fichiers uploadés...`);

            for (const file of req.files) {
                try {
                    const content = await parseUploadedFile(file);
                    filesContent += `\n\n=== CONTENU DE ${file.originalname} ===\n${content}\n`;
                    processedFiles.push({
                        name: file.originalname,
                        size: file.size,
                        type: path.extname(file.originalname),
                        content_length: content.length,
                        status: 'parsed'
                    });
                } catch (error) {
                    console.error(`❌ Erreur parsing ${file.originalname}:`, error.message);
                    processedFiles.push({
                        name: file.originalname,
                        status: 'error',
                        error: error.message
                    });
                }
            }
        }

        // 🔗 COMBINAISON DE TOUTES LES RESSOURCES
        const combinedResources = {
            ...resources,
            files_content: filesContent // Ajout du contenu des fichiers
        };

        // 🔍 ANALYSE DES RESSOURCES COMPLÈTES
        let resourcesContext = '';
        let hasResources = false;

        if (combinedResources && Object.keys(combinedResources).length > 0) {
            hasResources = true;
            resourcesContext = await processResourcesContext(combinedResources);
            console.log(`📚 Contexte total: ${resourcesContext.length} caractères (fichiers: ${filesContent.length})`);
        }

        if (reference_materials && reference_materials.length > 0) {
            hasResources = true;
            const materialsContext = processMaterialsContext(reference_materials);
            resourcesContext += '\n\n' + materialsContext;
            console.log(`📖 Matériaux de référence: ${reference_materials.length} éléments`);
        }

        // Cache key avec contexte complet
        const cacheKey = generateCacheKey(topic, capsuleType, finalSettings, resourcesContext);

        // Vérification cache
        if (planCache.has(cacheKey)) {
            const cached = planCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                // Nettoyer les fichiers même pour le cache
                cleanupUploadedFiles(req.files);

                console.log('💾 Plan récupéré du cache');
                return res.json({
                    ...cached.data,
                    generated_at: cached.timestamp,
                    from_cache: true,
                    format_used: isFormData ? 'form-data' : 'json',
                    files_processed: processedFiles.length,
                    cache_hit: true
                });
            } else {
                planCache.delete(cacheKey);
            }
        }

        // 🎯 CRÉATION DU PROMPT ENRICHI
        const enhancedPrompt = createEnhancedPrompt(
            topic,
            capsuleType,
            finalSettings,
            resourcesContext,
            company_context,
            specific_requirements
        );

        // Génération avec Groq
        const groqResponse = await callGroqAPI(enhancedPrompt);

        // Parsing et validation
        let planData;
        try {
            const cleanedResponse = cleanGroqResponse(groqResponse);
            planData = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('❌ Erreur parsing JSON Groq:', parseError.message);
            planData = createFallbackPlan(topic, finalSettings);
        }

        // Enrichissement du plan
        const enrichedPlan = enrichPlanWithResources(planData, combinedResources, reference_materials, hasResources);

        // Nettoyage des fichiers temporaires
        cleanupUploadedFiles(req.files);

        // Finalisation
        const planId = uuidv4();
        const totalTime = Date.now() - startTime;

        const result = {
            plan_id: planId,
            topic: topic,
            capsule_type: capsuleType,
            settings: finalSettings,

            // 🎯 MÉTADONNÉES UNIFIED
            input_format: {
                detected: isFormData ? 'multipart/form-data' : 'application/json',
                has_file_uploads: req.files?.length > 0,
                files_count: req.files?.length || 0
            },

            // 📁 INFO FICHIERS (si présents)
            ...(req.files?.length > 0 && {
                files_info: {
                    uploaded_count: req.files.length,
                    processed_successfully: processedFiles.filter(f => f.status === 'parsed').length,
                    failed_count: processedFiles.filter(f => f.status === 'error').length,
                    total_content_length: filesContent.length,
                    processed_files: processedFiles
                }
            }),

            // 📚 INFO RESSOURCES
            resources_info: {
                has_resources: hasResources,
                has_files: filesContent.length > 0,
                has_text_resources: !!(combinedResources.text_content && combinedResources.text_content !== filesContent),
                resources_types: Object.keys(combinedResources).filter(k => k !== 'files_content'),
                reference_materials_count: reference_materials?.length || 0,
                context_length: resourcesContext.length,
                company_context: !!company_context,
                specific_requirements: !!specific_requirements
            },

            // Plan généré
            plan_sections: enrichedPlan.plan_sections,

            // Métadonnées
            generation_stats: {
                total_time_ms: totalTime,
                groq_model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
                with_resources: hasResources,
                with_file_uploads: req.files?.length > 0,
                prompt_length: enhancedPrompt.length,
                response_quality: 'enhanced_unified_endpoint'
            },

            generated_at: new Date().toISOString(),
            status: 'completed',
            cache_stored: true,
            ready_for_slides: true,

            // 🎯 WORKFLOW SUGGESTIONS
            next_steps: {
                primary: 'POST /ai/plan-to-markdown avec ce plan complet',
                alternative: 'POST /ai/generate-slides pour créer directement les slides',
                with_audio: 'Puis POST /ai/generate-narration-bark pour l\'audio'
            }
        };

        // Sauvegarde cache
        planCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        console.log(`✅ Plan UNIFIED généré: ${enrichedPlan.plan_sections.length} sections, ${processedFiles.filter(f => f.status === 'parsed').length}/${req.files?.length || 0} fichiers, ${totalTime}ms`);
        res.json(result);

    } catch (error) {
        // Nettoyer les fichiers en cas d'erreur
        cleanupUploadedFiles(req.files);

        const totalTime = Date.now() - startTime;
        console.error('❌ Erreur génération plan UNIFIED:', error);

        res.status(500).json({
            error: 'Erreur génération plan',
            details: error.message,
            processing_time_ms: totalTime,
            troubleshooting: {
                check_groq_api: 'Vérifiez la clé API Groq',
                check_format: 'Vérifiez le format JSON ou form-data',
                check_files: 'Vérifiez les fichiers uploadés si présents',
                retry: 'Réessayez sans fichiers si problème persiste'
            }
        });
    }
});

// 🔧 FONCTION PARSING FICHIERS
async function parseUploadedFile(file) {
    const ext = path.extname(file.originalname).toLowerCase();

    try {
        switch (ext) {
            case '.txt':
            case '.md':
                return fs.readFileSync(file.path, 'utf8');

            case '.csv':
                const csvContent = fs.readFileSync(file.path, 'utf8');
                return `Données CSV:\n${csvContent}`;

            case '.pdf':
                // Pour activer PDF : npm install pdf-parse
                // const pdf = require('pdf-parse');
                // const pdfBuffer = fs.readFileSync(file.path);
                // const pdfData = await pdf(pdfBuffer);
                // return pdfData.text;
                throw new Error('Support PDF nécessite: npm install pdf-parse');

            case '.docx':
                // Pour activer DOCX : npm install mammoth
                // const mammoth = require('mammoth');
                // const docxBuffer = fs.readFileSync(file.path);
                // const result = await mammoth.extractRawText({ buffer: docxBuffer });
                // return result.value;
                throw new Error('Support DOCX nécessite: npm install mammoth');

            default:
                throw new Error(`Type de fichier non supporté: ${ext}`);
        }
    } catch (error) {
        throw new Error(`Erreur parsing ${file.originalname}: ${error.message}`);
    }
}

// 🔧 NETTOYAGE FICHIERS TEMPORAIRES
function cleanupUploadedFiles(files) {
    if (files && files.length > 0) {
        files.forEach(file => {
            try {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            } catch (error) {
                console.warn(`⚠️ Impossible de supprimer ${file.path}:`, error.message);
            }
        });
    }
}

// 🔧 TRAITEMENT DES RESSOURCES
async function processResourcesContext(resources) {
    let context = '';

    try {
        // Contenu des fichiers uploadés
        if (resources.files_content && resources.files_content.trim()) {
            context += `CONTENU DES FICHIERS FOURNIS:\n${resources.files_content}\n\n`;
        }

        // Texte direct
        if (resources.text_content && resources.text_content !== resources.files_content) {
            context += `CONTENU SPÉCIFIQUE ADDITIONNEL:\n${resources.text_content}\n\n`;
        }

        // URLs
        if (resources.urls && resources.urls.length > 0) {
            context += `RESSOURCES WEB MENTIONNÉES:\n`;
            resources.urls.forEach(url => context += `- ${url}\n`);
            context += '\n';
        }

        // Documents référencés
        if (resources.documents && resources.documents.length > 0) {
            context += `DOCUMENTS DE RÉFÉRENCE:\n`;
            resources.documents.forEach(doc => context += `- ${doc}\n`);
            context += '\n';
        }

        // Mots-clés
        if (resources.keywords && resources.keywords.length > 0) {
            context += `MOTS-CLÉS IMPORTANTS: ${resources.keywords.join(', ')}\n\n`;
        }

        // Procédures
        if (resources.procedures) {
            context += `PROCÉDURES SPÉCIFIQUES:\n${resources.procedures}\n\n`;
        }

    } catch (error) {
        console.error('❌ Erreur traitement ressources:', error.message);
        context = 'ERREUR TRAITEMENT RESSOURCES\n';
    }

    return context;
}

// 🔧 TRAITEMENT MATÉRIAUX DE RÉFÉRENCE
function processMaterialsContext(materials) {
    let context = 'MATÉRIAUX DE RÉFÉRENCE:\n';

    materials.forEach((material, index) => {
        context += `${index + 1}. `;
        if (material.title) context += `Titre: ${material.title}\n`;
        if (material.type) context += `   Type: ${material.type}\n`;
        if (material.content) context += `   Contenu: ${material.content}\n`;
        if (material.source) context += `   Source: ${material.source}\n`;
        context += '\n';
    });

    return context;
}

// 🎯 CRÉATION DU PROMPT ENRICHI
function createEnhancedPrompt(topic, capsuleType, settings, resourcesContext, companyContext, specificRequirements) {
    const { level, duration, style } = settings;

    let prompt = `Tu es un expert en pédagogie et conception de formations. Crée un plan de formation détaillé et structuré.

INFORMATIONS DE BASE:
- Sujet: ${topic}
- Type: ${capsuleType}
- Niveau: ${level}
- Durée: ${duration} minutes
- Style: ${style}`;

    // Ajout du contexte ressources
    if (resourcesContext && resourcesContext.length > 0) {
        prompt += `

RESSOURCES ET CONTEXTE SPÉCIFIQUES À UTILISER:
${resourcesContext}

INSTRUCTIONS IMPORTANTES:
- Utilise OBLIGATOIREMENT le contenu et les informations des ressources fournies
- Adapte le vocabulaire et les exemples au contexte donné
- Intègre les procédures et méthodes mentionnées dans les ressources
- Respecte la terminologie spécifique fournie`;
    }

    // Contexte entreprise
    if (companyContext) {
        prompt += `

CONTEXTE ENTREPRISE:
${companyContext}`;
    }

    // Exigences spécifiques
    if (specificRequirements) {
        prompt += `

EXIGENCES SPÉCIFIQUES:
${specificRequirements}`;
    }

    prompt += `

GÉNÈRE un plan JSON avec cette structure EXACTE:

{
  "plan_sections": [
    {
      "section_number": 1,
      "title": "Introduction",
      "type": "introduction",
      "duration_seconds": 30,
      "what_to_cover": [
        "Point d'accroche basé sur les ressources fournies",
        "Objectifs alignés avec le contexte spécifique"
      ],
      "content_summary": "Résumé intégrant les éléments des ressources"
    }
  ]
}

RÈGLES STRICTES:
- ${duration} minutes maximum (${duration * 60} secondes total)
- Sections équilibrées en durée
- Intégration OBLIGATOIRE des ressources dans le contenu
- Vocabulaire et exemples adaptés au contexte fourni
- JSON valide uniquement, pas de texte avant/après`;

    return prompt;
}

// 🔧 ENRICHISSEMENT DU PLAN
function enrichPlanWithResources(planData, resources, materials, hasResources) {
    if (!hasResources || !planData.plan_sections) {
        return planData;
    }

    planData.plan_sections = planData.plan_sections.map(section => ({
        ...section,
        enhanced_with_resources: hasResources,
        resource_integration: {
            uses_company_content: !!(resources.text_content || resources.files_content),
            uses_uploaded_files: !!resources.files_content,
            references_documents: !!(resources.documents?.length),
            includes_procedures: !!resources.procedures,
            follows_company_style: true
        }
    }));

    return planData;
}

// 🔧 APPEL API GROQ
async function callGroqAPI(prompt) {
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'Tu es un expert en conception pédagogique. Tu intègres parfaitement les ressources fournies dans tes plans de formation. Réponds UNIQUEMENT en JSON valide.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 4000
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('❌ Erreur API Groq:', error.message);
        throw error;
    }
}

// 🔧 NETTOYAGE RÉPONSE GROQ
function cleanGroqResponse(response) {
    return response
        .replace(/```json\n/g, '')
        .replace(/\n```/g, '')
        .replace(/```/g, '')
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '')
        .trim();
}

// 🔧 PLAN FALLBACK
function createFallbackPlan(topic, settings) {
    const { duration } = settings;
    const totalSeconds = duration * 60;

    return {
        plan_sections: [
            {
                section_number: 1,
                title: "Introduction",
                type: "introduction",
                duration_seconds: Math.round(totalSeconds * 0.15),
                what_to_cover: [
                    `Présentation du sujet: ${topic}`,
                    "Objectifs de cette formation"
                ],
                content_summary: `Introduction à ${topic}`
            },
            {
                section_number: 2,
                title: "Développement principal",
                type: "development",
                duration_seconds: Math.round(totalSeconds * 0.70),
                what_to_cover: [
                    "Points clés du sujet",
                    "Exemples pratiques",
                    "Méthodes recommandées"
                ],
                content_summary: `Contenu principal sur ${topic}`
            },
            {
                section_number: 3,
                title: "Conclusion",
                type: "conclusion",
                duration_seconds: Math.round(totalSeconds * 0.15),
                what_to_cover: [
                    "Récapitulatif des points essentiels",
                    "Prochaines étapes recommandées"
                ],
                content_summary: `Synthèse et conclusion de ${topic}`
            }
        ]
    };
}

// 🔧 GÉNÉRATION CLÉ CACHE
function generateCacheKey(topic, capsuleType, settings, resourcesContext) {
    const baseKey = `${topic}_${capsuleType}_${settings.level}_${settings.duration}_${settings.style}`;
    const resourcesHash = resourcesContext ?
        crypto.createHash('md5').update(resourcesContext).digest('hex').substring(0, 8) :
        'no_resources';
    return `${baseKey}_${resourcesHash}`;
}

// 🔧 INFO ENDPOINT
router.get('/groq-plan/info', (req, res) => {
    res.json({
        endpoint: 'POST /ai/groq-plan',
        description: '🎯 ENDPOINT UNIQUE - Gère JSON ET upload de fichiers automatiquement',
        version: '4.0 - Unified Endpoint',

        auto_detection: {
            'Content-Type: application/json': 'Format JSON classique avec ressources textuelles',
            'Content-Type: multipart/form-data': 'Upload de fichiers + données JSON dans form-data'
        },

        usage_json: {
            content_type: 'application/json',
            example: {
                topic: 'Formation Excel',
                resources: {
                    text_content: 'Notre entreprise...',
                    keywords: ['Excel', 'TCD']
                }
            }
        },

        usage_files: {
            content_type: 'multipart/form-data',
            form_fields: {
                topic: 'Formation Excel avec nos docs',
                settings: '{"level":"intermediate","duration":10}',
                resources: '{"keywords":["Excel","formation"]}',
                files: ['guide.txt', 'procedures.csv']
            }
        },

        supported_files: {
            ready_now: ['.txt', '.md', '.csv'],
            requires_install: ['.pdf (npm install pdf-parse)', '.docx (npm install mammoth)']
        },

        benefits: [
            '🎯 UN SEUL endpoint pour tout',
            '🔄 Détection automatique JSON/Files',
            '📁 Upload direct de fichiers',
            '📚 Ressources textuelles ET fichiers',
            '💾 Cache intelligent unifié',
            '🔒 Nettoyage auto fichiers temporaires',
            '✅ 100% backward compatible'
        ],

        examples: {
            postman_json: {
                method: 'POST',
                url: '/ai/groq-plan',
                headers: { 'Content-Type': 'application/json' },
                body: '{"topic":"Test JSON","resources":{"text_content":"..."}}'
            },
            postman_files: {
                method: 'POST',
                url: '/ai/groq-plan',
                type: 'form-data',
                fields: {
                    topic: 'Test Files',
                    files: 'Select files...'
                }
            }
        }
    });
});

module.exports = router;