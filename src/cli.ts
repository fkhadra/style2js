#!/usr/bin/env node

import { program } from 'commander';
import { style2js, Style2jsParams } from './style2js';

let source = '';

program
  .name('style2js')
  .description(
    `
Generate js file to inject your css into the dom.
For example the command below will output 3 files into your dist folder

style2js style.min.css --out-dir ./dist
|_ inject-style.js
|_ inject-style.esm.js
|_ inject-style.d.ts

When someone use your library, he can do the following to load the css

import { injectStyle } from "your-library/inject-style";
// inject the stylesheet into the dom
injectStyle();
    `
  )
  .arguments('<source>')
  .action((arg) => {
    source = arg;
  })
  .requiredOption(
    '--out-dir <dir>',
    'Output directory where to put the generated files'
  )
  .option(
    '--export-as <function name>',
    'Function name used to import the generated style',
    'injectStyle'
  )
  .option(
    '--filename <filename>',
    'Output filename without extension',
    'inject-style'
  )
  .option('--gen-types', 'Generate typescript definition', true)
  .option('--esm', 'Generate esm file', true);

if (process.argv.length < 3) program.help();

program.parse(process.argv);

const options = program.opts() as Omit<Style2jsParams, 'source'>;

style2js({ source, ...options })
  .then(() => {
    console.log('Style generated 🤘!');
  })
  .catch((err) => {
    throw err;
  });
