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
    isGameOver: false
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

// Update enemy AI
function updateEnemy(delta) {
    if (!game.enemy || game.isGameOver || !game.isPointerLocked) return;

    // Calculate direction to player
    const direction = new THREE.Vector3();
    direction.subVectors(game.camera.position, game.enemy.position);
    direction.y = 0; // Keep enemy on ground level
    direction.normalize();

    // Move enemy towards player
    game.enemy.position.x += direction.x * game.enemySpeed * delta;
    game.enemy.position.z += direction.z * game.enemySpeed * delta;

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
            case 'Escape':
                document.exitPointerLock();
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

    // Simple collision detection with objects
    game.objects.forEach(obj => {
        const box = new THREE.Box3().setFromObject(obj);
        const playerBox = new THREE.Box3(
            new THREE.Vector3(
                game.camera.position.x - 0.5,
                game.camera.position.y - game.playerHeight,
                game.camera.position.z - 0.5
            ),
            new THREE.Vector3(
                game.camera.position.x + 0.5,
                game.camera.position.y,
                game.camera.position.z + 0.5
            )
        );

        if (box.intersectsBox(playerBox)) {
            // Simple push-back collision response
            const objCenter = new THREE.Vector3();
            box.getCenter(objCenter);
            const playerCenter = new THREE.Vector3();
            playerBox.getCenter(playerCenter);

            const pushDir = new THREE.Vector3()
                .subVectors(playerCenter, objCenter)
                .normalize();

            game.camera.position.x += pushDir.x * 0.5;
            game.camera.position.z += pushDir.z * 0.5;
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

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const delta = game.clock.getDelta();
    updateMovement(delta);
    updateEnemy(delta);

    game.renderer.render(game.scene, game.camera);
}

// Start the game when page loads
window.addEventListener('load', init);
