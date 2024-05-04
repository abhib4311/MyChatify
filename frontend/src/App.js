import { Routes, Route } from 'react-router-dom';
import './App.css';
import Homepage from './Pages/homepage';
import Chatpage from './Pages/chatpage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/chats" element={<Chatpage />} />
      </Routes>
    </div>
  );
}

export default App;
