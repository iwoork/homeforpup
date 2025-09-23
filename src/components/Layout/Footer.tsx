import React from 'react';
import { HeartOutlined, FacebookOutlined, TwitterOutlined, InstagramOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import Link from 'next/link';

const Footer: React.FC = () => {
  const footerStyle: React.CSSProperties = {
    background: '#f8f9fa',
    padding: '48px 0 24px 0',
    borderTop: '1px solid #e8e8e8',
    width: '100%',
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '32px',
  };

  const linkStyle: React.CSSProperties = {
    color: '#666',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'block',
    marginBottom: '8px',
    transition: 'color 0.2s ease',
  };


  const socialIconStyle: React.CSSProperties = {
    fontSize: '20px',
    color: '#666',
    margin: '0 8px',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
          {/* Company Info */}
          <div style={sectionStyle}>
            <h3 style={{ color: '#08979C', marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
              Home for Pup
            </h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
              Creating paw-some families, one match at a time. Connect with trusted breeders and find your perfect four-legged companion.
            </p>
            <div style={{ color: '#666', fontSize: '14px' }}>
              Made with <HeartOutlined style={{ color: '#ff4d4f' }} /> for pet lovers
            </div>
          </div>

          {/* Quick Links */}
          <div style={sectionStyle}>
            <h4 style={{ color: '#333', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
              Quick Links
            </h4>
            <Link href="/browse" style={linkStyle}>
              Browse Puppies
            </Link>
            <Link href="/breeders" style={linkStyle}>
              Find Breeders
            </Link>
            <Link href="/breeds" style={linkStyle}>
              Dog Breeds
            </Link>
            <Link href="/about" style={linkStyle}>
              About Us
            </Link>
            <Link href="/adoption-guide" style={linkStyle}>
              Adoption Guide
            </Link>
          </div>

          {/* Community */}
          <div style={sectionStyle}>
            <h4 style={{ color: '#333', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
              Community
            </h4>
            <Link href="/dashboard" style={linkStyle}>
              Dashboard
            </Link>
            <Link href="/dashboard/messages" style={linkStyle}>
              Messages
            </Link>
            <Link href="/users" style={linkStyle}>
              Find Users
            </Link>
            <Link href="/auth/login" style={linkStyle}>
              Sign In
            </Link>
            <Link href="/auth/signup" style={linkStyle}>
              Join Community
            </Link>
          </div>

          {/* Support */}
          <div style={sectionStyle}>
            <h4 style={{ color: '#333', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
              Support
            </h4>
            <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
              <MailOutlined style={{ marginRight: '8px' }} />
              support@homeforpup.com
            </div>
            <div style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
              <PhoneOutlined style={{ marginRight: '8px' }} />
              (555) 123-PUPS
            </div>
            <div>
              <h5 style={{ color: '#333', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Follow Us
              </h5>
              <div>
                <FacebookOutlined style={socialIconStyle} />
                <TwitterOutlined style={socialIconStyle} />
                <InstagramOutlined style={socialIconStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ 
          borderTop: '1px solid #e8e8e8', 
          paddingTop: '24px', 
          textAlign: 'center',
          color: '#999',
          fontSize: '12px'
        }}>
          <div style={{ marginBottom: '8px' }}>
            © 2024 Home for Pup. All rights reserved.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: '#999', textDecoration: 'none', fontSize: '12px' }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ color: '#999', textDecoration: 'none', fontSize: '12px' }}>
              Terms of Service
            </Link>
            <Link href="/cookies" style={{ color: '#999', textDecoration: 'none', fontSize: '12px' }}>
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
