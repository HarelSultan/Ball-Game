'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/glue.png">'
const AUDIO = new Audio('audio/eat-ball.wav')

// Model:
var gBoard
var gGamerPos
var gBallIntervalId
var gGlueIntervalId
var gCollectedBalls
var gBallsCount
var gIsPlayerGlued
var gRowSize = 10
var gColSize = 12
var gFirstPortal
var gSecondPortal
var gThirdPortal
var gFourthPortal


function onInitGame() {
    gGamerPos = { i: 2, j: 9 }
    definePortalsLocation()
    gBoard = buildBoard(gRowSize, gColSize)
    renderBoard(gBoard)
    gBallsCount = 2
    gCollectedBalls = 0
    gIsPlayerGlued = false
    closeModal()
    gBallIntervalId = setInterval(addNewBall, 5000)
    gGlueIntervalId = setInterval(addGlue, 5000)
    renderCollectedBallsCount()
}

function buildBoard(rowSize, colSize) {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < rowSize; i++) {
        board[i] = []
        for (var j = 0; j < colSize; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === rowSize - 1 || j === 0 || j === colSize - 1) {
                board[i][j].type = WALL
            }

            if ((i === gFirstPortal.i && j === gFirstPortal.j) || (i === gSecondPortal.i && j === gSecondPortal.j) ||
                (i === gThirdPortal.i && j === gThirdPortal.j) || (i === gFourthPortal.i && j === gFourthPortal.j)) {
                board[i][j].type = FLOOR
            }
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL
    return board
}

// Render the board to an HTML table
function renderBoard(board) {
    const elBoard = document.querySelector('.board')
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    if (gIsPlayerGlued) return

    if (i === gFirstPortal.i && j === gFirstPortal.j) {
        portalPlayer(gSecondPortal)
        return
    } else if (i === gSecondPortal.i && j === gSecondPortal.j) {
        portalPlayer(gFirstPortal)
        return
    } else if (i === gThirdPortal.i && j === gThirdPortal.j) {
        portalPlayer(gFourthPortal)
        return
    } else if (i === gFourthPortal.i && j === gFourthPortal.j) {
        portalPlayer(gThirdPortal)
        return
    }

    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)

    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

        if (targetCell.gameElement === BALL) {
            gCollectedBalls++
            AUDIO.play()
            renderCollectedBallsCount()
            checkVictory()
        }

        if (targetCell.gameElement === GLUE) {
            gluePlayer()
        }

        // DONE: Move the gamer
        // REMOVING FROM
        // update Model
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update DOM
        renderCell(gGamerPos, '')

        // ADD TO
        // update Model
        targetCell.gameElement = GAMER
        gGamerPos = { i, j }
        // update DOM
        renderCell(gGamerPos, GAMER_IMG)

    }
    renderBallsAround()
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value

}

// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j
    console.log('event.key:', event.key)

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}



function getEmptyCellLocation() {
    const emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const currCell = gBoard[i][j]
            if (currCell.type === WALL || currCell.gameElement) continue
            emptyCells.push({ i, j })
        }
    }
    const randIdx = getRandomInt(0, emptyCells.length - 1)
    return emptyCells[randIdx]
}


function addNewBall() {
    const emptyCellLocation = getEmptyCellLocation()
    // Update Model
    gBoard[emptyCellLocation.i][emptyCellLocation.j].gameElement = BALL
    // Update DOM
    renderCell(emptyCellLocation, BALL_IMG)
    gBallsCount++
}

function addGlue() {
    const emptyCellLocation = getEmptyCellLocation()
    // Update Model
    gBoard[emptyCellLocation.i][emptyCellLocation.j].gameElement = GLUE
    // Update DOM
    renderCell(emptyCellLocation, GLUE_IMG)
    setTimeout(removeGlue, 3000, emptyCellLocation)
}

function removeGlue(glueLocation) {
    // Update Model
    if (gIsPlayerGlued) return
    gBoard[glueLocation.i][glueLocation.j].gameElement = null
    // Update DOM
    renderCell(glueLocation, '')
}

function renderCollectedBallsCount() {
    // Update Dom
    const elBallsCounter = document.querySelector('.collected-balls-counter')
    elBallsCounter.innerText = `Balls Collected : ${gCollectedBalls}`
}

function checkVictory() {
    if (gBallsCount === gCollectedBalls) gameOver()
}

function portalPlayer(location) {
    // Move From
    // update Model
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
    // update DOM
    renderCell(gGamerPos, '')

    // ADD TO
    // update Model
    gBoard[location.i][location.j].gameElement = GAMER
    gGamerPos = { i: location.i, j: location.j }
    // update DOM
    renderCell(gGamerPos, GAMER_IMG)
}

function gluePlayer() {
    gIsPlayerGlued = true
    setTimeout(() => {
        gIsPlayerGlued = false
    }, 3000)
}

function renderBallsAround() {
    const ballsAroundCount = countNeighbors(gGamerPos.i, gGamerPos.j, gBoard)
    const elNegsCounter = document.querySelector('.balls-around-counter')
    elNegsCounter.innerText = `Balls Around You : ${ballsAroundCount}`
}

function definePortalsLocation() {
    const halfRowSize = Math.floor(gRowSize / 2)
    gFirstPortal = { i: 0, j: halfRowSize }
    gSecondPortal = { i: gRowSize - 1, j: halfRowSize }
    gThirdPortal = { i: halfRowSize, j: 0 }
    gFourthPortal = { i: halfRowSize, j: gColSize - 1 }
}

function gameOver() {
    clearInterval(gBallIntervalId)
    clearInterval(gGlueIntervalId)
    gIsPlayerGlued = true
    const elWinnerMsg = document.querySelector('.winner-modal')
    elWinnerMsg.classList.remove('hidden')
}

function closeModal() {
    const elWinnerMsg = document.querySelector('.winner-modal')
    elWinnerMsg.classList.add('hidden')
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min)
}