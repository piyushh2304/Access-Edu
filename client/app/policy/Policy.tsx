import React, { useEffect, useState, useRef } from "react";
import { styles } from "../styles/styles";
type Props = {};

const Policy = (props: Props) => {
  const mainHeadingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const contactLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (paragraphRef.current) {
      // Since the paragraph contains multiple strong tags and br tags,
      // we'll extract text content and set aria-label for the whole block.
      // Individual strong tags will be handled by their own refs if needed.
      paragraphRef.current.setAttribute('tabIndex', '0');
      paragraphRef.current.setAttribute('aria-label', paragraphRef.current.textContent || '');
    }
  }, []);

  return (
    <div>
      <div
        className={`w-[95%] 800px:w-[92%] m-auto py-2 text-black dark:text-white px-3`}
      >
        <h1 ref={mainHeadingRef} tabIndex={0} className={`${styles.title} !text-start pt-2`}>
          Platform Terms and Condition
        </h1>
        <ul style={{ listStyle: "unset", marginLeft: "15px" }}>
          <p ref={paragraphRef} className="py-2 ml-[-15px] text-[16px] font-Poppins leading-8 whitespace-pre-line">
            Welcome to <strong>AccessEdu</strong>. By accessing or using our platform,
  you agree to comply with and be bound by the following Terms and Conditions.
  Please read them carefully before using our services.
  <br />
  <br />
  <strong>1. Acceptance of Terms</strong>
  <br />
  By creating an account or accessing AccessEdu, you confirm that you are at
  least 13 years of age (or have parental consent) and capable of entering into
  a legally binding agreement. Continued use of the platform implies acceptance
  of these terms and any future updates.
  <br />
  <br />
  <strong>2. Platform Usage</strong>
  <br />
  AccessEdu provides online educational content, courses, and accessibility tools
  designed for learners of all abilities, including individuals with disabilities.
  Users must use the platform responsibly, avoiding any actions that disrupt or
  harm the learning experience of others.
  <br />
  <br />
  <strong>3. User Accounts</strong>
  <br />
  You are responsible for maintaining the confidentiality of your login
  credentials and for all activities under your account. Any misuse or
  unauthorized use of another person’s account is strictly prohibited.
  If suspicious activity is detected, AccessEdu reserves the right to suspend or
  terminate your account.
  <br />
  <br />
  <strong>4. Accessibility Commitment</strong>
  <br />
  AccessEdu is dedicated to providing an inclusive and accessible learning
  environment. However, while we make every effort to ensure accessibility
  compliance, certain third-party integrations may have their own limitations.
  We encourage users to report any accessibility barriers for prompt resolution.
  <br />
  <br />
  <strong>5. Intellectual Property</strong>
  <br />
  All content on the platform, including text, graphics, logos, videos, and
  software, is the property of AccessEdu or its content providers. Users may not
  reproduce, distribute, or modify any material without prior written permission.
  <br />
  <br />
  <strong>6. Course Content and Instructors</strong>
  <br />
  AccessEdu partners with educators and organizations to deliver high-quality
  learning materials. While we review all content, we do not guarantee that
  every course will meet every learner’s specific needs. Instructors retain
  rights to their course materials unless otherwise stated.
  <br />
  <br />
  <strong>7. Payments and Refunds</strong>
  <br />
  Users may purchase paid courses or subscriptions through secure payment gateways.
  Refunds, where applicable, are subject to AccessEdu’s refund policy and must
  be requested within the specified timeframe.
  <br />
  <br />
  <strong>8. Prohibited Activities</strong>
  <br />
  Users may not upload harmful, discriminatory, or illegal content, engage in
  plagiarism, attempt to hack or misuse the platform, or share private course
  materials publicly without authorization.
  <br />
  <br />
  <strong>9. Privacy Policy</strong>
  <br />
  Your personal information is handled in accordance with our Privacy Policy.
  By using AccessEdu, you consent to our collection and use of data as described
  in that policy.
  <br />
  <br />
  <strong>10. Limitation of Liability</strong>
  <br />
  AccessEdu is not liable for any technical issues, loss of data, or indirect
  damages resulting from the use or inability to use our services. Users are
  encouraged to back up their learning data when possible.
  <br />
  <br />
  <strong>11. Changes to Terms</strong>
  <br />
  AccessEdu reserves the right to update or modify these Terms and Conditions at
  any time. Continued use of the platform after changes are posted constitutes
  acceptance of the revised terms.
  <br />
  <br />
  <strong>12. Contact Information</strong>
  <br />
  For any questions or concerns regarding these Terms and Conditions, please
  contact us at <a ref={contactLinkRef} tabIndex={0} href="mailto:support@accessedu.com" className="text-blue-500">support@accessedu.com</a>.
  <br />
  <br />
  By using AccessEdu, you acknowledge that you have read, understood, and agree
  to these Terms and Conditions.
          </p>
        </ul>
      </div>
    </div>
  );
};

export default Policy;
