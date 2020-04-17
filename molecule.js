class Molecule {
    constructor(_i) {
        this.position = createVector(simWidth / 2, height / 2);
        this.velocity = createVector(random(-5, 5), random(-5, 5));
        this.arrayPosition = _i;
        this.radius = random(25, 25);
        this.intersecting = false;
        this.bounce = true;
        this.left = false;
        this.down = false;
        this.up = false;
        this.right = false;
        this.colCount = 0;
        this.myColor = color(0, 0, 0);
        this.myName = "";
        this.isKT = false;
        this.isCovid = false;
        this.isEpiCell = false;
    }

    render() {
        noStroke()

        if (this.intersecting) { //flash colour on collision
            fill(255, 255, 255, 100);
        } else {
            fill(this.myColor);
        }

        push()
        translate(this.position.x, this.position.y);

        ellipse(0, 0, this.radius * 2, this.radius * 2);

        noStroke();
        fill(255, 255, 255, 255);
        textSize(25);
        textAlign(CENTER, CENTER);
        text(this.myName, 0, 0);
        pop();
    }

    step() {
        this.position.add(this.velocity);
    }

    checkEdges() { // bounce off walls

        if (this.position.x < this.radius) {
            this.position.x += 1;
            this.velocity.x = this.velocity.x * -1
        }

        if (this.position.x > simWidth - this.radius) {
            this.position.x -= 1;
            this.velocity.x = this.velocity.x * -1
        }

        if (this.position.y < this.radius) {
            this.position.y += 1;
            this.velocity.y = this.velocity.y * -1
        }

        if (this.position.y > height - this.radius) {
            this.position.y -= 1;
            this.velocity.y = this.velocity.y * -1
        }
    }

    checkIntersecting(_indexValue) { //called on confirmed molecule in same cell

        let dist = p5.Vector.sub(this.position,
            molecules[_indexValue].position);

        let radiiSum = this.radius + molecules[_indexValue].radius

        if (dist.mag() < radiiSum) {


            //ImmuneCell -> Covid cell collision intercation
            if (this.isCovid && molecules[_indexValue].isKT && molecules[_indexValue].active && !this.inert ||
                this.isKT && this.active && molecules[_indexValue].isCovid && !molecules[_indexValue].inert) {

                if (molecules[_indexValue].isCovid) {
                    molecules[_indexValue].infect();
                    this.die();
                } else {
                    this.infect();
                    molecules[_indexValue].die();
                }

            }

            //ImmuneCell -> Infected Epi cell collision intercation
            if (this.isEpiCell && molecules[_indexValue].isKT && molecules[_indexValue].active && this.infected ||
                this.isKT && this.active && molecules[_indexValue].isEpiCell && molecules[_indexValue].infected) {

                if (molecules[_indexValue].isEpiCell) {
                    molecules[_indexValue].immune = true;
                    molecules[_indexValue].die();
                    this.die();
                } else {
                    this.immune = true;
                    this.die();
                    molecules[_indexValue].die();
                }

            }

            /*//ImmuneCell -> Dead Epi cell collision interation *currently not in use*
            if (this.isEpiCell && molecules[_indexValue].isKT && molecules[_indexValue].active && this.dead ||
                this.isKT && this.active && molecules[_indexValue].isEpiCell && molecules[_indexValue].dead) {

                if (molecules[_indexValue].isEpiCell) {
                    molecules[_indexValue].immune = true;
                    molecules[_indexValue].recover = true;
                } else {
                    this.immune = true;
                    this.recover = true;
                }

            }*/

            //Covid -> Epi cell collision intercation
            if (this.isCovid && molecules[_indexValue].isEpiCell && !molecules[_indexValue].infected && !molecules[_indexValue].dead && !this.inert ||
                this.isEpiCell && !this.infected && !this.dead && molecules[_indexValue].isCovid && !molecules[_indexValue].inert) {

                if (molecules[_indexValue].isCovid && !this.immune) {
                    molecules[_indexValue].infect();
                    this.onInfect();
                }
                if (molecules[_indexValue].isEpiCell && !molecules[_indexValue].immune) {
                    molecules[_indexValue].onInfect();
                    this.infect();
                }

            } else if (this.inert || molecules[_indexValue].inert) {
                //dont collide inactive viruses;
            } else if (!this.active || !molecules[_indexValue].active) {
                //dont collide inactive immune cells;
            } else if (this.isEpiCell || molecules[_indexValue].isEpiCell) {
                //dont collide if both epi cells;
            } else { // collision logic


                this.colCount++;
                molecules[_indexValue].colCount++;

                this.intersecting = true;
                molecules[_indexValue].intersecting = true;

                let dx = this.position.x - molecules[_indexValue].position.x;
                let dy = this.position.y - molecules[_indexValue].position.y;
                let dist = Math.sqrt(dx * dx + dy * dy) || 1; //if 0, equal 1

                let normalX = dx / dist;
                let normalY = dy / dist;

                /*separates by placing 1 pixel away*/
                this.position.x = molecules[_indexValue].position.x + (radiiSum + 1) * normalX;

                this.position.y = molecules[_indexValue].position.y + (radiiSum + 1) * normalY;

                let midpointX = (this.position.x.x + molecules[_indexValue].position.x) / 2;
                let midpointY = (this.position.x.y + molecules[_indexValue].position.y) / 2;

                //new velocity
                let dVector = (this.velocity.x - molecules[_indexValue].velocity.x) * normalX;
                dVector += (this.velocity.y - molecules[_indexValue].velocity.y) * normalY;

                let dvx = dVector * normalX;
                let dvy = dVector * normalY;

                this.velocity.x -= dvx;
                this.velocity.y -= dvy;
                molecules[_indexValue].velocity.x += dvx;
                molecules[_indexValue].velocity.y += dvy;
            }
        }
    }



    reset() {
        this.intersecting = false;
        this.left = false;
        this.down = false;
        this.up = false;
        this.right = false;
    }

}

class Covid extends Molecule { //turns red
    constructor(_i, _xPos, _yPos) {
        super();
        this.position = createVector(_xPos, _yPos);

        let x, y;

        // travels away from spawn location not into wall
        if (this.position.x > simWidth / 2) {
            x = random(-1, -4);
        } else {
            x = random(1, 4)
        }

        if (this.position.y > height / 2) {
            y = random(-1, -4);
        } else {
            y = random(1, 4)
        }

        this.velocity = createVector(x, y);
        this.myColor = color(255, 0, 0); //red

        if (showNames) {
            this.myName = "C19";
        } else {
            this.myName = "";
        }

        this.arrayPosition = _i;
        this.isCovid = true;
        this.radius = 1;
        this.inert = false; // when infect already performed
    }

    render() {
        super.render();

        if (showNames && !this.inert && this.radius == 25) {
            this.myName = "C19";
        } else {
            this.myName = "";
        }

        //expands to full size after spawn and shrinks on death
        if (!this.inert) {
            if (this.radius < 25) {
                this.radius += 0.25;
            }
        }

        if (this.inert) {
            this.velocity = createVector(0, 0);
            if (this.radius >= 1) {
                this.radius -= 0.25;
            } else {
                this.radius = 1;
            }
        }

        //same color as background
        if (this.inert && this.radius == 1) {
            this.myColor = color(0);
        }
    }

    infect() {
        this.inert = true;
        this.myName = "";
        this.myColor = color(150, 150, 150);
    }
}

class EpiCell extends Molecule {
    constructor(_i) {
        super();
        this.myColor = color(150, 150, 255);
        if (showNames) {
            this.myName = "E";
        } else {
            this.myName = "";
        }
        this.arrayPosition = _i;
        this.radius = random(15, 15);
        this.bounce = false;
        this.isEpiCell = true
        this.infected = false;
        this.dead = false;
        this.immune = false; //saved by immune cell
        this.secondsToDeath = 10; //time to death after infection
        //this.secondsToRec = 10;

        // how many new viruses created on death
        this.proliferation = parseInt(random(2, 4));
    }

    step() {
        this.velocity = createVector(0, 0);
        if (this.infected) {
            this.secondsToDeath -= 0.016; // countdown to death

            if (this.secondsToDeath < 0) {
                if (showNames) {
                    this.myName = "X" //is dead
                } else {
                    this.myName = "";
                }
                this.infected = false;
                this.die();
            }
        }

        /*if (this.recover) {
            this.secondsToRec -= 0.016;
            this.myName = parseInt(this.secondsToRec);
            if (this.secondsToRec < 0) {
                this.myName = "E"
                this.infected = false;
                this.die();
            }
        }*/
    }

    render() {

        if (showNames && !this.infected && !this.dead) {
            this.myName = "E";
        } else if (showNames && !this.dead) {
            this.myName = parseInt(this.secondsToDeath);
        } else if (showNames && this.dead) {
            this.myName = "X";
        } else {
            this.myName = "";
        }

        //flash when infected
        if (this.infected && !this.dead) {
            this.myColor = lerpColor(color(255, 0, 0), color(255), map(sin(frameCount * 0.05), 0, 1, 0, 1));
        }

        //dark red on death
        if (this.dead && !this.immune) {
            this.myColor = color(100, 0, 0);
        }

        //green on immunity
        if (this.dead && this.immune) {
            this.myColor = color(0, 255, 0);
        }

        super.render();
    }
    onInfect() {
        initialInfect = true;
        this.infected = true;
    }

    die() {
        this.dead = true;
        if (!this.immune) { //creates new virsues 1 pixel apart to avoid crashing
            for (let i = 0; i < this.proliferation; i++) {
                spawnVirus(this.position.x + i + 1, this.position.y + i + 1);
            }
        } else {
            this.immune = true;
        }
    }
}

//immune system killer T cell
class KillerT extends Molecule {
    constructor(_i) {
        super();
        this.myColor = color(0, 0, 255);
        if (showNames) {
            this.myName = "KT";
        } else {
            this.myName = "";
        }
        this.radius = 1;
        this.arrayPosition = _i;
        this.isKT = true;
        this.active = true;
    }

    render() {
        super.render();

        if (showNames && this.active && this.radius == 25) {
            this.myName = "KT";
        } else {
            this.myName = "";
        }

        //expands to full size after spawn and shrinks on death
        if (this.active) {
            if (this.radius < 25) {
                this.radius += 0.25;
            }
        }

        if (!this.active) {
            this.velocity = createVector(0, 0);
            if (this.radius >= 1) {
                this.radius -= 0.25;
            } else {
                this.radius = 1;
            }
        }

        //same color as background
        if (!this.dead && this.radius == 1) {
            this.myColor = color(0);
        }
    }

    die() {
        this.active = false;
        this.myName = "";
        this.myColor = color(150, 150, 150);
    }
}
