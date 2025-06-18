// src/apis/generate-slides.js
const express = require('express');
const axios = require('axios');
const { createSlidesPrompt } = require('../prompts/slides-generator');

const router = express.Router();

// Fonction pour appeler Ollama
async function callLlama(prompt, options = {}) {
    try {
        const response = await axios.post(`${process.env.OLLAMA_URL}/api/generate`, {
            model: process.env.LLAMA_MODEL,
            prompt: prompt,
            stream: false,
            options: {
                temperature: options.temperature || 0.7,
                top_p: options.top_p || 0.9,
                max_tokens: options.max_tokens || 2000
            }
        });

        return response.data.response;
    } catch (error) {
        console.error('Erreur Llama:', error.message);
        throw new Error('Erreur génération IA');
    }
}

// API POST /ai/generate-slides
router.post('/generate-slides', async (req, res) => {
    try {
        const {
            plan_id,
            outline,
            topic,
            type,
            level,
            duration_minutes
        } = req.body;

        // Validation
        if (!plan_id || !outline || !topic) {
            return res.status(400).json({
                error: 'Paramètres manquants: plan_id, outline, topic requis'
            });
        }

        console.log(`📊 Génération slides: ${topic} (${outline.length} sections)`);

        // Génération du markdown Slidev
        const slidesPrompt = createSlidesPrompt({
            topic,
            type,
            level,
            outline,
            duration_minutes
        });

        const slidesResponse = await callLlama(slidesPrompt, {
            temperature: 0.6,
            max_tokens: 2500
        });

        // Nettoyage et formatage du markdown
        let slideMarkdown = slidesResponse.trim();

        // S'assurer que le markdown commence bien par la config Slidev
        if (!slideMarkdown.includes('---\ntheme:')) {
            slideMarkdown = `---
theme: default
background: https://source.unsplash.com/1920x1080/?education,learning
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## ${topic}
  Formation micro-learning générée par EduPro AI
drawings:
  persist: false
transition: slide-left
title: ${topic}
---

${slideMarkdown}`;
        }

        // URL de prévisualisation (à implémenter avec Slidev)
        const previewUrl = `http://localhost:3030/slides/${plan_id}`;

        const result = {
            plan_id,
            topic,
            slide_markdown: slideMarkdown,
            preview_url: previewUrl,
            slides_count: outline.length + 2, // +2 pour titre et fin
            generated_at: new Date().toISOString(),
            status: 'completed'
        };

        console.log(`✅ Slides générées avec succès: ${outline.length + 2} slides`);
        res.json(result);

    } catch (error) {
        console.error('Erreur génération slides:', error);
        res.status(500).json({
            error: 'Erreur lors de la génération des slides',
            details: error.message
        });
    }
});

module.exports = router;