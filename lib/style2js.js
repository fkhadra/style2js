const { readFile, writeFile } = require('fs/promises');
const { join, parse } = require('path');

async function style2js({
  source,
  outDir,
  filename = 'inject-style.js',
  exportAs = 'injectStyle',
  appendToFile = false,
  genTypes = true,
  esm = true,
}) {
  const style = (await readFile(source, 'utf-8')).replace(/\r?\n|\r/g, '');
  const writeFlag = appendToFile ? 'a' : 'w';

  // cjs
  await writeFile(
    join(outDir, filename),
    `
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.${exportAs} = ${exportAs};
  function ${exportAs}() {
    var style = "${style}";
    var css = document.createElement('style');
    css.innerText = style;
    document.head.appendChild(css);
  }`,
    {
      flag: writeFlag,
    }
  );

  if (esm) {
    const esmFilename = `${parse(filename).name}.esm.js`;

    await writeFile(
      join(outDir, esmFilename),
      `
    export function ${exportAs}() {
      var style = "${style}";
      var css = document.createElement('style');
      css.innerText = style;
      document.head.appendChild(css);
    }`,
      {
        flag: writeFlag,
      }
    );
  }

  if (genTypes) {
    await writeFile(
      join(outDir, `${filename}.d.ts`),
      `
    /**
     * Inject the style in case you cannot import the css file
     * Call it once in your app
     */
    export declare function ${exportAs}(): void;
    
        `,
      {
        flag: writeFlag,
      }
    );
  }
}

module.exports = {
  style2js,
};
