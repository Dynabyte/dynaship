var canvasSize = 300;

function updatePositionOnStage(stage, boardSize, position, state, isLast, isDuplicate, textContent) {

    var margin = (canvasSize / boardSize) / 10;
    var squareSize = (canvasSize - margin) / boardSize - margin;
    var cornerRadius = squareSize / 5;

    var seaworthyColor = "#FF1A74";
    var capsizedColor = "#04A8B2";
    var missedColor = "#A0B0FF";
    var borderColor = isDuplicate ? "#FF0000" : "#FFFFDD";
    var textColor = "#FFF";
       
    var borderWidth = canvasSize / (boardSize * 5);
    var font = (squareSize / 2) + "px Arial";
    
    var color;
    
    var border = isLast;
    switch(state) {
    case "seaworthy": color = seaworthyColor; cornerRadius = 0; break;
    case "capsized": {
        border = true;
        color = capsizedColor;
        borderColor = "#048892";
        borderWidth = canvasSize / 100; 
        cornerRadius = 0;
        break;
    }
    case "sea": color = missedColor; break;
    default: return;
    }
    var shape = position.shape;
    position.shape.graphics.clear();
    position.shape.graphics.beginFill(color).drawRoundRect(0, 0, squareSize, squareSize, cornerRadius);
    
    if (border) {    
        position.shape.graphics.beginStroke(borderColor).setStrokeStyle(borderWidth).drawRoundRect(0, 0, squareSize, squareSize, cornerRadius);
    }
    
    if (textContent) {
        var text = position.text;
        if (position.text) {
            stage.removeChild(position.text);
        }
        position.text = new createjs.Text(textContent, font, textColor);
        position.text.x = shape.x + squareSize / 2 - position.text.getMeasuredWidth() / 2 ;
        position.text.y = shape.y + squareSize / 2 - position.text.getMeasuredLineHeight() / 2 - margin / 2;

        stage.addChild(position.text);
    }
}

function shipHealth(ships) {
    var shipHealth = 0;
    for (var i = 0; i < ships.length; i++) {
        shipHealth += ships[i].life;
    }
    return shipHealth;
}

function placeBoard(player, board) {
    var title = '<div class="placement"></div><div class="player-name">' + player.name + '</div>';
    var canvas = '<canvas id="' + player.id + 'Canvas" class="canvas" width="' + canvasSize + '" height="' + canvasSize + '"/>';
    var canvasWrapper = '<div class="canvas-wrapper">' + canvas + '</div>';
    
    var health = shipHealth(player.ships);
    
    var scores = '<div class="scores">'
        +'<span><b class="number round">'+0+'</b> rounds</span>'
        +'<span><b id="' + player.id + 'ToGo" class="number">' + health + '</b> left!</span></div>';
    
    var boardWrapper = '<div id="' +  player.id + 'CanvasBoard" class="canvas-board">' + title + canvasWrapper + scores + '</div>';
    
    $(".canvases-container").append(boardWrapper);
    var stage = new createjs.Stage(player.id +"Canvas");
    var margin = (canvasSize / board.length) / 10;
    var squareSize = (canvasSize - margin) / board.length - margin;
    var cornerRadius = squareSize / 5;
    
    var positions = [];
    for (var i=0; i<board.length; i++) {
        var row = [];
        for (var j=0; j<board[i].length; j++) {
            
            var shape = new createjs.Shape();
            shape.graphics.beginFill("#D0D0D0").drawRoundRect(0, 0, squareSize, squareSize, cornerRadius);
            shape.x = margin + (squareSize + margin) * i;
            shape.y = margin + (squareSize + margin) * j;
            stage.addChild(shape);
            
            var position = {"shape": shape};
            row[j] = position;
            stage.addChild(shape);
        }
        positions.push(row);
    }
    
    var canvasBoard = {
        name: player.name,
        stage: stage,
        positions: positions
    }
    
    stage.update();

    return canvasBoard;
}

var randomIntegerBetween = function (a, b) {
  return Math.floor(Math.random()*b + a);
};

var randomBoolean = function () {
  return randomIntegerBetween(0, 2) === 0; 
};

var generate = function (battleAreaSize, ships) {
  var battleArea = [];
  for (var i = 0; i < battleAreaSize; i++) {
    var row = [];
    for (var j = 0; j < battleAreaSize; j++) {
      row[j] = {
        ship : undefined,
        shot : false,
        state: ""
      };
    }
    battleArea.push(row);
  }

  ships.forEach(function (ship) {
    var shipWillBeWithinBoard = false;
    var shipWillNotCollideWithOtherShips = false;
    var vertical = randomBoolean(),
      x = randomIntegerBetween(0, battleAreaSize),
      y = randomIntegerBetween(0, battleAreaSize);

    while(!shipWillBeWithinBoard && !shipWillNotCollideWithOtherShips) {
      var collision = false;
      if((vertical && y+ship.size > battleAreaSize) || (!vertical && x+ship.size > battleAreaSize)) {
        vertical = randomBoolean(),
        x = randomIntegerBetween(0, battleAreaSize ),
        y = randomIntegerBetween(0, battleAreaSize );
      } else {
        shipWillBeWithinBoard = true;
      }

      if(shipWillBeWithinBoard) {
        if(vertical){
          if(ship.size == 1){
            if(battleArea[x][y].ship !== undefined) {
              if(battleArea[x][y].ship.id != ship.id){
                collision = true;  
              }
            }
          } else {
            for(var i = 0, j = y; i < ship.size; i++){
              if(battleArea[x][j].ship !== undefined){
                if(battleArea[x][j].ship.id != ship.id){
                  collision = true;  
                }
              }
              j++;
            }
          }
        } else {
          if(ship.size == 1){
            if(battleArea[x][y].ship !== undefined) {
              if(battleArea[x][y].ship.id != ship.id){
                collision = true;  
              }
            }
          } else {
            for(var i = 0, j = x; i < ship.size; i++){
              if(battleArea[j][y].ship !== undefined){
                if(battleArea[j][y].ship.id != ship.id){
                  collision = true;
                }
              }
              j++;
            }
          }
        }
        if(!collision){
          shipWillNotCollideWithOtherShips = true;
        } else {
          shipWillBeWithinBoard = false;
          shipWillNotCollideWithOtherShips = false;
          vertical = randomBoolean(),
          x = randomIntegerBetween(0, battleAreaSize ),
          y = randomIntegerBetween(0, battleAreaSize );
        }
      }
    }
    
    for (var i = 0; i < ship.size; i++) {
      battleArea[x][y].ship = ship.id;
      vertical ? y++ : x++;
    }
  });
  
  return battleArea;
};

var ships = [
  {id : 1, size : 5, state: "alive", life: 5},
  {id : 2, size : 4, state: "alive", life: 4},
  {id : 3, size : 3, state: "alive", life: 3},
  {id : 4, size : 2, state: "alive", life: 2},
  {id : 5, size : 3, state: "alive", life: 3},
];


function renderJsonMessage(player) {
    var json = {
        size: player.board.length
    };
    var maskedShips = [];
    for (var i = 0; i < player.ships.length; i++) {
        maskedShips.push({
            id: player.ships[i].id,
            length: player.ships[i].size,
            alive: player.ships[i].life > 0
        });
    }
    json.ships = maskedShips;

    var shots = [];
    for (var x = 0; x < player.board.length; x++) {
        for (var y = 0; y < player.board[x].length; y++) {
            var position = player.board[x][y];
            
            if (position.shot == true) {
                var toReturn = {
                    coordinates: {
                        x: x,
                        y: y
                    }
                };
                if (position.ship) {
                    toReturn.state = "Seaworthy";
                    for (var i = 0; i < player.ships.length; i++) {
                        if (player.ships[i].id == position.ship && player.ships[i].life == 0) {
                            toReturn.state = "Capsized";
                        }
                    }
                } else {
                    toReturn.state = "Missed";
                }
                shots.push(toReturn);
            }

        }
    }

    json.shots = shots;

    return json;
}

function askForMove(player, success, error) {
    var url = player.url
    var move;
    $.ajax({
        type: 'POST',
        url: '/post/',
        data: JSON.stringify({
            player: decodeURIComponent(url).trim(),
            data: renderJsonMessage(player)
        }),
        async: true,
        success: success,
        error: error,
        dataType: 'json',
        contentType: 'application/json',
        timeout: 500
    });
}

function renderBoard(player, health, isDone, isLeader, isWinner, canvasBoard, round) { 

    if (player.round) {
        round = player.round;
    }

    var last = player.shots[player.shots.length - 1];
    var duplicate;
    for (var i=0; i<player.shots.length - 1; i++) {
        var shot = player.shots[i];
        if (last && shot && shot.x == last.x && shot.y == last.y) {
            duplicate = shot;
        }
    }
    
    for (var y = 0; y < player.board.length; y++) {
        for (var x = 0; x < player.board.length; x++) {
            var position = player.board[x][y];
            var state = 'unknown';
            var content = '';
            if (position.ship) {
                content = '#';
            }
            if (position.shot) {
                if (position.ship) {
                    state = 'seaworthy';
                    for (var i in player.ships) {
                        if (player.ships[i].id == position.ship && player.ships[i].life == 0) {
                            state = 'capsized';
                            content = position.ship;
                        }
                    }
                } else {
                    state = 'sea';
                }
            }
             
            var isLast = last && last.x == x && last.y == y;
            var isDuplicate = isLast && duplicate && duplicate.x == x && duplicate.y == y;
            

            updatePositionOnStage(canvasBoard.stage, player.board.length, canvasBoard.positions[x][y], state, isLast, isDuplicate, content);

        }
    }
    $("#" + player.id + "CanvasBoard .round").html(round);
    var id = "#" + player.id + "ToGo";
    $(id).html(health);
    
    var selector = "#" + player.id + "CanvasBoard";
    
    
    $(selector + " .placement").removeClass("leader").html("");
    
    if (isWinner) {
        $(selector + " .player-name").removeClass("done");
        $(selector + " .player-name").addClass("winner");
        $(selector + " .placement").addClass("leader").html("Winner");
        
    } else {
        $(selector + " .player-name").removeClass("winner");
    
        if (isLeader) {
            $(selector + " .placement").addClass("leader").html("Leader");
            
        } else if (isDone) {
            $(selector + " .player-name").removeClass("done");
            $(selector + " .player-name").addClass("done");
            $(selector + " .placement").html("Finished");
        
        }
    }    

    canvasBoard.stage.update();
}

function shootAt(player, x, y) {
    var position = player.board[x][y],
        shot = position.shot,
        ship = position.ship;

    if (!shot) {
        player.board[x][y].shot = true;
        if (ship) {
            for (var i = 0; i < player.ships.length; i++) {
                if (ship == player.ships[i].id) {
                    player.ships[i].life = player.ships[i].life - 1;
                }
            }
        }
    }
}

var Round = function (element, playerBoards, canvasBoards, round, gameOverCallback) {
    element.html("");
    
    var maxHealth = 0;
    for (var i=0; i < playerBoards[0].ships.length; i++) {
        maxHealth += playerBoards[0].ships[i].size;
    }

    var gotMoves = [];
    function gotMove(player, coordinates) {
    
        gotMoves.push({player: player, coordinates: coordinates});

        if (coordinates) {
            shootAt(player, coordinates.x, coordinates.y);  
            player.shots.push(coordinates);
        }

        checkState(player);
        
        if (gotMoves.length == playerBoards.length) {
            element.find('button.next').removeAttr('disabled');
            var allDone = true;
            for (var i = 0; i < playerBoards.length; i++) {
                if (!playerBoards[i].round) {
                    allDone = false;
                    break;
                }
            }
            if (allDone) {
                gameOverCallback(playerBoards);  
            }

                    var shipHealths = [];

        var leaderToGo = null;
        var shortestShotsLength = null;
        for (var i = 0; i < playerBoards.length; i++) {

            var health = shipHealth(playerBoards[i].ships);
            shipHealths[playerBoards[i].id] = health; 
            
            leaderToGo = (leaderToGo == null || health < leaderToGo) ? health : leaderToGo;
            shortestShotsLength = (shortestShotsLength == null || playerBoards[i].shots.length < shortestShotsLength) ? playerBoards[i].shots.length : shortestShotsLength;
        }

        for (var i = 0; i < playerBoards.length; i++) {
            var health = shipHealths[playerBoards[i].id];
            var isDone = playerBoards[i].round !== undefined;
            var isLeader = health == leaderToGo && leaderToGo != 0 && health < maxHealth;
            var isWinner = isDone && leaderToGo == 0 && playerBoards[i].shots.length == shortestShotsLength;
            renderBoard(playerBoards[i], health, isDone, isLeader, isWinner, canvasBoards[i], round);
        } 
            
        }

    }

    function checkState(player) {
        if (player.round === undefined) {
            var someAlive = false;
            for(ship in player.ships) {
                if(player.ships[ship].life > 0) {
                    someAlive = true;
                }
            }
            if (!someAlive) {
                player.round = round;
            }
        }
    }

    for (var i = 0; i < playerBoards.length; i++) {
        if (playerBoards[i].round === undefined) {
            askForMove(playerBoards[i], 
                function (player) { return function (data) {
                    gotMove(player, data);
                }}(playerBoards[i]), 
                function (player) { return function () { 
                    gotMove(player, undefined);
                }}(playerBoards[i]));
        } else {
            gotMove(playerBoards[i], undefined);
        }
    }
    
    element.append('<button class="next" disabled="disabled">Next round!</button>');
    element.find('button.next').click(function () {
        new Round(element, playerBoards, canvasBoards, round + 1, gameOverCallback);
    });
    
};

var Game = function(element, players, gameOverCallback) {
    var board = generate(10, ships);
  
    var playerBoards = [];
    var canvasBoards = [];
    i = 0;
    for (playerName in players) {
        playerBoards.push({
            id: i,
            name: playerName,
            url: players[playerName],
            board: JSON.parse(JSON.stringify(board)),
            ships: JSON.parse(JSON.stringify(ships)),
            round: undefined,
            shots: []
        });
        var canvasBoard = placeBoard(playerBoards[i], board);
        canvasBoards.push(canvasBoard);
        i++;
    }

    new Round(element, playerBoards, canvasBoards, 0, gameOverCallback);
};

var GameOver = function(element, players) {
    function sorter (a, b) {
        var diff = a.round - b.round;
        return diff == 0 ? 0 : diff / Math.abs(diff);
    }

    players.sort(sorter);

    element.html('');
    var table = '<table class="highscore">';
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        table += '<tr><td>'+(i+1) + '.</td><td>' + player.name + '</td><td>' + player.round + '</td></tr>';
    }
    table += '</table>';
    element.append(table);
};

var Players = function (element, initCallback) {

    var PlayerDB = function () {
        function _loadLocalStorage() {
            var players = {};
            if (localStorage && localStorage.players) {    
                players = JSON.parse(localStorage["players"]);
            }
            return players;
        }

        function _saveLocalStorage(players) {
            if (localStorage) {
                localStorage["players"] = JSON.stringify(players);
            }
        }

        var players = _loadLocalStorage();

        return {
            add: function (name, url) {
                players[name] = url;
                _saveLocalStorage(players);
            },
            all: function () {
                return JSON.parse(JSON.stringify(players));
            },
            remove: function (name) {
                delete players[name];
                _saveLocalStorage(players);
            }
        };
    }();

    var form = '<input type="text" name="playername" class="playername" placeholder="Player name"/>'
        +' <input type="text" name="url" class="url" placeholder="Url to AI"/> '
        +' <button class="addPlayer">Add player</button>';

    var body = $('<div></div>');
    element.append(body);

    function render() {
        var stuff = form;

        body.html(form);

        var players = PlayerDB.all();
        for (name in players) {
            body.append('<div class="player"><span class="name">' + name + '</span> <span class="url">' + players[name] + '</span>'
                +'<a href="#" class="delete" data-player="'+name+'">x</a></div>');
        }

        if (Object.keys(players).length > 0) {
                  body.append('<br><br><button class="init">Start game</button>');  
        }

        element.find('button.addPlayer').click(function () {
            var url = element.find("input.url");
            var name = element.find("input.playername");
            if (url.val() && name.val()) {
                PlayerDB.add(name.val(), url.val());
                name.val("");
                url.val("");
            }
           
            render();
        });
        element.find('button.init').click(function () {
            initCallback(PlayerDB.all());
        });
        element.find('a.delete').click(function (e) {
            PlayerDB.remove($(this).attr('data-player'));
            render();
            return false;
        });
    }

    render();

    return {};
};

$(function() {

    var players = new Players($("#addPlayers"), function (players) {
        $("#addPlayers").hide();
        new Game($("#boards"), players, function(players){
            new GameOver($("#boards"), players);
        });
    });

    $(document).keyup(function(evt) {
        if (evt.keyCode == 32 && $('button.next') && 'disabled' != $('button.next').attr('disabled')) {
            $('button.next').click();
            evt.preventDefault();
        }
    });

});
