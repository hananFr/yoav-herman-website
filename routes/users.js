const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User, validate, validateCards, validateUser } = require('../models/user');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { Card } = require('../models/card');
const { token } = require('morgan');
const multer = require('multer');
const { toLower } = require('lodash');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
    destination: './images',
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));;
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
}).single('image')

router.get('/me',adminAuth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});
router.get('/use/:id',auth, async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    res.send(user);
});



router.put('/admin/:id',adminAuth, async (req, res) => {
    let user = await User.findById(req.params.id)
    const updateUser = await User.findOneAndUpdate({_id: req.params.id}, {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        admin: req.body.admin,
        
    })
    
    
    res.send(updateUser)
})




router.get('/get-users', async (req, res) => {
    let users = await User.find().select('-password')
    res.send(users)
})


router.get("/user/:id", async (req, res) =>{
    console.log(req.params.id);
    let user = await User.findById(req.params.id)
    let url = user.image

    
    fs.readFile(url, function(err, data) {
        console.log(url);
        if (err) res.send( err); // Fail if the file can't be read
          res.writeHead(200, {'Content-Type': 'image/jpeg'});
          console.log(data);
          res.end(data); // Send the file data to the browser.
      });
})



router.put('/update/:id', auth ,upload, async (req, res) => {
    if(req.user._id !== req.params.id) res.status(400).send('Access denied!')
    const params = req.body
    console.log(req.body);
    console.log(req.file);
    if(req.file) {
        params.image = path.join(__dirname, `../${req.file.path}`);
        const user = await User.findById(req.params.id);
        fs.unlinkSync(user.image);
};
    const { error } = validate(params);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await User.findByIdAndUpdate((req.user._id), params);
    user.email = req.body.email.toLowerCase();
    console.log(user.email);
    await user.save();
    res.send(_.pick(user, ['_id', 'name', 'email']));
})
router.post('/',adminAuth, upload, async (req, res) => {
    console.log(req.body);
    const params = req.body
    params.image = path.join(__dirname, `../${req.file.path}`);
    const { error } = validateUser(params);
    console.log(error);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('.האימייל הזה בשימוש');
    user = new User(_.pick(params, ['name', 'email', 'password', ,'image','about_writer','admin', 'blogs']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.email = toLower(user.email);
    await user.save();
    res.send(_.pick(user, ['_id', 'name', 'email']));
})

module.exports = router