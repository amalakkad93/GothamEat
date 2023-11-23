import React, { useState, useEffect } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { Navigate, useNavigate, NavLink } from "react-router-dom";
import { signUp } from "../../store/session";
import FormContainer, {
  // validateCommonFields,
} from "../CustomTags/FormContainer";
import "./SignupForm.css";

function SignupFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sessionUser = useSelector((state) => state.session.user, shallowEqual);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState([]);

  const [csrfToken, setCsrfToken] = useState("");


// Fetch CSRF token on component mount
useEffect(() => {
  (async () => {
    const response = await fetch("/api/auth/csrf/restore");
    if (response.ok) {
      const data = await response.json();
      setCsrfToken(data.csrf_token);
    }
  })();
}, []);


  if (sessionUser) {
    navigate("/");
    return null;
  }

  const isSignupDisabled =
    !firstName.trim() ||
    !lastName.trim() ||
    !email.trim() ||
    !username.trim() ||
    username.length < 4 ||
    !password.trim() ||
    password.length < 6 ||
    password !== confirmPassword ||
    !confirmPassword.trim();

  const signUpFields = [
    {
      type: "text",
      name: "firstName",
      label: "First Name",
      setter: setFirstName,
      value: firstName,
      required: true,
      className: "",
      inputClassName: "login-signup-form-input",
    },
    {
      type: "text",
      name: "lastName",
      label: "Last Name",
      setter: setLastName,
      value: lastName,
      required: true,
      className: "",
      inputClassName: "login-signup-form-input",
    },
    {
      type: "text",
      name: "email",
      label: "Email",
      setter: setEmail,
      value: email,
      required: true,
      className: "",
      inputClassName: "login-signup-form-input",
    },
    {
      type: "text",
      name: "username",
      label: "Username",
      setter: setUsername,
      value: username,
      required: true,
      className: "",
      inputClassName: "login-signup-form-input",
    },
    {
      type: "password",
      name: "password",
      label: "Password",
      setter: setPassword,
      value: password,
      required: true,
      className: "",
      inputClassName: "login-signup-form-input",
    },
    {
      type: "password",
      name: "confirmPassword",
      label: "Confirm Password",
      setter: setConfirmPassword,
      value: confirmPassword,
      required: true,
      className: "",
      inputClassName: "login-signup-form-input",
    },
  ];

  const signUpValidations = [
    {
      fieldName: "firstName",
      rule: (value) => {
        if (!value) return "First name is required";
        return null;
      },
    },
    {
      fieldName: "lastName",
      rule: (value) => {
        if (!value) return "Last name is required";
        return null;
      },
    },
    {
      fieldName: "email",
      rule: (value) => {
        if (!value) return "Email is required";
        if (!value.includes("@") || !value.includes("."))
          return "Invalid email format";
        return null;
      },
    },
    {
      fieldName: "password",
      rule: (value) => {
        if (!value) return "Password is required";
        if (value.length < 6)
          return "Password should be at least 6 characters long";
        return null;
      },
    },
  ];
  const validateCommonFields = (fields, validations) => {
    let errors = {};

    validations.forEach((validation) => {
      const field = fields.find(f => f.name === validation.fieldName);
      const value = field ? field.value : null;

      if (value && validation.rule(value)) {
        errors[validation.fieldName] = validation.message;
      }
    });

    return errors;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateCommonFields(signUpFields, signUpValidations);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(Object.values(validationErrors));
      return;
    }

    if (password === confirmPassword) {
      const data = await dispatch(signUp(firstName, lastName, username, email, password));
      if (data) {
        setErrors(data);
      }
    } else {
      setErrors(["Confirm Password field must be the same as the Password field"]);
    }
  };
  return (
    <>
      <div className="login-signup-form-pages-top-banner">
        <NavLink exact to="/" className="navbar-logo">
          <div className="logo-container">
            <h1 className="login-signup-logo-h1-first">Starco</h1>
            <h1 className="login-signup-logo-h1-second">Eats</h1>
          </div>
        </NavLink>
      </div>
      <div className="form-login">
      {/* {errors.map((error, idx) => <div key={idx} className="error">{error}</div>)} */}
      <input type="hidden" name="csrf_token" value={csrfToken} />
      <FormContainer
        fields={signUpFields}
        onSubmit={handleSubmit}
        isSubmitDisabled={isSignupDisabled}
        errors={errors}
        validations={signUpValidations}
        className="login-signup-form"
        inputClassName="login-signup-form-input"
        submitLabel="Sign Up"
        submitButtonClass="login-signup-form-btn"
        formTitle="Sign Up"
      />

      </div>

    </>
  );
}

export default SignupFormPage;

