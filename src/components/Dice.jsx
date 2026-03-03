import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import useSound from 'use-sound';
import diceSoundEffect from '../assets/dice-roll.mp3';
import { motion } from 'framer-motion';

export default function Dice() {
    const { state } = useGame();
    const [playDiceSound] = useSound(diceSoundEffect, { volume: 0.5 });
    const [rolling, setRolling] = useState(false);

    useEffect(() => {
        if (state.phase === 'ANIMATING_DICE') {
            playDiceSound();
            setRolling(true);
            const t = setTimeout(() => setRolling(false), 800);
            return () => clearTimeout(t);
        }
    }, [state.phase, playDiceSound]);

    const getRotation = (value) => {
        switch (value) {
            case 1: return { rotateX: 0, rotateY: 0 };
            case 2: return { rotateX: 0, rotateY: -90 };
            case 3: return { rotateX: 0, rotateY: 90 };
            case 4: return { rotateX: -90, rotateY: 0 };
            case 5: return { rotateX: 90, rotateY: 0 };
            case 6: return { rotateX: 180, rotateY: 0 };
            default: return { rotateX: 0, rotateY: 0 };
        }
    };

    const rollAnimation = (targetRotation) => ({
        rotateX: [0, 360, 720, targetRotation.rotateX + 1080],
        rotateY: [0, 360, 720, targetRotation.rotateY + 1080],
        transition: { duration: 0.8, ease: "easeOut" }
    });

    return (
        <div className="dice-container" style={{ perspective: '1000px', display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            {[state.diceRolls[0], state.diceRolls[1]].map((val, idx) => (
                <motion.div
                    key={idx}
                    className="cube"
                    animate={rolling ? rollAnimation(getRotation(val)) : getRotation(val)}
                    style={{
                        width: '60px', height: '60px', position: 'relative', transformStyle: 'preserve-3d'
                    }}
                >
                    <div className="face front">1</div>
                    <div className="face right">2</div>
                    <div className="face left">3</div>
                    <div className="face top">4</div>
                    <div className="face bottom">5</div>
                    <div className="face back">6</div>
                </motion.div>
            ))}
        </div>
    );
}
