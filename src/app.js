import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import url from 'url';
import helmet from 'helmet';

import router from './routes';

import mongoose from 'mongoose';

import herokuConfig from '../herokuConfig';

const app = express();
const port = 8083;

app.use(helmet());
app.use(helmet.noCache());
app.use(helmet.frameguard());

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
    console.log('Connected to mongodb server');
});
mongoose.connect(herokuConfig.db);

app.use(cookieParser());
app.use(session({
    key: herokuConfig.sid,
    secret: herokuConfig.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30
    }
}));

app.use('/', express.static(path.join(__dirname, '../static')));

app.use('/', router);

app.use((req, res, next) => {
    req.app.render('error404', (err, html) => {
        if(err) throw err;
        res.status(404);
        res.send(html);
    });
});

app.listen(process.env.PORT || port, () => {
    console.log(`Server is running on port ${port}.`);
});
