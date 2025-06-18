
// // src/server.js
// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const generatePlanRouter = require('./apis/generate-plan');

// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware
// app.use(cors());
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// const generateSlidesRouter = require('./apis/generate-slides');
// app.use('/ai', generateSlidesRouter);


// // const simplePlanRouter = require('./apis/simple-plan');
// // app.use('/ai', simplePlanRouter);

// // Routes
// app.use('/ai', generatePlanRouter);


// const simplePlanRouter = require('./apis/simple-plan');
// app.use('/ai', simplePlanRouter);


// const fastPlanRouter = require('./apis/fast-simple-plan');
// app.use('/ai', fastPlanRouter);


// const groqPlanRouter = require('./apis/groq-fast-plan');
// app.use('/ai', groqPlanRouter);


// const demoStepsRouter = require('./apis/generate-demo-steps');
// app.use('/ai', demoStepsRouter);


// const slidevRouter = require('./apis/slidev-generator');
// app.use('/ai', slidevRouter);


// const powerpointRouter = require('./apis/powerpoint-generator');
// app.use('/ai', powerpointRouter);





// // Health check
// app.get('/health', (req, res) => {
//     res.json({ status: 'OK', service: 'EduPro AI MicroLearning' });
// });

// app.listen(PORT, () => {
//     console.log(`🚀 EduPro AI Server running on port ${PORT}`);
//     console.log(`📚 Micro-Learning Generator ready!`);
// });



const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration pour production
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes APIs
const generatePlanRouter = require('./apis/generate-plan');
const simplePlanRouter = require('./apis/simple-plan');
const fastPlanRouter = require('./apis/fast-simple-plan');
const groqPlanRouter = require('./apis/groq-fast-plan');
const demoStepsRouter = require('./apis/generate-demo-steps');
const slidesRouter = require('./apis/generate-slides');
const slidevRouter = require('./apis/slidev-generator');
const powerpointRouter = require('./apis/powerpoint-generator');

app.use('/ai', generatePlanRouter);
app.use('/ai', simplePlanRouter);
app.use('/ai', fastPlanRouter);
app.use('/ai', groqPlanRouter);
app.use('/ai', demoStepsRouter);
app.use('/ai', slidesRouter);
app.use('/ai', slidevRouter);
app.use('/ai', powerpointRouter);

// Route principale pour documenter les APIs
app.get('/', (req, res) => {
    res.json({
        service: 'EduPro AI Micro-Learning Generator',
        version: '1.0.0',
        status: 'online',
        endpoints: {
            plans: {
                'POST /ai/groq-plan': 'Génération ultra-rapide (1s)',
                'POST /ai/generate-plan': 'Plan complet + script',
                'POST /ai/simple-plan': 'Plan basique',
                'POST /ai/fast-plan': 'Version cache optimisé'
            },
            demonstrations: {
                'POST /ai/generate-demo-steps': 'Steps précis logiciels',
                'GET /ai/software-catalog': 'Logiciels supportés'
            },
            presentations: {
                'POST /ai/generate-slides': 'Slides Slidev markdown',
                'POST /ai/generate-slidev': 'Slidev complet',
                'POST /ai/generate-powerpoint': 'PowerPoint sophistiqué',
                'POST /ai/generate-powerpoint-advanced': 'PowerPoint premium'
            },
            utilities: {
                'GET /ai/health': 'Santé des providers IA',
                'GET /powerpoint/themes': 'Thèmes disponibles'
            }
        },
        documentation: 'https://github.com/votre-repo/edupro-ai/README.md',
        frontend_team: {
            base_url: 'https://votre-app.railway.app',
            cors_enabled: true,
            rate_limit: 'Aucune limite en dev'
        }
    });
});

// Health check pour Railway
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'EduPro AI',
        environment: process.env.NODE_ENV || 'development'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 EduPro AI Server running on port ${PORT}`);
    console.log(`📚 Micro-Learning Generator ready!`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});