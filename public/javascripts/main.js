var tempBoard = {
    "id": 2,
    "board": [
        [
            { // 0,0
                "state": "Hit",
                "ship": "Coastguard"
            },
            { // 0,1
                "state": "Unknown",
                "ship": null
            },
            { // 0,2
                "state": "Unknown",
                "ship": null
            }
        ],
        [
            {
                "state": "Unknown",
                "ship": null
            },
            {
                "state": "Hit",
                "ship": 1
            },
            {
                "state": "Unknown",
                "ship": null
            }
        ],
        [
            {
                "state": "Miss",
                "ship": null
            },
            {
                "state": "Hit",
                "ship": 1
            },
            {
                "state": "Miss",
                "ship": null
            }
        ]
    ],
    "bombs": 1,
    "boats": [
        {
            "id": 1,
            "length": 2,
            "alive": false
        },
        {
            "id": 2,
            "length": 1,
            "alive": true
        },
        {
            "id": "Coastguard",
            "length": 2,
            "alive": true
        }
    ]
}
var defaultBoardAsk = {
    "size": 3,
    "boats": [
        {
            "id": 0,
            "size": 1
        },
        {
            "id": 1,
            "size": 2
        }
    ]
}
var defaultBoardAnswer = {
    "boats": [
        {
            "id": 0,
            "x": 0,
            "y": 0,
            "dir": "right"
        },
        {
            "id": 1,
            "x": 2,
            "y": 1,
            "dir": "down"
        }
    ]
}

var Game = {
    boards: {},
    boardSize: 3,
    boats: {
        0: 1,
        1: 2
    },
    player: 1,
    startGame: function(player1, player2) {
        Game.buildBoards(player1, player2)
        Game.render()
    },
    buildBoards: function(player1, player2) {
        Game.boards = {}

        var board = {
            id: 0,
            size: Game.boardSize,
            boats: Game.boats
        }

        Game.boards[1] = Board.build(board, Game._askForBoats(player1))
        Game.boards[1]['url'] = player1
        Game.boards[2] = Board.build(board, Game._askForBoats(player2))
        Game.boards[2]['url'] = player2
    },
    _askForBoats: function(player) {
        // TODO: do post'n'shit => defaultBoardAsk

        return defaultBoardAnswer;
    },
    askForNextMove: function(player) {
        var url = Game.boards[player].url
        var move;
        if (url != '') {
            var board = Board.obscureBoard(Game.boards[player])
            $.ajax({
                type: 'POST',
                url: '/post/',
                data: {
                    player: decodeURIComponent(url).trim(),
                    data: JSON.stringify(board)
                },
                async: false,
                success: function (data) {
                    move = data;
                },
            });
        }
        if (typeof move == 'undefined'
            || typeof move.x == 'undefined'
            || typeof move.y == 'undefined') {
            move = {
                x: parseInt(Math.random()*Game.boardSize),
                y: parseInt(Math.random()*Game.boardSize)
            }
            console.log('No answer from player, defaulting to random')
        }
        console.log('player '+player+' x:'+move.x+' y:'+move.y)

        return move
    },
    step: function() {
        var player = Game.player
        var move = Game.askForNextMove(player)
        Game.bomb(player, move)
        Game.render()
        Game.player = player % 2 + 1
    },
    bomb: function (player, move) {
        Game.boards[player].board[move.y][move.x].bombed = true
    },
    render: function() {
        RenderEngine.renderBoard($('#player1board'), Game.boards[1])
        RenderEngine.renderBoard($('#player2board'), Game.boards[2])
        console.log(Game.boards)
    }
}

var Board = {
    build: function(standardBoard, boats) {
        var board = $.extend({}, standardBoard);
        board['board'] = []
        for (var i = 0; i < board.size; i++) {
            var row = []
            for (var j = 0; j < board.size; j++) {
               row.push({
                   "ship": null,
                   "bombed": false
               })
            }
           board.board.push(row)
        }

        for (var i = 0; i < boats.boats.length; i++) {
            var userBoat = boats.boats[i]
            var boatSize = board.boats[userBoat.id]

            for (var j = 0; j < boatSize; j++) {
                if (userBoat.dir.toLowerCase() == "down") {
                    board.board[userBoat.y+j][userBoat.x].ship = userBoat.id
                } else {
                    board.board[userBoat.y][userBoat.x+j].ship = userBoat.id
                }

            }
        }
        return board;
    },
    obscureBoard: function (board) {
        var returnBoard = {
            id: board.id,
            size: board.size,
            boats: board.boats,
            board: []
        }
        for (var y = 0; y < board.size; y++) {
            var row = []
            for (var x = 0; x < board.size; x++) {
                var square = board.board[y][x];
                var obscuredSquare = {
                    state: "unknown",
                    ship: null
                }
                if (square.bombed && square.ship === null) {
                    obscuredSquare.state = 'missed'
                } else if (square.bombed && square.ship !== null) {
                    obscuredSquare.state = 'hit'
                    if (Board._shipIsDown(x, y, board)) {
                        obscuredSquare.ship = square.ship
                    }
                }
                row.push(obscuredSquare)
            }
            returnBoard.board.push(row)
        }
        return returnBoard;
    },
    _shipIsDown: function (x, y, board) {
        return false
    }
}

RenderEngine = {
    renderBoard: function($id, board) {
        var table = '<table>'
        for (var y = 0; y < board.size; y++) {
            table += '<tr>'
            for (var x = 0; x < board.size; x++) {
                var square = board.board[y][x];

                var show = square.ship !== null ? square.ship : '';
                var bombed = square.bombed ? ' bombed' : '';
                table += '<td class="'+bombed+'">'+show+'</td>';
            }
            table += '</tr>'
        }
        table += '</table>'
        $id.html(table)
    }
}

$(function() {
    $('#start').click(function() {
        var player1 = $('#player1').val();
        var player2 = $('#player2').val();
        Game.startGame(player1, player2);
        return false;
    });

    $('#step').click(function() {
        Game.step();
        return false;
    });
});
