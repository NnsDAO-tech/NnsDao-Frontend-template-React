import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import style from './App.module.css';
import Demo from './components/Demo/Demo';
import Login from './components/Login/Login';
import Home from './pages/Home/Home';
import logo from './static/logo.png';

function App() {
  return (
    <div className={style.App}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <header className={style.AppHeader}>
                  <img src={logo} className={style.AppLogo} alt="logo" />
                </header>
                <Demo></Demo>
                <Login></Login>
                <Link to="/home">Go Page Home</Link>
              </>
            }></Route>
          <Route path="/home" element={<Home></Home>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
