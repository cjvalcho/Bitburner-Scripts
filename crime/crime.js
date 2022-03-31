/** @param {NS} ns **/
/*export async function main(ns) {
	ns.disableLog("disableLog"); ns.disableLog("sleep");
	ns.tail("crime.js");
	while (true) {
		ns.print("");
		var crimeTime = commitCrime(ns);
		await ns.sleep(crimeTime);
	}
}

function commitCrime(ns, combatStatsGoal = 75) {
	// Calculate the risk value of all crimes
	var player = ns.getPlayer();
	ns.print("Karma: " + ns.heart.break().toFixed(2));
	ns.print("Kills: " + player.numPeopleKilled);

	var bestCrime = "";
	var bestCrimeValue = 0;
	var bestCrimeStats = {};
	for (let crime of crimes) {
		let crimeChance = ns.getCrimeChance(crime);
		var crimeStats = ns.getCrimeStats(crime);
		if (crimeChance < 0.6 && bestCrimeValue > 0) {
			continue;
		}
		if (crime == "Assassination" && player.numPeopleKilled < 30 && crimeChance > 0.98) {
			bestCrime = "Assassination";
			bestCrimeStats = crimeStats;
			break;
		}
		else if (crime == "Homicide" && player.numPeopleKilled < 30 && crimeChance > 0.98) {
			bestCrime = "Homicide";
			bestCrimeStats = crimeStats;
			break;
		}
		var crimeValue = 0;

		crimeValue = crimeStats.karma * 60000;
		crimeValue = crimeValue * crimeChance / ((crimeStats.time + 10));
		if (crimeValue > bestCrimeValue) {
			bestCrime = crime;
			bestCrimeValue = crimeValue;
			bestCrimeStats = crimeStats;
		}
	}

	ns.commitCrime(bestCrime);

	ns.print("Crime value " + ns.nFormat(bestCrimeValue, "0.0a") + " for " + bestCrime);
	return bestCrimeStats.time + 10;
}

var crimes = ["Shoplift", "RobStore", "Mug", "Larceny", "Deal Drugs", "Bond Forgery", "Traffick Arms", "Homicide",
	"Grand Theft Auto", "Kidnap", "Assassination", "Heist"];*/

export async function main(ns) {
	let crime = "Mug someone";
	while (true) {
		let time = ns.commitCrime(crime);
		let stop = time * 0.8;
		if (time - stop > 1000)
			stop = time - 1000;

		if (ns.getCrimeChance("Homicide") >= 0.8) {
			crime = "Homicide";
		}

		await ns.sleep(stop);
		if (!ns.isBusy() || ns.heart.break() <= -54000)
			break;  // assume user interrupted because desire to stop

		while (ns.isBusy())
			await ns.sleep(350);
	}
}

/*If the script's purpose is to farm karma, then the original script is overly complicated for what needs to be done.
Simply spamming the "Mug Someone" crime to build up stats, than transitioning over to "Homicide" to farm karma will
likely be the most ideal method of karma farming.

In addition, the original script above does not allow for a user to easily exit the script without closing the
program, as committing a crime takes up the entire screen. Through this method, if the user cancels the crime,
the script will detect that the user is no longer busy and will immediately cancel running, returning control
to the player.

It can likely be streamlined further, but for the sake of simplicity, I've found this code ideal.

Sadly, I can't remember where I found this script, so I cannot give the source credit.*/