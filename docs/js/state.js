/**
 * Hamster Feeder - Centralized Game State
 */

const state = {
  fullness: 50,         // Starts half-full (0 to 100)
  mood: 'idle',         // 'idle', 'hungry', 'chewing', 'happy', 'spicy', 'shocked'
  isChewing: false,
  chewTimeout: null,
  isRunningAway: false, // Bad ending: hamster has left the building
  gameActive: false,    // true only after difficulty is selected — freezes decay & gauge while false
  activeSeeds: [],      // Projectiles currently in trajectory
  activeBirds: [],      // Intercepting birds currently swooping
  timingProgress: 50,   // Roulette slider progress (0 to 100)
  timingDirection: 1,   // Oscillating direction (1 or -1)
  timingSpeed: 1.5,     // Speed of slider timing pin (Easy: 1.5, Hard: 2.3)
  lastTickTime: 0,
  difficulty: 'easy',   // Game difficulty: 'easy' or 'hard'
  score: 0,             // Real-time score counter
  trackLayout: [],      // Dynamic timing track segment layouts
  playerName: '쮝집사',  // Player's name for high scores
  consecutiveHits: 0    // Consecutive seed hit combo counter
};
