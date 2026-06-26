import Link from 'next/link';

export default function TermsOfServicePage() {
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
          <p className="text-gray-600 mt-2">Terms of Service</p>
        </div>
        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <p className="text-xs text-gray-400">Last updated: June 25, 2026</p>

          <section>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Notice of Updated Terms</p>
            <p>We have updated our Terms of Service and Privacy Policy. These updated terms are effective for new users as of June 20, 2026, and for existing users as of June 20, 2026. By continuing to use our Services after the applicable effective date, you agree to the updated Terms of Service and Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Welcome to Lokeet!</h2>
            <p className="mb-3">Lokeet (&ldquo;Lokeet&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) provides its services to you through its website located at <strong>lokeet.io</strong> (the &ldquo;Site&rdquo;) and through its related services (collectively, the &ldquo;Service(s)&rdquo;), subject to the following Terms of Service (as amended from time to time, the &ldquo;Terms of Service&rdquo;).</p>
            <p className="mb-3">We reserve the right, at our sole discretion, to change or modify portions of these Terms of Service at any time. If we do this, we will post the changes on this page and will indicate at the top of this page the date these terms were last revised. Any changes will become effective when posted. Your continued use of the Services after changes are posted constitutes your acceptance of the new Terms of Service.</p>
            <p className="mb-3">In addition, when using certain services, you will be subject to any additional terms applicable to such services, including, without limitation, our <Link href="/legal/privacy-policy" className="text-[#42a746] hover:underline">Privacy Policy</Link>. All such terms are hereby incorporated by reference into these Terms of Service.</p>
            <p className="font-semibold text-gray-900">PLEASE READ THESE TERMS OF SERVICE CAREFULLY, AS THEY CONTAIN AN AGREEMENT TO ARBITRATE AND OTHER IMPORTANT INFORMATION REGARDING YOUR LEGAL RIGHTS, REMEDIES, AND OBLIGATIONS. THE AGREEMENT TO ARBITRATE REQUIRES (WITH LIMITED EXCEPTION) THAT YOU SUBMIT CLAIMS YOU HAVE AGAINST US TO BINDING AND FINAL ARBITRATION, AND FURTHER (1) YOU WILL ONLY BE PERMITTED TO PURSUE CLAIMS AGAINST LOKEET ON AN INDIVIDUAL BASIS, NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS OR REPRESENTATIVE ACTION OR PROCEEDING, (2) YOU WILL ONLY BE PERMITTED TO SEEK RELIEF (INCLUDING MONETARY, INJUNCTIVE, AND DECLARATORY RELIEF) ON AN INDIVIDUAL BASIS, AND (3) YOU MAY NOT BE ABLE TO HAVE ANY CLAIMS YOU HAVE AGAINST US RESOLVED BY A JURY OR IN A COURT OF LAW.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Access and Use of the Service</h2>

            <h3 className="font-semibold text-gray-900 mb-2">Services Description</h3>
            <p className="mb-4">The Service is designed to allow users to discover, save, organize, and share location-based content and curated lists from social media platforms such as Instagram and TikTok. Lokeet may connect users to content, places, and experiences for the purpose of exploration and sharing.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Your Registration Obligations</h3>
            <p className="mb-4">You may be required to register with Lokeet in order to access and use certain features of the Service. If you choose to register, you agree to provide and maintain true, accurate, current, and complete information about yourself as prompted by the Service&apos;s registration form. Registration data and certain other information about you are governed by our Privacy Policy. If you are under 13 years of age, you are not authorized to use the Service, with or without registering. If you are under 18 years old, you may use the Service only with the approval of your parent or guardian.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Member Account, Password and Security</h3>
            <p className="mb-4">You are responsible for maintaining the confidentiality of your password and account, if any, and are fully responsible for any and all activities that occur under your password or account. You agree to (a) immediately notify Lokeet of any unauthorized use of your password or account or any other breach of security, and (b) ensure that you exit from your account at the end of each session when accessing the Service. Lokeet will not be liable for any loss or damage arising from your failure to comply with this Section.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Modifications to Service</h3>
            <p className="mb-4">Lokeet reserves the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. You agree that Lokeet will not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.</p>

            <h3 className="font-semibold text-gray-900 mb-2">General Practices Regarding Use and Storage</h3>
            <p className="mb-4">You acknowledge that Lokeet may establish general practices and limits concerning use of the Service, including without limitation the maximum period of time that data or other content will be retained by the Service and the maximum storage space that will be allotted on Lokeet&apos;s servers on your behalf. You agree that Lokeet has no responsibility or liability for the deletion or failure to store any data or other content maintained or uploaded by the Service. You acknowledge that Lokeet reserves the right to terminate accounts that are inactive for an extended period of time and to change these general practices and limits at any time, in its sole discretion, with or without notice.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Mobile Services</h3>
            <p>The Service includes certain services that are available via a mobile device, including (i) the ability to upload content to the Service via a mobile device, (ii) the ability to browse the Service and the Site from a mobile device, and (iii) the ability to receive notifications, messages, and updates on your mobile device (collectively, the &ldquo;Mobile Services&rdquo;). To the extent you access the Service through a mobile device, your wireless service carrier&apos;s standard charges, data rates, and other fees may apply. In addition, downloading, installing, or using certain Mobile Services may be prohibited or restricted by your carrier, and not all Mobile Services may work with all carriers or devices.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Conditions of Use</h2>

            <h3 className="font-semibold text-gray-900 mb-2">User Conduct</h3>
            <p className="mb-3">You are solely responsible for all code, video, images, information, data, text, software, music, sound, photographs, graphics, messages, or other materials (&ldquo;content&rdquo;) that you upload, post, publish, or display (hereinafter, &ldquo;upload&rdquo;) or email or otherwise use via the Service. The following are examples of the kind of content and/or use that is illegal or prohibited by Lokeet. Lokeet reserves the right to investigate and take appropriate legal action against anyone who, in Lokeet&apos;s sole discretion, violates this provision, including without limitation, removing the offending content from the Service, suspending or terminating the account of such violators, and reporting you to law enforcement authorities. You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>email, upload, distribute, promote, or otherwise make use of any content that (i) infringes any intellectual property or other proprietary rights of any party; (ii) you do not have a right to upload under any law or under contractual or fiduciary relationships; (iii) contains software viruses or any other computer code designed to interrupt, destroy, or limit the functionality of any computer software or hardware or telecommunications equipment; (iv) poses or creates a privacy or security risk to any person; (v) constitutes unsolicited or unauthorized advertising, promotional materials, &ldquo;junk mail,&rdquo; &ldquo;spam,&rdquo; &ldquo;chain letters,&rdquo; or any other form of solicitation; (vi) constitutes child sex abuse material or otherwise exploits or harms children; (vii) is sexual, adult, erotic, or pornographic content or relates to sexual services; (viii) refers to or incites violence, or relates to weapons or firearms; (ix) is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, pornographic, libelous, invasive of another&apos;s privacy, hateful, racially, ethnically, or otherwise objectionable; or (x) in the sole judgment of Lokeet, is objectionable or restricts or inhibits any other person from using or enjoying the Service;</li>
              <li>interfere with or disrupt the Service or servers or networks connected to the Service;</li>
              <li>violate any applicable local, state, national, or international law;</li>
              <li>impersonate any person or entity, or falsely state or otherwise misrepresent your credentials or your affiliation with a person or entity;</li>
              <li>solicit personal information from anyone under the age of 18;</li>
              <li>harvest or collect email addresses or other contact information of other users from the Service by electronic or other means for the purposes of sending unsolicited emails or other unsolicited communications;</li>
              <li>further or promote any criminal activity or enterprise or provide instructional information about illegal activities; or</li>
              <li>obtain or attempt to access or otherwise obtain any materials or information through any means not intentionally made available or provided for through the Service.</li>
            </ul>
            <p className="mb-4">To the extent permitted by applicable law, Lokeet takes no responsibility and assumes no liability for any content or for any loss or damage resulting therefrom. Your use of the Services is at your own risk. Lokeet reserves the right to remove, screen, or edit any content posted or stored on the Services at any time and without notice, including where such content violates these Terms of Service or applicable law.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Fees</h3>
            <p className="mb-4">To the extent the Service or any portion thereof is made available for any fee, you will be required to provide Lokeet information regarding your credit card or other payment instrument. You represent and warrant to Lokeet that such information is true and that you are authorized to use the payment instrument. If you have registered for the Services via a subscription plan, you expressly acknowledge and agree that (a) Lokeet is authorized to charge your credit card or other payment instrument in accordance with the terms of your subscription plan for as long as your subscription continues, and (b) your subscription is continuous until you cancel it or Lokeet suspends or otherwise stops providing access to the site and/or Services in accordance with these terms. You will promptly update your account information with any changes that may occur. We reserve the right to change Lokeet&apos;s prices. If Lokeet does change prices, Lokeet will provide notice of the change on the Site or in email to you at least 30 days before the change is to take effect. Your continued use of the Service after the price change becomes effective constitutes your agreement to pay the changed amount. You shall be responsible for all taxes associated with the Services other than taxes based on Lokeet&apos;s net income.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Commercial Use</h3>
            <p className="mb-4">Unless otherwise expressly authorized herein or in the Service, you agree not to display, distribute, license, perform, publish, reproduce, duplicate, copy, create derivative works from, modify, sell, resell, exploit, transfer, or upload for any commercial purposes any portion of the Service, use of the Service, or access to the Service.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Third Party Tools</h3>
            <p className="mb-4">The Services may contain certain features or integrations leveraging third-party websites, services, or technologies (&ldquo;Third Party Tools&rdquo;). These Third Party Tools may have their own terms that govern your use or access rather than or in addition to these Terms. We are not responsible for the practices or the content of any Third Party Tools. By using the Services, you accept and agree to abide by any such additional terms and conditions associated with your use of or access to Third Party Tools.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Artificial Intelligence</h3>
            <p className="mb-3">Portions of the Services may use artificial intelligence (&ldquo;AI&rdquo;) tools and other technology (the &ldquo;AI Tools&rdquo;). Certain of those tools may allow you to generate text, audio, video, and other content (&ldquo;Output&rdquo;) in response to prompts and other information or input (&ldquo;Input&rdquo;). You acknowledge that your use of AI Tools may involve access to your Inputs and Outputs by relevant third-party tool providers. You understand that Outputs may not be unique, and it is possible that AI Tools may generate the same or similar Output for other users if the Inputs are similar.</p>
            <p className="mb-3">You acknowledge that AI is rapidly evolving and our AI Tools may provide results or produce Output that is inaccurate, unreliable, inappropriate, or otherwise unsuitable.</p>
            <p>You agree not to use AI Tools, AI Tool results, or Output in a manner that may infringe upon or violate the rights of any third party or violate any applicable laws, rules, or regulations. You are solely responsible for evaluating the accuracy, appropriateness, legality, and suitability of any AI Tool result or Output before using it, and you assume all risk associated with your use of AI Tools.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Third Party Distribution Channels</h2>
            <p>Lokeet may offer software applications that are made available through third-party distribution channels (&ldquo;Distribution Channels&rdquo;). If you obtain such software through a Distribution Channel, you may be subject to additional terms of the Distribution Channel. These Terms of Service are between you and us only, and not with the Distribution Channel. To the extent that you utilize any other third-party products and services in connection with your use of our Services, you agree to comply with all applicable terms of any agreement for such third-party products and services.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Intellectual Property Rights</h2>

            <h3 className="font-semibold text-gray-900 mb-2">Service Content, Software and Trademarks</h3>
            <p className="mb-4">You acknowledge and agree that the Service may contain content or features (&ldquo;Service Content&rdquo;) that are protected by copyright, patent, trademark, trade secret, or other proprietary rights and laws. Except as expressly authorized by Lokeet, you agree not to modify, copy, frame, scrape, rent, lease, loan, sell, distribute, or create derivative works based on the Service or the Service Content, in whole or in part. In connection with your use of the Service, you will not engage in or use any data mining, robots, scraping, or similar data gathering or extraction methods. The technology and software underlying the Service or distributed in connection therewith are the property of Lokeet, our affiliates, and our partners (the &ldquo;Software&rdquo;). You agree not to copy, modify, create a derivative work of, reverse engineer, reverse assemble, or otherwise attempt to discover any source code, sell, assign, sublicense, or otherwise transfer any right in the Software. Any rights not expressly granted herein are reserved by Lokeet.</p>
            <p className="mb-4">The Lokeet name and logos are trademarks and service marks of Lokeet (collectively the &ldquo;Lokeet Trademarks&rdquo;). Nothing in these Terms of Service should be construed as granting, by implication, estoppel, or otherwise, any license or right to use any of the Lokeet Trademarks without our prior written permission in each instance. All goodwill generated from the use of Lokeet Trademarks will inure to our exclusive benefit.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Third Party Material</h3>
            <p className="mb-4">Under no circumstances will Lokeet be liable in any way for any content or materials of any third parties (including users), including, but not limited to, for any errors or omissions in any content, or for any loss or damage of any kind incurred as a result of the use of any such content. You acknowledge that Lokeet does not pre-screen content, but that Lokeet and its designees will have the right (but not the obligation) in their sole discretion to refuse or remove any content that is available via the Service.</p>

            <h3 className="font-semibold text-gray-900 mb-2">User Content Transmitted Through the Service</h3>
            <p className="mb-4">With respect to the content or other materials you upload or otherwise make available through the Service (collectively, &ldquo;User Content&rdquo;), you represent and warrant that you own all right, title, and interest in and to such User Content, including, without limitation, all copyrights and rights of publicity contained therein, and are authorized to grant Lokeet access to the User Content. You hereby grant and will grant Lokeet and its affiliated companies a nonexclusive, worldwide, royalty-free, fully paid-up, transferable, sublicensable, perpetual, irrevocable license to copy, display, upload, perform, distribute, store, modify, and otherwise use your User Content in connection with the operation of or improvements to the Service in any form, medium, or technology now known or later developed.</p>
            <p className="mb-4">You acknowledge and agree that any questions, comments, suggestions, ideas, feedback, or other information about the Service (&ldquo;Submissions&rdquo;) provided by you to Lokeet are non-confidential and Lokeet will be entitled to the unrestricted use and dissemination of these Submissions for any purpose, commercial or otherwise, without acknowledgment or compensation to you.</p>
            <p className="mb-4">You acknowledge and agree that Lokeet may preserve content and may also disclose content if required to do so by law or in the good faith belief that such preservation or disclosure is reasonably necessary to: (a) comply with legal process, applicable laws, or government requests; (b) enforce these Terms of Service; (c) respond to claims that any content violates the rights of third parties; or (d) protect the rights, property, or personal safety of Lokeet, its users, and the public.</p>

            <h3 className="font-semibold text-gray-900 mb-2">Copyright Complaints</h3>
            <p className="mb-3">Lokeet respects the intellectual property of others, and we ask our users to do the same. If you believe that your work has been copied in a way that constitutes copyright infringement, you should notify Lokeet of your infringement claim by emailing <a href="mailto:info@lokeet.com" className="text-[#42a746] hover:underline">info@lokeet.com</a> with the subject line &ldquo;DMCA Takedown Request&rdquo;. To be effective, the notification must be in writing and contain the following information:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>an electronic or physical signature of the person authorized to act on behalf of the owner of the copyright or other intellectual property interest;</li>
              <li>a description of the copyrighted work or other intellectual property that you claim has been infringed;</li>
              <li>a description of where the material that you claim is infringing is located on the Service;</li>
              <li>your address, telephone number, and email address;</li>
              <li>a statement by you that you have a good faith belief that the disputed use is not authorized by the copyright or intellectual property owner, its agent, or the law;</li>
              <li>a statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright or intellectual property owner or authorized to act on the copyright or intellectual property owner&apos;s behalf.</li>
            </ul>
            <p className="mb-4"><strong>Repeat Infringer Policy:</strong> In accordance with the DMCA and other applicable law, Lokeet has adopted a policy of terminating, in appropriate circumstances and at Lokeet&apos;s sole discretion, users who are deemed to be repeat infringers.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Third Party Websites</h2>
            <p>The Service may provide, or third parties may provide, links or other access to other sites and resources on the Internet. Lokeet has no control over such sites and resources and is not responsible for and does not endorse such sites and resources. You further acknowledge and agree that Lokeet will not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any content, events, goods, or services available on or through any such site or resource. Any dealings you have with third parties found while using the Service are between you and the third party, and you agree that Lokeet is not liable for any loss or claim that you may have against any such third party.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Social Networking Services</h2>
            <p className="mb-3">You may enable or log in to the Service via various online third-party services, such as social media and social networking services (&ldquo;Social Networking Services&rdquo;). By logging in or directly integrating these Social Networking Services into the Service, we make your online experiences richer and more personalized. As part of such integration, the Social Networking Services will provide us with access to certain information that you have provided to such Social Networking Services, and we will use, store, and disclose such information in accordance with our <Link href="/legal/privacy-policy" className="text-[#42a746] hover:underline">Privacy Policy</Link>.</p>
            <p>The manner in which Social Networking Services use, store, and disclose your information is governed solely by the policies of such third parties, and Lokeet shall have no liability or responsibility for the privacy practices or other actions of any third-party site or service that may be enabled within the Service. Lokeet is not responsible for the accuracy, availability, or reliability of any information, content, goods, data, opinions, advice, or statements made available in connection with Social Networking Services.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Indemnity and Release</h2>
            <p>You agree to release, indemnify, and hold Lokeet and its affiliates and their officers, employees, directors, and agents (collectively, &ldquo;Indemnitees&rdquo;) harmless from any and all losses, damages, expenses, including reasonable attorneys&apos; fees, rights, claims, actions of any kind, and injury (including death) arising out of or relating to your use of the Service, any User Content, your connection to the Service, your violation of these Terms of Service, or your violation of any rights of another. Notwithstanding the foregoing, you will have no obligation to indemnify or hold harmless any Indemnitee from or against any liability, losses, damages, or expenses incurred as a result of any action or inaction of such Indemnitee. If you are a California resident, you waive California Civil Code Section 1542, which says: &ldquo;A general release does not extend to claims that the creditor or releasing party does not know or suspect to exist in his or her favor at the time of executing the release and that, if known by him or her, would have materially affected his or her settlement with the debtor or released party.&rdquo; If you are a resident of another jurisdiction, you waive any comparable statute or doctrine to the fullest extent permitted by applicable law.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Disclaimer of Warranties</h2>
            <p className="font-semibold">YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS. LOKEET EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED OR STATUTORY, INCLUDING, BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE AND NON-INFRINGEMENT.</p>
            <br />
            <p className="font-semibold">LOKEET MAKES NO WARRANTY THAT (I) THE SERVICE WILL MEET YOUR REQUIREMENTS, (II) THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, (III) THE RESULTS THAT MAY BE OBTAINED FROM THE USE OF THE SERVICE WILL BE ACCURATE OR RELIABLE, OR (IV) THE QUALITY OF ANY PRODUCTS, SERVICES, INFORMATION, OR OTHER MATERIAL PURCHASED OR OBTAINED BY YOU THROUGH THE SERVICE WILL MEET YOUR EXPECTATIONS.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p className="font-semibold">YOU EXPRESSLY UNDERSTAND AND AGREE THAT LOKEET WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY DAMAGES, OR DAMAGES FOR LOSS OF PROFITS INCLUDING BUT NOT LIMITED TO, DAMAGES FOR LOSS OF GOODWILL, USE, DATA OR OTHER INTANGIBLE LOSSES (EVEN IF LOKEET HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), WHETHER BASED ON CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY OR OTHERWISE, RESULTING FROM: (I) THE USE OR THE INABILITY TO USE THE SERVICE; (II) THE COST OF PROCUREMENT OF SUBSTITUTE GOODS AND SERVICES RESULTING FROM ANY GOODS, DATA, INFORMATION OR SERVICES PURCHASED OR OBTAINED OR MESSAGES RECEIVED OR TRANSACTIONS ENTERED INTO THROUGH OR FROM THE SERVICE; (III) UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR DATA; (IV) STATEMENTS OR CONDUCT OF ANY THIRD PARTIES ON THE SERVICE; OR (V) ANY OTHER MATTER RELATING TO THE SERVICE. IN NO EVENT WILL LOKEET&apos;S TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES OR CAUSES OF ACTION EXCEED THE AMOUNT YOU HAVE PAID LOKEET IN THE LAST SIX (6) MONTHS, OR, IF GREATER, ONE HUNDRED DOLLARS ($100).</p>
            <br />
            <p className="font-semibold">SOME JURISDICTIONS DO NOT ALLOW THE DISCLAIMER OR EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. ACCORDINGLY, SOME OF THE ABOVE LIMITATIONS SET FORTH ABOVE MAY NOT APPLY TO YOU. IF YOU ARE DISSATISFIED WITH ANY PORTION OF THE SERVICE OR WITH THESE TERMS OF SERVICE, YOUR SOLE AND EXCLUSIVE REMEDY IS TO DISCONTINUE USE OF THE SERVICE.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Dispute Resolution By Binding Arbitration</h2>
            <p className="font-semibold mb-3">PLEASE READ THIS SECTION CAREFULLY BECAUSE IT REQUIRES YOU AND LOKEET TO ARBITRATE CERTAIN DISPUTES AND CLAIMS AND LIMITS THE MANNER IN WHICH WE CAN SEEK RELIEF FROM EACH OTHER. ARBITRATION PRECLUDES YOU AND LOKEET FROM SUING IN COURT OR HAVING A JURY TRIAL. YOU AND LOKEET AGREE THAT ARBITRATION WILL BE SOLELY ON AN INDIVIDUAL BASIS AND NOT AS A CLASS ARBITRATION, CLASS ACTION, OR ANY OTHER KIND OF REPRESENTATIVE PROCEEDING. LOKEET AND YOU ARE EACH WAIVING THE RIGHT TO TRIAL BY A JURY.</p>

            <p className="mb-3">(a) For any dispute or claim arising from, relating to, or stemming from these Terms, our Services, or any aspect of the relationship between you and Lokeet (collectively, &ldquo;Claims&rdquo;), you and Lokeet agree to attempt to first resolve the Claim informally. If you assert a Claim against Lokeet, you will first contact Lokeet by sending a written notice of your Claim to <a href="mailto:info@lokeet.com" className="text-[#42a746] hover:underline">info@lokeet.com</a>. The notice must (i) include your name, email address, and telephone number; (ii) describe the nature and basis of the Claim; and (iii) set forth the specific relief sought. If you and Lokeet cannot reach an agreement to resolve the Claim within thirty (30) days after notice is received, then either party may submit the Claim to binding arbitration as set forth below.</p>

            <p className="mb-3">(b) Except for individual disputes that qualify for small claims court and any disputes exclusively related to intellectual property rights, all Claims that are not resolved informally will be resolved by a neutral arbitrator through final and binding arbitration instead of in a court by a judge or jury. The arbitrator will have the authority to grant any remedy or relief that would otherwise be available in court.</p>

            <p className="mb-3">(c) These Terms affect interstate commerce, and the enforceability of this Section 10 will be substantively and procedurally governed by the Federal Arbitration Act, 9 U.S.C. § 1, et seq., to the extent permitted by law.</p>

            <p className="mb-3">(d) YOU AND LOKEET AGREE THAT ANY ARBITRATION UNDER THESE TERMS WILL TAKE PLACE ON AN INDIVIDUAL BASIS; CLASS ARBITRATIONS AND CLASS ACTIONS ARE NOT PERMITTED. All Claims must be submitted to the American Arbitration Association (&ldquo;AAA&rdquo;) and will be resolved through binding arbitration before one arbitrator. The then-current version of the AAA&apos;s Consumer Arbitration Rules will apply for consumers (meaning those who use the Services for personal, family, or household purposes), and the AAA&apos;s Commercial Arbitration Rules will apply for all other users.</p>

            <p className="mb-3">(e) To the extent permitted by law, any Claim must be filed within one year after such Claim arises; otherwise, the Claim is permanently barred.</p>

            <p className="mb-3">(f) You have the right to opt out of binding arbitration within 30 days of the date you first accepted these Terms by providing us with notice of your decision to opt out via email at <a href="mailto:info@lokeet.com" className="text-[#42a746] hover:underline">info@lokeet.com</a>. The opt-out notice must include your full name, mailing address, and email address, and clearly indicate your intent to opt out of binding arbitration.</p>

            <p>(g) If any portion of this Section 10 is found to be unenforceable or unlawful for any reason, the unenforceable or unlawful provision will be severed from these Terms, and the remainder of this Section 10 will remain in full force and effect.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Termination</h2>
            <p className="mb-3">You agree that Lokeet, in its sole discretion, may suspend or terminate your account (or any part thereof) or use of the Service and remove and discard any content within the Service, for any reason, including, without limitation, for lack of use or if Lokeet believes that you have violated or acted inconsistently with the letter or spirit of these Terms of Service. Any suspected fraudulent, abusive, or illegal activity that may be grounds for termination of your use of Service may be referred to appropriate law enforcement authorities. Lokeet may also in its sole discretion and at any time discontinue providing the Service, or any part thereof, with or without notice.</p>
            <p>You agree that any termination of your access to the Service under any provision of this Terms of Service may be effected without prior notice, and acknowledge and agree that Lokeet may immediately deactivate or delete your account and all related information and files in your account and/or bar any further access to such files or the Service. Lokeet will not be liable to you or any third party for any termination of your access to the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">12. User Disputes</h2>
            <p>You agree that you are solely responsible for your interactions with any other user in connection with the Service and Lokeet will have no liability or responsibility with respect thereto. Lokeet reserves the right, but has no obligation, to become involved in any way with disputes between you and any other user of the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">13. General</h2>
            <p className="mb-3">These Terms of Service constitute the entire agreement between you and Lokeet and govern your use of the Service, superseding any prior agreements between you and Lokeet with respect to the Service. You also may be subject to additional terms and conditions that may apply when you use affiliate or third-party services, third-party content, or third-party software.</p>
            <p className="mb-3">These Terms of Service will be governed by the laws of the State of California without regard to its conflict of law provisions. With respect to any disputes or claims not subject to arbitration, as set forth above, you and Lokeet agree to submit to the personal and exclusive jurisdiction of the state and federal courts located within San Francisco County, California.</p>
            <p className="mb-3">The failure of Lokeet to exercise or enforce any right or provision of these Terms of Service will not constitute a waiver of such right or provision. If any provision of these Terms of Service is found by a court of competent jurisdiction to be invalid, the parties nevertheless agree that the court should endeavor to give effect to the parties&apos; intentions as reflected in the provision, and the other provisions of these Terms of Service remain in full force and effect.</p>
            <p className="mb-3">You agree that any claim or cause of action arising out of or related to use of the Service or these Terms of Service must be filed within one (1) year after such claim or cause of action arose or be forever barred.</p>
            <p>You may not assign these Terms of Service without the prior written consent of Lokeet, but Lokeet may assign or transfer these Terms of Service, in whole or in part, without restriction. Notices to you may be made via either email or regular mail.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">14. Beta Terms</h2>
            <p className="mb-3">We may occasionally provide features or services designated as beta, trial, preview, or the like (&ldquo;Beta Services&rdquo;). We grant certain users a non-exclusive, revocable, non-transferable license to use the Beta Services in exchange for their active participation in testing and evaluating the Beta Services, including providing feedback as requested by Lokeet.</p>
            <p className="font-semibold">YOU ACKNOWLEDGE THAT THE BETA SERVICES MAY NOT HAVE BEEN FULLY TESTED, MAY NOT BE READY FOR GENERAL COMMERCIAL RELEASE, AND MAY CONTAIN BUGS, ERRORS AND DEFECTS. ACCORDINGLY, THE BETA SERVICES ARE PROVIDED &ldquo;AS IS,&rdquo; WITH ALL FAULTS, DEFECTS AND ERRORS, AND LOKEET WILL HAVE NO LIABILITY OF ANY KIND FOR ANY ERROR, OMISSION OR DEFECT IN THE BETA SERVICES OR ANY HARM OR DAMAGE ARISING FROM YOUR USE OF THE BETA SERVICES.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">15. Your Privacy</h2>
            <p>At Lokeet, we respect the privacy of our users. For details please see our <Link href="/legal/privacy-policy" className="text-[#42a746] hover:underline">Privacy Policy</Link>. By using the Service, you consent to our collection and use of personal data as outlined therein.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">16. Notice for California Users</h2>
            <p>Under California Civil Code Section 1789.3, users of the Service from California are entitled to the following specific consumer rights notice: The Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs may be contacted in writing at 1625 North Market Blvd., Suite N 112, Sacramento, CA 95834, or by telephone at (916) 445-1254 or (800) 952-5210.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">17. Notice for Australian Users</h2>
            <p className="mb-3">If you are located in Australia, or if you acquire the Services as a &ldquo;consumer&rdquo; or &ldquo;small business&rdquo; within the meaning of the Australian Consumer Law (&ldquo;ACL&rdquo;), this section applies to you. Under the ACL, users may have certain rights which cannot be excluded, including guarantees as to the acceptable quality and fitness for purpose of goods and services. Nothing in these terms is to be read or applied so as to exclude, restrict, or modify any condition, warranty, guarantee, right, or remedy implied by law (including the ACL) and which by law cannot be excluded, restricted, or modified.</p>
            <p>We will provide reasonable notice of any material change to these Terms of Service that adversely affects your rights or use of the Services. If you do not agree to a material change, you may stop using the Services and, if you have a paid subscription, cancel effective as of the end of your then-current billing period.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">18. Notice for United Kingdom Users</h2>
            <p className="mb-3">If you are a consumer habitually resident in the United Kingdom, this section applies to you. If you purchase a paid subscription, you may have a legal right to cancel within 14 days of purchase (the &ldquo;cooling-off period&rdquo;), subject to the exceptions in the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013.</p>
            <p className="mb-3">Nothing in these Terms of Service limits or excludes any rights you have under the Consumer Rights Act 2015 or other applicable UK consumer laws. In particular, we do not exclude or limit our liability for (a) death or personal injury caused by our negligence; (b) fraud or fraudulent misrepresentation; or (c) any other liability which cannot be limited or excluded under applicable law.</p>
            <p>These Terms are governed by the laws of England and Wales for UK users, and you may bring legal proceedings in respect of the Services in the courts of England and Wales.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">19. Questions? Concerns? Suggestions?</h2>
            <p>Please contact us at <a href="mailto:info@lokeet.com" className="text-[#42a746] hover:underline">info@lokeet.com</a> to report any violations of these Terms of Service or to pose any questions regarding this Terms of Service or the Service.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
