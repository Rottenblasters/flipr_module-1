const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userVerificationSchema = new Schema({
    userId: { type: String, required: true },
    uniqueString: { type: String, required: true, unique: true },
}, { timestamps: true })

module.exports = mongoose.model('UserVerification', userVerificationSchema)