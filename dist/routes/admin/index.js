'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _controller = require('./controller');

var _controller2 = _interopRequireDefault(_controller);

var _authMiddleware = require('../../middleware/authMiddleware');

var _authMiddleware2 = _interopRequireDefault(_authMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/', _controller2.default.admin);

router.post('/login', _controller2.default.login);
router.get('/logout', _controller2.default.logout);

router.use('/lists', _authMiddleware2.default);
router.get('/lists', _controller2.default.redirectLists);
router.get('/lists/:page', _controller2.default.lists);

exports.default = router;