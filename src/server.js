

// // server.js - EduPro AI Complet avec API Bark Narration CORRIGÉ
// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs'); // AJOUTÉ
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 3001;

// // CORS Configuration pour production
// const corsOptions = {
//     origin: process.env.CORS_ORIGIN || '*',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true
// };

// app.use(cors(corsOptions));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // ===== CRÉATION DOSSIERS ET ROUTES STATIQUES =====
// // Créer le dossier audio s'il n'existe pas
// const audioDir = path.join(__dirname, 'generated-audio');
// const presentationsDir = path.join(__dirname, 'generated-presentations');

// if (!fs.existsSync(audioDir)) {
//     fs.mkdirSync(audioDir, { recursive: true });
//     console.log('📁 Dossier generated-audio créé');
// }

// if (!fs.existsSync(presentationsDir)) {
//     fs.mkdirSync(presentationsDir, { recursive: true });
//     console.log('📁 Dossier generated-presentations créé');
// }

// // Routes pour servir les fichiers (UNE SEULE FOIS !)
// app.use('/audio', express.static(audioDir, {
//     setHeaders: (res, filePath) => {
//         if (filePath.endsWith('.wav')) {
//             res.set('Content-Type', 'audio/wav');
//         } else if (filePath.endsWith('.mp3')) {
//             res.set('Content-Type', 'audio/mpeg');
//         }
//         res.set('Access-Control-Allow-Origin', '*');
//         res.set('Cache-Control', 'public, max-age=3600');
//     }
// }));

// app.use('/presentations', express.static(presentationsDir));

// console.log('🎵 Route /audio/ configurée pour servir les fichiers audio');
// console.log('📄 Route /presentations/ configurée');

// // Middleware pour logs en production
// app.use((req, res, next) => {
//     console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//     next();
// });

// // ===== ROUTES APIs PRINCIPALES =====

// // APIs V1 - Opérationnelles
// const generatePlanRouter = require('./apis/generate-plan');
// const simplePlanRouter = require('./apis/simple-plan');
// const fastPlanRouter = require('./apis/fast-simple-plan');
// const groqPlanRouter = require('./apis/groq-fast-plan');
// const generateScriptRouter = require('./apis/generate-script');
// const slidesRouter = require('./apis/generate-slides');
// const slidevRouter = require('./apis/slidev-generator');
// const powerpointRouter = require('./apis/powerpoint-generator');
// const parseResourcesRouter = require('./apis/parse-resources');
// const demoStepsRouter = require('./apis/generate-demo-steps');
// const videoCompleteRouter = require('./apis/generate-video-complete');
// const planToMarkdownRouter = require('./apis/plan-to-markdown');

// const enhanceSlidevRoutes = require('./apis/enhance-slidev');

// // API V2 - Nouvelle narration Bark/ElevenLabs
// const barkNarrationRouter = require('./apis/generate-narration-bark');

// // Enregistrement des routes
// app.use('/ai', generatePlanRouter);
// app.use('/ai', simplePlanRouter);
// app.use('/ai', fastPlanRouter);
// app.use('/ai', groqPlanRouter);
// app.use('/ai', generateScriptRouter);
// app.use('/ai', slidesRouter);
// app.use('/ai', slidevRouter);
// app.use('/ai', powerpointRouter);
// app.use('/ai', parseResourcesRouter);
// app.use('/ai', demoStepsRouter);
// app.use('/ai', barkNarrationRouter);

// app.use('/ai', videoCompleteRouter);
// // app.use('/ai', planToMarkdownRouter);
// app.use('/ai', enhanceSlidevRoutes);


// // SUPPRIMÉ - Les doublons des routes /audio et /presentations

// // Route de test audio direct
// app.get('/test-audio-route', (req, res) => {
//     res.json({
//         message: '🎵 Test Route Audio',
//         audio_directory: audioDir,
//         audio_url: '/audio/',
//         files_in_directory: fs.readdirSync(audioDir).length,
//         sample_files: fs.readdirSync(audioDir).slice(0, 3),
//         test_url: 'http://localhost:3001/audio/[nom_fichier].wav',
//         status: 'Route audio configurée correctement'
//     });
// });

// app.get('/', (req, res) => {
//     res.json({
//         service: 'EduPro AI Micro-Learning Generator',
//         version: '1.2.0',
//         status: 'online',
//         deployed_at: new Date().toISOString(),
//         server_info: {
//             node_version: process.version,
//             platform: process.platform,
//             memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
//             uptime: `${Math.round(process.uptime())} seconds`
//         },
//         endpoints: {
//             // ===== WORKFLOW 4 ÉTAPES =====
//             workflow_steps: {
//                 'POST /ai/generate-script': '✅ ÉTAPE 1: Plan + Script pédagogique AI (opérationnel)',
//                 'POST /ai/generate-slides': '✅ ÉTAPE 2: Slides markdown → Slidev (opérationnel)',
//                 'POST /ai/generate-demo-capture': '🚧 ÉTAPE 3: Capture démo logiciels (V2)',
//                 'POST /ai/generate-narration-bark': '🎙️ ÉTAPE 4: Narration vocale ElevenLabs (NOUVEAU)'
//             },

//             // ===== APIs PRINCIPALES =====
//             plans: {
//                 'POST /ai/groq-plan': 'Plan structuré uniquement - RECOMMANDÉ',
//                 'POST /ai/generate-plan': 'Plan + script narration (ancien format)',
//                 'POST /ai/simple-plan': 'Plan basique structure seule',
//                 'POST /ai/fast-plan': 'Version cache optimisé'
//             },
//             scripts: {
//                 'POST /ai/generate-script': 'Plan + Script complet en une fois - PRINCIPAL',
//                 'GET /ai/generate-script/info': 'Styles de script et documentation',
//                 'GET /ai/scripts/:id': 'Récupérer un script existant'
//             },
//             presentations: {
//                 'POST /ai/generate-slides': 'Slides Slidev markdown depuis script',
//                 'POST /ai/generate-slidev': 'Slidev complet avec fichiers',
//                 'POST /ai/generate-powerpoint': 'PowerPoint sophistiqué HTML',
//                 'POST /ai/generate-powerpoint-advanced': 'PowerPoint premium avec options'
//             },

//             // ✅ SECTION NARRATION MISE À JOUR
//             narration: {
//                 'POST /ai/generate-narration-bark': 'Narration vocale avec ElevenLabs - GRATUIT',
//                 'GET /ai/bark-voices': 'Voix françaises disponibles',
//                 'GET /ai/generate-narration-bark/info': 'Documentation API Audio'
//             },

//             demonstrations: {
//                 'POST /ai/generate-demo-steps': 'Steps précis logiciels (Excel, SAP, Power BI, Teams)',
//                 'GET /ai/software-catalog': 'Liste logiciels supportés'
//             },
//             resources: {
//                 'POST /ai/parse-resources': 'Upload et analyse documents (PDF, DOCX, PPTX, XLSX)',
//                 'GET /ai/parse-resources/formats': 'Formats supportés et limites'
//             },
//             utilities: {
//                 'GET /ai/health': 'Santé des providers IA (Groq/Ollama)',
//                 'GET /powerpoint/themes': 'Thèmes design disponibles',
//                 'GET /test-audio-route': 'Test configuration route audio' // NOUVEAU
//             }
//         },

//         // ===== EXEMPLES D'USAGE =====
//         examples: {
//             // Workflow complet V1 + Audio
//             complete_workflow_v1_audio: {
//                 step1: {
//                     url: 'POST /ai/generate-script',
//                     body: {
//                         topic: 'Les 3 erreurs Excel à éviter absolument',
//                         capsuleType: 'demonstrative',
//                         settings: {
//                             level: 'beginner',
//                             duration: 5,
//                             style: 'practical'
//                         },
//                         script_style: 'conversational'
//                     },
//                     note: 'Génère plan + script complet'
//                 },
//                 step2: {
//                     url: 'POST /ai/generate-slides',
//                     body: 'Utiliser TOUT le résultat de step1',
//                     note: 'Génère slides Slidev interactives'
//                 },
//                 step4_audio: {
//                     url: 'POST /ai/generate-narration-bark',
//                     body: {
//                         text_content: '[full_script depuis step1]',
//                         voice_type: 'professional_female',
//                         enhance_emotions: true,
//                         split_by_sentences: true
//                     },
//                     note: 'Génère narration vocale ElevenLabs gratuite'
//                 }
//             },

//             // ✅ EXEMPLE AUDIO MIS À JOUR
//             audio_narration: {
//                 url: 'POST /ai/generate-narration-bark',
//                 body: {
//                     text_content: 'Bonjour et bienvenue dans cette formation Excel ! Enfin ça marche vraiment !',
//                     voice_type: 'professional_female',
//                     enhance_emotions: true,
//                     split_by_sentences: true
//                 },
//                 note: 'Génère narration vocale française avec ElevenLabs'
//             }
//         },

//         // ===== WORKFLOW RECOMMANDÉ COMPLET =====
//         recommended_workflow: {
//             overview: 'Workflow 4 étapes pour créer une formation complète',
//             step1: {
//                 action: 'Générer plan + script pédagogique',
//                 endpoint: 'POST /ai/generate-script',
//                 description: 'Crée le plan structuré + script de narration complet',
//                 duration: '~5 secondes',
//                 status: '✅ Opérationnel'
//             },
//             step2: {
//                 action: 'Générer slides interactives',
//                 endpoint: 'POST /ai/generate-slides',
//                 description: 'Transforme le plan/script en slides Slidev',
//                 duration: '~5 secondes',
//                 status: '✅ Opérationnel'
//             },
//             step3: {
//                 action: 'Capturer démo logiciels',
//                 endpoint: 'POST /ai/generate-demo-capture (V2)',
//                 description: 'Instructions capture semi-automatique (Excel, PowerBI, etc.)',
//                 duration: '~variable',
//                 status: '🚧 V2 - En développement'
//             },
//             step4: {
//                 action: 'Générer narration vocale',
//                 endpoint: 'POST /ai/generate-narration-bark',
//                 description: 'Narration française avec ElevenLabs (gratuit)',
//                 duration: '~5-15 secondes',
//                 status: '🎙️ NOUVEAU - Opérationnel'
//             },
//             total_time_v1_audio: '~15-25 secondes (steps 1+2+4)',
//             total_time_v2_complete: '~variable selon capture démo'
//         },

//         // ✅ FONCTIONNALITÉS AUDIO MISES À JOUR
//         audio_features: {
//             provider: 'ElevenLabs + Fallback Audio HQ',
//             cost: '🆓 Gratuit (10k caractères/mois)',
//             quality: '🎭 Voix ultra-réalistes',
//             languages: '🇫🇷 Français parfait',
//             limits: '⚡ 10k caractères gratuits',
//             voices_available: 6,
//             special_features: [
//                 'Voix naturelles ElevenLabs',
//                 'Fallback audio haute qualité',
//                 'Pas de clé API requise pour débuter',
//                 'Support français natif',
//                 'Segmentation automatique'
//             ]
//         },

//         frontend_integration: {
//             base_url: `http://${req.get('host')}`,
//             cors_enabled: true,
//             rate_limit: 'Aucune limite en développement',
//             authentication: 'Aucune (APIs publiques)',
//             response_format: 'JSON',
//             audio_serving: '/audio/ (fichiers wav/mp3 générés)',
//             presentations_serving: '/presentations/ (fichiers html)'
//         }
//     });
// });

// // ===== HEALTH CHECK DÉTAILLÉ =====
// app.get('/health', (req, res) => {
//     const audioFiles = fs.readdirSync(audioDir).length;

//     const healthCheck = {
//         status: 'OK',
//         timestamp: new Date().toISOString(),
//         service: 'EduPro AI Micro-Learning Generator',
//         version: '1.2.0',
//         environment: process.env.NODE_ENV || 'development',
//         server: {
//             uptime: `${Math.round(process.uptime())} seconds`,
//             memory_usage: {
//                 used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
//                 total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
//             },
//             platform: process.platform,
//             node_version: process.version
//         },
//         apis_status: {
//             groq_configured: !!process.env.GROQ_API_KEY,
//             audio_available: true,
//             cache_enabled: process.env.ENABLE_CACHE === 'true',
//             cors_origin: process.env.CORS_ORIGIN || '*'
//         },
//         audio_status: {
//             provider: 'ElevenLabs + Fallback',
//             directory: audioDir,
//             files_generated: audioFiles,
//             route_active: '/audio/',
//             test_url: 'GET /test-audio-route'
//         }
//     };

//     res.json(healthCheck);
// });

// // ===== ROUTE DE TEST RAPIDE =====
// app.post('/test', (req, res) => {
//     res.json({
//         message: 'API EduPro AI fonctionnelle !',
//         received_data: req.body,
//         timestamp: new Date().toISOString(),
//         server_status: 'OK',
//         available_workflows: {
//             basic_v1: 'generate-script → generate-slides',
//             enhanced_v1: 'generate-script → generate-slides → generate-narration-bark',
//             future_v2: 'Complete 4-step workflow'
//         },
//         next_steps: [
//             '1. POST /ai/generate-script pour créer plan + script',
//             '2. POST /ai/generate-slides pour créer slides',
//             '3. POST /ai/generate-narration-bark pour ajouter narration vocale'
//         ]
//     });
// });

// // ✅ ROUTE DE TEST AUDIO
// app.post('/test-bark', (req, res) => {
//     const { text = 'Bonjour, ceci est un test audio qui marche enfin !' } = req.body;

//     res.json({
//         message: '🎙️ Test Audio Narration',
//         test_request: {
//             url: '/ai/generate-narration-bark',
//             method: 'POST',
//             body: {
//                 text_content: text,
//                 voice_type: 'professional_female',
//                 enhance_emotions: true
//             }
//         },
//         audio_info: {
//             provider: 'ElevenLabs + Fallback',
//             cost: 'Gratuit',
//             quality: 'Très haute',
//             voices_french: 6
//         },
//         tip: 'Utilisez POST /ai/generate-narration-bark avec votre texte'
//     });
// });

// // ===== GESTION DES ERREURS 404 =====
// app.use('*', (req, res) => {
//     res.status(404).json({
//         error: 'Endpoint non trouvé',
//         message: `${req.method} ${req.originalUrl} n'existe pas`,
//         available_endpoints: [
//             'GET /',
//             'GET /health',
//             'GET /test-audio-route',
//             'POST /test',
//             'POST /test-bark',
//             'POST /ai/generate-script',
//             'POST /ai/generate-slides',
//             'POST /ai/generate-narration-bark',
//             'GET /ai/bark-voices',
//             'POST /ai/groq-plan'
//         ],
//         documentation: `http://${req.get('host')}/`,
//         audio_test: `GET http://${req.get('host')}/test-audio-route`
//     });
// });

// // ===== GESTION GLOBALE DES ERREURS =====
// app.use((error, req, res, next) => {
//     console.error('Erreur serveur:', error);
//     res.status(500).json({
//         error: 'Erreur interne serveur',
//         message: process.env.NODE_ENV === 'production' ? 'Une erreur est survenue' : error.message,
//         timestamp: new Date().toISOString(),
//         suggestion: 'Vérifiez les logs serveur ou réessayez'
//     });
// });

// // ===== GRACEFUL SHUTDOWN =====
// process.on('SIGTERM', () => {
//     console.log('🛑 SIGTERM reçu, arrêt graceful du serveur...');
//     process.exit(0);
// });

// process.on('SIGINT', () => {
//     console.log('🛑 SIGINT reçu, arrêt graceful du serveur...');
//     process.exit(0);
// });

// // ===== DÉMARRAGE SERVEUR =====
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`🚀 EduPro AI Server v1.2.0 running on port ${PORT}`);
//     console.log(`📚 Micro-Learning Generator ready!`);
//     console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
//     console.log(`🔑 Groq configured: ${!!process.env.GROQ_API_KEY}`);
//     console.log(`🎙️ Audio narration: ACTIVE (ElevenLabs + Fallback)`);
//     console.log(`💾 Cache enabled: ${process.env.ENABLE_CACHE === 'true'}`);
//     console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || '*'}`);
//     console.log(`📁 Audio directory: ${audioDir}`);
//     console.log(`🎵 Audio route: /audio/ configurée`);
//     console.log(`📊 APIs disponibles: 16 endpoints`);
//     console.log(`🎬 Workflow V1: Plan + Script + Slides`);
//     console.log(`🎙️ Workflow V1 + Audio: Plan + Script + Slides + Narration`);
//     console.log(`⚡ Total generation time: ~15-25s avec narration audio`);
//     console.log(`🆓 Audio narration: Gratuit ElevenLabs + Fallback !`);
// });

// // Export pour tests
// module.exports = app;










// v2

// server.js - EduPro AI Complet avec API Bark Narration CORRIGÉ
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // AJOUTÉ
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration pour production
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ===== CRÉATION DOSSIERS ET ROUTES STATIQUES =====
// Créer le dossier audio s'il n'existe pas
const audioDir = path.join(__dirname, 'generated-audio');
const presentationsDir = path.join(__dirname, 'generated-presentations');

if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
    console.log('📁 Dossier generated-audio créé');
}

if (!fs.existsSync(presentationsDir)) {
    fs.mkdirSync(presentationsDir, { recursive: true });
    console.log('📁 Dossier generated-presentations créé');
}

// Routes pour servir les fichiers (UNE SEULE FOIS !)
app.use('/audio', express.static(audioDir, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.wav')) {
            res.set('Content-Type', 'audio/wav');
        } else if (filePath.endsWith('.mp3')) {
            res.set('Content-Type', 'audio/mpeg');
        }
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cache-Control', 'public, max-age=3600');
    }
}));

app.use('/presentations', express.static(presentationsDir));

console.log('🎵 Route /audio/ configurée pour servir les fichiers audio');
console.log('📄 Route /presentations/ configurée');

// Middleware pour logs en production
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ===== ROUTES APIs PRINCIPALES =====

// APIs V1 - Opérationnelles
const generatePlanRouter = require('./apis/generate-plan');
const simplePlanRouter = require('./apis/simple-plan');
const fastPlanRouter = require('./apis/fast-simple-plan');
const groqPlanRouter = require('./apis/groq-fast-plan');
const generateScriptRouter = require('./apis/generate-script');
const slidesRouter = require('./apis/generate-slides');
const slidevRouter = require('./apis/slidev-generator');
const powerpointRouter = require('./apis/powerpoint-generator');
const parseResourcesRouter = require('./apis/parse-resources');
const demoStepsRouter = require('./apis/generate-demo-steps');
const videoCompleteRouter = require('./apis/generate-video-complete');
const planToMarkdownRouter = require('./apis/plan-to-markdown');

const enhanceSlidevRoutes = require('./apis/enhance-slidev');

// API V2 - Nouvelle narration Bark/ElevenLabs
const barkNarrationRouter = require('./apis/generate-narration-bark');

// Enregistrement des routes
app.use('/ai', generatePlanRouter);
app.use('/ai', simplePlanRouter);
app.use('/ai', fastPlanRouter);
app.use('/ai', groqPlanRouter);
app.use('/ai', generateScriptRouter);
app.use('/ai', slidesRouter);
app.use('/ai', slidevRouter);
app.use('/ai', powerpointRouter);
app.use('/ai', parseResourcesRouter);
app.use('/ai', demoStepsRouter);
app.use('/ai', barkNarrationRouter);

app.use('/ai', videoCompleteRouter);
app.use('/ai', planToMarkdownRouter);
app.use('/ai', enhanceSlidevRoutes);


// SUPPRIMÉ - Les doublons des routes /audio et /presentations

// Route de test audio direct
app.get('/test-audio-route', (req, res) => {
    res.json({
        message: '🎵 Test Route Audio',
        audio_directory: audioDir,
        audio_url: '/audio/',
        files_in_directory: fs.readdirSync(audioDir).length,
        sample_files: fs.readdirSync(audioDir).slice(0, 3),
        test_url: 'http://localhost:3001/audio/[nom_fichier].wav',
        status: 'Route audio configurée correctement'
    });
});

app.get('/', (req, res) => {
    res.json({
        service: 'EduPro AI Micro-Learning Generator',
        version: '1.2.0',
        status: 'online',
        deployed_at: new Date().toISOString(),
        server_info: {
            node_version: process.version,
            platform: process.platform,
            memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
            uptime: `${Math.round(process.uptime())} seconds`
        },
        endpoints: {
            // ===== WORKFLOW 4 ÉTAPES =====
            workflow_steps: {
                'POST /ai/generate-script': '✅ ÉTAPE 1: Plan + Script pédagogique AI (opérationnel)',
                'POST /ai/generate-slides': '✅ ÉTAPE 2: Slides markdown → Slidev (opérationnel)',
                'POST /ai/generate-demo-capture': '🚧 ÉTAPE 3: Capture démo logiciels (V2)',
                'POST /ai/generate-narration-bark': '🎙️ ÉTAPE 4: Narration vocale ElevenLabs (NOUVEAU)'
            },

            // ===== APIs PRINCIPALES =====
            plans: {
                'POST /ai/groq-plan': 'Plan structuré uniquement - RECOMMANDÉ',
                'POST /ai/generate-plan': 'Plan + script narration (ancien format)',
                'POST /ai/simple-plan': 'Plan basique structure seule',
                'POST /ai/fast-plan': 'Version cache optimisé'
            },
            scripts: {
                'POST /ai/generate-script': 'Plan + Script complet en une fois - PRINCIPAL',
                'GET /ai/generate-script/info': 'Styles de script et documentation',
                'GET /ai/scripts/:id': 'Récupérer un script existant'
            },
            presentations: {
                'POST /ai/generate-slides': 'Slides Slidev markdown depuis script',
                'POST /ai/generate-slidev': 'Slidev complet avec fichiers',
                'POST /ai/generate-powerpoint': 'PowerPoint sophistiqué HTML',
                'POST /ai/generate-powerpoint-advanced': 'PowerPoint premium avec options'
            },

            // ✅ SECTION NARRATION MISE À JOUR
            narration: {
                'POST /ai/generate-narration-bark': 'Narration vocale avec ElevenLabs - GRATUIT',
                'GET /ai/bark-voices': 'Voix françaises disponibles',
                'GET /ai/generate-narration-bark/info': 'Documentation API Audio'
            },

            demonstrations: {
                'POST /ai/generate-demo-steps': 'Steps précis logiciels (Excel, SAP, Power BI, Teams)',
                'GET /ai/software-catalog': 'Liste logiciels supportés'
            },
            resources: {
                'POST /ai/parse-resources': 'Upload et analyse documents (PDF, DOCX, PPTX, XLSX)',
                'GET /ai/parse-resources/formats': 'Formats supportés et limites'
            },
            utilities: {
                'GET /ai/health': 'Santé des providers IA (Groq/Ollama)',
                'GET /powerpoint/themes': 'Thèmes design disponibles',
                'GET /test-audio-route': 'Test configuration route audio' // NOUVEAU
            }
        },

        // ===== EXEMPLES D'USAGE =====
        examples: {
            // Workflow complet V1 + Audio
            complete_workflow_v1_audio: {
                step1: {
                    url: 'POST /ai/generate-script',
                    body: {
                        topic: 'Les 3 erreurs Excel à éviter absolument',
                        capsuleType: 'demonstrative',
                        settings: {
                            level: 'beginner',
                            duration: 5,
                            style: 'practical'
                        },
                        script_style: 'conversational'
                    },
                    note: 'Génère plan + script complet'
                },
                step2: {
                    url: 'POST /ai/generate-slides',
                    body: 'Utiliser TOUT le résultat de step1',
                    note: 'Génère slides Slidev interactives'
                },
                step4_audio: {
                    url: 'POST /ai/generate-narration-bark',
                    body: {
                        text_content: '[full_script depuis step1]',
                        voice_type: 'professional_female',
                        enhance_emotions: true,
                        split_by_sentences: true
                    },
                    note: 'Génère narration vocale ElevenLabs gratuite'
                }
            },

            // ✅ EXEMPLE AUDIO MIS À JOUR
            audio_narration: {
                url: 'POST /ai/generate-narration-bark',
                body: {
                    text_content: 'Bonjour et bienvenue dans cette formation Excel ! Enfin ça marche vraiment !',
                    voice_type: 'professional_female',
                    enhance_emotions: true,
                    split_by_sentences: true
                },
                note: 'Génère narration vocale française avec ElevenLabs'
            }
        },

        // ===== WORKFLOW RECOMMANDÉ COMPLET =====
        recommended_workflow: {
            overview: 'Workflow 4 étapes pour créer une formation complète',
            step1: {
                action: 'Générer plan + script pédagogique',
                endpoint: 'POST /ai/generate-script',
                description: 'Crée le plan structuré + script de narration complet',
                duration: '~5 secondes',
                status: '✅ Opérationnel'
            },
            step2: {
                action: 'Générer slides interactives',
                endpoint: 'POST /ai/generate-slides',
                description: 'Transforme le plan/script en slides Slidev',
                duration: '~5 secondes',
                status: '✅ Opérationnel'
            },
            step3: {
                action: 'Capturer démo logiciels',
                endpoint: 'POST /ai/generate-demo-capture (V2)',
                description: 'Instructions capture semi-automatique (Excel, PowerBI, etc.)',
                duration: '~variable',
                status: '🚧 V2 - En développement'
            },
            step4: {
                action: 'Générer narration vocale',
                endpoint: 'POST /ai/generate-narration-bark',
                description: 'Narration française avec ElevenLabs (gratuit)',
                duration: '~5-15 secondes',
                status: '🎙️ NOUVEAU - Opérationnel'
            },
            total_time_v1_audio: '~15-25 secondes (steps 1+2+4)',
            total_time_v2_complete: '~variable selon capture démo'
        },

        // ✅ FONCTIONNALITÉS AUDIO MISES À JOUR
        audio_features: {
            provider: 'ElevenLabs + Fallback Audio HQ',
            cost: '🆓 Gratuit (10k caractères/mois)',
            quality: '🎭 Voix ultra-réalistes',
            languages: '🇫🇷 Français parfait',
            limits: '⚡ 10k caractères gratuits',
            voices_available: 6,
            special_features: [
                'Voix naturelles ElevenLabs',
                'Fallback audio haute qualité',
                'Pas de clé API requise pour débuter',
                'Support français natif',
                'Segmentation automatique'
            ]
        },

        frontend_integration: {
            base_url: `http://${req.get('host')}`,
            cors_enabled: true,
            rate_limit: 'Aucune limite en développement',
            authentication: 'Aucune (APIs publiques)',
            response_format: 'JSON',
            audio_serving: '/audio/ (fichiers wav/mp3 générés)',
            presentations_serving: '/presentations/ (fichiers html)'
        }
    });
});

// ===== HEALTH CHECK DÉTAILLÉ =====
app.get('/health', (req, res) => {
    const audioFiles = fs.readdirSync(audioDir).length;

    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'EduPro AI Micro-Learning Generator',
        version: '1.2.0',
        environment: process.env.NODE_ENV || 'development',
        server: {
            uptime: `${Math.round(process.uptime())} seconds`,
            memory_usage: {
                used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
                total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
            },
            platform: process.platform,
            node_version: process.version
        },
        apis_status: {
            groq_configured: !!process.env.GROQ_API_KEY,
            audio_available: true,
            cache_enabled: process.env.ENABLE_CACHE === 'true',
            cors_origin: process.env.CORS_ORIGIN || '*'
        },
        audio_status: {
            provider: 'ElevenLabs + Fallback',
            directory: audioDir,
            files_generated: audioFiles,
            route_active: '/audio/',
            test_url: 'GET /test-audio-route'
        }
    };

    res.json(healthCheck);
});

// ===== ROUTE DE TEST RAPIDE =====
app.post('/test', (req, res) => {
    res.json({
        message: 'API EduPro AI fonctionnelle !',
        received_data: req.body,
        timestamp: new Date().toISOString(),
        server_status: 'OK',
        available_workflows: {
            basic_v1: 'generate-script → generate-slides',
            enhanced_v1: 'generate-script → generate-slides → generate-narration-bark',
            future_v2: 'Complete 4-step workflow'
        },
        next_steps: [
            '1. POST /ai/generate-script pour créer plan + script',
            '2. POST /ai/generate-slides pour créer slides',
            '3. POST /ai/generate-narration-bark pour ajouter narration vocale'
        ]
    });
});

// ✅ ROUTE DE TEST AUDIO
app.post('/test-bark', (req, res) => {
    const { text = 'Bonjour, ceci est un test audio qui marche enfin !' } = req.body;

    res.json({
        message: '🎙️ Test Audio Narration',
        test_request: {
            url: '/ai/generate-narration-bark',
            method: 'POST',
            body: {
                text_content: text,
                voice_type: 'professional_female',
                enhance_emotions: true
            }
        },
        audio_info: {
            provider: 'ElevenLabs + Fallback',
            cost: 'Gratuit',
            quality: 'Très haute',
            voices_french: 6
        },
        tip: 'Utilisez POST /ai/generate-narration-bark avec votre texte'
    });
});

// ===== GESTION DES ERREURS 404 =====
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint non trouvé',
        message: `${req.method} ${req.originalUrl} n'existe pas`,
        available_endpoints: [
            'GET /',
            'GET /health',
            'GET /test-audio-route',
            'POST /test',
            'POST /test-bark',
            'POST /ai/generate-script',
            'POST /ai/generate-slides',
            'POST /ai/generate-narration-bark',
            'GET /ai/bark-voices',
            'POST /ai/groq-plan'
        ],
        documentation: `http://${req.get('host')}/`,
        audio_test: `GET http://${req.get('host')}/test-audio-route`
    });
});

// ===== GESTION GLOBALE DES ERREURS =====
app.use((error, req, res, next) => {
    console.error('Erreur serveur:', error);
    res.status(500).json({
        error: 'Erreur interne serveur',
        message: process.env.NODE_ENV === 'production' ? 'Une erreur est survenue' : error.message,
        timestamp: new Date().toISOString(),
        suggestion: 'Vérifiez les logs serveur ou réessayez'
    });
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM reçu, arrêt graceful du serveur...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT reçu, arrêt graceful du serveur...');
    process.exit(0);
});

// ===== DÉMARRAGE SERVEUR =====
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 EduPro AI Server v1.2.0 running on port ${PORT}`);
    console.log(`📚 Micro-Learning Generator ready!`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 Groq configured: ${!!process.env.GROQ_API_KEY}`);
    console.log(`🎙️ Audio narration: ACTIVE (ElevenLabs + Fallback)`);
    console.log(`💾 Cache enabled: ${process.env.ENABLE_CACHE === 'true'}`);
    console.log(`🌐 CORS origin: ${process.env.CORS_ORIGIN || '*'}`);
    console.log(`📁 Audio directory: ${audioDir}`);
    console.log(`🎵 Audio route: /audio/ configurée`);
    console.log(`📊 APIs disponibles: 16 endpoints`);
    console.log(`🎬 Workflow V1: Plan + Script + Slides`);
    console.log(`🎙️ Workflow V1 + Audio: Plan + Script + Slides + Narration`);
    console.log(`⚡ Total generation time: ~15-25s avec narration audio`);
    console.log(`🆓 Audio narration: Gratuit ElevenLabs + Fallback !`);
});

// Export pour tests
module.exports = app;