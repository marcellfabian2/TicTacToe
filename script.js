let cells = document.querySelectorAll("main div");
let modeSelect = document.querySelector(".mode-select");
let resetBtn = document.querySelector(".reset");
let turnIcon = document.querySelector(".turn-icon");
let scoreX = document.querySelector(".score-x .score-value");
let scoreO = document.querySelector(".score-o .score-value");
let scoreTies = document.querySelector(".score-ties .score-value");
let winOverlay = document.getElementById("winOverlay");
let winLabel = document.getElementById("winLabel");    
let winIcon = document.getElementById("winIcon");          
let winWho = document.getElementById("winWho");      
let quitBtn = document.getElementById("quitBtn");          
let nextBtn = document.getElementById("nextBtn"); 

let matrix = [];
let coords = [];
let currentPlayer = "X";
let mode = modeSelect.value;
let gameOver = false;
let scores = { X: 0, O: 0, ties: 0 };

function Matrix(){
    matrix = [];
    coords = [];
    let k = 0; 

    for(let i = 0; i < 3; i++){
        let sor = []; 
        matrix.push(sor);

        for(let j = 0; j < 3; j++){
            sor.push(null);     
            coords[k] = [i, j]; 
            k++;
        }
    }
}

function updateTurnIndicator(){
    turnIcon.classList.remove("icon-x", "icon-o");
    turnIcon.classList.add(currentPlayer === "X" ? "icon-x" : "icon-o");
}

function renderBoard(){
    for(let k = 0; k < cells.length; k++){
        let cell = cells[k];
        let i = coords[k][0]; 
        let j = coords[k][1]; 
        let val = matrix[i][j]; 

        cell.innerHTML = ""; 

        if(val){
            let mark = document.createElement("span");
            mark.className = "cell-mark " + (val === "X" ? "mark-x" : "mark-o");
            cell.appendChild(mark);
        }
    }
}

function updateScoreboard(){
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreTies.textContent = scores.ties;
}


function highlightWinningCells(combo, winner){
    if(!combo) return;

    for(let n = 0; n < combo.length; n++){
        let i = combo[n][0];
        let j = combo[n][1];
        let k = i * 3 + j; 
        cells[k].classList.add("cell-win", winner === "X" ? "win-x" : "win-o");
    }
}
function getWinResult(m){
    let lines = [
        [[0,0],[0,1],[0,2]], 
        [[1,0],[1,1],[1,2]], 
        [[2,0],[2,1],[2,2]], 
        [[0,0],[1,0],[2,0]],
        [[0,1],[1,1],[2,1]],
        [[0,2],[1,2],[2,2]],
        [[0,0],[1,1],[2,2]],
        [[0,2],[1,1],[2,0]],
    ];

    for(let l = 0; l < lines.length; l++){
        let line = lines[l];
        let a = line[0];
        let b = line[1];
        let c = line[2];
        let va = m[a[0]][a[1]]; 

        if(va && va === m[b[0]][b[1]] && va === m[c[0]][c[1]]){
            return { winner: va, combo: line };
        }
    }

    let isFull = true;
    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            if(m[i][j] === null){
                isFull = false; 
            }
        }
    }
    if(isFull) return { winner: "tie", combo: null };

    return null;
}

function checkWinner(){
    return getWinResult(matrix);
}

function showWinOverlay(result){
    winOverlay.classList.add("active");
    winIcon.classList.remove("icon-x", "icon-o");

    if(result === "tie"){
        winLabel.textContent = "DÖNTETLEN!";
        winIcon.style.display = "none";
        winWho.textContent = "SENKI SEM NYERT";
    } else {
        winIcon.style.display = "inline-block";
        winIcon.classList.add(result === "X" ? "icon-x" : "icon-o");
        winWho.textContent = "NYERTE A KÖRT";
        winLabel.textContent = mode === "1player"
            ? (result === "X" ? "NYERTÉL!" : "A GÉP NYERT!")
            : "JÁTÉK VÉGE";
    }
}
function hideWinOverlay(){
    winOverlay.classList.remove("active");
}

function endRound(result, combo){
    gameOver = true; 

    if(result === "tie"){
        scores.ties++;
    } else {
        scores[result]++;
    }

    updateScoreboard();               
    highlightWinningCells(combo, result);
    showWinOverlay(result);
}

function handleMove(k){
    if(gameOver) return; 

    let i = coords[k][0];
    let j = coords[k][1];

    if(matrix[i][j]) return;

    matrix[i][j] = currentPlayer;
    renderBoard();

    let result = checkWinner();
    if(result){
        endRound(result.winner, result.combo);
        return; 
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateTurnIndicator();

    if(mode === "1player" && currentPlayer === "O"){
        setTimeout(cpuMove, 400);
    }
}

function findWinningMove(player){
    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            if(!matrix[i][j]){
                matrix[i][j] = player;
                let result = getWinResult(matrix);
                matrix[i][j] = null;
                if(result && result.winner === player){
                    return i * 3 + j;
                }
            }
        }
    }
    return null; 
}

function cpuMove(){
    if(gameOver) return;
    let choice = findWinningMove("O");

    if(choice === null){
        choice = findWinningMove("X");
    }

    if(choice === null){
        let empty = []; 

        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                if(!matrix[i][j]) empty.push(i * 3 + j);
            }
        }

        if(empty.length === 0) return; 

        choice = empty[Math.floor(Math.random() * empty.length)];
    }
    handleMove(choice);
}

function clearBoard(){
    Matrix();         
    currentPlayer = "X";   
    gameOver = false;
    renderBoard();         
    updateTurnIndicator();
    hideWinOverlay();       

    for(let k = 0; k < cells.length; k++){
        cells[k].classList.remove("cell-win", "win-x", "win-o");
    }
}

function fullReset(){
    scores = { X: 0, O: 0, ties: 0 };
    updateScoreboard();
    clearBoard();
}

function onCellClick(k){
    handleMove(k);
}

for(let k = 0; k < cells.length; k++){
    cells[k].onclick = function(){
        onCellClick(k);
    };
}

resetBtn.onclick = function(){
    clearBoard();
};

quitBtn.onclick = function(){
    clearBoard();
};

nextBtn.onclick = function(){
    clearBoard();
};

modeSelect.onchange = function(){
    mode = modeSelect.value;
    fullReset();
};

Matrix();
updateTurnIndicator();
updateScoreboard();    