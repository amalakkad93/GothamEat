// import React, { useState, useEffect, useRef  } from "react";
// import * as sessionActions from "../../store/session";
// import { login } from "../../store/session";
// import { useDispatch } from "react-redux";
// import { useNavigate, NavLink } from "react-router-dom";
// import { useModal } from "../../context/Modal";
// import "./LoginForm.css";

// function LoginFormModal() {
//   const dispatch = useDispatch();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errors, setErrors] = useState([]);
//   const { closeModal } = useModal();
//   const [showMenu, setShowMenu] = useState(false);

//   const ulRef = useRef();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!showMenu) return;

//     const closeMenu = (e) => {
//       if (!ulRef.current.contains(e.target)) {
//         setShowMenu(false);
//       }
//     };

//     document.addEventListener('click', closeMenu);

//     return () => document.removeEventListener("click", closeMenu);
//   }, [showMenu]);
//   const closeMenu = () => setShowMenu(false);

//   const handleModalClose = () => {
//     setEmail("");
//     setPassword("");
//     setErrors({});
//     closeModal();
//  };

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   const data = await dispatch(login(email, password));
//   if (data) setErrors(data);
//   else closeModal()
// };

//   return (
//     <>
//       <h1 className="log-In-h1">Log In</h1>
//       <form className ="log-In-form" onSubmit={handleSubmit}>
//         <ul className="log-In-ul">
//           {errors.map((error, idx) => (
//             <li className="log-In-li" key={idx}>{error}</li>
//           ))}
//         </ul>
//         <label className="log-In-label email">
//           Email
//           <input
//             type="text"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </label>
//         <label className="log-In-label password">
//           Password
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </label>
//         <button className="log-In-btn" type="submit">Log In</button>
//         <button className="log-In-btn demo-user-btn" type="submit" onClick={(e) => {
//           setEmail("demo@io.com");
//           setPassword("password")
//         }}>Demo User</button>
//       </form>
//     </>
//   );
// }

// export default LoginFormModal;



// // import React, { useState } from "react";
// // import { login } from "../../store/session";
// // import { useDispatch } from "react-redux";
// // import { useModal } from "../../context/Modal";
// // import "./LoginForm.css";

// // function LoginFormModal() {
// //   const dispatch = useDispatch();
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [errors, setErrors] = useState([]);
// //   const { closeModal } = useModal();

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     const data = await dispatch(login(email, password));
// //     if (data) {
// //       setErrors(data);
// //     } else {
// //         closeModal()
// //     }
// //   };

// //   return (
// //     <>
// //       <h1>Log In</h1>
// //       <form onSubmit={handleSubmit}>
// //         <ul>
// //           {errors.map((error, idx) => (
// //             <li key={idx}>{error}</li>
// //           ))}
// //         </ul>
// //         <label>
// //           Email
// //           <input
// //             type="text"
// //             value={email}
// //             onChange={(e) => setEmail(e.target.value)}
// //             required
// //           />
// //         </label>
// //         <label>
// //           Password
// //           <input
// //             type="password"
// //             value={password}
// //             onChange={(e) => setPassword(e.target.value)}
// //             required
// //           />
// //         </label>
// //         <button type="submit">Log In</button>
// //       </form>
// //     </>
// //   );
// // }

// // export default LoginFormModal;
