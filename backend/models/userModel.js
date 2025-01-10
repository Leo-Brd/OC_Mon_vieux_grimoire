const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'L\'adresse e-mail est obligatoire'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'L\'adresse e-mail est invalide'],
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
  },
}, {
  timestamps: true,
});

// To verify that the email is unique
userSchema.path('email').validate(async function (value) {
  const count = await mongoose.models.User.countDocuments({ email: value });
  return count === 0;
}, 'Email already exists');

module.exports = mongoose.model('User', userSchema);
