#!/usr/bin/env node
const { program } = require('commander');
const { existsSync } = require('fs');
const { style2js } = require('./style2js');

let source;

process.on('uncaughtException', (err) => {
  console.error('😱 Oops, something wrong happened! \x1b[31m%s\x1b[0m', err);
  process.exit(1);
});

program
  .name('style2js')
  .arguments('<source>')
  .action((arg) => {
    if (!existsSync(arg)) {
      throw `The provided source file ${arg} does not exist.`;
    }
    source = arg;
  })
  .requiredOption(
    '--out-dir <dir>',
    'Output directory where to put the generated files',
    (dir) => {
      if (!existsSync(dir)) {
        throw `The provided directory ${dir} does not exist.`;
      }
      return dir;
    }
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

style2js({ source, ...program })
  .then(() => {
    console.log('Style generated 🤘!');
  })
  .catch((err) => {
    throw err;
  });
