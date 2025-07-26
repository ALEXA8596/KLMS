"use client"

import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';

function SignIn() {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await signIn();
      }}
    >
      {/* <p>You are not logged in</p> */}
      <div className="d-flex justify-content-center">
        <button type="submit" className='btn btn-primary m-0 p-2'>Sign in!</button>
      </div>
    </form>
  );
}

/**
 * Login Page
 */
export default function Login() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      window.location.href = '/app';
    }
  }, [session]);
  
  return (
    <div className='h-screen d-flex justify-content-center align-items-center gap-5'>
      <img src="/KLMS.png" alt="Logo" className='pr-3 rounded-circle'/>
      <div className='h-auto d-grid gap-3'>
        {/* <h2>Login</h2> */}
        <div className="container rounded border p-4" style={{ backgroundColor: 'rgb(240,236,252)' }}>
          <SignIn />
        </div>
        <sub>Don&#39;t have an account? <a href="/register">Register</a></sub>
      </div>
    </div>
  );
}
