import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import ejs from 'ejs';

import mongoose from 'mongoose';
import Board from './models/Board';

import morgan from 'morgan';

const app = express();
const port = 8083;

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
    console.log('Connected to mongodb server');
});
mongoose.connect('mongodb://jhson:wjdgh031952@ds139242.mlab.com:39242/vsdb');

app.use('/', express.static(path.join(__dirname, '../static')));

app.get('/', (req, res) => {
    req.app.render('index', (err, html) => {
        if(err) throw err;
        res.end(html);
    });
});

app.get('/join', (req, res) => {
    req.app.render('join', (err, html) => {
        if(err) throw err;
        res.end(html);
    });
});

app.post('/registerVideo', (req, res) => {
    let { vurl, vfile, vname, vorigin, ufirst, ulast, unation, usns1, usns2, uemail, uvisit, upassport, uvisa, ucancel } = req.body;
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

    let uname = ufirst + ' ' + ulast;
    let usns = usns1;
    if(typeof usns2 !== 'undefined') usns += ', ' + usns2

    const respond = () => {
        res.json({
            success: true
        });
    };

    const onError = (err) => {
        res.status(409).json({
            success: false,
            error: err,
            message: err.message
        });
    }

    Board.create(vurl, vfile, vname, vorigin, uname, unation, usns, uemail, uvisit, upassport, uvisa, ucancel)
         .then(respond)
         .catch(onError);
});

app.get('/lists/:page', (req, res) => {
    const page = (req.params.page === 'undefined') ? 1 : parseInt(req.params.page, 10);
    const query = req.query;

    let pagenation = null;

    const getPagenation = (total) => {
        pagenation = Board.getPagenation(page, total);

        return Promise.resolve(false);
    };

    const getList = () => {
        return Board.getList(query, pagenation);
    };

    const respond = (boards) => {
        // res.json({
        //     boards: boards,
        //     pagenation: pagenation,
        //     success: true
        // });

        req.app.render('list', {
            boards: boards,
            pagenation: pagenation,
            success: true
        },(err, html) => {
            if(err) throw err;

            res.end(html);
        });
    };

    const onError = (err) => {
        res.status(409).json({
            success: false,
            error: err,
            message: err.message
        });
    };

    Board.getTotal(query)
         .then(getPagenation)
         .then(getList)
         .then(respond)
         .catch(onError);
});

//에러 핸들러 등록
//인피니티 라이브

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});
