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
    enemy: null,
    enemySpeed: 8.0,
    isGameOver: false,
    inventory: {
        items: [],
        equippedItem: null,
        isOpen: false
    },
    sword: null,
    swordCollected: false,
    equippedSwordMesh: null,
    isAttacking: false,
    attackCooldown: 0,
    walkTime: 0,
    isMoving: false
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

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3d8c40 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    game.scene.add(ground);

    // Create walls around the perimeter
    createWall(0, 100, 5, 200, 10, 0x8b4513);  // Back wall
    createWall(0, -100, 5, 200, 10, 0x8b4513); // Front wall
    createWall(100, 0, 5, 10, 200, 0x8b4513);  // Right wall
    createWall(-100, 0, 5, 10, 200, 0x8b4513); // Left wall

    // Create some obstacles/buildings
    createBox(-30, 0, -30, 15, 10, 15, 0x808080);
    createBox(30, 0, -30, 12, 8, 12, 0x606060);
    createBox(-30, 0, 30, 10, 15, 10, 0x707070);
    createBox(30, 0, 30, 8, 12, 8, 0x909090);
    createBox(0, 0, -50, 20, 5, 10, 0x654321);
    createBox(-50, 0, 0, 10, 7, 15, 0x8b7355);
    createBox(50, 0, 10, 12, 9, 12, 0x696969);

    // Create some decorative objects
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * 160 - 80;
        const z = Math.random() * 160 - 80;
        if (Math.abs(x) < 10 && Math.abs(z) < 10) continue; // Don't spawn near player
        createBox(x, 0, z, 3, 3, 3, 0xff6347);
    }

    // Create enemy
    createEnemy(-70, -70);

    // Create sword pickup item
    createSwordPickup(40, 40);

    // Initialize inventory UI
    initInventory();

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

// Create enemy
function createEnemy(x, z) {
    const enemyGeometry = new THREE.SphereGeometry(2, 16, 16);
    const enemyMaterial = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        emissive: 0x330000
    });
    game.enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    game.enemy.position.set(x, 2, z);
    game.enemy.castShadow = true;
    game.scene.add(game.enemy);

    // Add glowing eyes
    const eyeGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.6, 0.3, 1.5);
    game.enemy.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.6, 0.3, 1.5);
    game.enemy.add(rightEye);
}

// Create sword pickup
function createSwordPickup(x, z) {
    // Create sword group
    game.sword = new THREE.Group();

    // Sword blade
    const bladeGeometry = new THREE.BoxGeometry(0.3, 2, 0.1);
    const bladeMaterial = new THREE.MeshLambertMaterial({
        color: 0xc0c0c0,
        emissive: 0x404040
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.y = 1;
    blade.castShadow = true;

    // Sword handle
    const handleGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.2);
    const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = -0.25;
    handle.castShadow = true;

    // Sword guard
    const guardGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.2);
    const guardMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const guard = new THREE.Mesh(guardGeometry, guardMaterial);
    guard.castShadow = true;

    game.sword.add(blade);
    game.sword.add(handle);
    game.sword.add(guard);

    game.sword.position.set(x, 1.5, z);
    game.sword.rotation.z = Math.PI / 4;

    game.scene.add(game.sword);

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    game.sword.add(glow);
}

// Initialize inventory system
function initInventory() {
    updateInventoryUI();
}

// Update inventory UI
function updateInventoryUI() {
    const inventoryItems = document.getElementById('inventoryItems');
    inventoryItems.innerHTML = '';

    // Create 6 inventory slots
    for (let i = 0; i < 6; i++) {
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

            if (game.inventory.equippedItem === item) {
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

// Toggle equip item
function toggleEquipItem(item) {
    if (game.inventory.equippedItem === item) {
        // Unequip
        game.inventory.equippedItem = null;
        if (game.equippedSwordMesh) {
            game.camera.remove(game.equippedSwordMesh);
            game.equippedSwordMesh = null;
        }
        document.getElementById('equippedInfo').classList.add('hidden');
    } else {
        // Equip
        game.inventory.equippedItem = item;
        if (item.type === 'sword') {
            equipSword();
        }
        document.getElementById('equippedInfo').classList.remove('hidden');
    }
    updateInventoryUI();
}

// Equip sword to player
function equipSword() {
    // Remove old sword if exists
    if (game.equippedSwordMesh) {
        game.camera.remove(game.equippedSwordMesh);
    }

    // Create sword mesh for first person view
    game.equippedSwordMesh = new THREE.Group();

    // Blade - larger and more visible
    const bladeGeometry = new THREE.BoxGeometry(0.12, 1.5, 0.06);
    const bladeMaterial = new THREE.MeshBasicMaterial({
        color: 0xe0e0e0
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.set(0, 0.5, 0);

    // Handle
    const handleGeometry = new THREE.BoxGeometry(0.08, 0.35, 0.08);
    const handleMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0, -0.4, 0);

    // Guard (crossguard)
    const guardGeometry = new THREE.BoxGeometry(0.35, 0.05, 0.08);
    const guardMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const guard = new THREE.Mesh(guardGeometry, guardMaterial);
    guard.position.set(0, -0.2, 0);

    // Pommel (end of handle)
    const pommelGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const pommelMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const pommel = new THREE.Mesh(pommelGeometry, pommelMaterial);
    pommel.position.set(0, -0.58, 0);

    game.equippedSwordMesh.add(blade);
    game.equippedSwordMesh.add(handle);
    game.equippedSwordMesh.add(guard);
    game.equippedSwordMesh.add(pommel);

    // Centered positioning directly in front of camera
    // Positioned to be clearly visible in the player's view
    game.equippedSwordMesh.position.set(0.3, -0.2, -0.6);
    game.equippedSwordMesh.rotation.set(-0.2, 0.1, 0.1); // x, y, z rotation

    game.camera.add(game.equippedSwordMesh);
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

// Check sword pickup
function checkSwordPickup() {
    if (game.swordCollected || !game.sword) return;

    const distance = game.camera.position.distanceTo(game.sword.position);

    if (distance < 3) {
        // Collect sword
        game.swordCollected = true;
        game.scene.remove(game.sword);

        // Add to inventory
        game.inventory.items.push({
            name: 'Sword',
            icon: '⚔️',
            type: 'sword'
        });

        updateInventoryUI();

        // Show notification (non-blocking)
        showNotification('⚔️ Sword collected! Press I to open inventory and equip it.');
    }
}

// Attack with sword
function attackWithSword() {
    if (!game.inventory.equippedItem || game.inventory.equippedItem.type !== 'sword') return;
    if (game.isAttacking || game.attackCooldown > 0) return;

    game.isAttacking = true;
    game.attackCooldown = 0.5; // 0.5 second cooldown

    // Enhanced swing animation
    if (game.equippedSwordMesh) {
        // Store original positions (matching equipSword)
        const originalRotationX = -0.2;
        const originalRotationY = 0.1;
        const originalRotationZ = 0.1;
        const originalPosX = 0.3;
        const originalPosY = -0.2;
        const originalPosZ = -0.6;

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

    // Check if hit enemy
    if (game.enemy) {
        const distance = game.camera.position.distanceTo(game.enemy.position);
        if (distance < 15) { // Large attack range of 15 units
            // Calculate if enemy is in front of player
            const directionToEnemy = new THREE.Vector3();
            directionToEnemy.subVectors(game.enemy.position, game.camera.position);
            directionToEnemy.normalize();

            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(game.camera.quaternion);

            const angle = forward.angleTo(directionToEnemy);

            if (angle < Math.PI / 2.5) { // Wide 72 degree cone in front
                defeatEnemy();
            }
        }
    }
}

// Defeat enemy
function defeatEnemy() {
    if (!game.enemy) return;

    game.scene.remove(game.enemy);
    game.enemy = null;

    // Show victory notification
    showNotification('🎉 Victory! You defeated the enemy!');
}

// Update enemy AI
function updateEnemy(delta) {
    if (!game.enemy || game.isGameOver || !game.isPointerLocked || game.inventory.isOpen) return;

    // Calculate direction to player
    const directionToPlayer = new THREE.Vector3();
    directionToPlayer.subVectors(game.camera.position, game.enemy.position);
    directionToPlayer.y = 0; // Keep enemy on ground level
    directionToPlayer.normalize();

    // Store old position for collision detection
    const oldPos = game.enemy.position.clone();

    // Try to move towards player
    let moveDirection = directionToPlayer.clone();
    const moveSpeed = game.enemySpeed * delta;

    // Check if path to player is blocked
    let pathBlocked = false;
    const enemyRadius = 2.5; // Enemy collision radius

    // Test the intended move position
    const testPos = new THREE.Vector3(
        game.enemy.position.x + moveDirection.x * moveSpeed,
        game.enemy.position.y,
        game.enemy.position.z + moveDirection.z * moveSpeed
    );

    // Check collision with objects
    for (let obj of game.objects) {
        const box = new THREE.Box3().setFromObject(obj);
        const enemyBox = new THREE.Box3(
            new THREE.Vector3(
                testPos.x - enemyRadius,
                testPos.y - 2,
                testPos.z - enemyRadius
            ),
            new THREE.Vector3(
                testPos.x + enemyRadius,
                testPos.y + 2,
                testPos.z + enemyRadius
            )
        );

        if (box.intersectsBox(enemyBox)) {
            pathBlocked = true;

            // Try to find alternative path - slide around obstacle
            const objCenter = new THREE.Vector3();
            box.getCenter(objCenter);

            // Calculate perpendicular directions
            const toObstacle = new THREE.Vector3();
            toObstacle.subVectors(objCenter, game.enemy.position);
            toObstacle.y = 0;
            toObstacle.normalize();

            // Try moving perpendicular to obstacle
            const perpendicular1 = new THREE.Vector3(-toObstacle.z, 0, toObstacle.x);
            const perpendicular2 = new THREE.Vector3(toObstacle.z, 0, -toObstacle.x);

            // Choose the perpendicular direction closer to player
            const dot1 = perpendicular1.dot(directionToPlayer);
            const dot2 = perpendicular2.dot(directionToPlayer);

            if (dot1 > dot2) {
                moveDirection = perpendicular1;
            } else {
                moveDirection = perpendicular2;
            }

            break;
        }
    }

    // Apply movement
    game.enemy.position.x += moveDirection.x * moveSpeed;
    game.enemy.position.z += moveDirection.z * moveSpeed;

    // Final collision check and correction
    for (let obj of game.objects) {
        const box = new THREE.Box3().setFromObject(obj);
        const enemyBox = new THREE.Box3(
            new THREE.Vector3(
                game.enemy.position.x - enemyRadius,
                game.enemy.position.y - 2,
                game.enemy.position.z - enemyRadius
            ),
            new THREE.Vector3(
                game.enemy.position.x + enemyRadius,
                game.enemy.position.y + 2,
                game.enemy.position.z + enemyRadius
            )
        );

        if (box.intersectsBox(enemyBox)) {
            // Revert to old position if still colliding
            game.enemy.position.copy(oldPos);
            break;
        }
    }

    // Make enemy look at player
    game.enemy.lookAt(game.camera.position.x, game.enemy.position.y, game.camera.position.z);

    // Add bobbing animation
    game.enemy.position.y = 2 + Math.sin(Date.now() * 0.003) * 0.3;

    // Check collision with player
    const distance = game.camera.position.distanceTo(game.enemy.position);
    if (distance < 3) {
        gameOver();
    }
}

// Game over function
function gameOver() {
    game.isGameOver = true;
    document.exitPointerLock();

    const instructions = document.getElementById('instructions');
    instructions.innerHTML = `
        <h1 style="color: #ff0000;">GAME OVER!</h1>
        <p>The enemy caught you!</p>
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
            attackWithSword();
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

    const restPosX = 0.3;
    const restPosY = -0.2;

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

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const delta = game.clock.getDelta();

    if (!game.inventory.isOpen) {
        updateMovement(delta);
        updateEnemy(delta);
        checkSwordPickup();
        updateSwordBobbing();

        // Reduce attack cooldown
        if (game.attackCooldown > 0) {
            game.attackCooldown -= delta;
        }
    }

    // Animate sword pickup (rotate)
    if (game.sword && !game.swordCollected) {
        game.sword.rotation.y += delta * 2;
        game.sword.position.y = 1.5 + Math.sin(Date.now() * 0.002) * 0.3;
    }

    game.renderer.render(game.scene, game.camera);
}

// Start the game when page loads
window.addEventListener('load', init);
