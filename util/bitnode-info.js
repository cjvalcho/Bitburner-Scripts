/** @param {NS} ns **/
export async function main(ns) {
	var mults = ns.getBitNodeMultipliers();

	const row = '%-30s | %8s';
	ns.tprintf(row, '-COMBAT', 'MULTI');
	ns.tprintf(row, '---------', '-------');
	ns.tprintf(row, 'Strength', mults.StrengthLevelMultiplier);
	ns.tprintf(row, 'Defense', mults.DefenseLevelMultiplier);
	ns.tprintf(row, 'Dexterity', mults.DexterityLevelMultiplier);
	ns.tprintf(row, 'Agility', mults.AgilityLevelMultiplier);
	ns.tprintf(row, 'Charisma', mults.CharismaLevelMultiplier);
	ns.tprintf(row, 'Gym Exp', mults.ClassGymExpGain);
	ns.tprintf(row, 'Crime Exp', mults.CrimeExpGain);
	ns.tprintf(row, 'Crime Money', mults.CrimeMoney);	
	ns.tprintf(row, 'Infiltration Money', mults.InfiltrationMoney);
	ns.tprintf(row, 'Infiltration Rep', mults.InfiltrationRep);
	ns.tprintf(row, '-HACKING', 'MULTI');
	ns.tprintf(row, '---------', '-------');
	ns.tprintf(row, 'Hacking', mults.HackingLevelMultiplier);
	ns.tprintf(row, 'Hacking Exp', mults.HackExpGain);
	ns.tprintf(row, 'Script Hack Drain', mults.ScriptHackMoney);
	ns.tprintf(row, 'Script Hack Income', mults.ScriptHackMoneyGain);
	ns.tprintf(row, 'Server Growth Rate', mults.ServerGrowthRate);
	ns.tprintf(row, 'Server Max Money', mults.ServerMaxMoney);
	ns.tprintf(row, 'Server Starting Money', mults.ServerStartingMoney);
	ns.tprintf(row, 'Server Starting Security', mults.ServerStartingSecurity);
	ns.tprintf(row, 'Server Weaken Rate', mults.ServerWeakenRate);
	ns.tprintf(row, 'World Daemon Difficulty', mults.WorldDaemonDifficulty);
	ns.tprintf(row, '-SERVERS', 'MULTI');
	ns.tprintf(row, '---------', '-------');	
	ns.tprintf(row, 'Home RAM Cost', mults.HomeComputerRamCost);
	ns.tprintf(row, 'Purchased Server Cost', mults.PurchasedServerCost);
	ns.tprintf(row, 'Purchased Server Limit', mults.PurchasedServerLimit);
	ns.tprintf(row, 'Purchased Server Max RAM', mults.PurchasedServerMaxRam);
	ns.tprintf(row, 'Purchased Server Soft Cap', mults.PurchasedServerSoftcap);
	ns.tprintf(row, '-FACTIONS', 'MULTI');
	ns.tprintf(row, '---------', '-------');
	ns.tprintf(row, 'Company Exp', mults.CompanyWorkExpGain);
	ns.tprintf(row, 'Company Income', mults.CompanyWorkMoney);
	ns.tprintf(row, 'Faction Exp', mults.FactionWorkExpGain);
	ns.tprintf(row, 'Faction Passive Rep', mults.FactionPassiveRepGain);
	ns.tprintf(row, 'Faction Active Rep', mults.FactionWorkRepGain);
	ns.tprintf(row, 'Donate Rep Req.', mults.RepToDonateToFaction);
	ns.tprintf(row, '-UNLOCKS', 'MULTI');
	ns.tprintf(row, '---------', '-------');
	ns.tprintf(row, 'Bladeburner Rank', mults.BladeburnerRank);
	ns.tprintf(row, 'Bladeburner Skill', mults.BladeburnerSkillCost);
	ns.tprintf(row, 'Corporation Value', mults.CorporationValuation);
	ns.tprintf(row, 'Gang Soft Cap', mults.GangSoftcap);
	ns.tprintf(row, '4S API Cost', mults.FourSigmaMarketDataApiCost);
	ns.tprintf(row, '4S Data Cost', mults.FourSigmaMarketDataCost);
	ns.tprintf(row, 'Hacknet Income', mults.HacknetNodeMoney);
	ns.tprintf(row, '-AUGMENTATION', 'MULTI');
	ns.tprintf(row, '---------', '-------');
	ns.tprintf(row, 'Augmentation Cost', mults.AugmentationMoneyCost);
	ns.tprintf(row, 'Augmentation Rep', mults.AugmentationRepCost);
	ns.tprintf(row, 'Daedalus Augment Req.', mults.DaedalusAugsRequirement);
	ns.tprintf(row, 'Staneks Gift Size', mults.StaneksGiftExtraSize);
	ns.tprintf(row, 'Staneks Gift Power', mults.StaneksGiftPowerMultiplier);
}