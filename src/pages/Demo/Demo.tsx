import React from 'react';
import Nav from '../../components/Layout/Nav';
import style from './Demo.module.css';
const Demo = () => {
  return (
    <>
      <Nav />
      <div className={style.pageHome}>page demo test</div>
      <div>
        <p>test</p>
      </div>
    </>
  );
};

export default Demo;
