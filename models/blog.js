const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const _ = require('lodash');


const blogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 30
    },
    image: {
        type: String,
    },
    content:{
        type: String,
        required: true,
        minlength: 100
    },
    writer: {
        type: String,
        required: true,
        minlength: 2
    },
    about_writer:{
        type: String,
        minlength: 20
    },
    created_at:{
        type: Date,
        default: Date.now
    },
});

const Blog = mongoose.model('Blog', blogSchema);

function validateBlog(blog){
    const schema = Joi.object({
        name: Joi.string().min(2).max(30).required(),
        content: Joi.string().min(100).required(),
        writer: Joi.string().min(2).required(),
      
        
    });
    return schema.validate(blog)
}

exports.Blog = Blog;
exports.validateBlog = validateBlog;''