'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _ejs = require('ejs');

var _ejs2 = _interopRequireDefault(_ejs);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _Board = require('./models/Board');

var _Board2 = _interopRequireDefault(_Board);

var _Admin = require('./models/Admin');

var _Admin2 = _interopRequireDefault(_Admin);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _multerS = require('multer-s3');

var _multerS2 = _interopRequireDefault(_multerS);

var _expressErrorHandler = require('express-error-handler');

var _expressErrorHandler2 = _interopRequireDefault(_expressErrorHandler);

var _herokuConfig = require('../herokuConfig');

var _herokuConfig2 = _interopRequireDefault(_herokuConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

//import localConfig from '../localConfig';

var port = 8083;
var S3_BUCKET = 'visitseoul';

_awsSdk2.default.config.update({
    accessKeyId: _herokuConfig2.default.accessKeyId,
    secretAccessKey: _herokuConfig2.default.secretAccessKey,
    region: _herokuConfig2.default.region
});
var s3 = new _awsSdk2.default.S3();

app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use(_bodyParser2.default.json());

app.set('views', _path2.default.join(__dirname, '../views'));
app.set('view engine', 'ejs');

var db = _mongoose2.default.connection;
db.on('error', console.error);
db.once('open', function () {
    console.log('Connected to mongodb server');
});
_mongoose2.default.connect(_herokuConfig2.default.db);

app.use((0, _cookieParser2.default)());
app.use((0, _expressSession2.default)({
    key: _herokuConfig2.default.sid,
    secret: _herokuConfig2.default.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30
    }
}));

app.use('/', _express2.default.static(_path2.default.join(__dirname, '../static')));

var maxFileSize = 3 * 1024 * 1024;
var upload = (0, _multer2.default)({
    limits: { fileSize: maxFileSize },
    storage: (0, _multerS2.default)({
        s3: s3,
        bucket: S3_BUCKET,
        metadata: function metadata(req, file, cb) {
            cb(null, { fieldname: file.fieldname });
        },
        key: function key(req, file, cb) {
            cb(null, Date.now().toString() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
        }
    })
}).single('vfile');

app.get('/', function (req, res) {
    var context = {
        status: 'init',
        message: ''
    };
    req.app.render('join', context, function (err, html) {
        if (err) throw err;
        res.end(html);
    });
});

app.get('/checkEmail', function (req, res) {
    var uemail = req.query.uemail;


    var verify = function verify(email) {
        if (!email) {
            return '참여 가능한 이메일 입니다.';
        } else {
            throw new Error('이미 참여한 이메일 입니다.');
        }
    };

    var respond = function respond(msg) {
        res.json({
            message: msg
        });
    };

    var onError = function onError(error) {
        res.status(403).json({
            message: error.message
        });
    };

    _Board2.default.findOneByEmail(uemail).then(verify).then(respond).catch(onError);
});

app.post('/registerVideo', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return req.app.render('error', { message: '3MB 이하의 동영상 파일만 업로드 가능합니다' }, function (err, html) {
                if (err) throw err;
                res.end(html);
            });
        }

        var _req$body = req.body,
            ufirst = _req$body.ufirst,
            ulast = _req$body.ulast,
            unation = _req$body.unation,
            usns1 = _req$body.usns1,
            usns2 = _req$body.usns2,
            uemail = _req$body.uemail,
            uvisit = _req$body.uvisit,
            upassport = _req$body.upassport,
            uvisa = _req$body.uvisa,
            ucancel = _req$body.ucancel,
            movType = _req$body.movType,
            vurl = _req$body.vurl,
            vname = _req$body.vname,
            vorigin = _req$body.vorigin;

        var uname = ufirst + ' ' + ulast;
        var usns = usns1;
        if (typeof usns2 !== 'undefined') usns += ', ' + usns2;

        var file = null;
        var vfile = '';
        var mType = '';

        if (movType === 'file') {
            file = req.file;
            vfile = file.location;
            mType = file.mimetype;

            if (mType.indexOf('video') === -1) {
                return req.app.render('error', { message: '동영상 파일만 등록 가능합니다.' }, function (err, html) {
                    if (err) throw err;
                    res.end(html);
                });
            }

            vurl = '';
        } else {
            vfile = '';
        }

        var respond = function respond() {
            res.redirect('/join/success');
        };

        var onError = function onError(err) {
            console.error(err);
        };

        _Board2.default.create(uname, unation, usns, uemail, uvisit, upassport, uvisa, ucancel, vurl, vfile, vname, vorigin).then(respond).catch(onError);
    });
});

app.get('/join/success', function (req, res) {
    return req.app.render('success', function (err, html) {
        if (err) throw err;
        res.end(html);
    });
});

app.use('/admin/lists', function (req, res, next) {
    if (typeof req.session.user !== 'undefined' && req.session.user.admin) {
        next();
    } else {
        res.redirect('/admin');
    }
});

app.get('/admin/lists', function (req, res) {
    res.redirect('/admin/lists/1');
});

app.get('/admin/lists/:page', function (req, res) {
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

            res.end(html);
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
});

app.get('/admin', function (req, res) {
    req.app.render('login', function (err, html) {
        if (err) throw err;
        res.end(html);
    });
});

app.post('/admin/login', function (req, res) {
    var _req$body2 = req.body,
        uid = _req$body2.uid,
        upwd = _req$body2.upwd;


    var pagenation = null;

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
            res.end(html);
        });
    };

    _Admin2.default.findOneById(uid).then(verify).then(respond).catch(onError);
});

app.get('/admin/logout', function (req, res) {
    if (typeof req.session.user !== 'undefined') {
        req.session.destroy(function (err) {
            if (err) throw err;
            res.redirect('/admin');
        });
        res.clearCookie(_herokuConfig2.default.sid);
    } else {
        res.redirect('/admin');
    }
});

//todo error-handler
//인피니티 라이브

// app.post('/admin/account', (req, res) => {
//     let {uid, pwd} = req.body;
//
//     const respond = () => {
//         res.json({
//             message: '회원가입이 성공적으로 이뤄졌습니다.'
//         });
//     };
//
//     const onError = (error) => {
//         res.status(403).json({
//             message: error.message
//         });
//     }
//
//     Admin.create(uid, pwd)
//          .then(respond)
//          .catch(onError);
// });

var errorHandler = (0, _expressErrorHandler2.default)({
    static: {
        '404': _path2.default.join(__dirname, '../views/404.html')
    }
});

app.use(_expressErrorHandler2.default.httpError(404));
app.use(errorHandler);

app.listen(process.env.PORT || port, function () {
    console.log('Server is running on port ' + port + '.');
});