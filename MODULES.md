# Anti-Virus 3D - Module Structure

The game code has been divided into 8 thematically organized modules from the original `game.js` file.

## Module Overview

### 1. **utils.js** (219 lines, 20 functions)
- **Content**: Utility helper functions to reduce code duplication
- **Main functions**:
  - `createLambertMaterial()`, `createBasicMaterial()`, `createGlowMaterial()` - Material helpers
  - `createSphere()`, `createBox()`, `createCylinder()`, `createOctahedron()`, `createTorus()` - Geometry helpers
  - `createMesh()`, `createGlowSphere()` - Mesh creation helpers
  - `createOrbitingObjects()`, `animateOrbiting()` - Orbiting objects
  - `randomPosition()`, `distanceTo2D()`, `moveTowardsTarget()` - Position and movement
  - `createProjectile()`, `createPickup()` - Entity creation
  - `getEnemyHP()`, `updateTimer()` - Game mechanics
  - `createPulsingEffect()` - Visual effects

### 2. **gameState.js** (133 lines, 1 function)
- **Content**: Game state and constants
- **Main elements**:
  - `GAME_VERSION` constant
  - `game` object (all game state)
  - `detectMobile()` function

### 3. **world.js** (675 lines, 15 functions)
- **Content**: World generation and environmental elements
- **Main functions**:
  - `createSun()`, `createClouds()` - World 1 sky
  - `createGalaxy()`, `createColoredSpirals()` - World 2 sky
  - `createAshClouds()` - World 3 sky
  - `createWall()`, `createBox()` - Terrain building
  - `createShockwave()`, `createTeleportEffect()` - Visual effects
  - `spawnPortal()`, `checkPortalPickup()`, `updatePortal()` - Portal management
  - `enterWorldTwo()`, `enterWorldThree()` - World transitions

### 4. **enemies.js** (4627 lines, 70 functions)
- **Content**: Enemy creation, AI logic, and boss mechanics
- **Main functions**:
  - `spawnEnemy()` - Enemy spawning
  - `createEnemy()`, `createProjectileEnemy()`, `createWarriorEnemy()` - Different enemy types
  - `createCodeExplosion()`, `updateCodeFragments()` - Death effects
  - `spawnBoss()`, `createBoss()`, `createWorld2Boss()`, `createWorld3Boss()` - Boss creation
  - `updateEnemy()`, `updateBoss()`, `updateWorld2Boss()`, `updateWorld3Boss()` - AI updates
  - `shootEnemyProjectile()`, `shootBossProjectile()`, `shootCodeProjectile()` - Projectile system
  - `updateEnemyProjectiles()`, `updateBossProjectiles()` - Projectile updates
  - `defeatEnemy()`, `defeatBoss()` - Enemy defeat
  - `checkBossCollision()`, `animateWorld3Boss()` - Boss collisions and animations
  - `checkLevelUp()` - Level up handling

### 5. **items.js** (1385 lines, 23 functions)
- **Content**: Items, pickups, weapons, and spells
- **Main functions**:
  - `createShieldPickup()`, `createBowPickup()`, `createAxePickup()` - Weapon pickups
  - `createFoodPickup()`, `createSpellBook()`, `createShop()` - Other items
  - `equipSword()`, `equipBow()`, `equipAxe()`, `equipSpellBook()` - Equipment
  - `attackWithSword()`, `attackWithAxe()` - Melee attacks
  - `shootArrow()` - Ranged attack
  - `castFireball()`, `castFreezeball()`, `castDash()` - Spells
  - `checkShieldPickup()`, `checkBowPickup()`, `checkAxePickup()` - Pickup checking
  - `checkFoodPickup()`, `checkSpellBookPickup()` - Additional pickups
  - `updateSpellUI()`, `switchSpell()` - Spell management

### 6. **player.js** (812 lines, 11 functions)
- **Content**: Player controls, movement, and combat
- **Main functions**:
  - `setupControls()` - Control setup (keyboard, mouse, mobile)
  - `updateMovement()` - Player movement (WASD, dash, freeze)
  - `checkWallCollision()` - Collision detection
  - `updateSwordBobbing()` - Sword animation
  - `updateProjectiles()` - Arrows and projectiles update
  - `updateHPDisplay()`, `updateEXPDisplay()` - HUD updates
  - `updateManaDisplay()`, `updateCoinsDisplay()` - Resource displays
  - `gameOver()` - Game over handling

### 7. **ui.js** (397 lines, 8 functions)
- **Content**: User interface, inventory, and notifications
- **Main functions**:
  - `initInventory()` - Inventory initialization
  - `updateInventoryUI()` - Inventory updates
  - `updateEquippedDisplays()` - Equipped items display
  - `toggleInventory()` - Inventory open/close
  - `toggleEquipSword()`, `toggleEquipItem()` - Equipment toggle
  - `removeItemFromInventory()` - Item removal
  - `showNotification()` - Notification display

### 8. **main.js** (309 lines, 3 functions)
- **Content**: Game initialization and main loop
- **Main functions**:
  - `init()` - Game initialization (scene, camera, renderer, world setup)
  - `animate()` - Main game loop (rendering, update calls)
  - `onWindowResize()` - Window resize handling

## Loading Order

The `index.html` loads the modules in the following order:

1. `utils.js` - Utility helper functions
2. `gameState.js` - Basic states and constants
3. `ui.js` - UI functions
4. `world.js` - World building
5. `enemies.js` - Enemies
6. `items.js` - Items
7. `player.js` - Player
8. `main.js` - Initialization and main loop

This order ensures that all dependencies are available when needed.

## Advantages

✅ **Better code organization** - Thematically organized, easily navigable
✅ **Easier maintenance** - Smaller, more transparent files
✅ **Faster development** - Code is easy to find
✅ **Team collaboration** - Modules can be developed in parallel
✅ **Better performance** - Modular loading capability
✅ **Scalability** - New modules can be easily added

## Notes

- The original `game.js` file remains in the project as a backup
- All modules use global variables (`game`, `THREE`)
- Functions have retained their original names and functionality
- No code modification needed, only refactoring was performed
