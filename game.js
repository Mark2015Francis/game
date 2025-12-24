// Game version
const GAME_VERSION = "v1.1.0";

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
    playerSpeed: 50.0,
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
    shield: null,
    shieldCollected: false,
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
    projectiles: [],
    shootCooldown: 0
};

// Initialize the game
function init() {
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

    // Create ground - WAY BIGGER
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3d8c40 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    game.scene.add(ground);

    // Create walls around the perimeter - WAY BIGGER
    createWall(0, 500, 5, 1000, 10, 0x8b4513);  // Back wall
    createWall(0, -500, 5, 1000, 10, 0x8b4513); // Front wall
    createWall(500, 0, 5, 10, 1000, 0x8b4513);  // Right wall
    createWall(-500, 0, 5, 10, 1000, 0x8b4513); // Left wall

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

    // Create shield pickup item at random position
    const randomX = (Math.random() * 600 - 300);
    const randomZ = (Math.random() * 600 - 300);
    createShieldPickup(randomX, randomZ);

    // Create bow pickup item at random position
    const bowX = (Math.random() * 600 - 300);
    const bowZ = (Math.random() * 600 - 300);
    createBowPickup(bowX, bowZ);

    // Initialize inventory UI
    initInventory();

    // Equip sword at start
    game.inventory.equippedSword = true;
    equipSword();

    // Set up event listeners
    setupControls();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
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

// Spawn enemy at random position
function spawnEnemy() {
    const x = (Math.random() * 600 - 300);
    const z = (Math.random() * 600 - 300);

    // Don't spawn too close to player
    const distToPlayer = Math.sqrt(x * x + z * z);
    if (distToPlayer < 50) {
        // Spawn at safe distance
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 100;
        createEnemy(Math.cos(angle) * distance, Math.sin(angle) * distance);
    } else {
        createEnemy(x, z);
    }
}

// Create enemy - smaller and with HP
function createEnemy(x, z) {
    const enemyGeometry = new THREE.SphereGeometry(1, 16, 16); // Smaller: 1 instead of 2
    const enemyMaterial = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        emissive: 0x330000
    });
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(x, 1, z);
    enemy.castShadow = true;
    enemy.hp = 5; // Enemy HP
    enemy.maxHP = 5;
    game.scene.add(enemy);

    // Add glowing eyes - smaller for smaller enemy
    const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 0.15, 0.75);
    enemy.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 0.15, 0.75);
    enemy.add(rightEye);

    game.enemies.push(enemy);
}

// Create shield pickup
function createShieldPickup(x, z) {
    // Create shield group
    game.shield = new THREE.Group();

    // Shield body - circular
    const shieldGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 16);
    const shieldMaterial = new THREE.MeshLambertMaterial({
        color: 0x4169e1,
        emissive: 0x0000ff
    });
    const shieldBody = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shieldBody.rotation.x = Math.PI / 2;
    shieldBody.castShadow = true;

    // Shield boss (center)
    const bossGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const bossMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const boss = new THREE.Mesh(bossGeometry, bossMaterial);
    boss.castShadow = true;

    game.shield.add(shieldBody);
    game.shield.add(boss);

    game.shield.position.set(x, 1.5, z);
    game.shield.rotation.z = Math.PI / 4;

    game.scene.add(game.shield);

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(1.8, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4169e1,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    game.shield.add(glow);
}

// Create bow pickup
function createBowPickup(x, z) {
    // Create bow group
    game.bow = new THREE.Group();

    // Bow body - curved shape
    const bowCurve = new THREE.Shape();
    bowCurve.moveTo(0, -1);
    bowCurve.quadraticCurveTo(-0.3, 0, 0, 1);

    const extrudeSettings = { depth: 0.1, bevelEnabled: false };
    const bowGeometry = new THREE.ExtrudeGeometry(bowCurve, extrudeSettings);
    const bowMaterial = new THREE.MeshLambertMaterial({
        color: 0x8b4513,
        emissive: 0x442200
    });
    const bowBody = new THREE.Mesh(bowGeometry, bowMaterial);
    bowBody.castShadow = true;

    // String
    const stringGeometry = new THREE.BufferGeometry();
    const stringVertices = new Float32Array([
        0, -1, 0.05,
        0, 1, 0.05
    ]);
    stringGeometry.setAttribute('position', new THREE.BufferAttribute(stringVertices, 3));
    const stringMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const bowString = new THREE.Line(stringGeometry, stringMaterial);

    game.bow.add(bowBody);
    game.bow.add(bowString);

    game.bow.position.set(x, 1.5, z);
    game.bow.rotation.y = Math.PI / 4;

    game.scene.add(game.bow);

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b4513,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    game.bow.add(glow);
}

// Initialize inventory system
function initInventory() {
    updateInventoryUI();
}

// Update inventory UI
function updateInventoryUI() {
    const inventoryItems = document.getElementById('inventoryItems');
    inventoryItems.innerHTML = '';

    // Always show sword in first slot (equipped at start)
    const swordSlot = document.createElement('div');
    swordSlot.className = 'inventory-slot';
    if (game.inventory.equippedSword) {
        swordSlot.classList.add('equipped');
    }
    swordSlot.innerHTML = `
        <div class="item-icon">⚔️</div>
        <div class="item-name">Sword</div>
        ${game.inventory.equippedSword ? '<div class="item-status">EQUIPPED</div>' : ''}
    `;
    swordSlot.addEventListener('click', () => toggleEquipSword());
    inventoryItems.appendChild(swordSlot);

    // Create remaining slots for other items
    for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';

        if (i < game.inventory.items.length) {
            const item = game.inventory.items[i];
            slot.classList.remove('empty');

            const icon = document.createElement('div');
            icon.className = 'item-icon';
            icon.textContent = item.icon;

            const name = document.createElement('div');
            name.className = 'item-name';
            name.textContent = item.name;

            slot.appendChild(icon);
            slot.appendChild(name);

            const isEquipped = (item.type === 'shield' && game.inventory.equippedShield);
            if (isEquipped) {
                slot.classList.add('equipped');
                const status = document.createElement('div');
                status.className = 'item-status';
                status.textContent = 'EQUIPPED';
                slot.appendChild(status);
            }

            slot.addEventListener('click', () => toggleEquipItem(item));
        } else {
            slot.classList.add('empty');
            slot.innerHTML = '<div class="item-icon">—</div><div class="item-name">Empty</div>';
        }

        inventoryItems.appendChild(slot);
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
        // Equip sword - unequip bow first if equipped
        if (game.equippedBow) {
            game.equippedBow = false;
            if (game.equippedBowMesh) {
                game.camera.remove(game.equippedBowMesh);
                game.equippedBowMesh = null;
            }
        }
        game.inventory.equippedSword = true;
        equipSword();
    }
    updateInventoryUI();
    toggleInventory(); // Close inventory after equipping
}

// Toggle equip item (for shield, bow and other items)
function toggleEquipItem(item) {
    if (item.type === 'shield') {
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
            // Equip bow - unequip sword first
            game.equippedBow = true;
            game.inventory.equippedSword = false;
            if (game.equippedSwordMesh) {
                game.camera.remove(game.equippedSwordMesh);
                game.equippedSwordMesh = null;
            }
            equipBow();
        }
        updateInventoryUI();
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

    // Blade - large, bright white for maximum visibility
    const bladeGeometry = new THREE.BoxGeometry(0.15, 2.5, 0.08);
    const bladeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        depthTest: false, // Always render on top
        depthWrite: false
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.set(0, 0.8, -0.1);
    blade.renderOrder = 999;

    // Handle - brown wood
    const handleGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const handleMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b4513,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0, -0.5, -0.1);
    handle.renderOrder = 999;

    // Guard (crossguard) - bright gold
    const guardGeometry = new THREE.BoxGeometry(0.5, 0.08, 0.1);
    const guardMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false
    });
    const guard = new THREE.Mesh(guardGeometry, guardMaterial);
    guard.position.set(0, -0.25, -0.1);
    guard.renderOrder = 999;

    // Pommel - bright gold sphere
    const pommelGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const pommelMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        depthTest: false,
        depthWrite: false
    });
    const pommel = new THREE.Mesh(pommelGeometry, pommelMaterial);
    pommel.position.set(0, -0.75, -0.1);
    pommel.renderOrder = 999;

    game.equippedSwordMesh.add(arm);
    game.equippedSwordMesh.add(hand);
    game.equippedSwordMesh.add(blade);
    game.equippedSwordMesh.add(handle);
    game.equippedSwordMesh.add(guard);
    game.equippedSwordMesh.add(pommel);

    // Position sword with arm clearly visible in camera view (right side)
    game.equippedSwordMesh.position.set(0.3, -0.3, -0.5);
    game.equippedSwordMesh.rotation.set(-0.2, 0.1, 0.05);

    // Disable frustum culling for all sword parts to ensure they're always rendered
    arm.frustumCulled = false;
    hand.frustumCulled = false;
    blade.frustumCulled = false;
    handle.frustumCulled = false;
    guard.frustumCulled = false;
    pommel.frustumCulled = false;
    game.equippedSwordMesh.frustumCulled = false;

    // Add to camera so it moves with player's view
    game.camera.add(game.equippedSwordMesh);

    console.log('✓ Sword with arm equipped successfully');
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

    // Create bow mesh for first person view
    game.equippedBowMesh = new THREE.Group();

    // Bow limb (simplified as rectangle)
    const bowLimbGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.05);
    const bowMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b4513,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false
    });
    const bowLimb = new THREE.Mesh(bowLimbGeometry, bowMaterial);
    bowLimb.position.set(-0.2, 0, -0.1);
    bowLimb.renderOrder = 999;

    // Bow string - left side
    const stringGeometry1 = new THREE.BoxGeometry(0.02, 0.75, 0.02);
    const stringMaterial = new THREE.MeshBasicMaterial({
        color: 0xeeeeee,
        depthTest: false,
        depthWrite: false
    });
    const string1 = new THREE.Mesh(stringGeometry1, stringMaterial);
    string1.position.set(-0.15, 0.35, -0.1);
    string1.rotation.z = 0.3;
    string1.renderOrder = 999;

    const string2 = new THREE.Mesh(stringGeometry1, stringMaterial);
    string2.position.set(-0.15, -0.35, -0.1);
    string2.rotation.z = -0.3;
    string2.renderOrder = 999;

    game.equippedBowMesh.add(bowLimb);
    game.equippedBowMesh.add(string1);
    game.equippedBowMesh.add(string2);

    // Position bow in left side of view
    game.equippedBowMesh.position.set(-0.3, -0.2, -0.5);
    game.equippedBowMesh.rotation.set(0, 0.2, 0);

    // Disable frustum culling
    bowLimb.frustumCulled = false;
    string1.frustumCulled = false;
    string2.frustumCulled = false;
    game.equippedBowMesh.frustumCulled = false;

    // Add to camera
    game.camera.add(game.equippedBowMesh);

    console.log('✓ Bow equipped successfully');
}

// Shoot arrow
function shootArrow() {
    console.log('shootArrow called, equippedBow:', game.equippedBow, 'cooldown:', game.shootCooldown);
    if (!game.equippedBow) {
        console.log('Bow not equipped, returning');
        return;
    }
    if (game.shootCooldown > 0) {
        console.log('Cooldown active, returning');
        return;
    }

    game.shootCooldown = 0.5; // 0.5 second cooldown

    // Create arrow projectile
    const arrowGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

    // Position at camera
    arrow.position.copy(game.camera.position);

    // Set velocity in camera direction (clone quaternion to protect it)
    const direction = new THREE.Vector3(0, 0, -1);
    const cameraQuat = game.camera.quaternion.clone();
    direction.applyQuaternion(cameraQuat);

    console.log('Camera quaternion:', game.camera.quaternion);
    console.log('Direction:', direction);

    // Create velocity vector without modifying direction
    arrow.velocity = new THREE.Vector3(
        direction.x * 50,
        direction.y * 50,
        direction.z * 50
    );

    console.log('Arrow velocity:', arrow.velocity);

    // Rotate arrow to point forward
    arrow.rotation.x = Math.PI / 2;

    game.scene.add(arrow);
    game.projectiles.push(arrow);

    console.log('✓ Arrow shot! Total projectiles:', game.projectiles.length);
    showNotification('🏹 Arrow shot!');
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
    if (game.shieldCollected || !game.shield) return;

    const distance = game.camera.position.distanceTo(game.shield.position);

    if (distance < 3) {
        // Collect shield
        game.shieldCollected = true;
        game.scene.remove(game.shield);

        // Add to inventory
        game.inventory.items.push({
            name: 'Shield',
            icon: '🛡️',
            type: 'shield'
        });

        // Auto-equip shield
        game.inventory.equippedShield = true;
        game.hasShieldProtection = true;

        updateInventoryUI();

        // Show notification (non-blocking)
        showNotification('🛡️ Shield collected and equipped! Protects you from one enemy hit.');
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
            name: 'Bow',
            icon: '🏹',
            type: 'bow'
        });

        updateInventoryUI();

        // Show notification (non-blocking)
        showNotification('🏹 Bow collected! Equip it to shoot arrows.');
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

    // Check if hit any enemies
    for (let i = 0; i < game.enemies.length; i++) {
        const enemy = game.enemies[i];
        const distance = game.camera.position.distanceTo(enemy.position);
        if (distance < 15) { // Large attack range of 15 units
            // Calculate if enemy is in front of player
            const directionToEnemy = new THREE.Vector3();
            directionToEnemy.subVectors(enemy.position, game.camera.position);
            directionToEnemy.normalize();

            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(game.camera.quaternion);

            const angle = forward.angleTo(directionToEnemy);

            if (angle < Math.PI / 2.5) { // Wide 72 degree cone in front
                // Deal damage based on player level
                enemy.hp -= game.playerDamage;

                // Visual feedback - flash bright white for visibility
                const originalColor = enemy.material.color.getHex();
                enemy.material.color.setHex(0xffffff);
                enemy.material.emissive.setHex(0xffffff);
                setTimeout(() => {
                    if (enemy && enemy.material) {
                        enemy.material.color.setHex(originalColor);
                        enemy.material.emissive.setHex(0x330000);
                    }
                }, 150);

                // Show damage feedback
                showNotification(`⚔️ -${game.playerDamage} DMG! Enemy HP: ${Math.max(0, enemy.hp)}/5`);

                if (enemy.hp <= 0) {
                    defeatEnemy(enemy, i);
                }

                break; // Only hit one enemy per swing
            }
        }
    }
}

// Defeat enemy
function defeatEnemy(enemy, index) {
    game.scene.remove(enemy);
    game.enemies.splice(index, 1);

    // Award EXP
    game.playerEXP += 100;
    updateEXPDisplay();

    // Check for level up
    checkLevelUp();

    // Show notification
    showNotification(`💀 Enemy defeated! +100 EXP | ${game.enemies.length} remaining`);
}

// Check and handle level up
function checkLevelUp() {
    if (game.playerEXP >= game.expToNextLevel) {
        game.playerLevel++;
        game.playerDamage++;
        game.playerEXP -= game.expToNextLevel;

        // Set EXP requirement for next level
        if (game.playerLevel === 2) {
            game.expToNextLevel = 1000; // Level 2->3 requires 1000 EXP
        } else if (game.playerLevel === 3) {
            game.expToNextLevel = 3000; // Level 3->4 requires 3000 EXP
        } else if (game.playerLevel >= 4) {
            game.expToNextLevel = 999999; // Max level reached
        }

        updateEXPDisplay();

        // Show level up notification
        showNotification(`🎉 LEVEL UP! Now Level ${game.playerLevel} | Damage: ${game.playerDamage}`);

        // Check if we leveled up again (in case of overflow EXP)
        if (game.playerEXP >= game.expToNextLevel && game.playerLevel < 4) {
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
    function isPositionValid(testPos) {
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
        return true;
    }

    // Update each enemy
    for (let i = 0; i < game.enemies.length; i++) {
        const enemy = game.enemies[i];

        // Calculate direction to player
        const directionToPlayer = new THREE.Vector3();
        directionToPlayer.subVectors(game.camera.position, enemy.position);
        directionToPlayer.y = 0; // Keep enemy on ground level
        directionToPlayer.normalize();

        // Try multiple movement strategies in order of preference
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

            if (isPositionValid(testPos)) {
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
            if (isPositionValid(slideX)) {
                enemy.position.copy(slideX);
            } else {
                // Try Z-axis only movement
                const slideZ = new THREE.Vector3(
                    enemy.position.x,
                    enemy.position.y,
                    enemy.position.z + directionToPlayer.z * moveSpeed
                );
                if (isPositionValid(slideZ)) {
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

                    // Calculate direction from enemy to player
                    const pushDirection = new THREE.Vector3();
                    pushDirection.subVectors(game.camera.position, enemy.position);
                    pushDirection.y = 0;
                    pushDirection.normalize();

                    // Move player 6 steps away
                    game.camera.position.x += pushDirection.x * 12;
                    game.camera.position.z += pushDirection.z * 12;

                    // Move enemy 6 steps in opposite direction
                    enemy.position.x -= pushDirection.x * 12;
                    enemy.position.z -= pushDirection.z * 12;

                    showNotification('🛡️ Shield absorbed the hit! Find another shield for protection.');
                } else {
                    // Take damage
                    game.playerHP -= 1;
                    updateHPDisplay();

                    // Push player back
                    const pushDirection = new THREE.Vector3();
                    pushDirection.subVectors(game.camera.position, enemy.position);
                    pushDirection.y = 0;
                    pushDirection.normalize();
                    game.camera.position.x += pushDirection.x * 5;
                    game.camera.position.z += pushDirection.z * 5;

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
        const levelText = game.playerLevel >= 4 ? 'MAX' : `Lv.${game.playerLevel}`;
        const expText = game.playerLevel >= 4 ? 'MAX LEVEL' : `${game.playerEXP}/${game.expToNextLevel} EXP`;

        expDisplay.innerHTML = `
            <div style="margin-bottom: 5px;">${levelText} | DMG: ${game.playerDamage}</div>
            <div style="font-size: 12px;">${expText}</div>
            ${game.playerLevel < 4 ? `<div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; margin-top: 5px; overflow: hidden;">
                <div style="background: #44ff44; height: 100%; width: ${expPercent}%; transition: width 0.3s;"></div>
            </div>` : ''}
        `;
    }
}

// Game over function
function gameOver() {
    game.isGameOver = true;
    document.exitPointerLock();

    const instructions = document.getElementById('instructions');
    instructions.innerHTML = `
        <h1 style="color: #ff0000;">GAME OVER!</h1>
        <p>The enemies overwhelmed you!</p>
        <p>Refresh the page to try again</p>
    `;
    instructions.classList.remove('hidden');
}

// Set up controls
function setupControls() {
    const instructions = document.getElementById('instructions');

    // Pointer lock
    document.body.addEventListener('click', () => {
        if (!game.isPointerLocked) {
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
                    game.velocity.y = game.jumpHeight;
                }
                game.controls.canJump = false;
                break;
            case 'KeyI':
                toggleInventory();
                break;
            case 'Escape':
                if (game.inventory.isOpen) {
                    toggleInventory();
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

    // Mouse click for attacking
    document.addEventListener('click', (event) => {
        if (game.isPointerLocked && !game.inventory.isOpen) {
            if (game.equippedBow) {
                shootArrow();
            } else {
                attackWithSword();
            }
        }
    });
}

// Handle window resize
function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}

// Update player movement
function updateMovement(delta) {
    if (!game.isPointerLocked || game.isGameOver) return;

    // Apply gravity
    game.velocity.y -= game.gravity * delta;

    // Calculate movement direction
    game.direction.z = Number(game.controls.moveForward) - Number(game.controls.moveBackward);
    game.direction.x = Number(game.controls.moveRight) - Number(game.controls.moveLeft);
    game.direction.normalize();

    // Track if player is moving
    game.isMoving = game.controls.moveForward || game.controls.moveBackward ||
                    game.controls.moveLeft || game.controls.moveRight;

    if (game.isMoving) {
        game.walkTime += delta * 10; // Speed of bobbing
    }

    // Apply movement
    const moveSpeed = game.playerSpeed * delta;

    if (game.controls.moveForward || game.controls.moveBackward) {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), game.rotation.y);
        game.camera.position.x += forward.x * game.direction.z * moveSpeed;
        game.camera.position.z += forward.z * game.direction.z * moveSpeed;
    }

    if (game.controls.moveLeft || game.controls.moveRight) {
        const right = new THREE.Vector3(1, 0, 0);
        right.applyAxisAngle(new THREE.Vector3(0, 1, 0), game.rotation.y);
        game.camera.position.x += right.x * game.direction.x * moveSpeed;
        game.camera.position.z += right.z * game.direction.x * moveSpeed;
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

// Update projectiles
function updateProjectiles(delta) {
    for (let i = game.projectiles.length - 1; i >= 0; i--) {
        const arrow = game.projectiles[i];

        // Apply gravity (arrows fall down)
        arrow.velocity.y -= game.gravity * delta;

        // Apply air resistance (arrows slow down)
        const drag = 0.98; // 2% speed loss per frame
        arrow.velocity.multiplyScalar(drag);

        // Update position
        arrow.position.x += arrow.velocity.x * delta;
        arrow.position.y += arrow.velocity.y * delta;
        arrow.position.z += arrow.velocity.z * delta;

        // Check collision with enemies
        let hitEnemy = false;
        for (let j = 0; j < game.enemies.length; j++) {
            const enemy = game.enemies[j];
            const distance = arrow.position.distanceTo(enemy.position);

            if (distance < 1.5) {
                // Hit enemy
                enemy.hp -= 1; // Arrows deal 1 damage

                // Visual feedback
                const originalColor = enemy.material.color.getHex();
                enemy.material.color.setHex(0xffffff);
                enemy.material.emissive.setHex(0xffffff);
                setTimeout(() => {
                    if (enemy && enemy.material) {
                        enemy.material.color.setHex(originalColor);
                        enemy.material.emissive.setHex(0x330000);
                    }
                }, 150);

                showNotification(`🏹 Hit! Enemy HP: ${Math.max(0, enemy.hp)}/5`);

                if (enemy.hp <= 0) {
                    defeatEnemy(enemy, j);
                }

                hitEnemy = true;
                break;
            }
        }

        // Remove arrow if it hit, hit the ground, or went too far
        if (hitEnemy || arrow.position.y < 0 || arrow.position.length() > 200) {
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
        checkShieldPickup();
        checkBowPickup();
        updateProjectiles(delta);
        updateSwordBobbing();

        // Reduce attack cooldown
        if (game.attackCooldown > 0) {
            game.attackCooldown -= delta;
        }

        // Reduce shoot cooldown
        if (game.shootCooldown > 0) {
            game.shootCooldown -= delta;
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
