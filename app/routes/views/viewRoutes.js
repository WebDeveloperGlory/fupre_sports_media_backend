const { Router } = require('express');
const homepageController = require('../../controllers/views/homepageController');

const router = Router();

router.get( '/homepage', homepageController.homePageData );

module.exports = router;