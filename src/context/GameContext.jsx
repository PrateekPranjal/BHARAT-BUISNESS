import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { boardData } from '../data/boardData';
import { chanceCards, communityChestCards } from '../data/cardsData';
import { useSocket } from './SocketContext';

const GameContext = createContext();

const initialState = {
    players: [],
    currentPlayerIndex: 0,
    board: boardData,
    phase: "SETUP", // SETUP, ROLL, ANIMATING_DICE, BUY_ACTION, END
    diceTotal: null,
    diceRolls: [1, 1],
    targetPosition: null, // used for incremental movement
    logs: ["Game Started! Player 1's turn."],
    modal: null, // null | { type: 'BUY'|'RENT'|'VIEW'|'CARD', tile?: object, card?: object, owner?: object, amount?: number }
};

function gameReducer(state, action) {
    const log = (msg) => [msg, ...state.logs].slice(0, 10);
    const currentPlayer = state.players[state.currentPlayerIndex];

    switch (action.type) {
        case 'START_GAME': {
            return {
                ...state,
                players: action.payload,
                phase: "ROLL",
                logs: ["Game Started! " + action.payload[0].name + "'s turn."]
            };
        }

        case 'SET_DICE_ROLL': {
            const { d1, d2 } = action.payload;
            return {
                ...state,
                diceRolls: [d1, d2],
                diceTotal: d1 + d2,
                logs: log(`${currentPlayer.name} rolled ${d1 + d2}`)
            };
        }

        case 'MOVE_PLAYER_STEP': {
            let newPos = currentPlayer.position + 1;
            let moneyUpdate = currentPlayer.money;
            let logsUpdate = state.logs;

            if (newPos >= 40) {
                newPos = 0;
                moneyUpdate += 200;
                logsUpdate = [`${currentPlayer.name} passed GO! Collected ₹200`, ...logsUpdate].slice(0, 10);
            }

            const newPlayers = [...state.players];
            newPlayers[state.currentPlayerIndex] = {
                ...currentPlayer,
                position: newPos,
                money: moneyUpdate
            };

            return {
                ...state,
                players: newPlayers,
                logs: logsUpdate
            };
        }

        case 'CHECK_TILE': {
            const tile = state.board[currentPlayer.position];
            let logsUpdate = log(`${currentPlayer.name} landed on ${tile.name}`);

            if (tile.price > 0 && (tile.group || tile.type === 'railroad' || tile.type === 'utility')) {
                // Check if owned
                const owner = state.players.find(p => p.properties.includes(tile.id));

                if (!owner) {
                    return { ...state, logs: logsUpdate, modal: { type: 'BUY', tile } };
                } else if (owner.id !== currentPlayer.id) {
                    // Pay rent automatically for now, or we can show modal
                    const rentAmt = tile.rent;
                    return { ...state, logs: logsUpdate, modal: { type: 'RENT', tile, owner, amount: rentAmt } };
                }
            }

            // Free Parking and Jail handling
            if (tile.name === 'Free Parking') {
                const newPlayers = [...state.players];
                newPlayers[state.currentPlayerIndex] = {
                    ...currentPlayer,
                    skipTurns: currentPlayer.skipTurns + 2
                };
                return {
                    ...state,
                    players: newPlayers,
                    logs: [`${currentPlayer.name} is resting at Free Parking! (Skips 2 turns)`, ...logsUpdate].slice(0, 10),
                    phase: "END"
                };
            }

            if (tile.name === 'Jail' || tile.name === 'Go To Jail') {
                const penalty = 500;
                const newPlayers = [...state.players];
                newPlayers[state.currentPlayerIndex] = {
                    ...currentPlayer,
                    position: 10, // index 10 is Jail
                    money: currentPlayer.money - penalty,
                    skipTurns: currentPlayer.skipTurns + 1
                };
                let msg = tile.name === 'Go To Jail'
                    ? `${currentPlayer.name} went to Jail! Paid ₹${penalty} and skips 1 turn.`
                    : `${currentPlayer.name} is in Jail! Paid ₹${penalty} and skips 1 turn.`;

                return {
                    ...state,
                    players: newPlayers,
                    logs: [msg, ...logsUpdate].slice(0, 10),
                    phase: "END"
                };
            }

            // Tax handling
            if (tile.type === 'tax') {
                const newPlayers = [...state.players];
                let current = { ...currentPlayer };
                let msg = "";

                if (tile.name === 'Wealth Tax') {
                    const penalty = 500;
                    current.money -= penalty;
                    msg = `${currentPlayer.name} paid ₹${penalty} Wealth Tax penalty.`;
                } else if (tile.name === 'Income Tax') {
                    const reward = 500;
                    current.money += reward;
                    msg = `${currentPlayer.name} collected ₹${reward} Income Tax refund!`;
                } else {
                    current.money -= 200;
                    msg = `${currentPlayer.name} paid ₹200 tax.`;
                }

                newPlayers[state.currentPlayerIndex] = current;
                return { ...state, players: newPlayers, logs: [msg, ...logsUpdate].slice(0, 10), phase: "END" };
            }

            // CHANCE OR CHEST
            if (tile.type === 'chance' || tile.type === 'chest') {
                const isChance = tile.type === 'chance';
                const deck = isChance ? chanceCards : communityChestCards;
                const card = deck[Math.floor(Math.random() * deck.length)];

                const newPlayers = [...state.players];
                let current = { ...currentPlayer };
                let msg = `${currentPlayer.name} drew ${isChance ? 'Chance' : 'Community Chest'}: ${card.text}`;

                if (card.type === 'collect') {
                    current.money += card.amount;
                } else if (card.type === 'pay') {
                    current.money -= card.amount;
                } else if (card.type === 'move') {
                    current.position = card.position;
                    // Note: In real rules passing GO gives money, simplified here.
                    if (card.position === 0) current.money += 2000;
                } else if (card.type === 'collect_from_players') {
                    // Everyone gives this player money
                    newPlayers.forEach((p, i) => {
                        if (p.id !== current.id) {
                            newPlayers[i] = { ...p, money: p.money - card.amount };
                            current.money += card.amount;
                        }
                    });
                } else if (card.type === 'pay_per_building') {
                    // Simplified: We don't have distinct houses arrays yet. Assumes flat fee for now or 0 if no buildings system active.
                    // For now, no-op or flat small fee.
                    current.money -= 100;
                }

                newPlayers[state.currentPlayerIndex] = current;

                return {
                    ...state,
                    players: newPlayers,
                    logs: log(msg),
                    modal: { type: 'CARD', card, isChance }
                };
            }

            // Un-actionable or implemented tiles (Free Parking)
            return { ...state, logs: logsUpdate, phase: "END" };
        }

        case 'BUY_PROPERTY': {
            const tile = action.payload;
            const newPlayers = [...state.players];

            newPlayers[state.currentPlayerIndex] = {
                ...currentPlayer,
                money: currentPlayer.money - tile.price,
                properties: [...currentPlayer.properties, tile.id]
            };

            return {
                ...state,
                players: newPlayers,
                logs: log(`${currentPlayer.name} bought ${tile.name}`),
                modal: null,
                phase: "END"
            };
        }

        case 'PASS_PROPERTY':
        case 'CLOSE_CARD': {
            return {
                ...state,
                modal: null,
                phase: "END"
            };
        }

        case 'VIEW_TILE': {
            return {
                ...state,
                modal: { type: 'VIEW', tile: action.payload }
            };
        }

        case 'PAY_RENT': {
            const { tile, owner, amount } = action.payload;
            const newPlayers = [...state.players];

            // Deduct from current
            newPlayers[state.currentPlayerIndex] = {
                ...currentPlayer,
                money: currentPlayer.money - amount
            };

            // Add to owner
            const ownerIndex = state.players.findIndex(p => p.id === owner.id);
            if (ownerIndex > -1) {
                newPlayers[ownerIndex] = {
                    ...newPlayers[ownerIndex],
                    money: newPlayers[ownerIndex].money + amount
                };
            }

            return {
                ...state,
                players: newPlayers,
                logs: log(`${currentPlayer.name} paid ₹${amount} rent to ${owner.name}`),
                modal: null,
                phase: "END"
            };
        }

        case 'END_TURN': {
            let nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
            let newPlayers = [...state.players];
            let logsUpdate = state.logs;
            let loopCounter = 0; // Prevent infinite loop in edge cases

            while (newPlayers[nextIndex].skipTurns > 0 && loopCounter < 100) {
                newPlayers[nextIndex] = {
                    ...newPlayers[nextIndex],
                    skipTurns: newPlayers[nextIndex].skipTurns - 1
                };

                let skipMsg = `${newPlayers[nextIndex].name} misses a turn!`;
                if (newPlayers[nextIndex].skipTurns > 0) {
                    skipMsg += ` (${newPlayers[nextIndex].skipTurns} left)`;
                }
                logsUpdate = [skipMsg, ...logsUpdate].slice(0, 10);

                nextIndex = (nextIndex + 1) % newPlayers.length;
                loopCounter++;
            }

            const nextPlayer = newPlayers[nextIndex];
            logsUpdate = [`${nextPlayer.name}'s turn.`, ...logsUpdate].slice(0, 10);

            return {
                ...state,
                currentPlayerIndex: nextIndex,
                players: newPlayers,
                phase: "ROLL",
                diceTotal: null,
                logs: logsUpdate
            };
        }

        case 'SET_PHASE': {
            return {
                ...state,
                phase: action.payload
            };
        }

        case 'RESET_GAME': {
            return initialState;
        }

        case 'ADD_LOG': {
            return {
                ...state,
                logs: log(action.payload)
            };
        }

        default:
            return state;
    }
}

export function GameProvider({ children }) {
    const [state, rawDispatch] = useReducer(gameReducer, initialState);
    const { socket, isOnlineMode, roomCode, localPlayerId } = useSocket();

    // 1. Create a wrapped dispatch that emits to socket if online
    const dispatch = useCallback((action) => {
        // Actions that are purely local UI checks or initialization
        const localOnlyActions = ['VIEW_TILE', 'CLOSE_VIEW', 'BUY_ANY_PROPERTY_MODAL', 'CLOSE_BUY_ANY', 'RESET_GAME', 'START_GAME', 'ADD_LOG'];

        if (isOnlineMode && !action.isFromNetwork && !localOnlyActions.includes(action.type)) {
            if (socket && roomCode) {
                socket.emit('sync_action', { roomCode, action });
            }
        }
        rawDispatch(action);
    }, [isOnlineMode, socket, roomCode]);

    // 2. Listen for network actions from others
    useEffect(() => {
        if (!socket || !isOnlineMode) return;

        const handleSyncAction = (action) => {
            action.isFromNetwork = true;
            rawDispatch(action);
        };

        socket.on('sync_action', handleSyncAction);
        return () => socket.off('sync_action', handleSyncAction);
    }, [socket, isOnlineMode]);

    // Thunk-like action helper
    const rollDice = () => {
        if (state.phase !== "ROLL") return;

        // Check turn authorization for online mode
        if (isOnlineMode) {
            const currentPlayer = state.players[state.currentPlayerIndex];
            if (currentPlayer.socketId !== localPlayerId) {
                dispatch({ type: 'ADD_LOG', payload: "It's not your turn!" });
                return;
            }
        }

        // Let dice roll animation happen
        dispatch({ type: 'SET_PHASE', payload: 'ANIMATING_DICE' });

        setTimeout(() => {
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const total = d1 + d2;
            dispatch({ type: 'SET_DICE_ROLL', payload: { d1, d2 } });

            // Animate piece movement step by step
            let stepsTaken = 0;
            const moveInterval = setInterval(() => {
                dispatch({ type: 'MOVE_PLAYER_STEP' });
                stepsTaken++;

                if (stepsTaken >= total) {
                    clearInterval(moveInterval);
                    setTimeout(() => {
                        dispatch({ type: 'CHECK_TILE' });
                    }, 400); // Wait for final settle
                }
            }, 300); // Speed of each step
        }, 1200); // Wait for dice animation to complete
    };

    return (
        <GameContext.Provider value={{ state, dispatch, rollDice }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => useContext(GameContext);
