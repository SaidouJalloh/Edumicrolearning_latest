
// code qui marche bien mais prend toute la sortie du plan

// src/apis/plan-to-markdown.js - Convertit DIRECTEMENT plan JSON → Markdown Slidev

// const express = require('express');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');

// const router = express.Router();

// // Fonction Groq
// async function callGroq(prompt, options = {}) {
//     try {
//         const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
//             model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
//             messages: [
//                 {
//                     role: 'system',
//                     content: 'Tu es un expert Slidev. Tu convertis des plans JSON en Markdown Slidev parfait. Réponds UNIQUEMENT avec du Markdown Slidev valide.'
//                 },
//                 {
//                     role: 'user',
//                     content: prompt
//                 }
//             ],
//             temperature: options.temperature || 0.6,
//             max_tokens: options.max_tokens || 3500
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         return response.data.choices[0].message.content;
//     } catch (error) {
//         console.error('❌ Erreur Groq plan-to-markdown:', error.message);
//         throw new Error('Erreur génération markdown IA');
//     }
// }

// // API POST /ai/plan-to-markdown - Prend le JSON de groq-plan et génère le markdown
// router.post('/plan-to-markdown', async (req, res) => {
//     const startTime = Date.now();

//     try {
//         // Validation simple - on accepte tout le JSON de groq-plan
//         if (!req.body.plan_sections || !req.body.topic) {
//             return res.status(400).json({
//                 error: 'Format invalide',
//                 required: ['plan_sections', 'topic'],
//                 format: 'Copiez-collez TOUT le résultat de POST /ai/groq-plan',
//                 example_usage: 'Résultat groq-plan → Input plan-to-markdown'
//             });
//         }

//         const groqPlanData = req.body; // Tout le JSON de groq-plan
//         console.log(`📄 Conversion plan → markdown: ${groqPlanData.topic}`);

//         // Créer le prompt
//         const prompt = createMarkdownPrompt(groqPlanData);

//         // Générer avec Groq
//         const markdownResponse = await callGroq(prompt);

//         // Nettoyer le markdown
//         let slideMarkdown = cleanMarkdown(markdownResponse);

//         // Fallback si problème
//         if (!slideMarkdown.includes('---\ntheme:')) {
//             slideMarkdown = createFallbackMarkdown(groqPlanData);
//         }

//         const slidesId = uuidv4();
//         const totalTime = Date.now() - startTime;
//         const slideCount = (slideMarkdown.match(/^---$/gm) || []).length;

//         const result = {
//             slides_id: slidesId,

//             // RÉSULTAT PRINCIPAL
//             markdown: slideMarkdown,

//             // Infos
//             slides_count: slideCount,
//             topic: groqPlanData.topic,
//             source_plan_id: groqPlanData.plan_id,

//             // Fichier
//             filename: `slides_${slidesId}.md`,
//             file_size_kb: Math.round(slideMarkdown.length / 1024),

//             // Commandes Slidev
//             slidev_commands: {
//                 preview: `slidev slides_${slidesId}.md`,
//                 export_pdf: `slidev export slides_${slidesId}.md --format pdf`,
//                 export_html: `slidev export slides_${slidesId}.md --format html`
//             },

//             // Métadonnées
//             generation_time_ms: totalTime,
//             generated_at: new Date().toISOString(),
//             status: 'completed',
//             ready_for_slidev: true
//         };

//         console.log(`✅ Markdown généré: ${slideCount} slides en ${totalTime}ms`);
//         res.json(result);

//     } catch (error) {
//         const totalTime = Date.now() - startTime;
//         console.error('❌ Erreur plan-to-markdown:', error);
//         res.status(500).json({
//             error: 'Erreur génération markdown',
//             generation_time_ms: totalTime,
//             details: error.message
//         });
//     }
// });

// // Fonction pour créer le prompt
// function createMarkdownPrompt(planData) {
//     const { topic, plan_sections, settings } = planData;
//     const { level = 'beginner', duration = 5, style = 'practical' } = settings || {};

//     return `Convertis ce plan en Markdown Slidev parfait:

// PLAN À CONVERTIR:
// Sujet: ${topic}
// Niveau: ${level}
// Durée: ${duration} minutes
// Style: ${style}

// SECTIONS:
// ${plan_sections.map((section, i) =>
//         `${i + 1}. ${section.title} (${section.duration_seconds}s)
//    Type: ${section.type}
//    Points: ${section.what_to_cover ? section.what_to_cover.join(', ') : 'À développer'}
//    Résumé: ${section.content_summary || 'Contenu de la section'}`
//     ).join('\n\n')}

// GÉNÈRE ce Markdown Slidev EXACT:

// ---
// theme: academic
// background: linear-gradient(45deg, #1e3c72, #2a5298)
// class: text-center
// highlighter: shiki
// lineNumbers: false
// info: |
//   ## ${topic}
//   Formation ${duration} minutes - Niveau ${level}
// drawings:
//   persist: false
// transition: slide-left
// title: ${topic}
// ---

// # ${topic}
// ## Formation ${duration} minutes

// <div class="pt-12">
//   <span @click="$slidev.nav.next" class="px-4 py-2 rounded-lg cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold transition-all">
//     🚀 Commencer <carbon:arrow-right class="inline ml-2"/>
//   </span>
// </div>

// ${plan_sections.map((section, index) => {
//         if (section.type === 'introduction') {
//             return `
// ---
// layout: intro
// class: text-left
// ---

// # ${section.title}

// ${section.what_to_cover ? section.what_to_cover.map(point => `- ${point}`).join('\n') : '- Introduction au sujet\n- Objectifs de la formation'}

// <div class="mt-8 flex gap-3">
//   <div class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
//     ⏱️ ${section.duration_seconds}s
//   </div>
//   <div class="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
//     📚 Introduction
//   </div>
// </div>`;
//         } else if (section.type === 'development') {
//             return `
// ---
// layout: default
// ---

// # ${section.title}

// ${section.what_to_cover ? section.what_to_cover.map((point, i) => `
// ## ${i + 1}. ${point}

// <div class="text-gray-600 text-sm mb-4">Point essentiel à retenir</div>
// `).join('') : '## Contenu principal\n\n<div class="text-gray-600">Points à développer</div>'}

// <div class="mt-8 p-4 bg-blue-50 rounded-lg">
//   <div class="text-blue-800">
//     💡 <strong>Résumé:</strong> ${section.content_summary || 'Points clés de cette section'}
//   </div>
// </div>`;
//         } else if (section.type === 'conclusion') {
//             return `
// ---
// layout: center
// class: text-center
// ---

// # ${section.title}

// ${section.what_to_cover ? section.what_to_cover.map(point => `✅ ${point}`).join('\n\n') : '✅ Récapitulatif\n\n✅ Prochaines étapes'}

// <div class="pt-8">
//   <span class="px-6 py-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-lg">
//     🎯 À vous de jouer !
//   </span>
// </div>`;
//         }
//         return '';
//     }).join('')}

// ---
// layout: end
// ---

// # Merci !

// <div class="text-center">
//   <div class="text-6xl mb-4">🎉</div>
//   <div class="text-2xl">Formation terminée</div>
//   <div class="text-lg text-gray-600 mt-2">Durée: ${duration} minutes</div>
// </div>

// Génère UNIQUEMENT ce Markdown, rien d'autre.`;
// }

// // Nettoyer le markdown reçu
// function cleanMarkdown(markdown) {
//     return markdown
//         .replace(/```markdown\n/g, '')
//         .replace(/\n```/g, '')
//         .replace(/```/g, '')
//         .trim();
// }

// // Fallback simple
// function createFallbackMarkdown(planData) {
//     const { topic, plan_sections, settings } = planData;
//     const { level = 'beginner', duration = 5 } = settings || {};

//     return `---
// theme: academic
// background: linear-gradient(45deg, #1e3c72, #2a5298)
// class: text-center
// highlighter: shiki
// title: ${topic}
// ---

// # ${topic}
// ## Formation ${duration} minutes

// <div class="pt-12">
//   <span @click="$slidev.nav.next" class="px-4 py-2 rounded cursor-pointer bg-blue-600 text-white">
//     🚀 Commencer
//   </span>
// </div>

// ${plan_sections.map(section => `
// ---
// layout: default
// ---

// # ${section.title}

// ${section.what_to_cover ? section.what_to_cover.map(point => `- ${point}`).join('\n') : '- Contenu à développer'}

// <div class="mt-4 text-sm text-gray-600">
// ⏱️ ${section.duration_seconds}s • ${section.type}
// </div>
// `).join('')}

// ---
// layout: end
// ---

// # Merci !

// Formation ${topic} terminée 🎉`;
// }

// // Route pour sauvegarder directement
// router.post('/save-markdown-file', async (req, res) => {
//     try {
//         const { markdown, filename } = req.body;

//         if (!markdown) {
//             return res.status(400).json({
//                 error: 'Le champ "markdown" est requis'
//             });
//         }

//         const fs = require('fs').promises;
//         const path = require('path');

//         const slidesDir = path.join(__dirname, '..', '..', 'generated-slides');
//         await fs.mkdir(slidesDir, { recursive: true });

//         const finalFilename = filename || `slides_${Date.now()}.md`;
//         const filepath = path.join(slidesDir, finalFilename);

//         await fs.writeFile(filepath, markdown, 'utf8');

//         res.json({
//             message: 'Fichier sauvé avec succès',
//             filename: finalFilename,
//             filepath,
//             slidev_command: `cd generated-slides && slidev ${finalFilename}`,
//             next_steps: [
//                 'cd generated-slides',
//                 `slidev ${finalFilename}`,
//                 'Ouvrir http://localhost:3030'
//             ]
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: 'Erreur sauvegarde',
//             details: error.message
//         });
//     }
// });

// // Route d'info
// router.get('/plan-to-markdown/info', (req, res) => {
//     res.json({
//         endpoint: 'POST /ai/plan-to-markdown',
//         description: 'Convertit le JSON de groq-plan en Markdown Slidev',
//         usage: [
//             '1. POST /ai/groq-plan → Copier tout le JSON',
//             '2. POST /ai/plan-to-markdown → Coller le JSON',
//             '3. Récupérer le markdown → Prêt pour Slidev'
//         ],
//         input: 'Tout le JSON retourné par /ai/groq-plan',
//         output: {
//             markdown: 'Markdown Slidev complet et fonctionnel',
//             slidev_commands: 'Commandes pour utiliser avec Slidev'
//         },
//         independence: 'APIs complètement indépendantes'
//     });
// });

// module.exports = router;













// // code optimiser qui prend juste l'ia du plan
// // src/apis/plan-to-markdown.js - Convertit DIRECTEMENT plan JSON → Markdown Slidev
// const express = require('express');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');

// const router = express.Router();

// // Fonction Groq
// async function callGroq(prompt, options = {}) {
//     try {
//         const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
//             model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
//             messages: [
//                 {
//                     role: 'system',
//                     content: 'Tu es un expert Slidev. Tu convertis des plans JSON en Markdown Slidev parfait. Réponds UNIQUEMENT avec du Markdown Slidev valide.'
//                 },
//                 {
//                     role: 'user',
//                     content: prompt
//                 }
//             ],
//             temperature: options.temperature || 0.6,
//             max_tokens: options.max_tokens || 3500
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         return response.data.choices[0].message.content;
//     } catch (error) {
//         console.error('❌ Erreur Groq plan-to-markdown:', error.message);
//         throw new Error('Erreur génération markdown IA');
//     }
// }

// // API POST /ai/plan-to-markdown - Prend le JSON de groq-plan et génère le markdown
// router.post('/plan-to-markdown', async (req, res) => {
//     const startTime = Date.now();

//     try {
//         let groqPlanData;

//         // Option 1: Si juste plan_id est fourni
//         if (req.body.plan_id && !req.body.plan_sections) {
//             console.log(`🔍 Recherche du plan avec ID: ${req.body.plan_id}`);

//             // Pour l'instant, utilisons le plan que vous avez fourni comme exemple
//             // TODO: Remplacer par votre vraie logique de récupération
//             if (req.body.plan_id === "b4244725-309d-4454-89b8-f8bb911125ba") {
//                 groqPlanData = {
//                     "plan_id": "b4244725-309d-4454-89b8-f8bb911125ba",
//                     "topic": "Les 3 erreurs Excel à éviter",
//                     "capsule_type": "demonstrative",
//                     "settings": {
//                         "level": "beginner",
//                         "duration": 5,
//                         "style": "practical"
//                     },
//                     "plan_sections": [
//                         {
//                             "section_number": 1,
//                             "title": "Introduction",
//                             "type": "introduction",
//                             "duration_seconds": 20,
//                             "what_to_cover": [
//                                 "Présentation du sujet et de son importance",
//                                 "Accroche pour capter l'attention du public"
//                             ],
//                             "content_summary": "Introduction au sujet des erreurs Excel à éviter"
//                         },
//                         {
//                             "section_number": 2,
//                             "title": "Développement - Partie 1 : Erreur de formule",
//                             "type": "development",
//                             "duration_seconds": 87,
//                             "what_to_cover": [
//                                 "Définition d'une formule Excel",
//                                 "Exemple d'erreur de formule et comment la corriger",
//                                 "Conseil pour éviter les erreurs de formule"
//                             ],
//                             "content_summary": "Explication de l'erreur de formule et comment l'éviter"
//                         },
//                         {
//                             "section_number": 3,
//                             "title": "Développement - Partie 2 : Erreur de référence",
//                             "type": "development",
//                             "duration_seconds": 87,
//                             "what_to_cover": [
//                                 "Définition d'une référence Excel",
//                                 "Exemple d'erreur de référence et comment la corriger",
//                                 "Conseil pour éviter les erreurs de référence"
//                             ],
//                             "content_summary": "Explication de l'erreur de référence et comment l'éviter"
//                         },
//                         {
//                             "section_number": 4,
//                             "title": "Développement - Partie 3 : Erreur de formatage",
//                             "type": "development",
//                             "duration_seconds": 86,
//                             "what_to_cover": [
//                                 "Définition du formatage Excel",
//                                 "Exemple d'erreur de formatage et comment la corriger",
//                                 "Conseil pour éviter les erreurs de formatage"
//                             ],
//                             "content_summary": "Explication de l'erreur de formatage et comment l'éviter"
//                         },
//                         {
//                             "section_number": 5,
//                             "title": "Conclusion",
//                             "type": "conclusion",
//                             "duration_seconds": 20,
//                             "what_to_cover": [
//                                 "Récapitulation des 3 erreurs Excel à éviter",
//                                 "Appel à l'action pour mettre en pratique les conseils"
//                             ],
//                             "content_summary": "Conclusion et appel à l'action pour les spectateurs"
//                         }
//                     ]
//                 };
//             } else {
//                 return res.status(404).json({
//                     error: 'Plan non trouvé',
//                     plan_id: req.body.plan_id,
//                     message: 'Ce plan_id n\'existe pas encore (pour test, utilisez: b4244725-309d-4454-89b8-f8bb911125ba)'
//                 });
//             }
//         }
//         // Option 2: Si plan complet fourni (comportement original)
//         else if (req.body.plan_sections && req.body.topic) {
//             groqPlanData = req.body;
//         }
//         // Option 3: Erreur de validation
//         else {
//             return res.status(400).json({
//                 error: 'Paramètres requis manquants',
//                 options: {
//                     option1: {
//                         description: 'Utiliser plan_id uniquement (recommandé)',
//                         required: ['plan_id'],
//                         example: { plan_id: 'b4244725-309d-4454-89b8-f8bb911125ba' }
//                     },
//                     option2: {
//                         description: 'Utiliser le plan complet (comportement original)',
//                         required: ['plan_sections', 'topic'],
//                         example: 'Copiez-collez TOUT le résultat de POST /ai/groq-plan'
//                     }
//                 }
//             });
//         }

//         console.log(`📄 Conversion plan → markdown: ${groqPlanData.topic}`);

//         // Créer le prompt
//         const prompt = createMarkdownPrompt(groqPlanData);

//         // Générer avec Groq
//         const markdownResponse = await callGroq(prompt);

//         // Nettoyer le markdown
//         let slideMarkdown = cleanMarkdown(markdownResponse);

//         // Fallback si problème
//         if (!slideMarkdown.includes('---\ntheme:')) {
//             slideMarkdown = createFallbackMarkdown(groqPlanData);
//         }

//         const slidesId = uuidv4();
//         const totalTime = Date.now() - startTime;
//         const slideCount = (slideMarkdown.match(/^---$/gm) || []).length;

//         const result = {
//             slides_id: slidesId,

//             // RÉSULTAT PRINCIPAL
//             markdown: slideMarkdown,

//             // Infos
//             slides_count: slideCount,
//             topic: groqPlanData.topic,
//             source_plan_id: groqPlanData.plan_id,

//             // Fichier
//             filename: `slides_${slidesId}.md`,
//             file_size_kb: Math.round(slideMarkdown.length / 1024),

//             // Commandes Slidev
//             slidev_commands: {
//                 preview: `slidev slides_${slidesId}.md`,
//                 export_pdf: `slidev export slides_${slidesId}.md --format pdf`,
//                 export_html: `slidev export slides_${slidesId}.md --format html`
//             },

//             // Métadonnées
//             generation_time_ms: totalTime,
//             generated_at: new Date().toISOString(),
//             status: 'completed',
//             ready_for_slidev: true
//         };

//         console.log(`✅ Markdown généré: ${slideCount} slides en ${totalTime}ms`);
//         res.json(result);

//     } catch (error) {
//         const totalTime = Date.now() - startTime;
//         console.error('❌ Erreur plan-to-markdown:', error);
//         res.status(500).json({
//             error: 'Erreur génération markdown',
//             generation_time_ms: totalTime,
//             details: error.message
//         });
//     }
// });

// // Fonction pour créer le prompt
// function createMarkdownPrompt(planData) {
//     const { topic, plan_sections, settings } = planData;
//     const { level = 'beginner', duration = 5, style = 'practical' } = settings || {};

//     return `Convertis ce plan en Markdown Slidev parfait:

// PLAN À CONVERTIR:
// Sujet: ${topic}
// Niveau: ${level}
// Durée: ${duration} minutes
// Style: ${style}

// SECTIONS:
// ${plan_sections.map((section, i) =>
//         `${i + 1}. ${section.title} (${section.duration_seconds}s)
//    Type: ${section.type}
//    Points: ${section.what_to_cover ? section.what_to_cover.join(', ') : 'À développer'}
//    Résumé: ${section.content_summary || 'Contenu de la section'}`
//     ).join('\n\n')}

// GÉNÈRE ce Markdown Slidev EXACT:

// ---
// theme: academic
// background: linear-gradient(45deg, #1e3c72, #2a5298)
// class: text-center
// highlighter: shiki
// lineNumbers: false
// info: |
//   ## ${topic}
//   Formation ${duration} minutes - Niveau ${level}
// drawings:
//   persist: false
// transition: slide-left
// title: ${topic}
// ---

// # ${topic}
// ## Formation ${duration} minutes

// <div class="pt-12">
//   <span @click="$slidev.nav.next" class="px-4 py-2 rounded-lg cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold transition-all">
//     🚀 Commencer <carbon:arrow-right class="inline ml-2"/>
//   </span>
// </div>

// ${plan_sections.map((section, index) => {
//         if (section.type === 'introduction') {
//             return `
// ---
// layout: intro
// class: text-left
// ---

// # ${section.title}

// ${section.what_to_cover ? section.what_to_cover.map(point => `- ${point}`).join('\n') : '- Introduction au sujet\n- Objectifs de la formation'}

// <div class="mt-8 flex gap-3">
//   <div class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
//     ⏱️ ${section.duration_seconds}s
//   </div>
//   <div class="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
//     📚 Introduction
//   </div>
// </div>`;
//         } else if (section.type === 'development') {
//             return `
// ---
// layout: default
// ---

// # ${section.title}

// ${section.what_to_cover ? section.what_to_cover.map((point, i) => `
// ## ${i + 1}. ${point}

// <div class="text-gray-600 text-sm mb-4">Point essentiel à retenir</div>
// `).join('') : '## Contenu principal\n\n<div class="text-gray-600">Points à développer</div>'}

// <div class="mt-8 p-4 bg-blue-50 rounded-lg">
//   <div class="text-blue-800">
//     💡 <strong>Résumé:</strong> ${section.content_summary || 'Points clés de cette section'}
//   </div>
// </div>`;
//         } else if (section.type === 'conclusion') {
//             return `
// ---
// layout: center
// class: text-center
// ---

// # ${section.title}

// ${section.what_to_cover ? section.what_to_cover.map(point => `✅ ${point}`).join('\n\n') : '✅ Récapitulatif\n\n✅ Prochaines étapes'}

// <div class="pt-8">
//   <span class="px-6 py-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-lg">
//     🎯 À vous de jouer !
//   </span>
// </div>`;
//         }
//         return '';
//     }).join('')}

// ---
// layout: end
// ---

// # Merci !

// <div class="text-center">
//   <div class="text-6xl mb-4">🎉</div>
//   <div class="text-2xl">Formation terminée</div>
//   <div class="text-lg text-gray-600 mt-2">Durée: ${duration} minutes</div>
// </div>

// Génère UNIQUEMENT ce Markdown, rien d'autre.`;
// }

// // Nettoyer le markdown reçu
// function cleanMarkdown(markdown) {
//     return markdown
//         .replace(/```markdown\n/g, '')
//         .replace(/\n```/g, '')
//         .replace(/```/g, '')
//         .trim();
// }

// // Fallback simple
// function createFallbackMarkdown(planData) {
//     const { topic, plan_sections, settings } = planData;
//     const { level = 'beginner', duration = 5 } = settings || {};

//     return `---
// theme: academic
// background: linear-gradient(45deg, #1e3c72, #2a5298)
// class: text-center
// highlighter: shiki
// title: ${topic}
// ---

// # ${topic}
// ## Formation ${duration} minutes

// <div class="pt-12">
//   <span @click="$slidev.nav.next" class="px-4 py-2 rounded cursor-pointer bg-blue-600 text-white">
//     🚀 Commencer
//   </span>
// </div>

// ${plan_sections.map(section => `
// ---
// layout: default
// ---

// # ${section.title}

// ${section.what_to_cover ? section.what_to_cover.map(point => `- ${point}`).join('\n') : '- Contenu à développer'}

// <div class="mt-4 text-sm text-gray-600">
// ⏱️ ${section.duration_seconds}s • ${section.type}
// </div>
// `).join('')}

// ---
// layout: end
// ---

// # Merci !

// Formation ${topic} terminée 🎉`;
// }

// // Route pour sauvegarder directement
// router.post('/save-markdown-file', async (req, res) => {
//     try {
//         const { markdown, filename } = req.body;

//         if (!markdown) {
//             return res.status(400).json({
//                 error: 'Le champ "markdown" est requis'
//             });
//         }

//         const fs = require('fs').promises;
//         const path = require('path');

//         const slidesDir = path.join(__dirname, '..', '..', 'generated-slides');
//         await fs.mkdir(slidesDir, { recursive: true });

//         const finalFilename = filename || `slides_${Date.now()}.md`;
//         const filepath = path.join(slidesDir, finalFilename);

//         await fs.writeFile(filepath, markdown, 'utf8');

//         res.json({
//             message: 'Fichier sauvé avec succès',
//             filename: finalFilename,
//             filepath,
//             slidev_command: `cd generated-slides && slidev ${finalFilename}`,
//             next_steps: [
//                 'cd generated-slides',
//                 `slidev ${finalFilename}`,
//                 'Ouvrir http://localhost:3030'
//             ]
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: 'Erreur sauvegarde',
//             details: error.message
//         });
//     }
// });

// // Route d'info mise à jour
// router.get('/plan-to-markdown/info', (req, res) => {
//     res.json({
//         endpoint: 'POST /ai/plan-to-markdown',
//         description: 'Convertit un plan en Markdown Slidev',
//         usage_options: {
//             option1: {
//                 description: 'Utiliser plan_id uniquement (recommandé)',
//                 steps: [
//                     '1. POST /ai/groq-plan → Noter le plan_id',
//                     '2. POST /ai/plan-to-markdown avec { "plan_id": "..." }',
//                     '3. Récupérer le markdown → Prêt pour Slidev'
//                 ],
//                 input: { plan_id: 'b4244725-309d-4454-89b8-f8bb911125ba' },
//                 advantages: ['Plus simple', 'Moins de données', 'Plus rapide']
//             },
//             option2: {
//                 description: 'Utiliser le plan complet (comportement original)',
//                 steps: [
//                     '1. POST /ai/groq-plan → Copier tout le JSON',
//                     '2. POST /ai/plan-to-markdown → Coller le JSON',
//                     '3. Récupérer le markdown → Prêt pour Slidev'
//                 ],
//                 input: 'Tout le JSON retourné par /ai/groq-plan'
//             }
//         },
//         output: {
//             markdown: 'Markdown Slidev complet et fonctionnel',
//             slidev_commands: 'Commandes pour utiliser avec Slidev'
//         },
//         independence: 'APIs complètement indépendantes'
//     });
// });

// module.exports = router;












// code qui marche meme que le precedent avec script de narration
// src/apis/plan-to-markdown.js - Convertit plan JSON → Markdown Slidev + Script de Narration
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Fonction Groq
async function callGroq(prompt, options = {}) {
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: options.system_content || 'Tu es un expert Slidev. Tu convertis des plans JSON en Markdown Slidev parfait. Réponds UNIQUEMENT avec du Markdown Slidev valide.'
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

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('❌ Erreur Groq:', error.message);
        throw new Error('Erreur génération IA');
    }
}

// API POST /ai/plan-to-markdown - Génère Markdown + Script de Narration
router.post('/plan-to-markdown', async (req, res) => {
    const startTime = Date.now();

    try {
        // Validation
        if (!req.body.plan_sections || !req.body.topic) {
            return res.status(400).json({
                error: 'Format invalide',
                required: ['plan_sections', 'topic'],
                format: 'Copiez-collez TOUT le résultat de POST /ai/groq-plan',
                example_usage: 'Résultat groq-plan → Input plan-to-markdown'
            });
        }

        const groqPlanData = req.body;
        console.log(`📄 Génération Markdown + Script: ${groqPlanData.topic}`);

        // 1. Générer le Markdown Slidev
        console.log('🎨 Génération du Markdown Slidev...');
        const markdownPrompt = createMarkdownPrompt(groqPlanData);
        const markdownResponse = await callGroq(markdownPrompt);
        let slideMarkdown = cleanMarkdown(markdownResponse);

        // Fallback Markdown si nécessaire
        if (!slideMarkdown.includes('---\ntheme:')) {
            slideMarkdown = createFallbackMarkdown(groqPlanData);
        }

        // 2. Générer le Script de Narration
        console.log('🎬 Génération du script de narration...');
        const narrationPrompt = createNarrationPrompt(groqPlanData);
        const narrationResponse = await callGroq(narrationPrompt, {
            system_content: 'Tu es un expert en narration vidéo. Tu crées des scripts naturels et engageants pour des capsules vidéo éducatives. Réponds UNIQUEMENT avec du JSON valide.',
            max_tokens: 4000
        });

        let narrationScript;
        try {
            // Nettoyer et parser le JSON de narration
            const cleanedNarration = narrationResponse
                .replace(/```json\n/g, '')
                .replace(/\n```/g, '')
                .replace(/```/g, '')
                .trim();

            narrationScript = JSON.parse(cleanedNarration);
        } catch (parseError) {
            console.warn('⚠️ Erreur parsing narration, génération fallback...');
            narrationScript = createFallbackNarration(groqPlanData);
        }

        // 3. Préparer la réponse complète
        const slidesId = uuidv4();
        const totalTime = Date.now() - startTime;
        const slideCount = (slideMarkdown.match(/^---$/gm) || []).length;

        const result = {
            slides_id: slidesId,

            // RÉSULTATS PRINCIPAUX
            markdown: slideMarkdown,
            narration_script: narrationScript,

            // Infos générales
            slides_count: slideCount,
            topic: groqPlanData.topic,
            source_plan_id: groqPlanData.plan_id,

            // Fichiers
            files: {
                markdown: `slides_${slidesId}.md`,
                narration: `narration_${slidesId}.json`,
                script_txt: `script_${slidesId}.txt`
            },

            file_sizes: {
                markdown_kb: Math.round(slideMarkdown.length / 1024),
                narration_kb: Math.round(JSON.stringify(narrationScript).length / 1024)
            },

            // Commandes Slidev
            slidev_commands: {
                preview: `slidev slides_${slidesId}.md`,
                export_pdf: `slidev export slides_${slidesId}.md --format pdf`,
                export_html: `slidev export slides_${slidesId}.md --format html`
            },

            // Utilisation vidéo
            video_production: {
                total_duration_seconds: groqPlanData.plan_sections.reduce((sum, section) => sum + section.duration_seconds, 0),
                slides_with_timing: Object.keys(narrationScript).length,
                ready_for_recording: true
            },

            // Métadonnées
            generation_time_ms: totalTime,
            generated_at: new Date().toISOString(),
            status: 'completed',
            ready_for_production: true
        };

        console.log(`✅ Génération complète: ${slideCount} slides + script en ${totalTime}ms`);
        res.json(result);

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error('❌ Erreur plan-to-markdown:', error);
        res.status(500).json({
            error: 'Erreur génération complète',
            generation_time_ms: totalTime,
            details: error.message
        });
    }
});

// Fonction pour créer le prompt Markdown (inchangée)
function createMarkdownPrompt(planData) {
    const { topic, plan_sections, settings } = planData;
    const { level = 'beginner', duration = 5, style = 'practical' } = settings || {};

    return `Convertis ce plan en Markdown Slidev parfait:

PLAN À CONVERTIR:
Sujet: ${topic}
Niveau: ${level}
Durée: ${duration} minutes
Style: ${style}

SECTIONS:
${plan_sections.map((section, i) =>
        `${i + 1}. ${section.title} (${section.duration_seconds}s)
   Type: ${section.type}
   Points: ${section.what_to_cover ? section.what_to_cover.join(', ') : 'À développer'}
   Résumé: ${section.content_summary || 'Contenu de la section'}`
    ).join('\n\n')}

GÉNÈRE ce Markdown Slidev EXACT:

---
theme: academic
background: linear-gradient(45deg, #1e3c72, #2a5298)
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## ${topic}
  Formation ${duration} minutes - Niveau ${level}
drawings:
  persist: false
transition: slide-left
title: ${topic}
---

# ${topic}
## Formation ${duration} minutes

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-4 py-2 rounded-lg cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold transition-all">
    🚀 Commencer <carbon:arrow-right class="inline ml-2"/>
  </span>
</div>

${plan_sections.map((section, index) => {
        if (section.type === 'introduction') {
            return `
---
layout: intro
class: text-left
---

# ${section.title}

${section.what_to_cover ? section.what_to_cover.map(point => `- ${point}`).join('\n') : '- Introduction au sujet\n- Objectifs de la formation'}

<div class="mt-8 flex gap-3">
  <div class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
    ⏱️ ${section.duration_seconds}s
  </div>
  <div class="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
    📚 Introduction
  </div>
</div>`;
        } else if (section.type === 'development') {
            return `
---
layout: default
---

# ${section.title}

${section.what_to_cover ? section.what_to_cover.map((point, i) => `
## ${i + 1}. ${point}

<div class="text-gray-600 text-sm mb-4">Point essentiel à retenir</div>
`).join('') : '## Contenu principal\n\n<div class="text-gray-600">Points à développer</div>'}

<div class="mt-8 p-4 bg-blue-50 rounded-lg">
  <div class="text-blue-800">
    💡 <strong>Résumé:</strong> ${section.content_summary || 'Points clés de cette section'}
  </div>
</div>`;
        } else if (section.type === 'conclusion') {
            return `
---
layout: center
class: text-center
---

# ${section.title}

${section.what_to_cover ? section.what_to_cover.map(point => `✅ ${point}`).join('\n\n') : '✅ Récapitulatif\n\n✅ Prochaines étapes'}

<div class="pt-8">
  <span class="px-6 py-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-lg">
    🎯 À vous de jouer !
  </span>
</div>`;
        }
        return '';
    }).join('')}

---
layout: end
---

# Merci !

<div class="text-center">
  <div class="text-6xl mb-4">🎉</div>
  <div class="text-2xl">Formation terminée</div>
  <div class="text-lg text-gray-600 mt-2">Durée: ${duration} minutes</div>
</div>

Génère UNIQUEMENT ce Markdown, rien d'autre.`;
}

// NOUVELLE FONCTION pour créer le prompt de narration
function createNarrationPrompt(planData) {
    const { topic, plan_sections, settings } = planData;
    const { level = 'beginner', duration = 5, style = 'practical' } = settings || {};

    return `Crée un script de narration pour cette capsule vidéo:

INFORMATIONS:
Sujet: ${topic}
Niveau: ${level}
Durée totale: ${duration} minutes
Style: ${style}

SECTIONS À NARRER:
${plan_sections.map((section, i) =>
        `Slide ${i + 1}: ${section.title}
   - Durée: ${section.duration_seconds} secondes
   - Type: ${section.type}
   - Points à couvrir: ${section.what_to_cover ? section.what_to_cover.join(', ') : 'Contenu général'}
   - Résumé: ${section.content_summary || 'Section importante'}`
    ).join('\n\n')}

GÉNÈRE ce JSON de narration EXACT:

{
  "slide_1": {
    "title": "${plan_sections[0]?.title || 'Introduction'}",
    "duration_seconds": ${plan_sections[0]?.duration_seconds || 20},
    "script": "Script naturel et engageant pour l'introduction. Ton accueillant et motivant.",
    "tone": "accueillant",
    "key_phrases": ["phrase importante 1", "phrase importante 2"],
    "transitions": "Transition vers la slide suivante"
  },
${plan_sections.slice(1).map((section, index) => `  "slide_${index + 2}": {
    "title": "${section.title}",
    "duration_seconds": ${section.duration_seconds},
    "script": "Script naturel pour ${section.title}. Explique ${section.what_to_cover ? section.what_to_cover[0] : 'le contenu'} de manière claire et pédagogique.",
    "tone": "${section.type === 'introduction' ? 'accueillant' : section.type === 'conclusion' ? 'motivant' : 'pédagogique'}",
    "key_phrases": ["point clé 1", "point clé 2"],
    "transitions": "Enchaînement naturel vers la suite"
  }`).join(',\n')}
}

RÈGLES pour le script:
- Ton naturel et conversationnel
- Phrases courtes et claires
- Éviter le jargon technique excessif
- Inclure des transitions fluides
- Adapter le rythme à la durée
- Garder l'attention du spectateur

Génère UNIQUEMENT ce JSON, rien d'autre.`;
}

// Fonction de nettoyage markdown (inchangée)
function cleanMarkdown(markdown) {
    return markdown
        .replace(/```markdown\n/g, '')
        .replace(/\n```/g, '')
        .replace(/```/g, '')
        .trim();
}

// Fallback markdown (inchangé)
function createFallbackMarkdown(planData) {
    const { topic, plan_sections, settings } = planData;
    const { level = 'beginner', duration = 5 } = settings || {};

    return `---
theme: academic
background: linear-gradient(45deg, #1e3c72, #2a5298)
class: text-center
highlighter: shiki
title: ${topic}
---

# ${topic}
## Formation ${duration} minutes

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-4 py-2 rounded cursor-pointer bg-blue-600 text-white">
    🚀 Commencer
  </span>
</div>

${plan_sections.map(section => `
---
layout: default
---

# ${section.title}

${section.what_to_cover ? section.what_to_cover.map(point => `- ${point}`).join('\n') : '- Contenu à développer'}

<div class="mt-4 text-sm text-gray-600">
⏱️ ${section.duration_seconds}s • ${section.type}
</div>
`).join('')}

---
layout: end
---

# Merci !

Formation ${topic} terminée 🎉`;
}

// NOUVELLE FONCTION de fallback pour la narration
function createFallbackNarration(planData) {
    const { plan_sections } = planData;
    const narration = {};

    plan_sections.forEach((section, index) => {
        const slideKey = `slide_${index + 1}`;
        let tone = 'pédagogique';
        let defaultScript = `Nous allons maintenant aborder ${section.title}.`;

        if (section.type === 'introduction') {
            tone = 'accueillant';
            defaultScript = `Bonjour et bienvenue dans cette formation sur ${section.title}.`;
        } else if (section.type === 'conclusion') {
            tone = 'motivant';
            defaultScript = `Pour conclure, retenez bien les points que nous venons de voir.`;
        }

        narration[slideKey] = {
            title: section.title,
            duration_seconds: section.duration_seconds,
            script: defaultScript,
            tone: tone,
            key_phrases: section.what_to_cover ? section.what_to_cover.slice(0, 2) : ["Point important"],
            transitions: "Passons maintenant à la suite."
        };
    });

    return narration;
}

// Route pour sauvegarder les fichiers (mise à jour)
router.post('/save-files', async (req, res) => {
    try {
        const { markdown, narration_script, slides_id } = req.body;

        if (!markdown) {
            return res.status(400).json({
                error: 'Le champ "markdown" est requis'
            });
        }

        const fs = require('fs').promises;
        const path = require('path');

        const slidesDir = path.join(__dirname, '..', '..', 'generated-slides');
        await fs.mkdir(slidesDir, { recursive: true });

        const baseFilename = slides_id || `slides_${Date.now()}`;

        // Sauvegarder le markdown
        const markdownFile = `${baseFilename}.md`;
        const markdownPath = path.join(slidesDir, markdownFile);
        await fs.writeFile(markdownPath, markdown, 'utf8');

        const savedFiles = [markdownFile];

        // Sauvegarder le script de narration si fourni
        if (narration_script) {
            const narrationFile = `narration_${baseFilename}.json`;
            const narrationPath = path.join(slidesDir, narrationFile);
            await fs.writeFile(narrationPath, JSON.stringify(narration_script, null, 2), 'utf8');
            savedFiles.push(narrationFile);

            // Créer aussi un fichier texte simple du script
            const scriptText = Object.entries(narration_script)
                .map(([slide, data]) => `=== ${data.title} (${data.duration_seconds}s) ===\n${data.script}\n`)
                .join('\n');

            const scriptFile = `script_${baseFilename}.txt`;
            const scriptPath = path.join(slidesDir, scriptFile);
            await fs.writeFile(scriptPath, scriptText, 'utf8');
            savedFiles.push(scriptFile);
        }

        res.json({
            message: 'Fichiers sauvés avec succès',
            saved_files: savedFiles,
            directory: slidesDir,
            slidev_command: `cd generated-slides && slidev ${markdownFile}`,
            next_steps: [
                'cd generated-slides',
                `slidev ${markdownFile}`,
                'Ouvrir http://localhost:3030',
                'Utiliser le script de narration pour l\'enregistrement'
            ]
        });

    } catch (error) {
        res.status(500).json({
            error: 'Erreur sauvegarde',
            details: error.message
        });
    }
});

// Route d'info mise à jour
router.get('/plan-to-markdown/info', (req, res) => {
    res.json({
        endpoint: 'POST /ai/plan-to-markdown',
        description: 'Convertit le JSON de groq-plan en Markdown Slidev + Script de Narration',
        new_features: [
            '✨ Génération automatique du script de narration',
            '🎬 Script synchronisé avec chaque slide',
            '⏱️ Timing précis pour la production vidéo',
            '📝 Export en plusieurs formats (JSON, TXT)'
        ],
        usage: [
            '1. POST /ai/groq-plan → Copier tout le JSON',
            '2. POST /ai/plan-to-markdown → Coller le JSON',
            '3. Récupérer markdown + script → Prêt pour production vidéo'
        ],
        input: 'Tout le JSON retourné par /ai/groq-plan',
        output: {
            markdown: 'Markdown Slidev complet et fonctionnel',
            narration_script: 'Script de narration par slide avec timing',
            files: 'Noms des fichiers générés',
            video_production: 'Informations pour la production vidéo'
        },
        video_workflow: [
            '1. Utiliser le markdown pour créer les slides',
            '2. Lire le script de narration slide par slide',
            '3. Respecter les timings indiqués',
            '4. Enregistrer la capsule vidéo complète'
        ]
    });
});

module.exports = router;
