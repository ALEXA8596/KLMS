"use client"
import { useState, useEffect, SetStateAction } from 'react';
const cookie = require('cookie');
/**
 * Login Page
 */
export default function Login() {
  const [usernameValue, setUsername] = useState('');
  const [passwordValue, setPassword] = useState('');


  const handleUsernameInputChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setUsername(e.target.value);
  };
  const handlePasswordInputChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setPassword(e.target.value);
  }

  const onLoad = async () => {
    // get cookie

    var cookies = cookie.parse(document.cookie);
    console.log(cookies);
    if (!cookies.session_id) return;
    if (cookies.session_id) {
      console.log("Attempting Remember Me")
      var [id, dateCreated, hashedToken] = cookies.session_id.split('.');
      id = atob(id);
      dateCreated = atob(dateCreated);

      // get user from database
      const response = await fetch('http://localhost:9000/verifyCookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: cookies.session_id,
          id: id,
          dateCreated: dateCreated,
          hashedToken: hashedToken,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error(data.error);
        return;
      }
      if (data.success) {
        window.location.href = '/home';
      }
    }
  }

  interface LoginFormElements extends HTMLFormControlsCollection {
    username: HTMLInputElement;
    password: HTMLInputElement;
    rememberMe: HTMLInputElement;
  }

  interface LoginForm extends HTMLFormElement {
    readonly elements: LoginFormElements;
  }

  interface LoginRequestData {
    username: FormDataEntryValue | null;
    password: FormDataEntryValue | null;
    rememberMe: FormDataEntryValue | null;
  }

  interface LoginResponseData {
    success: boolean;
    error?: string;
    cookie?: string;
  }

  async function formSubmit(e: React.FormEvent<LoginForm>) {
    e.preventDefault();
    console.log("Form submitted");
    console.log(e.target);

    const formData = new FormData(e.target as LoginForm);
    const username = formData.get('username');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe'); //TODO

    const data: LoginRequestData = {
      username: username,
      password: password,
      rememberMe: rememberMe,
    };

    const response = await fetch('http://localhost:9000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // no cors
        'mode': 'no-cors',
      } as Record<string, string>,
      body: JSON.stringify(data),
    });

    const responseData: LoginResponseData = await response.json();
    if (responseData.success === false) {
      alert(responseData.error);
      return;
    }
    // redirect to /home
    // set cookie
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // Set the cookie to expire in 30 days

    document.cookie = `session_id=${responseData.cookie}; expires=${expirationDate.toUTCString()}; `;
    console.log(document.cookie);
    window.location.href = '/home';
  }

  useEffect(() => {
    onLoad();
  }, []);

  return (
    <div className='h-screen d-flex justify-content-center align-items-center gap-5'>
      <img src="/hobbscussion.png" alt="Logo" className='pr-3 rounded-circle'/>
      <div className='h-auto d-grid gap-3'>
        <h2>Login</h2>
        <div className="container rounded border p-4" style={{ backgroundColor: 'rgb(240,236,252)' }}>
          <form onSubmit={formSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input name="username" className="form-control" type="text" value={usernameValue} onChange={handleUsernameInputChange}></input>
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input name="password" className="form-control" type="password" value={passwordValue} onChange={handlePasswordInputChange} ></input>
            </div>
            <div className="form-check mb-3">
              <input name="rememberMe" type="checkbox" className="form-check-input" id="rememberMe" value="rememberMe"></input>
              <label className="form-check-label" htmlFor="rememberMe">Remember me?</label>
            </div>
            <div>
              <button className="btn btn-primary" type="submit">Login</button>
            </div>
          </form>
        </div>
        <sub>Don&#39;t have an account? <a href="/register">Register</a></sub>
      </div>
    </div>
  );
}
