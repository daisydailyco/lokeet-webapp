import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] p-4 py-16">
      <Link href="/legal" className="absolute top-6 left-6 flex items-center justify-center hover:opacity-60 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </Link>
      <div className="bg-white border-2 border-black rounded-3xl shadow-lg p-8 w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold">Lokeet</Link>
          <p className="text-gray-600 mt-2">Privacy Policy</p>
        </div>
        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <p className="text-xs text-gray-400">Last updated: June 25, 2026</p>

          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Notice of Updated Privacy Policy</p>
            <p>We have updated our Terms of Service and Privacy Policy. These updated terms are effective for new users of our Services as of June 25, 2026, and for existing users as of June 25, 2026. By continuing to use our Services after the applicable effective date, you agree to the updated Terms of Service and Privacy Policy.</p>
          </section>

          <section>
            <p className="mb-3">This Privacy Policy describes how Lokeet (&ldquo;Lokeet,&rdquo; &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) handles personal information that we collect through our website and related applications (the &ldquo;Services&rdquo;). The Services are designed to help users discover, save, organize, and share location-based content and curated lists.</p>
            <p>We reserve the right to modify this Privacy Policy at any time. If we make material changes, we will notify you by updating the date of this Privacy Policy and posting it on our website, or as required by law. For purposes of data protection laws, Lokeet is the controller of your personal information.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Personal Information We Collect</h2>
            <p className="mb-4">We obtain information about you through the means discussed below when we provide the Services. The type of information we collect depends on the features you use. Please note that we need certain types of information to provide the Services to you. If you do not provide us with such information, you may no longer be able to access or use certain features.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Information you provide to us</h3>
            <ul className="space-y-3 mb-4">
              <li><strong>Identification information:</strong> including your name, email address, phone number, and profile photo.</li>
              <li><strong>Communications:</strong> when you contact us with questions, feedback, respond to one of our surveys, or otherwise communicate with us, we may collect the information in such communications.</li>
              <li><strong>Payment information:</strong> if you subscribe to a paid plan, we collect information needed to process your payment, including payment card information, billing address, and transaction history. Payment processing is handled by our third-party payment processors and we do not store full card details.</li>
              <li><strong>Marketing information:</strong> such as your preferences for receiving our marketing communications and details about your engagement with them, which may be collected using cookies or web beacons.</li>
              <li><strong>Social media account information:</strong> if you choose to connect third-party social media accounts (such as Instagram or TikTok) to the Services, we may collect information associated with your account such as your username, profile information, and content you choose to save through the Services.</li>
            </ul>

            <h3 className="font-semibold text-gray-900 mb-2">Information We Collect from Others</h3>
            <p className="mb-4">We may also obtain information from third parties and sources other than you and the Services, including data providers such as information services and data licensors, and public sources such as social media platforms. The types of information we collect from third parties include contact information and system identification numbers. We may combine this information with personal information we receive from you.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Information We Collect Automatically</h3>
            <p className="mb-3">We, our service providers, and our advertising partners may automatically log information about you, your computer or mobile device, and your interaction over time with the Services and our communications, such as:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Device information:</strong> such as your computer&apos;s or mobile device&apos;s operating system type and version, manufacturer and model, browser type, screen resolution, IP address, unique identifiers, language settings, mobile device carrier, and radio/network information.</li>
              <li><strong>Online activity information:</strong> such as pages or screens you viewed, how long you spent on a page, the website you visited before browsing our Services, navigation paths between pages, access times, duration of access, and whether you have opened our marketing emails or clicked links within them.</li>
              <li><strong>Location information:</strong> when you use the Services, we and third parties integrated into our Services may collect your general location based on IP address.</li>
            </ul>
            <p className="mb-3">Technologies we use for automated data collection include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cookies:</strong> text files that websites store on a visitor&apos;s device to uniquely identify the visitor&apos;s browser, store preferences, help navigate between pages efficiently, and facilitate online advertising.</li>
              <li><strong>Local storage technologies:</strong> like HTML5, that provide cookie-equivalent functionality but can store larger amounts of data on your device.</li>
              <li><strong>Web beacons:</strong> also known as pixel tags or clear GIFs, which are used to demonstrate that a webpage or email was accessed or opened, or that certain content was viewed or clicked.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">How We Use Your Personal Information</h2>
            <p className="mb-3">We and our vendors may use your personal information for:</p>
            <ul className="space-y-3">
              <li><strong>Service delivery:</strong> to provide, operate, and improve the Services; create, maintain, and authenticate your account; conduct research and analysis relating to Lokeet and our Services; process payments and complete transactions; communicate with you about Lokeet, including by sending surveys, offers, announcements, updates, security alerts, and support messages; understand your needs and interests and personalize your experience; and provide support and respond to your requests, questions, and feedback.</li>
              <li><strong>Research and development:</strong> we may use your personal information for research and development, including to analyze and improve the Services.</li>
              <li><strong>Marketing and advertising:</strong> we or our advertising partners may send you direct marketing communications as permitted by law, including notifying you of special promotions, offers, and events via email, text message, and other means. We may also engage advertising partners to display ads on the Services and other online services using cookies and similar technologies to serve ads we think will interest you.</li>
              <li><strong>Compliance and protection:</strong> to comply with applicable laws, lawful requests, and legal process; protect our, your, or others&apos; rights, privacy, safety, or property; audit our internal processes; enforce the terms and conditions that govern Lokeet and our Services; and prevent, identify, investigate, and deter fraudulent, harmful, unauthorized, unethical, or illegal activity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Legal Bases for Use of Your Information</h2>
            <p className="mb-3">The laws in some jurisdictions require companies to tell you about the legal grounds they rely on to process your information. To the extent those laws apply, our legal bases are as follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Contractual commitments:</strong> where use of your information is necessary to perform our obligations under a contract with you, such as to provide the services you&apos;ve requested.</li>
              <li><strong>Legitimate interests:</strong> where use of your information furthers our legitimate interests or the legitimate interests of others, such as to provide security for the Services, operate our business, make and receive payments, defend our legal rights, and prevent fraud.</li>
              <li><strong>Legal compliance:</strong> where we use your information to comply with applicable legal obligations.</li>
              <li><strong>Consent:</strong> where you have consented to our processing of your information for a particular purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">How We Disclose Your Personal Information</h2>
            <p className="mb-3">We may disclose your personal information to the following parties and as otherwise described in this Privacy Policy or at the time of collection:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Related companies:</strong> we may disclose your personal information with our subsidiaries and affiliates for purposes consistent with this Privacy Policy.</li>
              <li><strong>Vendors:</strong> companies and individuals that provide services on our behalf or help us operate Lokeet, the Services, or our business (such as hosting, information technology, customer support, email delivery, and website analytics services).</li>
              <li><strong>Advertising partners:</strong> third-party advertising companies and other third parties for interest-based advertising purposes described above.</li>
              <li><strong>Professional advisors:</strong> lawyers, auditors, bankers, and insurers, where necessary in the course of the professional services they render to us.</li>
              <li><strong>Legal authorities and others:</strong> law enforcement, government authorities, and private parties, as we believe in good faith to be necessary or appropriate for the compliance and protection purposes described above.</li>
              <li><strong>Business transferees:</strong> acquirers and other relevant participants in business transactions (or negotiations for such transactions) involving a corporate financing, merger, consolidation, acquisition, reorganization, sale, or other disposition of all or any portion of the business or assets of, or equity interests in, Lokeet.</li>
              <li><strong>Consent:</strong> we may also disclose personal information where we have your consent to do so.</li>
              <li><strong>Other users or the public:</strong> whenever you voluntarily make your personal information available for viewing by third parties or the public on or through the Services, that information can be seen, collected, and used by others. We are not responsible for any use of such information by others.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Your Choices</h2>

            <h3 className="font-semibold text-gray-900 mb-2">Update or correct your information</h3>
            <p className="mb-4">To keep your information accurate, current, and complete, please contact us as specified below. We will take reasonable steps to update or correct information in our possession that you have previously submitted via the Services.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Opt out of marketing communications</h3>
            <p className="mb-4">You may opt out of marketing-related communications by following the opt-out or unsubscribe instructions contained in the marketing communication we send you.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Online tracking opt out</h3>
            <p className="mb-3">There are a number of ways to opt out of having your online activity and device information collected through the Services:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Blocking cookies in your browser:</strong> most browsers let you remove or reject cookies, including cookies used for interest-based advertising. To do this, follow the instructions in your browser settings.</li>
              <li><strong>Blocking advertising ID use in your mobile settings:</strong> your mobile device settings may provide functionality to limit use of the advertising ID associated with your mobile device for interest-based advertising purposes.</li>
              <li><strong>Using privacy plug-ins or browsers:</strong> you can block our websites from setting cookies used for interest-based ads by using a browser with privacy features, like Brave, or installing browser plugins like Privacy Badger, Ghostery, or uBlock Origin.</li>
              <li><strong>Advertising industry opt out tools:</strong> you can use opt-out options offered by the Digital Advertising Alliance or the Network Advertising Initiative to limit use of your information for interest-based advertising by participating companies.</li>
            </ul>

            <h3 className="font-semibold text-gray-900 mb-2">Do Not Track</h3>
            <p className="mb-4">Some Internet browsers may be configured to send &ldquo;Do Not Track&rdquo; signals to the online services that you visit. We currently do not respond to &ldquo;Do Not Track&rdquo; or similar signals.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Declining to provide information</h3>
            <p>We need to collect personal information to provide certain services. If you do not provide the information we identify as required or mandatory, we may not be able to provide those services.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Your Rights</h2>
            <p className="mb-3">Applicable law may give you various rights regarding your information. If these rights apply to you, they may permit you to request that we:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>confirm whether or not we are processing your information and provide access to and/or a copy of certain information we hold about you;</li>
              <li>correct information which is out of date or incorrect;</li>
              <li>delete certain information which we are holding about you;</li>
              <li>restrict or object to certain uses of your information;</li>
              <li>opt you out of the processing of your personal information for purposes of profiling in furtherance of decisions that produce legal or similarly significant effects, if applicable; or</li>
              <li>revoke your consent for the processing of your information.</li>
            </ul>
            <p className="mb-4">We will consider all requests and provide our response within the time period stated by applicable law. Please note that certain information may be exempt from such requests in some circumstances, such as if we need to keep processing your information for our legitimate interests or to comply with a legal obligation.</p>
            <p>To exercise any of these rights, please contact us using the contact details provided under the &ldquo;How To Contact Us&rdquo; section below. We may request you provide us with information necessary to verify your identity before responding to your request, such as your name, email address, and account information.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Third Party Sites and Services</h2>
            <p>Our Services may contain links to websites and other online services operated by third parties. In addition, our content may be integrated into web pages or other online services that are not associated with us. These links and integrations are not an endorsement of, or representation that we are affiliated with, any third party. We do not control websites or online services operated by third parties, and we are not responsible for their actions.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Data Retention</h2>
            <p>We will retain your information for as long as necessary to provide the Services and for the other purposes set out in this Privacy Policy. We also store information when necessary to comply with contractual and legal obligations, when we have a legitimate interest to do so (such as improving and developing the Services and enhancing safety, security, and stability), or in order to defend or ascertain our legal rights. In all cases, we consider the amount, nature, and sensitivity of the personal data, as well as the potential risk of harm from unauthorized use or disclosure, in determining how long to retain personal data.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Security</h2>
            <p className="mb-3">We employ a number of technical, organizational, and physical safeguards designed to protect the personal information we collect. However, no security measures are failsafe and we cannot guarantee the security of your personal information. You use the Services at your own risk.</p>
            <p>You play a critical role in protecting your information by maintaining up-to-date computer security protections and secure passwords. You agree that you are responsible for any additional verification procedures and security you deem necessary.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Data Transfers</h2>
            <p>We are headquartered in the United States and may use service providers that operate in other countries. Your personal information may therefore be processed in the United States or transferred to other locations where privacy laws may not be as protective as those in your state, province, or country. Where required, we will use appropriate safeguards for transferring data outside of the United Kingdom or the European Union, including signing Standard Contractual Clauses that govern the transfers of such data. For more information about these transfer mechanisms, please contact us as detailed in the &ldquo;How To Contact Us&rdquo; section below.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Children</h2>
            <p>The Services are intended for general audiences and not for children under 16. If we learn that we have collected personal information through the Services from a child under 16 without the consent of the child&apos;s parent or guardian, we will take reasonable steps to delete it as soon as possible. We also comply with other age restrictions and requirements in accordance with applicable local laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Notice to California Users</h2>
            <p className="mb-4">This section applies only to &ldquo;personal information&rdquo; about California residents, as that term is defined in the California Consumer Privacy Act (&ldquo;CCPA&rdquo;), and it supplements the information in the rest of our Privacy Policy.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Personal Information We Collect and Disclose</h3>
            <p className="mb-3">The categories of personal information we collect about California residents, how we use them, and to whom we disclose them, include:</p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Category</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Processing Purposes</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Categories of Recipients</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">Identifiers (name, email, IP address)</td>
                    <td className="border border-gray-200 px-3 py-2">Service delivery; research and development; marketing and advertising; compliance and protection.</td>
                    <td className="border border-gray-200 px-3 py-2">Related companies; vendors; advertising partners; professional advisors; legal authorities; business transferees; other users/public (if you publicly post on the Services).</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2">Commercial information (transaction history)</td>
                    <td className="border border-gray-200 px-3 py-2">Service delivery; compliance and protection.</td>
                    <td className="border border-gray-200 px-3 py-2">Related companies; vendors; professional advisors; legal authorities; business transferees.</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">Internet activity information</td>
                    <td className="border border-gray-200 px-3 py-2">Service delivery; research and development; marketing and advertising; compliance and protection.</td>
                    <td className="border border-gray-200 px-3 py-2">Related companies; vendors; advertising partners; professional advisors; legal authorities; business transferees.</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2">Approximate geolocation data</td>
                    <td className="border border-gray-200 px-3 py-2">Service delivery; research and development; marketing and advertising; compliance and protection.</td>
                    <td className="border border-gray-200 px-3 py-2">Related companies; vendors; advertising partners; professional advisors; legal authorities; business transferees.</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">Inferences</td>
                    <td className="border border-gray-200 px-3 py-2">Service delivery; research and development; marketing and advertising.</td>
                    <td className="border border-gray-200 px-3 py-2">Related companies; vendors; advertising partners; professional advisors.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-4">We collect the categories of personal information identified above from the following sources: (1) directly from you; (2) through your use of the Services; and (3) data providers, such as information services and data licensors, and public sources, such as social media platforms.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Your California Privacy Rights</h3>
            <p className="mb-3">If you are a California resident, the CCPA allows you to make certain requests about your personal information. Specifically, the CCPA allows you to request us to:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>inform you about the categories of personal information we collect or disclose about you, the categories of sources, the business or commercial purpose for collecting it, and the categories of third parties with whom we share it;</li>
              <li>provide access to and/or a copy of certain personal information we hold about you;</li>
              <li>correct inaccurate personal information that we maintain about you; and</li>
              <li>delete certain personal information we have about you.</li>
            </ul>
            <p className="mb-4">You may have the right to receive information about the financial incentives that we offer to you (if any). You also have the right not to be discriminated against for exercising certain of your rights. Certain information may be exempt from such requests under applicable law.</p>
            <p className="mb-4">To exercise any of these rights, please contact us at <a href="mailto:info@lokeet.com" className="text-[#42a746] hover:underline">info@lokeet.com</a>. You will need to provide us with information sufficient to verify your identity, such as your name, email address, and account information. You may also designate an authorized agent to make a request on your behalf with written authorization.</p>

            <h3 className="font-semibold text-gray-900 mb-2">California &ldquo;Shine the Light&rdquo; Disclosure</h3>
            <p>The California &ldquo;Shine the Light&rdquo; law gives residents of California the right under certain circumstances to opt out of the disclosure of certain categories of personal information with third parties for their direct marketing purposes. If you are a California resident and would like to make such a request, please contact us using the information provided in the &ldquo;How To Contact Us&rdquo; section below.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">How To Contact Us</h2>
            <p>You can reach Lokeet by email at <a href="mailto:info@lokeet.com" className="text-[#42a746] hover:underline">info@lokeet.com</a>. For privacy-related questions or requests, please include &ldquo;Privacy Request&rdquo; in the subject line.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
