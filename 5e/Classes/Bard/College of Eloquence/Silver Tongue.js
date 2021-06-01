//##############################################
// Read First!!!!!!!!!!!!!!!!!
// Midi-qol "On Use" macro
// Thanks to Kekilla for the clean dialog
// Original version from Crymic
// changes to Crymics version
// - fix for mido-qol option GM-only saves
// - fix for skill bonus added (+ was missing in formula and it was in the wrong place) 
//#############################################
(async()=>{
let actorD = game.actors.get(args[0].actor._id);
let choice = "";
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
new Dialog({
	title: `Silver Tongue Skill Check`,
	content: `<p>Pick one to Roll</p><form><div class="form-group"><select id="skill"><option value="dec">Deception</option><option value="per">Persuasion</option></select></div></form>`,
	buttons: {
		adv: {label: "Advantage", callback: () => { choice = `adv`}},
		norm: {label: "Normal", callback: () => { choice = `nor`}},
		dis: {label: "Disadvantage", callback: () => { choice = `dis`}}
	},
	close : (html) => {
		let skill = html.find('#skill')[0].value;
		let form = " + @skills." + skill + ".total";
		let dice = choice == `adv` ? `{2d20kh,10}kh${form}` : choice == `nor` ? `{1d20,10}kh${form}` : `{2d20kl,10}kh${form}`;
		let skill_type = skill == `per` ? `Persuasion` : `Deception`;
		let roll_type = choice == `adv` ? `(Advantage)` : choice == `dis` ? `(Disadvantage)` : ``;
		let roll = new Roll(dice, actorD.getRollData()).roll();		
		get_roll(roll, skill_type, roll_type);
	}
}).render(true);
async function get_roll(roll, skill_type, roll_type){
    game.dice3d?.showForRoll(roll);
    let dice_roll = roll.terms[0].results;
    let get_dice = "";
    let roll_success = roll.terms[0].results[0].result === 1 ? "fumble" : roll.terms[0].results[0].result === 20 ? "critical" : "";
    for (let dice of dice_roll){
        if (dice.discarded){
            get_dice += `<li class="roll die d20 discarded">${dice.result}</li>`;
        }
        else {
            get_dice += `<li class="roll die d20">${dice.result}</li>`;
        }
    }
    let roll_results = `<div class="dice-roll"><p>${skill_type} Skill Check ${roll_type}</p><div class="dice-result"><div class="dice-formula">${roll.formula}</div><div class="dice-tooltip"><div class="dice"><header class="part-header flexrow"><span class="part-formula">${roll.formula}</span><span class="part-total">${roll.total}</span></header><ol class="dice-rolls">${get_dice}</ol></div></div><h4 class="dice-total ${roll_success}">${roll.total}</h4></div></div>`;
    const chatMessage = game.messages.get(args[0].itemCardId);
    let content = duplicate(chatMessage.data.content);    
    const searchString =  /<div class="midi-qol-other-roll"[\s\S]*<div class="end-midi-qol-other-roll">/g;
    const replaceString = `<div class="midi-qol-other-roll">${roll_results}<div class="end-midi-qol-other-roll">`;
    await wait(1000);
    content = content.replace(searchString, replaceString);
    await chatMessage.update({content: content});
    await wait(500);
    ui.chat.scrollBottom();
    }
})();
