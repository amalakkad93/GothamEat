import React from "react";
import { useSelector } from "react-redux";
import './UserProfile.css';

export default function UserProfile() {
    const user = useSelector((state) => state.session.user);
    if (!user) return null;

    return (
        <div className="user-profile-container">
            <div className="user-initials">
                {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
            </div>
            <h2 className="user-name">{user.firstName} {user.lastName}</h2>
            <ul className="user-details">
                <li><strong>Username:</strong> {user.username}</li>
                <li><strong>Email:</strong> {user.email}</li>
            </ul>
        </div>
    );
}
