// src/apis/slidev-generator.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Dossier pour stocker les présentations Slidev
const SLIDEV_DIR = path.join(__dirname, '../../slidev-presentations');

// S'assurer que le dossier existe
async function ensureSlidevDir() {
    try {
        await fs.access(SLIDEV_DIR);
    } catch {
        await fs.mkdir(SLIDEV_DIR, { recursive: true });
    }
}

// Template Slidev amélioré
function createSlidevTemplate(topic, type, outline) {
    const themeColor = type === 'demonstrative' ? 'blue' : 'green';
    const bgImage = type === 'demonstrative' ? 'computer,software' : 'education,learning';

    return `---
theme: default
background: https://source.unsplash.com/1920x1080/?${bgImage}
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## ${topic}
  Formation micro-learning générée par EduPro AI
  Type: ${type}
drawings:
  persist: false
transition: slide-left
title: ${topic}
colorSchema: auto
---

# 🎯 ${topic}

Formation micro-learning EduPro

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    Commencer la formation <carbon:arrow-right class="inline"/>
  </span>
</div>

---

# 📋 Programme de la formation

<div class="grid grid-cols-1 gap-4 mt-8">

${outline.map((section, index) => `
<div class="flex items-center space-x-4 p-4 bg-${themeColor}-50 rounded-lg border border-${themeColor}-200">
  <div class="w-8 h-8 bg-${themeColor}-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
    ${index + 1}
  </div>
  <div class="flex-1">
    <h3 class="font-semibold text-${themeColor}-900">${section.title}</h3>
    <p class="text-sm text-${themeColor}-700">${section.duration_seconds}s</p>
  </div>
</div>
`).join('')}

</div>

---

${outline.map((section, index) => {
        const sectionNumber = index + 1;
        const icon = getIconForSection(section.title, type);

        return `
# ${icon} ${section.title}

<div class="mt-8">
  <div class="bg-gray-50 p-6 rounded-lg border-l-4 border-${themeColor}-500">
    ${formatSectionContent(section.content, type)}
  </div>
</div>

<div class="absolute bottom-4 right-4 text-sm text-gray-500">
  Étape ${sectionNumber}/${outline.length} • ${section.duration_seconds}s
</div>

${index < outline.length - 1 ? '---' : ''}`;
    }).join('')}

---

# ✅ Formation terminée !

<div class="text-center mt-12">
  <div class="text-6xl mb-6">🎉</div>
  <h2 class="text-2xl font-bold text-green-600 mb-4">Félicitations !</h2>
  <p class="text-lg text-gray-700 mb-8">Vous maîtrisez maintenant : <strong>${topic}</strong></p>
</div>

<div class="grid grid-cols-2 gap-8 mt-8">
  <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
    <h3 class="font-semibold text-blue-900 mb-2">📚 Prochaines étapes</h3>
    <ul class="text-sm text-blue-800">
      <li>• Pratiquer sur vos propres données</li>
      <li>• Explorer les fonctionnalités avancées</li>
      <li>• Partager vos créations avec l'équipe</li>
    </ul>
  </div>
  
  <div class="bg-green-50 p-4 rounded-lg border border-green-200">
    <h3 class="font-semibold text-green-900 mb-2">🎯 Ressources utiles</h3>
    <ul class="text-sm text-green-800">
      <li>• Documentation officielle</li>
      <li>• Communauté EduPro</li>
      <li>• Support technique</li>
    </ul>
  </div>
</div>

---

<div class="text-center py-12">
  <h1 class="text-3xl font-bold text-gray-800 mb-4">Merci !</h1>
  <p class="text-xl text-gray-600">Formation générée par EduPro AI</p>
  <div class="mt-8 text-sm text-gray-500">
    Slides créées automatiquement • Powered by Slidev
  </div>
</div>
`;
}

// Fonction pour obtenir l'icône selon le titre de section
function getIconForSection(title, type) {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('introduction')) return '🎯';
    if (titleLower.includes('création') || titleLower.includes('créer')) return '⚙️';
    if (titleLower.includes('champ') || titleLower.includes('configuration')) return '📊';
    if (titleLower.includes('conclusion') || titleLower.includes('final')) return '✅';
    if (titleLower.includes('validation') || titleLower.includes('test')) return '🔍';

    return type === 'demonstrative' ? '💻' : '📚';
}

// Fonction pour formater le contenu de section
function formatSectionContent(content, type) {
    // Détecter les listes dans le contenu
    if (content.includes('\n\t-') || content.includes('1.') || content.includes('•')) {
        // Formater comme liste
        const lines = content.split('\n');
        let formattedContent = '';

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('- ') || trimmed.startsWith('\t-')) {
                formattedContent += `<li class="mb-2">${trimmed.replace(/^[\t\-\s]+/, '')}</li>\n`;
            } else if (trimmed.match(/^\d+\./)) {
                formattedContent += `<li class="mb-2">${trimmed.replace(/^\d+\.\s*/, '')}</li>\n`;
            } else if (trimmed) {
                formattedContent += `<p class="mb-4">${trimmed}</p>\n`;
            }
        });

        if (formattedContent.includes('<li>')) {
            return `<ul class="list-disc list-inside space-y-2">\n${formattedContent}</ul>`;
        }
        return formattedContent;
    } else {
        // Formater comme paragraphe simple
        return `<p class="text-lg leading-relaxed">${content}</p>`;
    }
}

// API POST /ai/generate-slidev - Créer présentation Slidev complète
router.post('/generate-slidev', async (req, res) => {
    const startTime = Date.now();

    try {
        const {
            plan_id,
            topic,
            type = 'demonstrative',
            outline,
            auto_build = false
        } = req.body;

        if (!topic || !outline || !Array.isArray(outline)) {
            return res.status(400).json({
                error: 'Paramètres manquants: topic et outline requis',
                example: {
                    topic: 'Excel TCD',
                    type: 'demonstrative',
                    outline: [
                        { title: 'Introduction', content: '...', duration_seconds: 30 }
                    ]
                }
            });
        }

        await ensureSlidevDir();

        console.log(`🎨 Génération Slidev: ${topic} (${outline.length} sections)`);

        const slidevId = plan_id || uuidv4();
        const slidesContent = createSlidevTemplate(topic, type, outline);

        // Créer le dossier de présentation
        const presentationDir = path.join(SLIDEV_DIR, slidevId);
        await fs.mkdir(presentationDir, { recursive: true });

        // Écrire le fichier slides.md
        const slidesPath = path.join(presentationDir, 'slides.md');
        await fs.writeFile(slidesPath, slidesContent, 'utf8');

        // Créer package.json pour Slidev
        const packageJson = {
            name: `edupro-slides-${slidevId}`,
            version: '1.0.0',
            scripts: {
                dev: 'slidev slides.md',
                build: 'slidev build slides.md',
                export: 'slidev export slides.md'
            },
            dependencies: {
                '@slidev/cli': '^0.48.0',
                '@slidev/theme-default': '^0.21.0'
            }
        };

        await fs.writeFile(
            path.join(presentationDir, 'package.json'),
            JSON.stringify(packageJson, null, 2),
            'utf8'
        );

        let buildResult = null;

        // Build automatique si demandé
        if (auto_build) {
            try {
                console.log(`🔨 Build Slidev en cours...`);

                // Installer les dépendances et builder
                execSync('npm install', { cwd: presentationDir, stdio: 'inherit' });
                execSync('npm run build', { cwd: presentationDir, stdio: 'inherit' });

                buildResult = {
                    dist_path: path.join(presentationDir, 'dist'),
                    build_status: 'success'
                };

                console.log(`✅ Build Slidev réussi`);
            } catch (buildError) {
                console.error(`❌ Erreur build Slidev:`, buildError.message);
                buildResult = {
                    build_status: 'failed',
                    error: buildError.message
                };
            }
        }

        const totalTime = Date.now() - startTime;

        const result = {
            slidev_id: slidevId,
            topic,
            type,
            slides_count: outline.length + 3, // +3 pour titre, programme, conclusion
            presentation_path: presentationDir,
            slides_file: slidesPath,
            markdown_content: slidesContent,
            dev_url: `http://localhost:3030/slides/${slidevId}`,
            commands: {
                dev: `cd ${presentationDir} && npm run dev`,
                build: `cd ${presentationDir} && npm run build`,
                export: `cd ${presentationDir} && npm run export`
            },
            build_result: buildResult,
            generation_time_ms: totalTime,
            generated_at: new Date().toISOString(),
            status: 'completed'
        };

        console.log(`✅ Slidev généré: ${outline.length + 3} slides en ${totalTime}ms`);
        res.json(result);

    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`❌ Erreur génération Slidev après ${totalTime}ms:`, error);
        res.status(500).json({
            error: 'Erreur génération Slidev',
            generation_time_ms: totalTime,
            details: error.message
        });
    }
});

// API GET /ai/slidev/:id/preview - Prévisualiser une présentation
router.get('/slidev/:id/preview', async (req, res) => {
    try {
        const { id } = req.params;
        const presentationDir = path.join(SLIDEV_DIR, id);
        const slidesPath = path.join(presentationDir, 'slides.md');

        // Vérifier que le fichier existe
        await fs.access(slidesPath);

        // Lire le contenu
        const content = await fs.readFile(slidesPath, 'utf8');

        res.json({
            slidev_id: id,
            markdown_content: content,
            preview_available: true,
            dev_command: `cd ${presentationDir} && npm run dev`
        });

    } catch (error) {
        res.status(404).json({
            error: 'Présentation Slidev non trouvée',
            slidev_id: req.params.id
        });
    }
});

// API GET /ai/slidev/list - Lister toutes les présentations
router.get('/slidev/list', async (req, res) => {
    try {
        await ensureSlidevDir();
        const presentations = await fs.readdir(SLIDEV_DIR);

        const presentationsList = await Promise.all(
            presentations.map(async (dir) => {
                try {
                    const slidesPath = path.join(SLIDEV_DIR, dir, 'slides.md');
                    const stats = await fs.stat(slidesPath);

                    return {
                        slidev_id: dir,
                        created_at: stats.birthtime,
                        modified_at: stats.mtime,
                        path: path.join(SLIDEV_DIR, dir)
                    };
                } catch {
                    return null;
                }
            })
        );

        res.json({
            presentations: presentationsList.filter(p => p !== null),
            total_count: presentationsList.filter(p => p !== null).length
        });

    } catch (error) {
        res.status(500).json({
            error: 'Erreur listage présentations',
            details: error.message
        });
    }
});

module.exports = router;

// Instructions d'utilisation

/*
INSTALLATION SLIDEV:
npm install -g @slidev/cli

TEST API:
POST http://localhost:3001/ai/generate-slidev
{
  "topic": "Créer un tableau croisé dynamique Excel",
  "type": "demonstrative",
  "outline": [
    {
      "title": "Introduction", 
      "content": "Découvrez les TCD Excel pour analyser vos données rapidement",
      "duration_seconds": 30
    },
    {
      "title": "Sélection des données",
      "content": "Étapes:\n\t- Cliquez sur cellule A1\n\t- Utilisez Ctrl+Shift+Fin pour sélectionner\n\t- Vérifiez que les en-têtes sont inclus",
      "duration_seconds": 90
    }
  ],
  "auto_build": false
}

COMMANDES SLIDEV:
1. Après génération, aller dans le dossier: cd slidev-presentations/[uuid]
2. Installer dépendances: npm install  
3. Lancer dev: npm run dev
4. Builder: npm run build
5. Exporter PDF: npm run export

URL DEV: http://localhost:3030

FICHIERS GÉNÉRÉS:
- slides.md (contenu Slidev)
- package.json (config)
- dist/ (après build)
*/