import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import url from 'url';
import multer from 'multer';

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
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const maxFileSize = 3 * 1000 * 1000;
const filePath = path.join(__dirname, '../uploads');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, filePath);
    },
    filename: (req, file, cb) => {
        let tmpArr = file.originalname.split('.');
        let idx = tmpArr.length - 1;
        let ext = tmpArr[idx];

        cb(null, file.fieldname + '_' + Date.now() + '.' + ext);
    }
});

const upload = multer({storage: storage, limits: {fileSize: maxFileSize}}).single('vfile');

app.get('/', (req, res) => {
    req.app.render('join', (err, html) => {
        if(err) throw err;
        res.end(html);
    });
});

app.post('/registerVideo', (req, res) => {
    upload(req, res, (err) => {
        if(err) throw err;

        let file = req.file;
        let originalFileNm = file.originalname;;
        let savedFileNm = file.filename;
        let fileSize = file.size;
        let vfile = savedFileNm;

        let { vurl, vname, vorigin, ufirst, ulast, unation, usns1, usns2, uemail, uvisit, upassport, uvisa, ucancel } = req.body;
        let uname = ufirst + ' ' + ulast;
        let usns = usns1;
        if(typeof usns2 !== 'undefined') usns += ', ' + usns2

        //todo
        //유효성 체크(확장자, 사이즈)
        //성공, 에러 페이지

        const respond = () => {
            res.json({
                success: true,
                ori: originalFileNm,
                save: savedFileNm,
                size: fileSize
            });
        };

        const onError = (err) => {
            res.redirect('/');
        }

        Board.create(vurl, vfile, vname, vorigin, uname, unation, usns, uemail, uvisit, upassport, uvisa, ucancel)
             .then(respond)
             .catch(onError);
    });
});

app.use('/admin/lists', (req, res, next) => {
    if(typeof req.session.user !== 'undefined' && req.session.user.admin){
        next();
    }else{
        res.redirect('/admin');
    }
});

app.get('/admin/lists', (req, res) => {
    res.redirect('/admin/lists/1');
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

app.get('/admin', (req, res) => {
    console.log(res);
    req.app.render('login', (err, html) => {
        if(err) throw err;
        res.end(html);
    });
});

app.post('/admin/login', (req, res) => {
    const { uid, upwd } = req.body;

    let pagenation = null;

    const verify = (admin) => {
        if(!admin){
            throw new Error('존재하지 않는 아이디 입니다.');
        }else{
            if(admin.verify(upwd)){
                req.session.user = {
                    admin: true,
                    id: uid
                };

                return true;
            }else{
                throw new Error('비밀번호가 일치하지 않습니다.');
            }
        }
    };

    const respond = () => {
        res.redirect('/admin/lists');
    };

    const onError = (error) => {
        req.app.render('login', {err: error.message}, (err, html) => {
            if(err) throw err;
            res.end(html);
        });
    };

    Admin.findOneById(uid)
          .then(verify)
          .then(respond)
          .catch(onError);
});

app.get('/admin/logout', (req, res) => {
    if(typeof req.session.user !== 'undefined'){
        req.session.destroy((err) => {
            if(err) throw err;
            res.redirect('/admin');
        });
        res.clearCookie(herokuConfig.sid);
    }else{
        res.redirect('/admin');
    }
});

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

app.listen(process.env.PORT || port, () => {
    console.log(`Server is running on port ${port}.`);
});
