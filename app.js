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
const btnSonMobile = document.getElementById("btnSonMobile");

// Configuration du jeu
const tailleCase = 20;
const tailleCanvas = 400;
const tailleGrille = tailleCanvas / tailleCase;

// Niveaux de difficulté - VITESSES RÉDUITES pour être moins rapides
const niveaux = {
    tresFacile: { vitesse: 180, nom: "Débutant", vitesseTexte: "Très lente" },
    facile: { vitesse: 120, nom: "Facile", vitesseTexte: "Lente" },
    normal: { vitesse: 90, nom: "Normal", vitesseTexte: "Normale" },
    difficile: { vitesse: 60, nom: "Difficile", vitesseTexte: "Rapide" },
    extreme: { vitesse: 35, nom: "Extrême", vitesseTexte: "Très rapide" }
};

// Variables du jeu
let serpent = [];
let nourriture = {};
let score = 0;
let meilleurScore = localStorage.getItem('meilleurScoreSnake') || 0;
let direction = ""; // Vide au début - le serpent ne bouge pas
let prochaineDirection = "";
let intervalleJeu;
let jeuEnPause = false;
let jeuEnCours = false;
let jeuDemarre = false; // Nouvelle variable pour savoir si le jeu a commencé
let niveauActuel = "tresFacile";
let sonActif = false; // Désactivé par défaut pour mobile

// Fonction pour dessiner l'état initial du jeu
function dessinerJeuInitial() {
    // Effacer le canvas
    context.clearRect(0, 0, tailleCanvas, tailleCanvas);
    
    // Dessiner la grille
    dessinerGrille();
    
    // Dessiner le serpent initial
    dessinerSerpent();
    
    // Dessiner la nourriture
    dessinerNourriture();
}

// Initialisation complète du jeu
function initialiserJeu() {
    console.log("Initialisation du jeu...");
    
    // Réinitialiser le serpent
    serpent = [];
    // Position initiale au centre
    serpent[0] = { 
        x: Math.floor(tailleGrille/2) * tailleCase, 
        y: Math.floor(tailleGrille/2) * tailleCase 
    };
    
    // Générer la première nourriture
    genererNourriture();
    
    // Réinitialiser le score et la direction
    score = 0;
    scoreElement.textContent = score;
    longueurSerpentElement.textContent = serpent.length;
    direction = ""; // Vide - le serpent ne bouge pas
    prochaineDirection = "";
    jeuDemarre = false; // Le jeu n'a pas encore commencé
    
    // Mettre à jour le meilleur score
    meilleurScoreElement.textContent = meilleurScore;
    
    // Mettre à jour l'affichage du niveau
    niveauText.textContent = niveaux[niveauActuel].nom;
    vitesseText.textContent = niveaux[niveauActuel].vitesseTexte;
    
    // Cacher l'écran de fin de jeu
    ecranFin.style.display = "none";
    
    // Dessiner l'état initial
    dessinerJeuInitial();
    
    // Arrêter le jeu s'il était en cours
    if (intervalleJeu) {
        clearInterval(intervalleJeu);
        intervalleJeu = null;
    }
    
    jeuEnCours = true;
    jeuEnPause = false;
    
    // Mettre à jour les boutons pause
    btnPause.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
    if (btnPauseMobile) {
        btnPauseMobile.innerHTML = '<i class="fas fa-pause"></i>';
    }
    
    console.log("Jeu initialisé. Appuyez sur une direction pour commencer.");
}

// Démarrer le jeu (commencer le mouvement)
function demarrerJeu() {
    if (!jeuDemarre && jeuEnCours && !jeuEnPause) {
        jeuDemarre = true;
        console.log("Jeu démarré! Le serpent commence à bouger.");
        
        // Démarrer le jeu avec la vitesse du niveau actuel
        if (intervalleJeu) clearInterval(intervalleJeu);
        intervalleJeu = setInterval(dessiner, niveaux[niveauActuel].vitesse);
    }
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
    // Si le jeu n'a pas encore démarré, ne rien faire
    if (!jeuDemarre) {
        return;
    }
    
    // Effacer le canvas
    context.clearRect(0, 0, tailleCanvas, tailleCanvas);
    
    // Dessiner la grille
    dessinerGrille();
    
    // Mettre à jour la direction
    if (prochaineDirection !== "") {
        direction = prochaineDirection;
    }
    
    // Si aucune direction n'est définie, ne rien faire
    if (direction === "") {
        dessinerSerpent();
        dessinerNourriture();
        return;
    }
    
    // Calculer la nouvelle position de la tête
    let serpentX = serpent[0].x;
    let serpentY = serpent[0].y;
    
    if (direction === "gauche") serpentX -= tailleCase;
    else if (direction === "haut") serpentY -= tailleCase;
    else if (direction === "droite") serpentX += tailleCase;
    else if (direction === "bas") serpentY += tailleCase;
    
    // Vérifier si le serpent mange la nourriture
    if (serpentX === nourriture.x && serpentY === nourriture.y) {
        score += 1; // AJOUTE 1 POINT, PAS 10
        scoreElement.textContent = score;
        longueurSerpentElement.textContent = serpent.length + 1; // +1 car on va ajouter la tête
        genererNourriture();
    } else {
        // Retirer la queue si aucune nourriture n'a été mangée
        serpent.pop();
    }
    
    // Créer la nouvelle tête
    let nouvelleTete = { x: serpentX, y: serpentY };
    
    // Vérifier les collisions
    if (serpentX < 0 || serpentY < 0 || 
        serpentX >= tailleCanvas || serpentY >= tailleCanvas || 
        collision(nouvelleTete, serpent)) {
        finDuJeu();
        return;
    }
    
    // Ajouter la nouvelle tête au serpent
    serpent.unshift(nouvelleTete);
    
    // Dessiner la nourriture
    dessinerNourriture();
    
    // Dessiner le serpent
    dessinerSerpent();
}

// Dessiner le serpent
function dessinerSerpent() {
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
        } else {
            // Corps du serpent
            gradient = context.createLinearGradient(
                serpent[i].x, serpent[i].y,
                serpent[i].x + tailleCase, serpent[i].y + tailleCase
            );
            gradient.addColorStop(0, '#45a049');
            gradient.addColorStop(1, '#388E3C');
        }
        
        context.fillStyle = gradient;
        context.fillRect(serpent[i].x, serpent[i].y, tailleCase, tailleCase);
        
        // Contour du serpent
        context.strokeStyle = i === 0 ? '#1B5E20' : '#2E7D32';
        context.lineWidth = 2;
        context.strokeRect(serpent[i].x, serpent[i].y, tailleCase, tailleCase);
        
        // Yeux sur la tête du serpent (direction par défaut "droite" si pas de direction)
        if (i === 0) {
            dessinerYeux(serpent[i].x, serpent[i].y, direction || "droite");
        }
    }
}

// Dessiner les yeux du serpent
function dessinerYeux(x, y, dir) {
    context.fillStyle = "#000";
    let tailleOeil = tailleCase / 5;
    let decalage = tailleCase / 3;
    
    // Position des yeux selon la direction
    switch(dir) {
        case "gauche":
            context.fillRect(x + decalage - tailleOeil, y + decalage, tailleOeil, tailleOeil);
            context.fillRect(x + decalage - tailleOeil, y + tailleCase - decalage - tailleOeil, tailleOeil, tailleOeil);
            break;
        case "haut":
            context.fillRect(x + decalage, y + decalage - tailleOeil, tailleOeil, tailleOeil);
            context.fillRect(x + tailleCase - decalage - tailleOeil, y + decalage - tailleOeil, tailleOeil, tailleOeil);
            break;
        case "droite":
            context.fillRect(x + tailleCase - decalage, y + decalage, tailleOeil, tailleOeil);
            context.fillRect(x + tailleCase - decalage, y + tailleCase - decalage - tailleOeil, tailleOeil, tailleOeil);
            break;
        case "bas":
            context.fillRect(x + decalage, y + tailleCase - decalage, tailleOeil, tailleOeil);
            context.fillRect(x + tailleCase - decalage - tailleOeil, y + tailleCase - decalage, tailleOeil, tailleOeil);
            break;
        default:
            // Direction par défaut (droite)
            context.fillRect(x + tailleCase - decalage, y + decalage, tailleOeil, tailleOeil);
            context.fillRect(x + tailleCase - decalage, y + tailleCase - decalage - tailleOeil, tailleOeil, tailleOeil);
    }
}

// Dessiner la nourriture
function dessinerNourriture() {
    // Corps principal
    context.fillStyle = "#FF9800";
    context.beginPath();
    context.arc(nourriture.x + tailleCase/2, nourriture.y + tailleCase/2, tailleCase/2 - 2, 0, Math.PI * 2);
    context.fill();
    
    // Reflet
    context.fillStyle = "#FFCC80";
    context.beginPath();
    context.arc(nourriture.x + tailleCase/3, nourriture.y + tailleCase/3, tailleCase/6, 0, Math.PI * 2);
    context.fill();
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
    intervalleJeu = null;
    jeuEnCours = false;
    jeuDemarre = false;
    
    // Mettre à jour le meilleur score si nécessaire
    if (score > meilleurScore) {
        meilleurScore = score;
        localStorage.setItem('meilleurScoreSnake', meilleurScore);
        meilleurScoreElement.textContent = meilleurScore;
    }
    
    // Déterminer le message en fonction du score
    let message = "";
    if (score < 5) {
        message = "Essayez encore !";
    } else if (score < 15) {
        message = "Bon début !";
    } else if (score < 30) {
        message = "Bien joué !";
    } else if (score < 50) {
        message = "Excellent !";
    } else if (score < 100) {
        message = "Incroyable !";
    } else {
        message = "LÉGENDAIRE ! Vous maîtrisez Snake !";
    }
    
    // Afficher l'écran de fin
    scoreFinalElement.textContent = score;
    messageFin.textContent = message;
    ecranFin.style.display = "flex";
}

// Gestion des directions - CORRIGÉ
function controlerDirection(nouvelleDirection) {
    console.log("Tentative de direction:", nouvelleDirection, "Direction actuelle:", direction);
    
    // Démarrer le jeu si c'est la première direction
    if (!jeuDemarre) {
        demarrerJeu();
    }
    
    // Empêcher les mouvements inverses
    if ((nouvelleDirection === "gauche" && direction !== "droite") ||
        (nouvelleDirection === "haut" && direction !== "bas") ||
        (nouvelleDirection === "droite" && direction !== "gauche") ||
        (nouvelleDirection === "bas" && direction !== "haut")) {
        prochaineDirection = nouvelleDirection;
        console.log("Direction acceptée:", nouvelleDirection);
    } else {
        console.log("Direction rejetée (mouvement inverse)");
    }
}

// Changer le niveau de difficulté
function changerNiveau(niveau) {
    console.log("Changement de niveau vers:", niveau);
    
    // Mettre à jour les boutons
    document.querySelectorAll('.btn-niveau').forEach(btn => {
        btn.classList.remove("actif");
    });
    
    // Activer le bouton correspondant
    document.getElementById(niveau).classList.add("actif");
    
    // Mettre à jour le niveau actuel
    niveauActuel = niveau;
    niveauText.textContent = niveaux[niveau].nom;
    vitesseText.textContent = niveaux[niveau].vitesseTexte;
    
    // Redémarrer le jeu avec la nouvelle vitesse si le jeu est en cours
    if (jeuEnCours && !jeuEnPause && jeuDemarre) {
        clearInterval(intervalleJeu);
        intervalleJeu = setInterval(dessiner, niveaux[niveau].vitesse);
        console.log("Vitesse mise à jour vers:", niveaux[niveau].vitesse, "ms");
    }
}

// Fonction pour mettre en pause/reprendre le jeu
function basculerPause() {
    if (!jeuEnCours || !jeuDemarre) return;
    
    if (jeuEnPause) {
        // Reprendre le jeu
        intervalleJeu = setInterval(dessiner, niveaux[niveauActuel].vitesse);
        btnPause.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
        if (btnPauseMobile) {
            btnPauseMobile.innerHTML = '<i class="fas fa-pause"></i>';
        }
        jeuEnPause = false;
        console.log("Jeu repris");
    } else {
        // Mettre en pause le jeu
        clearInterval(intervalleJeu);
        btnPause.innerHTML = '<i class="fas fa-play"></i> REPRENDRE';
        if (btnPauseMobile) {
            btnPauseMobile.innerHTML = '<i class="fas fa-play"></i>';
        }
        jeuEnPause = true;
        console.log("Jeu mis en pause");
    }
}

// Basculer le son
function basculerSon() {
    sonActif = !sonActif;
    if (sonActif) {
        btnSon.innerHTML = '<i class="fas fa-volume-up"></i> SON';
        if (btnSonMobile) {
            btnSonMobile.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    } else {
        btnSon.innerHTML = '<i class="fas fa-volume-mute"></i> SON';
        if (btnSonMobile) {
            btnSonMobile.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    }
}

// Écouteurs d'événements pour le clavier
document.addEventListener("keydown", function(event) {
    console.log("Touche pressée:", event.key, "Code:", event.keyCode);
    
    // Touches de direction
    if (event.keyCode === 37 || event.key === "ArrowLeft") {
        controlerDirection("gauche");
        event.preventDefault();
    } else if (event.keyCode === 38 || event.key === "ArrowUp") {
        controlerDirection("haut");
        event.preventDefault();
    } else if (event.keyCode === 39 || event.key === "ArrowRight") {
        controlerDirection("droite");
        event.preventDefault();
    } else if (event.keyCode === 40 || event.key === "ArrowDown") {
        controlerDirection("bas");
        event.preventDefault();
    }
    
    // Espace pour pause/reprise
    else if (event.keyCode === 32 || event.key === " ") {
        basculerPause();
        event.preventDefault();
    }
    
    // R pour redémarrer
    else if (event.keyCode === 82 || event.key === "r" || event.key === "R") {
        initialiserJeu();
        event.preventDefault();
    }
});

// Contrôles mobiles
btnHaut.addEventListener("click", function() {
    console.log("Bouton Haut cliqué");
    controlerDirection("haut");
});

btnBas.addEventListener("click", function() {
    console.log("Bouton Bas cliqué");
    controlerDirection("bas");
});

btnGauche.addEventListener("click", function() {
    console.log("Bouton Gauche cliqué");
    controlerDirection("gauche");
});

btnDroite.addEventListener("click", function() {
    console.log("Bouton Droite cliqué");
    controlerDirection("droite");
});

if (btnPauseMobile) {
    btnPauseMobile.addEventListener("click", function() {
        console.log("Bouton Pause Mobile cliqué");
        basculerPause();
    });
}

if (btnRedemarrerMobile) {
    btnRedemarrerMobile.addEventListener("click", function() {
        console.log("Bouton Redémarrer Mobile cliqué");
        initialiserJeu();
    });
}

if (btnSonMobile) {
    btnSonMobile.addEventListener("click", function() {
        console.log("Bouton Son Mobile cliqué");
        basculerSon();
    });
}

// Boutons de niveau
btnTresFacile.addEventListener("click", function() {
    console.log("Niveau Très Facile sélectionné");
    changerNiveau("tresFacile");
});

btnFacile.addEventListener("click", function() {
    console.log("Niveau Facile sélectionné");
    changerNiveau("facile");
});

btnNormal.addEventListener("click", function() {
    console.log("Niveau Normal sélectionné");
    changerNiveau("normal");
});

btnDifficile.addEventListener("click", function() {
    console.log("Niveau Difficile sélectionné");
    changerNiveau("difficile");
});

btnExtreme.addEventListener("click", function() {
    console.log("Niveau Extrême sélectionné");
    changerNiveau("extreme");
});

// Écouteurs d'événements pour les boutons
btnPause.addEventListener("click", function() {
    console.log("Bouton Pause cliqué");
    basculerPause();
});

btnRedemarrer.addEventListener("click", function() {
    console.log("Bouton Redémarrer cliqué");
    initialiserJeu();
});

btnRejouer.addEventListener("click", function() {
    console.log("Bouton Rejouer cliqué");
    initialiserJeu();
});

btnSon.addEventListener("click", function() {
    console.log("Bouton Son cliqué");
    basculerSon();
});

// Démarrer le jeu au chargement de la page
window.onload = function() {
    console.log("Page chargée, initialisation du jeu...");
    
    // Initialiser le meilleur score
    meilleurScoreElement.textContent = meilleurScore;
    
    // Initialiser le jeu mais NE PAS DÉMARRER LE MOUVEMENT
    initialiserJeu();
    
    // Afficher/masquer les contrôles mobiles selon la taille d'écran
    function ajusterControlesMobile() {
        const controlesMobile = document.querySelector('.mobile-game-area');
        const controlesBureau = document.querySelector('.controles-bureau');
        
        if (window.innerWidth <= 768) {
            // Mode mobile
            if (controlesMobile) {
                controlesMobile.style.display = 'block';
                console.log("Contrôles mobiles affichés");
            }
            if (controlesBureau) {
                controlesBureau.style.display = 'none';
                console.log("Contrôles bureau cachés");
            }
        } else {
            // Mode bureau
            if (controlesMobile) {
                controlesMobile.style.display = 'none';
                console.log("Contrôles mobiles cachés");
            }
            if (controlesBureau) {
                controlesBureau.style.display = 'block';
                console.log("Contrôles bureau affichés");
            }
        }
    }
    
    ajusterControlesMobile();
    window.addEventListener('resize', ajusterControlesMobile);
    
    // Empêcher le défilement avec les touches fléchées (uniquement pour mobile)
    document.addEventListener('keydown', function(e) {
        if(window.innerWidth <= 768 && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space',' '].indexOf(e.code) > -1) {
            e.preventDefault();
        }
    }, false);
    
    // Empêcher le zoom avec double tap sur mobile
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    console.log("Jeu prêt! Appuyez sur une direction pour commencer.");
};

// Redimensionnement responsive du canvas
window.addEventListener('resize', function() {
    const canvasContainer = document.querySelector('.game-container');
    const canvasWidth = canvasContainer.offsetWidth;
    
    if (canvasWidth < 400) {
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
    }
});

// Ajouter un console.log de test
console.log("Script JavaScript chargé avec succès");