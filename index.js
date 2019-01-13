#!/usr/bin/env node

const fs = require('fs');
const process = require('process');
const fetch = require('node-fetch');
const colors = require('colors');
const cse = require('css-selector-extract');

const cli = require('cli');

const options = cli.parse({
  version: [ 'v', 'Font Awesome Version', 'string', '5.6.3'],
  icons: [ 'i', 'JSON file (array of icons)', 'file', 'fa5icons.json'],
  fasizes: [ 's', 'Max of fa-sizes (1 = fa-1x, 2 = fa-2x, 3 = fa-3x, ...', 'number', 3],
  responsive: [ 'r', 'Add responsive classes (fa-lg, fa-xs, fa-sm...', true, false],
  effects: [ 'e', 'Add effects classes (fa-spin, fa-rotate-90, ...)', true, false]
});

const icons = JSON.parse(fs.readFileSync(options.icons).toString());

fetch(`https://use.fontawesome.com/releases/v${options.version}/css/all.css`)
  .catch(err => console.error(err))
  .then(res => {
    if (res.ok)
      return res.text()
    else {
      console.warn('Error'.red + ': Version not found');
      process.exit(-1);
    }
  })
  .then(data => {

    const toKb = num => Math.round((Buffer.byteLength(num, 'utf8') / 1024) * 100) / 100;
    const totalSize = toKb(data);

    const wfurl = `https://use.fontawesome.com/releases/v${options.version}/webfonts/`;
    const sizes = [...Array(options.fasizes).keys()].map(e => `.fa-${e+1}x`);
    const core = ['.fa', '.fab', '.fal', '.far', '.fas'];

    const cse_options = {
      css: data,
      filters: [
        ...core,
        ...sizes,
        ...icons.map(e => `.fa-${e}:before`)
      ]
    };

    if (options.responsive)
      cse_options.filters.push(...['.fa-lg', '.fa-xs', '.fa-sm']);

    if (options.effects)
      cse_options.filters.push(...[/\.fa\-spin/, '.fa-pulse', /\.fa\-rotate\-/, /\.fa\-flip\-(horizontal|vertical)/,
                                   '.fa-stack', '.fa-stack-1x', '.fa-stack-2x', '.fa-inverse']);

    cse.process(cse_options).then(css => {
      const output = css.replace(/\.\.\/webfonts\//g, wfurl);
      const totalNew = toKb(output);

      console.log('/* font-awesome5-strip by Manz */');
      console.log(output);

      // fix: css-selector-extract don't support @keyframes
      if (options.effects)
        console.log('@keyframes fa-spin { 0% { transform: rotate(0deg) } to { transform: rotate(1turn) } }');

      console.warn('Version'.cyan + ': ' + `Font Awesome v${options.version}`.green);
      console.warn('Used icons'.cyan + `: ${icons.length}`.yellow);
      console.warn('Original'.cyan + `: ${totalSize}KB`);
      console.warn('Optimized'.cyan + ': ' + (totalNew + 'KB').green);
    });
});