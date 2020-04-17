class Lung {
    constructor(_age) {
        this.age = _age;
        this.totalCells = molecules.filter(mol => mol.isEpiCell && !mol.dead && !mol.infected || mol.immune).length;

        //lethal percentage of virus in lung based on age bracket
        if (this.age <= 25) {
            this.lethalInfection = 95;
        } else if (this.age <= 35) {
            this.lethalInfection = 85;
        } else if (this.age <= 50) {
            this.lethalInfection = 80;
        } else if (this.age <= 60) {
            this.lethalInfection = 70;
        } else {
            this.lethalInfection = 60
        }
    }
    checkEndSim(_infectionPerc, _infectionCount) { //test for end state
        if (_infectionPerc >= myLung.lethalInfection) {
            noLoop();
            alert("patient death");
        } else if (_infectionCount <= 0) {
            noLoop();
            alert("Virus Subdued");
        }
    }
}
