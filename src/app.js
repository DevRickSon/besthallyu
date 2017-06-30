import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import ejs from 'ejs';

import mongoose from 'mongoose';
import Board from './models/Board';
import Admin from './models/Admin';

//import morgan from 'morgan';

//import localConfig from '../localConfig';
import herokuConfig from '../herokuConfig'

const app = express();
const port = 8083;

//app.use(morgan('dev'));

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

app.use('/', express.static(path.join(__dirname, '../static')));

app.get('/', (req, res) => {
    req.app.render('join', (err, html) => {
        if(err) throw err;
        res.end(html);
    });
});

app.post('/registerVideo', (req, res) => {
    let { vurl, vfile, vname, vorigin, ufirst, ulast, unation, usns1, usns2, uemail, uvisit, upassport, uvisa, ucancel } = req.body;
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

app.get('/admin/lists', (req, res) => {
    const query = req.query;

    let pagenation = null;

    const getPagenation = (total) => {
        pagenation = Board.getPagenation(1, total);

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
            pagenation: pagenation
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

app.get('/admin/lists/:page', (req, res) => {
    let page = parseInt(req.params.page, 10);
    let {searchType, searchWord} = req.query;

    let query = {};
    if(typeof searchType !== 'undefined' && searchType !== ''){
        switch(searchType.toUpperCase()){
            case 'VNAME':
            case 'VORIGIN':
                query[searchType] = {$regex: searchWord};
                break;
            default:
                query[searchType] = searchWord;
        }
    }

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
            pagenation: pagenation
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

app.get('/admin', function(req, res){
    req.app.render('login', (err, html) => {
        if(err) throw err;
        res.end(html);
    });
});

app.post('/admin/login', function(req, res){
    const { uid, upwd } = req.body;

    let pagenation = null;

    const verify = (admin) => {
        if(!admin){
            throw new Error('존재하지 않는 아이디 입니다.');
        }else{
            if(admin.verify(upwd)){
                //세션구현

                return true;
            }else{
                throw new Error('비밀번호가 일치하지 않습니다.');
            }
        }
    };

    const getPagenation = (total) => {
        pagenation = Board.getPagenation(1, total);

        return Promise.resolve(false);
    };

    const getList = () => {
        return Board.getList({}, pagenation);
    };

    const getBoard = () => {
        Board.getTotal({})
             .then(getPagenation)
             .then(getList)
             .then(respond)
             .catch(onError);
    };

    const respond = (boards) => {
        req.app.render('list', {
            boards: boards,
            pagenation: pagenation
        },(err, html) => {
            if(err) throw err;

            res.end(html);
        });
    };

    const onError = (error) => {
        return res.status(403).json({
            message: error.message
        });
    };

    Admin.findOneById(uid)
          .then(verify)
          .then(getBoard)
          .catch(onError);
});

app.post('/admin/account', function(req, res){
    let {uid, pwd} = req.body;

    const respond = () => {
        res.json({
            message: '회원가입이 성공적으로 이뤄졌습니다.'
        });
    };

    const onError = (error) => {
        res.status(403).json({
            message: error.message
        });
    }

    Admin.create(uid, pwd)
         .then(respond)
         .catch(onError);
});

app.listen(process.env.PORT || port, () => {
    console.log(`Server is running on port ${port}.`);
});
