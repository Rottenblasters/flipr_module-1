const mongoose = require('mongoose')
const Schema = mongoose.Schema

const passwordVerificationSchema = new Schema({
    userId: { type: String, required: true },
    uniqueString: { type: String, required: true, unique: true },
    newPassword: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('PasswordVerification', passwordVerificationSchema)