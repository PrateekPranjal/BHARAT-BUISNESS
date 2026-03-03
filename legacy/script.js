const boardData = [
    // Bottom Row (Right to Left) - Indices 0-10
    { id: 0, name: "GO", type: "special", price: 0 },
    { id: 1, name: "Guwahati", group: "brown", price: 60, rent: 2 },
    { id: 2, name: "Community Chest", type: "chest", price: 0 },
    { id: 3, name: "Bhubaneswar", group: "brown", price: 60, rent: 4 },
    { id: 4, name: "Income Tax", type: "tax", price: 0 },
    { id: 5, name: "Chennai Central", type: "railroad", price: 200 },
    { id: 6, name: "Goa", group: "lightblue", price: 100, rent: 6 },
    { id: 7, name: "Chance", type: "chance", price: 0 },
    { id: 8, name: "Jaipur", group: "lightblue", price: 100, rent: 6 },
    { id: 9, name: "Udaipur", group: "lightblue", price: 120, rent: 8 },
    { id: 10, name: "Jail", type: "special", price: 0 },

    // Left Column (Bottom to Top) - Indices 11-19
    { id: 11, name: "Kochi", group: "pink", price: 140, rent: 10 },
    { id: 12, name: "Electric Co", type: "utility", price: 150 },
    { id: 13, name: "Chennai", group: "pink", price: 140, rent: 10 },
    { id: 14, name: "Hyderabad", group: "pink", price: 160, rent: 12 },
    { id: 15, name: "Howrah Jn", type: "railroad", price: 200 },
    { id: 16, name: "Kolkata", group: "orange", price: 180, rent: 14 },
    { id: 17, name: "Community Chest", type: "chest", price: 0 },
    { id: 18, name: "Lucknow", group: "orange", price: 180, rent: 14 },
    { id: 19, name: "Chandigarh", group: "orange", price: 200, rent: 16 },

    // Top Row (Left to Right) - Indices 20-30
    { id: 20, name: "Free Parking", type: "special", price: 0 },
    { id: 21, name: "Pune", group: "red", price: 220, rent: 18 },
    { id: 22, name: "Chance", type: "chance", price: 0 },
    { id: 23, name: "Ahmedabad", group: "red", price: 220, rent: 18 },
    { id: 24, name: "Surat", group: "red", price: 240, rent: 20 },
    { id: 25, name: "Mumbai Central", type: "railroad", price: 200 },
    { id: 26, name: "Bengaluru", group: "yellow", price: 260, rent: 22 },
    { id: 27, name: "Gurgaon", group: "yellow", price: 260, rent: 22 },
    { id: 28, name: "Water Works", type: "utility", price: 150 },
    { id: 29, name: "Noida", group: "yellow", price: 280, rent: 24 },
    { id: 30, name: "Go To Jail", type: "special", price: 0 },

    // Right Column (Top to Bottom) - Indices 31-39
    { id: 31, name: "Connaught Place", group: "green", price: 300, rent: 26 },
    { id: 32, name: "Vasant Vihar", group: "green", price: 300, rent: 26 },
    { id: 33, name: "Community Chest", type: "chest", price: 0 },
    { id: 34, name: "Lutyens Delhi", group: "green", price: 320, rent: 28 },
    { id: 35, name: "New Delhi Stn", type: "railroad", price: 200 },
    { id: 36, name: "Chance", type: "chance", price: 0 },
    { id: 37, name: "Bandra", group: "darkblue", price: 350, rent: 35 },
    { id: 38, name: "Luxury Tax", type: "tax", price: 0 },
    { id: 39, name: "South Bombay", group: "darkblue", price: 400, rent: 50 }
];

let gameState = {
    players: [],
    currentPlayerIndex: 0,
    board: boardData,
    phase: "ROLL" // ROLL, BUY_ACTION, END
};

// DOM Elements
const boardEl = document.getElementById('board');
const rollBtn = document.getElementById('roll-btn');
const endTurnBtn = document.getElementById('end-turn-btn');
const diceTotal = document.getElementById('dice-total'); // Updated ID
const die1El = document.getElementById('die-1');
const die2El = document.getElementById('die-2');
const messageLog = document.getElementById('message-log');
const playerPanel = document.getElementById('player-panel');
const modal = document.getElementById('property-modal');
const modalTitle = document.getElementById('modal-title');
const modalPrice = document.getElementById('modal-price');
const modalRent = document.getElementById('modal-rent');
const buyBtn = document.getElementById('buy-btn');
const passBtn = document.getElementById('pass-btn');
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');

function startGame() {
    startScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    initGame();
}

function initGame() {
    gameState.players = [
        { id: 1, name: "Player 1", color: "red", money: 1500, position: 0, properties: [] },
        { id: 2, name: "Player 2", color: "blue", money: 1500, position: 0, properties: [] }
    ];
    renderBoard();
    renderPlayers();
    updatePlayerPanel();
    log("Game Started! Player 1's turn.");
}

function renderBoard() {
    // Clear existing tiles but keep center box
    const centerBox = document.querySelector('.center-box');
    boardEl.innerHTML = '';
    boardEl.appendChild(centerBox);

    boardData.forEach((tile) => {
        const tileEl = document.createElement('div');
        tileEl.className = 'tile';

        // Assign grid position based on ID
        // Bottom Row: 11 down, 11..1 left
        if (tile.id >= 0 && tile.id <= 10) {
            tileEl.style.gridRow = '11';
            tileEl.style.gridColumn = `${11 - tile.id}`;
        }
        // Left Column: 10..2 down, 1 left
        else if (tile.id >= 11 && tile.id <= 19) {
            tileEl.style.gridRow = `${11 - (tile.id - 10)}`;
            tileEl.style.gridColumn = '1';
        }
        // Top Row: 1 down, 1..11 right
        else if (tile.id >= 20 && tile.id <= 30) {
            tileEl.style.gridRow = '1';
            tileEl.style.gridColumn = `${tile.id - 19}`;
        }
        // Right Column: 2..10 down, 11 right
        else if (tile.id >= 31 && tile.id <= 39) {
            tileEl.style.gridRow = `${tile.id - 29}`;
            tileEl.style.gridColumn = '11';
        }

        // Content
        if (tile.group) {
            const header = document.createElement('div');
            header.className = 'tile-header';
            header.style.backgroundColor = `var(--group-${tile.group})`;
            tileEl.appendChild(header);
        }

        const nameEl = document.createElement('div');
        nameEl.className = 'tile-name';
        nameEl.innerText = tile.name;
        tileEl.appendChild(nameEl);

        if (tile.price) {
            const priceEl = document.createElement('div');
            priceEl.className = 'tile-price';
            priceEl.innerText = `₹${tile.price}`;
            tileEl.appendChild(priceEl);
        }

        // Hover details
        tileEl.addEventListener('mouseenter', () => showTileDetails(tile));
        tileEl.addEventListener('mouseleave', () => clearTileDetails());

        boardEl.appendChild(tileEl);
    });
}

function renderPlayers() {
    // Remove existing tokens
    document.querySelectorAll('.player-token').forEach(el => el.remove());

    gameState.players.forEach(player => {
        const tile = boardData[player.position];
        // Find the tile element in the DOM to position relative to it
        // Since we didn't give tiles IDs in DOM, we calculate position again or select by child content?
        // Better: let's just use the grid coordinates logic again or append to the tile element if possible.
        // Appending to tile element is easier if we can find it.
        // Let's re-select tiles.

        // Actually, let's just calculate grid position again for the token
        let row, col;
        if (player.position >= 0 && player.position <= 10) {
            row = 11; col = 11 - player.position;
        } else if (player.position >= 11 && player.position <= 19) {
            row = 11 - (player.position - 10); col = 1;
        } else if (player.position >= 20 && player.position <= 30) {
            row = 1; col = player.position - 19;
        } else if (player.position >= 31 && player.position <= 39) {
            row = player.position - 29; col = 11;
        }

        const token = document.createElement('div');
        token.className = 'player-token';
        token.style.backgroundColor = player.color;
        token.style.gridRow = row;
        token.style.gridColumn = col;

        // Add to board
        boardEl.appendChild(token);
    });
}

function showTileDetails(tile) {
    const detailsPanel = document.getElementById('tile-info-content');
    let html = `<strong>${tile.name}</strong><br>`;
    if (tile.group) html += `Group: ${tile.group}<br>`;
    if (tile.price) html += `Price: ₹${tile.price}<br>`;
    if (tile.rent) html += `Rent: ₹${tile.rent}<br>`;
    detailsPanel.innerHTML = html;
}

function clearTileDetails() {
    document.getElementById('tile-info-content').innerText = "Hover over a tile...";
}

function updatePlayerPanel() {
    playerPanel.innerHTML = '';
    gameState.players.forEach((player, idx) => {
        const div = document.createElement('div');
        div.className = `player-card ${idx === gameState.currentPlayerIndex ? 'active' : ''}`;

        // Calculate "Chance" / Status
        let status = "Waiting";
        if (idx === gameState.currentPlayerIndex) status = "Rolling...";
        if (player.money < 0) status = "Bankrupt";

        div.innerHTML = `
            <div class="player-info">
                <div style="color: ${player.color}; font-weight: bold;">${player.name}</div>
                <div class="player-status">Money: ₹${player.money}</div>
                <div class="player-status">Props: ${player.properties.length}</div>
            </div>
            <div class="turn-badge">YOUR TURN</div>
        `;
        playerPanel.appendChild(div);
    });
}

function log(msg) {
    messageLog.innerText = msg;
    // Optional: Keep history
    // const div = document.createElement('div');
    // div.innerText = msg;
    // messageLog.prepend(div);
}

// Game Logic
rollBtn.addEventListener('click', async () => {
    if (gameState.phase !== "ROLL") return;

    rollBtn.disabled = true;

    // 3D Dice Animation
    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;

    // Random rotations for effect
    const rotX1 = 720 + getRotation(roll1).x;
    const rotY1 = 720 + getRotation(roll1).y;
    const rotX2 = 720 + getRotation(roll2).x;
    const rotY2 = 720 + getRotation(roll2).y;

    die1El.style.transform = `rotateX(${rotX1}deg) rotateY(${rotY1}deg)`;
    die2El.style.transform = `rotateX(${rotX2}deg) rotateY(${rotY2}deg)`;

    // Wait for animation
    setTimeout(async () => {
        const total = roll1 + roll2;
        diceTotal.innerText = `Roll: ${total}`;
        log(`Rolled ${total}`);

        await movePlayerSmoothly(total);

        gameState.phase = "BUY_ACTION";
        endTurnBtn.disabled = false;

        checkTileAction();
    }, 1000);
});

function getRotation(face) {
    // Returns X, Y rotation to show specific face
    switch (face) {
        case 1: return { x: 0, y: 0 }; // Front
        case 6: return { x: 0, y: 180 }; // Back
        case 3: return { x: 0, y: -90 }; // Right
        case 4: return { x: 0, y: 90 }; // Left
        case 5: return { x: -90, y: 0 }; // Top
        case 2: return { x: 90, y: 0 }; // Bottom
    }
}

async function movePlayerSmoothly(steps) {
    const player = gameState.players[gameState.currentPlayerIndex];

    for (let i = 0; i < steps; i++) {
        player.position++;
        if (player.position >= 40) {
            player.position = 0;
            player.money += 200; // Pass Go
            log("Passed GO! Collected ₹200");
            updatePlayerPanel();
        }

        renderPlayers();

        // Add Jump Effect
        const token = document.querySelector(`.player-token[style*="${player.color}"]`);
        if (token) {
            token.classList.add('jumping');
            // Remove class after animation to allow re-trigger
            setTimeout(() => token.classList.remove('jumping'), 300);
        }

        // Wait for animation
        await new Promise(r => setTimeout(r, 300));
    }
}

function checkTileAction() {
    const player = gameState.players[gameState.currentPlayerIndex];
    const tile = gameState.board[player.position];

    log(`Landed on ${tile.name}`);

    if (tile.price > 0 && tile.group) {
        // Buyable property
        const owner = getOwner(tile.id);
        if (!owner) {
            // Unowned - Offer to buy
            if (player.money >= tile.price) {
                showBuyModal(tile);
            } else {
                log("Not enough money to buy.");
            }
        } else if (owner.id !== player.id) {
            // Pay Rent
            const rent = tile.rent;
            player.money -= rent;
            owner.money += rent;
            log(`Paid ₹${rent} rent to ${owner.name}`);
            updatePlayerPanel();
        }
    }
}

function getOwner(tileId) {
    for (let p of gameState.players) {
        if (p.properties.includes(tileId)) return p;
    }
    return null;
}

function showBuyModal(tile) {
    modalTitle.innerText = tile.name;
    modalPrice.innerText = `Price: ₹${tile.price}`;
    modalRent.innerText = `Rent: ₹${tile.rent}`;
    modal.classList.remove('hidden');

    buyBtn.onclick = () => {
        const player = gameState.players[gameState.currentPlayerIndex];
        player.money -= tile.price;
        player.properties.push(tile.id);
        log(`Bought ${tile.name}`);
        updatePlayerPanel();
        modal.classList.add('hidden');
    };

    passBtn.onclick = () => {
        modal.classList.add('hidden');
    };
}

endTurnBtn.addEventListener('click', () => {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    gameState.phase = "ROLL";
    rollBtn.disabled = false;
    endTurnBtn.disabled = true;
    diceTotal.innerText = "Roll: -";
    updatePlayerPanel();
    log(`${gameState.players[gameState.currentPlayerIndex].name}'s turn`);
});

// initGame() called by startGame()
