/** @param {NS} ns **/
export async function main(ns) {
  // Set these variables up outside of the while loop so they can persist between loops
  var lastTick = Date.now(); // The Last Tick
  var allGangStr = ns.gang.getOtherGangInformation();
  var EXPECTEDTICKTIME = 20600;
  let loops = 0;
  let ascentionCounter = 0;
  let ascend = false;
  let ascentionsComplete = 0;

  while (true) {
    let myGang = ns.gang.getGangInformation();
    let availableCash = (ns.getServerMoneyAvailable("home"));
    ns.print("script has $" + availableCash + " available");
    let allEquipment = ns.gang.getEquipmentNames();

    while (ns.gang.canRecruitMember()) {
      for (let i = 0; i < 30; ++i) {
        ns.gang.recruitMember(i);
      }
    }

    let members = ns.gang.getMemberNames()
    let rNow = Date.now(); // The Current Time
    let curGangStr = ns.gang.getOtherGangInformation();

    if (!deepEqual(curGangStr, allGangStr)) {
      // Gang strengths have changed, so we just had a tick
      //ns.tprint("A tick occured after " + (rNow - lastTick) + "ms");
      // Make our last tick time (which persists between loops because it's defined ahead of the while loop)
      // equal to the current time 
      lastTick = rNow;
      // Ditto with that gang strength thing
      allGangStr = curGangStr;

      //let myGang = ns.gang.getGangInformation();

      // Begin normal tasks
      //ns.tprint("Current Gang Strength " + myGang.power);
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
        else if (memberInfo.str >= 10000) {
          ns.gang.setMemberTask(member, "Human Trafficking");
        }
        else if (memberInfo.str >= 500) {
          ns.gang.setMemberTask(member, "Traffick Illegal Arms");
        }
        else if (memberInfo.str >= 150) {
          ns.gang.setMemberTask(member, "Strongarm Civilians");
        }
        /*else if (memberInfo.str >= 50 && memberInfo.str_mult <= 5) {
          ns.gang.setMemberTask(member, "Mug People");
        }*/
        else {
          ns.gang.setMemberTask(member, "Train Combat");
        }
      }
    }
    //So the above can help you figure out when ticks happen
    //since we can predict them (because they're a regular interval)
    //then we can do some reasoning like

    let msLastTick = rNow - lastTick; // Time since the last tick in ms

    //ns.tprint(`Tick occured after ${rightNow.valueOf() - lastTick.valueOf()} ms (average ${ns.nFormat(averageTick() / 1000, "0.0")}s)`);
    //tickQueue.push(rightNow.valueOf() - lastTick.valueOf());

    if (ns.gang.getGangInformation().territory < 0.99) { //testing to see if it'll still work or not
      if (msLastTick > (EXPECTEDTICKTIME - 1000)) {
        //We expect a tick in the next second
        //Begin Territorial Warfare
        //ns.tprint("Begin Territorial Warfare");
        for (let i = 0; i < members.length; ++i) {
          var member = members[i];
          var memberInfo = ns.gang.getMemberInformation(member);
          if (memberInfo.str >= 150) {
            ns.gang.setMemberTask(member, "Territory Warfare");
          }
        }
      }
    }
    if (ascentionCounter > 3000) { // 10 minutes
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

    await ns.sleep(200);
  }
}


// A Deep Equality Check is necessary to compare gang info.
function deepEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      areObjects && !deepEqual(val1, val2) ||
      !areObjects && val1 !== val2
    ) {
      return false;
    }
  }
  return true;
}

// Required by the Deep Equality Check
function isObject(object) {
  return object != null && typeof object === 'object';
}

// Trying to get more accurate ticks for bonus time
/*function averageTick() {
  //keeping the last 100 is definitely overkill BTW. 10 would probably be sufficient
  if (tickQueue.length > 10) {
    tickQueue = tickQueue.slice(-1, -5);
  }

  return (tickQueue.reduce((prev, curr) => {
    return prev + curr;
  }, 0) / tickQueue.length);

}*/