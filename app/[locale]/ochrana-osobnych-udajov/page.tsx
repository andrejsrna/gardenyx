import { Metadata } from 'next';

type LocaleContent = {
  metadataTitle: string;
  metadataDescription: string;
  title: string;
  subtitle: string;
  effectiveDate: string;
  body: string;
};

const contentByLocale: Record<string, LocaleContent> = {
  sk: {
    metadataTitle: 'Ochrana osobných údajov | GardenYX',
    metadataDescription:
      'Zásady ochrany osobných údajov GardenYX pre mobilnú aplikáciu vrátane rozsahu spracúvania údajov a vašich práv.',
    title: 'Zásady ochrany osobných údajov',
    subtitle: 'Mobilná aplikácia GardenYX',
    effectiveDate: 'Dátum účinnosti: 6. marca 2026',
    body: `
<h2>1. Úvod</h2>
<p>Tieto Zásady ochrany osobných údajov popisujú, ako spoločnosť JOINA Garden, s. r. o., so sídlom Karpatské námestie 7770/10A, Bratislava – mestská časť Rača 831 06, Slovenská republika, IČO: 57 313 504 („my", „nás", „naša", „Spoločnosť"), zhromažduje, používa, uchováva a chráni vaše osobné údaje pri používaní mobilnej aplikácie GardenYX („Aplikácia") dostupnej na iOS, Android a ako progresívna webová aplikácia.</p>
<p>Zaväzujeme sa chrániť vaše súkromie v súlade so všeobecným nariadením o ochrane údajov (EÚ) 2016/679 („GDPR") a príslušnou slovenskou legislatívou o ochrane osobných údajov. Používaním Aplikácie potvrdzujete, že ste si prečítali a porozumeli týmto Zásadám.</p>
<h2>2. Prevádzkovateľ</h2>
<p>Spoločnosť: JOINA Garden, s. r. o.<br/>Adresa: Karpatské námestie 7770/10A, Bratislava – mestská časť Rača 831 06, Slovenská republika<br/>IČO: 57 313 504<br/>E-mail: privacy@gardenyx.eu</p>
<h2>3. Osobné údaje, ktoré zhromažďujeme</h2>
<h2>3.1 Údaje o účte</h2>
<p>Pri vytváraní účtu zhromažďujeme:</p>
<ul><li>E-mailovú adresu (potrebnú na overenie a autentifikáciu)</li><li>Zobrazované meno alebo používateľské meno (pre váš profil)</li><li>URL profilovej fotky (voliteľné)</li><li>Jedinečný identifikátor používateľa generovaný Firebase Authentication</li><li>Časové pečiatky vytvorenia a aktualizácie účtu</li></ul>
<h2>3.2 Autentifikačné údaje</h2>
<p>Môžete sa prihlásiť pomocou jednej z nasledujúcich metód:</p>
<ul><li>E-mail a heslo (cez Firebase Authentication)</li><li>Prihlásenie cez Google (Google OAuth)</li><li>Prihlásenie cez Apple (Apple OAuth)</li><li>Anonymné prihlásenie (dočasný účet na skúšobné použitie)</li></ul>
<h2>3.3 Údaje o rastlinách</h2>
<p>Pri používaní Aplikácie na správu rastlín zhromažďujeme:</p>
<ul><li>Názvy rastlín (bežné a vedecké), taxonómiu, typ rastliny</li><li>Fotografie rastlín, ktoré nasnímate alebo nahrajete</li><li>Informácie o umiestnení rastliny alebo miestnosti</li><li>Poznámky, vek a históriu starostlivosti (dátumy zalévania, harmonogramy)</li><li>Preferencie starostlivosti (svetelné požiadavky, odvodnenie kvetináča, presádzanie)</li><li>Nastavenia notifikácií pre jednotlivé rastliny</li></ul>
<h2>3.4 Údaje o používaní a analytika</h2>
<p>Automaticky zhromažďujeme určité údaje o používaní Aplikácie:</p>
<ul><li>Zobrazenia obrazoviek (cez Firebase Analytics)</li><li>História a výsledky diagnóz zdravia rastlín</li><li>Pokusy o identifikáciu rastlín a výsledky</li><li>Záznamy o splnených úlohách starostlivosti</li><li>Konverzácie s AI asistentom (história chatu)</li><li>Údaje o udalostiach v kalendári (zalévanie, hnojenie, presádzanie)</li></ul>
<h2>3.5 Informácie o zariadení</h2>
<ul><li>Model zariadenia a verzia operačného systému</li><li>Verzia a číslo zostavy Aplikácie</li><li>Token Firebase Cloud Messaging (FCM) pre push notifikácie</li></ul>
<h2>3.6 Údaje z kamery a médií</h2>
<p>S vaším súhlasom pristúpime k:</p>
<ul><li>Fotografiám rastlín nasnímaným kamerou zariadenia</li><li>Obrázkom vybraným z vašej fotogalérie</li><li>Metadátam fotografií (rozmery, veľkosť súboru)</li><li>Obrázkom pre diagnózu zdravia</li></ul>
<h2>3.7 Údaje o predplatnom</h2>
<ul><li>Stav predplatného a aktívne oprávnenia</li><li>Dátumy aktívneho predplatného</li></ul>
<p>Platobné údaje spracováva výlučne RevenueCat, Apple App Store alebo Google Play. Vaše údaje o platobnej karte neukladáme.</p>
<h2>4. Ako používame vaše údaje</h2>
<p>Vaše osobné údaje spracovávame na nasledujúce účely:</p>
<ul><li><strong>Správa účtu:</strong> na vytvorenie, údržbu a zabezpečenie vášho účtu</li><li><strong>Starostlivosť o rastliny:</strong> na sledovanie rastlín, pripomienky starostlivosti, AI identifikáciu, diagnózu zdravia a personalizované odporúčania</li><li><strong>AI funkcie:</strong> na prevádzku AI chatbota (RastoAI), identifikácie rastlín (Plant.id API), obohacovanie informácií o rastlinách a diagnózu zdravia. Tieto AI funkcie sú čiastočne zabezpečené službou Google Gemini (Google LLC)</li><li><strong>Notifikácie:</strong> na zasielanie push notifikácií o zalévaní, hnojení a presádzaní</li><li><strong>Analytika a zlepšovanie:</strong> na pochopenie používania Aplikácie a zlepšenie služieb (Firebase Analytics)</li><li><strong>Hlásenie chýb:</strong> na identifikáciu a opravu technických problémov (Firebase Crashlytics)</li><li><strong>Správa predplatného:</strong> na správu stavu predplatného a prémiových funkcií (RevenueCat)</li></ul>
<h2>4.1 Právny základ spracovania</h2>
<ul><li><strong>Plnenie zmluvy</strong> (čl. 6 ods. 1 písm. b)): spracovanie nevyhnutné na poskytovanie služieb Aplikácie</li><li><strong>Súhlas</strong> (čl. 6 ods. 1 písm. a)): pre voliteľné funkcie ako prístup ku kamere, fotogalérii a push notifikácie. Súhlas môžete kedykoľvek odvolať v nastaveniach zariadenia.</li><li><strong>Oprávnené záujmy</strong> (čl. 6 ods. 1 písm. f)): pre analytiku, hlásenie chýb a zlepšovanie služieb</li></ul>
<h2>5. Služby tretích strán a zdieľanie údajov</h2>
<h2>5.1 Firebase (Google LLC)</h2>
<ul><li>Firebase Authentication – registrácia, prihlásenie, správa relácií</li><li>Cloud Firestore – ukladanie profilových údajov</li><li>Firebase Storage – ukladanie fotografií rastlín a diagnóz</li><li>Firebase Cloud Messaging – push notifikácie</li><li>Firebase Analytics – analytika používania</li><li>Firebase Crashlytics – hlásenie chýb</li></ul>
<h2>5.2 Poskytovatelia platieb a predplatného</h2>
<ul><li>RevenueCat – správa predplatného</li><li>Apple App Store – spracovanie platieb na iOS</li><li>Google Play Billing – spracovanie platieb na Androide</li></ul>
<h2>5.3 Služby identifikácie rastlín</h2>
<ul><li>Plant.id API – identifikácia rastlín z obrázkov</li><li>Perenual API – databáza informácií o rastlinách</li></ul>
<h2>5.4 AI služby</h2>
<p><strong>Google Gemini API (Google LLC)</strong> – identifikácia rastlín, diagnóza zdravia rastlín, odporúčania starostlivosti a obohacovanie informácií o rastlinách. Pri používaní týchto funkcií sa vaše fotografie rastlín a sprievodné textové vstupy odosielajú do rozhrania Google Gemini API prostredníctvom nášho backendu na analýzu. V rámci týchto požiadaviek sa neodosielajú žiadne osobné identifikačné údaje. Všetky údaje sú prenášané bezpečne cez HTTPS. <a href="https://policies.google.com/privacy" class="underline">Zásady ochrany osobných údajov Google</a></p>
<p><strong>RastoAI (vlastný backend)</strong> – AI chatbot pre starostlivosť o rastliny.</p>
<p>Vaše osobné údaje nepredávame žiadnej tretej strane.</p>
<h2>6. Medzinárodné prenosy údajov</h2>
<p>Niektorí naši poskytovatelia služieb (najmä Firebase/Google a RevenueCat) pôsobia globálne. Vaše údaje môžu byť prenesené a spracované v krajinách mimo Európskeho hospodárskeho priestoru (EHP). V takýchto prípadoch zabezpečujeme primerané záruky vrátane štandardných zmluvných doložiek schválených Európskou komisiou.</p>
<h2>7. Uchovávanie a bezpečnosť údajov</h2>
<h2>7.1 Lokálne uložisko</h2>
<ul><li>SQLite databáza pre údaje o rastlinách, harmonogramy starostlivosti a históriu zalévania</li><li>Zdieľané preferencie pre nastavenia (téma, jazyk, veľkosť textu)</li><li>Šifrované citlivé údaje cez Flutter Secure Storage</li><li>Súborové cookies pre správu relácií</li></ul>
<h2>7.2 Cloudové úložisko</h2>
<ul><li>Cloud Firestore – používateľské profily</li><li>Firebase Storage – fotografie rastlín a diagnóz</li><li>Dakoty backend server – rastliny, záhrady, harmonogramy, pripomienky, účty, história chatu, diagnózy, notifikácie a FCM tokeny</li></ul>
<h2>7.3 Bezpečnostné opatrenia</h2>
<p>Implementujeme primerané technické a organizačné opatrenia na ochranu vašich údajov vrátane šifrovania hesiel, šifrovaného uložiska pre citlivé údaje a HTTPS pre všetku sieťovú komunikáciu.</p>
<h2>8. Doba uchovávania údajov</h2>
<p>Vaše osobné údaje uchovávame počas trvania vášho účtu. Po vymazaní účtu vaše údaje vymažeme alebo anonymizujeme do 30 dní, pokiaľ nám zákon neukladá povinnosť uchovávať určité údaje dlhšie. Anonymné účty sa automaticky vymažú pri registrácii plnohodnotného účtu.</p>
<h2>9. Súbory cookies a sledovacie technológie</h2>
<p>Aplikácia používa súborové cookies ukladané lokálne na vašom zariadení na správu relácií. Firebase Analytics a Firebase Crashlytics sú prevádzkované spoločnosťou Google a podliehajú zásadám ochrany súkromia spoločnosti Google.</p>
<h2>10. Vaše práva podľa GDPR</h2>
<ul><li><strong>Právo na prístup</strong> (čl. 15): získať potvrdenie o spracovaní vašich údajov a získať kópiu</li><li><strong>Právo na opravu</strong> (čl. 16): nechať opraviť nesprávne údaje</li><li><strong>Právo na vymazanie</strong> (čl. 17): požiadať o vymazanie vašich osobných údajov</li><li><strong>Právo na obmedzenie</strong> (čl. 18): obmedziť spracovanie vašich údajov za určitých okolností</li><li><strong>Právo na prenositeľnosť</strong> (čl. 20): získať vaše údaje v štruktúrovanom, strojovo čitateľnom formáte</li><li><strong>Právo namietať</strong> (čl. 21): namietať proti spracovaniu na základe oprávnených záujmov</li><li><strong>Právo odvolať súhlas:</strong> môžete ho kedykoľvek odvolať bez toho, aby to ovplyvnilo zákonnosť predchádzajúceho spracovania</li></ul>
<p>Na uplatnenie týchto práv nás kontaktujte na <a href="mailto:privacy@gardenyx.eu" class="underline">privacy@gardenyx.eu</a>. Odpovieme do 30 dní. Máte tiež právo podať sťažnosť na Úrad na ochranu osobných údajov Slovenskej republiky.</p>
<h2>11. Vymazanie účtu</h2>
<p>Účet môžete kedykoľvek vymazať cez sekciu Nastavenia v Aplikácii. Po vymazaní sa odstránia váš Firebase účet, backend profil, všetky záznamy o rastlinách a FCM token. Niektoré údaje môžu pretrvávať v zálohách po obmedzenú dobu.</p>
<h2>12. Súkromie detí</h2>
<p>Aplikácia nie je určená pre deti mladšie ako 16 rokov. Vedome nezhromažďujeme osobné údaje od detí mladších ako 16 rokov. Ak zistíte, že nám dieťa poskytlo osobné údaje, kontaktujte nás na <a href="mailto:privacy@gardenyx.eu" class="underline">privacy@gardenyx.eu</a>.</p>
<h2>13. Oprávnenia zariadenia</h2>
<ul><li><strong>Kamera:</strong> na fotenie rastlín pre identifikáciu a diagnózu zdravia</li><li><strong>Fotogaléria (čítanie):</strong> na výber existujúcich obrázkov rastlín</li><li><strong>Fotogaléria (zápis):</strong> na ukladanie obrázkov do zariadenia</li><li><strong>Notifikácie:</strong> na zasielanie pripomienok starostlivosti</li></ul>
<p>Všetky oprávnenia sú voliteľné a môžete ich kedykoľvek spravovať v nastaveniach zariadenia.</p>
<h2>14. Automatizované rozhodovanie a AI</h2>
<p>Aplikácia používa umelú inteligenciu na identifikáciu rastlín, diagnózu zdravia a odporúčania starostlivosti. AI funkcie sú zabezpečené službami tretích strán vrátane Google Gemini (Google LLC). Majú poradenský charakter a nemajú právne ani podobne významné účinky na vás.</p>
<h2>15. Zmeny týchto zásad</h2>
<p>Tieto Zásady môžeme priebežne aktualizovať. O podstatných zmenách vás budeme informovať zverejnením aktualizovaných zásad v Aplikácii. „Dátum účinnosti" na začiatku tohto dokumentu uvádza, kedy nadobudla účinnosť najnovšia verzia.</p>
<h2>16. Kontaktujte nás</h2>
<p>JOINA Garden, s. r. o.<br/>Karpatské námestie 7770/10A<br/>Bratislava – mestská časť Rača 831 06, Slovenská republika<br/>E-mail: <a href="mailto:privacy@gardenyx.eu" class="underline">privacy@gardenyx.eu</a></p>
    `,
  },
  en: {
    metadataTitle: 'Privacy Policy | GardenYX',
    metadataDescription:
      'GardenYX privacy policy for the mobile app, including data processing details and your rights.',
    title: 'Privacy Policy',
    subtitle: 'GardenYX Mobile Application',
    effectiveDate: 'Effective Date: March 6, 2026',
    body: `
<h2>1. Introduction</h2>
<p>This Privacy Policy describes how JOINA Garden, s. r. o., with its registered office at Karpatské námestie 7770/10A, Bratislava – mestská časť Rača 831 06, Slovak Republic, IČO: 57 313 504 ("we", "us", "our", "Company"), collects, uses, stores, and protects your personal data when you use the GardenYX mobile application ("App") available on iOS, Android, and as a progressive web application.</p>
<p>We are committed to protecting your privacy in accordance with the General Data Protection Regulation (EU) 2016/679 ("GDPR") and applicable Slovak data protection legislation. By using the App, you acknowledge that you have read and understood this Privacy Policy.</p>
<h2>2. Data Controller</h2>
<p>Company: JOINA Garden, s. r. o.<br/>Address: Karpatské námestie 7770/10A, Bratislava – mestská časť Rača 831 06, Slovak Republic<br/>IČO: 57 313 504<br/>Email: <a href="mailto:privacy@gardenyx.eu" class="underline">privacy@gardenyx.eu</a></p>
<h2>3. Personal Data We Collect</h2>
<h2>3.1 Account Information</h2>
<p>When you create an account, we collect:</p>
<ul><li>Email address (required for authentication and account verification)</li><li>Display name or username (required for your user profile)</li><li>Profile photo URL (optional, for profile display)</li><li>A unique user identifier generated by Firebase Authentication</li><li>Account creation and update timestamps</li></ul>
<h2>3.2 Authentication Data</h2>
<p>You may sign in using one of the following methods:</p>
<ul><li>Email and password (via Firebase Authentication)</li><li>Google Sign-In (via Google OAuth)</li><li>Sign in with Apple (via Apple OAuth)</li><li>Anonymous sign-in (temporary account for trial use, deleted upon registration)</li></ul>
<h2>3.3 Plant-Related Data</h2>
<p>When you use the App to manage your plants, we collect:</p>
<ul><li>Plant names (common and scientific), taxonomy, plant type</li><li>Plant images you capture or upload</li><li>Plant location or room information</li><li>Plant notes, age, and care history (watering dates, care schedules)</li><li>Care preferences (light requirements, pot drainage, repotting history)</li><li>Notification preferences for individual plants</li></ul>
<h2>3.4 Usage and Analytics Data</h2>
<p>We automatically collect certain data about how you use the App:</p>
<ul><li>Screen and page views (via Firebase Analytics)</li><li>Plant health diagnosis history and results</li><li>Plant identification attempts and results</li><li>Care task completion logs</li><li>Conversations with the AI assistant (chat history)</li><li>Calendar event data (watering, fertilizing, repotting tasks)</li></ul>
<h2>3.5 Device Information</h2>
<ul><li>Device model and operating system version</li><li>App version and build number</li><li>Firebase Cloud Messaging (FCM) token for push notifications</li></ul>
<h2>3.6 Camera and Media Data</h2>
<p>With your permission, we access:</p>
<ul><li>Plant photos captured via your device camera</li><li>Images selected from your photo library</li><li>Photo metadata (dimensions, file size)</li><li>Health diagnosis images</li></ul>
<h2>3.7 Subscription Data</h2>
<ul><li>Subscription status and active entitlements</li><li>Active subscription dates</li></ul>
<p>Payment information is handled exclusively by RevenueCat, the Apple App Store, or Google Play. We do not store your payment card details.</p>
<h2>4. How We Use Your Data</h2>
<ul><li><strong>Account management:</strong> to create, maintain, and secure your account</li><li><strong>Plant care services:</strong> to provide plant tracking, care reminders, AI-powered plant identification, health diagnosis, and personalized care recommendations</li><li><strong>AI features:</strong> to power the AI chatbot (RastoAI), plant identification (Plant.id API), plant species information enrichment, and plant health diagnosis, powered in part by Google Gemini (Google LLC)</li><li><strong>Notifications:</strong> to send push notifications for watering, fertilizing, and repotting reminders</li><li><strong>Analytics and improvement:</strong> to understand how the App is used and to improve our services (Firebase Analytics)</li><li><strong>Crash reporting:</strong> to identify and fix technical issues (Firebase Crashlytics)</li><li><strong>Subscription management:</strong> to manage your subscription status and premium features (RevenueCat)</li></ul>
<h2>4.1 Legal Basis for Processing</h2>
<ul><li><strong>Contract performance</strong> (Art. 6(1)(b)): processing necessary to provide you with the App services</li><li><strong>Consent</strong> (Art. 6(1)(a)): for optional features such as camera access, photo library access, and push notifications. You may withdraw consent at any time through your device settings.</li><li><strong>Legitimate interests</strong> (Art. 6(1)(f)): for analytics, crash reporting, and service improvement</li></ul>
<h2>5. Third-Party Services and Data Sharing</h2>
<h2>5.1 Firebase (Google LLC)</h2>
<ul><li>Firebase Authentication – user sign-up, login, session management</li><li>Cloud Firestore – user profile data storage</li><li>Firebase Storage – plant photo and diagnosis image storage</li><li>Firebase Cloud Messaging – push notifications</li><li>Firebase Analytics – usage analytics and event tracking</li><li>Firebase Crashlytics – crash reporting and error logging</li></ul>
<p><a href="https://policies.google.com/privacy" class="underline">Google&apos;s privacy policy</a></p>
<h2>5.2 Payment and Subscription Providers</h2>
<ul><li>RevenueCat – subscription management and entitlement tracking</li><li>Apple App Store – iOS payment processing</li><li>Google Play Billing – Android payment processing</li></ul>
<h2>5.3 Plant Identification and Data Services</h2>
<ul><li>Plant.id API – plant image identification</li><li>Perenual API – plant database and information lookup</li></ul>
<h2>5.4 AI Services</h2>
<p><strong>Google Gemini API (Google LLC)</strong> – plant identification, plant health diagnosis, care recommendations, and plant information enrichment. When you use these features, your plant photos and any accompanying text input are sent to Google's Gemini API via our backend for analysis. No personal identifiable information is included in these API requests. All data is transmitted securely over HTTPS. <a href="https://policies.google.com/privacy" class="underline">Google&apos;s privacy policy</a></p>
<p><strong>RastoAI (custom backend)</strong> – AI plant care chatbot. User chat messages are processed via our backend, which may forward queries to Google Gemini for response generation.</p>
<p>We do not sell your personal data to any third party.</p>
<h2>6. International Data Transfers</h2>
<p>Some of our third-party service providers (notably Firebase/Google and RevenueCat) operate globally. Your data may be transferred to and processed in countries outside the European Economic Area (EEA). Where such transfers occur, we ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission.</p>
<h2>7. Data Storage and Security</h2>
<h2>7.1 Local Storage</h2>
<ul><li>SQLite database for plant data, care schedules, and watering history</li><li>Shared preferences for user settings (theme, language, text scale)</li><li>Encrypted sensitive data via Flutter Secure Storage</li><li>Session cookies for backend session management</li></ul>
<h2>7.2 Cloud Storage</h2>
<ul><li>Cloud Firestore – user profiles</li><li>Firebase Storage – plant photos and diagnosis images</li><li>Dakoty backend server – plants, gardens, care schedules, reminders, user accounts, chat history, diagnosis history, notifications, and FCM tokens</li></ul>
<h2>7.3 Security Measures</h2>
<p>We implement appropriate technical and organizational measures to protect your data, including password encryption, encrypted storage for sensitive data, and HTTPS for all network communication.</p>
<h2>8. Data Retention</h2>
<p>We retain your personal data for as long as your account remains active. If you delete your account, we will delete or anonymize your data within 30 days, unless we are legally required to retain certain data for a longer period. Anonymous accounts created for trial use are automatically deleted when you register a full account.</p>
<h2>9. Cookies and Tracking Technologies</h2>
<p>The App uses session cookies stored locally on your device for backend session management. Firebase Analytics is enabled by default and tracks screen views and custom events. Firebase Crashlytics is used for crash reporting. Both are operated by Google and are subject to Google&apos;s privacy policy.</p>
<h2>10. Your Rights Under the GDPR</h2>
<ul><li><strong>Right of access</strong> (Art. 15): obtain confirmation of whether your data is being processed and receive a copy</li><li><strong>Right to rectification</strong> (Art. 16): have inaccurate data corrected</li><li><strong>Right to erasure</strong> (Art. 17): request deletion of your personal data</li><li><strong>Right to restriction</strong> (Art. 18): restrict the processing of your data in certain circumstances</li><li><strong>Right to data portability</strong> (Art. 20): receive your data in a structured, commonly used, machine-readable format</li><li><strong>Right to object</strong> (Art. 21): object to processing based on legitimate interests</li><li><strong>Right to withdraw consent:</strong> where processing is based on consent, you may withdraw it at any time without affecting the lawfulness of prior processing</li></ul>
<p>To exercise any of these rights, contact us at <a href="mailto:privacy@gardenyx.eu" class="underline">privacy@gardenyx.eu</a>. We will respond within 30 days. You also have the right to lodge a complaint with the Office for Personal Data Protection of the Slovak Republic (Úrad na ochranu osobných údajov SR).</p>
<h2>11. Account Deletion</h2>
<p>You can delete your account at any time via the Settings section in the App. Upon deletion, the following data is removed: your Firebase user account, your backend user profile, all local plant database entries, all cached provider states, and your FCM token. Some data may persist in backups for a limited period.</p>
<h2>12. Children&apos;s Privacy</h2>
<p>The App is not directed at children under the age of 16. We do not knowingly collect personal data from children under 16. If you become aware that a child has provided us with personal data, please contact us at <a href="mailto:privacy@gardenyx.eu" class="underline">privacy@gardenyx.eu</a>.</p>
<h2>13. Device Permissions</h2>
<ul><li><strong>Camera:</strong> to take plant photos for identification and health diagnosis</li><li><strong>Photo library (read):</strong> to select existing plant images</li><li><strong>Photo library (write):</strong> to save images to your device</li><li><strong>Notifications:</strong> to send care reminders for watering, fertilizing, and repotting</li></ul>
<p>All permissions are optional and can be managed through your device settings at any time.</p>
<h2>14. Automated Decision-Making and AI</h2>
<p>The App uses artificial intelligence for plant identification, health diagnosis, and care recommendations. These AI features are powered by third-party services, including Google Gemini (Google LLC). The AI features are advisory in nature and do not produce legal or similarly significant effects on you. You are free to disregard any AI-generated recommendation.</p>
<h2>15. Changes to This Privacy Policy</h2>
<p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy in the App. The "Effective Date" at the top of this document indicates when the latest version became effective.</p>
<h2>16. Contact Us</h2>
<p>JOINA Garden, s. r. o.<br/>Karpatské námestie 7770/10A<br/>Bratislava – mestská časť Rača 831 06, Slovak Republic<br/>Email: <a href="mailto:privacy@gardenyx.eu" class="underline">privacy@gardenyx.eu</a></p>
    `,
  },
  hu: {
    metadataTitle: 'Adatvédelmi irányelvek | GardenYX',
    metadataDescription:
      'A GardenYX mobilalkalmazás adatvédelmi irányelvei, az adatkezelés részleteivel és az Ön jogaival.',
    title: 'Adatvédelmi irányelvek',
    subtitle: 'GardenYX mobilalkalmazás',
    effectiveDate: 'Hatálybalépés dátuma: 2026. március 6.',
    body: `
<h2>1. Bevezetés</h2>
<p>Jelen Adatvédelmi irányelvek leírják, hogyan gyűjti, használja, tárolja és védi személyes adatait a JOINA Garden, s. r. o., székhelye: Karpatské námestie 7770/10A, Bratislava – mestská časť Rača 831 06, Szlovák Köztársaság, IČO: 57 313 504 („mi", „Társaság") a GardenYX mobilalkalmazás („Alkalmazás") használata során, amely elérhető iOS-en, Androidon és progresszív webalkalmazásként.</p>
<p>Elkötelezettek vagyunk magánszférájának védelme iránt az Általános Adatvédelmi Rendelet (EU) 2016/679 („GDPR") és a vonatkozó szlovák adatvédelmi jogszabályok szerint. Az Alkalmazás használatával Ön tudomásul veszi, hogy elolvasta és megértette jelen Irányelveket.</p>
<h2>2. Adatkezelő</h2>
<p>Társaság: JOINA Garden, s. r. o.<br/>Cím: Karpatské námestie 7770/10A, Bratislava – mestská časť Rača 831 06, Szlovák Köztársaság<br/>IČO: 57 313 504<br/>E-mail: <a href="mailto:privacy@gardenyx.eu" class="underline">privacy@gardenyx.eu</a></p>
<h2>3. Összegyűjtött személyes adatok</h2>
<h2>3.1 Fiókadatok</h2>
<p>Fiók létrehozásakor az alábbi adatokat gyűjtjük:</p>
<ul><li>E-mail cím (a hitelesítéshez és fiókellenőrzéshez szükséges)</li><li>Megjelenítési név vagy felhasználónév (a profilhoz szükséges)</li><li>Profilkép URL-je (opcionális)</li><li>Firebase Authentication által generált egyedi felhasználói azonosító</li><li>Fiók létrehozásának és frissítésének időbélyegei</li></ul>
<h2>3.2 Hitelesítési adatok</h2>
<p>Az alábbi módszerek egyikével jelentkezhet be:</p>
<ul><li>E-mail és jelszó (Firebase Authentication-ön keresztül)</li><li>Google bejelentkezés (Google OAuth)</li><li>Apple bejelentkezés (Apple OAuth)</li><li>Anonim bejelentkezés (ideiglenes fiók próbahasználathoz)</li></ul>
<h2>3.3 Növényekkel kapcsolatos adatok</h2>
<ul><li>Növénynevek (köznapi és tudományos), taxonómia, növénytípus</li><li>Az Ön által készített vagy feltöltött növényfényképek</li><li>Növény elhelyezése vagy szoba információk</li><li>Növényjegyzetek, kor és ápolási előzmények (öntözési dátumok, ütemterv)</li><li>Ápolási preferenciák (fényigény, cserép elvezetése, átültetési előzmény)</li><li>Egyedi növényértesítési beállítások</li></ul>
<h2>3.4 Használati és elemzési adatok</h2>
<ul><li>Képernyő- és oldalmegtekintések (Firebase Analytics-en keresztül)</li><li>Növény-egészségi diagnózis előzmények és eredmények</li><li>Növényazonosítási kísérletek és eredmények</li><li>Ápolási feladatok teljesítési naplói</li><li>AI asszisztenssel folytatott beszélgetések (csevelési előzmény)</li><li>Naptáresemény adatok (öntözés, trágyázás, átültetés)</li></ul>
<h2>3.5 Eszközinformációk</h2>
<ul><li>Eszközmodell és operációs rendszer verzió</li><li>Alkalmazás verzió és build szám</li><li>Firebase Cloud Messaging (FCM) token push értesítésekhez</li></ul>
<h2>3.6 Kamera és média adatok</h2>
<p>Az Ön engedélyével hozzáférünk:</p>
<ul><li>Az eszköz kamerájával készített növényfényképekhez</li><li>A fotókönyvtárából kiválasztott képekhez</li><li>Fénykép metaadatokhoz (méretek, fájlméret)</li><li>Egészségi diagnózis képekhez</li></ul>
<h2>3.7 Előfizetési adatok</h2>
<ul><li>Előfizetési státusz és aktív jogosultságok</li><li>Aktív előfizetési dátumok</li></ul>
<p>A fizetési információkat kizárólag a RevenueCat, az Apple App Store vagy a Google Play kezeli. Bankkártya adatait nem tároljuk.</p>
<h2>4. Hogyan használjuk az adatait</h2>
<ul><li><strong>Fiókkezelés:</strong> fiókja létrehozása, karbantartása és biztonsága</li><li><strong>Növényápolási szolgáltatások:</strong> növénykövetés, ápolási emlékeztetők, AI alapú növényazonosítás, egészségi diagnózis és személyre szabott ajánlások</li><li><strong>AI funkciók:</strong> az AI chatbot (RastoAI), növényazonosítás (Plant.id API), növényinformáció-gazdagítás és egészségi diagnózis működtetése, részben a Google Gemini (Google LLC) által biztosítva</li><li><strong>Értesítések:</strong> push értesítések küldése öntözési, trágyázási és átültetési emlékeztetőkről</li><li><strong>Elemzés és fejlesztés:</strong> az Alkalmazás használatának megértése és szolgáltatásaink fejlesztése (Firebase Analytics)</li><li><strong>Hibajelentés:</strong> technikai problémák azonosítása és javítása (Firebase Crashlytics)</li><li><strong>Előfizetés-kezelés:</strong> előfizetési státusz és prémium funkciók kezelése (RevenueCat)</li></ul>
<h2>4.1 Az adatkezelés jogalapja</h2>
<ul><li><strong>Szerződés teljesítése</strong> (6. cikk (1) bek. b) pont): az Alkalmazás szolgáltatásainak biztosításához szükséges adatkezelés</li><li><strong>Hozzájárulás</strong> (6. cikk (1) bek. a) pont): opcionális funkciókhoz, mint kamera, fotókönyvtár és push értesítések. Hozzájárulását bármikor visszavonhatja az eszköz beállításaiban.</li><li><strong>Jogos érdekek</strong> (6. cikk (1) bek. f) pont): elemzéshez, hibajelentéshez és szolgáltatásfejlesztéshez</li></ul>
<h2>5. Harmadik fél szolgáltatások és adatmegosztás</h2>
<h2>5.1 Firebase (Google LLC)</h2>
<ul><li>Firebase Authentication – regisztráció, bejelentkezés, munkamenet-kezelés</li><li>Cloud Firestore – felhasználói profiladatok tárolása</li><li>Firebase Storage – növényfényképek és diagnózis képek tárolása</li><li>Firebase Cloud Messaging – push értesítések</li><li>Firebase Analytics – használati elemzés</li><li>Firebase Crashlytics – hibajelentés</li></ul>
<h2>5.2 Fizetési és előfizetési szolgáltatók</h2>
<ul><li>RevenueCat – előfizetés-kezelés</li><li>Apple App Store – iOS fizetésfeldolgozás</li><li>Google Play Billing – Android fizetésfeldolgozás</li></ul>
<h2>5.3 Növényazonosítási szolgáltatások</h2>
<ul><li>Plant.id API – növényazonosítás képekből</li><li>Perenual API – növényadatbázis</li></ul>
<h2>5.4 AI szolgáltatások</h2>
<p><strong>Google Gemini API (Google LLC)</strong> – növényazonosítás, növény-egészségi diagnózis, ápolási ajánlások és növényinformáció-gazdagítás. Ezen funkciók használatakor a növényfotói és a kísérő szöveges bemenetek a backendünkön keresztül a Google Gemini API-nak kerülnek elküldésre elemzés céljából. Személyazonosító adatok nem kerülnek bele ezekbe a kérésekbe. Minden adat biztonságosan, HTTPS-en keresztül kerül továbbításra. <a href="https://policies.google.com/privacy" class="underline">A Google adatvédelmi irányelvei</a></p>
<p><strong>RastoAI (saját backend)</strong> – AI növényápolási chatbot.</p>
<p>Személyes adatait nem értékesítjük harmadik félnek.</p>
<h2>6. Nemzetközi adattovábbítás</h2>
<p>Egyes szolgáltatóink (különösen a Firebase/Google és a RevenueCat) globálisan működnek. Adatai az Európai Gazdasági Térségen (EGT) kívüli országokba kerülhetnek átadásra. Ilyen esetekben megfelelő garanciákat biztosítunk, beleértve az Európai Bizottság által jóváhagyott általános szerződési feltételeket.</p>
<h2>7. Adattárolás és biztonság</h2>
<h2>7.1 Helyi tárolás</h2>
<ul><li>SQLite adatbázis növényadatokhoz, ápolási ütemtervekhez és öntözési előzményekhez</li><li>Megosztott beállítások (téma, nyelv, szövegméret)</li><li>Titkosított érzékeny adatok Flutter Secure Storage-on keresztül</li><li>Munkamenet-cookie-k a backend munkamenet-kezeléshez</li></ul>
<h2>7.2 Felhőtárolás</h2>
<ul><li>Cloud Firestore – felhasználói profilok</li><li>Firebase Storage – növényfényképek és diagnózis képek</li><li>Dakoty backend szerver – növények, kertek, ütemtervek, emlékeztetők, fiókok, csevelési előzmény, diagnózisok, értesítések és FCM tokenek</li></ul>
<h2>7.3 Biztonsági intézkedések</h2>
<p>Megfelelő technikai és szervezeti intézkedéseket alkalmazunk adatai védelme érdekében, beleértve a jelszótitkosítást, titkosított tárolást és HTTPS-t minden hálózati kommunikációhoz.</p>
<h2>8. Adatmegőrzési idő</h2>
<p>Személyes adatait addig őrizzük meg, amíg fiókja aktív. Fiókja törlése után adatait 30 napon belül töröljük vagy anonimizáljuk, kivéve, ha jogszabály írja elő a hosszabb megőrzést. Az anonim próbafiókok a teljes regisztrációkor automatikusan törlődnek.</p>
<h2>9. Cookie-k és nyomkövetési technológiák</h2>
<p>Az Alkalmazás munkamenet cookie-kat használ, amelyeket helyben tárol az eszközön a backend munkamenet-kezeléshez. A Firebase Analytics és a Firebase Crashlytics a Google által üzemeltetett szolgáltatások, és a Google adatvédelmi irányelveinek hatálya alá tartoznak.</p>
<h2>10. Az Ön jogai a GDPR alapján</h2>
<ul><li><strong>Hozzáférési jog</strong> (15. cikk): megerősítést kaphat adatai kezeléséről és másolatot kérhet</li><li><strong>Helyesbítéshez való jog</strong> (16. cikk): pontatlan adatok javítását kérheti</li><li><strong>Törléshez való jog</strong> (17. cikk): személyes adatai törlését kérheti</li><li><strong>Korlátozáshoz való jog</strong> (18. cikk): adatkezelés korlátozását kérheti bizonyos körülmények között</li><li><strong>Adathordozhatósághoz való jog</strong> (20. cikk): adatait strukturált, géppel olvasható formátumban kaphatja meg</li><li><strong>Tiltakozási jog</strong> (21. cikk): tiltakozhat a jogos érdeken alapuló adatkezelés ellen</li><li><strong>Hozzájárulás visszavonása:</strong> ahol az adatkezelés hozzájáruláson alapul, azt bármikor visszavonhatja a korábbi adatkezelés jogszerűségének érintése nélkül</li></ul>
<p>Jogai gyakorlásához forduljon hozzánk a <a href="mailto:privacy@gardenyx.eu" class="underline">privacy@gardenyx.eu</a> címen. 30 napon belül válaszolunk. Panaszt a Szlovák Köztársaság Személyes Adatok Védelméért Felelős Hivatalánál (Úrad na ochranu osobných údajov SR) is benyújthat.</p>
<h2>11. Fiók törlése</h2>
<p>Fiókját bármikor törölheti az Alkalmazás Beállítások részében. Törléskor eltávolításra kerül a Firebase felhasználói fiók, a backend felhasználói profil, az összes helyi növényadatbázis bejegyzés, az összes gyorsítótárazott szolgáltatói állapot és az FCM token. Egyes adatok korlátozott ideig megmaradhatnak a biztonsági mentésekben.</p>
<h2>12. Gyermekek adatvédelme</h2>
<p>Az Alkalmazás nem 16 év alatti gyermekeknek szól. Tudatosan nem gyűjtünk személyes adatokat 16 év alatti gyermekektől. Ha tudomására jut, hogy gyermek személyes adatot adott meg nekünk, értesítsen a <a href="mailto:privacy@gardenyx.eu" class="underline">privacy@gardenyx.eu</a> címen.</p>
<h2>13. Eszközengedélyek</h2>
<ul><li><strong>Kamera:</strong> növényfényképek készítése azonosításhoz és egészségi diagnózishoz</li><li><strong>Fotókönyvtár (olvasás):</strong> meglévő növényképek kiválasztása</li><li><strong>Fotókönyvtár (írás):</strong> képek mentése az eszközre</li><li><strong>Értesítések:</strong> ápolási emlékeztetők küldése</li></ul>
<p>Minden engedély opcionális, és bármikor kezelhető az eszköz beállításaiban.</p>
<h2>14. Automatizált döntéshozatal és AI</h2>
<p>Az Alkalmazás mesterséges intelligenciát használ növényazonosításra, egészségi diagnózisra és ápolási ajánlásokra. Ezeket az AI funkciókat harmadik fél szolgáltatásai biztosítják, beleértve a Google Gemini-t (Google LLC). Ezek a funkciók tanácsadó jellegűek, és nem eredményeznek jogi vagy hasonlóan jelentős hatást Önre nézve.</p>
<h2>15. Az Irányelvek módosítása</h2>
<p>Jelen Irányelveket időről időre frissíthetjük. A lényeges változásokról az Alkalmazásban történő közzététellel értesítjük. A dokumentum elején lévő „Hatályba lépés" dátum jelzi a legfrissebb verzió érvényességét.</p>
<h2>16. Kapcsolat</h2>
<p>JOINA Garden, s. r. o.<br/>Karpatské námestie 7770/10A<br/>Bratislava – mestská časť Rača 831 06, Szlovák Köztársaság<br/>E-mail: <a href="mailto:privacy@gardenyx.eu" class="underline">privacy@gardenyx.eu</a></p>
    `,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = contentByLocale[locale] ?? contentByLocale.sk;
  return {
    title: content.metadataTitle,
    description: content.metadataDescription,
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = contentByLocale[locale] ?? contentByLocale.sk;

  return (
    <main className="bg-stone-50 py-12 sm:py-16">
      <div className="container mx-auto px-6 sm:px-8">
        <article className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
          <div className="p-8 sm:p-12">
            <p className="text-xs uppercase tracking-widest text-stone-400">{content.subtitle}</p>
            <h1 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">{content.title}</h1>
            <p className="mt-2 text-sm text-stone-500">{content.effectiveDate}</p>
            <div
              className="prose prose-stone prose-headings:mt-6 prose-headings:text-lg prose-headings:font-semibold prose-p:text-stone-700 prose-li:text-stone-700 prose-a:text-green-700 mt-8 max-w-none"
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
          </div>
        </article>
      </div>
    </main>
  );
}
