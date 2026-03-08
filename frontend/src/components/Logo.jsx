import React from 'react';

export const Logo = ({ className }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="50" cy="35" r="15" fill="#2196F3" />
            <path d="M50 55C35 55 20 65 20 80V85H80V80C80 65 65 55 50 55Z" fill="#2196F3" />

            <circle cx="25" cy="45" r="10" fill="#2196F3" />
            <path d="M25 60C15 60 5 66 5 75V78H45V75C45 66 35 60 25 60Z" fill="#2196F3" />

            <circle cx="75" cy="45" r="10" fill="#2196F3" />
            <path d="M75 60C65 60 55 66 55 75V78H95V75C95 66 85 60 75 60Z" fill="#2196F3" />
        </svg>
    );
};

export default Logo;
