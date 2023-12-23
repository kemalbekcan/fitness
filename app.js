import express from 'express';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import compression from 'compression'
import CleanCSS from 'clean-css';
import cors from 'cors';
import { fileURLToPath } from 'url';


const app = express();

// Helmet middleware'i ekleyin ve CSP özelliklerini özelleştirin
app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'trusted-scripts.com'],
    },
  }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSS sıkıştırma işlemi
const cssPath = path.join(__dirname, 'public', 'styles', 'style.css');
const minifiedCSSPath = path.join(__dirname, 'public', 'styles', 'style.min.css');

const cssContent = fs.readFileSync(cssPath, 'utf8');
const minifiedCSSContent = new CleanCSS().minify(cssContent).styles;

fs.writeFileSync(minifiedCSSPath, minifiedCSSContent);


// Resim sıkıştırma işlemi
const inputImagePath = path.join(__dirname, '/public', 'images');
const outputImagePath = path.join(__dirname, '/public', 'compressed-images');

imagemin([`${inputImagePath}/*.{jpg,png}`], {
    destination: outputImagePath,
    plugins: [imageminMozjpeg({ quality: 80 })],
}).then(() => {
    console.log('Images compressed successfully!');
});

// Gzip sıkıştırma middleware'ini ekleyin
app.use(compression());

app.use(express.static(path.join(__dirname, '/public')));
app.use(cors());
app.use(express.json());

app.set('view engine', 'ejs');

// index page 
app.get('/', function (req, res) {
    const head = {
        title: 'Anasayfa',
        description: 'Anasayfa açıklaması',
        keywords: 'Anasayfa anahtar kelimeler',
        author: 'Anasayfa yazarı'
    };

    var mascots = [
        { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012 },
        { name: 'Tux', organization: "Linux", birth_year: 1996 },
        { name: 'Moby Dock', organization: "Docker", birth_year: 2013 }
    ];
    var tagline = "No programming concept is complete without a cute animal mascot.";

    res.render('pages/index', {
        head,
        mascots: mascots,
        tagline: tagline
    });
});

// about page
app.get('/about', function (req, res) {
    res.render('pages/about');
});

app.listen(3000, () => console.log('http://localhost:3000 🚀'));