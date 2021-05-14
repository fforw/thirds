#!/usr/bin/env node
const Yargs = require('yargs')
    .option('width', {
        alias: 'w',
        describe: 'Image width',
    })
    .option('height', {
        alias: 'h',
        describe: 'Image height',
    })
    .option('color', {
        alias: 'c',
        describe: 'Color to draw lines with',
    })
    .default("color", "#000", "default color")
    .help();
const argv = Yargs
    .argv;

const fileArgs = argv._;
if (fileArgs.length < 1)
{
    console.log("Usage: thirds <out>");
    console.log("Generates an image in the specified dimensions and draws lines in the configured color following the rule of thirds");
    Yargs.showHelp();
    process.exit(1);
}


const { width, height, color } = argv;


if (width === undefined)
{
    console.log("Need --width/-w")
    process.exit(1);
}
if (height === undefined)
{
    console.log("Need --height/-h")
    process.exit(1);
}

const Jimp = require("jimp");
const Color = require("./Color");


const [ outFile ] = fileArgs;

const col = Color.validate(color)

const tw = width/3|0
const th = height/3|0

Jimp.create(width, height, 0).then(img => {

    const { bitmap } = img;
    const { width, height, data } = bitmap;

    const line = width * 4;

    for (let x = 0; x < line; x += 4)
    {
        data[th * line + x    ] = col.r;
        data[th * line + x + 1] = col.g;
        data[th * line + x + 2] = col.b;
        data[th * line + x + 3] = 255;

        data[(height- th) * line + x    ] = col.r;
        data[(height- th) * line + x + 1] = col.g;
        data[(height- th) * line + x + 2] = col.b;
        data[(height- th) * line + x + 3] = 255;
    }

    for (let y = 0; y < height; y++)
    {
        data[y * line + tw * 4] = col.r;
        data[y * line + tw * 4 + 1] = col.g;
        data[y * line + tw * 4 + 2] = col.b;
        data[y * line + tw * 4 + 3] = 255;

        data[y * line + (width - tw) * 4] = col.r;
        data[y * line + (width - tw) * 4 + 1] = col.g;
        data[y * line + (width - tw) * 4 + 2] = col.b;
        data[y * line + (width - tw) * 4 + 3] = 255;
    }

    return img.writeAsync(outFile)

    //console.log(bitmap)
}, err => {
    console.error("ERR:", err);
    process.exit(2);
}).then( () => console.log("done"))
