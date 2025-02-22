// src/pages/Signup.js
// import React, { useState } from 'react';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../firebase';
// import './Signup.css';

// const Signup = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(''); // Clear previous errors
//     try {
//       console.log('Attempting to create user with email:', email);
//       await createUserWithEmailAndPassword(auth, email, password);
//       console.log('User created successfully');
//       // Redirect to login page or home page after successful signup
//     } catch (error) {
//       console.error('Error creating user:', error);
//       setError(error.message);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="signup-form">
//       <h2>Sign Up</h2>
//       {error && <p className="error">{error}</p>}
//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         required
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//       />
//       <button type="submit">Sign Up</button>
//     </form>
//   );
// };

// export default Signup;