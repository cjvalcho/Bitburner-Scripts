/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    // get current number of sleeves
    const numSleeves = ns.sleeve.getNumSleeves();

    while (true) {
        for (let i = 0; i < numSleeves; i++) {
            // Get sleeve stats
            const {
                shock,
                strength
            } = ns.sleeve.getSleeveStats(i);

            // Get sleeve tasks
            const {
                task,
                crime
            } = ns.sleeve.getTask(i);

            // Check if sleeve shock is low enough to start
            if (shock > 75) {
                if (task != "Recovery") {
                    ns.sleeve.setToShockRecovery(i);
                    ns.print("Set" + i + " to Shock Recovery");
                }
            }
            else if (strength < 90 && crime != "Mug" && ns.heart.break() > -54000) {
                ns.sleeve.setToCommitCrime(i, "Mug");
                ns.print("Set" + i + " to Mug");
            }
            else if (strength >= 90 && crime != "Homicide" && ns.heart.break() > -54000) {
                ns.sleeve.setToCommitCrime(i, "Homicide");
                ns.print("Set" + i + " to Homicide");
            }
            else if (ns.heart.break() <= -54000 && ns.sleeve.getTask(i).crime != "Traffick Arms") {
                ns.sleeve.setToCommitCrime(i, "Traffick Arms");
                ns.print("Set" + i + " to Traffick Arms");
            }
        }
        await ns.sleep(1000);
    }
}