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

import ciabotMontebellina from "./ciabot-montebellina/project.js";
import cerimonias from "./edificio-para-cerimonias-desconocidas/project.js";
import dahlia from "./dahlia/project.js";
import tamaco from "./tamaco/project.js";


export const projects = [
    ciabotMontebellina,
    cerimonias,
    dahlia,
    tamaco
];
