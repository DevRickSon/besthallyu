'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _join = require('./join');

var _join2 = _interopRequireDefault(_join);

var _admin = require('./admin');

var _admin2 = _interopRequireDefault(_admin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/', function (req, res) {
    res.redirect('/join');
});

router.use('/join', _join2.default);
router.use('/admin', _admin2.default);

exports.default = router;