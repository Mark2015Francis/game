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
    axe: null,
    axeCollected: false,
    equippedAxe: false,
    axeCooldown: 0,
    equippedAxeMesh: null,
    projectiles: [],
    shootCooldown: 0,
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
    coins: 0,
    shop: null,
    isShopOpen: false,
    shieldCount: 0,
    foodCount: 0,
    spellBook: null,
    spellBookCollected: false,
    equippedSpellBook: false,
    currentSpell: 'fireball', // 'fireball', 'freezeball', or 'dash'
    hasFireball: false,
    hasBigJump: false,
    hasFreezeball: false,
    hasDash: false,
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
    joystickDeltaY: 0
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
