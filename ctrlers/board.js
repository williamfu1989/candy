var async = require('async');

exports = module.exports = function($models, $Ctrler) {
    
    var Board = new $Ctrler($models.board),
        board = $models.board,
        thread = $model.thread;

    // create board
    Board.create = function(bzid, baby, cb) {
        var baby = new board(baby);
        baby.bz.push(bzid);
        baby.save(function(err) {
            cb(err, baby);
        });
    }

    // read default board (001)
    Board.readDefault = function(callback) {
        board.findOne({}).exec(callback);
    }

    // read full board
    Board.read = function(id, callback) {
        board.findById(id).populate('threads').populate('bz').exec(callback);
    }

    // list all boards' name
    Board.lsName = function(callback) {
        board.find({}).select('name url').exec(callback);
    }

    // list all boards
    Board.ls = function(callback) {
        board.find({}).populate('bz').populate('threads').exec(callback);
    }

    // List board IDs
    Board.lsId = function(params, callback) {
        board.find({}).select('_id').limit(params.limit).exec(callback);
    }

    // fetch board by URL
    // 这段逻辑需要重构，太乱了。
    Board.readByUrl = function(url, page, cb) {
        var limit = 10;
        board.findOne({
            url: url
        }).populate('bz').exec(function(err, board) {
            if (!err) {
                if (board) {
                    pager(thread, {
                        filter: {
                            board: board._id
                        },
                        limit: limit,
                        page: page
                    }, function(err, page) {
                        if (!err) {
                            // 这段逻辑冗余了
                            thread.find({
                                board: board._id
                            }).skip(page.from).limit(page.limit).sort('-pubdate').populate('lz').populate('board').exec(function(err, ts){
                                if (!err) {
                                    cb(null, {
                                        board: board,
                                        threads: ts,
                                        page: page
                                    });
                                } else {
                                    cb(err);
                                }
                            });
                        } else {
                            cb(err);
                        }
                    });
                } else {
                    cb(null, null);
                }
            } else {
                cb(err)
            }
        });
    }

    return Board;

}