# Anti-Virus 3D - Module Structure

A játék kódja 7 tematikusan rendezett modulba lett felosztva az eredeti `game.js` fájlból.

## Modulok áttekintése

### 1. **gameState.js** (133 sor, 1 funkció)
- **Tartalom**: Játék állapot és konstansok
- **Főbb elemek**:
  - `GAME_VERSION` konstans
  - `game` objektum (összes játékállapot)
  - `detectMobile()` funkció

### 2. **world.js** (807 sor, 14 funkció)
- **Tartalom**: Világ generálás és környezeti elemek
- **Főbb funkciók**:
  - `createSun()`, `createClouds()` - World 1 ég
  - `createGalaxy()`, `createColoredSpirals()` - World 2 ég
  - `createAshClouds()` - World 3 ég
  - `createWall()`, `createBox()` - Terepépítés
  - `createShockwave()`, `createTeleportEffect()` - Vizuális effektek
  - `spawnPortal()`, `checkPortalPickup()`, `updatePortal()` - Portál kezelés
  - `enterWorldTwo()`, `enterWorldThree()` - Világ váltás

### 3. **enemies.js** (4708 sor, 68 funkció)
- **Tartalom**: Ellenség létrehozás, AI logika és boss mechanic
- **Főbb funkciók**:
  - `spawnEnemy()` - Ellenség spawn
  - `createEnemy()`, `createProjectileEnemy()`, `createWarriorEnemy()` - Különböző ellenségtípusok
  - `createCodeExplosion()`, `updateCodeFragments()` - Halál effektek
  - `spawnBoss()`, `createBoss()`, `createWorld2Boss()`, `createWorld3Boss()` - Boss létrehozás
  - `updateEnemy()`, `updateBoss()`, `updateWorld2Boss()`, `updateWorld3Boss()` - AI frissítés
  - `shootEnemyProjectile()`, `shootBossProjectile()`, `shootCodeProjectile()` - Lövedék rendszer
  - `updateEnemyProjectiles()`, `updateBossProjectiles()` - Lövedék frissítés
  - `defeatEnemy()`, `defeatBoss()` - Ellenség legyőzése
  - `checkBossCollision()`, `animateWorld3Boss()` - Boss ütközések és animációk
  - `checkLevelUp()` - Szintlépés kezelés

### 4. **items.js** (1467 sor, 23 funkció)
- **Tartalom**: Tárgyak, pickupok, fegyverek és varázslatok
- **Főbb funkciók**:
  - `createShieldPickup()`, `createBowPickup()`, `createAxePickup()` - Fegyver pickupok
  - `createFoodPickup()`, `createSpellBook()`, `createShop()` - Egyéb tárgyak
  - `equipSword()`, `equipBow()`, `equipAxe()`, `equipSpellBook()` - Felszerelés
  - `attackWithSword()`, `attackWithAxe()` - Közelharc támadások
  - `shootArrow()` - Távolsági támadás
  - `castFireball()`, `castFreezeball()`, `castDash()` - Varázslatok
  - `checkShieldPickup()`, `checkBowPickup()`, `checkAxePickup()` - Pickup ellenőrzés
  - `checkFoodPickup()`, `checkSpellBookPickup()` - További pickupok
  - `updateSpellUI()`, `switchSpell()` - Varázslatkezelés

### 5. **player.js** (812 sor, 11 funkció)
- **Tartalom**: Játékos irányítás, mozgás és harc
- **Főbb funkciók**:
  - `setupControls()` - Irányítás beállítása (billentyűzet, egér, mobile)
  - `updateMovement()` - Játékos mozgás (WASD, dash, freeze)
  - `checkWallCollision()` - Ütközésérzékelés
  - `updateSwordBobbing()` - Kard animáció
  - `updateProjectiles()` - Nyilak és lövedékek frissítése
  - `updateHPDisplay()`, `updateEXPDisplay()` - HUD frissítés
  - `updateManaDisplay()`, `updateCoinsDisplay()` - Erőforrás kijelzők
  - `gameOver()` - Játék vége kezelés

### 6. **ui.js** (397 sor, 8 funkció)
- **Tartalom**: Felhasználói felület, inventory és értesítések
- **Főbb funkciók**:
  - `initInventory()` - Inventory inicializálás
  - `updateInventoryUI()` - Inventory frissítése
  - `updateEquippedDisplays()` - Felszerelt tárgyak megjelenítése
  - `toggleInventory()` - Inventory megnyitás/bezárás
  - `toggleEquipSword()`, `toggleEquipItem()` - Tárgy felszerelés váltás
  - `removeItemFromInventory()` - Tárgy eltávolítása
  - `showNotification()` - Értesítések megjelenítése

### 7. **main.js** (309 sor, 3 funkció)
- **Tartalom**: Játék inicializálás és fő ciklus
- **Főbb funkciók**:
  - `init()` - Játék inicializálása (scene, camera, renderer, world setup)
  - `animate()` - Fő játék loop (renderelés, update hívások)
  - `onWindowResize()` - Ablakméretezés kezelése

## Betöltési sorrend

Az `index.html` a következő sorrendben tölti be a modulokat:

1. `gameState.js` - Alapvető állapotok és konstansok
2. `ui.js` - UI funkciók
3. `world.js` - Világépítés
4. `enemies.js` - Ellenségek
5. `items.js` - Tárgyak
6. `player.js` - Játékos
7. `main.js` - Inicializálás és főciklus

Ez a sorrend biztosítja, hogy minden függőség elérhető legyen amikor szükség van rá.

## Előnyök

✅ **Jobb kód szervezés** - Tematikusan rendezett, könnyen navigálható
✅ **Könnyebb karbantartás** - Kisebb, átláthatóbb fájlok
✅ **Gyorsabb fejlesztés** - Könnyen megtalálható kód
✅ **Csapatmunka támogatás** - Modulok párhuzamosan fejleszthetők
✅ **Jobb teljesítmény** - Moduláris betöltés lehetősége
✅ **Skálázhatóság** - Új modulok könnyen hozzáadhatók

## Megjegyzések

- Az eredeti `game.js` fájl megmaradt a projektben backup céllal
- Minden modul globális változókat használ (`game`, `THREE`)
- A függvények megtartották eredeti nevüket és működésüket
- Nincs szükség kód módosításra, csak refaktorálás történt
