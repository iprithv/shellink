#!/usr/bin/env node
/**
 * Shellink — terminal intro & contact menu (npx iprithv)
 */

'use strict'

const boxen = require("boxen");
const chalk = require("chalk");
const inquirer = require("inquirer");
const clear = require("clear");
const open = require("open");
const fs = require('fs');
const request = require('request');
const path = require('path');
const ora = require('ora');
const cliSpinners = require('cli-spinners');
clear();

const prompt = inquirer.createPromptModule();

/** Shipped with the package next to card.js */
const BUNDLED_RESUME = path.join(__dirname, "Prithvi S.pdf");

/** Optional override: direct URL to a PDF (used when no bundled file exists). */
const RESUME_DOWNLOAD_URL = process.env.NPX_CARD_RESUME_URL || "";

const CALENDLY_URL = "https://calendly.com/prithvisivasankar/30min";

/** Set `NPX_CARD_PORTFOLIO_URL` or edit the default below when your site goes live. */
const PORTFOLIO_URL =
    process.env.NPX_CARD_PORTFOLIO_URL || "https://example.com";

const LINKS = {
    linkedin: "https://www.linkedin.com/in/iprithv",
    github: "https://github.com/iprithv",
    scholar:
        "https://scholar.google.com/citations?user=M2dIf5oAAAAJ&hl=en",
    blog: "https://dev.to/iprithv",
};

const MENU_CHOICES = [
    { name: `Send me an ${chalk.green.bold("email")}?`, value: "email" },
    { name: `Download my ${chalk.magentaBright.bold("Resume")}?`, value: "resume" },
    {
        name: `Schedule a ${chalk.yellow.bold("30-min meeting")} (Calendly)?`,
        value: "calendly",
    },
    {
        name: `Open my ${chalk.magentaBright.bold("portfolio")}?`,
        value: "portfolio",
    },
    { name: `Connect on ${chalk.blue.bold("LinkedIn")}?`, value: "linkedin" },
    { name: `View my work on ${chalk.green.bold("GitHub")}?`, value: "github" },
    {
        name: `Research & papers on ${chalk.cyan.bold("Google Scholar")}?`,
        value: "scholar",
    },
    { name: `Read my ${chalk.cyan.bold("blog")} on DEV?`, value: "blog" },
    new inquirer.Separator(chalk.dim(" — leave — ")),
    {
        name:
            chalk.red("Quit") + chalk.dim(" — exit and return to the shell"),
        value: "quit",
    },
];

function buildMenuQuestion(round) {
    const hint = chalk.dim("  ↑↓ enter");
    const msg =
        round === 0
            ? `${chalk.hex("#3fb950").bold("▸")} What would you like to do?${hint}`
            : `${chalk.hex("#58a6ff").bold("▸")} Anything else?${chalk.dim(" (Quit to leave)")}${hint}`;
    return {
        type: "list",
        name: "action",
        message: msg,
        choices: MENU_CHOICES,
        pageSize: 14,
    };
}

function printMenuDivider() {
    const w = Math.min(52, (process.stdout.columns || 80) - 2);
    console.log(chalk.dim("\n" + "·".repeat(Math.max(w, 24)) + "\n"));
}

async function openUrl(target) {
    try {
        await open(target);
    } catch (err) {
        console.log(
            chalk.yellow("\nCouldn't open the browser automatically.") +
                chalk.dim(` Paste: ${target}\n`)
        );
    }
}

/** @param {string} key */
async function runAction(key) {
    switch (key) {
        case "email":
            await openUrl("mailto:prithvisivasankar@gmail.com");
            console.log("\nDone, see you soon at inbox.\n");
            return;
        case "resume": {
            const outName = "Prithvi-S-resume.pdf";
            const destPath = path.join(process.cwd(), outName);

            if (fs.existsSync(BUNDLED_RESUME)) {
                await fs.promises.copyFile(BUNDLED_RESUME, destPath);
                console.log(`\nResume saved to ${destPath}\n`);
                await openUrl(destPath);
                return;
            }

            if (!RESUME_DOWNLOAD_URL) {
                await openUrl(
                    "mailto:prithvisivasankar@gmail.com?subject=Resume%20request&body=Hi%20Prithvi%2C%0A%0ACould%20you%20please%20share%20your%20latest%20resume%3F%0A%0AThanks!"
                );
                console.log(
                    "\nNo resume bundled and no URL configured — opened an email draft to request a copy.\n"
                );
                console.log(
                    `Tip: add ${chalk.cyan("Prithvi S.pdf")} beside card.js, or set ${chalk.cyan("NPX_CARD_RESUME_URL")} to a direct PDF link.\n`
                );
                return;
            }

            const loader = ora({
                text: " Downloading Resume",
                spinner: cliSpinners.material,
            }).start();
            await new Promise(function (resolve) {
                const writeStream = fs.createWriteStream(destPath);
                const req = request(RESUME_DOWNLOAD_URL);
                req.on("error", function () {
                    loader.stop();
                    console.log("\nDownload failed — try emailing me for a copy.\n");
                    resolve();
                });
                req.pipe(writeStream);
                writeStream.on("finish", async function () {
                    console.log(`\nResume Downloaded at ${destPath} \n`);
                    loader.stop();
                    await openUrl(destPath);
                    resolve();
                });
                writeStream.on("error", function () {
                    loader.stop();
                    console.log("\nDownload failed — try emailing me for a copy.\n");
                    resolve();
                });
            });
            return;
        }
        case "calendly":
            await openUrl(CALENDLY_URL);
            console.log("\nSee you on the calendar.\n");
            return;
        case "portfolio":
            await openUrl(PORTFOLIO_URL);
            console.log("\n");
            return;
        case "linkedin":
            await openUrl(LINKS.linkedin);
            console.log("\nLet's connect.\n");
            return;
        case "github":
            await openUrl(LINKS.github);
            console.log("\nThanks for browsing the repos.\n");
            return;
        case "scholar":
            await openUrl(LINKS.scholar);
            console.log("\nPublications and citations.\n");
            return;
        case "blog":
            await openUrl(LINKS.blog);
            console.log("\n Happy reading! \n");
            return;
        default:
            return;
    }
}

async function menuLoop() {
    let round = 0;
    for (;;) {
        if (process.stdin.isTTY) {
            try {
                process.stdin.resume();
            } catch (_) {
                /* ignore */
            }
        }
        let action;
        try {
            const ans = await prompt([buildMenuQuestion(round)]);
            action = ans && ans.action;
        } catch (err) {
            console.error(chalk.red("\nMenu interrupted.\n"), err);
            break;
        }
        if (action === "quit") {
            console.log(
                chalk.hex("#3fb950").bold("\n✓ ") +
                    chalk.white("Thanks for stopping by. See you around.\n")
            );
            break;
        }
        if (action == null || action === "") {
            printMenuDivider();
            round += 1;
            continue;
        }
        await runAction(action);
        printMenuDivider();
        round += 1;
    }
}

const c = {
    hi: chalk.bold.hex("#56d364"),
    name: chalk.bold.hex("#79c0ff"),
    dim: chalk.hex("#8b949e"),
    gold: chalk.hex("#ffa657"),
    cyan: chalk.hex("#39c5cf"),
    green: chalk.hex("#7ee787"),
    soft: chalk.hex("#b1bac4"),
};

const me = boxen(
    [
        "",
        `  ${c.hi("Hey, I'm")} ${c.name("Prithvi S")}  ${c.dim("@iprithv")}`,
        `  ${chalk.dim.italic("open source enthusiast · search · AI · data")}`,
        "",
        `  ${chalk.dim("·  ·  ·  ✦  ·  ·  ·")}`,
        "",
        `  ${c.soft("Staff Software Engineer @")} ${chalk.bold.hex("#58a6ff")("Cloudera")}`,
        "",
        `  ${c.gold("Happy to connect")} ${c.dim("with curious humans.")}`,
        `  ${c.cyan("Let's talk")} ${c.dim("about")} ${c.green("search")}${c.dim(",")} ${c.green("LLMs")}${c.dim(",")}`,
        `  ${c.dim("and the messy, fun parts of shipping AI & data systems in production.")}`,
        "",
    ].join("\n"),
    {
        margin: { top: 0, bottom: 1, left: 0, right: 0 },
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        float: "center",
        align: "center",
        borderStyle: "double",
        borderColor: "#8957e5",
        dimBorder: false,
    }
);

console.log(me);

menuLoop().catch(function (err) {
    console.error(err);
    process.exitCode = 1;
});
