var scene, camera,renderer;
var meshFloor, ambientLight, light;
var keyboard = {};
var USE_WIREFRAME = false;
var canMoveCamera=false;
var field = {h:50,w:50}
var CAMERA_SPEED = 0.5

var editorBlue;
var editorRed;

function init(){
    var docWidth=$(document).width()
    var docHeight = $(document).height()
    scene = new THREE.Scene();
    //camera = new THREE.PerspectiveCamera(90, docWidth/docHeight, 0.1, 1000);
    camera = new THREE.OrthographicCamera(-28,28,45,5, 0, 100);

    meshFloor = new THREE.Mesh(
        new THREE.PlaneGeometry(field.w,field.h, 10,10),
        new THREE.MeshPhongMaterial({color:0x33CC33, wireframe:USE_WIREFRAME})
    );

    meshFloor.rotation.x -= Math.PI / 2;
    meshFloor.receiveShadow = true;
    meshFloor.position.set(0,0,0)
    scene.add(meshFloor);



    ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);


    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 25, 25, 0 );
    directionalLight.castShadow=true;
    scene.add( directionalLight );

    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    var d = 100;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.camera.far = 3500;
    directionalLight.shadow.bias = -0.0001;


    // initialize object to perform world/screen calculations
    //projector = new THREE.Projector();


    camera.position.set(0,5, -5);
    camera.lookAt(new THREE.Vector3(0,0,0));
    camera.position.z-=35

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(docWidth,docHeight );
    renderer.setClearColor(0x2ECC71)

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;




    document.body.appendChild(renderer.domElement);

    animate();


    // For Windows resizing.
    THREEx.WindowResize(renderer,camera);


    // For full Screen
    THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });


    jQuery.get('ais/luisAi.js', function(data) {
        $("body").append('<div id="blueTankScreen" class="container"><div class="screen monitor"><div class="content"><div class="codeEditor" id="editorBlue">// Blue tank brain.\n' + data + '</div> </div> <div class="base"> <div class="grey-shadow"></div> <div class="foot top"></div> <div class="foot bottom"></div> <div class="shadow"></div> </div> </div> </div>')

        editorBlue = ace.edit("editorBlue");
        editorBlue.setTheme("ace/theme/twilight");
        editorBlue.getSession().setMode("ace/mode/javascript");
        editorBlue.setFontSize(13)
    })

    jQuery.get('ais/chotiAi.js', function(data) {
        $("body").append('<div id="redTankScreen" class="container"><div class="screen monitor"><div class="content"><div class="codeEditor" id="editorRed">// Red tank brain.\n' + data + '</div> </div> <div class="base"> <div class="grey-shadow"></div> <div class="foot top"></div> <div class="foot bottom"></div> <div class="shadow"></div> </div> </div> </div>')

        editorRed = ace.edit("editorRed");
        editorRed.setTheme("ace/theme/twilight");
        editorRed.getSession().setMode("ace/mode/javascript");
        editorRed.setFontSize(13)

    })


}


function animate(){
    requestAnimationFrame(animate);

    if(canMoveCamera){
        if(keyboard[87]){ // W key
            camera.position.x -= Math.sin(camera.rotation.y) * CAMERA_SPEED;
            camera.position.z -= -Math.cos(camera.rotation.y) * CAMERA_SPEED;
        }
        if(keyboard[83]){ // S key
            camera.position.x += Math.sin(camera.rotation.y) * CAMERA_SPEED;
            camera.position.z += -Math.cos(camera.rotation.y) * CAMERA_SPEED;
        }
        if(keyboard[65]){ // A key
            camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * CAMERA_SPEED;
            camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * CAMERA_SPEED;
        }
        if(keyboard[68]){ // D key
            camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * CAMERA_SPEED;
            camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * CAMERA_SPEED;
        }

    }

    renderer.render(scene, camera);

}


function keyDown(event){
    keyboard[event.keyCode] = true;
}

function keyUp(event){
    keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;

function randomInNegativeMirrorInterval(n) {
    var num =Math.random()*n ;
    num *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases
    return num
}



function render(){

    renderer.render( scene, camera );


}


function generateRandomName()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function loadtank(tankPathModel,stepFunc,creationFunc){

    var loader = new THREE.ObjectLoader();
    loader.load( tankPathModel, function ( object ) {
        object.traverse( function( node ) { if ( node instanceof THREE.Mesh ) { node.castShadow = true; } } );
        var tank = object;

        tank.position.set(randomInNegativeMirrorInterval(25), 0, randomInNegativeMirrorInterval(25));

        //Starts facing "right"
        tank.direction = Math.PI
        tank.speed= 0.5;
        tank.canShoot=true;
        tank.life=5;
        tank.lifeDOM = $('<progress class="tankLife" value="' +tank.life + '" max="' +tank.life + '"></progress>')
        $('#tanksLifeWrapper').append(tank.lifeDOM)
        tank.behaviorQueue=[]
        tank.behaviorQueueSemaphore=true;


        tank.creation = creationFunc

        tank.step=stepFunc


        /**
         * Initialization of custome variables and/or functions. It's called once when the bot is created.
         */
        tank.creationWrapper = function(){
            this.tankName=generateRandomName()
            this.creation();
            this.stepWrapper()

        }

        /**
         * Executes queued action element.
         * @param call
         */

        tank.executeCall=function(call){
            switch(call['action']){
                case 'move':
                    this.moveCall(call['args']['distance'],call['args']['direction'])
                    break;

                case 'changeDirection':
                    this.changeDirectionCall(call['args']['direction'])
                    break;

                case 'shoot':
                    this.shootCall();
                    break;
            }


        }

        /**
         * This function simulates a "thinking" step which calls the custom step function every 100ms.
         */
        tank.stepWrapper = function(){
            console.log(this.tankName)
            console.log("Step wrapper")
            var thisS=this;
            this.stepInterval = setInterval(function(){
                if(thisS.behaviorQueueSemaphore && thisS.behaviorQueue.length > 0){
                    thisS.executeCall(thisS.behaviorQueue.shift())
                }else if(thisS.behaviorQueue.length == 0 && tanks.length != 1){
                    thisS.step()
                }

            },100)
        }

        /**
         * Asynchronization method for the move action.
         * @param distance
         * @param direction
         */
        tank.move = function(distance,direction){
            this.behaviorQueue.push({'action':'move','args':{'distance':distance,'direction':direction}})
        }
        /**
         * Move tank certain distance in a direction "FORWARD" or "BACKWARD"
         * @param {Number} distance
         * @param {String} direction
         */
        tank.moveCall = function(distance,direction){
            this.behaviorQueueSemaphore = false;
            clearInterval(this.stepInterval)
            var x=Math.cos(this.direction)
            var y=Math.sin(this.direction)
            var stepCounter=0
            var thisS=this
            var stepTarget = Math.floor(distance/this.speed) + 1
            var moveInterval = setInterval(function(){
                stepCounter+=1
                if(stepCounter == stepTarget){
                    clearInterval(moveInterval)
                    thisS.behaviorQueueSemaphore=true
                    thisS.stepWrapper()
                }else{
                    if(direction == "FORWARD"){
                        if(thisS.position.x + x*thisS.speed < field.w/2 && thisS.position.x + x*thisS.speed > -field.w/2 && thisS.position.z + y*thisS.speed < field.h/2 && thisS.position.z + y*thisS.speed > -field.h/2){
                            thisS.position.x+=x*thisS.speed;
                            thisS.position.z+=y*thisS.speed;
                        }else{
                            console.log("Cant move there")
                            clearInterval(moveInterval)
                            thisS.behaviorQueueSemaphore=true
                            thisS.stepWrapper()
                            throw "moveError"

                        }

                    }else if(direction == "BACKWARD"){
                        if(thisS.position.x - x*thisS.speed < field.w/2 && thisS.position.x - x*thisS.speed > -field.w/2 && thisS.position.z - y*thisS.speed < field.h/2 && thisS.position.z - y*thisS.speed > -field.h/2) {
                            thisS.position.x -= x * thisS.speed;
                            thisS.position.z -= y * thisS.speed;
                        }else{
                            console.log("Cant move there")
                            clearInterval(moveInterval)
                            thisS.behaviorQueueSemaphore=true
                            thisS.stepWrapper()
                            throw "moveError"
                        }
                    }else{
                        console.log("Thats not a valid direction FORWARD or BACKWARD")
                        clearInterval(moveInterval)
                        thisS.behaviorQueueSemaphore=true
                        thisS.stepWrapper()
                        throw "moveError"
                    }

                }

            },100)

        }

        /**
         * Asynchronization method for the changeDirection action.
         * @param direction
         */
        tank.changeDirection = function(direction){

            this.behaviorQueue.push({'action':'changeDirection','args':{'direction':direction}})
        }

        /**
         * Rotates bot in a direction in radians (clockwise or not depends on the minimum angle), a 360 rotation takes 2 sec (or 20 steps).
         *
         * @param {Number} direction
         */
        tank.changeDirectionCall = function(direction){

            direction = direction % (Math.PI*2)
            if(this.direction == direction){
                return
            }
            this.behaviorQueueSemaphore=false;
            clearInterval(this.stepInterval);
            var prevDirection = this.direction;
            //this.direction = direction;
            var thisS = this;
            var stepCounter=0;
            while(direction < 0){
                direction = direction + Math.PI*2
            }
            this.direction=direction
            console.log(this.tankName)


            if(direction > prevDirection){
                if(direction - prevDirection < Math.PI){
                    rotation = Math.abs(direction - prevDirection);
                }else{
                    rotation = Math.abs(direction - prevDirection) - 2*Math.PI;
                }
            }else{
                if(prevDirection - direction < Math.PI){
                    rotation = (-1)*Math.abs(prevDirection - direction);
                }else{
                    rotation = 2*Math.PI - prevDirection + direction;
                }
            }


            rotation = -1*rotation

            /*var rotationRight = (prevDirection - direction) % (Math.PI * 2);
            var rotationLeft = -(Math.PI*2 - prevDirection + direction) % (Math.PI * 2);
            console.log(rotationRight)
            console.log(rotationLeft)

            var rotation =0;
            if(Math.abs(rotationRight) > Math.abs(rotationLeft)){
               rotation = rotationLeft
            }else{
               rotation = rotationRight;
            }
            */

            //console.log(rotation)

            var stepTarget = Math.abs(Math.floor(rotation * 20 /(2*Math.PI)));
            if (stepTarget ==0)stepTarget =1;
            var rotate= rotation/stepTarget;
            var rotateInterval = setInterval(function(){
                if(stepCounter == stepTarget){
                    clearInterval(rotateInterval);
                    thisS.behaviorQueueSemaphore=true
                    thisS.stepWrapper();
                }else{
                    thisS.rotation.y+=rotate
                }
                stepCounter+=1;

            },100)
        }


        /**
         * Asynchronization method for the shoot action.
         */
        tank.shoot = function(){
            this.behaviorQueue.push({'action':'shoot','args':{}})
        }

        /**
         * Shoot. If reloading, doesnt do anything.
         */
        tank.shootCall = function(){
            var thisS=this
            function createBullet(position){

                var bullet = new THREE.Mesh(
                    new THREE.SphereGeometry(0.15,8,8),
                    new THREE.MeshBasicMaterial({color:0xffffff})
                );


                // position the bullet to come from the bot's weapon
                bullet.position.set(position.x,position.y,position.z)
                bullet.position.y=1.3;
                bullet.shootBy=thisS.tankName

                bullet.collision = function(){
                    var pos = this.position.clone()
                    var x = pos.x
                    var z = pos.z
                    for(var i=0; i< tanks.length;i++){

                        // TODO If tanks with same name --> Error.
                        // change bullet.shootBy=thisS &&  if( tanks[i] === this){
                        if( tanks[i].tankName != this.shootBy){

                            var dx= x -  tanks[i].position.x
                            var dz= z -  tanks[i].position.z
                            if(Math.sqrt(dx*dx + dz*dz) < 1){
                                return {hit:true,tank: tanks[i]}
                            }

                        }
                    }
                    return {hit:false};
                }

                bullet.direction = thisS.direction;
                bullet.xDir=Math.cos(bullet.direction);
                bullet.yDir=Math.sin(bullet.direction);
                bullet.speed=1;
                bullet.life=40
                bullet.castShadow=true;
                bullet.step=function(bullet){
                   var thisBullet=bullet;
                   thisBullet.interval = setInterval(function(){
                       collisionObj = thisBullet.collision()
                       if(collisionObj.hit){
                           var evt = new CustomEvent('tankHit',{detail:collisionObj})
                           document.dispatchEvent(evt)
                           clearInterval(thisBullet.interval);
                           scene.remove(thisBullet);
                           //collisionObj.tank.life-=1
                       }
                       thisBullet.life-=1
                       if(thisBullet.life!=0){
                           thisBullet.position.x+=thisBullet.xDir*thisBullet.speed;
                           thisBullet.position.z+=thisBullet.yDir*thisBullet.speed;
                       }else{
                           clearInterval(thisBullet.interval);
                           scene.remove(thisBullet);
                       }

                   },100)
                }


                scene.add(bullet);
                return bullet;
            }
            this.behaviorQueueSemaphore=false;
            if(this.canShoot){
                var thisS=this
                this.canShoot=false;
                var bullet = createBullet(this.position)
                bullet.step(bullet);
                thisS.behaviorQueueSemaphore=true;
                setTimeout(function(){
                    thisS.canShoot=true;
                },500)
            }else{
                thisS.behaviorQueueSemaphore=true;
                throw "cantShootError"

            }

        }

        tank.creationWrapper();
        tanks.push(tank)

        scene.add(tank);


    });
}

var tanks=[]

/**
 *
 * @param me (a tank).
 * @returns [{enemyLife,enemyPosition,distance,enemyDirection,directionToEnemy}, ... ]  A list with all enemiesInfoObjects.
 */
function getEnemies(me){
    var returnInfo=[];
    for(t in this.tanks){
        if(this.tanks[t]!= me){
            var enemy = this.tanks[t]
            var dx = me.position.x - enemy.position.x
            var dz = me.position.z - enemy.position.z
            var distance = Math.sqrt(dx*dx + dz*dz)

            if(distance<25){
                var directionToEnemy=Math.atan2(enemy.position.z - me.position.z,enemy.position.x - me.position.x);
                if(directionToEnemy <0){
                    directionToEnemy = directionToEnemy + 2*Math.PI
                }
                returnInfo.push({enemyLife:enemy.life,enemyPosition:enemy.position,distance:distance,enemyDirection:enemy.direction,directionToEnemy:directionToEnemy})
            }
        }
    }
    return returnInfo;

}
/**
 * Returns true with a probability of x/y.
 * @param x
 * @param y
 * @returns {boolean}
 */
function trueWithChanceOf(x,y){
    if(x>y){
        return true
    }

    return (Math.random() >= 1.0 - x/y);
}



// Triggered when a tanks has been shot.
document.addEventListener('tankHit',function(evt){

    console.log("HIT")
    console.log(evt.detail.tank.tankName);
    var tank = evt.detail.tank
    tank.life -=1
    if(tank.life >=0){
        tank.lifeDOM.val(tank.life)
    }
    if(tank.life==0) {

        while(tank.behaviorQueue.length){
            tank.behaviorQueue.pop()
        }
        clearInterval(tank.stepInterval)
        scene.remove(tank)
        tanks.splice(tanks.indexOf(tank),1)
        tank = null;
        delete tank;

    }


})


loadtank('models/tankBlue.json',stepLuis,creationLuis);
loadtank('models/tankRed.json',stepLuis,creationLuis);

//loadtank('models/tankRed.json',stepBot,creationBot);

//loadtank('models/tankRed.json',stepNada,creationNada);
//loadtank('models/tankRed.json',stepNada,creationNada);


function reStart(){

    while(tanks.length){
        oTank=tanks.pop()

        while(oTank.behaviorQueue.length){
            oTank.behaviorQueue.pop()
        }
        clearInterval(oTank.stepInterval)
        scene.remove(oTank)
        oTank = null;
        delete oTank;
    }

    $('.tankLife').remove()
    loadtank('models/tankBlue.json',stepLuis,creationLuis);
    loadtank('models/tankRed.json',stepBot,creationBot);

}

