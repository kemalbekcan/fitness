import express from 'express';
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
import morgan from 'morgan'; // Morgan ekleyin
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
            scriptSrc: ["'self'", 'https://your-production-domain.com'],
        },
    }));

    // CSS ve JS'yi minify et
    // await minifyCSS();
    // await minifyJS();
    // Resimleri sıkıştır
    // await compressImages();
} else {
    console.log('Environment is not production!');
    // Development veya başka bir ortamda özel işlemler veya yapılandırmalar
    // Morgan'ı kullanarak günlük bilgisi almak için
    app.use(morgan('dev'));
}

// Define file paths
const cssPath = path.join(__dirname, 'public', 'styles', 'style.css');
const minifiedCSSPath = path.join(__dirname, 'public', 'styles', 'style.min.css');
const jsPath = path.join(__dirname, 'public', 'scripts', 'script.js');
const minifiedJSPath = path.join(__dirname, 'public', 'scripts', 'script.min.js');
const inputImagePath = path.join(__dirname, '/public', 'images');
const outputImagePath = path.join(__dirname, '/public', 'compressed-images');

// Function to minify CSS
async function minifyCSS() {
    return new Promise((resolve, reject) => {
        try {
            const cssContent = fs.readFileSync(cssPath, 'utf8');
            const minifiedCSSContent = new CleanCSS().minify(cssContent).styles;
            fs.writeFileSync(minifiedCSSPath, minifiedCSSContent);
            console.log('CSS minified successfully!');
            resolve();
        } catch (error) {
            console.error('Error minifying CSS:', error);
            reject(error);
        }
    });
}

// Function to minify JS
async function minifyJS() {
    return new Promise((resolve, reject) => {
        try {
            const jsContent = fs.readFileSync(jsPath, 'utf8');
            const minifyOptions = {}; // Customize options if needed
            const minifiedJSContent = UglifyJS.minify(jsContent, minifyOptions).code;
            fs.writeFileSync(minifiedJSPath, minifiedJSContent);
            console.log('JS minified successfully!');
            resolve();
        } catch (error) {
            console.error('Error minifying JS:', error);
            reject(error);
        }
    });
}

// Function to compress images
async function compressImages() {
    try {
        await imagemin([`${inputImagePath}/*.{jpg,png}`], {
            destination: outputImagePath,
            plugins: [imageminMozjpeg({ quality: 80 })],
        });
        console.log('Images compressed successfully!');
    } catch (error) {
        console.error('Error compressing images:', error);
    }
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

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
    console.log(`Server is running on http://localhost:${PORT} 🚀`);
});

// Call functions conditionally based on environment
// if (process.env.NODE_ENV === 'production') {
//     minifyCSS();
//     minifyJS();
//     compressImages();
// }

minifyCSS();
minifyJS();
compressImages();
