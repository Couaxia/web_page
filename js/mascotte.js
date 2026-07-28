"use strict";
const mascotteImage = document.querySelector("#mascotte-image");

document.addEventListener("DOMContentLoaded", () => {
    const mascotteButton = document.querySelector("#mascotte-button");
    const mascotteBulle = document.querySelector("#mascotte-bulle");

    if (!mascotteButton || !mascotteBulle) {
        return;
    }

    let hideTimer = null;
    let idleTimer = null;
    let clickCount = 0;
    let lastMessage = "";

    /* ==========================================
       MESSAGES SELON LA PAGE
    ========================================== */

    const pageMessages = {
        "accueil.html": {
            welcome: [
                "Bienvenue dans mon univers ! Je suis Couaxia, exploratrice venue de Saphira !",
                "Oh ! Un visiteur ! Bienvenue à bord !",
                "Prête à partir à l’aventure avec moi ?"
            ],

            click: [
                "Tu peux découvrir mon histoire juste au-dessus !",
                "Avadora est prête pour une nouvelle exploration !",
                "Installe-toi, tu es ici chez toi !"
            ],

            idle: [
                "Tu prends le temps de visiter ? Ça me fait plaisir !",
                "Je peux te faire découvrir mon univers quand tu veux."
            ]
        },
            
        "a-propos.html": {
            welcome: [
                "Bienvenue sur ma fiche officielle ! Ici, tu peux découvrir Couaxia sous toutes ses facettes.",
                "Tu veux mieux me connaître ? Tu es exactement au bon endroit !",
                "Entre mon histoire, ma personnalité et mon design, cette page regroupe presque tout sur moi.",
                "Bienvenue dans les archives personnelles de Couaxia !",
                "Approche ! Je vais te présenter mon univers, mon parcours et quelques-uns de mes secrets.",
                "Ici, tu peux découvrir à la fois la VTubeuse et le personnage venu de Saphira."
            ],

            click: [
                "Je suis Couaxia, une VTubeuse française spécialisée dans le multigaming.",
                "Mon univers mélange aventures spatiales, créatures fantastiques, tentacules et bonne humeur.",
                "Je suis une Kraduk originaire de la planète Saphira.",
                "Dans mon univers, j’ai cent vingt-six ans !",
                "Je mesure un mètre soixante.",
                "Ma communauté porte le nom des Poups.",
                "J’aime créer une ambiance accueillante, drôle et sans pression pendant mes lives.",
                "Je suis curieuse, passionnée, souriante… et parfois un peu chaotique.",
                "Mes couleurs préférées sont le violet, le rose et le bleu.",
                "Je joue aussi bien à des jeux multijoueurs qu’à des jeux d’horreur ou narratifs.",
                "Les jeux de survie et les jeux indépendants font aussi partie de mes préférences.",
                "Mon aventure sur Twitch a franchi une grande étape le 20 mai 2025.",
                "Je suis officiellement devenue VTubeuse le 2 juin 2025.",
                "Depuis, je développe mes streams, mon site et tout l’univers de Couaxia.",
                "Tu peux consulter mes références pour voir mon design sous différents angles.",
                "La reference sheet principale montre mon visage, mon dos, mes mains et les détails importants.",
                "La seconde reference sheet présente une variante de mon apparence.",
                "Une autre référence montre ma morphologie, mes marques corporelles et mes tentacules.",
                "Ma palette permet de récupérer directement les couleurs utilisées pour mon personnage.",
                "Clique sur une couleur pour copier son code hexadécimal.",
                "La couleur cyan lumineuse de mon univers correspond au code #22F2EF.",
                "Mes cheveux utilisent principalement une teinte rouge sombre.",
                "Les détails dorés permettent de donner un aspect plus précieux à mon design.",
                "Mon personnage me permet de raconter des histoires qui seraient impossibles dans le monde réel.",
                "Avadora, Natsu, Hylda et Cita font partie des éléments importants de mon univers.",
                "Les aventures spatiales sont au cœur de mon histoire.",
                "J’adore partager mes projets avec ma communauté et les faire évoluer progressivement.",
                "Mon objectif est que chacun puisse venir discuter, rire et passer un bon moment.",
                "Tu peux retrouver toute mon histoire grâce au bouton situé en haut de cette page.",
                "Tu as déjà choisi la partie de mon design que tu préfères ?"
            ],

            idle: [
                "Tu prends le temps d’observer mes références ? Regarde bien les petits détails.",
                "Tu hésites entre mon histoire et ma fiche artistique ? Les deux sont liées.",
                "La palette peut être très utile pour les artistes qui souhaitent me dessiner.",
                "Chaque couleur de mon modèle a été choisie pour renforcer mon univers.",
                "Tu as remarqué les différences entre mes différentes références ?",
                "Mon univers continue d’évoluer avec de nouvelles histoires et de nouveaux personnages.",
                "Prends ton temps, cette page contient beaucoup d’informations.",
                "Je suis curieuse de savoir quelle couleur de ma palette tu préfères.",
                "Les Poups sont une partie très importante de mon aventure.",
                "Mon site évolue en même temps que mon histoire de VTubeuse.",
                "Tu peux cliquer sur moi lorsque tu veux entendre une autre information.",
                "On dirait que tu étudies sérieusement ma fiche de personnage !",
                "Mes références servent à préserver les détails officiels de mon design.",
                "Même après tout ce temps, j’ai encore beaucoup de projets à ajouter ici.",
                "Une nouvelle aventure peut commencer à partir d’un simple détail."
            ]
        },
        "credits.html": {
            welcome: [
                "Je ne serais pas là sans tous ces artistes incroyables !",
                "Bienvenue dans la galerie de ceux qui ont donné vie à mon univers !"
            ],

            click: [
                "Pense à visiter le profil des artistes !",
                "Toutes ces créations comptent énormément pour moi.",
                "Les artistes méritent beaucoup d’amour !"
            ],

            idle: [
                "Prends le temps d’admirer leur travail !",
                "Chaque œuvre raconte une petite partie de mon aventure."
            ]
        },

        "characters.html": {
            welcome: [            
                "Bienvenue dans le Codex ! Ici, tu peux découvrir tous les personnages de mon univers.",
                "Oh, tu veux rencontrer mes compagnons ? Tu es au bon endroit !",
                "Chaque personnage possède son histoire, ses secrets et sa propre personnalité.",
                "Approche ! Je vais te présenter les personnes qui ont marqué mon aventure.",
                "Bienvenue parmi mes alliés, mes amis… et quelques créatures plutôt impressionnantes !",
                "Voici les personnes et créatures rencontrées pendant mon voyage !"
            ],

            click: [
                "Tu as déjà choisi ton personnage préféré ?",
                "Natsu est impressionnant, mais il est beaucoup plus gentil qu’il en a l’air !",
                "Hylda et Cita m’accompagnent depuis notre départ de Saphira.",
                "Myo paraît adorable, mais elle cache bien des secrets…",
                "Clique sur les fiches pour en apprendre davantage sur chaque personnage !",
                "Certains personnages n’ont pas encore révélé toutes leurs capacités.",
                "Chaque rencontre a changé une partie de mon voyage.",
                "Je me demande quel personnage te ressemble le plus !",
                "Les apparences peuvent être trompeuses dans mon univers.",
                "Tu découvriras peut-être de nouveaux personnages très bientôt !"
            ],

            idle: [
                "Alors… tu hésites encore sur ton personnage préféré ?",
                "Prends ton temps, certaines descriptions cachent de petits indices.",
                "Tu sais, même moi, je ne connais pas encore tous leurs secrets.",
                "On dirait que tu examines chaque fiche avec beaucoup d’attention !",
                "Certains liens entre les personnages ne sont pas encore évidents…",
                "Je sens que tu essaies de découvrir qui est le plus puissant !",
                "Tu veux un indice ? Regarde bien leur première apparition.",
                "Le Codex continuera de grandir au fil de mon histoire."
            ]
        },

        "debut_histoire.html": {
            welcome: [
                "Bienvenue sur Saphira ! C’est ici que tout a commencé…",
                "Installe-toi confortablement, voici le début de mon histoire."
            ],

            click: [
                "À cette époque, je rêvais déjà de découvrir la Terre.",
                "Avadora allait bientôt quitter Saphira…",
                "Ce voyage allait complètement changer ma vie."
            ],

            idle: [
                "Tu prends ton temps pour lire… ça me fait plaisir !",
                "Cette partie de mon histoire est très importante pour moi."
            ]
        },

        "chapitre1.html": {
            welcome: [
                "C’est ici que j’ai rencontré Natsu pour la première fois !",
                "Cette planète semblait déserte… jusqu’à notre rencontre."
            ],

            click: [
                "Natsu ne me faisait pas confiance au début.",
                "Notre rencontre aurait pu très mal se terminer…",
                "Il a fallu beaucoup de courage pour gagner sa confiance."
            ],

            idle: [
                "Tu comprends maintenant pourquoi Natsu compte autant pour moi ?",
                "Cette rencontre a marqué un tournant dans mon voyage."
            ]
        },

        "chapitre2.html": {
            welcome: [
                "Notre voyage continue… et la Terre se rapproche !",
                "Après toutes ces années, notre destination était presque en vue."
            ],

            click: [
                "Cinq années de voyage, c’est très long !",
                "Heureusement, je n’étais pas seule à bord.",
                "Nous ignorions encore ce qui nous attendait sur la Terre."
            ],

            idle: [
                "Le voyage est long, mais l’arrivée approche…",
                "Tu veux savoir ce que nous avons trouvé sur Terre ?"
            ]
        },

        "chapitre3.html": {
            welcome: [
                "Bienvenue au marché magique caché aux humains !",
                "C’est ici que nous avons rencontré Myo."
            ],

            click: [
                "Ce marché était rempli d’objets très étranges !",
                "Cit voulait déjà essayer tous les vêtements !",
                "Myo semblait en savoir bien plus qu’elle ne le disait…"
            ],

            idle: [
                "Observe bien, ce marché cache de nombreux secrets.",
                "Les humains ignorent totalement l’existence de cet endroit."
            ]
        },
        "chapitre4.html": {
            welcome: [
                "Bienvenue dans notre nouvelle base sur Terre !",
                "Après le marché magique, il était temps de trouver un endroit où nous installer.",
                "Ce chapitre marque le début d’une nouvelle vie… et peut-être de nouveaux sentiments.",
                "Approche, je vais te raconter comment nous avons construit notre première base terrestre.",
                "Entre exploration, lever de soleil et émotions inattendues… ce chapitre est très important pour moi."
            ],

            click: [
                "Nous avons caché Avadora au fond d’un lac pour que personne ne puisse la découvrir.",
                "La grotte sous-marine était parfaite pour dissimuler notre vaisseau.",
                "La petite capsule pouvait déployer un dôme de protection et construire toute une base.",
                "Notre nouvelle maison était invisible depuis la surface.",
                "J’étais tellement heureuse d’avoir enfin un endroit sûr sur Terre.",
                "Cette base allait devenir notre point de départ pour toutes nos futures explorations.",
                "Le lever du soleil près du lac était magnifique.",
                "Je voulais garder ce souvenir pour ne jamais oublier notre première matinée sur Terre.",
                "Je ne m’attendais pas à retrouver Myo assise seule près du lac.",
                "Myo semblait perdue dans ses pensées lorsque je l’ai rejointe.",
                "Nous avons parlé longtemps de nos vies et de nos mondes.",
                "Je lui ai raconté Saphira, mon peuple et mon voyage à travers les étoiles.",
                "Myo m’a parlé de Sham et des personnes importantes qu’elle avait rencontrées.",
                "Ce moment avec Myo était calme… mais il a changé quelque chose en moi.",
                "À cet instant, je ne comprenais pas encore ce que je ressentais.",
                "Je savais seulement que je me sentais bien à ses côtés.",
                "Son baiser sur ma joue m’a complètement déstabilisée.",
                "Je crois que je n’avais jamais rougi autant de toute ma vie.",
                "Hylda a immédiatement remarqué que quelque chose n’allait pas.",
                "Évidemment, j’ai prétendu que tout allait parfaitement bien.",
                "Ce chapitre marque peut-être le début de quelque chose de plus profond entre Myo et moi.",
                "Après cette matinée, nous étions enfin prêts à découvrir la technologie humaine.",
                "La Terre était encore pleine de mystères à explorer.",
                "Notre aventure ne faisait que commencer."
            ],

            idle: [
                "Tu prends ton temps pour découvrir notre nouvelle base ?",
                "Cette base est devenue un endroit très important pour notre équipage.",
                "Le lac était calme, mais beaucoup de choses changeaient dans mon cœur.",
                "Je me demande si tu avais compris mes sentiments avant moi.",
                "Myo semblait déjà savoir que ce moment était spécial.",
                "Hylda remarque toujours les choses que j’essaie de cacher.",
                "Je n’étais vraiment pas prête à expliquer pourquoi j’étais aussi rouge.",
                "Cette matinée reste l’un de mes plus beaux souvenirs sur Terre.",
                "Le calme du lever de soleil contrastait beaucoup avec toutes nos aventures.",
                "Prends ton temps… ce chapitre parle autant de notre base que de mes émotions.",
                "Notre prochaine exploration nous fera découvrir un peu plus le monde humain.",
                "Tu crois que Myo ressentait déjà la même chose que moi ?"
            ]
},
        "annexe_chapitre1.html": {
            welcome: [
                "Une annexe ! Ici, tu trouveras quelques détails supplémentaires.",
                "Tu veux en apprendre davantage sur Natsu et sa planète ?"
            ],

            click: [
                "Les annexes permettent d’explorer les petits détails du récit.",
                "Certains éléments sont importants pour comprendre mon univers."
            ],

            idle: [
                "Merci de prendre le temps de lire les détails !",
                "Les plus curieux découvrent toujours davantage de secrets."
            ]
        }
        
    };
    window.showMascotteMessage = function (
    message,
    duration = 3500
) {
    showMessage(message, duration);
    animateMascotte();
};

    /* ==========================================
       MESSAGES DU MODE JOUR / NUIT
    ========================================== */

    const themeMessages = {
        light: [
            "Quelle belle journée pour explorer !",
            "La lumière de Saphira me manque parfois…",
            "On continue l’aventure sous le soleil ?"
        ],

        dark: [
            "La nuit est idéale pour raconter une histoire…",
            "Les étoiles me rappellent Saphira.",
            "L’univers est encore plus beau la nuit.",
            "Profite bien de cette ambiance nocturne !"
        ]
    };

    /* ==========================================
       RÉACTIONS AUX CLICS RÉPÉTÉS
    ========================================== */

    const repeatedClickMessages = [
        "Oui ? 😊",
        "Hihi !",
        "Tu m’aimes bien, on dirait !",
        "Attention, tu vas me donner le tournis ! 🐙",
        "Bon d’accord… je reste avec toi !",
        "Encore un clic ? Tu es vraiment curieux !",
        "Mes tentacules commencent à avoir le tournis !"
    ];

    /* ==========================================
       OUTILS
    ========================================== */

    function getCurrentPage() {
        const pathname = window.location.pathname;
        const pageName = pathname.split("/").pop();

        return pageName || "index.html";
    }

    function getCurrentTheme() {
        return document.documentElement.dataset.theme === "dark"
            ? "dark"
            : "light";
    }

    function chooseRandom(messages) {
        if (!Array.isArray(messages) || messages.length === 0) {
            return "Bienvenue dans mon univers !";
        }

        const availableMessages = messages.filter(
            (message) => message !== lastMessage
        );

        const usableMessages =
            availableMessages.length > 0
                ? availableMessages
                : messages;

        const randomIndex = Math.floor(
            Math.random() * usableMessages.length
        );

        const selectedMessage = usableMessages[randomIndex];

        lastMessage = selectedMessage;

        return selectedMessage;
    }

    function getPageSection(section) {
        const currentPage = getCurrentPage();
        const pageData = pageMessages[currentPage];

        if (!pageData || !pageData[section]) {
            return [];
        }

        return pageData[section];
    }

    function showMessage(message, duration = 5000) {
    window.clearTimeout(hideTimer);

    mascotteBulle.textContent = message;
    mascotteBulle.classList.add("visible");

    mascotteButton.classList.add("is-talking");

    if (mascotteImage) {
        const talkingImage =
            mascotteImage.dataset.talkingSrc;

        if (talkingImage) {
            mascotteImage.src = talkingImage;
        }
    }

    hideTimer = window.setTimeout(() => {
        mascotteBulle.classList.remove("visible");
        mascotteButton.classList.remove("is-talking");

        if (mascotteImage) {
            const idleImage =
                mascotteImage.dataset.idleSrc;

            if (idleImage) {
                mascotteImage.src = idleImage;
            }
        }
    }, duration);
}

    function animateMascotte() {
        mascotteButton.classList.remove("mascotte-reaction");

        /*
         * Force le navigateur à redémarrer l’animation.
         */
        void mascotteButton.offsetWidth;

        mascotteButton.classList.add("mascotte-reaction");

        window.setTimeout(() => {
            mascotteButton.classList.remove("mascotte-reaction");
        }, 600);
    }

    function resetIdleTimer() {
        window.clearTimeout(idleTimer);

        idleTimer = window.setTimeout(() => {
            const idleMessages = getPageSection("idle");

            if (idleMessages.length > 0) {
                showMessage(chooseRandom(idleMessages), 5500);
            }
        }, 30000);
    }

    /* ==========================================
       MESSAGE DE BIENVENUE SELON LA PAGE
    ========================================== */

    window.setTimeout(() => {
        const welcomeMessages = getPageSection("welcome");

        showMessage(
            chooseRandom(
                welcomeMessages.length > 0
                    ? welcomeMessages
                    : ["Bienvenue dans mon univers !"]
            ),
            6000
        );
    }, 900);

    /* ==========================================
       CLIC SUR LA MASCOTTE
    ========================================== */

    mascotteButton.addEventListener("click", () => {
        clickCount += 1;

        animateMascotte();
        resetIdleTimer();

        /*
         * Les trois premiers clics affichent principalement
         * des informations liées à la page.
         */
        if (clickCount <= 3) {
            const clickMessages = getPageSection("click");

            showMessage(
                chooseRandom(
                    clickMessages.length > 0
                        ? clickMessages
                        : repeatedClickMessages
                )
            );

            return;
        }

        /*
         * Tous les quatre clics, elle parle du thème.
         */
        if (clickCount % 4 === 0) {
            const currentTheme = getCurrentTheme();

            showMessage(
                chooseRandom(themeMessages[currentTheme])
            );

            return;
        }

        /*
         * Ensuite, elle réagit au nombre de clics.
         */
        const reactionIndex = Math.min(
            clickCount - 4,
            repeatedClickMessages.length - 1
        );

        showMessage(repeatedClickMessages[reactionIndex]);
    });

    /* ==========================================
       RÉACTION AU SURVOL
    ========================================== */

    mascotteButton.addEventListener("mouseenter", () => {
        showMessage("Coucou ! Clique sur moi !", 2500);
    });

    /* ==========================================
       RÉACTION AU CHANGEMENT DE THÈME
    ========================================== */

    const themeObserver = new MutationObserver((mutations) => {
        const themeHasChanged = mutations.some(
            (mutation) =>
                mutation.type === "attributes" &&
                mutation.attributeName === "data-theme"
        );

        if (!themeHasChanged) {
            return;
        }

        const currentTheme = getCurrentTheme();

        showMessage(
            chooseRandom(themeMessages[currentTheme]),
            5000
        );

        animateMascotte();
    });

    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"]
    });

    /* ==========================================
   INTERACTIONS DE LA PAGE D'ACCUEIL
             VARIABLES ET OUTILS
========================================== */

const currentMascottePage = getCurrentPage();

if (
    currentMascottePage === "accueil.html" ||
    currentMascottePage === "index.html"
) {
    /*
     * Cet objet mémorise les informations déjà détectées.
     * Cela évite que la mascotte répète continuellement
     * le même message.
     */
    const accueilInteractionState = {
        lastFollowerCount: null,
        lastLiveStatus: null,
        lastCategory: "",
        lastAutomaticMessageAt: 0,
        seenSections: new Set()
    };

    /*
     * Temps minimal entre deux messages automatiques.
     * La valeur est exprimée en millisecondes.
     *
     * 7000 = 7 secondes
     */
    const AUTO_MESSAGE_COOLDOWN = 7000;

    /*
     * Vérifie si la mascotte peut afficher
     * un nouveau message automatique.
     */
    function canShowAutomaticMessage() {
        const currentTime = Date.now();

        const elapsedTime =
            currentTime -
            accueilInteractionState.lastAutomaticMessageAt;

        if (elapsedTime < AUTO_MESSAGE_COOLDOWN) {
            return false;
        }

        accueilInteractionState.lastAutomaticMessageAt =
            currentTime;

        return true;
    }

    /*
     * Affiche un message automatique,
     * anime la mascotte et réinitialise
     * son compteur d'inactivité.
     */
    function showAutomaticMascotteMessage(
        message,
        duration = 5000
    ) {
        if (!message) {
            return;
        }

        if (!canShowAutomaticMessage()) {
            return;
        }

        showMessage(message, duration);
        animateMascotte();
        resetIdleTimer();
    }

    /*
     * Transforme un texte comme :
     *
     * "867 followers"
     *
     * en nombre :
     *
     * 867
     */
    function parseMascotteNumber(value) {
        const normalizedValue = String(value || "")
            .replace(/\s/g, "")
            .replace(/[^\d]/g, "");

        const parsedNumber = Number.parseInt(
            normalizedValue,
            10
        );

        if (!Number.isFinite(parsedNumber)) {
            return null;
        }

        return parsedNumber;
    }

    /*
     * Recherche le premier élément HTML existant
     * parmi plusieurs sélecteurs possibles.
     *
     * Cela permet au script de fonctionner même
     * si certains identifiants sont légèrement
     * différents dans accueil.html.
     */
    function findFirstMascotteElement(selectors) {
        for (const selector of selectors) {
            const element =
                document.querySelector(selector);

            if (element) {
                return element;
            }
        }

        return null;
    }

    /*
     * Éléments Twitch recherchés dans accueil.html.
     */

    const twitchFollowerElement =
        findFirstMascotteElement([
            "#twitch-followers-count",
            "#followers-count",
            "[data-twitch-followers]"
        ]);

    const twitchLiveStatusElement =
        findFirstMascotteElement([
            "#twitch-status-pill",
            "#twitch-status-label",
            "[data-twitch-status]"
        ]);

    const twitchCategoryElement =
        findFirstMascotteElement([
            "#twitch-category",
            "#twitch-category-name",
            "#stream-category",
            "#twitch-game",
            "[data-twitch-category]"
        ]);

    /*
     * Affichage temporaire dans la console.
     * Cela permet de vérifier que les éléments
     * Twitch ont bien été trouvés.
     */
    console.log(
        "[Mascotte] Compteur followers :",
        twitchFollowerElement
    );

    console.log(
        "[Mascotte] Statut Twitch :",
        twitchLiveStatusElement
    );

    console.log(
        "[Mascotte] Catégorie Twitch :",
        twitchCategoryElement
    );

/* ==========================================
   FOLLOWERS - LIVE - CATEGORIE
========================================== */

/* ------------------------------
   FOLLOWERS
------------------------------ */

function updateFollowersReaction() {

    if (!twitchFollowerElement) {
        return;
    }

    const followerCount = parseMascotteNumber(
        twitchFollowerElement.textContent
    );

    if (followerCount === null) {
        return;
    }

    if (accueilInteractionState.lastFollowerCount === null) {

        accueilInteractionState.lastFollowerCount =
            followerCount;

        return;
    }

    if (
        followerCount >
        accueilInteractionState.lastFollowerCount
    ) {

        const gainedFollowers =
            followerCount -
            accueilInteractionState.lastFollowerCount;

        accueilInteractionState.lastFollowerCount =
            followerCount;

        showAutomaticMascotteMessage(

            gainedFollowers === 1
                ? `Un nouveau Poup vient d'arriver ! Nous sommes maintenant ${followerCount} ! 💜`
                : `${gainedFollowers} nouveaux Poups ! Merci énormément ! 💜`,

            6500
        );

        return;
    }

    accueilInteractionState.lastFollowerCount =
        followerCount;

}

if (twitchFollowerElement) {

    updateFollowersReaction();

    new MutationObserver(updateFollowersReaction)
        .observe(
            twitchFollowerElement,
            {
                childList: true,
                subtree: true,
                characterData: true
            }
        );

}


/* ------------------------------
   LIVE / OFFLINE
------------------------------ */

function getLiveStatus() {

    if (!twitchLiveStatusElement) {
        return null;
    }

    const container =

        twitchLiveStatusElement.closest(
            "[data-status]"
        ) ||

        twitchLiveStatusElement;

    const status =

        String(
            container.dataset.status ||
            ""
        ).toLowerCase();

    if (
        status === "live" ||
        status === "online"
    ) {
        return "live";
    }

    if (
        status === "offline"
    ) {
        return "offline";
    }

    const text =

        container.textContent
            .toLowerCase();

    if (
        text.includes("en direct")
    ) {
        return "live";
    }

    if (
        text.includes("hors ligne")
    ) {
        return "offline";
    }

    return null;

}

function updateLiveReaction() {

    const currentStatus =
        getLiveStatus();

    if (
        currentStatus === null
    ) {
        return;
    }

    if (
        accueilInteractionState.lastLiveStatus ===
        null
    ) {

        accueilInteractionState.lastLiveStatus =
            currentStatus;

        return;
    }

    if (
        accueilInteractionState.lastLiveStatus ===
        currentStatus
    ) {
        return;
    }

    accueilInteractionState.lastLiveStatus =
        currentStatus;

    if (
        currentStatus === "live"
    ) {

        showAutomaticMascotteMessage(

            "🔴 Je suis en direct ! Rejoins-nous sur Twitch !!",

            6500
        );

    }

    else {

        showAutomaticMascotteMessage(

            "💜 Le live est terminé. Tu peux regarder les clips ou les rediffusions juste en dessous !",

            6500
        );

    }

}

if (twitchLiveStatusElement) {

    updateLiveReaction();

    const container =

        twitchLiveStatusElement.closest(
            "[data-status]"
        ) ||

        twitchLiveStatusElement;

    new MutationObserver(
        updateLiveReaction
    ).observe(
        container,
        {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true,
            attributeFilter: [
                "data-status"
            ]
        }
    );

}


/* ------------------------------
   CATEGORIE
------------------------------ */

function getCurrentCategory() {

    if (!twitchCategoryElement) {
        return "";
    }

    return String(

        twitchCategoryElement.textContent ||

        ""

    ).trim();

}

function updateCategoryReaction() {

    const category =
        getCurrentCategory();

    if (
        category === ""
    ) {
        return;
    }

    if (
        accueilInteractionState.lastCategory ===
        ""
    ) {

        accueilInteractionState.lastCategory =
            category;

        return;
    }

    if (
        accueilInteractionState.lastCategory ===
        category
    ) {
        return;
    }

    accueilInteractionState.lastCategory =
        category;

    showAutomaticMascotteMessage(

        `🎮 Aujourd'hui je joue à ${category} ! Tu connais ce jeu ?`,

        6000
    );

}

if (twitchCategoryElement) {

    updateCategoryReaction();

    new MutationObserver(
        updateCategoryReaction
    ).observe(

        twitchCategoryElement,

        {
            childList: true,
            subtree: true,
            characterData: true
        }
    );
}

/* ==========================================
   REACTIONS AU SCROLL DES SECTIONS
========================================== */

/*
 * Chaque section possède :
 * - un nom unique ;
 * - plusieurs sélecteurs possibles ;
 * - un message adapté.
 */
const mascotteSections = [
    {
        name: "stream",

        selectors: [
            "#twitch-player-section",
            "#twitch-stream-section",
            ".twitch-stream",
            ".twitch-player-wrapper",
            "#twitch-section"
        ],

        getMessage() {
            const liveStatus = getLiveStatus();

            if (liveStatus === "live") {
                return "🔴 Tu arrives sur le live ! Je suis en direct, installe-toi avec nous !";
            }

            return "Voici mon espace Twitch ! Même hors ligne, tu peux découvrir mes contenus juste en dessous.";
        }
    },

    {
        name: "category",

        selectors: [
            "#twitch-category-section",
            ".twitch-stream-info",
            ".stream-information",
            "[data-section='category']"
        ],

        getMessage() {
            const category =
                getCurrentCategory();

            if (category) {
                return `🎮 Ici, tu peux voir la catégorie actuelle : ${category} !`;
            }

            return "La catégorie du stream sera affichée ici dès qu'elle sera disponible.";
        }
    },

    {
        name: "clips",

        selectors: [
            "#twitch-clips",
            "#clips-section",
            ".twitch-clips-section",
            ".clips-section",
            "[data-section='clips']"
        ],

        getMessage() {
            return "😂 Tu arrives sur mes clips ! C'est ici que se trouvent mes meilleurs moments… et probablement quelques fails !";
        }
    },

    {
        name: "videos",

        selectors: [
            "#twitch-videos",
            "#videos-section",
            ".twitch-videos-section",
            ".videos-section",
            "[data-section='videos']"
        ],

        getMessage() {
            return "📺 Tu as raté un live ? Toutes les rediffusions disponibles sont regroupées ici !";
        }
    }
];


/*
 * Recherche chaque section dans le HTML.
 */
const detectedMascotteSections = [];

mascotteSections.forEach((sectionConfig) => {
    const sectionElement =
        findFirstMascotteElement(
            sectionConfig.selectors
        );

    if (!sectionElement) {
        return;
    }

    /*
     * On ajoute un nom à la section
     * pour pouvoir l'identifier ensuite.
     */
    sectionElement.dataset.mascotteSection =
        sectionConfig.name;

    detectedMascotteSections.push({
        element: sectionElement,
        config: sectionConfig
    });
});


/*
 * Vérifie que le navigateur supporte
 * IntersectionObserver.
 */
if (
    "IntersectionObserver" in window &&
    detectedMascotteSections.length > 0
) {
    const mascotteSectionObserver =
        new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    /*
                     * La section doit être visible
                     * à au moins 35 %.
                     */
                    if (
                        !entry.isIntersecting ||
                        entry.intersectionRatio < 0.35
                    ) {
                        return;
                    }

                    const sectionName =
                        entry.target.dataset.mascotteSection;

                    /*
                     * Évite que la mascotte répète
                     * le même message à chaque scroll.
                     */
                    if (
                        accueilInteractionState
                            .seenSections
                            .has(sectionName)
                    ) {
                        return;
                    }

                    const detectedSection =
                        detectedMascotteSections.find(
                            (section) =>
                                section.config.name ===
                                sectionName
                        );

                    if (!detectedSection) {
                        return;
                    }

                    accueilInteractionState
                        .seenSections
                        .add(sectionName);

                    showAutomaticMascotteMessage(
                        detectedSection
                            .config
                            .getMessage(),
                        6000
                    );
                });
            },

            {
                /*
                 * La mascotte parle lorsque
                 * la section est suffisamment visible.
                 */
                threshold: [
                    0.35,
                    0.6
                ],

                /*
                 * Évite une détection trop tardive
                 * en bas de l'écran.
                 */
                rootMargin:
                    "0px 0px -12% 0px"
            }
        );

            /*
            * Active l'observation
            * sur chaque section trouvée.
            */
            detectedMascotteSections.forEach(
                ({ element }) => {
                    mascotteSectionObserver.observe(
                        element
                    );
                }
            );
        }


        /*
        * Petit message dans la console
        * pour vérifier les sections trouvées.
        */
        console.log(
            "[Mascotte] Sections détectées :",
            detectedMascotteSections.map(
                ({ config }) => config.name
            )
        );

        /* ==========================================
   PARTIE 4/4
   CLIPS - VIDEOS - FIN
========================================== */

/* ------------------------------
   SURVOL DES CLIPS
------------------------------ */

function setupClipInteractions() {

    const clipCards = document.querySelectorAll(
        ".twitch-clip-card, .clip-card, [data-twitch-clip]"
    );

    clipCards.forEach((card) => {

        if (card.dataset.mascotteReady === "true") {
            return;
        }

        card.dataset.mascotteReady = "true";

        card.addEventListener("mouseenter", () => {

            showMessage(
                "😂 Celui-là vaut vraiment le détour ! Clique dessus pour voir ce qu'il s'est passé !",
                4500
            );

            animateMascotte();

        });

    });

}


/* ------------------------------
   SURVOL DES VIDEOS
------------------------------ */

function setupVideoInteractions() {

    const videoCards = document.querySelectorAll(
        ".twitch-video-card, .video-card, [data-twitch-video]"
    );

    videoCards.forEach((card) => {

        if (card.dataset.mascotteReady === "true") {
            return;
        }

        card.dataset.mascotteReady = "true";

        card.addEventListener("mouseenter", () => {

            showMessage(
                "📺 Une rediffusion complète ! Parfait si tu as raté un live.",
                4500
            );

            animateMascotte();

        });

    });

}


/* ------------------------------
   INITIALISATION
------------------------------ */

setupClipInteractions();
setupVideoInteractions();


/*
 * Les clips et vidéos sont créés
 * après les appels API Twitch.
 *
 * On observe donc le DOM.
 */

const twitchContentContainer =
    findFirstMascotteElement([

        "#twitch-clips",

        "#clips-section",

        "#twitch-videos",

        "#videos-section",

        "main"

    ]);


if (twitchContentContainer) {

    new MutationObserver(() => {

        setupClipInteractions();
        setupVideoInteractions();

    }).observe(

        twitchContentContainer,

        {
            childList: true,
            subtree: true
        }

    );

}
/*
 * Petit message dans la console.
 */

console.log(
    "[Mascotte] Toutes les interactions Twitch sont chargées."
);

}
/* ==========================================
   FIN DOMContentLoaded
========================================== */

    /* ==========================================
       DÉTECTION D’INACTIVITÉ
    ========================================== */

    const visitorActivities = [
        "mousemove",
        "mousedown",
        "keydown",
        "scroll",
        "touchstart"
    ];

    visitorActivities.forEach((eventName) => {
        document.addEventListener(
            eventName,
            resetIdleTimer,
            { passive: true }
        );
    });

    resetIdleTimer();
});

const historyButtons = document.querySelectorAll(
    ".history-nav-button[data-mascotte-message]"
);

historyButtons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
        const message = button.dataset.mascotteMessage;

        if (message) {
            showMessage(message, 3000);
        }
    });
});
historyButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        const targetUrl = button.href;
        const message = button.dataset.mascotteMessage;

        if (!targetUrl || !message) {
            return;
        }

        event.preventDefault();

        showMessage(message, 1500);
        animateMascotte();

        document.body.classList.add("page-turn");

        window.setTimeout(() => {
            window.location.href = targetUrl;
        }, 900);
    });
});

window.showMessage = function (message, duration = 3500) {
    const bubble = document.getElementById("mascotteBulle");

    if (!bubble) {
        return;
    }

    bubble.textContent = message;
    bubble.classList.add("is-visible");

    clearTimeout(window.mascotteBubbleTimer);

    window.mascotteBubbleTimer = setTimeout(() => {
        bubble.classList.remove("is-visible");
    }, duration);
};