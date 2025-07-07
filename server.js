const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques du dossier 'public'
app.use(express.static('public'));

// Logique du jeu
let players = [];
let initialGameState = {
    secretWord: '',
    displayedWord: [],
    guessedLetters: [],
    errors: 0,
    maxErrors: 6,
    turn: null,
    wordIsSet: false,
    gameIsOver: false
};
let gameState = { ...initialGameState };

function resetGame() {
    // Inverse les rôles pour la partie suivante
    players.reverse(); 
    gameState = { ...initialGameState };

    // Envoyer l'état réinitialisé à tout le monde pour vider l'affichage
    io.emit('update-game-state', gameState);

    if (players.length === 2) {
        gameState.turn = players[0].id;
        io.to(players[0].id).emit('choose-word');
        io.to(players[1].id).emit('wait-for-word');
    }
}

io.on('connection', (socket) => {
    console.log(`Un joueur s'est connecté : ${socket.id}`);

    // Gestion de l'arrivée de nouveaux joueurs
    if (players.length < 2) {
        players.push({ id: socket.id, name: 'Joueur ' + (players.length + 1) });
        console.log(`Joueur ${players.length} a rejoint.`);

        // Informer les clients du nouvel arrivant
        io.emit('player-joined', players);

        // Si deux joueurs sont connectés, on démarre le jeu
        if (players.length === 2) {
            gameState.turn = players[0].id; // Le joueur 1 choisit le mot
            io.to(players[0].id).emit('choose-word');
            io.to(players[1].id).emit('wait-for-word');
        }
    } else {
        // Trop de joueurs
        socket.emit('game-full', 'Désolé, la partie est pleine.');
        socket.disconnect();
    }
    
    // Événement pour définir le mot secret
    socket.on('set-secret-word', (word) => {
        if (socket.id === players[0].id && !gameState.wordIsSet) {
            // Réinitialiser l'état du jeu avant de définir le nouveau mot
            gameState.guessedLetters = [];
            gameState.errors = 0;
            gameState.secretWord = word.toLowerCase();
            gameState.displayedWord = Array(word.length).fill('_');
            gameState.wordIsSet = true;
            gameState.turn = players[1].id;

            console.log(`Mot secret défini : ${gameState.secretWord}`);

            io.emit('game-started');
            io.emit('update-game-state', gameState);
            io.to(players[1].id).emit('your-turn');
        }
    });

    // Événement pour deviner une lettre
    socket.on('guess-letter', (letter) => {
        if (socket.id !== gameState.turn || !gameState.wordIsSet) {
            return; // Pas son tour ou le mot n'est pas encore défini
        }
        
        letter = letter.toLowerCase();
        if (gameState.guessedLetters.includes(letter)) {
            // Peut-être informer le joueur que la lettre a déjà été proposée
            return;
        }

        gameState.guessedLetters.push(letter);
        let letterFound = false;

        for (let i = 0; i < gameState.secretWord.length; i++) {
            if (gameState.secretWord[i] === letter) {
                gameState.displayedWord[i] = letter;
                letterFound = true;
            }
        }

        if (!letterFound) {
            gameState.errors++;
        }

        // Vérification de victoire ou défaite
        const wordIsGuessed = !gameState.displayedWord.includes('_');
        const tooManyErrors = gameState.errors >= gameState.maxErrors;

        if (wordIsGuessed) {
            gameState.gameIsOver = true;
            io.emit('game-won', `Victoire ! Le mot était "${gameState.secretWord}".`);
        } else if (tooManyErrors) {
            gameState.gameIsOver = true;
            io.emit('game-lost', `Perdu ! Le mot était "${gameState.secretWord}".`);
        } else {
            // Changer le tour (pour un éventuel mode où chacun devine à son tour)
            // Pour l'instant, seul le joueur 2 devine.
            // gameState.turn = players.find(p => p.id !== socket.id).id;
        }

        io.emit('update-game-state', gameState);
    });

    socket.on('play-again', () => {
        if (gameState.gameIsOver) {
            // Réinitialiser complètement l'état du jeu
            gameState = { ...initialGameState };
            // Envoyer l'état vide à tous les joueurs
            io.emit('update-game-state', gameState);
            // Inverser les rôles et redémarrer
            resetGame();
        }
    });

    // Gestion de la déconnexion
    socket.on('disconnect', () => {
        console.log(`Un joueur s'est déconnecté : ${socket.id}`);
        const wasInGame = players.some(p => p.id === socket.id);
        players = players.filter(p => p.id !== socket.id);
        
        // Réinitialiser le jeu si un joueur en pleine partie part
        if (players.length < 2 && wasInGame) {
            io.emit('player-left', 'Un joueur a quitté la partie. En attente de nouveaux joueurs...');
            // Réinitialiser l'état du jeu
            gameState = { ...initialGameState };
            // Envoyer l'état vidé au(x) joueur(s) restant(s) pour rafraîchir leur affichage
            io.emit('update-game-state', gameState);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Le serveur écoute sur le port ${PORT}`);
}); 