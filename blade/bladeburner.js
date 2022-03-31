/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");

	const { bladeburner } = ns;

	let time = getSleepTime("general", "Field Analysis"); // Default sleep time

	while (true) {
		let currentStats = getPlayerStats(); // Update player's HP and Stamina
		let currentAction = bladeburner.getCurrentAction().name; // Get the player's current Bladeburner action
		//let bonusTime = bladeburner.getBonusTime();
		//ns.print("Player HP %: " + getPlayerHP());
		//ns.print("Player Stamina %: " + getStaminaPercentage());
		if (currentStats.playerHP < 0.5) { // Heal if HP is below 50%
			while (currentStats.playerHP < 1) {
				if (currentAction != "Hyperbolic Regeneration Chamber") {
					bladeburner.startAction("general", "Hyperbolic Regeneration Chamber");
					time = getSleepTime("general", "Hyperbolic Regeneration Chamber");
					ns.print("Setting Action to Hyperbolic Regeneration Chamber");
					currentAction = "Hyperbolic Regeneration Chamber";
				}
				await ns.sleep(time);
				currentStats = getPlayerStats();
			}
		} // Gather data if Stam is below 50%, otherwise take success penalties
		else if (currentStats.stamPercent < 0.5) {
			while (currentStats.stamPercent < 1) {
				if (currentAction != "Field Analysis") {
					bladeburner.startAction("general", "Field Analysis");
					time = getSleepTime("general", "Field Analysis");
					ns.print("Setting Action to Field Analysis");
					currentAction = "Field Analysis";
				}
				await ns.sleep(time);
				currentStats = getPlayerStats();
			}
		} // If Chaos is above 50 and Stealth Retirement is available, do so
		else if (getChaos() > 50 && getSuccess("operation", "Stealth Retirement Operation").minSuccess < 0.95 && bladeburner.getActionCountRemaining("operation", "Stealth Retirement Operation") > 1) {
			while (getChaos() >= 45) {
				if (currentAction != "Stealth Retirement Operation") {
					bladeburner.startAction("operation", "Stealth Retirement Operation");
					ns.print("Setting Action to Stealth Retirement Operation");
					currentAction = "Stealth Retirement Operation";
				}
				time = getSleepTime("operation", "Stealth Retirement Operation");
				await ns.sleep(time);
			}
		} // If Chaos is above 50 and Stealth Retirement is unavailable, do Diplomacy
		else if (getChaos() > 50) {
			while (getChaos() >= 45) {
				if (currentAction != "Diplomacy") {
					bladeburner.startAction("general", "Diplomacy");
					time = getSleepTime("general", "Diplomacy");
					ns.print("Setting Action to Diplomacy");
					currentAction = "Diplomacy";
				}
				await ns.sleep(time);
			}
		} // If Assassination is available, do so
		else if (getSuccess("operation", "Assassination").maxSuccess >= 0.95) {
			if (getSuccess("operation", "Assassination").minSuccess < 0.95) {
				while (getSuccess("operation", "Assassination").minSuccess != getSuccess("operation", "Assassination").maxSuccess) {
					if (currentAction != "Field Analysis") {
						bladeburner.startAction("general", "Field Analysis");
						time = getSleepTime("general", "Field Analysis");
						ns.print("Setting Action to Field Analysis due to low assassination data");
						currentAction = "Field Analysis";
					}
					await ns.sleep(time);
				}
			}
			else if (currentAction != "Assassination") {
				bladeburner.startAction("operation", "Assassination");
				ns.print("Setting Action to Assassination");
			}
			time = getSleepTime("operation", "Assassination");
		} // If Assassination is unavailable, check if Bounty Hunting is available, do so
		else if (getSuccess("contract", "Bounty Hunter").maxSuccess > 0.70) {
			if (getSuccess("contract", "Bounty Hunter").minSuccess < 0.70) {
				while (getSuccess("contract", "Bounty Hunter").minSuccess != getSuccess("contract", "Bounty Hunter").maxSuccess) {
					if (currentAction != "Field Analysis") {
						bladeburner.startAction("general", "Field Analysis");
						time = getSleepTime("general", "Field Analysis");
						ns.print("Setting Action to Field Analysis due to low bounty data");
						currentAction = "Field Analysis";
					}
					await ns.sleep(time);
				}
			}
			else if (currentAction != "Bounty Hunter") {
				bladeburner.startAction("contract", "Bounty Hunter");
				ns.print("Setting Action to Bounty Hunter");
			}
			time = getSleepTime("contract", "Bounty Hunter");
		} // If Bounty Hunting and Assassinations are unavailable, and Tracking is unavailable, just gather data
		else if (bladeburner.getActionCountRemaining("contract", "Tracking") < 5 || getSuccess("contract", "Tracking").minSuccess < 0.60) {
			if (currentAction != "Field Analysis") {
				bladeburner.startAction("general", "Field Analysis");
				ns.print("Setting Action to Field Analysis due to low Tracking");
			}
			time = getSleepTime("general", "Field Analysis");
		} // If all else fails, try Tracking
		else {
			if (currentAction != "Tracking") {
				bladeburner.startAction("contract", "Tracking");
				ns.print("Setting Action to Tracking");
			}
			time = getSleepTime("contract", "Tracking");
		}
		await ns.sleep(time); // Sleep for the duration of the action
	}

	function getPlayerStats() {
		let [current, max] = ns.bladeburner.getStamina();
		let { hp, max_hp } = ns.getPlayer();
		let stamPercent = current / max;
		let playerHP = hp / max_hp;
		return {
			stamPercent,
			playerHP
		}
	}

	/*function getStaminaPercentage() {
		let [current, max] = bladeburner.getStamina();
		return current / max;
	}

	function getPlayerHP() {
		let { hp, max_hp } = ns.getPlayer();
		return hp / max_hp;
	}*/

	function getChaos() {
		return bladeburner.getCityChaos(bladeburner.getCity());
	}

	function getSuccess(type, name) {
		let [minSuccess, maxSuccess] = bladeburner.getActionEstimatedSuccessChance(type, name);
		return {
			minSuccess,
			maxSuccess
		}
	}

	function getSleepTime(type, name) {
		let bonusTime = bladeburner.getBonusTime();
		let calcTime = bladeburner.getActionTime(type, name);
		if (bonusTime > 1000) {
			calcTime = calcTime / 5;
		}
		return calcTime;
	}
}