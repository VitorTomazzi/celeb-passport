const mongoose = require('mongoose');
const Schema = mongoose.Schema

const celebSchema = new Schema({
  name: String,
  occupation: String,
  catchPhrase: String,
  movie: {type: Schema.Types.ObjectId, ref: 'Movie'},
  image: String,
  creator: {type: Schema.Types.ObjectId, ref: 'User'}
})

const Celeb = mongoose.model('Celeb', celebSchema);

module.exports = Celeb;

// test 

// https://hookagency.com/wp-content/uploads/2017/07/hide-the-pain-harold-stock-photo.jpg