const gameBoard = (() => {
    const BOARD_SIZE = 9;
    const EMPTY = '';
    const THREE_IN_A_ROW_LIST = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],    // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],    // Columns
        [0, 4, 8], [2, 4, 6]                // Diagonals
    ];
    
    let board = [];
    let numberOfPlay = 0;
    let hasWon = false;

    function isEmpty(i) {
         return 0 <= i && i < BOARD_SIZE && board[i].mark === EMPTY; 
    }

    function checkThreeInARow(cells) {
        return board[cells[0]].mark != EMPTY 
            && board[cells[0]].mark === board[cells[1]].mark 
            && board[cells[0]].mark === board[cells[2]].mark;
    };

    function markWinningCells() {
        const winningCells = THREE_IN_A_ROW_LIST
            .filter(checkThreeInARow);

        winningCells.forEach((cells) => {
            board[cells[0]].winning = true;
            board[cells[1]].winning = true;
            board[cells[2]].winning = true;
        })

        return winningCells.length > 0;
    };

    function play(i, mark) {
        if (numberOfPlay >= BOARD_SIZE || mark === EMPTY || !isEmpty(i)) {
            return false;
        }

        board[i].mark = mark;
        numberOfPlay++;

        hasWon = markWinningCells();

        return true;
    };

    function win() {
        return hasWon;
    }

    function tie() {
        return numberOfPlay === BOARD_SIZE;
    }

    function get() {
        return structuredClone(board);
    }

    function reset() {
        board = [];
        numberOfPlay = 0;
        hasWon = false;
        for (let i = 0; i < BOARD_SIZE; i++) {
            board[i] = {
                mark: EMPTY,
                winning: false,
            };
        }
    };

    reset();

    return {play, win, tie, get, reset};
})();

const game = ((gameBoard) => {
    function createPlayer(name, mark) {
        let score = 0;
        const play = (i) => gameBoard.play(i, mark);
        const getScore = () => score;
        const addScore = () => score++;
        const resetScore = () => score = 0;
        return {name, mark, play, getScore, addScore, resetScore};
    }

    const playerX = createPlayer('Player X', 'x');
    const playerO = createPlayer('Player O', 'o');

    let currentPlayer = playerX;
    let nextPlayer = playerO;
    let roundEnded = false;
    let roundResult = undefined;

    function play(i) {
        if(roundEnded || !currentPlayer.play(i)) {
            return;
        }

        if (gameBoard.win()) {
            currentPlayer.addScore();
            roundEnded = true;
            roundResult = {
                outcome: 'win',
                winner: currentPlayer.name,
            };
        }

        if (gameBoard.tie()) {
            roundEnded = true;
            roundResult = {
                outcome: 'tie',
            };
        }

        const tmp = currentPlayer;
        currentPlayer = nextPlayer;
        nextPlayer = tmp;

        return state();
    }

    function state() {
        return {
            playerXScore: playerX.getScore(),
            playerOScore: playerO.getScore(),
            currentPlayerMark: currentPlayer.mark,
            roundEnded: roundEnded,
            roundResult: roundResult,
        }
    }

    function nextRound() {
        roundEnded = false;
        roundResult = undefined;
        gameBoard.reset();
    }

    function reset() {
        playerX.resetScore();
        playerO.resetScore();
        nextRound();
    }

    return {play, state, nextRound, reset}
})(gameBoard);

const uiController = ((gameBoard, game) => {
    const playerXScore = document.getElementById('player-x-score');
    const playerOScore = document.getElementById('player-o-score');
    const currentPlayer = document.getElementById('current-player');

    const cells = document.querySelectorAll('.cell');
    const resetGame = document.getElementById('reset-game');
    const nextRound = document.getElementById('next-round');

    cells.forEach((cell, i) => {
        cell.addEventListener('click', () => {
            game.play(i);
            render();
        })
    });

    resetGame.addEventListener('click', () => {
        game.reset();
        render();
    });

    nextRound.addEventListener('click', () => {
        game.nextRound();
        render();
    });

    function render() {
        const state = game.state();
        const board = gameBoard.get();

        playerXScore.textContent = state.playerXScore;
        playerOScore.textContent = state.playerOScore;
        currentPlayer.textContent = `Player ${state.currentPlayerMark.toUpperCase()}'s Turn!`;

        board.forEach((cell, i) => {
            cells[i].innerHTML = '';

            if (cell.mark != '') {
                const icon = document.createElement('div');
                icon.classList.add('icon');
                icon.classList.add(cell.mark);

                if (cell.winning) {
                    icon.style.backgroundColor = 'red';
                }

                cells[i].appendChild(icon);
            }
        });

        if (state.roundEnded) {
            nextRound.classList.remove('hidden');
        } else {
            nextRound.classList.add('hidden');
        }
    }

    render();
})(gameBoard, game);
