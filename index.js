#!/usr/bin/env node

const fs = require('fs');
const process = require('process');
const fetch = require('node-fetch');
const colors = require('colors');
const cse = require('css-selector-extract');

const cli = require('cli');

const options = cli.parse({
  version: [ 'v', 'Font Awesome Version', 'string', '5.6.3'],                   // Font Awesome Version
  icons: [ 'i', 'JSON file (array of icons)', 'file', 'fa5icons.json'],
  fasizes: [ 's', 'Max of fa-sizes (2 = fa-2x, 3 = fa-3x, ...', 'number', 3]    // Font Awesome Version
});

const faversion = options.version;
const toSize = options.fasizes;
const icons = JSON.parse(fs.readFileSync(options.icons).toString());

fetch(`https://use.fontawesome.com/releases/v${faversion}/css/all.css`)
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

    const wfurl = `https://use.fontawesome.com/releases/v${faversion}/webfonts/`;
    const sizes = [...Array(toSize).keys()].map(e => `.fa-${e+1}x`);
    const core = ['.fa', '.fab', '.fal', '.far', '.fas'];

    const options = {
      css: data,
      filters: [
        ...core,
        ...sizes,
        ...icons.map(e => `.fa-${e}:before`)
      ]
    };

    cse.process(options).then(css => {
      const output = css.replace(/\.\.\/webfonts\//g, wfurl);
      const totalNew = toKb(output);

      console.log('/* font-awesome5-strip by Manz */');
      console.log(output);
      console.warn('Version'.cyan + ': ' + `Font Awesome v${faversion}`.green);
      console.warn('Used icons'.cyan + `: ${icons.length}`.yellow);
      console.warn('Original'.cyan + `: ${totalSize}KB`);
      console.warn('Optimized'.cyan + ': ' + (totalNew + 'KB').green);
    });
});