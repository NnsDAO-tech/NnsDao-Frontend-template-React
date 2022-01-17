import { getURLParameters } from '@/common/utils';
import { Divider } from 'antd';
import React, { useState } from 'react';
export default function Demo() {
  const urlParams = getURLParameters(location.href);
  const [count, setCount] = useState(0);
  const [params, setParams] = useState(urlParams);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>add</button>
      <p>{count}</p>
      <p>{JSON.stringify(params)}</p>
      <Divider></Divider>
    </>
  );
}
