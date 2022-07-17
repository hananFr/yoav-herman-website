const express = require('express');
const _ = require('lodash');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {Blog, validateBlog} = require('../models/blog')
const { User } = require('../models/user');
const adminAuth = require('../middleware/adminAuth');




const storage = multer.diskStorage({
    destination: './images',
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
}).single('image')

router.get('/:id', async (req, res) =>{
    const blog = await Blog.findById(req.params.id);
    res.send(blog)
})

router.get('/username/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    res.send(user);
});

router.get('/', async (req,res) => {
    const blogs = await Blog.find(req.body.id).sort({created_at: -1}).limit(3);
    res.send(blogs)
})



router.get("/image/:id", async (req, res) =>{
    let blog = await Blog.findById(req.params.id)
    let url = blog.image

    
    fs.readFile(url, function(err, data) {
        if (err) throw err; // Fail if the file can't be read
          res.writeHead(200, {'Content-Type': 'image/jpeg'});
          res.end(data); // Send the file data to the browser.
      });
})

router.get("/user/:id", async (req, res) =>{
    console.log(req.params.id);
    let user = await User.findById(req.params.id)
    let url = user.image

    
    fs.readFile(url, function(err, data) {
        console.log(url);
        if (err) throw err; // Fail if the file can't be read
          res.writeHead(200, {'Content-Type': 'image/jpeg'});
          console.log(data);
          res.end(data); // Send the file data to the browser.
      });
})

router.put('/update/:id', auth, upload, async (req, res) => {
    
    let params = req.body
    const _blog = await Blog.findById(req.params.id)
    if(req.file) {
        params.image = path.join(__dirname,`../${req.file.path}`)
        fs.unlinkSync(_blog.image);
    }
    else params.image = req.body.image;
    const user = await User.findById(_blog.writer)
    
    if(req.user._id !== _blog.writer && !req.user.admin) res.status(400).send('הבלוג לא שייך לך!')
    let blog = await Blog.findByIdAndUpdate( (req.params.id),{
        name: req.body.name,
        image: params.image,
        content: req.body.content,
        writer: req.user._id,
        about_writer: user.about_writer
    })
    let put = await blog.save()
    res.send(put)
})

router.post('/uploads', auth, upload , async (req, res) => {    
    const file = path.join(__dirname, `../${req.file.path}`)
    const { error } = validateBlog(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = await User.findById(req.user._id);
    
    let blog = new Blog ({
        name: req.body.name,
        image: file,
        content: req.body.content,
        writer:  req.user._id,
        about_writer: user.about_writer
    });

post = await blog.save();
res.send(post)
})

router.delete('/:id', auth, async (req, res) => {
    const blog = await Blog.findOneAndRemove({ _id: req.params.id, writer: req.user._id});
    if (!blog) return res.status(404).send('.המספר המזהה לא נמצא');
    res.send(blog);
})

module.exports = router;