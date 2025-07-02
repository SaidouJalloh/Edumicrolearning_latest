
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












// code qui marche meme que le precedent avec script de narration super top sans l'ajout des doc attachments
// src/apis/plan-to-markdown.js - Convertit plan JSON → Markdown Slidev + Script de Narration
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
//                     content: options.system_content || 'Tu es un expert Slidev. Tu convertis des plans JSON en Markdown Slidev parfait. Réponds UNIQUEMENT avec du Markdown Slidev valide.'
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
//         console.error('❌ Erreur Groq:', error.message);
//         throw new Error('Erreur génération IA');
//     }
// }

// // API POST /ai/plan-to-markdown - Génère Markdown + Script de Narration
// router.post('/plan-to-markdown', async (req, res) => {
//     const startTime = Date.now();

//     try {
//         // Validation
//         if (!req.body.plan_sections || !req.body.topic) {
//             return res.status(400).json({
//                 error: 'Format invalide',
//                 required: ['plan_sections', 'topic'],
//                 format: 'Copiez-collez TOUT le résultat de POST /ai/groq-plan',
//                 example_usage: 'Résultat groq-plan → Input plan-to-markdown'
//             });
//         }

//         const groqPlanData = req.body;
//         console.log(`📄 Génération Markdown + Script: ${groqPlanData.topic}`);

//         // 1. Générer le Markdown Slidev
//         console.log('🎨 Génération du Markdown Slidev...');
//         const markdownPrompt = createMarkdownPrompt(groqPlanData);
//         const markdownResponse = await callGroq(markdownPrompt);
//         let slideMarkdown = cleanMarkdown(markdownResponse);

//         // Fallback Markdown si nécessaire
//         if (!slideMarkdown.includes('---\ntheme:')) {
//             slideMarkdown = createFallbackMarkdown(groqPlanData);
//         }

//         // 2. Générer le Script de Narration
//         console.log('🎬 Génération du script de narration...');
//         const narrationPrompt = createNarrationPrompt(groqPlanData);
//         const narrationResponse = await callGroq(narrationPrompt, {
//             system_content: 'Tu es un expert en narration vidéo. Tu crées des scripts naturels et engageants pour des capsules vidéo éducatives. Réponds UNIQUEMENT avec du JSON valide.',
//             max_tokens: 4000
//         });

//         let narrationScript;
//         try {
//             // Nettoyer et parser le JSON de narration
//             const cleanedNarration = narrationResponse
//                 .replace(/```json\n/g, '')
//                 .replace(/\n```/g, '')
//                 .replace(/```/g, '')
//                 .trim();

//             narrationScript = JSON.parse(cleanedNarration);
//         } catch (parseError) {
//             console.warn('⚠️ Erreur parsing narration, génération fallback...');
//             narrationScript = createFallbackNarration(groqPlanData);
//         }

//         // 3. Préparer la réponse complète
//         const slidesId = uuidv4();
//         const totalTime = Date.now() - startTime;
//         const slideCount = (slideMarkdown.match(/^---$/gm) || []).length;

//         const result = {
//             slides_id: slidesId,

//             // RÉSULTATS PRINCIPAUX
//             markdown: slideMarkdown,
//             narration_script: narrationScript,

//             // Infos générales
//             slides_count: slideCount,
//             topic: groqPlanData.topic,
//             source_plan_id: groqPlanData.plan_id,

//             // Fichiers
//             files: {
//                 markdown: `slides_${slidesId}.md`,
//                 narration: `narration_${slidesId}.json`,
//                 script_txt: `script_${slidesId}.txt`
//             },

//             file_sizes: {
//                 markdown_kb: Math.round(slideMarkdown.length / 1024),
//                 narration_kb: Math.round(JSON.stringify(narrationScript).length / 1024)
//             },

//             // Commandes Slidev
//             slidev_commands: {
//                 preview: `slidev slides_${slidesId}.md`,
//                 export_pdf: `slidev export slides_${slidesId}.md --format pdf`,
//                 export_html: `slidev export slides_${slidesId}.md --format html`
//             },

//             // Utilisation vidéo
//             video_production: {
//                 total_duration_seconds: groqPlanData.plan_sections.reduce((sum, section) => sum + section.duration_seconds, 0),
//                 slides_with_timing: Object.keys(narrationScript).length,
//                 ready_for_recording: true
//             },

//             // Métadonnées
//             generation_time_ms: totalTime,
//             generated_at: new Date().toISOString(),
//             status: 'completed',
//             ready_for_production: true
//         };

//         console.log(`✅ Génération complète: ${slideCount} slides + script en ${totalTime}ms`);
//         res.json(result);

//     } catch (error) {
//         const totalTime = Date.now() - startTime;
//         console.error('❌ Erreur plan-to-markdown:', error);
//         res.status(500).json({
//             error: 'Erreur génération complète',
//             generation_time_ms: totalTime,
//             details: error.message
//         });
//     }
// });

// // Fonction pour créer le prompt Markdown (inchangée)
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

// // NOUVELLE FONCTION pour créer le prompt de narration
// function createNarrationPrompt(planData) {
//     const { topic, plan_sections, settings } = planData;
//     const { level = 'beginner', duration = 5, style = 'practical' } = settings || {};

//     return `Crée un script de narration pour cette capsule vidéo:

// INFORMATIONS:
// Sujet: ${topic}
// Niveau: ${level}
// Durée totale: ${duration} minutes
// Style: ${style}

// SECTIONS À NARRER:
// ${plan_sections.map((section, i) =>
//         `Slide ${i + 1}: ${section.title}
//    - Durée: ${section.duration_seconds} secondes
//    - Type: ${section.type}
//    - Points à couvrir: ${section.what_to_cover ? section.what_to_cover.join(', ') : 'Contenu général'}
//    - Résumé: ${section.content_summary || 'Section importante'}`
//     ).join('\n\n')}

// GÉNÈRE ce JSON de narration EXACT:

// {
//   "slide_1": {
//     "title": "${plan_sections[0]?.title || 'Introduction'}",
//     "duration_seconds": ${plan_sections[0]?.duration_seconds || 20},
//     "script": "Script naturel et engageant pour l'introduction. Ton accueillant et motivant.",
//     "tone": "accueillant",
//     "key_phrases": ["phrase importante 1", "phrase importante 2"],
//     "transitions": "Transition vers la slide suivante"
//   },
// ${plan_sections.slice(1).map((section, index) => `  "slide_${index + 2}": {
//     "title": "${section.title}",
//     "duration_seconds": ${section.duration_seconds},
//     "script": "Script naturel pour ${section.title}. Explique ${section.what_to_cover ? section.what_to_cover[0] : 'le contenu'} de manière claire et pédagogique.",
//     "tone": "${section.type === 'introduction' ? 'accueillant' : section.type === 'conclusion' ? 'motivant' : 'pédagogique'}",
//     "key_phrases": ["point clé 1", "point clé 2"],
//     "transitions": "Enchaînement naturel vers la suite"
//   }`).join(',\n')}
// }

// RÈGLES pour le script:
// - Ton naturel et conversationnel
// - Phrases courtes et claires
// - Éviter le jargon technique excessif
// - Inclure des transitions fluides
// - Adapter le rythme à la durée
// - Garder l'attention du spectateur

// Génère UNIQUEMENT ce JSON, rien d'autre.`;
// }

// // Fonction de nettoyage markdown (inchangée)
// function cleanMarkdown(markdown) {
//     return markdown
//         .replace(/```markdown\n/g, '')
//         .replace(/\n```/g, '')
//         .replace(/```/g, '')
//         .trim();
// }

// // Fallback markdown (inchangé)
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

// // NOUVELLE FONCTION de fallback pour la narration
// function createFallbackNarration(planData) {
//     const { plan_sections } = planData;
//     const narration = {};

//     plan_sections.forEach((section, index) => {
//         const slideKey = `slide_${index + 1}`;
//         let tone = 'pédagogique';
//         let defaultScript = `Nous allons maintenant aborder ${section.title}.`;

//         if (section.type === 'introduction') {
//             tone = 'accueillant';
//             defaultScript = `Bonjour et bienvenue dans cette formation sur ${section.title}.`;
//         } else if (section.type === 'conclusion') {
//             tone = 'motivant';
//             defaultScript = `Pour conclure, retenez bien les points que nous venons de voir.`;
//         }

//         narration[slideKey] = {
//             title: section.title,
//             duration_seconds: section.duration_seconds,
//             script: defaultScript,
//             tone: tone,
//             key_phrases: section.what_to_cover ? section.what_to_cover.slice(0, 2) : ["Point important"],
//             transitions: "Passons maintenant à la suite."
//         };
//     });

//     return narration;
// }

// // Route pour sauvegarder les fichiers (mise à jour)
// router.post('/save-files', async (req, res) => {
//     try {
//         const { markdown, narration_script, slides_id } = req.body;

//         if (!markdown) {
//             return res.status(400).json({
//                 error: 'Le champ "markdown" est requis'
//             });
//         }

//         const fs = require('fs').promises;
//         const path = require('path');

//         const slidesDir = path.join(__dirname, '..', '..', 'generated-slides');
//         await fs.mkdir(slidesDir, { recursive: true });

//         const baseFilename = slides_id || `slides_${Date.now()}`;

//         // Sauvegarder le markdown
//         const markdownFile = `${baseFilename}.md`;
//         const markdownPath = path.join(slidesDir, markdownFile);
//         await fs.writeFile(markdownPath, markdown, 'utf8');

//         const savedFiles = [markdownFile];

//         // Sauvegarder le script de narration si fourni
//         if (narration_script) {
//             const narrationFile = `narration_${baseFilename}.json`;
//             const narrationPath = path.join(slidesDir, narrationFile);
//             await fs.writeFile(narrationPath, JSON.stringify(narration_script, null, 2), 'utf8');
//             savedFiles.push(narrationFile);

//             // Créer aussi un fichier texte simple du script
//             const scriptText = Object.entries(narration_script)
//                 .map(([slide, data]) => `=== ${data.title} (${data.duration_seconds}s) ===\n${data.script}\n`)
//                 .join('\n');

//             const scriptFile = `script_${baseFilename}.txt`;
//             const scriptPath = path.join(slidesDir, scriptFile);
//             await fs.writeFile(scriptPath, scriptText, 'utf8');
//             savedFiles.push(scriptFile);
//         }

//         res.json({
//             message: 'Fichiers sauvés avec succès',
//             saved_files: savedFiles,
//             directory: slidesDir,
//             slidev_command: `cd generated-slides && slidev ${markdownFile}`,
//             next_steps: [
//                 'cd generated-slides',
//                 `slidev ${markdownFile}`,
//                 'Ouvrir http://localhost:3030',
//                 'Utiliser le script de narration pour l\'enregistrement'
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
//         description: 'Convertit le JSON de groq-plan en Markdown Slidev + Script de Narration',
//         new_features: [
//             '✨ Génération automatique du script de narration',
//             '🎬 Script synchronisé avec chaque slide',
//             '⏱️ Timing précis pour la production vidéo',
//             '📝 Export en plusieurs formats (JSON, TXT)'
//         ],
//         usage: [
//             '1. POST /ai/groq-plan → Copier tout le JSON',
//             '2. POST /ai/plan-to-markdown → Coller le JSON',
//             '3. Récupérer markdown + script → Prêt pour production vidéo'
//         ],
//         input: 'Tout le JSON retourné par /ai/groq-plan',
//         output: {
//             markdown: 'Markdown Slidev complet et fonctionnel',
//             narration_script: 'Script de narration par slide avec timing',
//             files: 'Noms des fichiers générés',
//             video_production: 'Informations pour la production vidéo'
//         },
//         video_workflow: [
//             '1. Utiliser le markdown pour créer les slides',
//             '2. Lire le script de narration slide par slide',
//             '3. Respecter les timings indiqués',
//             '4. Enregistrer la capsule vidéo complète'
//         ]
//     });
// });

// module.exports = router;















// avec doc attachments
// groq-fast-plan.js - VERSION COMPLÈTE CORRIGÉE avec un petit soucis avec nombre de slides et nombre de sections dans script de narration
// Résout tous les problèmes d'upload de fichiers et d'ajout de ressources
// plan-to-markdown.js - VERSION PROPRE ET COMPLÈTE
// Utilise intelligemment les ressources des fichiers pour enrichir le markdown

// const express = require('express');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
// const fs = require('fs').promises;
// const path = require('path');

// const router = express.Router();

// // 🤖 Fonction Groq pour génération intelligente
// async function callGroq(prompt, options = {}) {
//     try {
//         const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
//             model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
//             messages: [
//                 {
//                     role: 'system',
//                     content: options.system_content || 'Tu es un expert Slidev qui crée du Markdown sophistiqué en utilisant intelligemment les ressources fournies. Réponds UNIQUEMENT avec du Markdown Slidev valide.'
//                 },
//                 {
//                     role: 'user',
//                     content: prompt
//                 }
//             ],
//             temperature: options.temperature || 0.7,
//             max_tokens: options.max_tokens || 5000
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         return response.data.choices[0].message.content;
//     } catch (error) {
//         console.error('❌ Erreur Groq:', error.message);
//         throw new Error('Erreur génération IA: ' + error.message);
//     }
// }

// // 🎯 API PRINCIPALE - POST /ai/plan-to-markdown
// router.post('/plan-to-markdown', async (req, res) => {
//     const startTime = Date.now();

//     try {
//         // Validation de base
//         if (!req.body.plan_sections || !req.body.topic) {
//             return res.status(400).json({
//                 error: 'Format invalide',
//                 required: ['plan_sections', 'topic'],
//                 format: 'Utilisez TOUT le résultat de POST /ai/groq-plan'
//             });
//         }

//         const groqPlanData = req.body;
//         console.log(`📄 Génération Markdown enrichi: ${groqPlanData.topic}`);

//         // 🔍 ANALYSE DES RESSOURCES DISPONIBLES
//         const resourcesAnalysis = analyzeAvailableResources(groqPlanData);
//         console.log(`📚 Ressources détectées: ${resourcesAnalysis.total_files} fichiers, vocabulaire: ${resourcesAnalysis.vocabulary_adapted}`);

//         // 🎨 GÉNÉRATION MARKDOWN ENRICHI
//         console.log('🎨 Génération Markdown Slidev enrichi...');
//         const markdownPrompt = createEnhancedMarkdownPrompt(groqPlanData, resourcesAnalysis);
//         const markdownResponse = await callGroq(markdownPrompt, {
//             temperature: 0.7,
//             max_tokens: 6000
//         });

//         let slideMarkdown = cleanMarkdown(markdownResponse);

//         // Fallback si nécessaire
//         if (!slideMarkdown.includes('---\ntheme:')) {
//             console.log('🔄 Génération fallback...');
//             slideMarkdown = createFallbackMarkdown(groqPlanData, resourcesAnalysis);
//         }

//         // 🎬 GÉNÉRATION SCRIPT DE NARRATION
//         console.log('🎬 Génération script narration...');
//         const narrationPrompt = createNarrationPrompt(groqPlanData, resourcesAnalysis);
//         const narrationResponse = await callGroq(narrationPrompt, {
//             system_content: 'Tu es un expert en narration qui adapte le discours aux ressources. Réponds UNIQUEMENT avec du JSON valide.',
//             max_tokens: 5000
//         });

//         let narrationScript;
//         try {
//             const cleanedNarration = cleanNarrationResponse(narrationResponse);
//             narrationScript = JSON.parse(cleanedNarration);
//         } catch (parseError) {
//             console.warn('⚠️ Erreur parsing narration, fallback...');
//             narrationScript = createFallbackNarration(groqPlanData, resourcesAnalysis);
//         }

//         // 🏗️ ASSEMBLAGE FINAL
//         const slidesId = uuidv4();
//         const totalTime = Date.now() - startTime;
//         const slideCount = (slideMarkdown.match(/^---$/gm) || []).length;

//         const result = {
//             slides_id: slidesId,

//             // RÉSULTATS PRINCIPAUX (Compatible format existant)
//             markdown: slideMarkdown,
//             narration_script: narrationScript,

//             // INFORMATIONS RESSOURCES
//             resource_integration: {
//                 files_used_in_markdown: resourcesAnalysis.files_content_integrated,
//                 company_context_applied: resourcesAnalysis.company_context_integrated,
//                 vocabulary_adapted: resourcesAnalysis.vocabulary_adapted,
//                 examples_from_files: resourcesAnalysis.extracted_examples,
//                 procedures_integrated: resourcesAnalysis.procedures_integrated,
//                 terminology_used: resourcesAnalysis.key_terminology
//             },

//             // COMPATIBILITÉ AVEC FORMAT EXISTANT
//             slides_count: slideCount,
//             topic: groqPlanData.topic,
//             source_plan_id: groqPlanData.plan_id,

//             files: {
//                 markdown: `resource_slides_${slidesId}.md`,
//                 narration: `narration_${slidesId}.json`,
//                 script_txt: `script_${slidesId}.txt`
//             },

//             file_sizes: {
//                 markdown_kb: Math.round(slideMarkdown.length / 1024),
//                 narration_kb: Math.round(JSON.stringify(narrationScript).length / 1024)
//             },

//             slidev_commands: {
//                 preview: `slidev resource_slides_${slidesId}.md`,
//                 export_pdf: `slidev export resource_slides_${slidesId}.md --format pdf`,
//                 export_html: `slidev export resource_slides_${slidesId}.md --format html`
//             },

//             video_production: {
//                 total_duration_seconds: groqPlanData.plan_sections?.reduce((sum, section) => sum + section.duration_seconds, 0) || 300,
//                 slides_with_timing: Object.keys(narrationScript).length,
//                 ready_for_recording: true,
//                 uses_company_terminology: resourcesAnalysis.vocabulary_adapted,
//                 references_uploaded_files: resourcesAnalysis.files_content_integrated
//             },

//             generation_time_ms: totalTime,
//             generated_at: new Date().toISOString(),
//             status: 'completed',
//             ready_for_production: true,

//             next_steps: {
//                 audio_generation: 'POST /ai/generate-narration-bark avec script adapté',
//                 customization: resourcesAnalysis.company_context_integrated ?
//                     'Contenu déjà adapté à votre contexte' :
//                     'Personnaliser selon votre contexte'
//             }
//         };

//         console.log(`✅ Génération complète: ${slideCount} slides, ${resourcesAnalysis.total_files} fichiers intégrés, ${totalTime}ms`);
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

// // 🔍 ANALYSE DES RESSOURCES DISPONIBLES
// function analyzeAvailableResources(groqPlanData) {
//     const analysis = {
//         total_files: 0,
//         files_content_integrated: false,
//         company_context_integrated: false,
//         vocabulary_adapted: false,
//         procedures_integrated: false,
//         examples_extracted: false,
//         key_terminology: [],
//         extracted_examples: [],
//         file_references: [],
//         adaptation_quality: 'basic'
//     };

//     // Analyser les fichiers traités
//     if (groqPlanData.files_processing) {
//         analysis.total_files = groqPlanData.files_processing.processed_successfully || 0;
//         analysis.files_content_integrated = analysis.total_files > 0;

//         if (groqPlanData.files_processing.processed_files) {
//             groqPlanData.files_processing.processed_files.forEach(file => {
//                 if (file.status === 'parsed') {
//                     analysis.file_references.push({
//                         name: file.name,
//                         type: file.content_type,
//                         topics: file.key_topics
//                     });

//                     if (file.has_procedures) analysis.procedures_integrated = true;
//                     if (file.has_examples) analysis.examples_extracted = true;
//                     if (file.key_topics) analysis.key_terminology.push(...file.key_topics);
//                 }
//             });
//         }
//     }

//     // Analyser l'enrichissement
//     if (groqPlanData.resources_enrichment) {
//         analysis.company_context_integrated = groqPlanData.resources_enrichment.has_company_context;
//         analysis.vocabulary_adapted = groqPlanData.resources_enrichment.adaptation_applied?.vocabulary_adapted || false;
//     }

//     // Extraire des sections du plan
//     if (groqPlanData.plan_sections) {
//         groqPlanData.plan_sections.forEach(section => {
//             if (section.enhanced_with_resources) {
//                 if (section.key_terminology) {
//                     analysis.key_terminology.push(...section.key_terminology);
//                 }
//                 if (section.examples_from_resources) {
//                     analysis.extracted_examples.push(...section.examples_from_resources);
//                 }
//             }
//         });
//     }

//     // Déduplication
//     analysis.key_terminology = [...new Set(analysis.key_terminology.flat())].slice(0, 10);
//     analysis.extracted_examples = [...new Set(analysis.extracted_examples.flat())].slice(0, 8);

//     // Calcul qualité
//     if (analysis.files_content_integrated && analysis.vocabulary_adapted && analysis.company_context_integrated) {
//         analysis.adaptation_quality = 'excellent';
//     } else if (analysis.files_content_integrated || analysis.vocabulary_adapted) {
//         analysis.adaptation_quality = 'good';
//     }

//     return analysis;
// }

// // 🎨 CRÉATION PROMPT MARKDOWN ENRICHI
// function createEnhancedMarkdownPrompt(planData, resourcesAnalysis) {
//     const { topic, plan_sections, settings } = planData;
//     const { level = 'beginner', duration = 5, style = 'practical' } = settings || {};

//     let prompt = `Crée un Markdown Slidev sophistiqué qui utilise les ressources fournies:

// INFORMATIONS:
// - Sujet: ${topic}
// - Niveau: ${level}
// - Durée: ${duration} minutes
// - Style: ${style}

// RESSOURCES DISPONIBLES:
// - Fichiers traités: ${resourcesAnalysis.total_files}
// - Contexte entreprise: ${resourcesAnalysis.company_context_integrated ? 'OUI' : 'NON'}
// - Vocabulaire adapté: ${resourcesAnalysis.vocabulary_adapted ? 'OUI' : 'NON'}
// - Procédures: ${resourcesAnalysis.procedures_integrated ? 'OUI' : 'NON'}
// - Exemples: ${resourcesAnalysis.examples_extracted ? 'OUI' : 'NON'}`;

//     if (resourcesAnalysis.key_terminology.length > 0) {
//         prompt += `\n\nTERMINOLOGIE À UTILISER:\n${resourcesAnalysis.key_terminology.join(', ')}`;
//     }

//     if (resourcesAnalysis.extracted_examples.length > 0) {
//         prompt += `\n\nEXEMPLES À INTÉGRER:\n${resourcesAnalysis.extracted_examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}`;
//     }

//     if (resourcesAnalysis.file_references.length > 0) {
//         prompt += `\n\nFICHIERS À RÉFÉRENCER:\n${resourcesAnalysis.file_references.map(ref => `- ${ref.name}: ${ref.type}`).join('\n')}`;
//     }

//     prompt += `\n\nSECTIONS DU PLAN:\n${plan_sections.map((section, i) => {
//         return `${i + 1}. ${section.title} (${section.duration_seconds}s)\n   Points: ${section.what_to_cover ? section.what_to_cover.join(', ') : 'À développer'}`;
//     }).join('\n\n')}`;

//     prompt += `\n\nGÉNÈRE un Markdown Slidev enrichi avec intégration des ressources:

// ---
// theme: ${resourcesAnalysis.company_context_integrated ? 'corporate' : 'academic'}
// background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
// class: text-center
// highlighter: shiki
// lineNumbers: true
// title: ${topic}
// ---

// # ${topic}
// ## Formation ${duration} minutes${resourcesAnalysis.company_context_integrated ? ' - Adaptée à votre contexte' : ''}

// ${resourcesAnalysis.files_content_integrated ? `
// <div class="opacity-80 text-sm mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
//   📚 Formation enrichie par ${resourcesAnalysis.total_files} document(s)
// </div>
// ` : ''}

// <div class="pt-8">
//   <span @click="$slidev.nav.next" class="px-6 py-3 rounded-lg cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
//     🚀 Commencer
//   </span>
// </div>

// ${plan_sections.map((section, index) => {
//         if (section.type === 'introduction') {
//             return `
// ---
// layout: intro
// ---

// # ${section.title}

// ${section.what_to_cover ? section.what_to_cover.map(point => `- **${point}**`).join('\n') : '- Introduction au sujet'}

// ${section.enhanced_with_resources && resourcesAnalysis.extracted_examples.length > 0 ? `
// <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//   <h3 class="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-300">
//     💡 Basé sur vos ressources
//   </h3>
//   <div class="text-sm space-y-2">
// ${resourcesAnalysis.extracted_examples.slice(0, 2).map(example => `    <div>• ${example}</div>`).join('\n')}
//   </div>
// </div>
// ` : ''}

// <div class="mt-6">
//   <div class="px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm inline-block">
//     ⏱️ ${section.duration_seconds}s
//   </div>
// </div>`;

//         } else if (section.type === 'development') {
//             return `
// ---
// layout: two-cols
// ---

// # ${section.title}

// <template v-slot:default>

// ${section.what_to_cover ? section.what_to_cover.map((point, i) => `
// ## ${i + 1}. ${point}

// ${section.enhanced_with_resources ? `
// <div class="text-sm text-blue-600 mb-4 bg-blue-50 p-2 rounded">
//   💡 Point enrichi par vos documents
// </div>
// ` : `
// <div class="text-gray-600 text-sm mb-4">
//   Point essentiel à retenir
// </div>
// `}
// `).join('') : '## Contenu principal'}

// </template>

// <template v-slot:right>

// ${section.enhanced_with_resources && resourcesAnalysis.extracted_examples.length > 0 ? `
// <div class="bg-green-50 p-6 rounded-xl h-full">
//   <h3 class="text-lg font-semibold mb-4 text-green-700">
//     📋 Exemples de vos documents
//   </h3>
//   <div class="space-y-3">
// ${resourcesAnalysis.extracted_examples.slice(0, 3).map(example => `    <div class="bg-white p-3 rounded-lg">
//       <div class="text-sm">${example}</div>
//     </div>`).join('\n')}
//   </div>
// </div>
// ` : `
// <div class="bg-orange-50 p-6 rounded-xl h-full">
//   <h3 class="text-lg font-semibold mb-2">Points Clés</h3>
//   <div class="text-sm">${section.content_summary || 'Contenu adapté'}</div>
// </div>
// `}

// </template>

// <div class="mt-8 p-4 bg-blue-50 rounded-lg">
//   <div class="font-semibold">Résumé</div>
//   <div class="text-sm mt-1">${section.content_summary || 'Points clés de cette section'}</div>
// </div>`;

//         } else if (section.type === 'conclusion') {
//             return `
// ---
// layout: center
// class: text-center
// ---

// # ${section.title}

// <div class="max-w-4xl mx-auto">
//   <div class="grid grid-cols-1 md:grid-cols-${section.what_to_cover ? Math.min(section.what_to_cover.length, 3) : 2} gap-6 mb-8">
// ${section.what_to_cover ? section.what_to_cover.map(point => `    <div class="bg-green-50 p-6 rounded-xl">
//       <div class="text-3xl mb-3">✅</div>
//       <div class="font-semibold text-green-700">${point}</div>
//     </div>`).join('\n') : `    <div class="bg-green-50 p-6 rounded-xl">
//       <div class="text-4xl mb-3">✅</div>
//       <div class="font-semibold">Récapitulatif</div>
//     </div>
//     <div class="bg-blue-50 p-6 rounded-xl">
//       <div class="text-4xl mb-3">🚀</div>
//       <div class="font-semibold">Prochaines Étapes</div>
//     </div>`}
//   </div>

//   ${section.enhanced_with_resources ? `
//   <div class="bg-purple-100 p-6 rounded-xl mb-8">
//     <h3 class="text-xl font-semibold mb-4 text-purple-700">
//       🎯 Applications dans votre contexte
//     </h3>
//     <div class="text-sm text-purple-600">
//       Cette formation a été adaptée à vos ressources.
//     </div>
//   </div>
//   ` : ''}

//   <div class="pt-8">
//     <span class="px-8 py-4 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-xl">
//       🎉 Formation Terminée !
//     </span>
//   </div>
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
//   <div class="text-2xl">Formation ${topic} terminée</div>
//   ${resourcesAnalysis.files_content_integrated ? `
//   <div class="text-lg text-blue-600 mt-2">
//     📚 Avec ${resourcesAnalysis.total_files} document(s) intégré(s)
//   </div>
//   ` : `
//   <div class="text-lg text-gray-600 mt-2">Durée: ${duration} minutes</div>
//   `}
// </div>

// Génère UNIQUEMENT ce Markdown, rien d'autre.`;

//     return prompt;
// }

// // 🎬 CRÉATION PROMPT NARRATION
// function createNarrationPrompt(planData, resourcesAnalysis) {
//     const { topic, plan_sections, settings } = planData;
//     const { level = 'beginner', duration = 5 } = settings || {};

//     let prompt = `Crée un script de narration adapté aux ressources:

// FORMATION:
// - Sujet: ${topic}
// - Niveau: ${level}
// - Durée: ${duration} minutes

// ADAPTATION RESSOURCES:
// - Fichiers: ${resourcesAnalysis.total_files}
// - Vocabulaire adapté: ${resourcesAnalysis.vocabulary_adapted ? 'OUI' : 'NON'}
// - Exemples spécifiques: ${resourcesAnalysis.examples_extracted ? 'OUI' : 'NON'}`;

//     if (resourcesAnalysis.key_terminology.length > 0) {
//         prompt += `\n\nTERMINOLOGIE À UTILISER: ${resourcesAnalysis.key_terminology.join(', ')}`;
//     }

//     prompt += `\n\nSECTIONS:\n${plan_sections.map((section, i) =>
//         `Slide ${i + 1}: ${section.title} (${section.duration_seconds}s)`
//     ).join('\n')}`;

//     prompt += `\n\nGÉNÈRE ce JSON de narration:

// {
// ${plan_sections.map((section, index) => {
//         const slideKey = `slide_${index + 1}`;
//         let tone = 'pédagogique';
//         let scriptNote = `Script pour ${section.title}`;

//         if (section.type === 'introduction') {
//             tone = 'accueillant';
//             scriptNote = resourcesAnalysis.files_content_integrated ?
//                 'Accueil mentionnant les documents fournis' : 'Accueil standard';
//         } else if (section.type === 'conclusion') {
//             tone = 'motivant';
//         }

//         return `  "${slideKey}": {
//     "title": "${section.title}",
//     "duration_seconds": ${section.duration_seconds},
//     "script": "${scriptNote}. ${resourcesAnalysis.vocabulary_adapted ? 'Utiliser la terminologie spécialisée.' : ''} ${resourcesAnalysis.examples_extracted ? 'Mentionner les exemples des documents.' : ''}",
//     "tone": "${tone}",
//     "key_phrases": ${resourcesAnalysis.key_terminology.length > 0 ? JSON.stringify(resourcesAnalysis.key_terminology.slice(0, 3)) : '["point important"]'},
//     "uses_resources": ${resourcesAnalysis.files_content_integrated}
//   }`;
//     }).join(',\n')}
// }

// RÈGLES:
// - Ton naturel et ${resourcesAnalysis.company_context_integrated ? 'professionnel' : 'conversationnel'}
// - ${resourcesAnalysis.vocabulary_adapted ? 'Utiliser OBLIGATOIREMENT la terminologie fournie' : 'Langage accessible'}
// - ${resourcesAnalysis.examples_extracted ? 'Intégrer les exemples des documents' : 'Exemples génériques'}

// Génère UNIQUEMENT ce JSON, rien d'autre.`;

//     return prompt;
// }

// // 🔧 FONCTIONS UTILITAIRES

// function cleanMarkdown(markdown) {
//     return markdown
//         .replace(/```markdown\n/g, '')
//         .replace(/\n```/g, '')
//         .replace(/```/g, '')
//         .trim();
// }

// function cleanNarrationResponse(response) {
//     return response
//         .replace(/```json\n/g, '')
//         .replace(/\n```/g, '')
//         .replace(/```/g, '')
//         .replace(/^[^{]*/, '')
//         .replace(/[^}]*$/, '')
//         .trim();
// }

// function createFallbackMarkdown(planData, resourcesAnalysis) {
//     const { topic, plan_sections, settings } = planData;
//     const { duration = 5 } = settings || {};

//     return `---
// theme: academic
// background: linear-gradient(45deg, #1e3c72, #2a5298)
// class: text-center
// title: ${topic}
// ---

// # ${topic}
// ## Formation ${duration} minutes

// ${resourcesAnalysis.files_content_integrated ? `
// <div class="text-sm mt-4 bg-blue-50 p-3 rounded">
//   📚 Formation enrichie par ${resourcesAnalysis.total_files} document(s)
// </div>
// ` : ''}

// <div class="pt-12">
//   <span @click="$slidev.nav.next" class="px-6 py-3 rounded-lg cursor-pointer bg-blue-600 text-white">
//     🚀 Commencer
//   </span>
// </div>

// ${plan_sections.map(section => `
// ---
// layout: default
// ---

// # ${section.title}

// ${section.what_to_cover ? section.what_to_cover.map(point => `- ${point}`).join('\n') : '- Contenu à développer'}

// ${section.enhanced_with_resources ? `
// <div class="mt-6 p-4 bg-blue-50 rounded-lg">
//   💡 <strong>Adapté à vos ressources:</strong> ${section.content_summary || 'Contenu personnalisé'}
// </div>
// ` : `
// <div class="mt-4 text-sm text-gray-600">
// ⏱️ ${section.duration_seconds}s • ${section.type}
// </div>
// `}
// `).join('')}

// ---
// layout: end
// ---

// # Merci !

// Formation ${topic} terminée 🎉`;
// }

// function createFallbackNarration(planData, resourcesAnalysis) {
//     const { plan_sections } = planData;
//     const narration = {};

//     plan_sections.forEach((section, index) => {
//         const slideKey = `slide_${index + 1}`;
//         let tone = 'pédagogique';
//         let script = `Nous allons maintenant aborder ${section.title}.`;

//         if (section.type === 'introduction') {
//             tone = 'accueillant';
//             script = resourcesAnalysis.files_content_integrated ?
//                 `Bonjour et bienvenue dans cette formation sur ${section.title}, adaptée à vos documents.` :
//                 `Bonjour et bienvenue dans cette formation sur ${section.title}.`;
//         } else if (section.type === 'conclusion') {
//             tone = 'motivant';
//             script = 'Pour conclure, retenez bien les points que nous venons de voir.';
//         }

//         narration[slideKey] = {
//             title: section.title,
//             duration_seconds: section.duration_seconds,
//             script: script,
//             tone: tone,
//             key_phrases: resourcesAnalysis.key_terminology.slice(0, 2) || ["Point important"],
//             uses_resources: resourcesAnalysis.files_content_integrated
//         };
//     });

//     return narration;
// }

// // 🔧 ROUTE SAUVEGARDE
// router.post('/save-files', async (req, res) => {
//     try {
//         const { markdown, narration_script, slides_id } = req.body;

//         if (!markdown) {
//             return res.status(400).json({
//                 error: 'Le champ "markdown" est requis'
//             });
//         }

//         const slidesDir = path.join(__dirname, '..', '..', 'generated-slides');
//         await fs.mkdir(slidesDir, { recursive: true });

//         const baseFilename = slides_id || `resource_slides_${Date.now()}`;
//         const savedFiles = [];

//         // Sauvegarder markdown
//         const markdownFile = `${baseFilename}.md`;
//         const markdownPath = path.join(slidesDir, markdownFile);
//         await fs.writeFile(markdownPath, markdown, 'utf8');
//         savedFiles.push(markdownFile);

//         // Sauvegarder script narration
//         if (narration_script) {
//             const narrationFile = `narration_${baseFilename}.json`;
//             const narrationPath = path.join(slidesDir, narrationFile);
//             await fs.writeFile(narrationPath, JSON.stringify(narration_script, null, 2), 'utf8');
//             savedFiles.push(narrationFile);

//             // Script texte
//             const scriptText = Object.entries(narration_script)
//                 .map(([slide, data]) => `=== ${data.title} (${data.duration_seconds}s) ===\n${data.script}\n`)
//                 .join('\n');

//             const scriptFile = `script_${baseFilename}.txt`;
//             const scriptPath = path.join(slidesDir, scriptFile);
//             await fs.writeFile(scriptPath, scriptText, 'utf8');
//             savedFiles.push(scriptFile);
//         }

//         res.json({
//             message: 'Fichiers sauvés avec succès',
//             saved_files: savedFiles,
//             directory: slidesDir,
//             slidev_command: `cd generated-slides && slidev ${markdownFile}`
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: 'Erreur sauvegarde',
//             details: error.message
//         });
//     }
// });

// // 🔧 ROUTE INFO
// router.get('/plan-to-markdown/info', (req, res) => {
//     res.json({
//         endpoint: 'POST /ai/plan-to-markdown',
//         description: 'Convertit le plan en Markdown Slidev enrichi avec utilisation intelligente des ressources',
//         version: '4.0 - Resource Integration',
//         status: '✅ OPÉRATIONNEL',

//         fonctionnalités: [
//             '📚 Utilisation intelligente des fichiers uploadés',
//             '🎬 Scripts de narration adaptés au vocabulaire',
//             '🏢 Adaptation automatique au contexte entreprise',
//             '🔑 Intégration terminologie spécifique',
//             '💡 Exemples personnalisés des documents'
//         ],

//         workflow: [
//             '1. POST /ai/groq-plan (avec ressources/fichiers)',
//             '2. POST /ai/plan-to-markdown (utilise automatiquement les ressources)',
//             '3. Markdown enrichi + script adapté',
//             '4. POST /ai/generate-narration-bark (audio adapté)'
//         ],

//         compatibilité: {
//             format_entrée: 'Compatible avec tous les plans de groq-plan',
//             format_sortie: 'Compatible avec ancien format + enrichissements',
//             rétrocompatible: 'Fonctionne avec plans sans ressources'
//         },

//         exemples_intégration: {
//             fichier_excel: 'Guide Excel → terminologie VLOOKUP, TCD dans slides',
//             procédures: 'Procédures détectées → références dans markdown',
//             contexte_entreprise: 'Contexte fourni → adaptation ton professionnel',
//             exemples_spécifiques: 'Exemples extraits → intégration dans slides'
//         }
//     });
// });

// module.exports = router;















// code qui marche mais avec le mapping à ameliorer

// const express = require('express');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
// const fs = require('fs').promises;
// const path = require('path');

// const router = express.Router();

// // 🤖 Fonction Groq pour génération intelligente
// async function callGroq(prompt, options = {}) {
//     try {
//         const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
//             model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
//             messages: [
//                 {
//                     role: 'system',
//                     content: options.system_content || 'Tu es un expert Slidev qui crée du Markdown sophistiqué en utilisant intelligemment les ressources fournies. Réponds UNIQUEMENT avec du Markdown Slidev valide.'
//                 },
//                 {
//                     role: 'user',
//                     content: prompt
//                 }
//             ],
//             temperature: options.temperature || 0.7,
//             max_tokens: options.max_tokens || 5000
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         return response.data.choices[0].message.content;
//     } catch (error) {
//         console.error('❌ Erreur Groq:', error.message);
//         throw new Error('Erreur génération IA: ' + error.message);
//     }
// }

// // 🎯 API PRINCIPALE - POST /ai/plan-to-markdown
// router.post('/plan-to-markdown', async (req, res) => {
//     const startTime = Date.now();

//     try {
//         // Validation de base
//         if (!req.body.plan_sections || !req.body.topic) {
//             return res.status(400).json({
//                 error: 'Format invalide',
//                 required: ['plan_sections', 'topic'],
//                 format: 'Utilisez TOUT le résultat de POST /ai/groq-plan'
//             });
//         }

//         const groqPlanData = req.body;
//         console.log(`📄 Génération Markdown enrichi: ${groqPlanData.topic}`);

//         // 🔍 ANALYSE DES RESSOURCES DISPONIBLES
//         const resourcesAnalysis = analyzeAvailableResources(groqPlanData);
//         console.log(`📚 Ressources détectées: ${resourcesAnalysis.total_files} fichiers, vocabulaire: ${resourcesAnalysis.vocabulary_adapted}`);

//         // 🎨 GÉNÉRATION MARKDOWN ENRICHI
//         console.log('🎨 Génération Markdown Slidev enrichi...');
//         const markdownPrompt = createEnhancedMarkdownPrompt(groqPlanData, resourcesAnalysis);
//         const markdownResponse = await callGroq(markdownPrompt, {
//             temperature: 0.7,
//             max_tokens: 6000
//         });

//         let slideMarkdown = cleanMarkdown(markdownResponse);

//         // Fallback si nécessaire
//         if (!slideMarkdown.includes('---\ntheme:')) {
//             console.log('🔄 Génération fallback...');
//             slideMarkdown = createFallbackMarkdown(groqPlanData, resourcesAnalysis);
//         }

//         // 🆕 COMPTER LES SLIDES RÉELLES DANS LE MARKDOWN
//         const actualSlideCount = countActualSlides(slideMarkdown);
//         console.log(`📊 Slides détectées: ${actualSlideCount} (sections plan: ${groqPlanData.plan_sections.length})`);

//         // 🔧 GÉNÉRATION SCRIPT NARRATION AVEC SYNCHRONISATION
//         console.log('🎬 Génération script narration synchronisé...');
//         const narrationPrompt = createNarrationPrompt(groqPlanData, resourcesAnalysis, actualSlideCount);
//         const narrationResponse = await callGroq(narrationPrompt, {
//             system_content: 'Tu es un expert en narration qui adapte le discours aux ressources. Réponds UNIQUEMENT avec du JSON valide avec le nombre exact de slides demandé.',
//             max_tokens: 5000
//         });

//         let narrationScript;
//         try {
//             const cleanedNarration = cleanNarrationResponse(narrationResponse);
//             narrationScript = JSON.parse(cleanedNarration);

//             // 🆕 VALIDATION SYNCHRONISATION
//             const scriptCount = Object.keys(narrationScript).length;
//             if (scriptCount !== actualSlideCount) {
//                 console.warn(`⚠️ Désynchronisation détectée: ${actualSlideCount} slides vs ${scriptCount} scripts`);
//                 // Forcer la synchronisation
//                 narrationScript = forceSynchronization(narrationScript, actualSlideCount, groqPlanData, resourcesAnalysis);
//             }

//         } catch (parseError) {
//             console.warn('⚠️ Erreur parsing narration, fallback synchronisé...');
//             narrationScript = createSynchronizedFallbackNarration(groqPlanData, resourcesAnalysis, actualSlideCount);
//         }

//         // 🆕 VÉRIFICATION FINALE
//         const finalSlideCount = actualSlideCount;
//         const finalScriptCount = Object.keys(narrationScript).length;

//         console.log(`✅ Synchronisation finale: ${finalSlideCount} slides = ${finalScriptCount} scripts`);

//         // 🏗️ ASSEMBLAGE FINAL
//         const slidesId = uuidv4();
//         const totalTime = Date.now() - startTime;

//         const result = {
//             slides_id: slidesId,

//             // RÉSULTATS PRINCIPAUX (Compatible format existant)
//             markdown: slideMarkdown,
//             narration_script: narrationScript,

//             // 🆕 INFORMATIONS SYNCHRONISATION
//             synchronization_info: {
//                 markdown_slides_count: finalSlideCount,
//                 narration_scripts_count: finalScriptCount,
//                 synchronized: finalSlideCount === finalScriptCount,
//                 plan_sections_count: groqPlanData.plan_sections.length,
//                 mapping_type: finalSlideCount === groqPlanData.plan_sections.length ? '1:1' :
//                     finalSlideCount > groqPlanData.plan_sections.length ? 'expanded' : 'compressed'
//             },

//             // INFORMATIONS RESSOURCES
//             resource_integration: {
//                 files_used_in_markdown: resourcesAnalysis.files_content_integrated,
//                 company_context_applied: resourcesAnalysis.company_context_integrated,
//                 vocabulary_adapted: resourcesAnalysis.vocabulary_adapted,
//                 examples_from_files: resourcesAnalysis.extracted_examples,
//                 procedures_integrated: resourcesAnalysis.procedures_integrated,
//                 terminology_used: resourcesAnalysis.key_terminology
//             },

//             // COMPATIBILITÉ AVEC FORMAT EXISTANT
//             slides_count: finalSlideCount,
//             topic: groqPlanData.topic,
//             source_plan_id: groqPlanData.plan_id,

//             files: {
//                 markdown: `resource_slides_${slidesId}.md`,
//                 narration: `narration_${slidesId}.json`,
//                 script_txt: `script_${slidesId}.txt`
//             },

//             file_sizes: {
//                 markdown_kb: Math.round(slideMarkdown.length / 1024),
//                 narration_kb: Math.round(JSON.stringify(narrationScript).length / 1024)
//             },

//             slidev_commands: {
//                 preview: `slidev resource_slides_${slidesId}.md`,
//                 export_pdf: `slidev export resource_slides_${slidesId}.md --format pdf`,
//                 export_html: `slidev export resource_slides_${slidesId}.md --format html`
//             },

//             video_production: {
//                 total_duration_seconds: Object.values(narrationScript).reduce((sum, script) => sum + script.duration_seconds, 0),
//                 slides_with_timing: Object.keys(narrationScript).length,
//                 ready_for_recording: true,
//                 uses_company_terminology: resourcesAnalysis.vocabulary_adapted,
//                 references_uploaded_files: resourcesAnalysis.files_content_integrated,
//                 perfectly_synchronized: true
//             },

//             generation_time_ms: totalTime,
//             generated_at: new Date().toISOString(),
//             status: 'completed',
//             ready_for_production: true,

//             next_steps: {
//                 audio_generation: 'POST /ai/generate-narration-bark avec script synchronisé',
//                 customization: resourcesAnalysis.company_context_integrated ?
//                     'Contenu déjà adapté à votre contexte' :
//                     'Personnaliser selon votre contexte'
//             }
//         };

//         console.log(`✅ Génération complète: ${finalSlideCount} slides synchronisées, ${resourcesAnalysis.total_files} fichiers intégrés, ${totalTime}ms`);
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

// // 🆕 FONCTIONS DE SYNCHRONISATION

// function countActualSlides(markdown) {
//     // Compter le nombre de slides réelles dans le markdown
//     const slidesSeparators = markdown.match(/^---$/gm) || [];

//     // Le premier --- est pour les métadonnées, donc slides = separators - 1
//     let slideCount = Math.max(1, slidesSeparators.length - 1);

//     // Validation supplémentaire avec les layouts
//     const layoutsFound = markdown.match(/layout:\s*(intro|default|two-cols|center|end)/g) || [];

//     // Si on trouve des layouts, utiliser ce nombre
//     if (layoutsFound.length > 0) {
//         slideCount = Math.max(slideCount, layoutsFound.length);
//     }

//     // Compter aussi les titres de slides (# titre)
//     const titleSlides = markdown.match(/^#\s+.+$/gm) || [];
//     if (titleSlides.length > slideCount) {
//         slideCount = titleSlides.length;
//     }

//     console.log(`📊 Détection slides: separators=${slidesSeparators.length - 1}, layouts=${layoutsFound.length}, titles=${titleSlides.length}, final=${slideCount}`);

//     return Math.max(slideCount, 1);
// }

// function forceSynchronization(narrationScript, targetCount, planData, resourcesAnalysis) {
//     const currentCount = Object.keys(narrationScript).length;

//     if (currentCount === targetCount) {
//         return narrationScript; // Déjà synchronisé
//     }

//     console.log(`🔧 Forçage synchronisation: ${currentCount} → ${targetCount} scripts`);

//     // Créer nouveau script synchronisé
//     return createSynchronizedFallbackNarration(planData, resourcesAnalysis, targetCount);
// }

// function createSynchronizedFallbackNarration(planData, resourcesAnalysis, slideCount) {
//     const { plan_sections } = planData;
//     const narration = {};

//     console.log(`🔧 Création narration synchronisée: ${slideCount} scripts pour ${plan_sections.length} sections`);

//     for (let i = 0; i < slideCount; i++) {
//         const slideKey = `slide_${i + 1}`;

//         // Mapping intelligent sections → slides
//         let mappedSection;
//         let sectionIndex;

//         if (slideCount <= plan_sections.length) {
//             // Moins ou égal de slides que de sections → mapping direct ou combinaison
//             sectionIndex = Math.floor(i * plan_sections.length / slideCount);
//         } else {
//             // Plus de slides que de sections → subdivision
//             sectionIndex = Math.floor(i * plan_sections.length / slideCount);
//         }

//         mappedSection = plan_sections[Math.min(sectionIndex, plan_sections.length - 1)];

//         let tone = 'pédagogique';
//         let title = mappedSection.title;
//         let script = `Nous allons maintenant aborder ${mappedSection.title}.`;

//         // Définir le ton selon la position
//         if (i === 0) {
//             tone = 'accueillant';
//             title = mappedSection.title || 'Introduction';
//             script = resourcesAnalysis.files_content_integrated ?
//                 `Bonjour et bienvenue dans cette formation sur ${title}, adaptée à vos documents.` :
//                 `Bonjour et bienvenue dans cette formation sur ${title}.`;
//         } else if (i === slideCount - 1) {
//             tone = 'motivant';
//             title = 'Conclusion';
//             script = 'Pour conclure, retenez bien les points essentiels que nous venons de voir.';
//         } else {
//             // Slide intermédiaire
//             if (slideCount > plan_sections.length) {
//                 // Subdivision d'une section
//                 const partNumber = Math.floor(i / (slideCount / plan_sections.length)) + 1;
//                 title = `${mappedSection.title} - Partie ${partNumber}`;
//                 script = `Continuons avec ${mappedSection.title}. Nous allons maintenant voir les détails importants.`;
//             }
//         }

//         // Calculer durée proportionnelle
//         const baseDuration = mappedSection.duration_seconds || 60;
//         const proportionalDuration = Math.floor(baseDuration * (plan_sections.length / slideCount));
//         const adjustedDuration = Math.max(15, Math.min(120, proportionalDuration)); // Entre 15s et 2min

//         narration[slideKey] = {
//             title: title,
//             duration_seconds: adjustedDuration,
//             script: script,
//             tone: tone,
//             key_phrases: resourcesAnalysis.key_terminology.slice(0, 2) || ["Point important"],
//             uses_resources: resourcesAnalysis.files_content_integrated,
//             mapped_from_section: sectionIndex + 1,
//             slide_position: i + 1,
//             auto_generated: currentCount !== slideCount // Flag pour indiquer génération automatique
//         };
//     }

//     return narration;
// }

// // 🔍 ANALYSE DES RESSOURCES DISPONIBLES
// function analyzeAvailableResources(groqPlanData) {
//     const analysis = {
//         total_files: 0,
//         files_content_integrated: false,
//         company_context_integrated: false,
//         vocabulary_adapted: false,
//         procedures_integrated: false,
//         examples_extracted: false,
//         key_terminology: [],
//         extracted_examples: [],
//         file_references: [],
//         adaptation_quality: 'basic'
//     };

//     // Analyser les fichiers traités
//     if (groqPlanData.files_processing) {
//         analysis.total_files = groqPlanData.files_processing.processed_successfully || 0;
//         analysis.files_content_integrated = analysis.total_files > 0;

//         if (groqPlanData.files_processing.processed_files) {
//             groqPlanData.files_processing.processed_files.forEach(file => {
//                 if (file.status === 'parsed') {
//                     analysis.file_references.push({
//                         name: file.name,
//                         type: file.content_type,
//                         topics: file.key_topics
//                     });

//                     if (file.has_procedures) analysis.procedures_integrated = true;
//                     if (file.has_examples) analysis.examples_extracted = true;
//                     if (file.key_topics) analysis.key_terminology.push(...file.key_topics);
//                 }
//             });
//         }
//     }

//     // Analyser l'enrichissement
//     if (groqPlanData.resources_enrichment) {
//         analysis.company_context_integrated = groqPlanData.resources_enrichment.has_company_context;
//         analysis.vocabulary_adapted = groqPlanData.resources_enrichment.adaptation_applied?.vocabulary_adapted || false;
//     }

//     // Extraire des sections du plan
//     if (groqPlanData.plan_sections) {
//         groqPlanData.plan_sections.forEach(section => {
//             if (section.enhanced_with_resources) {
//                 if (section.key_terminology) {
//                     analysis.key_terminology.push(...section.key_terminology);
//                 }
//                 if (section.examples_from_resources) {
//                     analysis.extracted_examples.push(...section.examples_from_resources);
//                 }
//             }
//         });
//     }

//     // Déduplication
//     analysis.key_terminology = [...new Set(analysis.key_terminology.flat())].slice(0, 10);
//     analysis.extracted_examples = [...new Set(analysis.extracted_examples.flat())].slice(0, 8);

//     // Calcul qualité
//     if (analysis.files_content_integrated && analysis.vocabulary_adapted && analysis.company_context_integrated) {
//         analysis.adaptation_quality = 'excellent';
//     } else if (analysis.files_content_integrated || analysis.vocabulary_adapted) {
//         analysis.adaptation_quality = 'good';
//     }

//     return analysis;
// }

// // 🎨 CRÉATION PROMPT MARKDOWN ENRICHI
// function createEnhancedMarkdownPrompt(planData, resourcesAnalysis) {
//     const { topic, plan_sections, settings } = planData;
//     const { level = 'beginner', duration = 5, style = 'practical' } = settings || {};

//     let prompt = `Crée un Markdown Slidev sophistiqué qui utilise les ressources fournies:

// INFORMATIONS:
// - Sujet: ${topic}
// - Niveau: ${level}
// - Durée: ${duration} minutes
// - Style: ${style}

// RESSOURCES DISPONIBLES:
// - Fichiers traités: ${resourcesAnalysis.total_files}
// - Contexte entreprise: ${resourcesAnalysis.company_context_integrated ? 'OUI' : 'NON'}
// - Vocabulaire adapté: ${resourcesAnalysis.vocabulary_adapted ? 'OUI' : 'NON'}
// - Procédures: ${resourcesAnalysis.procedures_integrated ? 'OUI' : 'NON'}
// - Exemples: ${resourcesAnalysis.examples_extracted ? 'OUI' : 'NON'}`;

//     if (resourcesAnalysis.key_terminology.length > 0) {
//         prompt += `\n\nTERMINOLOGIE À UTILISER:\n${resourcesAnalysis.key_terminology.join(', ')}`;
//     }

//     if (resourcesAnalysis.extracted_examples.length > 0) {
//         prompt += `\n\nEXEMPLES À INTÉGRER:\n${resourcesAnalysis.extracted_examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}`;
//     }

//     if (resourcesAnalysis.file_references.length > 0) {
//         prompt += `\n\nFICHIERS À RÉFÉRENCER:\n${resourcesAnalysis.file_references.map(ref => `- ${ref.name}: ${ref.type}`).join('\n')}`;
//     }

//     prompt += `\n\nSECTIONS DU PLAN:\n${plan_sections.map((section, i) => {
//         return `${i + 1}. ${section.title} (${section.duration_seconds}s)\n   Points: ${section.what_to_cover ? section.what_to_cover.join(', ') : 'À développer'}`;
//     }).join('\n\n')}`;

//     prompt += `\n\nGÉNÈRE un Markdown Slidev enrichi avec intégration des ressources:

// ---
// theme: ${resourcesAnalysis.company_context_integrated ? 'corporate' : 'academic'}
// background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
// class: text-center
// highlighter: shiki
// lineNumbers: true
// title: ${topic}
// ---

// # ${topic}
// ## Formation ${duration} minutes${resourcesAnalysis.company_context_integrated ? ' - Adaptée à votre contexte' : ''}

// ${resourcesAnalysis.files_content_integrated ? `
// <div class="opacity-80 text-sm mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
//   📚 Formation enrichie par ${resourcesAnalysis.total_files} document(s)
// </div>
// ` : ''}

// <div class="pt-8">
//   <span @click="$slidev.nav.next" class="px-6 py-3 rounded-lg cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
//     🚀 Commencer
//   </span>
// </div>

// ${plan_sections.map((section, index) => {
//         if (section.type === 'introduction') {
//             return `
// ---
// layout: intro
// ---

// # ${section.title}

// ${section.what_to_cover ? section.what_to_cover.map(point => `- **${point}**`).join('\n') : '- Introduction au sujet'}

// ${section.enhanced_with_resources && resourcesAnalysis.extracted_examples.length > 0 ? `
// <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//   <h3 class="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-300">
//     💡 Basé sur vos ressources
//   </h3>
//   <div class="text-sm space-y-2">
// ${resourcesAnalysis.extracted_examples.slice(0, 2).map(example => `    <div>• ${example}</div>`).join('\n')}
//   </div>
// </div>
// ` : ''}

// <div class="mt-6">
//   <div class="px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm inline-block">
//     ⏱️ ${section.duration_seconds}s
//   </div>
// </div>`;

//         } else if (section.type === 'development') {
//             return `
// ---
// layout: two-cols
// ---

// # ${section.title}

// <template v-slot:default>

// ${section.what_to_cover ? section.what_to_cover.map((point, i) => `
// ## ${i + 1}. ${point}

// ${section.enhanced_with_resources ? `
// <div class="text-sm text-blue-600 mb-4 bg-blue-50 p-2 rounded">
//   💡 Point enrichi par vos documents
// </div>
// ` : `
// <div class="text-gray-600 text-sm mb-4">
//   Point essentiel à retenir
// </div>
// `}
// `).join('') : '## Contenu principal'}

// </template>

// <template v-slot:right>

// ${section.enhanced_with_resources && resourcesAnalysis.extracted_examples.length > 0 ? `
// <div class="bg-green-50 p-6 rounded-xl h-full">
//   <h3 class="text-lg font-semibold mb-4 text-green-700">
//     📋 Exemples de vos documents
//   </h3>
//   <div class="space-y-3">
// ${resourcesAnalysis.extracted_examples.slice(0, 3).map(example => `    <div class="bg-white p-3 rounded-lg">
//       <div class="text-sm">${example}</div>
//     </div>`).join('\n')}
//   </div>
// </div>
// ` : `
// <div class="bg-orange-50 p-6 rounded-xl h-full">
//   <h3 class="text-lg font-semibold mb-2">Points Clés</h3>
//   <div class="text-sm">${section.content_summary || 'Contenu adapté'}</div>
// </div>
// `}

// </template>

// <div class="mt-8 p-4 bg-blue-50 rounded-lg">
//   <div class="font-semibold">Résumé</div>
//   <div class="text-sm mt-1">${section.content_summary || 'Points clés de cette section'}</div>
// </div>`;

//         } else if (section.type === 'conclusion') {
//             return `
// ---
// layout: center
// class: text-center
// ---

// # ${section.title}

// <div class="max-w-4xl mx-auto">
//   <div class="grid grid-cols-1 md:grid-cols-${section.what_to_cover ? Math.min(section.what_to_cover.length, 3) : 2} gap-6 mb-8">
// ${section.what_to_cover ? section.what_to_cover.map(point => `    <div class="bg-green-50 p-6 rounded-xl">
//       <div class="text-3xl mb-3">✅</div>
//       <div class="font-semibold text-green-700">${point}</div>
//     </div>`).join('\n') : `    <div class="bg-green-50 p-6 rounded-xl">
//       <div class="text-4xl mb-3">✅</div>
//       <div class="font-semibold">Récapitulatif</div>
//     </div>
//     <div class="bg-blue-50 p-6 rounded-xl">
//       <div class="text-4xl mb-3">🚀</div>
//       <div class="font-semibold">Prochaines Étapes</div>
//     </div>`}
//   </div>

//   ${section.enhanced_with_resources ? `
//   <div class="bg-purple-100 p-6 rounded-xl mb-8">
//     <h3 class="text-xl font-semibold mb-4 text-purple-700">
//       🎯 Applications dans votre contexte
//     </h3>
//     <div class="text-sm text-purple-600">
//       Cette formation a été adaptée à vos ressources.
//     </div>
//   </div>
//   ` : ''}

//   <div class="pt-8">
//     <span class="px-8 py-4 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-xl">
//       🎉 Formation Terminée !
//     </span>
//   </div>
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
//   <div class="text-2xl">Formation ${topic} terminée</div>
//   ${resourcesAnalysis.files_content_integrated ? `
//   <div class="text-lg text-blue-600 mt-2">
//     📚 Avec ${resourcesAnalysis.total_files} document(s) intégré(s)
//   </div>
//   ` : `
//   <div class="text-lg text-gray-600 mt-2">Durée: ${duration} minutes</div>
//   `}
// </div>

// Génère UNIQUEMENT ce Markdown, rien d'autre.`;

//     return prompt;
// }

// // 🎬 CRÉATION PROMPT NARRATION SYNCHRONISÉ
// function createNarrationPrompt(planData, resourcesAnalysis, actualSlideCount) {
//     const { topic, plan_sections, settings } = planData;
//     const { level = 'beginner', duration = 5 } = settings || {};

//     let prompt = `Crée un script de narration adapté aux ressources et PARFAITEMENT synchronisé:

// FORMATION:
// - Sujet: ${topic}
// - Niveau: ${level}
// - Durée: ${duration} minutes
// - NOMBRE DE SLIDES EXACT: ${actualSlideCount}

// ADAPTATION RESSOURCES:
// - Fichiers: ${resourcesAnalysis.total_files}
// - Vocabulaire adapté: ${resourcesAnalysis.vocabulary_adapted ? 'OUI' : 'NON'}
// - Exemples spécifiques: ${resourcesAnalysis.examples_extracted ? 'OUI' : 'NON'}`;

//     if (resourcesAnalysis.key_terminology.length > 0) {
//         prompt += `\n\nTERMINOLOGIE À UTILISER: ${resourcesAnalysis.key_terminology.join(', ')}`;
//     }

//     // 🆕 MAPPAGE SECTIONS → SLIDES RÉELS
//     prompt += `\n\nSECTIONS DISPONIBLES:\n${plan_sections.map((section, i) =>
//         `${i + 1}. ${section.title} (${section.duration_seconds}s) - ${section.type}`
//     ).join('\n')}`;

//     prompt += `\n\n⚠️ CRITICAL: Tu dois générer EXACTEMENT ${actualSlideCount} scripts de narration.

// RÈGLES DE MAPPING:
// - Si ${actualSlideCount} slides > ${plan_sections.length} sections : Diviser les sections longues
// - Si ${actualSlideCount} slides < ${plan_sections.length} sections : Combiner certaines sections  
// - Si ${actualSlideCount} slides = ${plan_sections.length} sections : Mapping 1:1 parfait

// GÉNÈRE ce JSON avec EXACTEMENT ${actualSlideCount} entrées:

// {
// ${Array.from({ length: actualSlideCount }, (_, index) => {
//         const slideKey = `slide_${index + 1}`;

//         // Logique de mapping intelligent
//         let mappedSection;
//         let sectionIndex;

//         if (actualSlideCount <= plan_sections.length) {
//             // Moins ou égal de slides que de sections
//             sectionIndex = Math.floor(index * plan_sections.length / actualSlideCount);
//         } else {
//             // Plus de slides que de sections
//             sectionIndex = Math.floor(index * plan_sections.length / actualSlideCount);
//         }

//         mappedSection = plan_sections[Math.min(sectionIndex, plan_sections.length - 1)];

//         let tone = 'pédagogique';
//         let title = mappedSection.title;

//         if (index === 0) {
//             tone = 'accueillant';
//             title = mappedSection.title || 'Introduction';
//         } else if (index === actualSlideCount - 1) {
//             tone = 'motivant';
//             title = 'Conclusion';
//         } else if (actualSlideCount > plan_sections.length) {
//             // Subdivision d'une section
//             const partNumber = Math.floor((index - 1) / Math.ceil(actualSlideCount / plan_sections.length)) + 1;
//             title = `${mappedSection.title} - Partie ${partNumber}`;
//         }

//         // Calculer durée proportionnelle
//         const baseDuration = mappedSection.duration_seconds || 60;
//         const proportionalDuration = Math.floor(baseDuration * (plan_sections.length / actualSlideCount));
//         const adjustedDuration = Math.max(15, Math.min(120, proportionalDuration));

//         return `  "${slideKey}": {
//     "title": "${title}",
//     "duration_seconds": ${adjustedDuration},
//     "script": "Script adapté pour ${title}. ${resourcesAnalysis.vocabulary_adapted ? 'Utiliser la terminologie spécialisée.' : ''} ${resourcesAnalysis.examples_extracted ? 'Mentionner les exemples des documents.' : ''}",
//     "tone": "${tone}",
//     "key_phrases": ${resourcesAnalysis.key_terminology.length > 0 ? JSON.stringify(resourcesAnalysis.key_terminology.slice(0, 2)) : '["point important"]'},
//     "uses_resources": ${resourcesAnalysis.files_content_integrated}
//   }`;
//     }).join(',\n')}
// }

// RÈGLES:
// - Ton naturel et ${resourcesAnalysis.company_context_integrated ? 'professionnel' : 'conversationnel'}
// - ${resourcesAnalysis.vocabulary_adapted ? 'Utiliser OBLIGATOIREMENT la terminologie fournie' : 'Langage accessible'}
// - ${resourcesAnalysis.examples_extracted ? 'Intégrer les exemples des documents' : 'Exemples génériques'}

// Génère UNIQUEMENT ce JSON avec EXACTEMENT ${actualSlideCount} scripts, rien d'autre.`;

//     return prompt;
// }

// // 🔧 FONCTIONS UTILITAIRES

// function cleanMarkdown(markdown) {
//     return markdown
//         .replace(/```markdown\n/g, '')
//         .replace(/\n```/g, '')
//         .replace(/```/g, '')
//         .trim();
// }

// function cleanNarrationResponse(response) {
//     return response
//         .replace(/```json\n/g, '')
//         .replace(/\n```/g, '')
//         .replace(/```/g, '')
//         .replace(/^[^{]*/, '')
//         .replace(/[^}]*$/, '')
//         .trim();
// }

// function createFallbackMarkdown(planData, resourcesAnalysis) {
//     const { topic, plan_sections, settings } = planData;
//     const { duration = 5 } = settings || {};

//     return `---
// theme: academic
// background: linear-gradient(45deg, #1e3c72, #2a5298)
// class: text-center
// title: ${topic}
// ---

// # ${topic}
// ## Formation ${duration} minutes

// ${resourcesAnalysis.files_content_integrated ? `
// <div class="text-sm mt-4 bg-blue-50 p-3 rounded">
//   📚 Formation enrichie par ${resourcesAnalysis.total_files} document(s)
// </div>
// ` : ''}

// <div class="pt-12">
//   <span @click="$slidev.nav.next" class="px-6 py-3 rounded-lg cursor-pointer bg-blue-600 text-white">
//     🚀 Commencer
//   </span>
// </div>

// ${plan_sections.map(section => `
// ---
// layout: default
// ---

// # ${section.title}

// ${section.what_to_cover ? section.what_to_cover.map(point => `- ${point}`).join('\n') : '- Contenu à développer'}

// ${section.enhanced_with_resources ? `
// <div class="mt-6 p-4 bg-blue-50 rounded-lg">
//   💡 <strong>Adapté à vos ressources:</strong> ${section.content_summary || 'Contenu personnalisé'}
// </div>
// ` : `
// <div class="mt-4 text-sm text-gray-600">
// ⏱️ ${section.duration_seconds}s • ${section.type}
// </div>
// `}
// `).join('')}

// ---
// layout: end
// ---

// # Merci !

// Formation ${topic} terminée 🎉`;
// }

// // 🔧 ROUTE SAUVEGARDE
// router.post('/save-files', async (req, res) => {
//     try {
//         const { markdown, narration_script, slides_id } = req.body;

//         if (!markdown) {
//             return res.status(400).json({
//                 error: 'Le champ "markdown" est requis'
//             });
//         }

//         const slidesDir = path.join(__dirname, '..', '..', 'generated-slides');
//         await fs.mkdir(slidesDir, { recursive: true });

//         const baseFilename = slides_id || `resource_slides_${Date.now()}`;
//         const savedFiles = [];

//         // Sauvegarder markdown
//         const markdownFile = `${baseFilename}.md`;
//         const markdownPath = path.join(slidesDir, markdownFile);
//         await fs.writeFile(markdownPath, markdown, 'utf8');
//         savedFiles.push(markdownFile);

//         // Sauvegarder script narration
//         if (narration_script) {
//             const narrationFile = `narration_${baseFilename}.json`;
//             const narrationPath = path.join(slidesDir, narrationFile);
//             await fs.writeFile(narrationPath, JSON.stringify(narration_script, null, 2), 'utf8');
//             savedFiles.push(narrationFile);

//             // Script texte
//             const scriptText = Object.entries(narration_script)
//                 .map(([slide, data]) => `=== ${data.title} (${data.duration_seconds}s) ===\n${data.script}\n`)
//                 .join('\n');

//             const scriptFile = `script_${baseFilename}.txt`;
//             const scriptPath = path.join(slidesDir, scriptFile);
//             await fs.writeFile(scriptPath, scriptText, 'utf8');
//             savedFiles.push(scriptFile);
//         }

//         res.json({
//             message: 'Fichiers sauvés avec succès',
//             saved_files: savedFiles,
//             directory: slidesDir,
//             slidev_command: `cd generated-slides && slidev ${markdownFile}`
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: 'Erreur sauvegarde',
//             details: error.message
//         });
//     }
// });

// // 🔧 ROUTE INFO
// router.get('/plan-to-markdown/info', (req, res) => {
//     res.json({
//         endpoint: 'POST /ai/plan-to-markdown',
//         description: 'Convertit le plan en Markdown Slidev enrichi avec synchronisation parfaite slides/narration',
//         version: '5.0 - Perfect Synchronization',
//         status: '✅ OPÉRATIONNEL',

//         fonctionnalités: [
//             '🔄 Synchronisation automatique slides ↔ scripts narration',
//             '📚 Utilisation intelligente des fichiers uploadés',
//             '🎬 Scripts de narration adaptés au vocabulaire',
//             '🏢 Adaptation automatique au contexte entreprise',
//             '🔑 Intégration terminologie spécifique',
//             '💡 Exemples personnalisés des documents',
//             '📊 Validation et correction automatique des désynchronisations'
//         ],

//         synchronization_features: [
//             '✅ Détection automatique du nombre de slides markdown',
//             '🔧 Ajustement forcé du nombre de scripts narration',
//             '📈 Mapping intelligent sections → slides',
//             '⚖️ Répartition proportionnelle des durées',
//             '🔍 Validation finale de synchronisation'
//         ],

//         workflow: [
//             '1. POST /ai/groq-plan (avec ressources/fichiers)',
//             '2. POST /ai/plan-to-markdown (génère markdown + compte slides)',
//             '3. Génération narration avec nombre exact de scripts',
//             '4. Validation synchronisation finale',
//             '5. POST /ai/generate-narration-bark (audio parfaitement aligné)'
//         ],

//         mapping_strategies: {
//             one_to_one: 'Slides = Sections → Mapping direct 1:1',
//             expansion: 'Slides > Sections → Subdivision intelligente',
//             compression: 'Slides < Sections → Combinaison logique'
//         },

//         compatibilité: {
//             format_entrée: 'Compatible avec tous les plans de groq-plan',
//             format_sortie: 'Compatible avec ancien format + enrichissements + sync info',
//             rétrocompatible: 'Fonctionne avec plans sans ressources',
//             guaranteed_sync: 'Synchronisation garantie à 100%'
//         },

//         response_additions: {
//             synchronization_info: 'Détails de synchronisation et mapping',
//             perfectly_synchronized: 'Flag confirmant la synchronisation',
//             mapping_type: 'Type de mapping appliqué (1:1, expanded, compressed)'
//         },

//         exemples_intégration: {
//             fichier_excel: 'Guide Excel → terminologie VLOOKUP, TCD dans slides + scripts',
//             procédures: 'Procédures détectées → références dans markdown + narration',
//             contexte_entreprise: 'Contexte fourni → adaptation ton professionnel',
//             exemples_spécifiques: 'Exemples extraits → intégration dans slides + scripts'
//         }
//     });
// });

// // 🧪 ROUTE DE TEST SYNCHRONISATION
// router.post('/test-synchronization', async (req, res) => {
//     try {
//         const { markdown, plan_sections } = req.body;

//         if (!markdown || !plan_sections) {
//             return res.status(400).json({
//                 error: 'markdown et plan_sections requis'
//             });
//         }

//         const slideCount = countActualSlides(markdown);
//         const sectionCount = plan_sections.length;

//         // Test de synchronisation
//         const mockResourcesAnalysis = {
//             total_files: 0,
//             vocabulary_adapted: false,
//             files_content_integrated: false,
//             key_terminology: [],
//             extracted_examples: []
//         };

//         const syncedNarration = createSynchronizedFallbackNarration(
//             { plan_sections },
//             mockResourcesAnalysis,
//             slideCount
//         );

//         res.json({
//             test_results: {
//                 detected_slides: slideCount,
//                 plan_sections: sectionCount,
//                 generated_scripts: Object.keys(syncedNarration).length,
//                 synchronized: Object.keys(syncedNarration).length === slideCount
//             },
//             mapping_analysis: {
//                 type: slideCount === sectionCount ? '1:1' :
//                     slideCount > sectionCount ? 'expansion' : 'compression',
//                 ratio: Math.round((slideCount / sectionCount) * 100) / 100
//             },
//             generated_narration: syncedNarration,
//             success: true
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: 'Erreur test synchronisation',
//             details: error.message
//         });
//     }
// });

// module.exports = router;





























// code opdate avec le mapping à ameliorer

// const express = require('express');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
// const fs = require('fs').promises;
// const path = require('path');

// const router = express.Router();

// // 🤖 Fonction Groq pour génération intelligente
// async function callGroq(prompt, options = {}) {
//     try {
//         const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
//             model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
//             messages: [
//                 {
//                     role: 'system',
//                     content: options.system_content || 'Tu es un expert Slidev qui crée du Markdown sophistiqué en utilisant intelligemment les ressources fournies. Réponds UNIQUEMENT avec du Markdown Slidev valide.'
//                 },
//                 {
//                     role: 'user',
//                     content: prompt
//                 }
//             ],
//             temperature: options.temperature || 0.7,
//             max_tokens: options.max_tokens || 5000
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         return response.data.choices[0].message.content;
//     } catch (error) {
//         console.error('❌ Erreur Groq:', error.message);
//         throw new Error('Erreur génération IA: ' + error.message);
//     }
// }

// // 🔧 FONCTIONS UTILITAIRES
// function cleanMarkdown(markdown) {
//     return markdown
//         .replace(/```markdown\n/g, '')
//         .replace(/\n```/g, '')
//         .replace(/```/g, '')
//         .trim();
// }

// function cleanNarrationResponse(response) {
//     return response
//         .replace(/```json\n/g, '')
//         .replace(/\n```/g, '')
//         .replace(/```/g, '')
//         .replace(/^[^{]*/, '')
//         .replace(/[^}]*$/, '')
//         .trim();
// }

// function createFallbackMarkdown(planData, resourcesAnalysis) {
//     const { topic, plan_sections, settings } = planData;
//     const { duration = 5 } = settings || {};

//     return `---
// theme: academic
// background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
// class: text-center
// highlighter: shiki
// lineNumbers: true
// title: ${topic}
// ---

// # ${topic}
// ## Formation ${duration} minutes

// ${resourcesAnalysis.files_content_integrated ? `
// <div class="text-sm mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
//   📚 Formation enrichie par ${resourcesAnalysis.total_files} document(s)
// </div>
// ` : ''}

// <div class="pt-8">
//   <span @click="$slidev.nav.next" class="px-6 py-3 rounded-lg cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
//     🚀 Commencer
//   </span>
// </div>

// ${plan_sections.map(section => {
//         if (section.type === 'introduction') {
//             return `
// ---
// layout: intro
// ---

// # ${section.title}

// <div class="max-w-4xl mx-auto">
// ${section.what_to_cover ? section.what_to_cover.map(point => `  <div class="flex items-center mb-4">
//     <div class="text-2xl mr-3">🎯</div>
//     <div class="text-lg">${point}</div>
//   </div>`).join('\n') : '<div class="text-lg">Introduction aux concepts fondamentaux</div>'}
// </div>

// ${section.enhanced_with_resources && resourcesAnalysis.extracted_examples.length > 0 ? `
// <div class="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//   <h3 class="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-300">
//     💡 Basé sur vos ressources
//   </h3>
//   <div class="text-sm space-y-2">
// ${resourcesAnalysis.extracted_examples.slice(0, 2).map(example => `    <div>• ${example}</div>`).join('\n')}
//   </div>
// </div>
// ` : ''}

// <div class="mt-8">
//   <div class="px-6 py-3 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-sm inline-block">
//     ⏱️ ${section.duration_seconds}s
//   </div>
// </div>`;

//         } else if (section.type === 'development') {
//             return `
// ---
// layout: default
// ---

// # ${section.title}

// <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
//   <div>
// ${section.what_to_cover ? section.what_to_cover.map((point, i) => `
//     <div class="mb-6">
//       <h3 class="text-xl font-semibold mb-3 flex items-center">
//         <span class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">${i + 1}</span>
//         ${point}
//       </h3>
//       <div class="text-gray-600 dark:text-gray-300">
//         ${getDetailedExplanation(point, topic)}
//       </div>
//     </div>
// `).join('') : '<div class="text-lg">Concepts essentiels à explorer</div>'}
//   </div>

//   <div>
// ${topic.toLowerCase().includes('python') ? `
//     <div class="bg-gray-900 rounded-lg p-4">
//       <div class="text-green-400 text-sm mb-2"># Exemple pratique</div>
//       <pre><code class="text-green-300">${getCodeExample(section.what_to_cover ? section.what_to_cover[0] : section.title, topic)}</code></pre>
//     </div>

//     <div class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
//       <h4 class="font-semibold text-green-700 dark:text-green-300 mb-2">💡 Points clés</h4>
//       <ul class="text-sm text-green-600 dark:text-green-400 space-y-1">
//         <li>• Syntaxe simple et intuitive</li>
//         <li>• Typage dynamique automatique</li>
//         <li>• Large écosystème de bibliothèques</li>
//       </ul>
//     </div>
// ` : `
//     <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
//       <h4 class="text-lg font-semibold mb-4">🔍 Exemple pratique</h4>
//       <div class="text-sm">${section.content_summary || 'Application concrète des concepts'}</div>
//     </div>
// `}
//   </div>
// </div>

// <div class="mt-8">
//   <div class="px-6 py-3 rounded-full bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-sm inline-block">
//     ⏱️ ${section.duration_seconds}s • ${section.type}
//   </div>
// </div>`;

//         } else if (section.type === 'conclusion') {
//             return `
// ---
// layout: center
// class: text-center
// ---

// # ${section.title}

// <div class="max-w-4xl mx-auto">
//   <div class="grid grid-cols-1 md:grid-cols-${section.what_to_cover ? Math.min(section.what_to_cover.length, 3) : 2} gap-6 mb-8">
// ${section.what_to_cover ? section.what_to_cover.map(point => `    <div class="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
//       <div class="text-4xl mb-4">✅</div>
//       <div class="font-semibold text-green-700 dark:text-green-300">${point}</div>
//     </div>`).join('\n') : `    <div class="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
//       <div class="text-4xl mb-4">✅</div>
//       <div class="font-semibold">Compétences acquises</div>
//     </div>
//     <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
//       <div class="text-4xl mb-4">🚀</div>
//       <div class="font-semibold">Prochaines étapes</div>
//     </div>`}
//   </div>

//   ${section.enhanced_with_resources ? `
//   <div class="bg-purple-100 dark:bg-purple-900/20 p-6 rounded-xl mb-8">
//     <h3 class="text-xl font-semibold mb-4 text-purple-700 dark:text-purple-300">
//       🎯 Applications dans votre contexte
//     </h3>
//     <div class="text-sm text-purple-600 dark:text-purple-400">
//       Cette formation a été adaptée à vos ressources.
//     </div>
//   </div>
//   ` : ''}

//   <div class="pt-8">
//     <span class="px-8 py-4 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-xl">
//       🎉 Formation Terminée !
//     </span>
//   </div>
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
//   <div class="text-2xl">Formation ${topic} terminée</div>
//   ${resourcesAnalysis.files_content_integrated ? `
//   <div class="text-lg text-blue-600 dark:text-blue-400 mt-2">
//     📚 Avec ${resourcesAnalysis.total_files} document(s) intégré(s)
//   </div>
//   ` : `
//   <div class="text-lg text-gray-600 dark:text-gray-400 mt-2">Durée: ${duration} minutes</div>
//   `}
// </div>`;
// }

// // 🆕 FONCTIONS DE SYNCHRONISATION
// function countActualSlides(markdown) {
//     const slidesSeparators = markdown.match(/^---$/gm) || [];
//     let slideCount = Math.max(1, slidesSeparators.length - 1);

//     const layoutsFound = markdown.match(/layout:\s*(intro|default|two-cols|center|end)/g) || [];
//     if (layoutsFound.length > 0) {
//         slideCount = Math.max(slideCount, layoutsFound.length);
//     }

//     const titleSlides = markdown.match(/^#\s+.+$/gm) || [];
//     if (titleSlides.length > slideCount) {
//         slideCount = titleSlides.length;
//     }

//     console.log(`📊 Détection slides: separators=${slidesSeparators.length - 1}, layouts=${layoutsFound.length}, titles=${titleSlides.length}, final=${slideCount}`);
//     return Math.max(slideCount, 1);
// }

// function forceSynchronization(narrationScript, targetCount, planData, resourcesAnalysis) {
//     const currentCount = Object.keys(narrationScript).length;

//     if (currentCount === targetCount) {
//         return narrationScript;
//     }

//     console.log(`🔧 Forçage synchronisation: ${currentCount} → ${targetCount} scripts`);
//     return createSynchronizedFallbackNarration(planData, resourcesAnalysis, targetCount);
// }

// // 🔧 FONCTION CORRIGÉE - createSynchronizedFallbackNarration
// function createSynchronizedFallbackNarration(planData, resourcesAnalysis, slideCount) {
//     const { plan_sections } = planData;
//     const narration = {};

//     console.log(`🔧 Création narration synchronisée 1:1: ${slideCount} scripts pour ${plan_sections.length} sections`);

//     for (let i = 0; i < slideCount; i++) {
//         const slideKey = `slide_${i + 1}`;
//         const mappedSection = plan_sections[i];

//         let tone = 'pédagogique';
//         let title = mappedSection.title;
//         let script = '';

//         const sectionDuration = mappedSection.duration_seconds || 60;

//         // 🎯 UTILISATION FORCÉE DES FONCTIONS DÉTAILLÉES
//         if (mappedSection.type === 'introduction') {
//             tone = 'accueillant';
//             title = mappedSection.title || 'Introduction';
//             script = generateDetailedIntroScript(mappedSection, planData.topic, sectionDuration, resourcesAnalysis);

//         } else if (mappedSection.type === 'conclusion') {
//             tone = 'motivant';
//             title = mappedSection.title;
//             script = generateDetailedConclusionScript(mappedSection, planData.topic, sectionDuration);

//         } else {
//             tone = 'pédagogique';
//             script = generateDetailedDevelopmentScript(mappedSection, planData.topic, sectionDuration);
//         }

//         narration[slideKey] = {
//             title: title,
//             duration_seconds: sectionDuration,
//             script: script, // ✅ Maintenant utilise les scripts détaillés
//             tone: tone,
//             key_phrases: resourcesAnalysis.key_terminology.slice(0, 2) || ["Point important"],
//             uses_resources: resourcesAnalysis.files_content_integrated,
//             mapped_from_section: i + 1,
//             slide_position: i + 1,
//             auto_generated: false
//         };
//     }

//     return narration;
// }

// // 🔍 ANALYSE DES RESSOURCES DISPONIBLES
// function analyzeAvailableResources(groqPlanData) {
//     const analysis = {
//         total_files: 0,
//         files_content_integrated: false,
//         company_context_integrated: false,
//         vocabulary_adapted: false,
//         procedures_integrated: false,
//         examples_extracted: false,
//         key_terminology: [],
//         extracted_examples: [],
//         file_references: [],
//         adaptation_quality: 'basic'
//     };

//     // Analyser les fichiers traités
//     if (groqPlanData.files_processing) {
//         analysis.total_files = groqPlanData.files_processing.processed_successfully || 0;
//         analysis.files_content_integrated = analysis.total_files > 0;

//         if (groqPlanData.files_processing.processed_files) {
//             groqPlanData.files_processing.processed_files.forEach(file => {
//                 if (file.status === 'parsed') {
//                     analysis.file_references.push({
//                         name: file.name,
//                         type: file.content_type,
//                         topics: file.key_topics
//                     });

//                     if (file.has_procedures) analysis.procedures_integrated = true;
//                     if (file.has_examples) analysis.examples_extracted = true;
//                     if (file.key_topics) analysis.key_terminology.push(...file.key_topics);
//                 }
//             });
//         }
//     }

//     // Analyser l'enrichissement
//     if (groqPlanData.resources_enrichment) {
//         analysis.company_context_integrated = groqPlanData.resources_enrichment.has_company_context;
//         analysis.vocabulary_adapted = groqPlanData.resources_enrichment.adaptation_applied?.vocabulary_adapted || false;
//     }

//     // Extraire des sections du plan
//     if (groqPlanData.plan_sections) {
//         groqPlanData.plan_sections.forEach(section => {
//             if (section.enhanced_with_resources) {
//                 if (section.key_terminology) {
//                     analysis.key_terminology.push(...section.key_terminology);
//                 }
//                 if (section.examples_from_resources) {
//                     analysis.extracted_examples.push(...section.examples_from_resources);
//                 }
//             }
//         });
//     }

//     // Déduplication
//     analysis.key_terminology = [...new Set(analysis.key_terminology.flat())].slice(0, 10);
//     analysis.extracted_examples = [...new Set(analysis.extracted_examples.flat())].slice(0, 8);

//     // Calcul qualité
//     if (analysis.files_content_integrated && analysis.vocabulary_adapted && analysis.company_context_integrated) {
//         analysis.adaptation_quality = 'excellent';
//     } else if (analysis.files_content_integrated || analysis.vocabulary_adapted) {
//         analysis.adaptation_quality = 'good';
//     }

//     return analysis;
// }

// // 🎨 PROMPT GROQ ENRICHI POUR NARRATION
// function createEnhancedNarrationPrompt(planData, resourcesAnalysis, actualSlideCount) {
//     const { topic, plan_sections, settings } = planData;
//     const { level = 'beginner', duration = 5 } = settings || {};

//     let prompt = `Crée un script de narration DÉTAILLÉ et COMPLET pour une formation professionnelle sur ${topic}.

// CONTRAINTES STRICTES:
// - EXACTEMENT ${actualSlideCount} scripts (mapping 1:1 avec les slides)
// - Chaque script doit faire 150-250 mots minimum
// - Langage naturel et professionnel
// - Contenu substantiel et pédagogique
// - Adaptation au niveau ${level}

// FORMATION:
// - Sujet: ${topic}
// - Niveau: ${level}
// - Durée totale: ${duration} minutes
// - Public cible: Débutants avec soif d'apprendre

// STRUCTURE OBLIGATOIRE:
// ${plan_sections.map((section, i) => {
//         const slideNum = i + 1;
//         let promptType = '';

//         if (section.type === 'introduction') {
//             promptType = `
// SLIDE ${slideNum} - INTRODUCTION (${section.duration_seconds}s):
// - Accueil chaleureux et professionnel
// - Présentation du sujet ${topic} et de ses avantages
// - Objectifs clairs: ${section.what_to_cover ? section.what_to_cover.join(', ') : 'apprentissage fondamental'}
// - Plan de formation et motivation
// - Minimum 150 mots, ton accueillant`;
//         } else if (section.type === 'conclusion') {
//             promptType = `
// SLIDE ${slideNum} - CONCLUSION (${section.duration_seconds}s):
// - Félicitations pour le parcours accompli
// - Récapitulatif des compétences acquises en ${topic}
// - Encouragements pour la pratique continue
// - Prochaines étapes et ressources
// - Message motivant final
// - Minimum 100 mots, ton motivant`;
//         } else {
//             promptType = `
// SLIDE ${slideNum} - DÉVELOPPEMENT: "${section.title}" (${section.duration_seconds}s):
// - Explication détaillée de: ${section.what_to_cover ? section.what_to_cover.join(', ') : section.title}
// - Exemples concrets et pratiques
// - Points clés à retenir
// - Applications réelles
// - Transitions fluides
// - Minimum 200 mots, ton pédagogique`;
//         }

//         return promptType;
//     }).join('\n')}

// ${resourcesAnalysis.vocabulary_adapted ? `
// TERMINOLOGIE SPÉCIALISÉE À UTILISER:
// ${resourcesAnalysis.key_terminology.join(', ')}
// ` : ''}

// GÉNÈRE ce JSON avec EXACTEMENT ${actualSlideCount} scripts DÉTAILLÉS:

// {
// ${plan_sections.map((section, index) => {
//         const slideKey = `slide_${index + 1}`;
//         return `  "${slideKey}": {
//     "title": "${section.title}",
//     "duration_seconds": ${section.duration_seconds || 60},
//     "script": "[SCRIPT DÉTAILLÉ DE 150+ MOTS POUR ${section.title}]",
//     "tone": "${section.type === 'introduction' ? 'accueillant' : section.type === 'conclusion' ? 'motivant' : 'pédagogique'}",
//     "key_phrases": ${JSON.stringify(resourcesAnalysis.key_terminology.slice(0, 2) || ['point important'])},
//     "uses_resources": ${resourcesAnalysis.files_content_integrated}
//   }`;
//     }).join(',\n')}
// }

// RÈGLES ABSOLUES:
// - Chaque script DOIT être détaillé (150+ mots)
// - Langage naturel et fluide
// - Contenu substantiel et informatif
// - Respect strict des durées
// - AUCUN placeholder ou contenu générique

// Génère UNIQUEMENT ce JSON avec des scripts COMPLETS et DÉTAILLÉS.`;

//     return prompt;
// }

// // 🔍 FONCTION DE VALIDATION QUALITÉ
// function validateScriptQuality(narrationScript) {
//     const scripts = Object.values(narrationScript);
//     const minWordCount = 50;

//     let totalWords = 0;
//     let shortScripts = 0;

//     scripts.forEach(script => {
//         const wordCount = script.script.split(' ').length;
//         totalWords += wordCount;
//         if (wordCount < minWordCount) {
//             shortScripts++;
//         }
//     });

//     const avgWordsPerScript = totalWords / scripts.length;
//     const isValid = shortScripts === 0 && avgWordsPerScript >= minWordCount;

//     console.log(`📊 Qualité scripts: ${avgWordsPerScript.toFixed(0)} mots/script, ${shortScripts} scripts courts`);

//     return {
//         isValid,
//         averageWords: avgWordsPerScript,
//         shortScripts,
//         totalWords
//     };
// }

// // 🎨 CRÉATION PROMPT MARKDOWN ENRICHI
// function createEnhancedMarkdownPrompt(planData, resourcesAnalysis) {
//     const { topic, plan_sections, settings } = planData;
//     const { level = 'beginner', duration = 5, style = 'practical' } = settings || {};

//     let prompt = `Crée un Markdown Slidev PROFESSIONNEL et VISUELLEMENT ATTRACTIF pour une formation sur ${topic}.

// EXIGENCES STRICTES:
// - EXACTEMENT ${plan_sections.length} slides (mapping 1:1)
// - Contenu riche et détaillé pour chaque slide
// - Exemples de code fonctionnels pour ${topic}
// - Design moderne et professionnel
// - Navigation fluide

// SPÉCIFICATIONS:
// - Sujet: ${topic}
// - Niveau: ${level} 
// - Durée: ${duration} minutes
// - Style: ${style}
// - Public: Débutants motivés

// STRUCTURE ATTENDUE:

// # SLIDE TITRE (Intro) 
// - Design accrocheur avec gradient
// - Titre impactant
// - Bouton de navigation animé
// - Badge durée formation

// ${plan_sections.map((section, i) => {
//         const slideNum = i + 1;

//         if (section.type === 'introduction') {
//             return `
// # SLIDE ${slideNum}: ${section.title}
// - Layout: intro ou center
// - Objectifs visuels avec icônes
// - Points d'apprentissage clairement listés
// - Design accueillant avec couleurs douces
// - Indicateur de durée (${section.duration_seconds}s)`;
//         } else if (section.type === 'conclusion') {
//             return `
// # SLIDE ${slideNum}: ${section.title}  
// - Layout: center
// - Grille de réussites avec checkmarks
// - Message de félicitation
// - Prochaines étapes visuelles
// - Call-to-action pour continuer`;
//         } else {
//             return `
// # SLIDE ${slideNum}: ${section.title}
// - Layout: default ou two-cols
// - Contenu: ${section.what_to_cover ? section.what_to_cover.join(', ') : 'concepts essentiels'}
// - Code exemple fonctionnel pour ${topic}
// - Points clés avec mise en forme
// - Encadrés explicatifs colorés`;
//         }
//     }).join('\n')}

// EXEMPLES DE CODE OBLIGATOIRES:
// ${topic.toLowerCase().includes('python') ? `
// - Variables: nom = "Alice", age = 25
// - Conditions: if age >= 18: print("Majeur")  
// - Boucles: for i in range(5): print(i)
// - Fonctions: def saluer(nom): return f"Bonjour {nom}"
// ` : `
// - Code adapté au sujet ${topic}
// - Exemples pratiques et fonctionnels
// `}

// GÉNÈRE le Markdown complet avec design professionnel et contenu riche.
// IMPORTANT: Chaque slide doit avoir du contenu substantiel, pas de placeholders !`;

//     return prompt;
// }

// // 🎯 GÉNÉRATION D'EXEMPLES DE CODE SPÉCIFIQUES
// function getCodeExample(point, topic) {
//     const pointLower = point.toLowerCase();
//     const topicLower = topic.toLowerCase();

//     if (topicLower.includes('python')) {
//         if (pointLower.includes('variable')) {
//             return `nom = "Alice"
// age = 25
// prix = 19.99
// print(f"{nom} a {age} ans")`;
//         } else if (pointLower.includes('type')) {
//             return `# Types de données
// entier = 42
// flottant = 3.14
// texte = "Hello"
// liste = [1, 2, 3]
// print(type(entier))`;
//         } else if (pointLower.includes('condition')) {
//             return `age = 18
// if age >= 18:
//     print("Majeur")
// else:
//     print("Mineur")`;
//         } else if (pointLower.includes('boucle')) {
//             return `# Boucle for
// for i in range(5):
//     print(f"Itération {i}")`;
//         } else if (pointLower.includes('structure') || pointLower.includes('contrôle')) {
//             return `# Structures de contrôle
// for nombre in [1, 2, 3, 4, 5]:
//     if nombre % 2 == 0:
//         print(f"{nombre} est pair")
//     else:
//         print(f"{nombre} est impair")`;
//         }
//     }

//     return `# Code d'exemple pour ${point}
// # À compléter selon le contexte`;
// }

// // 🔍 FONCTION UTILITAIRE POUR EXPLICATIONS DÉTAILLÉES
// function getDetailedExplanation(point, topic) {
//     const pointLower = point.toLowerCase();
//     const topicLower = topic.toLowerCase();

//     if (topicLower.includes('python')) {
//         if (pointLower.includes('variable')) {
//             return 'Les variables en Python stockent des données et sont créées automatiquement lors de l\'affectation.';
//         } else if (pointLower.includes('type')) {
//             return 'Python gère automatiquement les types de données : entiers, flottants, chaînes et listes.';
//         } else if (pointLower.includes('condition')) {
//             return 'Les conditions permettent d\'exécuter du code selon des critères spécifiques.';
//         } else if (pointLower.includes('boucle')) {
//             return 'Les boucles répètent des actions, optimisant l\'efficacité du code.';
//         }
//     }

//     return `Concept fondamental pour maîtriser ${topic}.`;
// }

// // 🎯 SCRIPTS DÉTAILLÉS POUR INTRODUCTION (60 secondes)
// function generateDetailedIntroScript(section, topic, duration, resourcesAnalysis) {
//     let script = '';

//     script += `Bonjour et bienvenue dans cette formation sur ${topic}. `;

//     if (resourcesAnalysis.files_content_integrated) {
//         script += `Cette formation a été spécialement adaptée à vos documents et à votre contexte. `;
//     }

//     script += `Je suis ravi de vous accompagner dans cette découverte. `;

//     if (topic.toLowerCase().includes('python')) {
//         script += `Python est l'un des langages de programmation les plus populaires au monde. Il est apprécié pour sa simplicité, sa lisibilité et sa polyvalence. `;
//         script += `Que vous souhaitiez développer des applications web, analyser des données, créer de l'intelligence artificielle ou automatiser des tâches, Python est un excellent choix. `;
//     } else {
//         script += `${topic} est un sujet fascinant qui vous ouvrira de nouvelles perspectives. `;
//         script += `Au cours de cette formation, nous explorerons ensemble les concepts essentiels et les applications pratiques. `;
//     }

//     script += `Les objectifs de cette formation sont clairs : `;
//     if (section.what_to_cover && section.what_to_cover.length > 0) {
//         section.what_to_cover.forEach((objective, index) => {
//             if (index === section.what_to_cover.length - 1) {
//                 script += `et ${objective.toLowerCase()}. `;
//             } else {
//                 script += `${objective.toLowerCase()}, `;
//             }
//         });
//     } else {
//         script += `vous donner une compréhension solide des fondamentaux et vous préparer à aller plus loin. `;
//     }

//     script += `Cette formation est structurée de manière progressive pour optimiser votre apprentissage. `;
//     script += `Nous commencerons par les bases, puis nous approfondirons les concepts clés avant de conclure par une synthèse pratique. `;
//     script += `Alors, êtes-vous prêt ? Commençons sans plus attendre !`;

//     return script;
// }

// // 🎯 SCRIPTS DÉTAILLÉS POUR DÉVELOPPEMENT (100 secondes)
// function generateDetailedDevelopmentScript(section, topic, duration) {
//     let script = '';

//     script += `Nous entrons maintenant dans une section fondamentale : ${section.title}. `;
//     script += `Cette partie est essentielle pour bien maîtriser ${topic}. `;

//     if (topic.toLowerCase().includes('python')) {
//         if (section.title.toLowerCase().includes('variable')) {
//             script += generatePythonVariablesScript(section);
//         } else if (section.title.toLowerCase().includes('structure') || section.title.toLowerCase().includes('contrôle')) {
//             script += generatePythonControlScript(section);
//         } else {
//             script += generateGenericDevelopmentScript(section, topic);
//         }
//     } else {
//         script += generateGenericDevelopmentScript(section, topic);
//     }

//     script += `Les points clés à retenir de cette section sont importants pour la suite. `;
//     if (section.what_to_cover && section.what_to_cover.length > 0) {
//         script += `Premièrement, ${section.what_to_cover[0].toLowerCase()}. `;
//         if (section.what_to_cover.length > 1) {
//             script += `Deuxièmement, ${section.what_to_cover[1].toLowerCase()}. `;
//         }
//         if (section.what_to_cover.length > 2) {
//             script += `Et enfin, ${section.what_to_cover[2].toLowerCase()}. `;
//         }
//     }

//     script += `Ces concepts vous serviront de base solide pour aborder les aspects plus avancés. `;
//     script += `Prenez le temps de bien assimiler ces notions avant de passer à la suite. `;

//     return script;
// }

// // 🐍 SCRIPT SPÉCIALISÉ POUR VARIABLES PYTHON
// function generatePythonVariablesScript(section) {
//     let script = '';

//     script += `En Python, les variables sont la base de tout programme. Contrairement à d'autres langages, Python n'exige pas de déclarer le type d'une variable à l'avance. `;
//     script += `Vous pouvez simplement écrire "nom égale guillemets Alice guillemets" et Python comprend automatiquement qu'il s'agit d'une chaîne de caractères. `;
//     script += `Pour les nombres, c'est tout aussi simple : "age égale 25" crée une variable entière, tandis que "prix égale 19 virgule 99" crée un nombre décimal. `;
//     script += `Python gère automatiquement les types de données, ce qui rend la programmation plus intuitive. `;
//     script += `Les types de base incluent les entiers pour les nombres sans décimale, les flottants pour les nombres avec décimale, les chaînes pour le texte, et les booléens pour vrai ou faux. `;
//     script += `Une fonctionnalité très pratique est l'affichage formaté avec la fonction print et les f-strings. Par exemple, vous pouvez écrire "print f guillemets nom a age ans guillemets" pour afficher un message personnalisé. `;

//     return script;
// }

// // 🔄 SCRIPT SPÉCIALISÉ POUR STRUCTURES DE CONTRÔLE PYTHON
// function generatePythonControlScript(section) {
//     let script = '';

//     script += `Les structures de contrôle sont ce qui rend vos programmes intelligents et capables de prendre des décisions. `;
//     script += `La condition if-else est fondamentale : elle permet à votre programme de réagir différemment selon les circonstances. `;
//     script += `Par exemple, "if age supérieur ou égal à 18 deux points print Majeur else deux points print Mineur" teste l'âge et affiche le résultat approprié. `;
//     script += `L'indentation en Python n'est pas qu'une question de style : elle définit la structure du code. Chaque bloc indenté appartient à la condition ou à la boucle qui le précède. `;
//     script += `Les boucles for vous permettent de répéter des actions. "for i in range 5" exécute le code cinq fois, avec i qui prend les valeurs 0, 1, 2, 3, 4. `;
//     script += `La boucle while continue tant qu'une condition est vraie, mais attention aux boucles infinies ! `;
//     script += `Ces structures peuvent être combinées pour créer des programmes sophistiqués. Une boucle peut contenir des conditions, et une condition peut contenir d'autres boucles. `;

//     return script;
// }

// // 📚 SCRIPT GÉNÉRIQUE POUR DÉVELOPPEMENT
// function generateGenericDevelopmentScript(section, topic) {
//     let script = '';

//     script += `Ce que nous allons voir maintenant va enrichir considérablement votre compréhension de ${topic}. `;
//     script += `Les concepts que nous abordons sont utilisés quotidiennement par les professionnels du domaine. `;
//     script += `Il est important de comprendre non seulement le "comment" mais aussi le "pourquoi" de chaque notion. `;
//     script += `Chaque élément que nous étudions s'inscrit dans un écosystème plus large et trouve ses applications dans des contextes variés. `;
//     script += `N'hésitez pas à prendre des notes et à réfléchir aux applications pratiques de ce que vous apprenez. `;
//     script += `La théorie prend tout son sens quand elle est mise en perspective avec des exemples concrets. `;

//     return script;
// }

// // 🎯 SCRIPTS DÉTAILLÉS POUR CONCLUSION (40 secondes)
// function generateDetailedConclusionScript(section, topic, duration) {
//     let script = '';

//     script += `Nous arrivons au terme de cette formation sur ${topic}. `;
//     script += `Félicitations ! Vous avez parcouru un chemin important et acquis des compétences précieuses. `;

//     if (topic.toLowerCase().includes('python')) {
//         script += `Vous maîtrisez maintenant les fondamentaux de Python : les variables, les types de données, et les structures de contrôle. `;
//         script += `Ces bases solides vous permettront d'aborder des projets plus ambitieux avec confiance. `;
//     } else {
//         script += `Les concepts que nous avons explorés ensemble constituent un socle solide pour votre développement dans ce domaine. `;
//     }

//     script += `Rappelez-vous que l'apprentissage ne s'arrête pas ici. `;
//     script += `Pratiquez régulièrement, explorez, expérimentez, et n'ayez pas peur de faire des erreurs : elles font partie intégrante du processus d'apprentissage. `;
//     script += `Je vous encourage vivement à poursuivre votre formation et à mettre en pratique ce que vous avez appris. `;
//     script += `Merci de votre attention et de votre engagement. Bonne continuation dans votre parcours !`;

//     return script;
// }

// // 🎯 API PRINCIPALE - POST /ai/plan-to-markdown
// router.post('/plan-to-markdown', async (req, res) => {
//     const startTime = Date.now();

//     try {
//         // Validation de base
//         if (!req.body.plan_sections || !req.body.topic) {
//             return res.status(400).json({
//                 error: 'Format invalide',
//                 required: ['plan_sections', 'topic'],
//                 format: 'Utilisez TOUT le résultat de POST /ai/groq-plan'
//             });
//         }

//         const groqPlanData = req.body;
//         console.log(`📄 Génération Markdown enrichi: ${groqPlanData.topic}`);

//         // 🔍 ANALYSE DES RESSOURCES DISPONIBLES
//         const resourcesAnalysis = analyzeAvailableResources(groqPlanData);
//         console.log(`📚 Ressources détectées: ${resourcesAnalysis.total_files} fichiers, vocabulaire: ${resourcesAnalysis.vocabulary_adapted}`);

//         // 🎨 GÉNÉRATION MARKDOWN ENRICHI
//         console.log('🎨 Génération Markdown Slidev enrichi...');
//         const markdownPrompt = createEnhancedMarkdownPrompt(groqPlanData, resourcesAnalysis);
//         const markdownResponse = await callGroq(markdownPrompt, {
//             temperature: 0.7,
//             max_tokens: 8000 // ✅ Augmenté pour plus de contenu
//         });

//         let slideMarkdown = cleanMarkdown(markdownResponse);

//         // Fallback si nécessaire
//         if (!slideMarkdown.includes('---\ntheme:')) {
//             console.log('🔄 Génération fallback...');
//             slideMarkdown = createFallbackMarkdown(groqPlanData, resourcesAnalysis);
//         }

//         // FORCER MAPPING 1:1 - UNE SLIDE PAR SECTION
//         const actualSlideCount = groqPlanData.plan_sections.length;
//         console.log(`📊 Slides forcées 1:1: ${actualSlideCount} slides = ${groqPlanData.plan_sections.length} sections`);

//         // 🔧 GÉNÉRATION SCRIPT NARRATION AVEC FONCTIONS DÉTAILLÉES
//         console.log('🎬 Génération script narration détaillé...');

//         let narrationScript;
//         try {
//             // 🆕 UTILISER LE PROMPT ENRICHI
//             const enhancedNarrationPrompt = createEnhancedNarrationPrompt(groqPlanData, resourcesAnalysis, actualSlideCount);
//             const narrationResponse = await callGroq(enhancedNarrationPrompt, {
//                 system_content: `Tu es un expert en formation professionnelle qui crée des scripts de narration détaillés et engageants. 
//                 Chaque script doit être substantiel (150+ mots) avec un contenu riche et pédagogique. 
//                 Réponds UNIQUEMENT avec du JSON valide contenant des scripts complets.`,
//                 max_tokens: 8000, // ✅ Augmenté pour plus de contenu
//                 temperature: 0.8  // ✅ Plus de créativité
//             });

//             const cleanedNarration = cleanNarrationResponse(narrationResponse);
//             narrationScript = JSON.parse(cleanedNarration);

//             // 🆕 VALIDATION QUALITÉ DES SCRIPTS
//             const scriptQuality = validateScriptQuality(narrationScript);
//             if (!scriptQuality.isValid) {
//                 console.warn('⚠️ Scripts trop courts, utilisation du fallback enrichi...');
//                 throw new Error('Scripts insuffisants');
//             }

//             // 🆕 VALIDATION SYNCHRONISATION
//             const scriptCount = Object.keys(narrationScript).length;
//             if (scriptCount !== actualSlideCount) {
//                 console.warn(`⚠️ Désynchronisation détectée: ${actualSlideCount} slides vs ${scriptCount} scripts`);
//                 narrationScript = forceSynchronization(narrationScript, actualSlideCount, groqPlanData, resourcesAnalysis);
//             }

//         } catch (parseError) {
//             console.warn('⚠️ Erreur parsing narration, utilisation du fallback ENRICHI...');
//             // ✅ MAINTENANT utilise les fonctions détaillées
//             narrationScript = createSynchronizedFallbackNarration(groqPlanData, resourcesAnalysis, actualSlideCount);
//         }

//         // 🆕 VÉRIFICATION FINALE
//         const finalSlideCount = actualSlideCount;
//         const finalScriptCount = Object.keys(narrationScript).length;

//         console.log(`✅ Synchronisation finale: ${finalSlideCount} slides = ${finalScriptCount} scripts`);

//         // 🆕 VALIDATION FINALE DE LA QUALITÉ
//         const finalQuality = validateScriptQuality(narrationScript);
//         console.log(`📊 Qualité finale: ${finalQuality.totalWords} mots, ${finalQuality.averageWords.toFixed(0)} mots/script`);

//         // 🏗️ ASSEMBLAGE FINAL
//         const slidesId = uuidv4();
//         const totalTime = Date.now() - startTime;

//         const result = {
//             slides_id: slidesId,

//             // RÉSULTATS PRINCIPAUX (Compatible format existant)
//             markdown: slideMarkdown,
//             narration_script: narrationScript,

//             // 🆕 INFORMATIONS SYNCHRONISATION
//             synchronization_info: {
//                 markdown_slides_count: finalSlideCount,
//                 narration_scripts_count: finalScriptCount,
//                 synchronized: finalSlideCount === finalScriptCount,
//                 plan_sections_count: groqPlanData.plan_sections.length,
//                 mapping_type: finalSlideCount === groqPlanData.plan_sections.length ? '1:1' :
//                     finalSlideCount > groqPlanData.plan_sections.length ? 'expanded' : 'compressed'
//             },

//             // 🆕 QUALITÉ DU CONTENU
//             content_quality: {
//                 total_words: finalQuality.totalWords,
//                 average_words_per_script: Math.round(finalQuality.averageWords),
//                 min_words_met: finalQuality.isValid,
//                 short_scripts_count: finalQuality.shortScripts,
//                 content_richness: finalQuality.averageWords >= 100 ? 'excellent' :
//                     finalQuality.averageWords >= 50 ? 'good' : 'basic'
//             },

//             // INFORMATIONS RESSOURCES
//             resource_integration: {
//                 files_used_in_markdown: resourcesAnalysis.files_content_integrated,
//                 company_context_applied: resourcesAnalysis.company_context_integrated,
//                 vocabulary_adapted: resourcesAnalysis.vocabulary_adapted,
//                 examples_from_files: resourcesAnalysis.extracted_examples,
//                 procedures_integrated: resourcesAnalysis.procedures_integrated,
//                 terminology_used: resourcesAnalysis.key_terminology
//             },

//             // COMPATIBILITÉ AVEC FORMAT EXISTANT
//             slides_count: finalSlideCount,
//             topic: groqPlanData.topic,
//             source_plan_id: groqPlanData.plan_id,

//             files: {
//                 markdown: `resource_slides_${slidesId}.md`,
//                 narration: `narration_${slidesId}.json`,
//                 script_txt: `script_${slidesId}.txt`
//             },

//             file_sizes: {
//                 markdown_kb: Math.round(slideMarkdown.length / 1024),
//                 narration_kb: Math.round(JSON.stringify(narrationScript).length / 1024)
//             },

//             slidev_commands: {
//                 preview: `slidev resource_slides_${slidesId}.md`,
//                 export_pdf: `slidev export resource_slides_${slidesId}.md --format pdf`,
//                 export_html: `slidev export resource_slides_${slidesId}.md --format html`
//             },

//             video_production: {
//                 total_duration_seconds: Object.values(narrationScript).reduce((sum, script) => sum + script.duration_seconds, 0),
//                 slides_with_timing: Object.keys(narrationScript).length,
//                 ready_for_recording: true,
//                 uses_company_terminology: resourcesAnalysis.vocabulary_adapted,
//                 references_uploaded_files: resourcesAnalysis.files_content_integrated,
//                 perfectly_synchronized: true,
//                 estimated_video_quality: finalQuality.averageWords >= 100 ? 'high' : 'medium'
//             },

//             generation_time_ms: totalTime,
//             generated_at: new Date().toISOString(),
//             status: 'completed',
//             ready_for_production: true,

//             next_steps: {
//                 audio_generation: 'POST /ai/generate-narration-bark avec script synchronisé',
//                 customization: resourcesAnalysis.company_context_integrated ?
//                     'Contenu déjà adapté à votre contexte' :
//                     'Personnaliser selon votre contexte',
//                 video_creation: 'Utiliser Slidev pour créer la vidéo avec les scripts enrichis'
//             }
//         };

//         console.log(`✅ Génération complète: ${finalSlideCount} slides synchronisées, ${finalQuality.totalWords} mots total, ${resourcesAnalysis.total_files} fichiers intégrés, ${totalTime}ms`);
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

// // 🔧 ROUTE SAUVEGARDE
// router.post('/save-files', async (req, res) => {
//     try {
//         const { markdown, narration_script, slides_id } = req.body;

//         if (!markdown) {
//             return res.status(400).json({
//                 error: 'Le champ "markdown" est requis'
//             });
//         }

//         const slidesDir = path.join(__dirname, '..', '..', 'generated-slides');
//         await fs.mkdir(slidesDir, { recursive: true });

//         const baseFilename = slides_id || `resource_slides_${Date.now()}`;
//         const savedFiles = [];

//         // Sauvegarder markdown
//         const markdownFile = `${baseFilename}.md`;
//         const markdownPath = path.join(slidesDir, markdownFile);
//         await fs.writeFile(markdownPath, markdown, 'utf8');
//         savedFiles.push(markdownFile);

//         // Sauvegarder script narration
//         if (narration_script) {
//             const narrationFile = `narration_${baseFilename}.json`;
//             const narrationPath = path.join(slidesDir, narrationFile);
//             await fs.writeFile(narrationPath, JSON.stringify(narration_script, null, 2), 'utf8');
//             savedFiles.push(narrationFile);

//             // Script texte
//             const scriptText = Object.entries(narration_script)
//                 .map(([slide, data]) => `=== ${data.title} (${data.duration_seconds}s) ===\n${data.script}\n`)
//                 .join('\n');

//             const scriptFile = `script_${baseFilename}.txt`;
//             const scriptPath = path.join(slidesDir, scriptFile);
//             await fs.writeFile(scriptPath, scriptText, 'utf8');
//             savedFiles.push(scriptFile);
//         }

//         res.json({
//             message: 'Fichiers sauvés avec succès',
//             saved_files: savedFiles,
//             directory: slidesDir,
//             slidev_command: `cd generated-slides && slidev ${markdownFile}`
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: 'Erreur sauvegarde',
//             details: error.message
//         });
//     }
// });

// // 🔧 ROUTE INFO
// router.get('/plan-to-markdown/info', (req, res) => {
//     res.json({
//         endpoint: 'POST /ai/plan-to-markdown',
//         description: 'Convertit le plan en Markdown Slidev enrichi avec narration détaillée et synchronisation parfaite',
//         version: '7.0 - SCRIPTS DÉTAILLÉS + VALIDATION QUALITÉ',
//         status: '✅ OPÉRATIONNEL',

//         corrections_v7: [
//             '🔧 Scripts narration détaillés (150+ mots)',
//             '📊 Validation qualité automatique',
//             '🎯 Fallback enrichi avec fonctions détaillées',
//             '💻 Markdown visuellement attractif',
//             '⏱️ Synchronisation 1:1 garantie',
//             '🎬 Prêt pour production vidéo'
//         ],

//         fonctionnalités: [
//             '🔄 Synchronisation automatique slides ↔ scripts narration',
//             '📚 Scripts détaillés (150-250 mots par slide)',
//             '🎬 Narration professionnelle et naturelle',
//             '🏢 Adaptation automatique au contexte entreprise',
//             '🔑 Intégration terminologie spécifique',
//             '💡 Exemples personnalisés des documents',
//             '📊 Validation et correction automatique',
//             '💻 Génération automatique d\'exemples de code',
//             '🎨 Design Slidev moderne et attractif'
//         ],

//         quality_features: [
//             '✅ Scripts minimum 50 mots (objectif 150+)',
//             '📊 Validation automatique de la qualité',
//             '🔧 Fallback enrichi si API insuffisante',
//             '⚖️ Contenu substantiel et professionnel',
//             '🔍 Logs détaillés pour debugging'
//         ],

//         video_production_ready: [
//             '🎬 Scripts narration complets et détaillés',
//             '⏱️ Synchronisation parfaite timing/contenu',
//             '🎯 Contenu adapté au rythme de parole naturel',
//             '💫 Transitions fluides entre sections',
//             '🏆 Qualité professionnelle garantie'
//         ],

//         workflow: [
//             '1. POST /ai/groq-plan (génère 4 sections)',
//             '2. POST /ai/plan-to-markdown (génère 4 slides + scripts détaillés)',
//             '3. Validation qualité automatique',
//             '4. Synchronisation 1:1 forcée',
//             '5. POST /ai/save-files (sauvegarde)',
//             '6. slidev preview (création vidéo)'
//         ],

//         garanties: {
//             synchronization: '100% - Nombre slides = scripts = sections',
//             content_quality: 'Scripts détaillés 150+ mots',
//             timing_accuracy: 'Durées exactes du plan respectées',
//             video_ready: 'Prêt pour production vidéo immédiate',
//             fallback_quality: 'Fallback enrichi si API échoue'
//         }
//     });
// });

// // 🧪 ROUTE DE TEST SYNCHRONISATION
// router.post('/test-synchronization', async (req, res) => {
//     try {
//         const { markdown, plan_sections } = req.body;

//         if (!markdown || !plan_sections) {
//             return res.status(400).json({
//                 error: 'markdown et plan_sections requis'
//             });
//         }

//         const slideCount = plan_sections.length;
//         const sectionCount = plan_sections.length;

//         // Test de synchronisation
//         const mockResourcesAnalysis = {
//             total_files: 0,
//             vocabulary_adapted: false,
//             files_content_integrated: false,
//             key_terminology: [],
//             extracted_examples: []
//         };

//         const syncedNarration = createSynchronizedFallbackNarration(
//             { plan_sections },
//             mockResourcesAnalysis,
//             slideCount
//         );

//         // Test de qualité
//         const qualityTest = validateScriptQuality(syncedNarration);

//         res.json({
//             test_results: {
//                 detected_slides: slideCount,
//                 plan_sections: sectionCount,
//                 generated_scripts: Object.keys(syncedNarration).length,
//                 synchronized: Object.keys(syncedNarration).length === slideCount,
//                 mapping_type: '1:1 FORCÉ'
//             },
//             quality_analysis: {
//                 total_words: qualityTest.totalWords,
//                 average_words_per_script: Math.round(qualityTest.averageWords),
//                 quality_met: qualityTest.isValid,
//                 short_scripts: qualityTest.shortScripts,
//                 content_richness: qualityTest.averageWords >= 100 ? 'excellent' : 'good'
//             },
//             mapping_analysis: {
//                 type: '1:1',
//                 ratio: 1.0,
//                 forced: true,
//                 no_expansion: true
//             },
//             generated_narration: syncedNarration,
//             success: true,
//             version: '7.0 - Scripts détaillés + validation qualité'
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: 'Erreur test synchronisation',
//             details: error.message
//         });
//     }
// });

// module.exports = router;
























// le precedent marche bien mais prend bcp de texte par slide

// const express = require('express');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
// const fs = require('fs').promises;
// const path = require('path');

// const router = express.Router();

// // 🤖 Fonction Groq pour génération intelligente
// async function callGroq(prompt, options = {}) {
//     try {
//         const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
//             model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
//             messages: [
//                 {
//                     role: 'system',
//                     content: options.system_content || 'Tu es un expert Slidev qui crée du Markdown sophistiqué en utilisant intelligemment les ressources fournies. Réponds UNIQUEMENT avec du Markdown Slidev valide.'
//                 },
//                 {
//                     role: 'user',
//                     content: prompt
//                 }
//             ],
//             temperature: options.temperature || 0.7,
//             max_tokens: options.max_tokens || 5000
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         return response.data.choices[0].message.content;
//     } catch (error) {
//         console.error('❌ Erreur Groq:', error.message);
//         throw new Error('Erreur génération IA: ' + error.message);
//     }
// }

// // 🔧 FONCTIONS UTILITAIRES
// function cleanMarkdown(markdown) {
//     return markdown
//         .replace(/```markdown\n/g, '')
//         .replace(/\n```/g, '')
//         .replace(/```/g, '')
//         .trim();
// }

// function cleanNarrationResponse(response) {
//     return response
//         .replace(/```json\n/g, '')
//         .replace(/\n```/g, '')
//         .replace(/```/g, '')
//         .replace(/^[^{]*/, '')
//         .replace(/[^}]*$/, '')
//         .trim();
// }

// // 🔧 GÉNÉRATION CODE SECTION ADAPTÉE POUR VISUELS
// function generateCodeSection(topic, section) {
//     const topicLower = topic.toLowerCase();

//     if (topicLower.includes('python')) {
//         if (section.title.toLowerCase().includes('variable')) {
//             return `    <div class="bg-gray-900 rounded-lg p-4">
//       <div class="text-green-400 text-sm mb-2"># Variables Python</div>
//       <pre><code class="text-green-300">nom = "Alice"
// age = 25
// prix = 19.99
// print(f"{nom} a {age} ans")</code></pre>
//     </div>`;
//         } else if (section.title.toLowerCase().includes('structure') || section.title.toLowerCase().includes('contrôle')) {
//             return `    <div class="bg-gray-900 rounded-lg p-4">
//       <div class="text-green-400 text-sm mb-2"># Structures de contrôle</div>
//       <pre><code class="text-green-300">age = 18
// if age >= 18:
//     print("Majeur")
// else:
//     print("Mineur")</code></pre>
//     </div>`;
//         } else {
//             return `    <div class="bg-gray-900 rounded-lg p-4">
//       <div class="text-green-400 text-sm mb-2"># Exemple Python</div>
//       <pre><code class="text-green-300"># Code exemple pour ${section.title}
// def exemple():
//     return "Hello World"</code></pre>
//     </div>`;
//         }
//     } else if (topicLower.includes('excel')) {
//         return `    <div class="bg-gray-900 rounded-lg p-4">
//       <div class="text-green-400 text-sm mb-2"># Formules Excel</div>
//       <pre><code class="text-green-300">=SOMME(A1:A10)
// =SI(B2>100;"Élevé";"Faible")
// =RECHERCHEV(A1;Table;2;FAUX)</code></pre>
//     </div>`;
//     } else {
//         return `    <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
//       <h4 class="text-lg font-semibold mb-4">📋 Exemple pratique</h4>
//       <div class="text-sm">
//         Application concrète des concepts de ${section.title}
//       </div>
//     </div>`;
//     }
// }

// // 🔧 GÉNÉRATION CODE SECTION FALLBACK
// function generateCodeSectionFallback(topic, section) {
//     const topicLower = topic.toLowerCase();

//     if (topicLower.includes('python')) {
//         if (section.title.toLowerCase().includes('variable')) {
//             return `    <div class="bg-gray-900 rounded-lg p-4">
//       <div class="text-green-400 text-sm mb-2"># Variables Python</div>
//       <pre><code class="text-green-300">nom = "Alice"
// age = 25
// prix = 19.99
// print(f"{nom} a {age} ans")</code></pre>
//     </div>`;
//         } else if (section.title.toLowerCase().includes('structure')) {
//             return `    <div class="bg-gray-900 rounded-lg p-4">
//       <div class="text-green-400 text-sm mb-2"># Structures de contrôle</div>
//       <pre><code class="text-green-300">age = 18
// if age >= 18:
//     print("Majeur")
// else:
//     print("Mineur")</code></pre>
//     </div>`;
//         }
//     } else if (topicLower.includes('excel')) {
//         return `    <div class="bg-gray-900 rounded-lg p-4">
//       <div class="text-green-400 text-sm mb-2"># Formules Excel</div>
//       <pre><code class="text-green-300">=SOMME(A1:A10)
// =MOYENNE(B1:B20)
// =SI(A1>100;"Élevé";"Faible")</code></pre>
//     </div>`;
//     }

//     return `    <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
//       <h4 class="text-lg font-semibold mb-4">📋 Exemple pratique</h4>
//       <div class="text-sm">
//         Application concrète de ${section.title}
//       </div>
//     </div>`;
// }

// // 🎨 CRÉATION PROMPT MARKDOWN OPTIMISÉ POUR VISUELS
// function createOptimizedMarkdownPrompt(planData, resourcesAnalysis) {
//     const { topic, plan_sections, settings } = planData;
//     const { level = 'beginner', duration = 5, style = 'practical' } = settings || {};

//     let prompt = `Crée un Markdown Slidev OPTIMISÉ pour génération de visuels sur ${topic}.

// CONTRAINTES STRICTES POUR PARSER DE VISUELS:
// - EXACTEMENT ${plan_sections.length} slides principales (hors métadonnées)
// - Chaque slide doit avoir un titre clair avec # ou ##
// - Durée explicite avec ⏱️ XXs sur chaque slide
// - Contenu substantiel et parsable
// - Séparateurs --- nets entre slides

// STRUCTURE OBLIGATOIRE:

// # MÉTADONNÉES (sera filtrée par le parser)
// ---
// theme: default
// background: linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)
// class: text-center
// title: ${topic}
// ---

// ${plan_sections.map((section, i) => {
//         const slideNum = i + 1;
//         const duration = section.duration_seconds || 60;

//         if (section.type === 'introduction') {
//             return `
// # SLIDE ${slideNum}: ${section.title}
// Layout: intro ou center obligatoire
// Durée: ${duration}s

// Exemple attendu:
// # ${section.title}

// <div class="max-w-4xl mx-auto">
//   <div class="text-6xl mb-6">🎯</div>
//   <div class="text-2xl text-blue-200 mb-4">Objectifs clairs</div>

//   <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
//     <div>
// ${section.what_to_cover ? section.what_to_cover.map(point => `      <div class="flex items-center mb-4">
//         <div class="text-2xl mr-3">✅</div>
//         <div class="text-lg">${point}</div>
//       </div>`).join('\n') : '      <div class="text-lg">Concepts fondamentaux</div>'}
//     </div>
//     <div class="text-center">
//       <div class="bg-blue-100/10 rounded-xl p-6">
//         <div class="text-4xl mb-4">📚</div>
//         <div class="text-xl font-semibold">Formation ${topic}</div>
//         <div class="text-blue-300">Niveau ${level}</div>
//       </div>
//     </div>
//   </div>
// </div>

// ⏱️ ${duration}s`;

//         } else if (section.type === 'conclusion') {
//             return `
// # SLIDE ${slideNum}: ${section.title}
// Layout: center obligatoire
// Durée: ${duration}s

// Exemple attendu:
// # ${section.title}

// <div class="max-w-4xl mx-auto">
//   <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
// ${section.what_to_cover ? section.what_to_cover.map(point => `    <div class="bg-green-100/20 p-6 rounded-xl">
//       <div class="text-4xl mb-4">✅</div>
//       <div class="font-bold text-lg mb-2">${point}</div>
//       <div class="text-sm">Compétence maîtrisée</div>
//     </div>`).join('\n') : `    <div class="bg-green-100/20 p-6 rounded-xl">
//       <div class="text-4xl mb-4">✅</div>
//       <div class="font-bold text-lg mb-2">Objectifs atteints</div>
//     </div>`}
//   </div>

//   <div class="pt-8">
//     <span class="px-10 py-5 rounded-xl bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white font-bold text-2xl">
//       🎉 Formation terminée !
//     </span>
//     <div class="mt-4 text-lg text-blue-200">
//       Vous maîtrisez maintenant ${topic} !
//     </div>
//   </div>
// </div>

// ⏱️ ${duration}s`;

//         } else {
//             // Type development/content
//             return `
// # SLIDE ${slideNum}: ${section.title}
// Layout: default obligatoire
// Durée: ${duration}s

// Exemple attendu:
// # ${section.title}

// <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
//   <div>
// ${section.what_to_cover ? section.what_to_cover.map((point, index) => `
//     <div class="mb-6">
//       <h3 class="text-xl font-semibold mb-3 flex items-center">
//         <span class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">${index + 1}</span>
//         ${point}
//       </h3>
//       <div class="text-gray-600 dark:text-gray-300">
//         Explication détaillée de ${point.toLowerCase()}
//       </div>
//     </div>`).join('') : `
//     <div class="mb-6">
//       <h3 class="text-xl font-semibold mb-3">Concepts essentiels</h3>
//       <div class="text-gray-600 dark:text-gray-300">
//         Points clés à maîtriser pour ${topic}
//       </div>
//     </div>`}
//   </div>

//   <div>
// ${generateCodeSection(topic, section)}

//     <div class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
//       <h4 class="font-semibold text-green-700 dark:text-green-300 mb-2">💡 Points clés</h4>
//       <ul class="text-sm text-green-600 dark:text-green-400 space-y-1">
//         <li>• Concept fondamental</li>
//         <li>• Application pratique</li>
//         <li>• Bonne pratique recommandée</li>
//       </ul>
//     </div>
//   </div>
// </div>

// ⏱️ ${duration}s`;
//         }
//     }).join('\n')}

// RÈGLES ABSOLUES POUR COMPATIBILITÉ PARSER:
// 1. Chaque slide DOIT commencer par # TitreClairEtCourt
// 2. Chaque slide DOIT finir par ⏱️ XXs
// 3. Séparateurs --- entre chaque slide
// 4. Contenu riche avec HTML/CSS valide
// 5. Émojis pour améliorer la détection visuelle
// 6. Pas de placeholders ou contenu générique

// GÉNÈRE le Markdown Slidev complet avec ${plan_sections.length} slides parfaitement structurées.`;

//     return prompt;
// }

// // 🔧 FALLBACK MARKDOWN OPTIMISÉ POUR PARSER
// function createOptimizedFallbackMarkdown(planData, resourcesAnalysis) {
//     const { topic, plan_sections, settings } = planData;
//     const { duration = 5 } = settings || {};

//     let markdown = `---
// theme: default
// background: linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)
// class: text-center
// title: ${topic}
// ---

// # ${topic}
// ## Formation ${duration} minutes

// <div class="text-center">
//   <div class="text-6xl mb-6">🎯</div>
//   <div class="text-2xl text-blue-200 mb-4">Formation complète et pratique</div>
//   ${resourcesAnalysis.files_content_integrated ? `
//   <div class="text-sm mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
//     📚 Formation enrichie par ${resourcesAnalysis.total_files} document(s)
//   </div>
//   ` : ''}
//   <span class="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl">
//     🚀 Commencer
//   </span>
// </div>

// ⏱️ 45s

// `;

//     plan_sections.forEach((section, index) => {
//         const duration = section.duration_seconds || 60;

//         markdown += `---

// # ${section.title}

// `;

//         if (section.type === 'introduction') {
//             markdown += `<div class="max-w-4xl mx-auto">
//   <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
//     <div>
//       <h3 class="text-3xl font-bold mb-6 text-blue-300">🎯 Objectifs</h3>
//       <ul class="text-xl space-y-3 text-left">
// ${section.what_to_cover ? section.what_to_cover.map(point => `        <li>• <strong>${point}</strong></li>`).join('\n') : '        <li>• <strong>Comprendre les bases</strong></li>'}
//       </ul>
//     </div>
//     <div class="text-center">
//       <div class="bg-blue-100/10 rounded-xl p-6">
//         <div class="text-4xl mb-4">📚</div>
//         <div class="text-xl font-semibold">Formation ${topic}</div>
//         <div class="text-blue-300">Niveau débutant</div>
//       </div>
//     </div>
//   </div>
// </div>

// ⏱️ ${duration}s

// `;

//         } else if (section.type === 'conclusion') {
//             markdown += `<div class="max-w-4xl mx-auto">
//   <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
// ${section.what_to_cover ? section.what_to_cover.map(point => `    <div class="bg-green-100/20 p-6 rounded-xl">
//       <div class="text-4xl mb-4">✅</div>
//       <div class="font-bold text-lg mb-2">${point}</div>
//       <div class="text-sm">Compétence acquise</div>
//     </div>`).join('\n') : `    <div class="bg-green-100/20 p-6 rounded-xl">
//       <div class="text-4xl mb-4">✅</div>
//       <div class="font-bold text-lg mb-2">Objectifs atteints</div>
//     </div>`}
//   </div>

//   <div class="pt-8">
//     <span class="px-10 py-5 rounded-xl bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white font-bold text-2xl">
//       🎉 Formation terminée !
//     </span>
//     <div class="mt-4 text-lg text-blue-200">
//       Vous maîtrisez maintenant ${topic} !
//     </div>
//   </div>
// </div>

// ⏱️ ${duration}s

// `;

//         } else {
//             // Type development
//             markdown += `<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
//   <div>
// ${section.what_to_cover ? section.what_to_cover.map((point, i) => `
//     <div class="mb-6">
//       <h3 class="text-xl font-semibold mb-3 flex items-center">
//         <span class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">${i + 1}</span>
//         ${point}
//       </h3>
//       <div class="text-gray-600 dark:text-gray-300">
//         ${getDetailedExplanation(point, topic)}
//       </div>
//     </div>
// `).join('') : `
//     <div class="mb-6">
//       <h3 class="text-xl font-semibold mb-3">Concepts essentiels</h3>
//       <div class="text-gray-600 dark:text-gray-300">
//         Points clés à maîtriser pour ${topic}
//       </div>
//     </div>
// `}
//   </div>

//   <div>
// ${generateCodeSectionFallback(topic, section)}

//     <div class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
//       <h4 class="font-semibold text-green-700 dark:text-green-300 mb-2">💡 Points clés</h4>
//       <ul class="text-sm text-green-600 dark:text-green-400 space-y-1">
//         <li>• Syntaxe simple et intuitive</li>
//         <li>• Application pratique immédiate</li>
//         <li>• Bonne pratique recommandée</li>
//       </ul>
//     </div>
//   </div>
// </div>

// ⏱️ ${duration}s

// `;
//         }
//     });

//     return markdown;
// }

// // ✅ VALIDATION MARKDOWN POUR PARSER DE VISUELS
// function validateMarkdownForVisuals(markdown, expectedSlides) {
//     const validation = {
//         valid: true,
//         detected_slides: 0,
//         titles_clear: false,
//         durations_present: false,
//         content_structured: false,
//         emojis_present: false,
//         issues: []
//     };

//     // Compter les slides réelles (sections avec contenu)
//     const sections = markdown.split('---').filter(section => section.trim().length > 0);
//     validation.detected_slides = Math.max(1, sections.length - 1); // -1 pour les métadonnées

//     // Vérifier titres clairs
//     const titles = markdown.match(/^# [^#\n]+$/gm) || [];
//     validation.titles_clear = titles.length >= expectedSlides;
//     if (!validation.titles_clear) {
//         validation.issues.push(`Titres insuffisants: ${titles.length}/${expectedSlides}`);
//     }

//     // Vérifier durées présentes
//     const durations = markdown.match(/⏱️\s*\d+s/g) || [];
//     validation.durations_present = durations.length >= expectedSlides;
//     if (!validation.durations_present) {
//         validation.issues.push(`Durées manquantes: ${durations.length}/${expectedSlides}`);
//     }

//     // Vérifier structure de contenu
//     validation.content_structured = markdown.includes('<div') && markdown.includes('class=');
//     if (!validation.content_structured) {
//         validation.issues.push('Structure HTML/CSS insuffisante');
//     }

//     // Vérifier présence d'émojis
//     validation.emojis_present = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|🎯|🚀|✅|📚|💡/u.test(markdown);
//     if (!validation.emojis_present) {
//         validation.issues.push('Émojis manquants pour détection visuelle');
//     }

//     // Validation globale
//     validation.valid = validation.titles_clear && validation.durations_present && validation.content_structured;

//     return validation;
// }

// // 🔧 CORRECTION MARKDOWN POUR PARSER
// function fixMarkdownForVisuals(markdown, planData, resourcesAnalysis) {
//     console.log('🔧 Correction automatique du markdown pour parser...');

//     // Si le markdown est trop cassé, utiliser le fallback optimisé
//     const basicValidation = markdown.includes('---') && markdown.includes('#');
//     if (!basicValidation) {
//         return createOptimizedFallbackMarkdown(planData, resourcesAnalysis);
//     }

//     let fixedMarkdown = markdown;

//     // Assurer les durées sur chaque slide
//     const sections = fixedMarkdown.split('---');
//     const fixedSections = sections.map((section, index) => {
//         if (index === 0) return section; // Métadonnées

//         const sectionIndex = index - 1;
//         const correspondingSection = planData.plan_sections[sectionIndex];

//         if (correspondingSection && !section.includes('⏱️')) {
//             const duration = correspondingSection.duration_seconds || 60;
//             section += `\n\n⏱️ ${duration}s`;
//         }

//         // Assurer un titre clair
//         if (!section.match(/^# [^#\n]+$/m) && correspondingSection) {
//             section = `\n# ${correspondingSection.title}\n\n${section}`;
//         }

//         return section;
//     });

//     fixedMarkdown = fixedSections.join('---');

//     // Ajouter des émojis si manquants
//     if (!/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|🎯|🚀|✅|📚|💡/u.test(fixedMarkdown)) {
//         fixedMarkdown = fixedMarkdown.replace(/^# ([^\n]+)$/gm, '# $1 🎯');
//     }

//     return fixedMarkdown;
// }

// // 🆕 FONCTIONS DE SYNCHRONISATION (gardées identiques)
// function countActualSlides(markdown) {
//     const slidesSeparators = markdown.match(/^---$/gm) || [];
//     let slideCount = Math.max(1, slidesSeparators.length - 1);

//     const layoutsFound = markdown.match(/layout:\s*(intro|default|two-cols|center|end)/g) || [];
//     if (layoutsFound.length > 0) {
//         slideCount = Math.max(slideCount, layoutsFound.length);
//     }

//     const titleSlides = markdown.match(/^#\s+.+$/gm) || [];
//     if (titleSlides.length > slideCount) {
//         slideCount = titleSlides.length;
//     }

//     console.log(`📊 Détection slides: separators=${slidesSeparators.length - 1}, layouts=${layoutsFound.length}, titles=${titleSlides.length}, final=${slideCount}`);
//     return Math.max(slideCount, 1);
// }

// function forceSynchronization(narrationScript, targetCount, planData, resourcesAnalysis) {
//     const currentCount = Object.keys(narrationScript).length;

//     if (currentCount === targetCount) {
//         return narrationScript;
//     }

//     console.log(`🔧 Forçage synchronisation: ${currentCount} → ${targetCount} scripts`);
//     return createSynchronizedFallbackNarration(planData, resourcesAnalysis, targetCount);
// }

// // 🔧 FONCTION CORRIGÉE - createSynchronizedFallbackNarration
// function createSynchronizedFallbackNarration(planData, resourcesAnalysis, slideCount) {
//     const { plan_sections } = planData;
//     const narration = {};

//     console.log(`🔧 Création narration synchronisée 1:1: ${slideCount} scripts pour ${plan_sections.length} sections`);

//     for (let i = 0; i < slideCount; i++) {
//         const slideKey = `slide_${i + 1}`;
//         const mappedSection = plan_sections[i];

//         let tone = 'pédagogique';
//         let title = mappedSection.title;
//         let script = '';

//         const sectionDuration = mappedSection.duration_seconds || 60;

//         // 🎯 UTILISATION FORCÉE DES FONCTIONS DÉTAILLÉES
//         if (mappedSection.type === 'introduction') {
//             tone = 'accueillant';
//             title = mappedSection.title || 'Introduction';
//             script = generateDetailedIntroScript(mappedSection, planData.topic, sectionDuration, resourcesAnalysis);

//         } else if (mappedSection.type === 'conclusion') {
//             tone = 'motivant';
//             title = mappedSection.title;
//             script = generateDetailedConclusionScript(mappedSection, planData.topic, sectionDuration);

//         } else {
//             tone = 'pédagogique';
//             script = generateDetailedDevelopmentScript(mappedSection, planData.topic, sectionDuration);
//         }

//         narration[slideKey] = {
//             title: title,
//             duration_seconds: sectionDuration,
//             script: script, // ✅ Maintenant utilise les scripts détaillés
//             tone: tone,
//             key_phrases: resourcesAnalysis.key_terminology.slice(0, 2) || ["Point important"],
//             uses_resources: resourcesAnalysis.files_content_integrated,
//             mapped_from_section: i + 1,
//             slide_position: i + 1,
//             auto_generated: false
//         };
//     }

//     return narration;
// }

// // 🔍 ANALYSE DES RESSOURCES DISPONIBLES
// function analyzeAvailableResources(groqPlanData) {
//     const analysis = {
//         total_files: 0,
//         files_content_integrated: false,
//         company_context_integrated: false,
//         vocabulary_adapted: false,
//         procedures_integrated: false,
//         examples_extracted: false,
//         key_terminology: [],
//         extracted_examples: [],
//         file_references: [],
//         adaptation_quality: 'basic'
//     };

//     // Analyser les fichiers traités
//     if (groqPlanData.files_processing) {
//         analysis.total_files = groqPlanData.files_processing.processed_successfully || 0;
//         analysis.files_content_integrated = analysis.total_files > 0;

//         if (groqPlanData.files_processing.processed_files) {
//             groqPlanData.files_processing.processed_files.forEach(file => {
//                 if (file.status === 'parsed') {
//                     analysis.file_references.push({
//                         name: file.name,
//                         type: file.content_type,
//                         topics: file.key_topics
//                     });

//                     if (file.has_procedures) analysis.procedures_integrated = true;
//                     if (file.has_examples) analysis.examples_extracted = true;
//                     if (file.key_topics) analysis.key_terminology.push(...file.key_topics);
//                 }
//             });
//         }
//     }

//     // Analyser l'enrichissement
//     if (groqPlanData.resources_enrichment) {
//         analysis.company_context_integrated = groqPlanData.resources_enrichment.has_company_context;
//         analysis.vocabulary_adapted = groqPlanData.resources_enrichment.adaptation_applied?.vocabulary_adapted || false;
//     }

//     // Extraire des sections du plan
//     if (groqPlanData.plan_sections) {
//         groqPlanData.plan_sections.forEach(section => {
//             if (section.enhanced_with_resources) {
//                 if (section.key_terminology) {
//                     analysis.key_terminology.push(...section.key_terminology);
//                 }
//                 if (section.examples_from_resources) {
//                     analysis.extracted_examples.push(...section.examples_from_resources);
//                 }
//             }
//         });
//     }

//     // Déduplication
//     analysis.key_terminology = [...new Set(analysis.key_terminology.flat())].slice(0, 10);
//     analysis.extracted_examples = [...new Set(analysis.extracted_examples.flat())].slice(0, 8);

//     // Calcul qualité
//     if (analysis.files_content_integrated && analysis.vocabulary_adapted && analysis.company_context_integrated) {
//         analysis.adaptation_quality = 'excellent';
//     } else if (analysis.files_content_integrated || analysis.vocabulary_adapted) {
//         analysis.adaptation_quality = 'good';
//     }

//     return analysis;
// }

// // 🎨 PROMPT GROQ ENRICHI POUR NARRATION
// function createEnhancedNarrationPrompt(planData, resourcesAnalysis, actualSlideCount) {
//     const { topic, plan_sections, settings } = planData;
//     const { level = 'beginner', duration = 5 } = settings || {};

//     let prompt = `Crée un script de narration DÉTAILLÉ et COMPLET pour une formation professionnelle sur ${topic}.

// CONTRAINTES STRICTES:
// - EXACTEMENT ${actualSlideCount} scripts (mapping 1:1 avec les slides)
// - Chaque script doit faire 150-250 mots minimum
// - Langage naturel et professionnel
// - Contenu substantiel et pédagogique
// - Adaptation au niveau ${level}

// FORMATION:
// - Sujet: ${topic}
// - Niveau: ${level}
// - Durée totale: ${duration} minutes
// - Public cible: Débutants avec soif d'apprendre

// STRUCTURE OBLIGATOIRE:
// ${plan_sections.map((section, i) => {
//         const slideNum = i + 1;
//         let promptType = '';

//         if (section.type === 'introduction') {
//             promptType = `
// SLIDE ${slideNum} - INTRODUCTION (${section.duration_seconds}s):
// - Accueil chaleureux et professionnel
// - Présentation du sujet ${topic} et de ses avantages
// - Objectifs clairs: ${section.what_to_cover ? section.what_to_cover.join(', ') : 'apprentissage fondamental'}
// - Plan de formation et motivation
// - Minimum 150 mots, ton accueillant`;
//         } else if (section.type === 'conclusion') {
//             promptType = `
// SLIDE ${slideNum} - CONCLUSION (${section.duration_seconds}s):
// - Félicitations pour le parcours accompli
// - Récapitulatif des compétences acquises en ${topic}
// - Encouragements pour la pratique continue
// - Prochaines étapes et ressources
// - Message motivant final
// - Minimum 100 mots, ton motivant`;
//         } else {
//             promptType = `
// SLIDE ${slideNum} - DÉVELOPPEMENT: "${section.title}" (${section.duration_seconds}s):
// - Explication détaillée de: ${section.what_to_cover ? section.what_to_cover.join(', ') : section.title}
// - Exemples concrets et pratiques
// - Points clés à retenir
// - Applications réelles
// - Transitions fluides
// - Minimum 200 mots, ton pédagogique`;
//         }

//         return promptType;
//     }).join('\n')}

// ${resourcesAnalysis.vocabulary_adapted ? `
// TERMINOLOGIE SPÉCIALISÉE À UTILISER:
// ${resourcesAnalysis.key_terminology.join(', ')}
// ` : ''}

// GÉNÈRE ce JSON avec EXACTEMENT ${actualSlideCount} scripts DÉTAILLÉS:

// {
// ${plan_sections.map((section, index) => {
//         const slideKey = `slide_${index + 1}`;
//         return `  "${slideKey}": {
//     "title": "${section.title}",
//     "duration_seconds": ${section.duration_seconds || 60},
//     "script": "[SCRIPT DÉTAILLÉ DE 150+ MOTS POUR ${section.title}]",
//     "tone": "${section.type === 'introduction' ? 'accueillant' : section.type === 'conclusion' ? 'motivant' : 'pédagogique'}",
//     "key_phrases": ${JSON.stringify(resourcesAnalysis.key_terminology.slice(0, 2) || ['point important'])},
//     "uses_resources": ${resourcesAnalysis.files_content_integrated}
//   }`;
//     }).join(',\n')}
// }

// RÈGLES ABSOLUES:
// - Chaque script DOIT être détaillé (150+ mots)
// - Langage naturel et fluide
// - Contenu substantiel et informatif
// - Respect strict des durées
// - AUCUN placeholder ou contenu générique

// Génère UNIQUEMENT ce JSON avec des scripts COMPLETS et DÉTAILLÉS.`;

//     return prompt;
// }

// // 🔍 FONCTION DE VALIDATION QUALITÉ
// function validateScriptQuality(narrationScript) {
//     const scripts = Object.values(narrationScript);
//     const minWordCount = 50;

//     let totalWords = 0;
//     let shortScripts = 0;

//     scripts.forEach(script => {
//         const wordCount = script.script.split(' ').length;
//         totalWords += wordCount;
//         if (wordCount < minWordCount) {
//             shortScripts++;
//         }
//     });

//     const avgWordsPerScript = totalWords / scripts.length;
//     const isValid = shortScripts === 0 && avgWordsPerScript >= minWordCount;

//     console.log(`📊 Qualité scripts: ${avgWordsPerScript.toFixed(0)} mots/script, ${shortScripts} scripts courts`);

//     return {
//         isValid,
//         averageWords: avgWordsPerScript,
//         shortScripts,
//         totalWords
//     };
// }

// // 🎯 GÉNÉRATION D'EXEMPLES DE CODE SPÉCIFIQUES
// function getCodeExample(point, topic) {
//     const pointLower = point.toLowerCase();
//     const topicLower = topic.toLowerCase();

//     if (topicLower.includes('python')) {
//         if (pointLower.includes('variable')) {
//             return `nom = "Alice"
// age = 25
// prix = 19.99
// print(f"{nom} a {age} ans")`;
//         } else if (pointLower.includes('type')) {
//             return `# Types de données
// entier = 42
// flottant = 3.14
// texte = "Hello"
// liste = [1, 2, 3]
// print(type(entier))`;
//         } else if (pointLower.includes('condition')) {
//             return `age = 18
// if age >= 18:
//     print("Majeur")
// else:
//     print("Mineur")`;
//         } else if (pointLower.includes('boucle')) {
//             return `# Boucle for
// for i in range(5):
//     print(f"Itération {i}")`;
//         } else if (pointLower.includes('structure') || pointLower.includes('contrôle')) {
//             return `# Structures de contrôle
// for nombre in [1, 2, 3, 4, 5]:
//     if nombre % 2 == 0:
//         print(f"{nombre} est pair")
//     else:
//         print(f"{nombre} est impair")`;
//         }
//     }

//     return `# Code d'exemple pour ${point}
// # À compléter selon le contexte`;
// }

// // 🔍 FONCTION UTILITAIRE POUR EXPLICATIONS DÉTAILLÉES
// function getDetailedExplanation(point, topic) {
//     const pointLower = point.toLowerCase();
//     const topicLower = topic.toLowerCase();

//     if (topicLower.includes('python')) {
//         if (pointLower.includes('variable')) {
//             return 'Les variables en Python stockent des données et sont créées automatiquement lors de l\'affectation.';
//         } else if (pointLower.includes('type')) {
//             return 'Python gère automatiquement les types de données : entiers, flottants, chaînes et listes.';
//         } else if (pointLower.includes('condition')) {
//             return 'Les conditions permettent d\'exécuter du code selon des critères spécifiques.';
//         } else if (pointLower.includes('boucle')) {
//             return 'Les boucles répètent des actions, optimisant l\'efficacité du code.';
//         }
//     }

//     return `Concept fondamental pour maîtriser ${topic}.`;
// }

// // 🎯 SCRIPTS DÉTAILLÉS POUR INTRODUCTION (60 secondes)
// function generateDetailedIntroScript(section, topic, duration, resourcesAnalysis) {
//     let script = '';

//     script += `Bonjour et bienvenue dans cette formation sur ${topic}. `;

//     if (resourcesAnalysis.files_content_integrated) {
//         script += `Cette formation a été spécialement adaptée à vos documents et à votre contexte. `;
//     }

//     script += `Je suis ravi de vous accompagner dans cette découverte. `;

//     if (topic.toLowerCase().includes('python')) {
//         script += `Python est l'un des langages de programmation les plus populaires au monde. Il est apprécié pour sa simplicité, sa lisibilité et sa polyvalence. `;
//         script += `Que vous souhaitiez développer des applications web, analyser des données, créer de l'intelligence artificielle ou automatiser des tâches, Python est un excellent choix. `;
//     } else {
//         script += `${topic} est un sujet fascinant qui vous ouvrira de nouvelles perspectives. `;
//         script += `Au cours de cette formation, nous explorerons ensemble les concepts essentiels et les applications pratiques. `;
//     }

//     script += `Les objectifs de cette formation sont clairs : `;
//     if (section.what_to_cover && section.what_to_cover.length > 0) {
//         section.what_to_cover.forEach((objective, index) => {
//             if (index === section.what_to_cover.length - 1) {
//                 script += `et ${objective.toLowerCase()}. `;
//             } else {
//                 script += `${objective.toLowerCase()}, `;
//             }
//         });
//     } else {
//         script += `vous donner une compréhension solide des fondamentaux et vous préparer à aller plus loin. `;
//     }

//     script += `Cette formation est structurée de manière progressive pour optimiser votre apprentissage. `;
//     script += `Nous commencerons par les bases, puis nous approfondirons les concepts clés avant de conclure par une synthèse pratique. `;
//     script += `Alors, êtes-vous prêt ? Commençons sans plus attendre !`;

//     return script;
// }

// // 🎯 SCRIPTS DÉTAILLÉS POUR DÉVELOPPEMENT (100 secondes)
// function generateDetailedDevelopmentScript(section, topic, duration) {
//     let script = '';

//     script += `Nous entrons maintenant dans une section fondamentale : ${section.title}. `;
//     script += `Cette partie est essentielle pour bien maîtriser ${topic}. `;

//     if (topic.toLowerCase().includes('python')) {
//         if (section.title.toLowerCase().includes('variable')) {
//             script += generatePythonVariablesScript(section);
//         } else if (section.title.toLowerCase().includes('structure') || section.title.toLowerCase().includes('contrôle')) {
//             script += generatePythonControlScript(section);
//         } else {
//             script += generateGenericDevelopmentScript(section, topic);
//         }
//     } else {
//         script += generateGenericDevelopmentScript(section, topic);
//     }

//     script += `Les points clés à retenir de cette section sont importants pour la suite. `;
//     if (section.what_to_cover && section.what_to_cover.length > 0) {
//         script += `Premièrement, ${section.what_to_cover[0].toLowerCase()}. `;
//         if (section.what_to_cover.length > 1) {
//             script += `Deuxièmement, ${section.what_to_cover[1].toLowerCase()}. `;
//         }
//         if (section.what_to_cover.length > 2) {
//             script += `Et enfin, ${section.what_to_cover[2].toLowerCase()}. `;
//         }
//     }

//     script += `Ces concepts vous serviront de base solide pour aborder les aspects plus avancés. `;
//     script += `Prenez le temps de bien assimiler ces notions avant de passer à la suite. `;

//     return script;
// }

// // 🐍 SCRIPT SPÉCIALISÉ POUR VARIABLES PYTHON
// function generatePythonVariablesScript(section) {
//     let script = '';

//     script += `En Python, les variables sont la base de tout programme. Contrairement à d'autres langages, Python n'exige pas de déclarer le type d'une variable à l'avance. `;
//     script += `Vous pouvez simplement écrire "nom égale guillemets Alice guillemets" et Python comprend automatiquement qu'il s'agit d'une chaîne de caractères. `;
//     script += `Pour les nombres, c'est tout aussi simple : "age égale 25" crée une variable entière, tandis que "prix égale 19 virgule 99" crée un nombre décimal. `;
//     script += `Python gère automatiquement les types de données, ce qui rend la programmation plus intuitive. `;
//     script += `Les types de base incluent les entiers pour les nombres sans décimale, les flottants pour les nombres avec décimale, les chaînes pour le texte, et les booléens pour vrai ou faux. `;
//     script += `Une fonctionnalité très pratique est l'affichage formaté avec la fonction print et les f-strings. Par exemple, vous pouvez écrire "print f guillemets nom a age ans guillemets" pour afficher un message personnalisé. `;

//     return script;
// }

// // 🔄 SCRIPT SPÉCIALISÉ POUR STRUCTURES DE CONTRÔLE PYTHON
// function generatePythonControlScript(section) {
//     let script = '';

//     script += `Les structures de contrôle sont ce qui rend vos programmes intelligents et capables de prendre des décisions. `;
//     script += `La condition if-else est fondamentale : elle permet à votre programme de réagir différemment selon les circonstances. `;
//     script += `Par exemple, "if age supérieur ou égal à 18 deux points print Majeur else deux points print Mineur" teste l'âge et affiche le résultat approprié. `;
//     script += `L'indentation en Python n'est pas qu'une question de style : elle définit la structure du code. Chaque bloc indenté appartient à la condition ou à la boucle qui le précède. `;
//     script += `Les boucles for vous permettent de répéter des actions. "for i in range 5" exécute le code cinq fois, avec i qui prend les valeurs 0, 1, 2, 3, 4. `;
//     script += `La boucle while continue tant qu'une condition est vraie, mais attention aux boucles infinies ! `;
//     script += `Ces structures peuvent être combinées pour créer des programmes sophistiqués. Une boucle peut contenir des conditions, et une condition peut contenir d'autres boucles. `;

//     return script;
// }

// // 📚 SCRIPT GÉNÉRIQUE POUR DÉVELOPPEMENT
// function generateGenericDevelopmentScript(section, topic) {
//     let script = '';

//     script += `Ce que nous allons voir maintenant va enrichir considérablement votre compréhension de ${topic}. `;
//     script += `Les concepts que nous abordons sont utilisés quotidiennement par les professionnels du domaine. `;
//     script += `Il est important de comprendre non seulement le "comment" mais aussi le "pourquoi" de chaque notion. `;
//     script += `Chaque élément que nous étudions s'inscrit dans un écosystème plus large et trouve ses applications dans des contextes variés. `;
//     script += `N'hésitez pas à prendre des notes et à réfléchir aux applications pratiques de ce que vous apprenez. `;
//     script += `La théorie prend tout son sens quand elle est mise en perspective avec des exemples concrets. `;

//     return script;
// }

// // 🎯 SCRIPTS DÉTAILLÉS POUR CONCLUSION (40 secondes)
// function generateDetailedConclusionScript(section, topic, duration) {
//     let script = '';

//     script += `Nous arrivons au terme de cette formation sur ${topic}. `;
//     script += `Félicitations ! Vous avez parcouru un chemin important et acquis des compétences précieuses. `;

//     if (topic.toLowerCase().includes('python')) {
//         script += `Vous maîtrisez maintenant les fondamentaux de Python : les variables, les types de données, et les structures de contrôle. `;
//         script += `Ces bases solides vous permettront d'aborder des projets plus ambitieux avec confiance. `;
//     } else {
//         script += `Les concepts que nous avons explorés ensemble constituent un socle solide pour votre développement dans ce domaine. `;
//     }

//     script += `Rappelez-vous que l'apprentissage ne s'arrête pas ici. `;
//     script += `Pratiquez régulièrement, explorez, expérimentez, et n'ayez pas peur de faire des erreurs : elles font partie intégrante du processus d'apprentissage. `;
//     script += `Je vous encourage vivement à poursuivre votre formation et à mettre en pratique ce que vous avez appris. `;
//     script += `Merci de votre attention et de votre engagement. Bonne continuation dans votre parcours !`;

//     return script;
// }

// // 🎯 API PRINCIPALE - POST /ai/plan-to-markdown
// router.post('/plan-to-markdown', async (req, res) => {
//     const startTime = Date.now();

//     try {
//         // Validation de base
//         if (!req.body.plan_sections || !req.body.topic) {
//             return res.status(400).json({
//                 error: 'Format invalide',
//                 required: ['plan_sections', 'topic'],
//                 format: 'Utilisez TOUT le résultat de POST /ai/groq-plan'
//             });
//         }

//         const groqPlanData = req.body;
//         console.log(`📄 Génération Markdown OPTIMISÉ pour visuels: ${groqPlanData.topic}`);

//         // 🔍 ANALYSE DES RESSOURCES DISPONIBLES
//         const resourcesAnalysis = analyzeAvailableResources(groqPlanData);
//         console.log(`📚 Ressources: ${resourcesAnalysis.total_files} fichiers`);

//         // 🎨 GÉNÉRATION MARKDOWN OPTIMISÉ POUR PARSER DE VISUELS
//         console.log('🎨 Génération Markdown optimisé pour parser de visuels...');
//         const markdownPrompt = createOptimizedMarkdownPrompt(groqPlanData, resourcesAnalysis);

//         let slideMarkdown;
//         try {
//             const markdownResponse = await callGroq(markdownPrompt, {
//                 temperature: 0.6, // Moins de créativité pour plus de cohérence
//                 max_tokens: 8000,
//                 system_content: `Tu es un expert Slidev qui crée du Markdown PARFAITEMENT STRUCTURÉ pour génération de visuels.
//                 RÈGLES ABSOLUES:
//                 1. Chaque slide DOIT avoir un titre clair # Titre
//                 2. Chaque slide DOIT finir par ⏱️ XXs
//                 3. Séparateurs --- nets entre slides
//                 4. Contenu riche mais parsable
//                 5. AUCUN placeholder générique
//                 Réponds UNIQUEMENT avec le Markdown Slidev complet.`
//             });

//             slideMarkdown = cleanMarkdown(markdownResponse);

//             // Validation structure pour parser
//             if (!slideMarkdown.includes('⏱️') || !slideMarkdown.includes('---')) {
//                 console.log('🔄 Structure insuffisante, utilisation fallback optimisé...');
//                 throw new Error('Structure markdown invalide');
//             }

//         } catch (error) {
//             console.log('🔄 Erreur IA, génération fallback optimisé...');
//             slideMarkdown = createOptimizedFallbackMarkdown(groqPlanData, resourcesAnalysis);
//         }

//         // ✅ VALIDATION SPÉCIALE POUR PARSER DE VISUELS
//         const slidesValidation = validateMarkdownForVisuals(slideMarkdown, groqPlanData.plan_sections.length);
//         console.log(`📊 Validation visuels: ${slidesValidation.valid ? '✅' : '❌'} - ${slidesValidation.detected_slides} slides détectées`);

//         if (!slidesValidation.valid) {
//             console.log('🔧 Correction markdown pour compatibilité parser...');
//             slideMarkdown = fixMarkdownForVisuals(slideMarkdown, groqPlanData, resourcesAnalysis);
//         }

//         // GÉNÉRATION NARRATION (reste identique)
//         const actualSlideCount = groqPlanData.plan_sections.length;
//         console.log('🎬 Génération script narration détaillé...');

//         let narrationScript;
//         try {
//             const enhancedNarrationPrompt = createEnhancedNarrationPrompt(groqPlanData, resourcesAnalysis, actualSlideCount);
//             const narrationResponse = await callGroq(enhancedNarrationPrompt, {
//                 system_content: `Tu es un expert en formation professionnelle qui crée des scripts de narration détaillés et engageants. 
//                 Chaque script doit être substantiel (150+ mots) avec un contenu riche et pédagogique. 
//                 Réponds UNIQUEMENT avec du JSON valide contenant des scripts complets.`,
//                 max_tokens: 8000,
//                 temperature: 0.8
//             });

//             const cleanedNarration = cleanNarrationResponse(narrationResponse);
//             narrationScript = JSON.parse(cleanedNarration);

//             const scriptQuality = validateScriptQuality(narrationScript);
//             if (!scriptQuality.isValid) {
//                 console.warn('⚠️ Scripts trop courts, utilisation du fallback enrichi...');
//                 throw new Error('Scripts insuffisants');
//             }

//         } catch (parseError) {
//             console.warn('⚠️ Erreur parsing narration, utilisation du fallback ENRICHI...');
//             narrationScript = createSynchronizedFallbackNarration(groqPlanData, resourcesAnalysis, actualSlideCount);
//         }

//         // ASSEMBLAGE FINAL
//         const slidesId = uuidv4();
//         const totalTime = Date.now() - startTime;
//         const finalQuality = validateScriptQuality(narrationScript);

//         const result = {
//             slides_id: slidesId,

//             // ✅ RÉSULTATS OPTIMISÉS POUR PARSER DE VISUELS
//             markdown: slideMarkdown,
//             narration_script: narrationScript,

//             // ✅ VALIDATION SPÉCIALE VISUELS
//             visual_compatibility: {
//                 parser_ready: slidesValidation.valid,
//                 detected_slides: slidesValidation.detected_slides,
//                 expected_slides: actualSlideCount,
//                 title_extraction_ready: slidesValidation.titles_clear,
//                 duration_extraction_ready: slidesValidation.durations_present,
//                 content_structure_valid: slidesValidation.content_structured,
//                 emoji_detection_enabled: slidesValidation.emojis_present
//             },

//             synchronization_info: {
//                 markdown_slides_count: actualSlideCount,
//                 narration_scripts_count: Object.keys(narrationScript).length,
//                 synchronized: actualSlideCount === Object.keys(narrationScript).length,
//                 mapping_type: '1:1 FORCÉ'
//             },

//             content_quality: {
//                 total_words: finalQuality.totalWords,
//                 average_words_per_script: Math.round(finalQuality.averageWords),
//                 min_words_met: finalQuality.isValid,
//                 content_richness: finalQuality.averageWords >= 100 ? 'excellent' : 'good'
//             },

//             // COMPATIBILITÉ EXISTANTE
//             slides_count: actualSlideCount,
//             topic: groqPlanData.topic,

//             // ✅ PRÊT POUR GÉNÉRATION VISUELS
//             ready_for_visuals: {
//                 compatible: true,
//                 endpoint: 'POST /ai/generate-slides-visuals',
//                 expected_output: `${actualSlideCount} visuels SVG/PNG`,
//                 structure_validated: true,
//                 parser_optimized: true
//             },

//             generation_time_ms: totalTime,
//             generated_at: new Date().toISOString(),
//             version: '8.0 - Optimisé pour génération visuels'
//         };

//         console.log(`✅ Génération OPTIMISÉE pour visuels: ${actualSlideCount} slides, parser-ready: ${slidesValidation.valid}, ${totalTime}ms`);
//         res.json(result);

//     } catch (error) {
//         const totalTime = Date.now() - startTime;
//         console.error('❌ Erreur plan-to-markdown optimisé:', error);
//         res.status(500).json({
//             error: 'Erreur génération markdown optimisé',
//             generation_time_ms: totalTime,
//             details: error.message
//         });
//     }
// });

// // 🔧 ROUTE SAUVEGARDE
// router.post('/save-files', async (req, res) => {
//     try {
//         const { markdown, narration_script, slides_id } = req.body;

//         if (!markdown) {
//             return res.status(400).json({
//                 error: 'Le champ "markdown" est requis'
//             });
//         }

//         const slidesDir = path.join(__dirname, '..', '..', 'generated-slides');
//         await fs.mkdir(slidesDir, { recursive: true });

//         const baseFilename = slides_id || `resource_slides_${Date.now()}`;
//         const savedFiles = [];

//         // Sauvegarder markdown
//         const markdownFile = `${baseFilename}.md`;
//         const markdownPath = path.join(slidesDir, markdownFile);
//         await fs.writeFile(markdownPath, markdown, 'utf8');
//         savedFiles.push(markdownFile);

//         // Sauvegarder script narration
//         if (narration_script) {
//             const narrationFile = `narration_${baseFilename}.json`;
//             const narrationPath = path.join(slidesDir, narrationFile);
//             await fs.writeFile(narrationPath, JSON.stringify(narration_script, null, 2), 'utf8');
//             savedFiles.push(narrationFile);

//             // Script texte
//             const scriptText = Object.entries(narration_script)
//                 .map(([slide, data]) => `=== ${data.title} (${data.duration_seconds}s) ===\n${data.script}\n`)
//                 .join('\n');

//             const scriptFile = `script_${baseFilename}.txt`;
//             const scriptPath = path.join(slidesDir, scriptFile);
//             await fs.writeFile(scriptPath, scriptText, 'utf8');
//             savedFiles.push(scriptFile);
//         }

//         res.json({
//             message: 'Fichiers sauvés avec succès',
//             saved_files: savedFiles,
//             directory: slidesDir,
//             slidev_command: `cd generated-slides && slidev ${markdownFile}`
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: 'Erreur sauvegarde',
//             details: error.message
//         });
//     }
// });

// // 🔧 ROUTE INFO
// router.get('/plan-to-markdown/info', (req, res) => {
//     res.json({
//         endpoint: 'POST /ai/plan-to-markdown',
//         description: 'Convertit le plan en Markdown Slidev OPTIMISÉ pour génération de visuels avec narration détaillée',
//         version: '8.0 - OPTIMISÉ VISUELS + VALIDATION PARSER',
//         status: '✅ OPÉRATIONNEL',

//         corrections_v8: [
//             '🎨 Markdown optimisé pour parser de visuels',
//             '✅ Validation compatibilité parser automatique',
//             '🔧 Correction automatique si problèmes détectés',
//             '📊 Titres clairs et durées explicites garanties',
//             '🎯 Émojis et structure HTML optimisés',
//             '🔄 Fallback optimisé si IA échoue'
//         ],

//         visual_compatibility: [
//             '✅ Titres extractibles avec # TitreNet',
//             '⏱️ Durées extractibles avec ⏱️ XXs',
//             '🎨 Contenu structuré pour SVG génération',
//             '🎯 Émojis pour détection visuelle améliorée',
//             '📋 Validation automatique avant envoi',
//             '🔧 Correction automatique si nécessaire'
//         ],

//         workflow_optimized: [
//             '1. POST /ai/groq-plan (génère sections)',
//             '2. POST /ai/plan-to-markdown (markdown + scripts optimisés)',
//             '3. Validation automatique compatibilité parser',
//             '4. POST /ai/generate-slides-visuals (génération visuels)',
//             '5. Assemblage vidéo final'
//         ],

//         garanties: {
//             parser_compatibility: '100% - Validation automatique',
//             visual_generation: 'Compatible avec generate-slides-visuals',
//             title_extraction: 'Titres clairs garantis',
//             duration_extraction: 'Durées explicites sur chaque slide',
//             content_structure: 'HTML/CSS valide pour parsing',
//             emoji_detection: 'Émojis présents pour améliorer détection'
//         }
//     });
// });

// // 🧪 ROUTE DE TEST VALIDATION VISUELS
// router.post('/test-visual-validation', async (req, res) => {
//     try {
//         const { markdown, expected_slides } = req.body;

//         if (!markdown) {
//             return res.status(400).json({
//                 error: 'markdown requis pour test'
//             });
//         }

//         const validation = validateMarkdownForVisuals(markdown, expected_slides || 4);

//         res.json({
//             test_results: {
//                 valid: validation.valid,
//                 detected_slides: validation.detected_slides,
//                 expected_slides: expected_slides || 4,
//                 issues: validation.issues
//             },
//             validation_details: {
//                 titles_clear: validation.titles_clear,
//                 durations_present: validation.durations_present,
//                 content_structured: validation.content_structured,
//                 emojis_present: validation.emojis_present
//             },
//             parser_compatibility: validation.valid ? 'COMPATIBLE' : 'NÉCESSITE CORRECTION',
//             recommendations: validation.issues.length > 0 ?
//                 'Utilisez fixMarkdownForVisuals() pour corriger automatiquement' :
//                 'Markdown prêt pour génération de visuels',
//             version: '8.0 - Validation parser de visuels'
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: 'Erreur test validation visuels',
//             details: error.message
//         });
//     }
// });

// module.exports = router;

































// Scripts dispo en remote
// 🎯 API PRINCIPALE - POST /ai/plan-to-markdown (VERSION DÉTAILLÉE)


const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// 🤖 Fonction Groq pour génération intelligente
async function callGroq(prompt, options = {}) {
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: options.system_content || 'Tu es un expert Slidev qui crée du Markdown sophistiqué en utilisant intelligemment les ressources fournies. Réponds UNIQUEMENT avec du Markdown Slidev valide.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 5000
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('❌ Erreur Groq:', error.message);
        throw new Error('Erreur génération IA: ' + error.message);
    }
}

// 🎯 API PRINCIPALE - POST /ai/plan-to-markdown
router.post('/plan-to-markdown', async (req, res) => {
    const startTime = Date.now();

    try {
        // Validation de base
        if (!req.body.plan_sections || !req.body.topic) {
            return res.status(400).json({
                error: 'Format invalide',
                required: ['plan_sections', 'topic'],
                format: 'Utilisez TOUT le résultat de POST /ai/groq-plan'
            });
        }

        const groqPlanData = req.body;
        console.log(`📄 Génération Markdown enrichi: ${groqPlanData.topic}`);

        // 🔍 ANALYSE DES RESSOURCES DISPONIBLES
        const resourcesAnalysis = analyzeAvailableResources(groqPlanData);
        console.log(`📚 Ressources détectées: ${resourcesAnalysis.total_files} fichiers, vocabulaire: ${resourcesAnalysis.vocabulary_adapted}`);

        // 🎨 GÉNÉRATION MARKDOWN ENRICHI
        console.log('🎨 Génération Markdown Slidev enrichi...');
        const markdownPrompt = createEnhancedMarkdownPrompt(groqPlanData, resourcesAnalysis);
        const markdownResponse = await callGroq(markdownPrompt, {
            temperature: 0.7,
            max_tokens: 6000
        });

        let slideMarkdown = cleanMarkdown(markdownResponse);

        // Fallback si nécessaire
        if (!slideMarkdown.includes('---\ntheme:')) {
            console.log('🔄 Génération fallback...');
            slideMarkdown = createFallbackMarkdown(groqPlanData, resourcesAnalysis);
        }

        // 🆕 COMPTER LES SLIDES RÉELLES DANS LE MARKDOWN
        const actualSlideCount = countActualSlides(slideMarkdown);
        console.log(`📊 Slides détectées: ${actualSlideCount} (sections plan: ${groqPlanData.plan_sections.length})`);

        // 🔧 GÉNÉRATION SCRIPT NARRATION AVEC SYNCHRONISATION
        console.log('🎬 Génération script narration synchronisé...');
        const narrationPrompt = createNarrationPrompt(groqPlanData, resourcesAnalysis, actualSlideCount);
        const narrationResponse = await callGroq(narrationPrompt, {
            system_content: 'Tu es un expert en narration qui adapte le discours aux ressources. Réponds UNIQUEMENT avec du JSON valide avec le nombre exact de slides demandé.',
            max_tokens: 5000
        });

        let narrationScript;
        try {
            const cleanedNarration = cleanNarrationResponse(narrationResponse);
            narrationScript = JSON.parse(cleanedNarration);

            // 🆕 VALIDATION SYNCHRONISATION
            const scriptCount = Object.keys(narrationScript).length;
            if (scriptCount !== actualSlideCount) {
                console.warn(`⚠️ Désynchronisation détectée: ${actualSlideCount} slides vs ${scriptCount} scripts`);
                // Forcer la synchronisation
                narrationScript = forceSynchronization(narrationScript, actualSlideCount, groqPlanData, resourcesAnalysis);
            }

        } catch (parseError) {
            console.warn('⚠️ Erreur parsing narration, fallback synchronisé...');
            narrationScript = createSynchronizedFallbackNarration(groqPlanData, resourcesAnalysis, actualSlideCount);
        }

        // 🆕 VÉRIFICATION FINALE
        const finalSlideCount = actualSlideCount;
        const finalScriptCount = Object.keys(narrationScript).length;

        console.log(`✅ Synchronisation finale: ${finalSlideCount} slides = ${finalScriptCount} scripts`);

        // 🏗️ ASSEMBLAGE FINAL
        const slidesId = uuidv4();
        const totalTime = Date.now() - startTime;

        const result = {
            slides_id: slidesId,

            // RÉSULTATS PRINCIPAUX (Compatible format existant)
            markdown: slideMarkdown,
            narration_script: narrationScript,

            // 🆕 INFORMATIONS SYNCHRONISATION
            synchronization_info: {
                markdown_slides_count: finalSlideCount,
                narration_scripts_count: finalScriptCount,
                synchronized: finalSlideCount === finalScriptCount,
                plan_sections_count: groqPlanData.plan_sections.length,
                mapping_type: finalSlideCount === groqPlanData.plan_sections.length ? '1:1' :
                    finalSlideCount > groqPlanData.plan_sections.length ? 'expanded' : 'compressed'
            },

            // INFORMATIONS RESSOURCES
            resource_integration: {
                files_used_in_markdown: resourcesAnalysis.files_content_integrated,
                company_context_applied: resourcesAnalysis.company_context_integrated,
                vocabulary_adapted: resourcesAnalysis.vocabulary_adapted,
                examples_from_files: resourcesAnalysis.extracted_examples,
                procedures_integrated: resourcesAnalysis.procedures_integrated,
                terminology_used: resourcesAnalysis.key_terminology
            },

            // COMPATIBILITÉ AVEC FORMAT EXISTANT
            slides_count: finalSlideCount,
            topic: groqPlanData.topic,
            source_plan_id: groqPlanData.plan_id,

            files: {
                markdown: `resource_slides_${slidesId}.md`,
                narration: `narration_${slidesId}.json`,
                script_txt: `script_${slidesId}.txt`
            },

            file_sizes: {
                markdown_kb: Math.round(slideMarkdown.length / 1024),
                narration_kb: Math.round(JSON.stringify(narrationScript).length / 1024)
            },

            slidev_commands: {
                preview: `slidev resource_slides_${slidesId}.md`,
                export_pdf: `slidev export resource_slides_${slidesId}.md --format pdf`,
                export_html: `slidev export resource_slides_${slidesId}.md --format html`
            },

            video_production: {
                total_duration_seconds: Object.values(narrationScript).reduce((sum, script) => sum + script.duration_seconds, 0),
                slides_with_timing: Object.keys(narrationScript).length,
                ready_for_recording: true,
                uses_company_terminology: resourcesAnalysis.vocabulary_adapted,
                references_uploaded_files: resourcesAnalysis.files_content_integrated,
                perfectly_synchronized: true
            },

            generation_time_ms: totalTime,
            generated_at: new Date().toISOString(),
            status: 'completed',
            ready_for_production: true,

            next_steps: {
                audio_generation: 'POST /ai/generate-narration-bark avec script synchronisé',
                customization: resourcesAnalysis.company_context_integrated ?
                    'Contenu déjà adapté à votre contexte' :
                    'Personnaliser selon votre contexte'
            }
        };

        console.log(`✅ Génération complète: ${finalSlideCount} slides synchronisées, ${resourcesAnalysis.total_files} fichiers intégrés, ${totalTime}ms`);
        res.json(result);

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error('❌ Erreur plan-to-markdown:', error);
        res.status(500).json({
            error: 'Erreur génération markdown',
            generation_time_ms: totalTime,
            details: error.message
        });
    }
});

// 🆕 FONCTIONS DE SYNCHRONISATION

function countActualSlides(markdown) {
    // Compter le nombre de slides réelles dans le markdown
    const slidesSeparators = markdown.match(/^---$/gm) || [];

    // Le premier --- est pour les métadonnées, donc slides = separators - 1
    let slideCount = Math.max(1, slidesSeparators.length - 1);

    // Validation supplémentaire avec les layouts
    const layoutsFound = markdown.match(/layout:\s*(intro|default|two-cols|center|end)/g) || [];

    // Si on trouve des layouts, utiliser ce nombre
    if (layoutsFound.length > 0) {
        slideCount = Math.max(slideCount, layoutsFound.length);
    }

    // Compter aussi les titres de slides (# titre)
    const titleSlides = markdown.match(/^#\s+.+$/gm) || [];
    if (titleSlides.length > slideCount) {
        slideCount = titleSlides.length;
    }

    console.log(`📊 Détection slides: separators=${slidesSeparators.length - 1}, layouts=${layoutsFound.length}, titles=${titleSlides.length}, final=${slideCount}`);

    return Math.max(slideCount, 1);
}

function forceSynchronization(narrationScript, targetCount, planData, resourcesAnalysis) {
    const currentCount = Object.keys(narrationScript).length;

    if (currentCount === targetCount) {
        return narrationScript; // Déjà synchronisé
    }

    console.log(`🔧 Forçage synchronisation: ${currentCount} → ${targetCount} scripts`);

    // Créer nouveau script synchronisé
    return createSynchronizedFallbackNarration(planData, resourcesAnalysis, targetCount);
}

function createSynchronizedFallbackNarration(planData, resourcesAnalysis, slideCount) {
    const { plan_sections } = planData;
    const narration = {};

    console.log(`🔧 Création narration synchronisée: ${slideCount} scripts pour ${plan_sections.length} sections`);

    for (let i = 0; i < slideCount; i++) {
        const slideKey = `slide_${i + 1}`;

        // Mapping intelligent sections → slides
        let mappedSection;
        let sectionIndex;

        if (slideCount <= plan_sections.length) {
            // Moins ou égal de slides que de sections → mapping direct ou combinaison
            sectionIndex = Math.floor(i * plan_sections.length / slideCount);
        } else {
            // Plus de slides que de sections → subdivision
            sectionIndex = Math.floor(i * plan_sections.length / slideCount);
        }

        mappedSection = plan_sections[Math.min(sectionIndex, plan_sections.length - 1)];

        let tone = 'pédagogique';
        let title = mappedSection.title;
        let script = `Nous allons maintenant aborder ${mappedSection.title}.`;

        // Définir le ton selon la position
        if (i === 0) {
            tone = 'accueillant';
            title = mappedSection.title || 'Introduction';
            script = resourcesAnalysis.files_content_integrated ?
                `Bonjour et bienvenue dans cette formation sur ${title}, adaptée à vos documents.` :
                `Bonjour et bienvenue dans cette formation sur ${title}.`;
        } else if (i === slideCount - 1) {
            tone = 'motivant';
            title = 'Conclusion';
            script = 'Pour conclure, retenez bien les points essentiels que nous venons de voir.';
        } else {
            // Slide intermédiaire
            if (slideCount > plan_sections.length) {
                // Subdivision d'une section
                const partNumber = Math.floor(i / (slideCount / plan_sections.length)) + 1;
                title = `${mappedSection.title} - Partie ${partNumber}`;
                script = `Continuons avec ${mappedSection.title}. Nous allons maintenant voir les détails importants.`;
            }
        }

        // Calculer durée proportionnelle
        const baseDuration = mappedSection.duration_seconds || 60;
        const proportionalDuration = Math.floor(baseDuration * (plan_sections.length / slideCount));
        const adjustedDuration = Math.max(15, Math.min(120, proportionalDuration)); // Entre 15s et 2min

        narration[slideKey] = {
            title: title,
            duration_seconds: adjustedDuration,
            script: script,
            tone: tone,
            key_phrases: resourcesAnalysis.key_terminology.slice(0, 2) || ["Point important"],
            uses_resources: resourcesAnalysis.files_content_integrated,
            mapped_from_section: sectionIndex + 1,
            slide_position: i + 1,
            auto_generated: true // Flag pour indiquer génération automatique
        };
    }

    return narration;
}

// 🔍 ANALYSE DES RESSOURCES DISPONIBLES
function analyzeAvailableResources(groqPlanData) {
    const analysis = {
        total_files: 0,
        files_content_integrated: false,
        company_context_integrated: false,
        vocabulary_adapted: false,
        procedures_integrated: false,
        examples_extracted: false,
        key_terminology: [],
        extracted_examples: [],
        file_references: [],
        adaptation_quality: 'basic'
    };

    // Analyser les fichiers traités
    if (groqPlanData.files_processing) {
        analysis.total_files = groqPlanData.files_processing.processed_successfully || 0;
        analysis.files_content_integrated = analysis.total_files > 0;

        if (groqPlanData.files_processing.processed_files) {
            groqPlanData.files_processing.processed_files.forEach(file => {
                if (file.status === 'parsed') {
                    analysis.file_references.push({
                        name: file.name,
                        type: file.content_type,
                        topics: file.key_topics
                    });

                    if (file.has_procedures) analysis.procedures_integrated = true;
                    if (file.has_examples) analysis.examples_extracted = true;
                    if (file.key_topics) analysis.key_terminology.push(...file.key_topics);
                }
            });
        }
    }

    // Analyser l'enrichissement
    if (groqPlanData.resources_enrichment) {
        analysis.company_context_integrated = groqPlanData.resources_enrichment.has_company_context;
        analysis.vocabulary_adapted = groqPlanData.resources_enrichment.adaptation_applied?.vocabulary_adapted || false;
    }

    // Extraire des sections du plan
    if (groqPlanData.plan_sections) {
        groqPlanData.plan_sections.forEach(section => {
            if (section.enhanced_with_resources) {
                if (section.key_terminology) {
                    analysis.key_terminology.push(...section.key_terminology);
                }
                if (section.examples_from_resources) {
                    analysis.extracted_examples.push(...section.examples_from_resources);
                }
            }
        });
    }

    // Déduplication
    analysis.key_terminology = [...new Set(analysis.key_terminology.flat())].slice(0, 10);
    analysis.extracted_examples = [...new Set(analysis.extracted_examples.flat())].slice(0, 8);

    // Calcul qualité
    if (analysis.files_content_integrated && analysis.vocabulary_adapted && analysis.company_context_integrated) {
        analysis.adaptation_quality = 'excellent';
    } else if (analysis.files_content_integrated || analysis.vocabulary_adapted) {
        analysis.adaptation_quality = 'good';
    }

    return analysis;
}

// 🎨 CRÉATION PROMPT MARKDOWN ENRICHI - VERSION CORRIGÉE
// 🎨 CRÉATION PROMPT MARKDOWN ENRICHI - VERSION CORRIGÉE
function createEnhancedMarkdownPrompt(planData, resourcesAnalysis) {
    const { topic, plan_sections, settings } = planData;
    const { level = 'beginner', duration = 5, style = 'practical' } = settings || {};

    let prompt = `Crée un Markdown Slidev sophistiqué qui utilise les ressources fournies:

INFORMATIONS:
- Sujet: ${topic}
- Niveau: ${level}
- Durée: ${duration} minutes
- Style: ${style}

RESSOURCES DISPONIBLES:
- Fichiers traités: ${resourcesAnalysis.total_files}
- Contexte entreprise: ${resourcesAnalysis.company_context_integrated ? 'OUI' : 'NON'}
- Vocabulaire adapté: ${resourcesAnalysis.vocabulary_adapted ? 'OUI' : 'NON'}
- Procédures: ${resourcesAnalysis.procedures_integrated ? 'OUI' : 'NON'}
- Exemples: ${resourcesAnalysis.examples_extracted ? 'OUI' : 'NON'}`;

    if (resourcesAnalysis.key_terminology.length > 0) {
        prompt += `\n\nTERMINOLOGIE À UTILISER:\n${resourcesAnalysis.key_terminology.join(', ')}`;
    }

    if (resourcesAnalysis.extracted_examples.length > 0) {
        prompt += `\n\nEXEMPLES À INTÉGRER:\n${resourcesAnalysis.extracted_examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}`;
    }

    if (resourcesAnalysis.file_references.length > 0) {
        prompt += `\n\nFICHIERS À RÉFÉRENCER:\n${resourcesAnalysis.file_references.map(ref => `- ${ref.name}: ${ref.type}`).join('\n')}`;
    }

    prompt += `\n\nSECTIONS DU PLAN:\n${plan_sections.map((section, i) => {
        return `${i + 1}. ${section.title} (${section.duration_seconds}s)\n   Points: ${section.what_to_cover ? section.what_to_cover.join(', ') : 'À développer'}`;
    }).join('\n\n')}`;

    prompt += `\n\nGÉNÈRE un Markdown Slidev enrichi avec intégration des ressources:

---
theme: ${resourcesAnalysis.company_context_integrated ? 'corporate' : 'academic'}
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
class: text-center
highlighter: shiki
lineNumbers: true
title: ${topic}
---

# ${topic}
## Formation ${duration} minutes${resourcesAnalysis.company_context_integrated ? ' - Adaptée à votre contexte' : ''}

${resourcesAnalysis.files_content_integrated ? `
<div class="opacity-80 text-sm mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
  📚 Formation enrichie par ${resourcesAnalysis.total_files} document(s)
</div>
` : ''}

<div class="pt-8">
  <span @click="$slidev.nav.next" class="px-6 py-3 rounded-lg cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
    🚀 Commencer
  </span>
</div>

${plan_sections.map((section, index) => {
        if (section.type === 'introduction') {
            return `
---
layout: intro
---

# ${section.title}

${section.what_to_cover ? section.what_to_cover.map(point => `- **${point}**`).join('\n') : '- Introduction au sujet'}

${section.enhanced_with_resources && resourcesAnalysis.extracted_examples.length > 0 ? `
<div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
  <h3 class="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-300">
    💡 Basé sur vos ressources
  </h3>
  <div class="text-sm space-y-2">
${resourcesAnalysis.extracted_examples.slice(0, 2).map(example => `    <div>• ${example}</div>`).join('\n')}
  </div>
</div>
` : ''}

<div class="mt-6">
  <div class="px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm inline-block">
    ⏱️ ${section.duration_seconds}s
  </div>
</div>`;

        } else if (section.type === 'development') {
            // 🚀 CORRECTION PRINCIPALE - Layout default au lieu de two-cols problématique
            return `
---
layout: default
---

# ${section.title}

<div class="grid grid-cols-2 gap-8 mt-8">

<div class="space-y-4">

${section.what_to_cover ? section.what_to_cover.map((point, i) => `
## ${i + 1}. ${point}

${section.enhanced_with_resources ? `
<div class="text-sm text-blue-600 mb-4 bg-blue-50 p-2 rounded">
  💡 Point enrichi par vos documents
</div>
` : `
<div class="text-gray-600 text-sm mb-4">
  Point essentiel à retenir
</div>
`}
`).join('') : '## Contenu principal'}

</div>

<div class="h-full">

${section.enhanced_with_resources && resourcesAnalysis.extracted_examples.length > 0 ? `
<div class="bg-green-50 p-6 rounded-xl h-full">
  <h3 class="text-lg font-semibold mb-4 text-green-700">
    📋 Exemples de vos documents
  </h3>
  <div class="space-y-3">
${resourcesAnalysis.extracted_examples.slice(0, 3).map(example => `    <div class="bg-white p-3 rounded-lg">
      <div class="text-sm">${example}</div>
    </div>`).join('\n')}
  </div>
</div>
` : `
<div class="bg-orange-50 p-6 rounded-xl h-full">
  <h3 class="text-lg font-semibold mb-2">Points Clés</h3>
  <div class="text-sm">${section.content_summary || 'Contenu adapté'}</div>
</div>
`}

</div>

</div>

<div class="mt-8 p-4 bg-blue-50 rounded-lg">
  <div class="font-semibold">Résumé</div>
  <div class="text-sm mt-1">${section.content_summary || 'Points clés de cette section'}</div>
</div>`;

        } else if (section.type === 'conclusion') {
            return `
---
layout: center
class: text-center
---

# ${section.title}

<div class="max-w-4xl mx-auto">
  <div class="grid grid-cols-1 md:grid-cols-${section.what_to_cover ? Math.min(section.what_to_cover.length, 3) : 2} gap-6 mb-8">
${section.what_to_cover ? section.what_to_cover.map(point => `    <div class="bg-green-50 p-6 rounded-xl">
      <div class="text-3xl mb-3">✅</div>
      <div class="font-semibold text-green-700">${point}</div>
    </div>`).join('\n') : `    <div class="bg-green-50 p-6 rounded-xl">
      <div class="text-4xl mb-3">✅</div>
      <div class="font-semibold">Récapitulatif</div>
    </div>
    <div class="bg-blue-50 p-6 rounded-xl">
      <div class="text-4xl mb-3">🚀</div>
      <div class="font-semibold">Prochaines Étapes</div>
    </div>`}
  </div>

  ${section.enhanced_with_resources ? `
  <div class="bg-purple-100 p-6 rounded-xl mb-8">
    <h3 class="text-xl font-semibold mb-4 text-purple-700">
      🎯 Applications dans votre contexte
    </h3>
    <div class="text-sm text-purple-600">
      Cette formation a été adaptée à vos ressources.
    </div>
  </div>
  ` : ''}

  <div class="pt-8">
    <span class="px-8 py-4 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-xl">
      🎉 Formation Terminée !
    </span>
  </div>
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
  <div class="text-2xl">Formation ${topic} terminée</div>
  ${resourcesAnalysis.files_content_integrated ? `
  <div class="text-lg text-blue-600 mt-2">
    📚 Avec ${resourcesAnalysis.total_files} document(s) intégré(s)
  </div>
  ` : `
  <div class="text-lg text-gray-600 mt-2">Durée: ${duration} minutes</div>
  `}
</div>

Génère UNIQUEMENT ce Markdown, rien d'autre.`;

    return prompt;
}
// 🎬 CRÉATION PROMPT NARRATION SYNCHRONISÉ
function createNarrationPrompt(planData, resourcesAnalysis, actualSlideCount) {
    const { topic, plan_sections, settings } = planData;
    const { level = 'beginner', duration = 5 } = settings || {};

    let prompt = `Crée un script de narration adapté aux ressources et PARFAITEMENT synchronisé:

FORMATION:
- Sujet: ${topic}
- Niveau: ${level}
- Durée: ${duration} minutes
- NOMBRE DE SLIDES EXACT: ${actualSlideCount}

ADAPTATION RESSOURCES:
- Fichiers: ${resourcesAnalysis.total_files}
- Vocabulaire adapté: ${resourcesAnalysis.vocabulary_adapted ? 'OUI' : 'NON'}
- Exemples spécifiques: ${resourcesAnalysis.examples_extracted ? 'OUI' : 'NON'}`;

    if (resourcesAnalysis.key_terminology.length > 0) {
        prompt += `\n\nTERMINOLOGIE À UTILISER: ${resourcesAnalysis.key_terminology.join(', ')}`;
    }

    prompt += `\n\nSECTIONS DISPONIBLES:\n${plan_sections.map((section, i) =>
        `${i + 1}. ${section.title} (${section.duration_seconds}s) - ${section.type}`
    ).join('\n')}`;

    prompt += `\n\n⚠️ CRITICAL: Tu dois générer EXACTEMENT ${actualSlideCount} scripts de narration.

RÈGLES DE MAPPING:
- Si ${actualSlideCount} slides > ${plan_sections.length} sections : Diviser les sections longues
- Si ${actualSlideCount} slides < ${plan_sections.length} sections : Combiner certaines sections  
- Si ${actualSlideCount} slides = ${plan_sections.length} sections : Mapping 1:1 parfait

GÉNÈRE ce JSON avec EXACTEMENT ${actualSlideCount} entrées:

{
${Array.from({ length: actualSlideCount }, (_, index) => {
        const slideKey = `slide_${index + 1}`;
        let sectionIndex;

        if (actualSlideCount <= plan_sections.length) {
            sectionIndex = Math.floor(index * plan_sections.length / actualSlideCount);
        } else {
            sectionIndex = Math.floor(index * plan_sections.length / actualSlideCount);
        }

        const mappedSection = plan_sections[Math.min(sectionIndex, plan_sections.length - 1)];

        let tone = 'pédagogique';
        let title = mappedSection.title;

        if (index === 0) {
            tone = 'accueillant';
            title = mappedSection.title || 'Introduction';
        } else if (index === actualSlideCount - 1) {
            tone = 'motivant';
            title = 'Conclusion';
        } else if (actualSlideCount > plan_sections.length) {
            const partNumber = Math.floor((index - 1) / Math.ceil(actualSlideCount / plan_sections.length)) + 1;
            title = `${mappedSection.title} - Partie ${partNumber}`;
        }

        const baseDuration = mappedSection.duration_seconds || 60;
        const proportionalDuration = Math.floor(baseDuration * (plan_sections.length / actualSlideCount));
        const adjustedDuration = Math.max(15, Math.min(120, proportionalDuration));

        return `  "${slideKey}": {
    "title": "${title}",
    "duration_seconds": ${adjustedDuration},
    "script": "Script adapté pour ${title}. ${resourcesAnalysis.vocabulary_adapted ? 'Utiliser la terminologie spécialisée.' : ''} ${resourcesAnalysis.examples_extracted ? 'Mentionner les exemples des documents.' : ''}",
    "tone": "${tone}",
    "key_phrases": ${resourcesAnalysis.key_terminology.length > 0 ? JSON.stringify(resourcesAnalysis.key_terminology.slice(0, 2)) : '["point important"]'},
    "uses_resources": ${resourcesAnalysis.files_content_integrated}
  }`;
    }).join(',\n')}
}

RÈGLES:
- Ton naturel et ${resourcesAnalysis.company_context_integrated ? 'professionnel' : 'conversationnel'}
- ${resourcesAnalysis.vocabulary_adapted ? 'Utiliser OBLIGATOIREMENT la terminologie fournie' : 'Langage accessible'}
- ${resourcesAnalysis.examples_extracted ? 'Intégrer les exemples des documents' : 'Exemples génériques'}

Génère UNIQUEMENT ce JSON avec EXACTEMENT ${actualSlideCount} scripts, rien d'autre.`;

    return prompt;
}

// 🔧 FONCTIONS UTILITAIRES

function cleanMarkdown(markdown) {
    return markdown
        .replace(/```markdown\n/g, '')
        .replace(/\n```/g, '')
        .replace(/```/g, '')
        .trim();
}

function cleanNarrationResponse(response) {
    return response
        .replace(/```json\n/g, '')
        .replace(/\n```/g, '')
        .replace(/```/g, '')
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '')
        .trim();
}

// 🔧 CRÉATION FALLBACK MARKDOWN CORRIGÉ
// 🔧 CRÉATION FALLBACK MARKDOWN CORRIGÉ
function createFallbackMarkdown(planData, resourcesAnalysis) {
    const { topic, plan_sections, settings } = planData;
    const { duration = 5 } = settings || {};

    return `---
theme: academic
background: linear-gradient(45deg, #1e3c72, #2a5298)
class: text-center
title: ${topic}
---

# ${topic}
## Formation ${duration} minutes

${resourcesAnalysis.files_content_integrated ? `
<div class="text-sm mt-4 bg-blue-50 p-3 rounded">
  📚 Formation enrichie par ${resourcesAnalysis.total_files} document(s)
</div>
` : ''}

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-6 py-3 rounded-lg cursor-pointer bg-blue-600 text-white">
    🚀 Commencer
  </span>
</div>

${plan_sections.map(section => {
        // 🚀 CORRECTION - Utiliser layout default avec structure correcte
        return `
---
layout: default
---

# ${section.title}

<div class="max-w-4xl mx-auto mt-8">

<div class="space-y-6">
${section.what_to_cover ? section.what_to_cover.map(point => `
<div class="bg-white p-4 rounded-lg border-l-4 border-blue-500">
  <div class="font-semibold text-gray-800">• ${point}</div>
</div>`).join('') : `
<div class="bg-white p-4 rounded-lg border-l-4 border-blue-500">
  <div class="font-semibold text-gray-800">• Contenu à développer</div>
</div>`}
</div>

${section.enhanced_with_resources ? `
<div class="mt-8 p-6 bg-blue-50 rounded-xl">
  <h3 class="text-lg font-semibold mb-2 text-blue-700">💡 Adapté à vos ressources</h3>
  <div class="text-sm text-blue-600">${section.content_summary || 'Contenu personnalisé'}</div>
</div>
` : `
<div class="mt-8 p-4 bg-gray-50 rounded-lg">
  <div class="text-sm text-gray-600">
    ⏱️ ${section.duration_seconds}s • ${section.type}
  </div>
</div>
`}

</div>`;
    }).join('')}

---
layout: end
---

# Merci !

<div class="text-center">
  <div class="text-6xl mb-4">🎉</div>
  <div class="text-2xl">Formation ${topic} terminée</div>
  <div class="text-lg text-gray-600 mt-2">Durée: ${duration} minutes</div>
</div>`;
}

// 🔧 ROUTE SAUVEGARDE
router.post('/save-files', async (req, res) => {
    try {
        const { markdown, narration_script, slides_id } = req.body;

        if (!markdown) {
            return res.status(400).json({
                error: 'Le champ "markdown" est requis'
            });
        }

        const slidesDir = path.join(__dirname, '..', '..', 'generated-slides');
        await fs.mkdir(slidesDir, { recursive: true });

        const baseFilename = slides_id || `resource_slides_${Date.now()}`;
        const savedFiles = [];

        // Sauvegarder markdown
        const markdownFile = `${baseFilename}.md`;
        const markdownPath = path.join(slidesDir, markdownFile);
        await fs.writeFile(markdownPath, markdown, 'utf8');
        savedFiles.push(markdownFile);

        // Sauvegarder script narration
        if (narration_script) {
            const narrationFile = `narration_${baseFilename}.json`;
            const narrationPath = path.join(slidesDir, narrationFile);
            await fs.writeFile(narrationPath, JSON.stringify(narration_script, null, 2), 'utf8');
            savedFiles.push(narrationFile);

            // Script texte
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
            slidev_command: `cd generated-slides && slidev ${markdownFile}`
        });

    } catch (error) {
        res.status(500).json({
            error: 'Erreur sauvegarde',
            details: error.message
        });
    }
});

// 🔧 ROUTE INFO
router.get('/plan-to-markdown/info', (req, res) => {
    res.json({
        endpoint: 'POST /ai/plan-to-markdown',
        description: 'Convertit le plan en Markdown Slidev enrichi avec synchronisation parfaite slides/narration',
        version: '5.1 - Perfect Synchronization + Two-Cols Fix',
        status: '✅ OPÉRATIONNEL',

        fonctionnalités: [
            '🔄 Synchronisation automatique slides ↔ scripts narration',
            '📚 Utilisation intelligente des fichiers uploadés',
            '🎬 Scripts de narration adaptés au vocabulaire',
            '🏢 Adaptation automatique au contexte entreprise',
            '🔑 Intégration terminologie spécifique',
            '💡 Exemples personnalisés des documents',
            '📊 Validation et correction automatique des désynchronisations',
            '🔧 Correction structure two-cols Slidev'
        ],

        synchronization_features: [
            '✅ Détection automatique du nombre de slides markdown',
            '🔧 Ajustement forcé du nombre de scripts narration',
            '📈 Mapping intelligent sections → slides',
            '⚖️ Répartition proportionnelle des durées',
            '🔍 Validation finale de synchronisation'
        ],

        slidev_fixes: [
            '🔧 Correction structure two-cols: titres dans les slots',
            '✅ Respect des templates v-slot:default et v-slot:right',
            '🛡️ Prévention erreurs Vue.js Slidev',
            '📏 Génération correcte du nombre de slides'
        ],

        workflow: [
            '1. POST /ai/groq-plan (avec ressources/fichiers)',
            '2. POST /ai/plan-to-markdown (génère markdown + compte slides)',
            '3. Génération narration avec nombre exact de scripts',
            '4. Validation synchronisation finale',
            '5. POST /ai/generate-narration-bark (audio parfaitement aligné)'
        ],

        mapping_strategies: {
            one_to_one: 'Slides = Sections → Mapping direct 1:1',
            expansion: 'Slides > Sections → Subdivision intelligente',
            compression: 'Slides < Sections → Combinaison logique'
        },

        compatibilité: {
            format_entrée: 'Compatible avec tous les plans de groq-plan',
            format_sortie: 'Compatible avec ancien format + enrichissements + sync info',
            rétrocompatible: 'Fonctionne avec plans sans ressources',
            guaranteed_sync: 'Synchronisation garantie à 100%',
            slidev_compliant: 'Markdown Slidev valide sans erreurs Vue.js'
        },

        response_additions: {
            synchronization_info: 'Détails de synchronisation et mapping',
            perfectly_synchronized: 'Flag confirmant la synchronisation',
            mapping_type: 'Type de mapping appliqué (1:1, expanded, compressed)'
        },

        exemples_intégration: {
            fichier_excel: 'Guide Excel → terminologie VLOOKUP, TCD dans slides + scripts',
            procédures: 'Procédures détectées → références dans markdown + narration',
            contexte_entreprise: 'Contexte fourni → adaptation ton professionnel',
            exemples_spécifiques: 'Exemples extraits → intégration dans slides + scripts'
        }
    });
});

// 🧪 ROUTE DE TEST SYNCHRONISATION
router.post('/test-synchronization', async (req, res) => {
    try {
        const { markdown, plan_sections } = req.body;

        if (!markdown || !plan_sections) {
            return res.status(400).json({
                error: 'markdown et plan_sections requis'
            });
        }

        const slideCount = countActualSlides(markdown);
        const sectionCount = plan_sections.length;

        // Test de synchronisation
        const mockResourcesAnalysis = {
            total_files: 0,
            vocabulary_adapted: false,
            files_content_integrated: false,
            key_terminology: [],
            extracted_examples: []
        };

        const syncedNarration = createSynchronizedFallbackNarration(
            { plan_sections },
            mockResourcesAnalysis,
            slideCount
        );

        res.json({
            test_results: {
                detected_slides: slideCount,
                plan_sections: sectionCount,
                generated_scripts: Object.keys(syncedNarration).length,
                synchronized: Object.keys(syncedNarration).length === slideCount
            },
            mapping_analysis: {
                type: slideCount === sectionCount ? '1:1' :
                    slideCount > sectionCount ? 'expansion' : 'compression',
                ratio: Math.round((slideCount / sectionCount) * 100) / 100
            },
            generated_narration: syncedNarration,
            success: true
        });

    } catch (error) {
        res.status(500).json({
            error: 'Erreur test synchronisation',
            details: error.message
        });
    }
});

module.exports = router;