import express from 'express';
import { exec } from 'child_process';
import expressStaticGzip from 'express-static-gzip';
import 'dotenv/config'
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import compression from 'compression';
import CleanCSS from 'clean-css';
import UglifyJS from 'uglify-js';
import cors from 'cors';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import chalk from 'chalk';
import router from './routes/routes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NODE_ENV kontrolü
if (process.env.NODE_ENV === 'production') {
    console.log('Environment is production!');
    // Production ortamında özel işlemler veya yapılandırmalar
    app.use(compression());

    // Apply Helmet middleware with customized CSP for production
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
    // await compressImages();
} else {
    console.log(chalk.yellow('Environment is production!'));
    // Development veya başka bir ortamda özel işlemler veya yapılandırmalar
    // Morgan'ı kullanarak günlük bilgisi almak için
    app.use(morgan('dev'));

    // SCSS derleme ve Autoprefixer'ı uygulama için script'i çalıştır
    exec('npm run dev', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            return;
        }
        console.log(`SCSS and Autoprefixer output: ${stdout}`);
    });
}

// Define file paths
const cssPath = path.join(__dirname, 'views', 'assets', 'styles', 'style.css');
const minifiedCSSPath = path.join(__dirname, 'public', 'styles', 'style.min.css');
const jsPath = path.join(__dirname, 'views', 'assets', 'scripts', 'script.js');
const minifiedJSPath = path.join(__dirname, 'public', 'scripts', 'script.min.js');
const inputImagePath = path.join(__dirname, 'views', 'assets', 'images');
const outputImagePath = path.join(__dirname, 'public', 'images');

// Function to compress images
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

// Express-static-gzip middleware'i ekleyin ve yapılandırın
app.use('/public', expressStaticGzip(path.join(__dirname, 'public'), {
    enableBrotli: true,  // Brotli sıkıştırma kullan
    orderPreference: ['br'],  // Tarayıcının Brotli'yi tercih etmesini sağla
    setHeaders: (res, path) => {
        // Önbellek başlıklarını ayarla
        res.setHeader('Cache-Control', 'public, max-age=31536000');  // 1 yıl (saniye cinsinden)
        res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());  // 1 yıl sonra sona erer
        res.setHeader('Pragma', 'public');
        res.setHeader('Vary', 'Accept-Encoding');  // Tarayıcı sıkıştırma tercihini dikkate al
    },
}));

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: ');
});

// EJS şablonlarını bulunduran dizin
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');

// Use the router
app.use(router);

// Define routes
app.get('/', (req, res) => {
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

    res.render('pages/index', {
        head,
        mascots,
        tagline,
    });
});

app.get('/about', (req, res) => {
    res.render('pages/about');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(chalk.blue(`Server is running on http://localhost:${PORT} 🚀`));

    compressImages();
});

// Call functions conditionally based on environment
// if (process.env.NODE_ENV === 'production') {
//     minifyCSS();
//     minifyJS();
//     compressImages();
// }
  

