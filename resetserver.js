/** @param {NS} ns **/
export async function main(ns) {
    let servers = ns.getPurchasedServers();
    for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
        //let name = "pserv-" + i;
        let name = "nillabotV16k-" + i;
                ns.deleteServer(name);
    }
}