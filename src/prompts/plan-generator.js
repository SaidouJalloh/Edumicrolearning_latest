// src/prompts/plan-generator.js

function createPlanPrompt({ topic, type, level, duration_minutes, resources }) {
    const basePrompt = `Tu es un expert en pédagogie et conception de formations micro-learning.
  
  CONTEXTE:
  - Sujet: ${topic}
  - Type: ${type === 'conceptual' ? 'Conceptuel (soft-skills, théorie)' : 'Démonstratif (logiciels, procédures)'}
  - Niveau: ${level}
  - Durée cible: ${duration_minutes} minutes
  - Ressources: ${resources}
  
  MISSION:
  Créer un plan pédagogique structuré pour une capsule de micro-learning de ${duration_minutes} minutes maximum.
  
  CONTRAINTES:
  - Objectif pédagogique unique et clair
  - 3-4 sections maximum pour respecter la durée
  - Contenu actionnable et pratique
  - Adapté au niveau ${level}
  
  STRUCTURE ATTENDUE (retourne UNIQUEMENT le JSON):
  [
    {
      "title": "Introduction",
      "content": "Présentation de l'objectif et contexte (30 secondes)",
      "duration_seconds": 30
    },
    {
      "title": "Point clé 1",
      "content": "Premier élément essentiel à maîtriser",
      "duration_seconds": 120
    },
    {
      "title": "Point clé 2", 
      "content": "Deuxième élément essentiel",
      "duration_seconds": 120
    },
    {
      "title": "Conclusion",
      "content": "Récapitulatif et prochaines étapes (30 secondes)",
      "duration_seconds": 30
    }
  ]`;

    if (type === 'demonstrative') {
        return basePrompt + `
  
  SPÉCIFICITÉS DÉMONSTRATIF:
  - Inclure les étapes concrètes à suivre
  - Mentionner les éléments d'interface à cliquer
  - Prévoir les points d'attention et erreurs courantes`;
    }

    return basePrompt + `
  
  SPÉCIFICITÉS CONCEPTUEL:
  - Focus sur la compréhension et l'application
  - Inclure des exemples concrets
  - Proposer des situations pratiques d'usage`;
}

function createScriptPrompt({ topic, type, outline, duration_minutes }) {
    return `Tu es un expert en narration pédagogique pour vidéos de formation.
  
  CONTEXTE:
  - Sujet: ${topic}
  - Type: ${type}
  - Durée: ${duration_minutes} minutes
  - Plan: ${JSON.stringify(outline, null, 2)}
  
  MISSION:
  Rédiger le script complet de narration pour la voix-off de cette capsule micro-learning.
  
  CONTRAINTES:
  - Ton conversationnel et engageant
  - Phrases courtes et claires
  - Rythme adapté à ${duration_minutes} minutes (environ ${duration_minutes * 150} mots)
  - Transitions fluides entre les sections
  - Appels à l'action concrets
  
  STYLE:
  - Tutoyez l'apprenant
  - Soyez encourageant et positif
  - Utilisez des connecteurs logiques
  - Terminez par une phrase motivante
  
  Rédige UNIQUEMENT le script de narration complet:`;
}

module.exports = {
    createPlanPrompt,
    createScriptPrompt
};