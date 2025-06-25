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

        // ✅ EXACTEMENT comme spécifié : seulement 3 ou 5
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

// Calcul de la répartition temporelle pour capsules vidéo
function calculateTimeDistribution(totalMinutes) {
    const totalSeconds = totalMinutes * 60;

    // Structure fixe : Introduction -> Développement -> Conclusion
    let introSeconds, developmentSeconds, conclusionSeconds;

    if (totalMinutes === 3) {
        // Capsule 3 minutes
        introSeconds = 15;
        conclusionSeconds = 15;
        developmentSeconds = totalSeconds - 30; // 150 secondes
    } else if (totalMinutes === 5) {
        // Capsule 5 minutes
        introSeconds = 20;
        conclusionSeconds = 20;
        developmentSeconds = totalSeconds - 40; // 260 secondes
    }

    // Division du développement si nécessaire
    const developmentSections = [];
    if (developmentSeconds > 180) { // Plus de 3 minutes
        const numSegments = Math.ceil(developmentSeconds / 120); // Max 2 min par segment
        const timePerSegment = Math.floor(developmentSeconds / numSegments);
        const remainder = developmentSeconds % numSegments;

        for (let i = 0; i < numSegments; i++) {
            const segmentTime = timePerSegment + (i < remainder ? 1 : 0);
            developmentSections.push({
                section_number: i + 2,
                duration_seconds: segmentTime,
                is_main_content: true,
                segment_index: i
            });
        }
    } else {
        developmentSections.push({
            section_number: 2,
            duration_seconds: developmentSeconds,
            is_main_content: true,
            segment_index: 0
        });
    }

    return {
        total_seconds: totalSeconds,
        introduction: { section_number: 1, duration_seconds: introSeconds },
        development_sections: developmentSections,
        conclusion: {
            section_number: 1 + developmentSections.length + 1,
            duration_seconds: conclusionSeconds
        },
        total_sections: 2 + developmentSections.length
    };
}

// Fonction pour créer le prompt de génération du plan
function createStyledPrompt({ topic, capsuleType, settings, resources }) {
    const { level, duration, style } = settings;
    const timeDistribution = calculateTimeDistribution(duration);

    // Adaptation du style pédagogique
    const stylePrompts = {
        practical: "Focus sur l'application concrète et immédiate. Privilégier les exemples pratiques et les cas d'usage réels.",
        corporate: "Adopter un ton professionnel et formel. Mettre l'accent sur la productivité et l'efficacité en entreprise.",
        academic: "Approche théorique et structurée. Inclure les concepts fondamentaux et les références.",
        general: "Ton accessible et pédagogique pour le grand public. Vulgariser les concepts complexes."
    };

    const levelDescriptions = {
        beginner: "débutant (aucune expérience préalable)",
        intermediate: "intermédiaire (quelques connaissances de base)",
        advanced: "avancé (expérience confirmée)"
    };

    const typeDescriptions = {
        conceptual: "Capsule vidéo explicative sur des concepts, théories ou soft-skills",
        demonstrative: "Capsule vidéo tutoriel montrant des étapes pratiques et des manipulations"
    };

    const resourcesContext = resources && resources.length > 0
        ? `Ressources disponibles: ${resources.map(r => `${r.name} (${r.type})`).join(', ')}`
        : 'Aucune ressource fournie - génération basée sur le sujet uniquement';

    return `Tu es un expert en création de contenu vidéo éducatif. Tu dois créer UNIQUEMENT le PLAN STRUCTURÉ d'une capsule vidéo (pas le script détaillé).

CONTEXTE DE LA CAPSULE VIDÉO:
- Sujet: ${topic}
- Type: ${typeDescriptions[capsuleType]}
- Niveau: ${levelDescriptions[level]}
- Durée EXACTE: ${duration} minutes (${timeDistribution.total_seconds} secondes)
- Style: ${style} - ${stylePrompts[style]}
- ${resourcesContext}

🎬 STRUCTURE VIDÉO OBLIGATOIRE - ${timeDistribution.total_sections} PARTIES:
1. INTRODUCTION (${timeDistribution.introduction.duration_seconds}s) - Accroche et présentation
${timeDistribution.development_sections.map((dev, index) =>
        `${index + 2}. DÉVELOPPEMENT ${timeDistribution.development_sections.length > 1 ? `PARTIE ${index + 1}` : ''} (${dev.duration_seconds}s) - Contenu principal`
    ).join('\n')}
${timeDistribution.total_sections}. CONCLUSION (${timeDistribution.conclusion.duration_seconds}s) - Récap et action

⏱️ CONTRAINTES TEMPORELLES STRICTES:
- Durée totale EXACTE: ${duration} minutes = ${timeDistribution.total_seconds} secondes
- La somme des durées DOIT égaler ${timeDistribution.total_seconds}s exactement
- Structure fixe: Introduction → Développement → Conclusion

OBJECTIF DU PLAN:
Définir clairement ce qui sera abordé dans chaque partie de la capsule vidéo, les points clés à traiter.
IMPORTANT: Ne pas générer de script détaillé, juste la structure et les points à aborder.

FORMAT JSON STRICT - PLAN VIDÉO SIMPLIFIÉ:
{
  "topic": "${topic}",
  "capsule_type": "${capsuleType}",
  "level": "${level}",
  "duration_minutes": ${duration},
  "style": "${style}",
  "estimated_total_seconds": ${timeDistribution.total_seconds},
  "plan_sections": [
    {
      "section_number": 1,
      "title": "Introduction",
      "type": "introduction",
      "duration_seconds": ${timeDistribution.introduction.duration_seconds},
      "what_to_cover": [
        "Ce qu'il faut dire dans l'intro",
        "Points à aborder pour accrocher"
      ],
      "content_summary": "Résumé de ce qui sera dit dans cette introduction"
    },
    ${timeDistribution.development_sections.map((dev, index) => `{
      "section_number": ${dev.section_number},
      "title": "Développement${timeDistribution.development_sections.length > 1 ? ` - Partie ${index + 1}` : ''}",
      "type": "development",
      "duration_seconds": ${dev.duration_seconds},
      "what_to_cover": [
        "Point principal 1 à expliquer",
        "Point principal 2 à expliquer",
        "Exemple concret à donner"
      ],
      "content_summary": "Résumé du contenu principal de cette partie"
    }`).join(',\n    ')},
    {
      "section_number": ${timeDistribution.conclusion.section_number},
      "title": "Conclusion",
      "type": "conclusion",
      "duration_seconds": ${timeDistribution.conclusion.duration_seconds},
      "what_to_cover": [
        "Récap rapide des points essentiels",
        "Action à faire maintenant"
      ],
      "content_summary": "Ce qui sera dit en conclusion"
    }
  ],
  "video_goal": "Ce que la personne saura/pourra faire après avoir vu la vidéo"
}

ADAPTATION NIVEAU ${level.toUpperCase()}:
${level === 'beginner'
            ? '- Partir des bases absolues\n- Définir tous les termes techniques\n- Multiplier les exemples simples'
            : level === 'intermediate'
                ? '- Supposer des connaissances de base\n- Introduire des concepts plus avancés\n- Faire des liens avec l\'expérience existante'
                : '- Approche experte et concise\n- Concepts avancés et nuances\n- Focus sur l\'optimisation et les bonnes pratiques'
        }

STYLE ${style.toUpperCase()} SPÉCIFIQUE:
${style === 'practical'
            ? 'Plan orienté action. Points concrets et applicables immédiatement.'
            : style === 'corporate'
                ? 'Plan professionnel. Focus sur ROI et efficacité business.'
                : style === 'academic'
                    ? 'Plan structuré avec progression logique et méthodique.'
                    : 'Plan accessible avec vulgarisation et exemples parlants.'
        }

VÉRIFICATION OBLIGATOIRE:
- La somme des duration_seconds DOIT être exactement ${timeDistribution.total_seconds}
- ${timeDistribution.total_sections} sections exactement
- Chaque section doit avoir des points clairs à couvrir
- Focus sur CE QUI SERA DIT, pas sur la théorie pédagogique

Génère le plan JSON simplifié pour cette capsule vidéo:`;
}

// API POST /ai/groq-plan - Génération de plan de capsule vidéo
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

        // Calcul de la répartition temporelle
        const timeDistribution = calculateTimeDistribution(settings.duration);

        // Vérifier cache
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
        if (!planData || !planData.plan_sections) {
            planData = createFallbackPlan({ topic, capsuleType, settings, timeDistribution });
        }

        // Vérification durée totale
        const actualTotal = planData.plan_sections.reduce((sum, s) => sum + s.duration_seconds, 0);
        const expectedTotal = timeDistribution.total_seconds;

        if (Math.abs(actualTotal - expectedTotal) > 5) {
            console.warn(`⚠️ Correction durée: ${actualTotal}s -> ${expectedTotal}s`);
            planData = adjustPlanTimings(planData, expectedTotal);
        }

        const totalTime = Date.now() - startTime;

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
            plan_sections: planData.plan_sections,
            video_goal: planData.video_goal || `Comprendre et appliquer ${topic}`,
            estimated_total_seconds: expectedTotal,
            actual_total_seconds: planData.plan_sections.reduce((sum, s) => sum + s.duration_seconds, 0),
            sections_count: planData.plan_sections.length,
            time_distribution: timeDistribution,
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

        console.log(`✅ Plan Groq v2 généré: ${planData.plan_sections?.length || 0} sections en ${totalTime}ms`);
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

// Fallback plan si parsing JSON échoue
function createFallbackPlan({ topic, capsuleType, settings, timeDistribution }) {
    const { level, duration, style } = settings;

    const planSections = [
        {
            section_number: 1,
            title: "Introduction",
            type: "introduction",
            duration_seconds: timeDistribution.introduction.duration_seconds,
            what_to_cover: [
                `Saluer et présenter le sujet: ${topic}`,
                "Expliquer pourquoi c'est utile",
                "Annoncer ce qu'on va voir"
            ],
            content_summary: `Accroche simple sur ${topic} et annonce du contenu`
        }
    ];

    // Ajouter les sections de développement
    timeDistribution.development_sections.forEach((dev, index) => {
        planSections.push({
            section_number: dev.section_number,
            title: timeDistribution.development_sections.length > 1
                ? `Développement - Partie ${index + 1}`
                : "Développement",
            type: "development",
            duration_seconds: dev.duration_seconds,
            what_to_cover: [
                "Point principal à expliquer",
                "Exemple concret à montrer",
                "Astuce ou conseil pratique"
            ],
            content_summary: `Explication claire et simple de ${topic}`
        });
    });

    // Ajouter la conclusion
    planSections.push({
        section_number: timeDistribution.conclusion.section_number,
        title: "Conclusion",
        type: "conclusion",
        duration_seconds: timeDistribution.conclusion.duration_seconds,
        what_to_cover: [
            `Récap rapide de ${topic}`,
            "Encourager à mettre en pratique",
            "Remercier et dire au revoir"
        ],
        content_summary: "Résumé rapide et motivation"
    });

    return {
        topic,
        capsule_type: capsuleType,
        level,
        duration_minutes: duration,
        style,
        estimated_total_seconds: timeDistribution.total_seconds,
        plan_sections: planSections,
        video_goal: `Savoir appliquer ${topic} dans son quotidien`
    };
}

// Fonction pour ajuster les timings si nécessaire
function adjustPlanTimings(planData, expectedTotalSeconds) {
    const sections = planData.plan_sections;
    const actualTotal = sections.reduce((sum, s) => sum + s.duration_seconds, 0);
    const ratio = expectedTotalSeconds / actualTotal;

    // Ajuster proportionnellement
    sections.forEach(section => {
        section.duration_seconds = Math.round(section.duration_seconds * ratio);
    });

    // Corriger les arrondis pour que le total soit exact
    const newTotal = sections.reduce((sum, s) => sum + s.duration_seconds, 0);
    const difference = expectedTotalSeconds - newTotal;

    if (difference !== 0) {
        // Ajouter/retirer la différence sur la section de développement la plus longue
        const longestDevSection = sections
            .filter(s => s.type === 'development')
            .sort((a, b) => b.duration_seconds - a.duration_seconds)[0];

        if (longestDevSection) {
            longestDevSection.duration_seconds += difference;
        }
    }

    return planData;
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
        durations: [3, 5], // ✅ EXACTEMENT comme spécifié
        capsule_types: ["conceptual", "demonstrative"],
        structure: "Fixe: Introduction -> Développement -> Conclusion",
        output: "PLAN UNIQUEMENT (pas de script détaillé)"
    });
});

module.exports = router;