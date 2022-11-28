const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assignmentSchema = new Schema ({
    subject: {
        type: String,
        required: true,
        unique: true
    },
    assignment: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps:  true
})

const scheduleSchema = new Schema ({
    title: {
        type: String,
        required: true,
        unique: true
    },
    student:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    completed: {
        type: Boolean,
        default: false
    },
    assignments: [assignmentSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Schedule', scheduleSchema);