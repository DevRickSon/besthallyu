import mongoose from 'mongoose';
const Schema = mongoose.Schema;

import autoIncrement from 'mongoose-auto-increment';
autoIncrement.initialize(mongoose.connection);

const Board = new Schema({
    vurl: String,
    vfile: String,
    vname: String,
    vdesc: String,
    vorigin: String,
    uname: String,
    unation: String,
    ucity: String,
    ucountry: String,
    usns: String,
    uemail: String,
    uvisit: String,
    upassport: String,
    uvisa: String,
    ucancel: String,
    uage: String,
    usex: String,
    date: {
        type: Date,
        default: Date.now
    }
});

//추가 요소
Board.statics.create = function(vurl, vfile, vname, vdesc, vorigin, uname, unation, ucity, ucountry, usns, uemail, uvisit, upassport, uvisa, ucancel, uage, usex){
    const board = new this({
        vurl,
        vfile,
        vname,
        vdesc,
        vorigin,
        uname,
        unation,
        ucity,
        ucountry,
        usns,
        uemail,
        uvisit,
        upassport,
        uvisa,
        ucancel,
        uage,
        usex
    });

    return board.save();
};

Board.statics.findOneByEmail = function(uemail){
    return this.findOne({
        uemail
    }).exec();
};

Board.statics.getTotal = function(query){
    return this.count(query).exec();
};

Board.statics.getList = function(query, pagenation){
    return this.find(query)
               .sort('-num')
               .skip(pagenation.startBoard)
               .limit(pagenation.size)
               .exec();
};

Board.statics.getPagenation = function(page, total){
    const size = 10;
    const pageSize = 5;

    let pagenation = {};
    let startBoard = (page - 1) * size;
    let totalPage = Math.ceil(total / size);
    let startPage = (Math.floor((page - 1) / pageSize) * pageSize) + 1;
    let endPage = startPage + (pageSize - 1);
    if(endPage > totalPage) endPage = totalPage;

    let pages = [];
    for(var i = startPage; i <= endPage; i++){
        pages.push(i);
    }

    let prevPage = (page < pageSize) ? -1 : startPage - pageSize;
    let nextPage = (endPage === totalPage) ? -1 : endPage + 1;

    pagenation.current = page;
    pagenation.total = total;
    pagenation.startBoard = startBoard;
    pagenation.startPage = startPage;
    pagenation.endPage = endPage;
    pagenation.pages = pages;
    pagenation.prevPage = prevPage;
    pagenation.nextPage = nextPage;
    pagenation.size = size;
    pagenation.pageSize = pageSize;

    return pagenation;
};

Board.plugin(autoIncrement.plugin, {
    'model': 'Board',
    'field': 'num',
    'startAt': 1,
    'incrementBy': 1
});

export default mongoose.model('Board', Board);
