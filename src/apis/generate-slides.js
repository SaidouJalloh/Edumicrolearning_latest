



// Code optimisé
// src/apis/generate-slides.js - Version améliorée pour Slidev Educational
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Cache pour les slides
const slidesCache = new Map();

// Fonction pour appeler Groq (remplace Ollama)
async function callGroq(prompt, options = {}) {
    try {
        console.log('🚀 Calling Groq API for slides...');

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'Tu es un expert en création de présentations éducatives. Tu génères des slides Slidev en format Markdown, avec un style educational et une structure claire. Réponds toujours en français.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: options.temperature || 0.6,
            max_tokens: options.max_tokens || 3000
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Groq response received for slides');
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('❌ Erreur Groq slides:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        throw new Error('Erreur génération slides IA');
    }
}

// Validation du payload
function validateSlidesPayload(payload) {
    const errors = [];

    if (!payload.plan_sections || !Array.isArray(payload.plan_sections)) {
        errors.push('Le champ "plan_sections" est obligatoire et doit être un tableau');
    }

    if (!payload.script_sections || !Array.isArray(payload.script_sections)) {
        errors.push('Le champ "script_sections" est obligatoire et doit être un tableau');
    }

    if (!payload.topic || typeof payload.topic !== 'string') {
        errors.push('Le champ "topic" est obligatoire et doit être une chaîne de caractères');
    }

    if (!payload.capsule_type || !['conceptual', 'demonstrative'].includes(payload.capsule_type)) {
        errors.push('Le champ "capsule_type" est obligatoire et doit être "conceptual" ou "demonstrative"');
    }

    return errors;
}

// Fonction pour découper intelligemment le développement
function parseContentForSlides(planSections, scriptSections) {
    const slides = [];

    // Slide 1: Introduction
    const introSection = planSections.find(s => s.type === 'introduction');
    const introScript = scriptSections.find(s => s.type === 'introduction' || s.section_number === 1);

    if (introSection && introScript) {
        slides.push({
            type: 'introduction',
            title: introSection.title,
            content: introSection.what_to_cover || [],
            summary: introSection.content_summary,
            script: introScript.script_text,
            duration: introSection.duration_seconds
        });
    }

    // Slides 2-N: Développement (découpage intelligent)
    const devSection = planSections.find(s => s.type === 'development');
    const devScript = scriptSections.find(s => s.type === 'development' || s.section_number === 2);

    if (devSection && devScript) {
        // Extraire les erreurs/points principaux depuis what_to_cover
        const mainPoints = devSection.what_to_cover || [];

        // Si on a plusieurs points (comme les 3 erreurs Excel), créer une slide par point
        if (mainPoints.length > 1) {
            const scriptParts = splitScriptByPoints(devScript.script_text, mainPoints.length);

            mainPoints.forEach((point, index) => {
                slides.push({
                    type: 'content',
                    title: `Point ${index + 1}`,
                    content: [point],
                    summary: `Explication détaillée du point ${index + 1}`,
                    script: scriptParts[index] || `Explication du ${point}`,
                    duration: Math.round(devSection.duration_seconds / mainPoints.length)
                });
            });
        } else {
            // Un seul slide de développement
            slides.push({
                type: 'content',
                title: devSection.title,
                content: mainPoints,
                summary: devSection.content_summary,
                script: devScript.script_text,
                duration: devSection.duration_seconds
            });
        }
    }

    // Slide finale: Conclusion
    const conclusionSection = planSections.find(s => s.type === 'conclusion');
    const conclusionScript = scriptSections.find(s => s.type === 'conclusion' || s.section_number === 3);

    if (conclusionSection && conclusionScript) {
        slides.push({
            type: 'conclusion',
            title: conclusionSection.title,
            content: conclusionSection.what_to_cover || [],
            summary: conclusionSection.content_summary,
            script: conclusionScript.script_text,
            duration: conclusionSection.duration_seconds
        });
    }

    return slides;
}

// Fonction pour diviser le script de développement par points
function splitScriptByPoints(scriptText, numPoints) {
    // Diviser le script en segments logiques
    const sentences = scriptText.split(/[.!?]\s+/);
    const segmentSize = Math.ceil(sentences.length / numPoints);
    const segments = [];

    for (let i = 0; i < numPoints; i++) {
        const start = i * segmentSize;
        const end = start + segmentSize;
        const segment = sentences.slice(start, end).join('. ');
        segments.push(segment);
    }

    return segments;
}

// Fonction pour créer le prompt de génération des slides
function createSlidesPrompt({ topic, capsule_type, slides, settings }) {
    const { level, style } = settings;

    return `Tu dois créer une présentation Slidev en format Markdown pour une capsule éducative.

CONTEXTE:
- Sujet: ${topic}
- Type: ${capsule_type}
- Niveau: ${level}
- Style: Educational
- Nombre de slides: ${slides.length}

STRUCTURE DES SLIDES À CRÉER:
${slides.map((slide, index) =>
        `Slide ${index + 1} (${slide.type}): ${slide.title}
    - Contenu: ${slide.content.join(', ')}
    - Script: ${slide.script.substring(0, 100)}...
    - Durée: ${slide.duration}s`
    ).join('\n')}

FORMAT SLIDEV OBLIGATOIRE:
\`\`\`markdown
---
theme: academic
background: gradient-blue
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## ${topic}
  Formation micro-learning éducative
drawings:
  persist: false
transition: slide-left
title: ${topic}
---

# ${topic}
## Formation micro-learning

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Commencer la formation <carbon:arrow-right class="inline"/>
  </span>
</div>

<!--
Script d'introduction: ${slides[0]?.script || 'Introduction générale'}
-->

---
layout: default
---

# Introduction

${slides.find(s => s.type === 'introduction')?.content.map(point => `- ${point}`).join('\n') || '- Points d\'introduction'}

<!--
${slides.find(s => s.type === 'introduction')?.script || 'Script d\'introduction'}
-->

${slides.filter(s => s.type === 'content').map((slide, index) => `
---
layout: default
---

# ${slide.title}

${slide.content.map(point => `- ${point}`).join('\n')}

<div class="text-sm text-gray-600 mt-8">
💡 ${slide.summary}
</div>

<!--
${slide.script}
-->
`).join('')}

---
layout: center
class: text-center
---

# Conclusion

${slides.find(s => s.type === 'conclusion')?.content.map(point => `- ${point}`).join('\n') || '- Points de conclusion'}

<div class="pt-12">
  <span class="px-2 py-1 rounded bg-blue-600 text-white">
    Merci pour votre attention !
  </span>
</div>

<!--
${slides.find(s => s.type === 'conclusion')?.script || 'Script de conclusion'}
-->

---
layout: end
---

# À vous de jouer !

Mettez en pratique ce que vous avez appris

<div class="text-center pt-12">
  <div class="text-2xl">🎯</div>
  <div class="text-lg">Formation terminée</div>
</div>
\`\`\`

CONTRAINTES:
- Format Markdown Slidev valide
- Thème academic/educational
- Script dans les commentaires de chaque slide
- Transitions fluides
- Style adapté au niveau ${level}

Génère le Markdown Slidev complet:`;
}

// API POST /ai/generate-slides
router.post('/generate-slides', async (req, res) => {
    const startTime = Date.now();

    try {
        // Validation du payload
        const validationErrors = validateSlidesPayload(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Erreurs de validation',
                details: validationErrors,
                expected_format: {
                    plan_sections: "Array depuis /ai/generate-script",
                    script_sections: "Array depuis /ai/generate-script",
                    topic: "string",
                    capsule_type: "conceptual|demonstrative",
                    settings: {
                        level: "beginner|intermediate|advanced",
                        style: "practical|corporate|academic|general"
                    },
                    slide_style: "[optionnel] modern|educational|minimal"
                },
                note: "Utilisez le résultat complet de /ai/generate-script comme input"
            });
        }

        const {
            plan_id,
            script_id,
            plan_sections,
            script_sections,
            topic,
            capsule_type,
            settings,
            slide_style = 'educational'
        } = req.body;

        // Vérifier cache
        const cacheKey = `slides-${topic}-${capsule_type}-${settings.level}-${slide_style}`;
        if (slidesCache.has(cacheKey)) {
            console.log(`💨 Slides récupérées du cache: ${topic.substring(0, 50)}...`);
            const cached = slidesCache.get(cacheKey);
            cached.cached = true;
            cached.generation_time_ms = 0;
            cached.timestamp = new Date().toISOString();
            return res.json(cached);
        }

        console.log(`📊 Génération slides Slidev: ${topic} (${plan_sections.length} sections plan)`);

        // Découper intelligemment en slides
        const slides = parseContentForSlides(plan_sections, script_sections);
        console.log(`🎯 Structure créée: ${slides.length} slides (${slides.filter(s => s.type === 'content').length} contenus)`);

        const slidesId = uuidv4();

        // Créer le prompt pour générer les slides Slidev
        const slidesPrompt = createSlidesPrompt({
            topic,
            capsule_type,
            slides,
            settings
        });

        // Génération avec Groq
        const slidesResponse = await callGroq(slidesPrompt, {
            temperature: 0.6,
            max_tokens: 3500
        });

        // Nettoyer et extraire le markdown
        let slideMarkdown = slidesResponse.trim();

        // Extraire le contenu entre ```markdown et ```
        const markdownMatch = slideMarkdown.match(/```markdown\n([\s\S]*?)\n```/);
        if (markdownMatch) {
            slideMarkdown = markdownMatch[1];
        }

        // Fallback si pas de markdown trouvé
        if (!slideMarkdown.includes('---\ntheme:')) {
            slideMarkdown = createFallbackSlides({ topic, slides, settings });
        }

        const totalTime = Date.now() - startTime;

        const result = {
            slides_id: slidesId,
            plan_id: plan_id || 'manual',
            script_id: script_id || 'manual',
            topic,
            capsule_type,
            slide_style,

            // Contenu des slides
            slide_markdown: slideMarkdown,
            slides_structure: slides,
            slides_count: slides.length + 2, // +2 pour titre et fin

            // Métriques
            total_duration_seconds: slides.reduce((sum, s) => sum + s.duration, 0),
            estimated_presentation_time: Math.round(slides.length * 1.5), // ~1.5min par slide

            // URLs et exports
            preview_url: `http://localhost:3030/slides/${slidesId}`,
            export_formats: ['HTML', 'PDF', 'PNG'],

            // Métadonnées
            generation_time_ms: totalTime,
            provider: 'Groq',
            cached: false,
            generated_at: new Date().toISOString(),
            status: 'completed'
        };

        // Cache pendant 1 heure
        slidesCache.set(cacheKey, { ...result });
        setTimeout(() => slidesCache.delete(cacheKey), 3600000);

        console.log(`✅ Slides Slidev générées: ${result.slides_count} slides en ${totalTime}ms`);
        res.json(result);

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`❌ Erreur génération slides:`, error);
        res.status(500).json({
            error: 'Erreur lors de la génération des slides',
            generation_time_ms: totalTime,
            details: error.message
        });
    }
});

// Fonction fallback pour créer des slides de base
function createFallbackSlides({ topic, slides, settings }) {
    return `---
theme: academic
background: gradient-blue
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## ${topic}
  Formation micro-learning éducative
drawings:
  persist: false
transition: slide-left
title: ${topic}
---

# ${topic}
## Formation micro-learning

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Commencer la formation <carbon:arrow-right class="inline"/>
  </span>
</div>

${slides.map((slide, index) => `
---
layout: ${slide.type === 'introduction' ? 'intro' : slide.type === 'conclusion' ? 'center' : 'default'}
---

# ${slide.title}

${slide.content.map(point => `- ${point}`).join('\n')}

<!--
${slide.script}
-->
`).join('')}

---
layout: end
---

# À vous de jouer !

Mettez en pratique ce que vous avez appris`;
}

// API GET pour récupérer des slides existantes
router.get('/slides/:id', (req, res) => {
    // TODO: Implémenter stockage en base de données
    res.json({
        message: 'Récupération slides - À implémenter avec base de données',
        slides_id: req.params.id,
        status: 'not_implemented'
    });
});

// API GET pour les informations sur les styles de slides
router.get('/generate-slides/info', (req, res) => {
    res.json({
        endpoint: "POST /ai/generate-slides",
        description: "Génère des slides Slidev à partir du plan et script de /ai/generate-script",
        features: [
            "Format Slidev (Markdown) éducatif",
            "Découpage intelligent du contenu",
            "Script intégré dans les notes",
            "Thème educational par défaut",
            "Export multiple (HTML, PDF, PNG)"
        ],
        workflow: {
            step1: "Générer plan + script avec /ai/generate-script",
            step2: "Utiliser le résultat complet comme input de /ai/generate-slides",
            step3: "Obtenir slides Slidev prêtes à présenter"
        },
        example_request: {
            plan_sections: "Array depuis /ai/generate-script",
            script_sections: "Array depuis /ai/generate-script",
            topic: "Les 3 erreurs Excel à éviter",
            capsule_type: "demonstrative",
            settings: {
                level: "beginner",
                style: "practical"
            }
        },
        slide_styles: {
            educational: "Thème académique avec couleurs éducatives",
            modern: "Design contemporain et épuré",
            minimal: "Style minimaliste et sobre"
        },
        output_structure: {
            slide_markdown: "Contenu Slidev complet",
            slides_structure: "Structure détaillée des slides",
            slides_count: "Nombre total de slides",
            preview_url: "URL de prévisualisation Slidev"
        }
    });
});

module.exports = router;