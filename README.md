# Style2js

Generate helpers to inject your css into the dom when no css loader is available.

For example the command below will output 3 files into your dist folder

```sh
style2js style.min.css --out-dir ./dist
|_ inject-style.js
|_ inject-style.esm.js
|_ inject-style.d.ts
```

When someone use your library, he can do the following to load the css

```js
import { injectStyle } from "your-library/inject-style";
// inject the stylesheet into the dom
injectStyle();
```

## Installation

You can install the package with npm or yarn

```sh
npm i style2js
// with yarn
yarn add style2js
```
Or use it directly via npx

```sh
npx style2js
```



