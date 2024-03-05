import React, { createContext, useContext, useState } from 'react';
import { useNotifications } from './Notification'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [pacie, setPaci]=useState(null);
  const deviceToken = useNotifications();

  return (
    <AuthContext.Provider value={{user, setUser, pacie, setPaci, deviceToken}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
