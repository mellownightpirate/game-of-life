import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { ButtonToolbar, Dropdown, DropdownButton } from "react-bootstrap";

class Box extends React.Component {
  selectBox = () => {
    // call the function from the props
    this.props.selectBox(this.props.row, this.props.col);
  }
  render() {
    return (
      <div
        className={this.props.boxClass}
        id={this.props.id}
        // selectBox not being passed as props as it has its own selectBox function in Box component
        onClick={this.selectBox}
      />
    );
  }
}
class Grid extends React.Component {
  render() {
    // cols passed as props to child component to give width of grid
    const width = (this.props.cols * 14);
    // rows array initialised as empty array
    var rowsArr = [];
    // nested for loop to map an array of data for rows
    var boxClass = "";
    for (var i = 0; i < this.props.rows; i++) {
      for (var j = 0; j < this.props.cols; j++) {
        // create the id to go along with each box element
        let boxId = i + "_" + j;
        // check to see if box is on or off
        boxClass = this.props.gridFull[i][j] ? "box on" : "box off";
        // push each box component onto the rows array
        rowsArr.push(
          <Box
            boxClass={boxClass}
            key={boxId}
            boxId={boxId}
            row={i}
            col={j}
            selectBox={this.props.selectBox}
          />
        );
      }
    }
    return (
      <div className="grid" style={{ width: width }}>
        {/* an array of all the rows */}
        {rowsArr}
      </div>
    );
  }
}

class Buttons extends React.Component {
  handleSelect = (evt) => {
    this.props.gridSize(evt);
  };

  render() {
    return (
      <div className="center">
        {/* using react bootstrap for styling buttons component */}
        <ButtonToolbar className="center">
          <button className="btn btn-default" onClick={this.props.playButton}>
            Play
          </button>
          <button className="btn btn-default" onClick={this.props.pauseButton}>
            Pause
          </button>
          <button className="btn btn-default" onClick={this.props.clear}>
            Clear
          </button>
          <button className="btn btn-default" onClick={this.props.slow}>
            Slow
          </button>
          <button className="btn btn-default" onClick={this.props.fast}>
            Fast
          </button>
          <button className="btn btn-default" onClick={this.props.seed}>
            Seed
          </button>
          {/* button menu to change grid sizes */}
          <DropdownButton title="Grid Size" id="size-menu" onSelect={this.handleSelect}>
            <Dropdown.Item className="drpItm" eventKey="1">
              20x10
            </Dropdown.Item>
            <Dropdown.Item className="drpItm" eventKey="2">
              50x30
            </Dropdown.Item>
            <Dropdown.Item className="drpItm" eventKey="3">
              70x50
            </Dropdown.Item>
          </DropdownButton>
        </ButtonToolbar>
      </div>
    );
  }
}
class Main extends React.Component {
  constructor() {
    super();
    // class variables to start
    this.speed = 100;
    this.rows = 30;
    this.cols = 50;

    this.state = {
      generation: 0,
      // create an array as big as the rows variables and an array as big as the cols variable to create grid
      gridFull: Array(this.rows)
        .fill()
        // every grid cell is turned off to begin with
        .map(() => Array(this.cols).fill(false)),
    };
  }
  // each cell in the grid starts off as unselected (false). Create a method so that when clicked, each cell updates to true.
  selectBox = (row, col) => {
    // do not update the start directly so create a copy of the array using helper function arrayClone
    let gridCopy = arrayClone(this.state.gridFull);
    // find the exact square that was clicked and set it to the opposite ( true/false and vice versa)
    gridCopy[row][col] = !gridCopy[row][col];
    // update using set state
    this.setState({
      gridFull: gridCopy,
    });
  };
  // custom feature that creates a random cell configuration that users can run
  seed = () => {
    // copy the grid
    let gridCopy = arrayClone(this.state.gridFull);
    // go through every square of the grid and decide to turn on or leave it off
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        // randomly choose whether a square gets turned on or not
        if (Math.floor(Math.random() * 4) === 1) {
          gridCopy[i][j] = true;
        }
      }
    }
    this.setState({
      gridFull: gridCopy,
    });
  };
  // start the interval
  playButton = () => {
    // stop the interval
    clearInterval(this.intervalId);
    // start calling this.play at the interval this.speed
    this.intervalId = setInterval(this.play, this.speed);
  };
  // pause the game
  pauseButton = () => {
    clearInterval(this.intervalId);
  };

  slow = () => {
    // slow to 1000 milliseconds
    this.speed = 1000;
    // slow the interval to this new speed
    this.playButton();
  };

  fast = () => {
    // back to 100 milliseconds
    this.speed = 100;
    // speed interval back to old speed
    this.playButton();
  };

  clear = () => {
    var grid = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(false));
    // update state to clear grid by updating cols and rows in grid array
    this.setState({
      gridFull: grid,
      generation: 0,
    });
  };

  // function to change grid size
  gridSize = (size) => {
    switch (size) {
      case "1":
        this.cols = 20;
        this.rows = 10;
        break;
      case "2":
        this.cols = 50;
        this.rows = 30;
        break;
      default:
        this.cols = 70;
        this.rows = 50;
    }
    // reset everything
    this.clear();
  };
  // the main function that makes the game actually work
  play = () => {
    // we need two copies of the grid for changing the squares because we're going to check what the grid is currently like on line 197
    let g = this.state.gridFull;
    // and then change the squares on the clone setting the state on the clone
    let g2 = arrayClone(this.state.gridFull);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        // the count goes through how many neighbours each cell has
        let count = 0;
        // if there is a neighbour then increase the count +1, since each cell has each 8 potential neighbours therefore there are 8 if statements(and/or nested if statements) to check each neighbour
        if (i > 0) if (g[i - 1][j]) count++;
		    if (i > 0 && j > 0) if (g[i - 1][j - 1]) count++;
		    if (i > 0 && j < this.cols - 1) if (g[i - 1][j + 1]) count++;
		    if (j < this.cols - 1) if (g[i][j + 1]) count++;
		    if (j > 0) if (g[i][j - 1]) count++;
		    if (i < this.rows - 1) if (g[i + 1][j]) count++;
		    if (i < this.rows - 1 && j > 0) if (g[i + 1][j - 1]) count++;
		    if (i < this.rows - 1 && j < this.cols - 1) if (g[i + 1][j + 1]) count++;
        // if there's less than two but more than three the cell dies as if by overpopulation
        if (g[i][j] && (count < 2 || count > 3)) g2[i][j] = false;
        // if it's dead and there are exactly three live neughbours becomes a live cell, as if by reproduction
        if (!g[i][j] && count === 3) g2[i][j] = true;
      }
    }
    this.setState({
      gridFull: g2,
      generation: this.state.generation + 1,
    });
  };
  // start game on refresh
  componentDidMount() {
    // seed game
    this.seed();
    // start game
    this.playButton();
  }

  render() {
    return (
      <div>
        <h1>Conway's Game of Life</h1>
        <Buttons
          playButton={this.playButton}
          pauseButton={this.pauseButton}
          slow={this.slow}
          fast={this.fast}
          clear={this.clear}
          seed={this.seed}
          gridSize={this.gridSize}
        />
        <Grid
          // pass full grid, rows and columns state variables as props
          gridFull={this.state.gridFull}
          rows={this.rows}
          cols={this.cols}
          selectBox={this.selectBox}
        />
        <h2>Generations: {this.state.generation}</h2>
        <p>
          The universe of the Game of Life is an infinite, two-dimensional
          orthogonal grid of square cells, each of which is in one of two
          possible states, live or dead, (or populated and unpopulated,
          respectively). Every cell interacts with its eight neighbours, which
          are the cells that are horizontally, vertically, or diagonally
          adjacent. At each step in time, the following transitions occur: Any
          live cell with fewer than two live neighbours dies, as if by
          underpopulation. Any live cell with two or three live neighbours lives
          on to the next generation. Any live cell with more than three live
          neighbours dies, as if by overpopulation. Any dead cell with exactly
          three live neighbours becomes a live cell, as if by reproduction.
          These rules, which compare the behavior of the automaton to real life,
          can be condensed into the following: Any live cell with two or three
          live neighbours survives. Any dead cell with three live neighbours
          becomes a live cell. All other live cells die in the next generation.
          Similarly, all other dead cells stay dead. The initial pattern
          constitutes the seed of the system. The first generation is created by
          applying the above rules simultaneously to every cell in the seed;
          births and deaths occur simultaneously, and the discrete moment at
          which this happens is sometimes called a tick. Each generation is a
          pure function of the preceding one. The rules continue to be applied
          repeatedly to create further generations.
        </p>
        <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life#Rules">
          From Wikipedia
        </a>
      </div>
    );
  }
}
// create a deep clone of the grid array using a function passing in the array by stringifying it and parsing it so we can update it indirectly (as it's a nested array we need to do a deep clone - cannot use .slice)
function arrayClone(arr) {
  return JSON.parse(JSON.stringify(arr));
}

ReactDOM.render(<Main />, document.getElementById("root"));
