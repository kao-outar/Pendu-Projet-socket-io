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
    
    // Nouveaux éléments pour les indices
    const hintForm = document.getElementById('hint-form');
    const hintInput = document.getElementById('hint-input');
    const submitHintButton = document.getElementById('submit-hint-button');
    const requestHintButton = document.getElementById('request-hint-button');
    const hintsCount = document.getElementById('hints-count');
    const hintsDisplay = document.getElementById('hints-display');
    const hintsList = document.getElementById('hints-list');

    let myPlayerId = null;

    // Nouvelle fonction pour réinitialiser complètement l'affichage du jeu
    function resetGameDisplay() {
        wordDisplay.textContent = '';
        errorsCount.textContent = '0';
        guessedLetters.textContent = '';
        playAgainButton.classList.add('hidden');
        secretWordForm.classList.add('hidden');
        guessForm.classList.add('hidden');
        hintForm.classList.add('hidden');
        hintsDisplay.classList.add('hidden');
        hintsList.innerHTML = '';
        hintsCount.textContent = '0';
        
        // Réinitialiser le dessin du pendu
        const hangmanParts = document.querySelectorAll('.hangman-part');
        hangmanParts.forEach(part => part.classList.remove('show'));
        
        // Réinitialiser le clavier virtuel
        const letterBtns = document.querySelectorAll('.letter-btn');
        letterBtns.forEach(btn => btn.classList.remove('used'));
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

    // Logique pour le clavier virtuel
    document.querySelectorAll('.letter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const letter = btn.dataset.letter;
            if (!btn.classList.contains('used')) {
                socket.emit('guess-letter', letter);
            }
        });
    });
    
    // Logique pour demander un indice
    requestHintButton.addEventListener('click', () => {
        socket.emit('request-hint');
    });
    
    // Logique pour envoyer un indice
    submitHintButton.addEventListener('click', () => {
        const hint = hintInput.value.trim();
        if (hint) {
            socket.emit('provide-hint', hint);
            hintInput.value = '';
        }
    });
    
    // Gérer la mise à jour de l'état du jeu
    socket.on('update-game-state', (gameState) => {
        wordDisplay.textContent = gameState.displayedWord.join(' ');
        errorsCount.textContent = gameState.errors;
        guessedLetters.textContent = gameState.guessedLetters.join(', ');
        
        // Mettre à jour le compteur d'indices
        hintsCount.textContent = gameState.hintsUsed;
        
        // Désactiver le bouton d'indice si le maximum est atteint ou si en attente
        requestHintButton.disabled = gameState.hintsUsed >= gameState.maxHints || gameState.waitingForHint;
        
        // Mettre à jour le dessin du pendu
        updateHangmanDrawing(gameState.errors);
        
        // Marquer les lettres utilisées dans le clavier virtuel
        gameState.guessedLetters.forEach(letter => {
            const btn = document.querySelector(`[data-letter="${letter}"]`);
            if (btn) {
                btn.classList.add('used');
            }
        });

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
    
    // Gestion des indices
    socket.on('provide-hint', () => {
        statusMessage.textContent = 'Le joueur 2 demande un indice. Entrez un indice pour l\'aider.';
        hintForm.classList.remove('hidden');
        guessForm.classList.add('hidden');
    });
    
    socket.on('waiting-for-hint', () => {
        statusMessage.textContent = 'Demande d\'indice envoyée. En attente de la réponse du joueur 1...';
        requestHintButton.disabled = true;
    });
    
    socket.on('hint-provided', (hint) => {
        // Ajouter l'indice à la liste
        const listItem = document.createElement('li');
        listItem.textContent = hint;
        hintsList.appendChild(listItem);
        
        // Afficher la section des indices si elle est cachée
        hintsDisplay.classList.remove('hidden');
        
        statusMessage.textContent = `Nouvel indice reçu : "${hint}"`;
        hintForm.classList.add('hidden');
        requestHintButton.disabled = false;
    });
    
    socket.on('hint-rejected', (message) => {
        alert(message);
        requestHintButton.disabled = false;
    });
}); 