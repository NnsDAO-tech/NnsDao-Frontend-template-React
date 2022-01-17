import React, { useReducer } from 'react';
export const UserContext = React.createContext({});

const userReducer = (state, action) => {
  switch (action.type) {
    case 'login':
      return { ...state, isLogin: true, data: action.payload };
    case 'logout':
      return { ...state, isLogin: false };
    default:
      throw new Error('Invalid userReducer action');
  }
};

export const UserProvider = ({ children }: { children: JSX.Element }) => {
  const [userState, dispatch] = useReducer(userReducer, { isLogin: false });
  return <UserContext.Provider value={{ userState, dispatch }}>{children}</UserContext.Provider>;
};
