// Game initialization and main loop

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

    // Create ground - WAY BIGGER
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3d8c40 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    game.scene.add(ground);

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

    // Create multiple food pickup items at random positions
    for (let i = 0; i < 5; i++) {
        const foodX = (Math.random() * 600 - 300);
        const foodZ = (Math.random() * 600 - 300);
        createFoodPickup(foodX, foodZ);
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
function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}

// Check if player's current position collides with walls/objects
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
        checkSpellBookPickup();
        checkPortalPickup();
        checkShopProximity();
        updateProjectiles(delta);
        updateEnemyProjectiles(delta);
        updateBossProjectiles(delta);
        updateSwordBobbing();
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
