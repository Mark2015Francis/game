// Items, pickups, weapons, and spells

function createShieldPickup(x, z) {
    const shield = new THREE.Group();

    // Shield body - circular
    const shieldBody = createMesh(
        createCylinder(1.2, 1.2, 0.2, 16),
        createLambertMaterial(0x4169e1, 0x0000ff)
    );
    shieldBody.rotation.x = Math.PI / 2;

    // Shield boss (center)
    const boss = createMesh(
        createSphere(0.3, 8),
        createLambertMaterial(0xffd700, 0xffd700, 0)
    );

    shield.add(shieldBody);
    shield.add(boss);
    shield.add(createGlowSphere(1.8, 0x4169e1, 0.2));

    shield.position.set(x, 1.5, z);
    shield.rotation.z = Math.PI / 4;

    game.scene.add(shield);
    game.shields.push(shield);
}

// Create bow pickup
function createBowPickup(x, z) {
    game.bow = new THREE.Group();

    // Bow body - curved shape
    const bowCurve = new THREE.Shape();
    bowCurve.moveTo(0, -1);
    bowCurve.quadraticCurveTo(-0.3, 0, 0, 1);

    const bowBody = createMesh(
        new THREE.ExtrudeGeometry(bowCurve, { depth: 0.1, bevelEnabled: false }),
        createLambertMaterial(0x8b4513, 0x442200)
    );

    // String
    const stringGeometry = new THREE.BufferGeometry();
    stringGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([0, -1, 0.05, 0, 1, 0.05]), 3
    ));
    const bowString = new THREE.Line(stringGeometry, new THREE.LineBasicMaterial({ color: 0xffffff }));

    game.bow.add(bowBody);
    game.bow.add(bowString);
    game.bow.add(createGlowSphere(1.5, 0x8b4513, 0.2));

    game.bow.position.set(x, 1.5, z);
    game.bow.rotation.y = Math.PI / 4;

    game.scene.add(game.bow);
}

// Create axe pickup
function createAxePickup(x, z) {
    game.axe = new THREE.Group();

    // Axe handle
    const handle = createMesh(
        createCylinder(0.1, 0.1, 2.5, 8),
        createLambertMaterial(0x8b4513, 0x442200)
    );

    // Axe blade
    const blade = createMesh(
        createBox(1.2, 0.8, 0.2),
        createLambertMaterial(0x888888, 0x444444, 0.5)
    );
    blade.position.y = 1.3;

    // Blade edge
    const edge = createMesh(
        createBox(1.3, 0.1, 0.25),
        createLambertMaterial(0x555555, 0x222222)
    );
    edge.position.y = 1.65;

    game.axe.add(handle);
    game.axe.add(blade);
    game.axe.add(edge);
    game.axe.add(createGlowSphere(1.5, 0xff4444, 0.2));

    game.axe.position.set(x, 1.5, z);
    game.axe.rotation.z = Math.PI / 6;

    game.scene.add(game.axe);
    console.log('Axe created at', x, z);
}

// Create food pickup
function createFoodPickup(x, z) {
    const food = new THREE.Group();

    // Apple body
    const appleBody = createMesh(
        createSphere(0.5),
        createLambertMaterial(0xff0000, 0x440000)
    );
    appleBody.scale.set(1, 1.2, 1);

    // Stem
    const stem = createMesh(
        createCylinder(0.05, 0.05, 0.3, 8),
        createLambertMaterial(0x8b4513, 0x8b4513, 0)
    );
    stem.position.y = 0.75;

    // Leaf
    const leaf = createMesh(
        createBox(0.3, 0.1, 0.15),
        createLambertMaterial(0x00ff00, 0x00ff00, 0)
    );
    leaf.position.set(0.1, 0.85, 0);
    leaf.rotation.z = 0.3;

    food.add(appleBody);
    food.add(stem);
    food.add(leaf);
    food.add(createGlowSphere(1.2, 0xff6666, 0.2));

    food.position.set(x, 1, z);
    game.scene.add(food);
    game.foods.push(food);
}

// Create spell book pickup
function createSpellBook(x, z) {
    game.spellBook = new THREE.Group();

    // Book
    game.spellBook.add(createMesh(
        createBox(0.6, 0.8, 0.15),
        createLambertMaterial(0x8b008b, 0x4b0082)
    ));

    // Book cover star
    const star = new THREE.Mesh(
        new THREE.CircleGeometry(0.2, 5),
        createBasicMaterial(0xffd700, { emissiveIntensity: 0 })
    );
    star.position.set(0, 0, 0.08);
    game.spellBook.add(star);

    // Magical sparkles
    const sparkles = createOrbitingObjects(
        8,
        () => createSphere(0.05, 8),
        createBasicMaterial(0xffff00),
        0.5,
        { isSparkle: true }
    );
    sparkles.forEach(s => {
        s.position.y = Math.sin(s.userData.orbitAngle) * 0.5;
        game.spellBook.add(s);
    });

    game.spellBook.add(createGlowSphere(1.5, 0x9400d3, 0.2));

    game.spellBook.position.set(x, 1.5, z);
    game.spellBook.rotation.y = Math.PI / 4;

    game.scene.add(game.spellBook);
    console.log('Spell book created at', x, z);
}

// Create shop at edge of map
function createShop(x, z) {
    game.shop = new THREE.Group();

    // Shop building - larger box
    const buildingGeometry = new THREE.BoxGeometry(12, 8, 10);
    const buildingMaterial = new THREE.MeshLambertMaterial({
        color: 0x8b4513, // Brown wood
        emissive: 0x221100
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 4;
    building.castShadow = true;
    building.receiveShadow = true;
    game.shop.add(building);

    // Roof - pyramid shape
    const roofGeometry = new THREE.ConeGeometry(8, 4, 4);
    const roofMaterial = new THREE.MeshLambertMaterial({
        color: 0x8b0000 // Dark red
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 10;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    game.shop.add(roof);

    // Sign - "SHOP"
    const signGeometry = new THREE.BoxGeometry(8, 2, 0.2);
    const signMaterial = new THREE.MeshLambertMaterial({
        color: 0xffd700 // Gold
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(0, 6, -5.1);
    game.shop.add(sign);

    // Shopkeeper - golden sphere with hat
    const shopkeeperGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const shopkeeperMaterial = new THREE.MeshLambertMaterial({
        color: 0xffcc00,
        emissive: 0x885500
    });
    const shopkeeper = new THREE.Mesh(shopkeeperGeometry, shopkeeperMaterial);
    shopkeeper.position.set(0, 2, -4);
    game.shop.add(shopkeeper);

    // Hat on shopkeeper
    const hatGeometry = new THREE.ConeGeometry(0.6, 1, 8);
    const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const hat = new THREE.Mesh(hatGeometry, hatMaterial);
    hat.position.set(0, 3, -4);
    game.shop.add(hat);

    // Shopkeeper eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 2.2, -3.3);
    game.shop.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 2.2, -3.3);
    game.shop.add(rightEye);

    game.shop.position.set(x, 0, z);
    game.scene.add(game.shop);

    // Create invisible collision box for the shop building
    const collisionBox = new THREE.Mesh(
        new THREE.BoxGeometry(12, 8, 10),
        new THREE.MeshBasicMaterial({ visible: false })
    );
    collisionBox.position.set(x, 4, z);
    game.scene.add(collisionBox);
    game.objects.push(collisionBox);

    console.log('Shop created at', x, z);
}

// Initialize inventory system
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

// Equip axe to player
function equipAxe() {
    // Remove old axe if exists
    if (game.equippedAxeMesh) {
        game.camera.remove(game.equippedAxeMesh);
    }

    // Create axe mesh for first person view
    game.equippedAxeMesh = new THREE.Group();

    // Axe handle - brown wooden handle
    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8);
    const handleMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b4513,
        depthTest: false,
        depthWrite: false
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0, 0.3, 0);
    handle.rotation.z = Math.PI / 2;
    handle.renderOrder = 999;

    // Axe blade - large metallic blade
    const bladeGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.1);
    const bladeMaterial = new THREE.MeshBasicMaterial({
        color: 0x888888,
        depthTest: false,
        depthWrite: false
    });
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.set(0.6, 0.3, 0);
    blade.renderOrder = 999;

    // Blade edge (darker metal for sharpness)
    const edgeGeometry = new THREE.BoxGeometry(0.65, 0.05, 0.12);
    const edgeMaterial = new THREE.MeshBasicMaterial({
        color: 0x555555,
        depthTest: false,
        depthWrite: false
    });
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.position.set(0.6, 0.5, 0);
    edge.renderOrder = 1000;

    game.equippedAxeMesh.add(handle);
    game.equippedAxeMesh.add(blade);
    game.equippedAxeMesh.add(edge);

    // Position axe in right side of view
    game.equippedAxeMesh.position.set(0.4, -0.4, -0.6);
    game.equippedAxeMesh.rotation.set(0.2, -0.3, 0.1);

    // Disable frustum culling
    handle.frustumCulled = false;
    blade.frustumCulled = false;
    edge.frustumCulled = false;
    game.equippedAxeMesh.frustumCulled = false;

    // Add to camera
    game.camera.add(game.equippedAxeMesh);

    console.log('✓ Axe equipped successfully');
}

// Equip spell book to player
function equipSpellBook() {
    // Remove old spell book if exists
    if (game.equippedSpellBookMesh) {
        game.camera.remove(game.equippedSpellBookMesh);
    }

    // Create spell book mesh for first person view
    game.equippedSpellBookMesh = new THREE.Group();

    // Book - rectangular shape
    const bookGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.1);
    const bookMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b008b, // Dark purple
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false
    });
    const book = new THREE.Mesh(bookGeometry, bookMaterial);
    book.position.set(0, 0, 0);
    book.renderOrder = 999;

    // Book cover star
    const starGeometry = new THREE.CircleGeometry(0.15, 5);
    const starMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        depthTest: false,
        depthWrite: false
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.set(0, 0, 0.06);
    star.renderOrder = 1000;

    game.equippedSpellBookMesh.add(book);
    game.equippedSpellBookMesh.add(star);

    // Position spell book in left side of view
    game.equippedSpellBookMesh.position.set(-0.4, -0.3, -0.5);
    game.equippedSpellBookMesh.rotation.set(0.3, 0.5, 0);

    // Disable frustum culling
    book.frustumCulled = false;
    star.frustumCulled = false;
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

// Shoot arrow
function shootArrow() {
    if (!game.equippedBow) return;
    if (game.shootCooldown > 0) return;

    game.shootCooldown = 0.5; // 0.5 second cooldown

    // Create arrow projectile as a group
    const arrow = new THREE.Group();

    // Arrow shaft (main body)
    const shaftGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8);
    const shaftMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Brown
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = 0;
    arrow.add(shaft);

    // Arrowhead (cone at front)
    const headGeometry = new THREE.ConeGeometry(0.08, 0.3, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray metal
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.75; // Position at front of shaft
    arrow.add(head);

    // Fletching (feathers at back) - 3 small triangular fins
    const fletchingMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Red feathers
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const fletchingGeometry = new THREE.BoxGeometry(0.02, 0.15, 0.1);
        const fletching = new THREE.Mesh(fletchingGeometry, fletchingMaterial);
        fletching.position.y = -0.5; // Position at back of shaft
        fletching.position.x = Math.cos(angle) * 0.05;
        fletching.position.z = Math.sin(angle) * 0.05;
        fletching.rotation.y = angle;
        arrow.add(fletching);
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

    // Create velocity vector
    arrow.velocity = new THREE.Vector3(
        dirX * 50,
        dirY * 50,
        dirZ * 50
    );

    // Rotate arrow to point in the direction of travel
    // Arrow is built along Y-axis, so we need to orient it toward the velocity direction
    const direction = arrow.velocity.clone().normalize();

    // Calculate the rotation needed to align arrow with velocity
    // Create a quaternion rotation from Y-axis to the direction vector
    const upVector = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, direction);
    arrow.setRotationFromQuaternion(quaternion);

    game.scene.add(arrow);
    game.projectiles.push(arrow);

    showNotification('🏹 Arrow shot!');
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
            showNotification(`🛡️ Shield collected! (x${game.shieldCount}) Protects you from one enemy hit.`);
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
            name: 'Bow',
            icon: '🏹',
            type: 'bow'
        });

        updateInventoryUI();

        // Show notification (non-blocking)
        showNotification('🏹 Bow collected! Equip it to shoot arrows.');
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
            name: 'Axe',
            icon: '🪓',
            type: 'axe'
        });

        updateInventoryUI();

        // Show notification (non-blocking)
        showNotification('🪓 Axe collected! Equip it for powerful but slow attacks!');
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
            showNotification(`🍎 Food collected! (x${game.foodCount}) Use it to heal 10 HP.`);
            break; // Only collect one at a time
        }
    }
}

// Check spell book pickup
function checkSpellBookPickup() {
    if (game.spellBookCollected || !game.spellBook) return;

    const distance = game.camera.position.distanceTo(game.spellBook.position);

    if (distance < 3) {
        // Collect spell book
        game.spellBookCollected = true;
        game.scene.remove(game.spellBook);

        // Update inventory UI
        updateInventoryUI();

        // Show notification
        showNotification('📖 Spell Book collected! Added to inventory. Magic shop section unlocked!');
        console.log('Spell book collected - added to inventory and magic shop unlocked');
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

    // Check if hit any enemies (target crosshair - center of screen)
    for (let i = 0; i < game.enemies.length; i++) {
        const enemy = game.enemies[i];
        const distance = game.camera.position.distanceTo(enemy.position);
        if (distance < 15) { // Large attack range of 15 units
            // Calculate if enemy is at crosshair (center of screen)
            const directionToEnemy = new THREE.Vector3();
            directionToEnemy.subVectors(enemy.position, game.camera.position);
            directionToEnemy.normalize();

            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(game.camera.quaternion);

            const angle = forward.angleTo(directionToEnemy);

            if (angle < Math.PI / 6) { // Tight 30 degree cone targeting crosshair
                // 5% chance for critical hit (double damage)
                const isCritical = Math.random() < 0.05;
                const damage = isCritical ? game.playerDamage * 2 : game.playerDamage;

                // Deal damage based on player level
                enemy.hp -= damage;

                // Visual feedback - flash bright white for visibility (golden for crit)
                const flashColor = isCritical ? 0xffdd00 : 0xffffff;
                const originalColor = enemy.material.color.getHex();
                enemy.material.color.setHex(flashColor);
                enemy.material.emissive.setHex(flashColor);
                setTimeout(() => {
                    if (enemy && enemy.material) {
                        enemy.material.color.setHex(originalColor);
                        enemy.material.emissive.setHex(0x330000);
                    }
                }, 150);

                // Show damage feedback
                const critText = isCritical ? ' CRITICAL!' : '';
                showNotification(`⚔️ -${damage} DMG${critText}! Enemy HP: ${Math.max(0, enemy.hp)}/5`);

                if (enemy.hp <= 0) {
                    defeatEnemy(enemy, i);
                }

                break; // Only hit one enemy per swing
            }
        }
    }

    // Check if hit boss (target crosshair - center of screen)
    if (game.boss) {
        const distance = game.camera.position.distanceTo(game.boss.position);
        if (distance < 20) { // Boss has larger hit range
            // Calculate if boss is at crosshair (center of screen)
            const directionToBoss = new THREE.Vector3();
            directionToBoss.subVectors(game.boss.position, game.camera.position);
            directionToBoss.normalize();

            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(game.camera.quaternion);

            const angle = forward.angleTo(directionToBoss);

            if (angle < Math.PI / 6) { // Tight 30 degree cone targeting crosshair
                // 5% chance for critical hit (double damage)
                const isCritical = Math.random() < 0.05;
                const damage = isCritical ? game.playerDamage * 2 : game.playerDamage;

                // Deal damage to boss
                game.boss.hp -= damage;

                // Visual feedback (golden flash for crit)
                const flashColor = isCritical ? 0xffdd00 : 0xffffff;
                const originalColor = game.boss.material.color.getHex();
                game.boss.material.color.setHex(flashColor);
                game.boss.material.emissive.setHex(flashColor);
                setTimeout(() => {
                    if (game.boss && game.boss.material) {
                        game.boss.material.color.setHex(originalColor);
                        game.boss.material.emissive.setHex(0x660000);
                    }
                }, 150);

                const critText = isCritical ? ' CRITICAL!' : '';
                showNotification(`⚔️ BOSS -${damage} DMG${critText}! HP: ${Math.max(0, game.boss.hp)}/${game.boss.maxHP}`);

                if (game.boss.hp <= 0) {
                    defeatBoss();
                }
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

    // Check if hit any enemies (target crosshair - center of screen)
    for (let i = 0; i < game.enemies.length; i++) {
        const enemy = game.enemies[i];
        const distance = game.camera.position.distanceTo(enemy.position);
        if (distance < 12) { // Shorter range than sword (12 vs 15)
            // Calculate if enemy is at crosshair (center of screen)
            const directionToEnemy = new THREE.Vector3();
            directionToEnemy.subVectors(enemy.position, game.camera.position);
            directionToEnemy.normalize();

            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(game.camera.quaternion);

            const angle = forward.angleTo(directionToEnemy);

            if (angle < Math.PI / 6) { // Tight 30 degree cone targeting crosshair
                // 5% chance for critical hit (double damage)
                const isCritical = Math.random() < 0.05;
                const baseDamage = game.playerDamage * 3; // 3x sword damage!
                const damage = isCritical ? baseDamage * 2 : baseDamage;

                // Deal massive damage based on player level
                enemy.hp -= damage;

                // Visual feedback - flash bright orange for axe (golden for crit)
                const flashColor = isCritical ? 0xffdd00 : 0xff8800;
                const originalColor = enemy.material.color.getHex();
                enemy.material.color.setHex(flashColor);
                enemy.material.emissive.setHex(flashColor);
                setTimeout(() => {
                    if (enemy && enemy.material) {
                        enemy.material.color.setHex(originalColor);
                        enemy.material.emissive.setHex(0x330000);
                    }
                }, 150);

                // Show damage feedback with axe emoji
                const critText = isCritical ? ' CRITICAL!' : '';
                showNotification(`🪓 -${damage} DMG${critText}! Enemy HP: ${Math.max(0, enemy.hp)}/5`);

                if (enemy.hp <= 0) {
                    defeatEnemy(enemy, i);
                }

                break; // Only hit one enemy per swing
            }
        }
    }

    // Check if hit boss (target crosshair - center of screen)
    if (game.boss) {
        const distance = game.camera.position.distanceTo(game.boss.position);
        if (distance < 18) { // Boss has large hit range but shorter than sword
            // Calculate if boss is at crosshair (center of screen)
            const directionToBoss = new THREE.Vector3();
            directionToBoss.subVectors(game.boss.position, game.camera.position);
            directionToBoss.normalize();

            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(game.camera.quaternion);

            const angle = forward.angleTo(directionToBoss);

            if (angle < Math.PI / 6) { // Tight 30 degree cone targeting crosshair
                // 5% chance for critical hit (double damage)
                const isCritical = Math.random() < 0.05;
                const baseDamage = game.playerDamage * 3; // 3x sword damage!
                const damage = isCritical ? baseDamage * 2 : baseDamage;

                // Deal massive damage to boss
                game.boss.hp -= damage;

                // Visual feedback (golden flash for crit)
                const flashColor = isCritical ? 0xffdd00 : 0xff8800;
                const originalColor = game.boss.material.color.getHex();
                game.boss.material.color.setHex(flashColor);
                game.boss.material.emissive.setHex(flashColor);
                setTimeout(() => {
                    if (game.boss && game.boss.material) {
                        game.boss.material.color.setHex(originalColor);
                        game.boss.material.emissive.setHex(0x660000);
                    }
                }, 150);

                const critText = isCritical ? ' CRITICAL!' : '';
                showNotification(`🪓 BOSS -${damage} DMG${critText}! HP: ${Math.max(0, game.boss.hp)}/${game.boss.maxHP}`);

                if (game.boss.hp <= 0) {
                    defeatBoss();
                }
            }
        }
    }
}

// Defeat boss
