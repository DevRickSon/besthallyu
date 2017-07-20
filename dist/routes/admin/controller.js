'use strict';

var _Admin = require('../../models/Admin');

var _Admin2 = _interopRequireDefault(_Admin);

var _Board = require('../../models/Board');

var _Board2 = _interopRequireDefault(_Board);

var _herokuConfig = require('../../../herokuConfig');

var _herokuConfig2 = _interopRequireDefault(_herokuConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.admin = function (req, res) {
    req.app.render('login', function (err, html) {
        if (err) throw err;
        res.send(html);
    });
};

exports.login = function (req, res) {
    var _req$body = req.body,
        uid = _req$body.uid,
        upwd = _req$body.upwd;


    var verify = function verify(admin) {
        if (!admin) {
            throw new Error('존재하지 않는 아이디 입니다.');
        } else {
            if (admin.verify(upwd)) {
                req.session.user = {
                    admin: true,
                    id: uid
                };

                return true;
            } else {
                throw new Error('비밀번호가 일치하지 않습니다.');
            }
        }
    };

    var respond = function respond() {
        res.redirect('/admin/lists');
    };

    var onError = function onError(error) {
        req.app.render('error', { message: error.message }, function (err, html) {
            if (err) throw err;
            res.send(html);
        });
    };

    _Admin2.default.findOneById(uid).then(verify).then(respond).catch(onError);
};

exports.logout = function (req, res) {
    if (typeof req.session.user !== 'undefined') {
        req.session.destroy(function (err) {
            if (err) throw err;
            res.redirect('/admin');
        });
        res.clearCookie(_herokuConfig2.default.sid);
    } else {
        res.redirect('/admin');
    }
};

exports.create = function (req, res) {
    var _req$body2 = req.body,
        uid = _req$body2.uid,
        pwd = _req$body2.pwd;


    var respond = function respond() {
        res.json({
            message: '회원가입이 성공적으로 이뤄졌습니다.'
        });
    };

    var onError = function onError(error) {
        res.status(403).json({
            message: error.message
        });
    };

    _Admin2.default.create(uid, pwd).then(respond).catch(onError);
};

exports.redirectLists = function (req, res) {
    res.redirect('/admin/lists/1');
};

exports.lists = function (req, res) {
    var page = parseInt(req.params.page, 10);
    var _req$query = req.query,
        searchType = _req$query.searchType,
        searchWord = _req$query.searchWord;


    var query = {};
    if (typeof searchType !== 'undefined' && searchType !== '') {
        switch (searchType.toUpperCase()) {
            case 'VNAME':
            case 'VORIGIN':
                query[searchType] = { $regex: searchWord };
                break;
            default:
                query[searchType] = searchWord;
        }
    }

    var pagenation = null;

    var getPagenation = function getPagenation(total) {
        pagenation = _Board2.default.getPagenation(page, total);

        return Promise.resolve(false);
    };

    var getList = function getList() {
        return _Board2.default.getList(query, pagenation);
    };

    var respond = function respond(boards) {
        req.app.render('list', {
            boards: boards,
            pagenation: pagenation
        }, function (err, html) {
            if (err) throw err;
            res.send(html);
        });
    };

    var onError = function onError(err) {
        res.status(409).json({
            success: false,
            error: err,
            message: err.message
        });
    };

    _Board2.default.getTotal(query).then(getPagenation).then(getList).then(respond).catch(onError);
};