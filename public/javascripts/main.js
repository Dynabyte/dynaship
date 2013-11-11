

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
        state : "", 
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

function printShip(ship){
  if(ship == 1){
    return "#FF0000";
  } else if(ship == 2)  {
    return "#00FF00";
  } else if(ship == 3) {
    return "#0000FF";
  } else if(ship == 4) {
    return "#FFFF00";
  } else {
    return "#00FFFF";
  }
}

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

function renderBoard(player, round) {
    var done = "";
    if (player.round) {
        done = " done";
        round = player.round;
    }
    var board = '<div class="playerBoard'+done+'"><span class="theName">' + player.name + '</span><table>';
    var hits = 0;
    var shot = 0;
    var last = player.shots[player.shots.length - 1];
    for (var y = 0; y < player.board.length; y++) {
        board += "<tr>"
        for (var x = 0; x < player.board.length; x++) {
            var position = player.board[x][y];
            var state = 'unknown';
            var content = '';
            if (position.ship) {
                content = '#';
            }
            if (position.shot) {
                shot += 1;
                if (position.ship) {
                    hits += 1;
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
            if (last && last.x == x && last.y == y) {
                state += " last"
            }
            board += '<td class="position '+state+'">'+content+'</td>';
        }
        board += "</tr>";
    }
    board += '</table>';
 
    board += '<div class="scores">'
        +'<span><b class="number">'+round+'</b> rounds</span>'
        +'<span><b class="number">'+hits+'</b> hits!</span></div>';
 
    board += '</div>';
 
    return board;
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

var Round = function (element, playerBoards, round, gameOverCallback) {
    element.html("Playing round " + round + "!<br>");
    for (var i = 0; i < playerBoards.length; i++) {
        element.append(renderBoard(playerBoards[i], round));
    }

    var gotMoves = [];
    function gotMove(player, coordinates) {
        gotMoves.push({player: player, coordinates: coordinates});

        if (coordinates) {
            shootAt(player, coordinates.x, coordinates.y);  
            player.shots.push(coordinates);
        } else {
            player.shots.push(null);
        }
        
        if (gotMoves.length == playerBoards.length) {
            element.find('button.next').removeAttr('disabled');
        }
        checkState(player);
    }

    function checkState(player) {
        if(player.round === undefined) {
            var someAlive = false;
            for(ship in player.ships) {
                if(player.ships[ship].life > 0) {
                    someAlive = true;
                }
            }
            if(!someAlive) {
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
        new Round(element, playerBoards, round + 1, gameOverCallback);
    });
};

var Game = function(element, players, gameOverCallback) {
    var board = generate(10, ships);

    var playerBoards = [];
    for (player in players) {
        playerBoards.push({
            name: player,
            url: players[player],
            board: JSON.parse(JSON.stringify(board)),
            ships: JSON.parse(JSON.stringify(ships)),
            round: undefined,
            shots: []
        });
    }

    new Round(element, playerBoards, 0, gameOverCallback);
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

    var form = '<input type="text" name="url" class="url" placeholder="Url to AI"/> '
        +'<input type="text" name="playername" class="playername" placeholder="Player name"/>'
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

        body.append('<br><br><button class="init">Start game</button>');

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
        new Game($("#boards"), players, function(){
            console.log("Game over man, game over.");
        });
    });

});
