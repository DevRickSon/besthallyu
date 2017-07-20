const authMiddleware = (req, res, next) => {
    if(typeof req.session.user !== 'undefined' && req.session.user.admin){
        next();
    }else{
        res.redirect('/admin');
    }
};

export default authMiddleware;
