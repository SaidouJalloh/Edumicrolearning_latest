// // src/apis/generate-demo-steps.js
// const express = require('express');
// const { v4: uuidv4 } = require('uuid');
// const LLMFactory = require('../utils/llm-factory');

// const router = express.Router();
// const llmFactory = new LLMFactory();

// // Cache spécialisé pour les démonstrations
// const demoCache = new Map();

// // Base de connaissances logiciels
// const SOFTWARE_KNOWLEDGE = {
//     excel: {
//         name: "Microsoft Excel",
//         version: "365/2021",
//         interface_elements: [
//             "Onglet Insertion", "Onglet Données", "Onglet Accueil",
//             "Barre de formules", "Zone de nom", "Ruban",
//             "Tableau croisé dynamique", "Graphiques", "Filtres"
//         ],
//         common_tasks: [
//             "Créer tableau croisé dynamique", "Filtres avancés",
//             "Formules RECHERCHEV", "Mise en forme conditionnelle",
//             "Graphiques dynamiques", "Macros VBA"
//         ]
//     },
//     powerbi: {
//         name: "Microsoft Power BI",
//         version: "Desktop/Service",
//         interface_elements: [
//             "Volet Champs", "Volet Visualisations", "Volet Filtres",
//             "Canevas de rapport", "Modèle de données", "Requêtes"
//         ],
//         common_tasks: [
//             "Connecter sources données", "Créer visualisations",
//             "Relations entre tables", "Mesures DAX", "Tableaux de bord"
//         ]
//     },
//     sap: {
//         name: "SAP ERP",
//         version: "S/4HANA",
//         interface_elements: [
//             "Transaction codes", "Menu SAP", "Écrans de saisie",
//             "Tables SAP", "Variantes", "Favoris"
//         ],
//         common_tasks: [
//             "Navigation transactions", "Recherche données",
//             "Création commandes", "Reports standards", "Personnalisation écrans"
//         ]
//     },
//     teams: {
//         name: "Microsoft Teams",
//         version: "Desktop/Web",
//         interface_elements: [
//             "Équipes", "Canaux", "Chat", "Calendrier",
//             "Fichiers", "Applications", "Paramètres"
//         ],
//         common_tasks: [
//             "Créer équipe", "Organiser réunion", "Partage écran",
//             "Collaboration fichiers", "Intégrations applications"
//         ]
//     }
// };

// // Fonction pour créer des prompts spécialisés par logiciel
// function createDemoStepsPrompt({ software, task, user_level, plan_outline }) {
//     const softwareInfo = SOFTWARE_KNOWLEDGE[software.toLowerCase()] || {
//         name: software,
//         interface_elements: ["Interface principale", "Menus", "Boutons"],
//         common_tasks: ["Tâches de base"]
//     };

//     return `Tu es un expert formateur en ${softwareInfo.name}. Génère des étapes de démonstration TRÈS PRÉCISES pour la tâche "${task}".

// CONTEXTE LOGICIEL:
// - Logiciel: ${softwareInfo.name} ${softwareInfo.version || ''}
// - Tâche: ${task}
// - Niveau utilisateur: ${user_level}
// - Plan pédagogique: ${plan_outline ? JSON.stringify(plan_outline, null, 2) : 'Non fourni'}

// ÉLÉMENTS INTERFACE DISPONIBLES:
// ${softwareInfo.interface_elements.map(el => `- ${el}`).join('\n')}

// INSTRUCTIONS CRITIQUES:
// - Chaque étape doit être ACTIONNABLE: "Cliquez sur...", "Sélectionnez...", "Tapez..."
// - Indiquer l'EMPLACEMENT EXACT: "Dans l'onglet X", "En haut à droite", "Dans le volet Y"
// - Prévoir les POINTS D'ATTENTION: "Attention: si le bouton n'apparaît pas..."
// - Numéroter clairement chaque action
// - Durée estimée par étape
// - Screenshots/zones à mettre en évidence

// FORMAT RÉPONSE JSON:
// {
//   "software": "${software}",
//   "task": "${task}",
//   "estimated_duration_minutes": 5,
//   "difficulty_level": "${user_level}",
//   "prerequisites": ["Pré-requis 1", "Pré-requis 2"],
//   "steps": [
//     {
//       "step_number": 1,
//       "title": "Titre de l'étape",
//       "instruction": "Action précise à effectuer",
//       "location": "Où faire l'action dans l'interface",
//       "expected_result": "Ce qui doit apparaître/se passer",
//       "duration_seconds": 30,
//       "screenshot_zone": "Zone à capturer pour la démo",
//       "common_errors": ["Erreur possible 1", "Erreur possible 2"],
//       "tips": ["Astuce 1", "Astuce 2"]
//     }
//   ],
//   "validation_checkpoints": [
//     {
//       "checkpoint": "Point de validation",
//       "how_to_verify": "Comment vérifier que c'est correct"
//     }
//   ],
//   "troubleshooting": [
//     {
//       "problem": "Problème courant",
//       "solution": "Solution détaillée"
//     }
//   ]
// }

// Génère des étapes ULTRA-DÉTAILLÉES pour ${user_level} level:`;
// }

// // API POST /ai/generate-demo-steps
// router.post('/generate-demo-steps', async (req, res) => {
//     const startTime = Date.now();

//     try {
//         const {
//             plan_id,
//             software,
//             task,
//             user_level = 'beginner',
//             plan_outline
//         } = req.body;

//         // Validation
//         if (!software || !task) {
//             return res.status(400).json({
//                 error: 'Paramètres manquants: software et task requis',
//                 example: {
//                     software: 'excel',
//                     task: 'Créer un tableau croisé dynamique',
//                     user_level: 'beginner'
//                 }
//             });
//         }

//         // Vérifier cache
//         const cacheKey = `demo-${software}-${task}-${user_level}`;
//         if (demoCache.has(cacheKey)) {
//             console.log(`💨 Étapes démo récupérées du cache: ${software} - ${task}`);
//             const cached = demoCache.get(cacheKey);
//             cached.cached = true;
//             cached.generation_time_ms = 0;
//             return res.json(cached);
//         }

//         console.log(`🎬 Génération étapes démo: ${software} - ${task} (${user_level})`);

//         const demoId = plan_id || uuidv4();
//         const prompt = createDemoStepsPrompt({ software, task, user_level, plan_outline });

//         // Génération avec Groq/Llama
//         const generation = await llmFactory.generateText(prompt, {
//             temperature: 0.4, // Plus bas pour précision technique
//             max_tokens: 2000
//         });

//         // Parse JSON
//         let demoSteps;
//         try {
//             const jsonMatch = generation.text.match(/\{[\s\S]*\}/);
//             demoSteps = jsonMatch ? JSON.parse(jsonMatch[0]) : createFallbackSteps(software, task, user_level);
//         } catch (e) {
//             console.warn('Erreur parsing JSON, utilisation fallback');
//             demoSteps = createFallbackSteps(software, task, user_level);
//         }

//         const totalTime = Date.now() - startTime;

//         const result = {
//             demo_id: demoId,
//             software: software.toLowerCase(),
//             task,
//             user_level,
//             steps_count: demoSteps.steps?.length || 0,
//             estimated_duration: demoSteps.estimated_duration_minutes || 5,
//             steps: demoSteps.steps || [],
//             prerequisites: demoSteps.prerequisites || [],
//             validation_checkpoints: demoSteps.validation_checkpoints || [],
//             troubleshooting: demoSteps.troubleshooting || [],
//             generation_time_ms: totalTime,
//             llm_generation_time_ms: generation.duration_ms,
//             provider: generation.provider,
//             cached: false,
//             generated_at: new Date().toISOString(),
//             status: 'completed'
//         };

//         // Cache 2 heures (contenu plus stable)
//         demoCache.set(cacheKey, { ...result });
//         setTimeout(() => demoCache.delete(cacheKey), 7200000);

//         console.log(`✅ Étapes démo générées: ${demoSteps.steps?.length || 0} steps en ${totalTime}ms`);
//         res.json(result);

//     } catch (error) {
//         const totalTime = Date.now() - startTime;
//         console.error(`❌ Erreur génération démo après ${totalTime}ms:`, error);
//         res.status(500).json({
//             error: 'Erreur génération étapes démonstration',
//             generation_time_ms: totalTime,
//             details: error.message
//         });
//     }
// });

// // Fonction fallback si parsing JSON échoue
// function createFallbackSteps(software, task, user_level) {
//     return {
//         software,
//         task,
//         estimated_duration_minutes: 5,
//         difficulty_level: user_level,
//         prerequisites: [`Avoir ${software} installé`, "Connaissances de base informatique"],
//         steps: [
//             {
//                 step_number: 1,
//                 title: "Démarrage de l'application",
//                 instruction: `Ouvrir ${software}`,
//                 location: "Bureau ou menu Démarrer",
//                 expected_result: `Interface ${software} s'affiche`,
//                 duration_seconds: 30,
//                 screenshot_zone: "Écran principal",
//                 common_errors: ["Application ne se lance pas"],
//                 tips: ["Vérifier que l'application est installée"]
//             },
//             {
//                 step_number: 2,
//                 title: "Navigation vers la fonctionnalité",
//                 instruction: `Accéder à la fonctionnalité pour ${task}`,
//                 location: "Menu principal",
//                 expected_result: "Fonctionnalité accessible",
//                 duration_seconds: 60,
//                 screenshot_zone: "Zone navigation",
//                 common_errors: ["Option non trouvée"],
//                 tips: ["Utiliser la recherche si disponible"]
//             },
//             {
//                 step_number: 3,
//                 title: "Exécution de la tâche",
//                 instruction: `Réaliser ${task}`,
//                 location: "Interface de travail",
//                 expected_result: "Tâche accomplie",
//                 duration_seconds: 180,
//                 screenshot_zone: "Zone de travail",
//                 common_errors: ["Erreur d'exécution"],
//                 tips: ["Suivre les indications à l'écran"]
//             }
//         ],
//         validation_checkpoints: [
//             {
//                 checkpoint: "Vérification du résultat final",
//                 how_to_verify: "Contrôler que la tâche est bien accomplie"
//             }
//         ],
//         troubleshooting: [
//             {
//                 problem: "Fonctionnalité non disponible",
//                 solution: "Vérifier la version du logiciel et les permissions"
//             }
//         ]
//     };
// }

// // API GET /ai/demo-steps/:id - Récupérer des étapes existantes
// router.get('/demo-steps/:id', (req, res) => {
//     // TODO: Implémenter récupération depuis base de données
//     res.json({
//         message: 'Récupération étapes démo - À implémenter avec base de données',
//         demo_id: req.params.id
//     });
// });

// // API GET /ai/software-catalog - Liste des logiciels supportés
// router.get('/software-catalog', (req, res) => {
//     const catalog = Object.keys(SOFTWARE_KNOWLEDGE).map(key => ({
//         software_id: key,
//         name: SOFTWARE_KNOWLEDGE[key].name,
//         version: SOFTWARE_KNOWLEDGE[key].version,
//         supported_tasks: SOFTWARE_KNOWLEDGE[key].common_tasks,
//         interface_elements_count: SOFTWARE_KNOWLEDGE[key].interface_elements.length
//     }));

//     res.json({
//         supported_software: catalog,
//         total_count: catalog.length,
//         last_updated: new Date().toISOString()
//     });
// });

// module.exports = router;







// src/apis/generate-demo-steps.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const LLMFactory = require('../utils/llm-factory');

const router = express.Router();
const llmFactory = new LLMFactory();

// Cache spécialisé pour les démonstrations
const demoCache = new Map();

// Base de connaissances logiciels
const SOFTWARE_KNOWLEDGE = {
    excel: {
        name: "Microsoft Excel",
        version: "365/2021",
        interface_elements: [
            "Onglet Insertion", "Onglet Données", "Onglet Accueil",
            "Barre de formules", "Zone de nom", "Ruban",
            "Tableau croisé dynamique", "Graphiques", "Filtres"
        ],
        common_tasks: [
            "Créer tableau croisé dynamique", "Filtres avancés",
            "Formules RECHERCHEV", "Mise en forme conditionnelle",
            "Graphiques dynamiques", "Macros VBA"
        ]
    },
    powerbi: {
        name: "Microsoft Power BI",
        version: "Desktop/Service",
        interface_elements: [
            "Volet Champs", "Volet Visualisations", "Volet Filtres",
            "Canevas de rapport", "Modèle de données", "Requêtes"
        ],
        common_tasks: [
            "Connecter sources données", "Créer visualisations",
            "Relations entre tables", "Mesures DAX", "Tableaux de bord"
        ]
    },
    sap: {
        name: "SAP ERP",
        version: "S/4HANA",
        interface_elements: [
            "Transaction codes", "Menu SAP", "Écrans de saisie",
            "Tables SAP", "Variantes", "Favoris"
        ],
        common_tasks: [
            "Navigation transactions", "Recherche données",
            "Création commandes", "Reports standards", "Personnalisation écrans"
        ]
    },
    teams: {
        name: "Microsoft Teams",
        version: "Desktop/Web",
        interface_elements: [
            "Équipes", "Canaux", "Chat", "Calendrier",
            "Fichiers", "Applications", "Paramètres"
        ],
        common_tasks: [
            "Créer équipe", "Organiser réunion", "Partage écran",
            "Collaboration fichiers", "Intégrations applications"
        ]
    }
};

// Fonction pour créer des prompts spécialisés par logiciel
function createDemoStepsPrompt({ software, task, user_level, plan_outline }) {
    const softwareInfo = SOFTWARE_KNOWLEDGE[software.toLowerCase()] || {
        name: software,
        interface_elements: ["Interface principale", "Menus", "Boutons"],
        common_tasks: ["Tâches de base"]
    };

    return `Tu es un expert formateur ${softwareInfo.name}. Crée un guide step-by-step ULTRA-PRÉCIS pour "${task}".

CONTEXTE:
- Logiciel: ${softwareInfo.name}
- Tâche: ${task} 
- Niveau: ${user_level}

EXEMPLE EXCEL TCD:
1. Sélectionner données (A1:E10)
2. Onglet Insertion → Tableau croisé dynamique
3. Glisser champs vers zones
4. Configurer valeurs

RÉPONSE JSON OBLIGATOIRE:
{
  "software": "${software}",
  "task": "${task}",
  "estimated_duration_minutes": 5,
  "difficulty_level": "${user_level}",
  "prerequisites": ["Excel installé", "Données préparées"],
  "steps": [
    {
      "step_number": 1,
      "title": "Sélectionner les données source",
      "instruction": "Cliquez sur cellule A1 puis Ctrl+Shift+Fin pour sélectionner toutes les données",
      "location": "Feuille de calcul Excel",
      "expected_result": "Plage de données mise en surbrillance bleue",
      "duration_seconds": 30,
      "screenshot_zone": "Zone données sélectionnées",
      "common_errors": ["Sélection incomplète"],
      "tips": ["Vérifier pas de cellules vides"]
    }
  ],
  "validation_checkpoints": [
    {
      "checkpoint": "TCD créé avec champs",
      "how_to_verify": "Voir tableau avec lignes/colonnes/valeurs"
    }
  ],
  "troubleshooting": [
    {
      "problem": "Bouton TCD grisé",
      "solution": "Sélectionner d'abord une plage de données"
    }
  ]
}

RÉPONSE JSON SEULEMENT:`;
}

// API POST /ai/generate-demo-steps
router.post('/generate-demo-steps', async (req, res) => {
    const startTime = Date.now();

    try {
        const {
            plan_id,
            software,
            task,
            user_level = 'beginner',
            plan_outline
        } = req.body;

        // Validation
        if (!software || !task) {
            return res.status(400).json({
                error: 'Paramètres manquants: software et task requis',
                example: {
                    software: 'excel',
                    task: 'Créer un tableau croisé dynamique',
                    user_level: 'beginner'
                }
            });
        }

        // Vérifier cache
        const cacheKey = `demo-${software}-${task}-${user_level}`;
        if (demoCache.has(cacheKey)) {
            console.log(`💨 Étapes démo récupérées du cache: ${software} - ${task}`);
            const cached = demoCache.get(cacheKey);
            cached.cached = true;
            cached.generation_time_ms = 0;
            return res.json(cached);
        }

        console.log(`🎬 Génération étapes démo: ${software} - ${task} (${user_level})`);

        const demoId = plan_id || uuidv4();
        const prompt = createDemoStepsPrompt({ software, task, user_level, plan_outline });

        // Génération avec Groq/Llama
        const generation = await llmFactory.generateText(prompt, {
            temperature: 0.4, // Plus bas pour précision technique
            max_tokens: 2000
        });

        // Parse JSON
        let demoSteps;
        try {
            const jsonMatch = generation.text.match(/\{[\s\S]*\}/);
            demoSteps = jsonMatch ? JSON.parse(jsonMatch[0]) : createFallbackSteps(software, task, user_level);
        } catch (e) {
            console.warn('Erreur parsing JSON, utilisation fallback');
            demoSteps = createFallbackSteps(software, task, user_level);
        }

        const totalTime = Date.now() - startTime;

        const result = {
            demo_id: demoId,
            software: software.toLowerCase(),
            task,
            user_level,
            steps_count: demoSteps.steps?.length || 0,
            estimated_duration: demoSteps.estimated_duration_minutes || 5,
            steps: demoSteps.steps || [],
            prerequisites: demoSteps.prerequisites || [],
            validation_checkpoints: demoSteps.validation_checkpoints || [],
            troubleshooting: demoSteps.troubleshooting || [],
            generation_time_ms: totalTime,
            llm_generation_time_ms: generation.duration_ms,
            provider: generation.provider,
            cached: false,
            generated_at: new Date().toISOString(),
            status: 'completed'
        };

        // Cache 2 heures (contenu plus stable)
        demoCache.set(cacheKey, { ...result });
        setTimeout(() => demoCache.delete(cacheKey), 7200000);

        console.log(`✅ Étapes démo générées: ${demoSteps.steps?.length || 0} steps en ${totalTime}ms`);
        res.json(result);

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`❌ Erreur génération démo après ${totalTime}ms:`, error);
        res.status(500).json({
            error: 'Erreur génération étapes démonstration',
            generation_time_ms: totalTime,
            details: error.message
        });
    }
});

// Fonction fallback si parsing JSON échoue
function createFallbackSteps(software, task, user_level) {
    return {
        software,
        task,
        estimated_duration_minutes: 5,
        difficulty_level: user_level,
        prerequisites: [`Avoir ${software} installé`, "Connaissances de base informatique"],
        steps: [
            {
                step_number: 1,
                title: "Démarrage de l'application",
                instruction: `Ouvrir ${software}`,
                location: "Bureau ou menu Démarrer",
                expected_result: `Interface ${software} s'affiche`,
                duration_seconds: 30,
                screenshot_zone: "Écran principal",
                common_errors: ["Application ne se lance pas"],
                tips: ["Vérifier que l'application est installée"]
            },
            {
                step_number: 2,
                title: "Navigation vers la fonctionnalité",
                instruction: `Accéder à la fonctionnalité pour ${task}`,
                location: "Menu principal",
                expected_result: "Fonctionnalité accessible",
                duration_seconds: 60,
                screenshot_zone: "Zone navigation",
                common_errors: ["Option non trouvée"],
                tips: ["Utiliser la recherche si disponible"]
            },
            {
                step_number: 3,
                title: "Exécution de la tâche",
                instruction: `Réaliser ${task}`,
                location: "Interface de travail",
                expected_result: "Tâche accomplie",
                duration_seconds: 180,
                screenshot_zone: "Zone de travail",
                common_errors: ["Erreur d'exécution"],
                tips: ["Suivre les indications à l'écran"]
            }
        ],
        validation_checkpoints: [
            {
                checkpoint: "Vérification du résultat final",
                how_to_verify: "Contrôler que la tâche est bien accomplie"
            }
        ],
        troubleshooting: [
            {
                problem: "Fonctionnalité non disponible",
                solution: "Vérifier la version du logiciel et les permissions"
            }
        ]
    };
}

// API GET /ai/demo-steps/:id - Récupérer des étapes existantes
router.get('/demo-steps/:id', (req, res) => {
    // TODO: Implémenter récupération depuis base de données
    res.json({
        message: 'Récupération étapes démo - À implémenter avec base de données',
        demo_id: req.params.id
    });
});

// API GET /ai/software-catalog - Liste des logiciels supportés
router.get('/software-catalog', (req, res) => {
    const catalog = Object.keys(SOFTWARE_KNOWLEDGE).map(key => ({
        software_id: key,
        name: SOFTWARE_KNOWLEDGE[key].name,
        version: SOFTWARE_KNOWLEDGE[key].version,
        supported_tasks: SOFTWARE_KNOWLEDGE[key].common_tasks,
        interface_elements_count: SOFTWARE_KNOWLEDGE[key].interface_elements.length
    }));

    res.json({
        supported_software: catalog,
        total_count: catalog.length,
        last_updated: new Date().toISOString()
    });
});

module.exports = router;

// Tests Postman pour /generate-demo-steps

/*
1. TEST EXCEL - Tableau croisé dynamique
POST http://localhost:3001/ai/generate-demo-steps
{
  "software": "excel",
  "task": "Créer un tableau croisé dynamique",
  "user_level": "beginner"
}

2. TEST POWER BI - Visualisation
POST http://localhost:3001/ai/generate-demo-steps
{
  "software": "powerbi", 
  "task": "Créer un graphique en barres",
  "user_level": "intermediate",
  "plan_outline": [
    {"title": "Préparation données", "duration_seconds": 60},
    {"title": "Création visualisation", "duration_seconds": 120}
  ]
}

3. TEST SAP - Navigation
POST http://localhost:3001/ai/generate-demo-steps
{
  "software": "sap",
  "task": "Consulter une commande client", 
  "user_level": "beginner"
}

4. TEST TEAMS - Réunion
POST http://localhost:3001/ai/generate-demo-steps
{
  "software": "teams",
  "task": "Organiser une réunion avec partage d'écran",
  "user_level": "intermediate"
}

5. GET Catalogue logiciels
GET http://localhost:3001/ai/software-catalog

RÉPONSE ATTENDUE EXEMPLE:
{
  "demo_id": "uuid",
  "software": "excel",
  "task": "Créer un tableau croisé dynamique",
  "user_level": "beginner",
  "steps_count": 8,
  "estimated_duration": 5,
  "steps": [
    {
      "step_number": 1,
      "title": "Sélectionner les données source",
      "instruction": "Cliquez sur la cellule A1 puis faites Ctrl+Shift+Fin pour sélectionner toutes les données",
      "location": "Feuille de calcul Excel",
      "expected_result": "Plage de données mise en surbrillance bleue",
      "duration_seconds": 20,
      "screenshot_zone": "Zone données sélectionnées",
      "common_errors": ["Sélection incomplète", "Données vides incluses"],
      "tips": ["Vérifier qu'il n'y a pas de cellules vides dans les en-têtes"]
    }
  ],
  "generation_time_ms": 1250,
  "provider": "groq",
  "status": "completed"
}
*/