import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import style from './App.module.css';
import { useGlobalContext } from './Hook/Store/Store';
import Demo from './pages/Demo/Demo';
import Home from './pages/Home/Home';

function App() {
  const {
    state: { isAuthed },
  } = useGlobalContext();

  console.log(isAuthed, 89898998);

  return (
    <div className={style.App}>
      <BrowserRouter>
        <Routes>
          <Route path="" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/demo" element={<Demo />} />
        </Routes>
      </BrowserRouter>
      ,
    </div>
  );
}

export default App;
