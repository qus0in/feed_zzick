/**
 * Hamster Feeder - Physics & Entity System
 * Pure Vanilla calculations for 3D depth-scaling and swooping trajectory loops.
 */

/**
 * ThiefBird Class: A rogue sparrow that intercepts seeds in mid-flight
 */
class ThiefBird {
  constructor(targetSeed) {
    this.seed = targetSeed;
    this.progress = 0;
    this.speed = 0.038; // Fast and swift swoop
    
    const arena = document.getElementById('game-arena');
    // Choose start side (Left or Right screen out of bounds)
    this.fromLeft = Math.random() > 0.5;
    this.startX = this.fromLeft ? -60 : arena.clientWidth + 60;
    this.startY = Math.random() * 80 + 20; // Swoops in high in sky
    
    this.x = this.startX;
    this.y = this.startY;
    this.isDead = false;
    
    this.element = this.createDomElement(arena);
  }

  createDomElement(arena) {
    const bird = document.createElement('div');
    bird.className = 'thief-bird';
    bird.style.position = 'absolute';
    bird.style.left = '0px';
    bird.style.top = '0px';
    bird.style.width = '38px';
    bird.style.height = '38px';
    bird.style.zIndex = '15';
    bird.style.pointerEvents = 'none';
    
    const scaleX = this.fromLeft ? 1 : -1;
    
    bird.innerHTML = `
      <svg viewBox="0 0 32 32" width="100%" height="100%" style="transform: scaleX(${scaleX})">
        <!-- Body: Soft sky blue sparrow -->
        <circle cx="16" cy="16" r="10.5" fill="hsl(200, 95%, 70%)" />
        <path d="M 6,17 C 3,19 1,22 1,25 L 6,21 Z" fill="hsl(200, 95%, 55%)" /> <!-- Tail -->
        <!-- Belly -->
        <path d="M 10,21 C 12,25 20,25 22,21 C 18,17 12,17 10,21 Z" fill="#FFFFFF" opacity="0.9" />
        <!-- Flapping wing -->
        <path class="bird-wing" d="M 12,16 Q 16,6 20,16" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
        <!-- Cute orange Beak -->
        <polygon points="26,13 32,16 26,19" fill="hsl(43, 100%, 60%)" />
        <!-- Shiny Eye -->
        <circle cx="21" cy="12" r="2.5" fill="#1C1816" />
        <circle cx="20.5" cy="11.5" r="0.8" fill="#FFFFFF" />
      </svg>
    `;
    
    arena.appendChild(bird);
    return bird;
  }

  update() {
    if (this.isDead) return;
    
    this.progress += this.speed;
    const arena = document.getElementById('game-arena');
    
    if (this.progress < 0.5) {
      // Phase 1: Swoop down to seed's current position to grab it
      const factor = this.progress * 2; // scale 0-1
      this.x = this.startX + (this.seed.x - this.startX) * factor;
      this.y = this.startY + (this.seed.y - this.startY) * factor;
    } else {
      // Phase 2: Grab seed and escape
      if (!this.seed.isDead) {
        this.seed.isDead = true;
        this.seed.destroy();
        
        // Chirp sound and hamster shock shivers
        playChirpSound();
        setMood('shocked');
        
        // Reset combo and update preview info
        state.consecutiveHits = 0;
        const preview = document.getElementById('item-preview');
        if (preview) {
          preview.innerText = '🐦 참새가 밥을 훔쳐갔다쮝!';
          preview.style.color = '#74B9FF';
          preview.style.borderColor = 'rgba(116, 185, 255, 0.6)';
        }
        
        setTimeout(() => {
          if (state.mood === 'shocked') {
            setMood('idle');
          }
        }, 1500);
      }
      
      const factor = (this.progress - 0.5) * 2; // scale 0-1
      const targetEscapeX = this.fromLeft ? arena.clientWidth + 60 : -60;
      const targetEscapeY = this.startY - 30; // Fly up high
      
      this.x = this.seed.x + (targetEscapeX - this.seed.x) * factor;
      this.y = this.seed.y + (targetEscapeY - this.seed.y) * factor;
    }
    
    this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    
    if (this.progress >= 1) {
      this.destroy();
    }
  }

  destroy() {
    this.isDead = true;
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
  }
}

/**
 * Seed Class containing parabolic trajectory properties
 */
class SunflowerSeed {
  constructor(startX, startY) {
    this.startX = startX;
    this.startY = startY;
    this.x = startX;
    this.y = startY;
    
    // 1. Select seed type based on snapped timing progress from trackLayout lookup
    const idx = Math.min(9, Math.floor(state.timingProgress / 10));
    const layoutType = state.trackLayout[idx];
    
    if (layoutType === 'bird') {
      this.type = 'intercepted';
      this.birdTriggered = false;
    } else if (layoutType === 'chili') {
      this.type = 'chili';
    } else {
      this.type = 'seed';
    }
    
    // Check if launched near boundaries (e.g. progress < 12 or progress > 88) for extra snap points
    const p = state.timingProgress;
    this.borderBonus = 0;
    if (p < 12 || p > 88) {
      this.borderBonus = 75 + Math.floor(Math.random() * 5); // subtle 1-point variations (+75 ~ +79)
    }
    
    // Lazily fetch SVG targets for coordinate computing
    const mouthNormal = document.getElementById('hamster-mouth');
    const mouthChewing = document.getElementById('hamster-mouth-chewing');
    const arena = document.getElementById('game-arena');
    
    const mouthRect = (state.isChewing ? mouthChewing : mouthNormal).getBoundingClientRect();
    const arenaRect = arena.getBoundingClientRect();
    
    // Coordinates relative to the game arena
    this.targetX = mouthRect.left + mouthRect.width / 2 - arenaRect.left - 12; // offset seed width/2
    this.targetY = mouthRect.top + mouthRect.height / 2 - arenaRect.top - 16;  // offset seed height/2
    
    // Parabolic interpolation parameters
    this.progress = 0;
    const distanceX = Math.abs(this.targetX - this.startX);
    this.duration = Math.max(30, Math.min(55, distanceX * 0.15 + 25)); 
    this.speed = 1 / this.duration;
    
    // Dynamic peak height based on horizontal distance
    this.peakHeight = Math.max(50, distanceX * 0.4);
    
    // Random spin based on throw direction
    this.spinSpeed = Math.random() * 5 + 3;
    if (this.targetX < this.startX) this.spinSpeed = -this.spinSpeed; 
    this.angle = Math.random() * 360;
    
    this.isDead = false;
    this.element = this.createDomElement(arena);
  }

  createDomElement(arena) {
    const seed = document.createElement('div');
    seed.className = 'sunflower-seed';
    seed.style.left = '0px';
    seed.style.top = '0px';
    
    if (this.type === 'chili') {
      // Red spicy chili pepper SVG
      seed.innerHTML = `
        <svg viewBox="0 0 24 32" width="100%" height="100%">
          <!-- Green stalk -->
          <path d="M 12,2 C 15,6 12,9 12,9" fill="none" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" />
          <!-- Red body -->
          <path d="M 12,8 C 15,8 20,11 21,16 C 22,22 15,31 12,31 C 9,31 6,29 5,24 C 4,18 7,8 12,8 Z" fill="#FF4D4D" />
          <path d="M 14,10 C 16,13 18,16 18,20" fill="none" stroke="#FF8080" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
        </svg>
      `;
    } else {
      // Normal sunflower seed SVG
      seed.innerHTML = `
        <svg viewBox="0 0 24 32" width="100%" height="100%">
          <!-- Dark Seed Body Outer Shell -->
          <path d="M 12,2 C 18,12 23,20 22,26 C 21,30 17,31 12,31 C 7,31 3,30 2,26 C 1,20 6,12 12,2 Z" fill="var(--seed-body)" />
          <!-- Sweet Cream Stripes -->
          <path d="M 12,3 C 14,12 17,19 16.5,24 C 16,28 14.5,29 12,29 C 9.5,29 8,28 7.5,24 C 7,19 10,12 12,3 Z" fill="var(--seed-stripe)" opacity="0.85" />
          <path d="M 12,3 C 13,10 14.5,16 14,20 C 13.5,23 13,24 12,24 C 11,24 10.5,23 10,20 C 9.5,16 11,10 12,3 Z" fill="var(--seed-body)" opacity="0.3" />
        </svg>
      `;
    }
    
    arena.appendChild(seed);
    return seed;
  }

  update() {
    if (this.isDead) return;
    
    // Advance parabolic progress (0 to 1)
    this.progress += this.speed;
    
    // Spawn bird interceptor at 35% of throwing progress
    if (this.type === 'intercepted' && this.progress >= 0.35 && !this.birdTriggered) {
      this.birdTriggered = true;
      const bird = new ThiefBird(this);
      state.activeBirds.push(bird);
    }
    
    if (this.progress >= 1) {
      this.progress = 1;
      this.x = this.targetX;
      this.y = this.targetY;
      this.angle += this.spinSpeed;
      this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) scale(0.65) rotate(${this.angle}deg)`;
      this.element.style.filter = `drop-shadow(0 2px 3px rgba(112, 83, 53, 0.15)) blur(0px)`;
      
      // Perform collision (chomp seed at mouth)
      this.triggerChomp();
      return;
    }
    
    // 1. Linear interpolation on X
    const currentX = this.startX + (this.targetX - this.startX) * this.progress;
    
    // 2. Parabolic arc interpolation on Y
    const currentY = this.startY + (this.targetY - this.startY) * this.progress - this.peakHeight * Math.sin(Math.PI * this.progress);
    
    this.x = currentX;
    this.y = currentY;
    this.angle += this.spinSpeed;
    
    // 3. 3D depth perspective scaling and blur
    const currentScale = 2.0 + (0.65 - 2.0) * this.progress;
    const currentBlur = Math.max(0, 3.5 * (1 - this.progress * 1.3));
    
    // Render using hardware-accelerated transforms
    this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) scale(${currentScale}) rotate(${this.angle}deg)`;
    this.element.style.filter = `drop-shadow(0 ${4 * currentScale}px ${6 * currentScale}px rgba(112, 83, 53, 0.15)) blur(${currentBlur}px)`;
  }

  triggerChomp() {
    if (this.isDead || state.mood === 'happy') {
      this.destroy();
      return;
    }
    
    this.isDead = true;
    
    const mouthNormal = document.getElementById('hamster-mouth');
    const mouthChewing = document.getElementById('hamster-mouth-chewing');
    const arena = document.getElementById('game-arena');
    
    const mouthRect = (state.isChewing ? mouthChewing : mouthNormal).getBoundingClientRect();
    const arenaRect = arena.getBoundingClientRect();
    const mouthCenterX = mouthRect.left + mouthRect.width / 2;
    const mouthCenterY = mouthRect.top + mouthRect.height / 2;
    
    if (this.type === 'chili') {
      // SPICY CRUNCH EXPLOSION!
      spawnChiliParticles(mouthCenterX - arenaRect.left, mouthCenterY - arenaRect.top);
      playSpicySound();
      
      // Decrease fullness! (-10 satiety)
      feedHamster(-10);
      setMood('spicy');
      
      setTimeout(() => {
        if (state.mood === 'spicy') {
          setMood('idle');
        }
      }, 1500);
    } else {
      // Normal seed eating
      spawnCrumbs(mouthCenterX - arenaRect.left, mouthCenterY - arenaRect.top);
      playCrunchSound();
      
      // Compute score gain with micro-variations
      let scoreGain = (state.difficulty === 'easy' ? 100 : 200) + Math.floor(Math.random() * 6);
      
      // Add border snap bonus if applicable
      if (this.borderBonus > 0) {
        scoreGain += this.borderBonus;
        const preview = document.getElementById('item-preview');
        if (preview) {
          preview.innerText = `🎯 경계 보너스! +${this.borderBonus}`;
          preview.style.color = '#FFAAAA';
          preview.style.borderColor = 'rgba(255, 170, 170, 0.6)';
        }
      }
      
      state.score += scoreGain;
      
      // Update fullness (+12 satiety)
      feedHamster(12);
    }
    
    this.destroy();
  }

  destroy() {
    this.isDead = true;
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
  }
}
