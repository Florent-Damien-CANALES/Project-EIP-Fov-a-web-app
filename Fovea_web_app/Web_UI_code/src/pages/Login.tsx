import { FC, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL;

const Login: FC = () => {
  useAuth();
  const [user, setUser] = useState({
    identifier: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, user);
      console.log(response.data);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className='h-full flex flex-col justify-between'>
      <div className='flex flex-row items-center space-x-4 justify-center'>
        <img src='/logo.svg'></img>
        <h1 className='text-9xl font-medium'>FOVEA</h1>
      </div>
      <div className='space-y-8 flex flex-col'>
        <div className='space-y-4 flex flex-col'>
          <Label htmlFor='email'>Email</Label>
          <Input
            type='email'
            placeholder='admin@admin.com'
            value={user.identifier}
            name='email'
            id='email'
            onChange={(e) => setUser({ ...user, identifier: e.target.value })}
          />
        </div>
        <div className='space-y-4 flex flex-col'>
          <Label htmlFor='password'>Mot de passe</Label>
          <Input
            type='password'
            placeholder='mon_mot_de_passe_secret123'
            value={user.password}
            name='password'
            id='password'
            onChange={(e) => setUser({ ...user, password: e.target.value })}
          />
        </div>
        <Button className='w-full' size={'lg'} onClick={handleLogin}>
          Se connecter
        </Button>
      </div>
    </div>
  );
};

export default Login;
