Player = function(game, canvas) {
    // _this est l'accès à la caméra à l'interieur de Player
    var _this = this;
    // Si le tir est activée ou non
    _this.weponShoot = false;

    _this.angularSensibility = 0;
    // Le jeu, chargé dans l'objet Player
    _this.game = game;
    _this.speed = 0.3;

    // Axe de mouvement X et Z
    _this.axisMovement = [false,false,false,false];

    // On affecte le clic et on vérifie qu'il est bien utilisé dans la scène (_this.controlEnabled)
    canvas.addEventListener("mousedown", function(evt) {
        if (_this.controlEnabled && !_this.weponShoot) {
            _this.weponShoot = true;
            _this.handleUserMouseDown();
        }
    }, false);

    // On fait pareil quand l'utilisateur relache le clic de la souris
    canvas.addEventListener("mouseup", function(evt) {
        if (_this.controlEnabled && _this.weponShoot) {
            _this.weponShoot = false;
            _this.handleUserMouseUp();
        }
    }, false);

    window.addEventListener("keyup", function(evt) {
        
        switch(evt.keyCode){
            case 90:
            _this.camera.axisMovement[0] = false;
            break;
            case 83:
            _this.camera.axisMovement[1] = false;
            break;
            case 81:
            _this.camera.axisMovement[2] = false;
            break;
            case 68:
            _this.camera.axisMovement[3] = false;
            break;
        }
    }, false);
    
    // Quand les touches sont relachés
    window.addEventListener("keydown", function(evt) {
        switch(evt.keyCode){
            case 90:
            _this.camera.axisMovement[0] = true;
            break;
            case 83:
            _this.camera.axisMovement[1] = true;
            break;
            case 81:
            _this.camera.axisMovement[2] = true;
            break;
            case 68:
            _this.camera.axisMovement[3] = true;
            break;
        }
    }, false);

    // Quand la souris bouge dans la scène
    window.addEventListener("mousemove", function(evt) {
        if(_this.rotEngaged === true){
            _this.camera.playerBox.rotation.y+=evt.movementX * 0.001 * (_this.angularSensibility / 250);
            var nextRotationX = _this.camera.playerBox.rotation.x + (evt.movementY * 0.001 * (_this.angularSensibility / 250));
            if( nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)){
                _this.camera.playerBox.rotation.x+=evt.movementY * 0.001 * (_this.angularSensibility / 250);
            }
        }
    }, false);
    
    // Initialisation de la caméra
    _this._initCamera(game.scene, canvas); 
    // Le joueur doit cliquer dans la scène pour que controlEnabled soit changé
    _this.controlEnabled = false;

    // On lance l'event _initPointerLock pour checker le clic dans la scène
    _this._initPointerLock(); 

    
};


Player.prototype = {
    _initCamera : function(scene, canvas) {

        // PlayerBox
        var playerBox = BABYLON.Mesh.CreateBox("headMainPlayer", 3, scene);
        playerBox.position = new BABYLON.Vector3(-20, 5, 0);
        playerBox.ellipsoid = new BABYLON.Vector3(2, 2, 2);

        // On crée la caméra
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, 0), scene);
        this.camera.playerBox = playerBox
        this.camera.parent = this.camera.playerBox;
        
        // On affecte le mouvement de la caméra au canvas
        this.camera.attachControl(canvas, true);
        
        // Ajout des collisions avec playerBox
        this.camera.playerBox.checkCollisions = true;
        this.camera.playerBox.applyGravity = true;
        
        // Si le joueur est en vie ou non
        this.isAlive = true;

        // Pour savoir que c'est le joueur principal
        this.camera.isMain = true;

        // On crée les armes !
        this.camera.weapons = new Weapons(this);

        // On ajoute l'axe de mouvement
        this.camera.axisMovement = [false,false,false,false];

        /////////////////////////////////////////////////
        // La santé du joueur
        this.camera.health = 100;
        // L'armure du joueur
        this.camera.armor = 0;

    },
    _initPointerLock : function() {
        var _this = this;
        
        // Requete pour la capture du pointeur
        var canvas = this.game.scene.getEngine().getRenderingCanvas();
        canvas.addEventListener("click", function(evt) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }, false);
    
        // Evenement pour changer le paramètre de rotation
        var pointerlockchange = function (event) {
            _this.controlEnabled = (document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas || document.msPointerLockElement === canvas || document.pointerLockElement === canvas);
            if (!_this.controlEnabled) {
                _this.rotEngaged = false;
            } else {
                _this.rotEngaged = true;
            }
        };
        
        // Event pour changer l'état du pointeur, sous tout les types de navigateur
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    },
    _checkMove : function(ratioFps) {
        let relativeSpeed = this.speed / ratioFps;
        if(this.camera.axisMovement[0]){
            forward = new BABYLON.Vector3(
                parseFloat(Math.sin(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed, 
                0, 
                parseFloat(Math.cos(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(forward);
        }
        if(this.camera.axisMovement[1]){
            backward = new BABYLON.Vector3(
                parseFloat(-Math.sin(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed, 
                0, 
                parseFloat(-Math.cos(parseFloat(this.camera.playerBox.rotation.y))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(backward);
        }
        if(this.camera.axisMovement[2]){
            left = new BABYLON.Vector3(
                parseFloat(Math.sin(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed, 
                0, 
                parseFloat(Math.cos(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(left);
        }
        if(this.camera.axisMovement[3]){
            right = new BABYLON.Vector3(
                parseFloat(-Math.sin(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed, 
                0, 
                parseFloat(-Math.cos(parseFloat(this.camera.playerBox.rotation.y) + degToRad(-90))) * relativeSpeed
            );
            this.camera.playerBox.moveWithCollisions(right);
        }
        this.camera.playerBox.moveWithCollisions(new BABYLON.Vector3(0,(-1.5) * relativeSpeed ,0));
    },
    handleUserMouseDown : function() {
        if(this.isAlive === true){
            this.camera.Weapons.fire();
        }
    },
    handleUserMouseUp : function() {
        if(this.isAlive === true){
            this.camera.Weapons.stopFire();
        }
    },
    getDamage : function(damage){
        var damageTaken = damage;
        // Tampon des dégâts par l'armure
        if(this.camera.armor > Math.round(damageTaken/2)){
            this.camera.armor -= Math.round(damageTaken/2);
            damageTaken = Math.round(damageTaken/2);
        }else{
            damageTaken = damageTaken - this.camera.armor;
            this.camera.armor = 0;
        }
    
        // Si le joueur i a encore de la vie
        if(this.camera.health>damageTaken){
            this.camera.health-=damageTaken;
        }else{
            // Sinon, il est mort
            this.playerDead()
        }
    },
    playerDead : function(i) {
        this.deadCamera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 
        1, 0.8, 10, new BABYLON.Vector3(
            this.camera.playerBox.position.x, 
            this.camera.playerBox.position.y, 
            this.camera.playerBox.position.z), 
        this.game.scene);
        
        this.game.scene.activeCamera = this.deadCamera;
        this.deadCamera.attachControl(this.game.scene.getEngine().getRenderingCanvas());
        // Suppression de la playerBox
        this.camera.playerBox.dispose();

        // Suppression de la camera
        this.camera.dispose();   

        // Suppression de l'arme
        this.camera.weapons.rocketLauncher.dispose();

        // On signale à Weapons que le joueur est mort
        this.isAlive=false;
        var newPlayer = this;
        var canvas = this.game.scene.getEngine().getRenderingCanvas();
        setTimeout(function(){ 
            newPlayer._initCamera(newPlayer.game.scene, canvas);
            newPlayer.game.scene.activeCamera = newPlayer.camera;
        }, 4000);
    },
};