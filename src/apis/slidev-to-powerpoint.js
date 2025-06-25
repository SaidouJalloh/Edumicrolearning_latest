// src/apis/slidev-to-powerpoint.js - Convertit Slidev markdown en PowerPoint sophistiqué
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Cache pour les conversions
const conversionCache = new Map();

// Fonction pour parser le markdown Slidev
function parseSlidevMarkdown(markdownContent) {
    const slides = [];

    // Séparer les slides par "---"
    const slideBlocks = markdownContent.split(/^---$/gm);

    slideBlocks.forEach((block, index) => {
        if (block.trim()) {
            const slide = parseSingleSlide(block.trim(), index);
            if (slide) slides.push(slide);
        }
    });

    return slides;
}

// Parser une slide individuelle
function parseSingleSlide(slideContent, slideIndex) {
    const lines = slideContent.split('\n');
    const slide = {
        slide_number: slideIndex + 1,
        layout: 'default',
        background: null,
        title: '',
        content: [],
        notes: '',
        metadata: {}
    };

    let inComments = false;
    let inMetadata = true;
    let comments = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Métadonnées du slide (au début)
        if (inMetadata && line.includes(':') && !line.startsWith('#')) {
            const [key, value] = line.split(':').map(s => s.trim());
            slide.metadata[key] = value;

            // Layout spécifique
            if (key === 'layout') slide.layout = value;
            if (key === 'background') slide.background = value;
            if (key === 'class') slide.cssClass = value;
            continue;
        }

        // Fin des métadonnées quand on trouve du contenu
        if (line.startsWith('#') || line.startsWith('-') || line.startsWith('<')) {
            inMetadata = false;
        }

        // Commentaires (notes du présentateur)
        if (line.startsWith('<!--')) {
            inComments = true;
            comments.push(line.replace('<!--', '').trim());
            continue;
        }

        if (line.endsWith('-->')) {
            inComments = false;
            comments.push(line.replace('-->', '').trim());
            slide.notes = comments.join(' ').trim();
            continue;
        }

        if (inComments) {
            comments.push(line);
            continue;
        }

        // Titre principal
        if (line.startsWith('# ') && !slide.title) {
            slide.title = line.substring(2).trim();
            continue;
        }

        // Sous-titre
        if (line.startsWith('## ')) {
            slide.subtitle = line.substring(3).trim();
            continue;
        }

        // Contenu (bullets, paragraphes, etc.)
        if (line.startsWith('- ')) {
            slide.content.push({
                type: 'bullet',
                text: line.substring(2).trim()
            });
        } else if (line.startsWith('<div')) {
            // Éléments HTML spéciaux
            slide.content.push({
                type: 'html',
                content: line
            });
        } else if (line && !inMetadata) {
            // Paragraphe normal
            slide.content.push({
                type: 'paragraph',
                text: line
            });
        }
    }

    return slide;
}

// Générateur PowerPoint sophistiqué
function generateSophisticatedPowerPoint(slides, options = {}) {
    const {
        theme = 'corporate_modern',
        colorScheme = 'blue_professional',
        includeAnimations = true,
        includeCharts = false,
        fontFamily = 'Segoe UI, Arial, sans-serif'
    } = options;

    const presentationId = uuidv4();

    // CSS sophistiqué
    const sophisticatedCSS = `
/* PowerPoint Sophistiqué - Thème ${theme} */
:root {
    --primary-color: #1e3a8a;
    --secondary-color: #3b82f6;
    --accent-color: #fbbf24;
    --text-dark: #1f2937;
    --text-light: #6b7280;
    --bg-light: #f8fafc;
    --bg-dark: #0f172a;
    --shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${fontFamily};
    background: linear-gradient(135deg, var(--bg-light) 0%, #e2e8f0 100%);
    overflow: hidden;
    height: 100vh;
}

.presentation-container {
    width: 100vw;
    height: 100vh;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.slide {
    width: 90vw;
    height: 90vh;
    max-width: 1200px;
    max-height: 675px;
    background: white;
    border-radius: 20px;
    box-shadow: var(--shadow);
    padding: 60px;
    display: none;
    position: relative;
    overflow: hidden;
}

.slide.active {
    display: flex;
    flex-direction: column;
    animation: ${includeAnimations ? 'slideIn 0.8s ease-out' : 'none'};
}

.slide::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--accent-color));
}

/* Layouts spécifiques */
.slide.title-slide {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    text-align: center;
    justify-content: center;
}

.slide.center {
    text-align: center;
    justify-content: center;
}

.slide.end {
    background: linear-gradient(135deg, var(--accent-color) 0%, #f59e0b 100%);
    color: white;
    text-align: center;
    justify-content: center;
}

/* Typographie sophistiquée */
.slide h1 {
    font-size: 3.5rem;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 30px;
    line-height: 1.2;
    ${includeAnimations ? 'animation: fadeInUp 1s ease-out 0.3s both;' : ''}
}

.slide.title-slide h1,
.slide.end h1 {
    color: white;
    font-size: 4rem;
}

.slide h2 {
    font-size: 1.8rem;
    color: var(--secondary-color);
    margin-bottom: 20px;
    font-weight: 400;
    ${includeAnimations ? 'animation: fadeInUp 1s ease-out 0.5s both;' : ''}
}

.slide h3 {
    font-size: 1.4rem;
    color: var(--text-dark);
    margin-bottom: 15px;
    font-weight: 600;
}

/* Contenu sophistiqué */
.content {
    flex: 1;
    ${includeAnimations ? 'animation: fadeInUp 1s ease-out 0.7s both;' : ''}
}

.bullet-point {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
    font-size: 1.2rem;
    line-height: 1.6;
    ${includeAnimations ? 'animation: slideInLeft 0.8s ease-out both;' : ''}
}

.bullet-point:nth-child(1) { animation-delay: 0.9s; }
.bullet-point:nth-child(2) { animation-delay: 1.1s; }
.bullet-point:nth-child(3) { animation-delay: 1.3s; }
.bullet-point:nth-child(4) { animation-delay: 1.5s; }

.bullet-icon {
    width: 12px;
    height: 12px;
    background: var(--secondary-color);
    border-radius: 50%;
    margin-right: 20px;
    margin-top: 8px;
    flex-shrink: 0;
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.tip-box {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-left: 5px solid var(--secondary-color);
    padding: 20px;
    margin: 30px 0;
    border-radius: 8px;
    font-size: 1rem;
    color: var(--text-light);
    ${includeAnimations ? 'animation: fadeInUp 1s ease-out 1.2s both;' : ''}
}

.tip-box::before {
    content: '💡';
    font-size: 1.5rem;
    margin-right: 10px;
}

/* Navigation sophistiquée */
.navigation {
    position: fixed;
    bottom: 30px;
    right: 30px;
    display: flex;
    gap: 15px;
    z-index: 1000;
}

.nav-btn {
    width: 60px;
    height: 60px;
    border: none;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
    background: var(--secondary-color);
}

.nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

/* Indicateur de progression */
.progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    background: var(--secondary-color);
    z-index: 1000;
    transition: width 0.3s ease;
}

/* Numéro de slide */
.slide-number {
    position: absolute;
    bottom: 20px;
    right: 20px;
    font-size: 0.9rem;
    color: var(--text-light);
    background: rgba(255, 255, 255, 0.8);
    padding: 8px 12px;
    border-radius: 20px;
    backdrop-filter: blur(10px);
}

/* Animations sophistiquées */
${includeAnimations ? `
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(100px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(40px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
` : ''}

/* Responsive */
@media (max-width: 768px) {
    .slide {
        width: 95vw;
        height: 95vh;
        padding: 30px;
    }
    
    .slide h1 {
        font-size: 2.5rem;
    }
    
    .navigation {
        bottom: 15px;
        right: 15px;
    }
}
`;

    // HTML sophistiqué
    const sophisticatedHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Présentation PowerPoint - ${slides[0]?.title || 'EduPro AI'}</title>
    <style>${sophisticatedCSS}</style>
</head>
<body>
    <div class="presentation-container">
        <!-- Barre de progression -->
        <div class="progress-bar" id="progressBar"></div>
        
        ${slides.map((slide, index) => `
        <div class="slide ${slide.layout === 'center' ? 'center' : ''} ${slide.layout === 'end' ? 'end' : ''} ${index === 0 ? 'title-slide active' : ''}" data-slide="${index}">
            ${slide.title ? `<h1>${slide.title}</h1>` : ''}
            ${slide.subtitle ? `<h2>${slide.subtitle}</h2>` : ''}
            
            <div class="content">
                ${slide.content.map(item => {
        if (item.type === 'bullet') {
            return `
                        <div class="bullet-point">
                            <div class="bullet-icon"></div>
                            <div>${item.text}</div>
                        </div>`;
        } else if (item.type === 'paragraph') {
            return `<p style="margin-bottom: 15px; font-size: 1.1rem; line-height: 1.6;">${item.text}</p>`;
        } else if (item.type === 'html' && item.content.includes('💡')) {
            return `<div class="tip-box">${item.content.replace(/<[^>]*>/g, '')}</div>`;
        }
        return '';
    }).join('')}
            </div>
            
            <div class="slide-number">${index + 1} / ${slides.length}</div>
            
            ${slide.notes ? `
            <div style="display: none;" class="speaker-notes">
                <strong>Notes du présentateur:</strong><br>
                ${slide.notes}
            </div>` : ''}
        </div>
        `).join('')}
        
        <!-- Navigation -->
        <div class="navigation">
            <button class="nav-btn" id="prevBtn" onclick="previousSlide()">‹</button>
            <button class="nav-btn" id="nextBtn" onclick="nextSlide()">›</button>
        </div>
    </div>
    
    <script>
        let currentSlide = 0;
        const totalSlides = ${slides.length};
        
        function showSlide(n) {
            const slides = document.querySelectorAll('.slide');
            const progressBar = document.getElementById('progressBar');
            
            slides.forEach(slide => slide.classList.remove('active'));
            
            if (n >= totalSlides) currentSlide = 0;
            if (n < 0) currentSlide = totalSlides - 1;
            
            slides[currentSlide].classList.add('active');
            
            // Mise à jour barre de progression
            const progress = ((currentSlide + 1) / totalSlides) * 100;
            progressBar.style.width = progress + '%';
            
            // Mise à jour boutons
            document.getElementById('prevBtn').disabled = currentSlide === 0;
            document.getElementById('nextBtn').disabled = currentSlide === totalSlides - 1;
        }
        
        function nextSlide() {
            currentSlide++;
            showSlide(currentSlide);
        }
        
        function previousSlide() {
            currentSlide--;
            showSlide(currentSlide);
        }
        
        // Navigation clavier
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            if (e.key === 'ArrowLeft') previousSlide();
            if (e.key === 'Home') { currentSlide = 0; showSlide(0); }
            if (e.key === 'End') { currentSlide = totalSlides - 1; showSlide(totalSlides - 1); }
        });
        
        // Auto-play (optionnel)
        function startAutoPlay(intervalSeconds = 10) {
            setInterval(() => {
                if (currentSlide < totalSlides - 1) {
                    nextSlide();
                }
            }, intervalSeconds * 1000);
        }
        
        // Initialisation
        showSlide(0);
        
        // Mode plein écran
        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
        
        // Double-clic pour plein écran
        document.addEventListener('dblclick', toggleFullscreen);
        
        console.log('📊 Présentation PowerPoint sophistiquée chargée !');
        console.log('🎯 Navigation: Flèches, Espace, Home, End');
        console.log('🖥️ Double-clic pour plein écran');
    </script>
</body>
</html>
`;

    return {
        presentation_id: presentationId,
        html_content: sophisticatedHTML,
        slides_count: slides.length,
        features: [
            'Navigation clavier et boutons',
            'Barre de progression',
            'Animations CSS sophistiquées',
            'Design corporate moderne',
            'Mode plein écran',
            'Notes du présentateur intégrées',
            'Responsive design',
            'Transitions fluides'
        ]
    };
}

// API POST /ai/slidev-to-powerpoint
router.post('/slidev-to-powerpoint', async (req, res) => {
    const startTime = Date.now();

    try {
        const {
            slide_markdown,
            powerpoint_options = {},
            include_speaker_notes = true
        } = req.body;

        // Validation
        if (!slide_markdown || typeof slide_markdown !== 'string') {
            return res.status(400).json({
                error: 'Le champ "slide_markdown" est obligatoire',
                expected_format: {
                    slide_markdown: "string (markdown Slidev complet)",
                    powerpoint_options: {
                        theme: "corporate_modern|academic|minimal",
                        color_scheme: "blue_professional|green_nature|purple_creative",
                        include_animations: "boolean",
                        font_family: "string"
                    }
                }
            });
        }

        // Cache check
        const cacheKey = `ppt-${slide_markdown.substring(0, 100).replace(/[^a-zA-Z0-9]/g, '')}`;
        if (conversionCache.has(cacheKey)) {
            console.log('💨 PowerPoint depuis cache');
            const cached = conversionCache.get(cacheKey);
            cached.cached = true;
            cached.generation_time_ms = 0;
            return res.json(cached);
        }

        console.log('🎬 Conversion Slidev → PowerPoint sophistiqué...');

        // Parser le markdown Slidev
        const slides = parseSlidevMarkdown(slide_markdown);
        console.log(`📊 ${slides.length} slides parsées depuis le markdown`);

        // Générer PowerPoint sophistiqué
        const powerpoint = generateSophisticatedPowerPoint(slides, powerpoint_options);

        const totalTime = Date.now() - startTime;

        const result = {
            conversion_id: powerpoint.presentation_id,
            source_format: 'slidev_markdown',
            target_format: 'html_powerpoint',

            // Contenu PowerPoint
            html_powerpoint: powerpoint.html_content,
            slides_parsed: slides.length,

            // Métadonnées
            features: powerpoint.features,
            theme_applied: powerpoint_options.theme || 'corporate_modern',
            animations_enabled: powerpoint_options.include_animations !== false,

            // Performance
            parsing_time_ms: totalTime,
            cached: false,
            generated_at: new Date().toISOString(),
            status: 'completed'
        };

        // Cache 30 min
        conversionCache.set(cacheKey, result);
        setTimeout(() => conversionCache.delete(cacheKey), 1800000);

        console.log(`✅ PowerPoint sophistiqué généré: ${slides.length} slides en ${totalTime}ms`);
        res.json(result);

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error('❌ Erreur conversion Slidev → PowerPoint:', error);
        res.status(500).json({
            error: 'Erreur lors de la conversion',
            details: error.message,
            processing_time_ms: totalTime
        });
    }
});

// API GET info sur la conversion
router.get('/slidev-to-powerpoint/info', (req, res) => {
    res.json({
        endpoint: "POST /ai/slidev-to-powerpoint",
        description: "Convertit markdown Slidev en présentation PowerPoint HTML sophistiquée",
        input: "Markdown Slidev depuis /ai/generate-slides",
        output: "HTML PowerPoint prêt à présenter",
        features: [
            "🎨 Design corporate sophistiqué",
            "✨ Animations CSS avancées",
            "🖱️ Navigation intuitive",
            "📊 Barre de progression",
            "🖥️ Mode plein écran",
            "⌨️ Contrôles clavier",
            "📱 Design responsive",
            "🗣️ Notes présentateur intégrées"
        ],
        themes_available: [
            "corporate_modern",
            "academic_professional",
            "creative_minimal",
            "tech_dark"
        ],
        workflow: "generate-script → generate-slides → slidev-to-powerpoint"
    });
});

module.exports = router;