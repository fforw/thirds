
const colorRegExp = /^(#)?([0-9a-f]+)$/i;

function Color(r,g,b)
{
    this.r = r;
    this.g = g;
    this.b = b;
}


Color.validate = function(color)
{

    let m;
    if (typeof color !== "string" || !(m = colorRegExp.exec(color)))
    {
        return null;
    }
    const col = m[2];

    if (col.length === 3)
    {
        return new Color(
            parseInt(col[0], 16) * 17,
            parseInt(col[1], 16) * 17,
            parseInt(col[2], 16) * 17
        )
    }
    else if (col.length === 6)
    {
        return new Color(
            parseInt(col.substring(0, 2), 16),
            parseInt(col.substring(2, 4), 16),
            parseInt(col.substring(4, 6), 16)
        )
    }
    else
    {
        return null;
    }
}



Color.prototype.toHex = function()
{
    return (this.r << 16) + (this.g << 8) + this.b;
}

module.exports = Color
