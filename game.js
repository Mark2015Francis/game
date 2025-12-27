// Game version
const GAME_VERSION = "v2.2.0";

// Game state
const game = {
    scene: null,
    camera: null,
    renderer: null,
    controls: {
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        jump: false,
        canJump: false
    },
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    rotation: { x: 0, y: 0 },
    playerHeight: 1.8,
    playerSpeed: 35.0, // Decreased from 50.0
    jumpHeight: 15.0,
    gravity: 30.0,
    objects: [],
    raycaster: new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10),
    clock: new THREE.Clock(),
    isPointerLocked: false,
    enemies: [], // Changed from single enemy to array
    enemySpeed: 15.0, // Increased from 8.0
    enemySpawnTimer: 0,
    enemySpawnInterval: 5, // Spawn every 5 seconds
    isGameOver: false,
    inventory: {
        items: [],
        equippedSword: false,
        equippedShield: false,
        isOpen: false
    },
    shields: [],
    equippedSwordMesh: null,
    equippedBowMesh: null,
    hasShieldProtection: false,
    isAttacking: false,
    attackCooldown: 0,
    walkTime: 0,
    isMoving: false,
    playerHP: 20,
    maxPlayerHP: 20,
    playerLevel: 1,
    playerEXP: 0,
    playerDamage: 1,
    expToNextLevel: 500, // Level 1->2 requires 500 EXP
    bow: null,
    bowCollected: false,
    equippedBow: false,
    bowDamage: 1,
    axe: null,
    axeCollected: false,
    equippedAxe: false,
    axeCooldown: 0,
    equippedAxeMesh: null,
    projectiles: [],
    shootCooldown: 0,
    isChargingShot: false,
    chargeStartTime: 0,
    maxChargeTime: 2.0, // Max charge time in seconds for fully charged shot
    enemyProjectiles: [],
    bossProjectiles: [],
    totalEnemiesSpawned: 0,
    boss: null,
    bossSpawned: false,
    bossJumpTimer: 0,
    bossJumpCooldown: 10,
    bossStunned: false,
    bossStunTimer: 0,
    bossIsJumping: false,
    bossTeleportTimer: 10,
    bossTeleportCooldown: 10,
    bossShootTimer: 0,
    bossShootCooldown: 3,
    portal: null,
    portalSpawned: false,
    currentWorld: 1,
    foods: [],
    redPotions: [],
    coins: 0,
    shop: null,
    isShopOpen: false,
    shieldCount: 0,
    foodCount: 0,
    redPotionCount: 0,
    spellBook: null,
    spellBookCollected: false,
    equippedSpellBook: false,
    currentSpell: 'fireball', // 'fireball', 'freezeball', or 'dash'
    hasFireball: false,
    hasBigJump: false,
    hasFreezeball: false,
    hasDash: false,
    hasFasterCharge: false,
    fireballCooldown: 0,
    freezeballCooldown: 0,
    dashCooldown: 0,
    equippedSpellBookMesh: null,
    playerMana: 10,
    maxPlayerMana: 10,
    isDashing: false,
    dashTimer: 0,
    dashDuration: 0.3, // 0.3 seconds dash
    dashSpeed: 150, // Very fast speed during dash
    playerFrozen: false,
    freezeDuration: 0,
    // Mobile touch controls
    isMobile: false,
    touchStartX: 0,
    touchStartY: 0,
    touchCurrentX: 0,
    touchCurrentY: 0,
    isTouching: false,
    // Joystick controls
    joystickActive: false,
    joystickDeltaX: 0,
    joystickDeltaY: 0,
    // Damage numbers
    damageNumbers: []
};

// Detect if running on mobile device
function detectMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for iOS
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

    // Check for Android
    const isAndroid = /android/i.test(userAgent);

    // Check for touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return (isIOS || isAndroid) && hasTouch;
}

// Initialize the game
function init() {
    // Detect mobile device
    game.isMobile = detectMobile();
    if (game.isMobile) {
        console.log('Mobile device detected - touch controls enabled');

        // Show mobile control buttons and joystick
        const mobileControls = document.getElementById('mobileControls');
        const mobileAttackBtn = document.getElementById('mobileAttackBtn');
        const mobileJumpBtn = document.getElementById('mobileJumpBtn');
        const mobileInventoryBtn = document.getElementById('mobileInventoryBtn');
        const joystickContainer = document.getElementById('joystickContainer');

        if (mobileControls) mobileControls.style.display = 'block';
        if (mobileAttackBtn) mobileAttackBtn.style.display = 'flex';
        if (mobileJumpBtn) mobileJumpBtn.style.display = 'flex';
        if (mobileInventoryBtn) mobileInventoryBtn.style.display = 'flex';
        if (joystickContainer) joystickContainer.style.display = 'block';

        // Update instructions for mobile
        const instructions = document.getElementById('instructions');
        if (instructions) {
            // Update "Click to start" text
            const clickText = instructions.querySelector('p:nth-of-type(2)');
            if (clickText) {
                clickText.textContent = 'Tap to start';
            }

            // Update controls text
            const controlsText = instructions.querySelector('p:nth-of-type(3)');
            if (controlsText) {
                controlsText.innerHTML = `
                    <strong>Mobile Controls:</strong><br>
                    Joystick (bottom left) - Move<br>
                    Drag anywhere - Look around<br>
                    Use action buttons to play
                `;
            }
        }
    }
    // Create scene
    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x87ceeb);
    game.scene.fog = new THREE.Fog(0x87ceeb, 0, 200);

    // Create camera
    game.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    game.camera.position.set(0, game.playerHeight, 0);

    // Create renderer
    const canvas = document.getElementById('gameCanvas');
    game.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    game.renderer.shadowMap.enabled = true;
    game.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    game.renderer.sortObjects = true; // Enable object sorting for renderOrder

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    game.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    game.scene.add(directionalLight);

    // Load grass texture
    var groundTexture = new THREE.TextureLoader().load('seamlessly-repeating-zeros.jpg');
	groundTexture.wrapS = groundTexture.wrapT = THREE.repeatWrapping;
	groundTexture.repeat.set(200, 200);
	groundTexture.anisotropy = 4;
	groundTexture.encoding = THREE.sRGBEncoding;
	var groundMaterial = new THREE.MeshStandardMaterial( {map : groundTexture} );
	var ground = new THREE.Mesh( new THREE.PlaneBufferGeometry(10000,10000),  groundMaterial);
	ground.position.y =0.0;
	ground.rotation.x = - Math.PI /2;
	ground.receiveShadow = true;
	game.scene.add(ground);

    // Load building/wall texture (big-0-1.jpg)
    const buildingTextureLoader = new THREE.TextureLoader();
    const buildingTextureFormats = [
        'big-0-1.jpg',
        'big-0-1.png'
    ];

    let buildingTextureLoaded = false;
    let currentBuildingFormatIndex = 0;

    function tryLoadBuildingTexture() {
        if (currentBuildingFormatIndex >= buildingTextureFormats.length || buildingTextureLoaded) return;

        const texturePath = buildingTextureFormats[currentBuildingFormatIndex];
        console.log(`Attempting to load building texture: ${texturePath}`);

        buildingTextureLoader.load(
            texturePath,
            // onLoad - texture loaded successfully
            function(texture) {
                buildingTextureLoaded = true;
                console.log(`✓ Building texture loaded successfully: ${texturePath}`);

                // Set texture to repeat for tiling
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;

                // Store texture globally for use in createBox and createWall
                game.buildingTexture = texture;

                // Update all existing boxes and walls with the texture
                game.objects.forEach(obj => {
                    if (obj.geometry && obj.geometry.type === 'BoxGeometry' && obj.material) {
                        obj.material.map = texture;
                        obj.material.needsUpdate = true;
                    }
                });
            },
            // onProgress
            undefined,
            // onError - texture failed to load, try next format
            function(error) {
                console.log(`⚠ Failed to load ${texturePath}, trying next format...`);
                currentBuildingFormatIndex++;
                tryLoadBuildingTexture(); // Try next format
            }
        );
    }

    // Start loading building texture
    tryLoadBuildingTexture();

    // Add sun and clouds to World 1 sky
    createSun();
    createClouds();

    // Create walls around the perimeter - WAY BIGGER with infinite height
    createWall(0, 500, 1000, 1000, 10, 0x8b4513);  // Back wall
    createWall(0, -500, 1000, 1000, 10, 0x8b4513); // Front wall
    createWall(500, 0, 1000, 10, 1000, 0x8b4513);  // Right wall
    createWall(-500, 0, 1000, 10, 1000, 0x8b4513); // Left wall

    // Create some obstacles/buildings scattered across the larger area
    createBox(-30, 0, -30, 15, 10, 15, 0x808080);
    createBox(30, 0, -30, 12, 8, 12, 0x606060);
    createBox(-30, 0, 30, 10, 15, 10, 0x707070);
    createBox(30, 0, 30, 8, 12, 8, 0x909090);
    createBox(0, 0, -50, 20, 5, 10, 0x654321);
    createBox(-50, 0, 0, 10, 7, 15, 0x8b7355);
    createBox(50, 0, 10, 12, 9, 12, 0x696969);

    // Add more obstacles for the bigger area
    createBox(-100, 0, -100, 20, 12, 20, 0x808080);
    createBox(150, 0, -150, 25, 15, 25, 0x606060);
    createBox(-200, 0, 200, 18, 10, 18, 0x707070);
    createBox(200, 0, 200, 15, 8, 15, 0x909090);

    // Create some decorative objects
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 800 - 400;
        const z = Math.random() * 800 - 400;
        if (Math.abs(x) < 20 && Math.abs(z) < 20) continue; // Don't spawn near player
        createBox(x, 0, z, 3, 3, 3, 0xff6347);
    }

    // Spawn initial enemies
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();

    // Create multiple shield pickups at random positions
    for (let i = 0; i < 3; i++) {
        const randomX = (Math.random() * 600 - 300);
        const randomZ = (Math.random() * 600 - 300);
        createShieldPickup(randomX, randomZ);
    }

    // Create bow pickup item at random position
    const bowX = (Math.random() * 600 - 300);
    const bowZ = (Math.random() * 600 - 300);
    createBowPickup(bowX, bowZ);

    // Create food/potion pickups at random positions (5% chance for red potion)
    for (let i = 0; i < 5; i++) {
        const foodX = (Math.random() * 600 - 300);
        const foodZ = (Math.random() * 600 - 300);
        if (Math.random() < 0.05) {
            createRedPotionPickup(foodX, foodZ);
        } else {
            createFoodPickup(foodX, foodZ);
        }
    }

    // Create shop at edge of map
    createShop(350, 0);

    // Initialize inventory UI
    initInventory();

    // Equip sword at start
    game.inventory.equippedSword = true;
    equipSword();
    updateEquippedDisplays();

    // Set up event listeners
    setupControls();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

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

    // Create material with texture if available, otherwise use color
    const materialConfig = { color };
    if (game.buildingTexture) {
        materialConfig.map = game.buildingTexture;
    }
    const material = new THREE.MeshLambertMaterial(materialConfig);

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

    // Create material with texture if available, otherwise use color
    const materialConfig = { color };
    if (game.buildingTexture) {
        materialConfig.map = game.buildingTexture;
    }
    const material = new THREE.MeshLambertMaterial(materialConfig);

    const box = new THREE.Mesh(geometry, material);
    box.position.set(x, height / 2, y);
    box.castShadow = true;
    box.receiveShadow = true;
    game.scene.add(box);
    game.objects.push(box);
}

// Spawn enemy at random position
function spawnEnemy() {
    // Check if we should spawn the boss instead
    if (game.totalEnemiesSpawned >= 40 && !game.bossSpawned) {
        spawnBoss();
        // Don't return - continue spawning regular enemies
    }

    const x = (Math.random() * 600 - 300);
    const z = (Math.random() * 600 - 300);

    // Don't spawn too close to player
    const distToPlayer = Math.sqrt(x * x + z * z);
    const spawnX = distToPlayer < 50 ? Math.cos(Math.random() * Math.PI * 2) * (100 + Math.random() * 100) : x;
    const spawnZ = distToPlayer < 50 ? Math.sin(Math.random() * Math.PI * 2) * (100 + Math.random() * 100) : z;

    // Enemy spawn logic by world
    if (game.currentWorld === 2) {
        // World 2: 50% chance to spawn projectile enemy
        if (Math.random() < 0.5) {
            createProjectileEnemy(spawnX, spawnZ);
        } else {
            createEnemy(spawnX, spawnZ);
        }
    } else if (game.currentWorld === 3) {
        // World 3: 20% warrior, then 70% projectile, 30% normal from remaining
        const rand = Math.random();
        if (rand < 0.2) {
            createWarriorEnemy(spawnX, spawnZ);
        } else if (rand < 0.76) { // 0.2 + (0.8 * 0.7) = 0.76
            createProjectileEnemy(spawnX, spawnZ);
        } else {
            createEnemy(spawnX, spawnZ);
        }
    } else {
        // World 1: Only regular enemies
        createEnemy(spawnX, spawnZ);
    }
}

// Create enemy - digital computer virus appearance
function createEnemy(x, z) {
    // Create a group for the virus
    const enemy = new THREE.Group();
    enemy.position.set(x, 1, z);
    enemy.castShadow = true;

    // Scale HP based on world
    let baseHP = 5;
    if (game.currentWorld === 2 || game.currentWorld === 3) {
        baseHP = 7; // Stronger in World 2 and 3
    }

    enemy.hp = baseHP;
    enemy.maxHP = baseHP;

    // Main virus body - octahedron (geometric diamond shape)
    const bodyGeometry = new THREE.OctahedronGeometry(1, 0);
    const bodyMaterial = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        emissive: 0x660000,
        emissiveIntensity: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    enemy.add(body);

    // Store material reference for hit effects
    enemy.material = bodyMaterial;

    // Add wireframe overlay for digital look
    const wireframeGeometry = new THREE.OctahedronGeometry(1.05, 0);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff3333,
        wireframe: true,
        transparent: true,
        opacity: 0.6
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    enemy.add(wireframe);

    // Add inner glowing core
    const coreGeometry = new THREE.OctahedronGeometry(0.4, 0);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        transparent: true,
        opacity: 0.9
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    enemy.add(core);

    // Add orbiting data cubes (like corrupted data packets)
    const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        emissive: 0xff0000
    });

    for (let i = 0; i < 4; i++) {
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        const angle = (i / 4) * Math.PI * 2;
        cube.position.set(Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5);
        cube.userData.orbitAngle = angle;
        cube.userData.isOrbitCube = true;
        enemy.add(cube);
    }

    game.scene.add(enemy);
    game.enemies.push(enemy);
    game.totalEnemiesSpawned++;
    console.log(`Virus spawned! Total spawned: ${game.totalEnemiesSpawned}/40`);
}

// Create projectile enemy - shoots at player - Worm/Transmission Virus
function createProjectileEnemy(x, z) {
    const enemy = new THREE.Group();
    enemy.position.set(x, 1, z);

    // Scale HP based on world (projectile enemies are weaker but dangerous)
    let projectileHP = 1;
    if (game.currentWorld === 3) {
        projectileHP = 2; // Slightly stronger in World 3
    }
    // World 1 and 2 both have 1 HP projectile enemies

    enemy.hp = projectileHP;
    enemy.maxHP = projectileHP;
    enemy.isProjectileEnemy = true; // Mark as projectile enemy
    enemy.shootTimer = 2; // Shoot every 2 seconds
    enemy.shootCooldown = 2;

    // Main body - segmented worm virus (green to differentiate)
    const segmentCount = 3;
    for (let i = 0; i < segmentCount; i++) {
        const segmentGeometry = new THREE.CylinderGeometry(0.3 - i * 0.05, 0.3 - i * 0.05, 0.4, 8);
        const segmentMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ff00, // Green color
            emissive: 0x006600,
            emissiveIntensity: 0.5
        });
        const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
        segment.position.set(0, i * 0.35, 0);
        segment.castShadow = true;
        enemy.add(segment);

        // Store material reference on first segment
        if (i === 0) {
            enemy.material = segmentMaterial;
        }
    }

    // Add wireframe bands around segments
    for (let i = 0; i < segmentCount; i++) {
        const wireGeometry = new THREE.CylinderGeometry(0.32 - i * 0.05, 0.32 - i * 0.05, 0.1, 8);
        const wireMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const wire = new THREE.Mesh(wireGeometry, wireMaterial);
        wire.position.set(0, i * 0.35, 0);
        enemy.add(wire);
    }

    // Add pulsating signal rings (transmission effect)
    for (let i = 0; i < 2; i++) {
        const ringGeometry = new THREE.TorusGeometry(0.6, 0.05, 8, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.4
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(0, 0.5, 0);
        ring.userData.isPulseRing = true;
        ring.userData.offset = i * Math.PI; // Offset for alternating pulse
        enemy.add(ring);
    }

    // Add antenna for transmitting - taller and thinner
    const antennaGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6);
    const antennaMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(0, 1.5, 0);
    enemy.add(antenna);

    // Antenna top with glowing ball
    const antennaTopGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const antennaTopMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 1
    });
    const antennaTop = new THREE.Mesh(antennaTopGeometry, antennaTopMaterial);
    antennaTop.position.set(0, 2.1, 0);
    enemy.add(antennaTop);

    // Add orbiting data packets (like transmitted data)
    const packetGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const packetMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00
    });

    for (let i = 0; i < 3; i++) {
        const packet = new THREE.Mesh(packetGeometry, packetMaterial);
        const angle = (i / 3) * Math.PI * 2;
        packet.position.set(Math.cos(angle) * 1.2, 0.5, Math.sin(angle) * 1.2);
        packet.userData.orbitAngle = angle;
        packet.userData.isOrbitPacket = true;
        enemy.add(packet);
    }

    game.scene.add(enemy);
    game.enemies.push(enemy);
    game.totalEnemiesSpawned++;
    console.log(`Worm virus spawned! Total spawned: ${game.totalEnemiesSpawned}/40`);
}

// Create warrior enemy - tanky enemy that dashes - Trojan Warrior Virus
function createWarriorEnemy(x, z) {
    const enemy = new THREE.Group();
    enemy.position.set(x, 1, z);
    enemy.castShadow = true;

    enemy.hp = 10; // High HP
    enemy.maxHP = 10;
    enemy.isWarriorEnemy = true; // Mark as warrior enemy
    enemy.dashTimer = 20; // Dash every 20 seconds
    enemy.dashCooldown = 20;
    enemy.isWindingUp = false; // Wind-up phase before dash
    enemy.windUpDuration = 0;
    enemy.isDashing = false;
    enemy.dashDuration = 0;
    enemy.dashDirection = new THREE.Vector3(); // Direction to dash in

    // Main warrior body - larger dodecahedron with dark purple color (bigger and more angular than regular enemies)
    const bodyGeometry = new THREE.DodecahedronGeometry(1.3, 0);
    const bodyMaterial = new THREE.MeshLambertMaterial({
        color: 0x3a0e3e, // Dark purple
        emissive: 0x1a0a1e,
        emissiveIntensity: 0.6
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    enemy.add(body);

    // Store material reference for hit effects
    enemy.material = bodyMaterial;

    // Add subtle dark edge glow for menacing appearance
    const glowGeometry = new THREE.DodecahedronGeometry(1.35, 0);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x550055,
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    enemy.add(glow);

    // Add 6 legs - 3 on each side (left and right)
    enemy.legs = [];
    for (let i = 0; i < 6; i++) {
        const side = i < 3 ? -1 : 1; // -1 for left, 1 for right
        const legOffset = (i % 3); // 0, 1, 2 for front, middle, back

        // Position along Z axis (front to back)
        const zPosition = (legOffset - 1) * 0.8; // -0.8, 0, 0.8

        // Leg segment 1 (upper) - angled outward from body
        const leg1Geometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6);
        const legMaterial = new THREE.MeshLambertMaterial({
            color: 0x2a0a2e,
            emissive: 0x1a0a1e
        });
        const leg1 = new THREE.Mesh(leg1Geometry, legMaterial);
        leg1.position.set(
            side * 1.0,
            0.1,
            zPosition
        );
        leg1.rotation.z = side * 0.6; // Angle outward
        leg1.castShadow = true;

        // Leg segment 2 (lower) - extends down and out
        const leg2Geometry = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6);
        const leg2 = new THREE.Mesh(leg2Geometry, legMaterial);
        leg2.position.set(
            side * 1.5,
            -0.4,
            zPosition
        );
        leg2.rotation.z = -side * 0.8; // Angle down
        leg2.castShadow = true;

        // Leg segment 3 (foot) - small bottom piece touching ground
        const leg3Geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
        const leg3 = new THREE.Mesh(leg3Geometry, legMaterial);
        leg3.position.set(
            side * 1.7,
            -0.85,
            zPosition
        );
        leg3.rotation.z = side * 0.3; // Slight angle for stability
        leg3.castShadow = true;

        // Store leg data
        const legGroup = new THREE.Group();
        legGroup.add(leg1);
        legGroup.add(leg2);
        legGroup.add(leg3);
        legGroup.userData.isLeg = true;
        legGroup.userData.legIndex = i;
        legGroup.userData.side = side;
        legGroup.userData.legOffset = legOffset;
        legGroup.userData.zPosition = zPosition;
        enemy.add(legGroup);
        enemy.legs.push(legGroup);
    }

    // Add orbiting pentagons
    for (let i = 0; i < 5; i++) {
        const pentagonGeometry = new THREE.CircleGeometry(0.25, 5);
        const pentagonMaterial = new THREE.MeshBasicMaterial({
            color: 0x8800ff,
            emissive: 0x8800ff,
            emissiveIntensity: 0.8,
            side: THREE.DoubleSide
        });
        const pentagon = new THREE.Mesh(pentagonGeometry, pentagonMaterial);
        const angle = (i / 5) * Math.PI * 2;
        pentagon.position.set(Math.cos(angle) * 2.2, 0.3, Math.sin(angle) * 2.2);
        pentagon.userData.orbitAngle = angle;
        pentagon.userData.isPentagon = true;
        enemy.add(pentagon);
    }

    game.scene.add(enemy);
    game.enemies.push(enemy);
    game.totalEnemiesSpawned++;
    console.log(`Warrior virus spawned! Total spawned: ${game.totalEnemiesSpawned}/40`);
}

// Create code explosion effect when enemy dies
function createCodeExplosion(position) {
    const fragmentCount = 20; // Number of code fragments
    const codeColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]; // Various colors

    for (let i = 0; i < fragmentCount; i++) {
        // Create small cube fragment
        const size = Math.random() * 0.3 + 0.1;
        const fragmentGeometry = new THREE.BoxGeometry(size, size, size);
        const fragmentMaterial = new THREE.MeshBasicMaterial({
            color: codeColors[Math.floor(Math.random() * codeColors.length)],
            transparent: true,
            opacity: 1
        });
        const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);

        // Position at enemy location
        fragment.position.copy(position);

        // Random velocity in all directions
        const speed = Math.random() * 15 + 10;
        const theta = Math.random() * Math.PI * 2; // Random angle around Y axis
        const phi = Math.random() * Math.PI - Math.PI / 2; // Random angle from ground to sky

        fragment.velocity = new THREE.Vector3(
            Math.cos(theta) * Math.cos(phi) * speed,
            Math.sin(phi) * speed + Math.random() * 5, // Upward bias
            Math.sin(theta) * Math.cos(phi) * speed
        );

        // Random rotation velocity
        fragment.rotationVelocity = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );

        fragment.userData.lifetime = 0;
        fragment.userData.maxLifetime = 1.5; // Live for 1.5 seconds
        fragment.userData.isCodeFragment = true;

        game.scene.add(fragment);
        if (!game.codeFragments) {
            game.codeFragments = [];
        }
        game.codeFragments.push(fragment);
    }
}

// Update code fragments (called in animate loop)
function updateCodeFragments(delta) {
    if (!game.codeFragments) return;

    for (let i = game.codeFragments.length - 1; i >= 0; i--) {
        const fragment = game.codeFragments[i];

        // Update lifetime
        fragment.userData.lifetime += delta;

        // Update position
        fragment.position.add(fragment.velocity.clone().multiplyScalar(delta));

        // Apply gravity
        fragment.velocity.y -= 20 * delta;

        // Update rotation
        fragment.rotation.x += fragment.rotationVelocity.x * delta;
        fragment.rotation.y += fragment.rotationVelocity.y * delta;
        fragment.rotation.z += fragment.rotationVelocity.z * delta;

        // Fade out over time
        const lifeRatio = fragment.userData.lifetime / fragment.userData.maxLifetime;
        fragment.material.opacity = 1 - lifeRatio;

        // Remove if lifetime exceeded
        if (fragment.userData.lifetime >= fragment.userData.maxLifetime) {
            game.scene.remove(fragment);
            game.codeFragments.splice(i, 1);
        }
    }
}

// Spawn boss
function spawnBoss() {
    const x = (Math.random() * 400 - 200);
    const z = (Math.random() * 400 - 200);

    // Don't spawn too close to player
    const distToPlayer = Math.sqrt(x * x + z * z);
    if (distToPlayer < 100) {
        // Spawn at safe distance
        const angle = Math.random() * Math.PI * 2;
        const distance = 150;
        if (game.currentWorld === 3) {
            createWorld3Boss(Math.cos(angle) * distance, Math.sin(angle) * distance);
        } else if (game.currentWorld === 2) {
            createWorld2Boss(Math.cos(angle) * distance, Math.sin(angle) * distance);
        } else {
            createBoss(Math.cos(angle) * distance, Math.sin(angle) * distance);
        }
    } else {
        if (game.currentWorld === 3) {
            createWorld3Boss(x, z);
        } else if (game.currentWorld === 2) {
            createWorld2Boss(x, z);
        } else {
            createBoss(x, z);
        }
    }
}

// Create boss enemy - massive threatening virus
function createBoss(x, z) {
    // Create boss as a group for complex virus design
    const boss = new THREE.Group();
    boss.position.set(x, 3, z);
    boss.castShadow = true;
    boss.hp = 100; // Boss HP
    boss.maxHP = 100;
    boss.isBoss = true;
    boss.jumpTimer = game.bossJumpCooldown; // First jump after 10 seconds
    boss.isJumping = false;
    boss.stunned = false;
    boss.stunnedTimer = 0;
    boss.jumpHeight = 0;
    boss.jumpStartY = 3;

    // Main virus body - large octahedron
    const bodyGeometry = new THREE.OctahedronGeometry(3, 0);
    const bodyMaterial = new THREE.MeshLambertMaterial({
        color: 0x8b0000, // Dark red
        emissive: 0x990000,
        emissiveIntensity: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    boss.add(body);

    // Store material reference for hit effects
    boss.material = bodyMaterial;

    // Add outer wireframe layer - pulsing
    const outerWireframeGeometry = new THREE.OctahedronGeometry(3.3, 0);
    const outerWireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    const outerWireframe = new THREE.Mesh(outerWireframeGeometry, outerWireframeMaterial);
    outerWireframe.userData.isOuterWireframe = true;
    boss.add(outerWireframe);

    // Add middle octahedron layer - rotating opposite direction
    const middleGeometry = new THREE.OctahedronGeometry(2, 0);
    const middleMaterial = new THREE.MeshLambertMaterial({
        color: 0xcc0000,
        emissive: 0xff0000,
        transparent: true,
        opacity: 0.6
    });
    const middleLayer = new THREE.Mesh(middleGeometry, middleMaterial);
    middleLayer.userData.isMiddleLayer = true;
    boss.add(middleLayer);

    // Add inner glowing core - pulsing
    const coreGeometry = new THREE.OctahedronGeometry(1, 0);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        transparent: true,
        opacity: 1
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.userData.isPulsingCore = true;
    boss.add(core);

    // Add large threatening spikes protruding from vertices
    const spikeGeometry = new THREE.ConeGeometry(0.4, 2, 8);
    const spikeMaterial = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        emissive: 0x660000
    });

    // Octahedron vertices for spike placement
    const spikePositions = [
        {x: 3, y: 0, z: 0}, {x: -3, y: 0, z: 0},
        {x: 0, y: 3, z: 0}, {x: 0, y: -3, z: 0},
        {x: 0, y: 0, z: 3}, {x: 0, y: 0, z: -3}
    ];

    spikePositions.forEach(pos => {
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        spike.position.set(pos.x, pos.y, pos.z);
        spike.lookAt(pos.x * 2, pos.y * 2, pos.z * 2);
        spike.castShadow = true;
        boss.add(spike);
    });

    // Add orbiting data corruption rings
    for (let ring = 0; ring < 3; ring++) {
        const cubeCount = 12;
        for (let i = 0; i < cubeCount; i++) {
            const angle = (i / cubeCount) * Math.PI * 2;
            const radius = 4.5 + ring * 0.5;
            const cubeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
            const cubeMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                emissive: 0xff0000
            });
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.set(Math.cos(angle) * radius, ring * 0.5 - 0.5, Math.sin(angle) * radius);
            cube.userData.orbitAngle = angle;
            cube.userData.orbitRadius = radius;
            cube.userData.orbitRing = ring;
            cube.userData.isBossOrbitCube = true;
            boss.add(cube);
        }
    }

    // Add menacing red glow aura
    const glowGeometry = new THREE.SphereGeometry(4, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.15
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    boss.add(glow);

    game.scene.add(boss);
    game.boss = boss;
    game.bossSpawned = true;

    showNotification('⚠️ MEGA VIRUS BOSS APPEARED! 100 HP');
    console.log('BOSS SPAWNED at', x, z);
}

// Create World 2 boss enemy - mega worm/transmission virus boss
function createWorld2Boss(x, z) {
    const boss = new THREE.Group();
    boss.position.set(x, 3, z);
    boss.castShadow = true;
    boss.hp = 50; // World 2 boss has 50 HP
    boss.maxHP = 50;
    boss.isBoss = true;
    boss.isWorld2Boss = true; // Mark as World 2 boss
    boss.teleportTimer = game.bossTeleportCooldown;
    boss.shootTimer = game.bossShootCooldown;
    boss.jumpStartY = 3;

    // Main body - large segmented worm virus (like projectile enemy but bigger)
    const segmentCount = 7; // More segments than regular worm
    for (let i = 0; i < segmentCount; i++) {
        const segmentGeometry = new THREE.CylinderGeometry(1.2 - i * 0.1, 1.2 - i * 0.1, 1.2, 12);
        const segmentMaterial = new THREE.MeshLambertMaterial({
            color: 0x00ff00, // Bright green like ranger enemy
            emissive: 0x00aa00,
            emissiveIntensity: 0.8
        });
        const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
        segment.position.set(0, i * 1.0, 0);
        segment.castShadow = true;
        boss.add(segment);

        // Store material reference on first segment
        if (i === 0) {
            boss.material = segmentMaterial;
        }
    }

    // Add enhanced wireframe bands around segments
    for (let i = 0; i < segmentCount; i++) {
        const wireGeometry = new THREE.CylinderGeometry(1.25 - i * 0.1, 1.25 - i * 0.1, 0.3, 12);
        const wireMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        const wire = new THREE.Mesh(wireGeometry, wireMaterial);
        wire.position.set(0, i * 1.0, 0);
        boss.add(wire);
    }

    // Add large pulsating signal rings (transmission effect) - 4 rings instead of 2
    for (let i = 0; i < 4; i++) {
        const ringGeometry = new THREE.TorusGeometry(2.0 + i * 0.3, 0.12, 12, 24);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(0, 3, 0);
        ring.userData.isPulseRing = true;
        ring.userData.offset = i * Math.PI / 2; // Offset for staggered pulse
        boss.add(ring);
    }

    // Add multiple powerful antennas - 3 antennas arranged in triangle
    for (let a = 0; a < 3; a++) {
        const angle = (a / 3) * Math.PI * 2;
        const antennaX = Math.cos(angle) * 0.8;
        const antennaZ = Math.sin(angle) * 0.8;

        const antennaGeometry = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 8);
        const antennaMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.5
        });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.set(antennaX, 5.5, antennaZ);
        boss.add(antenna);

        // Antenna top with larger glowing ball
        const antennaTopGeometry = new THREE.SphereGeometry(0.3, 12, 12);
        const antennaTopMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 1.5
        });
        const antennaTop = new THREE.Mesh(antennaTopGeometry, antennaTopMaterial);
        antennaTop.position.set(antennaX, 7.3, antennaZ);
        boss.add(antennaTop);
    }

    // Add many orbiting data packets (like transmitted data) - 12 packets instead of 3
    const packetGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const packetMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 1
    });

    for (let i = 0; i < 12; i++) {
        const packet = new THREE.Mesh(packetGeometry, packetMaterial);
        const angle = (i / 12) * Math.PI * 2;
        const radius = 3.0 + (i % 3) * 0.4; // Multiple orbit radii
        packet.position.set(Math.cos(angle) * radius, 3 + Math.floor(i / 4), Math.sin(angle) * radius);
        packet.userData.orbitAngle = angle;
        packet.userData.orbitRadius = radius;
        packet.userData.isOrbitPacket = true;
        boss.add(packet);
    }

    // Add glowing green aura for boss presence
    const glowGeometry = new THREE.SphereGeometry(3.5, 24, 24);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.1
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(0, 3, 0);
    boss.add(glow);

    game.scene.add(boss);
    game.boss = boss;
    game.bossSpawned = true;

    showNotification('⚠️ MEGA TRANSMISSION BOSS APPEARED! 50 HP - Can teleport and shoot!');
    console.log('World 2 BOSS SPAWNED at', x, z);
}

// Create World 3 boss enemy - Dark Code Lord
function createWorld3Boss(x, z) {
    const boss = new THREE.Group();
    boss.position.set(x, 5, z);
    boss.castShadow = true;
    boss.hp = 120; // World 3 boss has 120 HP
    boss.maxHP = 120;
    boss.isBoss = true;
    boss.isWorld3Boss = true; // Mark as World 3 boss
    boss.codeShootTimer = 2; // Shoot code every 2 seconds
    boss.windBlastTimer = 8; // Wind blast every 8 seconds
    boss.isStunned = false;
    boss.stunDuration = 0;
    boss.jumpStartY = 5;

    // Dark Lord Head - large menacing sphere
    const headGeometry = new THREE.SphereGeometry(2.5, 32, 32);
    const headMaterial = new THREE.MeshLambertMaterial({
        color: 0x0a0a0a, // Very dark, almost black
        emissive: 0x330000, // Dark red glow
        emissiveIntensity: 0.8
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 3;
    head.castShadow = true;
    boss.add(head);
    boss.material = headMaterial;

    // Futuristic glowing eyes - hexagonal tech design
    const createFuturisticEye = (x, y, z) => {
        const eyeGroup = new THREE.Group();

        // Main hexagonal eye core
        const eyeCoreGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 6);
        const eyeCoreMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 3
        });
        const eyeCore = new THREE.Mesh(eyeCoreGeometry, eyeCoreMaterial);
        eyeCore.rotation.x = Math.PI / 2;
        eyeGroup.add(eyeCore);

        // Outer hexagonal ring - tech frame
        const ringGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.08, 6);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4444,
            emissive: 0xff4444,
            emissiveIntensity: 1.5,
            wireframe: true
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        eyeGroup.add(ring);

        // Inner glow halo
        const glowGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.05, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff8888,
            emissive: 0xff0000,
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.6
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.x = Math.PI / 2;
        eyeGroup.add(glow);

        // Tech scanline effect - horizontal line across eye
        const scanlineGeometry = new THREE.PlaneGeometry(0.7, 0.05);
        const scanlineMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const scanline = new THREE.Mesh(scanlineGeometry, scanlineMaterial);
        scanline.position.z = 0.06;
        eyeGroup.add(scanline);
        eyeGroup.userData.scanline = scanline;

        // Corner markers - 4 small tech corners
        for (let i = 0; i < 4; i++) {
            const cornerGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.05);
            const cornerMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 2
            });
            const corner = new THREE.Mesh(cornerGeometry, cornerMaterial);
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            corner.position.x = Math.cos(angle) * 0.55;
            corner.position.y = Math.sin(angle) * 0.55;
            corner.position.z = 0.05;
            eyeGroup.add(corner);
        }

        eyeGroup.position.set(x, y, z);
        eyeGroup.userData.isFuturisticEye = true;
        return eyeGroup;
    };

    const leftEye = createFuturisticEye(-0.8, 3.5, 2);
    boss.add(leftEye);
    const rightEye = createFuturisticEye(0.8, 3.5, 2);
    boss.add(rightEye);

    // Dark Crown with spikes
    const crownBase = new THREE.CylinderGeometry(2.8, 3, 0.6, 8);
    const crownMaterial = new THREE.MeshLambertMaterial({
        color: 0x1a0000,
        emissive: 0x660000,
        emissiveIntensity: 0.5
    });
    const crown = new THREE.Mesh(crownBase, crownMaterial);
    crown.position.y = 5.5;
    boss.add(crown);

    // Crown spikes - 8 sharp points
    for (let i = 0; i < 8; i++) {
        const spikeGeometry = new THREE.ConeGeometry(0.3, 1.5, 4);
        const spike = new THREE.Mesh(spikeGeometry, crownMaterial);
        const angle = (i / 8) * Math.PI * 2;
        spike.position.set(
            Math.cos(angle) * 2.5,
            6.2,
            Math.sin(angle) * 2.5
        );
        spike.rotation.x = Math.PI;
        boss.add(spike);
    }

    // Dark Lord Body - imposing torso
    const bodyGeometry = new THREE.CylinderGeometry(2, 2.5, 4, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({
        color: 0x0f0000,
        emissive: 0x440000,
        emissiveIntensity: 0.6
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0;
    body.castShadow = true;
    boss.add(body);

    // Dark armor plating on body
    for (let i = 0; i < 6; i++) {
        const plateGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.3);
        const plateMaterial = new THREE.MeshLambertMaterial({
            color: 0x1a0000,
            emissive: 0x660000
        });
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        const angle = (i / 6) * Math.PI * 2;
        plate.position.set(
            Math.cos(angle) * 2.3,
            0.5 - i * 0.6,
            Math.sin(angle) * 2.3
        );
        plate.lookAt(0, 0.5 - i * 0.6, 0);
        boss.add(plate);
    }

    // Flowing dark cape/energy tendrils - 4 tendrils
    for (let i = 0; i < 4; i++) {
        const tendrilGeometry = new THREE.CylinderGeometry(0.3, 0.1, 4, 8);
        const tendrilMaterial = new THREE.MeshBasicMaterial({
            color: 0x0a0000,
            transparent: true,
            opacity: 0.7
        });
        const tendril = new THREE.Mesh(tendrilGeometry, tendrilMaterial);
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        tendril.position.set(
            Math.cos(angle) * 1.5,
            -2,
            Math.sin(angle) * 1.5
        );
        tendril.rotation.z = Math.cos(angle) * 0.3;
        tendril.rotation.x = Math.sin(angle) * 0.3;
        tendril.userData.isTendril = true;
        tendril.userData.baseAngle = angle;
        boss.add(tendril);
    }

    // Floating dark orbs - sources of dark power (8 orbs)
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const orbGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const orbMaterial = new THREE.MeshBasicMaterial({
            color: 0x440000,
            emissive: 0xff0000,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.8
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(Math.cos(angle) * 5, 2, Math.sin(angle) * 5);
        orb.userData.orbitAngle = angle;
        orb.userData.isDarkOrb = true;
        boss.add(orb);
    }

    // Menacing red/black wireframe aura
    const auraGeometry = new THREE.IcosahedronGeometry(6, 1);
    const auraMaterial = new THREE.MeshBasicMaterial({
        color: 0x330000,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    aura.position.y = 2;
    aura.userData.isAura = true;
    boss.add(aura);

    // Dark pulsating glow
    const glowGeometry = new THREE.SphereGeometry(5, 24, 24);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x220000,
        transparent: true,
        opacity: 0.1
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 2;
    boss.add(glow);

    game.scene.add(boss);
    game.boss = boss;
    game.bossSpawned = true;

    showNotification('⚠️ DARK CODE LORD APPEARED! 120 HP - The supreme ruler of corruption!');
    console.log('World 3 BOSS SPAWNED at', x, z);
}

// Create shield pickup
function createShieldPickup(x, z) {
    // Create shield group
    const shield = new THREE.Group();

    // Main shield body - hexagonal antivirus shield shape
    const shieldShape = new THREE.Shape();
    const radius = 1.2;
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) {
            shieldShape.moveTo(px, py);
        } else {
            shieldShape.lineTo(px, py);
        }
    }
    shieldShape.lineTo(Math.cos(0) * radius, Math.sin(0) * radius);

    const extrudeSettings = { depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 };
    const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    const shieldMaterial = new THREE.MeshLambertMaterial({
        color: 0x00ff88, // Bright cyan-green (antivirus color)
        emissive: 0x00aa55,
        emissiveIntensity: 0.5
    });
    const shieldBody = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shieldBody.rotation.y = Math.PI / 2; // Face sideways
    shieldBody.castShadow = true;

    // Checkmark symbol in center (virus protection symbol)
    const checkGroup = new THREE.Group();

    // First part of checkmark
    const check1Geometry = new THREE.BoxGeometry(0.15, 0.6, 0.15);
    const check1Material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1
    });
    const check1 = new THREE.Mesh(check1Geometry, check1Material);
    check1.rotation.z = -Math.PI / 4;
    check1.position.set(-0.2, -0.15, 0);

    // Second part of checkmark
    const check2Geometry = new THREE.BoxGeometry(0.15, 1.0, 0.15);
    const check2 = new THREE.Mesh(check2Geometry, check1Material);
    check2.rotation.z = Math.PI / 4;
    check2.position.set(0.3, 0.15, 0);

    checkGroup.add(check1);
    checkGroup.add(check2);
    checkGroup.rotation.y = Math.PI / 2; // Face sideways
    checkGroup.position.x = -0.2; // Adjust position for sideways orientation

    // Outer tech ring
    const ringGeometry = new THREE.TorusGeometry(1.5, 0.08, 8, 6);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.8,
        wireframe: true
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.y = Math.PI / 2; // Face sideways

    // Inner circular core
    const coreGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ddff,
        emissive: 0x00aaff,
        emissiveIntensity: 1
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.rotation.z = Math.PI / 2; // Face sideways

    shield.add(shieldBody);
    shield.add(checkGroup);
    shield.add(ring);
    shield.add(core);

    shield.position.set(x, 1.5, z);

    game.scene.add(shield);

    // Add bright glowing aura effect (antivirus protection field)
    const glowGeometry = new THREE.SphereGeometry(2.0, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.15
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    shield.add(glow);

    // Secondary inner glow
    const innerGlowGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.25
    });
    const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    shield.add(innerGlow);

    // Add to shields array
    game.shields.push(shield);
}

// Create bow pickup (Lunar Linux laser gun)
function createBowPickup(x, z) {
    // Create laser gun group
    game.bow = new THREE.Group();

    // Main gun body - sleek dark metallic
    const bodyGeometry = new THREE.BoxGeometry(0.4, 0.4, 1.5);
    const bodyMaterial = new THREE.MeshLambertMaterial({
        color: 0x2a2a3a, // Dark blue-gray metal
        emissive: 0x1a1a2a
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.position.z = 0.3;

    // Barrel - glowing cyan energy core
    const barrelGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1.0, 8);
    const barrelMaterial = new THREE.MeshLambertMaterial({
        color: 0x00ffff, // Bright cyan
        emissive: 0x00ffff,
        emissiveIntensity: 1
    });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = -0.5;
    barrel.castShadow = true;

    // Energy chamber - glowing green sphere
    const chamberGeometry = new THREE.SphereGeometry(0.25, 12, 12);
    const chamberMaterial = new THREE.MeshLambertMaterial({
        color: 0x00ff00, // Bright green energy
        emissive: 0x00ff00,
        emissiveIntensity: 1
    });
    const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial);
    chamber.position.z = 0.8;

    // Tech accent lines - yellow
    const accent1Geometry = new THREE.BoxGeometry(0.42, 0.05, 0.3);
    const accentMaterial = new THREE.MeshLambertMaterial({
        color: 0xffff00, // Yellow tech
        emissive: 0xffff00,
        emissiveIntensity: 0.8
    });
    const accent1 = new THREE.Mesh(accent1Geometry, accentMaterial);
    accent1.position.set(0, 0.15, 0.5);

    const accent2 = new THREE.Mesh(accent1Geometry, accentMaterial);
    accent2.position.set(0, -0.15, 0.5);

    // Handle/grip
    const gripGeometry = new THREE.BoxGeometry(0.25, 0.5, 0.4);
    const gripMaterial = new THREE.MeshLambertMaterial({
        color: 0x1a1a1a // Dark grip
    });
    const grip = new THREE.Mesh(gripGeometry, gripMaterial);
    grip.position.set(0, -0.35, 0.9);

    game.bow.add(body);
    game.bow.add(barrel);
    game.bow.add(chamber);
    game.bow.add(accent1);
    game.bow.add(accent2);
    game.bow.add(grip);

    game.bow.position.set(x, 1.5, z);
    game.bow.rotation.y = Math.PI / 4;
    game.bow.rotation.z = Math.PI / 2; // Rotate to horizontal

    game.scene.add(game.bow);

    // Add cyan/green glow effect
    const glowGeometry = new THREE.SphereGeometry(1.8, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff88, // Cyan-green glow
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    game.bow.add(glow);
}

// Create axe pickup
function createAxePickup(x, z) {
    // Create Virus Slicer group - futuristic energy axe
    game.axe = new THREE.Group();

    // Tech handle - dark metallic with cyan accents
    const handleGeometry = new THREE.CylinderGeometry(0.12, 0.08, 2.5, 8);
    const handleMaterial = new THREE.MeshLambertMaterial({
        color: 0x2a2a3a, // Dark blue-gray tech metal
        emissive: 0x1a1a2a
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.castShadow = true;
    game.axe.add(handle);

    // Energy core in handle
    const coreGeometry = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff, // Bright cyan energy core
        emissive: 0x00ffff,
        emissiveIntensity: 1
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    game.axe.add(core);

    // Energy blade - glowing cyan double-bladed axe head
    const blade1Geometry = new THREE.BoxGeometry(1.4, 0.6, 0.08);
    const bladeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff, // Bright cyan energy
        emissive: 0x00ffff,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.9
    });
    const blade1 = new THREE.Mesh(blade1Geometry, bladeMaterial);
    blade1.position.y = 1.3;
    blade1.position.x = 0.7;
    game.axe.add(blade1);

    const blade2 = new THREE.Mesh(blade1Geometry, bladeMaterial);
    blade2.position.y = 1.3;
    blade2.position.x = -0.7;
    game.axe.add(blade2);

    // Energy blade glow
    const bladeGlow1Geometry = new THREE.BoxGeometry(1.5, 0.7, 0.15);
    const bladeGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff88, // Green-cyan glow
        emissive: 0x00ff88,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.4
    });
    const bladeGlow1 = new THREE.Mesh(bladeGlow1Geometry, bladeGlowMaterial);
    bladeGlow1.position.y = 1.3;
    bladeGlow1.position.x = 0.7;
    game.axe.add(bladeGlow1);

    const bladeGlow2 = new THREE.Mesh(bladeGlow1Geometry, bladeGlowMaterial);
    bladeGlow2.position.y = 1.3;
    bladeGlow2.position.x = -0.7;
    game.axe.add(bladeGlow2);

    // Tech connector/emitter at blade junction
    const emitterGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const emitterMaterial = new THREE.MeshLambertMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.8
    });
    const emitter = new THREE.Mesh(emitterGeometry, emitterMaterial);
    emitter.position.y = 1.3;
    emitter.castShadow = true;
    game.axe.add(emitter);

    // Circuit patterns on handle (tech details)
    for (let i = 0; i < 4; i++) {
        const circuitGeometry = new THREE.TorusGeometry(0.14, 0.02, 8, 16);
        const circuitMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.8
        });
        const circuit = new THREE.Mesh(circuitGeometry, circuitMaterial);
        circuit.position.y = -0.8 + (i * 0.5);
        circuit.rotation.x = Math.PI / 2;
        game.axe.add(circuit);
    }

    game.axe.position.set(x, 1.5, z);
    game.axe.rotation.z = Math.PI / 6;

    game.scene.add(game.axe);

    // Cyan/green energy glow effect
    const glowGeometry = new THREE.SphereGeometry(1.8, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffaa,
        transparent: true,
        opacity: 0.25
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    game.axe.add(glow);

    console.log('Virus Slicer created at', x, z);
}

// Create food pickup
function createFoodPickup(x, z) {
    // Create code pickup - looks like a piece of code
    const food = new THREE.Group();

    // Code background - flat rectangular plane
    const codeBackgroundGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.1);
    const codeBackgroundMaterial = new THREE.MeshLambertMaterial({
        color: 0x1e1e1e, // Dark gray/black (like code editor background)
        emissive: 0x0a0a0a
    });
    const codeBackground = new THREE.Mesh(codeBackgroundGeometry, codeBackgroundMaterial);
    codeBackground.castShadow = true;

    // Code lines - bright green/cyan bars representing lines of code
    const createCodeLine = (yPos, width) => {
        const lineGeometry = new THREE.BoxGeometry(width, 0.08, 0.12);
        const lineMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00, // Bright green (classic code color)
            emissive: 0x00ff00,
            emissiveIntensity: 0.8
        });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.y = yPos;
        line.position.x = -0.6 + width / 2;
        return line;
    };

    // Multiple code lines at different lengths
    const line1 = createCodeLine(0.25, 0.9);
    const line2 = createCodeLine(0.1, 1.0);
    const line3 = createCodeLine(-0.05, 0.7);
    const line4 = createCodeLine(-0.2, 0.85);

    // Curly braces - code symbols
    const createBrace = (xPos, yPos, rotation) => {
        const braceGeometry = new THREE.TorusGeometry(0.15, 0.04, 8, 6, Math.PI);
        const braceMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00, // Yellow braces
            emissive: 0xffff00,
            emissiveIntensity: 1
        });
        const brace = new THREE.Mesh(braceGeometry, braceMaterial);
        brace.position.set(xPos, yPos, 0.06);
        brace.rotation.z = rotation;
        return brace;
    };

    const leftBrace = createBrace(-0.5, 0, Math.PI / 2);
    const rightBrace = createBrace(0.5, 0, -Math.PI / 2);

    food.add(codeBackground);
    food.add(line1);
    food.add(line2);
    food.add(line3);
    food.add(line4);
    food.add(leftBrace);
    food.add(rightBrace);

    food.position.set(x, 1, z);

    game.scene.add(food);

    // Add green/cyan glow effect (code aura)
    const glowGeometry = new THREE.SphereGeometry(1.2, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    food.add(glow);

    game.foods.push(food);
}

// Create chunky code pickup
function createRedPotionPickup(x, z) {
    // Create chunky code group
    const potion = new THREE.Group();

    // Main code chunk - large dark block (bigger than regular code)
    const chunkGeometry = new THREE.BoxGeometry(1.5, 1.2, 0.15);
    const chunkMaterial = new THREE.MeshLambertMaterial({
        color: 0x0a0a0a, // Very dark gray/black (code editor background)
        emissive: 0x0a0a0a
    });
    const chunk = new THREE.Mesh(chunkGeometry, chunkMaterial);
    chunk.castShadow = true;

    // Chunky code lines - bright purple/magenta (indicating special/rare code)
    const createCodeLine = (yPos, width) => {
        const lineGeometry = new THREE.BoxGeometry(width, 0.12, 0.16);
        const lineMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff, // Bright magenta (rare code color)
            emissive: 0xff00ff,
            emissiveIntensity: 1
        });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.y = yPos;
        line.position.x = -0.75 + width / 2;
        return line;
    };

    // Multiple chunky code lines
    const line1 = createCodeLine(0.4, 1.3);
    const line2 = createCodeLine(0.2, 1.4);
    const line3 = createCodeLine(0, 1.2);
    const line4 = createCodeLine(-0.2, 1.35);
    const line5 = createCodeLine(-0.4, 1.1);

    // Special symbols - bright cyan brackets/braces
    const createSymbol = (xPos, yPos, symbol) => {
        const symbolGeometry = new THREE.TorusGeometry(0.15, 0.05, 8, 6, Math.PI);
        const symbolMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff, // Cyan symbols
            emissive: 0x00ffff,
            emissiveIntensity: 1
        });
        const sym = new THREE.Mesh(symbolGeometry, symbolMaterial);
        sym.position.set(xPos, yPos, 0.08);
        sym.rotation.z = symbol === 'left' ? Math.PI / 2 : -Math.PI / 2;
        return sym;
    };

    const leftBrace = createSymbol(-0.7, 0, 'left');
    const rightBrace = createSymbol(0.7, 0, 'right');

    // Corner markers - yellow tech indicators
    for (let i = 0; i < 4; i++) {
        const markerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.08);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00, // Yellow
            emissive: 0xffff00,
            emissiveIntensity: 1
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        const xPos = i < 2 ? -0.7 : 0.7;
        const yPos = i % 2 === 0 ? 0.55 : -0.55;
        marker.position.set(xPos, yPos, 0.08);
        potion.add(marker);
    }

    potion.add(chunk);
    potion.add(line1);
    potion.add(line2);
    potion.add(line3);
    potion.add(line4);
    potion.add(line5);
    potion.add(leftBrace);
    potion.add(rightBrace);

    potion.position.set(x, 1.2, z);
    potion.rotation.y = Math.PI / 4; // Slight angle

    game.scene.add(potion);

    // Add magenta/purple glow effect (rare/special code aura)
    const glowGeometry = new THREE.SphereGeometry(1.8, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff00ff, // Magenta glow
        transparent: true,
        opacity: 0.25
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    potion.add(glow);

    game.redPotions.push(potion);
    console.log('Chunky code created at', x, z);
}

// Create dev book pickup
function createSpellBook(x, z) {
    game.spellBook = new THREE.Group();

    // Book - rectangular shape (normal everyday book)
    const bookGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.15);
    const bookMaterial = new THREE.MeshLambertMaterial({
        color: 0x1a3a5c, // Dark blue (like tech/programming books)
        emissive: 0x0a1a2c
    });
    const book = new THREE.Mesh(bookGeometry, bookMaterial);
    book.castShadow = true;
    game.spellBook.add(book);

    // Book cover - title text lines (simulating book title)
    const titleLineGeometry1 = new THREE.BoxGeometry(0.45, 0.08, 0.001);
    const titleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff // White text
    });
    const titleLine1 = new THREE.Mesh(titleLineGeometry1, titleMaterial);
    titleLine1.position.set(0, 0.2, 0.076);
    game.spellBook.add(titleLine1);

    const titleLineGeometry2 = new THREE.BoxGeometry(0.4, 0.06, 0.001);
    const titleLine2 = new THREE.Mesh(titleLineGeometry2, titleMaterial);
    titleLine2.position.set(0, 0.08, 0.076);
    game.spellBook.add(titleLine2);

    // Subtitle line
    const subtitleGeometry = new THREE.BoxGeometry(0.35, 0.04, 0.001);
    const subtitleLine = new THREE.Mesh(subtitleGeometry, titleMaterial);
    subtitleLine.position.set(0, -0.05, 0.076);
    game.spellBook.add(subtitleLine);

    // Author line at bottom
    const authorGeometry = new THREE.BoxGeometry(0.25, 0.03, 0.001);
    const authorLine = new THREE.Mesh(authorGeometry, titleMaterial);
    authorLine.position.set(0, -0.3, 0.076);
    game.spellBook.add(authorLine);

    // Book spine (darker edge)
    const spineGeometry = new THREE.BoxGeometry(0.15, 0.8, 0.001);
    const spineMaterial = new THREE.MeshLambertMaterial({
        color: 0x0f2540 // Darker blue for spine
    });
    const spine = new THREE.Mesh(spineGeometry, spineMaterial);
    spine.position.set(-0.3, 0, 0);
    spine.rotation.y = Math.PI / 2;
    game.spellBook.add(spine);

    game.spellBook.position.set(x, 1.5, z);
    game.spellBook.rotation.y = Math.PI / 4;

    game.scene.add(game.spellBook);

    console.log('Dev book created at', x, z);
}

// Create shop at edge of map
function createShop(x, z) {
    game.shop = new THREE.Group();

    // Wormhole dimensions - 5 units long
    const wormholeLength = 5;
    const numRings = 15;
    const startRadius = 4;
    const endRadius = 0.5;

    // Create swirling rings forming the wormhole tunnel
    for (let i = 0; i < numRings; i++) {
        const progress = i / (numRings - 1);

        // Calculate ring position along the tunnel (0 to 5 units)
        const zPos = progress * wormholeLength;

        // Ring radius decreases as we go deeper
        const radius = startRadius - (startRadius - endRadius) * progress;

        // Create torus ring
        const ringGeometry = new THREE.TorusGeometry(radius, 0.15, 8, 32);

        // Alternate colors for cosmic effect - purple to cyan gradient
        const hue = 0.7 - progress * 0.15; // Purple (0.7) to cyan (0.55)
        const color = new THREE.Color().setHSL(hue, 1, 0.5);

        const ringMaterial = new THREE.MeshBasicMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.7 - progress * 0.3 // Fade as it goes deeper
        });

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.z = zPos;

        // Rotate ring for spiral effect
        ring.rotation.z = progress * Math.PI * 2;

        // Store animation data
        ring.userData.rotationSpeed = 0.5 + progress * 0.5;
        ring.userData.initialRotation = ring.rotation.z;

        game.shop.add(ring);
    }

    // Create glowing particles inside the wormhole
    for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distanceFromCenter = Math.random() * 3;
        const depth = Math.random() * wormholeLength;

        const particleGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const particleColor = Math.random() > 0.5 ? 0x00ffff : 0xff00ff; // Cyan or magenta
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: particleColor,
            emissive: particleColor,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.8
        });

        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.x = Math.cos(angle) * distanceFromCenter;
        particle.position.y = Math.sin(angle) * distanceFromCenter;
        particle.position.z = depth;

        // Store animation data
        particle.userData.angle = angle;
        particle.userData.radius = distanceFromCenter;
        particle.userData.depth = depth;
        particle.userData.speed = 0.5 + Math.random() * 1.0;

        game.shop.add(particle);
    }

    // Central core - dark void with bright edge
    const coreGeometry = new THREE.CylinderGeometry(startRadius * 0.9, endRadius * 0.9, wormholeLength, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x000033, // Very dark blue
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.rotation.x = Math.PI / 2;
    core.position.z = wormholeLength / 2;
    game.shop.add(core);

    // Outer glow - bright edge at entrance
    const glowGeometry = new THREE.TorusGeometry(startRadius + 0.3, 0.4, 8, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.6
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.z = 0;
    game.shop.add(glow);

    // Position wormhole angled into the ground with entrance poking out
    game.shop.position.set(x, 1.5, z);
    game.shop.rotation.x = Math.PI * 0.4; // Tilt 72 degrees into the ground
    game.shop.rotation.y = Math.PI; // Face toward center of map

    game.scene.add(game.shop);

    // Create invisible collision box (same size as before for shop interaction)
    const collisionBox = new THREE.Mesh(
        new THREE.BoxGeometry(12, 8, 10),
        new THREE.MeshBasicMaterial({ visible: false })
    );
    collisionBox.position.set(x, 4, z);
    game.scene.add(collisionBox);
    game.objects.push(collisionBox);

    console.log('Wormhole shop created at', x, z);
}

// Initialize inventory system
function initInventory() {
    updateInventoryUI();
}

// Update inventory UI
function updateInventoryUI() {
    const inventoryItems = document.getElementById('inventoryItems');
    inventoryItems.innerHTML = '';

    // Sword slot (always present)
    const swordSlot = document.createElement('div');
    swordSlot.className = 'inventory-slot';
    if (game.inventory.equippedSword) {
        swordSlot.classList.add('equipped');
    }
    swordSlot.innerHTML = `
        <div class="item-icon">⚔️</div>
        <div class="item-name">Virus Destroyer</div>
        ${game.inventory.equippedSword ? '<div class="item-status">EQUIPPED</div>' : ''}
    `;
    swordSlot.addEventListener('click', () => toggleEquipSword());
    inventoryItems.appendChild(swordSlot);

    // Shield slot
    const shieldSlot = document.createElement('div');
    shieldSlot.className = 'inventory-slot';
    if (game.shieldCount > 0) {
        if (game.inventory.equippedShield) {
            shieldSlot.classList.add('equipped');
        }
        shieldSlot.innerHTML = `
            <div class="item-icon">🛡️</div>
            <div class="item-name">Anti Virus x${game.shieldCount}</div>
            ${game.inventory.equippedShield ? '<div class="item-status">EQUIPPED</div>' : ''}
        `;
        shieldSlot.addEventListener('click', () => toggleEquipItem({type: 'shield'}));
    } else {
        shieldSlot.classList.add('empty');
        shieldSlot.innerHTML = '<div class="item-icon">—</div><div class="item-name">Empty</div>';
    }
    inventoryItems.appendChild(shieldSlot);

    // Food slot
    const foodSlot = document.createElement('div');
    foodSlot.className = 'inventory-slot';
    if (game.foodCount > 0) {
        foodSlot.innerHTML = `
            <div class="item-icon">💻</div>
            <div class="item-name">Code x${game.foodCount}</div>
        `;
        foodSlot.addEventListener('click', () => toggleEquipItem({type: 'food'}));
    } else {
        foodSlot.classList.add('empty');
        foodSlot.innerHTML = '<div class="item-icon">—</div><div class="item-name">Empty</div>';
    }
    inventoryItems.appendChild(foodSlot);

    // Chunky Code slot
    const potionSlot = document.createElement('div');
    potionSlot.className = 'inventory-slot';
    if (game.redPotionCount > 0) {
        potionSlot.innerHTML = `
            <div class="item-icon">💾</div>
            <div class="item-name">Chunky Code x${game.redPotionCount}</div>
        `;
        potionSlot.addEventListener('click', () => toggleEquipItem({type: 'redpotion'}));
    } else {
        potionSlot.classList.add('empty');
        potionSlot.innerHTML = '<div class="item-icon">—</div><div class="item-name">Empty</div>';
    }
    inventoryItems.appendChild(potionSlot);

    // Bow slot
    const bowSlot = document.createElement('div');
    bowSlot.className = 'inventory-slot';
    if (game.bowCollected) {
        if (game.equippedBow) {
            bowSlot.classList.add('equipped');
        }
        bowSlot.innerHTML = `
            <div class="item-icon">🔫</div>
            <div class="item-name">Lunar Linux</div>
            ${game.equippedBow ? '<div class="item-status">EQUIPPED</div>' : ''}
        `;
        bowSlot.addEventListener('click', () => toggleEquipItem({type: 'bow'}));
    } else {
        bowSlot.classList.add('empty');
        bowSlot.innerHTML = '<div class="item-icon">—</div><div class="item-name">Empty</div>';
    }
    inventoryItems.appendChild(bowSlot);

    // Axe slot
    const axeSlot = document.createElement('div');
    axeSlot.className = 'inventory-slot';
    if (game.axeCollected) {
        if (game.equippedAxe) {
            axeSlot.classList.add('equipped');
        }
        axeSlot.innerHTML = `
            <div class="item-icon">🪓</div>
            <div class="item-name">Virus Slicer</div>
            ${game.equippedAxe ? '<div class="item-status">EQUIPPED</div>' : ''}
        `;
        axeSlot.addEventListener('click', () => toggleEquipItem({type: 'axe'}));
    } else {
        axeSlot.classList.add('empty');
        axeSlot.innerHTML = '<div class="item-icon">—</div><div class="item-name">Empty</div>';
    }
    inventoryItems.appendChild(axeSlot);

    // Dev Book slot
    const spellBookSlot = document.createElement('div');
    spellBookSlot.className = 'inventory-slot';
    if (game.spellBookCollected) {
        if (game.equippedSpellBook) {
            spellBookSlot.classList.add('equipped');
        }
        spellBookSlot.innerHTML = `
            <div class="item-icon">📖</div>
            <div class="item-name">Dev Book</div>
            ${game.equippedSpellBook ? '<div class="item-status">EQUIPPED</div>' : ''}
        `;
        spellBookSlot.addEventListener('click', () => toggleEquipItem({type: 'spellbook'}));
    } else {
        spellBookSlot.classList.add('empty');
        spellBookSlot.innerHTML = '<div class="item-icon">—</div><div class="item-name">Empty</div>';
    }
    inventoryItems.appendChild(spellBookSlot);

    // Empty slots (6 total for future items)
    for (let i = 0; i < 6; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot empty';
        slot.innerHTML = '<div class="item-icon">—</div><div class="item-name">Empty</div>';
        inventoryItems.appendChild(slot);
    }
}

// Update equipped item displays at bottom of screen
function updateEquippedDisplays() {
    const shieldDisplay = document.getElementById('equippedShieldDisplay');
    const weaponDisplay = document.getElementById('equippedWeaponDisplay');

    // Update shield display
    if (game.inventory.equippedShield && game.shieldCount > 0) {
        shieldDisplay.classList.add('active');
    } else {
        shieldDisplay.classList.remove('active');
    }

    // Update weapon/spellbook display
    const weaponIcon = weaponDisplay.querySelector('.icon');
    const weaponLabel = weaponDisplay.querySelector('.label');

    if (game.inventory.equippedSword) {
        weaponIcon.textContent = '⚔️';
        weaponLabel.textContent = 'Virus Destroyer';
        weaponDisplay.classList.add('active');
    } else if (game.equippedBow) {
        weaponIcon.textContent = '🔫';
        weaponLabel.textContent = 'Lunar Linux';
        weaponDisplay.classList.add('active');
    } else if (game.equippedAxe) {
        weaponIcon.textContent = '🪓';
        weaponLabel.textContent = 'Virus Slicer';
        weaponDisplay.classList.add('active');
    } else if (game.equippedSpellBook) {
        weaponIcon.textContent = '📖';
        weaponLabel.textContent = 'Dev Book';
        weaponDisplay.classList.add('active');
    } else {
        weaponDisplay.classList.remove('active');
    }
}

// Toggle equip sword
function toggleEquipSword() {
    if (game.inventory.equippedSword) {
        // Unequip sword
        game.inventory.equippedSword = false;
        if (game.equippedSwordMesh) {
            game.camera.remove(game.equippedSwordMesh);
            game.equippedSwordMesh = null;
        }
    } else {
        // Equip sword - unequip bow and dev book first if equipped
        if (game.equippedBow) {
            game.equippedBow = false;
            if (game.equippedBowMesh) {
                game.camera.remove(game.equippedBowMesh);
                game.equippedBowMesh = null;
            }
        }
        if (game.equippedSpellBook) {
            game.equippedSpellBook = false;
            if (game.equippedSpellBookMesh) {
                game.camera.remove(game.equippedSpellBookMesh);
                game.equippedSpellBookMesh = null;
            }
            // Hide mana display
            const manaDisplay = document.getElementById('manaDisplay');
            if (manaDisplay) {
                manaDisplay.style.display = 'none';
            }
        }
        game.inventory.equippedSword = true;
        equipSword();
    }
    updateInventoryUI();
    updateEquippedDisplays();
    toggleInventory(); // Close inventory after equipping
}

// Remove item from inventory
function removeItemFromInventory(itemType) {
    if (itemType === 'shield' && game.shieldCount > 0) {
        game.shieldCount--;
        // If no more shields, unequip
        if (game.shieldCount === 0) {
            game.inventory.equippedShield = false;
            updateEquippedDisplays();
        }
        updateInventoryUI();
    } else if (itemType === 'food' && game.foodCount > 0) {
        game.foodCount--;
        updateInventoryUI();
    } else if (itemType === 'redpotion' && game.redPotionCount > 0) {
        game.redPotionCount--;
        updateInventoryUI();
    }
}

// Toggle equip item (for shield, bow and other items)
function toggleEquipItem(item) {
    if (item.type === 'shield') {
        if (game.shieldCount === 0) return; // No shields to equip

        if (game.inventory.equippedShield) {
            // Unequip shield
            game.inventory.equippedShield = false;
            game.hasShieldProtection = false;
        } else {
            // Equip shield
            game.inventory.equippedShield = true;
            game.hasShieldProtection = true;
        }
        updateInventoryUI();
        updateEquippedDisplays();
        toggleInventory(); // Close inventory after equipping
    } else if (item.type === 'bow') {
        if (game.equippedBow) {
            // Unequip bow
            game.equippedBow = false;
            if (game.equippedBowMesh) {
                game.camera.remove(game.equippedBowMesh);
                game.equippedBowMesh = null;
            }
            // Re-equip sword
            game.inventory.equippedSword = true;
            equipSword();
        } else {
            // Equip bow - unequip sword, axe, and dev book first
            game.equippedBow = true;
            game.inventory.equippedSword = false;
            if (game.equippedSwordMesh) {
                game.camera.remove(game.equippedSwordMesh);
                game.equippedSwordMesh = null;
            }
            game.equippedAxe = false;
            if (game.equippedAxeMesh) {
                game.camera.remove(game.equippedAxeMesh);
                game.equippedAxeMesh = null;
            }
            if (game.equippedSpellBook) {
                game.equippedSpellBook = false;
                if (game.equippedSpellBookMesh) {
                    game.camera.remove(game.equippedSpellBookMesh);
                    game.equippedSpellBookMesh = null;
                }
                // Hide mana display
                const manaDisplay = document.getElementById('manaDisplay');
                if (manaDisplay) {
                    manaDisplay.style.display = 'none';
                }
            }
            equipBow();
        }
        updateInventoryUI();
        updateEquippedDisplays();
        toggleInventory(); // Close inventory after equipping
    } else if (item.type === 'axe') {
        if (game.equippedAxe) {
            // Unequip axe
            game.equippedAxe = false;
            if (game.equippedAxeMesh) {
                game.camera.remove(game.equippedAxeMesh);
                game.equippedAxeMesh = null;
            }
            // Re-equip sword
            game.inventory.equippedSword = true;
            equipSword();
        } else {
            // Equip axe - unequip sword, bow and dev book first
            game.equippedAxe = true;
            game.inventory.equippedSword = false;
            if (game.equippedSwordMesh) {
                game.camera.remove(game.equippedSwordMesh);
                game.equippedSwordMesh = null;
            }
            game.equippedBow = false;
            if (game.equippedBowMesh) {
                game.camera.remove(game.equippedBowMesh);
                game.equippedBowMesh = null;
            }
            if (game.equippedSpellBook) {
                game.equippedSpellBook = false;
                if (game.equippedSpellBookMesh) {
                    game.camera.remove(game.equippedSpellBookMesh);
                    game.equippedSpellBookMesh = null;
                }
                // Hide mana display
                const manaDisplay = document.getElementById('manaDisplay');
                if (manaDisplay) {
                    manaDisplay.style.display = 'none';
                }
            }
            equipAxe();
        }
        updateInventoryUI();
        updateEquippedDisplays();
        toggleInventory(); // Close inventory after equipping
    } else if (item.type === 'food') {
        // Use food - heal 10 HP
        if (game.foodCount > 0) {
            const healAmount = 10;
            const previousHP = game.playerHP;
            game.playerHP = Math.min(game.playerHP + healAmount, game.maxPlayerHP);
            const actualHeal = game.playerHP - previousHP;

            updateHPDisplay();

            // Remove food from inventory
            removeItemFromInventory('food');

            showNotification(`💻 Code consumed! Healed ${actualHeal} HP (${game.playerHP}/${game.maxPlayerHP}) | ${game.foodCount} remaining`);
            toggleInventory(); // Close inventory after using
        }
    } else if (item.type === 'redpotion') {
        // Use chunky code - heal 100 HP!
        if (game.redPotionCount > 0) {
            const healAmount = 100;
            const previousHP = game.playerHP;
            game.playerHP = Math.min(game.playerHP + healAmount, game.maxPlayerHP);
            const actualHeal = game.playerHP - previousHP;

            updateHPDisplay();

            // Remove chunky code from inventory
            removeItemFromInventory('redpotion');

            showNotification(`💾 Chunky Code consumed! Healed ${actualHeal} HP (${game.playerHP}/${game.maxPlayerHP}) | ${game.redPotionCount} remaining`);
            toggleInventory(); // Close inventory after using
        }
    } else if (item.type === 'spellbook') {
        if (!game.spellBookCollected) return; // No dev book to equip

        if (game.equippedSpellBook) {
            // Unequip dev book
            game.equippedSpellBook = false;
            if (game.equippedSpellBookMesh) {
                game.camera.remove(game.equippedSpellBookMesh);
                game.equippedSpellBookMesh = null;
            }
            // Hide mana display
            const manaDisplay = document.getElementById('manaDisplay');
            if (manaDisplay) {
                manaDisplay.style.display = 'none';
            }
            // Hide spell UI
            updateSpellUI();
            // Re-equip sword
            game.inventory.equippedSword = true;
            equipSword();
        } else {
            // Equip dev book - unequip sword, bow, and axe first
            game.equippedSpellBook = true;
            game.inventory.equippedSword = false;
            if (game.equippedSwordMesh) {
                game.camera.remove(game.equippedSwordMesh);
                game.equippedSwordMesh = null;
            }
            game.equippedBow = false;
            if (game.equippedBowMesh) {
                game.camera.remove(game.equippedBowMesh);
                game.equippedBowMesh = null;
            }
            game.equippedAxe = false;
            if (game.equippedAxeMesh) {
                game.camera.remove(game.equippedAxeMesh);
                game.equippedAxeMesh = null;
            }
            equipSpellBook();
        }
        updateInventoryUI();
        updateEquippedDisplays();
        toggleInventory(); // Close inventory after equipping
    }
}

// Equip sword to player
function equipSword() {
    // Remove old sword if exists
    if (game.equippedSwordMesh) {
        game.camera.remove(game.equippedSwordMesh);
    }

    // Create sword mesh for first person view
    game.equippedSwordMesh = new THREE.Group();

    // ARM - visible in camera view
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.8, 8);
    const armMaterial = new THREE.MeshBasicMaterial({
        color: 0xffdbac, // Skin tone
        side: THREE.DoubleSide,
        depthTest: false, // Always render on top
        depthWrite: false
    });
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.position.set(0.2, -0.5, -0.2);
    arm.rotation.z = -0.2;
    arm.renderOrder = 999; // Render last

    // Hand/fist
    const handGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const hand = new THREE.Mesh(handGeometry, armMaterial);
    hand.position.set(0.15, -0.8, -0.1);
    hand.renderOrder = 999;

    // Virus Destroyer Blade - bright cyan energy blade
    const bladeGeometry = new THREE.BoxGeometry(0.2, 2.5, 0.05);
    const bladeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff, // Bright cyan (antivirus color)
        emissive: 0x00ffff,
        emissiveIntensity: 1,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.set(0, 0.8, -0.1);
    blade.renderOrder = 999;

    // Energy glow around blade
    const bladeGlowGeometry = new THREE.BoxGeometry(0.25, 2.6, 0.1);
    const bladeGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false
    });
    const bladeGlow = new THREE.Mesh(bladeGlowGeometry, bladeGlowMaterial);
    bladeGlow.position.set(0, 0.8, -0.1);
    bladeGlow.renderOrder = 998;

    // Handle - dark tech grip with green accents
    const handleGeometry = new THREE.BoxGeometry(0.12, 0.5, 0.12);
    const handleMaterial = new THREE.MeshBasicMaterial({
        color: 0x1a1a1a, // Dark gray/black tech
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0, -0.5, -0.1);
    handle.renderOrder = 999;

    // Handle accents - green tech lines
    const accentGeometry = new THREE.BoxGeometry(0.13, 0.08, 0.13);
    const accentMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        emissive: 0x00ff00,
        emissiveIntensity: 1,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false
    });
    const accent1 = new THREE.Mesh(accentGeometry, accentMaterial);
    accent1.position.set(0, -0.35, -0.1);
    accent1.renderOrder = 999;
    const accent2 = new THREE.Mesh(accentGeometry, accentMaterial);
    accent2.position.set(0, -0.65, -0.1);
    accent2.renderOrder = 999;

    // Guard - futuristic hexagonal guard
    const guardGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.15);
    const guardMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ddff, // Cyan tech
        emissive: 0x00aaff,
        emissiveIntensity: 0.8,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false
    });
    const guard = new THREE.Mesh(guardGeometry, guardMaterial);
    guard.position.set(0, -0.25, -0.1);
    guard.renderOrder = 999;

    // Pommel - glowing energy core
    const pommelGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const pommelMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00, // Bright green energy core
        emissive: 0x00ff00,
        emissiveIntensity: 1,
        depthTest: false,
        depthWrite: false
    });
    const pommel = new THREE.Mesh(pommelGeometry, pommelMaterial);
    pommel.position.set(0, -0.75, -0.1);
    pommel.renderOrder = 999;

    game.equippedSwordMesh.add(arm);
    game.equippedSwordMesh.add(hand);
    game.equippedSwordMesh.add(bladeGlow);
    game.equippedSwordMesh.add(blade);
    game.equippedSwordMesh.add(handle);
    game.equippedSwordMesh.add(accent1);
    game.equippedSwordMesh.add(accent2);
    game.equippedSwordMesh.add(guard);
    game.equippedSwordMesh.add(pommel);

    // Position virus destroyer with arm clearly visible in camera view (right side)
    game.equippedSwordMesh.position.set(0.3, -0.3, -0.5);
    game.equippedSwordMesh.rotation.set(-0.2, 0.1, 0.05);

    // Disable frustum culling for all parts to ensure they're always rendered
    arm.frustumCulled = false;
    hand.frustumCulled = false;
    bladeGlow.frustumCulled = false;
    blade.frustumCulled = false;
    handle.frustumCulled = false;
    accent1.frustumCulled = false;
    accent2.frustumCulled = false;
    guard.frustumCulled = false;
    pommel.frustumCulled = false;
    game.equippedSwordMesh.frustumCulled = false;

    // Add to camera so it moves with player's view
    game.camera.add(game.equippedSwordMesh);

    console.log('✓ Virus Destroyer with arm equipped successfully');
    console.log('  Position:', game.equippedSwordMesh.position);
    console.log('  Rotation:', game.equippedSwordMesh.rotation);
    console.log('  Visible:', game.equippedSwordMesh.visible);
}

// Equip bow to player
function equipBow() {
    // Remove old bow if exists
    if (game.equippedBowMesh) {
        game.camera.remove(game.equippedBowMesh);
    }

    // Create laser gun mesh for first person view (Lunar Linux)
    game.equippedBowMesh = new THREE.Group();

    // Main gun body - sleek metallic
    const bodyGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.8);
    const bodyMaterial = new THREE.MeshBasicMaterial({
        color: 0x2a2a3a, // Dark blue-gray metal
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(-0.2, -0.05, -0.3);
    body.renderOrder = 999;

    // Barrel - glowing cyan energy core
    const barrelGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
    const barrelMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff, // Bright cyan
        emissive: 0x00ffff,
        emissiveIntensity: 1,
        depthTest: false,
        depthWrite: false
    });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.position.set(-0.2, -0.05, -0.7);
    barrel.rotation.x = Math.PI / 2;
    barrel.renderOrder = 999;

    // Barrel glow
    const barrelGlowGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8);
    const barrelGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.4,
        depthTest: false,
        depthWrite: false
    });
    const barrelGlow = new THREE.Mesh(barrelGlowGeometry, barrelGlowMaterial);
    barrelGlow.position.set(-0.2, -0.05, -0.7);
    barrelGlow.rotation.x = Math.PI / 2;
    barrelGlow.renderOrder = 998;

    // Energy chamber - glowing green core
    const chamberGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const chamberMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00, // Bright green energy
        emissive: 0x00ff00,
        emissiveIntensity: 1,
        depthTest: false,
        depthWrite: false
    });
    const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial);
    chamber.position.set(-0.2, -0.05, -0.1);
    chamber.renderOrder = 999;

    // Tech accents - yellow lines
    const accentGeometry = new THREE.BoxGeometry(0.16, 0.02, 0.1);
    const accentMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00, // Yellow tech lines
        emissive: 0xffff00,
        emissiveIntensity: 0.8,
        depthTest: false,
        depthWrite: false
    });
    const accent1 = new THREE.Mesh(accentGeometry, accentMaterial);
    accent1.position.set(-0.2, 0.03, -0.2);
    accent1.renderOrder = 999;

    const accent2 = new THREE.Mesh(accentGeometry, accentMaterial);
    accent2.position.set(-0.2, -0.13, -0.2);
    accent2.renderOrder = 999;

    // Handle/grip
    const gripGeometry = new THREE.BoxGeometry(0.1, 0.25, 0.15);
    const gripMaterial = new THREE.MeshBasicMaterial({
        color: 0x1a1a1a, // Dark grip
        depthTest: false,
        depthWrite: false
    });
    const grip = new THREE.Mesh(gripGeometry, gripMaterial);
    grip.position.set(-0.2, -0.2, 0.05);
    grip.renderOrder = 999;

    game.equippedBowMesh.add(body);
    game.equippedBowMesh.add(barrelGlow);
    game.equippedBowMesh.add(barrel);
    game.equippedBowMesh.add(chamber);
    game.equippedBowMesh.add(accent1);
    game.equippedBowMesh.add(accent2);
    game.equippedBowMesh.add(grip);

    // Position laser gun in left side of view
    game.equippedBowMesh.position.set(-0.3, -0.2, -0.5);
    game.equippedBowMesh.rotation.set(0, 0.2, 0);

    // Disable frustum culling
    body.frustumCulled = false;
    barrel.frustumCulled = false;
    barrelGlow.frustumCulled = false;
    chamber.frustumCulled = false;
    accent1.frustumCulled = false;
    accent2.frustumCulled = false;
    grip.frustumCulled = false;
    game.equippedBowMesh.frustumCulled = false;

    // Add to camera
    game.camera.add(game.equippedBowMesh);

    console.log('✓ Lunar Linux laser gun equipped successfully');
}

// Equip axe to player
function equipAxe() {
    // Remove old axe if exists
    if (game.equippedAxeMesh) {
        game.camera.remove(game.equippedAxeMesh);
    }

    // Create Virus Slicer mesh for first person view - futuristic energy axe
    game.equippedAxeMesh = new THREE.Group();

    // Tech handle - dark metallic
    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.04, 1.2, 8);
    const handleMaterial = new THREE.MeshBasicMaterial({
        color: 0x2a2a3a, // Dark blue-gray tech metal
        depthTest: false,
        depthWrite: false
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0, 0.3, 0);
    handle.rotation.z = Math.PI / 2;
    handle.renderOrder = 999;

    // Energy core in handle (glowing cyan)
    const coreGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 1,
        depthTest: false,
        depthWrite: false
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.set(0, 0.3, 0);
    core.rotation.z = Math.PI / 2;
    core.renderOrder = 999;

    // Energy blade 1 - bright cyan
    const blade1Geometry = new THREE.BoxGeometry(0.7, 0.3, 0.04);
    const bladeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
        depthWrite: false
    });
    const blade1 = new THREE.Mesh(blade1Geometry, bladeMaterial);
    blade1.position.set(0.6, 0.5, 0);
    blade1.renderOrder = 999;

    // Energy blade 2 (opposite side)
    const blade2 = new THREE.Mesh(blade1Geometry, bladeMaterial);
    blade2.position.set(0.6, 0.1, 0);
    blade2.renderOrder = 999;

    // Blade glow 1
    const bladeGlow1Geometry = new THREE.BoxGeometry(0.75, 0.35, 0.08);
    const bladeGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.4,
        depthTest: false,
        depthWrite: false
    });
    const bladeGlow1 = new THREE.Mesh(bladeGlow1Geometry, bladeGlowMaterial);
    bladeGlow1.position.set(0.6, 0.5, 0);
    bladeGlow1.renderOrder = 998;

    // Blade glow 2
    const bladeGlow2 = new THREE.Mesh(bladeGlow1Geometry, bladeGlowMaterial);
    bladeGlow2.position.set(0.6, 0.1, 0);
    bladeGlow2.renderOrder = 998;

    // Tech emitter at blade junction
    const emitterGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const emitterMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 1,
        depthTest: false,
        depthWrite: false
    });
    const emitter = new THREE.Mesh(emitterGeometry, emitterMaterial);
    emitter.position.set(0.25, 0.3, 0);
    emitter.renderOrder = 1000;

    // Circuit rings on handle
    for (let i = 0; i < 2; i++) {
        const circuitGeometry = new THREE.TorusGeometry(0.06, 0.01, 8, 16);
        const circuitMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 1,
            depthTest: false,
            depthWrite: false
        });
        const circuit = new THREE.Mesh(circuitGeometry, circuitMaterial);
        circuit.position.set(0, 0.3 - (i * 0.3), 0);
        circuit.renderOrder = 1000;
        game.equippedAxeMesh.add(circuit);
        circuit.frustumCulled = false;
    }

    game.equippedAxeMesh.add(handle);
    game.equippedAxeMesh.add(core);
    game.equippedAxeMesh.add(blade1);
    game.equippedAxeMesh.add(blade2);
    game.equippedAxeMesh.add(bladeGlow1);
    game.equippedAxeMesh.add(bladeGlow2);
    game.equippedAxeMesh.add(emitter);

    // Position Virus Slicer in right side of view
    game.equippedAxeMesh.position.set(0.4, -0.4, -0.6);
    game.equippedAxeMesh.rotation.set(0.2, -0.3, 0.1);

    // Disable frustum culling
    handle.frustumCulled = false;
    core.frustumCulled = false;
    blade1.frustumCulled = false;
    blade2.frustumCulled = false;
    bladeGlow1.frustumCulled = false;
    bladeGlow2.frustumCulled = false;
    emitter.frustumCulled = false;
    game.equippedAxeMesh.frustumCulled = false;

    // Add to camera
    game.camera.add(game.equippedAxeMesh);

    console.log('✓ Virus Slicer equipped successfully');
}

// Equip dev book to player
function equipSpellBook() {
    // Remove old dev book if exists
    if (game.equippedSpellBookMesh) {
        game.camera.remove(game.equippedSpellBookMesh);
    }

    // Create dev book mesh for first person view
    game.equippedSpellBookMesh = new THREE.Group();

    // Book - rectangular shape (normal everyday book)
    const bookGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.1);
    const bookMaterial = new THREE.MeshBasicMaterial({
        color: 0x1a3a5c, // Dark blue (like tech/programming books)
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false
    });
    const book = new THREE.Mesh(bookGeometry, bookMaterial);
    book.position.set(0, 0, 0);
    book.renderOrder = 999;

    // Book cover - title text lines
    const titleLineGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.001);
    const titleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // White text
        depthTest: false,
        depthWrite: false
    });
    const titleLine1 = new THREE.Mesh(titleLineGeometry, titleMaterial);
    titleLine1.position.set(0, 0.15, 0.051);
    titleLine1.renderOrder = 1000;

    const titleLine2 = new THREE.Mesh(titleLineGeometry, titleMaterial);
    titleLine2.position.set(0, 0.05, 0.051);
    titleLine2.renderOrder = 1000;

    const subtitleGeometry = new THREE.BoxGeometry(0.25, 0.03, 0.001);
    const subtitleLine = new THREE.Mesh(subtitleGeometry, titleMaterial);
    subtitleLine.position.set(0, -0.05, 0.051);
    subtitleLine.renderOrder = 1000;

    game.equippedSpellBookMesh.add(book);
    game.equippedSpellBookMesh.add(titleLine1);
    game.equippedSpellBookMesh.add(titleLine2);
    game.equippedSpellBookMesh.add(subtitleLine);

    // Position dev book in left side of view
    game.equippedSpellBookMesh.position.set(-0.4, -0.3, -0.5);
    game.equippedSpellBookMesh.rotation.set(0.3, 0.5, 0);

    // Disable frustum culling
    book.frustumCulled = false;
    titleLine1.frustumCulled = false;
    titleLine2.frustumCulled = false;
    subtitleLine.frustumCulled = false;
    game.equippedSpellBookMesh.frustumCulled = false;

    // Add to camera
    game.camera.add(game.equippedSpellBookMesh);

    // Show and update mana display
    const manaDisplay = document.getElementById('manaDisplay');
    if (manaDisplay) {
        manaDisplay.style.display = 'block';
        updateManaDisplay();
    }

    // Update spell UI
    updateSpellUI();

    console.log('✓ Spell book equipped successfully');
}

// Update spell UI to show current spell
function updateSpellUI() {
    let spellUI = document.getElementById('spellUI');
    if (!spellUI) {
        spellUI = document.createElement('div');
        spellUI.id = 'spellUI';
        spellUI.style.cssText = 'position: fixed; bottom: 120px; right: 20px; background: rgba(0, 0, 0, 0.7); color: white; padding: 15px; border-radius: 5px; font-size: 14px; border: 2px solid #9400d3; z-index: 50;';
        document.body.appendChild(spellUI);
    }

    if (game.equippedSpellBook) {
        spellUI.style.display = 'block';

        let spellInfo = '';
        if (game.currentSpell === 'fireball' && game.hasFireball) {
            spellInfo = '🔥 <strong>Fireball</strong> (F)<br>Q to switch';
        } else if (game.currentSpell === 'freezeball' && game.hasFreezeball) {
            spellInfo = '❄️ <strong>Freeze Ball</strong> (G)<br>Q to switch';
        } else if (game.currentSpell === 'dash' && game.hasDash) {
            spellInfo = '💨 <strong>Dash</strong> (R)<br>Q to switch';
        } else {
            spellInfo = '📖 <strong>No spells</strong><br>Buy spells from shop';
        }

        spellUI.innerHTML = spellInfo;
    } else {
        spellUI.style.display = 'none';
    }
}

// Switch between spells
function switchSpell() {
    if (!game.equippedSpellBook) return;

    // Get available spells
    const availableSpells = [];
    if (game.hasFireball) availableSpells.push('fireball');
    if (game.hasFreezeball) availableSpells.push('freezeball');
    if (game.hasDash) availableSpells.push('dash');

    if (availableSpells.length === 0) {
        showNotification('📖 No spells purchased yet!');
        return;
    }

    if (availableSpells.length === 1) {
        const spell = availableSpells[0];
        if (spell === 'fireball') showNotification('🔥 Only Fireball available');
        else if (spell === 'freezeball') showNotification('❄️ Only Freeze Ball available');
        else if (spell === 'dash') showNotification('💨 Only Dash available');
        return;
    }

    // Cycle to next spell
    const currentIndex = availableSpells.indexOf(game.currentSpell);
    const nextIndex = (currentIndex + 1) % availableSpells.length;
    game.currentSpell = availableSpells[nextIndex];

    // Show notification
    if (game.currentSpell === 'fireball') {
        showNotification('🔥 Switched to Fireball (F)');
    } else if (game.currentSpell === 'freezeball') {
        showNotification('❄️ Switched to Freeze Ball (G)');
    } else if (game.currentSpell === 'dash') {
        showNotification('💨 Switched to Dash (R)');
    }

    updateSpellUI();
}

// Shoot arrow with optional charge parameter (0 to 1)
function shootArrow(chargeAmount = 0) {
    if (!game.equippedBow) return;
    if (game.shootCooldown > 0) return;

    game.shootCooldown = 0.5; // 0.5 second cooldown

    // Calculate speed multiplier based on charge (1x to 3x)
    const speedMultiplier = 1 + (chargeAmount * 2); // 1.0 to 3.0

    // Create plasma arrow projectile as a group
    const arrow = new THREE.Group();

    // Plasma core - bright glowing cylinder
    const coreGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff, // Bright cyan plasma
        emissive: 0x00ffff,
        emissiveIntensity: 1
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.y = 0;
    arrow.add(core);

    // Plasma glow - outer energy field
    const glowGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1.1, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff88, // Green-cyan glow
        transparent: true,
        opacity: 0.5
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 0;
    arrow.add(glow);

    // Plasma tip - pointed energy front
    const tipGeometry = new THREE.ConeGeometry(0.1, 0.4, 8);
    const tipMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // Bright white tip
        emissive: 0xffffff,
        emissiveIntensity: 1
    });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.position.y = 0.7; // Position at front
    arrow.add(tip);

    // Energy trail particles - 3 small spheres at back
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const particleGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.7
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.y = -0.5; // Position at back
        particle.position.x = Math.cos(angle) * 0.1;
        particle.position.z = Math.sin(angle) * 0.1;
        arrow.add(particle);
    }

    // Position at camera
    arrow.position.set(
        game.camera.position.x,
        game.camera.position.y,
        game.camera.position.z
    );

    // Store starting position to track distance traveled
    arrow.startPosition = arrow.position.clone();

    // Calculate arrow direction from camera rotation
    const pitch = game.camera.rotation.x;
    const yaw = game.camera.rotation.y;

    const dirX = -Math.sin(yaw) * Math.cos(pitch);
    const dirY = Math.sin(pitch);
    const dirZ = -Math.cos(yaw) * Math.cos(pitch);

    // Create velocity vector (base speed 50, scaled by charge)
    const baseSpeed = 50;
    const finalSpeed = baseSpeed * speedMultiplier;
    arrow.velocity = new THREE.Vector3(
        dirX * finalSpeed,
        dirY * finalSpeed,
        dirZ * finalSpeed
    );

    // Rotate arrow to point in the direction of travel
    // Arrow is built along Y-axis, so we need to orient it toward the velocity direction
    const direction = arrow.velocity.clone().normalize();

    // Calculate the rotation needed to align arrow with velocity
    // Create a quaternion rotation from Y-axis to the direction vector
    const upVector = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, direction);
    arrow.setRotationFromQuaternion(quaternion);

    // Scale arrow based on charge (1.0 to 1.8x size)
    const scaleMultiplier = 1 + (chargeAmount * 0.8);
    arrow.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);

    game.scene.add(arrow);
    game.projectiles.push(arrow);

    // Show notification based on charge level
    if (chargeAmount > 0.8) {
        showNotification('⚡ Fully charged shot!');
    } else if (chargeAmount > 0.4) {
        showNotification('🔫 Charged plasma shot!');
    } else {
        showNotification('🔫 Plasma shot!');
    }
}

// Cast fireball spell
function castFireball() {
    if (!game.equippedSpellBook || !game.hasFireball || game.fireballCooldown > 0) return;

    // Check mana cost (10 mana)
    const manaCost = 10;
    if (game.playerMana < manaCost) {
        showNotification('❌ Not enough mana! Need 10 mana');
        return;
    }

    // Consume mana
    game.playerMana -= manaCost;
    updateManaDisplay();

    game.fireballCooldown = 2.0; // 2 second cooldown

    // Create fireball projectile
    const fireballGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const fireballMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4500,
        emissive: 0xff4500
    });
    const fireball = new THREE.Mesh(fireballGeometry, fireballMaterial);

    // Position at camera
    fireball.position.set(
        game.camera.position.x,
        game.camera.position.y,
        game.camera.position.z
    );

    // Store starting position
    fireball.startPosition = fireball.position.clone();

    // Calculate fireball direction from camera rotation
    const pitch = game.camera.rotation.x;
    const yaw = game.camera.rotation.y;

    const dirX = -Math.sin(yaw) * Math.cos(pitch);
    const dirY = Math.sin(pitch);
    const dirZ = -Math.cos(yaw) * Math.cos(pitch);

    // Create velocity vector (faster than arrows)
    fireball.velocity = new THREE.Vector3(
        dirX * 60,
        dirY * 60,
        dirZ * 60
    );

    fireball.isFireball = true;

    // Add flame particles around fireball
    const glowGeometry = new THREE.SphereGeometry(0.7, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffa500,
        transparent: true,
        opacity: 0.5
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    fireball.add(glow);

    game.scene.add(fireball);
    game.projectiles.push(fireball);

    showNotification('🔥 Fireball!');
}

// Cast freezeball spell
function castFreezeball() {
    if (!game.equippedSpellBook || !game.hasFreezeball || game.freezeballCooldown > 0) return;

    // Check mana cost (20 mana)
    const manaCost = 20;
    if (game.playerMana < manaCost) {
        showNotification('❌ Not enough mana! Need 20 mana');
        return;
    }

    // Consume mana
    game.playerMana -= manaCost;
    updateManaDisplay();

    game.freezeballCooldown = 3.0; // 3 second cooldown

    // Create freezeball projectile
    const freezeballGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const freezeballMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff
    });
    const freezeball = new THREE.Mesh(freezeballGeometry, freezeballMaterial);

    // Position at camera
    freezeball.position.set(
        game.camera.position.x,
        game.camera.position.y,
        game.camera.position.z
    );

    // Store starting position
    freezeball.startPosition = freezeball.position.clone();

    // Calculate freezeball direction from camera rotation
    const pitch = game.camera.rotation.x;
    const yaw = game.camera.rotation.y;

    const dirX = -Math.sin(yaw) * Math.cos(pitch);
    const dirY = Math.sin(pitch);
    const dirZ = -Math.cos(yaw) * Math.cos(pitch);

    // Create velocity vector
    freezeball.velocity = new THREE.Vector3(
        dirX * 50,
        dirY * 50,
        dirZ * 50
    );

    freezeball.isFreezeball = true;

    // Add icy glow around freezeball
    const glowGeometry = new THREE.SphereGeometry(0.7, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xaaffff,
        transparent: true,
        opacity: 0.5
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    freezeball.add(glow);

    game.scene.add(freezeball);
    game.projectiles.push(freezeball);

    showNotification('❄️ Freeze Ball!');
}

// Cast dash spell
function castDash() {
    if (!game.equippedSpellBook || !game.hasDash || game.dashCooldown > 0 || game.isDashing) return;

    // Check mana cost (10 mana)
    const manaCost = 10;
    if (game.playerMana < manaCost) {
        showNotification('❌ Not enough mana! Need 10 mana');
        return;
    }

    // Consume mana
    game.playerMana -= manaCost;
    updateManaDisplay();

    game.dashCooldown = 2.0; // 2 second cooldown

    // Activate dash
    game.isDashing = true;
    game.dashTimer = game.dashDuration;

    // Calculate dash direction from camera rotation (horizontal only)
    const yaw = game.rotation.y;

    // Determine dash direction based on movement keys
    let dashDirX = 0;
    let dashDirZ = 0;

    if (game.controls.moveForward) {
        dashDirX += -Math.sin(yaw);
        dashDirZ += -Math.cos(yaw);
    }
    if (game.controls.moveBackward) {
        dashDirX += Math.sin(yaw);
        dashDirZ += Math.cos(yaw);
    }
    if (game.controls.moveLeft) {
        dashDirX += -Math.cos(yaw);
        dashDirZ += Math.sin(yaw);
    }
    if (game.controls.moveRight) {
        dashDirX += Math.cos(yaw);
        dashDirZ += -Math.sin(yaw);
    }

    // If no movement keys pressed, dash forward
    if (dashDirX === 0 && dashDirZ === 0) {
        dashDirX = -Math.sin(yaw);
        dashDirZ = -Math.cos(yaw);
    }

    // Normalize direction
    const length = Math.sqrt(dashDirX * dashDirX + dashDirZ * dashDirZ);
    game.dashDirectionX = dashDirX / length;
    game.dashDirectionZ = dashDirZ / length;

    showNotification('💨 Dash!');
}

// Toggle inventory
function toggleInventory() {
    game.inventory.isOpen = !game.inventory.isOpen;
    const inventoryDiv = document.getElementById('inventory');

    if (game.inventory.isOpen) {
        inventoryDiv.classList.add('visible');
        document.exitPointerLock();
    } else {
        inventoryDiv.classList.remove('visible');
    }
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';

    // Hide after animation completes
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Check shield pickup
function checkShieldPickup() {
    for (let i = game.shields.length - 1; i >= 0; i--) {
        const shield = game.shields[i];
        const distance = game.camera.position.distanceTo(shield.position);

        if (distance < 3) {
            // Collect shield
            game.scene.remove(shield);
            game.shields.splice(i, 1);
            game.shieldCount++;

            // Auto-equip shield if not already equipped
            if (!game.inventory.equippedShield) {
                game.inventory.equippedShield = true;
                game.hasShieldProtection = true;
            }

            updateInventoryUI();

            // Show notification (non-blocking)
            showNotification(`🛡️ Anti Virus collected! (x${game.shieldCount}) Protects you from one virus hit.`);
            break; // Only collect one shield per frame
        }
    }
}

// Check bow pickup
function checkBowPickup() {
    if (game.bowCollected || !game.bow) return;

    const distance = game.camera.position.distanceTo(game.bow.position);

    if (distance < 3) {
        // Collect bow
        game.bowCollected = true;
        game.scene.remove(game.bow);

        // Add to inventory
        game.inventory.items.push({
            name: 'Lunar Linux',
            icon: '🔫',
            type: 'bow'
        });

        updateInventoryUI();

        // Show notification (non-blocking)
        showNotification('🔫 Lunar Linux collected! Equip it to shoot plasma arrows.');
    }
}

// Check axe pickup
function checkAxePickup() {
    if (game.axeCollected || !game.axe) return;

    const distance = game.camera.position.distanceTo(game.axe.position);

    if (distance < 3) {
        // Collect axe
        game.axeCollected = true;
        game.scene.remove(game.axe);

        // Add to inventory
        game.inventory.items.push({
            name: 'Virus Slicer',
            icon: '🪓',
            type: 'axe'
        });

        updateInventoryUI();

        // Show notification (non-blocking)
        showNotification('🪓 Virus Slicer collected! Equip it for powerful but slow attacks!');
    }
}

// Check food pickup
function checkFoodPickup() {
    for (let i = game.foods.length - 1; i >= 0; i--) {
        const food = game.foods[i];
        const distance = game.camera.position.distanceTo(food.position);

        if (distance < 3) {
            // Collect food
            game.scene.remove(food);
            game.foods.splice(i, 1);
            game.foodCount++;

            updateInventoryUI();

            // Show notification (non-blocking)
            showNotification(`💻 Code collected! (x${game.foodCount}) Use it to heal 10 HP.`);
            break; // Only collect one at a time
        }
    }
}

// Check red potion pickup
function checkRedPotionPickup() {
    for (let i = game.redPotions.length - 1; i >= 0; i--) {
        const potion = game.redPotions[i];
        const distance = game.camera.position.distanceTo(potion.position);

        if (distance < 3) {
            // Collect chunky code
            game.scene.remove(potion);
            game.redPotions.splice(i, 1);
            game.redPotionCount++;

            updateInventoryUI();

            // Show notification (non-blocking)
            showNotification(`💾 Chunky Code collected! (x${game.redPotionCount}) Use it to heal 100 HP!`);
            break; // Only collect one at a time
        }
    }
}

// Check dev book pickup
function checkSpellBookPickup() {
    if (game.spellBookCollected || !game.spellBook) return;

    const distance = game.camera.position.distanceTo(game.spellBook.position);

    if (distance < 3) {
        // Collect dev book
        game.spellBookCollected = true;
        game.scene.remove(game.spellBook);

        // Update inventory UI
        updateInventoryUI();

        // Show notification
        showNotification('📖 Dev Book collected! Added to inventory. Dev shop section unlocked!');
        console.log('Dev book collected - added to inventory and dev shop unlocked');
    }
}

// Attack with sword
function attackWithSword() {
    if (!game.inventory.equippedSword) return;
    if (game.isAttacking || game.attackCooldown > 0) return;

    game.isAttacking = true;
    game.attackCooldown = 0.5; // 0.5 second cooldown

    // Enhanced swing animation
    if (game.equippedSwordMesh) {
        // Store original positions (matching equipSword)
        const originalRotationX = -0.2;
        const originalRotationY = 0.1;
        const originalRotationZ = 0.05;
        const originalPosX = 0.3; // Updated for visible position
        const originalPosY = -0.3; // Updated for visible position
        const originalPosZ = -0.5;

        // Get current bobbing position if any
        const startPosX = game.equippedSwordMesh.position.x;
        const startPosY = game.equippedSwordMesh.position.y;

        // Wind-up phase (pull back)
        let windupProgress = 0;
        const windupDuration = 8; // frames
        const windupInterval = setInterval(() => {
            windupProgress += 1 / windupDuration;

            // Pull sword back and up
            game.equippedSwordMesh.rotation.x = originalRotationX - (Math.PI / 8) * windupProgress;
            game.equippedSwordMesh.rotation.y = originalRotationY;
            game.equippedSwordMesh.rotation.z = originalRotationZ + (Math.PI / 6) * windupProgress;
            game.equippedSwordMesh.position.x = startPosX + 0.1 * windupProgress;
            game.equippedSwordMesh.position.y = startPosY + 0.15 * windupProgress;
            game.equippedSwordMesh.position.z = originalPosZ + 0.15 * windupProgress;

            if (windupProgress >= 1) {
                clearInterval(windupInterval);

                // Swing forward phase (fast and powerful)
                let swingProgress = 0;
                const swingDuration = 6; // frames - faster than windup
                const swingInterval = setInterval(() => {
                    swingProgress += 1 / swingDuration;
                    const easeOut = 1 - Math.pow(1 - swingProgress, 3); // Ease out cubic

                    // Dramatic diagonal slash - sweep from right to left
                    game.equippedSwordMesh.rotation.x = (originalRotationX - Math.PI / 8) + (Math.PI / 3) * easeOut;
                    game.equippedSwordMesh.rotation.y = originalRotationY - (Math.PI / 8) * easeOut;
                    game.equippedSwordMesh.rotation.z = (originalRotationZ + Math.PI / 6) - (Math.PI * 1.3) * easeOut;
                    game.equippedSwordMesh.position.x = (startPosX + 0.1) - 0.6 * easeOut;
                    game.equippedSwordMesh.position.y = (startPosY + 0.15) - 0.5 * easeOut;
                    game.equippedSwordMesh.position.z = (originalPosZ + 0.15) - 0.3 * easeOut;

                    if (swingProgress >= 1) {
                        clearInterval(swingInterval);

                        // Return to rest position
                        setTimeout(() => {
                            let returnProgress = 0;
                            const returnDuration = 10; // frames - slower return
                            const returnInterval = setInterval(() => {
                                returnProgress += 1 / returnDuration;
                                const easeInOut = returnProgress < 0.5
                                    ? 2 * returnProgress * returnProgress
                                    : 1 - Math.pow(-2 * returnProgress + 2, 2) / 2;

                                // Interpolate back to original position
                                const endRotX = originalRotationX - Math.PI / 8 + Math.PI / 3;
                                const endRotY = originalRotationY - Math.PI / 8;
                                const endRotZ = originalRotationZ + Math.PI / 6 - Math.PI * 1.3;
                                const endPosX = startPosX + 0.1 - 0.6;
                                const endPosY = startPosY + 0.15 - 0.5;
                                const endPosZ = originalPosZ + 0.15 - 0.3;

                                game.equippedSwordMesh.rotation.x = endRotX + (originalRotationX - endRotX) * easeInOut;
                                game.equippedSwordMesh.rotation.y = endRotY + (originalRotationY - endRotY) * easeInOut;
                                game.equippedSwordMesh.rotation.z = endRotZ + (originalRotationZ - endRotZ) * easeInOut;
                                game.equippedSwordMesh.position.x = endPosX + (originalPosX - endPosX) * easeInOut;
                                game.equippedSwordMesh.position.y = endPosY + (originalPosY - endPosY) * easeInOut;
                                game.equippedSwordMesh.position.z = endPosZ + (originalPosZ - endPosZ) * easeInOut;

                                if (returnProgress >= 1) {
                                    clearInterval(returnInterval);
                                    game.isAttacking = false;

                                    // Ensure exact reset
                                    game.equippedSwordMesh.rotation.set(originalRotationX, originalRotationY, originalRotationZ);
                                    game.equippedSwordMesh.position.set(originalPosX, originalPosY, originalPosZ);
                                }
                            }, 16);
                        }, 50);
                    }
                }, 16);
            }
        }, 16);
    }

    // Find all targets in range and angle, then hit the closest one
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(game.camera.quaternion);

    const targetsInRange = [];

    // Check enemies
    for (let i = 0; i < game.enemies.length; i++) {
        const enemy = game.enemies[i];
        const distance = game.camera.position.distanceTo(enemy.position);
        if (distance < 15) { // Large attack range of 15 units
            // Calculate if enemy is at crosshair (center of screen)
            const directionToEnemy = new THREE.Vector3();
            directionToEnemy.subVectors(enemy.position, game.camera.position);
            directionToEnemy.normalize();

            const angle = forward.angleTo(directionToEnemy);

            if (angle < Math.PI / 6) { // Tight 30 degree cone targeting crosshair
                targetsInRange.push({
                    entity: enemy,
                    distance: distance,
                    index: i,
                    isBoss: false
                });
            }
        }
    }

    // Check boss
    if (game.boss) {
        const distance = game.camera.position.distanceTo(game.boss.position);
        if (distance < 20) { // Boss has larger hit range
            // Calculate if boss is at crosshair (center of screen)
            const directionToBoss = new THREE.Vector3();
            directionToBoss.subVectors(game.boss.position, game.camera.position);
            directionToBoss.normalize();

            const angle = forward.angleTo(directionToBoss);

            if (angle < Math.PI / 6) { // Tight 30 degree cone targeting crosshair
                targetsInRange.push({
                    entity: game.boss,
                    distance: distance,
                    index: -1,
                    isBoss: true
                });
            }
        }
    }

    // Sort by distance and hit the closest target
    if (targetsInRange.length > 0) {
        targetsInRange.sort((a, b) => a.distance - b.distance);
        const closestTarget = targetsInRange[0];
        const target = closestTarget.entity;

        // 5% chance for critical hit (double damage)
        const isCritical = Math.random() < 0.05;
        const damage = isCritical ? game.playerDamage * 2 : game.playerDamage;

        // Deal damage
        target.hp -= damage;

        // Spawn damage number
        spawnDamageNumber(damage, target.position);

        // Visual feedback - flash bright white for visibility (golden for crit)
        const flashColor = isCritical ? 0xffdd00 : 0xffffff;
        const originalColor = target.material.color.getHex();
        const originalEmissive = closestTarget.isBoss ? 0x660000 : 0x330000;
        target.material.color.setHex(flashColor);
        target.material.emissive.setHex(flashColor);
        setTimeout(() => {
            if (target && target.material) {
                target.material.color.setHex(originalColor);
                target.material.emissive.setHex(originalEmissive);
            }
        }, 150);

        // Show damage feedback
        const critText = isCritical ? ' CRITICAL!' : '';
        if (closestTarget.isBoss) {
            showNotification(`⚔️ BOSS -${damage} DMG${critText}! HP: ${Math.max(0, target.hp)}/${target.maxHP}`);
            if (target.hp <= 0) {
                defeatBoss();
            }
        } else {
            showNotification(`⚔️ -${damage} DMG${critText}! Virus HP: ${Math.max(0, target.hp)}/5`);
            if (target.hp <= 0) {
                defeatEnemy(target, closestTarget.index);
            }
        }
    }
}

// Attack with axe
function attackWithAxe() {
    if (!game.equippedAxe) return;
    if (game.isAttacking || game.axeCooldown > 0) return;

    game.isAttacking = true;
    game.axeCooldown = 2.5; // 2.5 second cooldown - much longer than sword

    // Heavy swing animation - slower and more powerful
    if (game.equippedAxeMesh) {
        // Store original positions (matching equipAxe)
        const originalRotationX = 0.2;
        const originalRotationY = -0.3;
        const originalRotationZ = 0.1;
        const originalPosX = 0.4;
        const originalPosY = -0.4;
        const originalPosZ = -0.6;

        // Get current position
        const startPosX = game.equippedAxeMesh.position.x;
        const startPosY = game.equippedAxeMesh.position.y;

        // Heavy wind-up phase (slower and more pronounced)
        let windupProgress = 0;
        const windupDuration = 12; // frames - slower than sword for heavy feel
        const windupInterval = setInterval(() => {
            windupProgress += 1 / windupDuration;

            // Pull axe back high and to the right
            game.equippedAxeMesh.rotation.x = originalRotationX - (Math.PI / 4) * windupProgress;
            game.equippedAxeMesh.rotation.y = originalRotationY + (Math.PI / 6) * windupProgress;
            game.equippedAxeMesh.rotation.z = originalRotationZ + (Math.PI / 4) * windupProgress;
            game.equippedAxeMesh.position.x = startPosX + 0.2 * windupProgress;
            game.equippedAxeMesh.position.y = startPosY + 0.3 * windupProgress;
            game.equippedAxeMesh.position.z = originalPosZ + 0.2 * windupProgress;

            if (windupProgress >= 1) {
                clearInterval(windupInterval);

                // Heavy swing forward phase (powerful overhead chop)
                let swingProgress = 0;
                const swingDuration = 10; // frames - slower than sword
                const swingInterval = setInterval(() => {
                    swingProgress += 1 / swingDuration;
                    const easeOut = 1 - Math.pow(1 - swingProgress, 3); // Ease out cubic

                    // Powerful overhead chop - arc from high to low
                    game.equippedAxeMesh.rotation.x = (originalRotationX - Math.PI / 4) + (Math.PI / 2) * easeOut;
                    game.equippedAxeMesh.rotation.y = (originalRotationY + Math.PI / 6) - (Math.PI / 3) * easeOut;
                    game.equippedAxeMesh.rotation.z = (originalRotationZ + Math.PI / 4) - (Math.PI * 1.5) * easeOut;
                    game.equippedAxeMesh.position.x = (startPosX + 0.2) - 0.4 * easeOut;
                    game.equippedAxeMesh.position.y = (startPosY + 0.3) - 0.8 * easeOut;
                    game.equippedAxeMesh.position.z = (originalPosZ + 0.2) - 0.4 * easeOut;

                    if (swingProgress >= 1) {
                        clearInterval(swingInterval);

                        // Return to rest position
                        setTimeout(() => {
                            let returnProgress = 0;
                            const returnDuration = 12; // frames - slower return
                            const returnInterval = setInterval(() => {
                                returnProgress += 1 / returnDuration;
                                const easeInOut = returnProgress < 0.5
                                    ? 2 * returnProgress * returnProgress
                                    : 1 - Math.pow(-2 * returnProgress + 2, 2) / 2;

                                // Interpolate back to original position
                                const endRotX = originalRotationX - Math.PI / 4 + Math.PI / 2;
                                const endRotY = originalRotationY + Math.PI / 6 - Math.PI / 3;
                                const endRotZ = originalRotationZ + Math.PI / 4 - Math.PI * 1.5;
                                const endPosX = startPosX + 0.2 - 0.4;
                                const endPosY = startPosY + 0.3 - 0.8;
                                const endPosZ = originalPosZ + 0.2 - 0.4;

                                game.equippedAxeMesh.rotation.x = endRotX + (originalRotationX - endRotX) * easeInOut;
                                game.equippedAxeMesh.rotation.y = endRotY + (originalRotationY - endRotY) * easeInOut;
                                game.equippedAxeMesh.rotation.z = endRotZ + (originalRotationZ - endRotZ) * easeInOut;
                                game.equippedAxeMesh.position.x = endPosX + (originalPosX - endPosX) * easeInOut;
                                game.equippedAxeMesh.position.y = endPosY + (originalPosY - endPosY) * easeInOut;
                                game.equippedAxeMesh.position.z = endPosZ + (originalPosZ - endPosZ) * easeInOut;

                                if (returnProgress >= 1) {
                                    clearInterval(returnInterval);
                                    game.isAttacking = false;

                                    // Ensure exact reset
                                    game.equippedAxeMesh.rotation.set(originalRotationX, originalRotationY, originalRotationZ);
                                    game.equippedAxeMesh.position.set(originalPosX, originalPosY, originalPosZ);
                                }
                            }, 16);
                        }, 50);
                    }
                }, 16);
            }
        }, 16);
    }

    // Find all targets in range and angle, then hit the closest one
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(game.camera.quaternion);

    const targetsInRange = [];

    // Check enemies
    for (let i = 0; i < game.enemies.length; i++) {
        const enemy = game.enemies[i];
        const distance = game.camera.position.distanceTo(enemy.position);
        if (distance < 12) { // Shorter range than sword (12 vs 15)
            // Calculate if enemy is at crosshair (center of screen)
            const directionToEnemy = new THREE.Vector3();
            directionToEnemy.subVectors(enemy.position, game.camera.position);
            directionToEnemy.normalize();

            const angle = forward.angleTo(directionToEnemy);

            if (angle < Math.PI / 6) { // Tight 30 degree cone targeting crosshair
                targetsInRange.push({
                    entity: enemy,
                    distance: distance,
                    index: i,
                    isBoss: false
                });
            }
        }
    }

    // Check boss
    if (game.boss) {
        const distance = game.camera.position.distanceTo(game.boss.position);
        if (distance < 18) { // Boss has large hit range but shorter than sword
            // Calculate if boss is at crosshair (center of screen)
            const directionToBoss = new THREE.Vector3();
            directionToBoss.subVectors(game.boss.position, game.camera.position);
            directionToBoss.normalize();

            const angle = forward.angleTo(directionToBoss);

            if (angle < Math.PI / 6) { // Tight 30 degree cone targeting crosshair
                targetsInRange.push({
                    entity: game.boss,
                    distance: distance,
                    index: -1,
                    isBoss: true
                });
            }
        }
    }

    // Sort by distance and hit the closest target
    if (targetsInRange.length > 0) {
        targetsInRange.sort((a, b) => a.distance - b.distance);
        const closestTarget = targetsInRange[0];
        const target = closestTarget.entity;

        // 5% chance for critical hit (double damage)
        const isCritical = Math.random() < 0.05;
        const baseDamage = game.playerDamage * 3; // 3x sword damage!
        const damage = isCritical ? baseDamage * 2 : baseDamage;

        // Deal damage
        target.hp -= damage;

        // Spawn damage number
        spawnDamageNumber(damage, target.position);

        // Visual feedback - flash bright orange for axe (golden for crit)
        const flashColor = isCritical ? 0xffdd00 : 0xff8800;
        const originalColor = target.material.color.getHex();
        const originalEmissive = closestTarget.isBoss ? 0x660000 : 0x330000;
        target.material.color.setHex(flashColor);
        target.material.emissive.setHex(flashColor);
        setTimeout(() => {
            if (target && target.material) {
                target.material.color.setHex(originalColor);
                target.material.emissive.setHex(originalEmissive);
            }
        }, 150);

        // Show damage feedback with axe emoji
        const critText = isCritical ? ' CRITICAL!' : '';
        if (closestTarget.isBoss) {
            showNotification(`🪓 BOSS -${damage} DMG${critText}! HP: ${Math.max(0, target.hp)}/${target.maxHP}`);
            if (target.hp <= 0) {
                defeatBoss();
            }
        } else {
            showNotification(`🪓 -${damage} DMG${critText}! Virus HP: ${Math.max(0, target.hp)}/5`);
            if (target.hp <= 0) {
                defeatEnemy(target, closestTarget.index);
            }
        }
    }
}

// Defeat boss
function defeatBoss() {
    if (!game.boss) return;

    const bossPos = game.boss.position.clone();

    // Create larger code explosion for boss
    createCodeExplosion(bossPos);
    // Add extra explosion for boss (more fragments)
    createCodeExplosion(bossPos);
    createCodeExplosion(bossPos);

    game.scene.remove(game.boss);
    game.boss = null;
    // Don't reset bossSpawned to false - prevents boss from respawning in same world

    // Award massive EXP
    game.playerEXP += 1000;
    updateEXPDisplay();
    checkLevelUp();

    // Award coins - boss drops 10 coins
    game.coins += 10;
    updateKromerDisplay();

    showNotification('🎉 BOSS DEFEATED! +1000 EXP +10 Kromer!');
    console.log('Boss defeated!');

    // Spawn portal to next world
    setTimeout(() => {
        if (game.currentWorld === 1) {
            spawnPortal(bossPos.x, bossPos.z, 2); // Portal to World 2
        } else if (game.currentWorld === 2) {
            spawnPortal(bossPos.x, bossPos.z, 3); // Portal to World 3
        }
    }, 2000); // Spawn portal 2 seconds after boss defeat
}

// Spawn portal to next world
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

// Check shop proximity
function checkShopProximity() {
    if (!game.shop) return;

    const distance = game.camera.position.distanceTo(game.shop.position);
    if (distance < 10) {
        // Show prompt if not already showing
        if (!game.isShopOpen) {
            showNotification('Press E to open Shopping Network');
        }
    }
}

// Toggle shop menu
function toggleShop() {
    if (!game.shop) return;

    const distance = game.camera.position.distanceTo(game.shop.position);
    if (distance > 10 && !game.isShopOpen) return; // Too far to open

    game.isShopOpen = !game.isShopOpen;
    const shopMenu = document.getElementById('shopMenu');

    if (game.isShopOpen) {
        updateShopItems(); // Update shop items when opening
        shopMenu.style.display = 'block';
        document.exitPointerLock();
    } else {
        shopMenu.style.display = 'none';
    }
}

// Update shop items display
function updateShopItems() {
    const shopItems = document.getElementById('shopItems');
    shopItems.innerHTML = '';

    // Basic items
    shopItems.innerHTML += `
        <div class="shop-item" style="background: #000000; border: 3px solid #00ff00; border-radius: 8px; padding: 18px; margin: 12px 0; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);" onmouseover="this.style.boxShadow='0 0 25px rgba(0, 255, 0, 0.6)'" onmouseout="this.style.boxShadow='0 0 15px rgba(0, 255, 0, 0.3)'" onclick="buyItem('food')">
            <span style="font-size: 30px;">💻</span>
            <span style="margin-left: 20px; font-size: 18px; color: #00ff00; font-family: 'Courier New', monospace;">Code - Heal 10 HP</span>
            <span style="float: right; color: #00ff00; font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace;">💰 5 Kromer</span>
        </div>
        <div class="shop-item" style="background: #000000; border: 3px solid #00ff00; border-radius: 8px; padding: 18px; margin: 12px 0; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);" onmouseover="this.style.boxShadow='0 0 25px rgba(0, 255, 0, 0.6)'" onmouseout="this.style.boxShadow='0 0 15px rgba(0, 255, 0, 0.3)'" onclick="buyItem('damage')">
            <span style="font-size: 30px;">⚔️</span>
            <span style="margin-left: 20px; font-size: 18px; color: #00ff00; font-family: 'Courier New', monospace;">Damage Upgrade (+1 DMG)</span>
            <span style="float: right; color: #00ff00; font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace;">💰 20 Kromer</span>
        </div>
    `;

    // Bow upgrade (only if player has bow)
    if (game.bowCollected) {
        shopItems.innerHTML += `
            <div class="shop-item" style="background: #000000; border: 3px solid #00ff00; border-radius: 8px; padding: 18px; margin: 12px 0; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);" onmouseover="this.style.boxShadow='0 0 25px rgba(0, 255, 0, 0.6)'" onmouseout="this.style.boxShadow='0 0 15px rgba(0, 255, 0, 0.3)'" onclick="buyItem('bowdamage')">
                <span style="font-size: 30px;">🔫</span>
                <span style="margin-left: 20px; font-size: 18px; color: #00ff00; font-family: 'Courier New', monospace;">Lunar Linux Upgrade (+1 Plasma DMG)</span>
                <span style="float: right; color: #00ff00; font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace;">💰 50 Kromer</span>
            </div>
        `;
    }

    // Admin powers (only if dev book collected)
    if (game.spellBookCollected) {
        shopItems.innerHTML += `
            <div style="margin-top: 25px; padding-top: 20px; border-top: 3px solid #00ff00;">
                <h3 style="text-align: center; color: #00ff00; font-family: 'Courier New', monospace; text-shadow: 0 0 10px rgba(0, 255, 0, 0.8);">⚡ ADMIN POWERS ⚡</h3>
            </div>
            <div class="shop-item" style="background: #000000; border: 3px solid #00ff00; border-radius: 8px; padding: 18px; margin: 12px 0; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);" onmouseover="this.style.boxShadow='0 0 25px rgba(0, 255, 0, 0.6)'" onmouseout="this.style.boxShadow='0 0 15px rgba(0, 255, 0, 0.3)'" onclick="buyItem('fireball')">
                <span style="font-size: 30px;">🔥</span>
                <span style="margin-left: 20px; font-size: 18px; color: #00ff00; font-family: 'Courier New', monospace;">Fireball Power ${game.hasFireball ? '(Owned)' : ''}</span>
                <span style="float: right; color: #00ff00; font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace;">💰 15 Kromer</span>
            </div>
            <div class="shop-item" style="background: #000000; border: 3px solid #00ff00; border-radius: 8px; padding: 18px; margin: 12px 0; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);" onmouseover="this.style.boxShadow='0 0 25px rgba(0, 255, 0, 0.6)'" onmouseout="this.style.boxShadow='0 0 15px rgba(0, 255, 0, 0.3)'" onclick="buyItem('bigjump')">
                <span style="font-size: 30px;">⬆️</span>
                <span style="margin-left: 20px; font-size: 18px; color: #00ff00; font-family: 'Courier New', monospace;">Big Jump Power ${game.hasBigJump ? '(Owned)' : ''}</span>
                <span style="float: right; color: #00ff00; font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace;">💰 20 Kromer</span>
            </div>
            <div class="shop-item" style="background: #000000; border: 3px solid #00ff00; border-radius: 8px; padding: 18px; margin: 12px 0; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);" onmouseover="this.style.boxShadow='0 0 25px rgba(0, 255, 0, 0.6)'" onmouseout="this.style.boxShadow='0 0 15px rgba(0, 255, 0, 0.3)'" onclick="buyItem('freezeball')">
                <span style="font-size: 30px;">❄️</span>
                <span style="margin-left: 20px; font-size: 18px; color: #00ff00; font-family: 'Courier New', monospace;">Freeze Ball Power ${game.hasFreezeball ? '(Owned)' : ''}</span>
                <span style="float: right; color: #00ff00; font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace;">💰 25 Kromer</span>
            </div>
            <div class="shop-item" style="background: #000000; border: 3px solid #00ff00; border-radius: 8px; padding: 18px; margin: 12px 0; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);" onmouseover="this.style.boxShadow='0 0 25px rgba(0, 255, 0, 0.6)'" onmouseout="this.style.boxShadow='0 0 15px rgba(0, 255, 0, 0.3)'" onclick="buyItem('dash')">
                <span style="font-size: 30px;">💨</span>
                <span style="margin-left: 20px; font-size: 18px; color: #00ff00; font-family: 'Courier New', monospace;">Dash Power ${game.hasDash ? '(Owned)' : ''}</span>
                <span style="float: right; color: #00ff00; font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace;">💰 15 Kromer</span>
            </div>
            <div class="shop-item" style="background: #000000; border: 3px solid #00ff00; border-radius: 8px; padding: 18px; margin: 12px 0; cursor: pointer; transition: all 0.3s; box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);" onmouseover="this.style.boxShadow='0 0 25px rgba(0, 255, 0, 0.6)'" onmouseout="this.style.boxShadow='0 0 15px rgba(0, 255, 0, 0.3)'" onclick="buyItem('fastercharge')">
                <span style="font-size: 30px;">⚡</span>
                <span style="margin-left: 20px; font-size: 18px; color: #00ff00; font-family: 'Courier New', monospace;">Faster Charge ${game.hasFasterCharge ? '(Owned)' : ''}</span>
                <span style="float: right; color: #00ff00; font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace;">💰 15 Kromer</span>
            </div>
        `;
    }
}

// Buy item from shop
function buyItem(itemType) {
    if (itemType === 'food') {
        if (game.coins >= 5) {
            game.coins -= 5;
            game.playerHP = Math.min(game.playerHP + 10, game.maxPlayerHP);
            updateHPDisplay();
            updateKromerDisplay();
            showNotification('💻 Bought code! +10 HP');
        } else {
            showNotification('❌ Not enough Kromer! Need 5 coins');
        }
    } else if (itemType === 'damage') {
        if (game.coins >= 20) {
            game.coins -= 20;
            game.playerDamage += 1;
            updateKromerDisplay();
            updateEXPDisplay(); // Updates damage display
            showNotification('⚔️ Bought damage upgrade! +1 DMG');
        } else {
            showNotification('❌ Not enough Kromer! Need 20 coins');
        }
    } else if (itemType === 'bowdamage') {
        if (game.coins >= 50) {
            game.coins -= 50;
            game.bowDamage += 1;
            updateKromerDisplay();
            showNotification(`🔫 Bought Lunar Linux upgrade! Plasma DMG: ${game.bowDamage}`);
        } else {
            showNotification('❌ Not enough Kromer! Need 50 coins');
        }
    } else if (itemType === 'fireball') {
        if (game.hasFireball) {
            showNotification('❌ You already own this power!');
        } else if (game.coins >= 15) {
            game.coins -= 15;
            game.hasFireball = true;
            updateKromerDisplay();
            updateShopItems(); // Refresh shop display
            updateSpellUI(); // Update spell UI
            showNotification('🔥 Fireball power unlocked! Equip dev book and press F to cast!');
        } else {
            showNotification('❌ Not enough Kromer! Need 15 coins');
        }
    } else if (itemType === 'bigjump') {
        if (game.hasBigJump) {
            showNotification('❌ You already own this power!');
        } else if (game.coins >= 20) {
            game.coins -= 20;
            game.hasBigJump = true;
            updateKromerDisplay();
            updateShopItems(); // Refresh shop display
            showNotification('⬆️ Big Jump power unlocked! Equip dev book and jump with mana for super jumps!');
        } else {
            showNotification('❌ Not enough Kromer! Need 20 coins');
        }
    } else if (itemType === 'freezeball') {
        if (game.hasFreezeball) {
            showNotification('❌ You already own this power!');
        } else if (game.coins >= 25) {
            game.coins -= 25;
            game.hasFreezeball = true;
            updateKromerDisplay();
            updateShopItems(); // Refresh shop display
            updateSpellUI(); // Update spell UI
            showNotification('❄️ Freeze Ball power unlocked! Equip dev book and press G to cast!');
        } else {
            showNotification('❌ Not enough Kromer! Need 25 coins');
        }
    } else if (itemType === 'dash') {
        if (game.hasDash) {
            showNotification('❌ You already own this power!');
        } else if (game.coins >= 15) {
            game.coins -= 15;
            game.hasDash = true;
            updateKromerDisplay();
            updateShopItems(); // Refresh shop display
            updateSpellUI(); // Update spell UI
            showNotification('💨 Dash power unlocked! Equip dev book and press H to cast!');
        } else {
            showNotification('❌ Not enough Kromer! Need 15 coins');
        }
    } else if (itemType === 'fastercharge') {
        if (game.hasFasterCharge) {
            showNotification('❌ You already own this power!');
        } else if (game.coins >= 15) {
            game.coins -= 15;
            game.hasFasterCharge = true;
            updateKromerDisplay();
            updateShopItems(); // Refresh shop display
            showNotification('⚡ Faster Charge unlocked! Bow charges 10% faster!');
        } else {
            showNotification('❌ Not enough Kromer! Need 15 coins');
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

// Enter world two
function enterWorldTwo() {
    // Prevent entering World 2 if already in World 2
    if (game.currentWorld === 2) {
        console.log('Already in World 2');
        return;
    }

    showNotification('🌀 Entering World 2...');

    setTimeout(() => {
        // Clear all enemies
        game.enemies.forEach(enemy => game.scene.remove(enemy));
        game.enemies = [];

        // Remove boss if it exists
        if (game.boss) {
            game.scene.remove(game.boss);
            game.boss = null;
        }

        // Remove portal
        if (game.portal) {
            game.scene.remove(game.portal);
            game.portal = null;
            game.portalSpawned = false;
        }

        // Clear all World 1 items
        // Remove all shields
        game.shields.forEach(shield => game.scene.remove(shield));
        game.shields = [];

        // Remove all foods
        game.foods.forEach(food => game.scene.remove(food));
        game.foods = [];

        // Remove all red potions
        game.redPotions.forEach(potion => game.scene.remove(potion));
        game.redPotions = [];

        // Remove bow if it exists
        if (game.bow) {
            game.scene.remove(game.bow);
            game.bow = null;
        }

        // Remove shop if it exists
        if (game.shop) {
            game.scene.remove(game.shop);
            game.shop = null;
        }

        // Remove dev book if it exists (prevent duplicates)
        if (game.spellBook) {
            game.scene.remove(game.spellBook);
            game.spellBook = null;
        }

        // Reset boss spawn state
        game.bossSpawned = false;
        game.totalEnemiesSpawned = 0;

        // Teleport player to spawn
        game.camera.position.set(0, game.playerHeight, 0);

        // Change world
        game.currentWorld = 2;

        // Change scene background to indicate new world
        game.scene.background = new THREE.Color(0x6a0dad); // Bright purple sky for world 2
        game.scene.fog = new THREE.Fog(0x6a0dad, 0, 200); // Purple fog

        // Remove World 1 sky elements
        if (game.sun) {
            game.scene.remove(game.sun);
            game.sun = null;
        }
        if (game.sunGlow) {
            game.scene.remove(game.sunGlow);
            game.sunGlow = null;
        }
        if (game.clouds) {
            game.clouds.forEach(cloud => game.scene.remove(cloud));
            game.clouds = [];
        }

        // Add World 2 galaxy and colored spirals
        createGalaxy();
        createColoredSpirals();

        // Spawn shields in World 2 (limited to 3)
        for (let i = 0; i < 3; i++) {
            const randomX = (Math.random() * 600 - 300);
            const randomZ = (Math.random() * 600 - 300);
            createShieldPickup(randomX, randomZ);
        }

        // Spawn food/potions in World 2 (limited to 4, 5% chance for red potion)
        for (let i = 0; i < 4; i++) {
            const foodX = (Math.random() * 600 - 300);
            const foodZ = (Math.random() * 600 - 300);
            if (Math.random() < 0.05) {
                createRedPotionPickup(foodX, foodZ);
            } else {
                createFoodPickup(foodX, foodZ);
            }
        }

        // Spawn dev book in World 2
        const spellBookX = (Math.random() * 400 - 200);
        const spellBookZ = (Math.random() * 400 - 200);
        createSpellBook(spellBookX, spellBookZ);

        // Create shop in World 2
        createShop(350, 0);

        // Spawn initial enemies in World 2
        spawnEnemy();
        spawnEnemy();
        spawnEnemy();
        spawnEnemy();
        spawnEnemy(); // 5 initial enemies in World 2 (more than World 1's 3)

        showNotification('🎮 Welcome to World 2! Viruses are stronger here!');
        console.log('Entered World 2');
    }, 1000);
}

// Enter world three
function enterWorldThree() {
    // Prevent entering World 3 if already in World 3
    if (game.currentWorld === 3) {
        console.log('Already in World 3');
        return;
    }

    showNotification('🌀 Entering World 3...');

    setTimeout(() => {
        // Clear all enemies
        game.enemies.forEach(enemy => game.scene.remove(enemy));
        game.enemies = [];

        // Remove boss if it exists
        if (game.boss) {
            game.scene.remove(game.boss);
            game.boss = null;
        }

        // Remove portal
        if (game.portal) {
            game.scene.remove(game.portal);
            game.portal = null;
            game.portalSpawned = false;
        }

        // Clear all World 2 items
        // Remove all shields
        game.shields.forEach(shield => game.scene.remove(shield));
        game.shields = [];

        // Remove all foods
        game.foods.forEach(food => game.scene.remove(food));
        game.foods = [];

        // Remove all red potions
        game.redPotions.forEach(potion => game.scene.remove(potion));
        game.redPotions = [];

        // Remove bow if it exists
        if (game.bow) {
            game.scene.remove(game.bow);
            game.bow = null;
        }

        // Remove shop if it exists
        if (game.shop) {
            game.scene.remove(game.shop);
            game.shop = null;
        }

        // Remove dev book if it exists
        if (game.spellBook) {
            game.scene.remove(game.spellBook);
            game.spellBook = null;
        }

        // Remove axe if it exists (only if not collected)
        if (game.axe && !game.axeCollected) {
            game.scene.remove(game.axe);
            game.axe = null;
        }

        // Remove World 2 sky elements (galaxy and spirals)
        if (game.galaxy) {
            game.scene.remove(game.galaxy);
            game.galaxy = null;
        }
        if (game.spirals && game.spirals.length > 0) {
            game.spirals.forEach(spiral => game.scene.remove(spiral));
            game.spirals = []; // Reset spirals array
        }

        // Add World 3 ash clouds
        createAshClouds();

        // Reset boss spawn state
        game.bossSpawned = false;
        game.totalEnemiesSpawned = 0;

        // Teleport player to spawn
        game.camera.position.set(0, game.playerHeight, 0);

        // Change world
        game.currentWorld = 3;

        // Change scene background to indicate World 3 - volcanic/hellish theme
        game.scene.background = new THREE.Color(0xff4400); // Bright orange/red sky
        game.scene.fog = new THREE.Fog(0xff4400, 0, 200); // Orange fog

        // Spawn shields in World 3 (limited to 2)
        for (let i = 0; i < 2; i++) {
            const randomX = (Math.random() * 600 - 300);
            const randomZ = (Math.random() * 600 - 300);
            createShieldPickup(randomX, randomZ);
        }

        // Spawn food/potions in World 3 (limited to 3, 5% chance for red potion)
        for (let i = 0; i < 3; i++) {
            const foodX = (Math.random() * 600 - 300);
            const foodZ = (Math.random() * 600 - 300);
            if (Math.random() < 0.05) {
                createRedPotionPickup(foodX, foodZ);
            } else {
                createFoodPickup(foodX, foodZ);
            }
        }

        // Create shop in World 3
        createShop(350, 0);

        // Create axe pickup in World 3 at a random location (only if not collected yet)
        if (!game.axeCollected && !game.axe) {
            const axeX = (Math.random() * 400 - 200);
            const axeZ = (Math.random() * 400 - 200);
            createAxePickup(axeX, axeZ);
        }

        // Spawn initial enemies in World 3 (7 enemies - more than World 2)
        for (let i = 0; i < 7; i++) {
            spawnEnemy();
        }

        showNotification('🔥 Welcome to World 3! The heat is on!');
        console.log('Entered World 3');
    }, 1000);
}

// Defeat enemy
function defeatEnemy(enemy, index) {
    // Create code explosion effect
    createCodeExplosion(enemy.position);

    game.scene.remove(enemy);
    game.enemies.splice(index, 1);

    // Award EXP - projectile enemies give less EXP
    const expReward = enemy.isProjectileEnemy ? 50 : 100;
    game.playerEXP += expReward;
    updateEXPDisplay();

    // Award coins - all enemies drop 1 coin
    game.coins += 1;
    updateKromerDisplay();

    // Check for level up
    checkLevelUp();

    // Show notification
    showNotification(`💀 Virus defeated! +${expReward} EXP +1 Kromer | ${game.enemies.length} remaining`);
}

// Enemy shoots projectile at player
function shootEnemyProjectile(enemy) {
    const projectileGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, emissive: 0x00ff00 }); // Green to match worm virus
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

    // Position at enemy
    projectile.position.copy(enemy.position);

    // Calculate direction to player
    const direction = new THREE.Vector3();
    direction.subVectors(game.camera.position, enemy.position);
    direction.normalize();

    // Set velocity toward player
    projectile.velocity = new THREE.Vector3(
        direction.x * 30,
        direction.y * 30,
        direction.z * 30
    );

    game.scene.add(projectile);
    game.enemyProjectiles.push(projectile);
}

// Boss shoots high damage projectile at player
function shootBossProjectile(boss) {
    const projectileGeometry = new THREE.SphereGeometry(0.5, 16, 16); // Larger than enemy projectiles
    const projectileMaterial = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        emissive: 0xff00ff
    });
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

    // Position at boss
    projectile.position.copy(boss.position);
    projectile.position.y = boss.position.y; // Same height as boss

    // Calculate direction to player
    const direction = new THREE.Vector3();
    direction.subVectors(game.camera.position, boss.position);
    direction.normalize();

    // Set velocity toward player - faster than enemy projectiles
    projectile.velocity = new THREE.Vector3(
        direction.x * 40,
        direction.y * 40,
        direction.z * 40
    );

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.7, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    projectile.add(glow);

    game.scene.add(projectile);
    game.bossProjectiles.push(projectile);
}

// World 3 boss shoots code fragments that freeze player
function shootCodeProjectile(boss) {
    const codeGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6); // Code cube
    const codeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        emissive: 0xff4400,
        emissiveIntensity: 1
    });
    const projectile = new THREE.Mesh(codeGeometry, codeMaterial);

    // Position at boss
    projectile.position.copy(boss.position);
    projectile.position.y = boss.position.y;

    // Calculate direction to player
    const direction = new THREE.Vector3();
    direction.subVectors(game.camera.position, boss.position);
    direction.normalize();

    // Set velocity toward player
    projectile.velocity = new THREE.Vector3(
        direction.x * 35,
        direction.y * 35,
        direction.z * 35
    );

    // Mark as code projectile (freezes on hit)
    projectile.isCodeProjectile = true;

    // Add trail effect
    const trailGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const trailMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.3,
        wireframe: true
    });
    const trail = new THREE.Mesh(trailGeometry, trailMaterial);
    projectile.add(trail);

    game.scene.add(projectile);
    game.bossProjectiles.push(projectile);
}

// World 3 boss creates wind blast
function createWindBlast(boss) {
    const blastGeometry = new THREE.SphereGeometry(8, 16, 16);
    const blastMaterial = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.4,
        wireframe: true
    });
    const blast = new THREE.Mesh(blastGeometry, blastMaterial);
    blast.position.copy(boss.position);
    blast.scale.set(0.1, 0.1, 0.1);
    blast.isWindBlast = true;
    blast.lifetime = 0.8; // Lasts 0.8 seconds

    game.scene.add(blast);
    if (!game.windBlasts) game.windBlasts = [];
    game.windBlasts.push(blast);

    // Calculate knockback direction from boss to player
    const direction = new THREE.Vector3();
    direction.subVectors(game.camera.position, boss.position);
    direction.y = 0;
    direction.normalize();

    // Apply knockback to player
    const knockbackStrength = 30;
    game.velocity.x += direction.x * knockbackStrength;
    game.velocity.z += direction.z * knockbackStrength;
    game.velocity.y = 10; // Knock player upward

    // Stun boss for 5 seconds
    boss.isStunned = true;
    boss.stunDuration = 5.0;

    showNotification('💨 WIND BLAST! Boss is stunned!');
}

// Update enemy projectiles
function updateEnemyProjectiles(delta) {
    for (let i = game.enemyProjectiles.length - 1; i >= 0; i--) {
        const projectile = game.enemyProjectiles[i];

        // Update position
        projectile.position.x += projectile.velocity.x * delta;
        projectile.position.y += projectile.velocity.y * delta;
        projectile.position.z += projectile.velocity.z * delta;

        // Check collision with player
        const distance = game.camera.position.distanceTo(projectile.position);
        if (distance < 1) {
            // Hit player
            if (game.hasShieldProtection) {
                game.hasShieldProtection = false;
                game.inventory.equippedShield = false;
                removeItemFromInventory('shield');
                showNotification('🛡️ Anti Virus absorbed projectile!');
            } else {
                game.playerHP -= 2; // Enemy projectiles deal 2 damage
                updateHPDisplay();

                if (game.playerHP <= 0) {
                    gameOver();
                } else {
                    showNotification(`💥 Projectile hit! HP: ${game.playerHP}/${game.maxPlayerHP}`);
                }
            }

            // Remove projectile
            game.scene.remove(projectile);
            game.enemyProjectiles.splice(i, 1);
            continue;
        }

        // Remove if too far or hit ground
        if (projectile.position.y < 0 || projectile.position.length() > 500) {
            game.scene.remove(projectile);
            game.enemyProjectiles.splice(i, 1);
        }
    }
}

// Update boss projectiles
function updateBossProjectiles(delta) {
    for (let i = game.bossProjectiles.length - 1; i >= 0; i--) {
        const projectile = game.bossProjectiles[i];

        // Update position
        projectile.position.x += projectile.velocity.x * delta;
        projectile.position.y += projectile.velocity.y * delta;
        projectile.position.z += projectile.velocity.z * delta;

        // Check collision with player
        const distance = game.camera.position.distanceTo(projectile.position);
        if (distance < 1.5) {
            // Hit player
            if (game.hasShieldProtection) {
                game.hasShieldProtection = false;
                game.inventory.equippedShield = false;
                removeItemFromInventory('shield');
                showNotification('🛡️ Anti Virus absorbed boss projectile!');
            } else {
                // Code projectiles (World 3 boss) do 1 damage and freeze
                if (projectile.isCodeProjectile) {
                    game.playerHP -= 1;
                    updateHPDisplay();

                    // Freeze player for 3 seconds
                    game.playerFrozen = true;
                    game.freezeDuration = 3.0;

                    if (game.playerHP <= 0) {
                        gameOver();
                    } else {
                        showNotification(`🧊 CODE HIT! FROZEN! HP: ${game.playerHP}/${game.maxPlayerHP}`);
                    }
                } else {
                    // Regular boss projectiles deal 5 damage
                    game.playerHP -= 5;
                    updateHPDisplay();

                    if (game.playerHP <= 0) {
                        gameOver();
                    } else {
                        showNotification(`💥 BOSS PROJECTILE HIT! HP: ${game.playerHP}/${game.maxPlayerHP}`);
                    }
                }
            }

            // Remove projectile
            game.scene.remove(projectile);
            game.bossProjectiles.splice(i, 1);
            continue;
        }

        // Remove if too far or hit ground
        if (projectile.position.y < 0 || projectile.position.length() > 500) {
            game.scene.remove(projectile);
            game.bossProjectiles.splice(i, 1);
        }
    }
}

// Check and handle level up
function checkLevelUp() {
    if (game.playerEXP >= game.expToNextLevel) {
        game.playerLevel++;
        game.playerDamage++;
        game.playerEXP -= game.expToNextLevel;

        // Increase max HP by 5 and heal to full
        game.maxPlayerHP += 5;
        game.playerHP = game.maxPlayerHP;
        updateHPDisplay();

        // Increase max mana by 5 and restore to full
        game.maxPlayerMana += 5;
        game.playerMana = game.maxPlayerMana;
        updateManaDisplay();

        // Set EXP requirement for next level
        if (game.playerLevel === 2) {
            game.expToNextLevel = 1000; // Level 2->3 requires 1000 EXP
        } else if (game.playerLevel === 3) {
            game.expToNextLevel = 3000; // Level 3->4 requires 3000 EXP
        } else if (game.playerLevel === 4) {
            game.expToNextLevel = 6000; // Level 4->5 requires 6000 EXP
        } else if (game.playerLevel === 5) {
            game.expToNextLevel = 10000; // Level 5->6 requires 10000 EXP
        } else if (game.playerLevel >= 6) {
            game.expToNextLevel = 999999; // Max level reached (Level 6)
        }

        updateEXPDisplay();

        // Show level up notification with HP increase
        showNotification(`🎉 LEVEL UP! Level ${game.playerLevel} | DMG: ${game.playerDamage} | HP: ${game.playerHP}/${game.maxPlayerHP}`);

        // Check if we leveled up again (in case of overflow EXP)
        if (game.playerEXP >= game.expToNextLevel && game.playerLevel < 6) {
            setTimeout(() => checkLevelUp(), 100);
        }
    }
}

// Update all enemies AI
function updateEnemy(delta) {
    if (game.isGameOver || !game.isPointerLocked || game.inventory.isOpen) return;

    const enemyRadius = 1.25; // Enemy collision radius (smaller for smaller enemies)
    const moveSpeed = game.enemySpeed * delta;

    // Helper function to test if a position is valid (no collision)
    function isPositionValid(testPos, currentEnemy) {
        // Check collision with walls/objects
        for (let obj of game.objects) {
            const box = new THREE.Box3().setFromObject(obj);
            const enemyBox = new THREE.Box3(
                new THREE.Vector3(
                    testPos.x - enemyRadius,
                    testPos.y - 1,
                    testPos.z - enemyRadius
                ),
                new THREE.Vector3(
                    testPos.x + enemyRadius,
                    testPos.y + 1,
                    testPos.z + enemyRadius
                )
            );
            if (box.intersectsBox(enemyBox)) {
                return false;
            }
        }

        // Check collision with other enemies
        for (let otherEnemy of game.enemies) {
            if (otherEnemy === currentEnemy) continue; // Skip self

            const distance = testPos.distanceTo(otherEnemy.position);
            const minDistance = 2.0; // Minimum distance between enemies (prevents phasing)

            if (distance < minDistance) {
                return false; // Too close to another enemy
            }
        }

        return true;
    }

    // Update each enemy
    for (let i = 0; i < game.enemies.length; i++) {
        const enemy = game.enemies[i];

        // Animate virus visuals (rotation and orbiting cubes)
        if (enemy.children) {
            enemy.children.forEach(child => {
                // Rotate core octahedron (melee virus)
                if (child.geometry && child.geometry.type === 'OctahedronGeometry' && child.material.transparent) {
                    child.rotation.y += delta * 2;
                    child.rotation.x += delta * 1;
                }
                // Animate orbiting data cubes (melee virus)
                if (child.userData && child.userData.isOrbitCube) {
                    child.userData.orbitAngle += delta * 2;
                    child.position.x = Math.cos(child.userData.orbitAngle) * 1.5;
                    child.position.z = Math.sin(child.userData.orbitAngle) * 1.5;
                    child.rotation.y += delta * 3;
                }
                // Animate orbiting data packets (ranged worm virus)
                if (child.userData && child.userData.isOrbitPacket) {
                    child.userData.orbitAngle += delta * 3;
                    child.position.x = Math.cos(child.userData.orbitAngle) * 1.2;
                    child.position.z = Math.sin(child.userData.orbitAngle) * 1.2;
                    child.rotation.y += delta * 4;
                    child.rotation.x += delta * 2;
                }
                // Animate pulsating signal rings (ranged worm virus)
                if (child.userData && child.userData.isPulseRing) {
                    const pulseScale = 1 + Math.sin(Date.now() * 0.003 + child.userData.offset) * 0.3;
                    child.scale.set(pulseScale, pulseScale, pulseScale);
                    child.material.opacity = 0.3 + Math.sin(Date.now() * 0.003 + child.userData.offset) * 0.2;
                }
            });
        }

        // Calculate direction to player
        const directionToPlayer = new THREE.Vector3();
        directionToPlayer.subVectors(game.camera.position, enemy.position);
        directionToPlayer.y = 0; // Keep enemy on ground level
        const distanceToPlayer = directionToPlayer.length();
        directionToPlayer.normalize();

        // Skip movement if enemy is frozen
        if (enemy.isFrozen) {
            // Make frozen enemies look at player but don't move
            enemy.lookAt(game.camera.position.x, enemy.position.y, game.camera.position.z);
            continue;
        }

        // Handle projectile enemies differently
        if (enemy.isProjectileEnemy) {
            // Projectile enemies keep distance and shoot
            const preferredDistance = 20; // Keep 20 units away

            // Update shoot timer
            enemy.shootTimer -= delta;
            if (enemy.shootTimer <= 0 && distanceToPlayer < 50) {
                // Shoot projectile at player
                shootEnemyProjectile(enemy);
                enemy.shootTimer = enemy.shootCooldown;
            }

            // Movement: maintain distance
            if (distanceToPlayer < preferredDistance) {
                // Too close, back away
                const backupMove = new THREE.Vector3(
                    enemy.position.x - directionToPlayer.x * moveSpeed * 0.5,
                    enemy.position.y,
                    enemy.position.z - directionToPlayer.z * moveSpeed * 0.5
                );
                if (isPositionValid(backupMove, enemy)) {
                    enemy.position.copy(backupMove);
                }
            } else if (distanceToPlayer > preferredDistance + 10) {
                // Too far, move closer
                const approachMove = new THREE.Vector3(
                    enemy.position.x + directionToPlayer.x * moveSpeed * 0.3,
                    enemy.position.y,
                    enemy.position.z + directionToPlayer.z * moveSpeed * 0.3
                );
                if (isPositionValid(approachMove, enemy)) {
                    enemy.position.copy(approachMove);
                }
            }
            // Otherwise stay at current distance

            // Make enemy look at player
            enemy.lookAt(game.camera.position.x, enemy.position.y, game.camera.position.z);

            // Add bobbing animation
            enemy.position.y = 1 + Math.sin(Date.now() * 0.003) * 0.15;

            // Skip regular enemy collision check (they don't melee)
            continue;
        }

        // Handle warrior enemies with dash ability
        if (enemy.isWarriorEnemy) {
            // Update dash timer
            enemy.dashTimer -= delta;

            if (enemy.isWindingUp) {
                // Wind-up phase - enemy stands still and prepares to dash
                enemy.windUpDuration -= delta;

                if (enemy.windUpDuration <= 0) {
                    // Wind-up complete - start actual dash
                    enemy.isWindingUp = false;
                    enemy.isDashing = true;
                    enemy.dashDuration = 1.0; // Dash for 1 second
                }

                // Make enemy look at player during wind-up (this sets the dash direction)
                enemy.lookAt(game.camera.position.x, enemy.position.y, game.camera.position.z);

                // Store the direction TO PLAYER (dash towards player)
                enemy.dashDirection.copy(directionToPlayer);

                // Pulsing animation during wind-up
                const pulseScale = 1 + Math.sin(Date.now() * 0.015) * 0.15;
                enemy.scale.set(pulseScale, pulseScale, pulseScale);

            } else if (enemy.isDashing) {
                // Currently dashing - move fast towards player
                enemy.dashDuration -= delta;

                if (enemy.dashDuration <= 0) {
                    // Dash ended
                    enemy.isDashing = false;
                    enemy.dashDuration = 0;
                    enemy.scale.set(1, 1, 1); // Reset scale
                } else {
                    // Continue dashing at high speed towards player
                    const dashSpeed = moveSpeed * 3; // 3x normal speed
                    const dashMove = new THREE.Vector3(
                        enemy.position.x + enemy.dashDirection.x * dashSpeed,
                        enemy.position.y,
                        enemy.position.z + enemy.dashDirection.z * dashSpeed
                    );

                    // Check for wall collisions - respect walls but dash through player
                    if (isPositionValid(dashMove, enemy)) {
                        enemy.position.copy(dashMove);
                    }
                    // If hits a wall, just stops moving but continues dash timer
                }
            } else {
                // Not winding up or dashing - check if should start wind-up
                if (enemy.dashTimer <= 0 && distanceToPlayer < 40) {
                    // Start wind-up
                    enemy.isWindingUp = true;
                    enemy.windUpDuration = 0.6; // Wind-up for 0.6 seconds
                    enemy.dashTimer = enemy.dashCooldown; // Reset cooldown
                } else {
                    // Normal movement when not winding up or dashing
                    const normalMove = new THREE.Vector3(
                        enemy.position.x + directionToPlayer.x * moveSpeed * 0.7, // Slightly slower than regular
                        enemy.position.y,
                        enemy.position.z + directionToPlayer.z * moveSpeed * 0.7
                    );
                    if (isPositionValid(normalMove, enemy)) {
                        enemy.position.copy(normalMove);
                    }
                }
            }

            // Animate warrior legs and pentagons
            enemy.children.forEach(child => {
                // Animate legs - walking or retracted
                if (child.userData && child.userData.isLeg) {
                    const legIndex = child.userData.legIndex;
                    const side = child.userData.side;
                    const zPosition = child.userData.zPosition;

                    if (enemy.isDashing) {
                        // Retract legs during dash - pull them inward and upward
                        child.children.forEach((segment, segIndex) => {
                            const retractScale = 0.3; // Scale down to 30%
                            if (segIndex === 0) { // Upper leg
                                segment.position.set(
                                    side * 0.4,
                                    0.3,
                                    zPosition
                                );
                                segment.scale.y = retractScale;
                            } else if (segIndex === 1) { // Middle leg
                                segment.position.set(
                                    side * 0.5,
                                    0.2,
                                    zPosition
                                );
                                segment.scale.y = retractScale;
                            } else { // Foot
                                segment.position.set(
                                    side * 0.6,
                                    0.1,
                                    zPosition
                                );
                                segment.scale.y = retractScale;
                            }
                        });
                    } else {
                        // Normal walking animation - legs move up and down
                        const walkCycle = Date.now() * 0.005 + legIndex * Math.PI / 3;
                        const walkOffset = Math.sin(walkCycle) * 0.15;

                        child.children.forEach((segment, segIndex) => {
                            if (segIndex === 0) { // Upper leg
                                segment.position.set(
                                    side * 1.0,
                                    0.1 + walkOffset,
                                    zPosition
                                );
                                segment.scale.y = 1;
                            } else if (segIndex === 1) { // Middle leg
                                segment.position.set(
                                    side * 1.5,
                                    -0.4 + walkOffset * 0.7,
                                    zPosition
                                );
                                segment.scale.y = 1;
                            } else { // Foot
                                segment.position.set(
                                    side * 1.7,
                                    -0.85 + walkOffset * 0.5,
                                    zPosition
                                );
                                segment.scale.y = 1;
                            }
                        });
                    }
                }

                // Animate orbiting pentagons
                if (child.userData && child.userData.isPentagon) {
                    child.userData.orbitAngle += delta * 2;
                    child.position.x = Math.cos(child.userData.orbitAngle) * 2.2;
                    child.position.z = Math.sin(child.userData.orbitAngle) * 2.2;
                    child.rotation.y += delta * 3;
                }
            });

            // Simple rotation animation for warrior body (only when not winding up or dashing)
            if (!enemy.isWindingUp && !enemy.isDashing) {
                enemy.rotation.y += delta * 0.5;
            }

            // Make enemy look at player (except during dash - it should maintain direction)
            if (!enemy.isDashing) {
                enemy.lookAt(game.camera.position.x, enemy.position.y, game.camera.position.z);
            }

            // Check collision with player
            if (distanceToPlayer < 2) {
                // Damage player
                if (!game.hasShieldProtection) {
                    game.playerHP -= 5; // Warriors do heavy damage
                    updateHPDisplay();

                    // Knockback player 2 units away from warrior
                    const knockbackDirection = new THREE.Vector3();
                    knockbackDirection.subVectors(game.camera.position, enemy.position);
                    knockbackDirection.y = 0;
                    knockbackDirection.normalize();
                    knockbackDirection.multiplyScalar(2);

                    game.camera.position.x += knockbackDirection.x;
                    game.camera.position.z += knockbackDirection.z;

                    if (game.playerHP <= 0) {
                        gameOver();
                    }
                } else {
                    // Shield blocks hit
                    game.hasShieldProtection = false;
                    updateShieldDisplay();
                    showNotification('🛡️ Anti Virus blocked attack!');
                }
            }

            continue; // Skip regular enemy logic
        }

        // Try multiple movement strategies in order of preference (regular enemies only)
        const strategies = [
            directionToPlayer.clone(), // 1. Direct path to player
            new THREE.Vector3(-directionToPlayer.z, 0, directionToPlayer.x), // 2. Left perpendicular
            new THREE.Vector3(directionToPlayer.z, 0, -directionToPlayer.x), // 3. Right perpendicular
            new THREE.Vector3( // 4. Diagonal left
                directionToPlayer.x - directionToPlayer.z,
                0,
                directionToPlayer.z + directionToPlayer.x
            ).normalize(),
            new THREE.Vector3( // 5. Diagonal right
                directionToPlayer.x + directionToPlayer.z,
                0,
                directionToPlayer.z - directionToPlayer.x
            ).normalize()
        ];

        let bestMove = null;
        let bestScore = -Infinity;

        // Test each strategy and pick the best one
        for (let strategy of strategies) {
            const testPos = new THREE.Vector3(
                enemy.position.x + strategy.x * moveSpeed,
                enemy.position.y,
                enemy.position.z + strategy.z * moveSpeed
            );

            if (isPositionValid(testPos, enemy)) {
                // Score based on how much it moves toward the player
                const score = strategy.dot(directionToPlayer);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = testPos;
                }
            }
        }

        // If we found a valid move, use it
        if (bestMove) {
            enemy.position.copy(bestMove);
        } else {
            // If completely stuck, try wall-sliding
            // Try X-axis only movement
            const slideX = new THREE.Vector3(
                enemy.position.x + directionToPlayer.x * moveSpeed,
                enemy.position.y,
                enemy.position.z
            );
            if (isPositionValid(slideX, enemy)) {
                enemy.position.copy(slideX);
            } else {
                // Try Z-axis only movement
                const slideZ = new THREE.Vector3(
                    enemy.position.x,
                    enemy.position.y,
                    enemy.position.z + directionToPlayer.z * moveSpeed
                );
                if (isPositionValid(slideZ, enemy)) {
                    enemy.position.copy(slideZ);
                }
                // If both fail, enemy stays in place this frame
            }
        }

        // Make enemy look at player
        enemy.lookAt(game.camera.position.x, enemy.position.y, game.camera.position.z);

        // Add bobbing animation
        enemy.position.y = 1 + Math.sin(Date.now() * 0.003) * 0.15;

        // Check collision with player
        const distance = game.camera.position.distanceTo(enemy.position);
        if (distance < 2.5) {
            // Enemy hits player
            if (!enemy.hasHitPlayer) {
                enemy.hasHitPlayer = true;

                if (game.hasShieldProtection) {
                    // Shield protects - teleport player and enemy apart
                    game.hasShieldProtection = false;
                    game.inventory.equippedShield = false;
                    removeItemFromInventory('shield'); // Remove shield from inventory

                    // Calculate direction from enemy to player
                    const pushDirection = new THREE.Vector3();
                    pushDirection.subVectors(game.camera.position, enemy.position);
                    pushDirection.y = 0;
                    pushDirection.normalize();

                    // Save old position
                    const oldX = game.camera.position.x;
                    const oldZ = game.camera.position.z;

                    // Move player 6 steps away
                    game.camera.position.x += pushDirection.x * 12;
                    game.camera.position.z += pushDirection.z * 12;

                    // Check for wall collision and revert if needed
                    if (checkWallCollision()) {
                        game.camera.position.x = oldX;
                        game.camera.position.z = oldZ;
                    }

                    // Move enemy 6 steps in opposite direction
                    enemy.position.x -= pushDirection.x * 12;
                    enemy.position.z -= pushDirection.z * 12;

                    showNotification('🛡️ Anti Virus absorbed the hit! Find another Anti Virus for protection.');
                } else {
                    // Take damage
                    game.playerHP -= 1;
                    updateHPDisplay();

                    // Save old position
                    const oldX = game.camera.position.x;
                    const oldZ = game.camera.position.z;

                    // Push player back
                    const pushDirection = new THREE.Vector3();
                    pushDirection.subVectors(game.camera.position, enemy.position);
                    pushDirection.y = 0;
                    pushDirection.normalize();
                    game.camera.position.x += pushDirection.x * 5;
                    game.camera.position.z += pushDirection.z * 5;

                    // Check for wall collision and revert if needed
                    if (checkWallCollision()) {
                        game.camera.position.x = oldX;
                        game.camera.position.z = oldZ;
                    }

                    if (game.playerHP <= 0) {
                        gameOver();
                    } else {
                        showNotification(`❤️ Hit! HP: ${game.playerHP}/${game.maxPlayerHP}`);
                    }
                }

                // Reset hit flag after cooldown
                setTimeout(() => {
                    if (enemy) {
                        enemy.hasHitPlayer = false;
                    }
                }, 1000);
            }
        }
    }
}

// Update boss behavior
function updateBoss(delta) {
    if (!game.boss || game.isGameOver || !game.isPointerLocked || game.inventory.isOpen) return;

    const boss = game.boss;

    // Animate boss visuals (for World 1 boss)
    if (!boss.isWorld2Boss && boss.children) {
        boss.children.forEach(child => {
            // Rotate middle layer opposite direction
            if (child.userData && child.userData.isMiddleLayer) {
                child.rotation.y += delta * 1.5;
                child.rotation.x += delta * 0.5;
            }
            // Rotate outer wireframe
            if (child.userData && child.userData.isOuterWireframe) {
                child.rotation.y -= delta * 2;
                child.rotation.z += delta * 0.8;
            }
            // Pulse core
            if (child.userData && child.userData.isPulsingCore) {
                child.rotation.y += delta * 3;
                child.rotation.x += delta * 2;
                // Pulsing scale effect
                const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
                child.scale.set(scale, scale, scale);
            }
            // Animate orbiting cubes
            if (child.userData && child.userData.isBossOrbitCube) {
                child.userData.orbitAngle += delta * (1 + child.userData.orbitRing * 0.3);
                child.position.x = Math.cos(child.userData.orbitAngle) * child.userData.orbitRadius;
                child.position.z = Math.sin(child.userData.orbitAngle) * child.userData.orbitRadius;
                child.rotation.y += delta * 4;
                child.rotation.x += delta * 3;
            }
        });
    }

    // Handle World 3 boss (code shooter + wind blast)
    if (boss.isWorld3Boss) {
        updateWorld3Boss(delta);
        return;
    }

    // Handle World 2 boss differently (teleport + projectile shooter)
    if (boss.isWorld2Boss) {
        updateWorld2Boss(delta);
        return;
    }

    // World 1 Boss logic (jump attack boss)
    // Update stun timer
    if (boss.stunned) {
        boss.stunnedTimer -= delta;
        if (boss.stunnedTimer <= 0) {
            boss.stunned = false;
            showNotification('⚠️ Boss recovered!');
        }
        // Boss doesn't move when stunned, but still check collision
        checkBossCollision();
        return;
    }

    // Update jump timer
    if (!boss.isJumping) {
        boss.jumpTimer -= delta;
        if (boss.jumpTimer <= 0) {
            // Start jump attack
            boss.isJumping = true;
            boss.jumpStartY = boss.position.y;
            boss.jumpHeight = 0;
            boss.jumpVelocity = 30; // Initial upward velocity
            showNotification('⚠️ Boss is jumping!');
        }
    }

    // Handle jump physics
    if (boss.isJumping) {
        // Apply gravity to jump
        boss.jumpVelocity -= game.gravity * delta;
        boss.jumpHeight += boss.jumpVelocity * delta;
        boss.position.y = boss.jumpStartY + boss.jumpHeight;

        // Check if boss landed
        if (boss.position.y <= boss.jumpStartY) {
            boss.position.y = boss.jumpStartY;
            boss.isJumping = false;
            boss.jumpTimer = game.bossJumpCooldown; // Reset jump timer

            // Create shockwave on landing
            createShockwave(boss.position.x, boss.position.z);

            // Stun boss for 5 seconds
            boss.stunned = true;
            boss.stunnedTimer = 5;
            showNotification('💥 SHOCKWAVE! Boss stunned for 5 seconds');
        }
    } else {
        // Normal movement when not jumping or stunned
        const bossRadius = 3.5; // Boss collision radius
        // Boss moves slower when frozen
        const baseSpeed = game.enemySpeed * 0.5;
        const moveSpeed = (boss.isFrozen ? baseSpeed * 0.3 : baseSpeed) * delta; // 70% slower when frozen

        // Calculate direction to player
        const directionToPlayer = new THREE.Vector3();
        directionToPlayer.subVectors(game.camera.position, boss.position);
        directionToPlayer.y = 0;
        directionToPlayer.normalize();

        // Move boss toward player (simplified pathfinding for boss)
        boss.position.x += directionToPlayer.x * moveSpeed;
        boss.position.z += directionToPlayer.z * moveSpeed;

        // Make boss look at player
        boss.lookAt(game.camera.position.x, boss.position.y, game.camera.position.z);

        // Subtle bobbing for boss
        boss.position.y = boss.jumpStartY + Math.sin(Date.now() * 0.002) * 0.3;
    }

    // Check collision with player
    checkBossCollision();
}

// Update World 2 boss behavior (teleport + projectile shooter)
function updateWorld2Boss(delta) {
    const boss = game.boss;
    if (!boss) return;

    // Update teleport timer
    boss.teleportTimer -= delta;
    if (boss.teleportTimer <= 0) {
        // Teleport to a new position 15 units away in a random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = 15;
        const newX = game.camera.position.x + Math.cos(angle) * distance;
        const newZ = game.camera.position.z + Math.sin(angle) * distance;

        // Create teleport effect at old position
        createTeleportEffect(boss.position.x, boss.position.z);

        boss.position.x = newX;
        boss.position.z = newZ;

        // Create teleport effect at new position
        createTeleportEffect(newX, newZ);

        boss.teleportTimer = game.bossTeleportCooldown;
        showNotification('⚡ Boss teleported!');
    }

    // Update shoot timer
    boss.shootTimer -= delta;
    if (boss.shootTimer <= 0) {
        shootBossProjectile(boss);
        boss.shootTimer = game.bossShootCooldown;
    }

    // Fast movement toward player when not teleporting - faster than World 1 boss
    // Slow down when frozen
    const baseSpeed = game.enemySpeed * 0.8;
    const moveSpeed = (boss.isFrozen ? baseSpeed * 0.3 : baseSpeed) * delta; // 70% slower when frozen
    const directionToPlayer = new THREE.Vector3();
    directionToPlayer.subVectors(game.camera.position, boss.position);
    directionToPlayer.y = 0;
    directionToPlayer.normalize();

    boss.position.x += directionToPlayer.x * moveSpeed;
    boss.position.z += directionToPlayer.z * moveSpeed;

    // Make boss look at player
    boss.lookAt(game.camera.position.x, boss.position.y, game.camera.position.z);

    // Animate World 2 boss visuals (data packets and pulse rings)
    boss.children.forEach(child => {
        // Rotate data packets around boss
        if (child.userData.isOrbitPacket) {
            child.userData.orbitAngle += delta * 2.5;
            const radius = child.userData.orbitRadius;
            child.position.x = Math.cos(child.userData.orbitAngle) * radius;
            child.position.z = Math.sin(child.userData.orbitAngle) * radius;
            // Rotate the packets themselves
            child.rotation.x += delta * 3;
            child.rotation.y += delta * 2;
        }
        // Animate pulsating signal rings
        if (child.userData.isPulseRing) {
            const pulseScale = 1 + Math.sin(Date.now() * 0.003 + child.userData.offset) * 0.25;
            child.scale.set(pulseScale, pulseScale, pulseScale);
            child.material.opacity = 0.4 + Math.sin(Date.now() * 0.003 + child.userData.offset) * 0.3;
            child.rotation.y += delta * 1.5;
        }
    });

    // Floating animation
    boss.position.y = boss.jumpStartY + Math.sin(Date.now() * 0.003) * 0.4;

    // Check collision with player
    checkBossCollision();
}

// Update World 3 boss behavior (code shooter + wind blast)
function updateWorld3Boss(delta) {
    const boss = game.boss;
    if (!boss) return;

    // Handle stun from wind blast
    if (boss.isStunned) {
        boss.stunDuration -= delta;
        if (boss.stunDuration <= 0) {
            boss.isStunned = false;
            boss.stunDuration = 0;
            showNotification('⚠️ Boss recovered!');
        }
        // Boss doesn't move or attack when stunned
        // Still animate visuals
        animateWorld3Boss(boss, delta);
        return;
    }

    // Update code shoot timer
    boss.codeShootTimer -= delta;
    if (boss.codeShootTimer <= 0) {
        shootCodeProjectile(boss);
        boss.codeShootTimer = 2; // Shoot every 2 seconds
    }

    // Update wind blast timer
    boss.windBlastTimer -= delta;
    if (boss.windBlastTimer <= 0) {
        createWindBlast(boss);
        boss.windBlastTimer = 8; // Wind blast every 8 seconds
    }

    // Fast movement toward player - faster than other bosses
    const baseSpeed = game.enemySpeed * 1.0;
    const moveSpeed = (boss.isFrozen ? baseSpeed * 0.3 : baseSpeed) * delta;
    const directionToPlayer = new THREE.Vector3();
    directionToPlayer.subVectors(game.camera.position, boss.position);
    directionToPlayer.y = 0;
    directionToPlayer.normalize();

    boss.position.x += directionToPlayer.x * moveSpeed;
    boss.position.z += directionToPlayer.z * moveSpeed;

    // Make boss look at player
    boss.lookAt(game.camera.position.x, boss.position.y, game.camera.position.z);

    // Animate visuals
    animateWorld3Boss(boss, delta);

    // Floating animation
    boss.position.y = boss.jumpStartY + Math.sin(Date.now() * 0.004) * 0.5;

    // Check collision with player
    checkBossCollision();
}

// Animate World 3 boss visuals
function animateWorld3Boss(boss, delta) {
    const time = Date.now() * 0.001;

    boss.children.forEach(child => {
        // Animate futuristic eyes - scanning effect
        if (child.userData && child.userData.isFuturisticEye) {
            const scanline = child.userData.scanline;
            if (scanline) {
                // Vertical scanning motion
                scanline.position.y = Math.sin(time * 4) * 0.3;

                // Pulsing scanline intensity
                const pulse = 0.6 + Math.sin(time * 8) * 0.4;
                scanline.material.opacity = pulse;
            }

            // Slight rotation for tech feel
            child.rotation.z = Math.sin(time * 2) * 0.05;

            // Pulse the entire eye group
            const eyePulse = 1.0 + Math.sin(time * 3) * 0.05;
            child.scale.set(eyePulse, eyePulse, 1);
        }

        // Animate dark orbs orbiting the Dark Lord
        if (child.userData && child.userData.isDarkOrb) {
            child.userData.orbitAngle += delta * 1.5;
            const radius = 5;
            const height = Math.sin(child.userData.orbitAngle * 3) * 1.5;
            child.position.x = Math.cos(child.userData.orbitAngle) * radius;
            child.position.y = 2 + height;
            child.position.z = Math.sin(child.userData.orbitAngle) * radius;

            // Pulsing glow effect
            const pulse = 0.5 + Math.sin(time * 3 + child.userData.orbitAngle) * 0.3;
            child.material.opacity = pulse;
        }

        // Animate flowing tendrils (cape effect)
        if (child.userData && child.userData.isTendril) {
            const sway = Math.sin(time * 2 + child.userData.baseAngle) * 0.2;
            child.rotation.z = Math.cos(child.userData.baseAngle) * 0.3 + sway;
            child.rotation.x = Math.sin(child.userData.baseAngle) * 0.3 + sway * 0.5;
        }

        // Rotate the dark aura
        if (child.userData && child.userData.isAura) {
            child.rotation.y += delta * 0.5;
            child.rotation.x += delta * 0.3;
        }
    });
}

// Check boss collision with player
function checkBossCollision() {
    const boss = game.boss;
    if (!boss) return;

    const distance = game.camera.position.distanceTo(boss.position);
    if (distance < 5) {
        // Boss hits player
        if (!boss.hasHitPlayer) {
            boss.hasHitPlayer = true;

            if (game.hasShieldProtection) {
                // Shield protects
                game.hasShieldProtection = false;
                game.inventory.equippedShield = false;
                removeItemFromInventory('shield'); // Remove shield from inventory

                const pushDirection = new THREE.Vector3();
                pushDirection.subVectors(game.camera.position, boss.position);
                pushDirection.y = 0;
                pushDirection.normalize();

                // Save old position
                const oldX = game.camera.position.x;
                const oldZ = game.camera.position.z;

                game.camera.position.x += pushDirection.x * 20;
                game.camera.position.z += pushDirection.z * 20;

                // Check for wall collision and revert if needed
                if (checkWallCollision()) {
                    game.camera.position.x = oldX;
                    game.camera.position.z = oldZ;
                }

                boss.position.x -= pushDirection.x * 20;
                boss.position.z -= pushDirection.z * 20;

                showNotification('🛡️ Anti Virus absorbed the boss hit!');
            } else {
                // Take 2 damage from boss
                game.playerHP -= 2;
                updateHPDisplay();

                // Save old position
                const oldX = game.camera.position.x;
                const oldZ = game.camera.position.z;

                // Push player back
                const pushDirection = new THREE.Vector3();
                pushDirection.subVectors(game.camera.position, boss.position);
                pushDirection.y = 0;
                pushDirection.normalize();
                game.camera.position.x += pushDirection.x * 10;
                game.camera.position.z += pushDirection.z * 10;

                // Check for wall collision and revert if needed
                if (checkWallCollision()) {
                    game.camera.position.x = oldX;
                    game.camera.position.z = oldZ;
                }

                if (game.playerHP <= 0) {
                    gameOver();
                } else {
                    showNotification(`⚠️ Boss hit! HP: ${game.playerHP}/${game.maxPlayerHP}`);
                }
            }

            // Reset hit flag
            setTimeout(() => {
                if (boss) {
                    boss.hasHitPlayer = false;
                }
            }, 1000);
        }
    }
}

// Create shockwave effect
function createShockwave(x, z) {
    // Visual shockwave ring
    const ringGeometry = new THREE.RingGeometry(1, 2, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const shockwave = new THREE.Mesh(ringGeometry, ringMaterial);
    shockwave.position.set(x, 0.5, z);
    shockwave.rotation.x = -Math.PI / 2;
    game.scene.add(shockwave);

    // Create 3D shockwave wave visual (cylinder expanding upward)
    const waveGeometry = new THREE.CylinderGeometry(1, 1, 3, 32, 1, true);
    const waveMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const wave3D = new THREE.Mesh(waveGeometry, waveMaterial);
    wave3D.position.set(x, 1.5, z);
    game.scene.add(wave3D);

    // Animate shockwave expansion
    let radius = 1;
    const maxRadius = 30;
    const expandSpeed = 40;
    const shockwaveHeight = 3; // Height of the shockwave

    const expandInterval = setInterval(() => {
        radius += expandSpeed * 0.016; // Roughly 60fps

        // Update 2D ring
        shockwave.geometry.dispose();
        shockwave.geometry = new THREE.RingGeometry(radius, radius + 2, 32);
        shockwave.material.opacity = 0.8 * (1 - radius / maxRadius);

        // Update 3D wave
        wave3D.geometry.dispose();
        wave3D.geometry = new THREE.CylinderGeometry(radius, radius, shockwaveHeight, 32, 1, true);
        wave3D.material.opacity = 0.3 * (1 - radius / maxRadius);

        // Check if shockwave hits player - NOW DODGEABLE BY JUMPING
        const distToPlayer = Math.sqrt(
            (game.camera.position.x - x) ** 2 +
            (game.camera.position.z - z) ** 2
        );

        // Player can dodge by jumping - check if player is within height range
        const playerHeight = game.camera.position.y;
        const isPlayerInShockwaveHeight = playerHeight < shockwaveHeight; // If player jumps above 3 units, they dodge

        if (distToPlayer <= radius && distToPlayer >= radius - 2 && isPlayerInShockwaveHeight) {
            // Player is in shockwave range AND low enough to be hit
            if (!shockwave.hitPlayer) {
                shockwave.hitPlayer = true;

                if (game.hasShieldProtection) {
                    game.hasShieldProtection = false;
                    game.inventory.equippedShield = false;
                    removeItemFromInventory('shield'); // Remove shield from inventory
                    showNotification('🛡️ Anti Virus absorbed shockwave!');
                } else {
                    game.playerHP -= 3;
                    updateHPDisplay();

                    // Save old position
                    const oldX = game.camera.position.x;
                    const oldZ = game.camera.position.z;

                    // Knock player back
                    const pushDir = new THREE.Vector3();
                    pushDir.subVectors(game.camera.position, new THREE.Vector3(x, game.camera.position.y, z));
                    pushDir.y = 0;
                    pushDir.normalize();
                    game.camera.position.x += pushDir.x * 15;
                    game.camera.position.z += pushDir.z * 15;

                    // Check for wall collision and revert if needed
                    if (checkWallCollision()) {
                        game.camera.position.x = oldX;
                        game.camera.position.z = oldZ;
                    }

                    if (game.playerHP <= 0) {
                        gameOver();
                    } else {
                        showNotification(`💥 Shockwave hit! HP: ${game.playerHP}/${game.maxPlayerHP}`);
                    }
                }
            }
        }

        if (radius >= maxRadius) {
            clearInterval(expandInterval);
            game.scene.remove(shockwave);
            game.scene.remove(wave3D);
            shockwave.geometry.dispose();
            shockwave.material.dispose();
            wave3D.geometry.dispose();
            wave3D.material.dispose();
        }
    }, 16); // ~60fps
}

// Create teleport effect
function createTeleportEffect(x, z) {
    // Create purple particle effect
    for (let i = 0; i < 10; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        particle.position.set(
            x + (Math.random() - 0.5) * 2,
            Math.random() * 3,
            z + (Math.random() - 0.5) * 2
        );

        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            Math.random() * 5 + 2,
            (Math.random() - 0.5) * 5
        );

        game.scene.add(particle);

        // Animate and remove particle
        let life = 1.0;
        const particleInterval = setInterval(() => {
            particle.position.x += particle.velocity.x * 0.016;
            particle.position.y += particle.velocity.y * 0.016;
            particle.position.z += particle.velocity.z * 0.016;
            particle.velocity.y -= 9.8 * 0.016; // Gravity

            life -= 0.016 * 2;
            particle.material.opacity = life * 0.8;

            if (life <= 0) {
                clearInterval(particleInterval);
                game.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
            }
        }, 16);
    }
}

// Update HP display
function updateHPDisplay() {
    const hpDisplay = document.getElementById('hpDisplay');
    if (hpDisplay) {
        hpDisplay.textContent = `HP: ${game.playerHP}/${game.maxPlayerHP}`;

        // Change color based on HP
        if (game.playerHP <= 5) {
            hpDisplay.style.color = '#ff4444';
            hpDisplay.style.borderColor = '#ff4444';
        } else if (game.playerHP <= 10) {
            hpDisplay.style.color = '#ffaa44';
            hpDisplay.style.borderColor = '#ffaa44';
        } else {
            hpDisplay.style.color = '#44ff44';
            hpDisplay.style.borderColor = '#44ff44';
        }
    }
}

// Update EXP display
function updateEXPDisplay() {
    const expDisplay = document.getElementById('expDisplay');
    if (expDisplay) {
        const expPercent = (game.playerEXP / game.expToNextLevel) * 100;
        const levelText = game.playerLevel >= 6 ? 'MAX' : `Lv.${game.playerLevel}`;
        const expText = game.playerLevel >= 6 ? 'MAX LEVEL' : `${game.playerEXP}/${game.expToNextLevel} EXP`;

        expDisplay.innerHTML = `
            <div style="margin-bottom: 5px;">${levelText} | DMG: ${game.playerDamage}</div>
            <div style="font-size: 12px;">${expText}</div>
            ${game.playerLevel < 6 ? `<div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; margin-top: 5px; overflow: hidden;">
                <div style="background: #44ff44; height: 100%; width: ${expPercent}%; transition: width 0.3s;"></div>
            </div>` : ''}
        `;
    }
}

// Update mana display
function updateManaDisplay() {
    const manaDisplay = document.getElementById('manaDisplay');
    if (manaDisplay) {
        manaDisplay.textContent = `✨ Mana: ${Math.floor(game.playerMana)}/${game.maxPlayerMana}`;

        // Change color based on mana percentage
        const manaPercent = (game.playerMana / game.maxPlayerMana) * 100;
        if (manaPercent <= 20) {
            manaDisplay.style.color = '#ff4444';
            manaDisplay.style.borderColor = '#ff4444';
        } else if (manaPercent <= 50) {
            manaDisplay.style.color = '#ffaa44';
            manaDisplay.style.borderColor = '#ffaa44';
        } else {
            manaDisplay.style.color = '#44aaff';
            manaDisplay.style.borderColor = '#44aaff';
        }
    }
}

// Update coin display
function updateKromerDisplay() {
    const coinDisplay = document.getElementById('coinDisplay');
    if (coinDisplay) {
        coinDisplay.textContent = `💰 Kromer: ${game.coins}`;
    }
}

// Game over function
function gameOver() {
    game.isGameOver = true;
    document.exitPointerLock();

    const instructions = document.getElementById('instructions');
    instructions.innerHTML = `
        <h1 style="color: #ff0000;">GAME OVER!</h1>
        <p>The viruses infected your computer!</p>
        <p>Refresh the page to try again</p>
    `;
    instructions.classList.remove('hidden');
}

// Set up controls
function setupControls() {
    const instructions = document.getElementById('instructions');

    // Pointer lock
    document.body.addEventListener('click', () => {
        if (!game.isPointerLocked && !game.inventory.isOpen && !game.isShopOpen) {
            document.body.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === document.body) {
            game.isPointerLocked = true;
            instructions.classList.add('hidden');
        } else {
            game.isPointerLocked = false;
            instructions.classList.remove('hidden');
        }
    });

    // Mouse movement
    document.addEventListener('mousemove', (event) => {
        if (!game.isPointerLocked) return;

        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        game.rotation.y -= movementX * 0.002;
        game.rotation.x -= movementY * 0.002;

        // Limit vertical rotation
        game.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, game.rotation.x));
    });

    // Keyboard controls
    document.addEventListener('keydown', (event) => {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                game.controls.moveForward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                game.controls.moveBackward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                game.controls.moveLeft = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                game.controls.moveRight = true;
                break;
            case 'Space':
                if (game.controls.canJump) {
                    // Check if using Big Jump spell (super jump with mana)
                    if (game.hasBigJump && game.equippedSpellBook) {
                        const manaCost = 5;
                        if (game.playerMana >= manaCost) {
                            // Use Big Jump with mana (super high jump)
                            game.velocity.y = 50.0;
                            game.playerMana -= manaCost;
                            updateManaDisplay();
                        } else {
                            // Not enough mana, use normal jump
                            game.velocity.y = 15.0;
                        }
                    } else {
                        // Normal jump
                        game.velocity.y = 15.0;
                    }
                    game.controls.canJump = false;
                }
                break;
            case 'KeyR':
                // Cast dash spell
                if (game.equippedSpellBook && game.hasDash && game.isPointerLocked && !game.inventory.isOpen && !game.isShopOpen) {
                    castDash();
                }
                break;
            case 'KeyI':
                toggleInventory();
                break;
            case 'KeyE':
                toggleShop();
                break;
            case 'KeyQ':
                if (game.isPointerLocked && !game.inventory.isOpen && !game.isShopOpen) {
                    switchSpell();
                }
                break;
            case 'KeyF':
                if (game.equippedSpellBook && game.hasFireball && game.isPointerLocked && !game.inventory.isOpen && !game.isShopOpen) {
                    castFireball();
                }
                break;
            case 'KeyG':
                if (game.equippedSpellBook && game.hasFreezeball && game.isPointerLocked && !game.inventory.isOpen && !game.isShopOpen) {
                    castFreezeball();
                }
                break;
            case 'Escape':
                if (game.inventory.isOpen) {
                    toggleInventory();
                } else if (game.isShopOpen) {
                    toggleShop();
                } else {
                    document.exitPointerLock();
                }
                break;
        }
    });

    document.addEventListener('keyup', (event) => {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                game.controls.moveForward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                game.controls.moveBackward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                game.controls.moveLeft = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                game.controls.moveRight = false;
                break;
        }
    });

    // Mouse down for starting charge or instant attacks
    document.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return; // Only left click
        if (game.isPointerLocked && !game.inventory.isOpen && !game.isShopOpen) {
            if (game.equippedBow) {
                // Start charging bow shot
                if (!game.isChargingShot && game.shootCooldown <= 0) {
                    game.isChargingShot = true;
                    game.chargeStartTime = Date.now();
                }
            } else if (game.equippedAxe) {
                attackWithAxe();
            } else {
                attackWithSword();
            }
        }
    });

    // Mouse up for releasing charged shot
    document.addEventListener('mouseup', (event) => {
        if (event.button !== 0) return; // Only left click
        if (game.isChargingShot) {
            // Calculate charge amount (0 to 1) - 10% faster with Faster Charge power
            const chargeTime = (Date.now() - game.chargeStartTime) / 1000;
            const effectiveMaxChargeTime = game.hasFasterCharge ? game.maxChargeTime * 0.9 : game.maxChargeTime;
            const chargeAmount = Math.min(chargeTime / effectiveMaxChargeTime, 1.0);

            // Fire the arrow with charge
            shootArrow(chargeAmount);

            // Reset charging state
            game.isChargingShot = false;
            game.chargeStartTime = 0;
        }
    });

    // Touch controls for mobile devices
    if (game.isMobile) {
        // Prevent default touch behavior
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        // Touch start - for camera look (not movement - joystick handles that)
        document.addEventListener('touchstart', (event) => {
            if (game.inventory.isOpen || game.isShopOpen) return;

            // Ignore touches on mobile control buttons and joystick
            const target = event.target;
            if (target && (target.classList.contains('mobile-btn') || target.closest('.mobile-btn') ||
                          target.closest('#joystickContainer'))) {
                return;
            }

            const touch = event.touches[0];
            game.touchStartX = touch.clientX;
            game.touchStartY = touch.clientY;
            game.touchCurrentX = touch.clientX;
            game.touchCurrentY = touch.clientY;
            game.isTouching = true;

            // Auto-lock pointer on mobile
            if (!game.isPointerLocked) {
                game.isPointerLocked = true;
                const instructions = document.getElementById('instructions');
                if (instructions) {
                    instructions.classList.add('hidden');
                }
            }
        });

        // Touch move - turn left/right based on horizontal drag
        document.addEventListener('touchmove', (event) => {
            if (!game.isTouching || game.inventory.isOpen || game.isShopOpen) return;

            const touch = event.touches[0];
            const deltaX = touch.clientX - game.touchCurrentX;
            const deltaY = touch.clientY - game.touchCurrentY;

            // Update current position
            game.touchCurrentX = touch.clientX;
            game.touchCurrentY = touch.clientY;

            // Rotate camera based on horizontal drag
            // Sensitivity adjusted for mobile (0.005 for smooth turning)
            game.rotation.y -= deltaX * 0.005;

            // Optional: Allow vertical look with vertical drag
            game.rotation.x -= deltaY * 0.005;

            // Limit vertical rotation
            game.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, game.rotation.x));
        });

        // Touch end - stop camera drag
        document.addEventListener('touchend', (event) => {
            game.isTouching = false;
        });

        // Handle touch cancel
        document.addEventListener('touchcancel', (event) => {
            game.isTouching = false;
        });

        // Mobile button event handlers
        const mobileAttackBtn = document.getElementById('mobileAttackBtn');
        const mobileJumpBtn = document.getElementById('mobileJumpBtn');
        const mobileInventoryBtn = document.getElementById('mobileInventoryBtn');

        // Attack button
        if (mobileAttackBtn) {
            mobileAttackBtn.addEventListener('touchstart', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (game.isPointerLocked && !game.inventory.isOpen && !game.isShopOpen) {
                    if (game.equippedBow) {
                        // Start charging bow shot
                        if (!game.isChargingShot && game.shootCooldown <= 0) {
                            game.isChargingShot = true;
                            game.chargeStartTime = Date.now();
                        }
                    } else if (game.equippedAxe) {
                        attackWithAxe();
                    } else {
                        attackWithSword();
                    }
                }
            });

            mobileAttackBtn.addEventListener('touchend', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (game.isChargingShot) {
                    // Calculate charge amount (0 to 1) - 10% faster with Faster Charge power
                    const chargeTime = (Date.now() - game.chargeStartTime) / 1000;
                    const effectiveMaxChargeTime = game.hasFasterCharge ? game.maxChargeTime * 0.9 : game.maxChargeTime;
                    const chargeAmount = Math.min(chargeTime / effectiveMaxChargeTime, 1.0);

                    // Fire the arrow with charge
                    shootArrow(chargeAmount);

                    // Reset charging state
                    game.isChargingShot = false;
                    game.chargeStartTime = 0;
                }
            });
        }

        // Jump button
        if (mobileJumpBtn) {
            mobileJumpBtn.addEventListener('touchstart', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (game.controls.canJump && game.isPointerLocked && !game.inventory.isOpen && !game.isShopOpen) {
                    // Check if using Big Jump spell (super jump with mana)
                    if (game.hasBigJump && game.equippedSpellBook) {
                        const manaCost = 5;
                        if (game.playerMana >= manaCost) {
                            // Use Big Jump with mana (super high jump)
                            game.velocity.y = 50.0;
                            game.playerMana -= manaCost;
                            updateManaDisplay();
                        } else {
                            // Not enough mana, use normal jump
                            game.velocity.y = 15.0;
                        }
                    } else {
                        // Normal jump
                        game.velocity.y = 15.0;
                    }
                    game.controls.canJump = false;
                }
            });
        }

        // Inventory button
        if (mobileInventoryBtn) {
            mobileInventoryBtn.addEventListener('touchstart', (event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleInventory();
            });
        }

        // Joystick controls
        const joystickStick = document.getElementById('joystickStick');
        const joystickBase = document.getElementById('joystickBase');

        if (joystickContainer && joystickStick && joystickBase) {
            let joystickTouchId = null;
            const maxDistance = 50; // Maximum distance the stick can move from center

            joystickContainer.addEventListener('touchstart', (event) => {
                event.preventDefault();
                const touch = event.touches[0];
                joystickTouchId = touch.identifier;
                game.joystickActive = true;
                joystickStick.classList.add('active');

                // Auto-lock pointer on mobile
                if (!game.isPointerLocked) {
                    game.isPointerLocked = true;
                    const instructions = document.getElementById('instructions');
                    if (instructions) {
                        instructions.classList.add('hidden');
                    }
                }
            });

            joystickContainer.addEventListener('touchmove', (event) => {
                event.preventDefault();
                if (!game.joystickActive) return;

                // Find the touch that started on the joystick
                let touch = null;
                for (let i = 0; i < event.touches.length; i++) {
                    if (event.touches[i].identifier === joystickTouchId) {
                        touch = event.touches[i];
                        break;
                    }
                }
                if (!touch) return;

                // Get touch position relative to joystick base
                const rect = joystickBase.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                let deltaX = touch.clientX - centerX;
                let deltaY = touch.clientY - centerY;

                // Limit the distance
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (distance > maxDistance) {
                    const angle = Math.atan2(deltaY, deltaX);
                    deltaX = Math.cos(angle) * maxDistance;
                    deltaY = Math.sin(angle) * maxDistance;
                }

                // Update stick position
                joystickStick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

                // Store normalized values (-1 to 1)
                game.joystickDeltaX = deltaX / maxDistance;
                game.joystickDeltaY = deltaY / maxDistance;
            });

            joystickContainer.addEventListener('touchend', (event) => {
                event.preventDefault();

                // Check if the touch that ended was the joystick touch
                let touchEnded = true;
                for (let i = 0; i < event.touches.length; i++) {
                    if (event.touches[i].identifier === joystickTouchId) {
                        touchEnded = false;
                        break;
                    }
                }

                if (touchEnded) {
                    game.joystickActive = false;
                    game.joystickDeltaX = 0;
                    game.joystickDeltaY = 0;
                    joystickTouchId = null;
                    joystickStick.classList.remove('active');
                    // Reset stick position
                    joystickStick.style.transform = 'translate(-50%, -50%)';
                }
            });

            joystickContainer.addEventListener('touchcancel', (event) => {
                event.preventDefault();
                game.joystickActive = false;
                game.joystickDeltaX = 0;
                game.joystickDeltaY = 0;
                joystickTouchId = null;
                joystickStick.classList.remove('active');
                // Reset stick position
                joystickStick.style.transform = 'translate(-50%, -50%)';
            });
        }
    }
}

// Handle window resize
function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}

// Check if player's current position collides with walls/objects
function checkWallCollision() {
    const playerRadius = 0.8; // Same as in updateMovement
    const playerBox = new THREE.Box3(
        new THREE.Vector3(
            game.camera.position.x - playerRadius,
            game.camera.position.y - game.playerHeight,
            game.camera.position.z - playerRadius
        ),
        new THREE.Vector3(
            game.camera.position.x + playerRadius,
            game.camera.position.y,
            game.camera.position.z + playerRadius
        )
    );

    // Check collision with all objects (walls, boxes, etc.)
    for (let obj of game.objects) {
        const box = new THREE.Box3().setFromObject(obj);
        box.expandByScalar(0.1);

        if (box.intersectsBox(playerBox)) {
            return true; // Collision detected
        }
    }

    return false; // No collision
}

// Update player movement
function updateMovement(delta) {
    if (!game.isPointerLocked || game.isGameOver) return;

    // Apply gravity
    game.velocity.y -= game.gravity * delta;

    // Calculate movement direction (keyboard + joystick)
    let moveZ = Number(game.controls.moveForward) - Number(game.controls.moveBackward);
    let moveX = Number(game.controls.moveRight) - Number(game.controls.moveLeft);

    // Add joystick input for movement (invert Y axis: negative = forward)
    if (game.joystickActive) {
        moveZ += -game.joystickDeltaY;
        moveX += game.joystickDeltaX; // Joystick X controls strafing left/right
    }

    game.direction.z = moveZ;
    game.direction.x = moveX;
    game.direction.normalize();

    // Track if player is moving (keyboard or joystick)
    game.isMoving = game.controls.moveForward || game.controls.moveBackward ||
                    game.controls.moveLeft || game.controls.moveRight ||
                    game.joystickActive;

    if (game.isMoving) {
        game.walkTime += delta * 10; // Speed of bobbing
    }

    // Skip movement if player is frozen
    if (!game.playerFrozen) {
        // Handle dash movement
        if (game.isDashing) {
            game.dashTimer -= delta;

            if (game.dashTimer <= 0) {
                game.isDashing = false;
                game.dashTimer = 0;
            } else {
                // Apply dash movement
                const dashMoveSpeed = game.dashSpeed * delta;
                game.camera.position.x += game.dashDirectionX * dashMoveSpeed;
                game.camera.position.z += game.dashDirectionZ * dashMoveSpeed;
            }
        } else {
            // Apply normal movement (reduced speed while charging bow)
            let speedMultiplier = 1.0;
            if (game.isChargingShot) {
                speedMultiplier = 0.25; // 25% speed while charging (very slow)
            }
            const moveSpeed = game.playerSpeed * delta * speedMultiplier;

            // Forward/backward movement (keyboard or joystick)
            if (game.controls.moveForward || game.controls.moveBackward || (game.joystickActive && game.joystickDeltaY !== 0)) {
                const forward = new THREE.Vector3(0, 0, -1);
                forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), game.rotation.y);
                game.camera.position.x += forward.x * game.direction.z * moveSpeed;
                game.camera.position.z += forward.z * game.direction.z * moveSpeed;
            }

            // Left/right strafing movement (keyboard or joystick)
            if (game.controls.moveLeft || game.controls.moveRight || (game.joystickActive && game.joystickDeltaX !== 0)) {
                const right = new THREE.Vector3(1, 0, 0);
                right.applyAxisAngle(new THREE.Vector3(0, 1, 0), game.rotation.y);
                game.camera.position.x += right.x * game.direction.x * moveSpeed;
                game.camera.position.z += right.z * game.direction.x * moveSpeed;
            }
        }
    }

    // Apply vertical velocity
    game.camera.position.y += game.velocity.y * delta;

    // Collision detection with ground
    if (game.camera.position.y < game.playerHeight) {
        game.velocity.y = 0;
        game.camera.position.y = game.playerHeight;
        game.controls.canJump = true;
    }

    // Improved collision detection with objects
    const playerRadius = 0.8; // Larger collision radius for better feel
    game.objects.forEach(obj => {
        const box = new THREE.Box3().setFromObject(obj);

        // Expand the bounding box slightly for smoother collision
        box.expandByScalar(0.1);

        const playerBox = new THREE.Box3(
            new THREE.Vector3(
                game.camera.position.x - playerRadius,
                game.camera.position.y - game.playerHeight,
                game.camera.position.z - playerRadius
            ),
            new THREE.Vector3(
                game.camera.position.x + playerRadius,
                game.camera.position.y,
                game.camera.position.z + playerRadius
            )
        );

        if (box.intersectsBox(playerBox)) {
            // Better collision response - slide along walls
            const objCenter = new THREE.Vector3();
            box.getCenter(objCenter);

            const dx = game.camera.position.x - objCenter.x;
            const dz = game.camera.position.z - objCenter.z;

            const boxHalfX = (box.max.x - box.min.x) / 2;
            const boxHalfZ = (box.max.z - box.min.z) / 2;

            const overlapX = playerRadius + boxHalfX - Math.abs(dx);
            const overlapZ = playerRadius + boxHalfZ - Math.abs(dz);

            // Push out on the axis with smallest overlap
            if (overlapX < overlapZ) {
                game.camera.position.x += overlapX * Math.sign(dx);
            } else {
                game.camera.position.z += overlapZ * Math.sign(dz);
            }
        }
    });

    // Update camera rotation
    game.camera.rotation.x = game.rotation.x;
    game.camera.rotation.y = game.rotation.y;
    game.camera.rotation.order = 'YXZ';

    // Update position display
    const pos = game.camera.position;
    document.getElementById('position').textContent =
        `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
}

// Update sword bobbing animation
function updateSwordBobbing() {
    if (!game.equippedSwordMesh || game.isAttacking) return;

    const restPosX = 0.3;  // Updated for visible position
    const restPosY = -0.3; // Updated for visible position

    if (game.isMoving && game.isPointerLocked && !game.inventory.isOpen) {
        // Bob up and down with sway
        const bobAmount = Math.sin(game.walkTime) * 0.04;
        const swayAmount = Math.cos(game.walkTime * 0.5) * 0.03;

        game.equippedSwordMesh.position.y = restPosY + bobAmount;
        game.equippedSwordMesh.position.x = restPosX + swayAmount;
    } else {
        // Gradually return to rest position
        game.equippedSwordMesh.position.y = THREE.MathUtils.lerp(game.equippedSwordMesh.position.y, restPosY, 0.1);
        game.equippedSwordMesh.position.x = THREE.MathUtils.lerp(game.equippedSwordMesh.position.x, restPosX, 0.1);
    }
}

// Update bow charging animation
function updateBowCharging() {
    const chargeOverlay = document.getElementById('chargeOverlay');

    if (!game.equippedBowMesh) {
        // Hide charge overlay if bow not equipped
        if (chargeOverlay) {
            chargeOverlay.style.opacity = '0';
        }
        return;
    }

    if (game.isChargingShot) {
        // Calculate charge progress (0 to 1) - 10% faster with Faster Charge power
        const chargeTime = (Date.now() - game.chargeStartTime) / 1000;
        const effectiveMaxChargeTime = game.hasFasterCharge ? game.maxChargeTime * 0.9 : game.maxChargeTime;
        const chargeProgress = Math.min(chargeTime / effectiveMaxChargeTime, 1.0);

        // Pulse effect based on charge
        const pulseSpeed = 8 + (chargeProgress * 12); // Faster pulse as it charges
        const pulse = Math.sin(Date.now() * 0.01 * pulseSpeed) * 0.5 + 0.5;

        // Update charge overlay opacity (0 to 1, with pulse)
        if (chargeOverlay) {
            const baseOpacity = chargeProgress * 0.6; // 0 to 0.6
            const pulseOpacity = pulse * 0.2; // 0 to 0.2
            chargeOverlay.style.opacity = (baseOpacity + pulseOpacity).toString();
        }

        // Find the barrel and chamber meshes to animate them
        game.equippedBowMesh.children.forEach(child => {
            // Animate barrel glow
            if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = 0.4 + (chargeProgress * 0.4) + (pulse * 0.2);
            }
            // Animate chamber and barrel emissive intensity
            if (child.material && child.material.emissive !== undefined) {
                child.material.emissiveIntensity = 1 + (chargeProgress * 1.5) + (pulse * 0.5);
            }
        });

        // Scale bow slightly as it charges (1.0 to 1.15)
        const scale = 1 + (chargeProgress * 0.15);
        game.equippedBowMesh.scale.set(scale, scale, scale);
    } else {
        // Fade out charge overlay
        if (chargeOverlay) {
            const currentOpacity = parseFloat(chargeOverlay.style.opacity) || 0;
            chargeOverlay.style.opacity = Math.max(0, currentOpacity - 0.05).toString();
        }

        // Reset to normal state
        game.equippedBowMesh.children.forEach(child => {
            if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, 0.4, 0.1);
            }
            if (child.material && child.material.emissive !== undefined) {
                child.material.emissiveIntensity = THREE.MathUtils.lerp(child.material.emissiveIntensity, 1, 0.1);
            }
        });

        // Reset scale
        const currentScale = game.equippedBowMesh.scale.x;
        const targetScale = 1.0;
        const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
        game.equippedBowMesh.scale.set(newScale, newScale, newScale);
    }
}

// Spawn floating damage number at enemy position
function spawnDamageNumber(damage, position) {
    // Create canvas for damage text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;

    // Draw damage text
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 48px Arial';
    context.fillStyle = '#ff0000'; // Red color for damage
    context.strokeStyle = '#000000'; // Black outline
    context.lineWidth = 4;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const text = damage.toString();
    context.strokeText(text, 64, 32);
    context.fillText(text, 64, 32);

    // Create sprite from canvas
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: true
    });
    const sprite = new THREE.Sprite(material);

    // Position sprite at enemy position, slightly above
    sprite.position.set(
        position.x + (Math.random() - 0.5) * 1.5, // Random X offset
        position.y + 2, // Above enemy
        position.z + (Math.random() - 0.5) * 1.5  // Random Z offset
    );
    sprite.scale.set(2, 1, 1);

    // Add animation data
    sprite.userData = {
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 2, // Random horizontal drift
            8, // Upward velocity
            (Math.random() - 0.5) * 2  // Random horizontal drift
        ),
        lifetime: 0,
        maxLifetime: 1.0 // 1 second lifetime
    };

    game.scene.add(sprite);
    game.damageNumbers.push(sprite);
}

// Update damage numbers animation
function updateDamageNumbers(delta) {
    for (let i = game.damageNumbers.length - 1; i >= 0; i--) {
        const dmgNumber = game.damageNumbers[i];

        // Update lifetime
        dmgNumber.userData.lifetime += delta;

        // Calculate fade based on lifetime
        const fadeProgress = dmgNumber.userData.lifetime / dmgNumber.userData.maxLifetime;

        // Update position (move up and drift)
        dmgNumber.position.x += dmgNumber.userData.velocity.x * delta;
        dmgNumber.position.y += dmgNumber.userData.velocity.y * delta;
        dmgNumber.position.z += dmgNumber.userData.velocity.z * delta;

        // Apply gravity to vertical velocity (slow down upward movement)
        dmgNumber.userData.velocity.y -= 15 * delta;

        // Fade out
        dmgNumber.material.opacity = 1 - fadeProgress;

        // Remove when lifetime expires
        if (dmgNumber.userData.lifetime >= dmgNumber.userData.maxLifetime) {
            game.scene.remove(dmgNumber);
            dmgNumber.material.map.dispose();
            dmgNumber.material.dispose();
            game.damageNumbers.splice(i, 1);
        }
    }
}

// Update projectiles
function updateProjectiles(delta) {
    for (let i = game.projectiles.length - 1; i >= 0; i--) {
        const arrow = game.projectiles[i];

        if (!arrow || !arrow.velocity) {
            game.scene.remove(arrow);
            game.projectiles.splice(i, 1);
            continue;
        }

        // Apply gravity (arrows fall down)
        arrow.velocity.y -= game.gravity * delta;

        // Apply air resistance (arrows slow down)
        const drag = 0.98;
        arrow.velocity.x *= drag;
        arrow.velocity.y *= drag;
        arrow.velocity.z *= drag;

        // Update position
        arrow.position.x += arrow.velocity.x * delta;
        arrow.position.y += arrow.velocity.y * delta;
        arrow.position.z += arrow.velocity.z * delta;

        // Find all targets in range, then hit the closest one
        let hitEnemy = false;
        const targetsInRange = [];

        // Check collision with enemies
        for (let j = 0; j < game.enemies.length; j++) {
            const enemy = game.enemies[j];
            const distance = arrow.position.distanceTo(enemy.position);

            if (distance < 1.5) {
                targetsInRange.push({
                    entity: enemy,
                    distance: distance,
                    index: j,
                    isBoss: false,
                    hitboxRadius: 1.5
                });
            }
        }

        // Check collision with boss
        if (game.boss) {
            const distance = arrow.position.distanceTo(game.boss.position);
            if (distance < 4) { // Boss has larger hitbox
                targetsInRange.push({
                    entity: game.boss,
                    distance: distance,
                    index: -1,
                    isBoss: true,
                    hitboxRadius: 4
                });
            }
        }

        // Sort by distance and hit the closest target
        if (targetsInRange.length > 0) {
            targetsInRange.sort((a, b) => a.distance - b.distance);
            const closestTarget = targetsInRange[0];
            const target = closestTarget.entity;

            // Determine damage based on projectile type
            let damage = game.bowDamage; // Arrows use bow damage
            let emoji = '🔫';

            if (arrow.isFireball) {
                damage = closestTarget.isBoss ? 5 : 3; // Fireballs deal 5 to boss, 3 to enemies
                emoji = '🔥';
            } else if (arrow.isFreezeball) {
                damage = closestTarget.isBoss ? 3 : 2; // Freezeballs deal 3 to boss, 2 to enemies
                emoji = '❄️';
                // Freeze effect
                target.isFrozen = true;
                // Store original color if not already stored
                if (!target.frozenOriginalColor) {
                    target.frozenOriginalColor = target.material.color.getHex();
                }

                if (closestTarget.isBoss) {
                    // Turn boss bluish (mix of original red and blue)
                    target.material.color.setHex(0x6600aa); // Purple-blue
                    target.material.emissive.setHex(0x3300aa);

                    setTimeout(() => {
                        if (target) {
                            target.isFrozen = false;
                            // Restore original color
                            if (target.frozenOriginalColor !== undefined) {
                                target.material.color.setHex(target.frozenOriginalColor);
                                target.material.emissive.setHex(0x660000);
                                target.frozenOriginalColor = undefined;
                            }
                        }
                    }, 5000); // Frozen for 5 seconds
                } else {
                    // Turn enemy blue
                    target.material.color.setHex(0x0088ff);
                    target.material.emissive.setHex(0x0044aa);

                    setTimeout(() => {
                        if (target) {
                            target.isFrozen = false;
                            // Restore original color
                            if (target.frozenOriginalColor !== undefined) {
                                target.material.color.setHex(target.frozenOriginalColor);
                                target.material.emissive.setHex(0x330000);
                                target.frozenOriginalColor = undefined;
                            }
                        }
                    }, 3000); // Frozen for 3 seconds
                }
            }

            // Hit target
            target.hp -= damage;

            // Spawn damage number
            spawnDamageNumber(damage, target.position);

            // Visual feedback
            const originalColor = target.material.color.getHex();
            const originalEmissive = closestTarget.isBoss ? 0x660000 : 0x330000;
            target.material.color.setHex(0xffffff);
            target.material.emissive.setHex(0xffffff);
            setTimeout(() => {
                if (target && target.material) {
                    target.material.color.setHex(originalColor);
                    target.material.emissive.setHex(originalEmissive);
                }
            }, 150);

            if (closestTarget.isBoss) {
                showNotification(`${emoji} BOSS Hit! HP: ${Math.max(0, target.hp)}/${target.maxHP || 100}`);
                if (target.hp <= 0) {
                    defeatBoss();
                }
            } else {
                showNotification(`${emoji} Hit! Virus HP: ${Math.max(0, target.hp)}/${target.maxHP || 5}`);
                if (target.hp <= 0) {
                    defeatEnemy(target, closestTarget.index);
                }
            }

            hitEnemy = true;
        }

        // Remove arrow if it hit, hit the ground, or traveled too far
        const distanceTraveled = arrow.position.distanceTo(arrow.startPosition);
        if (hitEnemy || arrow.position.y < 0 || distanceTraveled > 300) {
            game.scene.remove(arrow);
            game.projectiles.splice(i, 1);
        }
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const delta = game.clock.getDelta();

    if (!game.inventory.isOpen) {
        updateMovement(delta);
        updateEnemy(delta);
        updateBoss(delta);
        checkShieldPickup();
        checkBowPickup();
        checkAxePickup();
        checkFoodPickup();
        checkRedPotionPickup();
        checkSpellBookPickup();
        checkPortalPickup();
        checkShopProximity();
        updateProjectiles(delta);
        updateEnemyProjectiles(delta);
        updateBossProjectiles(delta);
        updateSwordBobbing();
        updateBowCharging();
        updateDamageNumbers(delta);
        updatePortal(delta);
        updateCodeFragments(delta);

        // Animate clouds (drift slowly)
        if (game.clouds && game.currentWorld === 1) {
            game.clouds.forEach(cloud => {
                cloud.position.x += cloud.userData.speedX * delta * 10;
                // Wrap around if cloud goes too far
                if (cloud.position.x > 500) cloud.position.x = -500;
                if (cloud.position.x < -500) cloud.position.x = 500;
            });
        }

        // Animate galaxy rotation
        if (game.galaxy && game.currentWorld === 2) {
            game.galaxy.rotation.z += delta * 0.1;
        }

        // Animate colored spirals
        if (game.spirals && game.currentWorld === 2) {
            game.spirals.forEach(spiral => {
                spiral.rotation.y += spiral.userData.rotationSpeed * delta;
            });
        }

        // Animate wormhole shop - rotate rings and swirl particles
        if (game.shop) {
            const time = Date.now() * 0.001;
            game.shop.children.forEach(child => {
                // Rotate rings
                if (child.userData.rotationSpeed !== undefined) {
                    child.rotation.z += child.userData.rotationSpeed * delta;
                }
                // Swirl particles in circular motion
                if (child.userData.angle !== undefined) {
                    child.userData.angle += child.userData.speed * delta;
                    child.position.x = Math.cos(child.userData.angle) * child.userData.radius;
                    child.position.y = Math.sin(child.userData.angle) * child.userData.radius;
                    // Add pulsing effect
                    const scale = 1 + Math.sin(time * 2 + child.userData.angle) * 0.2;
                    child.scale.set(scale, scale, scale);
                }
            });
        }

        // Animate ash clouds
        if (game.ashClouds && game.currentWorld === 3) {
            const time = Date.now() * 0.001;
            game.ashClouds.forEach(ashCloud => {
                // Slow drift movement
                ashCloud.position.x += Math.cos(ashCloud.userData.driftAngle) * ashCloud.userData.driftSpeed * delta;
                ashCloud.position.z += Math.sin(ashCloud.userData.driftAngle) * ashCloud.userData.driftSpeed * delta;

                // Slow bobbing up and down
                ashCloud.position.y += Math.sin(time * ashCloud.userData.bobSpeed + ashCloud.userData.bobOffset) * 0.1 * delta;

                // Slow rotation
                ashCloud.rotation.y += delta * 0.05;
            });
        }

        // Reduce attack cooldown
        if (game.attackCooldown > 0) {
            game.attackCooldown -= delta;
        }

        // Reduce axe cooldown
        if (game.axeCooldown > 0) {
            game.axeCooldown -= delta;
        }

        // Reduce shoot cooldown
        if (game.shootCooldown > 0) {
            game.shootCooldown -= delta;
        }

        // Reduce spell cooldowns
        if (game.fireballCooldown > 0) {
            game.fireballCooldown -= delta;
        }
        if (game.freezeballCooldown > 0) {
            game.freezeballCooldown -= delta;
        }
        if (game.dashCooldown > 0) {
            game.dashCooldown -= delta;
        }

        // Handle freeze duration
        if (game.playerFrozen && game.freezeDuration > 0) {
            game.freezeDuration -= delta;
            if (game.freezeDuration <= 0) {
                game.playerFrozen = false;
                game.freezeDuration = 0;
                showNotification('✅ Unfrozen! You can move again!');
            }
        }

        // Regenerate mana (1 per second)
        if (game.playerMana < game.maxPlayerMana) {
            game.playerMana = Math.min(game.playerMana + delta, game.maxPlayerMana);
            if (game.equippedSpellBook) {
                updateManaDisplay();
            }
        }

        // Enemy spawner
        if (!game.isGameOver) {
            game.enemySpawnTimer += delta;
            if (game.enemySpawnTimer >= game.enemySpawnInterval) {
                spawnEnemy();
                game.enemySpawnTimer = 0;
            }
        }
    }

    // Animate shield pickup (rotate)
    if (game.shield && !game.shieldCollected) {
        game.shield.rotation.y += delta * 2;
        game.shield.position.y = 1.5 + Math.sin(Date.now() * 0.002) * 0.3;
    }

    // Animate bow pickup (rotate)
    if (game.bow && !game.bowCollected) {
        game.bow.rotation.y += delta * 2;
        game.bow.position.y = 1.5 + Math.sin(Date.now() * 0.002) * 0.3;
    }

    game.renderer.render(game.scene, game.camera);
}

// Start the game when page loads
window.addEventListener('load', () => {
    init();
    updateHPDisplay(); // Initialize HP display
    updateEXPDisplay(); // Initialize EXP display
});
