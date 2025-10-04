// src/components/PrivacyModal.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import { Dialog, DialogContent, IconButton, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface PrivacyModalProps {
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

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ open, onClose }) => {
  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogHeader>
        <Title>Privacy Policy</Title>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      </DialogHeader>
      
      <ContentWrapper>
        <UpdateDate>Last Updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</UpdateDate>

        <Section>
          <InfoBox>
            <p><strong>Business Name:</strong> Techverse Services</p>
            <p><strong>Constitution:</strong> Proprietorship</p>
            <p><strong>GST Registration:</strong> GSTIN: 27CJLPP1870M1ZJ</p>
            <p><strong>Place of Business:</strong> Chhatrapati Sambhajinagar, Maharashtra, India</p>
            <p><strong>Registered Address:</strong> Shop No.5, Costa Mapple, Near Government Engineering College, Usmanpura, Chh. Sambhajinagar. 431001</p>
          </InfoBox>

          <p>
            At Techverse Services, we are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, store, and protect your personal information in accordance with applicable laws including the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000.
          </p>
        </Section>

        <Section>
          <h2>1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          
          <h3>1.1 Personal Information</h3>
          <ul>
            <li>Name, email address, phone number, and billing/shipping address</li>
            <li>Business details (if applicable)</li>
            <li>Payment information and transaction details</li>
            <li>Government-issued identification when required for warranty claims or service requests</li>
          </ul>

          <h3>1.2 Device and Service Information</h3>
          <ul>
            <li>Device details including serial numbers, model numbers, and specifications</li>
            <li>Reported issues, diagnostic results, and repair history</li>
            <li>Software configuration and installed applications (only as necessary for service delivery)</li>
            <li>Data accessed during repair, installation, or recovery services (handled strictly as per Section 8 & 9 of our Terms)</li>
          </ul>

          <h3>1.3 Technical Information</h3>
          <ul>
            <li>IP address, browser type, and device information when you visit our website</li>
            <li>Usage data and preferences to improve our services</li>
          </ul>

          <h3>1.4 CCTV Installation Data</h3>
          <ul>
            <li>Installation site details, layout preferences, and technical specifications</li>
            <li>You remain the data controller for any footage recorded; we only provide installation services</li>
          </ul>
        </Section>

        <Section>
          <h2>2. How We Use Your Information</h2>
          <p>We process your personal data for the following purposes:</p>
          <ul>
            <li><strong>Order Fulfillment:</strong> Processing sales, deliveries, and invoicing</li>
            <li><strong>Service Delivery:</strong> Diagnosis, repair, maintenance, installation, software configuration, and data recovery</li>
            <li><strong>Warranty & AMC Support:</strong> Managing warranty claims, Annual Maintenance Contracts, and after-sales service</li>
            <li><strong>Communication:</strong> Sending order updates, service notifications, and promotional messages (with consent)</li>
            <li><strong>Regulatory Compliance:</strong> GST invoicing, e-invoicing, legal obligations, and record-keeping</li>
            <li><strong>Business Operations:</strong> Improving services, analyzing usage patterns, and managing customer relationships</li>
            <li><strong>Payment Processing:</strong> Securing transactions through payment gateways and maintaining financial records</li>
          </ul>
        </Section>

        <Section>
          <h2>3. Data Protection & Security</h2>
          <p>We implement reasonable technical and organizational measures to protect your personal data:</p>
          <ul>
            <li>Secure storage of physical and electronic records with access controls</li>
            <li>Encrypted transmission of sensitive data during online transactions</li>
            <li>Regular security assessments and employee training on data protection</li>
            <li>Secure disposal of data after retention periods expire</li>
          </ul>
          <p>
            <strong>Important:</strong> However, no method of transmission or storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. Our liability for data breaches is limited as per Clause 21 of our Terms & Conditions.
          </p>
        </Section>

        <Section>
          <h2>4. Data Retention</h2>
          <p>We retain your personal data only as long as necessary for the purposes outlined in this policy:</p>
          <ul>
            <li><strong>Transaction Records:</strong> Maintained for 7 years as per GST and Income Tax regulations</li>
            <li><strong>Warranty & Service Records:</strong> Retained for the warranty period plus reasonable extension for claims</li>
            <li><strong>Job Sheets & Repair History:</strong> Kept for reference and quality assurance purposes</li>
            <li><strong>Recovered Data:</strong> Retained for 7 days post-delivery, then securely deleted (as per Section 9 of Terms)</li>
            <li><strong>Uncollected Devices:</strong> If abandoned for 60 days, devices may be disposed of after due notice (as per Section 14 of Terms)</li>
          </ul>
        </Section>

        <Section>
          <h2>5. Data Sharing & Disclosure</h2>
          <p>We do not sell your personal data. We may share information with:</p>
          <ul>
            <li><strong>Service Partners:</strong> Authorized sub-contractors, OEM service centers, and logistics providers for service delivery</li>
            <li><strong>Payment Processors:</strong> Third-party gateways for secure payment processing</li>
            <li><strong>Legal Authorities:</strong> When required by law, court orders, or regulatory compliance</li>
            <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of business assets (with notice to affected parties)</li>
          </ul>
          <p>All third parties are contractually obligated to maintain confidentiality and use data only for specified purposes.</p>
        </Section>

        <Section>
          <h2>6. Your Data & Device Responsibilities</h2>
          <p>As per Section 8 of our Terms & Conditions:</p>
          <ul>
            <li><strong>Backup Your Data:</strong> You must back up all data before handing over devices for service</li>
            <li><strong>Data Loss Disclaimer:</strong> We are not liable for data loss, corruption, or confidentiality breaches during service</li>
            <li><strong>Authorization:</strong> By using our services, you authorize us to access, copy, and handle data solely for performing the requested services</li>
            <li><strong>Lawful Software:</strong> We do not install pirated/unlicensed software or bypass security mechanisms</li>
          </ul>
        </Section>

        <Section>
          <h2>7. Your Rights</h2>
          <p>Under the DPDP Act, 2023, and other applicable laws, you have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request information about personal data we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
            <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing communications at any time</li>
            <li><strong>Data Portability:</strong> Request a copy of your data in a structured, commonly used format (where applicable)</li>
            <li><strong>Grievance Redressal:</strong> File a complaint with our Grievance Officer or Data Protection Contact</li>
          </ul>
        </Section>

        <Section>
          <h2>8. CCTV & Surveillance Data</h2>
          <p>For CCTV installation services (as per Section 17 of Terms):</p>
          <ul>
            <li>You are the data controller; we only provide installation services</li>
            <li>You must display clear signage informing individuals about surveillance</li>
            <li>You are responsible for lawful retention, access controls, deletion periods, and compliance with privacy norms</li>
            <li>Do not install cameras in prohibited areas or violate housing society/landlord rules</li>
          </ul>
        </Section>

        <Section>
          <h2>9. Third-Party Services & Cloud Accounts</h2>
          <p>As per Section 20 of our Terms:</p>
          <ul>
            <li>Where services require sign-in to OEM or cloud accounts (Microsoft, Apple, Google, CCTV NVR apps), you authorize access strictly for service performance</li>
            <li>You remain responsible for those providers' terms, privacy policies, and any subscription/usage fees</li>
            <li>We recommend changing passwords after service completion for security</li>
          </ul>
        </Section>

        <Section>
          <h2>10. Marketing Communications</h2>
          <ul>
            <li>We may send promotional offers, product updates, and service notifications via SMS, WhatsApp, or email</li>
            <li>You can opt-out at any time by clicking "unsubscribe" or contacting us</li>
            <li>Transactional messages (order confirmations, service updates) are necessary and cannot be opted out</li>
          </ul>
        </Section>

        <Section>
          <h2>11. Children's Privacy</h2>
          <p>Our services are not directed to children under 18. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected such data, please contact us immediately for deletion.</p>
        </Section>

        <Section>
          <h2>12. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The updated policy will be posted at our premises and website with the revised date. Continued use of our services after changes constitutes acceptance.</p>
        </Section>

        <Section>
          <h2>13. Contact Us / Grievance Officer</h2>
          <p>For any privacy-related questions, requests, or complaints, please contact:</p>
          <InfoBox>
            <p><strong>Techverse Services</strong></p>
            <p><strong>Grievance Officer / Data Protection Contact:</strong></p>
            <p>Email: support@techverse.com</p>
            <p>Phone: +1 (555) 123-4567</p>
            <p>Address: Shop No.5, Costa Mapple, Near Government Engineering College, Usmanpura, Chh. Sambhajinagar. 431001</p>
          </InfoBox>
          <p>We will respond to your request within a reasonable timeframe as per applicable law.</p>
        </Section>

        <Section>
          <h2>14. Governing Law</h2>
          <p>This Privacy Policy is governed by the laws of India. Any disputes arising from this policy shall be subject to the exclusive jurisdiction of courts at Chhatrapati Sambhajinagar, Maharashtra, as per our Terms & Conditions.</p>
        </Section>

        <Section>
          <InfoBox>
            <p><strong>Compliance Summary:</strong></p>
            <ul>
              <li>Digital Personal Data Protection Act, 2023 (DPDP Act)</li>
              <li>Information Technology Act, 2000 and rules thereunder</li>
              <li>Consumer Protection Act, 2019</li>
              <li>GST Acts and e-invoicing requirements</li>
            </ul>
          </InfoBox>
        </Section>
      </ContentWrapper>
    </StyledDialog>
  );
};

export default PrivacyModal;