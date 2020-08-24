const Yargs = require('yargs')
    .option('size', {
        alias: 's',
        describe: 'Max clump size',
    })
    .option('max', {
        describe: 'Max clump count',
    })
    .option('min', {
        describe: 'Min clump count',
    })
    .option('pow', {
        alias: 'p',
        describe: 'Clump distribution power',
    })
    .option('step', {
        describe: 'clump size step',
    })
    .default("pow", 3, "(power of distribution)")
    .default("step", 1, "clump size step")
    .help();
const argv = Yargs
    .argv;

const fileArgs = argv._;
if (fileArgs.length < 2)
{
    console.log("Usage: clumpomatic <in> <out>");
    console.log("Replace random squares of different sizes with the averaged color within those areas.");
    Yargs.showHelp();
    process.exit(1);
}


function config(size, min, max, pow, step)
{
    const minSize =  size - Math.floor((size - 2)/step) * step;
    return (v) => min + Math.pow(1 - (v - minSize) / (size - minSize), pow) * (max - min);
}

const { size, min, max, pow = 3, step = 1 } = argv;


if (size === undefined)
{
    console.log("Need --size")
    process.exit(1);
}
if (min === undefined)
{
    console.log("Need --min")
    process.exit(1);
}
if (max === undefined)
{
    console.log("Need --max")
    process.exit(1);
}

const getAmount = config(size, min, max, pow, step);


const Jimp = require("jimp");


const [ inFile, outFile ] = fileArgs;

Jimp.read(inFile).then(img => {
    const { bitmap } = img;

    for (let i=size; i > 1; i -= step)
    {
        const count = getAmount((i));
        console.log(count, "x size ", i, " clumps");

        const { width, height, data } = bitmap;


        for (let j = 0; j < count ; j++)
        {
            const cx = (Math.random() * (width - size))|0;
            const cy = (Math.random() * (height - size))|0;

            let sumR = 0;
            let sumG = 0;
            let sumB = 0;
            let sumA = 0;
            let lineOffset = cy * width;
            for (let y = cy; y < cy + size; y++)
            {
                for (let x = cx; x < cx + size; x++)
                {
                    const off = (x + lineOffset) << 2;
                    const r = data[off    ];
                    const g = data[off + 1];
                    const b = data[off + 2];
                    const a = data[off + 3];

                    sumR += r*r;
                    sumG += g*g;
                    sumB += b*b;
                    sumA += a;

                }
                lineOffset += width;
            }

            const sq = size * size;
            const r = Math.sqrt(sumR / sq);
            const g = Math.sqrt(sumG / sq);
            const b = Math.sqrt(sumB / sq);
            const a = (sumA / sq);

            lineOffset = cy * width;
            for (let y = cy; y < cy + size; y++)
            {
                for (let x = cx; x < cx + size; x++)
                {
                    const off = (x + lineOffset) << 2;
                    data[off    ] = r;
                    data[off + 1] = g;
                    data[off + 2] = b;
                    data[off + 3] = a;
                }
                lineOffset += width;
            }
        }


    }

    return img.writeAsync(outFile)

    //console.log(bitmap)
}, err => {
    console.error("ERR:", err);
    process.exit(2);
}).then( () => console.log("done"))
