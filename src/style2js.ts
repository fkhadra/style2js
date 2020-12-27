import { readFile, writeFile } from 'fs/promises';
import { join, parse } from 'path';
import { existsSync } from 'fs';

export interface Style2jsParams {
  source: string;
  outDir: string;
  filename?: string;
  exportAs?: string;
  appendToFile?: boolean;
  genTypes?: boolean;
  esm?: boolean;
}

export const enum DefaultParams {
  FILENAME = 'inject-style.js',
  EXPORT_AS = 'injectStyle',
  APPEND_TO_FILE = 0,
  TYPE_DEF = 1,
  ESM = 1,
}

export async function style2js({
  source,
  outDir,
  filename = DefaultParams.FILENAME,
  exportAs = DefaultParams.EXPORT_AS,
  appendToFile = Boolean(DefaultParams.APPEND_TO_FILE),
  genTypes = Boolean(DefaultParams.TYPE_DEF),
  esm = Boolean(DefaultParams.ESM),
}: Style2jsParams) {
  try {
    if (!existsSync(source))
      throw `The provided source file ${source} does not exist.`;

    if (!existsSync(outDir))
      throw `The provided directory ${outDir} does not exist.`;

    const style = (await readFile(source, 'utf-8')).replace(/\r?\n|\r/g, '');
    const writeFlag = appendToFile ? 'a' : 'w';

    console.log('EHREKRJEK');

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
  } catch (error) {
    console.error(
      '😱 Oops, something wrong happened! \x1b[31m%s\x1b[0m',
      error
    );
    process.exit(1);
  }
}
