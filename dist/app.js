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

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _Board = require('./models/Board');

var _Board2 = _interopRequireDefault(_Board);

var _Admin = require('./models/Admin');

var _Admin2 = _interopRequireDefault(_Admin);

var _expressErrorHandler = require('express-error-handler');

var _expressErrorHandler2 = _interopRequireDefault(_expressErrorHandler);

var _herokuConfig = require('../herokuConfig');

var _herokuConfig2 = _interopRequireDefault(_herokuConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import aws from 'aws-sdk';
// import multer from 'multer';
// import multerS3 from 'multer-s3';

var app = (0, _express2.default)();
var port = 8083;
// const S3_BUCKET = herokuConfig.bucket;
//
// aws.config.update({
//     accessKeyId: herokuConfig.accessKeyId,
//     secretAccessKey: herokuConfig.secretAccessKey,
//     region: herokuConfig.region
// });
// const s3 = new aws.S3();

app.use((0, _helmet2.default)());
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

// const maxFileSize = 3 * 1024 * 1024;
// const upload = multer({
//     limits: {fileSize: maxFileSize},
//     storage: multerS3({
//         s3: s3,
//         bucket: S3_BUCKET,
//         metadata: (req, file, cb) => {
//             cb(null, {fieldname: file.fieldname});
//         },
//         key: (req, file, cb) => {
//             cb(null, Date.now().toString() + '.' + file.originalname.split('.')[file.originalname.split('.').length-1]);
//         }
//     })
// }).single('vfile');

app.use('/', _routes2.default);

// app.get('/', (req, res) => {
//     req.app.render('join', (err, html) => {
//         if(err) throw err;
//         res.send(html);
//     });
// });

// app.get('/checkEmail', (req, res) => {
//     const { uemail } = req.query;
//
//     const verify = (email) => {
//         if(!email){
//             return '참여 가능한 이메일 입니다.';
//         }else{
//             throw new Error('이미 참여한 이메일 입니다.');
//         }
//     };
//
//     const respond = (msg) => {
//         res.json({
//             message: msg
//         });
//     };
//
//     const onError = (error) => {
//         res.status(403).json({
//             message: error.message
//         });
//     };
//
//     Board.findOneByEmail(uemail)
//           .then(verify)
//           .then(respond)
//           .catch(onError);
// });

// app.post('/registerVideo', (req, res) => {
//     upload(req, res, (err) => {
//         if(err){
//             return req.app.render('error', {message: '3MB 이하의 동영상 파일만 업로드 가능합니다'}, (err, html) => {
//                 if(err) throw err;
//                 res.send(html);
//             });
//         }
//
//         let { vurl, vname, vdesc, vorigin, ufirst, ulast, unation, ucity, ucountry, usns1, usns2, uemail, uvisit, upassport, uvisa, ucancel, uage, usex } = req.body;
//         let uname = ufirst + ' ' + ulast;
//         let usns = usns1;
//         if(typeof usns2 !== '') usns += ', ' + usns2
//
//         let file = req.file;
//         let vfile = '';
//
//         if(typeof file !== 'undefined'){
//             vfile = file.location;
//             vurl = '';
//         }else{
//             vfile = '';
//         }
//
//         const respond = () => {
//             res.redirect('/join/success');
//         };
//
//         const onError = (err) => {
//             console.error(err);
//         }
//
//         Board.create(vurl, vfile, vname, vdesc, vorigin, uname, unation, ucity, ucountry, usns, uemail, uvisit, upassport, uvisa, ucancel, uage, usex)
//              .then(respond)
//              .catch(onError);
//     });
// });
//
// app.get('/join/success', (req, res) => {
//     return req.app.render('success', (err, html) => {
//         if(err) throw err;
//         res.send(html);
//     });
// });

// app.use('/admin/lists', (req, res, next) => {
//     if(typeof req.session.user !== 'undefined' && req.session.user.admin){
//         next();
//     }else{
//         res.redirect('/admin');
//     }
// });
//
// app.get('/admin/lists', (req, res) => {
//     res.redirect('/admin/lists/1');
// });
//
// app.get('/admin/lists/:page', (req, res) => {
//     let page = parseInt(req.params.page, 10);
//     let {searchType, searchWord} = req.query;
//
//     let query = {};
//     if(typeof searchType !== 'undefined' && searchType !== ''){
//         switch(searchType.toUpperCase()){
//             case 'VNAME':
//             case 'VORIGIN':
//                 query[searchType] = {$regex: searchWord};
//                 break;
//             default:
//                 query[searchType] = searchWord;
//         }
//     }
//
//     let pagenation = null;
//
//     const getPagenation = (total) => {
//         pagenation = Board.getPagenation(page, total);
//
//         return Promise.resolve(false);
//     };
//
//     const getList = () => {
//         return Board.getList(query, pagenation);
//     };
//
//     const respond = (boards) => {
//         req.app.render('list', {
//             boards: boards,
//             pagenation: pagenation
//         },(err, html) => {
//             if(err) throw err;
//
//             res.send(html);
//         });
//     };
//
//     const onError = (err) => {
//         res.status(409).json({
//             success: false,
//             error: err,
//             message: err.message
//         });
//     };
//
//     Board.getTotal(query)
//          .then(getPagenation)
//          .then(getList)
//          .then(respond)
//          .catch(onError);
// });

// app.get('/admin', (req, res) => {
//     req.app.render('login', (err, html) => {
//         if(err) throw err;
//         res.send(html);
//     });
// });
//
// app.post('/admin/login', (req, res) => {
//     const { uid, upwd } = req.body;
//
//     let pagenation = null;
//
//     const verify = (admin) => {
//         if(!admin){
//             throw new Error('존재하지 않는 아이디 입니다.');
//         }else{
//             if(admin.verify(upwd)){
//                 req.session.user = {
//                     admin: true,
//                     id: uid
//                 };
//
//                 return true;
//             }else{
//                 throw new Error('비밀번호가 일치하지 않습니다.');
//             }
//         }
//     };
//
//     const respond = () => {
//         res.redirect('/admin/lists');
//     };
//
//     const onError = (error) => {
//         req.app.render('error', {message: error.message}, (err, html) => {
//             if(err) throw err;
//             res.send(html);
//         });
//     };
//
//     Admin.findOneById(uid)
//           .then(verify)
//           .then(respond)
//           .catch(onError);
// });
//
// app.get('/admin/logout', (req, res) => {
//     if(typeof req.session.user !== 'undefined'){
//         req.session.destroy((err) => {
//             if(err) throw err;
//             res.redirect('/admin');
//         });
//         res.clearCookie(herokuConfig.sid);
//     }else{
//         res.redirect('/admin');
//     }
// });

//todo
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