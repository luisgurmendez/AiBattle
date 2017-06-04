
/**
* Ai de Luis
*
*/

function creationLuis(){
    //Name of the tank.
    //this.tankName="Lui's Tank"

    // The Ai state. (search|run|attack)
    this.state="search"

    // Boolean used in the search state.
    this.inSearchLine=false;

    // The current enemy Information from the getEnemies function
    this.enemyInfo=[];

    // Changes direction to a especific x,y. returns nothing.
    this.lookAt = function(x,y){
        var lookAt = Math.atan2(y - this.position.z,x - this.position.x);
        if(parseFloat(lookAt.toFixed(6))!= parseFloat(this.direction.toFixed(6))){
            this.changeDirection(lookAt);
        }
    };
    //Returns true if enemy is look at me. NOT tested.
    this.isLookingAtMe = function(){
        if(this.enemyInfo.length){
            if(this.enemyInfo[0].directionToEnemy % Math.PI == this.enemyInfo[0].enemyDirection % Math.PI){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    };

    // returns the distance between me and a (x,y).
    this.distanceTo = function(x,y){
        var dx=this.position.x - x;
        var dz = this.position.z -y;
        return Math.sqrt(dx*dx + dz*dz);
    };

    // Returns true if my distance to a certain (x,y) is less than 1.
    this.nearPosition = function(x,y){
        var dx = this.position.x - x;
        var dz = this.position.z - y;
        var distance = Math.sqrt(dx*dx + dz*dz);
        return distance < 1

    }
}

function stepLuis(){


    this.enemyInfo = getEnemies(this)

    // True if enemy is in vision range.
    if(this.enemyInfo.length){

        var directionToMe = (this.enemyInfo[0].directionToEnemy + Math.PI) % (2*Math.PI)

        if(directionToMe > this.enemyInfo[0].enemyDirection ){
            // Angle enemy has to turn to look at me.
            var hisTurnAngle = directionToMe - this.enemyInfo[0].enemyDirection;
        }else{
            var hisTurnAngle = this.enemyInfo[0].enemyDirection - directionToMe;
        }
        if(this.enemyInfo[0].directionToEnemy < this.direction){
            //Angle I have to turn to look at enemy.
            var myTurnAngle = this.direction - this.enemyInfo[0].directionToEnemy ;
        }else{
            var myTurnAngle = this.enemyInfo[0].directionToEnemy - this.direction
        }


        // Decides whether I will turn first to look at him, and from that decide which stategy (attack or run) to use.
        if(hisTurnAngle > myTurnAngle){
            this.state="attack"
            this.inSearchLine=false

        }else if(this.enemyInfo.enemyLife + 3 < this.life){
            this.state="attack"
            this.inSearchLine=false

        }else{
            this.state="run"
            this.inSearchLine=false
        }
    }else{
        this.state="search"
    }

    switch(this.state){
        case "search":
            // Scouts in de x axis.

            //Checks in which cuadrant is.
            if(this.position.x > 0){
                if(this.nearPosition(field.w/2,0)){
                    this.lookAt(-field.w/2,0);
                    this.inSearchLine=true;
                }else if(!this.inSearchLine){
                    this.lookAt(field.w/2,0);
                }
            }else{
                if(this.nearPosition(-field.w/2,0)){
                    this.lookAt(field.w/2,0);
                    this.inSearchLine=true;
                }else if(!this.inSearchLine){
                    this.lookAt(-field.w/2,0)
                }
            }
            this.move(1,"FORWARD")
            break;

        case "run":

            //TODO: Mejorar escape.

            // Decides which scape stategy to use, taking into account the distance to the center of the map.
            if(this.distanceTo(0,0) < field.w/4){

                //ZIG ZAG
                this.move(5,"FORWARD")
                this.changeDirection(this.direction + Math.PI/4)
                this.move(5,"FORWARD")
                this.changeDirection(this.direction - Math.PI/4)
                this.move(5,"FORWARD")
                this.changeDirection(this.direction + Math.PI/4)
                this.move(5,"FORWARD")
                this.changeDirection(this.direction - Math.PI/4)
                this.move(5,"FORWARD")

            }else{

                // Runs to center of map.
                this.lookAt(0,0)
                this.move(this.distanceTo(0,0),"FORWARD")
            }
            break;

        case "attack":

            // Perscutes and shoots enemy.
            this.changeDirection(this.enemyInfo[0].directionToEnemy)
            this.shoot()
            if(this.enemyInfo[0].distance > 15){
                this.move(3,"FORWARD")
            }
            break;

    }

}





