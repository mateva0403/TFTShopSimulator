const tierStarter = {
    1: {amount: 30, units: ["Zyra", "Vi", "Sylas", "Shaco", "Seraphine", "Poppy", "Nidalee", "Morgana", "Kog'Maw", "Kindred", "Jax", "Dr. Mundo", "Alistar"]},
    2: {amount: 25, units: ["Veigar", "Vayne", "Twisted Fate", "Skarner", "Rhaast", "Naafiri", "LeBlanc", "Jhin", "Illaoi", "Graves", "Ekko", "Darius"]},
    3: {amount: 18, units: ["Yuumi", "Varus", "Senna", "Rengar", "Mordekaiser", "Jinx", "Jarvan IV", "Gragas", "Galio", "Fiddlesticks", "Elise", "Draven", "Braum"]},
    4: {amount: 10, units: ["Ziggs", "Zeri", "Zed", "Xayah", "Vex", "Sejuani", "Neeko", "Miss Fortune", "Leona", "Cho'Gath", "Brand", "Aphelios", "Annie"]},
    5: {amount: 9, units: ["Zac", "Viego", "Urgot", "Samira", "Renekton", "Kobuko", "Garen", "Aurora"]}
};

const shopProbabilities = {
    2: {tier1: 100, tier2: 0, tier3: 0, tier4: 0, tier5: 0},
    3: {tier1: 75, tier2: 25, tier3: 0, tier4: 0, tier5: 0},
    4: {tier1: 55, tier2: 30, tier3: 15, tier4: 0, tier5: 0},
    5: {tier1: 45, tier2: 33, tier3: 20, tier4: 2, tier5: 0},
    6: {tier1: 30, tier2: 40, tier3: 25, tier4: 5, tier5: 0},
    7: {tier1: 19, tier2: 30, tier3: 40, tier4: 10, tier5: 1},
    8: {tier1: 17, tier2: 24, tier3: 32, tier4: 24, tier5: 3},
    9: {tier1: 15, tier2: 18, tier3: 25, tier4: 30, tier5: 12},
    10: {tier1: 5, tier2: 10, tier3: 20, tier4: 40, tier5: 35}
}

const unitColors = { 1: "silver", 2: "green", 3: "blue", 4: "purple", 5: "gold" }
var currLevel = 2;
const unitPool = {

    tier1Pool:{},
    tier2Pool:{},
    tier3Pool:{},
    tier4Pool:{},
    tier5Pool:{},
    
    populate() {
        for(const [tier, { amount, units }] of Object.entries(tierStarter)) {
            units.forEach(unit => {
                this[`tier${tier}Pool`][unit] = amount;
            });
        }
    },
    
    purchaseUnit(unitName, tier) {
        if((tierStarter[tier].units).includes(unitName) === false) {
            return false;
        }
        else {
            this[`tier${tier}Pool`][unitName] -= 1;
        }
    },

    rollTier(probabilities) {
        const rand = Math.floor(Math.random() * (101 - 1) + 1);
        let cumulative = 0;

        for (const [tierKey, chance] of Object.entries(probabilities)) {
            cumulative += chance;
            if (rand < cumulative) {
                return Number(tierKey.replace("tier", ""));
            }
        }
    return null;
    },

    rollUnit(tier) {
        const pool = this[`tier${tier}Pool`];
        if (!pool) return null;

        const availableUnits = Object.entries(pool).filter(([unit, count]) => count > 0);
        if (availableUnits.length === 0) return null;

        const [unitName] = availableUnits[Math.floor(Math.random()* availableUnits.length)];
        return unitName;
    }
}

const shopDisplay = [];
const shopDisplayTier = [];
const ownedUnits = {};

function populateShop() {

    shopDisplay.length = 0;
    shopDisplayTier.length = 0;

    for(let i = 1; i < 6; i++) {
    tempTier = unitPool.rollTier(shopProbabilities[currLevel]);
    shopDisplay.push(unitPool.rollUnit(tempTier));
    shopDisplayTier.push(tempTier);

    let currSlot = i;
    let slotID = `slot${i}`;
    
    let elemSlot = document.getElementById(slotID);
    let slotUnitName = elemSlot.getElementsByTagName("h4");
    let slotUnitColor = elemSlot.getElementsByClassName("unit-name");

    // CLEAR SHOP ELEMENTS
    elemSlot.classList.remove("purchased");
    elemSlot.style.opacity = "1";

    elemSlot.style.borderColor = unitColors[tempTier];
    slotUnitColor[0].style.backgroundColor = unitColors[tempTier];
    slotUnitName[0].innerHTML = shopDisplay[i - 1];
    elemSlot.style.backgroundImage = `url('assets/${shopDisplay[i - 1].toLowerCase().replace(/'/g, "")}.png')`;

    }
}

function purchaseFromSlot(slotIndex) {
    
    let unitName = shopDisplay[slotIndex - 1];
    let unitTier = shopDisplayTier[slotIndex - 1];
    if (!unitName || !unitTier) return null;

    let elemSlot = document.getElementById(`slot${slotIndex}`);

    if (elemSlot.classList.contains("purchased")) return;
    unitPool.purchaseUnit(unitName, unitTier);

    elemSlot.classList.add("purchased");
    elemSlot.style.opacity = "0.1";
    
    // ADD TO OWNED UNITS
    if(!(unitName in ownedUnits)) { 
        ownedUnits[unitName] = 0; 
    }
    ownedUnits[unitName] += 1;
    
    let elemUnitList = document.getElementById("owned-units");
    elemUnitList.innerHTML = "";

    for (const unit in ownedUnits) {
        let listText = document.createTextNode(`${unit}: ${ownedUnits[unit]}`);
        let unitNode = document.createElement('li');
    
        unitNode.classList.add("unit-listing")
        unitNode.appendChild(listText)
        elemUnitList.appendChild(unitNode)
    }
}

function levelUp() {
    if (currLevel < 11) {
        currLevel += 1;
        console.log(currLevel)
    }
    document.getElementById("level").innerHTML = `Level: ${currLevel}`
}

document.addEventListener("DOMContentLoaded", () => {
    unitPool.populate();
    populateShop();
    document.getElementById("reroll-button").addEventListener("click", populateShop);
    document.getElementById("level-button").addEventListener("click", levelUp);
    document.getElementById("level").innerHTML = `Level: ${currLevel}`

    for (let i = 1; i <= 5; i++) {
        const slotClickable = document.getElementById(`slot${i}`);
        slotClickable.addEventListener("click", () => purchaseFromSlot(i));
    }
});