import React from 'react';

interface User {
  name?: string;
}

interface FooterProps {
  user: User;
}

const Footer: React.FC<FooterProps> = ({ user }) => {
  return (
    <footer className="py-8 px-4 border-t border-gray-800">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-gray-400">
          © 2025 {user?.name}. Tous droits réservés.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Créé avec React, Node.js et PostgreSQL
        </p>
      </div>
    </footer>
  );
};

export default Footer;