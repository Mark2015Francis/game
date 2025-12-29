// World generation and environment functions

// Create sun for World 1
function createSun() {
    const sunGeometry = new THREE.SphereGeometry(30, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 1
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(300, 200, -400);
    game.scene.add(sun);

    // Add sun glow
    const glowGeometry = new THREE.SphereGeometry(35, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(sun.position);
    game.scene.add(glow);

    game.sun = sun;
    game.sunGlow = glow;
}

// Create clouds for World 1
function createClouds() {
    game.clouds = [];

    for (let i = 0; i < 15; i++) {
        const cloud = new THREE.Group();

        // Create cloud made of multiple spheres
        for (let j = 0; j < 5; j++) {
            const cloudGeometry = new THREE.SphereGeometry(8 + Math.random() * 5, 16, 16);
            const cloudMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.7
            });
            const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloudPart.position.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 10
            );
            cloud.add(cloudPart);
        }

        // Position clouds in sky
        cloud.position.set(
            (Math.random() - 0.5) * 800,
            100 + Math.random() * 50,
            (Math.random() - 0.5) * 800
        );

        cloud.userData.speedX = (Math.random() - 0.5) * 0.5;

        game.scene.add(cloud);
        game.clouds.push(cloud);
    }
}

// Create spiral galaxy for World 2
function createGalaxy() {
    const galaxy = new THREE.Group();

    // Galaxy core
    const coreGeometry = new THREE.SphereGeometry(15, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x9966ff,
        emissive: 0x9966ff,
        emissiveIntensity: 1
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    galaxy.add(core);

    // Add glow to core
    const coreGlowGeometry = new THREE.SphereGeometry(20, 32, 32);
    const coreGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff66ff,
        transparent: true,
        opacity: 0.4
    });
    const coreGlow = new THREE.Mesh(coreGlowGeometry, coreGlowMaterial);
    galaxy.add(coreGlow);

    // Create spiral arms with stars
    const particleCount = 2000;
    const positions = [];
    const colors = [];

    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 6; // Multiple rotations for spiral
        const radius = (i / particleCount) * 150;
        const spiralOffset = Math.sin(angle * 2) * 10;

        const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 15;
        const y = (Math.random() - 0.5) * 10 + spiralOffset;
        const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 15;

        positions.push(x, y, z);

        // Color variation - purple, blue, white stars
        const colorChoice = Math.random();
        if (colorChoice < 0.3) {
            colors.push(1, 1, 1); // White
        } else if (colorChoice < 0.6) {
            colors.push(0.6, 0.4, 1); // Purple
        } else {
            colors.push(0.4, 0.6, 1); // Blue
        }
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    galaxy.add(particles);

    // Position galaxy in sky
    galaxy.position.set(-200, 150, -500);
    galaxy.rotation.x = Math.PI / 6;
    galaxy.rotation.z = Math.PI / 4;

    game.scene.add(galaxy);
    game.galaxy = galaxy;
}

// Create colored spirals for World 2 sky
function createColoredSpirals() {
    game.spirals = [];

    const spiralColors = [
        0x00ffff, // Cyan
        0xff00ff, // Magenta
        0xffff00, // Yellow
        0xff00aa, // Pink
        0x00ff88, // Teal
        0xff8800, // Orange
        0xaa00ff, // Purple
        0x00aaff  // Light blue
    ];

    const spiralCount = 8;

    for (let s = 0; s < spiralCount; s++) {
        const spiral = new THREE.Group();

        // Create spiral tube using points
        const tubePoints = [];
        const rotations = 4; // Number of full rotations
        const pointCount = 100;
        const spiralRadius = 15;
        const spiralHeight = 40;

        for (let i = 0; i < pointCount; i++) {
            const t = i / pointCount;
            const angle = t * Math.PI * 2 * rotations;
            const radius = spiralRadius * (1 - t * 0.5); // Taper inward
            const x = Math.cos(angle) * radius;
            const y = t * spiralHeight - spiralHeight / 2;
            const z = Math.sin(angle) * radius;
            tubePoints.push(new THREE.Vector3(x, y, z));
        }

        const spiralCurve = new THREE.CatmullRomCurve3(tubePoints);
        const tubeGeometry = new THREE.TubeGeometry(spiralCurve, 100, 0.5, 8, false);
        const tubeMaterial = new THREE.MeshBasicMaterial({
            color: spiralColors[s],
            emissive: spiralColors[s],
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.7
        });
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        spiral.add(tube);

        // Add glowing particles along spiral
        const particleCount = 50;
        const particlePositions = [];
        for (let i = 0; i < particleCount; i++) {
            const t = i / particleCount;
            const angle = t * Math.PI * 2 * rotations;
            const radius = spiralRadius * (1 - t * 0.5);
            const x = Math.cos(angle) * radius;
            const y = t * spiralHeight - spiralHeight / 2;
            const z = Math.sin(angle) * radius;
            particlePositions.push(x, y, z);
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: spiralColors[s],
            size: 2,
            transparent: true,
            opacity: 1
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        spiral.add(particles);

        // Position spirals around the world
        const angle = (s / spiralCount) * Math.PI * 2;
        const distance = 300;
        spiral.position.set(
            Math.cos(angle) * distance,
            100 + Math.random() * 50,
            Math.sin(angle) * distance
        );

        // Random rotation
        spiral.rotation.x = Math.random() * Math.PI;
        spiral.rotation.z = Math.random() * Math.PI;

        // Store rotation speed for animation
        spiral.userData.rotationSpeed = (Math.random() - 0.5) * 0.3;

        game.scene.add(spiral);
        game.spirals.push(spiral);
    }
}

// Create ash clouds for World 3
function createAshClouds() {
    game.ashClouds = [];

    const ashCount = 12; // Number of ash clouds

    for (let i = 0; i < ashCount; i++) {
        const cloud = new THREE.Group();

        // Create multiple spheres to form an ash cloud
        const sphereCount = 8 + Math.floor(Math.random() * 5);
        for (let j = 0; j < sphereCount; j++) {
            const size = 15 + Math.random() * 20;
            const geometry = new THREE.SphereGeometry(size, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: 0x1a0a0a, // Very dark ash color
                transparent: true,
                opacity: 0.4 + Math.random() * 0.3
            });
            const sphere = new THREE.Mesh(geometry, material);

            // Randomly position spheres to form cloud shape
            sphere.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 40
            );

            cloud.add(sphere);
        }

        // Position clouds around the world
        const angle = (i / ashCount) * Math.PI * 2;
        const distance = 250 + Math.random() * 100;
        cloud.position.set(
            Math.cos(angle) * distance,
            80 + Math.random() * 60,
            Math.sin(angle) * distance
        );

        // Store movement data for animation
        cloud.userData.driftSpeed = 0.5 + Math.random() * 1.5;
        cloud.userData.driftAngle = Math.random() * Math.PI * 2;
        cloud.userData.bobSpeed = 0.3 + Math.random() * 0.5;
        cloud.userData.bobOffset = Math.random() * Math.PI * 2;

        game.scene.add(cloud);
        game.ashClouds.push(cloud);
    }
}

// Create a wall
function createWall(x, z, height, width, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshLambertMaterial({ color });
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(x, height / 2, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    game.scene.add(wall);
    game.objects.push(wall);
}

// Create a box
function createBox(x, z, y, width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshLambertMaterial({ color });
    const box = new THREE.Mesh(geometry, material);
    box.position.set(x, height / 2, y);
    box.castShadow = true;
    box.receiveShadow = true;
    game.scene.add(box);
    game.objects.push(box);
}

// Create shockwave effect
function createShockwave(x, z) {
    const shockwave = new THREE.Group();

    // Create expanding ring
    const ringGeometry = new THREE.TorusGeometry(1, 0.3, 8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        transparent: true,
        opacity: 0.8
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    shockwave.add(ring);

    shockwave.position.set(x, 0.5, z);
    shockwave.userData.startTime = Date.now();
    shockwave.userData.duration = 1000; // 1 second
    shockwave.userData.maxRadius = 15;

    game.scene.add(shockwave);

    // Animate shockwave
    const animateShockwave = () => {
        const elapsed = Date.now() - shockwave.userData.startTime;
        const progress = elapsed / shockwave.userData.duration;

        if (progress >= 1) {
            // Remove shockwave when animation completes
            game.scene.remove(shockwave);
            return;
        }

        // Expand ring
        const scale = 1 + progress * 14; // From 1 to 15
        ring.scale.set(scale, scale, 1);

        // Fade out
        ringMaterial.opacity = 0.8 * (1 - progress);

        // Continue animation
        requestAnimationFrame(animateShockwave);
    };

    animateShockwave();

    // Damage player if in range
    const distanceToPlayer = Math.sqrt(
        Math.pow(game.camera.position.x - x, 2) +
        Math.pow(game.camera.position.z - z, 2)
    );

    if (distanceToPlayer < 15) {
        if (!game.hasShieldProtection) {
            game.playerHP = Math.max(0, game.playerHP - 10);
            updateHPDisplay();
            showNotification('💥 Hit by shockwave! -10 HP');

            if (game.playerHP === 0) {
                gameOver();
            }
        } else {
            showNotification('🛡️ Shield blocked shockwave!');
        }
    }
}

// Create teleport effect
function createTeleportEffect(x, z) {
    const teleportEffect = new THREE.Group();

    // Create swirling particles
    const particleCount = 100;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 * 3;
        const radius = (i / particleCount) * 5;
        const height = (i / particleCount) * 10;

        positions.push(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );

        colors.push(0, 1, 0); // Green color
    }

    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    teleportEffect.add(particles);

    teleportEffect.position.set(x, 0, z);
    teleportEffect.userData.startTime = Date.now();
    teleportEffect.userData.duration = 500; // 0.5 seconds

    game.scene.add(teleportEffect);

    // Animate teleport effect
    const animateTeleport = () => {
        const elapsed = Date.now() - teleportEffect.userData.startTime;
        const progress = elapsed / teleportEffect.userData.duration;

        if (progress >= 1) {
            game.scene.remove(teleportEffect);
            return;
        }

        // Rotate particles
        particles.rotation.y += 0.1;

        // Fade out
        particlesMaterial.opacity = 0.8 * (1 - progress);

        requestAnimationFrame(animateTeleport);
    };

    animateTeleport();
}

// Spawn portal
function spawnPortal(x, z, targetWorld) {
    if (game.portalSpawned) return;

    // Create portal group
    game.portal = new THREE.Group();
    game.portal.userData.targetWorld = targetWorld; // Store which world this portal leads to

    // Choose colors based on target world
    let outerColor, innerColor1, innerColor2, particleColor;
    if (targetWorld === 2) {
        // Cyan/Blue portal for World 2
        outerColor = 0x00ffff;
        innerColor1 = 0x0088ff;
        innerColor2 = 0x0044ff;
        particleColor = 0x00ffff;
    } else if (targetWorld === 3) {
        // Orange/Red portal for World 3
        outerColor = 0xff6600;
        innerColor1 = 0xff4400;
        innerColor2 = 0xff2200;
        particleColor = 0xff6600;
    }

    // Outer ring - rotating
    const outerRingGeometry = new THREE.TorusGeometry(3, 0.3, 16, 100);
    const outerRingMaterial = new THREE.MeshBasicMaterial({
        color: outerColor,
        emissive: outerColor,
        transparent: true,
        opacity: 0.8
    });
    const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
    outerRing.rotation.x = Math.PI / 2;

    // Inner portal surface - swirling effect
    const portalGeometry = new THREE.CircleGeometry(2.7, 32);
    const portalMaterial = new THREE.MeshBasicMaterial({
        color: innerColor1,
        emissive: innerColor2,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    const portalSurface = new THREE.Mesh(portalGeometry, portalMaterial);
    portalSurface.rotation.x = Math.PI / 2;

    // Add particle effects around portal
    const particleCount = 50;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 4 + Math.random() * 2;
        particlePositions[i * 3] = Math.cos(angle) * radius;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
        particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        color: particleColor,
        size: 0.3,
        transparent: true,
        opacity: 0.8
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);

    game.portal.add(outerRing);
    game.portal.add(portalSurface);
    game.portal.add(particles);

    game.portal.position.set(x, 4, z);
    game.portal.userData.outerRing = outerRing;
    game.portal.userData.portalSurface = portalSurface;
    game.portal.userData.particles = particles;

    game.scene.add(game.portal);
    game.portalSpawned = true;

    showNotification(`🌀 Portal to World ${targetWorld} has appeared!`);
    console.log('Portal spawned at', x, z, 'leading to World', targetWorld);
}

// Check portal interaction
function checkPortalPickup() {
    if (!game.portal || !game.portalSpawned) return;

    const distance = game.camera.position.distanceTo(game.portal.position);
    if (distance < 5) {
        // Player entered portal - check which world it leads to
        const targetWorld = game.portal.userData.targetWorld;
        if (targetWorld === 2) {
            enterWorldTwo();
        } else if (targetWorld === 3) {
            enterWorldThree();
        }
    }
}

// Animate portal
function updatePortal(delta) {
    if (!game.portal) return;

    // Rotate outer ring
    if (game.portal.userData.outerRing) {
        game.portal.userData.outerRing.rotation.z += delta * 2;
    }

    // Rotate portal surface (opposite direction)
    if (game.portal.userData.portalSurface) {
        game.portal.userData.portalSurface.rotation.x += delta * 0.5;
    }

    // Animate particles
    if (game.portal.userData.particles) {
        game.portal.userData.particles.rotation.y += delta;
    }

    // Pulse opacity
    const pulseSpeed = 2;
    const opacity = 0.5 + Math.sin(Date.now() * 0.001 * pulseSpeed) * 0.3;
    if (game.portal.userData.portalSurface) {
        game.portal.userData.portalSurface.material.opacity = opacity;
    }
}

// Consolidated world transition function
function enterWorld(worldNum) {
    if (game.currentWorld === worldNum) {
        console.log(`Already in World ${worldNum}`);
        return;
    }

    const worldConfigs = {
        2: {
            bgColor: 0x6a0dad,
            message: '🎮 Welcome to World 2! Enemies are stronger here!',
            shields: 3,
            food: 4,
            enemies: 5,
            skySetup: () => { createGalaxy(); createColoredSpirals(); },
            skyCleanup: () => {
                if (game.sun) { game.scene.remove(game.sun); game.sun = null; }
                if (game.sunGlow) { game.scene.remove(game.sunGlow); game.sunGlow = null; }
                if (game.clouds) { game.clouds.forEach(c => game.scene.remove(c)); game.clouds = []; }
            },
            specialItem: () => {
                const pos = randomPosition(400);
                createSpellBook(pos.x, pos.z);
            }
        },
        3: {
            bgColor: 0xff4400,
            message: '🔥 Welcome to World 3! The heat is on!',
            shields: 2,
            food: 3,
            enemies: 7,
            skySetup: () => createAshClouds(),
            skyCleanup: () => {
                if (game.galaxy) { game.scene.remove(game.galaxy); game.galaxy = null; }
                if (game.spirals) { game.spirals.forEach(s => game.scene.remove(s)); game.spirals = []; }
            },
            specialItem: () => {
                if (!game.axeCollected && !game.axe) {
                    const pos = randomPosition(400);
                    createAxePickup(pos.x, pos.z);
                }
            }
        }
    };

    const config = worldConfigs[worldNum];
    showNotification('🌀 Entering World ' + worldNum + '...');

    setTimeout(() => {
        // Clear all enemies and boss
        game.enemies.forEach(e => game.scene.remove(e));
        game.enemies = [];
        if (game.boss) { game.scene.remove(game.boss); game.boss = null; }
        if (game.portal) { game.scene.remove(game.portal); game.portal = null; game.portalSpawned = false; }

        // Clear all items
        game.shields.forEach(s => game.scene.remove(s));
        game.shields = [];
        game.foods.forEach(f => game.scene.remove(f));
        game.foods = [];
        [game.bow, game.shop, game.spellBook].forEach((item, idx) => {
            if (item) {
                game.scene.remove(item);
                if (idx === 0) game.bow = null;
                else if (idx === 1) game.shop = null;
                else game.spellBook = null;
            }
        });

        // Reset state
        game.bossSpawned = false;
        game.totalEnemiesSpawned = 0;
        game.camera.position.set(0, game.playerHeight, 0);
        game.currentWorld = worldNum;

        // Update environment
        game.scene.background = new THREE.Color(config.bgColor);
        game.scene.fog = new THREE.Fog(config.bgColor, 0, 200);
        config.skyCleanup();
        config.skySetup();

        // Spawn items
        for (let i = 0; i < config.shields; i++) {
            const pos = randomPosition();
            createShieldPickup(pos.x, pos.z);
        }
        for (let i = 0; i < config.food; i++) {
            const pos = randomPosition();
            createFoodPickup(pos.x, pos.z);
        }
        config.specialItem();
        createShop(350, 0);

        // Spawn enemies
        for (let i = 0; i < config.enemies; i++) spawnEnemy();

        showNotification(config.message);
        console.log('Entered World ' + worldNum);
    }, 1000);
}

// Wrapper functions for compatibility
function enterWorldTwo() { enterWorld(2); }
function enterWorldThree() { enterWorld(3); }
