/** @param {NS} ns **/
export async function main(ns) {
	ns.tail()
	let loops = 0
	let ascentionCounter = 0
	let ascend = false
	let ascentionsComplete = 0
	while (true) {
		let myGang = ns.gang.getGangInformation();
		let availableCash = (ns.getServerMoneyAvailable("home"))
		ns.print("script has $" + availableCash + " available")
		let allEquipment = ns.gang.getEquipmentNames()



		while (ns.gang.canRecruitMember()) {
			for (let i = 0; i < 30; ++i) {
				ns.gang.recruitMember(i)
			}
		}

		let members = ns.gang.getMemberNames()


		for (let i = 0; i < members.length; ++i) {
			var member = members[i];
			var memberInfo = ns.gang.getMemberInformation(member);
			for (var j = 0; j < allEquipment.length; ++j) {
				var equipment = allEquipment[j];
				if (memberInfo.upgrades.indexOf(equipment) == -1) {
					var cost = ns.gang.getEquipmentCost(equipment);
					if (cost < availableCash) {
						ns.gang.purchaseEquipment(member, equipment);
						availableCash = availableCash - cost;
					}
				}
			}

			
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

			/*if (memberInfo.str < 50 || Math.random() < 0.2) {
				ns.gang.setMemberTask(member, "Terrorism")
			}
			else if (Math.random() < 0.2 && memberInfo.str < 300) {
				ns.gang.setMemberTask(member, "Territory Warfare")
			}
			else if (myGang.wantedPenalty < 0.9 && myGang.wantedLevel > 1.1) {
				ns.gang.setMemberTask(member, "Vigilante Justice")
			}
			else if (memberInfo.str < 30) {
				ns.gang.setMemberTask(member, "Train Combat")
			}
			else if (memberInfo.str < 150) {
				ns.gang.setMemberTask(member, "Mug People")
			}
			else if (memberInfo.str < 500) {
				ns.gang.setMemberTask(member, "Strongarm Civilians")
			}
			else {
				ns.gang.setMemberTask(member, "Traffick Illegal Arms")
			}*/
		}
		if (ascentionCounter > 150) { // 10 minutes
			ascend = true
		}

		if (ascend == true) {
			let topResult = 0
			let topMember = "0"
			let result
			for (let i = 0; i < members.length; ++i) {
				let member = members[i]
				result = ns.gang.getAscensionResult(member)
				try {
					if (result.str > topResult) {
						topResult = result.str
						topMember = member
					}
				}
				catch (err) { }
			}
			ns.gang.ascendMember(topMember)
			ascentionCounter = 0
			ascend = false
			ascentionsComplete++
		}
		loops++
		ns.print("loop " + loops + " complete!")
		ns.print(ascentionsComplete + " ascentions complete!")
		ascentionCounter++
		await sleep(4000);
	}
}


function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}