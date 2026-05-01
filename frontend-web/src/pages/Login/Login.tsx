import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

interface LoginFormState {
  identifier: string;
  password: string;
}

const INITIAL_FORM_STATE: LoginFormState = {
  identifier: "",
  password: ""
};

export function Login(): React.JSX.Element {
  const [formState, setFormState] = React.useState<LoginFormState>(INITIAL_FORM_STATE);
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await auth.login({
        identifier: formState.identifier.trim(),
        password: formState.password
      });
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-container">
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
            <p>Healthcare Professional Portal</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="identifier">Username or Email</label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              placeholder="name@carreassist.ro"
              value={formState.identifier}
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

            {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

            <button type="submit" className="auth-button" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <footer className="auth-footer">
            <p>
              Need an account? <Link to="/register">Create one</Link>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
