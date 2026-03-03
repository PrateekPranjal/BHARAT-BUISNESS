import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useSocket } from '../context/SocketContext';

const DEFAULT_COLORS = ['#FF4136', '#0074D9', '#2ECC40', '#FF851B'];

export default function SetupScreen() {
    const { dispatch } = useGame();
    const { socket, roomCode, setRoomCode, isHost, setIsHost, onlinePlayers, setOnlinePlayers, setIsOnlineMode } = useSocket();

    // UI Modes
    const [mode, setMode] = useState(null); // 'local', 'online_select', 'host', 'join'
    const [lobbyError, setLobbyError] = useState('');

    // Local state
    const [numPlayers, setNumPlayers] = useState(2);
    const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4']);

    // Online state
    const [playerName, setPlayerName] = useState('Player 1');
    const [joinCode, setJoinCode] = useState('');

    // Listen for game start from server
    useEffect(() => {
        if (!socket) return;

        const onGameStarted = (players) => {
            setIsOnlineMode(true);
            const initialPlayers = players.map(p => ({
                // Keep the socket id as a reference, but we need an integer id for current game logic
                // we will use the array index + 1 as the game ID to prevent breaking local pass-n-play logic
                id: p.id,
                name: p.name,
                color: p.color,
                money: 7000,
                position: 0,
                properties: [],
                skipTurns: 0
            }));

            // Re-map IDs to integers 1-4 for legacy support, but store socket ID as 'socketId'
            const formattedPlayers = initialPlayers.map((p, i) => ({
                ...p,
                socketId: p.id,
                id: i + 1
            }));

            dispatch({ type: 'START_GAME', payload: formattedPlayers });
        };

        socket.on('game_started', onGameStarted);
        return () => socket.off('game_started', onGameStarted);
    }, [socket, dispatch, setIsOnlineMode]);

    // Local Handlers
    const handleLocalNameChange = (index, event) => {
        const newNames = [...playerNames];
        newNames[index] = event.target.value;
        setPlayerNames(newNames);
    };

    const handleStartLocalGame = () => {
        setIsOnlineMode(false);
        const initialPlayers = [];
        for (let i = 0; i < numPlayers; i++) {
            initialPlayers.push({
                id: i + 1,
                name: playerNames[i] || `Player ${i + 1}`,
                color: DEFAULT_COLORS[i],
                money: 7000,
                position: 0,
                properties: [],
                skipTurns: 0
            });
        }
        dispatch({ type: 'START_GAME', payload: initialPlayers });
    };

    // Online Handlers
    const handleHostGame = () => {
        setLobbyError('');
        socket.emit('create_room', { playerName }, (res) => {
            if (res.success) {
                setRoomCode(res.roomCode);
                setIsHost(true);
                setOnlinePlayers(res.players);
            }
        });
    };

    const handleJoinGame = () => {
        if (!joinCode) {
            setLobbyError("Please enter a room code.");
            return;
        }
        setLobbyError('');
        socket.emit('join_room', { roomCode: joinCode, playerName }, (res) => {
            if (res.success) {
                setRoomCode(res.roomCode);
                setIsHost(false);
                setOnlinePlayers(res.players);
            } else {
                setLobbyError(res.message);
            }
        });
    };

    const handleStartOnlineGame = () => {
        socket.emit('start_game', roomCode);
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', width: '100vw', background: 'var(--bg-main)', color: 'var(--text-main)'
        }}>
            <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '90%', textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-gold)', marginBottom: '2rem', fontSize: '3rem' }}>
                    BHARAT<br />BUSINESS
                </h1>

                {!mode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button className="btn-primary" onClick={() => setMode('local')} style={{ padding: '1rem', fontSize: '1.2rem' }}>
                            🎮 Play Local (Pass & Play)
                        </button>
                        <button className="btn-primary" onClick={() => setMode('online_select')} style={{ padding: '1rem', fontSize: '1.2rem', background: '#0074D9', color: 'white' }}>
                            🌐 Play Online (Multiplayer)
                        </button>
                    </div>
                )}

                {mode === 'local' && (
                    <>
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Select Number of Players</h3>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                {[2, 3, 4].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setNumPlayers(num)}
                                        style={{
                                            padding: '0.5rem 1.5rem',
                                            fontSize: '1.2rem',
                                            borderRadius: '8px',
                                            border: numPlayers === num ? '2px solid var(--accent-gold)' : '2px solid #ccc',
                                            background: numPlayers === num ? 'rgba(212, 175, 55, 0.2)' : 'white',
                                            cursor: 'pointer',
                                            color: 'var(--text-main)',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Enter Player Names</h3>
                            {Array.from({ length: numPlayers }).map((_, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '20px', height: '20px', borderRadius: '50%', backgroundColor: DEFAULT_COLORS[index]
                                    }}></div>
                                    <input
                                        type="text"
                                        value={playerNames[index]}
                                        onChange={(e) => handleLocalNameChange(index, e)}
                                        placeholder={`Player ${index + 1}`}
                                        style={{
                                            flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-pass" onClick={() => setMode(null)} style={{ flex: 1 }}>Back</button>
                            <button className="btn-primary" onClick={handleStartLocalGame} style={{ flex: 2, fontSize: '1.2rem' }}>
                                START LOCAL GAME
                            </button>
                        </div>
                    </>
                )}

                {mode === 'online_select' && !roomCode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Name:</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
                            />
                        </div>

                        <div style={{ borderTop: '1px solid #ccc', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Host a New Game</h3>
                            <button className="btn-primary" onClick={handleHostGame} style={{ width: '100%', padding: '1rem', background: '#2ECC40', color: '#fff' }}>
                                Create Room
                            </button>
                        </div>

                        <div style={{ borderTop: '1px solid #ccc', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Join an Existing Game</h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Enter Room Code"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    style={{ flex: 2, padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', textTransform: 'uppercase' }}
                                />
                                <button className="btn-primary" onClick={handleJoinGame} style={{ flex: 1 }}>
                                    Join
                                </button>
                            </div>
                            {lobbyError && <p style={{ color: 'red', marginTop: '0.5rem', textAlign: 'center' }}>{lobbyError}</p>}
                        </div>

                        <button className="btn-pass" onClick={() => setMode(null)} style={{ width: '100%', marginTop: '1rem' }}>Back</button>
                    </div>
                )}

                {roomCode && (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Waiting in Lobby</h2>
                        <div style={{
                            background: 'rgba(255,255,255,0.8)',
                            padding: '1rem',
                            borderRadius: '8px',
                            display: 'inline-block',
                            marginBottom: '2rem',
                            border: '2px dashed var(--accent-gold)'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>Room Code: </span>
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '2px', color: '#111' }}>{roomCode}</span>
                        </div>

                        <h3 style={{ textAlign: 'left', marginBottom: '1rem' }}>Players Joined ({onlinePlayers.length}/4)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                            {onlinePlayers.map((p, i) => (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.5)', padding: '0.8rem', borderRadius: '8px' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: p.color }}></div>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{p.name} {p.id === socket.id ? '(You)' : ''}</span>
                                </div>
                            ))}
                        </div>

                        {isHost ? (
                            <button
                                className="btn-primary"
                                onClick={handleStartOnlineGame}
                                disabled={onlinePlayers.length < 2}
                                style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', opacity: onlinePlayers.length < 2 ? 0.5 : 1 }}
                            >
                                {onlinePlayers.length < 2 ? 'Waiting for players...' : 'START GAME'}
                            </button>
                        ) : (
                            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', fontStyle: 'italic' }}>
                                Waiting for host to start the game...
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Dedication Overlay */}
            <div style={{
                position: 'fixed',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'var(--text-main)',
                textAlign: 'center',
                pointerEvents: 'none',
                fontFamily: 'var(--font-display)',
                letterSpacing: '1px'
            }}>
                <div style={{ marginBottom: '8px', fontStyle: 'italic', fontWeight: 'bold', color: 'var(--accent-gold)', fontSize: '1.1rem' }}>
                    Dedicated with love to my friends
                </div>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <span>Ananya (SUAR)</span>
                    <span style={{ color: 'var(--accent-gold)' }}>•</span>
                    <span>Regal</span>
                    <span style={{ color: 'var(--accent-gold)' }}>•</span>
                    <span>Yamato</span>
                    <span style={{ color: 'var(--accent-gold)' }}>•</span>
                    <span>Jai Bhaiya</span>
                </div>
            </div>
        </div>
    );
}
