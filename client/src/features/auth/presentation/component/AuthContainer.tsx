import { useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';

export const AuthContainer = () => {
  const [showRegister, setShowRegister] = useState(false);

  const handleAuthSuccess = () => {
   
    console.log('Autenticación exitosa');
    
    window.location.href = '/';
  };

  return (
    <>
      {showRegister ? (
        <Register
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      ) : (
        <Login
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={() => setShowRegister(true)}
        />
      )}
    </>
  );
};
