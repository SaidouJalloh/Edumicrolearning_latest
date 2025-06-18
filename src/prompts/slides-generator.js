// src/prompts/slides-generator.js

function createSlidesPrompt({ topic, type, level, outline, duration_minutes }) {
    return `Tu es un expert en création de présentations pédagogiques modernes avec Slidev.
  
  CONTEXTE:
  - Sujet: ${topic}
  - Type: ${type}
  - Niveau: ${level}
  - Durée: ${duration_minutes} minutes
  - Plan: ${JSON.stringify(outline, null, 2)}
  
  MISSION:
  Créer des slides en markdown Slidev pour cette formation micro-learning.
  
  CONTRAINTES SLIDEV:
  - Utiliser la syntaxe markdown Slidev
  - Séparer chaque slide par "---"
  - Inclure des animations et transitions
  - Design moderne et professionnel
  - Compatible avec la charte EduPro
  
  STRUCTURE ATTENDUE:
  1. Slide titre avec le sujet
  2. Une slide par section du plan (outline)
  3. Slide de conclusion avec appel à l'action
  
  STYLE:
  - Titres accrocheurs avec émojis
  - Bullet points clairs et concis
  - Couleurs et mise en forme attractive
  - Images d'illustration (via Unsplash)
  
  EXEMPLE DE SYNTAXE SLIDEV:
  ---
  # 🎯 Titre de la slide
  - Point important
  - **Texte en gras**
  - \`code ou commande\`
  
  <div class="text-center">
    Image ou contenu centré
  </div>
  ---
  
  Génère le markdown Slidev complet pour ${outline.length + 2} slides:`;
}

function createSlidesWithDemoPrompt({ topic, outline, demo_steps }) {
    return `Tu es un expert en création de slides pour formations logicielles.
  
  CONTEXTE:
  - Sujet: ${topic}
  - Plan: ${JSON.stringify(outline, null, 2)}
  - Étapes démo: ${JSON.stringify(demo_steps, null, 2)}
  
  MISSION:
  Créer des slides Slidev qui intègrent les étapes de démonstration logicielle.
  
  SPÉCIFICITÉS DÉMONSTRATIF:
  - Inclure des captures d'écran fictives
  - Indiquer les zones de clic
  - Numéroter les étapes clairement
  - Prévoir les pauses pour la démonstration
  
  Génère le markdown Slidev avec intégration démo:`;
}

module.exports = {
    createSlidesPrompt,
    createSlidesWithDemoPrompt
};
