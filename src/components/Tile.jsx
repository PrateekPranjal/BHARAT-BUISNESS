import React from 'react';
import { useGame } from '../context/GameContext';

export default function Tile({ tile }) {
    const { state, dispatch } = useGame();
    let row, col;
    const { id, name, price, group } = tile;

    const owner = state.players.find(p => p.properties.includes(id));

    if (id >= 0 && id <= 10) {
        row = 11;
        col = 11 - id;
    } else if (id >= 11 && id <= 19) {
        row = 11 - (id - 10);
        col = 1;
    } else if (id >= 20 && id <= 30) {
        row = 1;
        col = id - 19;
    } else if (id >= 31 && id <= 39) {
        row = id - 29;
        col = 11;
    }

    // Define orientation class based on position for rotation
    let orientationClass = "";
    if (row === 11) orientationClass = "bottom-row";
    else if (col === 1) orientationClass = "left-column";
    else if (row === 1) orientationClass = "top-row";
    else if (col === 11) orientationClass = "right-column";

    return (
        <div
            className={`tile ${orientationClass}`}
            style={{
                gridRow: row,
                gridColumn: col,
                cursor: 'pointer',
                boxShadow: owner ? `inset 0 0 0 4px ${owner.color}` : 'none'
            }}
            onClick={() => dispatch({ type: 'VIEW_TILE', payload: tile })}
        >
            {group && (
                <div
                    className="tile-header"
                    style={{ backgroundColor: `var(--group-${group})` }}
                />
            )}
            <div className="tile-content">
                <div className="tile-name">{name}</div>
                {price > 0 && <div className="tile-price">₹{price}</div>}
            </div>
        </div>
    );
}
