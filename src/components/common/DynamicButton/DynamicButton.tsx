'use client';
import React from 'react';
import styles from './DynamicButton.module.scss';

interface DynamicButtonProps {
  type?: 'menu' | 'back';
  onClick?: () => void;
}

const DynamicButton: React.FC<DynamicButtonProps> = ({ type = 'menu', onClick }) => {
  return (
    <button className={styles.icon_only} onClick={onClick} aria-label={type}>
      {type === 'menu' ? (
        // Menu Icon
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20.75 12C20.75 11.8011 20.671 11.6103 20.5303 11.4697C20.3897 11.329 20.1989 11.25 20 11.25H4C3.80109 11.25 3.61032 11.329 3.46967 11.4697C3.32902 11.6103 3.25 11.8011 3.25 12C3.25 12.1989 3.32902 12.3897 3.46967 12.5303C3.61032 12.671 3.80109 12.75 4 12.75H20C20.1989 12.75 20.3897 12.671 20.5303 12.5303C20.671 12.3897 20.75 12.1989 20.75 12ZM17.467 19C17.467 18.8011 17.388 18.6103 17.2473 18.4697C17.1067 18.329 16.9159 18.25 16.717 18.25H4C3.80109 18.25 3.61032 18.329 3.46967 18.4697C3.32902 18.6103 3.25 18.8011 3.25 19C3.25 19.1989 3.32902 19.3897 3.46967 19.5303C3.61032 19.671 3.80109 19.75 4 19.75H16.717C16.9159 19.75 17.1067 19.671 17.2473 19.5303C17.388 19.3897 17.467 19.1989 17.467 19ZM11.778 5C11.778 4.80109 11.699 4.61032 11.5583 4.46967C11.4177 4.32902 11.2269 4.25 11.028 4.25H4C3.80109 4.25 3.61032 4.32902 3.46967 4.46967C3.32902 4.61032 3.25 4.80109 3.25 5C3.25 5.19891 3.32902 5.38968 3.46967 5.53033C3.61032 5.67098 3.80109 5.75 4 5.75H11.028C11.2269 5.75 11.4177 5.67098 11.5583 5.53033C11.699 5.38968 11.778 5.19891 11.778 5Z"
            fill="black"
          />
        </svg>
      ) : (
        // Back Arrow Icon
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 6L9 12L15 18"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
};

export default DynamicButton;
