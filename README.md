# Pendu-Projet-socket-io 🎮

Un jeu du pendu en temps réel pour 2 joueurs, construit avec Node.js, Express et Socket.IO.

## Description 📋

Dans ce jeu du pendu multijoueur en temps réel :
- Le Joueur 1 choisit un mot secret (lettres a-z uniquement)
- Le Joueur 2 doit deviner ce mot lettre par lettre
- 6 erreurs maximum sont autorisées
- **Système d'indices** : Le joueur 2 peut demander jusqu'à 3 indices au joueur 1
- **Clavier virtuel AZERTY** intégré pour une meilleure expérience
- **Animations fluides** du dessin du pendu
- Les joueurs inversent leurs rôles à chaque nouvelle partie

## Fonctionnalités ✨

### 🎯 Gameplay Principal
- Jeu du pendu classique pour 2 joueurs en temps réel
- Validation stricte : mots composés uniquement de lettres (a-z)
- Maximum 6 erreurs avant la défaite
- Inversion automatique des rôles entre les parties

### 💡 Système d'Indices
- Le joueur 2 peut demander jusqu'à **3 indices** par partie
- Le joueur 1 fournit les indices en temps réel
- Compteur d'indices utilisés affiché en permanence
- Désactivation automatique du bouton d'indice une fois la limite atteinte

### ⌨️ Interface Améliorée
- **Clavier virtuel AZERTY** pour saisir les lettres
- Lettres utilisées automatiquement désactivées
- **Animations fluides** lors de l'apparition du pendu
- Design moderne et responsive
- Feedback visuel en temps réel

### 🔄 Gestion des Sessions
- Reconnexion automatique en cas de déconnexion
- État du jeu maintenu côté serveur
- Synchronisation en temps réel entre les joueurs

## Technologies Utilisées 🛠️

- **Backend** : Node.js avec Express
- **Communication temps réel** : Socket.IO
- **Frontend** : HTML5, CSS3, JavaScript vanilla
- **Animations** : CSS Transitions et JavaScript

## Installation ⚙️

1. Clonez le repository :
```bash
git clone https://github.com/kao-outar/Pendu-Projet-socket-io.git
cd Pendu-Projet-socket-io
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez le serveur :
```bash
node server.js
```

4. Ouvrez le jeu dans votre navigateur :
```
http://localhost:3000
```

## Comment Jouer 🎯

### 1. Démarrage
- Ouvrez le jeu dans deux onglets/fenêtres différents
- Le premier joueur connecté sera le **Joueur 1** (celui qui choisit le mot)
- Le deuxième joueur connecté sera le **Joueur 2** (celui qui devine)

### 2. Phase de Préparation (Joueur 1)
- Saisissez un mot secret composé uniquement de lettres (a-z)
- Pas d'accents, chiffres ou caractères spéciaux autorisés
- Confirmez votre choix

### 3. Phase de Jeu (Joueur 2)
- Utilisez le **clavier virtuel AZERTY** pour proposer des lettres
- Les lettres déjà utilisées sont automatiquement désactivées
- Demandez des **indices** (maximum 3 par partie) si nécessaire
- Observez l'**animation du pendu** à chaque erreur

### 4. Système d'Indices
- **Joueur 2** : Cliquez sur "Demander un indice" (3 maximum)
- **Joueur 1** : Répondez en temps réel avec un indice utile
- Les indices s'affichent dans une liste dédiée

### 5. Fin de Partie
- **Victoire** : Mot trouvé avant 6 erreurs
- **Défaite** : 6 erreurs atteintes
- Cliquez sur "Rejouer" pour une nouvelle partie avec inversion des rôles

## Règles et Limitations 📏

- **Mots acceptés** : Uniquement lettres minuscules (a-z)
- **Erreurs maximales** : 6
- **Indices maximums** : 3 par partie
- **Joueurs** : Exactement 2 (le 3ème joueur recevra un message d'attente)

## Structure du Projet 📁

```
Serveur Temps réel projet/
├── server.js          # Serveur Express + Socket.IO
├── package.json       # Dépendances et scripts
├── public/
│   ├── index.html     # Interface principale
│   ├── client.js      # Logique côté client
│   └── style.css      # Styles et animations
└── README.md          # Documentation
```

## À ne pas versionner 🚫

Créez un fichier `.gitignore` avec :
```
node_modules/
.env
.DS_Store
```

## Notes de développement 📝

- Le serveur écoute sur le port 3000 par défaut
- Les connexions WebSocket gèrent la communication en temps réel
- L'état du jeu est maintenu côté serveur avec validation stricte
- Animations CSS optimisées pour une expérience fluide
- Gestion d'erreurs robuste pour les déconnexions

## Améliorations Récentes 🆕

- ✅ Ajout du système d'indices (3 max par partie)
- ✅ Clavier virtuel AZERTY intégré
- ✅ Animations fluides du pendu
- ✅ Interface utilisateur modernisée
- ✅ Validation stricte des mots (lettres a-z uniquement)
- ✅ Feedback visuel amélioré