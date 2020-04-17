//world
let molecules = [];
let myLung;

//grid information
const gridCols = 10;
const gridRows = 10;
let gridWidth;
let gridHeight;
let intersectCount = 0;
let molRows = 1;
let molCols = gridCols;
let gridMolecules = [];

// lung wall data
let eSize = 30;
let epiCellsPerRow;
let epiCellsPerCol;
let numOfEpiCells;

//time controls
let framesElapsed = 1;
let secondsElapsed = 0;
let immuneSystemResponse = 15; //time from first infect to release immune cells
let immuneStrength = 2; //Interval between immune Cell releases

//health state factors
let infectionPerc;
let healthPerc;
let initialInfect = false; //flag to start simulation
let ageModifier = 180;

//Graph controls
let posMod = 0; // pushes graph along
let resetCount = 1; // times stats have reset;
let showNames = false;

function setup() {
    createCanvas(windowWidth, windowHeight);

    simWidth = (width / 5) * 4; // window is 80% of horizontal space
    statsWidth = width - simWidth; //remainder for graph and GUI

    // caluclate number of cells for lung lining
    epiCellsPerRow = Math.floor(simWidth / eSize);
    epiCellsPerCol = Math.floor(height / eSize);
    numOfEpiCells = Math.floor(epiCellsPerRow * 2) + (epiCellsPerCol * 2 - 4); //-4 for corners

    pixelDensity(1);
    background(50, 50, 50); //Stats BG

    for (let i = 0; i < numOfEpiCells; i++) {
        molecules.push(new EpiCell(i));
    }


    gridWidth = simWidth / gridCols;
    gridHeight = height / gridRows;
    smooth();

    createLung(); //establishes lung wall lining cells
    spawnVirus(); //initial infection
    drawStats(); //creates graph

    noLoop(); //starts frozen
}

function draw() {

    fill(0, 0, 0, 20); // alpha for contrails
    rect(0, 0, simWidth, height); // BG

    //object tracking and collision detection
    make2dArray();
    resetBalls();
    splitIntoGrids();
    checkIntersections();
    renderGrid();

    if (initialInfect) {
        time();
        drawStats();
    }
}

function time() {
    //time controlled by counting frames (unreliable during frameloss)
    framesElapsed++
    if (framesElapsed % 60 == 0) {
        secondsElapsed++;
    }

    //controls spawn of immune system cells
    if (secondsElapsed > immuneSystemResponse && framesElapsed % ageModifier == 0) {
        let spawnRate = random(1, 1);
        for (let i = 0; i < spawnRate; i++) {
            spawnKillerT();
        }
    }
}

function make2dArray() { //empty 3D array
    gridMolecules = [];
    for (let i = 0; i < gridRows; i++) {
        gridMolecules.push([])
        for (let j = 0; j < gridCols; j++) {
            gridMolecules[i].push([])
        }
    }
}

function createLung() {
    // creates lining of epithilial cells around border of window

    var yMod = 0;
    var xMod = epiCellsPerRow;
    var wall = false;

    molecules.forEach(function (molecule) {


        if ((eSize * xMod) > 0 && yMod == 0 || yMod > (height - eSize * 2)) {

            molecule.position.x = (eSize) * xMod - molecule.radius;
            molecule.position.y = yMod + molecule.radius;

        } else { //shift row and create 1 epithilial cell on each wall

            if (wall) {
                xMod++
                molecule.position.x = molecule.radius;
                molecule.position.y = yMod + molecule.radius;
                wall = false;
            } else {
                yMod += eSize;
                xMod = epiCellsPerRow;
                molecule.position.x = (eSize) * xMod - molecule.radius;
                molecule.position.y = yMod + molecule.radius;
                wall = true;
            }
        }
        xMod--
    });

    //generates world object
    myLung = new Lung(document.getElementById("age").value);
}

function checkIntersections() { // collision detection


    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridCols; j++) {
            let tempArray = gridMolecules[i][j];
            let numInArray = tempArray.length
            if (numInArray > 1) {
                for (let z = 0; z < numInArray; z++) {
                    for (let w = z + 1; w < numInArray; w++) {
                        let indexValue01 = tempArray[z];
                        let indexValue02 = tempArray[w];
                        molecules[indexValue01].checkIntersecting(indexValue02)

                        stroke('rgba(255,0,0,0.25)');
                        /*line(molecules[indexValue01].position.x, molecules[indexValue01].position.y, molecules[indexValue02].position.x, molecules[indexValue02].position.y)*/ //line for visualising collision detection
                    }
                }
            }
        }
    }
}

function drawGrid() { //debugging visualization *currently unused*

    for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridCols; j++) {
            noFill();
            strokeWeight(1)
            stroke(0, 244, 0, 50);
            rect(j * gridWidth, i * gridHeight, gridWidth, gridHeight);

            let intersectCount = 0;

            let tempArray = gridMolecules[i][j];
            let numArray = tempArray.length;

            tempArray.forEach(function (indexValue) {

                if (molecules[indexValue].intersecting == true) {
                    intersectCount++
                }
            })

            if (numArray == 0) {
                numArray = ""
            }

            noStroke();
            fill(255, 255, 255, 255);
            textSize(16);
            textAlign(RIGHT);
            text(numArray, j * gridWidth + gridWidth - 5, i * gridHeight + 20);

            fill(255, 50, 0, 150);
            text(intersectCount, j * gridWidth + gridWidth - 5, i * gridHeight + gridHeight - 5);

        }
    }

}

function drawStats() { // draws graph and calculates world data

    let covidCount = molecules.filter(mol => mol.isCovid && !mol.inert).length
    let kTCount = molecules.filter(mol => mol.isKT && mol.active).length
    let liveEpiCount = molecules.filter(mol => mol.isEpiCell && !mol.dead && !mol.infected || mol.immune).length
    let deadEpiCount = molecules.filter(mol => mol.isEpiCell && mol.dead || mol.infected).length

    let totalActiveMols = covidCount + kTCount + liveEpiCount + deadEpiCount;

    infectionPerc = ((((covidCount) + (deadEpiCount)) / totalActiveMols) * 100);
    healthPerc = ((liveEpiCount / totalActiveMols) * 100);

    textStyle(BOLD);
    fill(255, 0, 0); //covid text box
    noStroke();
    rect(simWidth + (statsWidth / 18), (height / 6.6), 70, 40);
    textSize(23);
    fill(255);
    text(String(infectionPerc.toFixed(1)) + "%", simWidth + (statsWidth / 15), (height / 5.55));
    fill(255, 0, 0);
    text("Covid", simWidth + (statsWidth / 22), (height / 7.2));

    fill(150, 150, 255); //Lung text box
    noStroke();
    rect(simWidth + ((statsWidth / 18) * 6), (height / 6.6), 70, 40);
    textSize(23);
    fill(255);
    text(String((parseInt(healthPerc)) + "%"), simWidth + (statsWidth / 9.8) * 3.4, (height / 5.55));
    fill(150, 150, 255);
    text("Lung Cells", simWidth + (statsWidth / 20) * 5.2, (height / 7.2));

    fill(50, 100, 230); //KT text box
    noStroke();
    rect(simWidth + ((statsWidth / 18) * 12), (height / 6.6), 70, 40);
    fill(255);
    textSize(23);
    text(String(kTCount), simWidth + (statsWidth / 9.8) * 6.8, (height / 5.55));
    fill(50, 100, 230);
    text("Immune Cells", simWidth + (statsWidth / 20) * 11.5, (height / 7.2));

    let barSize = .75; //size of graph steps

    //resets statistics when upper limit reached
    if (barSize * (framesElapsed) > (height - (height / 5) - (height / 7)) * resetCount) {
        fill(50, 50, 50);
        rect(simWidth, 0, statsWidth, height);
        posMod = 0;
        resetCount++;
    }

    posMod += barSize;

    noStroke();
    fill(150, 150, 255); // epithilial cell Bar
    rect(width - (statsWidth), height - (height / 7) - (barSize + posMod), ((liveEpiCount / totalActiveMols)) * statsWidth, barSize);


    fill(0, 0, 255); //immune cell bar
    rect(width - (statsWidth) + ((liveEpiCount / totalActiveMols)) * statsWidth, height - (height / 7) - (barSize + posMod), ((kTCount / totalActiveMols)) * statsWidth, barSize);

    fill(255, 0, 0); // infection bar
    rect(width, height - (height / 7) - (barSize + posMod), ((-((covidCount) + (deadEpiCount)) / totalActiveMols)) * statsWidth, barSize);

    let infectionCount = covidCount + molecules.filter(mol => mol.isEpiCell && mol.infected).length
    myLung.checkEndSim(infectionPerc, infectionCount); //test for simulation end state

}

function splitIntoGrids() {



    molecules.forEach(function (molecule) {
        let iNum = floor(molecule.position.y / gridHeight);
        let jNum = floor(molecule.position.x / gridWidth);

        gridMolecules[iNum][jNum].push(molecule.arrayPosition);

        if (molecule.position.x % gridWidth < molecule.radius && molecule.position.x > gridWidth) {
            gridMolecules[iNum][jNum - 1].push(molecule.arrayPosition); //left
            molecule.left = true;
        }

        if (molecule.position.x % gridWidth > gridWidth - molecule.radius && molecule.position.x < simWidth - gridWidth) {
            gridMolecules[iNum][jNum + 1].push(molecule.arrayPosition); //right
            molecule.right = true
        }

        if (molecule.position.y % gridHeight < molecule.radius && molecule.position.y > gridHeight) {
            gridMolecules[iNum - 1][jNum].push(molecule.arrayPosition); //up
            molecule.up = true;
        }

        if (molecule.position.y % gridHeight > gridHeight - molecule.radius && molecule.position.y < height - gridWidth) {
            gridMolecules[iNum + 1][jNum].push(molecule.arrayPosition); //down
            molecule.down = true;
        }

        if (molecule.left == true && molecule.down == true) {
            gridMolecules[iNum + 1][jNum - 1].push(molecule.arrayPosition);
        }
        if (molecule.left == true && molecule.up == true) {
            gridMolecules[iNum - 1][jNum - 1].push(molecule.arrayPosition);
        }

        if (molecule.right == true && molecule.down == true) {
            gridMolecules[iNum + 1][jNum + 1].push(molecule.arrayPosition);
        }
        if (molecule.right == true && molecule.up == true) {
            gridMolecules[iNum - 1][jNum + 1].push(molecule.arrayPosition);
        }


    });


}

function spawnVirus(_x, _y) { //spawn initial virus center screen

    if (_x == null || _y == null) {
        _x = simWidth / 2;
        _y = height / 2;
    }

    let Virus = molecules.push(new Covid(molecules.length, _x, _y));
}

function MedButton() { // spawn a number of immune cells  (represents application of medication)
    let count = document.getElementById("KT").value;
    for (let i = 0; i < count; i++) {
        spawnKillerT();
    }
}

function namesButton() { // toggle text on cells
    showNames = !showNames;
}

function ageButton() { //assigns rate of immune system cell production based on age
    myLung.age = document.getElementById("age").value;
    if (myLung.age <= 25) {
        ageModifier = 60;
    } else if (myLung.age <= 35) {
        ageModifier = 80;
    } else if (myLung.age <= 45) {
        ageModifier = 120;
    } else if (myLung.age <= 55) {
        ageModifier = 160;
    } else if (myLung.age <= 65) { // cascades up at 55+
        ageModifier = 200;
    } else {
        ageModifier = 300;
    }
}

function spawnKillerT() { // new immune cell
    molecules.push(new KillerT(molecules.length));
}

function renderGrid() { //calls all reccuring cell functions on each frame

    molecules.forEach(function (molecule) {
        molecule.step();
        molecule.checkEdges();
        molecule.render();

    });
}

function resetBalls() { //resets molecule booleans for collision detection

    for (let i = 0; i < molecules.length; i++) {
        molecules[i].reset();
    }

}
