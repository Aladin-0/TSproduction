// src/components/TermsModal.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import { Dialog, DialogContent, IconButton, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface TermsModalProps {
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
  '& blockquote': {
    borderLeft: '3px solid rgba(255, 255, 255, 0.2)',
    paddingLeft: '16px',
    margin: '16px 0',
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

const InfoBox = styled(Box)({
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
});

export const TermsModal: React.FC<TermsModalProps> = ({ open, onClose }) => {
  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogHeader>
        <Title>Terms & Conditions</Title>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      </DialogHeader>
      
      <ContentWrapper>
        <Section>
          <InfoBox>
            <p><strong>Business Name:</strong> Techverse Services</p>
            <p><strong>Constitution:</strong> Proprietorship</p>
            <p><strong>GST Registration:</strong> Registered under the GST Act (GSTIN: 27CJLPP1870M1ZJ)</p>
            <p><strong>Place of Business:</strong> Chhatrapati Sambhajinagar, Maharashtra, India</p>
            <p><strong>Registered Address:</strong> Shop No.5, Costa Mapple, Near Government Engineering College, Usmanpura, Chh. Sambhajinagar. 431001</p>
          </InfoBox>

          <blockquote>
            <strong>Important:</strong> These Terms & Conditions ("T&Cs") govern <strong>sale of goods</strong> (computers, laptops, monitors, printers, CCTV cameras, accessories), <strong>repair & maintenance services</strong>, <strong>software installation</strong>, and <strong>data recovery</strong> provided by Techverse Services ("we/us"). By placing an order, handing over a device, or availing any service, the customer ("you/your") accepts these T&Cs.
          </blockquote>
        </Section>

        <Section>
          <h2>1. Definitions</h2>
          <ul>
            <li><strong>Goods:</strong> Computers, laptops, monitors, printers, CCTV cameras, storage devices, and accessories sold by us.</li>
            <li><strong>Services:</strong> Diagnosis, repair, maintenance, installation (including CCTV), configuration, software installation, data recovery/migration, AMC, and related IT support.</li>
            <li><strong>Job Sheet/Work Order:</strong> Document/record generated at intake detailing device condition, reported issues, estimates, and your consent.</li>
          </ul>
        </Section>

        <Section>
          <h2>2. Scope of Business</h2>
          <p>We sell Goods and provide Services at our premises, at your site, or remotely, as mutually agreed. Some Services may be performed by authorized sub‑contractors/authorized service partners.</p>
        </Section>

        <Section>
          <h2>3. Orders, Quotations & Estimates (Sales)</h2>
          <ol>
            <li>Quotations are valid for 7 days unless stated otherwise and may change due to fluctuation in vendor pricing/taxes.</li>
            <li>An order is accepted only upon our written confirmation/invoice and receipt of any required advance.</li>
            <li>Images/specifications in catalogs are indicative. Final product may vary within the manufacturer's published tolerances.</li>
          </ol>
        </Section>

        <Section>
          <h2>4. Pricing, Taxes & Invoicing</h2>
          <ol>
            <li>Prices are in INR and exclusive of taxes unless stated as "inclusive". GST is charged as applicable under the <strong>CGST/SGST/IGST</strong> provisions.</li>
            <li><strong>E‑invoicing</strong> will be issued where applicable as per prevailing turnover thresholds.</li>
            <li>Any statutory levy/cess introduced or varied after quotation but before supply will be to your account.</li>
            <li>For card/UPI/wallet/EMI payments, payment gateway or bank charges (if any) may be recovered at cost.</li>
          </ol>
        </Section>

        <Section>
          <h2>5. Delivery, Title & Risk (Sales)</h2>
          <ol>
            <li>Delivery timelines are estimates. We are not liable for delays due to courier/logistics or force majeure (see Clause 22).</li>
            <li>Risk in the Goods passes to you on delivery/collection. <strong>Title</strong> passes on realization of full payment.</li>
            <li>You must inspect the Goods on delivery and notify us in writing of any transit damage/shortage within <strong>48 hours</strong>.</li>
          </ol>
        </Section>

        <Section>
          <h2>6. Installation & On‑Site Work (including CCTV)</h2>
          <ol>
            <li>Site readiness (power, network, mounting points, earthing, conduits) is your responsibility unless expressly included.</li>
            <li>Where civil/electrical/networking works are required, these are <strong>excluded</strong> unless specifically quoted.</li>
            <li>We will follow reasonable industry practices and applicable safety standards.</li>
            <li>For <strong>CCTV</strong>: positioning will be as per the layout agreed with you. You are responsible for compliance with any local permissions, resident association rules, and <strong>privacy notices</strong> informing individuals about surveillance.</li>
          </ol>
        </Section>

        <Section>
          <h2>7. Repairs, Diagnosis & Estimates</h2>
          <ol>
            <li>A <strong>Job Sheet</strong> will record device details, serial numbers, visible condition, accessories received, and reported issues.</li>
            <li>A non‑refundable <strong>diagnostic fee</strong> of ₹750 may apply and will be adjusted in the final invoice if you proceed.</li>
            <li>Estimates are indicative. If additional faults are discovered, we will seek approval where the variance exceeds the estimated amount.</li>
            <li>In case you decline repairs after diagnosis/part sourcing, the diagnostic fee and any logistics/return charges will apply.</li>
          </ol>
        </Section>

        <Section>
          <h2>8. Data & Backups (Customer Responsibility)</h2>
          <ol>
            <li><strong>Back up your data</strong> before handing over devices. While we take reasonable care, we are <strong>not liable</strong> for any data loss/corruption, confidentiality breach, or re‑installation costs.</li>
            <li>You authorize us to access, copy, and handle data <strong>solely</strong> for performing the Services.</li>
            <li>We do <strong>not</strong> install or activate pirated/unlicensed software or bypass security/activation mechanisms. Provide genuine licenses/keys where required.</li>
          </ol>
        </Section>

        <Section>
          <h2>9. Data Recovery Services – Specific Terms</h2>
          <ol>
            <li>Success depends on media condition; <strong>no‑recovery‑no‑fee</strong> applies <strong>only if</strong> stated in writing. Otherwise, assessment fees/attempt charges apply regardless of outcome.</li>
            <li>You confirm you are the lawful owner/authorized holder of the data and that recovery does not violate any law or third‑party rights.</li>
            <li>Recovered data is provided on a target drive supplied by you or purchased from us. Data will be retained for 7 days post‑delivery and then securely deleted.</li>
            <li>We do not review contents except as technically necessary. You are solely responsible for lawful use of recovered data.</li>
          </ol>
        </Section>

        <Section>
          <h2>10. Spare Parts & Components</h2>
          <ol>
            <li>Parts may be OEM, genuine, or compatible (grade‑A) as per your choice/availability; warranties vary accordingly.</li>
            <li>Replaced defective parts become our property unless returned to you at additional cost (if the vendor requires DOA/RMA exchange).</li>
            <li>Lead times for special‑order parts are indicative and subject to supplier availability.</li>
          </ol>
        </Section>

        <Section>
          <h2>11. Warranties</h2>
          <ol>
            <li><strong>Manufacturer Warranty (Sales):</strong> Goods are covered by the respective manufacturer's warranty and service network. We will assist with warranty claims where feasible, but ultimate responsibility lies with the manufacturer.</li>
            <li><strong>Service Warranty (Repairs):</strong> Our repair workmanship is warranted for 30 days from delivery, limited to the exact fault/part replaced.</li>
            <li>Warranty is void if devices show signs of liquid damage, physical abuse, burning, electrical surge, unauthorized repair/tampering, software corruption, malware, or use outside manufacturer specifications.</li>
            <li><strong>Dead‑on‑Arrival (DOA):</strong> For eligible DOA cases within 7 days from invoice, replacement is subject to OEM/RMA policy and physical condition (box, accessories, serials). Consumables are excluded.</li>
            <li>Batteries, adapters, cartridges, heads/drums, and consumables carry limited/usage‑based warranties as per OEM terms.</li>
          </ol>
        </Section>

        <Section>
          <h2>12. Returns, Replacements & Refunds (Sales)</h2>
          <ol>
            <li>Returns are accepted only in accordance with applicable law and the specific OEM/Distributor policy. Opened software, license keys, consumables, customized orders, and special‑order parts are non‑returnable.</li>
            <li>For non‑defective returns (where permitted), restocking fees of 5–15% may apply; item must be unused, in original packaging with all accessories and serials intact.</li>
            <li>Refunds, where approved, are processed to the original payment instrument within a reasonable time after receipt/inspection.</li>
          </ol>
        </Section>

        <Section>
          <h2>13. Payment Terms & Credit</h2>
          <ol>
            <li>Payment is due on delivery for retail sales and on completion for services unless a written credit arrangement exists.</li>
            <li>Devices/Goods will not be released until full payment is realized. Cheque/NEFT clearance is deemed receipt.</li>
            <li>Delayed payments attract interest at 5% per month (or maximum permitted by law), plus recovery costs including legal fees.</li>
          </ol>
        </Section>

        <Section>
          <h2>14. Lien, Storage & Abandoned Devices</h2>
          <ol>
            <li>We have a general lien over devices/Goods in our possession for unpaid dues.</li>
            <li>Post‑repair notification, storage charges of ₹100/day may apply after 7 days.</li>
            <li>If uncollected for 60 days, the item may be treated as <strong>abandoned</strong> and disposed of/auctioned to recover dues after due notice; any surplus (if any) will be refunded to you.</li>
          </ol>
        </Section>

        <Section>
          <h2>15. Customer Obligations & Acceptable Use</h2>
          <ol>
            <li>Provide accurate information, lawful instructions, and proof of purchase/ownership when requested.</li>
            <li>Do not request activities that are illegal, violate IPR, or compromise security (e.g., password bypassing without ownership proof).</li>
            <li>Keep credentials secure; change passwords after service. We are not responsible for post‑service misuse due to unchanged credentials.</li>
          </ol>
        </Section>

        <Section>
          <h2>16. Privacy & Data Protection</h2>
          <ol>
            <li>We process personal data as per the Digital Personal Data Protection Act, 2023 (DPDP Act) and reasonable security practices under the Information Technology Act, 2000 and rules thereunder.</li>
            <li>Purposes include order fulfilment, service delivery, warranty/AMC support, regulatory compliance, and communications.</li>
            <li>We implement reasonable technical and organizational measures to protect data. However, no method is 100% secure; liability is limited as per Clause 21.</li>
            <li>You may write to our Grievance Officer/Data Contact us for requests or complaints.</li>
          </ol>
        </Section>

        <Section>
          <h2>17. CCTV‑Specific Compliance & Signage</h2>
          <ol>
            <li>You are responsible for displaying clear signage where cameras operate and for informing occupants/visitors as required by applicable privacy norms.</li>
            <li>Do not install cameras in prohibited/sensitive areas or in violation of housing society/landlord rules or law enforcement directions.</li>
            <li>You are responsible for lawful retention, access controls, and deletion periods of recordings.</li>
          </ol>
        </Section>

        <Section>
          <h2>18. E‑Waste & Environmental Compliance</h2>
          <p>We support responsible recycling in line with the <strong>E‑Waste (Management) Rules, 2022</strong> and applicable state guidelines. On request, we will guide you to authorized collection centers/producers' take‑back programs.</p>
        </Section>

        <Section>
          <h2>19. Intellectual Property & Software Licensing</h2>
          <ol>
            <li>All software must be duly licensed. We will not install counterfeit or unlicensed software or circumvent activation/DRM.</li>
            <li>Trademarks and brands belong to their respective owners; sale of Goods does not transfer any IPR in software/firmware.</li>
          </ol>
        </Section>

        <Section>
          <h2>20. Third‑Party Services & Cloud Accounts</h2>
          <p>Where Services require sign‑in to OEM or cloud accounts (e.g., Microsoft/Apple/Google, CCTV NVR apps), you authorize access strictly for service performance. You remain responsible for those providers' terms and any subscription/usage fees.</p>
        </Section>

        <Section>
          <h2>21. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law:</p>
          <ol>
            <li>We are not liable for indirect, incidental, special, punitive, or consequential losses including loss of data, profits, business, or goodwill.</li>
            <li>For Sales, our total liability is limited to the invoice value of the Goods. For Services, liability is limited to the fees paid for the specific Service.</li>
            <li>Nothing limits liability for fraud, willful misconduct, or where liability cannot be excluded under applicable consumer laws.</li>
          </ol>
        </Section>

        <Section>
          <h2>22. Force Majeure</h2>
          <p>We are not liable for delay/failure due to causes beyond reasonable control, including acts of God, flood, fire, strike, epidemic, war, civil unrest, supplier failures, or governmental action.</p>
        </Section>

        <Section>
          <h2>23. Indemnity</h2>
          <p>You agree to indemnify and hold us harmless against claims, penalties, or losses arising from your breach of these T&Cs, unlawful instructions, or violation of third‑party rights.</p>
        </Section>

        <Section>
          <h2>24. Compliance & Audit</h2>
          <p>We comply with applicable laws including the Consumer Protection Act, 2019, Legal Metrology Act/Packaged Commodities Rules (as applicable to labeling/MRP), GST laws, and relevant IT/telecom rules. You shall comply with all laws applicable to your use of Goods/Services.</p>
        </Section>

        <Section>
          <h2>25. Dispute Resolution, Governing Law & Jurisdiction</h2>
          <ol>
            <li>Parties shall first attempt to resolve disputes amicably within 30 days of written notice.</li>
            <li>If unresolved, disputes may be referred to arbitration by a sole arbitrator appointed mutually, under the Arbitration and Conciliation Act, 1996; seat and venue: Chhatrapati Sambhajinagar, Maharashtra; language: English/Marathi/Hindi.</li>
            <li>Subject to arbitration, courts at Chhatrapati Sambhajinagar, Maharashtra shall have exclusive jurisdiction.</li>
            <li>These T&Cs are governed by the laws of India.</li>
          </ol>
        </Section>

        <Section>
          <h2>26. Notices & Communication</h2>
          <p>Official notices may be sent to the address/email stated on your invoice or Job Sheet. Operational updates may be sent via SMS/WhatsApp/email.</p>
        </Section>

        <Section>
          <h2>27. Amendments & Severability</h2>
          <p>We may update these T&Cs by posting the revised version at our premises/website. Continued use constitutes acceptance. If any provision is held invalid, the remainder will continue in full force.</p>
        </Section>

        <Section>
          <h2>28. Entire Agreement & No Waiver</h2>
          <p>These T&Cs together with the invoice/Job Sheet/Work Order constitute the entire agreement. No failure or delay in exercising any right operates as a waiver.</p>
        </Section>

        <Section>
          <h2>29. Acceptance</h2>
          <p>By signing the Job Sheet, placing an order, or accepting delivery/service, you confirm you have read, understood, and agree to these T&Cs.</p>
        </Section>

        <Section>
          <InfoBox>
            <p><strong>Key Terms (extract):</strong> Data loss disclaimer; genuine software only; limited service warranty 30 Days; storage charges after 7 days; abandoned after 60 days; lien until full payment; CCTV installs require signage; returns/refunds as per OEM policy and law; arbitration at Chhatrapati Sambhajinagar.</p>
          </InfoBox>
        </Section>
      </ContentWrapper>
    </StyledDialog>
  );
};

export default TermsModal;