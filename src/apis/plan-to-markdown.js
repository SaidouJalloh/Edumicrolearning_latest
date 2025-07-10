// code qui marche super bien
// Scripts dispo en remote
// 🎯 API PRINCIPALE - POST /ai/plan-to-markdown (VERSION DÉTAILLÉE)


// const express = require('express');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
// const fs = require('fs').promises;
// const path = require('path');

// const router = express.Router();

// // 🤖 Fonction Groq pour génération intelligente
// async function callGroq(prompt, options = {}) {
//     try {
//         // const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
//         //     model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
//         const response = await axios.post('https://api.anthropic.com/v1/messages', {
//             model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
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
//                 'Authorization': `Bearer ${process.env.CLAUDE_MODEL}`,
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
//             auto_generated: true // Flag pour indiquer génération automatique
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

// // 🎨 CRÉATION PROMPT MARKDOWN ENRICHI - VERSION CORRIGÉE
// // 🎨 CRÉATION PROMPT MARKDOWN ENRICHI - VERSION CORRIGÉE
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
//             // 🚀 CORRECTION PRINCIPALE - Layout default au lieu de two-cols problématique
//             return `
// ---
// layout: default
// ---

// # ${section.title}

// <div class="grid grid-cols-2 gap-8 mt-8">

// <div class="space-y-4">

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

// </div>

// <div class="h-full">

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

// </div>

// </div>

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
//         let sectionIndex;

//         if (actualSlideCount <= plan_sections.length) {
//             sectionIndex = Math.floor(index * plan_sections.length / actualSlideCount);
//         } else {
//             sectionIndex = Math.floor(index * plan_sections.length / actualSlideCount);
//         }

//         const mappedSection = plan_sections[Math.min(sectionIndex, plan_sections.length - 1)];

//         let tone = 'pédagogique';
//         let title = mappedSection.title;

//         if (index === 0) {
//             tone = 'accueillant';
//             title = mappedSection.title || 'Introduction';
//         } else if (index === actualSlideCount - 1) {
//             tone = 'motivant';
//             title = 'Conclusion';
//         } else if (actualSlideCount > plan_sections.length) {
//             const partNumber = Math.floor((index - 1) / Math.ceil(actualSlideCount / plan_sections.length)) + 1;
//             title = `${mappedSection.title} - Partie ${partNumber}`;
//         }

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

// // 🔧 CRÉATION FALLBACK MARKDOWN CORRIGÉ
// // 🔧 CRÉATION FALLBACK MARKDOWN CORRIGÉ
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

// ${plan_sections.map(section => {
//         // 🚀 CORRECTION - Utiliser layout default avec structure correcte
//         return `
// ---
// layout: default
// ---

// # ${section.title}

// <div class="max-w-4xl mx-auto mt-8">

// <div class="space-y-6">
// ${section.what_to_cover ? section.what_to_cover.map(point => `
// <div class="bg-white p-4 rounded-lg border-l-4 border-blue-500">
//   <div class="font-semibold text-gray-800">• ${point}</div>
// </div>`).join('') : `
// <div class="bg-white p-4 rounded-lg border-l-4 border-blue-500">
//   <div class="font-semibold text-gray-800">• Contenu à développer</div>
// </div>`}
// </div>

// ${section.enhanced_with_resources ? `
// <div class="mt-8 p-6 bg-blue-50 rounded-xl">
//   <h3 class="text-lg font-semibold mb-2 text-blue-700">💡 Adapté à vos ressources</h3>
//   <div class="text-sm text-blue-600">${section.content_summary || 'Contenu personnalisé'}</div>
// </div>
// ` : `
// <div class="mt-8 p-4 bg-gray-50 rounded-lg">
//   <div class="text-sm text-gray-600">
//     ⏱️ ${section.duration_seconds}s • ${section.type}
//   </div>
// </div>
// `}

// </div>`;
//     }).join('')}

// ---
// layout: end
// ---

// # Merci !

// <div class="text-center">
//   <div class="text-6xl mb-4">🎉</div>
//   <div class="text-2xl">Formation ${topic} terminée</div>
//   <div class="text-lg text-gray-600 mt-2">Durée: ${duration} minutes</div>
// </div>`;
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
//         version: '5.1 - Perfect Synchronization + Two-Cols Fix',
//         status: '✅ OPÉRATIONNEL',

//         fonctionnalités: [
//             '🔄 Synchronisation automatique slides ↔ scripts narration',
//             '📚 Utilisation intelligente des fichiers uploadés',
//             '🎬 Scripts de narration adaptés au vocabulaire',
//             '🏢 Adaptation automatique au contexte entreprise',
//             '🔑 Intégration terminologie spécifique',
//             '💡 Exemples personnalisés des documents',
//             '📊 Validation et correction automatique des désynchronisations',
//             '🔧 Correction structure two-cols Slidev'
//         ],

//         synchronization_features: [
//             '✅ Détection automatique du nombre de slides markdown',
//             '🔧 Ajustement forcé du nombre de scripts narration',
//             '📈 Mapping intelligent sections → slides',
//             '⚖️ Répartition proportionnelle des durées',
//             '🔍 Validation finale de synchronisation'
//         ],

//         slidev_fixes: [
//             '🔧 Correction structure two-cols: titres dans les slots',
//             '✅ Respect des templates v-slot:default et v-slot:right',
//             '🛡️ Prévention erreurs Vue.js Slidev',
//             '📏 Génération correcte du nombre de slides'
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
//             guaranteed_sync: 'Synchronisation garantie à 100%',
//             slidev_compliant: 'Markdown Slidev valide sans erreurs Vue.js'
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


















// new code avec claude
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// 🤖 Fonction Claude pour génération intelligente
async function callClaude(prompt, options = {}) {
    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
            max_tokens: options.max_tokens || 5000,
            temperature: options.temperature || 0.7,
            messages: [
                {
                    role: 'user',
                    content: options.system_content ?
                        `${options.system_content}\n\n${prompt}` :
                        prompt
                }
            ]
        }, {
            headers: {
                'x-api-key': process.env.CLAUDE_API_KEY,
                'content-type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
        });

        return response.data.content[0].text;
    } catch (error) {
        console.error('❌ Erreur Claude:', error.response?.data || error.message);
        throw new Error('Erreur génération IA: ' + (error.response?.data?.error?.message || error.message));
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

        const planData = req.body;
        console.log(`📄 Génération Markdown enrichi: ${planData.topic}`);

        // 🔍 ANALYSE DES RESSOURCES DISPONIBLES
        const resourcesAnalysis = analyzeAvailableResources(planData);
        console.log(`📚 Ressources détectées: ${resourcesAnalysis.total_files} fichiers, vocabulaire: ${resourcesAnalysis.vocabulary_adapted}`);

        // 🎨 GÉNÉRATION MARKDOWN ENRICHI
        console.log('🎨 Génération Markdown Slidev enrichi...');
        const markdownPrompt = createEnhancedMarkdownPrompt(planData, resourcesAnalysis);
        const systemContent = 'Tu es un expert Slidev qui crée du Markdown sophistiqué en utilisant intelligemment les ressources fournies. Réponds UNIQUEMENT avec du Markdown Slidev valide.';

        const markdownResponse = await callClaude(markdownPrompt, {
            system_content: systemContent,
            temperature: 0.7,
            max_tokens: 6000
        });

        let slideMarkdown = cleanMarkdown(markdownResponse);

        // Fallback si nécessaire
        if (!slideMarkdown.includes('---\ntheme:')) {
            console.log('🔄 Génération fallback...');
            slideMarkdown = createFallbackMarkdown(planData, resourcesAnalysis);
        }

        // 🆕 COMPTER LES SLIDES RÉELLES DANS LE MARKDOWN
        const actualSlideCount = countActualSlides(slideMarkdown);
        console.log(`📊 Slides détectées: ${actualSlideCount} (sections plan: ${planData.plan_sections.length})`);

        // 🔧 GÉNÉRATION SCRIPT NARRATION AVEC SYNCHRONISATION
        console.log('🎬 Génération script narration synchronisé...');
        const narrationPrompt = createNarrationPrompt(planData, resourcesAnalysis, actualSlideCount);
        const narrationSystemContent = 'Tu es un expert en narration qui adapte le discours aux ressources. Réponds UNIQUEMENT avec du JSON valide avec le nombre exact de slides demandé.';

        const narrationResponse = await callClaude(narrationPrompt, {
            system_content: narrationSystemContent,
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
                narrationScript = forceSynchronization(narrationScript, actualSlideCount, planData, resourcesAnalysis);
            }

        } catch (parseError) {
            console.warn('⚠️ Erreur parsing narration, fallback synchronisé...');
            narrationScript = createSynchronizedFallbackNarration(planData, resourcesAnalysis, actualSlideCount);
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
                plan_sections_count: planData.plan_sections.length,
                mapping_type: finalSlideCount === planData.plan_sections.length ? '1:1' :
                    finalSlideCount > planData.plan_sections.length ? 'expanded' : 'compressed'
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
            topic: planData.topic,
            source_plan_id: planData.plan_id,

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

            // Informations sur le provider utilisé
            ai_provider: 'claude',
            model_used: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',

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
            details: error.message,
            ai_provider: 'claude'
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
function analyzeAvailableResources(planData) {
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
    if (planData.files_processing) {
        analysis.total_files = planData.files_processing.processed_successfully || 0;
        analysis.files_content_integrated = analysis.total_files > 0;

        if (planData.files_processing.processed_files) {
            planData.files_processing.processed_files.forEach(file => {
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
    if (planData.resources_enrichment) {
        analysis.company_context_integrated = planData.resources_enrichment.has_company_context;
        analysis.vocabulary_adapted = planData.resources_enrichment.adaptation_applied?.vocabulary_adapted || false;
    }

    // Extraire des sections du plan
    if (planData.plan_sections) {
        planData.plan_sections.forEach(section => {
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

// 🎨 CRÉATION PROMPT MARKDOWN ENRICHI
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
            slidev_command: `cd generated-slides && slidev ${markdownFile}`,
            ai_provider: 'claude'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Erreur sauvegarde',
            details: error.message,
            ai_provider: 'claude'
        });
    }
});

// 🔧 ROUTE INFO
router.get('/plan-to-markdown/info', (req, res) => {
    res.json({
        endpoint: 'POST /ai/plan-to-markdown',
        description: 'Convertit le plan en Markdown Slidev enrichi avec synchronisation parfaite slides/narration',
        version: '5.1 - Perfect Synchronization + Claude API',
        status: '✅ OPÉRATIONNEL',
        ai_provider: 'claude',
        model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',

        fonctionnalités: [
            '🔄 Synchronisation automatique slides ↔ scripts narration',
            '📚 Utilisation intelligente des fichiers uploadés',
            '🎬 Scripts de narration adaptés au vocabulaire',
            '🏢 Adaptation automatique au contexte entreprise',
            '🔑 Intégration terminologie spécifique',
            '💡 Exemples personnalisés des documents',
            '📊 Validation et correction automatique des désynchronisations',
            '🔧 Correction structure two-cols Slidev',
            '🤖 Migration vers Claude API pour meilleure qualité'
        ],

        synchronization_features: [
            '✅ Détection automatique du nombre de slides markdown',
            '🔧 Ajustement forcé du nombre de scripts narration',
            '📈 Mapping intelligent sections → slides',
            '⚖️ Répartition proportionnelle des durées',
            '🔍 Validation finale de synchronisation'
        ],

        claude_integration: [
            '🚀 API Claude Anthropic pour génération de haute qualité',
            '⚡ Configuration via variables d\'environnement',
            '🔧 Headers API corrects (x-api-key, anthropic-version)',
            '📝 Format de message adapté à Claude',
            '🛡️ Gestion d\'erreurs robuste',
            '📊 Tracking du provider utilisé dans les réponses'
        ],

        workflow: [
            '1. POST /ai/groq-plan (avec ressources/fichiers)',
            '2. POST /ai/plan-to-markdown (génère markdown + compte slides)',
            '3. Génération narration avec nombre exact de scripts',
            '4. Validation synchronisation finale',
            '5. POST /ai/generate-narration-bark (audio parfaitement aligné)'
        ],

        environment_variables: [
            'USE_CLAUDE=true',
            'CLAUDE_API_KEY=sk-ant-api03-...',
            'CLAUDE_MODEL=claude-3-haiku-20240307'
        ],

        api_changes: {
            from_groq: {
                url: 'https://api.groq.com/openai/v1/chat/completions',
                headers: ['Authorization: Bearer', 'Content-Type'],
                format: 'OpenAI compatible'
            },
            to_claude: {
                url: 'https://api.anthropic.com/v1/messages',
                headers: ['x-api-key', 'anthropic-version', 'content-type'],
                format: 'Claude native format'
            }
        },

        compatibilité: {
            format_entrée: 'Compatible avec tous les plans existants',
            format_sortie: 'Format enrichi + info provider Claude',
            rétrocompatible: 'Fonctionne avec plans sans ressources',
            guaranteed_sync: 'Synchronisation garantie à 100%',
            slidev_compliant: 'Markdown Slidev valide sans erreurs Vue.js'
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
            ai_provider: 'claude',
            success: true
        });

    } catch (error) {
        res.status(500).json({
            error: 'Erreur test synchronisation',
            details: error.message,
            ai_provider: 'claude'
        });
    }
});

// 🔧 ROUTE DE SANTÉ POUR CLAUDE
router.get('/health/claude', async (req, res) => {
    try {
        // Test simple de connectivité Claude
        const testResponse = await callClaude('Réponds simplement "OK"', {
            max_tokens: 10
        });

        res.json({
            status: 'healthy',
            ai_provider: 'claude',
            model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
            api_reachable: true,
            test_response: testResponse.trim(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            ai_provider: 'claude',
            api_reachable: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;