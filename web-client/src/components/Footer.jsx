import React from 'react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <p>&copy; 2025 Български Турист</p>
    </footer>
  );
}

const footerStyle = {
  backgroundColor: '#0066CC', 
  color: '#fff',
  textAlign: 'center',
  padding: '10px'
}

export default Footer;
