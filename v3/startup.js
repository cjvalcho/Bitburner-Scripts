/** @param {NS} ns **/
export async function main(ns) {
    //let ramPerThread = ns.getScriptRam("/v2/early-hack-template.js");
    //let ramAvailable = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
    //let threads = Math.floor(ramAvailable / ramPerThread);
    //ns.run("/v3/hacknet_infinity.js");
    //ns.run("/v3/deployer.js", 1, ns.args[0]);
    //ns.run("/v2/masterHack.js, joes guns");
    //ns.run("/v3/purchase-servers.js", 1);
    //ns.run("/v2/early-hack-template.js", threads, ns.args[0]);
    //ns.run("master.js");
    ns.run("/crime/crime.js");
    ns.run("hack/distributed-hack.js");
}