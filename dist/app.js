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

var _herokuConfig = require('../herokuConfig');

var _herokuConfig2 = _interopRequireDefault(_herokuConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var port = 8083;

app.use((0, _helmet2.default)());
app.use(_helmet2.default.noCache());
app.use(_helmet2.default.frameguard());

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

app.use('/', _routes2.default);

app.use(function (req, res, next) {
    req.app.render('error404', function (err, html) {
        if (err) throw err;
        res.status(404);
        res.send(html);
    });
});

app.listen(process.env.PORT || port, function () {
    console.log('Server is running on port ' + port + '.');
});