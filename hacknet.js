/*
Finds Hacknet node with best gain or best gain per $$ spend.

My other script which buys cheapest upgrade:
https://www.reddit.com/r/Bitburner/comments/rw8ehg/scrip_for_hacknet/
*/
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	let hs = ns.hacknet;
	let time = 10;

	if (!ns.fileExists("Formulas.exe", "home")) { if (await ns.prompt("You need Formula.exe form Black Market. Do you have it?")) { await ns.alert("You are either liar or there was mistake.\nIt doesn't matter.") } await ns.alert("Get Formula.exe first."); return; }

	let pureGain = await ns.prompt("If you want pure gain no matter the cost, choose YES. If you want best gain per cost, choose NO. If you want cheapest upgrade, choose different scrip e.g. one in description")

	let upgradeLevelMult = ns.getHacknetMultipliers().levelCost;
	let upgradeRamMult = ns.getHacknetMultipliers().ramCost;
	let upgradeCoreMult = ns.getHacknetMultipliers().coreCost;
	let maxLevel = ns.formulas.hacknetNodes.constants().MaxLevel;
	let maxRam = ns.formulas.hacknetNodes.constants().MaxRam;
	let maxCore = ns.formulas.hacknetNodes.constants().MaxCores;

	while (true) {
		let playerMoney = ns.getServerMoneyAvailable("home");
		let bestGain = Number.MIN_SAFE_INTEGER;

		if (hs.numNodes() > 0) {
			var node;
			var part = 100;
			var cost;
			for (let i = 0; i < hs.numNodes(); i++) {
				let nodeStat = ns.hacknet.getNodeStats(i);

				let base = ns.formulas.hacknetNodes.moneyGainRate(nodeStat.level, nodeStat.ram, nodeStat.cores, ns.getHacknetMultipliers().production);
				let level = ns.formulas.hacknetNodes.moneyGainRate(nodeStat.level + 1, nodeStat.ram, nodeStat.cores, ns.getHacknetMultipliers().production);
				let ram = ns.formulas.hacknetNodes.moneyGainRate(nodeStat.level, nodeStat.ram + 1, nodeStat.cores, ns.getHacknetMultipliers().production);
				let core = ns.formulas.hacknetNodes.moneyGainRate(nodeStat.level, nodeStat.ram, nodeStat.cores + 1, ns.getHacknetMultipliers().production);

				let levelUp = ns.hacknet.getLevelUpgradeCost(i, upgradeLevelMult);
				let ramUp = ns.hacknet.getRamUpgradeCost(i, upgradeRamMult);
				let coreUp = ns.hacknet.getCoreUpgradeCost(i, upgradeCoreMult);

				if (pureGain) {
					var levelGain = level - base;
					var ramGain = ram - base;
					var coreGain = core - base;
				} else {
					var levelGain = ((level - base) / levelUp) * 1000;
					var ramGain = ((ram - base) / ramUp) * 1000;
					var coreGain = ((core - base) / coreUp) * 1000;
				}

				if (levelGain > bestGain && maxLevel > nodeStat.level) { bestGain = levelGain; node = i; part = 0; cost = levelUp; }
				if (ramGain > bestGain && maxRam > nodeStat.ram) { bestGain = ramGain; node = i; part = 1; cost = ramUp; }
				if (coreGain > bestGain && maxCore > nodeStat.cores) { bestGain = coreGain; node = i; part = 2; cost = coreUp; }
			}

			if (pureGain) {
				if (ns.formulas.hacknetNodes.moneyGainRate(1, 1, 1, ns.getHacknetMultipliers().production) <= bestGain.toFixed(3)) {
					if (playerMoney >= cost) {
						buyUpgrade();
					} else {
						time = time + 5000;
						ns.print("Not enough money. Missing " + ns.nFormat((cost - playerMoney), "$0.000a"));
						ns.print("Waiting for " + ns.tFormat(time));
					}
				} else {
					if (playerMoney >= hs.getPurchaseNodeCost()) {
						buyNode();
					} else {
						time = time + 5000;
						ns.print("Not enough money. Missing " + ns.nFormat(hs.getPurchaseNodeCost() - playerMoney, "$0.000a"));
						ns.print("Waiting for " + ns.tFormat(time));
					}
				}
			}
			else {
				if (ns.formulas.hacknetNodes.moneyGainRate(1, 1, 1, ns.getHacknetMultipliers().production) / hs.getPurchaseNodeCost() < bestGain) {
					if (playerMoney >= cost) {
						buyUpgrade();
					} else {
						time = time + 5000;
						ns.print("Not enough money. Missing " + ns.nFormat(cost - playerMoney, "$0.000a"));
						ns.print("Waiting for " + ns.tFormat(time));
					}
				}
			}
		} else {
			if (playerMoney >= hs.getPurchaseNodeCost()) {
				buyNode()
			} else {
				time = time + 5000;
				ns.print("Not enough money. Missing " + ns.nFormat(hs.getPurchaseNodeCost() - playerMoney, "$0.000a"));
				ns.print("Waiting for " + ns.tFormat(time));
			}
		}
		await ns.sleep(time);
	}

	function buyUpgrade() {
		switch (part) {
			case 0:
				ns.print("Upgraded node nr. " + node + " - Level for " + ns.nFormat(cost, "$0.000a"));
				hs.upgradeLevel(node, 1);
				break;
			case 1:
				ns.print("Upgraded node nr. " + node + " - Ram for " + ns.nFormat(cost, "$0.000a"));
				hs.upgradeRam(node, 1);
				break;
			case 2:
				ns.print("Upgraded node nr. " + node + " - Core for " + ns.nFormat(cost, "$0.000a"));
				hs.upgradeCore(node, 1);
				break;
			default:
				time = 10000;
				ns.print("You should not be here. Contact u/xpodo");
		}
	}

	function buyNode() {
		ns.print("Bought node nr. " + hs.numNodes() + " for " + ns.nFormat(hs.getPurchaseNodeCost(), "$0.000a"));
		hs.purchaseNode();
		time = 100;
	}
}