import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import ejs from 'ejs';

import morgan from 'morgan';

const app = express();
const port = 8083;

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

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
    let { vurl, vfile, vname, vdesc} = req.body;
    console.log('url: ', vurl);
    console.log('file: ', vfile);
    console.log('name: ', vname);
    console.log('desc: ', vdesc);
    //유효성 체크
    //db insert
    //성공, 에러 페이지
});

//에러 핸들러 등록
//인피니티 라이브

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});
