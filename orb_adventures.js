var maze = (function() {
	var assetsLoaded = 0;
	var mazeImg;
	var orbImg;
	var finishLineImg;
	var timeAllowed;
    var currentOrbXPos = 165;
    var currentOrbYPos = 30;
    var mazeWidth = 611;
    var mazeHeight = 509; 
    var gameOn = false;
    var timeElapsed;  	

	//array to hold players so we can iterate thru it
	//when writing player names/scores to page
	var players = [];


	//Player object constructor
	function Player (id, playerName) {
		this.id = id;
		this.playerName = playerName;
		this.score = 0;
	}

	//validate player has entered name
	function validateForm(value, msg) {

		if (value == null) {
			return "cancel";
		}

		if (value == "") {
			alert(msg);
			return true;
		}
		return false;
	}

	//process data from player form registration
	function getPlayerFormData() {
		//var playerName = document.getElementById("playername").value;
		var playerName = prompt("Please enter your name: ");
		var validationResult = validateForm(playerName, "Please enter your name");
		if (validationResult == true || validationResult == "cancel") {
			return;
		}
		
		//generate random number for Player id
		var id = generateRandomNum();

		//create newPlayer object
		var newPlayer = new Player(id, playerName);

		//add newly created player to GLOBAL storage array
		players.push(newPlayer);

		//add player to page
		addNewPlayerToPage(newPlayer);
		
		//add new player to browser Local Storage
		savePlayerDataToLocalStorage(newPlayer);

		//start game: start game and timer (in seconds)
		startGame(120);
	}

	function generateRandomNum() {
		var randomNum = Math.floor(100000 + Math.random() * 900000);
		return randomNum;
	}

	function addNewPlayerToPage(newPlayer) {
		var ul = document.getElementById("playerlist");
		var li = createNewPlayerListItem(newPlayer);
		ul.appendChild(li);
	}

	function savePlayerDataToLocalStorage(newPlayer) {
		if(localStorage) {
			var key = "lbadv_" + newPlayer.id;
			var item = JSON.stringify(newPlayer);
			localStorage.setItem(key, item);
		}
		else {
			alert("Error: your browser does not support localStorage.");
		}
	}

	function retrieveSavedPlayers() {
		if (localStorage) {
			for (var i = 0; i < localStorage.length; i++) {
				var key = localStorage.key(i);
				if (key.substring(0, 6) === "lbadv_") {
					var playerFound = localStorage.getItem(key);
					var player = JSON.parse(playerFound);
					players.push(player);
				}
			}
			addAllPlayersToPage();

		}
		else {
			console.log("Error: your browser does not support localStorage.");
		}
	}

	function addAllPlayersToPage() {
		var ul = document.getElementById("playerlist");
		var playerListFragment = document.createDocumentFragment();
		for (var i = 0; i < players.length; i++) {
			var player = players[i];
			var li = createNewPlayerListItem(player);
			playerListFragment.appendChild(li);
		}
		ul.appendChild(playerListFragment);
	}

	function createNewPlayerListItem(player) {
		var li = document.createElement("li");
		var spanPlayer = document.createElement("span");
		if(player.score == 0) {
			spanPlayer.innerHTML = "<span class=\"playername\">" + player.playerName + "</span>" + 
			"<span class=\"playerscore\"> --- </span>";
			li.appendChild(spanPlayer);
		}
		else {
			spanPlayer.innerHTML = "<span class=\"playername\">" + player.playerName + "</span>" + 
			"<span class=\"playerscore\">" + player.score + " sec.</span>";
			li.appendChild(spanPlayer);
		}
		return li;
	}


	function startGame(seconds) {
		gameOn = true;
		timeElapsed = 0;
        timeAllowed = setInterval(function () {
            makeBackgroundWhite(mazeWidth, 0, mazeContext.canvas.width - mazeWidth, mazeContext.canvas.height);
            if (seconds === 0) {
            	gameOn = false;
                clearInterval(timeAllowed);

                makeBackgroundWhite(0, 0, mazeContext.canvas.width, mazeContext.canvas.height);
                mazeContext.context.font = "40px Arial";
                mazeContext.context.fillStyle = "red";
                mazeContext.context.textAlign = "center";
                mazeContext.context.textBaseline = "middle";              
				mazeContext.context.fillText("Time's up!", mazeContext.canvas.width/2, mazeContext.canvas.height/2);
                
                setTimeout(function() {
					location.reload(true);
                }, 3000);
                
                return;
            }
            
			//capture keyboard events for orb navigation (using AWSD or up, down, left, right arrows)
		    document.onkeydown = function(e) {
		        moveOrb(e);
		    }

            mazeContext.context.font = "20px Arial";
            if (seconds <= 10 && seconds > 5) {
                mazeContext.context.fillStyle = "orangered";
            }
            else if (seconds <= 5) {
                mazeContext.context.fillStyle = "red";
            }
            else {
                mazeContext.context.fillStyle = "green";
            }
            mazeContext.context.textAlign = "center";
            mazeContext.context.textBaseline = "middle";
           	
            var minutes = Math.floor(seconds/60);
            var secondsToShow = (seconds - minutes * 60).toString();
            if (secondsToShow.length === 1) {
                secondsToShow = "0" + secondsToShow; // if the number of seconds is '5' for example, make sure that it is shown as '05'
            }
            mazeContext.context.fillText(minutes.toString() + ":" + secondsToShow, mazeWidth + 30, mazeContext.canvas.height/2);
            seconds--;
            timeElapsed++;
        }, 1000);
        return;
    }



    function moveOrb(e) {
        var newX;
        var newY;
        var movingAllowed;
        
        if (gameOn) {
	        switch (e.keyCode) {
	            case 38: // up arrow key (go up)
	            case 87: // W key (go up)
	                newX = currentOrbXPos;
	                newY = currentOrbYPos - 5;
	                e.preventDefault();
	                break;
	            case 37: // left arrow key
	            case 65: // A key (go left) 
	                newX = currentOrbXPos - 5;
	                newY = currentOrbYPos;
	                e.preventDefault();
	                break;
	            case 40: // down arrow key
	            case 83: // S key (go down)
	                newX = currentOrbXPos;
	                newY = currentOrbYPos + 5;
	                e.preventDefault();
	                break;
	            case 39: // right arrow key
	            case 68: // D key (go right)
	                newX = currentOrbXPos + 5;
	                newY = currentOrbYPos;
	                e.preventDefault();
	                break;
	        }
	       	movingAllowed = canMoveTo(newX, newY);

	        if (movingAllowed === 1) {      // 1 means 'the orb can move'
	        	orbImg.erase(currentOrbXPos, currentOrbYPos, 25, 26);
	            orbImg.draw(newX, newY, 25, 26);
	            currentOrbXPos = newX;
	            currentOrbYPos = newY;
	        }
	        else if (movingAllowed === 2) { // 2 means 'the orb has reached finish line'  	
	            clearInterval(timeAllowed);
	        	gameOn = false;
	        	playerscore = timeElapsed;
	        	updatePlayerScore(playerscore);
	        	orbImg.erase(currentOrbXPos, currentOrbYPos, 25, 26);
	            mazeImg.erase(0, 0, mazeContext.canvas.width, mazeContext.canvas.height);	            
	            mazeContext.context.font = "40px Arial";
	            mazeContext.context.fillStyle = "green";
	            mazeContext.context.textAlign = "center";
	            mazeContext.context.textBaseline = "middle";
	            mazeContext.context.fillText("Congratulations!", mazeContext.canvas.width/2, mazeContext.canvas.height/2);
				setTimeout(function() {
	            	location.reload(true);
	            }, 3000);
	        }
        }
    }

    function updatePlayerScore(playerscore) {
    	var currentPlayer = players.length - 1;
    	var playerId = players[currentPlayer].id.toString();

			for (var i = 0; i < localStorage.length; i++) {
				var key = localStorage.key(i);
				if (key.substring(6) === playerId) {
					var currentPlayerFound = localStorage.getItem(key);
					var currentPlayerFoundObject = JSON.parse(currentPlayerFound);
					currentPlayerFoundObject.score = playerscore;
					break;
				}
			}
			localStorage.setItem(key, JSON.stringify(currentPlayerFoundObject));
    }

    function canMoveTo(destX, destY) {
        var imgData = mazeContext.context.getImageData(destX, destY, 25, 26);
        var data = imgData.data;
        var canMove = 1; // 1 means: the orb can move
        if (destX >= 0 && destX <= mazeWidth - 25 && destY >= 0 && destY <= mazeHeight - 26) {
            for (var i = 0; i < 4 * 25 * 26; i += 4) {
                if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) { // black
                    canMove = 0; // 0 means: the orb can't move
                    break;
                }
                else if (data[i] === 0 && data[i + 1] === 153 && data[i + 2] === 0 && data[i + 3] === 255) { // green               	
                    canMove = 2; // 2 means: we are at finish line
                    break;
                }
            }
        }
        else {
            canMove = 0;
        }
        return canMove;
    }        


    function makeBackgroundWhite(x, y, w, h) {
        mazeContext.context.beginPath();
        mazeContext.context.rect(x, y, w, h);
        mazeContext.context.closePath();
        mazeContext.context.fillStyle = "white";
        mazeContext.context.fill();
    }	

	var mazeContext = {
		    canvas : null,
		    context : null,
		    create: function(canvas_id) {
		        this.canvas = document.getElementById("maze");
		        this.context = this.canvas.getContext("2d");
		        return this.context;
		    }
	};


	function Sprite (filepath, x, y, w, h) {
		var self = this;
		this.image =  null;
		this.toRadians = Math.PI/180;

		
		if (filepath != undefined && filepath != "" && filepath != null) {
			this.image = new Image();
			assetsLoaded++;
			this.image.onload = function(e) {	
				console.log("assets loaded: " + assetsLoaded);
				self.draw(x, y, w, h);
			}
		}


		else {
			console.log("Unable to load sprite");
		}
		this.image.src = filepath;

 		
	}

	
	Sprite.prototype.draw = function(x, y, w, h) {
			console.log("params passed to draw: " + x +", " + y + ", " + w + ", " + h);
			this.erase(x, y, w, h);
			mazeContext.context.drawImage(this.image, x, y, this.image.width, this.image.height);
			
	};
	
	Sprite.prototype.erase = function(x, y, w, h) {
		    mazeContext.context.beginPath();
		    mazeContext.context.rect(x, y, w, h);
		    mazeContext.context.closePath();
		    mazeContext.context.fillStyle = "white";
		    mazeContext.context.fill();
	};

	Sprite.prototype.rotate = function(x, y, w, h, degrees) {
			this.erase(x, y, w, h);
			mazeContext.context.save();
			mazeContext.context.translate(x, y);
			mazeContext.context.rotate(degrees * this.toRadians);
			mazeContext.context.drawImage(this.image, -(this.image.width/2), -(this.image.height/2));
			mazeContext.context.restore();
	};

	return {
				
		init : function() {

			var startButton = document.getElementById("play");
			startButton.onclick = getPlayerFormData;
			retrieveSavedPlayers();			

	        //initiate canvas
	        mazeContext.create("maze");
	 
	        //get image paths (maze and orb)
	        var mazeImgPath = "http://localhost/advJS/lesson14/final/maze.gif";
	        var orbImgPath = "http://localhost/advJS/lesson14/final/orb.png";
	        var finishLineImgPath = "http://localhost/advJS/lesson14/final/finishline.gif"
	 		
			//construct image objects and draw them on screen once loaded
			setTimeout(function () {
				mazeImg = new Sprite(mazeImgPath, 0, 0, 882, 622);
			}, 500);
			setTimeout(function () {
				finishLineImg = new Sprite(finishLineImgPath, 255, 460, 50, 60);
			}, 800);
			setTimeout(function () {
				orbImg = new Sprite(orbImgPath, 165, 30, 25, 26);
			}, 1500);
					        		
		}
		
			
	};


})();