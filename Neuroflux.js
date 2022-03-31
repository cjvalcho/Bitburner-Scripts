/** @param {NS} ns **/

var faction = "Sector-12";

export async function main(ns) {
	//ns.tprint(ns.getAugmentationPrice('NeuroFlux Governor'));
	//ns.tprint(ns.getServerMoneyAvailable('home'));
	while (ns.getAugmentationPrice('NeuroFlux Governor') < ns.getServerMoneyAvailable('home')) {
		ns.purchaseAugmentation(faction,'NeuroFlux Governor');
		await ns.sleep(1000);
	}
}