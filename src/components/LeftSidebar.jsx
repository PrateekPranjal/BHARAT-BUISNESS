import React from 'react';
import { useGame } from '../context/GameContext';

export default function LeftSidebar() {
    const { state } = useGame();

    return (
        <div className="sidebar left-sidebar">
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-main)', textAlign: 'center' }}>Players</h2>
            {state.players.map((player, idx) => {
                const isActive = idx === state.currentPlayerIndex;
                return (
                    <div
                        key={player.id}
                        className={`player-card glass-panel ${isActive ? 'active' : ''}`}
                        style={{ borderLeftColor: player.color }}
                    >
                        <div className="player-name" style={{ color: player.color }}>
                            {player.name}
                        </div>
                        <div className="player-money">
                            ₹{player.money}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            Properties: {player.properties.length}
                        </div>

                        {/* List owned properties names briefly */}
                        {player.properties.length > 0 && (
                            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#888', maxHeight: '50px', overflowY: 'auto' }}>
                                {player.properties.map(propId => {
                                    const prop = state.board.find(t => t.id === propId);
                                    return <span key={propId} style={{ marginRight: '5px', color: `var(--group-${prop.group})` }}>{prop.name}</span>
                                })}
                            </div>
                        )}

                        {player.skipTurns > 0 && (
                            <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: '#ff4444', fontSize: '0.9rem' }}>
                                Skips next {player.skipTurns} turn(s)
                            </div>
                        )}

                        {isActive && !player.skipTurns && (
                            <div style={{ marginTop: '1rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                                {state.phase === 'ROLL' ? 'Waiting to roll...' : 'Action phase'}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
