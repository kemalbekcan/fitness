// build-scss.js

import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import fs from 'fs';
import chalk from 'chalk';
import * as sass from 'sass';
import CleanCSS from 'clean-css';

const inputFilePath = './templates/default/views/scss/main.scss';
const outputFilePath = './public/styles/style.min.css';

// Compile SCSS, apply Autoprefixer, and minify CSS
sass.render(
    {
        file: inputFilePath,
        outputStyle: 'compressed',
    },
    (error, result) => {
        if (!error) {
            postcss([autoprefixer])
                .process(result.css, { from: undefined })
                .then((result) => {
                    const minifiedCSSContent = new CleanCSS().minify(result.css).styles;
                    fs.writeFileSync(outputFilePath, minifiedCSSContent);
                    console.log(chalk.green('SCSS compiled, Autoprefixer applied, and CSS minified successfully!'));
                })
                .catch((error) => {
                    console.log(chalk.red('Error applying Autoprefixer:', error));
                });
        } else {
            console.log(chalk.red('Error compiling SCSS:', error));
        }
    }
);
