/** @param {NS} ns **/
export async function main(ns) {
	let servers = [];
	let sList = [];
	let serverInfo = function (name) {
		this.name = name;
		this.rHackLvl = ns.getServerRequiredHackingLevel(name);
		this.maxMoney = ns.getServerMaxMoney(name);
		this.availMoney = ns.getServerMoneyAvailable(name);
		this.gRate = ns.getServerGrowth(name);
		this.gTime = ns.getGrowTime(name);
	};
	let serversToScan = ns.scan("home");
	//Gathering the list of servers
	while (serversToScan.length > 0) {
		let server = serversToScan.shift();
		if (!servers.includes(server) && server !== "home") {
			servers.push(server);
			serversToScan = serversToScan.concat(ns.scan(server));
		}
	}
	//Converting the array of server names into an array of serverInfo objects
	for (var i = 0; i < servers.length; i++) {
		sList.push((new serverInfo(servers[i])));
	}
	// Sorting by max money, and then by hack level
	sList.sort((a, b) => (a.maxMoney > b.maxMoney) ? 1 : (a.maxMoney === b.maxMoney) ? ((a.rHackLvl > b.rHackLvl) ? 1 : -1) : -1);

	const row = '%-20s | %8s | %12s | %12s | %8s | %12s';
	ns.tprintf(row, 'HOSTNAME', 'HACK LVL', 'MAX $$', 'CASH $$', 'GROW LVL', 'GROW SPD');
	ns.tprintf(row, '---------', '-------', '------', '-------', '-------', '-------');
	for (var i = 0; i < sList.length; i++) {
		if (sList[i].maxMoney > 0) {
			ns.tprintf(row, sList[i].name,
				ns.nFormat(sList[i].rHackLvl, '0,0'),
				ns.nFormat(sList[i].maxMoney, '($ 0.00 a)'),
				ns.nFormat(sList[i].availMoney, '($ 0.00 a)'),
				ns.nFormat(sList[i].gRate, '0,0'),
				ns.nFormat(sList[i].gTime, '0,0')
			);
		};
	};
}