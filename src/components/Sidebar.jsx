import React from 'react';
import { useGame } from '../context/GameContext';

export default function Sidebar() {
    const { state, dispatch } = useGame();

    const renderActionPanel = () => {
        if (!state.modal) return null;
        const { type, tile, owner, amount } = state.modal;
        const currentPlayer = state.players[state.currentPlayerIndex];
        const canAfford = currentPlayer.money >= tile.price;

        return (
            <div className="glass-panel" style={{ padding: '1.5rem', border: `2px solid var(--group-${tile?.group || 'gray'})` }}>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
                    {type === 'CARD' ? (state.modal.isChance ? 'Chance' : 'Community Chest') : tile?.name}
                </h3>

                {type === 'BUY' && (
                    <>
                        <p style={{ marginBottom: '0.5rem' }}>Price: ₹{tile.price}</p>
                        <p style={{ marginBottom: '1rem' }}>Rent: ₹{tile.rent}</p>
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <button
                                className="btn-buy"
                                style={{ width: '100%', opacity: canAfford ? 1 : 0.5, cursor: canAfford ? 'pointer' : 'not-allowed' }}
                                disabled={!canAfford}
                                onClick={() => dispatch({ type: 'BUY_PROPERTY', payload: tile })}
                            >
                                Buy (₹{tile.price})
                            </button>
                            <button
                                className="btn-pass"
                                style={{ width: '100%' }}
                                onClick={() => dispatch({ type: 'PASS_PROPERTY' })}
                            >
                                Pass
                            </button>
                        </div>
                    </>
                )}

                {type === 'RENT' && (
                    <>
                        <p style={{ marginBottom: '0.5rem' }}>
                            Owned by <span style={{ color: owner.color, fontWeight: 'bold' }}>{owner.name}</span>
                        </p>
                        <p style={{ marginBottom: '1rem', fontWeight: 'bold', color: '#ff4444' }}>
                            Rent Due: ₹{amount}
                        </p>
                        <button
                            className="btn-pay"
                            style={{ width: '100%' }}
                            onClick={() => dispatch({ type: 'PAY_RENT', payload: { tile, owner, amount } })}
                        >
                            Pay ₹{amount}
                        </button>
                    </>
                )}

                {type === 'CARD' && (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontStyle: 'italic', fontWeight: 'bold' }}>
                            "{state.modal.card.text}"
                        </p>
                        <button
                            className="btn-primary"
                            style={{ width: '100%' }}
                            onClick={() => dispatch({ type: 'CLOSE_CARD' })}
                        >
                            Accept
                        </button>
                    </div>
                )}

                {type === 'VIEW' && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '1rem' }}>
                        {tile?.group ? (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginBottom: '1rem', textAlign: 'left' }}>
                                    <span>Rent Site Only</span>
                                    <span>₹{tile.rent}</span>
                                    <span>Rent with 1 House</span>
                                    <span>₹{tile.rent1House}</span>
                                    <span>Rent with 2 Houses</span>
                                    <span>₹{tile.rent2House}</span>
                                    <span>Rent with 3 Houses</span>
                                    <span>₹{tile.rent3House}</span>
                                    <span>Rent with Hotel/Resort</span>
                                    <span>₹{tile.rentHotel}</span>
                                </div>
                                <div style={{ borderTop: '1px solid #ccc', paddingTop: '0.5rem', marginBottom: '1rem', textAlign: 'left' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Cost of Houses</span>
                                        <span>₹{tile.houseCost} each</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Cost of Hotel</span>
                                        <span>₹{tile.hotelCost} plus 3 houses</span>
                                    </div>
                                </div>
                            </>
                        ) : (tile?.type === 'chance' || tile?.type === 'chest') ? (
                            <p style={{ fontStyle: 'italic', marginBottom: '1rem', textAlign: 'center' }}>
                                {tile.type === 'chance' ? "Take a Chance card when you land here! You might get lucky, or you might have to pay a fine." : "Draw from the Community Chest! These cards often contain rewards, bank dividends, or taxes."}
                            </p>
                        ) : (
                            <p>This is a special space with no rent data.</p>
                        )}
                        <button
                            className="btn-pass"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                            onClick={() => dispatch({ type: 'PASS_PROPERTY' })}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="sidebar">
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

                        {isActive && (
                            <div style={{ marginTop: '1rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                                {state.phase === 'ROLL' ? 'Waiting to roll...' : 'Action phase'}
                            </div>
                        )}
                    </div>
                );
            })}

            {state.modal ? renderActionPanel() : (
                <div className="glass-panel logs-container" style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Activity Log</h3>
                    {state.logs.map((log, i) => (
                        <div key={i} className="log-entry">{log}</div>
                    ))}
                </div>
            )}
        </div>
    );
}
