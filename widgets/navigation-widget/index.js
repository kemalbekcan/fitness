// widgets/navigation-widget.js
import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
    const navigationData = {
        menuItems: ['Anasayfa', 'Hakkında', 'İletişim'],
    };

    console.log(navigationData, 'navigation-widget')

    res.render('navigation-widget/index', { navigationData });
});

export default router;