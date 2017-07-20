'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseAutoIncrement = require('mongoose-auto-increment');

var _mongooseAutoIncrement2 = _interopRequireDefault(_mongooseAutoIncrement);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;

_mongooseAutoIncrement2.default.initialize(_mongoose2.default.connection);

var Board = new Schema({
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
Board.statics.create = function (vurl, vfile, vname, vdesc, vorigin, uname, unation, ucity, ucountry, usns, uemail, uvisit, upassport, uvisa, ucancel, uage, usex) {
    var board = new this({
        vurl: vurl,
        vfile: vfile,
        vname: vname,
        vdesc: vdesc,
        vorigin: vorigin,
        uname: uname,
        unation: unation,
        ucity: ucity,
        ucountry: ucountry,
        usns: usns,
        uemail: uemail,
        uvisit: uvisit,
        upassport: upassport,
        uvisa: uvisa,
        ucancel: ucancel,
        uage: uage,
        usex: usex
    });

    return board.save();
};

Board.statics.findOneByEmail = function (uemail) {
    return this.findOne({
        uemail: uemail
    }).exec();
};

Board.statics.getTotal = function (query) {
    return this.count(query).exec();
};

Board.statics.getList = function (query, pagenation) {
    return this.find(query).sort('-num').skip(pagenation.startBoard).limit(pagenation.size).exec();
};

Board.statics.getPagenation = function (page, total) {
    var size = 10;
    var pageSize = 5;

    var pagenation = {};
    var startBoard = (page - 1) * size;
    var totalPage = Math.ceil(total / size);
    var startPage = Math.floor((page - 1) / pageSize) * pageSize + 1;
    var endPage = startPage + (pageSize - 1);
    if (endPage > totalPage) endPage = totalPage;

    var pages = [];
    for (var i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    var prevPage = page < pageSize ? -1 : startPage - pageSize;
    var nextPage = endPage === totalPage ? -1 : endPage + 1;

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

Board.plugin(_mongooseAutoIncrement2.default.plugin, {
    'model': 'Board',
    'field': 'num',
    'startAt': 1,
    'incrementBy': 1
});

exports.default = _mongoose2.default.model('Board', Board);