import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Privacy Policy | AiMailer",
  description: "Privacy Policy for AiMailer email management platform",
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: April 4, 2024</p>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <p>
          This Privacy Policy describes how AiMailer, Inc. ("we", "us", or "our") collects, uses, and discloses your
          personal information when you use our website and email management service (the "Service").
        </p>

        <p>
          We use your data to provide and improve the Service. By using the Service, you agree to the collection and use
          of information in accordance with this policy.
        </p>

        <h2>1. Information We Collect</h2>

        <h3>1.1 Personal Information</h3>
        <p>
          While using our Service, we may ask you to provide us with certain personally identifiable information that
          can be used to contact or identify you ("Personal Information"). Personally identifiable information may
          include, but is not limited to:
        </p>
        <ul>
          <li>Email address</li>
          <li>First name and last name</li>
          <li>Phone number</li>
          <li>Address, State, Province, ZIP/Postal code, City</li>
          <li>Cookies and Usage Data</li>
        </ul>

        <h3>1.2 AWS Credentials</h3>
        <p>To provide our email management services, we collect and securely store your AWS credentials, including:</p>
        <ul>
          <li>AWS Access Key ID</li>
          <li>AWS Secret Access Key</li>
          <li>AWS Region</li>
        </ul>
        <p>
          These credentials are encrypted and stored securely. We use these credentials solely to provide the Service
          and do not share them with third parties.
        </p>

        <h3>1.3 Email Data</h3>
        <p>When you use our Service to send emails, we process and store:</p>
        <ul>
          <li>Email content and templates</li>
          <li>Email recipients</li>
          <li>Email metadata (subject lines, send times, etc.)</li>
          <li>Email performance metrics (opens, clicks, bounces, etc.)</li>
        </ul>

        <h3>1.4 Usage Data</h3>
        <p>
          We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may
          include information such as your computer's Internet Protocol address (e.g., IP address), browser type,
          browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on
          those pages, unique device identifiers, and other diagnostic data.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>We use the collected data for various purposes:</p>
        <ul>
          <li>To provide and maintain our Service</li>
          <li>To notify you about changes to our Service</li>
          <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
          <li>To provide customer support</li>
          <li>To gather analysis or valuable information so that we can improve our Service</li>
          <li>To monitor the usage of our Service</li>
          <li>To detect, prevent and address technical issues</li>
          <li>
            To provide you with news, special offers and general information about other goods, services and events
            which we offer
          </li>
        </ul>

        <h2>3. Data Security</h2>
        <p>
          The security of your data is important to us, but remember that no method of transmission over the Internet,
          or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to
          protect your Personal Information, we cannot guarantee its absolute security.
        </p>

        <p>
          We implement a variety of security measures to maintain the safety of your personal information, including:
        </p>
        <ul>
          <li>Encrypting sensitive information like AWS credentials</li>
          <li>Using secure HTTPS connections</li>
          <li>Regular security audits and updates</li>
          <li>Access controls and authentication for all user accounts</li>
        </ul>

        <h2>4. Data Retention</h2>
        <p>
          We will retain your Personal Information only for as long as is necessary for the purposes set out in this
          Privacy Policy. We will retain and use your Personal Information to the extent necessary to comply with our
          legal obligations, resolve disputes, and enforce our legal agreements and policies.
        </p>

        <p>
          We will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter
          period of time, except when this data is used to strengthen the security or to improve the functionality of
          our Service, or we are legally obligated to retain this data for longer time periods.
        </p>

        <h2>5. Your Data Protection Rights</h2>
        <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
        <ul>
          <li>The right to access, update or delete your information</li>
          <li>The right to rectification (to correct information)</li>
          <li>The right to object (to processing of your information)</li>
          <li>The right of restriction (to restrict processing)</li>
          <li>The right to data portability</li>
          <li>The right to withdraw consent</li>
        </ul>

        <p>If you wish to exercise any of these rights, please contact us at privacy@aimailer.in.</p>

        <h2>6. Cookies</h2>
        <p>
          We use cookies and similar tracking technologies to track the activity on our Service and hold certain
          information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
        </p>

        <p>
          You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if
          you do not accept cookies, you may not be able to use some portions of our Service.
        </p>

        <h2>7. Service Providers</h2>
        <p>
          We may employ third-party companies and individuals to facilitate our Service ("Service Providers"), to
          provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how our
          Service is used.
        </p>

        <p>
          These third parties have access to your Personal Information only to perform these tasks on our behalf and are
          obligated not to disclose or use it for any other purpose.
        </p>

        <h2>8. Analytics</h2>
        <p>We may use third-party Service Providers to monitor and analyze the use of our Service.</p>

        <h3>Google Analytics</h3>
        <p>
          Google Analytics is a web analytics service offered by Google that tracks and reports website traffic. Google
          uses the data collected to track and monitor the use of our Service. This data is shared with other Google
          services. Google may use the collected data to contextualize and personalize the ads of its own advertising
          network.
        </p>

        <p>
          You can opt-out of having your activity on the Service available to Google Analytics by installing the Google
          Analytics opt-out browser add-on. The add-on prevents Google Analytics JavaScript from sharing information
          with Google Analytics about visits activity.
        </p>

        <h2>9. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
          Privacy Policy on this page and updating the "Last updated" date.
        </p>

        <p>
          You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are
          effective when they are posted on this page.
        </p>

        <h2>10. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us:</p>
        <p>
          <strong>Email:</strong> privacy@aimailer.in
          <br />
          <strong>Address:</strong> AiMailer, Inc., 123 Email Street, San Francisco, CA 94103
        </p>
      </div>
    </div>
  )
}
