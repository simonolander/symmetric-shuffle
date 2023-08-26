window.onload = function () {
    const cardTrayDiv = document.getElementById("card-tray");
    const centerCardsDiv = document.getElementById("center-cards");
    const hintButton = document.getElementById("hint");
    const leftDotsContainer = document.getElementById("left-dots");
    const rightDotsContainer = document.getElementById("right-dots");

    let cardTray = [];
    let centerCards = [];
    let solution = [];

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function permute(array, permutation) {
        const copy = [...array]
        for (let i = 0; i < permutation.length; i++) {
            array[permutation[i]] = copy[i]
        }
    }

    function randomBoolean() {
        return Math.random() < 0.5;
    }

    function randomCard() {
        return {
            permutation: shuffle([0, 1, 2]),
            ball: [randomBoolean(), randomBoolean(), randomBoolean()]
        }
    }

    function getLineSvg(from, to, ball) {
        const y1 = (from + 1) * 40;
        const y2 = (to + 1) * 40;
        const parts = [];
        parts.push(`<polyline points="0,${y1} 20,${y1} 80,${y2} 100,${y2}" fill="none" stroke="#999" stroke-width="5"></polyline>`);
        if (ball) {
            parts.push(`<circle r="7" cx="90" cy="${y2}" fill="#999"></circle>`);
        }
        return parts.join("")
    }

    function getCenterCardSvg(index) {
        const parts = []
        const height = 150;
        parts.push(`<svg class="card" viewBox="0 0 100 ${height}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">`)
        parts.push(`<rect width="100%" height="100%" fill="#f0f0f0" rx="5" ry="5"/>`)
        const card = centerCards[index]
        if (card) {
            let colors = [0, 1, 2];
            for (let i = 0; i < index; ++i) {
                const card = centerCards[i];
                if (!card) {
                    colors = [undefined, undefined, undefined];
                    break;
                }
                permute(colors, card.permutation);
            }

            for (let i = 0; i < card.permutation.length; ++i) {
                const from = i;
                const to = card.permutation[i];
                const y1 = (from + 1) * height / 4;
                const y2 = (to + 1) * height / 4;
                const color = {
                    0: "#f88",
                    1: "#8f8",
                    2: "#88f",
                    undefined: "#999",
                }[colors[i]];
                parts.push(`<polyline points="0,${y1} 20,${y1} 80,${y2} 100,${y2}" fill="none" stroke="${color}" stroke-width="5"></polyline>`);
                if (card.ball[i]) {
                    parts.push(`<circle r="7" cx="90" cy="${y2}" fill="${color}"></circle>`);
                }
            }
        }
        parts.push(`</svg>`)
        return parts.join("")
    }

    function getCardSvg(card) {
        const parts = []
        parts.push(`<svg class="tray-card" viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">`)
        parts.push(`<rect width="100%" height="100%" fill="#f0f0f0" rx="5" ry="5"/>`)
        for (let i = 0; i < card.permutation.length; ++i) {
            parts.push(getLineSvg(i, card.permutation[i], card.ball[i]))
        }
        parts.push(`</svg>`)
        return parts.join("")
    }

    function getBalls() {
        const balls = [true, true, true];
        for (let i = 0; i < centerCards.length; i++) {
            const card = centerCards[i];
            if (!card) {
                return [undefined, undefined, undefined];
            }
            for (let j = 0; j < card.ball.length; j++) {
                balls[j] ^= card.ball[j];
            }
            permute(balls, card.permutation);
        }
        return balls;
    }

    function isSolved() {
        const permutation = [0, 1, 2];
        const ball = [true, true, true];
        for (let i = 0; i < centerCards.length; i++) {
            const card = centerCards[i];
            if (!card) {
                return false;
            }
            for (let bi = 0; bi < card.ball.length; bi++) {
                ball[bi] ^= card.ball[bi]
            }
            permute(ball, card.permutation);
            permute(permutation, card.permutation);
        }
        for (let i = 0; i < permutation.length; i++) {
            if (permutation[i] !== i) {
                return false;
            }
        }
        for (const ball of getBalls()) {
            if (!ball) {
                return false;
            }
        }
        return true;
    }

    function draw() {
        // Init tray
        cardTrayDiv.innerHTML = "";
        for (let i = 0; i < cardTray.length; i++) {
            let card = cardTray[i];
            const cardDiv = document.createElement('div');
            cardDiv.onclick = function () {
                for (let j = 0; j < centerCards.length; j++) {
                    if (!centerCards[j]) {
                        centerCards[j] = card;
                        draw();
                        break;
                    }
                }
            };
            cardDiv.draggable = true;
            cardDiv.innerHTML = getCardSvg(card);
            cardTrayDiv.appendChild(cardDiv);
            card.div = cardDiv;
        }

        centerCardsDiv.innerHTML = "";
        for (let i = 0; i < 3; i++) {
            const centerCardContainerDiv = document.createElement('div');
            centerCardContainerDiv.classList.add("center-card-container")
            centerCardContainerDiv.innerHTML = getCenterCardSvg(i);
            centerCardContainerDiv.onclick = function () {
                centerCards[i] = undefined;
                draw();
            }
            centerCardsDiv.appendChild(centerCardContainerDiv);
        }

        const balls = getBalls();
        {
            const height = 150;
            let parts = []
            parts.push(`<svg class="dots" viewBox="0 0 25 ${height}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">`)
            for (let i = 0; i < balls.length; i++) {
                const color = {
                    0: "#f88",
                    1: "#8f8",
                    2: "#88f",
                }[i];
                const cy = (i + 1) * height / 4;
                parts.push(`<circle r="8" cx="12.5" cy="${cy}" fill="${color}"></circle>`)
            }
            parts.push(`</svg>`)
            leftDotsContainer.innerHTML = parts.join("");

            parts = []
            parts.push(`<svg class="dots" viewBox="0 0 25 ${height}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">`)
            for (let i = 0; i < balls.length; i++) {
                const color = {
                    0: "#f88",
                    1: "#8f8",
                    2: "#88f",
                }[i];
                const cy = (i + 1) * height / 4;
                const strokeWidth = {
                    0: "3px",
                    1: "0px",
                    undefined: "0px",
                }[balls[i]]
                parts.push(`<circle r="8" cx="12.5" cy="${cy}" fill="${color}" stroke="#666" stroke-width="${strokeWidth}"></circle>`)
            }
            parts.push(`</svg>`)
            rightDotsContainer.innerHTML = parts.join("");
        }

        if (isSolved()) {
            hintButton.innerText = "🥳 Another!"
            hintButton.onclick = init;
        } else {
            hintButton.innerText = "💡 Hint"
            hintButton.onclick = function () {
                let hintIndex = undefined;
                for (let i = 0; i < centerCards.length; i++) {
                    if (solution[i] !== centerCards[i]) {
                        hintIndex = i;
                        centerCards[i] = solution[i];
                        break;
                    }
                }
                for (let i = 0; i < centerCards.length; i++) {
                    if (i === hintIndex) {
                        continue;
                    }
                    if (centerCards[i] === solution[hintIndex]) {
                        centerCards[i] = undefined;
                    }
                }
                draw();
            }
        }
    }

    function init() {
        let c0 = randomCard();
        let c1 = randomCard();
        solution = [
            c0,
            c1,
        ];
        let c2 = randomCard()
        c2.permutation[c1.permutation[c0.permutation[0]]] = 0;
        c2.permutation[c1.permutation[c0.permutation[1]]] = 1;
        c2.permutation[c1.permutation[c0.permutation[2]]] = 2;
        c2.ball[c1.permutation[c0.permutation[0]]] = c0.ball[0] ^ c1.ball[c0.permutation[0]];
        c2.ball[c1.permutation[c0.permutation[1]]] = c0.ball[1] ^ c1.ball[c0.permutation[1]];
        c2.ball[c1.permutation[c0.permutation[2]]] = c0.ball[2] ^ c1.ball[c0.permutation[2]];
        solution.push(c2);
        centerCards = solution.map(() => undefined);
        cardTray = shuffle([...solution, randomCard(), randomCard()])
        shuffle(cardTray)
        draw();
    }

    init();
    console.log("Initialized")
}