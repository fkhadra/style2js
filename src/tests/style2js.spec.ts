import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { DefaultParams, style2js } from '../style2js';

//@ts-expect-error
const processExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const OUT_DIR = './out';
const ONE_LINE_CSS_FILE = join(OUT_DIR, 'one-line.css');

beforeAll(() => {
  process.chdir(__dirname);

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR);

  writeFileSync(ONE_LINE_CSS_FILE, '.foo{display:flex;}');
});

afterAll(() => {
  processExit.mockRestore();
  consoleError.mockRestore();
});

/**
 * Generate filename with extension
 *
 */
function getFilenames(filename: string) {
  return ['js', 'esm.js', 'd.ts'].map((ext) =>
    join(OUT_DIR, `${filename}.${ext}`)
  );
}

describe('style2js', () => {
  it('Should exit when input file does not exist', () => {
    style2js({
      source: '',
      outDir: '',
    });
    expect(consoleError).toHaveBeenCalled();
    expect(processExit).toHaveBeenCalledWith(1);
  });

  it('Should exit when out directory does not exist', () => {
    style2js({
      source: './style2js.spec.ts',
      outDir: 'foobar',
    });
    expect(consoleError).toHaveBeenCalled();
    expect(processExit).toHaveBeenCalledWith(1);
  });

  it('Should create 3 files using the default filename', (done) => {
    const [cjs, esm, typeDef] = getFilenames(DefaultParams.FILENAME);

    style2js({
      source: ONE_LINE_CSS_FILE,
      outDir: OUT_DIR,
    }).then(() => {
      expect(existsSync(cjs)).toBe(true);
      expect(existsSync(esm)).toBe(true);
      expect(existsSync(typeDef)).toBe(true);

      done();
    });
  });

  it('Allow to specify filename', (done) => {
    const [cjs, esm, typeDef] = getFilenames('foobar');

    style2js({
      filename: 'foobar',
      source: ONE_LINE_CSS_FILE,
      outDir: OUT_DIR,
    }).then(() => {
      expect(existsSync(cjs)).toBe(true);
      expect(existsSync(esm)).toBe(true);
      expect(existsSync(typeDef)).toBe(true);

      done();
    });
  });

  it('Allow to disable type definition', (done) => {
    const [cjs, esm, typeDef] = getFilenames('without-types');

    style2js({
      filename: 'without-types',
      source: ONE_LINE_CSS_FILE,
      outDir: OUT_DIR,
      genTypes: false,
    }).then(() => {
      expect(existsSync(cjs)).toBe(true);
      expect(existsSync(esm)).toBe(true);
      expect(existsSync(typeDef)).toBe(false);

      done();
    });
  });

  it('Allow to disable esm', (done) => {
    const [cjs, esm, typeDef] = getFilenames('without-esm');

    style2js({
      filename: 'without-esm',
      source: ONE_LINE_CSS_FILE,
      outDir: OUT_DIR,
      esm: false,
    }).then(() => {
      expect(existsSync(cjs)).toBe(true);
      expect(existsSync(esm)).toBe(false);
      expect(existsSync(typeDef)).toBe(true);

      done();
    });
  });

  it('Allow to specify export name', (done) => {
    const [cjs, esm, typeDef] = getFilenames('export-as');
    const patternToMatch = /function loadStyle\(\)/g;

    style2js({
      exportAs: 'loadStyle',
      filename: 'export-as',
      source: ONE_LINE_CSS_FILE,
      outDir: OUT_DIR,
    }).then(() => {
      expect(existsSync(cjs)).toBe(true);
      expect(existsSync(esm)).toBe(true);
      expect(existsSync(typeDef)).toBe(true);

      const cjsContent = readFileSync(cjs, { encoding: 'utf-8' });
      expect(cjsContent).toMatch(patternToMatch);

      const esmContent = readFileSync(esm, { encoding: 'utf-8' });
      expect(esmContent).toMatch(patternToMatch);

      const typeDefContent = readFileSync(typeDef, { encoding: 'utf-8' });
      expect(typeDefContent).toMatch(patternToMatch);

      done();
    });
  });
});
