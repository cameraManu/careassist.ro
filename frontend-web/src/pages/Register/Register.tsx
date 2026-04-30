import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../Login/Login.css";
import "./Register.css";

interface RegisterFormState {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
}

const INITIAL_FORM_STATE: RegisterFormState = {
  username: "",
  email: "",
  firstname: "",
  lastname: "",
  password: ""
};

export function Register(): React.JSX.Element {
  const [formState, setFormState] = React.useState<RegisterFormState>(INITIAL_FORM_STATE);
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [successMessage, setSuccessMessage] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await auth.register({
        username: formState.username.trim(),
        email: formState.email.trim().toLowerCase(),
        firstname: formState.firstname.trim(),
        lastname: formState.lastname.trim(),
        password: formState.password
      });

      setSuccessMessage("Account created successfully. Redirecting to login...");
      setFormState(INITIAL_FORM_STATE);
      window.setTimeout(() => navigate("/login"), 900);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-container auth-container-wide">
        <div className="auth-card">
          <header className="auth-branding">
            <div className="brand-icon-wrap">
              <div className="brand-icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h1>CareAssist</h1>
            <p>Create your professional account</p>
          </header>

          <form className="auth-form register-grid" onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="jane.doe"
              value={formState.username}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@carreassist.ro"
              value={formState.email}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="firstname">First Name</label>
            <input
              id="firstname"
              name="firstname"
              type="text"
              placeholder="Jane"
              value={formState.firstname}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="lastname">Last Name</label>
            <input
              id="lastname"
              name="lastname"
              type="text"
              placeholder="Doe"
              value={formState.lastname}
              onChange={handleInputChange}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formState.password}
              onChange={handleInputChange}
              required
            />

            {errorMessage ? <p className="auth-error register-feedback">{errorMessage}</p> : null}
            {successMessage ? <p className="auth-success register-feedback">{successMessage}</p> : null}

            <button type="submit" className="auth-button register-button" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <footer className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
