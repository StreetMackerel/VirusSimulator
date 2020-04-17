# VirusSimulator

<<--Covid 19 Lung Infection Simulation-->>

This Simulation respresents a lung which is infected with covid 19.

THE LUNG:
If the percentage of virus cells in the lung reaches a lethal level for the age of the human the lung will die
If the virus is removed the lung will have subdued the virus

1.Epithilial Cells:
These cells coat the interior lining of the lung and protect bronchioli which are necessary for respiration.

LIGHT BLUE: Healthy.
RED: When infected with the virus they will incubate it.
FLASHING WHITE: The infected cell is counting down to release new viruses.
DARK RED: After releasing new viruses the cell dies.
GREEN: An immune system cell prevented to creation of new viruses

2.Covid 19 Virus:
This will travel until it meets another cell to destroy or infect the self destruct.
Does not collide with other viruses.

RED: Active and moving
GREY: Collided with other cell.
	infects epithilial cell
	kill immune system cell

3.Killer-T Immune System Cell
These cells job is to find and destoy virus cells and infected epithelial cells

BLUE: Active
GREY: Collided with other cell.
	Kills Virus cells
	Makes Infected Epithilial Cells IMMUNE which prevents them creating new viruses.

<--GUI-->

Start Button: Starts Simulation
Stop Button: Stops Simulation
Names Button: Toggles cell names on/off

Med Button: Spawns a number of new Immune System cells. This is meant to represent effective medication
Age Button: Adjusts the Age of the lung:
	Modifies spawn rate of immune cells
	Modifies the death threshold of the lung to viral infection
