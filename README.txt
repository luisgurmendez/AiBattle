
Ai Battle is a open source game. Develop the best Ai for your tank with the tank primitives listed below and battle!


Tank Properties:

    - tank.life; default = 15; {Number} <--- Change Prohibited
    - tank.direction;  default = Math.Pi; {Angle in rad} // This is the tank facing right.
    - tank.position; default = random; {Vector3:{x,y,z}} //(Example: tank.position.x) Position in the y-axis is constant = 0.
    - tank.tankName;  default = random string of 5 chars;{String}
    - tank.canShoot  default = true; {Boolean} <--- Change Prohibited


Tank primitives:

    -tank.move({Number} distance,{String} "FORWARD"|"BACKWARD"); Move tank certain distance in a direction "FORWARD" or "BACKWARD". NOTE: on move, steps are omitted. Throws "moveError".
    -tank.changeDirection({Number} direction);  Rotates tank in a direction in radians, a 360 rotation takes 2 sec (or 20 steps). NOTE: on rotate, steps are omitted.
    -tank.shoot(),Throws "cantShootError".

External functions:

    - getEnemies({Tank} me); Returns a list of enemy's info if in a range of 25 units. Such as life,direction,distance,the angle of rotation to face the enemy, etc.
    - trueWithAChanceOf({Number} x, {Number} y); returns true with a probability of x/y

Field:
    - width = 50 units
    - height = 50 units

              field.w = 50
         /----------------------/
     -    +--------------------+
     |    |                    |
 h   |    |                    |
 .   |    |                    |
 d   |    |                    |
 l   |    |                    |
 e   |    |                    |
 i   |    |                    |
 f   |    |                    |
     -    +--------------------+




How it works.

When creating an Ai there are 2 main methods you have to implement. The creation method, and the step method.
The creation method initializes all variables and functions you will use globally in your Ai, a obligatory variable
in the creation method is the tankName, else your tank name will be a 5 random letters word. A simple creation method will look like this:

     tank.creation = function(){
        this.tankName="Chappie"
     }

The step method is a little bit more complex. It executes every 100ms (when behaviorQueue is empty. [This queue has all the next primitives that the tank is going to execute.]) and is where all your main Ai logic will reside.
A simple step method will look like this:

    tank.step = function(){
        if(trueWithChanceOf(1,2)){
            this.move(5,"FORWARD")
        }else{
            this.changeDirection(Math.random()*2*Math.PI)
        }
        this.shoot()
    }

 ** NOTE:The Math library is avaiable and very practical, for doc see: https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Math

In this step function example, every execution will make a move or a direction change and then a shoot action.
The system is build to make asynchronous calls to every action method (sush as move, shoot, changeDirection,..), using semaphores.
So every action your Ai executes is queued in the "behaviorQueue" and really executes when the last action has finished. It is important to keep in mind that the thinking of your Ai is donde when every action queued is executed, and then the step method executes again.







