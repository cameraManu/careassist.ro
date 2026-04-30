import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../Login/Login.css";
import "./Register.css";
const INITIAL_FORM_STATE = {
    username: "",
    email: "",
    firstname: "",
    lastname: "",
    password: ""
};
export function Register() {
    const [formState, setFormState] = React.useState(INITIAL_FORM_STATE);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [successMessage, setSuccessMessage] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const auth = useAuth();
    const navigate = useNavigate();
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormState((prevState) => ({ ...prevState, [name]: value }));
    };
    const handleSubmit = async (event) => {
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
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Registration failed");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsx("div", { className: "auth-page", children: _jsx("main", { className: "auth-container auth-container-wide", children: _jsxs("div", { className: "auth-card", children: [_jsxs("header", { className: "auth-branding", children: [_jsx("div", { className: "brand-icon-wrap", children: _jsx("div", { className: "brand-icon", "aria-hidden": true, children: _jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", strokeLinecap: "round", strokeLinejoin: "round" }) }) }) }), _jsx("h1", { children: "CareAssist" }), _jsx("p", { children: "Create your professional account" })] }), _jsxs("form", { className: "auth-form register-grid", onSubmit: handleSubmit, children: [_jsx("label", { htmlFor: "username", children: "Username" }), _jsx("input", { id: "username", name: "username", type: "text", placeholder: "jane.doe", value: formState.username, onChange: handleInputChange, required: true }), _jsx("label", { htmlFor: "email", children: "Email" }), _jsx("input", { id: "email", name: "email", type: "email", placeholder: "name@carreassist.ro", value: formState.email, onChange: handleInputChange, required: true }), _jsx("label", { htmlFor: "firstname", children: "First Name" }), _jsx("input", { id: "firstname", name: "firstname", type: "text", placeholder: "Jane", value: formState.firstname, onChange: handleInputChange, required: true }), _jsx("label", { htmlFor: "lastname", children: "Last Name" }), _jsx("input", { id: "lastname", name: "lastname", type: "text", placeholder: "Doe", value: formState.lastname, onChange: handleInputChange, required: true }), _jsx("label", { htmlFor: "password", children: "Password" }), _jsx("input", { id: "password", name: "password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: formState.password, onChange: handleInputChange, required: true }), errorMessage ? _jsx("p", { className: "auth-error register-feedback", children: errorMessage }) : null, successMessage ? _jsx("p", { className: "auth-success register-feedback", children: successMessage }) : null, _jsx("button", { type: "submit", className: "auth-button register-button", disabled: isSubmitting, children: isSubmitting ? "Creating account..." : "Create Account" })] }), _jsx("footer", { className: "auth-footer", children: _jsxs("p", { children: ["Already have an account? ", _jsx(Link, { to: "/login", children: "Sign in" })] }) })] }) }) }));
}
