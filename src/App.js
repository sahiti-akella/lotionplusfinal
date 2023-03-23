import React, { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null); //adding local storage to user so you stay signed in when page is refreshed
  const [profile, setProfile] = useState(null);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      localStorage.setItem('user', JSON.stringify(codeResponse));
      setUser(codeResponse);
    },
    onError: (error) => console.log('Login Failed:', error),
  });

  useEffect(() => {
    if (user) {
      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: 'application/json',
          },
        })
        .then((res) => {
          setProfile(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  const logOut = () => {
    localStorage.removeItem('user'); //removing user login from local storage when signed out
    googleLogout();
    setProfile(null);
    setUser(null);
  };

  return (
    <div>
      {profile ? (
        <div>
          <div className='profileInfo'>
            <img
              className='profileImage'
              style={{ borderRadius: '50%', height: '50px', marginTop: '-15px', marginRight: '10px' }}
              src={profile.picture}
              alt='user image'
            />
            <p>{profile.email}</p>
          </div>
          <br />
          <br />
          <button className='signOut' onClick={logOut}>
            Sign out
          </button>
        </div>
      ) : (
        <button className='signIn' onClick={() => login()}>
          Sign in with{' '}
          <img className='image' src='https://www.freepnglogos.com/uploads/google-logo-png/google-logo-icon-png-transparent-background-osteopathy-16.png' height={'30px'} />
        </button>
      )}
    </div>
  );
}

export default App;
