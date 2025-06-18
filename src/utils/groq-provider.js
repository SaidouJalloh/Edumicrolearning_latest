// src/utils/groq-provider.js - Nouveau provider Groq

const axios = require('axios');

class GroqProvider {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY;
        this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';
        this.defaultModel = process.env.GROQ_MODEL || 'llama3-8b-8192';
    }

    async generateText(prompt, options = {}) {
        try {
            const response = await axios.post(this.baseURL, {
                model: options.model || this.defaultModel,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 1000,
                top_p: options.top_p || 0.9,
                stream: false
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 secondes timeout
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Erreur Groq API:', error.response?.data || error.message);
            throw new Error(`Groq API Error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    // Méthode pour tester la connexion
    async healthCheck() {
        try {
            const response = await this.generateText('Hello', { max_tokens: 10 });
            return { status: 'ok', response: response.substring(0, 50) };
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }

    // Obtenir les modèles disponibles
    async getModels() {
        try {
            const response = await axios.get('https://api.groq.com/openai/v1/models', {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data.map(model => model.id);
        } catch (error) {
            console.error('Erreur récupération modèles:', error.message);
            return [];
        }
    }
}

module.exports = GroqProvider;