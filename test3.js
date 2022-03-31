/** @param {NS} ns **/
export async function main(ns) {
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
  function isObject(object) {
    return object != null && typeof object === 'object';
  }
  // Set these variables up outside of the while loop so they can persist between loops
  var lastTick = Date.now();
  var allTheGangStrengths = ns.gang.getOtherGangInformation();
  //await ns.sleep(40000);
  //var currentGangStrengths = ns.gang.getOtherGangInformation();
  //var tetradStr = ns.gang.getOtherGangInformation();
  //ns.tprint(allTheGangStrengths);
  //ns.tprint(currentGangStrengths);
  /*if (deepEqual(currentGangStrengths, allTheGangStrengths)) {
    ns.tprint("Not Different");
  }
  else {
    ns.tprint("Different");
  }*/
  //ns.tprint(allTheGangStrengths.Tetrads.power);

  while (true) {
      let rNow = Date.now();
      let currentGangStrengths = ns.gang.getOtherGangInformation();

      if (currentGangStrengths != allTheGangStrengths) {
          //Gang strengths have changed, so we just had a tick
          ns.tprint("A tick occured after " + (rNow - lastTick) + "ms");
          //make our last tick time (which persists between loops because it's defined ahead of the while loop)
          //equal to the current time 
          lastTick = rNow;
          //ditto with that gang strength thing
          allTheGangStrengths = currentGangStrengths;

          //DoStuffAtTheBeginningOfANewCycle();
      }

      //So the above can help you figure out when ticks happen
      //since we can predict them (because they're a regular interval)
      //then we can do some reasoning like

      //let timeSinceLastTickInMilliseconds = RIGHTNOW - lastTick;

      //if (timeSinceLastTickInMilliseconds < ( EXPECTEDTICKTIME - 1000)) {
          //We expect a tick in the next second
         //DoSomeStuffInAnticipationOfATick();
      //}

      await ns.sleep(200);
  }
}