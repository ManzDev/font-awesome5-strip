const fs = require('fs');
const fetch = require('node-fetch');
const colors = require('colors');
const cse = require('css-selector-extract');

const faversion = '5.6.3';      // Font Awesome Version
const toSize = 3;               // Sizes: 10 = fa-1x, fa-2x, ... fa-10x
const icons = [
  'book', 
  'codepen', 
  'css3-alt', 
  'github', 
  'globe-americas', 
  'graduation-cap', 
  'heart', 
  'home', 
  'html5', 
  'js', 
  'linkedin-in',
  'linkedin',
  'terminal', 
  'twitter', 
  'user',
  'star'
];

fetch(`https://use.fontawesome.com/releases/v${faversion}/css/all.css`)
  .then(res => res.text())
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
    
    console.log('/* font-awesome5-strip by Manz */');
    cse.process(options).then(css => {
      const output = css.replace(/\.\.\/webfonts\//g, wfurl);
      const totalNew = toKb(output);
      console.warn(`Font Awesome v${faversion}`.green);
      console.warn('Icons'.yellow + `: ${icons.length}`);
      console.warn('Original'.cyan + `: ${totalSize}KB`);
      console.warn('Optimized'.cyan + ': ' + (totalNew + 'KB').green);
      console.log(output);
    });
});