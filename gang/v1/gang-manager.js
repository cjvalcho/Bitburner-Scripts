/** @param {NS} ns **/
export async function main(ns) {
  // Set these variables up outside of the while loop so they can persist between loops
  var lastTick = Date.now(); // The Last Tick
  var allGangStr = ns.gang.getOtherGangInformation();
  var tickQueue = [];
  var EXPECTEDTICKTIME = 700;

  while (true) {
    let rNow = Date.now(); // The Current Time
    let curGangStr = ns.gang.getOtherGangInformation();

    if (!gangsEqual(curGangStr, allGangStr)) {
      //if (!deepEqual(curGangStr, allGangStr)) {
      // Gang strengths have changed, so we just had a tick
      ns.tprint("A tick occured after " + (rNow - lastTick) + "ms");
      // Make our last tick time (which persists between loops because it's defined ahead of the while loop)
      // equal to the current time 
      lastTick = rNow;
      // Ditto with that gang strength thing
      allGangStr = curGangStr;

      // Begin normal tasks
      ns.tprint("Beginning normal tasks");
    }

    //So the above can help you figure out when ticks happen
    //since we can predict them (because they're a regular interval)
    //then we can do some reasoning like

    let msLastTick = rNow - lastTick; // Time since the last tick in ms

    if (msLastTick > (EXPECTEDTICKTIME - 1000)) {
      //We expect a tick in the next second
      //Begin Territorial Warfare
      ns.tprint("Begin Territorial Warfare");
      //ns.tprint("The sime since the last tick " + msLastTick + "ms");
    }

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

function gangsEqual(gangs1, gangs2) {
  for (const key in gangs2) {
    const gang1 = gangs1[key];
    if (!gang1) return false;
    const gang2 = gangs2[key];
    if (gang1.power !== gang2.power || gang1.territory !== gang2.territory)
      return false;
  }
  return true;
}

function averageTick() {
    //keeping the last 100 is definitely overkill BTW. 10 would probably be sufficient
    if (tickQueue.length > 100) {
        tickQueue = tickQueue.slice(-1, -50);
    }

    return (tickQueue.reduce((prev, curr) => {
        return prev + curr;
    }, 0) / tickQueue.length);
}