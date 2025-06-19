// src/apis/parse-resources.js
const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Import des parsers pour différents formats
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');

const router = express.Router();

// Configuration multer pour upload fichiers
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 5 // 5 fichiers max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'text/plain'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Type de fichier non supporté: ${file.mimetype}`), false);
        }
    }
});

// Fonction pour extraire le texte selon le type de fichier
async function extractTextFromFile(file) {
    const { buffer, mimetype, originalname } = file;

    try {
        switch (mimetype) {
            case 'application/pdf':
                return await extractFromPDF(buffer);

            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return await extractFromDocx(buffer);

            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                return await extractFromPptx(buffer);

            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                return await extractFromXlsx(buffer);

            case 'text/plain':
                return buffer.toString('utf8');

            default:
                throw new Error(`Type de fichier non supporté: ${mimetype}`);
        }
    } catch (error) {
        console.error(`Erreur extraction ${originalname}:`, error.message);
        return {
            success: false,
            error: error.message,
            text: '',
            metadata: {}
        };
    }
}

// Extraction PDF
async function extractFromPDF(buffer) {
    try {
        const data = await pdfParse(buffer);
        return {
            success: true,
            text: data.text,
            metadata: {
                pages: data.numpages,
                info: data.info,
                version: data.version
            }
        };
    } catch (error) {
        throw new Error(`Erreur PDF: ${error.message}`);
    }
}

// Extraction DOCX
async function extractFromDocx(buffer) {
    try {
        const result = await mammoth.extractRawText({ buffer });
        return {
            success: true,
            text: result.value,
            metadata: {
                warnings: result.messages,
                word_count: result.value.split(/\s+/).length
            }
        };
    } catch (error) {
        throw new Error(`Erreur DOCX: ${error.message}`);
    }
}

// Extraction PPTX 
async function extractFromPptx(buffer) {
    try {
        // Pour PowerPoint, on utilise une approche basique
        // Note: Pour une extraction plus sophistiquée, utiliser 'officegen' ou 'node-pptx'
        const result = await mammoth.extractRawText({ buffer });
        return {
            success: true,
            text: result.value,
            metadata: {
                type: 'presentation',
                extracted_method: 'basic_text'
            }
        };
    } catch (error) {
        // Fallback si mammoth échoue sur PPTX
        return {
            success: false,
            text: '',
            metadata: {
                type: 'presentation',
                error: 'Extraction PPTX limitée - contenu non accessible'
            }
        };
    }
}

// Extraction XLSX
async function extractFromXlsx(buffer) {
    try {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        let allText = '';
        let sheetsInfo = [];

        workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const sheetData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

            // Convertir les données en texte
            const sheetText = sheetData
                .map(row => row.join(' | '))
                .join('\n');

            allText += `\n=== Feuille: ${sheetName} ===\n${sheetText}\n`;

            sheetsInfo.push({
                name: sheetName,
                rows: sheetData.length,
                cols: sheetData[0]?.length || 0
            });
        });

        return {
            success: true,
            text: allText,
            metadata: {
                sheets: sheetsInfo,
                workbook_info: {
                    total_sheets: workbook.SheetNames.length
                }
            }
        };
    } catch (error) {
        throw new Error(`Erreur XLSX: ${error.message}`);
    }
}

// Fonction pour analyser et structurer le contenu extrait
function analyzeExtractedContent(extractedFiles, topic) {
    const allTexts = extractedFiles
        .filter(file => file.extraction.success)
        .map(file => file.extraction.text)
        .join('\n\n');

    const totalWords = allTexts.split(/\s+/).length;
    const totalChars = allTexts.length;

    // Extraction de mots-clés basiques (peut être amélioré avec NLP)
    const keywords = extractKeywords(allTexts, topic);

    // Structuration du contenu par thèmes
    const structuredContent = structureContent(allTexts, topic);

    return {
        summary: {
            total_files: extractedFiles.length,
            successful_extractions: extractedFiles.filter(f => f.extraction.success).length,
            total_words: totalWords,
            total_characters: totalChars,
            estimated_reading_time: Math.ceil(totalWords / 200) // 200 mots/min
        },
        keywords,
        structured_content: structuredContent,
        raw_content: allTexts.substring(0, 5000) // Limite pour éviter payload trop gros
    };
}

// Extraction de mots-clés simples
function extractKeywords(text, topic) {
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);

    const wordCount = {};
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Retourner les 10 mots les plus fréquents
    return Object.entries(wordCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));
}

// Structuration basique du contenu
function structureContent(text, topic) {
    const sections = [];

    // Recherche de sections basée sur des marqueurs courants
    const sectionMarkers = [
        /^(introduction|intro)/im,
        /^(définition|concept)/im,
        /^(méthode|procédure|étapes)/im,
        /^(exemple|cas pratique)/im,
        /^(conclusion|synthèse)/im
    ];

    sectionMarkers.forEach((marker, index) => {
        const match = text.match(marker);
        if (match) {
            sections.push({
                type: ['introduction', 'concepts', 'methods', 'examples', 'conclusion'][index],
                found: true,
                preview: text.substring(match.index, match.index + 200)
            });
        }
    });

    return {
        detected_sections: sections,
        content_structure_score: (sections.length / 5) * 100, // Score sur 100
        suitable_for_topic: text.toLowerCase().includes(topic.toLowerCase())
    };
}

// API POST /ai/parse-resources - Upload et analyse des fichiers
router.post('/parse-resources', upload.array('files', 5), async (req, res) => {
    const startTime = Date.now();

    try {
        const { topic, capsuleType, settings } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'Aucun fichier fourni',
                supported_formats: ['PDF', 'DOCX', 'PPTX', 'XLSX', 'TXT'],
                max_file_size: '10MB',
                max_files: 5
            });
        }

        if (!topic) {
            return res.status(400).json({
                error: 'Le champ "topic" est requis pour contextualiser l\'analyse'
            });
        }

        console.log(`📄 Analyse ressources: ${req.files.length} fichiers pour "${topic}"`);

        const resourceId = uuidv4();
        const extractedFiles = [];

        // Traitement de chaque fichier
        for (const file of req.files) {
            console.log(`📝 Extraction: ${file.originalname} (${file.mimetype})`);

            const extraction = await extractTextFromFile(file);

            extractedFiles.push({
                original_name: file.originalname,
                mime_type: file.mimetype,
                size: file.size,
                extraction
            });
        }

        // Analyse globale du contenu
        const analysis = analyzeExtractedContent(extractedFiles, topic);

        const processingTime = Date.now() - startTime;

        const result = {
            resource_id: resourceId,
            topic,
            capsule_type: capsuleType,
            settings,
            files_processed: extractedFiles,
            content_analysis: analysis,
            enrichment_suggestions: {
                use_for_plan: analysis.summary.total_words > 50,
                add_examples: analysis.structured_content.detected_sections.some(s => s.type === 'examples'),
                enhance_definitions: analysis.structured_content.detected_sections.some(s => s.type === 'concepts'),
                practical_cases: analysis.content_analysis?.suitable_for_topic || false
            },
            processing_time_ms: processingTime,
            generated_at: new Date().toISOString(),
            status: 'completed'
        };

        console.log(`✅ Ressources analysées: ${analysis.summary.successful_extractions}/${req.files.length} fichiers en ${processingTime}ms`);

        res.json(result);

    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`❌ Erreur analyse ressources après ${processingTime}ms:`, error);

        res.status(500).json({
            error: 'Erreur lors de l\'analyse des ressources',
            processing_time_ms: processingTime,
            details: error.message
        });
    }
});

// API GET /ai/parse-resources/formats - Formats supportés
router.get('/parse-resources/formats', (req, res) => {
    res.json({
        supported_formats: {
            pdf: {
                mime_type: 'application/pdf',
                description: 'Documents PDF',
                max_size: '10MB',
                extraction_features: ['Text', 'Metadata', 'Page count']
            },
            docx: {
                mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                description: 'Documents Word',
                max_size: '10MB',
                extraction_features: ['Text', 'Word count', 'Warnings']
            },
            pptx: {
                mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                description: 'Présentations PowerPoint',
                max_size: '10MB',
                extraction_features: ['Slide text', 'Basic content']
            },
            xlsx: {
                mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                description: 'Feuilles Excel',
                max_size: '10MB',
                extraction_features: ['Cell data', 'Sheet names', 'Structured data']
            },
            txt: {
                mime_type: 'text/plain',
                description: 'Fichiers texte',
                max_size: '10MB',
                extraction_features: ['Raw text']
            }
        },
        limits: {
            max_file_size: '10MB',
            max_files: 5,
            total_processing_time: '30 seconds'
        },
        usage: {
            endpoint: 'POST /ai/parse-resources',
            method: 'multipart/form-data',
            required_fields: ['files[]', 'topic'],
            optional_fields: ['capsuleType', 'settings']
        }
    });
});

module.exports = router;

/*
INSTALLATION DÉPENDANCES:
npm install multer pdf-parse mammoth xlsx

TESTS POSTMAN:

1. Test upload PDF + DOCX:
POST https://edupro-ai.onrender.com/ai/parse-resources
- Method: POST
- Body: form-data
- Fields:
  * files: [sélectionner PDF]
  * files: [sélectionner DOCX]  
  * topic: "Gestion de projet Agile"
  * capsuleType: "conceptual"
  * settings: {"level":"intermediate","duration":5,"style":"practical"}

2. Test formats supportés:
GET https://edupro-ai.onrender.com/ai/parse-resources/formats

3. Test avec fichier Excel:
POST https://edupro-ai.onrender.com/ai/parse-resources
- Body: form-data
- Fields:
  * files: [fichier Excel]
  * topic: "Analyse financière"

RÉPONSE ATTENDUE:
{
  "resource_id": "uuid",
  "topic": "Gestion de projet Agile",
  "files_processed": [
    {
      "original_name": "cours-agile.pdf",
      "mime_type": "application/pdf",
      "size": 245760,
      "extraction": {
        "success": true,
        "text": "Contenu extrait...",
        "metadata": {
          "pages": 15,
          "info": {...}
        }
      }
    }
  ],
  "content_analysis": {
    "summary": {
      "total_files": 1,
      "successful_extractions": 1,
      "total_words": 1250,
      "estimated_reading_time": 7
    },
    "keywords": [
      {"word": "agile", "count": 45},
      {"word": "scrum", "count": 32}
    ],
    "structured_content": {
      "detected_sections": [...],
      "content_structure_score": 80
    }
  },
  "enrichment_suggestions": {
    "use_for_plan": true,
    "add_examples": true,
    "enhance_definitions": true
  }
}
*/