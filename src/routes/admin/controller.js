import Admin from '../../models/Admin';
import Board from '../../models/Board';
import herokuConfig from '../../../herokuConfig';

exports.admin = (req, res) => {
    req.app.render('login', (err, html) => {
        if(err) throw err;
        res.send(html);
    });
};

exports.login = (req, res) => {
    const { uid, upwd } = req.body;

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
        req.app.render('error', {message: error.message}, (err, html) => {
            if(err) throw err;
            res.send(html);
        });
    };

    Admin.findOneById(uid)
          .then(verify)
          .then(respond)
          .catch(onError);
};

exports.logout = (req, res) => {
    if(typeof req.session.user !== 'undefined'){
        req.session.destroy((err) => {
            if(err) throw err;
            res.redirect('/admin');
        });
        res.clearCookie(herokuConfig.sid);
    }else{
        res.redirect('/admin');
    }
};

exports.create = (req, res) => {
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
};

exports.redirectLists = (req, res) => {
    res.redirect('/admin/lists/1');
};

exports.lists = (req, res) => {
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
            res.send(html);
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
};
