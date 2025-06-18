// src/apis/powerpoint-generator.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Dossier pour PowerPoint générés
const POWERPOINT_DIR = path.join(__dirname, '../../powerpoint-presentations');

async function ensurePowerPointDir() {
    try {
        await fs.access(POWERPOINT_DIR);
    } catch {
        await fs.mkdir(POWERPOINT_DIR, { recursive: true });
    }
}

// Thèmes design ultra-sophistiqués
const DESIGN_THEMES = {
    corporate_modern: {
        name: "Corporate Modern",
        primary_color: "#1E40AF",
        secondary_color: "#3B82F6",
        accent_color: "#EFF6FF",
        text_color: "#1F2937",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        font_family: "Segoe UI, Roboto, sans-serif"
    },
    tech_futuristic: {
        name: "Tech Futuristic",
        primary_color: "#0F172A",
        secondary_color: "#38BDF8",
        accent_color: "#1E293B",
        text_color: "#F8FAFC",
        background: "linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)",
        font_family: "Inter, system-ui, sans-serif"
    },
    elegant_minimal: {
        name: "Elegant Minimal",
        primary_color: "#374151",
        secondary_color: "#6B7280",
        accent_color: "#F9FAFB",
        text_color: "#111827",
        background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        font_family: "SF Pro Display, Helvetica, sans-serif"
    },
    creative_vibrant: {
        name: "Creative Vibrant",
        primary_color: "#7C3AED",
        secondary_color: "#EC4899",
        accent_color: "#FDF4FF",
        text_color: "#1F2937",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        font_family: "Montserrat, sans-serif"
    }
};

// Template PowerPoint HTML ultra-sophistiqué
function createPowerPointHTML(topic, type, outline, theme, options = {}) {
    const designTheme = DESIGN_THEMES[theme] || DESIGN_THEMES.corporate_modern;
    const isDark = theme === 'tech_futuristic';

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${topic} - EduPro AI</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${designTheme.font_family};
            background: ${designTheme.background};
            color: ${designTheme.text_color};
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
            max-width: 1200px;
            height: 80vh;
            background: ${isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
            backdrop-filter: blur(20px);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            display: none;
            padding: 60px;
            position: relative;
            overflow: hidden;
        }
        
        .slide.active {
            display: flex;
            flex-direction: column;
            animation: slideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        .slide::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, ${designTheme.primary_color}, ${designTheme.secondary_color});
            border-radius: 24px 24px 0 0;
        }
        
        .slide-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid ${designTheme.accent_color};
        }
        
        .slide-number {
            background: ${designTheme.primary_color};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }
        
        .slide-title {
            font-size: 3rem;
            font-weight: 700;
            background: linear-gradient(135deg, ${designTheme.primary_color}, ${designTheme.secondary_color});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 16px;
            line-height: 1.2;
        }
        
        .slide-subtitle {
            font-size: 1.5rem;
            color: ${designTheme.secondary_color};
            font-weight: 300;
            margin-bottom: 40px;
        }
        
        .slide-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            height: 100%;
        }
        
        .content-card {
            background: ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(255, 255, 255, 0.8)'};
            padding: 32px;
            border-radius: 16px;
            border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        }
        
        .content-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .step-item {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
            padding: 20px;
            background: ${designTheme.accent_color};
            border-radius: 12px;
            border-left: 4px solid ${designTheme.primary_color};
            transition: all 0.3s ease;
        }
        
        .step-item:hover {
            transform: translateX(8px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .step-number {
            width: 48px;
            height: 48px;
            background: ${designTheme.primary_color};
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
            margin-right: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .step-content h3 {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 8px;
            color: ${designTheme.text_color};
        }
        
        .step-content p {
            color: ${designTheme.secondary_color};
            line-height: 1.6;
            font-size: 1rem;
        }
        
        .navigation {
            position: fixed;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 16px;
            z-index: 1000;
        }
        
        .nav-button {
            background: ${designTheme.primary_color};
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .nav-button:hover {
            background: ${designTheme.secondary_color};
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        .nav-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            height: 4px;
            background: linear-gradient(90deg, ${designTheme.primary_color}, ${designTheme.secondary_color});
            transition: width 0.3s ease;
            z-index: 1001;
        }
        
        .floating-elements {
            position: absolute;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
        }
        
        .floating-circle {
            position: absolute;
            border-radius: 50%;
            background: linear-gradient(135deg, ${designTheme.primary_color}20, ${designTheme.secondary_color}20);
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .logo {
            position: absolute;
            top: 30px;
            right: 30px;
            background: ${designTheme.primary_color};
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .slide-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid ${designTheme.accent_color};
            font-size: 14px;
            color: ${designTheme.secondary_color};
        }
        
        @media (max-width: 768px) {
            .slide {
                width: 95vw;
                height: 90vh;
                padding: 30px;
            }
            
            .slide-title {
                font-size: 2rem;
            }
            
            .content-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="progress-bar" id="progressBar"></div>
    <div class="logo">EduPro AI</div>
    
    <div class="presentation-container">
        ${generateSlides(topic, type, outline, designTheme, isDark)}
        
        <div class="floating-elements">
            <div class="floating-circle" style="width: 100px; height: 100px; top: 10%; left: 10%; animation-delay: 0s;"></div>
            <div class="floating-circle" style="width: 60px; height: 60px; top: 70%; right: 15%; animation-delay: 2s;"></div>
            <div class="floating-circle" style="width: 80px; height: 80px; top: 30%; right: 10%; animation-delay: 4s;"></div>
        </div>
    </div>
    
    <div class="navigation">
        <button class="nav-button" id="prevBtn" onclick="previousSlide()">← Précédent</button>
        <button class="nav-button" id="nextBtn" onclick="nextSlide()">Suivant →</button>
    </div>
    
    <script>
        let currentSlide = 0;
        const totalSlides = ${outline.length + 2}; // +2 pour titre et conclusion
        
        function showSlide(index) {
            document.querySelectorAll('.slide').forEach(slide => slide.classList.remove('active'));
            document.querySelector(\`[data-slide="\${index}"]\`).classList.add('active');
            
            // Mise à jour barre de progression
            const progress = ((index + 1) / totalSlides) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
            
            // Mise à jour boutons navigation
            document.getElementById('prevBtn').disabled = index === 0;
            document.getElementById('nextBtn').disabled = index === totalSlides - 1;
        }
        
        function nextSlide() {
            if (currentSlide < totalSlides - 1) {
                currentSlide++;
                showSlide(currentSlide);
            }
        }
        
        function previousSlide() {
            if (currentSlide > 0) {
                currentSlide--;
                showSlide(currentSlide);
            }
        }
        
        // Navigation clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            if (e.key === 'ArrowLeft') previousSlide();
            if (e.key === 'Home') { currentSlide = 0; showSlide(currentSlide); }
            if (e.key === 'End') { currentSlide = totalSlides - 1; showSlide(currentSlide); }
        });
        
        // Initialisation
        showSlide(0);
        
        // Auto-play optionnel (décommenter si besoin)
        // setInterval(() => { if (currentSlide < totalSlides - 1) nextSlide(); }, 10000);
    </script>
</body>
</html>`;
}

// Fonction pour générer les slides
function generateSlides(topic, type, outline, theme, isDark) {
    let slides = '';

    // Slide titre
    slides += `
    <div class="slide active" data-slide="0">
        <div class="slide-content">
            <h1 class="slide-title">${getIcon(type)} ${topic}</h1>
            <p class="slide-subtitle">Formation micro-learning professionnelle</p>
            <div class="content-grid">
                <div class="content-card">
                    <h3 style="color: ${theme.primary_color}; margin-bottom: 20px;">📋 Aperçu de la formation</h3>
                    <p style="font-size: 1.1rem; line-height: 1.6;">
                        Formation ${type === 'demonstrative' ? 'pratique' : 'conceptuelle'} conçue pour vous rendre opérationnel rapidement.
                    </p>
                    <div style="margin-top: 24px; padding: 16px; background: ${theme.accent_color}; border-radius: 8px;">
                        <strong>⏱️ Durée totale:</strong> ${outline.reduce((sum, section) => sum + section.duration_seconds, 0) / 60} minutes
                    </div>
                </div>
                <div class="content-card">
                    <h3 style="color: ${theme.primary_color}; margin-bottom: 20px;">🎯 Objectifs</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: ${theme.secondary_color}; margin-right: 12px;">✓</span>
                            Maîtriser les concepts clés
                        </li>
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: ${theme.secondary_color}; margin-right: 12px;">✓</span>
                            Appliquer immédiatement
                        </li>
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: ${theme.secondary_color}; margin-right: 12px;">✓</span>
                            Gagner en efficacité
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="slide-footer">
            <span>Généré par EduPro AI</span>
            <span>Slide 1 / ${outline.length + 2}</span>
        </div>
    </div>
  `;

    // Slides contenu
    outline.forEach((section, index) => {
        slides += `
      <div class="slide" data-slide="${index + 1}">
          <div class="slide-header">
              <div class="slide-number">Étape ${index + 1}</div>
              <div style="text-align: right; color: ${theme.secondary_color};">
                  <div style="font-size: 14px;">⏱️ ${section.duration_seconds}s</div>
              </div>
          </div>
          <div class="slide-content">
              <h1 class="slide-title">${getIconForSection(section.title, type)} ${section.title}</h1>
              <div class="step-item">
                  <div class="step-number">${index + 1}</div>
                  <div class="step-content">
                      <h3>${section.title}</h3>
                      <p>${formatContentForHTML(section.content)}</p>
                  </div>
              </div>
              ${type === 'demonstrative' ? `
                  <div class="content-card" style="margin-top: 30px;">
                      <h3 style="color: ${theme.primary_color}; margin-bottom: 16px;">💡 Points clés à retenir</h3>
                      <ul style="list-style: none; padding: 0;">
                          <li style="margin-bottom: 8px; color: ${theme.text_color};">▶ Suivez chaque étape dans l'ordre</li>
                          <li style="margin-bottom: 8px; color: ${theme.text_color};">▶ Vérifiez le résultat à chaque action</li>
                          <li style="margin-bottom: 8px; color: ${theme.text_color};">▶ N'hésitez pas à répéter si nécessaire</li>
                      </ul>
                  </div>
              ` : `
                  <div class="content-card" style="margin-top: 30px;">
                      <h3 style="color: ${theme.primary_color}; margin-bottom: 16px;">🎯 Application pratique</h3>
                      <p style="color: ${theme.text_color};">Réfléchissez à comment appliquer ce concept dans votre contexte professionnel quotidien.</p>
                  </div>
              `}
          </div>
          <div class="slide-footer">
              <span>EduPro AI • Formation ${type}</span>
              <span>Slide ${index + 2} / ${outline.length + 2}</span>
          </div>
      </div>
    `;
    });

    // Slide conclusion
    slides += `
    <div class="slide" data-slide="${outline.length + 1}">
        <div class="slide-content">
            <h1 class="slide-title">🎉 Formation terminée !</h1>
            <p class="slide-subtitle">Félicitations ! Vous maîtrisez maintenant ${topic}</p>
            <div class="content-grid">
                <div class="content-card">
                    <h3 style="color: ${theme.primary_color}; margin-bottom: 20px;">📚 Prochaines étapes</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: ${theme.secondary_color}; margin-right: 12px;">→</span>
                            Pratiquer sur vos propres données
                        </li>
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: ${theme.secondary_color}; margin-right: 12px;">→</span>
                            Explorer les fonctionnalités avancées
                        </li>
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: ${theme.secondary_color}; margin-right: 12px;">→</span>
                            Partager avec votre équipe
                        </li>
                    </ul>
                </div>
                <div class="content-card">
                    <h3 style="color: ${theme.primary_color}; margin-bottom: 20px;">🎯 Ressources</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: ${theme.secondary_color}; margin-right: 12px;">📖</span>
                            Documentation officielle
                        </li>
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: ${theme.secondary_color}; margin-right: 12px;">👥</span>
                            Communauté EduPro
                        </li>
                        <li style="margin-bottom: 12px; display: flex; align-items: center;">
                            <span style="color: ${theme.secondary_color}; margin-right: 12px;">🆘</span>
                            Support technique
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="slide-footer">
            <span>Merci ! • EduPro AI</span>
            <span>Slide ${outline.length + 2} / ${outline.length + 2}</span>
        </div>
    </div>
  `;

    return slides;
}

// Fonctions utilitaires
function getIcon(type) {
    return type === 'demonstrative' ? '💻' : '📚';
}

function getIconForSection(title, type) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('introduction')) return '🎯';
    if (titleLower.includes('sélection') || titleLower.includes('données')) return '📊';
    if (titleLower.includes('création') || titleLower.includes('créer')) return '⚙️';
    if (titleLower.includes('configuration') || titleLower.includes('champs')) return '🔧';
    if (titleLower.includes('conclusion')) return '✅';
    return type === 'demonstrative' ? '💻' : '📚';
}

function formatContentForHTML(content) {
    return content.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
}

// API POST /ai/generate-powerpoint
router.post('/generate-powerpoint', async (req, res) => {
    const startTime = Date.now();

    try {
        const {
            plan_id,
            topic,
            type = 'demonstrative',
            outline,
            theme = 'corporate_modern',
            options = {}
        } = req.body;

        if (!topic || !outline || !Array.isArray(outline)) {
            return res.status(400).json({
                error: 'Paramètres manquants: topic et outline requis',
                available_themes: Object.keys(DESIGN_THEMES),
                example: {
                    topic: 'Excel TCD',
                    type: 'demonstrative',
                    theme: 'corporate_modern',
                    outline: [
                        { title: 'Introduction', content: '...', duration_seconds: 30 }
                    ]
                }
            });
        }

        await ensurePowerPointDir();

        console.log(`🎨 Génération PowerPoint: ${topic} (thème: ${theme})`);

        const presentationId = plan_id || uuidv4();
        const htmlContent = createPowerPointHTML(topic, type, outline, theme, options);

        // Créer le dossier de présentation
        const presentationDir = path.join(POWERPOINT_DIR, presentationId);
        await fs.mkdir(presentationDir, { recursive: true });

        // Écrire le fichier HTML
        const htmlPath = path.join(presentationDir, 'presentation.html');
        await fs.writeFile(htmlPath, htmlContent, 'utf8');

        // Créer fichier CSS séparé pour customisation
        const customCSS = `
/* Customisations additionnelles */
.slide.custom-animation {
    animation: customSlideIn 1s ease-out;
}

@keyframes customSlideIn {
    from { opacity: 0; transform: scale(0.9) rotateY(-10deg); }
    to { opacity: 1; transform: scale(1) rotateY(0deg); }
}

/* Responsive amélioré */
@media (max-width: 480px) {
    .slide-title { font-size: 1.5rem !important; }
    .content-grid { grid-template-columns: 1fr !important; }
}
`;

        await fs.writeFile(
            path.join(presentationDir, 'custom.css'),
            customCSS,
            'utf8'
        );

        const totalTime = Date.now() - startTime;

        const result = {
            presentation_id: presentationId,
            topic,
            type,
            theme: theme,
            theme_name: DESIGN_THEMES[theme]?.name || 'Unknown',
            slides_count: outline.length + 2,
            presentation_path: presentationDir,
            html_file: htmlPath,
            preview_url: `file://${htmlPath}`,
            web_url: `http://localhost:3001/powerpoint/${presentationId}`,
            features: {
                responsive_design: true,
                keyboard_navigation: true,
                progress_bar: true,
                floating_animations: true,
                gradient_backgrounds: true,
                glass_morphism: true
            },
            available_themes: Object.keys(DESIGN_THEMES),
            generation_time_ms: totalTime,
            generated_at: new Date().toISOString(),
            status: 'completed'
        };

        console.log(`✅ PowerPoint généré: ${outline.length + 2} slides en ${totalTime}ms`);
        res.json(result);

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`❌ Erreur génération PowerPoint après ${totalTime}ms:`, error);
        res.status(500).json({
            error: 'Erreur génération PowerPoint',
            generation_time_ms: totalTime,
            details: error.message
        });
    }
});

// API GET /powerpoint/:id - Servir la présentation
router.get('/powerpoint/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const presentationPath = path.join(POWERPOINT_DIR, id, 'presentation.html');

        // Vérifier que le fichier existe
        await fs.access(presentationPath);

        // Servir le fichier HTML
        const htmlContent = await fs.readFile(presentationPath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);

    } catch (error) {
        res.status(404).json({
            error: 'Présentation PowerPoint non trouvée',
            presentation_id: req.params.id
        });
    }
});

// API GET /powerpoint/:id/download - Télécharger la présentation
router.get('/powerpoint/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        const presentationPath = path.join(POWERPOINT_DIR, id, 'presentation.html');

        await fs.access(presentationPath);

        res.setHeader('Content-Disposition', `attachment; filename="presentation-${id}.html"`);
        res.setHeader('Content-Type', 'text/html');

        const htmlContent = await fs.readFile(presentationPath, 'utf8');
        res.send(htmlContent);

    } catch (error) {
        res.status(404).json({
            error: 'Présentation non trouvée pour téléchargement'
        });
    }
});

// API GET /powerpoint/themes - Lister les thèmes disponibles
router.get('/powerpoint/themes', (req, res) => {
    const themes = Object.entries(DESIGN_THEMES).map(([key, theme]) => ({
        theme_id: key,
        name: theme.name,
        primary_color: theme.primary_color,
        secondary_color: theme.secondary_color,
        background: theme.background,
        font_family: theme.font_family,
        preview_url: `http://localhost:3001/powerpoint/preview-theme/${key}`
    }));

    res.json({
        available_themes: themes,
        total_count: themes.length,
        default_theme: 'corporate_modern'
    });
});

// API POST /ai/generate-powerpoint-advanced - Version avec options avancées
router.post('/generate-powerpoint-advanced', async (req, res) => {
    const startTime = Date.now();

    try {
        const {
            plan_id,
            topic,
            type = 'demonstrative',
            outline,
            theme = 'corporate_modern',
            advanced_options = {}
        } = req.body;

        // Options avancées
        const {
            auto_progress = false,
            progress_speed = 10000,
            enable_sound = false,
            custom_colors = {},
            animation_style = 'slide',
            include_qr_code = false
        } = advanced_options;

        if (!topic || !outline) {
            return res.status(400).json({
                error: 'Paramètres manquants',
                required: ['topic', 'outline'],
                optional_advanced: [
                    'auto_progress', 'progress_speed', 'enable_sound',
                    'custom_colors', 'animation_style', 'include_qr_code'
                ]
            });
        }

        await ensurePowerPointDir();

        console.log(`🎨 Génération PowerPoint avancé: ${topic} (${animation_style})`);

        const presentationId = plan_id || uuidv4();

        // Appliquer couleurs personnalisées si fournies
        let selectedTheme = { ...DESIGN_THEMES[theme] };
        if (custom_colors.primary_color) selectedTheme.primary_color = custom_colors.primary_color;
        if (custom_colors.secondary_color) selectedTheme.secondary_color = custom_colors.secondary_color;

        const htmlContent = createPowerPointHTML(topic, type, outline, selectedTheme, {
            auto_progress,
            progress_speed,
            animation_style,
            include_qr_code
        });

        const presentationDir = path.join(POWERPOINT_DIR, presentationId);
        await fs.mkdir(presentationDir, { recursive: true });

        const htmlPath = path.join(presentationDir, 'presentation.html');
        await fs.writeFile(htmlPath, htmlContent, 'utf8');

        const totalTime = Date.now() - startTime;

        const result = {
            presentation_id: presentationId,
            topic,
            theme: theme,
            advanced_features: {
                auto_progress,
                progress_speed: `${progress_speed}ms`,
                animation_style,
                custom_colors: Object.keys(custom_colors).length > 0,
                include_qr_code
            },
            slides_count: outline.length + 2,
            web_url: `http://localhost:3001/powerpoint/${presentationId}`,
            download_url: `http://localhost:3001/powerpoint/${presentationId}/download`,
            generation_time_ms: totalTime,
            status: 'completed'
        };

        console.log(`✅ PowerPoint avancé généré en ${totalTime}ms`);
        res.json(result);

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`❌ Erreur PowerPoint avancé:`, error);
        res.status(500).json({
            error: 'Erreur génération PowerPoint avancé',
            generation_time_ms: totalTime,
            details: error.message
        });
    }
});

module.exports = router;

/*
TESTS API POWERPOINT:

1. Test basique:
POST http://localhost:3001/ai/generate-powerpoint
{
  "topic": "Créer un tableau croisé dynamique Excel",
  "type": "demonstrative",
  "theme": "corporate_modern",
  "outline": [
    {
      "title": "Introduction",
      "content": "Découvrez les TCD Excel",
      "duration_seconds": 30
    },
    {
      "title": "Sélection données",
      "content": "Étapes:\n\t- Clic A1\n\t- Ctrl+Shift+Fin",
      "duration_seconds": 90
    }
  ]
}

2. Test thèmes disponibles:
GET http://localhost:3001/powerpoint/themes

3. Test version avancée:
POST http://localhost:3001/ai/generate-powerpoint-advanced
{
  "topic": "Formation PowerBI",
  "type": "demonstrative", 
  "theme": "tech_futuristic",
  "outline": [...],
  "advanced_options": {
    "auto_progress": true,
    "progress_speed": 8000,
    "animation_style": "fade",
    "custom_colors": {
      "primary_color": "#FF6B6B",
      "secondary_color": "#4ECDC4"
    }
  }
}

4. Voir présentation:
GET http://localhost:3001/powerpoint/{presentation_id}

RÉSULTAT:
- Présentation HTML ultra-sophistiquée
- Design glassmorphism moderne
- Animations fluides
- Navigation clavier
- Responsive mobile
- 4 thèmes design professionnels
*/