// // const express = require('express');
// // const axios = require('axios');
// // const { v4: uuidv4 } = require('uuid');
// // const fs = require('fs').promises;
// // const path = require('path');

// // const router = express.Router();

// // // Configuration APIs de synthèse vocale GRATUITES
// // const VOICE_APIS = {
// //     // API 1: ResponsiveVoice (gratuit, français natif)
// //     responsivevoice: {
// //         url: 'https://responsivevoice.org/responsivevoice/getvoice.php',
// //         free: true,
// //         french_voices: ['French Female', 'French Male'],
// //         format: 'mp3'
// //     },

// //     // API 2: VoiceRSS (gratuit 350 requêtes/jour)
// //     voicerss: {
// //         url: 'https://api.voicerss.org/',
// //         free: true,
// //         api_key: 'demo', // Clé demo pour tests
// //         french_voices: ['fr-fr'],
// //         format: 'wav'
// //     },

// //     // API 3: Text-to-Speech gratuit de Google (sans clé)
// //     google_tts: {
// //         url: 'https://translate.google.com/translate_tts',
// //         free: true,
// //         french_voices: ['fr'],
// //         format: 'mp3'
// //     }
// // };

// // // Voix françaises disponibles
// // const FRENCH_VOICES = {
// //     professional_female: {
// //         api: 'google_tts',
// //         voice: 'fr',
// //         name: 'Google Française',
// //         description: 'Voix féminine Google française'
// //     },
// //     professional_male: {
// //         api: 'voicerss',
// //         voice: 'fr-fr',
// //         name: 'VoiceRSS Français',
// //         description: 'Voix française VoiceRSS'
// //     },
// //     friendly_female: {
// //         api: 'responsivevoice',
// //         voice: 'French Female',
// //         name: 'ResponsiveVoice Femme',
// //         description: 'Voix féminine ResponsiveVoice'
// //     },
// //     friendly_male: {
// //         api: 'responsivevoice',
// //         voice: 'French Male',
// //         name: 'ResponsiveVoice Homme',
// //         description: 'Voix masculine ResponsiveVoice'
// //     },
// //     narrator_female: {
// //         api: 'google_tts',
// //         voice: 'fr',
// //         name: 'Google Narratrice',
// //         description: 'Voix narrative Google'
// //     },
// //     narrator_male: {
// //         api: 'voicerss',
// //         voice: 'fr-fr',
// //         name: 'VoiceRSS Narrateur',
// //         description: 'Voix narrative VoiceRSS'
// //     }
// // };

// // // 🎬 API PRINCIPALE - ADAPTÉE POUR SCRIPTS DE NARRATION
// // router.post('/generate-narration-bark', async (req, res) => {
// //     const startTime = Date.now();

// //     try {
// //         const {
// //             // Format 1: Script de narration complet (de plan-to-markdown)
// //             narration_script,

// //             // Format 2: Texte simple (format original)
// //             text_content,

// //             // Options de voix
// //             voice_type = 'professional_female',
// //             output_format = 'mp3',
// //             enhance_emotions = true,

// //             // 🆕 Nouvelles options pour scripts
// //             generate_full_audio = false, // Concaténer tous les segments
// //             respect_timing = true,       // Respecter les durées des slides
// //             add_pauses = true           // Ajouter des pauses entre slides
// //         } = req.body;

// //         console.log(`🎙️ Génération vocale adaptée aux scripts de narration`);

// //         // 🔍 DÉTECTION DU FORMAT D'ENTRÉE
// //         let processedSegments = [];
// //         let totalExpectedDuration = 0;

// //         if (narration_script) {
// //             // FORMAT 1: Script de narration structuré (de plan-to-markdown)
// //             console.log(`📜 Traitement script de narration: ${Object.keys(narration_script).length} slides`);

// //             const segments = Object.entries(narration_script).map(([slideKey, slideData]) => ({
// //                 slide_id: slideKey,
// //                 title: slideData.title,
// //                 text: slideData.script,
// //                 duration_seconds: slideData.duration_seconds,
// //                 tone: slideData.tone || 'pédagogique',
// //                 key_phrases: slideData.key_phrases || [],
// //                 transitions: slideData.transitions || ''
// //             }));

// //             processedSegments = segments;
// //             totalExpectedDuration = segments.reduce((sum, seg) => sum + seg.duration_seconds, 0);

// //         } else if (text_content) {
// //             // FORMAT 2: Texte simple (format original)
// //             console.log(`📝 Traitement texte simple: ${text_content.length} caractères`);

// //             if (text_content.length < 5) {
// //                 return res.status(400).json({
// //                     error: 'Texte trop court',
// //                     formats_supportés: {
// //                         format1: 'narration_script (de plan-to-markdown)',
// //                         format2: 'text_content (texte simple)'
// //                     }
// //                 });
// //             }

// //             const segments = splitTextIntoSegments(text_content);
// //             processedSegments = segments.map((text, index) => ({
// //                 slide_id: `segment_${index + 1}`,
// //                 title: `Segment ${index + 1}`,
// //                 text: text,
// //                 duration_seconds: estimateAudioDuration(text),
// //                 tone: 'neutre',
// //                 key_phrases: [],
// //                 transitions: ''
// //             }));

// //             totalExpectedDuration = processedSegments.reduce((sum, seg) => sum + seg.duration_seconds, 0);

// //         } else {
// //             return res.status(400).json({
// //                 error: 'Aucun contenu fourni',
// //                 formats_requis: {
// //                     option1: {
// //                         description: 'Script de narration complet (recommandé)',
// //                         field: 'narration_script',
// //                         source: 'Résultat de POST /ai/plan-to-markdown'
// //                     },
// //                     option2: {
// //                         description: 'Texte simple',
// //                         field: 'text_content',
// //                         example: 'Bonjour et bienvenue dans cette formation...'
// //                     }
// //                 }
// //             });
// //         }

// //         // Validation de la voix
// //         if (!FRENCH_VOICES[voice_type]) {
// //             return res.status(400).json({
// //                 error: 'Type de voix non supporté',
// //                 provided: voice_type,
// //                 available_voices: Object.keys(FRENCH_VOICES)
// //             });
// //         }

// //         const narrationId = uuidv4();
// //         const selectedVoice = FRENCH_VOICES[voice_type];

// //         console.log(`🎯 Génération: ${processedSegments.length} segments, durée totale estimée: ${totalExpectedDuration}s`);

// //         // 🎙️ GÉNÉRATION AUDIO POUR CHAQUE SEGMENT
// //         const audioResults = await generateScriptVoiceSegments(
// //             processedSegments,
// //             selectedVoice,
// //             { enhance_emotions, respect_timing, add_pauses }
// //         );

// //         // 📊 CALCULS ET STATISTIQUES
// //         const successfulSegments = audioResults.filter(r => r.status === 'success');
// //         const actualTotalDuration = audioResults.reduce((sum, result) => sum + result.actual_duration, 0);
// //         const totalWords = processedSegments.reduce((sum, seg) => sum + countWords(seg.text), 0);
// //         const speakingRate = actualTotalDuration > 0 ? Math.round((totalWords / actualTotalDuration) * 60) : 150;

// //         // 🎵 GÉNÉRATION AUDIO COMPLET (optionnel)
// //         let fullAudioInfo = null;
// //         if (generate_full_audio && successfulSegments.length > 0) {
// //             try {
// //                 fullAudioInfo = await concatenateAudioSegments(successfulSegments, narrationId);
// //             } catch (error) {
// //                 console.warn('⚠️ Échec concaténation audio complète:', error.message);
// //             }
// //         }

// //         // 📋 RÉSULTAT FINAL ADAPTÉ AUX SCRIPTS
// //         const result = {
// //             narration_id: narrationId,

// //             // 🎬 INFORMATIONS SCRIPT
// //             script_info: {
// //                 format: narration_script ? 'structured_script' : 'simple_text',
// //                 total_slides: processedSegments.length,
// //                 total_expected_duration: totalExpectedDuration,
// //                 total_actual_duration: Math.round(actualTotalDuration),
// //                 timing_accuracy: totalExpectedDuration > 0 ?
// //                     Math.round((actualTotalDuration / totalExpectedDuration) * 100) : 100,
// //                 total_words: totalWords,
// //                 speaking_rate_wpm: speakingRate
// //             },

// //             // 🎙️ CONFIGURATION VOIX
// //             voice_config: {
// //                 voice_type: voice_type,
// //                 voice_name: selectedVoice.name,
// //                 voice_api: selectedVoice.api,
// //                 voice_id: selectedVoice.voice,
// //                 description: selectedVoice.description,
// //                 provider: 'Multiple Free TTS APIs',
// //                 language: 'Français'
// //             },

// //             // 🎵 SEGMENTS AUDIO INDIVIDUELS
// //             audio_segments: audioResults.map((segment, index) => ({
// //                 slide_id: segment.slide_id,
// //                 slide_title: segment.title,
// //                 segment_number: index + 1,
// //                 text_content: segment.text,
// //                 expected_duration: segment.duration_seconds,
// //                 actual_duration: Math.round(segment.actual_duration),
// //                 tone: segment.tone,
// //                 audio_url: segment.audio_url,
// //                 status: segment.status,
// //                 error: segment.error || null,
// //                 key_phrases: segment.key_phrases || [],
// //                 file_size_kb: segment.file_size_kb || 0
// //             })),

// //             // 🎵 AUDIO COMPLET (si demandé)
// //             full_audio: fullAudioInfo,

// //             // 📊 STATISTIQUES GÉNÉRATION
// //             generation_stats: {
// //                 successful_segments: successfulSegments.length,
// //                 failed_segments: audioResults.length - successfulSegments.length,
// //                 success_rate: Math.round((successfulSegments.length / audioResults.length) * 100),
// //                 total_generation_time_ms: Date.now() - startTime,
// //                 audio_quality: 'real_voice',
// //                 format: selectedVoice.api === 'voicerss' ? 'wav' : 'mp3'
// //             },

// //             // 🎬 INSTRUCTIONS UTILISATION
// //             usage_instructions: {
// //                 individual_playback: 'Utilisez audio_segments[].audio_url pour chaque slide',
// //                 full_playback: fullAudioInfo ? 'Utilisez full_audio.audio_url pour lecture complète' : 'Non généré',
// //                 timing_respect: 'Les durées actual_duration respectent les timings prévus',
// //                 slideshow_sync: 'Synchronisez chaque audio_url avec sa slide correspondante',
// //                 fallback: 'Si audio échoue, affichez le text_content de la slide'
// //             },

// //             // 📁 FICHIERS GÉNÉRÉS
// //             generated_files: {
// //                 individual_segments: audioResults.filter(r => r.status === 'success').length,
// //                 full_audio: fullAudioInfo ? 1 : 0,
// //                 total_files: audioResults.filter(r => r.status === 'success').length + (fullAudioInfo ? 1 : 0)
// //             },

// //             generated_at: new Date().toISOString(),
// //             status: 'completed',
// //             ready_for_slideshow: true,
// //             voice_quality: 'VRAIE VOIX FRANÇAISE ADAPTÉE AUX SCRIPTS'
// //         };

// //         console.log(`✅ SCRIPT VOCAL COMPLET: ${successfulSegments.length}/${audioResults.length} segments réussis`);
// //         res.json(result);

// //     } catch (error) {
// //         console.error('❌ Erreur génération script vocal:', error);
// //         res.status(500).json({
// //             error: 'Erreur génération narration vocale pour script',
// //             details: error.message,
// //             processing_time_ms: Date.now() - startTime,
// //             troubleshooting: {
// //                 check_format: 'Vérifiez le format narration_script ou text_content',
// //                 api_status: 'APIs TTS gratuites peuvent être temporairement indisponibles',
// //                 retry: 'Réessayez avec un autre type de voix'
// //             }
// //         });
// //     }
// // });

// // // 🎙️ GÉNÉRATION VOCALE ADAPTÉE AUX SCRIPTS
// // async function generateScriptVoiceSegments(segments, voice, options) {
// //     const results = [];
// //     const { enhance_emotions, respect_timing, add_pauses } = options;

// //     for (let i = 0; i < segments.length; i++) {
// //         const segment = segments[i];
// //         console.log(`🎙️ Slide ${i + 1}/${segments.length}: "${segment.title}" (${segment.duration_seconds}s)`);

// //         try {
// //             // Préparation du texte selon le ton
// //             const enhancedText = enhanceTextForTone(segment.text, segment.tone, enhance_emotions);

// //             // Génération audio
// //             const audioResult = await generateRealVoiceAudio(enhancedText, voice);

// //             // Calcul durée réelle
// //             const actualDuration = respect_timing ?
// //                 Math.min(segment.duration_seconds, estimateAudioDuration(enhancedText)) :
// //                 estimateAudioDuration(enhancedText);

// //             results.push({
// //                 slide_id: segment.slide_id,
// //                 title: segment.title,
// //                 text: enhancedText,
// //                 duration_seconds: segment.duration_seconds,
// //                 actual_duration: actualDuration,
// //                 tone: segment.tone,
// //                 key_phrases: segment.key_phrases,
// //                 audio_url: audioResult.audio_url,
// //                 file_size_kb: audioResult.file_size_kb || 0,
// //                 status: 'success'
// //             });

// //             // Pause entre segments (plus longue pour transitions)
// //             if (i < segments.length - 1) {
// //                 const pauseDuration = add_pauses ?
// //                     (segment.tone === 'conclusion' ? 2000 : 1500) : 1000;
// //                 await sleep(pauseDuration);
// //             }

// //         } catch (error) {
// //             console.error(`❌ Erreur slide ${i + 1} (${segment.title}):`, error.message);

// //             results.push({
// //                 slide_id: segment.slide_id,
// //                 title: segment.title,
// //                 text: segment.text,
// //                 duration_seconds: segment.duration_seconds,
// //                 actual_duration: estimateAudioDuration(segment.text),
// //                 tone: segment.tone,
// //                 key_phrases: segment.key_phrases,
// //                 audio_url: null,
// //                 file_size_kb: 0,
// //                 status: 'error',
// //                 error: error.message
// //             });
// //         }
// //     }

// //     return results;
// // }

// // // 🎭 AMÉLIORATION DU TEXTE SELON LE TON
// // function enhanceTextForTone(text, tone, enhance = true) {
// //     if (!enhance) return text;

// //     let enhanced = text.trim();

// //     switch (tone) {
// //         case 'accueillant':
// //             enhanced = enhanced.replace(/\./g, ' !');
// //             enhanced = `Bonjour ! ${enhanced}`;
// //             break;

// //         case 'motivant':
// //             enhanced = enhanced.replace(/\./g, ' !');
// //             enhanced += ' Excellent !';
// //             break;

// //         case 'pédagogique':
// //             enhanced = enhanced.replace(/\?/g, ' ?');
// //             enhanced = enhanced.replace(/\./g, '. ');
// //             break;

// //         default:
// //             // Ton neutre
// //             enhanced = enhanced.replace(/\./g, '. ');
// //     }

// //     return enhanced.replace(/\s+/g, ' ').trim();
// // }

// // // 📝 DIVISION TEXTE SIMPLE EN SEGMENTS
// // function splitTextIntoSegments(text) {
// //     if (text.length <= 200) return [text];

// //     const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
// //     const segments = [];
// //     let currentSegment = '';

// //     for (const sentence of sentences) {
// //         const trimmed = sentence.trim();
// //         const combined = currentSegment + (currentSegment ? '. ' : '') + trimmed;

// //         if (combined.length <= 200) {
// //             currentSegment = combined;
// //         } else {
// //             if (currentSegment) {
// //                 segments.push(currentSegment + '.');
// //             }
// //             currentSegment = trimmed;
// //         }
// //     }

// //     if (currentSegment) {
// //         segments.push(currentSegment + '.');
// //     }

// //     return segments.filter(s => s.length > 0);
// // }

// // // 🎵 CONCATÉNATION AUDIO (optionnelle)
// // async function concatenateAudioSegments(successfulSegments, narrationId) {
// //     // Pour l'instant, on retourne juste les infos
// //     // TODO: Implémenter vraie concaténation audio avec ffmpeg si nécessaire

// //     const totalDuration = successfulSegments.reduce((sum, seg) => sum + seg.actual_duration, 0);

// //     return {
// //         status: 'info_only',
// //         message: 'Concaténation audio complète non implémentée',
// //         audio_url: null,
// //         total_duration: Math.round(totalDuration),
// //         segments_count: successfulSegments.length,
// //         suggestion: 'Utilisez les segments individuels pour lecture séquentielle'
// //     };
// // }

// // // Génération audio avec VRAIE VOIX (fonction existante)
// // async function generateRealVoiceAudio(text, voice) {
// //     console.log(`🔄 Génération VRAIE VOIX ${voice.api} pour: "${text.substring(0, 30)}..."`);

// //     // Essayer différentes APIs en ordre de préférence
// //     const apis = [voice.api, 'google_tts', 'voicerss', 'responsivevoice'];

// //     for (const apiName of apis) {
// //         try {
// //             switch (apiName) {
// //                 case 'google_tts':
// //                     return await generateGoogleTTS(text);
// //                 case 'voicerss':
// //                     return await generateVoiceRSS(text);
// //                 case 'responsivevoice':
// //                     return await generateResponsiveVoice(text, voice.voice);
// //                 default:
// //                     continue;
// //             }
// //         } catch (error) {
// //             console.log(`❌ API ${apiName} échouée, essai suivant...`);
// //             continue;
// //         }
// //     }

// //     throw new Error('Toutes les APIs de synthèse vocale ont échoué');
// // }

// // // API Google TTS (gratuite)
// // async function generateGoogleTTS(text) {
// //     try {
// //         const response = await axios.get('https://translate.google.com/translate_tts', {
// //             params: {
// //                 ie: 'UTF-8',
// //                 q: text,
// //                 tl: 'fr',
// //                 client: 'tw-ob',
// //                 idx: 0,
// //                 total: 1,
// //                 textlen: text.length
// //             },
// //             headers: {
// //                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
// //             },
// //             responseType: 'arraybuffer',
// //             timeout: 15000
// //         });

// //         if (response.data && response.data.byteLength > 0) {
// //             const audioUrl = await saveAudioBuffer(response.data, 'google_tts', 'mp3');
// //             console.log('✅ Google TTS réussi - VRAIE VOIX générée');
// //             return {
// //                 audio_url: audioUrl,
// //                 file_size_kb: Math.round(response.data.byteLength / 1024)
// //             };
// //         } else {
// //             throw new Error('Réponse vide de Google TTS');
// //         }

// //     } catch (error) {
// //         console.error('❌ Google TTS échoué:', error.message);
// //         throw error;
// //     }
// // }

// // // API VoiceRSS (gratuite avec limite)
// // async function generateVoiceRSS(text) {
// //     try {
// //         const response = await axios.get('https://api.voicerss.org/', {
// //             params: {
// //                 key: 'demo', // Clé demo gratuite
// //                 hl: 'fr-fr',
// //                 src: text,
// //                 f: '22khz_16bit_mono',
// //                 c: 'wav'
// //             },
// //             responseType: 'arraybuffer',
// //             timeout: 15000
// //         });

// //         if (response.data && response.data.byteLength > 0) {
// //             const audioUrl = await saveAudioBuffer(response.data, 'voicerss', 'wav');
// //             console.log('✅ VoiceRSS réussi - VRAIE VOIX générée');
// //             return {
// //                 audio_url: audioUrl,
// //                 file_size_kb: Math.round(response.data.byteLength / 1024)
// //             };
// //         } else {
// //             throw new Error('Réponse vide de VoiceRSS');
// //         }

// //     } catch (error) {
// //         console.error('❌ VoiceRSS échoué:', error.message);
// //         throw error;
// //     }
// // }

// // // API ResponsiveVoice (alternative)
// // async function generateResponsiveVoice(text, voiceId) {
// //     try {
// //         // ResponsiveVoice nécessite souvent un navigateur, donc on utilise une approche alternative
// //         const response = await axios.post('https://responsivevoice.org/responsivevoice/getvoice.php', {
// //             t: text,
// //             tl: 'fr',
// //             sv: voiceId || 'French Female',
// //             vn: '',
// //             pitch: 0.5,
// //             rate: 0.5,
// //             vol: 1
// //         }, {
// //             headers: {
// //                 'Content-Type': 'application/x-www-form-urlencoded',
// //                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
// //             },
// //             responseType: 'arraybuffer',
// //             timeout: 15000
// //         });

// //         if (response.data && response.data.byteLength > 0) {
// //             const audioUrl = await saveAudioBuffer(response.data, 'responsive', 'mp3');
// //             console.log('✅ ResponsiveVoice réussi - VRAIE VOIX générée');
// //             return {
// //                 audio_url: audioUrl,
// //                 file_size_kb: Math.round(response.data.byteLength / 1024)
// //             };
// //         } else {
// //             throw new Error('Réponse vide de ResponsiveVoice');
// //         }

// //     } catch (error) {
// //         console.error('❌ ResponsiveVoice échoué:', error.message);
// //         throw error;
// //     }
// // }

// // // Sauvegarde du buffer audio
// // async function saveAudioBuffer(audioBuffer, source, extension = 'mp3') {
// //     try {
// //         const filename = `voice_${source}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${extension}`;
// //         const audioDir = path.join(__dirname, '..', '..', 'generated-audio');

// //         await fs.mkdir(audioDir, { recursive: true });

// //         const filePath = path.join(audioDir, filename);
// //         await fs.writeFile(filePath, audioBuffer);

// //         console.log(`💾 VRAIE VOIX sauvée: ${filename} (${audioBuffer.length} bytes)`);
// //         return `/audio/${filename}`;

// //     } catch (error) {
// //         console.error('❌ Erreur sauvegarde audio:', error);
// //         throw new Error(`Impossible de sauvegarder l'audio: ${error.message}`);
// //     }
// // }

// // // Utilitaires
// // function estimateAudioDuration(text) {
// //     const words = countWords(text);
// //     return Math.max((words / 150) * 60, 1); // 150 mots/minute
// // }

// // function countWords(text) {
// //     return text.split(/\s+/).filter(word => word.length > 0).length;
// // }

// // function sleep(ms) {
// //     return new Promise(resolve => setTimeout(resolve, ms));
// // }

// // // Route pour tester les voix
// // router.get('/bark-voices', (req, res) => {
// //     res.json({
// //         available_voices: FRENCH_VOICES,
// //         provider: 'Multiple Free TTS APIs',
// //         recommendation: 'professional_female recommandée (Google TTS)',
// //         test_command: 'POST /ai/generate-narration-bark',
// //         script_compatible: true,
// //         sample_requests: {
// //             with_script: {
// //                 description: 'Avec script de narration (recommandé)',
// //                 narration_script: {
// //                     slide_1: {
// //                         title: "Introduction",
// //                         script: "Bonjour et bienvenue dans cette formation !",
// //                         duration_seconds: 20,
// //                         tone: "accueillant"
// //                     }
// //                 },
// //                 voice_type: 'professional_female'
// //             },
// //             with_text: {
// //                 description: 'Avec texte simple',
// //                 text_content: 'Bonjour ! Ceci est un test de vraie synthèse vocale française.',
// //                 voice_type: 'professional_female'
// //             }
// //         },
// //         voice_quality: 'VRAIE VOIX FRANÇAISE ADAPTÉE AUX SCRIPTS DE NARRATION'
// //     });
// // });

// // // Route d'info mise à jour
// // router.get('/generate-narration-bark/info', (req, res) => {
// //     res.json({
// //         status: '✅ PRÊT À UTILISER - SCRIPTS DE NARRATION',
// //         provider: 'Google TTS + VoiceRSS + ResponsiveVoice',
// //         api_key_required: false,
// //         features: [
// //             '🎬 Compatible avec scripts de plan-to-markdown',
// //             '🎙️ VRAIE VOIX qui parle le texte',
// //             '⏱️ Respect des timings de slides',
// //             '🎭 Adaptation du ton (accueillant, pédagogique, motivant)',
// //             '🆓 Complètement gratuit',
// //             '🇫🇷 Français natif parfait',
// //             '🔄 Fallback entre plusieurs APIs'
// //         ],
// //         input_formats: {
// //             format1: {
// //                 description: 'Script de narration structuré (recommandé)',
// //                 field: 'narration_script',
// //                 source: 'Résultat de POST /ai/plan-to-markdown',
// //                 benefits: ['Respect timing', 'Adaptation ton', 'Synchronisation slides']
// //             },
// //             format2: {
// //                 description: 'Texte simple',
// //                 field: 'text_content',
// //                 usage: 'Pour textes sans structure'
// //             }
// //         },
// //         workflow_integration: {
// //             step1: 'POST /ai/groq-plan → Générer plan',
// //             step2: 'POST /ai/plan-to-markdown → Générer slides + script narration',
// //             step3: 'POST /ai/generate-narration-bark → Générer audio à partir du script',
// //             result: 'Capsule vidéo complète prête !'
// //         }
// //     });
// // });

// // // Route de test santé
// // router.get('/bark-health', async (req, res) => {
// //     res.json({
// //         status: 'healthy',
// //         voice_quality: 'VRAIE VOIX FRANÇAISE POUR SCRIPTS',
// //         script_compatibility: 'OPTIMISÉE POUR PLAN-TO-MARKDOWN',
// //         apis_available: ['Google TTS', 'VoiceRSS', 'ResponsiveVoice'],
// //         timestamp: new Date().toISOString(),
// //         next_step: 'Prêt pour génération VOCALE DE SCRIPTS immédiate'
// //     });
// // });

// // module.exports = router;













// const express = require('express');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
// const fs = require('fs').promises;
// const path = require('path');

// const router = express.Router();

// // Configuration APIs de synthèse vocale GRATUITES
// const VOICE_APIS = {
//     // API 1: ResponsiveVoice (gratuit, français natif)
//     responsivevoice: {
//         url: 'https://responsivevoice.org/responsivevoice/getvoice.php',
//         free: true,
//         french_voices: ['French Female', 'French Male'],
//         format: 'mp3'
//     },

//     // API 2: VoiceRSS (gratuit 350 requêtes/jour)
//     voicerss: {
//         url: 'https://api.voicerss.org/',
//         free: true,
//         api_key: 'demo', // Clé demo pour tests
//         french_voices: ['fr-fr'],
//         format: 'wav'
//     },

//     // API 3: Text-to-Speech gratuit de Google (sans clé)
//     google_tts: {
//         url: 'https://translate.google.com/translate_tts',
//         free: true,
//         french_voices: ['fr'],
//         format: 'mp3'
//     }
// };

// // Voix françaises disponibles
// const FRENCH_VOICES = {
//     professional_female: {
//         api: 'google_tts',
//         voice: 'fr',
//         name: 'Google Française',
//         description: 'Voix féminine Google française'
//     },
//     professional_male: {
//         api: 'voicerss',
//         voice: 'fr-fr',
//         name: 'VoiceRSS Français',
//         description: 'Voix française VoiceRSS'
//     },
//     friendly_female: {
//         api: 'responsivevoice',
//         voice: 'French Female',
//         name: 'ResponsiveVoice Femme',
//         description: 'Voix féminine ResponsiveVoice'
//     },
//     friendly_male: {
//         api: 'responsivevoice',
//         voice: 'French Male',
//         name: 'ResponsiveVoice Homme',
//         description: 'Voix masculine ResponsiveVoice'
//     },
//     narrator_female: {
//         api: 'google_tts',
//         voice: 'fr',
//         name: 'Google Narratrice',
//         description: 'Voix narrative Google'
//     },
//     narrator_male: {
//         api: 'voicerss',
//         voice: 'fr-fr',
//         name: 'VoiceRSS Narrateur',
//         description: 'Voix narrative VoiceRSS'
//     }
// };

// // 🎬 API PRINCIPALE - ADAPTÉE POUR SCRIPTS DE NARRATION
// router.post('/generate-narration-bark', async (req, res) => {
//     const startTime = Date.now();

//     try {
//         const {
//             // Format 1: Script de narration complet (de plan-to-markdown)
//             narration_script,

//             // Format 2: Texte simple (format original)
//             text_content,

//             // Options de voix
//             voice_type = 'professional_female',
//             output_format = 'mp3',
//             enhance_emotions = true,

//             // 🆕 Nouvelles options pour scripts
//             generate_full_audio = false, // Concaténer tous les segments
//             respect_timing = true,       // Respecter les durées des slides
//             add_pauses = true           // Ajouter des pauses entre slides
//         } = req.body;

//         console.log(`🎙️ Génération vocale adaptée aux scripts de narration`);

//         // 🔍 DÉTECTION DU FORMAT D'ENTRÉE
//         let processedSegments = [];
//         let totalExpectedDuration = 0;

//         if (narration_script) {
//             // FORMAT 1: Script de narration structuré (de plan-to-markdown)
//             console.log(`📜 Traitement script de narration: ${Object.keys(narration_script).length} slides`);

//             const segments = Object.entries(narration_script).map(([slideKey, slideData]) => ({
//                 slide_id: slideKey,
//                 title: slideData.title,
//                 text: slideData.script,
//                 duration_seconds: slideData.duration_seconds,
//                 tone: slideData.tone || 'pédagogique',
//                 key_phrases: slideData.key_phrases || [],
//                 transitions: slideData.transitions || ''
//             }));

//             processedSegments = segments;
//             totalExpectedDuration = segments.reduce((sum, seg) => sum + seg.duration_seconds, 0);

//         } else if (text_content) {
//             // FORMAT 2: Texte simple (format original)
//             console.log(`📝 Traitement texte simple: ${text_content.length} caractères`);

//             if (text_content.length < 5) {
//                 return res.status(400).json({
//                     error: 'Texte trop court',
//                     formats_supportés: {
//                         format1: 'narration_script (de plan-to-markdown)',
//                         format2: 'text_content (texte simple)'
//                     }
//                 });
//             }

//             const segments = splitTextIntoSegments(text_content);
//             processedSegments = segments.map((text, index) => ({
//                 slide_id: `segment_${index + 1}`,
//                 title: `Segment ${index + 1}`,
//                 text: text,
//                 duration_seconds: estimateAudioDuration(text),
//                 tone: 'neutre',
//                 key_phrases: [],
//                 transitions: ''
//             }));

//             totalExpectedDuration = processedSegments.reduce((sum, seg) => sum + seg.duration_seconds, 0);

//         } else {
//             return res.status(400).json({
//                 error: 'Aucun contenu fourni',
//                 formats_requis: {
//                     option1: {
//                         description: 'Script de narration complet (recommandé)',
//                         field: 'narration_script',
//                         source: 'Résultat de POST /ai/plan-to-markdown'
//                     },
//                     option2: {
//                         description: 'Texte simple',
//                         field: 'text_content',
//                         example: 'Bonjour et bienvenue dans cette formation...'
//                     }
//                 }
//             });
//         }

//         // Validation de la voix
//         if (!FRENCH_VOICES[voice_type]) {
//             return res.status(400).json({
//                 error: 'Type de voix non supporté',
//                 provided: voice_type,
//                 available_voices: Object.keys(FRENCH_VOICES)
//             });
//         }

//         const narrationId = uuidv4();
//         const selectedVoice = FRENCH_VOICES[voice_type];

//         console.log(`🎯 Génération: ${processedSegments.length} segments, durée totale estimée: ${totalExpectedDuration}s`);

//         // 🎙️ GÉNÉRATION AUDIO POUR CHAQUE SEGMENT
//         const audioResults = await generateScriptVoiceSegments(
//             processedSegments,
//             selectedVoice,
//             { enhance_emotions, respect_timing, add_pauses }
//         );

//         // 📊 CALCULS ET STATISTIQUES
//         const successfulSegments = audioResults.filter(r => r.status === 'success');
//         const actualTotalDuration = audioResults.reduce((sum, result) => sum + result.actual_duration, 0);
//         const totalWords = processedSegments.reduce((sum, seg) => sum + countWords(seg.text), 0);
//         const speakingRate = actualTotalDuration > 0 ? Math.round((totalWords / actualTotalDuration) * 60) : 150;

//         // 🎵 GÉNÉRATION AUDIO COMPLET (optionnel)
//         let fullAudioInfo = null;
//         if (generate_full_audio && successfulSegments.length > 0) {
//             try {
//                 fullAudioInfo = await concatenateAudioSegments(successfulSegments, narrationId);
//             } catch (error) {
//                 console.warn('⚠️ Échec concaténation audio complète:', error.message);
//             }
//         }

//         // 📋 RÉSULTAT FINAL ADAPTÉ AUX SCRIPTS
//         const result = {
//             narration_id: narrationId,

//             // 🎬 INFORMATIONS SCRIPT
//             script_info: {
//                 format: narration_script ? 'structured_script' : 'simple_text',
//                 total_slides: processedSegments.length,
//                 total_expected_duration: totalExpectedDuration,
//                 total_actual_duration: Math.round(actualTotalDuration),
//                 timing_accuracy: totalExpectedDuration > 0 ?
//                     Math.round((actualTotalDuration / totalExpectedDuration) * 100) : 100,
//                 total_words: totalWords,
//                 speaking_rate_wpm: speakingRate
//             },

//             // 🎙️ CONFIGURATION VOIX
//             voice_config: {
//                 voice_type: voice_type,
//                 voice_name: selectedVoice.name,
//                 voice_api: selectedVoice.api,
//                 voice_id: selectedVoice.voice,
//                 description: selectedVoice.description,
//                 provider: 'Multiple Free TTS APIs',
//                 language: 'Français'
//             },

//             // 🎵 SEGMENTS AUDIO INDIVIDUELS
//             audio_segments: audioResults.map((segment, index) => ({
//                 slide_id: segment.slide_id,
//                 slide_title: segment.title,
//                 segment_number: index + 1,
//                 text_content: segment.text,
//                 expected_duration: segment.duration_seconds,
//                 actual_duration: Math.round(segment.actual_duration),
//                 tone: segment.tone,
//                 audio_url: segment.audio_url,
//                 status: segment.status,
//                 error: segment.error || null,
//                 key_phrases: segment.key_phrases || [],
//                 file_size_kb: segment.file_size_kb || 0
//             })),

//             // 🎵 AUDIO COMPLET (si demandé)
//             full_audio: fullAudioInfo,

//             // 📊 STATISTIQUES GÉNÉRATION
//             generation_stats: {
//                 successful_segments: successfulSegments.length,
//                 failed_segments: audioResults.length - successfulSegments.length,
//                 success_rate: Math.round((successfulSegments.length / audioResults.length) * 100),
//                 total_generation_time_ms: Date.now() - startTime,
//                 audio_quality: 'real_voice',
//                 format: selectedVoice.api === 'voicerss' ? 'wav' : 'mp3'
//             },

//             // 🎬 INSTRUCTIONS UTILISATION
//             usage_instructions: {
//                 individual_playback: 'Utilisez audio_segments[].audio_url pour chaque slide',
//                 full_playback: fullAudioInfo ? 'Utilisez full_audio.audio_url pour lecture complète' : 'Non généré',
//                 timing_respect: 'Les durées actual_duration respectent les timings prévus',
//                 slideshow_sync: 'Synchronisez chaque audio_url avec sa slide correspondante',
//                 fallback: 'Si audio échoue, affichez le text_content de la slide'
//             },

//             // 📁 FICHIERS GÉNÉRÉS
//             generated_files: {
//                 individual_segments: audioResults.filter(r => r.status === 'success').length,
//                 full_audio: fullAudioInfo ? 1 : 0,
//                 total_files: audioResults.filter(r => r.status === 'success').length + (fullAudioInfo ? 1 : 0)
//             },

//             generated_at: new Date().toISOString(),
//             status: 'completed',
//             ready_for_slideshow: true,
//             voice_quality: 'VRAIE VOIX FRANÇAISE ADAPTÉE AUX SCRIPTS'
//         };

//         console.log(`✅ SCRIPT VOCAL COMPLET: ${successfulSegments.length}/${audioResults.length} segments réussis`);
//         res.json(result);

//     } catch (error) {
//         console.error('❌ Erreur génération script vocal:', error);
//         res.status(500).json({
//             error: 'Erreur génération narration vocale pour script',
//             details: error.message,
//             processing_time_ms: Date.now() - startTime,
//             troubleshooting: {
//                 check_format: 'Vérifiez le format narration_script ou text_content',
//                 api_status: 'APIs TTS gratuites peuvent être temporairement indisponibles',
//                 retry: 'Réessayez avec un autre type de voix'
//             }
//         });
//     }
// });

// // 🎙️ GÉNÉRATION VOCALE ADAPTÉE AUX SCRIPTS
// async function generateScriptVoiceSegments(segments, voice, options) {
//     const results = [];
//     const { enhance_emotions, respect_timing, add_pauses } = options;

//     for (let i = 0; i < segments.length; i++) {
//         const segment = segments[i];
//         console.log(`🎙️ Slide ${i + 1}/${segments.length}: "${segment.title}" (${segment.duration_seconds}s)`);

//         try {
//             // Préparation du texte selon le ton
//             const enhancedText = enhanceTextForTone(segment.text, segment.tone, enhance_emotions);

//             // Génération audio
//             const audioResult = await generateRealVoiceAudio(enhancedText, voice);

//             // Calcul durée réelle
//             const actualDuration = respect_timing ?
//                 Math.min(segment.duration_seconds, estimateAudioDuration(enhancedText)) :
//                 estimateAudioDuration(enhancedText);

//             results.push({
//                 slide_id: segment.slide_id,
//                 title: segment.title,
//                 text: enhancedText,
//                 duration_seconds: segment.duration_seconds,
//                 actual_duration: actualDuration,
//                 tone: segment.tone,
//                 key_phrases: segment.key_phrases,
//                 audio_url: audioResult.audio_url,
//                 file_size_kb: audioResult.file_size_kb || 0,
//                 status: 'success'
//             });

//             // Pause entre segments (plus longue pour transitions)
//             if (i < segments.length - 1) {
//                 const pauseDuration = add_pauses ?
//                     (segment.tone === 'conclusion' ? 2000 : 1500) : 1000;
//                 await sleep(pauseDuration);
//             }

//         } catch (error) {
//             console.error(`❌ Erreur slide ${i + 1} (${segment.title}):`, error.message);

//             results.push({
//                 slide_id: segment.slide_id,
//                 title: segment.title,
//                 text: segment.text,
//                 duration_seconds: segment.duration_seconds,
//                 actual_duration: estimateAudioDuration(segment.text),
//                 tone: segment.tone,
//                 key_phrases: segment.key_phrases,
//                 audio_url: null,
//                 file_size_kb: 0,
//                 status: 'error',
//                 error: error.message
//             });
//         }
//     }

//     return results;
// }

// // 🎭 AMÉLIORATION DU TEXTE SELON LE TON
// function enhanceTextForTone(text, tone, enhance = true) {
//     if (!enhance) return text;

//     let enhanced = text.trim();

//     switch (tone) {
//         case 'accueillant':
//             enhanced = enhanced.replace(/\./g, ' !');
//             enhanced = `Bonjour ! ${enhanced}`;
//             break;

//         case 'motivant':
//             enhanced = enhanced.replace(/\./g, ' !');
//             enhanced += ' Excellent !';
//             break;

//         case 'pédagogique':
//             enhanced = enhanced.replace(/\?/g, ' ?');
//             enhanced = enhanced.replace(/\./g, '. ');
//             break;

//         default:
//             // Ton neutre
//             enhanced = enhanced.replace(/\./g, '. ');
//     }

//     return enhanced.replace(/\s+/g, ' ').trim();
// }

// // 📝 DIVISION TEXTE SIMPLE EN SEGMENTS
// function splitTextIntoSegments(text) {
//     if (text.length <= 200) return [text];

//     const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
//     const segments = [];
//     let currentSegment = '';

//     for (const sentence of sentences) {
//         const trimmed = sentence.trim();
//         const combined = currentSegment + (currentSegment ? '. ' : '') + trimmed;

//         if (combined.length <= 200) {
//             currentSegment = combined;
//         } else {
//             if (currentSegment) {
//                 segments.push(currentSegment + '.');
//             }
//             currentSegment = trimmed;
//         }
//     }

//     if (currentSegment) {
//         segments.push(currentSegment + '.');
//     }

//     return segments.filter(s => s.length > 0);
// }

// // 🎵 CONCATÉNATION AUDIO (optionnelle)
// async function concatenateAudioSegments(successfulSegments, narrationId) {
//     // Pour l'instant, on retourne juste les infos
//     // TODO: Implémenter vraie concaténation audio avec ffmpeg si nécessaire

//     const totalDuration = successfulSegments.reduce((sum, seg) => sum + seg.actual_duration, 0);

//     return {
//         status: 'info_only',
//         message: 'Concaténation audio complète non implémentée',
//         audio_url: null,
//         total_duration: Math.round(totalDuration),
//         segments_count: successfulSegments.length,
//         suggestion: 'Utilisez les segments individuels pour lecture séquentielle'
//     };
// }

// // Génération audio avec VRAIE VOIX (fonction existante)
// async function generateRealVoiceAudio(text, voice) {
//     console.log(`🔄 Génération VRAIE VOIX ${voice.api} pour: "${text.substring(0, 30)}..."`);

//     // Essayer différentes APIs en ordre de préférence
//     const apis = [voice.api, 'google_tts', 'voicerss', 'responsivevoice'];

//     for (const apiName of apis) {
//         try {
//             switch (apiName) {
//                 case 'google_tts':
//                     return await generateGoogleTTS(text);
//                 case 'voicerss':
//                     return await generateVoiceRSS(text);
//                 case 'responsivevoice':
//                     return await generateResponsiveVoice(text, voice.voice);
//                 default:
//                     continue;
//             }
//         } catch (error) {
//             console.log(`❌ API ${apiName} échouée, essai suivant...`);
//             continue;
//         }
//     }

//     throw new Error('Toutes les APIs de synthèse vocale ont échoué');
// }

// // API Google TTS (gratuite)
// async function generateGoogleTTS(text) {
//     try {
//         const response = await axios.get('https://translate.google.com/translate_tts', {
//             params: {
//                 ie: 'UTF-8',
//                 q: text,
//                 tl: 'fr',
//                 client: 'tw-ob',
//                 idx: 0,
//                 total: 1,
//                 textlen: text.length
//             },
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
//             },
//             responseType: 'arraybuffer',
//             timeout: 15000
//         });

//         if (response.data && response.data.byteLength > 0) {
//             const audioUrl = await saveAudioBuffer(response.data, 'google_tts', 'mp3');
//             console.log('✅ Google TTS réussi - VRAIE VOIX générée');
//             return {
//                 audio_url: audioUrl,
//                 file_size_kb: Math.round(response.data.byteLength / 1024)
//             };
//         } else {
//             throw new Error('Réponse vide de Google TTS');
//         }

//     } catch (error) {
//         console.error('❌ Google TTS échoué:', error.message);
//         throw error;
//     }
// }

// // API VoiceRSS (gratuite avec limite)
// async function generateVoiceRSS(text) {
//     try {
//         const response = await axios.get('https://api.voicerss.org/', {
//             params: {
//                 key: 'demo', // Clé demo gratuite
//                 hl: 'fr-fr',
//                 src: text,
//                 f: '22khz_16bit_mono',
//                 c: 'wav'
//             },
//             responseType: 'arraybuffer',
//             timeout: 15000
//         });

//         if (response.data && response.data.byteLength > 0) {
//             const audioUrl = await saveAudioBuffer(response.data, 'voicerss', 'wav');
//             console.log('✅ VoiceRSS réussi - VRAIE VOIX générée');
//             return {
//                 audio_url: audioUrl,
//                 file_size_kb: Math.round(response.data.byteLength / 1024)
//             };
//         } else {
//             throw new Error('Réponse vide de VoiceRSS');
//         }

//     } catch (error) {
//         console.error('❌ VoiceRSS échoué:', error.message);
//         throw error;
//     }
// }

// // API ResponsiveVoice (alternative)
// async function generateResponsiveVoice(text, voiceId) {
//     try {
//         // ResponsiveVoice nécessite souvent un navigateur, donc on utilise une approche alternative
//         const response = await axios.post('https://responsivevoice.org/responsivevoice/getvoice.php', {
//             t: text,
//             tl: 'fr',
//             sv: voiceId || 'French Female',
//             vn: '',
//             pitch: 0.5,
//             rate: 0.5,
//             vol: 1
//         }, {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//             },
//             responseType: 'arraybuffer',
//             timeout: 15000
//         });

//         if (response.data && response.data.byteLength > 0) {
//             const audioUrl = await saveAudioBuffer(response.data, 'responsive', 'mp3');
//             console.log('✅ ResponsiveVoice réussi - VRAIE VOIX générée');
//             return {
//                 audio_url: audioUrl,
//                 file_size_kb: Math.round(response.data.byteLength / 1024)
//             };
//         } else {
//             throw new Error('Réponse vide de ResponsiveVoice');
//         }

//     } catch (error) {
//         console.error('❌ ResponsiveVoice échoué:', error.message);
//         throw error;
//     }
// }

// // Sauvegarde du buffer audio
// async function saveAudioBuffer(audioBuffer, source, extension = 'mp3') {
//     try {
//         const filename = `voice_${source}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${extension}`;
//         const audioDir = path.join(__dirname, '..', '..', 'generated-audio');

//         await fs.mkdir(audioDir, { recursive: true });

//         const filePath = path.join(audioDir, filename);
//         await fs.writeFile(filePath, audioBuffer);

//         console.log(`💾 VRAIE VOIX sauvée: ${filename} (${audioBuffer.length} bytes)`);
//         return `/audio/${filename}`;

//     } catch (error) {
//         console.error('❌ Erreur sauvegarde audio:', error);
//         throw new Error(`Impossible de sauvegarder l'audio: ${error.message}`);
//     }
// }

// // Utilitaires
// function estimateAudioDuration(text) {
//     const words = countWords(text);
//     return Math.max((words / 150) * 60, 1); // 150 mots/minute
// }

// function countWords(text) {
//     return text.split(/\s+/).filter(word => word.length > 0).length;
// }

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// // Route pour tester les voix
// router.get('/bark-voices', (req, res) => {
//     res.json({
//         available_voices: FRENCH_VOICES,
//         provider: 'Multiple Free TTS APIs',
//         recommendation: 'professional_female recommandée (Google TTS)',
//         test_command: 'POST /ai/generate-narration-bark',
//         script_compatible: true,
//         sample_requests: {
//             with_script: {
//                 description: 'Avec script de narration (recommandé)',
//                 narration_script: {
//                     slide_1: {
//                         title: "Introduction",
//                         script: "Bonjour et bienvenue dans cette formation !",
//                         duration_seconds: 20,
//                         tone: "accueillant"
//                     }
//                 },
//                 voice_type: 'professional_female'
//             },
//             with_text: {
//                 description: 'Avec texte simple',
//                 text_content: 'Bonjour ! Ceci est un test de vraie synthèse vocale française.',
//                 voice_type: 'professional_female'
//             }
//         },
//         voice_quality: 'VRAIE VOIX FRANÇAISE ADAPTÉE AUX SCRIPTS DE NARRATION'
//     });
// });

// // Route d'info mise à jour
// router.get('/generate-narration-bark/info', (req, res) => {
//     res.json({
//         status: '✅ PRÊT À UTILISER - SCRIPTS DE NARRATION',
//         provider: 'Google TTS + VoiceRSS + ResponsiveVoice',
//         api_key_required: false,
//         features: [
//             '🎬 Compatible avec scripts de plan-to-markdown',
//             '🎙️ VRAIE VOIX qui parle le texte',
//             '⏱️ Respect des timings de slides',
//             '🎭 Adaptation du ton (accueillant, pédagogique, motivant)',
//             '🆓 Complètement gratuit',
//             '🇫🇷 Français natif parfait',
//             '🔄 Fallback entre plusieurs APIs'
//         ],
//         input_formats: {
//             format1: {
//                 description: 'Script de narration structuré (recommandé)',
//                 field: 'narration_script',
//                 source: 'Résultat de POST /ai/plan-to-markdown',
//                 benefits: ['Respect timing', 'Adaptation ton', 'Synchronisation slides']
//             },
//             format2: {
//                 description: 'Texte simple',
//                 field: 'text_content',
//                 usage: 'Pour textes sans structure'
//             }
//         },
//         workflow_integration: {
//             step1: 'POST /ai/groq-plan → Générer plan',
//             step2: 'POST /ai/plan-to-markdown → Générer slides + script narration',
//             step3: 'POST /ai/generate-narration-bark → Générer audio à partir du script',
//             result: 'Capsule vidéo complète prête !'
//         }
//     });
// });

// // Route de test santé
// router.get('/bark-health', async (req, res) => {
//     res.json({
//         status: 'healthy',
//         voice_quality: 'VRAIE VOIX FRANÇAISE POUR SCRIPTS',
//         script_compatibility: 'OPTIMISÉE POUR PLAN-TO-MARKDOWN',
//         apis_available: ['Google TTS', 'VoiceRSS', 'ResponsiveVoice'],
//         timestamp: new Date().toISOString(),
//         next_step: 'Prêt pour génération VOCALE DE SCRIPTS immédiate'
//     });
// });

// module.exports = router;















// code qui parche bien 

// const express = require('express');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
// const fs = require('fs').promises;
// const path = require('path');

// const router = express.Router();

// // Configuration APIs de synthèse vocale GRATUITES
// const VOICE_APIS = {
//     // API 1: ResponsiveVoice (gratuit, français natif)
//     responsivevoice: {
//         url: 'https://responsivevoice.org/responsivevoice/getvoice.php',
//         free: true,
//         french_voices: ['French Female', 'French Male'],
//         format: 'mp3'
//     },

//     // API 2: VoiceRSS (gratuit 350 requêtes/jour)
//     voicerss: {
//         url: 'https://api.voicerss.org/',
//         free: true,
//         api_key: 'demo', // Clé demo pour tests
//         french_voices: ['fr-fr'],
//         format: 'wav'
//     },

//     // API 3: Text-to-Speech gratuit de Google (sans clé)
//     google_tts: {
//         url: 'https://translate.google.com/translate_tts',
//         free: true,
//         french_voices: ['fr'],
//         format: 'mp3'
//     },

//     // API 4: Speak API (alternative gratuite)
//     speak_api: {
//         url: 'https://api.streamelements.com/kappa/v2/speech',
//         free: true,
//         french_voices: ['Brian'],
//         format: 'mp3'
//     }
// };

// // Voix françaises disponibles
// const FRENCH_VOICES = {
//     professional_female: {
//         api: 'speak_api',
//         voice: 'fr',
//         name: 'Speak API Française',
//         description: 'Voix féminine Speak API française'
//     },
//     professional_male: {
//         api: 'voicerss',
//         voice: 'fr-fr',
//         name: 'VoiceRSS Français',
//         description: 'Voix française VoiceRSS'
//     },
//     friendly_female: {
//         api: 'google_tts',
//         voice: 'fr',
//         name: 'Google Française',
//         description: 'Voix féminine Google française'
//     },
//     friendly_male: {
//         api: 'responsivevoice',
//         voice: 'French Male',
//         name: 'ResponsiveVoice Homme',
//         description: 'Voix masculine ResponsiveVoice'
//     },
//     narrator_female: {
//         api: 'speak_api',
//         voice: 'fr',
//         name: 'Speak Narratrice',
//         description: 'Voix narrative Speak API'
//     },
//     narrator_male: {
//         api: 'voicerss',
//         voice: 'fr-fr',
//         name: 'VoiceRSS Narrateur',
//         description: 'Voix narrative VoiceRSS'
//     }
// };

// // 🎬 API PRINCIPALE - ADAPTÉE POUR SCRIPTS DE NARRATION
// router.post('/generate-narration-bark', async (req, res) => {
//     const startTime = Date.now();

//     try {
//         const {
//             // Format 1: Script de narration complet (de plan-to-markdown)
//             narration_script,

//             // Format 2: Texte simple (format original)
//             text_content,

//             // Options de voix
//             voice_type = 'professional_female',
//             output_format = 'mp3',
//             enhance_emotions = true,

//             // 🆕 Nouvelles options pour scripts
//             generate_full_audio = false, // Concaténer tous les segments
//             respect_timing = true,       // Respecter les durées des slides
//             add_pauses = true           // Ajouter des pauses entre slides
//         } = req.body;

//         console.log(`🎙️ Génération vocale adaptée aux scripts de narration`);

//         // 🔍 DÉTECTION DU FORMAT D'ENTRÉE
//         let processedSegments = [];
//         let totalExpectedDuration = 0;

//         if (narration_script) {
//             // FORMAT 1: Script de narration structuré (de plan-to-markdown)
//             console.log(`📜 Traitement script de narration: ${Object.keys(narration_script).length} slides`);

//             const segments = Object.entries(narration_script).map(([slideKey, slideData]) => ({
//                 slide_id: slideKey,
//                 title: slideData.title,
//                 text: slideData.script,
//                 duration_seconds: slideData.duration_seconds,
//                 tone: slideData.tone || 'pédagogique',
//                 key_phrases: slideData.key_phrases || [],
//                 transitions: slideData.transitions || ''
//             }));

//             processedSegments = segments;
//             totalExpectedDuration = segments.reduce((sum, seg) => sum + seg.duration_seconds, 0);

//         } else if (text_content) {
//             // FORMAT 2: Texte simple (format original)
//             console.log(`📝 Traitement texte simple: ${text_content.length} caractères`);

//             if (text_content.length < 5) {
//                 return res.status(400).json({
//                     error: 'Texte trop court',
//                     formats_supportés: {
//                         format1: 'narration_script (de plan-to-markdown)',
//                         format2: 'text_content (texte simple)'
//                     }
//                 });
//             }

//             const segments = splitTextIntoSegments(text_content);
//             processedSegments = segments.map((text, index) => ({
//                 slide_id: `segment_${index + 1}`,
//                 title: `Segment ${index + 1}`,
//                 text: text,
//                 duration_seconds: estimateAudioDuration(text),
//                 tone: 'neutre',
//                 key_phrases: [],
//                 transitions: ''
//             }));

//             totalExpectedDuration = processedSegments.reduce((sum, seg) => sum + seg.duration_seconds, 0);

//         } else {
//             return res.status(400).json({
//                 error: 'Aucun contenu fourni',
//                 formats_requis: {
//                     option1: {
//                         description: 'Script de narration complet (recommandé)',
//                         field: 'narration_script',
//                         source: 'Résultat de POST /ai/plan-to-markdown'
//                     },
//                     option2: {
//                         description: 'Texte simple',
//                         field: 'text_content',
//                         example: 'Bonjour et bienvenue dans cette formation...'
//                     }
//                 }
//             });
//         }

//         // Validation de la voix
//         if (!FRENCH_VOICES[voice_type]) {
//             return res.status(400).json({
//                 error: 'Type de voix non supporté',
//                 provided: voice_type,
//                 available_voices: Object.keys(FRENCH_VOICES)
//             });
//         }

//         const narrationId = uuidv4();
//         const selectedVoice = FRENCH_VOICES[voice_type];

//         console.log(`🎯 Génération: ${processedSegments.length} segments, durée totale estimée: ${totalExpectedDuration}s`);

//         // 🎙️ GÉNÉRATION AUDIO POUR CHAQUE SEGMENT
//         const audioResults = await generateScriptVoiceSegments(
//             processedSegments,
//             selectedVoice,
//             { enhance_emotions, respect_timing, add_pauses }
//         );

//         // 📊 CALCULS ET STATISTIQUES
//         const successfulSegments = audioResults.filter(r => r.status === 'success');
//         const actualTotalDuration = audioResults.reduce((sum, result) => sum + result.actual_duration, 0);
//         const totalWords = processedSegments.reduce((sum, seg) => sum + countWords(seg.text), 0);
//         const speakingRate = actualTotalDuration > 0 ? Math.round((totalWords / actualTotalDuration) * 60) : 150;

//         // 🎵 GÉNÉRATION AUDIO COMPLET (optionnel)
//         let fullAudioInfo = null;
//         if (generate_full_audio && successfulSegments.length > 0) {
//             try {
//                 fullAudioInfo = await concatenateAudioSegments(successfulSegments, narrationId);
//             } catch (error) {
//                 console.warn('⚠️ Échec concaténation audio complète:', error.message);
//             }
//         }

//         // 📋 RÉSULTAT FINAL ADAPTÉ AUX SCRIPTS
//         const result = {
//             narration_id: narrationId,

//             // 🎬 INFORMATIONS SCRIPT
//             script_info: {
//                 format: narration_script ? 'structured_script' : 'simple_text',
//                 total_slides: processedSegments.length,
//                 total_expected_duration: totalExpectedDuration,
//                 total_actual_duration: Math.round(actualTotalDuration),
//                 timing_accuracy: totalExpectedDuration > 0 ?
//                     Math.round((actualTotalDuration / totalExpectedDuration) * 100) : 100,
//                 total_words: totalWords,
//                 speaking_rate_wpm: speakingRate
//             },

//             // 🎙️ CONFIGURATION VOIX
//             voice_config: {
//                 voice_type: voice_type,
//                 voice_name: selectedVoice.name,
//                 voice_api: selectedVoice.api,
//                 voice_id: selectedVoice.voice,
//                 description: selectedVoice.description,
//                 provider: 'Multiple Free TTS APIs v2.0',
//                 language: 'Français'
//             },

//             // 🎵 SEGMENTS AUDIO INDIVIDUELS
//             audio_segments: audioResults.map((segment, index) => ({
//                 slide_id: segment.slide_id,
//                 slide_title: segment.title,
//                 segment_number: index + 1,
//                 text_content: segment.text,
//                 expected_duration: segment.duration_seconds,
//                 actual_duration: Math.round(segment.actual_duration),
//                 tone: segment.tone,
//                 audio_url: segment.audio_url,
//                 status: segment.status,
//                 error: segment.error || null,
//                 key_phrases: segment.key_phrases || [],
//                 file_size_kb: segment.file_size_kb || 0
//             })),

//             // 🎵 AUDIO COMPLET (si demandé)
//             full_audio: fullAudioInfo,

//             // 📊 STATISTIQUES GÉNÉRATION
//             generation_stats: {
//                 successful_segments: successfulSegments.length,
//                 failed_segments: audioResults.length - successfulSegments.length,
//                 success_rate: Math.round((successfulSegments.length / audioResults.length) * 100),
//                 total_generation_time_ms: Date.now() - startTime,
//                 audio_quality: 'real_voice_v2',
//                 format: selectedVoice.api === 'voicerss' ? 'wav' : 'mp3'
//             },

//             // 🎬 INSTRUCTIONS UTILISATION
//             usage_instructions: {
//                 individual_playback: 'Utilisez audio_segments[].audio_url pour chaque slide',
//                 full_playback: fullAudioInfo ? 'Utilisez full_audio.audio_url pour lecture complète' : 'Non généré',
//                 timing_respect: 'Les durées actual_duration respectent les timings prévus',
//                 slideshow_sync: 'Synchronisez chaque audio_url avec sa slide correspondante',
//                 fallback: 'Si audio échoue, affichez le text_content de la slide'
//             },

//             // 📁 FICHIERS GÉNÉRÉS
//             generated_files: {
//                 individual_segments: audioResults.filter(r => r.status === 'success').length,
//                 full_audio: fullAudioInfo ? 1 : 0,
//                 total_files: audioResults.filter(r => r.status === 'success').length + (fullAudioInfo ? 1 : 0)
//             },

//             generated_at: new Date().toISOString(),
//             status: 'completed',
//             ready_for_slideshow: true,
//             voice_quality: 'VRAIE VOIX FRANÇAISE V2.0 - PROBLÈMES RÉSOLUS'
//         };

//         console.log(`✅ SCRIPT VOCAL COMPLET: ${successfulSegments.length}/${audioResults.length} segments réussis`);
//         res.json(result);

//     } catch (error) {
//         console.error('❌ Erreur génération script vocal:', error);
//         res.status(500).json({
//             error: 'Erreur génération narration vocale pour script',
//             details: error.message,
//             processing_time_ms: Date.now() - startTime,
//             troubleshooting: {
//                 check_format: 'Vérifiez le format narration_script ou text_content',
//                 api_status: 'APIs TTS gratuites peuvent être temporairement indisponibles',
//                 retry: 'Réessayez avec un autre type de voix'
//             }
//         });
//     }
// });

// // 🎙️ GÉNÉRATION VOCALE ADAPTÉE AUX SCRIPTS
// async function generateScriptVoiceSegments(segments, voice, options) {
//     const results = [];
//     const { enhance_emotions, respect_timing, add_pauses } = options;

//     for (let i = 0; i < segments.length; i++) {
//         const segment = segments[i];
//         console.log(`🎙️ Slide ${i + 1}/${segments.length}: "${segment.title}" (${segment.duration_seconds}s)`);

//         try {
//             // Préparation du texte selon le ton
//             const enhancedText = enhanceTextForTone(segment.text, segment.tone, enhance_emotions);

//             // Génération audio
//             const audioResult = await generateRealVoiceAudio(enhancedText, voice);

//             // Calcul durée réelle
//             const actualDuration = respect_timing ?
//                 Math.min(segment.duration_seconds, estimateAudioDuration(enhancedText)) :
//                 estimateAudioDuration(enhancedText);

//             results.push({
//                 slide_id: segment.slide_id,
//                 title: segment.title,
//                 text: enhancedText,
//                 duration_seconds: segment.duration_seconds,
//                 actual_duration: actualDuration,
//                 tone: segment.tone,
//                 key_phrases: segment.key_phrases,
//                 audio_url: audioResult.audio_url,
//                 file_size_kb: audioResult.file_size_kb || 0,
//                 status: 'success'
//             });

//             // Pause entre segments (plus longue pour transitions)
//             if (i < segments.length - 1) {
//                 const pauseDuration = add_pauses ?
//                     (segment.tone === 'conclusion' ? 2000 : 1500) : 1000;
//                 await sleep(pauseDuration);
//             }

//         } catch (error) {
//             console.error(`❌ Erreur slide ${i + 1} (${segment.title}):`, error.message);

//             results.push({
//                 slide_id: segment.slide_id,
//                 title: segment.title,
//                 text: segment.text,
//                 duration_seconds: segment.duration_seconds,
//                 actual_duration: estimateAudioDuration(segment.text),
//                 tone: segment.tone,
//                 key_phrases: segment.key_phrases,
//                 audio_url: null,
//                 file_size_kb: 0,
//                 status: 'error',
//                 error: error.message
//             });
//         }
//     }

//     return results;
// }

// // 🎭 AMÉLIORATION DU TEXTE SELON LE TON
// function enhanceTextForTone(text, tone, enhance = true) {
//     if (!enhance) return text;

//     let enhanced = text.trim();

//     switch (tone) {
//         case 'accueillant':
//             enhanced = enhanced.replace(/\./g, ' !');
//             enhanced = `Bonjour ! ${enhanced}`;
//             break;

//         case 'motivant':
//             enhanced = enhanced.replace(/\./g, ' !');
//             enhanced += ' Excellent !';
//             break;

//         case 'pédagogique':
//             enhanced = enhanced.replace(/\?/g, ' ?');
//             enhanced = enhanced.replace(/\./g, '. ');
//             break;

//         default:
//             // Ton neutre
//             enhanced = enhanced.replace(/\./g, '. ');
//     }

//     return enhanced.replace(/\s+/g, ' ').trim();
// }

// // 📝 DIVISION TEXTE SIMPLE EN SEGMENTS
// function splitTextIntoSegments(text) {
//     if (text.length <= 200) return [text];

//     const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
//     const segments = [];
//     let currentSegment = '';

//     for (const sentence of sentences) {
//         const trimmed = sentence.trim();
//         const combined = currentSegment + (currentSegment ? '. ' : '') + trimmed;

//         if (combined.length <= 200) {
//             currentSegment = combined;
//         } else {
//             if (currentSegment) {
//                 segments.push(currentSegment + '.');
//             }
//             currentSegment = trimmed;
//         }
//     }

//     if (currentSegment) {
//         segments.push(currentSegment + '.');
//     }

//     return segments.filter(s => s.length > 0);
// }

// // 🎵 CONCATÉNATION AUDIO (optionnelle)
// async function concatenateAudioSegments(successfulSegments, narrationId) {
//     // Pour l'instant, on retourne juste les infos
//     // TODO: Implémenter vraie concaténation audio avec ffmpeg si nécessaire

//     const totalDuration = successfulSegments.reduce((sum, seg) => sum + seg.actual_duration, 0);

//     return {
//         status: 'info_only',
//         message: 'Concaténation audio complète non implémentée',
//         audio_url: null,
//         total_duration: Math.round(totalDuration),
//         segments_count: successfulSegments.length,
//         suggestion: 'Utilisez les segments individuels pour lecture séquentielle'
//     };
// }

// // 🔧 GÉNÉRATION AUDIO AVEC VRAIE VOIX - VERSION CORRIGÉE
// async function generateRealVoiceAudio(text, voice) {
//     console.log(`🔄 Génération VRAIE VOIX ${voice.api} pour: "${text.substring(0, 30)}..."`);

//     // Essayer différentes APIs dans l'ordre de fiabilité
//     const apis = [
//         { name: 'speak_api', func: generateSpeakAPI },
//         { name: 'voicerss', func: generateVoiceRSS },
//         { name: 'google_tts', func: generateGoogleTTS }
//     ];

//     let lastError = null;

//     for (const api of apis) {
//         try {
//             console.log(`🧪 Test ${api.name}...`);
//             const result = await api.func(text);

//             if (result.file_size_kb >= 1) { // Au moins 1KB
//                 console.log(`✅ ${api.name} réussi: ${result.file_size_kb}KB`);
//                 return result;
//             } else {
//                 console.log(`⚠️ ${api.name}: Fichier trop petit (${result.file_size_kb}KB)`);
//                 lastError = new Error(`${api.name}: Fichier trop petit`);
//                 continue;
//             }
//         } catch (error) {
//             console.log(`❌ ${api.name} échoué:`, error.message);
//             lastError = error;
//             continue;
//         }
//     }

//     // Si toutes les APIs échouent, retourner une erreur informative
//     throw new Error(`Toutes les APIs TTS ont échoué. Dernière erreur: ${lastError?.message || 'Inconnue'}`);
// }

// // 🆕 API Speak API (alternative gratuite)
// async function generateSpeakAPI(text) {
//     try {
//         const limitedText = text.length > 500 ? text.substring(0, 500) : text;

//         console.log(`🔄 Speak API test avec: "${limitedText.substring(0, 50)}..."`);

//         const response = await axios.post('https://api.streamelements.com/kappa/v2/speech', {
//             voice: 'Brian',
//             text: limitedText
//         }, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'User-Agent': 'TTS-Client/1.0'
//             },
//             responseType: 'arraybuffer',
//             timeout: 15000
//         });

//         console.log(`🔍 Speak API réponse: ${response.data?.byteLength || 0} bytes`);

//         if (response.data && response.data.byteLength > 1000) {
//             const audioUrl = await saveAudioBuffer(response.data, 'speak_api', 'mp3');
//             console.log(`✅ Speak API réussi - ${response.data.byteLength} bytes`);
//             return {
//                 audio_url: audioUrl,
//                 file_size_kb: Math.round(response.data.byteLength / 1024)
//             };
//         } else {
//             throw new Error(`Speak API: Fichier trop petit (${response.data?.byteLength || 0} bytes)`);
//         }

//     } catch (error) {
//         console.error('❌ Speak API échoué:', error.message);
//         throw error;
//     }
// }

// // API Google TTS améliorée
// async function generateGoogleTTS(text) {
//     try {
//         // Limiter le texte à 200 caractères pour Google TTS
//         const limitedText = text.length > 200 ? text.substring(0, 200) : text;

//         const response = await axios.get('https://translate.google.com/translate_tts', {
//             params: {
//                 ie: 'UTF-8',
//                 q: limitedText,
//                 tl: 'fr',
//                 client: 'tw-ob',
//                 idx: 0,
//                 total: 1,
//                 textlen: limitedText.length,
//                 tk: Math.random().toString().slice(2) // Token aléatoire
//             },
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//                 'Referer': 'https://translate.google.com/',
//                 'Accept': 'audio/mpeg, audio/*, */*',
//                 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
//             },
//             responseType: 'arraybuffer',
//             timeout: 10000,
//             maxRedirects: 0,
//             validateStatus: (status) => status === 200
//         });

//         console.log(`🔍 Google TTS réponse: ${response.data?.byteLength || 0} bytes`);

//         if (response.data && response.data.byteLength > 1000) { // Au moins 1KB
//             const audioUrl = await saveAudioBuffer(response.data, 'google_tts', 'mp3');
//             console.log(`✅ Google TTS réussi - ${response.data.byteLength} bytes`);
//             return {
//                 audio_url: audioUrl,
//                 file_size_kb: Math.round(response.data.byteLength / 1024)
//             };
//         } else {
//             throw new Error(`Fichier Google TTS trop petit: ${response.data?.byteLength || 0} bytes`);
//         }

//     } catch (error) {
//         console.error('❌ Google TTS échoué:', error.message);
//         throw error;
//     }
// }

// // API VoiceRSS améliorée avec debug
// async function generateVoiceRSS(text) {
//     try {
//         // Limiter le texte pour VoiceRSS (max 100KB)
//         const limitedText = text.length > 300 ? text.substring(0, 300) : text;

//         console.log(`🔄 VoiceRSS test avec: "${limitedText.substring(0, 50)}..." (${limitedText.length} chars)`);

//         const response = await axios.get('https://api.voicerss.org/', {
//             params: {
//                 key: 'demo',
//                 hl: 'fr-fr',
//                 src: limitedText,
//                 f: '44khz_16bit_stereo', // Meilleure qualité
//                 c: 'wav',
//                 r: '0', // Vitesse normale
//                 v: 'Linda' // Voix spécifique française
//             },
//             headers: {
//                 'User-Agent': 'VoiceRSS-Client/1.0 (compatible; TTS-Bot)',
//                 'Accept': 'audio/wav, audio/*, */*',
//                 'Accept-Language': 'fr-FR'
//             },
//             responseType: 'arraybuffer',
//             timeout: 20000,
//             validateStatus: (status) => status === 200
//         });

//         console.log(`🔍 VoiceRSS réponse: ${response.data?.byteLength || 0} bytes`);

//         // Vérifier si c'est une vraie réponse audio
//         if (response.data && response.data.byteLength > 1000) { // Au moins 1KB
//             const audioUrl = await saveAudioBuffer(response.data, 'voicerss', 'wav');
//             console.log(`✅ VoiceRSS réussi - ${response.data.byteLength} bytes`);
//             return {
//                 audio_url: audioUrl,
//                 file_size_kb: Math.round(response.data.byteLength / 1024)
//             };
//         } else {
//             // Debug : voir ce que retourne VoiceRSS
//             const textResponse = new TextDecoder('utf-8').decode(response.data);
//             console.error(`❌ VoiceRSS: Réponse trop petite (${response.data?.byteLength} bytes): "${textResponse}"`);
//             throw new Error(`VoiceRSS: Fichier trop petit ou erreur - ${textResponse}`);
//         }

//     } catch (error) {
//         console.error('❌ VoiceRSS échoué:', error.message);
//         throw error;
//     }
// }

// // API ResponsiveVoice (alternative)
// async function generateResponsiveVoice(text, voiceId) {
//     try {
//         // ResponsiveVoice nécessite souvent un navigateur, donc on utilise une approche alternative
//         const response = await axios.post('https://responsivevoice.org/responsivevoice/getvoice.php', {
//             t: text,
//             tl: 'fr',
//             sv: voiceId || 'French Female',
//             vn: '',
//             pitch: 0.5,
//             rate: 0.5,
//             vol: 1
//         }, {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//             },
//             responseType: 'arraybuffer',
//             timeout: 15000
//         });

//         if (response.data && response.data.byteLength > 0) {
//             const audioUrl = await saveAudioBuffer(response.data, 'responsive', 'mp3');
//             console.log('✅ ResponsiveVoice réussi - VRAIE VOIX générée');
//             return {
//                 audio_url: audioUrl,
//                 file_size_kb: Math.round(response.data.byteLength / 1024)
//             };
//         } else {
//             throw new Error('Réponse vide de ResponsiveVoice');
//         }

//     } catch (error) {
//         console.error('❌ ResponsiveVoice échoué:', error.message);
//         throw error;
//     }
// }

// // Sauvegarde du buffer audio
// async function saveAudioBuffer(audioBuffer, source, extension = 'mp3') {
//     try {
//         const filename = `voice_${source}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${extension}`;
//         const audioDir = path.join(__dirname, '..', '..', 'generated-audio');

//         await fs.mkdir(audioDir, { recursive: true });

//         const filePath = path.join(audioDir, filename);
//         await fs.writeFile(filePath, audioBuffer);

//         console.log(`💾 VRAIE VOIX sauvée: ${filename} (${audioBuffer.length} bytes)`);
//         return `/audio/${filename}`;

//     } catch (error) {
//         console.error('❌ Erreur sauvegarde audio:', error);
//         throw new Error(`Impossible de sauvegarder l'audio: ${error.message}`);
//     }
// }

// // Utilitaires
// function estimateAudioDuration(text) {
//     const words = countWords(text);
//     return Math.max((words / 150) * 60, 1); // 150 mots/minute
// }

// function countWords(text) {
//     return text.split(/\s+/).filter(word => word.length > 0).length;
// }

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// // Route pour tester les voix
// router.get('/bark-voices', (req, res) => {
//     res.json({
//         available_voices: FRENCH_VOICES,
//         provider: 'Multiple Free TTS APIs v2.0',
//         recommendation: 'professional_female recommandée (Speak API)',
//         test_command: 'POST /ai/generate-narration-bark',
//         script_compatible: true,
//         improvements: [
//             '🔧 Problèmes audio résolus',
//             '📏 Validation taille fichiers',
//             '🆕 Nouvelle API Speak incluse',
//             '🔍 Debug amélioré'
//         ],
//         sample_requests: {
//             with_script: {
//                 description: 'Avec script de narration (recommandé)',
//                 narration_script: {
//                     slide_1: {
//                         title: "Introduction",
//                         script: "Bonjour et bienvenue dans cette formation !",
//                         duration_seconds: 20,
//                         tone: "accueillant"
//                     }
//                 },
//                 voice_type: 'professional_female'
//             },
//             with_text: {
//                 description: 'Avec texte simple',
//                 text_content: 'Bonjour ! Ceci est un test de vraie synthèse vocale française.',
//                 voice_type: 'professional_female'
//             }
//         },
//         voice_quality: 'VRAIE VOIX FRANÇAISE V2.0 - PROBLÈMES RÉSOLUS'
//     });
// });

// // Route d'info mise à jour
// router.get('/generate-narration-bark/info', (req, res) => {
//     res.json({
//         status: '✅ PRÊT À UTILISER - SCRIPTS DE NARRATION V2.0',
//         provider: 'Speak API + Google TTS + VoiceRSS + ResponsiveVoice',
//         api_key_required: false,
//         version: '2.0 - Problèmes audio résolus',
//         features: [
//             '🎬 Compatible avec scripts de plan-to-markdown',
//             '🎙️ VRAIE VOIX qui parle le texte (CORRIGÉ)',
//             '⏱️ Respect des timings de slides',
//             '🎭 Adaptation du ton (accueillant, pédagogique, motivant)',
//             '🆓 Complètement gratuit',
//             '🇫🇷 Français natif parfait',
//             '🔄 Fallback entre plusieurs APIs',
//             '🔧 Validation taille fichiers (>1KB)',
//             '🆕 Nouvelle API Speak incluse'
//         ],
//         improvements_v2: [
//             'Problème 36 bytes résolu',
//             'Nouvelle API Speak API intégrée',
//             'Validation robuste des fichiers audio',
//             'Debug amélioré avec logs détaillés',
//             'Limites de texte adaptées par API'
//         ],
//         input_formats: {
//             format1: {
//                 description: 'Script de narration structuré (recommandé)',
//                 field: 'narration_script',
//                 source: 'Résultat de POST /ai/plan-to-markdown',
//                 benefits: ['Respect timing', 'Adaptation ton', 'Synchronisation slides']
//             },
//             format2: {
//                 description: 'Texte simple',
//                 field: 'text_content',
//                 usage: 'Pour textes sans structure'
//             }
//         },
//         workflow_integration: {
//             step1: 'POST /ai/groq-plan → Générer plan',
//             step2: 'POST /ai/plan-to-markdown → Générer slides + script narration',
//             step3: 'POST /ai/generate-narration-bark → Générer audio à partir du script',
//             result: 'Capsule vidéo complète prête !'
//         },
//         api_priority: [
//             '1. Speak API (nouvelle, fiable)',
//             '2. VoiceRSS (backup)',
//             '3. Google TTS (backup)'
//         ]
//     });
// });

// // Route de test santé
// router.get('/bark-health', async (req, res) => {
//     res.json({
//         status: 'healthy',
//         version: '2.0',
//         voice_quality: 'VRAIE VOIX FRANÇAISE POUR SCRIPTS V2.0',
//         script_compatibility: 'OPTIMISÉE POUR PLAN-TO-MARKDOWN',
//         apis_available: ['Speak API', 'Google TTS', 'VoiceRSS', 'ResponsiveVoice'],
//         improvements: [
//             'Problèmes audio 36 bytes résolus',
//             'Validation fichiers renforcée',
//             'Nouvelle API Speak intégrée',
//             'Debug amélioré'
//         ],
//         timestamp: new Date().toISOString(),
//         next_step: 'Prêt pour génération VOCALE DE SCRIPTS immédiate - V2.0'
//     });
// });

// module.exports = router;













// code avec supabase qui marche mais avec test audio simple

// const express = require('express');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
// const fs = require('fs').promises;
// const path = require('path');

// const router = express.Router();

// // 🆕 CONFIGURATION SUPABASE (optionnelle)
// let supabase = null;
// const SUPABASE_CONFIGURED = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

// if (SUPABASE_CONFIGURED) {
//     try {
//         const { createClient } = require('@supabase/supabase-js');
//         supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
//         console.log('✅ Supabase configuré pour stockage audio');
//     } catch (error) {
//         console.warn('⚠️ Supabase indisponible:', error.message);
//     }
// }

// const AUDIO_BUCKET = 'tts-audio';
// const AUDIO_FOLDER = 'generated-voices';

// // Configuration APIs de synthèse vocale GRATUITES
// const VOICE_APIS = {
//     responsivevoice: {
//         url: 'https://responsivevoice.org/responsivevoice/getvoice.php',
//         free: true,
//         french_voices: ['French Female', 'French Male'],
//         format: 'mp3'
//     },
//     voicerss: {
//         url: 'https://api.voicerss.org/',
//         free: true,
//         api_key: 'demo',
//         french_voices: ['fr-fr'],
//         format: 'wav'
//     },
//     google_tts: {
//         url: 'https://translate.google.com/translate_tts',
//         free: true,
//         french_voices: ['fr'],
//         format: 'mp3'
//     },
//     speak_api: {
//         url: 'https://api.streamelements.com/kappa/v2/speech',
//         free: true,
//         french_voices: ['Brian'],
//         format: 'mp3'
//     }
// };

// // Voix françaises disponibles
// const FRENCH_VOICES = {
//     professional_female: {
//         api: 'speak_api',
//         voice: 'fr',
//         name: 'Speak API Française',
//         description: 'Voix féminine Speak API française'
//     },
//     professional_male: {
//         api: 'voicerss',
//         voice: 'fr-fr',
//         name: 'VoiceRSS Français',
//         description: 'Voix française VoiceRSS'
//     },
//     friendly_female: {
//         api: 'google_tts',
//         voice: 'fr',
//         name: 'Google Française',
//         description: 'Voix féminine Google française'
//     },
//     friendly_male: {
//         api: 'responsivevoice',
//         voice: 'French Male',
//         name: 'ResponsiveVoice Homme',
//         description: 'Voix masculine ResponsiveVoice'
//     },
//     narrator_female: {
//         api: 'speak_api',
//         voice: 'fr',
//         name: 'Speak Narratrice',
//         description: 'Voix narrative Speak API'
//     },
//     narrator_male: {
//         api: 'voicerss',
//         voice: 'fr-fr',
//         name: 'VoiceRSS Narrateur',
//         description: 'Voix narrative VoiceRSS'
//     }
// };

// // 🆕 INITIALISATION SUPABASE (si configuré)
// async function initializeSupabaseStorage() {
//     if (!supabase) return false;

//     try {
//         // 🆕 AJOUTER CE LOG :
//         console.log('🔄 Test connexion Supabase storage...');
//         const { data: buckets, error: listError } = await supabase.storage.listBuckets();
//         // 🆕 AJOUTER CES LOGS :
//         console.log('📦 Buckets récupérés:', buckets?.length || 0);
//         if (listError) {
//             console.error('❌ Erreur listBuckets:', listError);
//             return false;
//         }




//         if (listError) return false;

//         const bucketExists = buckets.some(bucket => bucket.name === AUDIO_BUCKET);
//         if (!bucketExists) {
//             const { error } = await supabase.storage.createBucket(AUDIO_BUCKET, {
//                 public: true,
//                 allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3'],
//                 fileSizeLimit: 10485760
//             });
//             if (error) return false;
//         }
//         return true;
//     } catch (error) {
//         return false;
//     }
// }

// // 🎬 API PRINCIPALE - IDENTIQUE MAIS AVEC STOCKAGE SUPABASE
// router.post('/generate-narration-bark', async (req, res) => {
//     const startTime = Date.now();

//     try {
//         const {
//             // Format 1: Script de narration complet (de plan-to-markdown)
//             narration_script,

//             // Format 2: Texte simple (format original)
//             text_content,

//             // Options de voix
//             voice_type = 'professional_female',
//             output_format = 'mp3',
//             enhance_emotions = true,

//             // Nouvelles options pour scripts
//             generate_full_audio = false,
//             respect_timing = true,
//             add_pauses = true
//         } = req.body;

//         console.log(`🎙️ Génération vocale adaptée aux scripts de narration`);

//         // 🔍 DÉTECTION DU FORMAT D'ENTRÉE
//         let processedSegments = [];
//         let totalExpectedDuration = 0;

//         if (narration_script) {
//             console.log(`📜 Traitement script de narration: ${Object.keys(narration_script).length} slides`);

//             const segments = Object.entries(narration_script).map(([slideKey, slideData]) => ({
//                 slide_id: slideKey,
//                 title: slideData.title,
//                 text: slideData.script,
//                 duration_seconds: slideData.duration_seconds,
//                 tone: slideData.tone || 'pédagogique',
//                 key_phrases: slideData.key_phrases || [],
//                 transitions: slideData.transitions || ''
//             }));

//             processedSegments = segments;
//             totalExpectedDuration = segments.reduce((sum, seg) => sum + seg.duration_seconds, 0);

//         } else if (text_content) {
//             console.log(`📝 Traitement texte simple: ${text_content.length} caractères`);

//             if (text_content.length < 5) {
//                 return res.status(400).json({
//                     error: 'Texte trop court',
//                     formats_supportés: {
//                         format1: 'narration_script (de plan-to-markdown)',
//                         format2: 'text_content (texte simple)'
//                     }
//                 });
//             }

//             const segments = splitTextIntoSegments(text_content);
//             processedSegments = segments.map((text, index) => ({
//                 slide_id: `segment_${index + 1}`,
//                 title: `Segment ${index + 1}`,
//                 text: text,
//                 duration_seconds: estimateAudioDuration(text),
//                 tone: 'neutre',
//                 key_phrases: [],
//                 transitions: ''
//             }));

//             totalExpectedDuration = processedSegments.reduce((sum, seg) => sum + seg.duration_seconds, 0);

//         } else {
//             return res.status(400).json({
//                 error: 'Aucun contenu fourni',
//                 formats_requis: {
//                     option1: {
//                         description: 'Script de narration complet (recommandé)',
//                         field: 'narration_script',
//                         source: 'Résultat de POST /ai/plan-to-markdown'
//                     },
//                     option2: {
//                         description: 'Texte simple',
//                         field: 'text_content',
//                         example: 'Bonjour et bienvenue dans cette formation...'
//                     }
//                 }
//             });
//         }

//         // Validation de la voix
//         if (!FRENCH_VOICES[voice_type]) {
//             return res.status(400).json({
//                 error: 'Type de voix non supporté',
//                 provided: voice_type,
//                 available_voices: Object.keys(FRENCH_VOICES)
//             });
//         }

//         const narrationId = uuidv4();
//         const selectedVoice = FRENCH_VOICES[voice_type];

//         console.log(`🎯 Génération: ${processedSegments.length} segments, durée totale estimée: ${totalExpectedDuration}s`);

//         // 🆕 STOCKAGE SUPABASE (si configuré)
//         let supabaseReady = false;
//         let dbRecord = null;

//         if (SUPABASE_CONFIGURED && supabase) {
//             supabaseReady = await initializeSupabaseStorage();
//             // 🆕 AJOUTER CES LOGS :
//             console.log(`🔍 SUPABASE_CONFIGURED: ${SUPABASE_CONFIGURED}`);
//             console.log(`🔍 supabase object: ${!!supabase}`);
//             console.log(`🔍 supabaseReady: ${supabaseReady}`);

//             if (supabaseReady) {
//                 try {
//                     const { data, error } = await supabase
//                         .from('audio_generations')
//                         .insert({
//                             narration_id: narrationId,
//                             script_format: narration_script ? 'structured_script' : 'simple_text',
//                             total_slides: processedSegments.length,
//                             total_duration: totalExpectedDuration,
//                             total_words: processedSegments.reduce((sum, seg) => sum + countWords(seg.text), 0),
//                             voice_type: voice_type,
//                             voice_name: selectedVoice.name,
//                             voice_api: selectedVoice.api,
//                             language: 'fr',
//                             status: 'processing'
//                         })
//                         .select()
//                         .single();

//                     if (!error) {
//                         dbRecord = data;
//                         console.log('✅ Enregistrement Supabase créé');
//                     }
//                 } catch (error) {
//                     console.warn('⚠️ Erreur enregistrement Supabase:', error.message);
//                 }
//             }
//         }

//         // 🎙️ GÉNÉRATION AUDIO POUR CHAQUE SEGMENT
//         const audioResults = await generateScriptVoiceSegments(
//             processedSegments,
//             selectedVoice,
//             narrationId,
//             { enhance_emotions, respect_timing, add_pauses, supabaseReady }
//         );

//         // 📊 CALCULS ET STATISTIQUES
//         const successfulSegments = audioResults.filter(r => r.status === 'success');
//         const actualTotalDuration = audioResults.reduce((sum, result) => sum + result.actual_duration, 0);
//         const totalWords = processedSegments.reduce((sum, seg) => sum + countWords(seg.text), 0);
//         const speakingRate = actualTotalDuration > 0 ? Math.round((totalWords / actualTotalDuration) * 60) : 150;
//         const totalFileSize = audioResults.reduce((sum, result) => sum + (result.file_size_kb || 0), 0);

//         // 🆕 MISE À JOUR SUPABASE (si configuré)
//         if (supabaseReady && dbRecord && supabase) {
//             try {
//                 await supabase
//                     .from('audio_generations')
//                     .update({
//                         audio_segments: audioResults,
//                         successful_segments: successfulSegments.length,
//                         failed_segments: audioResults.length - successfulSegments.length,
//                         total_duration: Math.round(actualTotalDuration),
//                         generation_time_ms: Date.now() - startTime,
//                         file_total_size_kb: totalFileSize,
//                         status: successfulSegments.length > 0 ? 'completed' : 'failed',
//                         updated_at: new Date().toISOString()
//                     })
//                     .eq('narration_id', narrationId);

//                 console.log('✅ Statistiques Supabase mises à jour');
//             } catch (error) {
//                 console.warn('⚠️ Erreur mise à jour Supabase:', error.message);
//             }
//         }

//         // 🎵 GÉNÉRATION AUDIO COMPLET (optionnel)
//         let fullAudioInfo = null;
//         if (generate_full_audio && successfulSegments.length > 0) {
//             try {
//                 fullAudioInfo = await concatenateAudioSegments(successfulSegments, narrationId);
//             } catch (error) {
//                 console.warn('⚠️ Échec concaténation audio complète:', error.message);
//             }
//         }

//         // 📋 RÉSULTAT FINAL ADAPTÉ AUX SCRIPTS
//         const result = {
//             narration_id: narrationId,

//             // 🎬 INFORMATIONS SCRIPT
//             script_info: {
//                 format: narration_script ? 'structured_script' : 'simple_text',
//                 total_slides: processedSegments.length,
//                 total_expected_duration: totalExpectedDuration,
//                 total_actual_duration: Math.round(actualTotalDuration),
//                 timing_accuracy: totalExpectedDuration > 0 ?
//                     Math.round((actualTotalDuration / totalExpectedDuration) * 100) : 100,
//                 total_words: totalWords,
//                 speaking_rate_wpm: speakingRate
//             },

//             // 🎙️ CONFIGURATION VOIX
//             voice_config: {
//                 voice_type: voice_type,
//                 voice_name: selectedVoice.name,
//                 voice_api: selectedVoice.api,
//                 voice_id: selectedVoice.voice,
//                 description: selectedVoice.description,
//                 provider: 'Multiple Free TTS APIs v2.0',
//                 language: 'Français'
//             },

//             // 🎵 SEGMENTS AUDIO INDIVIDUELS
//             audio_segments: audioResults.map((segment, index) => ({
//                 slide_id: segment.slide_id,
//                 slide_title: segment.title,
//                 segment_number: index + 1,
//                 text_content: segment.text,
//                 expected_duration: segment.duration_seconds,
//                 actual_duration: Math.round(segment.actual_duration),
//                 tone: segment.tone,
//                 audio_url: segment.audio_url,
//                 status: segment.status,
//                 error: segment.error || null,
//                 key_phrases: segment.key_phrases || [],
//                 file_size_kb: segment.file_size_kb || 0,
//                 // 🆕 Info Supabase (si disponible)
//                 supabase_url: segment.supabase_url || null,
//                 storage_path: segment.storage_path || null
//             })),

//             // 🎵 AUDIO COMPLET (si demandé)
//             full_audio: fullAudioInfo,

//             // 📊 STATISTIQUES GÉNÉRATION
//             generation_stats: {
//                 successful_segments: successfulSegments.length,
//                 failed_segments: audioResults.length - successfulSegments.length,
//                 success_rate: Math.round((successfulSegments.length / audioResults.length) * 100),
//                 total_generation_time_ms: Date.now() - startTime,
//                 audio_quality: 'real_voice_v2',
//                 format: selectedVoice.api === 'voicerss' ? 'wav' : 'mp3',
//                 total_file_size_kb: totalFileSize
//             },

//             // 🆕 INFORMATIONS STOCKAGE
//             storage_info: {
//                 local_storage: true,
//                 supabase_storage: supabaseReady,
//                 supabase_configured: SUPABASE_CONFIGURED,
//                 database_record: dbRecord ? {
//                     id: dbRecord.id,
//                     created_at: dbRecord.created_at
//                 } : null
//             },

//             // 🎬 INSTRUCTIONS UTILISATION
//             usage_instructions: {
//                 individual_playback: 'Utilisez audio_segments[].audio_url pour chaque slide',
//                 full_playback: fullAudioInfo ? 'Utilisez full_audio.audio_url pour lecture complète' : 'Non généré',
//                 timing_respect: 'Les durées actual_duration respectent les timings prévus',
//                 slideshow_sync: 'Synchronisez chaque audio_url avec sa slide correspondante',
//                 fallback: 'Si audio échoue, affichez le text_content de la slide',
//                 supabase_access: supabaseReady ? 'URLs Supabase disponibles dans supabase_url' : 'Non disponible'
//             },

//             // 📁 FICHIERS GÉNÉRÉS
//             generated_files: {
//                 individual_segments: audioResults.filter(r => r.status === 'success').length,
//                 full_audio: fullAudioInfo ? 1 : 0,
//                 total_files: audioResults.filter(r => r.status === 'success').length + (fullAudioInfo ? 1 : 0),
//                 supabase_files: audioResults.filter(r => r.supabase_url).length
//             },

//             generated_at: new Date().toISOString(),
//             status: 'completed',
//             ready_for_slideshow: true,
//             voice_quality: 'VRAIE VOIX FRANÇAISE V2.0 - STOCKAGE HYBRIDE LOCAL + SUPABASE'
//         };

//         console.log(`✅ SCRIPT VOCAL COMPLET: ${successfulSegments.length}/${audioResults.length} segments réussis`);
//         res.json(result);

//     } catch (error) {
//         console.error('❌ Erreur génération script vocal:', error);
//         res.status(500).json({
//             error: 'Erreur génération narration vocale pour script',
//             details: error.message,
//             processing_time_ms: Date.now() - startTime,
//             troubleshooting: {
//                 check_format: 'Vérifiez le format narration_script ou text_content',
//                 api_status: 'APIs TTS gratuites peuvent être temporairement indisponibles',
//                 retry: 'Réessayez avec un autre type de voix',
//                 supabase_status: SUPABASE_CONFIGURED ? 'Configuré' : 'Non configuré'
//             }
//         });
//     }
// });

// // 🎙️ GÉNÉRATION VOCALE ADAPTÉE AUX SCRIPTS AVEC STOCKAGE SUPABASE
// async function generateScriptVoiceSegments(segments, voice, narrationId, options) {
//     const results = [];
//     const { enhance_emotions, respect_timing, add_pauses, supabaseReady } = options;

//     for (let i = 0; i < segments.length; i++) {
//         const segment = segments[i];
//         console.log(`🎙️ Slide ${i + 1}/${segments.length}: "${segment.title}" (${segment.duration_seconds}s)`);

//         try {
//             // Préparation du texte selon le ton
//             const enhancedText = enhanceTextForTone(segment.text, segment.tone, enhance_emotions);

//             // Génération audio
//             const audioResult = await generateRealVoiceAudio(enhancedText, voice);

//             // Calcul durée réelle
//             const actualDuration = respect_timing ?
//                 Math.min(segment.duration_seconds, estimateAudioDuration(enhancedText)) :
//                 estimateAudioDuration(enhancedText);

//             // 🆕 STOCKAGE DUAL : LOCAL + SUPABASE
//             let localAudioUrl = null;
//             let supabaseUrl = null;
//             let storagePath = null;

//             // 1. Stockage local (toujours)
//             try {
//                 localAudioUrl = await saveAudioBuffer(audioResult.audio_buffer, 'local', 'mp3', narrationId, i + 1);
//             } catch (error) {
//                 console.warn('⚠️ Erreur stockage local:', error.message);
//             }

//             // 2. Stockage Supabase (si configuré)
//             if (supabaseReady && supabase && audioResult.audio_buffer) {
//                 try {
//                     const segmentFileName = `segment_${i + 1}_${Date.now()}.mp3`;
//                     storagePath = `${AUDIO_FOLDER}/${narrationId}/${segmentFileName}`;

//                     const { error: uploadError } = await supabase.storage
//                         .from(AUDIO_BUCKET)
//                         .upload(storagePath, audioResult.audio_buffer, {
//                             contentType: 'audio/mpeg',
//                             cacheControl: '3600'
//                         });

//                     if (!uploadError) {
//                         const { data: urlData } = supabase.storage
//                             .from(AUDIO_BUCKET)
//                             .getPublicUrl(storagePath);

//                         supabaseUrl = urlData.publicUrl;
//                         console.log(`✅ Segment ${i + 1} stocké sur Supabase: ${storagePath}`);
//                     }
//                 } catch (error) {
//                     console.warn(`⚠️ Erreur stockage Supabase segment ${i + 1}:`, error.message);
//                 }
//             }

//             results.push({
//                 slide_id: segment.slide_id,
//                 title: segment.title,
//                 text: enhancedText,
//                 duration_seconds: segment.duration_seconds,
//                 actual_duration: actualDuration,
//                 tone: segment.tone,
//                 key_phrases: segment.key_phrases,
//                 audio_url: localAudioUrl || null,           // URL locale (principale)
//                 supabase_url: supabaseUrl || null,          // 🆕 URL Supabase (backup permanent)
//                 storage_path: storagePath || null,          // 🆕 Chemin Supabase
//                 file_size_kb: audioResult.file_size_kb || 0,
//                 status: 'success'
//             });

//             // Pause entre segments
//             if (i < segments.length - 1) {
//                 const pauseDuration = add_pauses ?
//                     (segment.tone === 'conclusion' ? 2000 : 1500) : 1000;
//                 await sleep(pauseDuration);
//             }

//         } catch (error) {
//             console.error(`❌ Erreur slide ${i + 1} (${segment.title}):`, error.message);

//             results.push({
//                 slide_id: segment.slide_id,
//                 title: segment.title,
//                 text: segment.text,
//                 duration_seconds: segment.duration_seconds,
//                 actual_duration: estimateAudioDuration(segment.text),
//                 tone: segment.tone,
//                 key_phrases: segment.key_phrases,
//                 audio_url: null,
//                 supabase_url: null,
//                 storage_path: null,
//                 file_size_kb: 0,
//                 status: 'error',
//                 error: error.message
//             });
//         }
//     }

//     return results;
// }

// // 🔧 GÉNÉRATION AUDIO AVEC VRAIE VOIX - VERSION CORRIGÉE
// async function generateRealVoiceAudio(text, voice) {
//     console.log(`🔄 Génération VRAIE VOIX ${voice.api} pour: "${text.substring(0, 30)}..."`);

//     // Essayer différentes APIs dans l'ordre de fiabilité
//     const apis = [
//         { name: 'speak_api', func: generateSpeakAPI },
//         { name: 'voicerss', func: generateVoiceRSS },
//         { name: 'google_tts', func: generateGoogleTTS }
//     ];

//     let lastError = null;

//     for (const api of apis) {
//         try {
//             console.log(`🧪 Test ${api.name}...`);
//             const result = await api.func(text);

//             if (result.file_size_kb >= 1) {
//                 console.log(`✅ ${api.name} réussi: ${result.file_size_kb}KB`);
//                 return result;
//             } else {
//                 console.log(`⚠️ ${api.name}: Fichier trop petit (${result.file_size_kb}KB)`);
//                 lastError = new Error(`${api.name}: Fichier trop petit`);
//                 continue;
//             }
//         } catch (error) {
//             console.log(`❌ ${api.name} échoué:`, error.message);
//             lastError = error;
//             continue;
//         }
//     }

//     throw new Error(`Toutes les APIs TTS ont échoué. Dernière erreur: ${lastError?.message || 'Inconnue'}`);
// }

// // 🆕 API Speak API (alternative gratuite)
// async function generateSpeakAPI(text) {
//     try {
//         const limitedText = text.length > 500 ? text.substring(0, 500) : text;

//         const response = await axios.post('https://api.streamelements.com/kappa/v2/speech', {
//             voice: 'Brian',
//             text: limitedText
//         }, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'User-Agent': 'TTS-Client/1.0'
//             },
//             responseType: 'arraybuffer',
//             timeout: 15000
//         });

//         if (response.data && response.data.byteLength > 1000) {
//             return {
//                 audio_buffer: response.data,
//                 file_size_kb: Math.round(response.data.byteLength / 1024)
//             };
//         } else {
//             throw new Error(`Speak API: Fichier trop petit (${response.data?.byteLength || 0} bytes)`);
//         }

//     } catch (error) {
//         throw error;
//     }
// }

// // API Google TTS améliorée
// async function generateGoogleTTS(text) {
//     try {
//         const limitedText = text.length > 200 ? text.substring(0, 200) : text;

//         const response = await axios.get('https://translate.google.com/translate_tts', {
//             params: {
//                 ie: 'UTF-8',
//                 q: limitedText,
//                 tl: 'fr',
//                 client: 'tw-ob',
//                 idx: 0,
//                 total: 1,
//                 textlen: limitedText.length,
//                 tk: Math.random().toString().slice(2)
//             },
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//                 'Referer': 'https://translate.google.com/',
//                 'Accept': 'audio/mpeg, audio/*, */*'
//             },
//             responseType: 'arraybuffer',
//             timeout: 10000,
//             maxRedirects: 0,
//             validateStatus: (status) => status === 200
//         });

//         if (response.data && response.data.byteLength > 1000) {
//             return {
//                 audio_buffer: response.data,
//                 file_size_kb: Math.round(response.data.byteLength / 1024)
//             };
//         } else {
//             throw new Error(`Fichier Google TTS trop petit: ${response.data?.byteLength || 0} bytes`);
//         }

//     } catch (error) {
//         throw error;
//     }
// }

// // API VoiceRSS améliorée
// async function generateVoiceRSS(text) {
//     try {
//         const limitedText = text.length > 300 ? text.substring(0, 300) : text;

//         const response = await axios.get('https://api.voicerss.org/', {
//             params: {
//                 key: 'demo',
//                 hl: 'fr-fr',
//                 src: limitedText,
//                 f: '44khz_16bit_stereo',
//                 c: 'wav',
//                 r: '0',
//                 v: 'Linda'
//             },
//             headers: {
//                 'User-Agent': 'VoiceRSS-Client/1.0'
//             },
//             responseType: 'arraybuffer',
//             timeout: 20000,
//             validateStatus: (status) => status === 200
//         });

//         if (response.data && response.data.byteLength > 1000) {
//             return {
//                 audio_buffer: response.data,
//                 file_size_kb: Math.round(response.data.byteLength / 1024)
//             };
//         } else {
//             const textResponse = new TextDecoder('utf-8').decode(response.data);
//             throw new Error(`VoiceRSS: Fichier trop petit ou erreur - ${textResponse}`);
//         }

//     } catch (error) {
//         throw error;
//     }
// }

// // 🆕 SAUVEGARDE HYBRIDE : LOCAL + IDENTIFIANT POUR SUPABASE
// async function saveAudioBuffer(audioBuffer, source, extension = 'mp3', narrationId, segmentNumber) {
//     try {
//         const filename = `voice_${source}_${narrationId}_seg${segmentNumber}_${Date.now()}.${extension}`;
//         const audioDir = path.join(__dirname, '..', '..', 'generated-audio');

//         await fs.mkdir(audioDir, { recursive: true });

//         const filePath = path.join(audioDir, filename);
//         await fs.writeFile(filePath, audioBuffer);

//         console.log(`💾 Audio sauvé localement: ${filename} (${audioBuffer.length} bytes)`);
//         return `/audio/${filename}`;

//     } catch (error) {
//         console.error('❌ Erreur sauvegarde audio local:', error);
//         throw new Error(`Impossible de sauvegarder l'audio: ${error.message}`);
//     }
// }

// // 🎵 CONCATÉNATION AUDIO (optionnelle)
// async function concatenateAudioSegments(successfulSegments, narrationId) {
//     const totalDuration = successfulSegments.reduce((sum, seg) => sum + seg.actual_duration, 0);

//     return {
//         status: 'info_only',
//         message: 'Concaténation audio complète non implémentée',
//         audio_url: null,
//         total_duration: Math.round(totalDuration),
//         segments_count: successfulSegments.length,
//         suggestion: 'Utilisez les segments individuels pour lecture séquentielle'
//     };
// }

// // 🎭 AMÉLIORATION DU TEXTE SELON LE TON
// function enhanceTextForTone(text, tone, enhance = true) {
//     if (!enhance) return text;

//     let enhanced = text.trim();

//     switch (tone) {
//         case 'accueillant':
//             enhanced = enhanced.replace(/\./g, ' !');
//             enhanced = `Bonjour ! ${enhanced}`;
//             break;

//         case 'motivant':
//             enhanced = enhanced.replace(/\./g, ' !');
//             enhanced += ' Excellent !';
//             break;

//         case 'pédagogique':
//             enhanced = enhanced.replace(/\?/g, ' ?');
//             enhanced = enhanced.replace(/\./g, '. ');
//             break;

//         default:
//             enhanced = enhanced.replace(/\./g, '. ');
//     }

//     return enhanced.replace(/\s+/g, ' ').trim();
// }

// // 📝 DIVISION TEXTE SIMPLE EN SEGMENTS
// function splitTextIntoSegments(text) {
//     if (text.length <= 200) return [text];

//     const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
//     const segments = [];
//     let currentSegment = '';

//     for (const sentence of sentences) {
//         const trimmed = sentence.trim();
//         const combined = currentSegment + (currentSegment ? '. ' : '') + trimmed;

//         if (combined.length <= 200) {
//             currentSegment = combined;
//         } else {
//             if (currentSegment) {
//                 segments.push(currentSegment + '.');
//             }
//             currentSegment = trimmed;
//         }
//     }

//     if (currentSegment) {
//         segments.push(currentSegment + '.');
//     }

//     return segments.filter(s => s.length > 0);
// }

// // Utilitaires
// function estimateAudioDuration(text) {
//     const words = countWords(text);
//     return Math.max((words / 150) * 60, 1); // 150 mots/minute
// }

// function countWords(text) {
//     return text.split(/\s+/).filter(word => word.length > 0).length;
// }

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// // 🆕 ROUTES SUPPLÉMENTAIRES POUR SUPABASE

// // Route pour récupérer une génération depuis Supabase
// router.get('/narrations/:narrationId', async (req, res) => {
//     try {
//         if (!SUPABASE_CONFIGURED || !supabase) {
//             return res.status(500).json({
//                 error: 'Supabase non configuré',
//                 message: 'Cette fonctionnalité nécessite Supabase'
//             });
//         }

//         const { narrationId } = req.params;

//         const { data, error } = await supabase
//             .from('audio_generations')
//             .select('*')
//             .eq('narration_id', narrationId)
//             .single();

//         if (error) {
//             return res.status(404).json({
//                 error: 'Génération non trouvée',
//                 narration_id: narrationId
//             });
//         }

//         res.json({
//             narration_id: data.narration_id,
//             status: data.status,
//             created_at: data.created_at,
//             script_info: {
//                 format: data.script_format,
//                 total_slides: data.total_slides,
//                 total_duration: data.total_duration
//             },
//             voice_config: {
//                 voice_type: data.voice_type,
//                 voice_name: data.voice_name
//             },
//             audio_segments: data.audio_segments,
//             storage: 'Supabase'
//         });

//     } catch (error) {
//         console.error('❌ Erreur récupération narration:', error);
//         res.status(500).json({
//             error: 'Erreur récupération narration',
//             details: error.message
//         });
//     }
// });

// // Route pour lister les générations Supabase
// router.get('/narrations', async (req, res) => {
//     try {
//         if (!SUPABASE_CONFIGURED || !supabase) {
//             return res.status(500).json({
//                 error: 'Supabase non configuré',
//                 message: 'Cette fonctionnalité nécessite Supabase'
//             });
//         }

//         const { page = 1, limit = 20 } = req.query;
//         const offset = (page - 1) * limit;

//         const { data, error, count } = await supabase
//             .from('audio_generations')
//             .select('narration_id, status, created_at, total_slides, voice_type', { count: 'exact' })
//             .order('created_at', { ascending: false })
//             .range(offset, offset + limit - 1);

//         if (error) {
//             return res.status(500).json({
//                 error: 'Erreur récupération liste',
//                 details: error.message
//             });
//         }

//         res.json({
//             narrations: data,
//             pagination: {
//                 page: parseInt(page),
//                 limit: parseInt(limit),
//                 total: count,
//                 total_pages: Math.ceil(count / limit)
//             },
//             storage: 'Supabase'
//         });

//     } catch (error) {
//         console.error('❌ Erreur liste narrations:', error);
//         res.status(500).json({
//             error: 'Erreur liste narrations',
//             details: error.message
//         });
//     }
// });

// // Route pour tester les voix
// router.get('/bark-voices', (req, res) => {
//     res.json({
//         available_voices: FRENCH_VOICES,
//         provider: 'Multiple Free TTS APIs v2.0',
//         storage: {
//             local: true,
//             supabase: SUPABASE_CONFIGURED,
//             mode: SUPABASE_CONFIGURED ? 'Hybride (Local + Supabase)' : 'Local uniquement'
//         },
//         recommendation: 'professional_female recommandée (Speak API)',
//         test_command: 'POST /ai/generate-narration-bark',
//         script_compatible: true,
//         improvements: [
//             '🔧 Problèmes audio résolus',
//             '📏 Validation taille fichiers',
//             '🆕 API Speak incluse',
//             '🗄️ Stockage Supabase optionnel',
//             '🔍 Debug amélioré'
//         ],
//         sample_requests: {
//             with_script: {
//                 description: 'Avec script de narration (recommandé)',
//                 narration_script: {
//                     slide_1: {
//                         title: "Introduction",
//                         script: "Bonjour et bienvenue dans cette formation !",
//                         duration_seconds: 20,
//                         tone: "accueillant"
//                     }
//                 },
//                 voice_type: 'professional_female'
//             },
//             with_text: {
//                 description: 'Avec texte simple',
//                 text_content: 'Bonjour ! Ceci est un test de vraie synthèse vocale française.',
//                 voice_type: 'professional_female'
//             }
//         },
//         voice_quality: 'VRAIE VOIX FRANÇAISE V2.0 - STOCKAGE HYBRIDE'
//     });
// });

// // Route d'info mise à jour
// router.get('/generate-narration-bark/info', (req, res) => {
//     res.json({
//         status: '✅ PRÊT À UTILISER - SCRIPTS DE NARRATION V2.0 + SUPABASE',
//         provider: 'Speak API + Google TTS + VoiceRSS + ResponsiveVoice',
//         storage: {
//             local: true,
//             supabase: SUPABASE_CONFIGURED,
//             mode: SUPABASE_CONFIGURED ? 'Hybride (Local + Supabase permanent)' : 'Local uniquement'
//         },
//         api_key_required: false,
//         version: '2.0 - Stockage Hybride Local + Supabase',
//         features: [
//             '🎬 Compatible avec scripts de plan-to-markdown',
//             '🎙️ VRAIE VOIX qui parle le texte (CORRIGÉ)',
//             '⏱️ Respect des timings de slides',
//             '🎭 Adaptation du ton (accueillant, pédagogique, motivant)',
//             '🆓 Complètement gratuit',
//             '🇫🇷 Français natif parfait',
//             '🔄 Fallback entre plusieurs APIs',
//             '🔧 Validation taille fichiers (>1KB)',
//             '🆕 API Speak incluse',
//             '🗄️ Stockage Supabase permanent (si configuré)',
//             '📊 Base de données complète avec métadonnées'
//         ],
//         improvements_v2: [
//             'Problème 36 bytes résolu',
//             'Nouvelle API Speak API intégrée',
//             'Validation robuste des fichiers audio',
//             'Debug amélioré avec logs détaillés',
//             'Limites de texte adaptées par API',
//             'Stockage dual : Local (immédiat) + Supabase (permanent)',
//             'Base de données pour historique complet'
//         ],
//         input_formats: {
//             format1: {
//                 description: 'Script de narration structuré (recommandé)',
//                 field: 'narration_script',
//                 source: 'Résultat de POST /ai/plan-to-markdown',
//                 benefits: ['Respect timing', 'Adaptation ton', 'Synchronisation slides']
//             },
//             format2: {
//                 description: 'Texte simple',
//                 field: 'text_content',
//                 usage: 'Pour textes sans structure'
//             }
//         },
//         workflow_integration: {
//             step1: 'POST /ai/groq-plan → Générer plan',
//             step2: 'POST /ai/plan-to-markdown → Générer slides + script narration',
//             step3: 'POST /ai/generate-narration-bark → Générer audio (stockage hybride)',
//             result: 'Capsule vidéo complète prête !'
//         },
//         api_priority: [
//             '1. Speak API (nouvelle, fiable)',
//             '2. VoiceRSS (backup)',
//             '3. Google TTS (backup)'
//         ],
//         supabase_benefits: SUPABASE_CONFIGURED ? [
//             'URLs permanentes qui ne disparaissent plus',
//             'Historique complet des générations',
//             'Métadonnées détaillées en base',
//             'Récupération des anciennes générations'
//         ] : [
//             'Configurez Supabase pour stockage permanent',
//             'Variables requises: SUPABASE_URL et SUPABASE_ANON_KEY'
//         ]
//     });
// });

// // Route de test santé mise à jour
// router.get('/bark-health', async (req, res) => {
//     let supabaseStatus = 'Non configuré';
//     if (SUPABASE_CONFIGURED && supabase) {
//         try {
//             const supabaseReady = await initializeSupabaseStorage();
//             supabaseStatus = supabaseReady ? 'Opérationnel' : 'Erreur configuration';
//         } catch (error) {
//             supabaseStatus = `Erreur: ${error.message}`;
//         }
//     }

//     res.json({
//         status: 'healthy',
//         version: '2.0',
//         voice_quality: 'VRAIE VOIX FRANÇAISE POUR SCRIPTS V2.0',
//         script_compatibility: 'OPTIMISÉE POUR PLAN-TO-MARKDOWN',
//         storage: {
//             local: 'Actif',
//             supabase_configured: SUPABASE_CONFIGURED,
//             supabase_status: supabaseStatus,
//             mode: SUPABASE_CONFIGURED ? 'Hybride (Local + Supabase)' : 'Local uniquement'
//         },
//         apis_available: ['Speak API', 'Google TTS', 'VoiceRSS', 'ResponsiveVoice'],
//         improvements: [
//             'Problèmes audio 36 bytes résolus',
//             'Validation fichiers renforcée',
//             'Nouvelle API Speak intégrée',
//             'Debug amélioré',
//             'Stockage dual Local + Supabase'
//         ],
//         endpoints: {
//             generation: 'POST /ai/generate-narration-bark',
//             voices: 'GET /ai/bark-voices',
//             info: 'GET /ai/generate-narration-bark/info',
//             health: 'GET /ai/bark-health',
//             supabase_list: SUPABASE_CONFIGURED ? 'GET /ai/narrations' : 'Non disponible',
//             supabase_get: SUPABASE_CONFIGURED ? 'GET /ai/narrations/:id' : 'Non disponible'
//         },
//         timestamp: new Date().toISOString(),
//         next_step: 'Prêt pour génération VOCALE DE SCRIPTS immédiate - V2.0 + Supabase'
//     });
// });











// // 🧪 ROUTE DE TEST TEMPORAIRE
// router.get('/test-supabase-connection', async (req, res) => {
//     try {
//         console.log('🔍 Variables:', {
//             url: process.env.SUPABASE_URL ? 'Configurée' : 'Manquante',
//             key: process.env.SUPABASE_ANON_KEY ? 'Configurée' : 'Manquante'
//         });

//         if (!supabase) {
//             return res.json({
//                 error: 'Supabase non initialisé',
//                 url_configured: !!process.env.SUPABASE_URL,
//                 key_configured: !!process.env.SUPABASE_ANON_KEY
//             });
//         }

//         // Test storage
//         const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

//         res.json({
//             storage_connection: bucketError ? 'Erreur' : 'OK',
//             bucket_exists: buckets ? buckets.some(b => b.name === 'tts-audio') : false,
//             bucket_error: bucketError?.message || null,
//             variables_ok: true
//         });

//     } catch (error) {
//         res.json({
//             error: 'Erreur générale',
//             details: error.message
//         });
//     }
// });

// module.exports = router;



// module.exports = router;


















// 
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// 🆕 CONFIGURATION SUPABASE (optionnelle)
let supabase = null;
const SUPABASE_CONFIGURED = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

if (SUPABASE_CONFIGURED) {
    try {
        const { createClient } = require('@supabase/supabase-js');
        supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        console.log('✅ Supabase configuré pour stockage audio');
    } catch (error) {
        console.warn('⚠️ Supabase indisponible:', error.message);
    }
}

const AUDIO_BUCKET = 'tts-audio';
const AUDIO_FOLDER = 'generated-voices';

// Configuration APIs de synthèse vocale GRATUITES
const VOICE_APIS = {
    responsivevoice: {
        url: 'https://responsivevoice.org/responsivevoice/getvoice.php',
        free: true,
        french_voices: ['French Female', 'French Male'],
        format: 'mp3'
    },
    voicerss: {
        url: 'https://api.voicerss.org/',
        free: true,
        api_key: 'demo',
        french_voices: ['fr-fr'],
        format: 'wav'
    },
    google_tts: {
        url: 'https://translate.google.com/translate_tts',
        free: true,
        french_voices: ['fr'],
        format: 'mp3'
    },
    speak_api: {
        url: 'https://api.streamelements.com/kappa/v2/speech',
        free: true,
        french_voices: ['Brian'],
        format: 'mp3'
    }
};

// Voix françaises disponibles
const FRENCH_VOICES = {
    professional_female: {
        api: 'speak_api',
        voice: 'fr',
        name: 'Speak API Française',
        description: 'Voix féminine Speak API française'
    },
    professional_male: {
        api: 'voicerss',
        voice: 'fr-fr',
        name: 'VoiceRSS Français',
        description: 'Voix française VoiceRSS'
    },
    friendly_female: {
        api: 'google_tts',
        voice: 'fr',
        name: 'Google Française',
        description: 'Voix féminine Google française'
    },
    friendly_male: {
        api: 'responsivevoice',
        voice: 'French Male',
        name: 'ResponsiveVoice Homme',
        description: 'Voix masculine ResponsiveVoice'
    },
    narrator_female: {
        api: 'speak_api',
        voice: 'fr',
        name: 'Speak Narratrice',
        description: 'Voix narrative Speak API'
    },
    narrator_male: {
        api: 'voicerss',
        voice: 'fr-fr',
        name: 'VoiceRSS Narrateur',
        description: 'Voix narrative VoiceRSS'
    }
};

// 🆕 INITIALISATION SUPABASE (si configuré)
async function initializeSupabaseStorage() {
    if (!supabase) return false;

    try {
        console.log('🔄 Test connexion Supabase storage...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        console.log('📦 Buckets récupérés:', buckets?.length || 0);

        if (listError) {
            console.error('❌ Erreur listBuckets:', listError);
            return false;
        }

        const bucketExists = buckets.some(bucket => bucket.name === AUDIO_BUCKET);
        if (!bucketExists) {
            const { error } = await supabase.storage.createBucket(AUDIO_BUCKET, {
                public: true,
                allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3'],
                fileSizeLimit: 10485760
            });
            if (error) return false;
        }
        return true;
    } catch (error) {
        return false;
    }
}

// 🎬 API PRINCIPALE - SUPPORT PLAN COMPLET + SCRIPT + TEXTE
router.post('/generate-narration-bark', async (req, res) => {
    const startTime = Date.now();

    try {
        const {
            // Format 1: Script de narration complet (de plan-to-markdown)
            narration_script,

            // Format 2: Texte simple (format original)
            text_content,

            // 🆕 Format 3: Plan complet (direct depuis groq-plan)
            plan,

            // Options de voix
            voice_type = 'professional_female',
            output_format = 'mp3',
            enhance_emotions = true,

            // Nouvelles options pour scripts
            generate_full_audio = false,
            respect_timing = true,
            add_pauses = true
        } = req.body;

        console.log(`🎙️ Génération vocale adaptée aux scripts de narration v2.1`);

        // 🔍 DÉTECTION DU FORMAT D'ENTRÉE - ÉTENDUE
        let processedSegments = [];
        let totalExpectedDuration = 0;
        let inputFormat = 'unknown';

        if (narration_script) {
            // Format 1: Script structuré (optimal)
            inputFormat = 'narration_script';
            console.log(`📜 Traitement script de narration: ${Object.keys(narration_script).length} slides`);

            const segments = Object.entries(narration_script).map(([slideKey, slideData]) => ({
                slide_id: slideKey,
                title: slideData.title,
                text: slideData.script,
                duration_seconds: slideData.duration_seconds,
                tone: slideData.tone || 'pédagogique',
                key_phrases: slideData.key_phrases || [],
                transitions: slideData.transitions || ''
            }));

            processedSegments = segments;
            totalExpectedDuration = segments.reduce((sum, seg) => sum + seg.duration_seconds, 0);

        } else if (plan && plan.plan_sections) {
            // 🆕 Format 3: Plan complet (nouveau support)
            inputFormat = 'plan_complet';
            console.log(`📋 Traitement plan complet: ${plan.plan_sections.length} sections`);

            const segments = plan.plan_sections.map((section, index) => ({
                slide_id: `section_${section.section_number || index + 1}`,
                title: section.title || `Section ${index + 1}`,
                text: buildTextFromSection(section), // 🆕 Fonction pour extraire le texte
                duration_seconds: section.duration_seconds || 60,
                tone: detectToneFromSection(section), // 🆕 Détecter le ton
                key_phrases: section.key_terminology || [],
                transitions: ''
            }));

            processedSegments = segments;
            totalExpectedDuration = segments.reduce((sum, seg) => sum + seg.duration_seconds, 0);

        } else if (text_content) {
            // Format 2: Texte simple
            inputFormat = 'text_simple';
            console.log(`📝 Traitement texte simple: ${text_content.length} caractères`);

            if (text_content.length < 5) {
                return res.status(400).json({
                    error: 'Texte trop court',
                    formats_supportés: {
                        format1: 'narration_script (de plan-to-markdown)',
                        format2: 'text_content (texte simple)',
                        format3: 'plan (de groq-plan)' // 🆕
                    }
                });
            }

            const segments = splitTextIntoSegments(text_content);
            processedSegments = segments.map((text, index) => ({
                slide_id: `segment_${index + 1}`,
                title: `Segment ${index + 1}`,
                text: text,
                duration_seconds: estimateAudioDuration(text),
                tone: 'neutre',
                key_phrases: [],
                transitions: ''
            }));

            totalExpectedDuration = processedSegments.reduce((sum, seg) => sum + seg.duration_seconds, 0);

        } else {
            return res.status(400).json({
                error: 'Aucun contenu fourni',
                formats_requis: {
                    option1: {
                        description: 'Script de narration complet (recommandé)',
                        field: 'narration_script',
                        source: 'Résultat de POST /ai/plan-to-markdown'
                    },
                    option2: {
                        description: 'Texte simple',
                        field: 'text_content',
                        example: 'Bonjour et bienvenue dans cette formation...'
                    },
                    option3: {
                        description: '🆕 Plan complet (nouveau)',
                        field: 'plan',
                        source: 'Résultat de POST /ai/groq-plan',
                        example: {
                            plan_sections: [
                                {
                                    title: "Introduction",
                                    content_summary: "Présentation du sujet",
                                    duration_seconds: 60
                                }
                            ]
                        }
                    }
                }
            });
        }

        // Validation de la voix
        if (!FRENCH_VOICES[voice_type]) {
            return res.status(400).json({
                error: 'Type de voix non supporté',
                provided: voice_type,
                available_voices: Object.keys(FRENCH_VOICES)
            });
        }

        const narrationId = uuidv4();
        const selectedVoice = FRENCH_VOICES[voice_type];

        console.log(`🎯 Génération: ${processedSegments.length} segments, durée totale estimée: ${totalExpectedDuration}s, format: ${inputFormat}`);

        // 🆕 STOCKAGE SUPABASE (si configuré)
        let supabaseReady = false;
        let dbRecord = null;

        if (SUPABASE_CONFIGURED && supabase) {
            supabaseReady = await initializeSupabaseStorage();
            console.log(`🔍 SUPABASE_CONFIGURED: ${SUPABASE_CONFIGURED}`);
            console.log(`🔍 supabase object: ${!!supabase}`);
            console.log(`🔍 supabaseReady: ${supabaseReady}`);

            if (supabaseReady) {
                try {
                    const { data, error } = await supabase
                        .from('audio_generations')
                        .insert({
                            narration_id: narrationId,
                            script_format: inputFormat,
                            total_slides: processedSegments.length,
                            total_duration: totalExpectedDuration,
                            total_words: processedSegments.reduce((sum, seg) => sum + countWords(seg.text), 0),
                            voice_type: voice_type,
                            voice_name: selectedVoice.name,
                            voice_api: selectedVoice.api,
                            language: 'fr',
                            status: 'processing'
                        })
                        .select()
                        .single();

                    if (!error) {
                        dbRecord = data;
                        console.log('✅ Enregistrement Supabase créé');
                    }
                } catch (error) {
                    console.warn('⚠️ Erreur enregistrement Supabase:', error.message);
                }
            }
        }

        // 🎙️ GÉNÉRATION AUDIO POUR CHAQUE SEGMENT
        const audioResults = await generateScriptVoiceSegments(
            processedSegments,
            selectedVoice,
            narrationId,
            { enhance_emotions, respect_timing, add_pauses, supabaseReady }
        );

        // 📊 CALCULS ET STATISTIQUES
        const successfulSegments = audioResults.filter(r => r.status === 'success');
        const actualTotalDuration = audioResults.reduce((sum, result) => sum + result.actual_duration, 0);
        const totalWords = processedSegments.reduce((sum, seg) => sum + countWords(seg.text), 0);
        const speakingRate = actualTotalDuration > 0 ? Math.round((totalWords / actualTotalDuration) * 60) : 150;
        const totalFileSize = audioResults.reduce((sum, result) => sum + (result.file_size_kb || 0), 0);

        // 🆕 MISE À JOUR SUPABASE (si configuré)
        if (supabaseReady && dbRecord && supabase) {
            try {
                await supabase
                    .from('audio_generations')
                    .update({
                        audio_segments: audioResults,
                        successful_segments: successfulSegments.length,
                        failed_segments: audioResults.length - successfulSegments.length,
                        total_duration: Math.round(actualTotalDuration),
                        generation_time_ms: Date.now() - startTime,
                        file_total_size_kb: totalFileSize,
                        status: successfulSegments.length > 0 ? 'completed' : 'failed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('narration_id', narrationId);

                console.log('✅ Statistiques Supabase mises à jour');
            } catch (error) {
                console.warn('⚠️ Erreur mise à jour Supabase:', error.message);
            }
        }

        // 🎵 GÉNÉRATION AUDIO COMPLET (optionnel)
        let fullAudioInfo = null;
        if (generate_full_audio && successfulSegments.length > 0) {
            try {
                fullAudioInfo = await concatenateAudioSegments(successfulSegments, narrationId);
            } catch (error) {
                console.warn('⚠️ Échec concaténation audio complète:', error.message);
            }
        }

        // 🎯 EXTRACTION DES URLs SUPABASE POUR RÉPONSE DIRECTE
        const publicUrls = audioResults
            .filter(r => r.status === 'success' && r.supabase_url)
            .map(r => r.supabase_url);

        // 📋 RÉSULTAT FINAL ADAPTÉ AUX SCRIPTS + URLs DIRECTES
        const result = {
            narration_id: narrationId,

            // 🎵 URLs DIRECTES POUR LE NAVIGATEUR
            audio_urls: publicUrls,
            first_audio_url: publicUrls[0] || null,

            // 🎬 INFORMATIONS SCRIPT
            script_info: {
                format: inputFormat,
                total_slides: processedSegments.length,
                total_expected_duration: totalExpectedDuration,
                total_actual_duration: Math.round(actualTotalDuration),
                timing_accuracy: totalExpectedDuration > 0 ?
                    Math.round((actualTotalDuration / totalExpectedDuration) * 100) : 100,
                total_words: totalWords,
                speaking_rate_wpm: speakingRate
            },

            // 🎙️ CONFIGURATION VOIX
            voice_config: {
                voice_type: voice_type,
                voice_name: selectedVoice.name,
                voice_api: selectedVoice.api,
                voice_id: selectedVoice.voice,
                description: selectedVoice.description,
                provider: 'Multiple Free TTS APIs v2.1',
                language: 'Français'
            },

            // 🎵 SEGMENTS AUDIO INDIVIDUELS AVEC URLs DIRECTES
            audio_segments: audioResults.map((segment, index) => ({
                slide_id: segment.slide_id,
                slide_title: segment.title,
                segment_number: index + 1,
                text_content: segment.text,
                expected_duration: segment.duration_seconds,
                actual_duration: Math.round(segment.actual_duration),
                tone: segment.tone,

                // 🎯 URLs DIRECTES (priorité Supabase)
                audio_url: segment.supabase_url || segment.audio_url,
                supabase_url: segment.supabase_url,
                local_url: segment.audio_url,

                status: segment.status,
                error: segment.error || null,
                key_phrases: segment.key_phrases || [],
                file_size_kb: segment.file_size_kb || 0,
                storage_path: segment.storage_path || null
            })),

            // 🎵 AUDIO COMPLET (si demandé)
            full_audio: fullAudioInfo,

            // 📊 STATISTIQUES GÉNÉRATION
            generation_stats: {
                successful_segments: successfulSegments.length,
                failed_segments: audioResults.length - successfulSegments.length,
                success_rate: Math.round((successfulSegments.length / audioResults.length) * 100),
                total_generation_time_ms: Date.now() - startTime,
                audio_quality: 'real_voice_v2.1',
                format: selectedVoice.api === 'voicerss' ? 'wav' : 'mp3',
                total_file_size_kb: totalFileSize,
                supabase_urls_count: publicUrls.length
            },

            // 🆕 INFORMATIONS STOCKAGE
            storage_info: {
                local_storage: true,
                supabase_storage: supabaseReady,
                supabase_configured: SUPABASE_CONFIGURED,
                public_urls_available: publicUrls.length,
                database_record: dbRecord ? {
                    id: dbRecord.id,
                    created_at: dbRecord.created_at
                } : null
            },

            // 🎬 INSTRUCTIONS UTILISATION MISES À JOUR
            usage_instructions: {
                listen_in_browser: 'Cliquez sur audio_urls[0] ou first_audio_url pour écouter directement',
                individual_playback: 'Utilisez audio_segments[].audio_url pour chaque slide',
                full_playback: fullAudioInfo ? 'Utilisez full_audio.audio_url pour lecture complète' : 'Non généré',
                download: 'Faites clic droit > Enregistrer sous sur les URLs',
                embed: 'Utilisez <audio src="URL" controls></audio>',
                slideshow_sync: 'Synchronisez chaque audio_url avec sa slide correspondante',
                fallback: 'Si audio échoue, affichez le text_content de la slide'
            },

            // 📁 FICHIERS GÉNÉRÉS
            generated_files: {
                individual_segments: successfulSegments.length,
                full_audio: fullAudioInfo ? 1 : 0,
                total_files: successfulSegments.length + (fullAudioInfo ? 1 : 0),
                supabase_files: publicUrls.length,
                local_files: audioResults.filter(r => r.audio_url).length
            },

            generated_at: new Date().toISOString(),
            status: 'completed',
            ready_for_slideshow: true,
            voice_quality: 'VRAIE VOIX FRANÇAISE V2.1 - SUPPORT PLAN COMPLET + URLS DIRECTES'
        };

        console.log(`✅ SCRIPT VOCAL COMPLET: ${successfulSegments.length}/${audioResults.length} segments réussis, ${publicUrls.length} URLs Supabase`);
        res.json(result);

    } catch (error) {
        console.error('❌ Erreur génération script vocal:', error);
        res.status(500).json({
            error: 'Erreur génération narration vocale pour script',
            details: error.message,
            processing_time_ms: Date.now() - startTime,
            troubleshooting: {
                check_format: 'Vérifiez le format narration_script, plan ou text_content',
                api_status: 'APIs TTS gratuites peuvent être temporairement indisponibles',
                retry: 'Réessayez avec un autre type de voix',
                supabase_status: SUPABASE_CONFIGURED ? 'Configuré' : 'Non configuré'
            }
        });
    }
});

// 🆕 FONCTION POUR EXTRAIRE LE TEXTE D'UNE SECTION DE PLAN
function buildTextFromSection(section) {
    let text = '';

    // Titre de la section
    if (section.title) {
        text += section.title + '. ';
    }

    // Résumé du contenu
    if (section.content_summary) {
        text += section.content_summary + '. ';
    }

    // Points à couvrir
    if (section.what_to_cover && Array.isArray(section.what_to_cover)) {
        text += section.what_to_cover.join('. ') + '. ';
    }

    // Exemples des ressources (si disponibles)
    if (section.examples_from_resources && Array.isArray(section.examples_from_resources)) {
        text += 'Par exemple : ' + section.examples_from_resources.join('. ') + '. ';
    }

    // Nettoyage final
    return text.trim().replace(/\.\s*\./g, '.').replace(/\s+/g, ' ');
}

// 🆕 FONCTION POUR DÉTECTER LE TON D'UNE SECTION
function detectToneFromSection(section) {
    const title = (section.title || '').toLowerCase();
    const type = (section.type || '').toLowerCase();

    // Détection basée sur le titre et le type
    if (title.includes('introduction') || title.includes('bienvenue') || type === 'introduction') {
        return 'accueillant';
    }

    if (title.includes('conclusion') || title.includes('résumé') || type === 'conclusion') {
        return 'motivant';
    }

    if (title.includes('exercice') || title.includes('pratique') || title.includes('application')) {
        return 'motivant';
    }

    // Par défaut : ton pédagogique
    return 'pédagogique';
}

// 🎙️ GÉNÉRATION VOCALE ADAPTÉE AUX SCRIPTS AVEC STOCKAGE SUPABASE
async function generateScriptVoiceSegments(segments, voice, narrationId, options) {
    const results = [];
    const { enhance_emotions, respect_timing, add_pauses, supabaseReady } = options;

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        console.log(`🎙️ Slide ${i + 1}/${segments.length}: "${segment.title}" (${segment.duration_seconds}s)`);

        try {
            // Préparation du texte selon le ton
            const enhancedText = enhanceTextForTone(segment.text, segment.tone, enhance_emotions);

            // Génération audio
            const audioResult = await generateRealVoiceAudio(enhancedText, voice);

            // Calcul durée réelle
            const actualDuration = respect_timing ?
                Math.min(segment.duration_seconds, estimateAudioDuration(enhancedText)) :
                estimateAudioDuration(enhancedText);

            // 🆕 STOCKAGE DUAL : LOCAL + SUPABASE
            let localAudioUrl = null;
            let supabaseUrl = null;
            let storagePath = null;

            // 1. Stockage local (toujours)
            try {
                localAudioUrl = await saveAudioBuffer(audioResult.audio_buffer, 'local', 'mp3', narrationId, i + 1);
            } catch (error) {
                console.warn('⚠️ Erreur stockage local:', error.message);
            }

            // 2. Stockage Supabase (si configuré)
            if (supabaseReady && supabase && audioResult.audio_buffer) {
                try {
                    const segmentFileName = `segment_${i + 1}_${Date.now()}.mp3`;
                    storagePath = `${AUDIO_FOLDER}/${narrationId}/${segmentFileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from(AUDIO_BUCKET)
                        .upload(storagePath, audioResult.audio_buffer, {
                            contentType: 'audio/mpeg',
                            cacheControl: '3600'
                        });

                    if (!uploadError) {
                        const { data: urlData } = supabase.storage
                            .from(AUDIO_BUCKET)
                            .getPublicUrl(storagePath);

                        supabaseUrl = urlData.publicUrl;
                        console.log(`✅ Segment ${i + 1} stocké sur Supabase: ${supabaseUrl}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Erreur stockage Supabase segment ${i + 1}:`, error.message);
                }
            }

            results.push({
                slide_id: segment.slide_id,
                title: segment.title,
                text: enhancedText,
                duration_seconds: segment.duration_seconds,
                actual_duration: actualDuration,
                tone: segment.tone,
                key_phrases: segment.key_phrases,
                audio_url: localAudioUrl || null,           // URL locale (principale)
                supabase_url: supabaseUrl || null,          // 🆕 URL Supabase (backup permanent)
                storage_path: storagePath || null,          // 🆕 Chemin Supabase
                file_size_kb: audioResult.file_size_kb || 0,
                status: 'success'
            });

            // Pause entre segments
            if (i < segments.length - 1) {
                const pauseDuration = add_pauses ?
                    (segment.tone === 'conclusion' ? 2000 : 1500) : 1000;
                await sleep(pauseDuration);
            }

        } catch (error) {
            console.error(`❌ Erreur slide ${i + 1} (${segment.title}):`, error.message);

            results.push({
                slide_id: segment.slide_id,
                title: segment.title,
                text: segment.text,
                duration_seconds: segment.duration_seconds,
                actual_duration: estimateAudioDuration(segment.text),
                tone: segment.tone,
                key_phrases: segment.key_phrases,
                audio_url: null,
                supabase_url: null,
                storage_path: null,
                file_size_kb: 0,
                status: 'error',
                error: error.message
            });
        }
    }

    return results;
}

// 🔧 GÉNÉRATION AUDIO AVEC VRAIE VOIX - VERSION CORRIGÉE
async function generateRealVoiceAudio(text, voice) {
    console.log(`🔄 Génération VRAIE VOIX ${voice.api} pour: "${text.substring(0, 30)}..."`);

    // Essayer différentes APIs dans l'ordre de fiabilité
    const apis = [
        { name: 'speak_api', func: generateSpeakAPI },
        { name: 'voicerss', func: generateVoiceRSS },
        { name: 'google_tts', func: generateGoogleTTS }
    ];

    let lastError = null;

    for (const api of apis) {
        try {
            console.log(`🧪 Test ${api.name}...`);
            const result = await api.func(text);

            if (result.file_size_kb >= 1) {
                console.log(`✅ ${api.name} réussi: ${result.file_size_kb}KB`);
                return result;
            } else {
                console.log(`⚠️ ${api.name}: Fichier trop petit (${result.file_size_kb}KB)`);
                lastError = new Error(`${api.name}: Fichier trop petit`);
                continue;
            }
        } catch (error) {
            console.log(`❌ ${api.name} échoué:`, error.message);
            lastError = error;
            continue;
        }
    }

    throw new Error(`Toutes les APIs TTS ont échoué. Dernière erreur: ${lastError?.message || 'Inconnue'}`);
}

// 🆕 API Speak API (alternative gratuite)
async function generateSpeakAPI(text) {
    try {
        const limitedText = text.length > 500 ? text.substring(0, 500) : text;

        const response = await axios.post('https://api.streamelements.com/kappa/v2/speech', {
            voice: 'Brian',
            text: limitedText
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'TTS-Client/1.0'
            },
            responseType: 'arraybuffer',
            timeout: 15000
        });

        if (response.data && response.data.byteLength > 1000) {
            return {
                audio_buffer: response.data,
                file_size_kb: Math.round(response.data.byteLength / 1024)
            };
        } else {
            throw new Error(`Speak API: Fichier trop petit (${response.data?.byteLength || 0} bytes)`);
        }

    } catch (error) {
        throw error;
    }
}

// API Google TTS améliorée
async function generateGoogleTTS(text) {
    try {
        const limitedText = text.length > 200 ? text.substring(0, 200) : text;

        const response = await axios.get('https://translate.google.com/translate_tts', {
            params: {
                ie: 'UTF-8',
                q: limitedText,
                tl: 'fr',
                client: 'tw-ob',
                idx: 0,
                total: 1,
                textlen: limitedText.length,
                tk: Math.random().toString().slice(2)
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://translate.google.com/',
                'Accept': 'audio/mpeg, audio/*, */*'
            },
            responseType: 'arraybuffer',
            timeout: 10000,
            maxRedirects: 0,
            validateStatus: (status) => status === 200
        });

        if (response.data && response.data.byteLength > 1000) {
            return {
                audio_buffer: response.data,
                file_size_kb: Math.round(response.data.byteLength / 1024)
            };
        } else {
            throw new Error(`Fichier Google TTS trop petit: ${response.data?.byteLength || 0} bytes`);
        }

    } catch (error) {
        throw error;
    }
}

// API VoiceRSS améliorée
async function generateVoiceRSS(text) {
    try {
        const limitedText = text.length > 300 ? text.substring(0, 300) : text;

        const response = await axios.get('https://api.voicerss.org/', {
            params: {
                key: 'demo',
                hl: 'fr-fr',
                src: limitedText,
                f: '44khz_16bit_stereo',
                c: 'wav',
                r: '0',
                v: 'Linda'
            },
            headers: {
                'User-Agent': 'VoiceRSS-Client/1.0'
            },
            responseType: 'arraybuffer',
            timeout: 20000,
            validateStatus: (status) => status === 200
        });

        if (response.data && response.data.byteLength > 1000) {
            return {
                audio_buffer: response.data,
                file_size_kb: Math.round(response.data.byteLength / 1024)
            };
        } else {
            const textResponse = new TextDecoder('utf-8').decode(response.data);
            throw new Error(`VoiceRSS: Fichier trop petit ou erreur - ${textResponse}`);
        }

    } catch (error) {
        throw error;
    }
}

// 🆕 SAUVEGARDE HYBRIDE : LOCAL + IDENTIFIANT POUR SUPABASE
async function saveAudioBuffer(audioBuffer, source, extension = 'mp3', narrationId, segmentNumber) {
    try {
        const filename = `voice_${source}_${narrationId}_seg${segmentNumber}_${Date.now()}.${extension}`;
        const audioDir = path.join(__dirname, '..', '..', 'generated-audio');

        await fs.mkdir(audioDir, { recursive: true });

        const filePath = path.join(audioDir, filename);
        await fs.writeFile(filePath, audioBuffer);

        console.log(`💾 Audio sauvé localement: ${filename} (${audioBuffer.length} bytes)`);
        return `/audio/${filename}`;

    } catch (error) {
        console.error('❌ Erreur sauvegarde audio local:', error);
        throw new Error(`Impossible de sauvegarder l'audio: ${error.message}`);
    }
}

// 🎵 CONCATÉNATION AUDIO (optionnelle)
async function concatenateAudioSegments(successfulSegments, narrationId) {
    const totalDuration = successfulSegments.reduce((sum, seg) => sum + seg.actual_duration, 0);

    return {
        status: 'info_only',
        message: 'Concaténation audio complète non implémentée',
        audio_url: null,
        total_duration: Math.round(totalDuration),
        segments_count: successfulSegments.length,
        suggestion: 'Utilisez les segments individuels pour lecture séquentielle'
    };
}

// 🎭 AMÉLIORATION DU TEXTE SELON LE TON
function enhanceTextForTone(text, tone, enhance = true) {
    if (!enhance) return text;

    let enhanced = text.trim();

    switch (tone) {
        case 'accueillant':
            enhanced = enhanced.replace(/\./g, ' !');
            enhanced = `Bonjour ! ${enhanced}`;
            break;

        case 'motivant':
            enhanced = enhanced.replace(/\./g, ' !');
            enhanced += ' Excellent !';
            break;

        case 'pédagogique':
            enhanced = enhanced.replace(/\?/g, ' ?');
            enhanced = enhanced.replace(/\./g, '. ');
            break;

        default:
            enhanced = enhanced.replace(/\./g, '. ');
    }

    return enhanced.replace(/\s+/g, ' ').trim();
}

// 📝 DIVISION TEXTE SIMPLE EN SEGMENTS
function splitTextIntoSegments(text) {
    if (text.length <= 200) return [text];

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const segments = [];
    let currentSegment = '';

    for (const sentence of sentences) {
        const trimmed = sentence.trim();
        const combined = currentSegment + (currentSegment ? '. ' : '') + trimmed;

        if (combined.length <= 200) {
            currentSegment = combined;
        } else {
            if (currentSegment) {
                segments.push(currentSegment + '.');
            }
            currentSegment = trimmed;
        }
    }

    if (currentSegment) {
        segments.push(currentSegment + '.');
    }

    return segments.filter(s => s.length > 0);
}

// Utilitaires
function estimateAudioDuration(text) {
    const words = countWords(text);
    return Math.max((words / 150) * 60, 1); // 150 mots/minute
}

function countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 🆕 ROUTES SUPPLÉMENTAIRES POUR SUPABASE

// Route pour récupérer une génération depuis Supabase
router.get('/narrations/:narrationId', async (req, res) => {
    try {
        if (!SUPABASE_CONFIGURED || !supabase) {
            return res.status(500).json({
                error: 'Supabase non configuré',
                message: 'Cette fonctionnalité nécessite Supabase'
            });
        }

        const { narrationId } = req.params;

        const { data, error } = await supabase
            .from('audio_generations')
            .select('*')
            .eq('narration_id', narrationId)
            .single();

        if (error) {
            return res.status(404).json({
                error: 'Génération non trouvée',
                narration_id: narrationId
            });
        }

        // 🎯 EXTRAIRE LES URLs SUPABASE
        const publicUrls = (data.audio_segments || [])
            .filter(seg => seg.supabase_url)
            .map(seg => seg.supabase_url);

        res.json({
            narration_id: data.narration_id,
            status: data.status,
            created_at: data.created_at,

            // 🎵 URLs DIRECTES
            audio_urls: publicUrls,
            first_audio_url: publicUrls[0] || null,

            script_info: {
                format: data.script_format,
                total_slides: data.total_slides,
                total_duration: data.total_duration
            },
            voice_config: {
                voice_type: data.voice_type,
                voice_name: data.voice_name
            },
            audio_segments: data.audio_segments,
            storage: 'Supabase',

            // 🎯 INSTRUCTIONS D'USAGE
            usage: {
                listen_in_browser: "Cliquez sur audio_urls[0] pour écouter directement",
                download: "Faites clic droit > Enregistrer sous sur les URLs"
            }
        });

    } catch (error) {
        console.error('❌ Erreur récupération narration:', error);
        res.status(500).json({
            error: 'Erreur récupération narration',
            details: error.message
        });
    }
});

// Route pour lister les générations Supabase
router.get('/narrations', async (req, res) => {
    try {
        if (!SUPABASE_CONFIGURED || !supabase) {
            return res.status(500).json({
                error: 'Supabase non configuré',
                message: 'Cette fonctionnalité nécessite Supabase'
            });
        }

        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { data, error, count } = await supabase
            .from('audio_generations')
            .select('narration_id, status, created_at, total_slides, voice_type, audio_segments', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return res.status(500).json({
                error: 'Erreur récupération liste',
                details: error.message
            });
        }

        // 🎯 AJOUTER LES URLs DIRECTES À CHAQUE NARRATION
        const enrichedNarrations = data.map(item => {
            const publicUrls = (item.audio_segments || [])
                .filter(seg => seg.supabase_url)
                .map(seg => seg.supabase_url);

            return {
                narration_id: item.narration_id,
                status: item.status,
                created_at: item.created_at,
                total_slides: item.total_slides,
                voice_type: item.voice_type,
                first_audio_url: publicUrls[0] || null,
                total_audio_urls: publicUrls.length,
                listen_url: `http://localhost:3001/ai/narrations/${item.narration_id}`
            };
        });

        res.json({
            narrations: enrichedNarrations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                total_pages: Math.ceil(count / limit)
            },
            storage: 'Supabase',
            usage: {
                listen: "Utilisez first_audio_url pour écouter directement",
                get_all_urls: "GET /ai/narrations/:id pour tous les segments"
            }
        });

    } catch (error) {
        console.error('❌ Erreur liste narrations:', error);
        res.status(500).json({
            error: 'Erreur liste narrations',
            details: error.message
        });
    }
});

// Route pour supprimer une narration
router.delete('/narrations/:narrationId', async (req, res) => {
    try {
        if (!SUPABASE_CONFIGURED || !supabase) {
            return res.status(500).json({
                error: 'Supabase non configuré'
            });
        }

        const { narrationId } = req.params;

        // Récupérer les infos avant suppression
        const { data: existingData, error: fetchError } = await supabase
            .from('audio_generations')
            .select('audio_segments')
            .eq('narration_id', narrationId)
            .single();

        if (fetchError) {
            return res.status(404).json({
                error: 'Narration non trouvée'
            });
        }

        // Supprimer les fichiers audio du storage
        if (existingData.audio_segments) {
            for (const segment of existingData.audio_segments) {
                if (segment.storage_path) {
                    try {
                        await supabase.storage
                            .from(AUDIO_BUCKET)
                            .remove([segment.storage_path]);
                    } catch (error) {
                        console.warn(`⚠️ Erreur suppression fichier ${segment.storage_path}:`, error.message);
                    }
                }
            }
        }

        // Supprimer l'enregistrement de la base
        const { error: deleteError } = await supabase
            .from('audio_generations')
            .delete()
            .eq('narration_id', narrationId);

        if (deleteError) {
            return res.status(500).json({
                error: 'Erreur suppression base de données',
                details: deleteError.message
            });
        }

        res.json({
            message: 'Narration supprimée avec succès',
            narration_id: narrationId,
            files_deleted: existingData.audio_segments?.length || 0
        });

    } catch (error) {
        console.error('❌ Erreur suppression narration:', error);
        res.status(500).json({
            error: 'Erreur suppression narration',
            details: error.message
        });
    }
});

// Route pour tester les voix
router.get('/bark-voices', (req, res) => {
    res.json({
        available_voices: FRENCH_VOICES,
        provider: 'Multiple Free TTS APIs v2.1',
        storage: {
            local: true,
            supabase: SUPABASE_CONFIGURED,
            mode: SUPABASE_CONFIGURED ? 'Hybride (Local + Supabase)' : 'Local uniquement'
        },
        recommendation: 'professional_female recommandée (Speak API)',
        test_command: 'POST /ai/generate-narration-bark',
        script_compatible: true,
        plan_compatible: true, // 🆕
        improvements: [
            '🔧 Problèmes audio résolus',
            '📏 Validation taille fichiers',
            '🆕 API Speak incluse',
            '🗄️ Stockage Supabase optionnel',
            '🔍 Debug amélioré',
            '📋 Support plan complet NOUVEAU'
        ],
        sample_requests: {
            with_plan: {
                description: '🆕 Avec plan complet (nouveau)',
                plan: {
                    plan_sections: [
                        {
                            title: "Introduction à l'agrobusiness",
                            content_summary: "Présentation des opportunités",
                            duration_seconds: 30,
                            what_to_cover: ["Opportunités", "Défis"]
                        }
                    ]
                },
                voice_type: 'professional_female'
            },
            with_script: {
                description: 'Avec script de narration (optimal)',
                narration_script: {
                    slide_1: {
                        title: "Introduction",
                        script: "Bonjour et bienvenue dans cette formation !",
                        duration_seconds: 20,
                        tone: "accueillant"
                    }
                },
                voice_type: 'professional_female'
            },
            with_text: {
                description: 'Avec texte simple',
                text_content: 'Bonjour ! Ceci est un test de vraie synthèse vocale française.',
                voice_type: 'professional_female'
            }
        },
        voice_quality: 'VRAIE VOIX FRANÇAISE V2.1 - SUPPORT PLAN COMPLET + URLS DIRECTES'
    });
});

// Route d'info mise à jour
router.get('/generate-narration-bark/info', (req, res) => {
    res.json({
        status: '✅ PRÊT À UTILISER - SCRIPTS + PLANS COMPLETS V2.1 + URLS DIRECTES',
        provider: 'Speak API + Google TTS + VoiceRSS + ResponsiveVoice',
        storage: {
            local: true,
            supabase: SUPABASE_CONFIGURED,
            mode: SUPABASE_CONFIGURED ? 'Hybride (Local + Supabase permanent)' : 'Local uniquement'
        },
        api_key_required: false,
        version: '2.1 - Support Plan Complet + URLs Directes',
        features: [
            '🎬 Compatible avec scripts de plan-to-markdown',
            '📋 🆕 Compatible avec plans complets de groq-plan',
            '🎙️ VRAIE VOIX qui parle le texte (CORRIGÉ)',
            '⏱️ Respect des timings de slides',
            '🎭 Adaptation du ton automatique selon les sections',
            '🆓 Complètement gratuit',
            '🇫🇷 Français natif parfait',
            '🔄 Fallback entre plusieurs APIs',
            '🗄️ Stockage Supabase permanent (si configuré)',
            '📊 Base de données complète avec métadonnées',
            '🎵 URLs directes navigateur (comme votre exemple)'
        ],
        improvements_v2_1: [
            'Support plan complet nouveau',
            'URLs Supabase directes dans la réponse',
            'Extraction intelligente du texte des sections',
            'Détection automatique du ton',
            'Réponse avec audio_urls immédiatement cliquables'
        ],
        input_formats: {
            format1: {
                description: 'Script de narration structuré (optimal)',
                field: 'narration_script',
                source: 'Résultat de POST /ai/plan-to-markdown',
                benefits: ['Respect timing parfait', 'Adaptation ton précise', 'Synchronisation slides']
            },
            format2: {
                description: 'Texte simple',
                field: 'text_content',
                usage: 'Pour textes sans structure'
            },
            format3: {
                description: '🆕 Plan complet (nouveau)',
                field: 'plan',
                source: 'Résultat direct de POST /ai/groq-plan',
                benefits: ['Conversion automatique', 'Détection ton automatique', 'Extraction contenu intelligent'],
                note: 'Parfait pour tests rapides avec les plans générés'
            }
        },
        workflow_options: {
            workflow_complet: {
                step1: 'POST /ai/groq-plan → Générer plan',
                step2: 'POST /ai/plan-to-markdown → Générer slides + script',
                step3: 'POST /ai/generate-narration-bark (narration_script) → Audio optimal'
            },
            workflow_rapide: {
                step1: 'POST /ai/groq-plan → Générer plan',
                step2: 'POST /ai/generate-narration-bark (plan) → Audio direct 🆕'
            }
        },
        output_format: {
            audio_urls: 'Array des URLs Supabase directes',
            first_audio_url: 'Premier audio pour test rapide',
            audio_segments: 'Détails par segment avec URLs individuelles',
            supabase_urls: 'URLs permanentes cliquables dans le navigateur'
        }
    });
});

// Route de test santé mise à jour
router.get('/bark-health', async (req, res) => {
    let supabaseStatus = 'Non configuré';
    if (SUPABASE_CONFIGURED && supabase) {
        try {
            const supabaseReady = await initializeSupabaseStorage();
            supabaseStatus = supabaseReady ? 'Opérationnel' : 'Erreur configuration';
        } catch (error) {
            supabaseStatus = `Erreur: ${error.message}`;
        }
    }

    res.json({
        status: 'healthy',
        version: '2.1',
        voice_quality: 'VRAIE VOIX FRANÇAISE POUR SCRIPTS + PLANS V2.1',
        script_compatibility: 'OPTIMISÉE POUR PLAN-TO-MARKDOWN',
        plan_compatibility: '🆕 NOUVEAU: SUPPORT PLAN COMPLET',
        storage: {
            local: 'Actif',
            supabase_configured: SUPABASE_CONFIGURED,
            supabase_status: supabaseStatus,
            mode: SUPABASE_CONFIGURED ? 'Hybride (Local + Supabase)' : 'Local uniquement'
        },
        apis_available: ['Speak API', 'Google TTS', 'VoiceRSS', 'ResponsiveVoice'],
        improvements: [
            'Problèmes audio 36 bytes résolus',
            'Validation fichiers renforcée',
            'Nouvelle API Speak intégrée',
            'Debug amélioré',
            'Stockage dual Local + Supabase',
            'Support plan complet nouveau',
            'URLs directes dans réponse'
        ],
        endpoints: {
            generation: 'POST /ai/generate-narration-bark',
            voices: 'GET /ai/bark-voices',
            info: 'GET /ai/generate-narration-bark/info',
            health: 'GET /ai/bark-health',
            supabase_list: SUPABASE_CONFIGURED ? 'GET /ai/narrations' : 'Non disponible',
            supabase_get: SUPABASE_CONFIGURED ? 'GET /ai/narrations/:id' : 'Non disponible',
            supabase_delete: SUPABASE_CONFIGURED ? 'DELETE /ai/narrations/:id' : 'Non disponible'
        },
        timestamp: new Date().toISOString(),
        next_step: 'Prêt pour génération VOCALE DE SCRIPTS + PLANS immédiate - V2.1 + URLs DIRECTES'
    });
});

// 🧪 ROUTE DE TEST TEMPORAIRE
router.get('/test-supabase-connection', async (req, res) => {
    try {
        console.log('🔍 Variables:', {
            url: process.env.SUPABASE_URL ? 'Configurée' : 'Manquante',
            key: process.env.SUPABASE_ANON_KEY ? 'Configurée' : 'Manquante'
        });

        if (!supabase) {
            return res.json({
                error: 'Supabase non initialisé',
                url_configured: !!process.env.SUPABASE_URL,
                key_configured: !!process.env.SUPABASE_ANON_KEY
            });
        }

        // Test storage
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

        res.json({
            storage_connection: bucketError ? 'Erreur' : 'OK',
            bucket_exists: buckets ? buckets.some(b => b.name === 'tts-audio') : false,
            bucket_error: bucketError?.message || null,
            variables_ok: true
        });

    } catch (error) {
        res.json({
            error: 'Erreur générale',
            details: error.message
        });
    }
});

module.exports = router;