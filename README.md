# D&D Beyond Live-Update Campaign Page

![GitHub last commit](https://img.shields.io/github/last-commit/FaithLilley/DnDBeyond-Live-Campaign?style=plastic&logo=github) ![GitHub repo size](https://img.shields.io/github/repo-size/FaithLilley/DnDBeyond-Live-Campaign?style=plastic) ![GitHub License](https://img.shields.io/github/license/FaithLilley/DnDBeyond-Live-Campaign?style=plastic) ![Static Badge](https://img.shields.io/badge/JavaScript-x?style=plastic&logo=javascript&color=%235b5b5b)

![Live Update Campaign Page Splash](./images/live-update-campaign.png)

**D&D Beyond Live-Update Campaign Page** is a script that allows you to view live data about each of the characters in a D&D Beyond campaign from the Campaign page itself.

- [D\&D Beyond Live-Update Campaign Page](#dd-beyond-live-update-campaign-page)
  - [1. Prerequisites](#1-prerequisites)
  - [2. How to Install and Set-up](#2-how-to-install-and-set-up)
  - [3. How to Use](#3-how-to-use)
  - [4. What does it look like?](#4-what-does-it-look-like)
  - [5. Credits](#5-credits)
  - [6. License](#6-license)
  - [7. Version Notes](#7-version-notes)
    - [v 1.1.1](#v-111)
    - [v 1.1](#v-11)

## 1. Prerequisites

To use this script, you will need a browser extension that allows you to run User Scripts. There a numerous available to choose from, including:

| Extension | Browser Support |
| --- | --- |
| [Firemonkey](https://addons.mozilla.org/en-US/firefox/addon/firemonkey/) | ![Firefox](./images/icon-firefox.png) |
| [Greasemonkey](https://www.greasespot.net/) | ![Firefox](./images/icon-firefox.png) |
| [Tampermonkey](https://www.tampermonkey.net/) | ![Chrome](./images/icon-chrome-18.png) ![Edge](./images/icon-edge.png) ![Firefox](./images/icon-firefox.png) ![Opera Next](./images/icon-opera.png) ![Safari](./images/icon-safari.png) |
| [Violentmonkey](https://violentmonkey.github.io/) | ![Chrome](./images/icon-chrome-18.png) ![Edge](./images/icon-edge.png) ![Firefox](./images/icon-firefox.png) |

Install one of these extensions for your browser. If you're not sure, I recommend Tampermonkey.

## 2. How to Install and Set-up

Ensure you are running a browser extension that takes UserScripts (see Prerequisites above).

Click on the Install Script button below to install this user script to your browser extension, then follow the instructions from your browser extension.

[![Live Update Campaign Page Splash](./images/install-button.png)](https://github.com/FaithLilley/DnDBeyond-Live-Campaign/raw/master/ddb-live-campaign.user.js) 

## 3. How to Use

1. Open your [campaigns page on the D&D Beyond website](https://www.dndbeyond.com/my-campaigns).
2. Click on one of your campaigns.

You'll now see additional information displayed on the card of each character, showing:

- Current Hit Points
- Current Armor Class
- Ability Scores
- Passive Perception / Investigation / Insight

The data is automatically updated every 60 seconds.

## 4. What does it look like?

This is how the character cards on the campaign page look with this script running.

![Live Update Campaign Page Splash](./images/example-campaign.jpg)

## 5. Credits

Author: [Faith Elisabeth Lilley](https://github.com/FaithLilley) (aka Stormknight)

Contributors: [@xander-hirst](https://github.com/xander-hirst)

Project forked from [DNDBeyond DM Screen][DNDBeyond-DM-Screen] [DNDBeyond-DM-Screen](https://github.com/TeaWithLucas/DNDBeyond-DM-Screen) by [TeaWithLucas](https://github.com/TeaWithLucas) - huge thanks for figuring out the DDB API code.

## 6. License

This project uses the [MIT license](LICENSE.md).

## 7. Version Notes

### v 1.1.1

Fix due to version change of the DDB API libraries. Thanks Xander!

### v 1.1

First full release.
