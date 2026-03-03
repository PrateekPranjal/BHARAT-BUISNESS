import React from 'react';
import { useGame } from '../context/GameContext';

export default function RightSidebar() {
    const { state, dispatch } = useGame();

    const renderActionPanel = () => {
        if (!state.modal) return null;
        const { type, tile, owner, amount } = state.modal;
        const currentPlayer = state.players[state.currentPlayerIndex];
        const canAfford = currentPlayer && tile ? currentPlayer.money >= tile.price : false;

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
                        ) : (tile?.type === 'railroad' || tile?.type === 'utility') ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 'bold' }}>
                                    <span>Base Rent</span>
                                    <span>₹{tile.rent}</span>
                                </div>
                                <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
                                    {tile.type === 'railroad' ? "If 2 stations are owned, rent is doubled. If 3 are owned, tripled. If 4 are owned, quadrupled." : "If both utilities are owned, rent is increased."}
                                </p>
                            </>
                        ) : (tile?.type === 'tax') ? (
                            <>
                                <h4 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.2rem', color: tile.name === 'Income Tax' ? 'var(--group-green)' : '#ff4444' }}>
                                    {tile.name === 'Income Tax' ? 'Tax Refund!' : 'Pay Penalty!'}
                                </h4>
                                <p style={{ fontStyle: 'italic', marginBottom: '1rem', textAlign: 'center' }}>
                                    {tile.name === 'Income Tax' ? "Collect ₹500 from the Bank as an income tax refund." : "Pay ₹500 to the Bank for your wealth tax assessment."}
                                </p>
                            </>
                        ) : (tile?.type === 'chance' || tile?.type === 'chest') ? (
                            <p style={{ fontStyle: 'italic', marginBottom: '1rem', textAlign: 'center' }}>
                                {tile.type === 'chance' ? "Take a Chance card when you land here! You might get lucky, or you might have to pay a fine." : "Draw from the Community Chest! These cards often contain rewards, bank dividends, or taxes."}
                            </p>
                        ) : (tile?.type === 'special') ? (
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: 'var(--accent-gold)' }}>Special Tile</h4>
                                <p style={{ fontStyle: 'italic' }}>
                                    {tile.name === 'GO' && "Collect ₹200 every time you pass this space."}
                                    {tile.name === 'Jail' && "If you land here directly, you are Just Visiting. If sent here, pay a ₹500 fine and skip 1 turn!"}
                                    {tile.name === 'Go To Jail' && "Go directly to Jail! Do not pass GO. Pay a ₹500 fine and skip 1 turn."}
                                    {tile.name === 'Free Parking' && "A safe place to rest, but you must skip your next 2 turns."}
                                </p>
                            </div>
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
        <div className="sidebar right-sidebar">
            {state.modal ? renderActionPanel() : (
                <div className="glass-panel logs-container" style={{ flex: 1, minHeight: '300px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem', fontFamily: 'var(--font-display)', color: 'var(--accent-gold)' }}>Activity Log</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {state.logs.map((log, i) => (
                            <div key={i} className="log-entry" style={{ fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(255,255,255,0.5)', borderRadius: '4px' }}>
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
