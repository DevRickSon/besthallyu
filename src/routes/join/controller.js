import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

import Board from '../../models/Board';
import herokuConfig from '../../../herokuConfig';

aws.config.update({
    accessKeyId: herokuConfig.accessKeyId,
    secretAccessKey: herokuConfig.secretAccessKey,
    region: herokuConfig.region
});

const s3 = new aws.S3();
const S3_BUCKET = herokuConfig.bucket;

const maxFileSize = 3 * 1024 * 1024;
const upload = multer({
    limits: {fileSize: maxFileSize},
    storage: multerS3({
        s3: s3,
        bucket: S3_BUCKET,
        metadata: (req, file, cb) => {
            cb(null, {fieldname: file.fieldname});
        },
        key: (req, file, cb) => {
            cb(null, Date.now().toString() + '.' + file.originalname.split('.')[file.originalname.split('.').length-1]);
        }
    })
}).single('vfile');

exports.join = (req, res) => {
    req.app.render('join', (err, html) => {
        if(err) throw err;
        res.send(html);
    });
};

exports.registerJoin = (req, res) => {
    upload(req, res, (err) => {
        if(err){
            //todo size limits alert notice
            return req.app.render('error', {message: '3MB 이하의 동영상 파일만 업로드 가능합니다'}, (err, html) => {
                if(err) throw err;
                res.send(html);
            });
        }

        let { vurl, vname, vdesc, vorigin, ufirst, ulast, unation, ucity, ucountry, usns1, usns2, uemail, uvisit, upassport, uvisa, ucancel, uage, usex } = req.body;
        let uname = ufirst + ' ' + ulast;
        let usns = usns1;
        if(typeof usns2 !== '') usns += ', ' + usns2

        let file = req.file;
        let vfile = '';

        if(typeof file !== 'undefined'){
            vfile = file.location;
            vurl = '';
        }else{
            vfile = '';
        }

        const respond = () => {
            res.redirect('/join/success');
        };

        const onError = (err) => {
            req.app.render('error', {message: 'SERVER ERROR, Please try few minuts later..'}, (err, html) => {
                if(err) throw err;
                res.send(html);
            });
        }

        Board.create(vurl, vfile, vname, vdesc, vorigin, uname, unation, ucity, ucountry, usns, uemail, uvisit, upassport, uvisa, ucancel, uage, usex)
             .then(respond)
             .catch(onError);
    });
};

exports.success = (req, res) => {
    return req.app.render('success', (err, html) => {
        if(err) throw err;
        res.send(html);
    });
};
