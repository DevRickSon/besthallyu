'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

var Admin = new Schema({
    id: String,
    password: String
});

Admin.statics.create = function (id, password) {
    var encrypted = _crypto2.default.createHmac('sha1', 'seCrETeKeyOfheYFpW').update(password).digest('base64');

    var admin = new this({
        id: id,
        password: encrypted
    });

    return admin.save();
};

Admin.statics.findOneById = function (id) {
    return this.findOne({
        id: id
    }).exec();
};

Admin.methods.verify = function (password) {
    var encrypted = _crypto2.default.createHmac('sha1', 'seCrETeKeyOfheYFpW').update(password).digest('base64');

    return this.password === encrypted;
};

exports.default = _mongoose2.default.model('Admin', Admin);