import './styles/App.css'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Menu from './components/Menu';
import HowToPlay from './components/HowToPlay';
import TicTacToe from './components/TicTacToe';
import { SocketProvider } from './hooks/SocketContext';


function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Menu />} />
          <Route path='/play/:roomId' element={<TicTacToe />} />
          <Route path='/how-to-play' element={<HowToPlay />} />
        </Routes>
      </Router>
    </SocketProvider>
  )
}

export default App
