// Utility functions to reduce code duplication

// === MATERIAL HELPERS ===

function createLambertMaterial(color, emissive, emissiveIntensity = 0.5) {
    return new THREE.MeshLambertMaterial({
        color: color,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity
    });
}

function createBasicMaterial(color, options = {}) {
    const materialConfig = {
        color: color,
        transparent: options.transparent || false,
        opacity: options.opacity || 1,
        wireframe: options.wireframe || false,
        side: options.side || THREE.FrontSide
    };

    // MeshBasicMaterial doesn't support emissive/emissiveIntensity
    // Only add if explicitly needed (shouldn't be used with BasicMaterial)
    return new THREE.MeshBasicMaterial(materialConfig);
}

function createGlowMaterial(color, opacity = 0.3) {
    return new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity
    });
}

// === GEOMETRY HELPERS ===

function createSphere(radius, segments = 16) {
    return new THREE.SphereGeometry(radius, segments, segments);
}

function createBox(width, height, depth) {
    return new THREE.BoxGeometry(width, height, depth);
}

function createCylinder(radiusTop, radiusBottom, height, segments = 8) {
    return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);
}

function createOctahedron(radius, detail = 0) {
    return new THREE.OctahedronGeometry(radius, detail);
}

function createTorus(radius, tube, radialSegments = 16, tubularSegments = 100) {
    return new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
}

// === MESH CREATION HELPERS ===

function createMesh(geometry, material, castShadow = true) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = castShadow;
    return mesh;
}

function createGlowSphere(radius, color, opacity = 0.3, segments = 16) {
    const geometry = createSphere(radius, segments);
    const material = createGlowMaterial(color, opacity);
    return new THREE.Mesh(geometry, material);
}

// === ORBITING OBJECTS ===

function createOrbitingObjects(count, geometryFn, material, radius, userData = {}) {
    const objects = [];
    for (let i = 0; i < count; i++) {
        const obj = new THREE.Mesh(geometryFn(), material);
        const angle = (i / count) * Math.PI * 2;
        obj.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        obj.userData.orbitAngle = angle;
        obj.userData.orbitRadius = radius;
        Object.assign(obj.userData, userData);
        objects.push(obj);
    }
    return objects;
}

// === POSITION HELPERS ===

function randomPosition(range = 600, minDist = 0) {
    const x = (Math.random() * range - range / 2);
    const z = (Math.random() * range - range / 2);
    const dist = Math.sqrt(x * x + z * z);

    if (minDist > 0 && dist < minDist) {
        const angle = Math.random() * Math.PI * 2;
        return {
            x: Math.cos(angle) * (minDist + Math.random() * 100),
            z: Math.sin(angle) * (minDist + Math.random() * 100)
        };
    }
    return { x, z };
}

// === PROJECTILE HELPERS ===

function createProjectile(geometry, material, position, target, speed) {
    const projectile = new THREE.Mesh(geometry, material);
    projectile.position.copy(position);

    // Calculate direction
    const direction = new THREE.Vector3();
    direction.subVectors(target, position);
    direction.normalize();

    // Set velocity
    projectile.velocity = new THREE.Vector3(
        direction.x * speed,
        direction.y * speed,
        direction.z * speed
    );

    projectile.startPosition = position.clone();
    return projectile;
}

// === ANIMATION HELPERS ===

function animateOrbiting(objects, delta, speed = 2) {
    objects.forEach(obj => {
        if (obj.userData.orbitAngle !== undefined) {
            obj.userData.orbitAngle += delta * speed;
            const radius = obj.userData.orbitRadius || 1;
            obj.position.x = Math.cos(obj.userData.orbitAngle) * radius;
            obj.position.z = Math.sin(obj.userData.orbitAngle) * radius;
        }
    });
}

function createPulsingEffect(mesh, time, speed = 3, amount = 0.2) {
    const scale = 1 + Math.sin(time * speed) * amount;
    mesh.scale.set(scale, scale, scale);
}

// === COLLISION HELPERS ===

function distanceTo2D(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dz * dz);
}

function moveTowardsTarget(object, target, speed, delta) {
    const direction = new THREE.Vector3();
    direction.subVectors(target, object.position);
    direction.y = 0;
    direction.normalize();

    object.position.x += direction.x * speed * delta;
    object.position.z += direction.z * speed * delta;

    return direction;
}

// === PICKUP CREATION HELPER ===

function createPickup(x, z, config) {
    const group = new THREE.Group();

    // Create main mesh
    const mesh = createMesh(config.geometry, config.material, true);
    if (config.rotation) {
        mesh.rotation.set(config.rotation.x || 0, config.rotation.y || 0, config.rotation.z || 0);
    }
    group.add(mesh);

    // Add glow if specified
    if (config.glow) {
        const glow = createGlowSphere(config.glow.radius, config.glow.color, config.glow.opacity);
        group.add(glow);
    }

    // Position the group
    group.position.set(x, config.height || 1.5, z);

    // Add to scene
    game.scene.add(group);

    return group;
}

// === ENEMY HP SCALING ===

function getEnemyHP(baseHP, enemyType = 'normal') {
    let hp = baseHP;

    // Scale by world
    if (game.currentWorld === 2 || game.currentWorld === 3) {
        hp = baseHP + 2; // Stronger in World 2 and 3
    }

    // Scale by type
    if (enemyType === 'warrior') {
        hp *= 2;
    } else if (enemyType === 'boss') {
        hp *= 10;
    }

    return hp;
}

// === TIMER UPDATE HELPER ===

function updateTimer(obj, timerName, cooldownName, delta, onComplete) {
    obj[timerName] -= delta;
    if (obj[timerName] <= 0) {
        onComplete();
        obj[timerName] = obj[cooldownName];
    }
}
