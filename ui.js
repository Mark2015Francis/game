// UI elements, inventory, and HUD

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
        <div class="item-name">Sword</div>
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
            <div class="item-name">Shield x${game.shieldCount}</div>
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
            <div class="item-icon">🍎</div>
            <div class="item-name">Food x${game.foodCount}</div>
        `;
        foodSlot.addEventListener('click', () => toggleEquipItem({type: 'food'}));
    } else {
        foodSlot.classList.add('empty');
        foodSlot.innerHTML = '<div class="item-icon">—</div><div class="item-name">Empty</div>';
    }
    inventoryItems.appendChild(foodSlot);

    // Bow slot
    const bowSlot = document.createElement('div');
    bowSlot.className = 'inventory-slot';
    if (game.bowCollected) {
        if (game.equippedBow) {
            bowSlot.classList.add('equipped');
        }
        bowSlot.innerHTML = `
            <div class="item-icon">🏹</div>
            <div class="item-name">Bow</div>
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
            <div class="item-name">Axe</div>
            ${game.equippedAxe ? '<div class="item-status">EQUIPPED</div>' : ''}
        `;
        axeSlot.addEventListener('click', () => toggleEquipItem({type: 'axe'}));
    } else {
        axeSlot.classList.add('empty');
        axeSlot.innerHTML = '<div class="item-icon">—</div><div class="item-name">Empty</div>';
    }
    inventoryItems.appendChild(axeSlot);

    // Spell Book slot
    const spellBookSlot = document.createElement('div');
    spellBookSlot.className = 'inventory-slot';
    if (game.spellBookCollected) {
        if (game.equippedSpellBook) {
            spellBookSlot.classList.add('equipped');
        }
        spellBookSlot.innerHTML = `
            <div class="item-icon">📖</div>
            <div class="item-name">Spell Book</div>
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
        weaponLabel.textContent = 'Sword';
        weaponDisplay.classList.add('active');
    } else if (game.equippedBow) {
        weaponIcon.textContent = '🏹';
        weaponLabel.textContent = 'Bow';
        weaponDisplay.classList.add('active');
    } else if (game.equippedSpellBook) {
        weaponIcon.textContent = '📖';
        weaponLabel.textContent = 'Spell Book';
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
        // Equip sword - unequip bow and spell book first if equipped
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
            // Equip bow - unequip sword, axe, and spell book first
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
            // Equip axe - unequip sword, bow and spell book first
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

            showNotification(`🍎 Food consumed! Healed ${actualHeal} HP (${game.playerHP}/${game.maxPlayerHP}) | ${game.foodCount} remaining`);
            toggleInventory(); // Close inventory after using
        }
    } else if (item.type === 'spellbook') {
        if (!game.spellBookCollected) return; // No spell book to equip

        if (game.equippedSpellBook) {
            // Unequip spell book
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
            // Re-equip sword
            game.inventory.equippedSword = true;
            equipSword();
        } else {
            // Equip spell book - unequip sword, bow, and axe first
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
