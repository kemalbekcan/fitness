// build-scss.js

import { exec } from 'child_process';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import fs from 'fs';
import * as sass from 'sass';
import CleanCSS from 'clean-css';
import UglifyJS from 'uglify-js';

const inputFilePath = './views/scss/main.scss';
const outputFilePath = './public/styles/style.min.css';
const jsFilePath = './views/assets/scripts/script.js';
const minifiedJSPath = './public/scripts/script.min.js';

// Compile SCSS, apply Autoprefixer, and minify CSS
sass.render(
    {
        file: inputFilePath,
        outputStyle: 'compressed', // You can change this to 'expanded' for development
    },
    (error, result) => {
        if (!error) {
            postcss([autoprefixer])
                .process(result.css, { from: undefined })
                .then((result) => {
                    const minifiedCSSContent = new CleanCSS().minify(result.css).styles;
                    fs.writeFileSync(outputFilePath, minifiedCSSContent);
                    console.log('SCSS compiled, Autoprefixer applied, and CSS minified successfully!');
                })
                .catch((error) => {
                    console.error('Error applying Autoprefixer:', error);
                });
        } else {
            console.error('Error compiling SCSS:', error);
        }
    }
);

// Minify JS
const jsContent = fs.readFileSync(jsFilePath, 'utf8');
const minifiedJSContent = UglifyJS.minify(jsContent).code;
fs.writeFileSync(minifiedJSPath, minifiedJSContent);
console.log('JS minified successfully!');
