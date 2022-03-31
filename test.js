/** @param {NS} ns **/
export async function main(ns) {
	const playerMulti = ns.getPlayer().hacknet_node_money_mult;
	//ns.tprint(ns.bladeburner.getCurrentAction().name);
	//const [ current, max ] = ns.bladeburner.getStamina();
	//ns.tprint("Current " + current, "Max " + max, "Percentage " + current/max);
	//let { hp, max_hp } = ns.getPlayer();
	//ns.tprint("Current " + hp, "Max " + max_hp, "Percentage " + hp / max_hp);
	//ns.tprint(ns.bladeburner.getCityChaos(ns.bladeburner.getCity()));
	/*ns.tprint(ns.bladeburner.getBonusTime());
	if (getSuccess("blackop", "Operation Typhoon").minSuccess < 0.60) {
		ns.tprint(getSuccess("blackop", "Operation Typhoon").minSuccess);
	}*/

	const success = ns.bladeburner.getActionEstimatedSuccessChance("blackop", "Operation Typhoon")[1];
	ns.tprint(ns.bladeburner.getActionEstimatedSuccessChance("contract", "Bounty Hunter"));
	ns.tprint(success);
	ns.tprint(ns.bladeburner.getActionEstimatedSuccessChance("operation", "Assassination"));
	//ns.tprint(ns.bladeburner.getCity());
	//ns.tprint(ns.getPlayer().hp / ns.getPlayer().max_hp);
	//ns.tprint(ns.hacknet.maxNumNodes());
	//ns.tprint(ns.hacknet.getHashUpgrades());
	//ns.tprint(ns.hacknet.numHashes());
	//ns.tprint(ns.formulas.hacknetServers.constants());
	//ns.tprint(ns.formulas.hacknetServers.hashGainRate(1, 0, 1, 1, playerMulti));
	//ns.tprint(ns.formulas.hacknetNodes.moneyGainRate(1, 1, 1));
	//ns.tprint(ns.hacknet.getPurchaseNodeCost());
	//ns.tprint(ns.formulas.hacknetServers.hashGainRate(1, 0, 1, 1, playerMulti));
	//ns.tprint(ns.hacknet.getPurchaseNodeCost());
	//ns.tprint(ns.formulas.hacknetServers.hashGainRate(1, 0, 1, 1, playerMulti));
	//ns.tprint(ns.heart.break());
	//ns.tprint(ns.sleeve.getInformation().mult);
	//ns.tprint(ns.sleeve.getTask(0).crime);
	//ns.tprint(ns.formulas.hacknetNodes.moneyGainRate(1,1,1,1.2877));
	//ns.tprint(ns.getPlayer().hacknet_node_money_mult);
	/*
	const { hacknetNodes } = ns.formulas;
	const { hacknet } = ns;

	const {
		MaxCores,
		MaxLevel,
		MaxRam
	} = hacknetNodes.constants();

	const maxValues = {
		cores: MaxCores,
		level: MaxLevel,
		ram: MaxRam
	};

	const playerMulti = ns.getPlayer().hacknet_node_money_mult;

	const upgradeCostFunc = {
		cores: hacknet.getCoreUpgradeCost,
		level: hacknet.getLevelUpgradeCost,
		ram: hacknet.getRamUpgradeCost
	};

	function getUpgradeInfo(index, stats, field) {
		if (stats[field] === maxValues[field]) {
			return undefined; // Already maxed out
		}
		const getCost = (node) => upgradeCostFunc[field](node, 1);
		const cost = getCost(index);
		const newStats = { ...stats };
		newStats[field] += 1;
		const gain = hacknetNodes.moneyGainRate(newStats.level, newStats.ram, newStats.cores, playerMulti);
		const roi = gain / cost;
		return {
			cost,
			roi,
			gain
		}
	}

	function getPurchaseInfo() {
		const cost = hacknet.getPurchaseNodeCost();
		const gain = hacknetNodes.moneyGainRate(1, 1, 1, playerMulti);
		const roi = gain / cost;
		return {
			cost,
			roi,
			gain
		};
	}*/

	function getSuccess(type, name) {
		let [minSuccess, maxSuccess] = ns.bladeburner.getActionEstimatedSuccessChance(type, name);
		return {
			minSuccess,
			maxSuccess
		}
	}
}