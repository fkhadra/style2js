#!/usr/bin/env node

import { program } from 'commander';
import { style2js, Style2jsParams } from './style2js';

let source = '';

program
  .name('style2js')
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
  .option('--filename <filename>', 'Output filename', 'inject-style.js')
  .option('--gen-types', 'Generate typescript definition', true)
  .option('--append-to-file', 'Append to file if it exists', false);

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
