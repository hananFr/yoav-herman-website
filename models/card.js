const Joi = require('@hapi/joi');
const mongoose = require('mongoose');
const _ = require('lodash');


const cardSchema = new mongoose.Schema({
  travelName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255
  },
  travelDescription: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 1024
  },
  headerContext: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 100
  }
  ,
  travelAddress: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 400
  },
  travelNumber: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 99999999999,
    unique: true
  },
  travelImage: {
    type: Buffer,
    required: true,
  },

  travelCategory: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255
  },
  travelDate: {
    type: Date,
    
  },
  
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Card = mongoose.model('Card', cardSchema);

function validateCard(card) {

  const schema = Joi.object({
    travelName: Joi.string().min(2).max(255).required(),
    travelDescription: Joi.string().min(2).max(1024).required(),
    headerContext: Joi.string().min(10).max(100).required(),
    travelAddress: Joi.string().min(2).max(400).required(),
    travelCategory: Joi.string().min(2).max(1024),
    travelImage: Joi.required(),
    travelDate: Joi.date()

  });

  return schema.validate(card);
}


async function generateTravelNumber(Card) {

  while (true) {
    let randomNumber = _.random(1000, 999999);
    let card = await Card.findOne({ travelNumber: randomNumber });
    if (!card) return String(randomNumber);
  }

}

exports.Card = Card;
exports.validateCard = validateCard;
exports.generateTravelNumber = generateTravelNumber;