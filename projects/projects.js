// ============================================================
// PROJECT REGISTRY
// ============================================================
// This file controls which projects appear on the website.
//
// To add a new project:
// 1. Create its folder inside /projects/
// 2. Create its project.js file
// 3. Import it here
// 4. Add it to the projects array
// ============================================================

import montebellina from "./montebellina/project.js";
import cerimonias from "./cerimonias/project.js";
import dahlia from "./dahlia/project.js";
import tamaco from "./tamaco/project.js";
import livmats from "./livmats/project.js";
import palabras from "./palabras/project.js";
import furetsu from "./furetsu/project.js";

export const projects = [
    montebellina,
    cerimonias,
    dahlia,
    tamaco,
    livmats,
    palabras,
    furetsu
];
