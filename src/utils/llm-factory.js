// src/utils/llm-factory.js - Factory pour choisir le provider

const GroqProvider = require('./groq-provider');
const axios = require('axios');

class LLMFactory {
    constructor() {
        this.useGroq = process.env.USE_GROQ === 'true';
        this.groqProvider = this.useGroq ? new GroqProvider() : null;
    }

    async generateText(prompt, options = {}) {
        const startTime = Date.now();

        try {
            let result;
            let provider;

            if (this.useGroq && this.groqProvider) {
                result = await this.groqProvider.generateText(prompt, options);
                provider = 'groq';
            } else {
                result = await this.callOllama(prompt, options);
                provider = 'ollama';
            }

            const duration = Date.now() - startTime;
            console.log(`✅ Génération ${provider}: ${duration}ms`);

            return {
                text: result,
                provider,
                duration_ms: duration
            };

        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ Erreur génération après ${duration}ms:`, error.message);

            // Fallback vers Ollama si Groq échoue
            if (this.useGroq && !error.message.includes('Ollama')) {
                console.log('🔄 Fallback vers Ollama...');
                try {
                    const result = await this.callOllama(prompt, options);
                    return {
                        text: result,
                        provider: 'ollama-fallback',
                        duration_ms: Date.now() - startTime
                    };
                } catch (ollamaError) {
                    console.error('❌ Ollama fallback échoué:', ollamaError.message);
                }
            }

            throw error;
        }
    }

    async callOllama(prompt, options = {}) {
        const response = await axios.post(`${process.env.OLLAMA_URL}/api/generate`, {
            model: process.env.LLAMA_MODEL,
            prompt: prompt,
            stream: false,
            options: {
                temperature: options.temperature || 0.7,
                top_p: options.top_p || 0.9,
                num_predict: options.max_tokens || 1000
            }
        });

        return response.data.response;
    }

    // Test de santé des providers
    async healthCheck() {
        const results = {};

        // Test Groq
        if (this.groqProvider) {
            results.groq = await this.groqProvider.healthCheck();
        }

        // Test Ollama
        try {
            await this.callOllama('test', { max_tokens: 10 });
            results.ollama = { status: 'ok' };
        } catch (error) {
            results.ollama = { status: 'error', error: error.message };
        }

        return results;
    }
}

module.exports = LLMFactory;