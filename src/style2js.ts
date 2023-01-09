import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface Style2jsParams {
  source: string;
  outDir: string;
  filename?: string;
  exportAs?: string;
  genTypes?: boolean;
  esm?: boolean;
}

export const enum DefaultParams {
  FILENAME = 'inject-style',
  EXPORT_AS = 'injectStyle',
  TYPE_DEF = 1,
  ESM = 1,
}

export async function style2js({
  source,
  outDir,
  filename = DefaultParams.FILENAME,
  exportAs = DefaultParams.EXPORT_AS,
  genTypes = Boolean(DefaultParams.TYPE_DEF),
  esm = Boolean(DefaultParams.ESM),
}: Style2jsParams) {
  try {
    if (!existsSync(source))
      throw `The provided source file ${source} does not exist.`;

    if (!existsSync(outDir))
      throw `The provided directory ${outDir} does not exist.`;

    const style = (await readFile(source, 'utf-8')).replace(/\r?\n|\r/g, '');

    const writeFlag = 'w';

    // cjs
    await writeFile(
      join(outDir, `${filename}.js`),
      `
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {value: true});
  exports.${exportAs} = ${exportAs};
  function ${exportAs}(window_ = window) {
    var style = "${style}";
    var css = window_.document.createElement('style');
    css.innerText = style;
    window_.document.head.appendChild(css);
  }`,
      {
        flag: writeFlag,
      }
    );

    if (esm) {
      await writeFile(
        join(outDir, `${filename}.esm.mjs`),
        `
    export function ${exportAs}(window_ = window) {
      var style = "${style}";
      var css = window_.document.createElement('style');
      css.innerText = style;
      window_.document.head.appendChild(css);
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
    export declare function ${exportAs}(window_?: typeof window): void;
    
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
