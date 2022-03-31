/**
 * Finds the optimal server to hack and hacks it from all possible servers except home.
 * Only run from home server
 * @param {NS} ns **/
export async function main(ns) {
 
    var constantRam = ns.getScriptRam("hackAllServers_v2.js"); //grabbing script RAM values
    var hackscriptRam = ns.getScriptRam("hack.js");
    var growscriptRam = ns.getScriptRam("grow.js");
    var weakscriptRam = ns.getScriptRam("weak.js");
    var startTime = new Map();
    var waitingTime = new Map();
    var remainingTime = new Map();
    var gOffset = 10;
    var hOffset = 20;
 
    ns.disableLog('disableLog');
    ns.disableLog('sleep');
    ns.disableLog('getServerMoneyAvailable');
    ns.disableLog('getServerUsedRam');
    ns.disableLog('getServerMaxRam');
    ns.disableLog('getHackingLevel');
    ns.disableLog('getServerNumPortsRequired');
    ns.disableLog('getServerRequiredHackingLevel');
    ns.disableLog('getServerSecurityLevel');
    ns.disableLog('getServerMinSecurityLevel');
    ns.disableLog('getServerMaxMoney');
    ns.disableLog('scp');
    ns.disableLog('scan');
    ns.disableLog('exec');
 
    while (true) {
        // Get player informations
        var player = ns.getPlayer();
 
        // Finds all servers and clones grow hack and weak files
        var allServers = await findAllServers(ns);  
 
        // Finds and nukes optimal, hackable, and rootale servers.
        // Also provide us with the needed target server informations
        var multiarray = await findHackable(ns, allServers, player);
        var hackableServers = multiarray[0];
        var usableServers = multiarray[1]; //Sorted by Growth Potential in percents
        var target = multiarray[2];
        var fserver = multiarray[3];
        var WeakTime = multiarray[4];
        var GrowTime = multiarray[5];
        var HackTime = multiarray[6];
 
        for (let iTarget=0; iTarget < target.length ; iTarget++) {
            if (!remainingTime.has(target[iTarget])) {
                remainingTime.set(target[iTarget], 0);
            }
            if (remainingTime.get(target[iTarget]) <= 0) {
                // Targets
                ns.print('remainingTime')
                ns.print([...remainingTime.entries()])
 
                // Get info on the target[iTarget] server
                var cs = ns.getServerSecurityLevel(target[iTarget]);
                var ms = ns.getServerMinSecurityLevel(target[iTarget]);
                var mm = ns.getServerMaxMoney(target[iTarget]);
                var ma = ns.getServerMoneyAvailable(target[iTarget]);
 
                // Compute the sleep time
                var wsleep = 0; //At one point I made the weaken call sleep so I've kept it around
                var gsleep = (WeakTime[iTarget] - GrowTime[iTarget] - gOffset); //Getting the time to have the Growth execution sleep, then shaving some off to beat the weaken execution
                var hsleep = (WeakTime[iTarget] - HackTime[iTarget] - hOffset); //Getting time for hack, shaving off more to make sure it beats both weaken and growth
 
                // Get the number of rootable servers
                let nbusableServers = usableServers.length
 
                // Initialisation of the lists aimining to contain the numbers of threads to run latter
                var weakThreads = Array(nbusableServers).fill(0)
                var growThreads = Array(nbusableServers).fill(0)
                var hackThreads = Array(nbusableServers).fill(0)
                var maxRam = []
                var sumWeakThreads = 0
                var sumGrowThreads = 0
                var sumHackThreads = 0
                //var GrowthPotential = []
 
                // Compute the percentages of hack and grow with respect to the player and the target[target[iTarget]] server
                // 1 threads and 1 core is considered for the grow percentage calculation as it is conservative
                var HPercent = ns.formulas.hacking.hackPercent(fserver[iTarget], player)*100; // in %
                var GPercent = (ns.formulas.hacking.growPercent(fserver[iTarget], 1, player, 1) - 1)*100; // in % 
 
                // 1 thread of hack => 0.002 security increase
                // 1 thread of grow => 0.004 security increase
                // 1 thread of weak => 0.05 security decrease
                // Security eq: wt = 2/25 * gt + 2/50 * ht
                // We define the ratio 2, 25 and 50 as integer inverse partial derivative of the security equation
                var secdw = 2;
                var secdg = 25;
                var secdh = 50;
 
                // Loop on rootable servers to compute the number of threads to run
                for (let i = 0; i < nbusableServers; i++) {
                    //Priming the server.  Max money and Min security must be acheived for this to work
                    maxRam.push(ns.getServerMaxRam(usableServers[i]) - constantRam * (usableServers[i] == 'home') - ns.getServerUsedRam(usableServers[i])); //getting total RAM I can use that doesnt include the OP script
 
                    // Check if the following scritps are running already
                    var wIsRunning = ns.isRunning('weak.js', usableServers[i], target[iTarget], wsleep)
                    var gIsRunning = ns.isRunning('grow.js', usableServers[i], target[iTarget], gsleep)
                    var hIsRunning = ns.isRunning('hack.js', usableServers[i], target[iTarget], hsleep)
 
                    //To be put in the next version of the script
                    //We compute the growth potential of each server
                    //GrowthPotential.push(ns.hacking.formulas.GPercent(fserver[iTarget],Math.floor(maxRam[i]/growscriptRam),player,usableServers[i]["cpuCores"]))
 
                    // If security above min security, compute the number of threads needed to fully weak the target[iTarget] server
                    // If the number of threads exceed the number of threads that can be run on all servers, then the maximum of runnable threads are used
 
                    if (ms <= cs & !wIsRunning) {
                        // Compute the maximum number of threads needed to fully weak the target[iTarget] server
                        var maxWeakThreads = Math.ceil((ns.getServerSecurityLevel(target[iTarget]) - ns.getServerMinSecurityLevel(target[iTarget])) / 0.05) + 1
 
                        //We attribute the number of threads to run
                        weakThreads[i] = Math.max(Math.min(Math.floor(maxRam[i] / weakscriptRam), maxWeakThreads - sumWeakThreads),0);
                    }
 
                    // Using the security equation, one has to perform secdw threads of weak for secdg thread of grow
                    // in order for the security to stay at the minimum
                    // We prioritize the number of weakThreads to avoid increasing security over time
 
                    if (ma < mm & cs == ms & !gIsRunning & !wIsRunning) {
                        //We first complete the Weak Threads bundle of secdw, if it is not yet complete
                        let nbCompleteWeakThreads = Math.min(
                            Math.floor(maxRam[i] / weakscriptRam),
                            secdw - sumWeakThreads % secdw
                        )
                        let remainingRam = maxRam[i] - nbCompleteWeakThreads * weakscriptRam
 
                        //We then complete the Grow Threads bundle of secdg, if it is not yet complete, that we can run with the remaining RAM
                        let nbCompleteGrowThreads = Math.min(
                            Math.floor(remainingRam / growscriptRam),
                            secdg - sumGrowThreads % secdg
                        )
                        remainingRam -= nbCompleteGrowThreads * growscriptRam
 
                        //We compute the number of couple of secdw weak threads and secdg grow threads, that we can run with the remaining RAM
                        let nbCouple = Math.floor(remainingRam / (secdw * weakscriptRam + secdg * growscriptRam))
                        remainingRam -= nbCouple * (secdw * weakscriptRam + secdg * growscriptRam)
 
                        //We compute the number of Weak Threads, that we can run with the remaining RAM
                        let nbAddWeakThreads = Math.min(
                            secdw,
                            Math.floor(remainingRam / weakscriptRam)
                        )
                        remainingRam -= nbAddWeakThreads * weakscriptRam
 
                        //We compute the number of Grow Threads, that we can run with the remaining RAM
                        let nbAddGrowThreads = Math.min(
                            secdg,
                            Math.floor(remainingRam / growscriptRam)
                        )
                        remainingRam -= nbAddGrowThreads * growscriptRam
 
                        //We calculate the total number of Threads to run by the server 'usableServers[i]'
                        var serveurPercent = fserver[iTarget]['moneyAvailable'] / fserver[iTarget]['moneyMax'];
                        var maxgrowThreads = Math.ceil(Math.log(1/serveurPercent)/Math.log(GPercent/100+1)) + 1;  //Getting the amount of threads I need to grow to 100% of the funds
                        var maxweakThreads = Math.ceil(maxgrowThreads / secdg * secdw) + 1;
 
                        //We attribute the number of threads to run
                        weakThreads[i] = Math.max(Math.min(nbCouple * secdw + nbAddWeakThreads + nbCompleteWeakThreads, maxweakThreads - sumWeakThreads),0)
                        growThreads[i] = Math.max(Math.min(nbCouple * secdg + nbAddGrowThreads + nbCompleteGrowThreads, maxgrowThreads - sumGrowThreads),0)
                    }
 
                    // 1 thread of hack => 0.002 security increase
                    // 1 thread of grow => 0.004 security increase
                    // 1 thread of weak => 0.05 security decrease
                    // Security eq: wt = secdw/secdg gt + secdw/secdh ht
                    // With :
                    //  var secdw = 2;
                    //  var secdg = 25;
                    //  var secdh = 50;
                    // The optimal hack percentage for a unique targeted server equals 50%, thus implying an 100% grow
                    // Going further is sub optimal in every case
                    // Going below can be imposed by the total level of RAM
                    // The total grow percent (gP) and total hack percent (hP*ht) have to respect the following inequality
                    // Money eq: (1+gP)(1-hP*ht)>1
                    // One take gP in order to obtain slightly above 100% of funds
                    // By taking gP = 2*hP*ht, the inequality above is satisfied
                    // Since gP with multiple threads, or cores increases fast than the linear function gP*gt with gP computed for 1 thread and 1 core
                    // Taking gP(1,1)*gt = 2*hP*ht is conservative
                    // Money eq: gt = 2 * hP/gP * ht
                    // We define the ratio :
                    // moneydh = 2 * hP/gP
                    // The last equation to consider is the RAM equation:
                    // ht * hRAM + gt * gRAM + wt * wRAM = RAM
                    // From those equations, one can get the following decoupled system
                    // ht = RAM / ( hRam + secdw * hP/gP * gRAM + secdw/secdh * (1 + secdh/secdg * moneydh) * wRAM)
                    // gt = moneydh * ht
                    // wt = secdw/secdg gt + secdw/secdh ht
                    // From those equations, the ratios of ht, gt and wt can be obtained
 
                    if (ma == mm & cs == ms & !hIsRunning & !gIsRunning & !wIsRunning) {
                        //var nbCores = usableServers[i]["cpuCores"]
                        //var GPercent = ns.formulas.hacking.growPercent(fserver[iTarget],1,player,nbCores)*100;
 
                        //To be put in the next version of the script
                        //var targetGPercent = 100
                        //var minGrowThreads = getGThreads(fserver[iTarget],player,nbCores,targetGPercent);  //The growPercent being non-linear in threads, we compute the amout of threads to grow 100% of the funds using a algorithm
                        //var minWeakThreads = Math.round(minGrowThreads*secdw/secdg + hackThreads*secdw/secdh); //Getting required threads to fully weak the server
 
                        // The initial ratios are the following:
                        // growRatio = moneydh
                        // hackRatio = 1
                        // weakRatio = secdw/secdh * ( 1 + secdh/secdg * moneydh )
                        // We want to take a conservative number of weak threads number, and none conservative number of hack threads
                        // To do so, one need to have growRatio as an integer
                        // So, we multiply the ratios by 1/moneydh, the following ratios are obtained:
                        // weakRatio = secdw/secdh * ( 1/ moneydh + secdh/secdg)
                        // hackRatio = 1/ moneydh
                        // growRatio = 1
                        // As, for now, moneydh = 2 * hP/gP, secdw = 2 and secdh = 50 = 2 * secdg = 2 * 25, I multiple the ratios by secdh
                        // And we obtain the following weak, grow , hack ratios:
                        var invmoneydh = GPercent / (2 * HPercent)
                        var weakRatio = secdw * (invmoneydh + secdh / secdg)    // Equals to (GHRatio + 4)
                        var growRatio = secdh                                   // Equals to 50
                        var hackRatio = secdh * invmoneydh                      // Equals to 25 * GHRatio
 
                        // We normalize the ratios, in order for the minimum of those to be equal to 1
                        let min = Math.min(weakRatio, growRatio, hackRatio)
                        var weakRatio = weakRatio / min
                        var growRatio = growRatio / min
                        var hackRatio = hackRatio / min
 
                        // We normalize the ratios, in order for growRatio to be the next integer
                        var weakRatio = Math.ceil(weakRatio / growRatio * Math.ceil(growRatio)) + 1
                        var growRatio = Math.ceil(growRatio) + 1
                        var hackRatio = Math.floor(hackRatio / growRatio * Math.ceil(growRatio))
 
                        //We first complete the Weak Threads bundle of weakRatio, if it is not yet complete
                        let nbCompleteWeakThreads = Math.min(
                            Math.floor(maxRam[i] / weakscriptRam),
                            Math.ceil(weakRatio) - sumWeakThreads % Math.ceil(weakRatio)
                        )
                        let remainingRam = maxRam[i] - nbCompleteWeakThreads * weakscriptRam
 
                        //We then complete the Grow Threads bundle of growRatio, if it is not yet complete, that we can run with the remaining RAM
                        let nbCompleteGrowThreads = Math.min(
                            Math.floor(remainingRam / growscriptRam),
                            growRatio - sumGrowThreads % growRatio
                        )
                        remainingRam -= nbCompleteGrowThreads * growscriptRam
 
                        //We then complete the Hack Threads bundle of hackRatio, if it is not yet complete, that we can run with the remaining RAM
                        let nbCompleteHackThreads = Math.min(
                            Math.floor(remainingRam / hackscriptRam),
                            Math.floor(hackRatio) - sumHackThreads % Math.floor(hackRatio)
                        )
                        remainingRam -= nbCompleteHackThreads * hackscriptRam
 
                        //We compute the number of triple of hack, grow, weak threads, that we can run with the remaining RAM
 
                        //if (remainingRam - growscriptRam - weakscriptRam > 0) {
                        //    var hackCouple = Math.floor(
                        //        (remainingRam - growscriptRam - weakscriptRam)  / (hackscriptRam + (growRatio / hackRatio) * growscriptRam + (weakRatio / hackRatio) * weakscriptRam)
                        //    )
                        //    var growCouple = Math.floor((growRatio / hackRatio) * hackCouple) + 1
                        //    var weakCouple = Math.floor(secdw / secdg * growCouple + secdw / secdh * hackCouple) + 1
                        //}
                        //else {
                        //    var hackCouple = 0
                        //    var growCouple = 0
                        //    var weakCouple = 0
                        //}
                        var hackCouple = Math.floor(
                            (remainingRam)  / (hackscriptRam + (growRatio / hackRatio) * growscriptRam + (weakRatio / hackRatio) * weakscriptRam)
                        )
                        var growCouple = Math.ceil((growRatio / hackRatio) * hackCouple)
                        var weakCouple = Math.ceil(secdw / secdg * growCouple + secdw / secdh * hackCouple)
                        remainingRam -= hackCouple * hackscriptRam + growCouple * growscriptRam + weakCouple * weakscriptRam
 
                        //We compute the number of Weak Threads, that we can run with the remaining RAM
                        let nbAddWeakThreads = Math.min(
                            Math.floor(remainingRam / weakscriptRam),
                            Math.ceil(weakRatio)
                        )
                        remainingRam -= nbAddWeakThreads * weakscriptRam
 
                        //We compute the number of Grow Threads, that we can run with the remaining RAM
                        let nbAddGrowThreads = Math.min(
                            Math.floor(remainingRam / growscriptRam),
                            Math.ceil(growRatio)
                        )
                        remainingRam -= nbAddGrowThreads * growscriptRam
 
                        //We compute the number of Hack Threads, that we can run with the remaining RAM
                        let nbAddHackThreads = Math.min(
                            Math.floor(hackRatio),
                            Math.floor(remainingRam / hackscriptRam)
                        )
                        remainingRam -= nbAddHackThreads * hackscriptRam
 
                        //We calculate the total number of Threads to run by the server 'usableServers[i]'
                        var maxhackThreads = Math.floor(50 / HPercent);  //Getting the amount of threads I need to hack 50% of the funds
                        var maxgrowThreads = Math.ceil(Math.log(2)/Math.log(GPercent/100+1)) + 1;  //Getting the amount of threads I need to grow back to 100% of the funds to be conservative
                        var maxweakThreads = Math.ceil(maxgrowThreads / secdg * secdw) + Math.ceil(maxhackThreads / secdh * secdw) + 1 //Getting the amount of threads I need to bring back security to minimum
 
                        //We attribute the number of threads to run
                        weakThreads[i] = ( 
                            Math.max(
                                Math.min(
                                    nbCompleteWeakThreads + weakCouple + nbAddWeakThreads,
                                    maxweakThreads - sumWeakThreads
                                ),
                                0
                            )
                        )
                        growThreads[i] = (
                            Math.max(
                                Math.min(
                                    nbCompleteGrowThreads + growCouple + nbAddGrowThreads,
                                    maxgrowThreads - sumGrowThreads
                                ),
                                0
                            )
                        )
                        hackThreads[i] = (
                            Math.max(
                                Math.min(
                                    nbCompleteHackThreads + hackCouple + nbAddHackThreads,
                                    maxhackThreads - sumHackThreads
                                ),
                                0
                            )
                        )
                    }
                    //We update the sum of threads to run
                    sumWeakThreads += weakThreads[i]
                    sumGrowThreads += growThreads[i]
                    sumHackThreads += hackThreads[i]
                }
                // Starting by fully weaking the server target[iTarget] untill security minimized
                if (ms < cs & sumWeakThreads != 0) {
                    ns.print('[STARTED] @ N° ' + (iTarget + 1) + '/' + target.length + ' : ' + target[iTarget] + ' at ' + startTime.get(target[iTarget]));
                    ns.print('Weak')
                    ns.print(weakThreads)
                    // Start Time
                    startTime.set(target[iTarget], performance.now())
                    // Waiting Time
                    waitingTime.set(target[iTarget], WeakTime[iTarget] + 100);
                    for (let i = 0; i < nbusableServers; i++) {
                        // Run the script to weak the server
                        if (weakThreads[i] > 0) {
                            ns.exec("weak.js", usableServers[i], weakThreads[i], target[iTarget], wsleep);
                        }
                    }
                    ns.print(' ')
                }
                // Then, growing and weaking in parallel the target[iTarget] server untill money maxed
                if (ma < mm & cs == ms & sumGrowThreads != 0) {
                    ns.print('[STARTED] @ N° ' + (iTarget + 1) + '/' + target.length + ' : ' + target[iTarget] + ' at ' + startTime.get(target[iTarget]));
                    ns.print('Grow and Weak')
                    ns.print(growThreads)
                    ns.print(weakThreads)
                    // Start Time
                    startTime.set(target[iTarget], performance.now())
                    // Waiting Time
                    waitingTime.set(target[iTarget], Math.max(WeakTime[iTarget], GrowTime[iTarget] + gOffset) + 100);
                    for (let i = 0; i < nbusableServers; i++) {
                        // We run the grow threads first on the rootable servers sorted with decreasing amount of growth potential
                        if (growThreads[i] > 0) {
                            ns.exec("grow.js", usableServers[i], growThreads[i], target[iTarget], gsleep);
                        }
                        if (weakThreads[i] > 0) {
                            ns.exec("weak.js", usableServers[i], weakThreads[i], target[iTarget], wsleep);
                        }
                    }
                    ns.print(' ')
                }
                if (ma == mm & cs == ms & sumHackThreads != 0) {
                    ns.print('[STARTED] N° ' + (iTarget + 1) + '/' + target.length + ' : ' + target[iTarget] + ' at ' + startTime.get(target[iTarget]));
                    ns.print('Hack, Grow and Weak')
                    ns.print(hackThreads)
                    ns.print(growThreads)
                    ns.print(weakThreads)
                    // Start Time
                    startTime.set(target[iTarget], performance.now())
                    // Waiting Time
                    waitingTime.set(target[iTarget], Math.max(WeakTime[iTarget], GrowTime[iTarget] + gOffset, HackTime[iTarget] + hOffset) + 100);
                    for (let i = 0; i < nbusableServers; i++) {
                        // Finally, hacking, growing and weaking in parallel
                        // The, hack triger first, then the growing the the weakning
                        // For each run of this part:
                        // - the server must go back to max money after the grow script triggering
                        // - the server must go back to min security level after the weak script triggering
 
                        // We run the grow threads first on the rootable servers sorted with decreasing amount of growth potential
                        if (hackThreads[i] > 0) {
                            ns.exec("hack.js", usableServers[i], hackThreads[i], target[iTarget], hsleep);
                        }
                        if (growThreads[i] > 0) {
                            ns.exec("grow.js", usableServers[i], growThreads[i], target[iTarget], gsleep);
                        }
                        if (weakThreads[i] > 0) {
                            ns.exec("weak.js", usableServers[i], weakThreads[i], target[iTarget], wsleep);
                        }
                    }
                    ns.print(' ')
                }
            }
            var time = performance.now()
            if (waitingTime.get(target[iTarget]) != null & startTime.get(target[iTarget]) != null) {
                remainingTime.set(target[iTarget], waitingTime.get(target[iTarget]) - (time - startTime.get(target[iTarget])))
            }
            await ns.sleep(0);
        }
        await ns.sleep(200);
    }
}
 
/**
* Copies files in file list to all servers and returns an array of all servers
*/
async function findAllServers(ns) {
    const fileList = ["hack.js", "weak.js", "grow.js"];   //These files just infinitely hack, weak, and grow respectively.
    var q = [];
    var serverDiscovered = [];
 
    q.push("home");
    serverDiscovered["home"] = true;
 
    while (q.length) {
        let v = q.shift();
 
        let edges = ns.scan(v);
 
        for (let i = 0; i < edges.length; i++) {
            if (!serverDiscovered[edges[i]]) {
                serverDiscovered[edges[i]] = true;
                q.push(edges[i]);
                await ns.scp(fileList, "home", edges[i]);
            }
        }
    }
    return Object.keys(serverDiscovered);
}
 
/**
* Finds list of all hackable and all rootable servers. Also finds optimal server to hack.
* A hackable server is one which you can hack, grow, and weak.
* A rootable server is one which you can nuke.
* Returns a 2d array with list of hackable, rootable, and the optimal server to hack
*/
async function findHackable(ns, allServers, player) {
    var hackableServers = [];
    var usableServers = [];
    var numPortsPossible = 0;
 
    if (ns.fileExists("BruteSSH.exe", "home")) {
        numPortsPossible += 1;
    }
    if (ns.fileExists("FTPCrack.exe", "home")) {
        numPortsPossible += 1;
    }
    if (ns.fileExists("RelaySMTP.exe", "home")) {
        numPortsPossible += 1;
    }
    if (ns.fileExists("HTTPWorm.exe", "home")) {
        numPortsPossible += 1;
    }
    if (ns.fileExists("SQLInject.exe", "home")) {
        numPortsPossible += 1;
    }
 
 
    for (let i = 0; i < allServers.length; i++) {
        //if your hacking level is high enough and you can open enough ports, add it to hackable servers list
        if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(allServers[i]) && numPortsPossible >= ns.getServerNumPortsRequired(allServers[i])) {
            hackableServers.push(allServers[i]);
        }
        //if it isn't home(this makes sure that you don't kill this script) and you either 
        //already have root access(this is useful for servers bought by the player as you have access to those even if the security is higher than you can nuke)
        //  or you can open enough ports
        let freeRam = ns.getServerMaxRam(allServers[i]) - ns.getServerUsedRam(allServers[i])
        if ((ns.hasRootAccess(allServers[i]) || (numPortsPossible >= ns.getServerNumPortsRequired(allServers[i]))) & freeRam > 0) {
            usableServers.push(allServers[i]);
            //if you don't have root access, open ports and nuke it
            if (!ns.hasRootAccess(allServers[i])) {
                if (ns.fileExists("BruteSSH.exe")) {
                    ns.brutessh(allServers[i]);
                }
                if (ns.fileExists("FTPCrack.exe")) {
                    ns.ftpcrack(allServers[i]);
                }
                if (ns.fileExists("RelaySMTP.exe")) {
                    ns.relaysmtp(allServers[i]);
                }
                if (ns.fileExists("HTTPWorm.exe")) {
                    ns.httpworm(allServers[i]);
                }
                if (ns.fileExists("SQLInject.exe")) {
                    ns.sqlinject(allServers[i]);
                }
                ns.nuke(allServers[i]);
            }
        }
    }
 
    //finds optimal server to hack
    let optimalServerInfos = await findOptimals(ns, hackableServers, player);
    return [hackableServers, usableServers, ...optimalServerInfos];
}
 
/** 
 * Finds the best server to hack.
 * The algorithm works by assigning a value to each server and returning the max value server.
 * The value is the serverMaxMoney divided by the sum of the server's weak time, grow time, and hack time.
 * You can easily change this function to choose a server based on whatever optimizing algorithm you want,
 *  just return the server name to hack.
*/
async function findOptimals(ns, hackableServers, player) {
 
    let optimalServer = "n00dles";
    let optimalfserver = ns.getServer(optimalServer)
    let optimalWeakTime = ns.formulas.hacking.weakenTime(optimalfserver, player);
    let optimalGrowTime = ns.formulas.hacking.growTime(optimalfserver, player);
    let optimalHackTime = ns.formulas.hacking.hackTime(optimalfserver, player);
 
    let optimalServers = [];
    let optimalfservers = [];
    let optimalWeakTimes = [];
    let optimalGrowTimes = [];
    let optimalHackTimes = [];
    let currVal;
    let currTime;
    var optimalIndex;
    let hackableServersLength = hackableServers.length
 
    while (hackableServersLength > 0) {
        let optimalVal = 0;
        for (var j = 0; j < hackableServersLength; j++) {
            var fserver = ns.getServer(hackableServers[j]);
            var WeakTime = ns.formulas.hacking.weakenTime(fserver, player);
            var GrowTime = ns.formulas.hacking.growTime(fserver, player);
            var HackTime = ns.formulas.hacking.hackTime(fserver, player);
            currVal = fserver["moneyMax"]
            currVal *= ns.formulas.hacking.hackChance(fserver, player)
            currTime = Math.max(WeakTime, GrowTime, HackTime);
            currVal /= currTime;
            if (currVal >= optimalVal) {
                optimalIndex  = j
                optimalVal = currVal;
                optimalServer = hackableServers[j];
                optimalfserver = fserver
                optimalWeakTime = WeakTime
                optimalGrowTime = GrowTime
                optimalHackTime = HackTime
            }
        }
        if (optimalVal == 0) {
            break
        }
        hackableServers.splice(optimalIndex,1)
        optimalServers.push(optimalServer)
        optimalfservers.push(optimalfserver)
        optimalWeakTimes.push(optimalWeakTime)
        optimalGrowTimes.push(optimalGrowTime)
        optimalHackTimes.push(optimalHackTime)
        --hackableServersLength
    }
    return [optimalServers, optimalfservers, optimalWeakTimes, optimalGrowTimes, optimalHackTimes];
}
 
function sum(ns, arr) {
    var sum = 0
    for (let i = 0; i < arr.length; i++) {
        ns.print(arr[i])
        sum += arr[i]
    }
    return sum
}
 
//function getGThreads(fserver, player, nbCores, targetGPercent) {
//    var GThreads = 0
//    while (GPercent < targetGPercent) {
//        GThreads += 1
//        var GPercent = ns.formulas.hacking.growPercent(fserver, GThreads, player, nbCores);
//    }
//    return GTreads
//}