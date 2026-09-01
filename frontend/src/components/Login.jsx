import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/axios";
import "../css/auth.css";


function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);


    // ============================================
    // HANDLE INPUT CHANGE
    // ============================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };


    // ============================================
    // HANDLE LOGIN
    // ============================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setLoading(true);

        try {

            const response = await api.post(
                "/auth/login",
                formData
            );

            const token =
                response.data.access_token;


            // ========================================
            // STORE JWT
            // ========================================

            localStorage.setItem(
                "access_token",
                token
            );


            // ========================================
            // SUCCESS TOAST
            // ========================================

            toast.success(
                "Login successful!"
            );


            // ========================================
            // GO TO DASHBOARD
            // ========================================

            navigate("/dashboard", {
                replace: true
            });


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            // ========================================
            // ERROR TOAST
            // ========================================

            toast.error(
                error.response?.data?.detail ||
                "Invalid email or password"
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="auth-container">

            <div className="auth-card">


                {/* ==================================
                    TITLE
                ================================== */}

                <h1>
                    Welcome Back
                </h1>


                <p className="auth-subtitle">
                    Login to your account
                </p>


                {/* ==================================
                    LOGIN FORM
                ================================== */}

                <form onSubmit={handleSubmit}>


                    {/* EMAIL */}

                    <div className="form-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />

                    </div>


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"}

                    </button>

                </form>


                {/* ==================================
                    SIGNUP LINK
                ================================== */}

                <div className="auth-switch">

                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/signup">
                        Sign Up
                    </Link>

                </div>


            </div>

        </div>
    );
}


export default Login;