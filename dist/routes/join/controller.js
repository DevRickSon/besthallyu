'use strict';

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _multerS = require('multer-s3');

var _multerS2 = _interopRequireDefault(_multerS);

var _Board = require('../../models/Board');

var _Board2 = _interopRequireDefault(_Board);

var _herokuConfig = require('../../../herokuConfig');

var _herokuConfig2 = _interopRequireDefault(_herokuConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_awsSdk2.default.config.update({
    accessKeyId: _herokuConfig2.default.accessKeyId,
    secretAccessKey: _herokuConfig2.default.secretAccessKey,
    region: _herokuConfig2.default.region
});

var s3 = new _awsSdk2.default.S3();
var S3_BUCKET = _herokuConfig2.default.bucket;

var maxFileSize = 50 * 1024 * 1024;
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

exports.join = function (req, res) {
    req.app.render('join', function (err, html) {
        if (err) throw err;
        res.send(html);
    });
};

exports.registerJoin = function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            //todo size limits alert notice
            return req.app.render('error', { message: '3MB 이하의 동영상 파일만 업로드 가능합니다' }, function (err, html) {
                if (err) throw err;
                res.send(html);
            });
        }

        var _req$body = req.body,
            vurl = _req$body.vurl,
            vname = _req$body.vname,
            vdesc = _req$body.vdesc,
            vorigin = _req$body.vorigin,
            ufirst = _req$body.ufirst,
            ulast = _req$body.ulast,
            unation = _req$body.unation,
            ucity = _req$body.ucity,
            ucountry = _req$body.ucountry,
            usns1 = _req$body.usns1,
            usns2 = _req$body.usns2,
            uemail = _req$body.uemail,
            uvisit = _req$body.uvisit,
            upassport = _req$body.upassport,
            uvisa = _req$body.uvisa,
            ucancel = _req$body.ucancel,
            uage = _req$body.uage,
            usex = _req$body.usex;

        var uname = ufirst + ' ' + ulast;
        var usns = usns1;
        if (typeof usns2 !== '') usns += ', ' + usns2;

        var file = req.file;
        var vfile = '';

        if (typeof file !== 'undefined') {
            vfile = file.location;
            vurl = '';
        } else {
            vfile = '';
        }

        var respond = function respond() {
            res.redirect('/join/success');
        };

        var onError = function onError(err) {
            req.app.render('error', { message: 'SERVER ERROR, Please try few minuts later..' }, function (err, html) {
                if (err) throw err;
                res.send(html);
            });
        };

        _Board2.default.create(vurl, vfile, vname, vdesc, vorigin, uname, unation, ucity, ucountry, usns, uemail, uvisit, upassport, uvisa, ucancel, uage, usex).then(respond).catch(onError);
    });
};

exports.success = function (req, res) {
    return req.app.render('success', function (err, html) {
        if (err) throw err;
        res.send(html);
    });
};