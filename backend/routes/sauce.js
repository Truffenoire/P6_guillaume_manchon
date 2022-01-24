const express= require('express');
const router = express.Router();

const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

const sauceCrtl = require('../controllers/sauce');

router.get("/", auth, sauceCrtl.getAllSauce);
router.post('/', auth, multer, sauceCrtl.createSauce);
router.get("/:id", auth, sauceCrtl.getOneSauce);
router.delete("/:id", auth ,sauceCrtl.deleteSauce);
router.put("/:id", auth ,multer, sauceCrtl.upDateSauce);

router.post('/:id/like', auth, sauceCrtl.likeDisslikeSauce);

module.exports = router;