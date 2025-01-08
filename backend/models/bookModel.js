const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookSchema = new Schema({
  userId: {
    type: String,
    required: [true, 'L\'identifiant de l\'utilisateur est obligatoire'],
  },
  title: {
    type: String,
    required: [true, 'Le titre du livre est obligatoire'],
    trim: true,
  },
  author: {
    type: String,
    required: [true, 'L\'auteur du livre est obligatoire'],
    trim: true,
  },
  imageUrl: {
    type: String,
    required: [true, 'L\'URL de l\'illustration est obligatoire'],
    match: [/^https?:\/\/.+/, 'L\'URL de l\'image est invalide'],
  },
  year: {
    type: Number,
    required: [true, 'L\'année de publication est obligatoire'],
    min: [0, 'L\'année doit être un nombre positif'],
  },
  genre: {
    type: String,
    required: [true, 'Le genre du livre est obligatoire'],
    trim: true,
  },
  ratings: [
    {
      userId: {
        type: String,
        required: [true, 'L\'identifiant de l\'utilisateur est obligatoire pour une note'],
      },
      grade: {
        type: Number,
        required: [true, 'La note est obligatoire'],
        min: [0, 'La note doit être au moins 0'],
        max: [5, 'La note ne peut pas dépasser 5'],
      },
    },
  ],
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'La note moyenne doit être au moins 0'],
    max: [5, 'La note moyenne ne peut pas dépasser 5'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Book', bookSchema);
