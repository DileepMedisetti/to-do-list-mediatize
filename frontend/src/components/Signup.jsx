import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/axios";
import "../css/auth.css";


function Signup() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirm_password: ""
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
    // HANDLE SIGNUP
    // ============================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        // ========================================
        // CHECK PASSWORD
        // ========================================

        if (
            formData.password !==
            formData.confirm_password
        ) {

            toast.error(
                "Passwords do not match"
            );

            return;
        }


        setLoading(true);


        try {

            await api.post(
                "/auth/signup",
                formData
            );


            // ====================================
            // SUCCESS
            // ====================================

            toast.success(
                "Account created successfully!"
            );


            // Clear form

            setFormData({
                full_name: "",
                email: "",
                password: "",
                confirm_password: ""
            });


            // ====================================
            // GO TO LOGIN
            // ====================================

            navigate("/login");

        } catch (error) {

            console.error(
                "Signup error:",
                error
            );


            // ====================================
            // ERROR
            // ====================================

            const detail =
                error.response?.data?.detail;


            if (Array.isArray(detail)) {

                detail.forEach((item) => {

                    toast.error(
                        item.msg || "Invalid input"
                    );

                });

            } else {

                toast.error(
                    detail ||
                    "Signup failed"
                );
            }

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
                    Create Account
                </h1>


                <p className="auth-subtitle">
                    Create your account to continue
                </p>


                {/* ==================================
                    SIGNUP FORM
                ================================== */}

                <form onSubmit={handleSubmit}>


                    {/* FULL NAME */}

                    <div className="form-group">

                        <label htmlFor="full_name">
                            Full Name
                        </label>

                        <input
                            id="full_name"
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            autoComplete="name"
                            required
                        />

                    </div>


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
                            autoComplete="new-password"
                            required
                        />

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div className="form-group">

                        <label htmlFor="confirm_password">
                            Confirm Password
                        </label>

                        <input
                            id="confirm_password"
                            type="password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            required
                        />

                    </div>


                    {/* SIGNUP BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating Account..."
                            : "Sign Up"}

                    </button>

                </form>


                {/* ==================================
                    LOGIN LINK
                ================================== */}

                <div className="auth-switch">

                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login">
                        Login
                    </Link>

                </div>


            </div>

        </div>
    );
}


export default Signup;