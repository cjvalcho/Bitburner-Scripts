/** @param {NS} ns **/
export async function main(ns) {
    ns.run("/v2/deployer.js", 1);
    ns.run("/v2/purchase-servers.js", 1);
}