/** @param {NS} ns **/
export async function main(ns) {
	/*let values = getPlayerStats();
	ns.tprint("Stam Percent: " + getStaminaPercentage());
	ns.tprint("HP Percent: " + getPlayerHP());
	ns.tprint("Stam Percent: " + values.stamPercent + " and HP Percent: " + values.playerHP);

	function getStaminaPercentage() {
		let [current, max] = ns.bladeburner.getStamina();
		return current / max;
	}

	function getPlayerHP() {
		let { hp, max_hp } = ns.getPlayer();
		return hp / max_hp;
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
	}*/

	ns.tprint(ns.bladeburner.getActionTime("contract", "Bounty Hunter"));
	ns.tprint(ns.bladeburner.getActionTime("contract", "Bounty Hunter")/5);
	ns.tprint(ns.bladeburner.getBonusTime());
}