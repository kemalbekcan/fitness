import express from 'express';
import rateLimit from 'express-rate-limit';
import expressLayouts from 'express-ejs-layouts';
import { exec } from 'child_process';
import expressStaticGzip from 'express-static-gzip';
import minifyHTML from 'express-minify-html';
import 'dotenv/config';
import helmet from 'helmet';
import path from 'path';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import compression from 'compression';
import cors from 'cors';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import chalk from 'chalk';
import router from './routes/routes.js';
import fs from 'fs';

const app = express();

app.use(minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        minifyJS: true
    }
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const morganMiddleware = morgan(function (tokens, req, res) {
    // return [
    //     '\n\n\n',
    //     chalk.hex('#34ace0').bold(tokens.method(req, res)),
    //     chalk.hex('#ff4757').bold('--> '),
    //     chalk.hex('#ffb142').bold(tokens.status(req, res)),
    //     chalk.hex('#ff4757').bold('--> '),
    //     chalk.hex('#ff5252').bold(tokens.url(req, res)),
    //     chalk.hex('#ff4757').bold('--> '),
    //     chalk.hex('#2ed573').bold(tokens['response-time'](req, res) + ' ms'),
    //     chalk.hex('#ff4757').bold('--> '),
    //     chalk.hex('#f78fb3').bold('@ ' + tokens.date(req, res)),
    //     chalk.hex('#ff4757').bold('--> '),
    //     chalk.yellow(tokens['remote-addr'](req, res)),
    //     chalk.hex('#ff4757').bold('--> '),
    //     chalk.hex('#fffa65').bold('from ' + tokens.referrer(req, res)),
    //     chalk.hex('#ff4757').bold('--> '),
    //     chalk.hex('#1e90ff')(tokens['user-agent'](req, res)),
    //     '\n\n\n',
    // ].join(' ');
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

if (process.env.NODE_ENV === 'production') {
    app.use(compression());

    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'http://localhost:3000'],
        },
    }));

    // CSS ve JS'yi minify et
    // await minifyCSS();
    // await minifyJS();
    // Resimleri sıkıştır
    await compressImages();
} else {
    console.log(chalk.yellow('Environment is dev!'));
    app.use(morganMiddleware);

    // SCSS derleme ve Autoprefixer'ı uygulama için script'i çalıştır
    exec('npm run build-style', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            return;
        }
        console.log(`SCSS and Autoprefixer output: ${stdout}`);
    });
}

const inputImagePath = path.join(__dirname, 'views', 'assets', 'images');
const outputImagePath = path.join(__dirname, 'public', 'images');

async function compressImages() {
    try {
        await imagemin([`${inputImagePath}/*.{jpg,png}`], {
            destination: outputImagePath,
            plugins: [imageminMozjpeg({ quality: 80 })],
        });
        console.log(chalk.green('Images compressed successfully!'));
    } catch (error) {
        console.log(chalk.red('Error compressing images:', error));
    }
}

app.use('/public', expressStaticGzip(path.join(__dirname, 'public'), {
    enableBrotli: true,
    orderPreference: ['br'],
    setHeaders: (res, path) => {
        res.setHeader('Accept-Encoding', 'gzip, br');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
        res.setHeader('Pragma', 'public');
        res.setHeader('Vary', 'Accept-Encoding');
    },
}));

app.use('/manifest.json', express.static(path.join(__dirname, 'manifest.json')));

app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: ');
});

app.set('views', [
    path.join(__dirname, 'templates'),
    path.join(__dirname, 'widgets')
]);

app.use(cors());
app.use(express.json());

app.use(expressLayouts);

const templates = ['default', 'vive'];

const currentTemplate = templates[0]; // backend'den gelecek

fs.readdir('./templates', function (err, files) {
    const templateName = files.find((template) => template === currentTemplate);

    app.set('layout', `./${templateName}/views/layouts/layout.ejs`);
});

app.set('view engine', 'ejs');

import navigationWidgetRouter from './widgets/navigation-widget/index.js';
app.use('/navigation-widget', navigationWidgetRouter);

app.use(router);

// Vite üretim dosyalarını sağlamak için
app.use('/admin', express.static(path.join(__dirname, './dist')));

app.use('/assets', express.static(path.join(__dirname, './dist/assets'), {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    },
}));

app.get('/', async (req, res) => {
    const cssFiles = [
        '/public/styles/style.min.css',
        '/public/dist/css/widget1.bundle.css',
    ];

    const scriptFiles = [
        '/public/scripts/script.min.js',
        '/public/dist/js/widget1.bundle.js',
    ];

    const head = {
        title: 'Anasayfa',
        description: 'Anasayfa açıklaması',
        keywords: 'Anasayfa anahtar kelimeler',
        author: 'Anasayfa yazarı',
    };

    const mascots = [
        { name: 'Sammy', organization: 'DigitalOcean', birth_year: 2012 },
        { name: 'Tux', organization: 'Linux', birth_year: 1996 },
        { name: 'Moby Dock', organization: 'Docker', birth_year: 2013 },
    ];

    const tagline = 'No programming concept is complete without a cute animal mascot.';

    const widgets = [
        { name: 'navigation-widget', route: '../widgets/navigation-widget', data: { menuItems: ['Anasayfa', 'Hakkında', 'İletişim'] } },
    ];

    const manifestFile = '/manifest.json';

    const templates = ['default', 'vive'];

    const currentTemplate = templates[0]; // backend'den gelecek

    fs.readdir('./templates', function (err, files) {
        const templateName = files.find((template) => template === currentTemplate);

        res.render(`${templateName}/views/pages/index`, {
            head,
            mascots,
            tagline,
            data: { menuItems: ['Anasayfa', 'Hakkında', 'İletişim'] },
            widgets,
            cssFiles,
            scriptFiles,
            manifestFile,
            currentTemplate
        });
    });
});

app.get('/about', (req, res) => {
    res.render('pages/about');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(chalk.blue(`Server is running on http://localhost:${PORT} 🚀`));
});
