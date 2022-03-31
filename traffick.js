/** @param {NS} ns **/
export async function main(ns) {
	let crime = "Mug someone";
	while (true) {
		let time = ns.commitCrime(crime);
		let stop = time * 0.8;
		if (time - stop > 1000)
			stop = time - 1000;

		if (ns.getCrimeChance("Traffick illegal Arms") >= 0.8) {
			crime = "Traffick illegal Arms";
		}

		await ns.sleep(stop);
		if (!ns.isBusy())
			break;  // assume user interrupted because desire to stop

		while (ns.isBusy())
			await ns.sleep(350);
	}
}