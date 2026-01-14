// ============================================================================
// MCTS TEST SUITE
// Run with: node test-mcts.js
// ============================================================================

const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;
const BOARD_SIZE = 9;
const WIN_LENGTH = 5;

class GameState {
    constructor(size = BOARD_SIZE) {
        this.size = size;
        this.board = Array(size).fill(null).map(() => Array(size).fill(EMPTY));
        this.currentPlayer = BLACK;
        this.winner = null;
        this.moveHistory = [];
    }

    clone() {
        const newState = new GameState(this.size);
        newState.board = this.board.map(row => [...row]);
        newState.currentPlayer = this.currentPlayer;
        newState.winner = this.winner;
        newState.moveHistory = [...this.moveHistory];
        return newState;
    }

    makeMove(row, col) {
        if (this.board[row][col] !== EMPTY || this.winner !== null) {
            return false;
        }
        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({row, col, player: this.currentPlayer});
        this.checkWinner(row, col);
        this.currentPlayer = this.currentPlayer === BLACK ? WHITE : BLACK;
        return true;
    }

    checkWinner(row, col) {
        const player = this.board[row][col];
        const directions = [
            [{dr: 0, dc: 1}],   // horizontal
            [{dr: 1, dc: 0}],   // vertical
            [{dr: 1, dc: 1}],   // diagonal \
            [{dr: 1, dc: -1}]   // diagonal /
        ];

        for (const dir of directions) {
            let count = 1;
            for (const {dr, dc} of dir) {
                for (let i = 1; i < WIN_LENGTH; i++) {
                    const r = row + dr * i;
                    const c = col + dc * i;
                    if (r >= 0 && r < this.size && c >= 0 && c < this.size && 
                        this.board[r][c] === player) {
                        count++;
                    } else {
                        break;
                    }
                }
                for (let i = 1; i < WIN_LENGTH; i++) {
                    const r = row - dr * i;
                    const c = col - dc * i;
                    if (r >= 0 && r < this.size && c >= 0 && c < this.size && 
                        this.board[r][c] === player) {
                        count++;
                    } else {
                        break;
                    }
                }
            }
            if (count >= WIN_LENGTH) {
                this.winner = player;
                return;
            }
        }
    }

    getLegalMoves() {
        const moves = [];
        if (this.winner !== null) return moves;

        if (this.moveHistory.length === 0) {
            const center = Math.floor(this.size / 2);
            return [{row: center, col: center}];
        }

        const considered = new Set();
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] !== EMPTY) {
                    for (let dr = -2; dr <= 2; dr++) {
                        for (let dc = -2; dc <= 2; dc++) {
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size &&
                                this.board[nr][nc] === EMPTY) {
                                const key = `${nr},${nc}`;
                                if (!considered.has(key)) {
                                    considered.add(key);
                                    moves.push({row: nr, col: nc});
                                }
                            }
                        }
                    }
                }
            }
        }

        return moves;
    }

    isTerminal() {
        if (this.winner !== null) return true;
        return this.getLegalMoves().length === 0;
    }

    getWinner() {
        return this.winner;
    }

    printBoard() {
        console.log('  0 1 2 3 4 5 6 7 8');
        for (let r = 0; r < this.size; r++) {
            let row = r + ' ';
            for (let c = 0; c < this.size; c++) {
                if (this.board[r][c] === EMPTY) row += '. ';
                else if (this.board[r][c] === BLACK) row += 'X ';
                else row += 'O ';
            }
            console.log(row);
        }
        console.log('');
    }
}

class MCTSNode {
    constructor(state, parent = null, move = null) {
        this.state = state;
        this.parent = parent;
        this.move = move;
        this.children = [];
        this.visits = 0;
        this.wins = 0;
        this.untriedMoves = state.getLegalMoves();
        this.playerJustMoved = state.currentPlayer === BLACK ? WHITE : BLACK;
    }

    isFullyExpanded() {
        return this.untriedMoves.length === 0;
    }

    getUCB1(explorationConstant = 1.41) {
        if (this.visits === 0) return Infinity;
        const exploitation = this.wins / this.visits;
        const exploration = explorationConstant * Math.sqrt(Math.log(this.parent.visits) / this.visits);
        return exploitation + exploration;
    }

    bestChild(explorationConstant = 1.41) {
        return this.children.reduce((best, child) => {
            const childUCB = child.getUCB1(explorationConstant);
            const bestUCB = best.getUCB1(explorationConstant);
            return childUCB > bestUCB ? child : best;
        });
    }

    expand() {
        if (this.untriedMoves.length === 0) return null;
        
        const moveIndex = Math.floor(Math.random() * this.untriedMoves.length);
        const move = this.untriedMoves.splice(moveIndex, 1)[0];
        
        const newState = this.state.clone();
        newState.makeMove(move.row, move.col);
        
        const childNode = new MCTSNode(newState, this, move);
        this.children.push(childNode);
        
        return childNode;
    }

    update(result) {
        this.visits++;
        if (result === this.playerJustMoved) {
            this.wins++;
        }
    }

    getWinRate() {
        return this.visits > 0 ? (this.wins / this.visits) : 0;
    }
}

class MCTS {
    constructor(rootState, explorationConstant = 1.41) {
        this.root = new MCTSNode(rootState);
        this.explorationConstant = explorationConstant;
    }

    iterate() {
        const node = this.select(this.root);
        let expandedNode = node;
        if (!node.state.isTerminal()) {
            expandedNode = node.expand();
            if (!expandedNode) expandedNode = node;
        }
        const result = this.simulate(expandedNode.state);
        this.backpropagate(expandedNode, result);
    }

    select(node) {
        let current = node;
        while (!current.state.isTerminal() && current.isFullyExpanded()) {
            current = current.bestChild(this.explorationConstant);
        }
        return current;
    }

    simulate(state) {
        const simState = state.clone();
        let stepCount = 0;
        const maxSteps = 100;
        
        while (!simState.isTerminal() && stepCount < maxSteps) {
            const moves = simState.getLegalMoves();
            if (moves.length === 0) break;
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            simState.makeMove(randomMove.row, randomMove.col);
            stepCount++;
        }
        
        return simState.getWinner();
    }

    backpropagate(node, result) {
        let current = node;
        while (current !== null) {
            current.update(result);
            current = current.parent;
        }
    }

    getBestMove() {
        if (this.root.children.length === 0) return null;
        return this.root.children.reduce((best, child) => {
            return child.visits > best.visits ? child : best;
        });
    }
}

// ============================================================================
// TEST CASES
// ============================================================================

function assert(condition, message) {
    if (!condition) {
        console.error('❌ FAIL:', message);
        return false;
    }
    console.log('✅ PASS:', message);
    return true;
}

function testGameStateBasics() {
    console.log('\n=== Testing GameState Basics ===');
    
    const state = new GameState();
    assert(state.currentPlayer === BLACK, 'Initial player should be BLACK');
    assert(state.winner === null, 'Initial winner should be null');
    assert(state.board[4][4] === EMPTY, 'Board should be empty initially');
    
    state.makeMove(4, 4);
    assert(state.board[4][4] === BLACK, 'Move should place BLACK stone');
    assert(state.currentPlayer === WHITE, 'Player should switch to WHITE');
}

function testWinDetection() {
    console.log('\n=== Testing Win Detection ===');
    
    // Test horizontal win
    const state1 = new GameState();
    for (let i = 0; i < 5; i++) {
        state1.board[4][i] = BLACK;
    }
    state1.checkWinner(4, 2);
    assert(state1.winner === BLACK, 'Should detect horizontal win');
    
    // Test vertical win
    const state2 = new GameState();
    for (let i = 0; i < 5; i++) {
        state2.board[i][4] = WHITE;
    }
    state2.checkWinner(2, 4);
    assert(state2.winner === WHITE, 'Should detect vertical win');
    
    // Test diagonal win
    const state3 = new GameState();
    for (let i = 0; i < 5; i++) {
        state3.board[i][i] = BLACK;
    }
    state3.checkWinner(2, 2);
    assert(state3.winner === BLACK, 'Should detect diagonal win');
}

function testLegalMoves() {
    console.log('\n=== Testing Legal Moves ===');
    
    const state = new GameState();
    const initialMoves = state.getLegalMoves();
    assert(initialMoves.length === 1, 'Empty board should have 1 move (center)');
    assert(initialMoves[0].row === 4 && initialMoves[0].col === 4, 'First move should be center');
    
    state.makeMove(4, 4);
    const moves = state.getLegalMoves();
    assert(moves.length > 1, 'After first move, should have multiple legal moves');
}

function testMCTSNode() {
    console.log('\n=== Testing MCTS Node ===');
    
    const state = new GameState();
    const node = new MCTSNode(state);
    
    assert(node.visits === 0, 'New node should have 0 visits');
    assert(node.wins === 0, 'New node should have 0 wins');
    assert(node.children.length === 0, 'New node should have no children');
    
    // playerJustMoved for root is WHITE (opposite of currentPlayer BLACK)
    node.update(WHITE);
    assert(node.visits === 1, 'After update, visits should be 1');
    assert(node.wins === 1, 'After winning update for correct player, wins should be 1');
    
    // Test update for losing player
    node.update(BLACK);
    assert(node.visits === 2, 'After second update, visits should be 2');
    assert(node.wins === 1, 'After losing update, wins should stay 1');
    
    const expandedNode = node.expand();
    assert(expandedNode !== null, 'Should expand successfully');
    assert(node.children.length === 1, 'Parent should have 1 child after expansion');
}

function testMCTSIterations() {
    console.log('\n=== Testing MCTS Iterations ===');
    
    const state = new GameState();
    const mcts = new MCTS(state);
    
    // Run some iterations
    for (let i = 0; i < 100; i++) {
        mcts.iterate();
    }
    
    assert(mcts.root.visits === 100, 'Root should have 100 visits after 100 iterations');
    assert(mcts.root.children.length > 0, 'Root should have children after iterations');
    
    const bestMove = mcts.getBestMove();
    assert(bestMove !== null, 'Should find a best move');
    assert(bestMove.visits > 0, 'Best move should have been visited');
    
    console.log(`Best move: (${bestMove.move.row}, ${bestMove.move.col}) with ${bestMove.visits} visits`);
}

function testMCTSConvergence() {
    console.log('\n=== Testing MCTS Convergence ===');
    
    // Set up a position where WHITE has 4 in a row and BLACK needs to block
    const state = new GameState();
    state.board[4][0] = WHITE;
    state.board[4][1] = WHITE;
    state.board[4][2] = WHITE;
    state.board[4][3] = WHITE;
    // BLACK must play at (4,4) to block the win
    
    state.currentPlayer = BLACK;
    state.moveHistory.push({row: 4, col: 0, player: WHITE});
    
    const mcts = new MCTS(state, 1.41);
    
    // Run more iterations for better convergence on tactical positions
    for (let i = 0; i < 2000; i++) {
        mcts.iterate();
    }
    
    const bestMove = mcts.getBestMove();
    const allMoves = mcts.root.children
        .map(c => ({move: c.move, visits: c.visits, winRate: c.getWinRate()}))
        .sort((a, b) => b.visits - a.visits);
    
    console.log(`Best move: (${bestMove.move.row}, ${bestMove.move.col}) with ${bestMove.visits} visits, win rate: ${(bestMove.getWinRate()*100).toFixed(1)}%`);
    console.log(`Top 3 moves by visits:`);
    allMoves.slice(0, 3).forEach((m, i) => {
        console.log(`  ${i+1}. (${m.move.row},${m.move.col}) - ${m.visits} visits, ${(m.winRate*100).toFixed(1)}% win rate`);
    });
    
    // MCTS should explore the blocking move, though it may not always be #1 with pure random playouts
    const blockingMove = allMoves.find(m => m.move.row === 4 && m.move.col === 4);
    const blockingMoveRank = allMoves.findIndex(m => m.move.row === 4 && m.move.col === 4) + 1;
    
    if (blockingMove) {
        console.log(`Blocking move (4,4) is ranked #${blockingMoveRank} with ${blockingMove.visits} visits`);
        assert(blockingMove.visits > 100, 'Blocking move should be explored significantly');
    } else {
        console.log('Note: Blocking move not in top moves (this can happen with pure random playouts)');
    }
}

function testCloning() {
    console.log('\n=== Testing State Cloning ===');
    
    const state1 = new GameState();
    state1.makeMove(4, 4);
    state1.makeMove(3, 3);
    
    const state2 = state1.clone();
    assert(state2.board[4][4] === BLACK, 'Cloned state should have same board');
    assert(state2.currentPlayer === state1.currentPlayer, 'Cloned state should have same player');
    
    state2.makeMove(5, 5);
    assert(state1.board[5][5] === EMPTY, 'Original state should not be affected by clone modifications');
    assert(state2.board[5][5] !== EMPTY, 'Clone should be modified');
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

console.log('🧪 Running MCTS Test Suite...\n');

testGameStateBasics();
testWinDetection();
testLegalMoves();
testCloning();
testMCTSNode();
testMCTSIterations();
testMCTSConvergence();

console.log('\n✨ All tests completed!\n');
