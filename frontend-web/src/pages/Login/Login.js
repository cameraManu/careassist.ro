import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";
const INITIAL_FORM_STATE = {
    identifier: "",
    password: ""
};
export function Login() {
    const [formState, setFormState] = React.useState(INITIAL_FORM_STATE);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname ?? "/dashboard";
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormState((prevState) => ({ ...prevState, [name]: value }));
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);
        try {
            await auth.login({
                identifier: formState.identifier.trim(),
                password: formState.password
            });
            navigate(from, { replace: true });
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Authentication failed");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsx("div", { className: "auth-page", children: _jsx("main", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsxs("header", { className: "auth-branding", children: [_jsx("div", { className: "brand-icon-wrap", children: _jsx("div", { className: "brand-icon", "aria-hidden": true, children: _jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", strokeLinecap: "round", strokeLinejoin: "round" }) }) }) }), _jsx("h1", { children: "CareAssist" }), _jsx("p", { children: "Healthcare Professional Portal" })] }), _jsxs("form", { className: "auth-form", onSubmit: handleSubmit, children: [_jsx("label", { htmlFor: "identifier", children: "Username or Email" }), _jsx("input", { id: "identifier", name: "identifier", type: "text", placeholder: "name@carreassist.ro", value: formState.identifier, onChange: handleInputChange, required: true }), _jsx("label", { htmlFor: "password", children: "Password" }), _jsx("input", { id: "password", name: "password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: formState.password, onChange: handleInputChange, required: true }), errorMessage ? _jsx("p", { className: "auth-error", children: errorMessage }) : null, _jsx("button", { type: "submit", className: "auth-button", disabled: isSubmitting, children: isSubmitting ? "Signing in..." : "Sign In" })] }), _jsx("footer", { className: "auth-footer", children: _jsxs("p", { children: ["Need an account? ", _jsx(Link, { to: "/register", children: "Create one" })] }) })] }) }) }));
}
