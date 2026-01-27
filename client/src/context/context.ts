import { createContext, useContext} from 'react'

import  { User } from '../types/user'


export const UserContext = createContext<User | undefined>(undefined);

export function useUserContext() {
  const context = useContext(UserContext);
  console.log(context);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}