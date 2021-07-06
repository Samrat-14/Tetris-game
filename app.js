document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-button');
    const restartBtn = document.querySelector('#restart-button');
    const width = 10;
    let nextRandom = 0;
    let timerId;
    let start = false;
    let game = false;
    let score = 0;
    const colors = [
        'orange',
        'red',
        'purple',
        'green',
        'blue'
    ]

    // The Tetrominoes
    const lTetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ]

    const zTetromino = [
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1],
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1]
    ]

    const tTetromino = [
        [1, width, width+1, width+2],
        [1, width+1, width+2, width*2+1],
        [width, width+1, width+2, width*2+1],
        [1, width, width+1, width*2+1],
    ]

    const oTetromino = [
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1]
    ]

    const iTetromino = [
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3],
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3]
    ]

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    let currentPosition = 4;
    let currentRotation = 0;

    // randomly select a tetromino and its first rotation 
    let random = Math.floor(Math.random()*theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];

    // draw the tetromino
    function draw(){
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
            squares[currentPosition + index].style.backgroundColor = colors[random];
        })
    }

    // undraw the tetromino
    function undraw(){
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
            squares[currentPosition + index].style.backgroundColor = '';
        })
    } 

    // assign functions to keycode
    function control(e){
        if(game){
            if(e.keyCode === 37){
                moveLeft();
            } else if(e.keyCode === 38){
                rotate();
            } else if(e.keyCode === 39){
                moveRight();
            } else if(e.keyCode === 40){
                moveDown();
            }
        }
    }
    document.addEventListener('keyup', control);

    // touch pad 
    document.addEventListener('touchstart', handleTouchStart, false);        
    document.addEventListener('touchmove', handleTouchMove, false);

    var xDown = null;                                                        
    var yDown = null;

    function getTouches(evt) {
      return evt.touches || evt.originalEvent.touches;
    }                                                     

    function handleTouchStart(evt) {
        const firstTouch = getTouches(evt)[0];                                      
        xDown = firstTouch.clientX;                                      
        yDown = firstTouch.clientY;                                      
    };                                                

    function handleTouchMove(evt) {
        if( !xDown || !yDown ) {
            return;
        }

        var xUp = evt.touches[0].clientX;                                    
        var yUp = evt.touches[0].clientY;

        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;

        if(Math.abs(xDiff) > Math.abs(yDiff)){ // most significant
            if (xDiff > 0) {
                // left swipe
                moveLeft();
            } else {
                // right swipe
                moveRight();
            }                       
        } else {
            if (yDiff > 0) {
                // up swipe 
                rotate()
            } else { 
                // down swipe
                moveDown()
            }                                                                 
        }
        // reset values
        xDown = null;
        yDown = null;                                             
    }


    // movedown function 
    function moveDown(){
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // freeze function 
    function freeze(){
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))){
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));

            // start a new tetromino falling 
            random = nextRandom;
            nextRandom = Math.floor(Math.random()*theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            displayShape();
            addScore();
            gameOver();
        }
    }

    // move the tetromino left, unless it is at the edge or there is a blockage
    function moveLeft(){
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if(!isAtLeftEdge) currentPosition -= 1;
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
            currentPosition += 1;
        }
        draw();
    }

    // move the tetromino right, unless it is at the edge or there is a blockage
    function moveRight(){
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width-1);
        if(!isAtRightEdge) currentPosition += 1;
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
            currentPosition -= 1;
        }
        draw();
    }

    // fix rotation of tetrominos at edge 
    function isAtRight(){
        return current.some(index => (currentPosition + index + 1) % width === 0);
    }
    function isAtLeft(){
        return current.some(index => (currentPosition + index) % width === 0);
    }
    function checkRotatedPosition(P){
        P = P || currentPosition;
        if((P+1) % width < 4){
            if(isAtRight()){
                currentPosition += 1;
                checkRotatedPosition(P);
            }
        }
        else if(P % width > 5){
            if(isAtLeft()){
                currentPosition -= 1;
                checkRotatedPosition(P);
            }
        }
    }

    // rotate the tetromino
    function rotate(){
        undraw()
        currentRotation ++;
        if(currentRotation === current.length){
            currentRotation = 0;
        }
        current = theTetrominoes[random][currentRotation];
        checkRotatedPosition();
        draw();
    } 

    // show up-next tetromino in mini-grid display 
    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    const displayIndex = 0;

    // the tetromino without rotation 
    const upNextTetrominoes = [
        [1, displayWidth+1, displayWidth*2+1, 2],                // lTetromino
        [0, displayWidth, displayWidth+1, displayWidth*2+1],     // zTetromino
        [1, displayWidth, displayWidth+1, displayWidth+2],       // tTetromino
        [0, 1, displayWidth, displayWidth+1],                    // oTetromino
        [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1]  // iTetromino
    ]

    // display the shape in the mini-grid display 
    function displayShape(){
        // remove any trace of a tetromino form the entire grid  
        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
            square.style.backgroundColor = '';
        })
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino');
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
        })
    }
    function undisplayShape(){
        // remove any trace of a tetromino form the entire grid  
        displaySquares.forEach(square => {
            square.classList.remove('tetromino')
            square.style.backgroundColor = ''
        })
    }

    // add functionality to the button 
    startBtn.addEventListener('click', () => {
        if(timerId){
            // pause clicked 
            startBtn.innerHTML = 'Resume';
            game = false;
            clearInterval(timerId);
            timerId = null;
        } else{
            // resume clicked 
            startBtn.innerHTML = 'Pause';
            game = true;
            draw();
            timerId = setInterval(moveDown, 500);
            displayShape();
        }
    })
    
    restartBtn.addEventListener('click', () => {
        if(start){
            // clear grid 
            for(let i=0; i<199; i++){
                squares[i].classList.remove('taken');
                squares[i].classList.remove('tetromino');
                squares[i].style.backgroundColor = '';
            }
            document.querySelector('.game-over').style.display = 'none';

            // restart game 
            game = true;
            if(!timerId){
                startBtn.innerHTML = 'Pause';
                timerId = setInterval(moveDown, 500);
            }

            // reset values
            random = Math.floor(Math.random()*theTetrominoes.length);
            nextRandom = Math.floor(Math.random()*theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];

            currentPosition = 4;
            score=0;
            scoreDisplay.innerHTML = score;

            draw();
            displayShape();
            document.querySelector('#pause-resume').style.display = 'flex';
        } else{
            restartBtn.innerHTML = 'Restart';
            document.querySelector('#pause-resume').style.display = 'flex';

            // start game 
            start = true;
            game = true;
            draw();
            timerId = setInterval(moveDown, 500);
            nextRandom = Math.floor(Math.random()*theTetrominoes.length);
            displayShape();
        }
    })

    // add score 
    function addScore(){
        for(let i=0; i<199; i+=width){
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];

            if(row.every(index => squares[index].classList.contains('taken'))){
                score += 10;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                    squares[index].style.backgroundColor = '';
                })

                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    // game over 
    function gameOver(){
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
            game = false
            undisplayShape();
            document.querySelector('.game-over').style.display = 'flex';
            document.querySelector('#pause-resume').style.display = 'none';
            clearInterval(timerId);
            timerId = null;
        }
    }
})