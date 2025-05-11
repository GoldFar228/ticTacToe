import { useEffect, useRef, useState } from 'react';
import './index.css';
import Lottie from 'lottie-react';
import gridAnimation from '../../assets/grid.json';
import crossAnimation from '../../assets/cross.json';
import ovalAnimation from '../../assets/oval.json';
import type { LottieRefCurrentProps } from 'lottie-react';

export default function TicTacToeGame() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [activeAnimations, setActiveAnimations] = useState<(string | null)[]>(Array(9).fill(null));
  const [fadingSquares, setFadingSquares] = useState<boolean[]>(Array(9).fill(false));
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const animationRefs = Array(9).fill(null).map(() => useRef<LottieRefCurrentProps | null>(null));

  const { winner } = calculateWinner(board);

  const makeMove = (index: number, symbol: 'X' | 'O') => {
    setBoard(prevBoard => {
      if (prevBoard[index] !== null) return prevBoard;
      const newBoard = [...prevBoard];
      newBoard[index] = symbol;

      setActiveAnimations(prev => {
        const newAnimations = [...prev];
        newAnimations[index] = symbol;
        return newAnimations;
      });

      setTimeout(() => {
        animationRefs[index].current?.play();
      }, 50);

      return newBoard;
    });
  };

  const handleClick = (index: number) => {
    if (winner || board[index] || isComputerThinking) return;
    makeMove(index, 'X');
  };

  const makeComputerMove = () => {
    const currentBoard = [...board];
    if (winner || currentBoard.every(square => square)) return;

    const availableMoves = currentBoard
      .map((cell, index) => cell === null ? index : null)
      .filter(val => val !== null) as number[];

    if (availableMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      const computerMoveIndex = availableMoves[randomIndex];

      if (currentBoard[computerMoveIndex] === null) {
        setTimeout(() => {
          makeMove(computerMoveIndex, 'O');
        }, 500);
      }
    }
  };

  useEffect(() => {
    if (!winner && !board.every(square => square) && !isComputerThinking) {
      const isPlayerTurn = board.filter(Boolean).length % 2 === 0;
      if (!isPlayerTurn) {
        setIsComputerThinking(true);
        const timer = setTimeout(() => {
          makeComputerMove();
          setIsComputerThinking(false);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [board, winner]); 

  useEffect(() => {
    const { winner, line } = calculateWinner(board);
    setWinningLine(line);

    if (winner || board.every(square => square)) {
      const winAnimationTimer = setTimeout(() => {
        setFadingSquares(Array(9).fill(true));

        const resetTimer = setTimeout(() => {
          resetGame();
        }, 1000); 

        return () => clearTimeout(resetTimer);
      }, 2000); 

      return () => clearTimeout(winAnimationTimer);
    }
  }, [board]);

  function resetGame() {
    setBoard(Array(9).fill(null));
    setActiveAnimations(Array(9).fill(null));
    setWinningLine(null);

    setTimeout(() => {
      setFadingSquares(Array(9).fill(false));
    }, 1000);
  }



  function renderSquare(index: number) {
    const isWinningSquare = winningLine?.includes(index);

    return (
      <span
        className={`square 
          ${fadingSquares[index] && board[index] ? 'fade-out' : ''} 
          ${isWinningSquare ? 'winning-square' : ''}`}
        onClick={() => handleClick(index)}
      >
        {activeAnimations[index] === 'X' && (
          <Lottie
            lottieRef={animationRefs[index]}
            animationData={crossAnimation}
            loop={false}
            autoplay={false}
            style={{ width: '75%', height: '75%', position: 'absolute' }}
            className={isWinningSquare ? 'winning-symbol' : ''}
          />
        )}
        {activeAnimations[index] === 'O' && (
          <Lottie
            lottieRef={animationRefs[index]}
            animationData={ovalAnimation}
            loop={false}
            autoplay={false}
            style={{ width: '75%', height: '75%', position: 'absolute' }}
            className={isWinningSquare ? 'winning-symbol' : ''}
          />
        )}
      </span>
    );
  }

  const status = winner
    ? `Победитель: ${winner}`
    : board.every(square => square)
      ? 'Ничья!'
      : `Сейчас ходит: ${isComputerThinking ? 'Компьютер (O)' : 'Вы (X)'}`;

  return (
    <div className="game">
      <h1>Крестики-нолики</h1>
      <div className="status">{status}</div>
      {isComputerThinking && (
        <div className="computer-thinking">Компьютер думает...</div>
      )}
      <div className="game-board-container">
        <div className="board-animation">
          <Lottie animationData={gridAnimation} loop={false} />
        </div>
        <div className="board">
          <div className="board-row">
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
          </div>
          <div className="board-row">
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
          </div>
          <div className="board-row">
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </div>
        </div>
      </div>
      <button className="reset-button" onClick={resetGame}>
        Начать заново
      </button>
    </div>
  );
}

function calculateWinner(squares: any): { winner: string | null, line: number[] | null } {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line };
    }
  }
  return { winner: null, line: null };
}