import NdpService from '@/common/service/ndp';
import { Button, Divider, message } from 'antd';
import React, { useContext } from 'react';
import { UserContext } from '../../Hook/UserProvider';

export default function Login() {
  const { userState, dispatch } = useContext(UserContext) as any;
  const stoicLogin = async dispatch => {
    await NdpService.stoicLogin();

    const identity = NdpService.identity;
    const principal = identity.getPrincipal();
    const timestamp = Date.now();
    const approveResult = await NdpService.approve();

    message.success({ content: 'Login Success!', duration: 2 });
    dispatch({ type: 'login', payload: { principal, timestamp, approveResult } });
    // dispatch({ type: 'login', payload: { timestamp } });
  };
  // useEffect(() => {
  //   getUserInfo(dispatch);
  // }, []);
  return (
    <>
      <Button type="primary" onClick={() => stoicLogin(dispatch)}>
        Stoic Identity
      </Button>
      <Divider />
      <p>User Information</p>
      <code>{JSON.stringify(userState)}</code>
      <Divider />
    </>
  );
}
