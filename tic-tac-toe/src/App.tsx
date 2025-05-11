import { useState } from 'react'
import './App.css'
import TicTacToeGame from './pages/NewGame'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <TicTacToe /> */}
      <TicTacToeGame />
    </>
  )
}

export default App
