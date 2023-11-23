import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css'; 

function NotFound() {
    return (
        <div className="notFound-container">
            <div className="notFound-title">404</div>
            Oops! The page you're looking for doesn't exist.
            <Link to="/" className="notFound-link">
                Go back to Home
            </Link>
        </div>
    );
}

export default NotFound;
