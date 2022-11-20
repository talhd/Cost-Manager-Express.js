const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    id: {
        type: Number,
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    birthday: {
        type: Date,
        default: Date.now
    },
    martial_status: {
        type: String
    }
});

const Users = mongoose.model('users',UsersSchema);
module.exports = Users;