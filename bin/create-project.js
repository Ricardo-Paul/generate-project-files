#!/usr/bin/env node
require = require('esm')(module);


require('../src/cli').cli(process.argv);

// console.log('hi')






// ES6 Module Syntax (export myfunction)
// commonJS module syntax (module.exports = )
// commonJS module syntax is used by NodeJS
// the solution is to use babel to transpile ES6 syntax to commonJS OR
// esm