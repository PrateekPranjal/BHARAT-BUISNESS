import React from 'react';
import { motion } from 'framer-motion';

export default function PlayerToken({ player, index }) {
    let row, col;
    const pId = player.position;

    if (pId >= 0 && pId <= 10) {
        row = 11; col = 11 - pId;
    } else if (pId >= 11 && pId <= 19) {
        row = 11 - (pId - 10); col = 1;
    } else if (pId >= 20 && pId <= 30) {
        row = 1; col = pId - 19;
    } else if (pId >= 31 && pId <= 39) {
        row = pId - 29; col = 11;
    }

    return (
        <motion.div
            layout
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                mass: 0.8
            }}
            className="player-token"
            style={{
                backgroundColor: player.color,
                gridRow: row,
                gridColumn: col,
                alignSelf: 'center',
                justifySelf: 'center',
                marginTop: `${(index - 0.5) * 15}px`,
                marginLeft: `${(index - 0.5) * 15}px`
            }}
        />
    );
}
