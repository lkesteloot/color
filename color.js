// Copyright 2019 Lawrence Kesteloot
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//    http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Returns two-byte hex string for byte in the range [0..255].
var byteToHex = function (x) {
    let s = x.toString(16);

    if (s.length == 1) {
        s = "0" + s;
    }

    return s;
};

// Returns string "#rrgggbb" for RGB array in "r" or individual values in r, g, and b [0..255].
var rgbToCss = function (r, g, b) {
    if (arguments.length === 1) {
        b = r[2];
        g = r[1];
        r = r[0];
    }

    return "#" + byteToHex(r) + byteToHex(g) + byteToHex(b);
};

// Convert RGB in the range [0..1] to the range [0..255].
var rgbTo255 = function (r, g, b) {
    if (arguments.length === 1) {
        b = r[2];
        g = r[1];
        r = r[0];
    }

    return [
        Math.floor(r*255.9),
        Math.floor(g*255.9),
        Math.floor(b*255.9)
    ];
};

// hsv = [0..1], rgb = [0..1].
var hsvToRgb = function (h, s, v) {
    var r, g, b;

    var i = Math.floor(h*6);
    var f = h*6 - i;
    var p = v*(1 - s);
    var q = v*(1 - f*s);
    var t = v*(1 - (1 - f)*s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [ r, g, b ];
};

// Wavelength functions from https://stackoverflow.com/a/34581745/211234.

/**
 * Convert a wavelength in the visible light spectrum to a RGB color value that
 * is suitable to be displayed on a monitor.
 *
 * @param wavelength wavelength in nm
 * @return RGB color array [0..1].
 */
var wavelengthToRgb = function (wavelength) {
    let xyz = cie1931WavelengthToXyzFit(wavelength);
    return xyzToRgb(xyz);
};

/**
 * Convert XYZ to RGB in the sRGB color space. The conversion matrix and
 * color component transfer function is taken from
 * http://www.color.org/srgb.pdf, which follows the International
 * Electrotechnical Commission standard IEC 61966-2-1 "Multimedia systems and
 * equipment - Colour measurement and management - Part 2-1: Colour management
 * - Default RGB colour space - sRGB".
 *
 * @param xyz XYZ values in a double array in the order of X, Y, Z. each value
 * in the range of [0..1]
 * @return RGB values in a double array, in the order of R, G, B. each value in
 * the range of [0..1]
 */
var xyzToRgb = function (x, y, z) {
    if (arguments.length === 1) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    let r =  3.2406255*x + -1.537208 *y + -0.4986286*z;
    let g = -0.9689307*x +  1.8757561*y +  0.0415175*z;
    let b =  0.0557101*x + -0.2040211*y +  1.0569959*z;

    return [
        xyzToRgbPostProcess(r),
        xyzToRgbPostProcess(g),
        xyzToRgbPostProcess(b)
    ];
};

/**
 * Helper function for xyzToRgb().
 */
var xyzToRgbPostProcess = function (c) {
    // Clip if c is out of range.
    c = c > 1 ? 1 : (c < 0 ? 0 : c);

    // apply the color component transfer function
    c = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1. / 2.4) - 0.055;

    return c;
};

/**
 * A multi-lobe, piecewise Gaussian fit of CIE 1931 XYZ Color Matching
 * Functions by Wyman el al. from Nvidia. The code here is adopted from the
 * Listing 1 of the paper authored by Wyman et al. <p> Reference: Chris Wyman,
 * Peter-Pike Sloan, and Peter Shirley, Simple Analytic Approximations to the
 * CIE XYZ Color Matching Functions, Journal of Computer Graphics Techniques
 * (JCGT), vol. 2, no. 2, 1-11, 2013.
 *
 * @param wavelength wavelength in nm
 * @return XYZ in a double array in the order of X, Y, Z. each value in the
 * range of [0..1]
 */
var cie1931WavelengthToXyzFit = function (wavelength) {
    let x;
    {
        let t1 = (wavelength - 442.0) * ((wavelength < 442.0) ? 0.0624 : 0.0374);
        let t2 = (wavelength - 599.8) * ((wavelength < 599.8) ? 0.0264 : 0.0323);
        let t3 = (wavelength - 501.1) * ((wavelength < 501.1) ? 0.0490 : 0.0382);

        x =   0.362 * Math.exp(-0.5 * t1 * t1)
            + 1.056 * Math.exp(-0.5 * t2 * t2)
            - 0.065 * Math.exp(-0.5 * t3 * t3);
    }

    let y;
    {
        let t1 = (wavelength - 568.8) * ((wavelength < 568.8) ? 0.0213 : 0.0247);
        let t2 = (wavelength - 530.9) * ((wavelength < 530.9) ? 0.0613 : 0.0322);

        y =   0.821 * Math.exp(-0.5 * t1 * t1)
            + 0.286 * Math.exp(-0.5 * t2 * t2);
    }

    let z;
    {
        let t1 = (wavelength - 437.0) * ((wavelength < 437.0) ? 0.0845 : 0.0278);
        let t2 = (wavelength - 459.0) * ((wavelength < 459.0) ? 0.0385 : 0.0725);

        z =   1.217 * Math.exp(-0.5 * t1 * t1)
            + 0.681 * Math.exp(-0.5 * t2 * t2);
    }

    return [ x, y, z ];
};
