import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname + '/public'));
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
app.get('/about', function(req, res) {
    res.render('pages/about');
});

app.listen(3000, () => console.log('http://localhost:3000 🚀'));