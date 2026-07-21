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
                "Tu veux en savoir plus sur moi ? C’est ici que je me présente !",
                "Bienvenue dans ma petite fiche de présentation !"
            ],

            click: [
                "Je suis une Kraduk venue de la planète Saphira !",
                "J’adore explorer, jouer et rencontrer de nouvelles personnes !",
                "Tu as déjà regardé mes préférences ?"
            ],

            idle: [
                "Alors, tu commences à mieux me connaître ?",
                "Je suis curieuse… et toi, qu’est-ce que tu aimes ?"
            ]
        },

        "reseaux.html": {
            welcome: [
                "Tu veux continuer l’aventure avec moi ? Retrouve-moi sur mes réseaux !",
                "Bienvenue dans ma salle des communications !"
            ],

            click: [
                "Tu peux me retrouver sur Twitch !",
                "Viens rejoindre la communauté sur Discord !",
                "Je publie aussi du contenu sur mes autres réseaux !"
            ],

            idle: [
                "Tu hésites sur le réseau à choisir ? Twitch est un bon début !",
                "Je serai ravie de te retrouver ailleurs !"
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