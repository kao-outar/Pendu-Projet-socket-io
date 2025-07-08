document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Éléments du DOM
    const statusMessage = document.getElementById('status-message');
    const gameContainer = document.getElementById('game-container');
    const secretWordForm = document.getElementById('secret-word-form');
    const guessForm = document.getElementById('guess-form');
    const secretWordInput = document.getElementById('secret-word-input');
    const submitWordButton = document.getElementById('submit-word-button');
    const letterInput = document.getElementById('letter-input');
    const guessButton = document.getElementById('guess-button');
    const wordDisplay = document.getElementById('word-display');
    const errorsCount = document.getElementById('errors-count');
    const guessedLetters = document.getElementById('guessed-letters');
    const playAgainButton = document.getElementById('play-again-button');

    let myPlayerId = null;

    // Nouvelle fonction pour réinitialiser complètement l'affichage du jeu
    function resetGameDisplay() {
        wordDisplay.textContent = '';
        errorsCount.textContent = '0';
        guessedLetters.textContent = '';
        playAgainButton.classList.add('hidden');
        secretWordForm.classList.add('hidden');
        guessForm.classList.add('hidden');
        
        // Réinitialiser le dessin du pendu
        const hangmanParts = document.querySelectorAll('.hangman-part');
        hangmanParts.forEach(part => part.classList.remove('show'));
    }
    
    // Fonction pour afficher les parties du pendu progressivement
    function updateHangmanDrawing(errors) {
        const hangmanParts = document.querySelectorAll('.hangman-part');
        
        // Réinitialiser toutes les parties
        hangmanParts.forEach(part => part.classList.remove('show'));
        
        // Afficher les parties en fonction du nombre d'erreurs avec animation fluide
        for (let i = 0; i < errors && i < hangmanParts.length; i++) {
            setTimeout(() => {
                hangmanParts[i].classList.add('show');
            }, i * 150); // Animation échelonnée plus rapide
        }
    }

    socket.on('connect', () => {
        myPlayerId = socket.id;
        console.log('Connecté au serveur avec l\'ID :', myPlayerId);
    });

    socket.on('player-joined', (players) => {
        statusMessage.textContent = `Joueurs connectés : ${players.length}/2`;
    });

    socket.on('choose-word', () => {
        resetGameDisplay();
        statusMessage.textContent = 'Vous êtes le Joueur 1. Choisissez un mot secret.';
        gameContainer.classList.remove('hidden');
        secretWordForm.classList.remove('hidden');
    });

    socket.on('wait-for-word', () => {
        resetGameDisplay();
        statusMessage.textContent = 'Vous êtes le Joueur 2. En attente du mot secret...';
        gameContainer.classList.remove('hidden');
    });

    socket.on('game-full', (message) => {
        statusMessage.textContent = message;
    });

    socket.on('player-left', (message) => {
        statusMessage.textContent = message;
        gameContainer.classList.add('hidden');
    });

    socket.on('game-started', () => {
        resetGameDisplay();
        statusMessage.textContent = 'Le jeu a commencé !';
    });

    socket.on('your-turn', () => {
        statusMessage.textContent = 'À votre tour de deviner une lettre.';
        guessForm.classList.remove('hidden');
    });
    
    // Logique pour envoyer le mot secret
    submitWordButton.addEventListener('click', () => {
        const word = secretWordInput.value.trim().toLowerCase();
        if (word && /^[a-z]+$/.test(word)) {
            resetGameDisplay();
            socket.emit('set-secret-word', word);
            secretWordInput.value = '';
            secretWordForm.classList.add('hidden');
        } else if (word) {
            alert('Le mot ne doit contenir que des lettres (a-z, sans accents ni caractères spéciaux)');
        }
    });

    // Logique pour deviner une lettre
    guessButton.addEventListener('click', () => {
        const letter = letterInput.value.trim().toLowerCase();
        if (letter && /^[a-z]$/.test(letter)) {
            socket.emit('guess-letter', letter);
            letterInput.value = '';
        } else if (letter) {
            alert('Veuillez entrer une seule lettre (a-z, sans accents)');
        }
    });
    
    // Gérer la mise à jour de l'état du jeu
    socket.on('update-game-state', (gameState) => {
        wordDisplay.textContent = gameState.displayedWord.join(' ');
        errorsCount.textContent = gameState.errors;
        guessedLetters.textContent = gameState.guessedLetters.join(', ');
        
        // Mettre à jour le dessin du pendu
        updateHangmanDrawing(gameState.errors);

        // On ne gère plus l'affichage du formulaire de devinette ici
        // car 'your-turn' s'en occupe déjà.
    });

    // Gérer la victoire/défaite
    socket.on('game-won', (message) => {
        statusMessage.textContent = message;
        guessForm.classList.add('hidden');
        playAgainButton.classList.remove('hidden');
    });

    socket.on('game-lost', (message) => {
        statusMessage.textContent = message;
        guessForm.classList.add('hidden');
        playAgainButton.classList.remove('hidden');
    });

    playAgainButton.addEventListener('click', () => {
        socket.emit('play-again');
        resetGameDisplay();
    });

    // Gestion des rejets de validation
    socket.on('word-rejected', (message) => {
        alert(message);
    });

    socket.on('letter-rejected', (message) => {
        alert(message);
    });
}); 