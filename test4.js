/** @param {NS} ns **/

const WTT_LENGTH = 10;
var warfareTickTracker = {
  tickLog: Uint32Array.from({ length: WTT_LENGTH }, (_) => Date.now()),
  tickLogEnd: 0,
  lastTickTime: Date.now(),
  expectedTime: Date.now() + 19000, // sane initial delay, a bit earlier than desired
  safetyMargin: 300,
  handled: false,
  lastGangsInfo: null,
  getAvg() { return this.tickLog.reduce((a, b) => a + b, 0) / this.tickLog.length },
  hasTickHappened(ns) {
    let curGangsInfo = ns.gang.getOtherGangInformation();
    let hasTicked = !gangsEqual(curGangsInfo, this.lastGangsInfo);
    this.lastGangsInfo = curGangsInfo;
    return hasTicked;
  },
  shouldPrep(ns) { return !this.handled && Date.now() + this.safetyMargin > this.expectedTime },
  logTick(ns) {
    ns.tprint("Territorial Warfare Tick occured");
    if (!this.handled)
      ns.tprint("We were not prepared for the tick");
    // calculate times
    let curT = Date.now();
    let deltaT = curT - this.lastTickTime;
    this.lastTickTime = curT;
    // log new entry
    ns.tprint("A tick occured after " + deltaT + "ms");
    this.tickLog[this.tickLogEnd] = deltaT;
    this.tickLogEnd = (this.tickLogEnd + 1) % WTT_LENGTH;
    // calculate expected timestamp
    this.expectedTime = Date.now() + this.getAvg();
    // reset tracker
    this.handled = false;
  },
}

function beforeGangTick(ns) {
  ns.tprint("Begin Territorial Warfare");
  // set up whatever you need ready for the gang tick
  warfareTickTracker.handled = true;
}

function afterGangTick(ns) {
  warfareTickTracker.logTick(ns);
}

export async function main(ns) {
  // snip

  while (true) {
    if (warfareTickTracker.hasTickHappened(ns)) {
      afterGangTick(ns);
    }

    if (warfareTickTracker.shouldPrep(ns)) {
      beforeGangTick(ns);
    }

    await ns.sleep(200);
  }
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