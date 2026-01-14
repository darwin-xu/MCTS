# MCTS Visualization Tool

An interactive, step-by-step visualization of the Monte Carlo Tree Search (MCTS) algorithm applied to Gomoku (5-in-a-row).

## 🎯 Features

- **Visual Game Board**: Play Gomoku on a beautiful 9×9 board with visual stone placement
- **Real-time MCTS Visualization**: Watch the algorithm explore and evaluate moves in real-time
- **Step-by-Step Mode**: Control the algorithm's execution one iteration at a time
- **Dynamic Parameters**: Adjust exploration constant and simulation count during execution
- **Phase Indicators**: See which phase of MCTS is currently executing:
  1. **Selection** - Choose the most promising node using UCB1
  2. **Expansion** - Add a new child node to the tree
  3. **Simulation** - Run a random playout to terminal state
  4. **Backpropagation** - Update node statistics up the tree
- **Move Evaluation**: Visual indicators showing which moves are good, bad, or best
- **Tree Visualization**: See the search tree structure with statistics for each node
- **Computation Log**: Detailed log of every operation with UCB1 values, win rates, and visits
- **Statistics Dashboard**: Track iterations, tree depth, nodes created, and best move win rate

## 🚀 Quick Start

### Option 1: Direct Browser Opening
Simply open `mcts-demo.html` in any modern web browser (Chrome, Firefox, Safari, Edge).

### Option 2: Local Server (Optional)
If you prefer to use a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Then open http://localhost:8000/mcts-demo.html
```

## 📖 How to Use

### Playing the Game

1. **Start a Game**: Click on the board to place your first stone (you play as Black)
2. **MCTS Responds**: After your move, click "🚀 Start MCTS" to let the AI compute its response
3. **Watch or Wait**: Either watch the algorithm work through each iteration or adjust the speed
4. **Make Another Move**: After the AI plays, make your next move

### Exploring MCTS

1. **Real-time Mode**: Click "🚀 Start MCTS" and watch the algorithm run automatically
   - Adjust speed with the slider (1-50 iterations per second)
   
2. **Step Mode**: Click "⏭️ Step" to execute one iteration at a time
   - Perfect for understanding each phase in detail
   - Watch the phase indicator highlight each step
   
3. **Parameter Tuning**:
   - **Exploration Constant (C)**: Balance exploration vs exploitation (default: 1.41)
     - Higher values → more exploration of untried moves
     - Lower values → more exploitation of known good moves
   - **Simulations per Move**: How many iterations to run (default: 1000)
     - More iterations → better move quality but slower

### Understanding the Display

#### Board Highlights
- 🟢 **Green (Best Move)**: The move with the highest visit count
- 🟢 **Light Green (Good Moves)**: Moves with high win rates
- 🔴 **Light Red (Bad Moves)**: Moves with low win rates
- 🟡 **Yellow (Simulating)**: Currently being simulated

#### Tree View
Each node shows:
- **Move**: The row/column coordinates
- **Visits**: How many times this node was visited
- **Wins**: How many simulations resulted in a win
- **Win Rate**: Percentage of wins (wins/visits)
- **UCB1**: Upper Confidence Bound score (used for selection)

#### Statistics
- **Total Iterations**: Number of MCTS iterations completed
- **Tree Depth**: Maximum depth of the search tree
- **Nodes Created**: Total number of nodes in the tree
- **Best Move Win Rate**: Win rate of the most-visited move

## 🧠 Understanding MCTS

### The Four Phases

1. **Selection** 🎯
   - Start at the root node
   - Repeatedly select the child with the highest UCB1 value
   - UCB1 = (wins/visits) + C × √(ln(parent_visits)/visits)
   - Balances exploitation (choosing proven good moves) and exploration (trying uncertain moves)

2. **Expansion** 🌱
   - Once we reach a node that isn't fully expanded
   - Add one new child node representing an untried move
   - This grows the search tree

3. **Simulation** 🎲
   - From the new node, play random moves until the game ends
   - This is a "playout" or "rollout"
   - Quick way to estimate the value of a position

4. **Backpropagation** 📊
   - Take the simulation result (win/loss/draw)
   - Update visit and win counts for all nodes from leaf to root
   - This information guides future iterations

### Why MCTS Works

- **No Evaluation Function Needed**: Unlike minimax, MCTS doesn't need a heuristic evaluation
- **Anytime Algorithm**: Can be stopped at any time and return the best move found so far
- **Asymmetric Growth**: Automatically focuses more computation on promising moves
- **Self-Learning**: Discovers good strategies through random simulation and statistical aggregation

## 🧪 Testing

Run the test suite to verify the MCTS implementation:

```bash
node test-mcts.js
```

The tests cover:
- ✅ Game state basics (move making, player switching)
- ✅ Win detection (horizontal, vertical, diagonal)
- ✅ Legal move generation
- ✅ State cloning (for simulations)
- ✅ MCTS node operations (expansion, update)
- ✅ MCTS iterations and convergence
- ✅ Move selection quality

## 🎨 Customization

### Adjusting Game Parameters

In `mcts-demo.html`, you can modify these constants:

```javascript
const BOARD_SIZE = 9;      // Size of the board (9×9)
const WIN_LENGTH = 5;      // Number in a row to win (Gomoku = 5)
```

### Changing Colors

Edit the CSS style section to customize colors:
- Board background: `.board { background: #daa520; }`
- Stone colors: `.stone.black` and `.stone.white`
- Highlight colors: `.cell.best-move`, `.cell.good-move`, `.cell.bad-move`

### Performance Tuning

For faster execution on slower machines:
- Reduce `BOARD_SIZE` to 7
- Reduce default simulations to 500
- Limit tree depth display to 1 or 2 levels

## 📚 Code Structure

The code is organized into clear sections with 4-space indentation:

1. **Game State and Board Logic** (~150 lines)
   - `GameState` class: Manages game rules and state
   - Win detection, legal move generation

2. **MCTS Node** (~50 lines)
   - `MCTSNode` class: Represents nodes in the search tree
   - UCB1 calculation, expansion, update

3. **MCTS Algorithm** (~80 lines)
   - `MCTS` class: Implements the four phases
   - Selection, expansion, simulation, backpropagation

4. **Visualization** (~400 lines)
   - `MCTSVisualization` class: Manages UI and rendering
   - Board rendering, tree visualization, controls, logging

## 🤓 Educational Value

This tool is perfect for:
- **Learning MCTS**: See every step of the algorithm with detailed explanations
- **Algorithm Comparison**: Try different exploration constants to see how they affect play
- **Game Theory**: Understand how tree search algorithms make decisions
- **AI Research**: Use as a foundation for more advanced MCTS variants (RAVE, MCTS-Solver, etc.)

## 🎓 Further Reading

- [Monte Carlo Tree Search (Wikipedia)](https://en.wikipedia.org/wiki/Monte_Carlo_tree_search)
- [A Survey of Monte Carlo Tree Search Methods](https://ieeexplore.ieee.org/document/6145622)
- [AlphaGo's use of MCTS](https://www.nature.com/articles/nature16961)
- [UCB1 Algorithm](https://en.wikipedia.org/wiki/Upper_confidence_bound)

## 📝 License

This is an educational tool created for learning purposes. Feel free to use, modify, and share!

## 🙏 Acknowledgments

MCTS was popularized by its use in computer Go programs, culminating in AlphaGo's historic victory against world champion Lee Sedol in 2016.

---

**Enjoy exploring MCTS!** 🎮✨

For questions or suggestions, feel free to modify and extend this tool for your own learning journey.
