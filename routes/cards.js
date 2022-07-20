const express = require('express');
const _ = require('lodash');
const { Card, validateCard, generateTravelNumber, validateUpdateCard } = require('../models/card');
const auth = require('../middleware/auth');
const admin = require('../middleware/adminAuth');
const router = express.Router();
const multer = require('multer');
const { User } = require('../models/user');
const fs = require('fs');
const path = require('path');
const adminAuth = require('../middleware/adminAuth');
const  apiUrl = 'https://yoav-herman-website.herokuapp.com/';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter: fileFilter
}).single('travelImage')

router.get("/image/:id", async (req, res) => {
    let card = await Card.findOne({ _id: req.params.id });
    let url;
    if (card) {
        url = card.travelImage;
    }

    fs.readFile(url, function (err, data) {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(data);
    });
})


router.get("/my-cards", async (req, res) => {
    const cards = await Card.find(req.body.id);
    res.send(cards);
})

router.delete('/:id', adminAuth, async (req, res) => {
    const card = await Card.findOneAndRemove({ _id: req.params.id });
    if (!card) return res.status(404).send('.המספר המזהה לא נמצא');
    res.send(card);
});

router.put('/:id', adminAuth, upload, async (req, res) => {
    let params = req.body;
    console.log(params);
    console.log(req.file);
    if (req.file) {
        params.travelImage = `${apiUrl}${req.file.path}`;
        console.log(params.travelImage);
        const card = await Card.findById(req.params.id)
        fs.unlinkSync(card.travelImage);
    }
    else params.travelImage = req.body.travelImage
    const { error } = validateCard(params);
    if (error) return res.status(400).send(error.details[0].message);
    let card = await Card.findOneAndUpdate({ _id: req.params.id, user_id: req.user._id }, {
        travelName: req.body.travelName,
        travelDescription: req.body.travelDescription,
        travelAddress: req.body.travelAddress,
        travelImage: params.travelImage,
        travelCategory: req.body.travelCategory,
        travelDate: req.body.travelDate,
    });
    if (!card) return res.status(404).send('.המספר המזהה לא נמצא');

    card = await Card.findOne({ _id: req.params.id, user_id: req.user._id });
    res.send(card);


})

router.get('/:id', async (req, res) => {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).send('.המספר המזהה לא נמצא');
    res.send(card);

})

router.get('/date/:id', async (req, res) => {
    const date = new Date(req.params.id)
    const events = await Card.find({ travelDate: date })
    console.log(events);
    res.send(events)
})


router.get("/category/:id", async (req, res) => {

    let category;
    if (req.params.id === 'schools') {
        category = 'בתי ספר'
    }
    if (req.params.id === 'groups') {
        category = 'קבוצות'
    }
    if (req.params.id === 'couples') {
        category = 'זוגות'
    }
    if (req.params.id === 'families') {
        category = 'משפחות'
    }
    let cards = await Card.find({ travelCategory: category })
    res.send(cards)



})


router.post('/uploads', adminAuth, upload, async (req, res) => {
    let params = req.body;
    params.travelImagel = `https://yoav-herman-website.herokuapp.com/${req.file.path}`;
    console.log(params.travelImage);
    const { error } = validateCard(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let card = new Card(
        {
            travelName: req.body.travelName,
            travelDescription: req.body.travelDescription,
            travelAddress: req.body.travelAddress,
            travelImage: params.travelImage,
            travelCategory: req.body.travelCategory,
            travelNumber: await generateTravelNumber(Card),
            travelDate: req.body.travelDate,
            user_id: req.user._id
        }
    );


    post = await card.save()
    res.send(post);

})

module.exports = router;
