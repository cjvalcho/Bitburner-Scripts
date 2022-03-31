/** @param {NS} ns **/
export async function main(ns) {
	while (true) {
		if (ns.hacknet.numHashes() > 4) {
			if (ns.args[0] == "money") {
				ns.hacknet.spendHashes("Sell for Money");
			}
			else {
				ns.hacknet.spendHashes("Sell for Corporation Funds");
			}
		}
		await ns.sleep(100);
	}
}