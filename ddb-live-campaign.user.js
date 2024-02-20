// ==UserScript==
// @name			D&D Beyond Live-Update Campaign
// @namespace		https://github.com/FaithLilley/DnDBeyond-Live-Campaign/
// @copyright		Copyright (c) 2024 Faith Elisabeth Lilley (aka Stormknight)
// @version			0.1
// @description		Provides live character data on the D&D Beyond campaign page
// @author			Faith Elisabeth Lilley (aka Stormknight)
// @match			https://www.dndbeyond.com/campaigns/*
// @updateURL		https://github.com/FaithLilley/DnDBeyond-Live-Campaign/raw/master/ddb-live-campaign.user.js
// @downloadURL		https://github.com/FaithLilley/DnDBeyond-Live-Campaign/raw/master/ddb-live-campaign.user.js
// @supportURL		https://github.com/FaithLilley/DnDBeyond-Live-Campaign/
// @require			https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @require         https://media.dndbeyond.com/character-tools/vendors~characterTools.bundle.dec3c041829e401e5940.min.js
// @grant			GM_setValue
// @grant			GM_getValue
// @license			MIT; https://github.com/FaithLilley/DnDBeyond-Live-Campaign/blob/master/LICENSE.md
// ==/UserScript==
console.log("Initialising D&D Beyond Live Campaign.");

/**
* DEFINE GLOBALS
*/

// Content sharing and description section.
// const campaignElementTarget = ".ddb-campaigns-detail-header-secondary";

// jQuery set-up
const rulesUrls = [
  "https://character-service.dndbeyond.com/character/v4/rule-data",
  "https://gamedata-service.dndbeyond.com/vehicles/v3/rule-data",
];
const charJSONurlBase =
  "https://character-service.dndbeyond.com/character/v4/character/";
const gameCollectionUrl = {
  prefix: "https://character-service.dndbeyond.com/character/v4/game-data/",
  postfix: "/collection",
};

const debugMode = true;

const autoUpdateDefault = true;
const updateDurationDefault = 60;

var $ = window.jQuery;
var rulesData = {},
    charactersData = {},
    campaignID = 0,
    svgImageData = {},
    authHeaders = {};

/**
* charactersData is an object array of all characters in the campaign
* * charactersData[characterID].property
* node:     the top DOM element for each character card
* url:      JSON query for character data in the DDB charater service
* data:     Data for the character
*/

// PHB cover image for cards
// https://www.dndbeyond.com/attachments/2/723/phbcover.jpg

/**
* MAIN FUNCTION
* * Called by Tampermonkey
* TODO: Add the data loading
*/

(function () {
    writeDebugData("Main function executing");
    loadStylesheet();
    campaignID = detectCampaignID();
    defineSVGimageData();
    defineHTMLsnippets();
    locateCharacters();
})();

/**
* locateCharacters()
* Parse through the page to locate every active character in the campaign.
* Initialises charactersData
* * No parameters
*/
function locateCharacters() {
    const charIDRegex = /(?<=\/)\d+/;
    const linkUrlTarget = ".ddb-campaigns-detail-body-listing-active .ddb-campaigns-character-card-footer-links-item-view";
    writeDebugData("Locating active characters on the campaign page.");
    $(linkUrlTarget).each(function (index, value) {
        let characterID = parseInt(value.href.match(charIDRegex));
        writeDebugData("Character ID located: " + characterID);
        if (characterID != 0) {
            let node = $(value).parents('li');
            charactersData[characterID] = {
                node: node,
                url: charJSONurlBase + characterID,
                data: {},
            }
            injectNewCharacterCardElements(characterID);
            updateCharacterClasses(characterID);
            writeDebugData(charactersData[characterID].url);
        } else {
            console.warn("Warning! Character with null character ID was found!");
        }
    });
}


/**
* FUNCTIONS FOR UPDATING THE PAGE STRUCTURE
*/
function injectNewCharacterCardElements(characterID) {
    let targetNode = charactersData[characterID].node.find('.ddb-campaigns-character-card-header');
    targetNode.append(defineHTMLsnippets());
}

/**
* FUNCTIONS FOR UPDATING THE PAGE DATA
*/

// Updates the Character Class based on data
function updateCharacterClasses(characterID) {
    let targetNode = charactersData[characterID].node.find('.ddb-campaigns-character-card-header-upper-character-info-secondary').first();
    targetNode.html('Variant Human - Barbarian 4 / Sorceror 3');
    // TODO: Plug in the actual data
    // span = $('#ddb-lc-armorclass');
}

/**
* FUNCTIONS FOR QUERYING DATA
*/
function detectCampaignID() {
    let campaignIDRegex = /(?<=\/)\d+/;
    let queryCampaignID = window.location.pathname.match(campaignIDRegex);
    if (queryCampaignID > 0) {
        writeDebugData("Campaign detected: " + queryCampaignID);
    } else {
        console.warn("DDB Live Campaign Page:: Could not determine the Campaign ID!");
    }
    return queryCampaignID;
}

/**
* GENERIC FUNCTIONS
*/

function writeDebugData(data) {
  if (debugMode === true) {
    console.log("DDBLC:: " + data);
  }
}

function getSign(input){
    let positiveSign = "+",
        negativeSign = "-";
    let number = parseIntSafe(input);
    return number >= 0 ? positiveSign : negativeSign
}
/**
* DEFINE CSS WITHOUT USING A SEPERATE CSS FILE
* Means we don't need an externally hosted CSS file, so don't have to deal with caching.
*/
function loadStylesheet() {
    writeDebugData('Adding CSS Styles.');
    let style = document.createElement('style');
    style.innerHTML = `
/*! OVERRIDE EXISTING CSS TO CHANGE STRUCTURE */

.ddb-campaigns-character-card-header {
    padding: 20px !important;
}
.ddb-campaigns-character-card-footer-links {
    height: 40px !important;
}

/*! ADD CSS FOR NEW ELEMENTS ON CHARACTER CARDS */

.ddb-lc-character-expanded {
    display: flex;
    flex-direction: column;
    gap: 15px;
    z-index: 1 !important;
    margin-top:10px;
}
.ddb-lc-character-stats {
    display: flex;
    justify-content: space-around;
    gap: 10px;
    margin: 0px;
}
.ddb-lc-character-stats > * {
    height: 55px;
}
/* -- Armor Class -- */
.ddb-lc-character-stats-armorclass {
    display: block;
    position: relative;
    width: 50px !important;
    margin-left: 6px;
}
.ddb-lc-character-stats-armorclass span {
    display: block;
    position: relative;
    z-index: 2;
    text-align: center;
    line-height: 50px;
    color: #000000;
    font-weight: bold;
    font-size: 24px;
}
.ddb-lc-character-stats-armorclass svg {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
}

/* -- Hit Points -- */
.ddb-lc-character-stats-hitpoints {
    display: block;
    position: relative;
    width: 50px !important;
}
.ddb-lc-character-stats-hitpoints span {
    display: block;
    position: relative;
    z-index: 2;
    text-align: center;
}
.ddb-lc-character-stats-hitpoints-cur {
    line-height: 22px;
    padding-top: 10px;
    color: #000000;
    font-weight: bold;
    font-size: 20px;
}
.ddb-lc-character-stats-hitpoints-max {
    line-height: 16px;
    color: #808080;
    font-weight: bold;
    font-size: 14px;
}
.ddb-lc-character-stats-hitpoints svg {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
}

/* -- Initiative -- */
.ddb-lc-character-stats-initiative {
    display: block;
    position: relative;
    width: 50px;
}
.ddb-lc-character-stats-initiative span {
    z-index: 2;
}
.ddb-lc-character-stats-initiative-label {
    position: relative;
    text-align: center;
    display: block;
    font-size: 13px;
    line-height: 17px;
    color: #d2d2d2;
}
.ddb-lc-character-stats-initiative-container {
    display: flex;
    justify-content:center;
}
.ddb-lc-character-stats-initiative-container > div {
    position: relative;
}
.ddb-lc-character-stats-initiative-value {
    display: inline-block;
    position: relative;
    text-align: center;
    justify-content: center;
    line-height: 38px;
    font-size: 22px;
    font-weight: bold;
    color: #000000;
}
.ddb-lc-character-stats-initiative-sign {
    position:absolute;
    left:0;
    line-height: 36px;
    margin-left: -8px;
    color: #808080;
    font-size: 16px;
    font-weight: bold;
}
.ddb-lc-character-stats-initiative svg {
    width: 100%;
    height: 39px;
    position: absolute;
    left: 0px;
    bottom: 0px;
}

/* -- Passives -- */
.ddb-lc-character-stats-passives {
    display: block;
    position: relative;
    flex: 1;
}
.ddb-lc-character-stats-passives > div {
    display: block;
    position: relative;
}
.ddb-lc-character-stats-passives-value {
    font-weight: bold;
    font-size: 13px;
    color: #ffffff;
    padding: 0px 4px;
}
.ddb-lc-character-stats-passives-label {
    font-family: "Roboto Condensed",Roboto,Helvetica,sans-serif;
    font-size: 13px;
    color: #d2d2d2;
}

/* -- Attribute Scores -- */
.ddb-lc-character-attributes {
    display: flex;
    position: relative;
    justify-content: space-between;
}
.ddb-lc-character-attributes > div {
    display: block;
    position: relative;
    width: 50px;
    height: 55px;
}
.ddb-lc-character-attributes > div > svg {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
}
.ddb-lc-character-attributes > div > div {
    display: block;
    position: relative;
    z-index: 2;
}
.ddb-lc-character-attributes-label {
    display: block;
    position: relative;
    text-align: center;
    line-height: 13px;
    padding-top: 2px;
    font-size: 13px;
    color: #808080;
}
.ddb-lc-character-attributes-value {
    display: block;
    position: relative;
    text-align: center;
    font-weight: bold;
    line-height: 20px;
    font-size: 22px;
    color: #000000;
}
.ddb-lc-character-attributes-modifier {
    display: block;
    position: relative;
    text-align: center;
    line-height: 14px;
    padding-top: 4px;
    font-size: 13px;
    font-weight: bold;
    color: #000000;
}
    `;
    document.head.appendChild(style);
}

/**
* DEFINE HTML SNIPPETS that will be injected into the page.
* * Reference example: htmlSnippetData.armorClass
*/
function defineHTMLsnippets() {
    let htmlSnippetData = `
            <div class="ddb-lc-character-expanded">
                <div class="ddb-lc-character-stats">
                    <div class="ddb-lc-character-stats-armorclass">
                        ` + svgImageData.armorClass + `
                        <span id="ddb-lc-armorclass">AC</span>
                    </div>
                    <div class="ddb-lc-character-stats-hitpoints">
                        ` + svgImageData.hitPointBox + `
                        <span id="ddb-lc-hitpoints-cur" class="ddb-lc-character-stats-hitpoints-cur">CUR</span>
                        <span id="ddb-lc-hitpoints-max" class="ddb-lc-character-stats-hitpoints-max">MAX</span>
                    </div>
                    <div class="ddb-lc-character-stats-initiative">
                        ` + svgImageData.initiativeBox + `
                        <span class="ddb-lc-character-stats-initiative-label">INIT</span>
                        <div class="ddb-lc-character-stats-initiative-container">
                            <div>
                                <span id="ddb-lc-initiative" class="ddb-lc-character-stats-initiative-value">3</span>
                                <span id="ddb-lc-initiative-sign" class="ddb-lc-character-stats-initiative-sign">+</span>
                            </div>
                        </div>
                    </div>
                    <div class="ddb-lc-character-stats-passives">
                        <div>
                            <span class="ddb-lc-character-stats-passives-value" id="ddb-lc-passive-perception">10</span>
                            <span class="ddb-lc-character-stats-passives-label">Passive Perception</span>
                        </div>
                        <div>
                            <span class="ddb-lc-character-stats-passives-value" id="ddb-lc-passive-investigation">10</span>
                            <span class="ddb-lc-character-stats-passives-label">Passive Investigation</span>
                        </div>
                        <div>
                            <span class="ddb-lc-character-stats-passives-value" id="ddb-lc-passive-insight">10</span>
                            <span class="ddb-lc-character-stats-passives-label">Passive Insight</span>
                        </div>
                    </div>
                </div>
                <div class="ddb-lc-character-attributes">
                    <div>
                        ` + svgImageData.attributeBox + `
                        <div>
                            <span class="ddb-lc-character-attributes-label">STR</span>
                            <span class="ddb-lc-character-attributes-value" id="ddb-lc-str-value">10</span>
                            <span class="ddb-lc-character-attributes-modifier" id="ddb-lc-str-modifier">+0</span>
                        </div>
                    </div>
                    <div>
                        ` + svgImageData.attributeBox + `
                        <div>
                            <span class="ddb-lc-character-attributes-label">DEX</span>
                            <span class="ddb-lc-character-attributes-value" id="ddb-lc-dex-value">10</span>
                            <span class="ddb-lc-character-attributes-modifier" id="ddb-lc-dex-modifier">+0</span>
                        </div>
                    </div>
                    <div>
                        ` + svgImageData.attributeBox + `
                        <div>
                            <span class="ddb-lc-character-attributes-label">CON</span>
                            <span class="ddb-lc-character-attributes-value" id="ddb-lc-con-value">10</span>
                            <span class="ddb-lc-character-attributes-modifier" id="ddb-lc-con-modifier">+0</span>
                        </div>
                    </div>
                    <div>
                        ` + svgImageData.attributeBox + `
                        <div>
                            <span class="ddb-lc-character-attributes-label">INT</span>
                            <span class="ddb-lc-character-attributes-value" id="ddb-lc-int-value">10</span>
                            <span class="ddb-lc-character-attributes-modifier" id="ddb-lc-int-modifier">+0</span>
                        </div>
                    </div>
                    <div>
                        ` + svgImageData.attributeBox + `
                        <div>
                            <span class="ddb-lc-character-attributes-label">WIS</span>
                            <span class="ddb-lc-character-attributes-value" id="ddb-lc-wis-value">10</span>
                            <span class="ddb-lc-character-attributes-modifier" id="ddb-lc-wis-modifier">+0</span>
                        </div>
                    </div>
                    <div>
                        ` + svgImageData.attributeBox + `
                        <div>
                            <span class="ddb-lc-character-attributes-label">CHA</span>
                            <span class="ddb-lc-character-attributes-value" id="ddb-lc-cha-value">10</span>
                            <span class="ddb-lc-character-attributes-modifier" id="ddb-lc-cha-modifier">+0</span>
                        </div>
                    </div>
                </div>
            </div>
    `;
    return htmlSnippetData;
}


/**
* DEFINE SVG IMAGES so they can be used later on.
* * Reference example: svgImageData.armorClass
*/
function defineSVGimageData() {
    svgImageData = {
        armorClass:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 79 90"><path fill="#FEFEFE" d="M72.8,30.7v13.7c-1,3.6-9.7,30.9-31.9,38.6c-0.3-0.4-0.8-0.7-1.4-0.7c-0.6,0-1,0.3-1.4,0.7 C26,78.7,17.9,68.6,12.9,59.8c0,0,0,0,0,0c-0.3-0.5-0.6-1-0.8-1.5c-3.6-6.7-5.4-12.4-5.9-14V30.7c0.7-0.3,1.2-0.9,1.2-1.7 c0-0.1,0-0.2-0.1-0.3c6.2-4,8.5-11.5,9.2-15.2L38.1,7c0.3,0.4,0.8,0.7,1.4,0.7c0.6,0,1.1-0.3,1.4-0.7l21.4,6.6 c0.8,3.6,3,11.1,9.2,15.2V29c0,0.2,0,0.4,0.1,0.6C71.8,30.1,72.3,30.5,72.8,30.7z"></path><path fill="#C53131" d="M73.2,27.3c-0.4,0-0.8,0.2-1.1,0.4c-5.8-3.9-7.9-11.3-8.6-14.5l-0.1-0.4l-22-6.7c-0.1-0.9-0.8-1.7-1.8-1.7 s-1.7,0.8-1.8,1.7l-22,6.7l-0.1,0.4c-0.6,3.2-2.7,10.6-8.6,14.5c-0.3-0.3-0.7-0.4-1.1-0.4c-1,0-1.8,0.8-1.8,1.9 c0,0.8,0.5,1.5,1.2,1.7v13.5v0.2c0.9,3.2,9.7,31.2,32.4,39.2c0.1,1,0.8,1.8,1.8,1.8s1.8-0.8,1.8-1.8c9.3-3.3,17.3-10.1,23.8-20.4 c5.3-8.4,7.9-16.5,8.6-18.8V30.9c0.7-0.3,1.2-0.9,1.2-1.7C75,28.1,74.2,27.3,73.2,27.3z M72.5,44.3c-1,3.6-9.6,30.5-31.5,38.2 c-0.3-0.4-0.8-0.7-1.4-0.7c-0.6,0-1,0.3-1.4,0.7C16.3,74.8,7.8,47.9,6.7,44.3V30.9c0.7-0.3,1.2-0.9,1.2-1.7c0-0.1,0-0.2-0.1-0.3 c6.1-4,8.4-11.4,9.1-15l21.3-6.5c0.3,0.4,0.8,0.7,1.4,0.7c0.6,0,1.1-0.3,1.4-0.7l21.2,6.5c0.8,3.6,3,11,9.1,15c0,0.1,0,0.2,0,0.3 c0,0.8,0.5,1.5,1.2,1.7V44.3z M73.2,27.3c-0.4,0-0.8,0.2-1.1,0.4c-5.8-3.9-7.9-11.3-8.6-14.5l-0.1-0.4l-22-6.7 c-0.1-0.9-0.8-1.7-1.8-1.7s-1.7,0.8-1.8,1.7l-22,6.7l-0.1,0.4c-0.6,3.2-2.7,10.6-8.6,14.5c-0.3-0.3-0.7-0.4-1.1-0.4 c-1,0-1.8,0.8-1.8,1.9c0,0.8,0.5,1.5,1.2,1.7v13.5v0.2c0.9,3.2,9.7,31.2,32.4,39.2c0.1,1,0.8,1.8,1.8,1.8s1.8-0.8,1.8-1.8 c9.3-3.3,17.3-10.1,23.8-20.4c5.3-8.4,7.9-16.5,8.6-18.8V30.9c0.7-0.3,1.2-0.9,1.2-1.7C75,28.1,74.2,27.3,73.2,27.3z M72.5,44.3 c-1,3.6-9.6,30.5-31.5,38.2c-0.3-0.4-0.8-0.7-1.4-0.7c-0.6,0-1,0.3-1.4,0.7C16.3,74.8,7.8,47.9,6.7,44.3V30.9 c0.7-0.3,1.2-0.9,1.2-1.7c0-0.1,0-0.2-0.1-0.3c6.1-4,8.4-11.4,9.1-15l21.3-6.5c0.3,0.4,0.8,0.7,1.4,0.7c0.6,0,1.1-0.3,1.4-0.7 l21.2,6.5c0.8,3.6,3,11,9.1,15c0,0.1,0,0.2,0,0.3c0,0.8,0.5,1.5,1.2,1.7V44.3z M78.1,24.5c-8.7-1.8-9.9-14.9-9.9-15l-0.1-0.8L39.5,0 L10.9,8.7l-0.1,0.8c0,0.1-1.2,13.3-9.9,15l-1,0.2v20.4v0.3C0,45.8,9.6,82.1,39.1,89.9l0.3,0.1l0.3-0.1C69.5,82.1,79,45.8,79.1,45.4 V24.7L78.1,24.5z M76.7,45C76,47.5,66.6,80.1,39.5,87.5C12.6,80.1,3.2,47.4,2.5,45V26.7c8.3-2.4,10.3-13,10.7-16.1l26.4-8l26.4,8 c0.4,3.1,2.4,13.7,10.7,16.1V45z M63.5,13.2l-0.1-0.4l-22-6.7c-0.1-0.9-0.8-1.7-1.8-1.7s-1.7,0.8-1.8,1.7l-22,6.7l-0.1,0.4 c-0.6,3.2-2.7,10.6-8.6,14.5c-0.3-0.3-0.7-0.4-1.1-0.4c-1,0-1.8,0.8-1.8,1.9c0,0.8,0.5,1.5,1.2,1.7v13.5v0.2 c0.9,3.2,9.7,31.2,32.4,39.2c0.1,1,0.8,1.8,1.8,1.8s1.8-0.8,1.8-1.8c9.3-3.3,17.3-10.1,23.8-20.4c5.3-8.4,7.9-16.5,8.6-18.8V30.9 c0.7-0.3,1.2-0.9,1.2-1.7c0-1-0.8-1.9-1.8-1.9c-0.4,0-0.8,0.2-1.1,0.4C66.2,23.9,64.1,16.4,63.5,13.2z M72.5,30.9v13.5 c-1,3.6-9.6,30.5-31.5,38.2c-0.3-0.4-0.8-0.7-1.4-0.7c-0.6,0-1,0.3-1.4,0.7C16.3,74.8,7.8,47.9,6.7,44.3V30.9 c0.7-0.3,1.2-0.9,1.2-1.7c0-0.1,0-0.2-0.1-0.3c6.1-4,8.4-11.4,9.1-15l21.3-6.5c0.3,0.4,0.8,0.7,1.4,0.7c0.6,0,1.1-0.3,1.4-0.7 l21.2,6.5c0.8,3.6,3,11,9.1,15c0,0.1,0,0.2,0,0.3C71.3,30,71.8,30.6,72.5,30.9z"></path></svg>`,
        attributeBox:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 81 95"><g fill="#fefefe"><path d="M77.6 53.8a4.41 4.41 0 0 1-1.6-3.7c0-6.3-1.3-14.5 1.4-20.7-.7-.8-1.2-1.8-1.3-2.9-1.5-1.7-1.8-4-.7-6 1.3-2.7 1.2-6.7.9-9.5-.1-1.2.4-2.4 1.2-3.3l.3-1.9C73.5 7.5 70.9 2 70.9 2H10.1S8 6.4 4.4 6.2c.2.4.2.8.2 1.3 0 1.5-.2 3.1-.2 4.7.1 1.2.2 2.5.4 3.7.8 2.5 1.4 5.1 1.6 7.8.1 1.2-.3 2.3-1 3.2-.2.9-.8 1.7-1.5 2.3.3.7.5 1.4.5 2.1.2 6.9.8 13.5.2 20.5-.1 1.1-.5 2.2-1.2 3 .1 2 0 4 0 6.1.7 1.1.8 2.5.4 3.7C1.6 73 6.4 78 12.4 82.2c.2.1.3.1.5.2.9.5 1.8 1 2.7 1.6.1 0 .1.1.2.1.5.3 1.1.6 1.7.8.1 0 .1.1.2.1h1.9c-.6-.5-1-1.2-1.2-1.9-1-1.9-1.3-4-.9-6.1 0-.4.1-.8.2-1.2.2-.4.3-.8.5-1.2.6-1.7 1.6-3.2 3-4.3a1.38 1.38 0 0 0 .3-.4c.6-.7 1.2-1.3 1.9-1.8 1.8-1.4 3.8-2.5 6-3.2 1.6-.7 3.2-.5 4.9-.8C40 63.9 48.5 62.8 54 66c.7.3 1.3.6 1.9 1 .2.1.5.3.7.4h.1c1.5.9 2.9 2 4 3.3.3.3.6.6.8 1 .5.6.9 1.2 1.3 1.9.6 1 .8 2.2.6 3.4.2.6.3 1.2.3 1.8.1.8 0 1.6-.3 2.3-.1 1.1-.5 2.2-1.3 3.1-.2.3-.4.5-.7.7H64c.6-.7 1.3-1.2 2.2-1.5 1.3-.9 2.7-1.7 4.1-2.6 1.7-1.3 5.1-3.6 5.9-5.6.1-.5.4-.9.6-1.3.2-.6.3-1.1.4-1.7a4.53 4.53 0 0 1 .3-1.6c-.1-1.5-.2-3-.4-4.5-.2-1.3-.1-2.6.5-3.7-.1-2.8-.1-5.8 0-8.6z"/><path d="M40.5,64.4c14.2,0,23.3,7.5,23.3,14.4S50.7,93.1,40.5,93.1s-22.9-7.4-22.9-14.3s7.9-14.9,23-14.4"/></g><path fill="#c53131" d="M4.5 13.6c-.7-2.4-1.2-4.9-1.4-7.4v-.4l.6-.2C5.2 5.2 9.4 3.3 9.4 1V0h62.2v1c0 2.4 4.2 4.2 5.7 4.7l.6.2v.4c-.2 2.5-.7 5-1.4 7.4L76 7.3C74.4 6.7 70.5 5 69.7 2H11.3C10.5 5 6.6 6.7 5 7.3l-.5 6.3zm12.8 70.2c-.5-1.3-1.3-3.5-1.3-5 0-8.6 7.3-15.6 24.5-15.6 18.2 0 24.9 7.6 24.9 16.2 0 1.4-.7 2.8-1.8 4.4h1.9l-2.5 2h-1.2c-.9 1.3-3 2.4-4.2 3.3 1.2-.1 1.4-.2 2.8-.2l3.8-3.1h0l.2-.1c.7-.6 1.5-1.1 2.3-1.7l.3-.2h0c1.1-.8 2.3-1.5 3.5-2.1 2.2-1.6 4.1-3.5 5.7-5.7h0l.1-.1.4-.6.2-.2c1.1-1.6 1.9-3.5 2.1-5.5.1-1.7-.3-3.3-1.2-4.7 0 2.2.1 4.4.2 6.4-.5 1.2-1.1 2.4-1.8 3.5-.3-3.8-1.9-36.8-.2-46.1-1.3-1.7-1.8-3.8-1.3-5.9.9-2.2 1.6-4.4 2.1-6.7 0 0 1.4-4.5 1.4-6.5l1.2 13.8-.1.2c-.4 1.3-.8 2.7-1.1 4.1-.7-.5-1.2-1.2-1.6-2 .2-.9.4-1.7.7-2.5l-.2-2.9c-.5 1.6-1.1 2.9-1.1 3-.2 1.1-.1 2.3.4 3.4.3.9.9 1.6 1.6 2.2.7.7 1.4 1.3 2.2 1.9l.5.3-.2.5c-1.3 4.1-2.6 29.9-2.6 29.9v1.2c1.8 1.9 2.8 4.6 2.6 7.2-.3 2.1-1 4.1-2.2 5.9.1 1.4.2 2.6.2 3.8h.3c1.5-.1 2.8.7 2.2 1.8-.4.6-1 1-1.7 1.2.3-.2.6-.5.8-.8s0-.4-.1-.5h-.4 0-.8l.3 3.8.1.9H66.6c-1.5 1-2.8 2.2-4 3.2a12.5 12.5 0 0 1 7 2.1l-2.8 1.1h0c-1.7.7-3.5 1.3-5.3 1.7h0-.3L61 94c-9.7 1.7-10.7.8-10.7.8 2.5 0 4.9-1 6.8-2.8l.2-.2c.1-.1.6-.6 1.5-1.4-.6 0-1.2.1-1.8.1h0-.4c-.4 0-.8.1-1.2.2l-.9.3h-.1c-.3.1-.7.3-1 .4l-.1.1c-.3.2-.5.3-.8.5l-.2.2c-.3.3-.5.5-.8.9l-7.9.9h.1c-2.1.3-4.3.3-6.5 0h.1l-7.9-.9c-.2-.3-.5-.6-.8-.9l-.2-.2c-.3-.2-.5-.4-.8-.6l-.1-.1c-.3-.2-.6-.3-1-.4h-.1l-.9-.3c-.5-.1-.9-.2-1.1-.2H24h0c-.6 0-1.2-.1-1.8-.1.8.8 1.4 1.3 1.5 1.4l.2.2c1.8 1.7 4.3 2.7 6.8 2.7 0 0-1 .9-10.7-.8h-.2-.3 0c-1.8-.4-3.6-1-5.3-1.7h0L11.4 91c2.1-1.4 4.5-2.2 7-2.1-1.2-1-2.6-2.1-4-3.2H2l.1-1.1c0-.1.2-1.5.3-3.8h-.8 0-.4c-.2.1-.3.2-.1.5s.4.6.7.8c-.7-.1-1.3-.6-1.7-1.2-.6-1 .7-1.9 2.2-1.8h.3c.1-1.1.2-2.4.2-3.8-1.2-1.7-2-3.8-2.2-5.9-.2-2.7.7-5.3 2.6-7.2V61S1.8 35.2.5 31.1L.4 31l.5-.3c.8-.5 1.5-1.2 2.2-1.9.7-.6 1.2-1.4 1.5-2.2.5-1 .6-2.2.4-3.3 0-.1-.6-1.4-1.1-3l-.3 2.9c.3.8.5 1.6.7 2.5-.3.8-.9 1.5-1.6 2-.3-1.4-.6-2.7-1-4l-.1-.2L2.9 9.6c0 2 1.4 6.5 1.4 6.5.5 2.3 1.2 4.5 2.1 6.7.4 2.1-.1 4.2-1.4 5.9 1.7 9.3.1 42.3-.1 46.2A14.79 14.79 0 0 1 3 71.4c.1-2 .1-4.2.2-6.4-.9 1.4-1.3 3.1-1.1 4.7.2 1.9 1 3.8 2.1 5.4l.2.2.3.7h.1 0c1.6 2.1 3.6 4 5.7 5.7 1.2.6 2.4 1.4 3.5 2.1h0l.3.2c.8.5 1.6 1.1 2.3 1.7l.2.1h0c1.4 1.1 2.7 2.2 3.8 3.1 1.4 0 1.2 0 2.4.1-1.2-1-2.8-1.9-3.7-3.2H18l-2.5-2m1.4-6.5h0m59.9-28.2c.5-5.7 1.2-14.2 2.2-17.5-.4-.3-.9-.6-1.3-1a144.13 144.13 0 0 0-.9 18.5h0zM74.6 80c.6-.2 1.2-.3 1.8-.3 0-.5-.1-1-.1-1.5-.5.6-1.1 1.2-1.7 1.8zm-5 3.8h7.2c-.1-.7-.2-1.6-.2-2.8-2.5.5-4.9 1.4-7 2.8zm-10.9 8.7h0c1.1.6 4.6-.4 7.4-1.6-1.7-.5-3.4-.7-5.1-.6-1.1 1-1.9 1.7-2.3 2.2h0zm-18.2-.4c7 0 12.8-2.4 17.7-6.1 3.1-2.3 4.6-5.5 4.6-7.3 0-9.4-11.5-13.4-22.2-13.4s-21.9 4.2-21.9 13.4c-.1 1.6.8 4.7 3.6 6.9 2.5 2.6 11.2 6.5 18.2 6.5zM20 90.3c-1.7-.1-3.4.1-5.1.6 2.8 1.1 6.2 2.2 7.3 1.6h.1c-.4-.4-1.2-1.2-2.3-2.2h0zM4.6 79.7l1.8.3c-.6-.6-1.1-1.2-1.7-1.8 0 .5-.1 1-.1 1.5zm-.4 4.1h7.2c-2.1-1.4-4.5-2.3-6.9-2.8-.1 1.2-.2 2.2-.3 2.8zm0-34.7a143.26 143.26 0 0 0-.9-18.5 6.42 6.42 0 0 1-1.3 1c1 3.3 1.7 11.8 2.2 17.5z"/></svg>`,
        hitPointBox:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94 89"><path fill="#FEFEFE" d="M87.54,9.45a42.28,42.28,0,0,1-3-3A42.91,42.91,0,0,0,74.21,1H18.36a11,11,0,0,0-1.53.59A4.9,4.9,0,0,1,15.36,2.7,21.09,21.09,0,0,0,6,12.28a5.14,5.14,0,0,1,.12,1.59,5.15,5.15,0,0,1,.24,1.18c1,12.72.57,25.84.4,38.59-.09,6.5,0,13-.05,19.48,0,2-.11,4.08-.22,6.12a17.93,17.93,0,0,0,2.78,2.94A73.22,73.22,0,0,0,16.51,87H78l.07-.06a32.31,32.31,0,0,0,9.31-8.5c.13-6,.65-12,.36-18s.2-11.89.36-17.9c.16-6.53,0-13.11-.17-19.64C87.84,18.57,88.07,13.86,87.54,9.45Z"></path><path fill="#C53131" d="M85,0H9L0,9.05V80l9,9H85l9-9V9.05Zm6.55,10.08v7a29.26,29.26,0,0,0-3.24-6.78v-.13h-.08a20.45,20.45,0,0,0-9.13-7.69H84ZM75.6,86.52H18.36a19,19,0,0,1-11.3-7.73V10.25A19.27,19.27,0,0,1,18.4,2.48H75.64a18.94,18.94,0,0,1,11.3,7.73V78.75A19.27,19.27,0,0,1,75.6,86.52ZM2.47,21.18a31.7,31.7,0,0,1,3.24-8.8V76.64c-.3-.53-.62-1-.89-1.62a32.92,32.92,0,0,1-2.35-7.11Zm85.82-8.82c.3.53.62,1,.89,1.62a32.92,32.92,0,0,1,2.35,7.11V67.81a31.64,31.64,0,0,1-3.24,8.81ZM10.05,2.48h4.87a20.45,20.45,0,0,0-9.13,7.69H5.71v.13a29.26,29.26,0,0,0-3.24,6.78v-7ZM2.47,78.92v-7A29.45,29.45,0,0,0,5.71,78.7v.13h.08a20.45,20.45,0,0,0,9.13,7.69H10.05ZM84,86.52H79.08a20.45,20.45,0,0,0,9.13-7.69h.08V78.7a29.45,29.45,0,0,0,3.24-6.78v7Z"></path></svg>`,
        initiativeBox:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 45"><polygon fill="#FEFEFE" points="68.8,22.5 55.8,43.3 14.2,43.3 1.2,22.5 14.2,1.8 14.3,1.7 55.7,1.7 55.8,1.8 "></polygon><path fill="#C53131" d="M59.1,0H10.9L0,17.2v10.5L10.9,45H59l11-17.2V17.2L59.1,0z M58.2,2.2l10,15.8v3L56.5,2.3l-0.1-0.1H58.2z M14.8,2.2h40.5 l0.1,0.1L68,22.5L55.3,42.8H14.7L2,22.5L14.8,2.2L14.8,2.2z M1.8,18l10-15.8h1.8l-0.1,0.1L1.8,21V18z M11.8,42.8L1.8,27v-3 l11.7,18.8H11.8z M68.2,27l-10,15.8h-1.7L68.2,24V27z"></path></svg>`,
    };
}