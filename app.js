// Récupération des éléments DOM
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext('2d');
const scoreElement = document.getElementById("score");
const scoreFinalElement = document.getElementById("scoreFinal");
const meilleurScoreElement = document.getElementById("meilleurScore");
const longueurSerpentElement = document.getElementById("longueurSerpent");
const ecranFin = document.getElementById("ecranFin");
const messageFin = document.getElementById("messageFin");
const btnPause = document.getElementById("btnPause");
const btnRedemarrer = document.getElementById("btnRedemarrer");
const btnRejouer = document.getElementById("btnRejouer");
const btnPartager = document.getElementById("btnPartager");
const btnSon = document.getElementById("btnSon");
const vitesseText = document.getElementById("vitesseText");
const niveauText = document.getElementById("niveauText");

// Boutons de niveau
const btnTresFacile = document.getElementById("tresFacile");
const btnFacile = document.getElementById("facile");
const btnNormal = document.getElementById("normal");
const btnDifficile = document.getElementById("difficile");
const btnExtreme = document.getElementById("extreme");

// Contrôles mobiles
const btnHaut = document.getElementById("btnHaut");
const btnBas = document.getElementById("btnBas");
const btnGauche = document.getElementById("btnGauche");
const btnDroite = document.getElementById("btnDroite");
const btnPauseMobile = document.getElementById("btnPauseMobile");
const btnRedemarrerMobile = document.getElementById("btnRedemarrerMobile");

// Configuration du jeu
const tailleCase = 20;
const tailleCanvas = 400;
const tailleGrille = tailleCanvas / tailleCase;

// Niveaux de difficulté avec 5 options
const niveaux = {
    tresFacile: { vitesse: 200, nom: "Débutant", vitesseTexte: "Très lente" },
    facile: { vitesse: 150, nom: "Facile", vitesseTexte: "Lente" },
    normal: { vitesse: 100, nom: "Normal", vitesseTexte: "Normale" },
    difficile: { vitesse: 70, nom: "Difficile", vitesseTexte: "Rapide" },
    extreme: { vitesse: 40, nom: "Extrême", vitesseTexte: "Très rapide" }
};

// Variables du jeu
let serpent = [];
let nourriture = {};
let score = 0;
let meilleurScore = localStorage.getItem('meilleurScoreSnake') || 0;
let direction = "";
let prochaineDirection = "";
let intervalleJeu;
let jeuEnPause = false;
let jeuEnCours = false;
let niveauActuel = "tresFacile";
let sonActif = true;

// Initialiser l'audio
function initialiserAudio() {
    // Cette fonction initialiserait l'audio si on voulait ajouter des sons
    // Pour l'instant, on laisse la structure pour une future implémentation
    sonActif = false; // Désactivé par défaut
    btnSon.innerHTML = '<i class="fas fa-volume-mute"></i> SON';
}

// Jouer un son
function jouerSon(frequence, duree) {
    if (!sonActif) return;
    
    // Implémentation simple avec l'API Web Audio
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequence;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duree);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duree);
    } catch (e) {
        console.log("Erreur de lecture audio");
    }
}

// Initialisation du jeu
function initialiserJeu() {
    // Réinitialiser le serpent
    serpent = [];
    serpent[0] = { x: 10 * tailleCase, y: 10 * tailleCase };
    
    // Générer la première nourriture
    genererNourriture();
    
    // Réinitialiser le score et la direction
    score = 0;
    scoreElement.textContent = score;
    longueurSerpentElement.textContent = serpent.length;
    direction = "";
    prochaineDirection = "";
    
    // Mettre à jour le meilleur score
    meilleurScoreElement.textContent = meilleurScore;
    
    // Mettre à jour l'affichage du niveau
    niveauText.textContent = niveaux[niveauActuel].nom;
    vitesseText.textContent = niveaux[niveauActuel].vitesseTexte;
    
    // Cacher l'écran de fin de jeu
    ecranFin.style.display = "none";
    
    // Démarrer le jeu avec la vitesse du niveau actuel
    if (intervalleJeu) clearInterval(intervalleJeu);
    intervalleJeu = setInterval(dessiner, niveaux[niveauActuel].vitesse);
    jeuEnCours = true;
    jeuEnPause = false;
    btnPause.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
    if (btnPauseMobile) btnPauseMobile.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
    
    // Jouer un son de démarrage
    if (sonActif) jouerSon(523.25, 0.1);
}

// Générer de la nourriture à une position aléatoire
function genererNourriture() {
    // Vérifier que la nourriture n'apparaît pas sur le serpent
    let nourritureSurSerpent;
    do {
        nourritureSurSerpent = false;
        nourriture = {
            x: Math.floor(Math.random() * tailleGrille) * tailleCase,
            y: Math.floor(Math.random() * tailleGrille) * tailleCase
        };
        
        // Vérifier si la nourriture est sur le serpent
        for (let i = 0; i < serpent.length; i++) {
            if (serpent[i].x === nourriture.x && serpent[i].y === nourriture.y) {
                nourritureSurSerpent = true;
                break;
            }
        }
    } while (nourritureSurSerpent);
}

// Fonction de dessin principale
function dessiner() {
    // Effacer le canvas
    context.clearRect(0, 0, tailleCanvas, tailleCanvas);
    
    // Dessiner la grille (optionnel, pour le design)
    dessinerGrille();
    
    // Dessiner le serpent
    for (let i = 0; i < serpent.length; i++) {
        // Corps du serpent avec dégradé
        let gradient;
        if (i === 0) {
            // Tête du serpent
            gradient = context.createLinearGradient(
                serpent[i].x, serpent[i].y,
                serpent[i].x + tailleCase, serpent[i].y + tailleCase
            );
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#2E7D32');
            context.fillStyle = gradient;
        } else {
            // Corps du serpent avec dégradé plus foncé
            gradient = context.createLinearGradient(
                serpent[i].x, serpent[i].y,
                serpent[i].x + tailleCase, serpent[i].y + tailleCase
            );
            gradient.addColorStop(0, '#45a049');
            gradient.addColorStop(1, '#388E3C');
            context.fillStyle = gradient;
        }
        
        context.fillRect(serpent[i].x, serpent[i].y, tailleCase, tailleCase);
        
        // Contour du serpent
        context.strokeStyle = i === 0 ? '#1B5E20' : '#2E7D32';
        context.lineWidth = 2;
        context.strokeRect(serpent[i].x, serpent[i].y, tailleCase, tailleCase);
        
        // Yeux sur la tête du serpent
        if (i === 0) {
            context.fillStyle = "#000";
            // Position des yeux selon la direction
            let tailleOeil = tailleCase / 5;
            let decalage = tailleCase / 3;
            
            // Yeux de la tête
            if (direction === "droite") {
                context.fillRect(serpent[i].x + tailleCase - decalage, serpent[i].y + decalage, tailleOeil, tailleOeil);
                context.fillRect(serpent[i].x + tailleCase - decalage, serpent[i].y + tailleCase - decalage - tailleOeil, tailleOeil, tailleOeil);
            } else if (direction === "gauche") {
                context.fillRect(serpent[i].x + decalage - tailleOeil, serpent[i].y + decalage, tailleOeil, tailleOeil);
                context.fillRect(serpent[i].x + decalage - tailleOeil, serpent[i].y + tailleCase - decalage - tailleOeil, tailleOeil, tailleOeil);
            } else if (direction === "haut") {
                context.fillRect(serpent[i].x + decalage, serpent[i].y + decalage - tailleOeil, tailleOeil, tailleOeil);
                context.fillRect(serpent[i].x + tailleCase - decalage - tailleOeil, serpent[i].y + decalage - tailleOeil, tailleOeil, tailleOeil);
            } else if (direction === "bas") {
                context.fillRect(serpent[i].x + decalage, serpent[i].y + tailleCase - decalage, tailleOeil, tailleOeil);
                context.fillRect(serpent[i].x + tailleCase - decalage - tailleOeil, serpent[i].y + tailleCase - decalage, tailleOeil, tailleOeil);
            } else {
                // Direction par défaut (début du jeu)
                context.fillRect(serpent[i].x + decalage, serpent[i].y + decalage, tailleOeil, tailleOeil);
                context.fillRect(serpent[i].x + tailleCase - decalage - tailleOeil, serpent[i].y + decalage, tailleOeil, tailleOeil);
            }
        }
    }
    
    // Dessiner la nourriture avec effet de brillance
    context.fillStyle = "#FF9800";
    context.beginPath();
    context.arc(nourriture.x + tailleCase/2, nourriture.y + tailleCase/2, tailleCase/2 - 2, 0, Math.PI * 2);
    context.fill();
    
    // Effet de brillance sur la nourriture
    context.fillStyle = "#FFCC80";
    context.beginPath();
    context.arc(nourriture.x + tailleCase/3, nourriture.y + tailleCase/3, tailleCase/6, 0, Math.PI * 2);
    context.fill();
    
    // Effet d'ombre
    context.fillStyle = "rgba(0, 0, 0, 0.2)";
    context.beginPath();
    context.ellipse(nourriture.x + tailleCase/2 + 2, nourriture.y + tailleCase/2 + 2, tailleCase/2 - 1, tailleCase/4, 0, 0, Math.PI * 2);
    context.fill();
    
    // Mettre à jour la direction
    if (prochaineDirection !== "") {
        direction = prochaineDirection;
        prochaineDirection = "";
    }
    
    // Calculer la nouvelle position de la tête
    let serpentX = serpent[0].x;
    let serpentY = serpent[0].y;
    
    if (direction === "gauche") serpentX -= tailleCase;
    if (direction === "haut") serpentY -= tailleCase;
    if (direction === "droite") serpentX += tailleCase;
    if (direction === "bas") serpentY += tailleCase;
    
    // Vérifier si le serpent mange la nourriture
    if (serpentX === nourriture.x && serpentY === nourriture.y) {
        score += 10;
        scoreElement.textContent = score;
        longueurSerpentElement.textContent = serpent.length + 1;
        genererNourriture();
        
        // Jouer un son de nourriture
        if (sonActif) jouerSon(659.25, 0.2);
    } else {
        // Retirer la queue si aucune nourriture n'a été mangée
        serpent.pop();
    }
    
    // Créer la nouvelle tête
    let nouvelleTete = { x: serpentX, y: serpentY };
    
    // Vérifier les collisions
    if (serpentX < 0 || serpentY < 0 || serpentX >= tailleCanvas || serpentY >= tailleCanvas || collision(nouvelleTete, serpent)) {
        finDuJeu();
        return;
    }
    
    // Ajouter la nouvelle tête au serpent
    serpent.unshift(nouvelleTete);
}

// Dessiner une grille subtile en arrière-plan
function dessinerGrille() {
    context.strokeStyle = "rgba(255, 255, 255, 0.05)";
    context.lineWidth = 1;
    
    // Lignes verticales
    for (let x = 0; x <= tailleCanvas; x += tailleCase) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, tailleCanvas);
        context.stroke();
    }
    
    // Lignes horizontales
    for (let y = 0; y <= tailleCanvas; y += tailleCase) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(tailleCanvas, y);
        context.stroke();
    }
}

// Vérifier les collisions
function collision(tete, tableau) {
    for (let i = 0; i < tableau.length; i++) {
        if (tete.x === tableau[i].x && tete.y === tableau[i].y) {
            return true;
        }
    }
    return false;
}

// Fin du jeu
function finDuJeu() {
    clearInterval(intervalleJeu);
    jeuEnCours = false;
    
    // Mettre à jour le meilleur score si nécessaire
    if (score > meilleurScore) {
        meilleurScore = score;
        localStorage.setItem('meilleurScoreSnake', meilleurScore);
        meilleurScoreElement.textContent = meilleurScore;
    }
    
    // Déterminer le message en fonction du score
    let message = "";
    if (score < 20) {
        message = "Vous pouvez faire mieux !";
    } else if (score < 50) {
        message = "Bon début !";
    } else if (score < 100) {
        message = "Bien joué !";
    } else if (score < 200) {
        message = "Excellent !";
    } else if (score < 500) {
        message = "Incroyable !";
    } else {
        message = "LÉGENDAIRE ! Vous maîtrisez Snake !";
    }
    
    // Afficher l'écran de fin
    scoreFinalElement.textContent = score;
    messageFin.textContent = message;
    ecranFin.style.display = "flex";
    
    // Jouer un son de fin
    if (sonActif) jouerSon(261.63, 0.5);
}

// Gestion des directions
function controlerDirection(nouvelleDirection) {
    // Empêcher les mouvements inverses
    if ((nouvelleDirection === "gauche" && direction !== "droite") ||
        (nouvelleDirection === "haut" && direction !== "bas") ||
        (nouvelleDirection === "droite" && direction !== "gauche") ||
        (nouvelleDirection === "bas" && direction !== "haut")) {
        prochaineDirection = nouvelleDirection;
    }
}

// Changer le niveau de difficulté
function changerNiveau(niveau) {
    // Mettre à jour les boutons
    btnTresFacile.classList.remove("actif");
    btnFacile.classList.remove("actif");
    btnNormal.classList.remove("actif");
    btnDifficile.classList.remove("actif");
    btnExtreme.classList.remove("actif");
    
    // Activer le bouton correspondant
    document.getElementById(niveau).classList.add("actif");
    
    // Mettre à jour le niveau actuel
    niveauActuel = niveau;
    niveauText.textContent = niveaux[niveau].nom;
    vitesseText.textContent = niveaux[niveau].vitesseTexte;
    
    // Redémarrer le jeu avec la nouvelle vitesse si le jeu est en cours
    if (jeuEnCours && !jeuEnPause) {
        clearInterval(intervalleJeu);
        intervalleJeu = setInterval(dessiner, niveaux[niveau].vitesse);
    }
}

// Fonction pour mettre en pause/reprendre le jeu
function basculerPause() {
    if (!jeuEnCours) return;
    
    if (jeuEnPause) {
        // Reprendre le jeu
        intervalleJeu = setInterval(dessiner, niveaux[niveauActuel].vitesse);
        btnPause.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
        if (btnPauseMobile) btnPauseMobile.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
        jeuEnPause = false;
    } else {
        // Mettre en pause le jeu
        clearInterval(intervalleJeu);
        btnPause.innerHTML = '<i class="fas fa-play"></i> REPRENDRE';
        if (btnPauseMobile) btnPauseMobile.innerHTML = '<i class="fas fa-play"></i> REPRENDRE';
        jeuEnPause = true;
    }
}

// Basculer le son
function basculerSon() {
    sonActif = !sonActif;
    if (sonActif) {
        btnSon.innerHTML = '<i class="fas fa-volume-up"></i> SON';
        // Jouer un son de confirmation
        jouerSon(523.25, 0.1);
    } else {
        btnSon.innerHTML = '<i class="fas fa-volume-mute"></i> SON';
    }
}

// Partager le score
function partagerScore() {
    const texte = `J'ai obtenu ${score} points au jeu Snake ! 🐍\nMon meilleur score : ${meilleurScore}\n\nVenez essayer !`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Mon score au jeu Snake',
            text: texte,
            url: window.location.href
        }).catch(console.error);
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(texte).then(() => {
            alert('Score copié dans le presse-papiers !');
        }).catch(console.error);
    } else {
        // Fallback pour les navigateurs plus anciens
        prompt('Copiez ce texte pour partager votre score :', texte);
    }
}

// Écouteurs d'événements pour le clavier
document.addEventListener("keydown", function(event) {
    // Touches de direction
    if (event.keyCode === 37 || event.key === "ArrowLeft") {
        controlerDirection("gauche");
    } else if (event.keyCode === 38 || event.key === "ArrowUp") {
        controlerDirection("haut");
    } else if (event.keyCode === 39 || event.key === "ArrowRight") {
        controlerDirection("droite");
    } else if (event.keyCode === 40 || event.key === "ArrowDown") {
        controlerDirection("bas");
    }
    
    // Espace pour pause/reprise
    else if (event.keyCode === 32 || event.key === " ") {
        basculerPause();
        event.preventDefault(); // Empêcher le défilement de la page
    }
    
    // R pour redémarrer
    else if (event.keyCode === 82 || event.key === "r" || event.key === "R") {
        initialiserJeu();
    }
    
    // Échap pour quitter
    else if (event.keyCode === 27) {
        if (jeuEnCours && !jeuEnPause) {
            basculerPause();
        }
    }
});

// Contrôles mobiles
btnHaut.addEventListener("click", () => controlerDirection("haut"));
btnBas.addEventListener("click", () => controlerDirection("bas"));
btnGauche.addEventListener("click", () => controlerDirection("gauche"));
btnDroite.addEventListener("click", () => controlerDirection("droite"));

if (btnPauseMobile) {
    btnPauseMobile.addEventListener("click", basculerPause);
}

if (btnRedemarrerMobile) {
    btnRedemarrerMobile.addEventListener("click", initialiserJeu);
}

// Boutons de niveau
btnTresFacile.addEventListener("click", () => changerNiveau("tresFacile"));
btnFacile.addEventListener("click", () => changerNiveau("facile"));
btnNormal.addEventListener("click", () => changerNiveau("normal"));
btnDifficile.addEventListener("click", () => changerNiveau("difficile"));
btnExtreme.addEventListener("click", () => changerNiveau("extreme"));

// Écouteurs d'événements pour les boutons
btnPause.addEventListener("click", basculerPause);
btnRedemarrer.addEventListener("click", initialiserJeu);
btnRejouer.addEventListener("click", initialiserJeu);
btnPartager.addEventListener("click", partagerScore);
btnSon.addEventListener("click", basculerSon);

// Démarrer le jeu au chargement de la page
window.onload = function() {
    // Initialiser l'audio
    initialiserAudio();
    
    // Initialiser le meilleur score
    meilleurScoreElement.textContent = meilleurScore;
    initialiserJeu();
    
    // Afficher/masquer les contrôles mobiles selon la taille d'écran
    function ajusterControlesMobile() {
        const controlesMobile = document.querySelector('.mobile-game-area');
        if (controlesMobile) {
            if (window.innerWidth <= 768) {
                controlesMobile.style.display = 'block';
            } else {
                controlesMobile.style.display = 'none';
            }
        }
    }
    
    ajusterControlesMobile();
    window.addEventListener('resize', ajusterControlesMobile);
    
    // Empêcher le défilement avec les touches fléchées sur mobile
    document.addEventListener('keydown', function(e) {
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    });
    
    // Empêcher le zoom avec double tap sur mobile
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Prévenir le défilement quand on touche les contrôles mobiles
    document.querySelectorAll('.btn-mobile, .btn-mobile-action').forEach(button => {
        button.addEventListener('touchstart', function(e) {
            e.preventDefault();
        });
    });
};

// Gestion du redimensionnement de la fenêtre
window.addEventListener('resize', function() {
    // Réajuster la taille du canvas si nécessaire
    const canvasContainer = document.querySelector('.game-container');
    const canvasWidth = canvasContainer.offsetWidth;
    
    if (canvasWidth < 400) {
        canvas.style.maxWidth = '100%';
    }
});

// Mode sombre/clair automatique basé sur les préférences système
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.body.style.background = "linear-gradient(135deg, #f5f7fa, #c3cfe2)";
    document.body.style.color = "#333";
}