const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    grade: {
        type: Number,
        min: 1,
        max: 12,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    }, 
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

})

const userSchema = new Schema({
    firstname: {
        type: String,
        default: ''
    }, 
    lastname: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        required: true
    },
    studentInfo: {
        type: studentSchema
    },
    admin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);