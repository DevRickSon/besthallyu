'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var authMiddleware = function authMiddleware(req, res, next) {
    if (typeof req.session.user !== 'undefined' && req.session.user.admin) {
        next();
    } else {
        res.redirect('/admin');
    }
};

exports.default = authMiddleware;