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

// hsv = 0..1, rgb = 0..255.
function hsvToRgb(h, s, v) {
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

    return [ Math.floor(r*255.9), Math.floor(g*255.9), Math.floor(b*255.9) ];
}

// Returns two-byte hex string for byte x (0..255).
var byteToHex = function (x) {
    let s = x.toString(16);

    if (s.length == 1) {
        s = "0" + s;
    }

    return s;
}

// Returns "#rrgggbb" for RGB array in "r" or individual values in r, g, and b (0..255).
function rgbToCss(r, g, b) {
    if (arguments.length === 1) {
        b = r[2];
        g = r[1];
        r = r[0];
    }

    return "#" + byteToHex(r) + byteToHex(g) + byteToHex(b);
}
