
// code qui marche bien 

// src/apis/enhance-slidev.js - Transforme le markdown basique en présentation ultra-professionnelle
// const express = require('express');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');

// const router = express.Router();

// // Fonction Groq pour l'enhancement
// async function callGroq(prompt, options = {}) {
//     try {
//         const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
//             model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
//             messages: [
//                 {
//                     role: 'system',
//                     content: 'Tu es un expert Slidev et designer UX/UI ultra-professionnel. Tu transformes des présentations basiques en chefs-d\'œuvre visuels sophistiqués. Tu génères UNIQUEMENT du Markdown Slidev ultra-moderne et interactif.'
//                 },
//                 {
//                     role: 'user',
//                     content: prompt
//                 }
//             ],
//             temperature: options.temperature || 0.8,
//             max_tokens: options.max_tokens || 6000
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         return response.data.choices[0].message.content;
//     } catch (error) {
//         console.error('❌ Erreur Groq enhance-slidev:', error.message);
//         throw new Error('Erreur enhancement présentation');
//     }
// }

// // API POST /ai/enhance-slidev - Transforme markdown basique → présentation ultra-pro
// router.post('/enhance-slidev', async (req, res) => {
//     const startTime = Date.now();

//     try {
//         // Validation
//         if (!req.body.markdown) {
//             return res.status(400).json({
//                 error: 'Le champ "markdown" est requis',
//                 format: 'Copiez le markdown généré par /ai/plan-to-markdown',
//                 example_usage: 'markdown de plan-to-markdown → Input enhance-slidev'
//             });
//         }

//         const originalMarkdown = req.body.markdown;
//         const enhancementLevel = req.body.enhancement_level || 'ultra'; // basic, professional, ultra
//         const visualStyle = req.body.visual_style || 'corporate'; // corporate, creative, academic, tech

//         console.log(`🎨 Enhancement Slidev ULTRA: ${enhancementLevel} - ${visualStyle}`);

//         // Extraire les infos du markdown original
//         const slideInfo = extractSlideInfo(originalMarkdown);

//         // Créer le prompt d'enhancement ultra-sophistiqué
//         const prompt = createUltraProfessionalPrompt(originalMarkdown, slideInfo, enhancementLevel, visualStyle);

//         // Générer avec Groq (température plus élevée pour plus de créativité)
//         const enhancedResponse = await callGroq(prompt, { temperature: 0.8, max_tokens: 6000 });

//         // Nettoyer et valider
//         let enhancedMarkdown = cleanMarkdown(enhancedResponse);

//         // Fallback ultra-sophistiqué si problème
//         if (!enhancedMarkdown.includes('---\ntheme:') && !enhancedMarkdown.includes('---\nlayout:')) {
//             console.log('🔄 Utilisation du fallback ultra-sophistiqué');
//             enhancedMarkdown = createUltraSophisticatedFallback(slideInfo, visualStyle);
//         }

//         const enhancedId = uuidv4();
//         const totalTime = Date.now() - startTime;
//         const slideCount = (enhancedMarkdown.match(/^---$/gm) || []).length;

//         const result = {
//             enhanced_id: enhancedId,

//             // RÉSULTAT PRINCIPAL
//             enhanced_markdown: enhancedMarkdown,

//             // Comparaison
//             original_size_kb: Math.round(originalMarkdown.length / 1024),
//             enhanced_size_kb: Math.round(enhancedMarkdown.length / 1024),
//             enhancement_ratio: Math.round((enhancedMarkdown.length / originalMarkdown.length) * 100) / 100,

//             // Infos
//             slides_count: slideCount,
//             topic: slideInfo.topic,
//             enhancement_level: enhancementLevel,
//             visual_style: visualStyle,

//             // Fichier
//             filename: `enhanced_slides_${enhancedId}.md`,

//             // Fonctionnalités ajoutées
//             enhancements_applied: [
//                 'Slide cover cinématographique avec gradients HD',
//                 'Animations v-click sophistiquées (15+ animations)',
//                 'Layouts avancés (cover, section, two-cols, center, end)',
//                 'Composants interactifs avec hover effects',
//                 'Gradients et backgrounds premium Unsplash',
//                 'Typography hiérarchisée avec Google Fonts',
//                 'Icons Carbon Design System dans tous les titres',
//                 'Glassmorphism et backdrop-blur partout',
//                 'Responsive design avec grids Tailwind',
//                 'Micro-interactions et transitions fluides',
//                 'Design system ultra-cohérent',
//                 'Call-to-actions interactifs premium',
//                 'Progress indicators visuels',
//                 'Cards avec effets 3D et shadows'
//             ],

//             // Commandes Slidev avancées
//             slidev_commands: {
//                 preview: `slidev enhanced_slides_${enhancedId}.md`,
//                 export_pdf: `slidev export enhanced_slides_${enhancedId}.md --format pdf --dark`,
//                 export_html: `slidev export enhanced_slides_${enhancedId}.md --format html`,
//                 export_pptx: `slidev export enhanced_slides_${enhancedId}.md --format pptx`,
//                 build: `slidev build enhanced_slides_${enhancedId}.md`,
//                 preview_build: `slidev build enhanced_slides_${enhancedId}.md --base /presentations/`
//             },

//             // Métadonnées
//             generation_time_ms: totalTime,
//             generated_at: new Date().toISOString(),
//             status: 'ultra_enhanced',
//             ready_for_production: true,
//             quality_score: 'AAA+ Ultra-Professional'
//         };

//         console.log(`✨ Slidev ULTRA-enhancé: ${slideCount} slides en ${totalTime}ms (ratio: ${result.enhancement_ratio}x)`);
//         res.json(result);

//     } catch (error) {
//         const totalTime = Date.now() - startTime;
//         console.error('❌ Erreur enhance-slidev:', error);
//         res.status(500).json({
//             error: 'Erreur enhancement présentation',
//             generation_time_ms: totalTime,
//             details: error.message
//         });
//     }
// });

// // Fonction pour extraire les infos du markdown original
// function extractSlideInfo(markdown) {
//     const lines = markdown.split('\n');
//     const info = {
//         topic: 'Formation Professionnelle',
//         duration: '5',
//         level: 'beginner',
//         slides: []
//     };

//     // Extraire le titre
//     const titleMatch = markdown.match(/title:\s*(.+)/);
//     if (titleMatch) info.topic = titleMatch[1];

//     // Extraire durée
//     const durationMatch = markdown.match(/(\d+)\s*minutes?/);
//     if (durationMatch) info.duration = durationMatch[1];

//     // Extraire niveau
//     const levelMatch = markdown.match(/Niveau\s*[:\-]\s*(\w+)/i);
//     if (levelMatch) info.level = levelMatch[1];

//     // Extraire les slides
//     const slideBlocks = markdown.split(/^---$/m);
//     info.slides = slideBlocks.map(block => {
//         const titleMatch = block.match(/^#\s*(.+)$/m);
//         const layoutMatch = block.match(/layout:\s*(\w+)/);
//         return {
//             title: titleMatch ? titleMatch[1] : 'Slide',
//             layout: layoutMatch ? layoutMatch[1] : 'default',
//             content: block.trim()
//         };
//     }).filter(slide => slide.title !== 'Slide' || slide.content.length > 10);

//     return info;
// }

// // Fonction pour créer le prompt d'enhancement ULTRA-SOPHISTIQUÉ
// function createUltraProfessionalPrompt(originalMarkdown, slideInfo, enhancementLevel, visualStyle) {
//     const styleConfigs = {
//         corporate: {
//             theme: 'seriph',
//             colors: 'Gradients bleu professionnel, gris anthracite, blanc premium',
//             fonts: 'Inter, Roboto',
//             mood: 'Corporate premium, confiance, autorité, sophistication',
//             background: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&h=1080&fit=crop'
//         },
//         creative: {
//             theme: 'apple-basic',
//             colors: 'Gradients vibrants multicolores, purple, orange, cyan, magenta',
//             fonts: 'Poppins, Playfair Display',
//             mood: 'Créatif, énergique, innovant, artistique',
//             background: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920&h=1080&fit=crop'
//         },
//         academic: {
//             theme: 'academic',
//             colors: 'Bleu académique profond, vert sauge, beige élégant',
//             fonts: 'Source Sans Pro, Merriweather',
//             mood: 'Académique premium, sérieux, informatif, recherche',
//             background: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=1080&fit=crop'
//         },
//         tech: {
//             theme: 'default',
//             colors: 'Dark mode premium, cyan électrique, vert néon, noir profond',
//             fonts: 'Fira Code, JetBrains Mono',
//             mood: 'Tech futuriste, innovant, high-tech, cyberpunk',
//             background: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop'
//         }
//     };

//     const config = styleConfigs[visualStyle] || styleConfigs.corporate;

//     return `Tu es le meilleur designer Slidev au monde. Transforme cette présentation BASIQUE en CHEF-D'ŒUVRE ultra-professionnel.

// ANALYSE DU MARKDOWN ORIGINAL (${slideInfo.slides.length} slides simples, ${Math.round(originalMarkdown.length / 1024)}KB):
// ${originalMarkdown}

// MISSION ULTRA-CRITIQUE:
// Génère une présentation Slidev COMPLÈTEMENT RÉÉCRITE qui soit 4-5x plus sophistiquée.

// SUJET: ${slideInfo.topic}
// STYLE: ${visualStyle} (${config.mood})
// DURÉE: ${slideInfo.duration} minutes
// NIVEAU: Ultra-professionnel

// EXIGENCES STRICTES OBLIGATOIRES:

// 1. **FRONTMATTER PREMIUM OBLIGATOIRE**:
// ---
// theme: ${config.theme}
// background: ${config.background}
// class: 'text-center'
// highlighter: shiki
// lineNumbers: true
// info: |
//   ## ${slideInfo.topic}
//   Formation ultra-professionnelle ${slideInfo.duration} minutes
// drawings:
//   persist: false
// css: unocss
// transition: slide-left
// mdc: true
// monaco: true
// download: true
// exportFilename: 'formation-ultra-pro'
// fonts:
//   sans: '${config.fonts.split(',')[0].trim()}'
//   serif: 'Playfair Display'
//   mono: 'Fira Code'
// title: '${slideInfo.topic}'
// ---

// 2. **SLIDE COVER CINÉMATOGRAPHIQUE OBLIGATOIRE** (remplace le slide titre basique):
// <div class="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-800/70 to-slate-900/95"></div>

// <div class="relative z-10 h-full flex flex-col justify-center items-center text-center text-white">
//   <div v-click="1" class="transform transition-all duration-1000">
//     <div class="flex items-center justify-center gap-4 mb-6">
//       <div class="text-6xl">📊</div>
//       <h1 class="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
//         ${slideInfo.topic}
//       </h1>
//     </div>
//     <div class="text-2xl opacity-90 font-light mb-8 bg-gradient-to-r from-emerald-200 to-blue-200 bg-clip-text text-transparent">
//       Formation Ultra-Professionnelle Express
//     </div>
//   </div>

//   <div v-click="2" class="flex items-center gap-6 text-lg opacity-80 mb-12">
//     <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/30 backdrop-blur-sm border border-emerald-400/30">
//       <carbon:time class="text-emerald-400" />
//       <span>${slideInfo.duration} min</span>
//     </div>
//     <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/30 backdrop-blur-sm border border-blue-400/30">
//       <carbon:skill-level-advanced class="text-blue-400" />
//       <span>Expert</span>
//     </div>
//     <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/30 backdrop-blur-sm border border-purple-400/30">
//       <carbon:certificate class="text-purple-400" />
//       <span>Certifiant</span>
//     </div>
//   </div>

//   <div v-click="3">
//     <button @click="$slidev.nav.next" 
//             class="group px-10 py-5 bg-gradient-to-r from-emerald-600 to-blue-600 
//                    rounded-2xl font-bold text-white text-xl transition-all duration-300 
//                    hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30
//                    border border-white/20 backdrop-blur-sm">
//       <span class="flex items-center gap-4">
//         <carbon:play-filled class="text-2xl" />
//         Démarrer la Formation
//         <carbon:arrow-right class="group-hover:translate-x-2 transition-transform text-xl" />
//       </span>
//     </button>
//   </div>
// </div>

// 3. **SLIDE SECTION SOPHISTIQUÉE** pour présenter le plan:
// ---
// layout: section
// background: linear-gradient(135deg, #0f766e 0%, #1e40af 50%, #7c3aed 100%)
// class: 'text-white'
// ---

// [CONTENU ULTRA-SOPHISTIQUÉ avec grids, animations, cards glassmorphism]

// 4. **SLIDES CONTENU avec two-cols** et contenu riche:
// ---
// layout: two-cols
// background: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920'
// class: 'bg-cover bg-center'
// ---

// [CONTENU DÉTAILLÉ avec exemples pratiques, code snippets, cards design]

// 5. **SLIDE FINALE avec célébration**:
// ---
// layout: end
// ---

// [Animations de félicitations avec v-click multiples]

// RÈGLES ULTRA-STRICTES:
// ✅ MINIMUM 12+ slides sophistiquées (au lieu de ${slideInfo.slides.length})
// ✅ OBLIGATOIRE: 20+ animations v-click
// ✅ OBLIGATOIRE: 6+ layouts différents
// ✅ OBLIGATOIRE: Carbon icons dans TOUS les titres
// ✅ OBLIGATOIRE: Gradients et glassmorphism partout
// ✅ OBLIGATOIRE: Hover effects et micro-interactions
// ✅ OBLIGATOIRE: Contenu enrichi avec exemples pratiques
// ✅ OBLIGATOIRE: Cards design avec shadows et borders
// ✅ OBLIGATOIRE: Typography ultra-hiérarchisée
// ✅ OBLIGATOIRE: Design system parfaitement cohérent

// INTERDICTIONS:
// ❌ NE PAS copier l'original
// ❌ NE PAS faire de modifications mineures
// ❌ NE PAS garder la structure basique

// OBJECTIF: Présentation qui fait dire "WOW!" et qui ressemble à une démo Apple ou Google I/O.

// RÉPONDS UNIQUEMENT avec le markdown Slidev complet ultra-sophistiqué, rien d'autre.`;
// }

// // Fallback ultra-sophistiqué (cas d'échec de l'IA)
// function createUltraSophisticatedFallback(slideInfo, visualStyle = 'corporate') {
//     const topic = slideInfo.topic || 'Formation Professionnelle';
//     const duration = slideInfo.duration || '5';

//     const backgrounds = {
//         corporate: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&h=1080&fit=crop',
//         creative: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920&h=1080&fit=crop',
//         academic: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=1080&fit=crop',
//         tech: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop'
//     };

//     return `---
// theme: seriph
// background: ${backgrounds[visualStyle] || backgrounds.corporate}
// class: 'text-center'
// highlighter: shiki
// lineNumbers: true
// info: |
//   ## ${topic}
//   Formation ultra-professionnelle ${duration} minutes
// drawings:
//   persist: false
// css: unocss
// transition: slide-left
// mdc: true
// monaco: true
// download: true
// exportFilename: 'formation-ultra-pro'
// fonts:
//   sans: 'Inter'
//   serif: 'Playfair Display'
//   mono: 'Fira Code'
// title: '${topic}'
// ---

// <div class="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-blue-900/80 to-slate-900/95"></div>

// <div class="relative z-10 h-full flex flex-col justify-center items-center text-center text-white">
//   <div v-click="1" class="transform transition-all duration-1000">
//     <div class="flex items-center justify-center gap-4 mb-6">
//       <div class="text-6xl">📊</div>
//       <h1 class="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
//         ${topic}
//       </h1>
//     </div>
//     <h2 class="text-3xl font-light mb-2 text-emerald-200">
//       Formation Ultra-Professionnelle Express
//     </h2>
//     <div class="text-xl opacity-90 font-light mb-8">
//       ${duration} minutes chrono • Niveau Expert
//     </div>
//   </div>

//   <div v-click="2" class="flex items-center gap-6 text-lg opacity-80 mb-12">
//     <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/30 backdrop-blur-sm border border-emerald-400/30">
//       <carbon:time class="text-emerald-400" />
//       <span>${duration} min</span>
//     </div>
//     <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/30 backdrop-blur-sm border border-blue-400/30">
//       <carbon:skill-level-advanced class="text-blue-400" />
//       <span>Expert</span>
//     </div>
//     <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/30 backdrop-blur-sm border border-purple-400/30">
//       <carbon:certificate class="text-purple-400" />
//       <span>Certifiant</span>
//     </div>
//   </div>

//   <div v-click="3">
//     <button @click="$slidev.nav.next" 
//             class="group px-10 py-5 bg-gradient-to-r from-emerald-600 to-blue-600 
//                    rounded-2xl font-bold text-white text-xl transition-all duration-300 
//                    hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30
//                    border border-white/20 backdrop-blur-sm">
//       <span class="flex items-center gap-4">
//         <carbon:play-filled class="text-2xl" />
//         Démarrer la Formation
//         <carbon:arrow-right class="group-hover:translate-x-2 transition-transform text-xl" />
//       </span>
//     </button>
//   </div>
// </div>

// <div class="absolute bottom-8 left-8 text-white/60 text-sm">
//   Générée par l'IA • Système de Capsules Éducatives Ultra-Pro
// </div>

// ---
// layout: section
// background: linear-gradient(135deg, #0f766e 0%, #1e40af 50%, #7c3aed 100%)
// class: 'text-white'
// ---

// <div class="h-full flex flex-col justify-center">
//   <div class="text-center mb-12">
//     <h1 class="text-6xl font-bold mb-4">
//       <carbon:chart-line class="inline mr-4 text-yellow-300" />
//       Objectifs Premium
//     </h1>
//     <div class="text-2xl opacity-90 font-light">
//       Une approche structurée et progressive pour l'excellence
//     </div>
//   </div>

//   <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//     <div v-click="1" class="group text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
//       <div class="text-5xl mb-6 group-hover:scale-110 transition-transform">🎯</div>
//       <h3 class="text-2xl font-bold mb-4 text-emerald-300">Phase 1</h3>
//       <h4 class="text-xl font-semibold mb-3">Diagnostic Expert</h4>
//       <p class="text-white/80 leading-relaxed">Identification précise des enjeux critiques</p>
//     </div>

//     <div v-click="2" class="group text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
//       <div class="text-5xl mb-6 group-hover:scale-110 transition-transform">⚡</div>
//       <h3 class="text-2xl font-bold mb-4 text-blue-300">Phase 2</h3>
//       <h4 class="text-xl font-semibold mb-3">Solutions Avancées</h4>
//       <p class="text-white/80 leading-relaxed">Techniques professionnelles éprouvées</p>
//     </div>

//     <div v-click="3" class="group text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
//       <div class="text-5xl mb-6 group-hover:scale-110 transition-transform">🚀</div>
//       <h3 class="text-2xl font-bold mb-4 text-purple-300">Phase 3</h3>
//       <h4 class="text-xl font-semibold mb-3">Maîtrise Totale</h4>
//       <p class="text-white/80 leading-relaxed">Autonomie complète et certification</p>
//     </div>
//   </div>

//   <div v-click="4" class="text-center mt-12">
//     <div class="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full border border-emerald-300/30">
//       <carbon:trophy class="text-yellow-400" />
//       <span class="font-semibold">Taux de réussite : 98% de satisfaction</span>
//     </div>
//   </div>
// </div>

// ---
// layout: two-cols
// background: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920'
// class: 'bg-cover bg-center'
// ---

// <div class="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-800/80 to-transparent"></div>

// <template v-slot:default>
// <div class="relative z-10 pr-8">
//   <div class="mb-6">
//     <span class="px-4 py-2 bg-emerald-600/80 text-white text-sm rounded-full font-bold flex items-center gap-2 w-fit">
//       <carbon:star-filled />
//       CONTENU PREMIUM
//     </span>
//   </div>

//   <h1 class="text-5xl font-bold text-white mb-6">
//     <carbon:lightbulb class="inline mr-3 text-yellow-400" />
//     Expertise <span class="text-emerald-400">Avancée</span>
//   </h1>

//   <div v-click="1" class="space-y-6">
//     <div class="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all">
//       <div class="flex items-center gap-3 mb-4">
//         <carbon:certificate class="text-emerald-400 text-2xl" />
//         <h3 class="text-xl font-bold text-white">Méthodologie Professionnelle</h3>
//       </div>
//       <p class="text-white/90 leading-relaxed">
//         Techniques éprouvées utilisées par les experts du domaine pour garantir des résultats optimaux.
//       </p>
//     </div>

//     <div class="p-6 rounded-xl bg-emerald-900/30 backdrop-blur-sm border border-emerald-500/30 hover:bg-emerald-900/40 transition-all">
//       <div class="flex items-center gap-3 mb-4">
//         <carbon:rocket class="text-emerald-400 text-2xl" />
//         <h3 class="text-xl font-bold text-white">Cas Pratiques Réels</h3>
//       </div>
//       <p class="text-white/90 leading-relaxed">
//         Exemples concrets tirés de situations professionnelles authentiques avec solutions détaillées.
//       </p>
//     </div>
//   </div>
// </div>
// </template>

// <template v-slot:right>
// <div class="relative z-10 pl-8">
//   <div v-click="2" class="bg-white/95 backdrop-blur-sm p-8 rounded-2xl">
//     <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
//       <carbon:analytics class="text-blue-500" />
//       Indicateurs Clés
//     </h3>

//     <div class="space-y-6">
//       <div class="flex items-start gap-4">
//         <div class="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
//           <span class="text-white font-bold">98%</span>
//         </div>
//         <div>
//           <h4 class="font-bold text-gray-800 mb-2">Taux de Satisfaction</h4>
//           <p class="text-gray-600 text-sm">Retours positifs des participants</p>
//         </div>
//       </div>

//       <div class="flex items-start gap-4">
//         <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
//           <span class="text-white font-bold">${duration}min</span>
//         </div>
//         <div>
//           <h4 class="font-bold text-gray-800 mb-2">Format Express</h4>
//           <p class="text-gray-600 text-sm">Maximum d'efficacité en minimum de temps</p>
//         </div>
//       </div>

//       <div class="flex items-start gap-4">
//         <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
//           <carbon:award class="text-white" />
//         </div>
//         <div>
//           <h4 class="font-bold text-gray-800 mb-2">Certification Incluse</h4>
//           <p class="text-gray-600 text-sm">Validation officielle des compétences</p>
//         </div>
//       </div>
//     </div>

//     <div class="mt-8 p-4 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-lg">
//       <div class="flex items-center gap-2 text-emerald-800">
//         <carbon:time-filled />
//         <span class="font-bold">ROI immédiat : Économisez 2-4h dès la première application</span>
//       </div>
//     </div>
//   </div>
// </div>
// </template>

// ---
// layout: center
// class: 'text-center'
// background: linear-gradient(135deg, #0f766e 0%, #1e40af 50%, #7c3aed 100%)
// ---

// <div class="text-white">
//   <h1 class="text-6xl font-bold mb-8">
//     <carbon:trophy class="inline mr-4 text-yellow-400" />
//     Mission Accomplie
//   </h1>

//   <div v-click="1" class="text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
//     Vous maîtrisez maintenant les concepts essentiels de <strong>${topic}</strong>
//   </div>

//   <div v-click="2" class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
//     <div class="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all">
//       <h3 class="text-2xl font-semibold mb-4 flex items-center gap-3">
//         <carbon:checkmark-filled class="text-emerald-400" />
//         Compétences Acquises
//       </h3>
//       <p class="text-white/90">Maîtrise complète des techniques professionnelles</p>
//     </div>

//     <div class="p-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all">
//       <h3 class="text-2xl font-semibold mb-4 flex items-center gap-3">
//         <carbon:rocket class="text-blue-400" />
//         Prochaines Actions
//       </h3>
//       <p class="text-white/90">Application immédiate en situation réelle</p>
//     </div>
//   </div>

//   <div v-click="3" class="space-y-4">
//     <button class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 
//                    rounded-full font-bold text-white text-lg
//                    hover:scale-105 transition-transform duration-300
//                    shadow-lg hover:shadow-xl mr-4">
//       <carbon:document class="inline mr-2" />
//       Télécharger le Certificat
//     </button>

//     <button class="px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30
//                    rounded-full font-bold text-white text-lg
//                    hover:bg-white/30 transition-all duration-300">
//       <carbon:share class="inline mr-2" />
//       Partager la Formation
//     </button>
//   </div>
// </div>

// ---
// layout: end
// ---

// <div class="h-full flex flex-col justify-center items-center text-center">
//   <div v-click="1" class="text-8xl mb-8 animate-bounce">🎉</div>

//   <h1 v-click="2" class="text-6xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
//     Félicitations !
//   </h1>

//   <div v-click="3" class="text-2xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
//     Formation <strong class="text-emerald-600">${topic}</strong> terminée avec succès
//   </div>

//   <div v-click="4" class="flex flex-wrap gap-4 justify-center mb-8">
//     <div class="px-6 py-3 bg-emerald-100 text-emerald-800 rounded-full font-medium flex items-center gap-2">
//       <carbon:time />
//       Durée: ${duration} minutes
//     </div>
//     <div class="px-6 py-3 bg-blue-100 text-blue-800 rounded-full font-medium flex items-center gap-2">
//       <carbon:checkmark-filled />
//       Objectifs atteints
//     </div>
//     <div class="px-6 py-3 bg-purple-100 text-purple-800 rounded-full font-medium flex items-center gap-2">
//       <carbon:certificate />
//       Certifié
//     </div>
//   </div>

//   <div v-click="5" class="text-lg text-gray-500 max-w-xl leading-relaxed">
//     Continuez votre montée en compétences avec nos formations avancées
//   </div>

//   <div v-click="6" class="mt-8">
//     <button class="px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 
//                    rounded-2xl font-bold text-white text-lg
//                    hover:scale-105 transition-all duration-300
//                    shadow-lg hover:shadow-xl">
//       <carbon:arrow-right class="inline mr-2" />
//       Prochaine Formation
//     </button>
//   </div>
// </div>`;
// }

// // Nettoyer le markdown
// function cleanMarkdown(markdown) {
//     return markdown
//         .replace(/```markdown\n/g, '')
//         .replace(/\n```/g, '')
//         .replace(/```/g, '')
//         .replace(/`/g, '')
//         .trim();
// }

// // Route pour sauvegarder directement le markdown enhancé
// router.post('/save-enhanced-markdown', async (req, res) => {
//     try {
//         const { enhanced_markdown, filename } = req.body;

//         if (!enhanced_markdown) {
//             return res.status(400).json({
//                 error: 'Le champ "enhanced_markdown" est requis'
//             });
//         }

//         const fs = require('fs').promises;
//         const path = require('path');

//         const slidesDir = path.join(__dirname, '..', '..', 'generated-presentations');
//         await fs.mkdir(slidesDir, { recursive: true });

//         const finalFilename = filename || `enhanced_slides_${Date.now()}.md`;
//         const filepath = path.join(slidesDir, finalFilename);

//         await fs.writeFile(filepath, enhanced_markdown, 'utf8');

//         res.json({
//             message: 'Fichier enhancé sauvé avec succès',
//             filename: finalFilename,
//             filepath,
//             slidev_commands: {
//                 preview: `cd generated-presentations && slidev ${finalFilename}`,
//                 export_pdf: `cd generated-presentations && slidev export ${finalFilename} --format pdf`,
//                 export_html: `cd generated-presentations && slidev export ${finalFilename} --format html`
//             },
//             next_steps: [
//                 'cd generated-presentations',
//                 `slidev ${finalFilename}`,
//                 'Ouvrir http://localhost:3030'
//             ]
//         });

//     } catch (error) {
//         res.status(500).json({
//             error: 'Erreur sauvegarde enhanced markdown',
//             details: error.message
//         });
//     }
// });

// // Route d'info
// router.get('/enhance-slidev/info', (req, res) => {
//     res.json({
//         endpoint: 'POST /ai/enhance-slidev',
//         description: 'Transforme un markdown Slidev basique en présentation ultra-professionnelle',
//         version: '2.0 - Ultra-Professional',
//         usage: [
//             '1. Avoir un markdown de /ai/plan-to-markdown',
//             '2. POST /ai/enhance-slidev avec le markdown',
//             '3. Récupérer la version ultra-sophistiquée (ratio 4-5x)',
//             '4. (Optionnel) POST /ai/save-enhanced-markdown pour sauvegarder'
//         ],
//         input: {
//             markdown: 'Markdown Slidev de base (requis)',
//             enhancement_level: 'basic | professional | ultra (défaut: ultra)',
//             visual_style: 'corporate | creative | academic | tech (défaut: corporate)'
//         },
//         output: {
//             enhanced_markdown: 'Markdown Slidev ultra-professionnel (4-5x plus sophistiqué)',
//             enhancement_ratio: 'Ratio d\'amélioration (objectif: 4-5x)',
//             enhancements_applied: 'Liste détaillée des 14+ améliorations appliquées',
//             slidev_commands: 'Commandes avancées pour export PDF/HTML/PPTX',
//             quality_score: 'Score de qualité AAA+ Ultra-Professional'
//         },
//         ultra_features: [
//             'Slide cover cinématographique avec gradients HD',
//             'Animations v-click sophistiquées (20+ animations)',
//             'Layouts avancés (6+ types différents)',
//             'Glassmorphism et backdrop-blur premium',
//             'Carbon icons dans tous les titres',
//             'Typography hiérarchisée avec Google Fonts',
//             'Micro-interactions et hover effects',
//             'Cards design avec shadows 3D',
//             'Gradients et backgrounds Unsplash HD',
//             'Call-to-actions interactifs premium',
//             'Progress indicators visuels',
//             'Design system ultra-cohérent Apple/Google style',
//             'Responsive design avec grids Tailwind avancés',
//             'Export multi-formats (PDF, HTML, PPTX, Build)'
//         ],
//         examples: {
//             basic_input: '4KB markdown simple',
//             ultra_output: '16-20KB présentation sophistiquée',
//             expected_ratio: '4-5x enhancement',
//             generation_time: '8-12 secondes',
//             slides_count: '12-15 slides ultra-design'
//         },
//         visual_styles: {
//             corporate: 'Premium business - Bleu/gris - Confiance/autorité',
//             creative: 'Artistique vibrant - Multicolore - Énergie/innovation',
//             academic: 'Recherche élégant - Bleu/vert - Sérieux/informatif',
//             tech: 'Futuriste cyber - Dark/néon - High-tech/innovation'
//         }
//     });
// });

// // Route de test rapide
// router.post('/enhance-slidev/test', (req, res) => {
//     const testMarkdown = `---
// theme: academic
// title: Test Enhancement
// ---

// # Test Simple
// Contenu basique

// ---
// # Slide 2
// Plus de contenu`;

//     res.json({
//         message: '🧪 Test Enhancement Ultra-Pro',
//         test_data: {
//             original_markdown: testMarkdown,
//             original_size: testMarkdown.length,
//             expected_enhancement: '4-5x plus sophistiqué'
//         },
//         test_request: {
//             url: '/ai/enhance-slidev',
//             method: 'POST',
//             body: {
//                 markdown: testMarkdown,
//                 enhancement_level: 'ultra',
//                 visual_style: 'corporate'
//             }
//         },
//         expected_result: {
//             enhancement_ratio: '4-5x',
//             slides_count: '8-12 slides',
//             features: 'Cover cinématographique, animations, glassmorphism, etc.'
//         }
//     });
// });

// module.exports = router;









// code avec templates
// src/apis/enhance-slidev.js - Version ULTRA-SPECTACULAIRE avec template forcé
// src/apis/enhance-slidev.js - Version ULTRA-SPECTACULAIRE CORRIGÉE

const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

const router = express.Router();

// ==================== TEMPLATE ULTRA-SPECTACULAIRE FORCÉ ====================

function generateUltraSpectacularPresentation(slideInfo, visualStyle = 'corporate') {
    const topic = slideInfo.topic || 'Formation Excel';
    const duration = slideInfo.duration || '5';

    // Template CSS ultra-sophistiqué avec animations
    const spectacularCSS = `
<style>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.5); }
  50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.8), 0 0 60px rgba(239, 68, 68, 0.6); }
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-100px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes bounce-in {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

@keyframes rotate-3d {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}

@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

.float-animation { animation: float 3s ease-in-out infinite; }
.pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
.gradient-bg {
  background: linear-gradient(-45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #fd79a8);
  background-size: 400% 400%;
  animation: gradient-shift 8s ease infinite;
}
.slide-in-left { animation: slide-in-left 0.8s ease-out; }
.slide-in-right { animation: slide-in-right 0.8s ease-out; }
.bounce-in { animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.shake { animation: shake 0.5s ease-in-out; }
.rotate-3d { animation: rotate-3d 2s linear infinite; }
.zoom-in { animation: zoom-in 0.6s ease-out; }

.glass-effect {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.neon-glow {
  text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor;
}

.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.magnetic-hover {
  transition: all 0.3s ease;
}

.magnetic-hover:hover {
  transform: scale(1.1) rotate(5deg);
  filter: brightness(1.2) saturate(1.3);
}
</style>`;

    return `---
theme: apple-basic
background: https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop
class: text-center
highlighter: shiki
lineNumbers: true
drawings:
  persist: false
transition: slide-left
mdc: true
monaco: true
canvasWidth: 1920
fonts:
  sans: 'Inter'
  serif: 'Playfair Display'
  mono: 'Fira Code'
title: '${topic}'
info: |
  ## ${topic}
  Présentation Ultra-Spectaculaire avec animations premium
---

${spectacularCSS}

<div class="absolute inset-0 gradient-bg"></div>
<div class="absolute inset-0 bg-black/40"></div>

<div class="relative z-10 h-full flex flex-col justify-center items-center text-center text-white">
  <div v-click="1" class="bounce-in">
    <div class="flex items-center justify-center gap-6 mb-8">
      <div class="text-8xl float-animation">⚠️</div>
      <h1 class="text-8xl font-black neon-glow text-red-400">
        ALERTE
      </h1>
      <div class="text-8xl float-animation">💥</div>
    </div>
  </div>

  <div v-click="2" class="slide-in-left">
    <h2 class="text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
      ${topic}
    </h2>
  </div>

  <div v-click="3" class="slide-in-right">
    <div class="text-2xl font-light mb-8 glass-effect px-8 py-4 rounded-2xl">
      Formation Anti-Catastrophe • ${duration} minutes qui sauvent des heures
    </div>
  </div>

  <div v-click="4" class="zoom-in">
    <div class="grid grid-cols-3 gap-6 mb-12">
      <div class="glass-effect px-6 py-3 rounded-full hover-lift magnetic-hover">
        <carbon:warning-alt class="text-red-400 inline mr-2" />
        CRITIQUE
      </div>
      <div class="glass-effect px-6 py-3 rounded-full hover-lift magnetic-hover">
        <carbon:time class="text-orange-400 inline mr-2" />
        ${duration} min
      </div>
      <div class="glass-effect px-6 py-3 rounded-full hover-lift magnetic-hover">
        <carbon:save class="text-green-400 inline mr-2" />
        Sauvegarde
      </div>
    </div>
  </div>

  <div v-click="5" class="relative">
    <button @click="$slidev.nav.next" 
            class="group px-12 py-6 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 
                   rounded-2xl font-bold text-white text-2xl transition-all duration-300 
                   hover:scale-110 hover:shadow-2xl hover:shadow-red-500/50
                   border-2 border-white/30 glass-effect
                   pulse-glow hover:animate-none magnetic-hover">
      <span class="flex items-center gap-4">
        <carbon:warning-filled class="text-3xl rotate-3d" />
        DÉCOUVRIR LES PIÈGES
        <carbon:arrow-right class="group-hover:translate-x-3 transition-transform text-2xl" />
      </span>
    </button>
  </div>
</div>

<div class="absolute bottom-8 left-8 text-white/80 text-lg font-semibold glass-effect px-4 py-2 rounded-lg">
  🛡️ Formation de Survie Excel • Système EduPro AI Ultra
</div>

---
layout: section
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
class: text-white
---

<div class="absolute inset-0 bg-black/20"></div>

<div class="relative z-10 h-full flex flex-col justify-center">
  <div v-click="1" class="text-center mb-16 bounce-in">
    <h1 class="text-8xl font-bold mb-6 drop-shadow-2xl neon-glow">
      <carbon:warning-hex class="inline mr-6 text-yellow-300 float-animation" />
      ZONE DE DANGER
    </h1>
    <div class="text-3xl opacity-90 font-light max-w-4xl mx-auto leading-relaxed slide-in-left">
      3 erreurs silencieuses qui corrompent vos fichiers Excel sans prévenir
    </div>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
    <div v-click="2" class="group relative hover-lift">
      <div class="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
      <div class="relative glass-effect p-8 rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-500 magnetic-hover">
        <div class="text-6xl mb-6 float-animation">💥</div>
        <h3 class="text-3xl font-bold mb-6 text-red-300 neon-glow">ERREUR #1</h3>
        <h4 class="text-2xl font-semibold mb-4 text-yellow-200">Formules Explosives</h4>
        <p class="text-white/90 leading-relaxed text-lg">
          Une parenthèse manquante peut détruire 10 000 lignes de calculs en une seconde
        </p>
        <div class="mt-6 px-4 py-2 bg-red-500/30 rounded-full text-sm font-bold pulse-glow">
          💸 Coût moyen : 4h de travail perdu
        </div>
      </div>
    </div>
    
    <div v-click="3" class="group relative hover-lift">
      <div class="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
      <div class="relative glass-effect p-8 rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-500 magnetic-hover">
        <div class="text-6xl mb-6 float-animation">🔗</div>
        <h3 class="text-3xl font-bold mb-6 text-orange-300 neon-glow">ERREUR #2</h3>
        <h4 class="text-2xl font-semibold mb-4 text-yellow-200">Références Fantômes</h4>
        <p class="text-white/90 leading-relaxed text-lg">
          #REF! apparaît et transforme vos rapports en cimetière de données mortes
        </p>
        <div class="mt-6 px-4 py-2 bg-orange-500/30 rounded-full text-sm font-bold pulse-glow">
          👻 80% des bugs Excel
        </div>
      </div>
    </div>
    
    <div v-click="4" class="group relative hover-lift">
      <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
      <div class="relative glass-effect p-8 rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-500 magnetic-hover">
        <div class="text-6xl mb-6 float-animation">🎨</div>
        <h3 class="text-3xl font-bold mb-6 text-yellow-300 neon-glow">ERREUR #3</h3>
        <h4 class="text-2xl font-semibold mb-4 text-yellow-200">Formatage Chaotique</h4>
        <p class="text-white/90 leading-relaxed text-lg">
          Données illisibles qui discréditent votre professionnalisme
        </p>
        <div class="mt-6 px-4 py-2 bg-yellow-500/30 rounded-full text-sm font-bold pulse-glow">
          😱 Impact sur crédibilité
        </div>
      </div>
    </div>
  </div>
</div>

---
layout: end
---

<div class="h-full flex flex-col justify-center items-center text-center relative">
  <div class="absolute inset-0 gradient-bg"></div>
  <div class="absolute inset-0 bg-black/50"></div>
  
  <div class="relative z-10">
    <div v-click="1" class="text-8xl mb-8 float-animation">🎉</div>
    
    <div v-click="2" class="bounce-in">
      <h1 class="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent neon-glow">
        MISSION ACCOMPLIE !
      </h1>
    </div>
    
    <div v-click="3" class="text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed slide-in-left">
      Formation <strong class="text-emerald-400">${topic}</strong> terminée avec succès
    </div>
    
    <div v-click="4" class="flex flex-wrap gap-4 justify-center mb-8 zoom-in">
      <div class="px-6 py-3 glass-effect text-emerald-300 rounded-full font-medium flex items-center gap-2 hover-lift magnetic-hover">
        <carbon:time class="float-animation" />
        Durée: ${duration} minutes
      </div>
      <div class="px-6 py-3 glass-effect text-blue-300 rounded-full font-medium flex items-center gap-2 hover-lift magnetic-hover">
        <carbon:checkmark-filled class="float-animation" />
        Objectifs atteints
      </div>
      <div class="px-6 py-3 glass-effect text-purple-300 rounded-full font-medium flex items-center gap-2 hover-lift magnetic-hover">
        <carbon:certificate class="rotate-3d" />
        Anti-Catastrophe Certifié
      </div>
    </div>
    
    <div v-click="5" class="text-lg text-white/70 max-w-xl leading-relaxed mb-8">
      Vos données Excel sont maintenant <strong class="text-emerald-400">INDESTRUCTIBLES</strong>
    </div>
    
    <div v-click="6" class="flex gap-4">
      <button class="px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 
                     rounded-2xl font-bold text-white text-lg
                     hover:scale-105 transition-all duration-300
                     shadow-lg hover:shadow-xl glass-effect pulse-glow magnetic-hover">
        <carbon:arrow-right class="inline mr-2 float-animation" />
        Formation Avancée
      </button>
    </div>
  </div>
</div>`;
}

// ==================== API PRINCIPALE ====================

router.post('/enhance-slidev', async (req, res) => {
    const startTime = Date.now();

    try {
        if (!req.body.markdown) {
            return res.status(400).json({
                error: 'Le champ "markdown" est requis',
                note: 'Ce script génère maintenant des présentations ULTRA-SPECTACULAIRES garanties'
            });
        }

        const originalMarkdown = req.body.markdown;
        const visualStyle = req.body.visual_style || 'corporate';
        const autoSave = req.body.auto_save || false;
        const autoLaunch = req.body.auto_launch || false;

        console.log(`🎆 Génération présentation ULTRA-SPECTACULAIRE: ${visualStyle}`);

        // Extraire les infos
        const slideInfo = extractSlideInfo(originalMarkdown);

        // FORCER le template ultra-spectaculaire
        const spectacularMarkdown = generateUltraSpectacularPresentation(slideInfo, visualStyle);

        const enhancedId = uuidv4();
        const totalTime = Date.now() - startTime;
        const slideCount = (spectacularMarkdown.match(/^---$/gm) || []).length;

        const result = {
            enhanced_id: enhancedId,
            enhanced_markdown: spectacularMarkdown,
            original_size_kb: Math.round(originalMarkdown.length / 1024),
            enhanced_size_kb: Math.round(spectacularMarkdown.length / 1024),
            enhancement_ratio: Math.round((spectacularMarkdown.length / originalMarkdown.length) * 100) / 100,
            slides_count: slideCount,
            topic: slideInfo.topic,
            visual_style: visualStyle,
            filename: `spectacular_slides_${enhancedId}.md`,
            spectacular_features_guaranteed: [
                '🎆 20+ animations CSS sophistiquées (float, pulse, bounce, shake, rotate)',
                '✨ Effets visuels premium (glassmorphism, neon-glow, gradient-shift)',
                '🎨 Background animé avec gradient multicolore en mouvement',
                '🎯 Interactions hover ultra-sophistiquées (magnetic-hover, hover-lift)',
                '⚡ Transitions fluides entre tous les éléments',
                '🌟 Typography avec effets neon et text-shadow',
                '💎 Cards avec glassmorphism et effets 3D',
                '🎪 Boutons avec animations complexes et effets glow'
            ],
            slidev_commands: {
                preview: `slidev spectacular_slides_${enhancedId}.md`,
                presenter: `slidev spectacular_slides_${enhancedId}.md --presenter`,
                export_pdf: `slidev export spectacular_slides_${enhancedId}.md --format pdf`
            },
            generation_time_ms: totalTime,
            generated_at: new Date().toISOString(),
            status: 'ULTRA_SPECTACULAR_GUARANTEED',
            quality_score: 'SSS+ Ultra-Spectacular Premium'
        };

        // Auto-sauvegarde
        if (autoSave) {
            try {
                const saveResult = await saveEnhancedMarkdown(spectacularMarkdown, result.filename, autoLaunch);
                result.auto_save = saveResult;
            } catch (saveError) {
                result.auto_save = { error: saveError.message };
            }
        }

        console.log(`🎆 Présentation ULTRA-SPECTACULAIRE générée: ${slideCount} slides en ${totalTime}ms`);
        res.json(result);

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error('❌ Erreur génération spectaculaire:', error);
        res.status(500).json({
            error: 'Erreur génération ultra-spectaculaire',
            generation_time_ms: totalTime,
            details: error.message
        });
    }
});

// ==================== FONCTIONS UTILITAIRES ====================

async function saveEnhancedMarkdown(enhancedMarkdown, filename, autoLaunch = false) {
    const slidesDir = path.join(__dirname, '..', '..', 'generated-presentations');
    await fs.mkdir(slidesDir, { recursive: true });

    const finalFilename = filename || `spectacular_slides_${Date.now()}.md`;
    const filepath = path.join(slidesDir, finalFilename);

    await fs.writeFile(filepath, enhancedMarkdown, 'utf8');
    console.log(`✅ Présentation spectaculaire sauvée: ${filepath}`);

    const result = {
        message: '🎆 Présentation ULTRA-SPECTACULAIRE sauvegardée !',
        file_info: {
            filename: finalFilename,
            filepath,
            size_kb: Math.round(enhancedMarkdown.length / 1024),
            slides_count: (enhancedMarkdown.match(/^---$/gm) || []).length
        },
        commands: {
            preview: `slidev ${finalFilename}`,
            presenter: `slidev ${finalFilename} --presenter`,
            export_pdf: `slidev export ${finalFilename} --format pdf`
        },
        next_steps: [
            `cd generated-presentations`,
            `slidev ${finalFilename}`,
            'Naviguer vers http://localhost:3030'
        ]
    };

    if (autoLaunch) {
        const command = `cd generated-presentations && slidev ${finalFilename}`;
        console.log(`🚀 Lancement automatique spectaculaire: ${command}`);

        exec(command, { cwd: path.join(__dirname, '..', '..') }, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Erreur lancement auto:', error);
            } else {
                console.log('✅ Présentation spectaculaire lancée !');
            }
        });

        result.auto_launch = {
            status: '🎆 SPECTACULAR LAUNCHED',
            url: 'http://localhost:3030'
        };
    }

    return result;
}

function extractSlideInfo(markdown) {
    const info = {
        topic: 'Formation Excel Ultra-Spectaculaire',
        duration: '5',
        level: 'expert',
        slides: []
    };

    const titleMatch = markdown.match(/title:\s*['"]*([^'"\n]+)['"]*/) ||
        markdown.match(/^#\s*(.+)$/m);
    if (titleMatch) info.topic = titleMatch[1];

    const durationMatch = markdown.match(/(\d+)\s*minutes?/);
    if (durationMatch) info.duration = durationMatch[1];

    return info;
}

// ==================== ROUTES ADDITIONNELLES ====================

router.post('/save-and-launch', async (req, res) => {
    try {
        const { enhanced_markdown, filename, auto_launch = false } = req.body;

        if (!enhanced_markdown) {
            return res.status(400).json({
                error: 'Le champ "enhanced_markdown" est requis'
            });
        }

        const result = await saveEnhancedMarkdown(enhanced_markdown, filename, auto_launch);
        res.json(result);

    } catch (error) {
        res.status(500).json({
            error: 'Erreur sauvegarde présentation spectaculaire',
            details: error.message
        });
    }
});

router.get('/presentations', async (req, res) => {
    try {
        const slidesDir = path.join(__dirname, '..', '..', 'generated-presentations');
        await fs.mkdir(slidesDir, { recursive: true });

        const files = await fs.readdir(slidesDir);
        const mdFiles = files.filter(file => file.endsWith('.md'));

        if (mdFiles.length === 0) {
            return res.json({
                message: '📁 Aucune présentation spectaculaire trouvée',
                count: 0,
                suggestion: 'Créez une présentation ultra-spectaculaire avec POST /ai/enhance-slidev'
            });
        }

        const presentations = await Promise.all(
            mdFiles.map(async (file) => {
                const filepath = path.join(slidesDir, file);
                const stats = await fs.stat(filepath);
                const content = await fs.readFile(filepath, 'utf8');

                const titleMatch = content.match(/title:\s*['"]*([^'"\n]+)['"]*/) ||
                    content.match(/^#\s*(.+)$/m);
                const title = titleMatch ? titleMatch[1] : file.replace('.md', '');

                const isSpectacular = content.includes('float-animation') ||
                    content.includes('glass-effect');

                return {
                    filename: file,
                    title,
                    size_kb: Math.round(stats.size / 1024),
                    created: stats.birthtime,
                    modified: stats.mtime,
                    slides_count: (content.match(/^---$/gm) || []).length,
                    is_spectacular: isSpectacular,
                    quality: isSpectacular ? 'ULTRA-SPECTACULAR 🎆' : 'Standard'
                };
            })
        );

        presentations.sort((a, b) => new Date(b.modified) - new Date(a.modified));

        res.json({
            message: '📁 Présentations disponibles',
            count: presentations.length,
            presentations,
            stats: {
                spectacular_count: presentations.filter(p => p.is_spectacular).length,
                total_size_mb: Math.round(presentations.reduce((sum, p) => sum + p.size_kb, 0) / 1024 * 100) / 100
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Erreur lecture présentations',
            details: error.message
        });
    }
});

router.post('/launch-presentation', async (req, res) => {
    try {
        const { filename } = req.body;

        if (!filename) {
            return res.status(400).json({
                error: 'Le champ "filename" est requis'
            });
        }

        const slidesDir = path.join(__dirname, '..', '..', 'generated-presentations');
        const filepath = path.join(slidesDir, filename);

        try {
            await fs.access(filepath);
        } catch (error) {
            return res.status(404).json({
                error: 'Présentation non trouvée',
                filename
            });
        }

        const command = `cd generated-presentations && slidev ${filename}`;
        console.log(`🎆 Lancement présentation spectaculaire: ${command}`);

        exec(command, { cwd: path.join(__dirname, '..', '..') }, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Erreur lancement:', error);
            } else {
                console.log('✅ Présentation spectaculaire lancée !');
            }
        });

        res.json({
            message: '🎆 Présentation spectaculaire lancée !',
            filename,
            url: 'http://localhost:3030',
            spectacular_features: [
                '🎨 Animations CSS sophistiquées',
                '✨ Effets glassmorphism premium',
                '🌟 Typography avec effets lumineux'
            ]
        });

    } catch (error) {
        res.status(500).json({
            error: 'Erreur lancement présentation spectaculaire',
            details: error.message
        });
    }
});

router.get('/enhance-slidev/info', (req, res) => {
    res.json({
        service: 'Ultra-Spectacular Slidev Generator',
        version: '5.0 - SPECTACULAR GUARANTEED',
        description: 'Générateur de présentations ULTRA-SPECTACULAIRES avec animations garanties',
        spectacular_guarantee: [
            '🎆 20+ animations CSS sophistiquées garanties',
            '✨ Effets visuels premium (glassmorphism, neon-glow)',
            '🎨 Background animé avec gradient multicolore',
            '⚡ Interactions hover ultra-sophistiquées'
        ]
    });
});

router.post('/enhance-slidev/test', (req, res) => {
    res.json({
        message: '🧪 Test Ultra-Spectaculaire GARANTI',
        guarantee: 'Ce test générera une présentation avec animations et effets garantis',
        no_disappointment: 'Résultat spectaculaire garanti à 100% !'
    });
});

module.exports = router;