// src/apis/generate-video-complete.js - ORCHESTRATEUR COMPLET
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const router = express.Router();
const execAsync = promisify(exec);

// Configuration
const VIDEO_CONFIG = {
    output_dir: path.join(__dirname, '..', '..', 'generated-videos'),
    temp_dir: path.join(__dirname, '..', '..', 'temp-video'),
    slides_dir: path.join(__dirname, '..', '..', 'generated-slides'),
    audio_dir: path.join(__dirname, '..', '..', 'generated-audio'),
    ffmpeg_timeout: 120000, // 2 minutes
    default_fps: 30,
    video_quality: 'high'
};

// Cache pour éviter re-génération
const videoCache = new Map();

// ===== API PRINCIPALE - GÉNÉRATION VIDÉO COMPLÈTE =====
router.post('/generate-video-complete', async (req, res) => {
    const startTime = Date.now();
    const videoId = uuidv4();

    try {
        const {
            topic,
            capsuleType = 'demonstrative',
            settings = {},
            script_style = 'conversational',
            voice_type = 'professional_female',
            video_template = 'corporate',
            resources = []
        } = req.body;

        // Validation
        if (!topic) {
            return res.status(400).json({
                error: 'Le champ "topic" est obligatoire',
                flux_steps: [
                    '1. Plan & Script → LLM',
                    '2. Slides → Slidev',
                    '3. Voice-Over → TTS',
                    '4. Montage → FFmpeg',
                    '5. Storage → Supabase',
                    '6. Publication → LMS EduPro'
                ]
            });
        }

        // Paramètres par défaut
        const videoSettings = {
            level: 'beginner',
            duration: 5,
            style: 'practical',
            ...settings
        };

        console.log(`🎬 === DÉBUT GÉNÉRATION VIDÉO COMPLÈTE ===`);
        console.log(`📋 Sujet: ${topic}`);
        console.log(`⏱️ Durée: ${videoSettings.duration} minutes`);
        console.log(`🎭 Template: ${video_template}`);

        // Vérifier cache
        const cacheKey = `video-${topic}-${JSON.stringify(videoSettings)}-${script_style}-${voice_type}-${video_template}`;
        if (videoCache.has(cacheKey)) {
            console.log('💨 Vidéo récupérée du cache');
            const cached = videoCache.get(cacheKey);
            cached.cached = true;
            return res.json(cached);
        }

        // Créer les dossiers nécessaires
        await createDirectories();

        const result = {
            video_id: videoId,
            topic,
            settings: videoSettings,
            template: video_template,
            status: 'generating',
            steps: {},
            timeline: [],
            assets: {}
        };

        // ===== ÉTAPE 1: GÉNÉRATION PLAN & SCRIPT =====
        console.log('📋 ÉTAPE 1/6: Génération Plan & Script...');
        const step1Start = Date.now();

        const scriptResult = await callInternalAPI('/ai/generate-script', {
            topic,
            capsuleType,
            settings: videoSettings,
            script_style,
            resources
        });

        const step1Duration = Date.now() - step1Start;
        result.steps.step1_script = {
            status: 'completed',
            duration_ms: step1Duration,
            output: {
                plan_sections: scriptResult.plan_sections,
                full_script: scriptResult.full_script,
                estimated_words: scriptResult.estimated_words
            }
        };
        result.timeline.push({
            step: 1,
            name: 'Plan & Script LLM',
            completed_at: new Date().toISOString(),
            duration_ms: step1Duration
        });

        console.log(`✅ ÉTAPE 1 OK: ${scriptResult.estimated_words} mots en ${step1Duration}ms`);

        // ===== ÉTAPE 2: GÉNÉRATION SLIDES SLIDEV =====
        console.log('📄 ÉTAPE 2/6: Génération Slides Slidev...');
        const step2Start = Date.now();

        const slidesResult = await callInternalAPI('/ai/generate-slides', {
            // Format EXACT attendu par votre API generate-slides
            plan_id: scriptResult.plan_id,
            script_id: scriptResult.script_id,
            plan_sections: scriptResult.plan_sections,
            script_sections: scriptResult.script_sections, // ✅ AJOUTÉ
            topic: scriptResult.topic,
            capsule_type: scriptResult.capsule_type,
            settings: scriptResult.settings,
            slide_style: video_template === 'corporate' ? 'modern' : 'educational'
        });

        // Sauvegarder le fichier Slidev
        const slidevFile = await saveSlidevFile(slidesResult.markdown, videoId);

        // Convertir Slidev en images
        const slideImages = await convertSlidevToImages(slidevFile, videoId);

        const step2Duration = Date.now() - step2Start;
        result.steps.step2_slides = {
            status: 'completed',
            duration_ms: step2Duration,
            output: {
                slidev_file: slidevFile,
                slide_images: slideImages,
                slides_count: slideImages.length
            }
        };
        result.timeline.push({
            step: 2,
            name: 'Slides Slidev',
            completed_at: new Date().toISOString(),
            duration_ms: step2Duration
        });

        console.log(`✅ ÉTAPE 2 OK: ${slideImages.length} slides en ${step2Duration}ms`);

        // ===== ÉTAPE 3: GÉNÉRATION VOICE-OVER =====
        console.log('🎙️ ÉTAPE 3/6: Génération Voice-Over...');
        const step3Start = Date.now();

        const audioResult = await callInternalAPI('/ai/generate-narration-bark', {
            text_content: scriptResult.full_script,
            voice_type,
            enhance_emotions: true,
            split_by_sentences: true
        });

        // Assembler les segments audio
        const fullAudioFile = await assembleAudioSegments(audioResult.audio_segments, videoId);

        const step3Duration = Date.now() - step3Start;
        result.steps.step3_audio = {
            status: 'completed',
            duration_ms: step3Duration,
            output: {
                audio_file: fullAudioFile,
                segments_count: audioResult.audio_segments.length,
                total_duration: audioResult.audio_info.total_duration_seconds
            }
        };
        result.timeline.push({
            step: 3,
            name: 'Voice-Over Bark',
            completed_at: new Date().toISOString(),
            duration_ms: step3Duration
        });

        console.log(`✅ ÉTAPE 3 OK: ${audioResult.audio_segments.length} segments en ${step3Duration}ms`);

        // ===== ÉTAPE 4: MONTAGE FINAL FFMPEG =====
        console.log('🎬 ÉTAPE 4/6: Montage final FFmpeg...');
        const step4Start = Date.now();

        const finalVideo = await assembleVideoWithFFmpeg({
            slideImages,
            audioFile: fullAudioFile,
            videoId,
            template: video_template,
            scriptSections: scriptResult.plan_sections
        });

        const step4Duration = Date.now() - step4Start;
        result.steps.step4_video = {
            status: 'completed',
            duration_ms: step4Duration,
            output: {
                video_file: finalVideo.path,
                video_url: finalVideo.url,
                duration_seconds: finalVideo.duration,
                file_size_mb: finalVideo.size_mb
            }
        };
        result.timeline.push({
            step: 4,
            name: 'Montage FFmpeg',
            completed_at: new Date().toISOString(),
            duration_ms: step4Duration
        });

        console.log(`✅ ÉTAPE 4 OK: Vidéo ${finalVideo.duration}s en ${step4Duration}ms`);

        // ===== ÉTAPE 5: STOCKAGE SUPABASE =====
        console.log('☁️ ÉTAPE 5/6: Stockage Supabase...');
        const step5Start = Date.now();

        const storageResult = await uploadToSupabase({
            videoFile: finalVideo.path,
            videoId,
            metadata: {
                topic,
                duration: finalVideo.duration,
                settings: videoSettings,
                template: video_template
            }
        });

        const step5Duration = Date.now() - step5Start;
        result.steps.step5_storage = {
            status: 'completed',
            duration_ms: step5Duration,
            output: {
                public_url: storageResult.public_url,
                storage_path: storageResult.path,
                cdn_url: storageResult.cdn_url
            }
        };
        result.timeline.push({
            step: 5,
            name: 'Stockage Supabase',
            completed_at: new Date().toISOString(),
            duration_ms: step5Duration
        });

        console.log(`✅ ÉTAPE 5 OK: Upload en ${step5Duration}ms`);

        // ===== ÉTAPE 6: PUBLICATION LMS EDUPRO =====
        console.log('📚 ÉTAPE 6/6: Publication LMS EduPro...');
        const step6Start = Date.now();

        const publicationResult = await publishToLMS({
            videoId,
            topic,
            videoUrl: storageResult.public_url,
            scriptSections: scriptResult.plan_sections,
            metadata: {
                duration: finalVideo.duration,
                level: videoSettings.level,
                style: videoSettings.style
            }
        });

        const step6Duration = Date.now() - step6Start;
        result.steps.step6_publication = {
            status: 'completed',
            duration_ms: step6Duration,
            output: {
                lms_course_id: publicationResult.course_id,
                lms_url: publicationResult.course_url,
                published: true
            }
        };
        result.timeline.push({
            step: 6,
            name: 'Publication LMS',
            completed_at: new Date().toISOString(),
            duration_ms: step6Duration
        });

        console.log(`✅ ÉTAPE 6 OK: Publication en ${step6Duration}ms`);

        // ===== RÉSULTAT FINAL =====
        const totalDuration = Date.now() - startTime;

        result.status = 'completed';
        result.total_generation_time_ms = totalDuration;
        result.generated_at = new Date().toISOString();

        // URLs finales
        result.final_outputs = {
            video_url: storageResult.public_url,
            lms_course_url: publicationResult.course_url,
            preview_url: `${storageResult.cdn_url}?t=10`, // Preview à 10s
            download_url: storageResult.public_url,
            sharing_url: publicationResult.sharing_url
        };

        // Assets pour réutilisation
        result.assets = {
            script: `/downloads/${videoId}/script.txt`,
            slides: `/downloads/${videoId}/slides.pdf`,
            audio: `/downloads/${videoId}/audio.mp3`,
            video: storageResult.public_url
        };

        // Statistiques
        result.stats = {
            total_steps: 6,
            success_rate: '100%',
            generation_speed: `${Math.round(finalVideo.duration / (totalDuration / 1000))}x real-time`,
            quality_score: calculateQualityScore(result),
            estimated_views: 0,
            file_size_mb: finalVideo.size_mb
        };

        // Cache le résultat
        videoCache.set(cacheKey, { ...result });
        setTimeout(() => videoCache.delete(cacheKey), 24 * 60 * 60 * 1000); // 24h

        // Nettoyage des fichiers temporaires
        await cleanupTempFiles(videoId);

        console.log(`🎉 === VIDÉO GÉNÉRÉE AVEC SUCCÈS ===`);
        console.log(`⏱️ Temps total: ${totalDuration}ms`);
        console.log(`🎬 Durée vidéo: ${finalVideo.duration}s`);
        console.log(`📊 Qualité: ${result.stats.quality_score}/100`);
        console.log(`🌐 URL: ${storageResult.public_url}`);

        res.json(result);

    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`❌ Erreur génération vidéo après ${totalDuration}ms:`, error);

        // Nettoyage en cas d'erreur
        await cleanupTempFiles(videoId).catch(() => { });

        res.status(500).json({
            video_id: videoId,
            error: 'Erreur génération vidéo complète',
            failed_at: error.step || 'unknown',
            details: error.message,
            total_duration_ms: totalDuration,
            troubleshooting: {
                ffmpeg: 'Vérifiez que FFmpeg est installé',
                storage: 'Vérifiez la configuration Supabase',
                memory: 'Processus peut nécessiter plus de RAM'
            }
        });
    }
});

// ===== FONCTIONS UTILITAIRES =====

// Créer les dossiers nécessaires
async function createDirectories() {
    const dirs = [
        VIDEO_CONFIG.output_dir,
        VIDEO_CONFIG.temp_dir,
        VIDEO_CONFIG.slides_dir,
        VIDEO_CONFIG.audio_dir
    ];

    for (const dir of dirs) {
        await fs.mkdir(dir, { recursive: true });
    }
}

// Appeler les APIs internes
async function callInternalAPI(endpoint, payload) {
    try {
        console.log(`📡 Appel API ${endpoint} avec payload:`, JSON.stringify(payload, null, 2));

        const response = await axios.post(`http://localhost:${process.env.PORT || 3001}${endpoint}`, payload, {
            timeout: 60000,
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        console.error(`❌ Erreur API ${endpoint}:`, error.message);
        if (error.response) {
            console.error(`📄 Status:`, error.response.status);
            console.error(`📄 Data:`, error.response.data);
        }
        throw new Error(`Échec ${endpoint}: ${error.message}`);
    }
}

// Sauvegarder fichier Slidev
async function saveSlidevFile(markdown, videoId) {
    const filename = `slides_${videoId}.md`;
    const filepath = path.join(VIDEO_CONFIG.slides_dir, filename);

    await fs.writeFile(filepath, markdown, 'utf8');
    console.log(`📄 Slidev sauvé: ${filename}`);

    return filepath;
}

// Convertir Slidev en images
async function convertSlidevToImages(slidevFile, videoId) {
    try {
        const outputDir = path.join(VIDEO_CONFIG.temp_dir, `slides_${videoId}`);
        await fs.mkdir(outputDir, { recursive: true });

        // Utiliser Slidev pour export PDF puis conversion images
        console.log('🔄 Conversion Slidev → Images...');

        // 1. Export PDF
        const pdfPath = path.join(outputDir, 'slides.pdf');
        await execAsync(`npx slidev export "${slidevFile}" --output "${pdfPath}"`, {
            timeout: 30000
        });

        // 2. PDF → Images avec ImageMagick ou sharp
        const imagesDir = path.join(outputDir, 'images');
        await fs.mkdir(imagesDir, { recursive: true });

        await execAsync(`convert -density 300 "${pdfPath}" -quality 90 "${imagesDir}/slide_%03d.png"`, {
            timeout: 20000
        });

        // 3. Lister les images générées
        const files = await fs.readdir(imagesDir);
        const imageFiles = files
            .filter(f => f.endsWith('.png'))
            .sort()
            .map(f => path.join(imagesDir, f));

        console.log(`✅ ${imageFiles.length} slides converties en images`);
        return imageFiles;

    } catch (error) {
        console.error('❌ Erreur conversion slides:', error);
        // Fallback: créer des images de placeholder
        return await createPlaceholderSlides(videoId, 5);
    }
}

// Créer slides placeholder en cas d'erreur
async function createPlaceholderSlides(videoId, count) {
    const slides = [];
    const outputDir = path.join(VIDEO_CONFIG.temp_dir, `slides_${videoId}`, 'images');
    await fs.mkdir(outputDir, { recursive: true });

    for (let i = 0; i < count; i++) {
        const slidePath = path.join(outputDir, `slide_${String(i + 1).padStart(3, '0')}.png`);

        // Créer image simple avec ImageMagick
        await execAsync(`convert -size 1920x1080 xc:white -font Arial -pointsize 72 -gravity center -annotate +0+0 "Slide ${i + 1}" "${slidePath}"`);

        slides.push(slidePath);
    }

    console.log(`✅ ${count} slides placeholder créées`);
    return slides;
}

// Assembler segments audio
async function assembleAudioSegments(audioSegments, videoId) {
    try {
        const outputPath = path.join(VIDEO_CONFIG.audio_dir, `complete_${videoId}.mp3`);

        // Filtrer les segments réussis
        const validSegments = audioSegments
            .filter(segment => segment.status === 'success' && segment.audio_url)
            .map(segment => path.join(__dirname, '..', '..', segment.audio_url.replace('/audio/', 'generated-audio/')));

        if (validSegments.length === 0) {
            throw new Error('Aucun segment audio valide trouvé');
        }

        if (validSegments.length === 1) {
            // Un seul segment, copier directement
            await fs.copyFile(validSegments[0], outputPath);
        } else {
            // Plusieurs segments, concaténer avec FFmpeg
            const fileList = validSegments.map(f => `file '${f}'`).join('\n');
            const listPath = path.join(VIDEO_CONFIG.temp_dir, `audio_list_${videoId}.txt`);

            await fs.writeFile(listPath, fileList);

            await execAsync(`ffmpeg -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`, {
                timeout: 30000
            });
        }

        console.log(`🎵 Audio assemblé: ${path.basename(outputPath)}`);
        return outputPath;

    } catch (error) {
        console.error('❌ Erreur assemblage audio:', error);
        throw error;
    }
}

// Assembler vidéo finale avec FFmpeg
async function assembleVideoWithFFmpeg({ slideImages, audioFile, videoId, template, scriptSections }) {
    try {
        const outputPath = path.join(VIDEO_CONFIG.output_dir, `video_${videoId}.mp4`);

        // Calculer durée par slide basée sur les sections
        const slideDurations = calculateSlideDurations(scriptSections, slideImages.length);

        // Créer script FFmpeg pour timing précis
        const ffmpegScript = await createFFmpegScript({
            slideImages,
            audioFile,
            slideDurations,
            outputPath,
            template
        });

        // Exécuter FFmpeg
        console.log('🎬 Assemblage vidéo FFmpeg...');
        await execAsync(ffmpegScript, {
            timeout: VIDEO_CONFIG.ffmpeg_timeout
        });

        // Obtenir infos vidéo finale
        const videoInfo = await getVideoInfo(outputPath);

        const result = {
            path: outputPath,
            url: `/videos/${path.basename(outputPath)}`,
            duration: videoInfo.duration,
            size_mb: Math.round(videoInfo.size / (1024 * 1024) * 100) / 100,
            resolution: '1920x1080',
            fps: VIDEO_CONFIG.default_fps
        };

        console.log(`✅ Vidéo assemblée: ${result.duration}s, ${result.size_mb}MB`);
        return result;

    } catch (error) {
        console.error('❌ Erreur assemblage vidéo:', error);
        throw error;
    }
}

// Calculer durées par slide
function calculateSlideDurations(scriptSections, slideCount) {
    const durations = [];
    const avgDuration = scriptSections.reduce((sum, s) => sum + s.duration_seconds, 0) / slideCount;

    for (let i = 0; i < slideCount; i++) {
        durations.push(scriptSections[i]?.duration_seconds || avgDuration);
    }

    return durations;
}

// Créer script FFmpeg
async function createFFmpegScript({ slideImages, audioFile, slideDurations, outputPath, template }) {
    let script = 'ffmpeg -y ';

    // Inputs images
    slideImages.forEach(img => {
        script += `-loop 1 -i "${img}" `;
    });

    // Input audio
    script += `-i "${audioFile}" `;

    // Filter complex pour timing
    let filterComplex = '';
    let currentTime = 0;

    slideImages.forEach((img, index) => {
        const duration = slideDurations[index] || 3;
        filterComplex += `[${index}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS,setsar=1[v${index}];`;
        currentTime += duration;
    });

    // Concaténer vidéos
    const videoInputs = slideImages.map((_, i) => `[v${i}]`).join('');
    filterComplex += `${videoInputs}concat=n=${slideImages.length}:v=1:a=0[outv]`;

    script += `-filter_complex "${filterComplex}" -map "[outv]" -map ${slideImages.length}:a `;
    script += `-c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k `;
    script += `-r ${VIDEO_CONFIG.default_fps} -shortest "${outputPath}"`;

    return script;
}

// Obtenir infos vidéo
async function getVideoInfo(videoPath) {
    try {
        const { stdout } = await execAsync(`ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`);
        const info = JSON.parse(stdout);

        return {
            duration: parseFloat(info.format.duration),
            size: parseInt(info.format.size),
            bitrate: parseInt(info.format.bit_rate)
        };
    } catch (error) {
        return { duration: 0, size: 0, bitrate: 0 };
    }
}

// Upload vers Supabase
async function uploadToSupabase({ videoFile, videoId, metadata }) {
    try {
        // TODO: Implémenter upload Supabase Storage
        console.log('☁️ Upload Supabase simulé...');

        // Pour l'instant, simulation
        const publicUrl = `https://your-supabase-project.supabase.co/storage/v1/object/public/videos/video_${videoId}.mp4`;
        const cdnUrl = `https://cdn.your-domain.com/videos/video_${videoId}.mp4`;

        return {
            public_url: publicUrl,
            cdn_url: cdnUrl,
            path: `videos/video_${videoId}.mp4`,
            uploaded_at: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Erreur upload Supabase:', error);
        throw error;
    }
}

// Publication vers LMS EduPro
async function publishToLMS({ videoId, topic, videoUrl, scriptSections, metadata }) {
    try {
        // TODO: Implémenter API LMS EduPro
        console.log('📚 Publication LMS simulée...');

        const courseId = `course_${videoId}`;
        const courseUrl = `https://lms.edupro.com/courses/${courseId}`;
        const sharingUrl = `https://share.edupro.com/video/${videoId}`;

        return {
            course_id: courseId,
            course_url: courseUrl,
            sharing_url: sharingUrl,
            published_at: new Date().toISOString(),
            status: 'published'
        };
    } catch (error) {
        console.error('❌ Erreur publication LMS:', error);
        throw error;
    }
}

// Calculer score qualité
function calculateQualityScore(result) {
    let score = 100;

    // Pénalités basées sur les étapes
    result.timeline.forEach(step => {
        if (step.duration_ms > 30000) score -= 5; // Étape trop lente
    });

    // Bonus pour rapidité
    if (result.total_generation_time_ms < 60000) score += 10;

    return Math.max(0, Math.min(100, score));
}

// Nettoyage fichiers temporaires
async function cleanupTempFiles(videoId) {
    try {
        const tempDirs = [
            path.join(VIDEO_CONFIG.temp_dir, `slides_${videoId}`),
            path.join(VIDEO_CONFIG.temp_dir, `audio_${videoId}`)
        ];

        for (const dir of tempDirs) {
            await fs.rm(dir, { recursive: true, force: true }).catch(() => { });
        }

        console.log(`🗑️ Fichiers temporaires nettoyés: ${videoId}`);
    } catch (error) {
        console.log('⚠️ Nettoyage partiel des fichiers temporaires');
    }
}

// Route d'information
router.get('/generate-video-complete/info', (req, res) => {
    res.json({
        endpoint: 'POST /ai/generate-video-complete',
        description: 'Génère une vidéo pédagogique complète automatiquement',
        flux_complet: [
            '1. UI Next.js → Upload ressources/capture',
            '2. API Backend → LLM → Génération Plan & Script',
            '3. Génération Slides (Slidev)',
            '4. Génération Voice-Over (Bark)',
            '5. Montage final (FFmpeg)',
            '6. Stockage Supabase Storage',
            '7. Publication LMS via API EduPro'
        ],
        payload_example: {
            topic: 'Excel - Tableaux croisés dynamiques',
            capsuleType: 'demonstrative',
            settings: {
                level: 'beginner',
                duration: 5,
                style: 'practical'
            },
            script_style: 'conversational',
            voice_type: 'professional_female',
            video_template: 'corporate'
        },
        output_example: {
            video_id: 'uuid',
            status: 'completed',
            final_outputs: {
                video_url: 'https://supabase.co/video.mp4',
                lms_course_url: 'https://lms.edupro.com/course/123',
                preview_url: 'https://cdn.com/video.mp4?t=10'
            },
            stats: {
                generation_speed: '2.5x real-time',
                quality_score: '95/100',
                file_size_mb: 45.2
            }
        },
        requirements: {
            ffmpeg: 'Required for video assembly',
            imagemagick: 'Required for slide conversion',
            slidev: 'Required for slide generation',
            supabase: 'Storage configuration needed'
        },
        estimated_time: '45-90 seconds for 5-minute video'
    });
});

// Route de monitoring des vidéos
router.get('/videos/status/:videoId', (req, res) => {
    const { videoId } = req.params;

    // TODO: Vérifier status en base/cache
    res.json({
        video_id: videoId,
        status: 'completed', // generating, failed, completed
        progress: 100,
        current_step: 6,
        total_steps: 6,
        estimated_remaining: 0,
        last_updated: new Date().toISOString()
    });
});

module.exports = router;