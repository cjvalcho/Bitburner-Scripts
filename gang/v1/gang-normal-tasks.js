/** @param {NS} ns **/
export async function main(ns) {
	// Iterate through all members
		for (let i = 0; i < members.length; ++i) {
			var member = members[i];
			var memberInfo = ns.gang.getMemberInformation(member);
			/*for (var j = 0; j < allEquipment.length; ++j) {
				var equipment = allEquipment[j];
				if (memberInfo.upgrades.indexOf(equipment) == -1) {
					var cost = ns.gang.getEquipmentCost(equipment);
					if (cost < availableCash) {
						ns.gang.purchaseEquipment(member, equipment);
						availableCash = availableCash - cost;
					}
				}
			}*/

			// List of tasks
			if (myGang.wantedPenalty < 0.9 && myGang.wantedLevel > 1.1) {
				ns.gang.setMemberTask(member, "Vigilante Justice");
			}
			else if (memberInfo.str >= 500) {
				ns.gang.setMemberTask(member, "Traffick Illegal Arms");
			}
			else if (memberInfo.str >= 150) {
				ns.gang.setMemberTask(member, "Strongarm Civilians");
			}
			/*else if (memberInfo.str >= 50) {
				ns.gang.setMemberTask(member, "Mug People");
			}*/
			else {
				ns.gang.setMemberTask(member, "Train Combat");
			}
		}
}