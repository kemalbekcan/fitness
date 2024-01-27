import UglifyJS from 'uglify-js';
import chalk from 'chalk';
import fs from 'fs';

const processJavaScript = async () => {
    const jsFilePath = './templates/default/views/assets/scripts/script.js';
    const minifiedJSPath = './public/scripts/script.min.js';
    try {
        const jsContent = fs.readFileSync(jsFilePath, 'utf8');
        const minifiedJSContent = UglifyJS.minify(jsContent).code;
        fs.writeFileSync(minifiedJSPath, minifiedJSContent);
        console.log(chalk.green('JS minified successfully!'));
    } catch (error) {
        console.log(chalk.red('Error minifying JS:', error));
    }
}

processJavaScript();