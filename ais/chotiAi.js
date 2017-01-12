
/**
 * Ai Example.
 */

function creationBot(){
    this.tankName="Choti's Tank"
    this.prevLife= this.life
}

function stepBot(){
    if(this.prevLife > this.life){
        this.move(20,"BACKWARD")
    }
    if(trueWithChanceOf(1,4)){
        var dir = trueWithChanceOf(1,2) ? "FORWARD" : "BACKWARD";
        this.shoot();
        this.move(3,dir)
    }else{
        this.shoot();
        this.changeDirection(Math.random()*2*Math.PI)
    }
    this.prevLife = this.life
}





