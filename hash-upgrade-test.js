/** @param {NS} ns **/
export async function get_money(ns) {
	return ns.getPlayer().money;
}


export async function setup_hacknet(ns) {
	var numberOfNodes = ns.hacknet.numNodes();
	let xNodes = [];
	for (var i = 0; i < numberOfNodes; i++) {
		var currNode = ns.hacknet.getNodeStats(i);
		xNodes = xNodes.concat(currNode);
	}
	return xNodes;
}


export async function getMaxRam(ns, nodes) {
	var sortFunc = function (a, b) { return b.ram - a.ram; }
	nodes = nodes.sort(sortFunc);
	return nodes[0].ram;
}


export async function getMaxCores(ns, nodes) {
	var sortFunc = function (a, b) { return b.cores - a.cores; }
	nodes = nodes.sort(sortFunc);
	return nodes[0].cores;
}


export async function getMaxLevel(ns, nodes) {
	var sortFunc = function (a, b) { return b.level - a.level; }
	nodes = nodes.sort(sortFunc);
	return nodes[0].level;
}


export async function getTotalBreakEven(ns, lvls, ram, cores, num_nodes) {
	var servers_base_cost = 0;
	var cores_cost = num_nodes * ns.formulas.hacknetServers.coreUpgradeCost(1, cores-1, player.hacknet_node_core_cost_mult);
	var lvls_cost = num_nodes * ns.formulas.hacknetServers.levelUpgradeCost(1, lvls-1, player.hacknet_node_level_cost_mult);
	var ram_cost = num_nodes * ns.formulas.hacknetServers.ramUpgradeCost(1, Math.log2(ram), player.hacknet_node_ram_cost_mult);
	var player = await ns.getPlayer();
	for (var i=0; i < num_nodes; i++) {
		servers_base_cost += ns.formulas.hacknetServers.hacknetServerCost(i, player.hacknet_node_purchase_cost_mult);
	}
	var total_cost = servers_base_cost + cores_cost + lvls_cost + ram_cost;
	await ns.tprint("test");
	await ns.tprint(total_cost);
	await ns.exit();
}


export async function getCurrentBreakEvenTime(ns) {
	var server_base_cost = 0;
	let player = await ns.getPlayer();
	var num_nodes = await ns.hacknet.numNodes();
	var base_node = await ns.hacknet.getNodeStats(0);
	var lvls = base_node.level;
	var lvls_cost = num_nodes * ns.formulas.hacknetServers.levelUpgradeCost(1, lvls-1, player.hacknet_node_level_cost_mult);
	var cores = base_node.cores;
	var cores_cost = num_nodes * ns.formulas.hacknetServers.coreUpgradeCost(1, cores-1, player.hacknet_node_core_cost_mult);
	var ram = base_node.ram;
	var ram_cost = num_nodes * ns.formulas.hacknetServers.ramUpgradeCost(1, Math.log2(ram), player.hacknet_node_ram_cost_mult);
	//await ns.tprint(lvls_cost);
	var income = num_nodes * base_node.production;
	for (var i=0; i < num_nodes; i++) {
		var currNode = ns.hacknet.getNodeStats(i);
		server_base_cost += ns.formulas.hacknetServers.hacknetServerCost(i + 1, player.hacknet_node_purchase_cost_mult);
	}
	//ns.tprint(server_base_cost);
	var total = lvls_cost + cores_cost + ram_cost + server_base_cost;
	//await ns.tprint("Total: " + total);
	//await ns.tprint("Income: " + income);
	income = income * 250000;
	//await ns.tprint(total);
	var breakEvenTime = total / income;
	//ns.print("Total: " + total);
	//ns.print("Income: " + income);
	return breakEvenTime;
}


export async function getOptimalUpgrade(ns, node_index) {
	var player = ns.getPlayer();
	const hacknetGainMult = player.hacknet_node_money_mult;
	const upCoreMult = player.hacknet_node_core_cost_mult;
	const upRamMult = player.hacknet_node_ram_cost_mult;
	const upLvlMult = player.hacknet_node_level_cost_mult;
	const currNode = ns.hacknet.getNodeStats(node_index);
	const startCores = currNode.cores;
	const startRam = currNode.ram;
	const startLevel = currNode.level;
	var efficiencies = [];
	// core upgrade efficiency
	var coreUpCost = ns.formulas.hacknetServers.coreUpgradeCost(startCores, 1, upCoreMult);
	var coreUpEffect = ns.formulas.hacknetServers.hashGainRate(startLevel, 0, startRam, startCores + 1, hacknetGainMult) - currNode.production;
	var coreTotalGainRate;
	var coreUpGainRate = 4 / coreUpEffect;
	var coreBreakEven = coreUpCost / coreUpGainRate;
	efficiencies = efficiencies.concat({
		name: "core",
		efficiency: coreUpEffect / coreUpCost,
		cost: coreUpCost,
		node: node_index,
		break_even: coreBreakEven
	});
	// level upgrade efficiency	
	var lvlUpCost = ns.formulas.hacknetServers.levelUpgradeCost(startLevel, 1, upLvlMult);
	var lvlUpEffect = ns.formulas.hacknetServers.hashGainRate(startLevel + 1, 0, startRam, startCores, hacknetGainMult) - currNode.production;
	var lvlUpGainRate = 4 / lvlUpEffect;
	var lvlBreakEven = lvlUpCost / lvlUpGainRate;
	efficiencies = efficiencies.concat({
		name: "level",
		efficiency: lvlUpEffect / lvlUpCost,
		cost: lvlUpCost,
		node: node_index,
		break_even: lvlBreakEven
	});
	// ram upgrade efficiency
	var ramUpCost = ns.formulas.hacknetServers.ramUpgradeCost(startRam, 1, upRamMult);
	var ramUpEffect = ns.formulas.hacknetServers.hashGainRate(startLevel, 0, startRam * 2, startCores, hacknetGainMult) - currNode.production;
	var ramUpGainRate = 4 / ramUpEffect;
	var ramBreakEven = ramUpCost / ramUpGainRate;
	efficiencies = efficiencies.concat({
		name: "ram",
		efficiency: ramUpEffect / ramUpCost,
		cost: ramUpCost,
		node: node_index,
		break_even: ramBreakEven
	});
	return efficiencies.sort((a, b) => b.efficiency - a.efficiency)[0];
}


export async function getOptimalPurchase(ns) {
	var player = await ns.getPlayer();
	const upLvlMult = player.hacknet_node_level_cost_mult;
	const hacknetGainMult = player.hacknet_node_money_mult;
	const upCoreMult = player.hacknet_node_core_cost_mult;
	const upRamMult = player.hacknet_node_ram_cost_mult;
	const purchaseServerMult = player.hacknet_node_purchase_cost_mult;
	const myNodes = await setup_hacknet(ns);
	const maxRam = await getMaxRam(ns, myNodes);
	const maxCores = await getMaxCores(ns, myNodes);
	const maxLevel = await getMaxLevel(ns, myNodes);
	// purchase new server efficiency
	var numCurrServers = ns.hacknet.numNodes();
	var purchaseServerCost = await ns.formulas.hacknetServers.hacknetServerCost(numCurrServers + 1, purchaseServerMult);
	var upgradeCoresCost = await ns.formulas.hacknetServers.coreUpgradeCost(1, maxCores - 1, upCoreMult);
	var upgradeRamCost = await ns.formulas.hacknetServers.ramUpgradeCost(1, Math.log2(maxRam), upRamMult);
	var upgradeLvlCost = await ns.formulas.hacknetServers.levelUpgradeCost(1, maxLevel - 1, upLvlMult);
	var upgradeTotalCost = upgradeCoresCost + upgradeLvlCost + upgradeRamCost + purchaseServerCost;
	var efficiencies = [{
		name: "purchase_node",
		efficiency: ns.formulas.hacknetServers.hashGainRate(maxLevel, 0, maxRam, maxCores, hacknetGainMult) / upgradeTotalCost,
		cost: purchaseServerCost,
		node: numCurrServers
	}];
	for (var i = 0; i < numCurrServers; i++) {
		efficiencies = efficiencies.concat(await getOptimalUpgrade(ns, i));
	}
	efficiencies = efficiencies.sort((a, b) => b.efficiency - a.efficiency);
	return efficiencies[0];
}


export async function makeOptimalPurchase(ns, break_even) {
	var myOptimalPurchase = await getOptimalPurchase(ns);
	var breakEvenTime = await getCurrentBreakEvenTime(ns);
	//ns.tprint(break_even / breakEvenTime);
	if (breakEvenTime >= break_even) { ns.tprint("done "); return ns.exit(); }
	switch (myOptimalPurchase.name) {
		case "purchase_node":
			if (await get_money(ns) < myOptimalPurchase.cost) { await ns.print("Waiting for " + myOptimalPurchase.cost + "$ to purchase hacknet-node-" + myOptimalPurchase.node); }
			while (await get_money(ns) < myOptimalPurchase.cost) { await ns.sleep(1000); }
			if (ns.hacknet.purchaseNode() >= 0) { await ns.print("Purchased hacknet-node-" + myOptimalPurchase.node); }
			return;
		case "ram":
			if (await get_money(ns) < myOptimalPurchase.cost) { await ns.print("Waiting for " + myOptimalPurchase.cost + "$ to upgrade RAM of hacknet-node-" + myOptimalPurchase.node); }
			while (await get_money(ns) < myOptimalPurchase.cost) { await ns.sleep(1000); }
			if (ns.hacknet.upgradeRam(myOptimalPurchase.node, 1) >= 0) { await ns.print("Upgraded RAM on hacknet-node-" + myOptimalPurchase.node); }
			return;
		case "level":
			if (await get_money(ns) < myOptimalPurchase.cost) { await ns.print("Waiting for " + myOptimalPurchase.cost + "$ to upgrade level of hacknet-node-" + myOptimalPurchase.node); }
			while (await get_money(ns) < myOptimalPurchase.cost) { await ns.sleep(1000); }
			if (ns.hacknet.upgradeLevel(myOptimalPurchase.node, 1) >= 0) { await ns.print("Upgraded level on hacknet-node-" + myOptimalPurchase.node); }
			return;
		case "core":
			if (await get_money(ns) < myOptimalPurchase.cost) { await ns.print("Waiting for " + myOptimalPurchase.cost + "$ to upgrade cores of hacknet-node-" + myOptimalPurchase.node); }
			while (await get_money(ns) < myOptimalPurchase.cost) { await ns.sleep(1000); }
			if (ns.hacknet.upgradeCore(myOptimalPurchase.node, 1) >= 0) { await ns.print("Upgraded cores on hacknet-node-" + myOptimalPurchase.node); }
			return;
	}
}


export async function main(ns) {
	//ns.tprint(ns.hacknet.getNodeStats(1));	 
	//ns.tprint(entries);
	ns.disableLog("sleep");
	//var test = await getCurrentBreakEvenTime(ns);
	//ns.tprint(test);
	//await ns.exit();
	//await getTotalBreakEven(ns, 56, 256, 14, 10);
	//await ns.exit();
	let break_even = 1 * 24 * 3600; // break even time in seconds
	if (ns.hacknet.numNodes() == 0) { ns.hacknet.purchaseNode(); }
	while (true) { await makeOptimalPurchase(ns, break_even); await ns.sleep(100); }
}