const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    userName:  { type: String, default: "", require: true },
    email:  { type: String, default: "", require: true },
    discordId:  { type: String, default: "", require: true },
    token:  { type: String, default: "", require: true },
    discriminator:  { type: String, default: "" },
    locale:  { type: String, default: "" },
    verified:  { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);