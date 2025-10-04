// src/components/CookieModal.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import { Dialog, DialogContent, IconButton, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CookieModalProps {
  open: boolean;
  onClose: () => void;
}

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    backgroundColor: '#0f0f0f',
    backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
    maxWidth: '900px',
    width: '90%',
    maxHeight: '85vh',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
  },
});

const DialogHeader = styled(Box)({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  background: 'linear-gradient(135deg, #1a1a1a, #0f0f0f)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  padding: '24px 32px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backdropFilter: 'blur(10px)',
});

const Title = styled(Typography)({
  fontSize: '24px',
  fontWeight: 700,
  color: '#ffffff',
  letterSpacing: '0.5px',
  background: 'linear-gradient(135deg, #ffffff, #a0a0a0)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});

const CloseButton = styled(IconButton)({
  color: 'rgba(255, 255, 255, 0.5)',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: 'rgba(255, 255, 255, 0.9)',
    background: 'rgba(255, 255, 255, 0.1)',
    transform: 'rotate(90deg)',
  },
});

const ContentWrapper = styled(DialogContent)({
  padding: '32px',
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '14px',
  lineHeight: 1.8,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)',
    },
  },
});

const Section = styled(Box)({
  marginBottom: '32px',
  '& h2': {
    fontSize: '20px',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '16px',
    marginTop: '24px',
    letterSpacing: '0.3px',
  },
  '& h3': {
    fontSize: '16px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '12px',
    marginTop: '20px',
    letterSpacing: '0.2px',
  },
  '& p': {
    marginBottom: '12px',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  '& ul, & ol': {
    paddingLeft: '24px',
    marginBottom: '16px',
    '& li': {
      marginBottom: '8px',
      color: 'rgba(255, 255, 255, 0.65)',
    },
  },
  '& strong': {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 600,
  },
});

const InfoBox = styled(Box)({
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
});

const UpdateDate = styled(Typography)({
  fontSize: '12px',
  color: 'rgba(255, 255, 255, 0.4)',
  marginBottom: '24px',
  fontStyle: 'italic',
});

const CookieTable = styled(Box)({
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
  '& .cookie-row': {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  '& .cookie-label': {
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  '& .cookie-value': {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export const CookieModal: React.FC<CookieModalProps> = ({ open, onClose }) => {
  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogHeader>
        <Title>Cookie Policy</Title>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      </DialogHeader>
      
      <ContentWrapper>
        <UpdateDate>Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</UpdateDate>

        <Section>
          <InfoBox>
            <p><strong>Business Name:</strong> Techverse Services</p>
            <p><strong>Registered Address:</strong> Shop No.5, Costa Mapple, Near Government Engineering College, Usmanpura, Chh. Sambhajinagar. 431001</p>
            <p><strong>Contact:</strong> support@techverse.com | +1 (555) 123-4567</p>
          </InfoBox>

          <p>
            This Cookie Policy explains how Techverse Services ("we", "us", "our") uses cookies and similar technologies on our website and applications. By using our services, you consent to the use of cookies as described in this policy.
          </p>
        </Section>

        <Section>
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are stored on your device (computer, smartphone, tablet) when you visit a website. They help websites remember your preferences, improve your browsing experience, and provide analytical data to website operators.
          </p>
          <p>
            Cookies can be "session cookies" (deleted when you close your browser) or "persistent cookies" (remain on your device for a set period or until manually deleted).
          </p>
        </Section>

        <Section>
          <h2>2. Why We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul>
            <li><strong>Essential Operations:</strong> To enable core functionalities like user authentication, shopping cart management, and secure checkout processes</li>
            <li><strong>User Preferences:</strong> To remember your settings, language preferences, and customization choices</li>
            <li><strong>Performance & Analytics:</strong> To understand how visitors interact with our website and improve our services</li>
            <li><strong>Security:</strong> To protect against fraudulent activity and enhance platform security</li>
            <li><strong>Payment Processing:</strong> To facilitate secure payment gateway transactions as mentioned in Section 4 of our Terms & Conditions</li>
          </ul>
        </Section>

        <Section>
          <h2>3. Types of Cookies We Use</h2>

          <h3>3.1 Strictly Necessary Cookies</h3>
          <p>These cookies are essential for the website to function properly. Without these cookies, services you have requested cannot be provided.</p>
          <CookieTable>
            <div className="cookie-row">
              <div className="cookie-label">Purpose:</div>
              <div className="cookie-value">User authentication, session management, shopping cart functionality</div>
            </div>
            <div className="cookie-row">
              <div className="cookie-label">Duration:</div>
              <div className="cookie-value">Session or up to 30 days</div>
            </div>
            <div className="cookie-row">
              <div className="cookie-label">Can be disabled:</div>
              <div className="cookie-value">No (required for website functionality)</div>
            </div>
          </CookieTable>

          <h3>3.2 Performance & Analytics Cookies</h3>
          <p>These cookies collect information about how visitors use our website, such as which pages are visited most often and error messages received.</p>
          <CookieTable>
            <div className="cookie-row">
              <div className="cookie-label">Purpose:</div>
              <div className="cookie-value">Website analytics, performance monitoring, user behavior tracking</div>
            </div>
            <div className="cookie-row">
              <div className="cookie-label">Duration:</div>
              <div className="cookie-value">Up to 2 years</div>
            </div>
            <div className="cookie-row">
              <div className="cookie-label">Can be disabled:</div>
              <div className="cookie-value">Yes (through browser settings)</div>
            </div>
          </CookieTable>

          <h3>3.3 Functionality Cookies</h3>
          <p>These cookies allow the website to remember choices you make and provide enhanced, personalized features.</p>
          <CookieTable>
            <div className="cookie-row">
              <div className="cookie-label">Purpose:</div>
              <div className="cookie-value">Remember user preferences, language settings, region settings</div>
            </div>
            <div className="cookie-row">
              <div className="cookie-label">Duration:</div>
              <div className="cookie-value">Up to 1 year</div>
            </div>
            <div className="cookie-row">
              <div className="cookie-label">Can be disabled:</div>
              <div className="cookie-value">Yes (may affect user experience)</div>
            </div>
          </CookieTable>

          <h3>3.4 Payment Gateway Cookies</h3>
          <p>As per Section 4 of our Terms & Conditions, payment gateway providers may set cookies for secure transaction processing.</p>
          <CookieTable>
            <div className="cookie-row">
              <div className="cookie-label">Purpose:</div>
              <div className="cookie-value">Secure payment processing, fraud prevention, card/UPI/wallet transactions</div>
            </div>
            <div className="cookie-row">
              <div className="cookie-label">Duration:</div>
              <div className="cookie-value">Varies by payment provider</div>
            </div>
            <div className="cookie-row">
              <div className="cookie-label">Can be disabled:</div>
              <div className="cookie-value">No (required for payment processing)</div>
            </div>
          </CookieTable>
        </Section>

        <Section>
          <h2>4. Third-Party Cookies</h2>
          <p>We may use third-party services that set cookies on our website, including:</p>
          <ul>
            <li><strong>Payment Gateways:</strong> For secure card, UPI, wallet, and EMI transactions</li>
            <li><strong>Analytics Providers:</strong> To understand website usage and improve services</li>
            <li><strong>Cloud Service Providers:</strong> As mentioned in Section 20 of our Terms (Microsoft, Apple, Google for service-related sign-ins)</li>
            <li><strong>Social Media Platforms:</strong> For social sharing and login features</li>
          </ul>
          <p>
            These third parties have their own privacy and cookie policies. We do not control these cookies and recommend reviewing their policies.
          </p>
        </Section>

        <Section>
          <h2>5. How to Manage Cookies</h2>
          <p>You have the right to accept or reject cookies. Here's how you can manage them:</p>

          <h3>5.1 Browser Settings</h3>
          <p>Most browsers allow you to:</p>
          <ul>
            <li>View cookies stored on your device</li>
            <li>Delete existing cookies</li>
            <li>Block all cookies or specific types of cookies</li>
            <li>Set preferences for individual websites</li>
          </ul>
          <p>Refer to your browser's help section for specific instructions (Chrome, Firefox, Safari, Edge, etc.).</p>

          <h3>5.2 Impact of Disabling Cookies</h3>
          <InfoBox>
            <p><strong>Important:</strong> Disabling certain cookies may affect your ability to use our website and services. Essential cookies are required for login, shopping cart, checkout, and payment processing. Disabling them may prevent you from placing orders or accessing your account.</p>
          </InfoBox>
        </Section>

        <Section>
          <h2>6. Do Not Track (DNT) Signals</h2>
          <p>
            Some browsers offer a "Do Not Track" (DNT) feature. Currently, there is no industry standard for how websites should respond to DNT signals. We do not currently respond to DNT browser signals, but we respect your privacy choices through our cookie management options.
          </p>
        </Section>

        <Section>
          <h2>7. Local Storage & Session Storage</h2>
          <p>In addition to cookies, we may use browser local storage and session storage technologies to:</p>
          <ul>
            <li>Store user preferences and shopping cart data</li>
            <li>Improve website performance and loading times</li>
            <li>Enable offline functionality where applicable</li>
          </ul>
          <p>You can clear local storage through your browser settings, similar to clearing cookies.</p>
        </Section>

        <Section>
          <h2>8. Data Security & Privacy</h2>
          <p>
            Cookie data is processed in accordance with our Privacy Policy and is subject to the data protection measures outlined in Section 16 of our Terms & Conditions. We implement reasonable security practices under the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023 (DPDP Act).
          </p>
          <p>
            However, as stated in our Terms, no method is 100% secure, and liability is limited as per Clause 21.
          </p>
        </Section>

        <Section>
          <h2>9. Cookies for Marketing & Communications</h2>
          <p>
            We may use cookies to deliver relevant promotional content and measure the effectiveness of marketing campaigns. As per our Privacy Policy, you can opt-out of marketing communications while continuing to receive essential transactional messages (order confirmations, service updates).
          </p>
        </Section>

        <Section>
          <h2>10. Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under 18 years of age. We do not knowingly collect data from minors through cookies or any other means. If you believe a minor has provided information to us, please contact us immediately.
          </p>
        </Section>

        <Section>
          <h2>11. Updates to This Cookie Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or our practices. As per Section 27 of our Terms & Conditions, the updated policy will be posted at our premises and website with the revised date. Continued use constitutes acceptance.
          </p>
        </Section>

        <Section>
          <h2>12. Contact Us</h2>
          <p>If you have questions or concerns about our use of cookies, please contact us:</p>
          <InfoBox>
            <p><strong>Techverse Services</strong></p>
            <p>Email: support@techverse.com</p>
            <p>Phone: +1 (555) 123-4567</p>
            <p>Address: Shop No.5, Costa Mapple, Near Government Engineering College, Usmanpura, Chh. Sambhajinagar. 431001</p>
          </InfoBox>
        </Section>

        <Section>
          <h2>13. Governing Law</h2>
          <p>
            This Cookie Policy is governed by the laws of India and is subject to the jurisdiction of courts at Chhatrapati Sambhajinagar, Maharashtra, as per Section 25 of our Terms & Conditions.
          </p>
        </Section>

        <Section>
          <InfoBox>
            <p><strong>Compliance:</strong> This Cookie Policy is aligned with the Information Technology Act, 2000, Digital Personal Data Protection Act, 2023 (DPDP Act), and applicable international best practices for cookie usage and disclosure.</p>
          </InfoBox>
        </Section>
      </ContentWrapper>
    </StyledDialog>
  );
};

export default CookieModal;