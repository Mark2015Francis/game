// Player controls, movement, and combat

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
function updateCoinsDisplay() {
    const coinDisplay = document.getElementById('coinDisplay');
    if (coinDisplay) {
        coinDisplay.textContent = `💰 Coins: ${game.coins}`;
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
                    // Check if using big jump spell
                    if (game.hasBigJump && game.equippedSpellBook) {
                        const manaCost = 5;
                        if (game.playerMana >= manaCost) {
                            // Use big jump
                            game.velocity.y = game.jumpHeight * 2; // Double jump height
                            game.playerMana -= manaCost;
                            updateManaDisplay();
                        } else {
                            // Not enough mana, use normal jump
                            game.velocity.y = game.jumpHeight;
                        }
                    } else {
                        // Normal jump
                        game.velocity.y = game.jumpHeight;
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

    // Mouse click for attacking
    document.addEventListener('click', (event) => {
        if (game.isPointerLocked && !game.inventory.isOpen) {
            if (game.equippedBow) {
                shootArrow();
            } else if (game.equippedAxe) {
                attackWithAxe();
            } else {
                attackWithSword();
            }
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
                        shootArrow();
                    } else if (game.equippedAxe) {
                        attackWithAxe();
                    } else {
                        attackWithSword();
                    }
                }
            });
        }

        // Jump button
        if (mobileJumpBtn) {
            mobileJumpBtn.addEventListener('touchstart', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (game.controls.canJump && game.isPointerLocked && !game.inventory.isOpen && !game.isShopOpen) {
                    // Check if using big jump spell
                    if (game.hasBigJump && game.equippedSpellBook) {
                        const manaCost = 5;
                        if (game.playerMana >= manaCost) {
                            // Use big jump
                            game.velocity.y = game.jumpHeight * 2; // Double jump height
                            game.playerMana -= manaCost;
                            updateManaDisplay();
                        } else {
                            // Not enough mana, use normal jump
                            game.velocity.y = game.jumpHeight;
                        }
                    } else {
                        // Normal jump
                        game.velocity.y = game.jumpHeight;
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

    // Add joystick Y input for forward/backward (invert Y axis: negative = forward)
    if (game.joystickActive) {
        moveZ += -game.joystickDeltaY;
        // Note: joystick X is used for camera rotation, not strafing
    }

    // Apply joystick X input to camera rotation (turning left/right)
    if (game.joystickActive && game.joystickDeltaX !== 0) {
        const turnSpeed = 2.5; // Adjust sensitivity for mobile turning
        game.rotation.y -= game.joystickDeltaX * turnSpeed * delta;
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
            // Apply normal movement
            const moveSpeed = game.playerSpeed * delta;

            // Forward/backward movement (keyboard or joystick)
            if (game.controls.moveForward || game.controls.moveBackward || (game.joystickActive && game.joystickDeltaY !== 0)) {
                const forward = new THREE.Vector3(0, 0, -1);
                forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), game.rotation.y);
                game.camera.position.x += forward.x * game.direction.z * moveSpeed;
                game.camera.position.z += forward.z * game.direction.z * moveSpeed;
            }

            // Left/right movement (keyboard only - joystick X now controls camera rotation)
            if (game.controls.moveLeft || game.controls.moveRight) {
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

        // Check collision with enemies
        let hitEnemy = false;
        for (let j = 0; j < game.enemies.length; j++) {
            const enemy = game.enemies[j];
            const distance = arrow.position.distanceTo(enemy.position);

            if (distance < 1.5) {
                // Determine damage based on projectile type
                let damage = 1; // Arrows deal 1 damage
                let emoji = '🏹';

                if (arrow.isFireball) {
                    damage = 3; // Fireballs deal 3 damage
                    emoji = '🔥';
                } else if (arrow.isFreezeball) {
                    damage = 2; // Freezeballs deal 2 damage
                    emoji = '❄️';
                    // Freeze effect: freeze enemy
                    enemy.isFrozen = true;
                    // Store original color if not already stored
                    if (!enemy.frozenOriginalColor) {
                        enemy.frozenOriginalColor = enemy.material.color.getHex();
                    }
                    // Turn enemy blue
                    enemy.material.color.setHex(0x0088ff);
                    enemy.material.emissive.setHex(0x0044aa);

                    setTimeout(() => {
                        if (enemy) {
                            enemy.isFrozen = false;
                            // Restore original color
                            if (enemy.frozenOriginalColor !== undefined) {
                                enemy.material.color.setHex(enemy.frozenOriginalColor);
                                enemy.material.emissive.setHex(0x330000);
                                enemy.frozenOriginalColor = undefined;
                            }
                        }
                    }, 3000); // Frozen for 3 seconds
                }

                // Hit enemy
                enemy.hp -= damage;

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

                showNotification(`${emoji} Hit! Enemy HP: ${Math.max(0, enemy.hp)}/${enemy.maxHP || 5}`);

                if (enemy.hp <= 0) {
                    defeatEnemy(enemy, j);
                }

                hitEnemy = true;
                break;
            }
        }

        // Check collision with boss
        if (!hitEnemy && game.boss) {
            const distance = arrow.position.distanceTo(game.boss.position);
            if (distance < 4) { // Boss has larger hitbox
                // Determine damage based on projectile type
                let damage = 1; // Arrows deal 1 damage
                let emoji = '🏹';

                if (arrow.isFireball) {
                    damage = 5; // Fireballs deal 5 damage to boss
                    emoji = '🔥';
                } else if (arrow.isFreezeball) {
                    damage = 3; // Freezeballs deal 3 damage to boss
                    emoji = '❄️';
                    // Freeze effect on boss: slow movement and turn bluish
                    game.boss.isFrozen = true;
                    // Store original color if not already stored
                    if (!game.boss.frozenOriginalColor) {
                        game.boss.frozenOriginalColor = game.boss.material.color.getHex();
                    }
                    // Turn boss bluish (mix of original red and blue)
                    game.boss.material.color.setHex(0x6600aa); // Purple-blue
                    game.boss.material.emissive.setHex(0x3300aa);

                    setTimeout(() => {
                        if (game.boss) {
                            game.boss.isFrozen = false;
                            // Restore original color
                            if (game.boss.frozenOriginalColor !== undefined) {
                                game.boss.material.color.setHex(game.boss.frozenOriginalColor);
                                game.boss.material.emissive.setHex(0x660000);
                                game.boss.frozenOriginalColor = undefined;
                            }
                        }
                    }, 5000); // Frozen for 5 seconds
                }

                // Hit boss
                game.boss.hp -= damage;

                // Visual feedback
                const originalColor = game.boss.material.color.getHex();
                game.boss.material.color.setHex(0xffffff);
                game.boss.material.emissive.setHex(0xffffff);
                setTimeout(() => {
                    if (game.boss && game.boss.material) {
                        game.boss.material.color.setHex(originalColor);
                        game.boss.material.emissive.setHex(0x660000);
                    }
                }, 150);

                showNotification(`${emoji} BOSS Hit! HP: ${Math.max(0, game.boss.hp)}/${game.boss.maxHP || 100}`);

                if (game.boss.hp <= 0) {
                    defeatBoss();
                }

                hitEnemy = true; // Use same flag to remove projectile
            }
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
