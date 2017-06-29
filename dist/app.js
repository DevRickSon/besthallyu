'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _ejs = require('ejs');

var _ejs2 = _interopRequireDefault(_ejs);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _Board = require('./models/Board');

var _Board2 = _interopRequireDefault(_Board);

var _herokuConfig = require('../herokuConfig');

var _herokuConfig2 = _interopRequireDefault(_herokuConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

//import morgan from 'morgan';

//import localConfig from '../localConfig';

var port = 8083;

//app.use(morgan('dev'));

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

app.use('/', _express2.default.static(_path2.default.join(__dirname, '../static')));

app.get('/', function (req, res) {
    req.app.render('index', function (err, html) {
        if (err) throw err;
        res.end(html);
    });
});

app.get('/join', function (req, res) {
    req.app.render('join', function (err, html) {
        if (err) throw err;
        res.end(html);
    });
});

app.post('/registerVideo', function (req, res) {
    var _req$body = req.body,
        vurl = _req$body.vurl,
        vfile = _req$body.vfile,
        vname = _req$body.vname,
        vorigin = _req$body.vorigin,
        ufirst = _req$body.ufirst,
        ulast = _req$body.ulast,
        unation = _req$body.unation,
        usns1 = _req$body.usns1,
        usns2 = _req$body.usns2,
        uemail = _req$body.uemail,
        uvisit = _req$body.uvisit,
        upassport = _req$body.upassport,
        uvisa = _req$body.uvisa,
        ucancel = _req$body.ucancel;

    console.log('url: ', vurl);
    console.log('file: ', vfile);
    console.log('vname: ', vname);
    console.log('origin: ', vorigin);
    console.log('name: ', ufirst, ' ', ulast);
    console.log('unation: ', unation);
    console.log('usns1: ', usns1);
    console.log('usns2: ', usns2);
    console.log('uemail: ', uemail);
    console.log('uvisit: ', uvisit);
    console.log('upassport: ', upassport);
    console.log('uvisa: ', uvisa);
    console.log('ucancel: ', ucancel);
    //유효성 체크
    //db insert
    //성공, 에러 페이지

    var uname = ufirst + ' ' + ulast;
    var usns = usns1;
    if (typeof usns2 !== 'undefined') usns += ', ' + usns2;

    var respond = function respond() {
        res.json({
            success: true
        });
    };

    var onError = function onError(err) {
        res.status(409).json({
            success: false,
            error: err,
            message: err.message
        });
    };

    _Board2.default.create(vurl, vfile, vname, vorigin, uname, unation, usns, uemail, uvisit, upassport, uvisa, ucancel).then(respond).catch(onError);
});

app.get('/lists', function (req, res) {
    var query = req.query;

    var pagenation = null;

    var getPagenation = function getPagenation(total) {
        pagenation = _Board2.default.getPagenation(1, total);

        return Promise.resolve(false);
    };

    var getList = function getList() {
        return _Board2.default.getList(query, pagenation);
    };

    var respond = function respond(boards) {
        // res.json({
        //     boards: boards,
        //     pagenation: pagenation,
        //     success: true
        // });

        req.app.render('list', {
            boards: boards,
            pagenation: pagenation,
            success: true
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

app.get('/lists/:page', function (req, res) {
    var page = parseInt(req.params.page, 10);
    var query = req.query;

    var pagenation = null;

    var getPagenation = function getPagenation(total) {
        pagenation = _Board2.default.getPagenation(page, total);

        return Promise.resolve(false);
    };

    var getList = function getList() {
        return _Board2.default.getList(query, pagenation);
    };

    var respond = function respond(boards) {
        // res.json({
        //     boards: boards,
        //     pagenation: pagenation,
        //     success: true
        // });

        req.app.render('list', {
            boards: boards,
            pagenation: pagenation,
            success: true
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

//에러 핸들러 등록
//인피니티 라이브

app.listen(process.env.PORT || port, function () {
    console.log('Server is running on port ' + port + '.');
});