// Game variables
let canvas;
let engine;
let scene;
let camera;
let player;
let bots = [];
let bullets = [];
let playerHealth = 100;
let playerAmmo = 30;
let score = 0;
let isGameRunning = false;
let username = '';
let killBoardTimeout = null;

// Multiplayer variables
let ws = null;
let playerCount = 1;

// Input handling
let inputMap = {};
let mouseX = 0;
let mouseY = 0;

// Initialize the game
window.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    showUsernameScreen();
});

function showUsernameScreen() {
    document.getElementById('usernameScreen').style.display = 'flex';
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('usernameButton').onclick = function() {
        const input = document.getElementById('usernameInput').value.trim();
        if (input.length > 0) {
            username = input;
            connectWebSocket();
        } else {
            alert('Please enter a username.');
        }
    };
    document.getElementById('usernameInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') document.getElementById('usernameButton').click();
    });
}

function connectWebSocket() {
    // Use wss:// if on HTTPS, ws:// otherwise
    let protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    let wsUrl = protocol + window.location.host;
    ws = new WebSocket(wsUrl);
    ws.onopen = function() {
        ws.send(JSON.stringify({ type: 'join', username }));
    };
    ws.onmessage = function(event) {
        let data;
        try {
            data = JSON.parse(event.data);
        } catch (e) { return; }
        if (data.type === 'join_ack') {
            playerCount = data.count;
            document.getElementById('usernameScreen').style.display = 'none';
            document.getElementById('homeScreen').style.display = 'flex';
        } else if (data.type === 'player_joined') {
            playerCount++;
            if (playerCount === 2) {
                showKillMessage(`${data.username} joined the game!`, '');
                hideAIs();
            }
        } else if (data.type === 'player_left') {
            playerCount--;
            if (playerCount === 1) {
                showKillMessage('AIs have returned!', '');
                showAIs();
            }
        }
    };
    ws.onclose = function() {
        playerCount = 1;
        showAIs();
    };
}

function setupEventListeners() {
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('controlsButton').addEventListener('click', showControls);
    document.getElementById('exitButton').addEventListener('click', exitGame);
}

function startGame() {
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    
    canvas = document.getElementById('gameCanvas');
    engine = new BABYLON.Engine(canvas, true);
    
    // Reset game state
    bots = [];
    bullets = [];
    playerHealth = 100;
    playerAmmo = 30;
    score = 0;
    document.getElementById('killBoard').textContent = '';
    if (killBoardTimeout) clearTimeout(killBoardTimeout);
    
    scene = createScene();
    
    engine.runRenderLoop(function() {
        scene.render();
    });
    
    window.addEventListener('resize', function() {
        engine.resize();
    });
    
    // Lock mouse pointer
    canvas.requestPointerLock();
    
    isGameRunning = true;
    
    // Multiplayer: hide AIs if 2+ players
    if (playerCount >= 2) hideAIs();
}

function createScene() {
    const scene = new BABYLON.Scene(engine);
    
    // Camera
    camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 2, -10), scene);
    camera.attachControl(canvas, true);
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.minZ = 0.1;
    
    // Lighting
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    
    const dirLight = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(0, -1, 0), scene);
    dirLight.intensity = 0.5;
    
    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround('ground', {width: 100, height: 100}, scene);
    const groundMaterial = new BABYLON.StandardMaterial('groundMat', scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    ground.checkCollisions = true;
    ground.material = groundMaterial;
    
    // Walls
    createWalls(scene);
    
    // Player weapon
    createPlayerWeapon(scene);
    
    // Create bots
    createBots(scene);
    
    // Input handling
    scene.onKeyboardObservable.add(function(kbInfo) {
        switch (kbInfo.type) {
            case BABYLON.KeyboardEventTypes.KEYDOWN:
                inputMap[kbInfo.event.code] = true;
                break;
            case BABYLON.KeyboardEventTypes.KEYUP:
                inputMap[kbInfo.event.code] = false;
                break;
        }
    });
    
    // Mouse click for shooting
    scene.onPointerObservable.add(function(pointerInfo) {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN && pointerInfo.event.button === 0) {
            shoot();
        }
    });
    
    // Game loop
    scene.registerBeforeRender(function() {
        if (isGameRunning) {
            updateGame();
        }
    });
    
    return scene;
}

function createWalls(scene) {
    const wallMaterial = new BABYLON.StandardMaterial('wallMat', scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    
    // North wall
    const northWall = BABYLON.MeshBuilder.CreateBox('northWall', {width: 100, height: 10, depth: 2}, scene);
    northWall.position = new BABYLON.Vector3(0, 5, -50);
    northWall.checkCollisions = true;
    northWall.material = wallMaterial;
    
    // South wall
    const southWall = BABYLON.MeshBuilder.CreateBox('southWall', {width: 100, height: 10, depth: 2}, scene);
    southWall.position = new BABYLON.Vector3(0, 5, 50);
    southWall.checkCollisions = true;
    southWall.material = wallMaterial;
    
    // East wall
    const eastWall = BABYLON.MeshBuilder.CreateBox('eastWall', {width: 2, height: 10, depth: 100}, scene);
    eastWall.position = new BABYLON.Vector3(50, 5, 0);
    eastWall.checkCollisions = true;
    eastWall.material = wallMaterial;
    
    // West wall
    const westWall = BABYLON.MeshBuilder.CreateBox('westWall', {width: 2, height: 10, depth: 100}, scene);
    westWall.position = new BABYLON.Vector3(-50, 5, 0);
    westWall.checkCollisions = true;
    westWall.material = wallMaterial;
}

function createPlayerWeapon(scene) {
    // Simple weapon mesh
    const weapon = BABYLON.MeshBuilder.CreateBox('weapon', {width: 0.1, height: 0.1, depth: 0.5}, scene);
    const weaponMaterial = new BABYLON.StandardMaterial('weaponMat', scene);
    weaponMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    weapon.material = weaponMaterial;
    
    // Position weapon in front of camera
    weapon.parent = camera;
    weapon.position = new BABYLON.Vector3(0.3, -0.2, 0.5);
}

function createBots(scene) {
    const botMaterial = new BABYLON.StandardMaterial('botMat', scene);
    botMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
    
    for (let i = 0; i < 5; i++) {
        const bot = BABYLON.MeshBuilder.CreateBox('bot' + i, {width: 1, height: 2, depth: 1}, scene);
        bot.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 80,
            1,
            (Math.random() - 0.5) * 80
        );
        bot.checkCollisions = true;
        bot.material = botMaterial;
        
        bots.push({
            mesh: bot,
            health: 100,
            lastShot: 0,
            direction: new BABYLON.Vector3(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize()
        });
    }
}

function updateGame() {
    // Update player movement
    const moveSpeed = 0.3;
    const forward = inputMap['KeyW'] || inputMap['ArrowUp'];
    const backward = inputMap['KeyS'] || inputMap['ArrowDown'];
    const left = inputMap['KeyA'] || inputMap['ArrowLeft'];
    const right = inputMap['KeyD'] || inputMap['ArrowDown'];
    
    if (forward) camera.moveWithCollisions(camera.getDirection(BABYLON.Axis.Z).scale(moveSpeed));
    if (backward) camera.moveWithCollisions(camera.getDirection(BABYLON.Axis.Z).scale(-moveSpeed));
    if (left) camera.moveWithCollisions(camera.getDirection(BABYLON.Axis.X).scale(-moveSpeed));
    if (right) camera.moveWithCollisions(camera.getDirection(BABYLON.Axis.X).scale(moveSpeed));
    
    // Update bots
    updateBots();
    
    // Update bullets
    updateBullets();
    
    // Update HUD
    updateHUD();
}

function updateBots() {
    const currentTime = Date.now();
    
    bots.forEach((bot, index) => {
        if (bot.health <= 0) return;
        
        // Simple AI movement
        bot.mesh.position.addInPlace(bot.direction.scale(0.02));
        
        // Change direction randomly
        if (Math.random() < 0.01) {
            bot.direction = new BABYLON.Vector3(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize();
        }
        
        // Keep bots in bounds
        if (Math.abs(bot.mesh.position.x) > 45) bot.direction.x *= -1;
        if (Math.abs(bot.mesh.position.z) > 45) bot.direction.z *= -1;
        
        // Bot shooting
        if (currentTime - bot.lastShot > 1000) { // 1 second cooldown
            const distanceToPlayer = BABYLON.Vector3.Distance(bot.mesh.position, camera.position);
            if (distanceToPlayer < 20) {
                botShoot(bot);
                bot.lastShot = currentTime;
            }
        }
    });
}

function botShoot(bot) {
    const bullet = BABYLON.MeshBuilder.CreateSphere('botBullet', {diameter: 0.2}, scene);
    const bulletMaterial = new BABYLON.StandardMaterial('botBulletMat', scene);
    bulletMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);
    bullet.material = bulletMaterial;
    
    bullet.position = bot.mesh.position.clone();
    
    const direction = camera.position.subtract(bot.mesh.position).normalize();
    const speed = 0.5;
    
    bullets.push({
        mesh: bullet,
        velocity: direction.scale(speed),
        isBotBullet: true
    });
}

function shoot() {
    if (playerAmmo <= 0) return;
    
    playerAmmo--;
    
    const bullet = BABYLON.MeshBuilder.CreateSphere('bullet', {diameter: 0.1}, scene);
    const bulletMaterial = new BABYLON.StandardMaterial('bulletMat', scene);
    bulletMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);
    bullet.material = bulletMaterial;
    
    bullet.position = camera.position.clone();
    
    const direction = camera.getDirection(BABYLON.Axis.Z);
    const speed = 1;
    
    bullets.push({
        mesh: bullet,
        velocity: direction.scale(speed),
        isBotBullet: false
    });
    
    // Check for hits
    const ray = new BABYLON.Ray(camera.position, direction);
    const hit = scene.pickWithRay(ray);
    
    if (hit.pickedMesh && hit.pickedMesh.name.startsWith('bot')) {
        const botIndex = parseInt(hit.pickedMesh.name.substring(3));
        if (bots[botIndex]) {
            bots[botIndex].health -= 25;
            if (bots[botIndex].health <= 0) {
                score += 100;
                hit.pickedMesh.dispose();
            }
        }
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.mesh.position.addInPlace(bullet.velocity);
        let bulletRemoved = false;
        
        // Remove bullets that are too far
        if (bullet.mesh.position.length() > 100) {
            bullet.mesh.dispose();
            bullets.splice(i, 1);
            continue;
        }
        
        // Check bullet collisions
        if (bullet.isBotBullet) {
            // Bot bullet hitting player
            if (BABYLON.Vector3.Distance(bullet.mesh.position, camera.position) < 1) {
                playerHealth -= 10;
                bullet.mesh.dispose();
                bullets.splice(i, 1);
                bulletRemoved = true;
            }
        } else {
            // Player bullet hitting bots
            for (let j = 0; j < bots.length; j++) {
                const bot = bots[j];
                if (bot.health > 0 && BABYLON.Vector3.Distance(bullet.mesh.position, bot.mesh.position) < 1) {
                    bot.health -= 25;
                    if (bot.health <= 0) {
                        score += 100;
                        showKillMessage(username, 'Bot');
                        bot.mesh.dispose();
                        // Respawn bot after short delay
                        setTimeout(() => respawnBot(j), 1000);
                    }
                    bullet.mesh.dispose();
                    bullets.splice(i, 1);
                    bulletRemoved = true;
                    break; // Stop checking other bots for this bullet
                }
            }
        }
        // If bullet was removed, skip to next bullet
        if (bulletRemoved) continue;
    }
}

function respawnBot(index) {
    // Remove old bot mesh if not already disposed
    if (bots[index] && bots[index].mesh && !bots[index].mesh.isDisposed()) {
        bots[index].mesh.dispose();
    }
    // Create new bot
    const scene = window.scene || engine.scenes[0];
    const botMaterial = new BABYLON.StandardMaterial('botMat', scene);
    botMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
    const bot = BABYLON.MeshBuilder.CreateBox('bot' + index, {width: 1, height: 2, depth: 1}, scene);
    bot.position = new BABYLON.Vector3(
        (Math.random() - 0.5) * 80,
        1,
        (Math.random() - 0.5) * 80
    );
    bot.checkCollisions = true;
    bot.material = botMaterial;
    bots[index] = {
        mesh: bot,
        health: 100,
        lastShot: 0,
        direction: new BABYLON.Vector3(
            Math.random() - 0.5,
            0,
            Math.random() - 0.5
        ).normalize()
    };
}

function showKillMessage(killer, victim) {
    const killBoard = document.getElementById('killBoard');
    if (victim === '') {
        killBoard.textContent = killer;
    } else {
        killBoard.textContent = `${killer} killed ${victim}`;
    }
    killBoard.classList.add('glitch-red');
    if (killBoardTimeout) clearTimeout(killBoardTimeout);
    killBoardTimeout = setTimeout(() => {
        killBoard.textContent = '';
        killBoard.classList.remove('glitch-red');
    }, 2000);
}

function updateHUD() {
    document.getElementById('health').textContent = 'Health: ' + playerHealth;
    document.getElementById('ammo').textContent = 'Ammo: ' + playerAmmo;
    document.getElementById('score').textContent = 'Score: ' + score;
    
    if (playerHealth <= 0) {
        gameOver();
    }
}

function showControls() {
    alert('Controls:\nWASD or Arrow Keys - Move\nMouse - Look around\nLeft Click - Shoot\nESC - Pause');
}

function exitGame() {
    if (confirm('Are you sure you want to exit?')) {
        window.close();
    }
}

function gameOver() {
    isGameRunning = false;
    alert('Game Over! Your score: ' + score);
    location.reload();
}

function hideAIs() {
    bots.forEach(bot => {
        if (bot.mesh && !bot.mesh.isDisposed()) {
            bot.mesh.setEnabled(false);
        }
        bot.health = 0;
    });
}

function showAIs() {
    bots.forEach(bot => {
        if (bot.mesh && bot.mesh.isDisposed()) return;
        if (bot.mesh) bot.mesh.setEnabled(true);
        bot.health = 100;
    });
} 