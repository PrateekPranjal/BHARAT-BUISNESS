import React from 'react';
import { useGame } from '../context/GameContext';
import Tile from './Tile';
import PlayerToken from './PlayerToken';
import Dice from './Dice';
import { motion, AnimatePresence } from 'framer-motion';

export default function Board() {
    const { state, rollDice, dispatch } = useGame();

    return (
        <div className="board-container">
            <div className="board">
                {state.board.map(tile => (
                    <Tile key={tile.id} tile={tile} />
                ))}

                {/* Center Area */}
                <div className="center-area glass-panel">
                    <div className="center-title">
                        BHARAT<br />BUSINESS
                    </div>

                    <Dice />

                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                        {state.diceTotal && (
                            <div style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                Roll: {state.diceTotal}
                            </div>
                        )}
                        <button
                            className="btn-primary"
                            onClick={rollDice}
                            disabled={state.phase !== 'ROLL'}
                        >
                            Roll Dice
                        </button>
                        {state.phase === 'END' && !state.modal && (
                            <button
                                className="btn-primary"
                                style={{ backgroundColor: '#28a745', color: '#fff' }}
                                onClick={() => dispatch({ type: 'END_TURN' })}
                            >
                                End Turn
                            </button>
                        )}
                    </div>
                </div>

                {/* Player Tokens layer overlaying the board */}
                <AnimatePresence>
                    {state.players.map((player, index) => (
                        <PlayerToken key={player.id} player={player} index={index} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
