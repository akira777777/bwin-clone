import React, { useState, useEffect, useMemo } from 'react';
import './FooterModal.css';

interface FAQ {
  q: string;
  a: string;
  category: string;
}

const FAQS_LOCALIZED: Record<string, FAQ[]> = {
  en: [
    { q: 'How do I withdraw my winnings?', a: 'Go to your account menu, select "Withdrawal", choose your preferred payment method, enter the amount, and confirm. Processing times range from instant (e-wallets) to 3-5 business days (bank transfer).', category: 'payments' },
    { q: 'How long does a deposit take?', a: 'Most deposit methods (credit cards, PayPal, Skrill, Neteller) are processed instantly. Bank transfers may take 1-3 business days.', category: 'payments' },
    { q: 'What is a Multi bet?', a: 'A Multi (Accumulator) bet combines multiple selections into one ticket. All selections must win for the ticket to win. The odds are multiplied, yielding much higher potential payouts.', category: 'betting' },
    { q: 'How does Cash Out work?', a: 'Cash Out allows you to settle a pending bet before the event finishes. The value fluctuates based on the current live odds of your selections. Click "Cash Out" under the My Bets tab to settle early.', category: 'betting' },
    { q: 'How do I set a deposit limit?', a: 'Go to the "Responsible Gaming" tab inside this modal. You can set a daily deposit limit. Deposits exceeding this limit will be blocked to ensure healthy gaming habits.', category: 'responsible' },
    { q: 'Can I temporarily lock my account?', a: 'Yes. Use the "Self-Exclusion" tool in the "Responsible Gaming" section. You can self-exclude for 24 hours or 7 days, during which all betting will be locked.', category: 'responsible' },
    { q: 'Is my personal data secure?', a: 'Yes. We protect all user data using modern SSL encryption and adhere strictly to GDPR privacy requirements. You can download a full JSON copy of your profile data in the "Privacy Policy" tab.', category: 'privacy' },
  ],
  ru: [
    { q: 'Как вывести выигрыш?', a: 'Перейдите в меню аккаунта, выберите «Вывод средств», укажите платежный метод, введите сумму и подтвердите операцию. Время обработки составляет от мгновенного до 3-5 рабочих дней.', category: 'payments' },
    { q: 'Сколько времени занимает депозит?', a: 'Большинство методов депозита (банковские карты, электронные кошельки) обрабатываются мгновенно. Банковские переводы могут занимать от 1 до 3 рабочих дней.', category: 'payments' },
    { q: 'Что такое экспресс-ставка?', a: 'Экспресс объединяет несколько исходов в один купон. Все исходы должны выиграть, чтобы купон сыграл. Коэффициенты перемножаются, что дает гораздо более высокий выигрыш.', category: 'betting' },
    { q: 'Как работает выкуп ставки (Cash Out)?', a: 'Cash Out позволяет рассчитать ставку до завершения события. Сумма выкупа постоянно меняется в зависимости от текущих лайв коэффициентов. Нажмите «Выкупить» во вкладке «Мои ставки».', category: 'betting' },
    { q: 'Как установить лимит депозита?', a: 'Перейдите во вкладку «Ответственная игра». Вы можете установить суточный лимит депозитов. Все операции, превышающие этот лимит, будут автоматически заблокированы.', category: 'responsible' },
    { q: 'Могу ли я временно заблокировать аккаунт?', a: 'Да. Используйте функцию «Самоисключение» в разделе «Ответственная игра». Вы можете заблокировать ставки на 1 минуту, 24 часа или 7 дней.', category: 'responsible' },
    { q: 'Безопасны ли мои личные данные?', a: 'Да. Мы защищаем данные пользователей с помощью современного SSL-шифрования и строго соблюдаем правила GDPR. Вы можете скачать копию своих данных во вкладке «Политика конфиденциальности».', category: 'privacy' },
  ],
  de: [
    { q: 'Wie kann ich meine Gewinne auszahlen?', a: 'Gehen Sie zum Kontomenü, wählen Sie "Auszahlung", wählen Sie Ihre bevorzugte Zahlungsmethode, geben Sie den Betrag ein und bestätigen Sie. Die Bearbeitungszeit reicht von sofort (E-Wallets) bis zu 3-5 Werktagen (Banküberweisung).', category: 'payments' },
    { q: 'Wie lange dauert eine Einzahlung?', a: 'Die meisten Einzahlungsmethoden (Kreditkarten, PayPal, Skrill, Neteller) werden sofort verarbeitet. Banküberweisungen können 1-3 Werktage dauern.', category: 'payments' },
    { q: 'Was ist eine Kombiwette?', a: 'Eine Kombiwette kombiniert mehrere Auswahlen auf einem Schein. Alle Auswahlen müssen gewinnen, damit der Schein gewinnt. Die Quoten werden multipliziert, was zu viel höheren Gewinnen führt.', category: 'betting' },
    { q: 'Wie funktioniert Cash Out?', a: 'Mit Cash Out können Sie eine offene Wette vorzeitig auswerten. Der Wert schwankt basierend auf den aktuellen Quoten. Klicken Sie im Reiter "Meine Wetten" auf "Cash Out", um vorzeitig abzurechnen.', category: 'betting' },
    { q: 'Wie richte ich ein Einzahlungslimit ein?', a: 'Gehen Sie zum Reiter "Verantwortungsbewusstes Spielen". Sie können ein tägliches Limit festlegen. Einzahlungen über diesem Limit werden blockiert.', category: 'responsible' },
    { q: 'Kann ich mein Konto vorübergehend sperren?', a: 'Ja. Nutzen Sie das "Selbstausschluss"-Tool unter "Verantwortungsbewusstes Spielen". Sie können sich für 1 Minute, 24 Stunden oder 7 Tage sperren.', category: 'responsible' },
    { q: 'Sind meine persönlichen Daten sicher?', a: 'Ja. Wir schützen alle Benutzerdaten durch moderne SSL-Verschlüsselung und halten uns strikt an die DSGVO. Sie können eine Kopie Ihrer Profildaten im Reiter "Datenschutz" herunterladen.', category: 'privacy' },
  ],
  es: [
    { q: '¿Cómo retiro mis ganancias?', a: 'Vaya a su menú de cuenta, seleccione "Retiro", elija su método de pago preferido, ingrese el monto y confirme. Los tiempos de procesamiento varían desde instantáneos (monederos electrónicos) hasta 3-5 días hábiles.', category: 'payments' },
    { q: '¿Cuánto tarda un depósito?', a: 'La mayoría de los métodos de depósito (tarjetas, PayPal, Skrill, Neteller) se procesan al instante. Las transferencias bancarias pueden tardar de 1 a 3 días hábiles.', category: 'payments' },
    { q: '¿Qué es una apuesta combinada?', a: 'Una apuesta combinada une varias selecciones en un solo boleto. Todas deben ganar para que el boleto sea ganador. Las cuotas se multiplican, lo que genera ganancias mucho mayores.', category: 'betting' },
    { q: '¿Cómo funciona el Cash Out?', a: 'El Cash Out le permite liquidar una apuesta pendiente antes de que termine el evento. El valor varía según las cuotas en vivo. Haga clic en "Cerrar Apuesta" en "Mis Apuestas".', category: 'betting' },
    { q: '¿Cómo configuro un límite de depósito?', a: 'Vaya a la pestaña "Juego Responsable". Puede establecer un límite diario. Los depósitos que superen este límite serán bloqueados.', category: 'responsible' },
    { q: '¿Puedo bloquear temporalmente mi cuenta?', a: 'Sí. Utilice la herramienta de "Autoexclusión" en la sección "Juego Responsable". Puede autoexcluirse por 1 minuto, 24 horas o 7 días.', category: 'responsible' },
    { q: '¿Están seguros mis datos personales?', a: 'Sí. Protegemos todos los datos mediante cifrado SSL moderno y cumplimos con el RGPD. Puede descargar una copia de sus datos en la pestaña "Política de Privacidad".', category: 'privacy' },
  ]
};

interface FooterModalProps {
  tab: string | null;
  onClose: () => void;
  balance: number;
  placedBetsCount: number;
  depositLimit: number;
  setDepositLimit: (limit: number) => void;
  selfExclusionEndTime: number;
  setSelfExclusionEndTime: (time: number) => void;
  onStartLiveChat: () => void;
  triggerToast: (msg: string) => void;
  language?: string;
}

const FooterModal: React.FC<FooterModalProps> = ({
  tab,
  onClose,
  balance,
  placedBetsCount,
  depositLimit,
  setDepositLimit,
  selfExclusionEndTime,
  setSelfExclusionEndTime,
  onStartLiveChat,
  triggerToast,
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<string>('');
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  
  // Contact Form State
  const [contactSubject, setContactSubject] = useState('general');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  
  // Cookie Preferences
  const [cookies, setCookies] = useState({
    essential: true,
    analytical: true,
    marketing: false,
  });

  // Responsible Gaming Slider & Timeout States
  const [localLimit, setLocalLimit] = useState<number>(depositLimit);
  const [exclusionDuration, setExclusionDuration] = useState<string>('60');

  useEffect(() => {
    if (tab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(tab);
    }
  }, [tab]);

  // eslint-disable-next-line react-hooks/purity
  const isSelfExcluded = useMemo(() => selfExclusionEndTime > Date.now(), [selfExclusionEndTime]);
  const exclusionTimeLeftText = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const left = selfExclusionEndTime - Date.now();
    if (left <= 0) return '';
    const secs = Math.ceil(left / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.ceil(secs / 60);
    return `${mins}m`;
  }, [selfExclusionEndTime]);

  if (!tab || !activeTab) return null;

  // Local translations for titles
  const getTabTitle = (currentTab: string): string => {
    const titles: Record<string, Record<string, string>> = {
      ru: {
        'About Us': 'О нас',
        'Terms and Conditions': 'Правила и условия',
        'Privacy Policy': 'Политика конфиденциальности',
        'Cookie Policy': 'Политика файлов cookie',
        'Responsible Gaming': 'Ответственная игра',
        'Help Center': 'Справочный центр',
        'Contact Us': 'Связаться с нами',
        'Deposits & Withdrawals': 'Депозиты и выводы',
        'Betting Rules': 'Правила ставок'
      },
      de: {
        'About Us': 'Über uns',
        'Terms and Conditions': 'Allgemeine Geschäftsbedingungen',
        'Privacy Policy': 'Datenschutzrichtlinie',
        'Cookie Policy': 'Cookie-Richtlinie',
        'Responsible Gaming': 'Verantwortungsbewusstes Spielen',
        'Help Center': 'Hilfebereich',
        'Contact Us': 'Kontaktieren Sie uns',
        'Deposits & Withdrawals': 'Ein- & Auszahlungen',
        'Betting Rules': 'Wettregeln'
      },
      es: {
        'About Us': 'Sobre Nosotros',
        'Terms and Conditions': 'Términos y Condiciones',
        'Privacy Policy': 'Política de Privacidad',
        'Cookie Policy': 'Política de Cookies',
        'Responsible Gaming': 'Juego Responsable',
        'Help Center': 'Centro de Ayuda',
        'Contact Us': 'Contacto',
        'Deposits & Withdrawals': 'Depósitos y Retiros',
        'Betting Rules': 'Reglas de Apuestas'
      }
    };
    return titles[language]?.[currentTab] || currentTab;
  };

  // GDPR Data Export
  const handleDataExport = () => {
    const data = {
      brand: 'bwin',
      exportDate: new Date().toISOString(),
      profile: {
        accountStatus: selfExclusionEndTime > Date.now() ? 'Self-Excluded' : 'Active',
        currency: 'EUR',
        balance,
        placedTickets: placedBetsCount,
        dailyDepositLimit: depositLimit,
      },
      cookiesAccepted: cookies,
      note: 'This export contains personal data held by bwin Interactive Entertainment AG as required by GDPR Article 20 (Right to Data Portability).'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bwin_profile_data_export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const successMsg = language === 'ru' 
      ? '📥 Экспорт данных профиля GDPR успешно скачан!'
      : language === 'de'
      ? '📥 DSGVO-Profildatenexport erfolgreich heruntergeladen!'
      : language === 'es'
      ? '¡📥 Exportación de datos de perfil GDPR descargada con éxito!'
      : '📥 GDPR profile data export downloaded successfully!';
    triggerToast(successMsg);
  };

  // Cookie Save
  const handleSaveCookies = () => {
    localStorage.setItem('bwin_cookie_prefs', JSON.stringify(cookies));
    const successMsg = language === 'ru'
      ? '🍪 Настройки файлов cookie сохранены!'
      : language === 'de'
      ? '🍪 Cookie-Einstellungen erfolgreich gespeichert!'
      : language === 'es'
      ? '¡🍪 Preferencias de cookies guardadas con éxito!'
      : '🍪 Cookie preferences saved successfully!';
    triggerToast(successMsg);
  };

  // Limit Save
  const handleSaveLimit = () => {
    setDepositLimit(localLimit);
    const successMsg = language === 'ru'
      ? `🛡️ Суточный лимит депозита установлен на €${localLimit.toFixed(2)}.`
      : language === 'de'
      ? `🛡️ Tägliches Einzahlungslimit auf €${localLimit.toFixed(2)} festgelegt.`
      : language === 'es'
      ? `🛡️ Límite diario de depósito establecido en €${localLimit.toFixed(2)}.`
      : `🛡️ Daily deposit limit set to €${localLimit.toFixed(2)}.`;
    triggerToast(successMsg);
  };

  // Self-Exclusion Confirm
  const handleConfirmExclusion = () => {
    const durationMs = parseInt(exclusionDuration) * 1000;
    const endTime = Date.now() + durationMs;
    setSelfExclusionEndTime(endTime);
    
    let timeText = '1 minute';
    if (exclusionDuration === '86400') timeText = '24 hours';
    else if (exclusionDuration === '604800') timeText = '7 days';

    if (language === 'ru') {
      const ruTime = exclusionDuration === '60' ? '1 минуту' : exclusionDuration === '86400' ? '24 часа' : '7 дней';
      triggerToast(`⚠️ Аккаунт временно заблокирован. Ставки недоступны на следующие ${ruTime}.`);
    } else if (language === 'de') {
      const deTime = exclusionDuration === '60' ? '1 Minute' : exclusionDuration === '86400' ? '24 Stunden' : '7 Tage';
      triggerToast(`⚠️ Konto selbstgesperrt. Wetten ist für die nächsten ${deTime} gesperrt.`);
    } else if (language === 'es') {
      const esTime = exclusionDuration === '60' ? '1 minuto' : exclusionDuration === '86400' ? '24 horas' : '7 días';
      triggerToast(`⚠️ Cuenta autoexcluida. Las apuestas están bloqueadas durante los próximos ${esTime}.`);
    } else {
      triggerToast(`⚠️ Account self-excluded. Betting locked for the next ${timeText}.`);
    }
  };

  // Contact Form Submit
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMessage) {
      const err = language === 'ru' 
        ? '❌ Пожалуйста, заполните все поля перед отправкой.'
        : language === 'de'
        ? '❌ Bitte füllen Sie alle Felder aus, bevor Sie absenden.'
        : language === 'es'
        ? '❌ Por favor, complete todos los campos antes de enviar.'
        : '❌ Please fill in all fields before submitting.';
      triggerToast(err);
      return;
    }

    const success = language === 'ru'
      ? '📨 Запрос в поддержку отправлен! Мы ответим вам в ближайшее время.'
      : language === 'de'
      ? '📨 Support-Ticket erfolgreich eingereicht! Wir melden uns in Kürze.'
      : language === 'es'
      ? '¡📨 Boleto de soporte enviado con éxito! Nos pondremos en contacto en breve.'
      : '📨 Support ticket submitted successfully! We will get back to you shortly.';
    triggerToast(success);
    setContactEmail('');
    setContactMessage('');
  };

  // Filter FAQs
  const currentFaqs = FAQS_LOCALIZED[language] || FAQS_LOCALIZED['en'];
  const filteredFAQs = currentFaqs.filter(faq => 
    faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    faq.a.toLowerCase().includes(faqSearch.toLowerCase())
  );


  return (
    <div className="footer-modal-overlay" onClick={onClose}>
      <div className="footer-modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="fm-header">
          <h3>{getTabTitle(activeTab)}</h3>
          <button className="fm-close-btn" onClick={onClose}>&times;</button>
        </header>

        <div className="fm-body">
          {/* ════ ABOUT US ════ */}
          {activeTab === 'About Us' && (
            <div className="fm-content-pane fade-in">
              {language === 'ru' ? (
                <>
                  <p className="fm-highlight-text">
                    bwin — это ведущий мировой бренд ставок на спорт, известный своими инновациями в режиме лайв, премиальным темным дизайном и безопасной игровой средой.
                  </p>
                  <div className="fm-stats-grid">
                    <div className="fm-stat-card"><span className="stat-num">1997</span><span className="stat-label">Основан</span></div>
                    <div className="fm-stat-card"><span className="stat-num">20M+</span><span className="stat-label">Пользователей</span></div>
                    <div className="fm-stat-card"><span className="stat-num">100+</span><span className="stat-label">Видов спорта</span></div>
                    <div className="fm-stat-card"><span className="stat-num">Entain</span><span className="stat-label">Холдинг</span></div>
                  </div>
                  <h4>Наша миссия</h4>
                  <p>Обеспечить максимальное удовольствие от спортивных ставок и онлайн-казино, гарантируя абсолютную надежность, честные коэффициенты и быстрые выплаты.</p>
                </>
              ) : language === 'de' ? (
                <>
                  <p className="fm-highlight-text">
                    bwin ist eine führende globale Sportwettenmarke, bekannt für Live-Wetten-Innovationen, erstklassige dunkle Ästhetik und sichere Spielumgebungen.
                  </p>
                  <div className="fm-stats-grid">
                    <div className="fm-stat-card"><span className="stat-num">1997</span><span className="stat-label">Gegründet</span></div>
                    <div className="fm-stat-card"><span className="stat-num">20M+</span><span className="stat-label">Aktive Nutzer</span></div>
                    <div className="fm-stat-card"><span className="stat-num">100+</span><span className="stat-label">Sportarten</span></div>
                    <div className="fm-stat-card"><span className="stat-num">Entain</span><span className="stat-label">Mutterkonzern</span></div>
                  </div>
                  <h4>Unsere Mission</h4>
                  <p>Das ultimative Sportwetten- und Casino-Erlebnis zu bieten, während durch faire Quoten, schnelle Auszahlungen und vorbildliche Einhaltung von Richtlinien Vertrauen geschaffen wird.</p>
                </>
              ) : language === 'es' ? (
                <>
                  <p className="fm-highlight-text">
                    bwin es una marca líder mundial de apuestas deportivas, famosa por su innovación en apuestas en vivo, estética oscura premium y entornos de juego seguros.
                  </p>
                  <div className="fm-stats-grid">
                    <div className="fm-stat-card"><span className="stat-num">1997</span><span className="stat-label">Fundado</span></div>
                    <div className="fm-stat-card"><span className="stat-num">20M+</span><span className="stat-label">Usuarios activos</span></div>
                    <div className="fm-stat-card"><span className="stat-num">100+</span><span className="stat-label">Deportes cubiertos</span></div>
                    <div className="fm-stat-card"><span className="stat-num">Entain</span><span className="stat-label">Grupo matriz</span></div>
                  </div>
                  <h4>Nuestra Misión</h4>
                  <p>Brindar la máxima emoción en apuestas deportivas y casino en línea, asegurando absoluta confianza mediante cuotas justas, pagos rápidos y el cumplimiento de las licencias.</p>
                </>
              ) : (
                <>
                  <p className="fm-highlight-text">
                    bwin is a premier global sports betting brand, renowned for live betting innovation, premium dark aesthetic, and safe gaming environments.
                  </p>
                  <div className="fm-stats-grid">
                    <div className="fm-stat-card"><span className="stat-num">1997</span><span className="stat-label">Founded</span></div>
                    <div className="fm-stat-card"><span className="stat-num">20M+</span><span className="stat-label">Active Users</span></div>
                    <div className="fm-stat-card"><span className="stat-num">100+</span><span className="stat-label">Sports Covered</span></div>
                    <div className="fm-stat-card"><span className="stat-num">Entain</span><span className="stat-label">Parent Group</span></div>
                  </div>
                  <h4>Our Mission</h4>
                  <p>To provide the ultimate sports-book and online casino gaming excitement while securing absolute trust through fair odds, quick payouts, and leading compliance practices under Entain plc licensing (Gibraltar & UKGC).</p>
                </>
              )}
            </div>
          )}

          {/* ════ TERMS AND CONDITIONS ════ */}
          {activeTab === 'Terms and Conditions' && (
            <div className="fm-content-pane fade-in scrollable-y">
              {language === 'ru' ? (
                <>
                  <h4>1. Регистрация аккаунта</h4>
                  <p>Пользователи должны быть старше 18 лет для регистрации и размещения ставок. Проверки верификации выполняются автоматически при создании аккаунта.</p>
                  <h4>2. Правила ставок и коэффициенты</h4>
                  <p>Размещенные ставки являются окончательными. Выигрыши рассчитываются автоматически по результатам быстрых симуляций. Сбои аннулируют все ставки и выплаты.</p>
                  <h4>3. Условия функции Cash Out</h4>
                  <p>Суммы выкупа Cash Out постоянно меняются в зависимости от хода матча в режиме реального времени. Обработка запроса занимает около 2 секунд.</p>
                  <h4>4. Нарушения и мошенничество</h4>
                  <p>Любые попытки злоупотребления уязвимостями котировок или задержками таймеров могут привести к аннулированию купонов и блокировке аккаунта.</p>
                </>
              ) : language === 'de' ? (
                <>
                  <h4>1. Registrierung des Kontos</h4>
                  <p>Nutzer müssen mindestens 18 Jahre alt sein, um sich zu registrieren und Wetten zu platzieren. Verifizierungsprüfungen werden automatisch bei der Kontoerstellung durchgeführt.</p>
                  <h4>2. Wettregeln & Quoten</h4>
                  <p>Platzierte Wetten sind endgültig. Gewinne werden automatisch anhand von simulierten Spielergebnissen abgerechnet. Fehlfunktionen machen alle Spiele und Zahlungen ungültig.</p>
                  <h4>3. Cash Out-Bedingungen</h4>
                  <p>Cash Out-Werte unterliegen Echtzeitanpassungen basierend auf Live-Spielereignissen. Abrechnungsanfragen haben eine 2-sekündige Verarbeitungszeit.</p>
                  <h4>4. Systemmissbrauch & Betrug</h4>
                  <p>Die Ausnutzung von Fehlern in der Quotenübertragung oder simulierten Verzögerungen kann zur Stornierung von Wettscheinen und Kontosperrung führen.</p>
                </>
              ) : language === 'es' ? (
                <>
                  <h4>1. Registro de Cuenta</h4>
                  <p>Los usuarios deben ser mayores de 18 años para registrarse y apostar. Las verificaciones se realizan automáticamente al crear la cuenta.</p>
                  <h4>2. Reglas de Apuestas y Cuotas</h4>
                  <p>Las apuestas realizadas son definitivas. Las ganancias se liquidan automáticamente contra los resultados simulados. Las fallas anulan todos los pagos y jugadas.</p>
                  <h4>3. Funcionalidad de Cash Out</h4>
                  <p>Los valores de Cash Out están sujetos a ajustes en tiempo real según el desarrollo del partido. Las solicitudes de cobro tienen un margen de proceso de 2 segundos.</p>
                  <h4>4. Abuso del Sistema y Fraude</h4>
                  <p>La explotación de inconsistencias en las cuotas o demoras en el temporizador simulado puede llevar a la anulación de boletos y suspensión de la cuenta.</p>
                </>
              ) : (
                <>
                  <h4>1. Account Registration</h4>
                  <p>Users must be over 18 years of age to register and place bets. Verification checks are automatically processed upon creating accounts.</p>
                  <h4>2. Betting Rules & Odds</h4>
                  <p>Placed bets are final. Winnings are settled automatically based on official verified results. Malfunctions voids all pays and plays.</p>
                  <h4>3. Cash Out Offerings</h4>
                  <p>Cash out values are subject to real-time adjustments depending on live scoring fluctuations. Settle requests carry a 2-second processing buffer.</p>
                  <h4>4. System Abuse & Fraud</h4>
                  <p>Any exploitation of odds feed inconsistencies or platform anomalies may lead to ticket voiding and account suspension.</p>
                </>
              )}
            </div>
          )}

          {/* ════ PRIVACY POLICY ════ */}
          {activeTab === 'Privacy Policy' && (
            <div className="fm-content-pane fade-in">
              <h4>{language === 'ru' ? 'Защита данных GDPR и права пользователя' : language === 'de' ? 'DSGVO Datenschutz & Nutzerrechte' : language === 'es' ? 'Protección de Datos RGPD y Derechos de Usuario' : 'GDPR Data Protection & User Rights'}</h4>
              <p>
                {language === 'ru'
                  ? 'Мы уважаем вашу конфиденциальность. В соответствии с Общим регламентом по защите данных (GDPR) вы имеете право на доступ, исправление или загрузку полной истории ваших данных в любое время.'
                  : language === 'de'
                  ? 'Wir respektieren Ihre Privatsphäre. Gemäß der Datenschutz-Grundverordnung (DSGVO) haben Sie jederzeit das Recht auf Auskunft, Berichtigung oder den Download Ihres vollständigen Profilverlaufs.'
                  : language === 'es'
                  ? 'Respetamos su privacidad. Bajo el Reglamento General de Protección de Datos (RGPD), usted posee el derecho de acceder, rectificar o descargar su historial de perfil completo en cualquier momento.'
                  : 'We respect your privacy. Under the General Data Protection Regulation (GDPR), you possess the right to access, rectify, or download your complete profile data history at any time.'}
              </p>
              
              <div className="privacy-actions-block">
                <div className="privacy-card">
                  <h5>{language === 'ru' ? 'Обзор прав на данные:' : language === 'de' ? 'Zusammenfassung der Datenrechte:' : language === 'es' ? 'Resumen de Derechos de Datos:' : 'Data Rights Summary:'}</h5>
                  <ul>
                    <li>{language === 'ru' ? 'Право на доступ к личным записям' : language === 'de' ? 'Recht auf Zugang zu persönlichen Daten' : language === 'es' ? 'Derecho a acceder a registros personales' : 'Right to access personal records'}</li>
                    <li>{language === 'ru' ? 'Право быть забытым (Удаление данных)' : language === 'de' ? 'Recht auf Vergessenwerden (Löschung)' : language === 'es' ? 'Derecho al olvido (Solicitudes de eliminación)' : 'Right to be forgotten (Erasure requests)'}</li>
                    <li>{language === 'ru' ? 'Право на переносимость данных' : language === 'de' ? 'Recht auf Datenübertragbarkeit' : language === 'es' ? 'Derecho a la portabilidad de datos' : 'Right to data portability'}</li>
                  </ul>
                </div>
                <button className="btn-gdpr-export" onClick={handleDataExport}>
                  {language === 'ru' ? '📥 Запросить экспорт данных профиля (JSON)' : language === 'de' ? '📥 Profildatenexport anfordern (JSON)' : language === 'es' ? '📥 Solicitar Exportación de Datos de Perfil (JSON)' : '📥 Request Profile Data Export (JSON)'}
                </button>
              </div>
            </div>
          )}

          {/* ════ COOKIE POLICY ════ */}
          {activeTab === 'Cookie Policy' && (
            <div className="fm-content-pane fade-in">
              <p>
                {language === 'ru'
                  ? 'Управляйте настройками файлов cookie ниже. Обязательные файлы cookie необходимы для сохранения сессий учетной записи, купонов ставок и состояния баланса.'
                  : language === 'de'
                  ? 'Verwalten Sie unten Ihre Cookie-Einstellungen. Essenzielle Cookies sind erforderlich, um Kontositzungen, Wettscheine und den Kontostand zu speichern.'
                  : language === 'es'
                  ? 'Administre su configuración de cookies a continuación. Las cookies esenciales son necesarias para conservar las sesiones de cuenta, cupones de apuestas y saldo.'
                  : 'Manage your cookie settings below. Essential cookies are required to preserve account sessions, bet slips, and balance status.'}
              </p>
              
              <div className="cookie-settings-form">
                <div className="cookie-setting-row">
                  <div className="cs-info">
                    <h5>{language === 'ru' ? 'Обязательные файлы cookie (Требуются)' : language === 'de' ? 'Essenzielle Cookies (Erforderlich)' : language === 'es' ? 'Cookies Esenciales (Requeridas)' : 'Essential Cookies (Required)'}</h5>
                    <p>{language === 'ru' ? 'Обеспечивают работу базовых функций сайта, таких как купоны и баланс в локальном хранилище.' : language === 'de' ? 'Ermöglicht grundlegende Funktionen wie Wettscheine und Guthaben-Speicherung.' : language === 'es' ? 'Habilita operaciones principales como cupones de apuestas y persistencia del saldo.' : 'Enables core site operations like bet slips and local storage balance persistence.'}</p>
                  </div>
                  <input type="checkbox" checked disabled className="toggle-switch-input" />
                </div>

                <div className="cookie-setting-row">
                  <div className="cs-info">
                    <h5>{language === 'ru' ? 'Аналитические файлы cookie' : language === 'de' ? 'Analyse- und Performance-Cookies' : language === 'es' ? 'Cookies Analíticas y de Rendimiento' : 'Analytical & Performance Cookies'}</h5>
                    <p>{language === 'ru' ? 'Используются для мониторинга времени ответа страниц и отслеживания работы симулятора.' : language === 'de' ? 'Dient der Überwachung von Ladezeiten und Wett-Geschwindigkeiten.' : language === 'es' ? 'Utilizadas para monitorear los tiempos de respuesta del sitio y velocidades de apuestas.' : 'Used to monitor page response times and track mock betting speeds.'}</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={cookies.analytical} 
                    onChange={(e) => setCookies(prev => ({ ...prev, analytical: e.target.checked }))}
                    className="toggle-switch-input" 
                  />
                </div>

                <div className="cookie-setting-row">
                  <div className="cs-info">
                    <h5>{language === 'ru' ? 'Маркетинговые файлы cookie' : language === 'de' ? 'Marketing-Cookies' : language === 'es' ? 'Cookies de Marketing' : 'Marketing Cookies'}</h5>
                    <p>{language === 'ru' ? 'Позволяют настраивать персональные рекламные баннеры и специальные бонусы.' : language === 'de' ? 'Ermöglicht personalisierte Werbebanner und Bonusangebote.' : language === 'es' ? 'Permite banners publicitarios personalizados y ofertas de bonos promocionales.' : 'Allows personalized display banners and promotional bonus offerings.'}</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={cookies.marketing} 
                    onChange={(e) => setCookies(prev => ({ ...prev, marketing: e.target.checked }))}
                    className="toggle-switch-input" 
                  />
                </div>

                <button className="btn-save-cookies" onClick={handleSaveCookies}>
                  {language === 'ru' ? 'Сохранить настройки cookie' : language === 'de' ? 'Cookie-Einstellungen speichern' : language === 'es' ? 'Guardar Preferencias de Cookies' : 'Save Cookie Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* ════ RESPONSIBLE GAMING ════ */}
          {activeTab === 'Responsible Gaming' && (
            <div className="fm-content-pane fade-in scrollable-y">
              <p className="responsible-intro">
                {language === 'ru'
                  ? 'bwin стремится обеспечить безопасную и ответственную игровую среду. Установите лимиты на депозиты или временно заблокируйте свой аккаунт.'
                  : language === 'de'
                  ? 'bwin setzt sich für eine sichere und verantwortungsvolle Spielumgebung ein. Richten Sie Einzahlungslimits ein oder sperren Sie Ihre Kontoaktivität.'
                  : language === 'es'
                  ? 'bwin se compromete a proporcionar un entorno de juego seguro y responsable. Establezca límites de depósito o autoexclúyase.'
                  : 'bwin is committed to providing a secure and responsible gaming environment. Set deposit limits or self-exclude to lock account activity.'}
              </p>

              <div className="responsible-section">
                <h4>🛡️ {language === 'ru' ? 'Установить суточный лимит депозитов' : language === 'de' ? 'Tägliches Einzahlungslimit festlegen' : language === 'es' ? 'Establecer Límite Diario de Depósito' : 'Set Daily Deposit Limit'}</h4>
                <p className="rg-sub-desc">{language === 'ru' ? 'Ограничьте максимальную сумму средств, которую вы можете внести за любые 24 часа.' : language === 'de' ? 'Begrenzen Sie den maximalen Einzahlungsbetrag innerhalb eines 24-Stunden-Fensters.' : language === 'es' ? 'Limite los fondos máximos que puede depositar dentro de cualquier período de 24 horas.' : 'Limit the maximum funds you can deposit within any 24-hour window.'}</p>
                <div className="limit-slider-container">
                  <input 
                    type="range" 
                    min="50" 
                    max="5000" 
                    step="50" 
                    value={localLimit} 
                    onChange={(e) => setLocalLimit(parseInt(e.target.value))}
                    className="rg-slider"
                  />
                  <div className="slider-value-badge">€{localLimit.toFixed(2)}</div>
                </div>
                <button className="btn-save-limit" onClick={handleSaveLimit}>
                  {language === 'ru' ? 'Подтвердить лимит депозита' : language === 'de' ? 'Einzahlungslimit bestätigen' : language === 'es' ? 'Confirmar Límite de Depósito' : 'Confirm Deposit Limit'}
                </button>
              </div>

              <div className="responsible-section self-exclusion-block">
                <h4>⚠️ {language === 'ru' ? 'Временное самоисключение аккаунта' : language === 'de' ? 'Temporärer Selbstausschluss des Kontos' : language === 'es' ? 'Autoexclusión Temporal de la Cuenta' : 'Temporary Account Self-Exclusion'}</h4>
                <p className="rg-sub-desc">{language === 'ru' ? 'Заблокируйте свой аккаунт немедленно. Ставки будут полностью заблокированы.' : language === 'de' ? 'Sperren Sie Ihr Konto sofort. Platzieren von Wetten wird während dieser Zeit deaktiviert.' : language === 'es' ? 'Bloquee su cuenta de inmediato. Las apuestas se desactivarán por completo durante este tiempo.' : 'Lock your account immediately. Placing bets will be entirely disabled during this time.'}</p>
                
                {isSelfExcluded ? (
                  <div className="exclusion-active-indicator">
                    🔒 {language === 'ru' ? 'Аккаунт заблокирован. Исключение истекает через:' : language === 'de' ? 'Konto gesperrt. Ausschluss läuft ab in:' : language === 'es' ? 'Cuenta bloqueada. La exclusión vence en:' : 'Account Locked. Exclusion expires in:'} <span>{exclusionTimeLeftText}</span>
                  </div>
                ) : (
                  <div className="exclusion-inputs">
                    <select 
                      value={exclusionDuration} 
                      onChange={(e) => setExclusionDuration(e.target.value)}
                      className="rg-select"
                    >
                      <option value="60">{language === 'ru' ? '1 минута' : language === 'de' ? '1 Minute' : language === 'es' ? '1 minuto' : '1 Minute'}</option>
                      <option value="86400">{language === 'ru' ? '24 часа' : language === 'de' ? '24 Stunden' : language === 'es' ? '24 Horas' : '24 Hours'}</option>
                      <option value="604800">{language === 'ru' ? '7 дней' : language === 'de' ? '7 Tage' : language === 'es' ? '7 Días' : '7 Days'}</option>
                    </select>
                    <button className="btn-exclude-action" onClick={handleConfirmExclusion}>
                      {language === 'ru' ? 'Подтвердить самоисключение' : language === 'de' ? 'Selbstausschluss bestätigen' : language === 'es' ? 'Confirmar Autoexclusión' : 'Confirm Self-Exclusion'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ HELP CENTER ════ */}
          {activeTab === 'Help Center' && (
            <div className="fm-content-pane fade-in scrollable-y">
              <div className="faq-search-wrapper">
                <input 
                  type="text" 
                  placeholder={language === 'ru' ? '🔍 Поиск FAQ (например, вывод, выплаты, экспресс)...' : language === 'de' ? '🔍 FAQs durchsuchen (z.B. Auszahlung, Kombi)...' : language === 'es' ? '🔍 Buscar preguntas frecuentes (payout, retiro)...' : '🔍 Search FAQs (e.g. payout, withdraw, multi)...'}
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="faq-search-input"
                />
              </div>

              <div className="faqs-list">
                {filteredFAQs.map((faq, idx) => (
                  <div key={idx} className={`faq-item ${expandedFaqIndex === idx ? 'expanded' : ''}`}>
                    <div className="faq-question" onClick={() => setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)}>
                      <span>{faq.q}</span>
                      <span className="faq-arrow">{expandedFaqIndex === idx ? '▲' : '▼'}</span>
                    </div>
                    {expandedFaqIndex === idx && (
                      <div className="faq-answer fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
                {filteredFAQs.length === 0 && (
                  <div className="faq-empty-state">{language === 'ru' ? 'Вопросы не найдены.' : language === 'de' ? 'Keine passenden Fragen gefunden.' : language === 'es' ? 'No se encontraron preguntas frecuentes.' : 'No FAQs found matching your query.'}</div>
                )}
              </div>
            </div>
          )}

          {/* ════ CONTACT US ════ */}
          {activeTab === 'Contact Us' && (
            <div className="fm-content-pane fade-in scrollable-y">
              <p>
                {language === 'ru'
                  ? 'Нужна помощь? Отправьте тикет ниже или запустите сессию лайв чата с нашим ботом.'
                  : language === 'de'
                  ? 'Benötigen Sie Hilfe? Reichen Sie unten ein Ticket ein oder starten Sie einen Live-Chat, um sofort mit unserem Bot zu sprechen.'
                  : language === 'es'
                  ? '¿Necesita ayuda? Envíe un boleto a continuación o inicie una sesión de chat en vivo con nuestro bot de soporte.'
                  : 'Need support? Submit a ticket below, or open a live chat session to talk to our automated bwin support bot immediately.'}
              </p>
              
              <div className="contact-methods-wrapper">
                <form className="contact-ticket-form" onSubmit={handleContactSubmit}>
                  <h4>{language === 'ru' ? 'Отправить email запрос' : language === 'de' ? 'E-Mail-Ticket einreichen' : language === 'es' ? 'Enviar boleto de correo electrónico' : 'Submit an Email Ticket'}</h4>
                  <div className="input-group">
                    <label>{language === 'ru' ? 'Тема' : language === 'de' ? 'Betreff' : language === 'es' ? 'Asunto' : 'Subject'}</label>
                    <select value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} className="rg-select">
                      <option value="general">{language === 'ru' ? 'Общие вопросы' : language === 'de' ? 'Allgemeine Anfrage' : language === 'es' ? 'Consulta General' : 'General Inquiry'}</option>
                      <option value="payments">{language === 'ru' ? 'Депозиты и выводы' : language === 'de' ? 'Ein- & Auszahlungen' : language === 'es' ? 'Depósitos y Retiros' : 'Deposits & Withdrawals'}</option>
                      <option value="responsible">{language === 'ru' ? 'Ответственная игра' : language === 'de' ? 'Verantwortungsvolles Spielen' : language === 'es' ? 'Límites de Juego Responsable' : 'Responsible Gaming Limits'}</option>
                      <option value="technical">{language === 'ru' ? 'Техническая поддержка' : language === 'de' ? 'Technischer Support' : language === 'es' ? 'Soporte Técnico' : 'Technical Support'}</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>{language === 'ru' ? 'Ваш Email адрес' : language === 'de' ? 'Ihre E-Mail-Adresse' : language === 'es' ? 'Su correo electrónico' : 'Your Email Address'}</label>
                    <input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={contactEmail} 
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="rg-input"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>{language === 'ru' ? 'Детальное описание' : language === 'de' ? 'Detaillierte Nachricht' : language === 'es' ? 'Mensaje detallado' : 'Detailed Message'}</label>
                    <textarea 
                      placeholder={language === 'ru' ? 'Опишите вашу проблему...' : language === 'de' ? 'Beschreiben Sie Ihr Problem...' : language === 'es' ? 'Describa su problema...' : 'Describe your issue...'}
                      value={contactMessage} 
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="rg-textarea"
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn-save-limit">{language === 'ru' ? 'Отправить запрос' : language === 'de' ? 'Ticket einreichen' : language === 'es' ? 'Enviar Boleto' : 'Submit Ticket'}</button>
                </form>

                <div className="contact-live-chat-card">
                  <h4>💬 {language === 'ru' ? 'Интерактивный лайв чат' : language === 'de' ? 'Interaktiver Live-Chat' : language === 'es' ? 'Chat en Vivo Interactivo' : '💬 Interactive Live Chat'}</h4>
                  <p>{language === 'ru' ? 'Получайте ответы о балансе, ставках и общих правилах моментально.' : language === 'de' ? 'Erhalten Sie sofort Antworten auf Fragen zu Guthaben, Abrechnungen und allgemeinen Regeln.' : language === 'es' ? 'Obtenga respuestas sobre saldo de cuenta, reglas y liquidación al instante.' : 'Get answers to account balance questions, settlement guidelines, and general rules instantly.'}</p>
                  <button className="btn-start-chat" onClick={() => { onStartLiveChat(); onClose(); }}>
                    {language === 'ru' ? 'Запустить чат поддержки' : language === 'de' ? 'Live-Support-Chat starten' : language === 'es' ? 'Iniciar Chat de Soporte' : 'Start Live Support Chat'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ DEPOSITS & WITHDRAWALS ════ */}
          {activeTab === 'Deposits & Withdrawals' && (
            <div className="fm-content-pane fade-in scrollable-y">
              <h4>{language === 'ru' ? 'Поддерживаемые платежные методы' : language === 'de' ? 'Unterstützte Zahlungsmethoden' : language === 'es' ? 'Métodos de Pago Soportados' : 'Supported Payment Methods'}</h4>
              <table className="fm-payment-table">
                <thead>
                  <tr>
                    <th>{language === 'ru' ? 'Метод' : language === 'de' ? 'Methode' : language === 'es' ? 'Método' : 'Method'}</th>
                    <th>{language === 'ru' ? 'Тип операции' : language === 'de' ? 'Typ' : language === 'es' ? 'Tipo' : 'Type'}</th>
                    <th>{language === 'ru' ? 'Время обработки' : language === 'de' ? 'Bearbeitungszeit' : language === 'es' ? 'Tiempo de proceso' : 'Processing Time'}</th>
                    <th>{language === 'ru' ? 'Лимиты (Мин/Макс)' : language === 'de' ? 'Limits (Min/Max)' : language === 'es' ? 'Límites (Mín/Máx)' : 'Limits (Min/Max)'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Visa / MasterCard</td>
                    <td>{language === 'ru' ? 'Депозит / Вывод' : language === 'de' ? 'Ein- / Auszahlung' : language === 'es' ? 'Depósito / Retiro' : 'Deposit / Withdrawal'}</td>
                    <td>Instant (Dep) / 1-3 Days (With)</td>
                    <td>€10.00 / €5,000.00</td>
                  </tr>
                  <tr>
                    <td>PayPal</td>
                    <td>{language === 'ru' ? 'Депозит / Вывод' : language === 'de' ? 'Ein- / Auszahlung' : language === 'es' ? 'Depósito / Retiro' : 'Deposit / Withdrawal'}</td>
                    <td>Instant (Dep) / Instant (With)</td>
                    <td>€10.00 / €10,000.00</td>
                  </tr>
                  <tr>
                    <td>Skrill / Neteller</td>
                    <td>{language === 'ru' ? 'Депозит / Вывод' : language === 'de' ? 'Ein- / Auszahlung' : language === 'es' ? 'Depósito / Retiro' : 'Deposit / Withdrawal'}</td>
                    <td>Instant (Dep) / Instant (With)</td>
                    <td>€10.00 / €10,000.00</td>
                  </tr>
                  <tr>
                    <td>Bank Transfer</td>
                    <td>{language === 'ru' ? 'Только вывод' : language === 'de' ? 'Nur Auszahlung' : language === 'es' ? 'Solo retiro' : 'Withdrawal Only'}</td>
                    <td>3-5 Business Days</td>
                    <td>€20.00 / €50,000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ════ BETTING RULES ════ */}
          {activeTab === 'Betting Rules' && (
            <div className="fm-content-pane fade-in scrollable-y">
              <h4>{language === 'ru' ? 'Глоссарий и правила ставок' : language === 'de' ? 'Glossar & Wettrichtlinien' : language === 'es' ? 'Glosario y Reglas de Apuesta' : 'Glossary & Betting Guidelines'}</h4>
              
              <div className="glossary-list">
                {language === 'ru' ? (
                  <>
                    <div className="glossary-item">
                      <h5>Ординар (одиночная ставка)</h5>
                      <p>Ставка на один исход. Если команда выигрывает, вы получаете выплату в размере Ставка &times; Коэффициент.</p>
                    </div>
                    <div className="glossary-item">
                      <h5>Экспресс (комбинированная ставка)</h5>
                      <p>Объединяет 2 или более исходов. Все исходы должны выиграть для выплаты. Выплата: Ставка &times; Общий коэффициент.</p>
                    </div>
                    <div className="glossary-item">
                      <h5>Система</h5>
                      <p>Позволяет размещать комбинации исходов (например, система 2/3). Вы можете получить выплату, даже если один или несколько исходов проиграют.</p>
                    </div>
                    <div className="glossary-item">
                      <h5>Выкуп ставки (Cash Out)</h5>
                      <p>Позволяет рассчитать купон до завершения игры. Сумма рассчитывается динамически на основе текущих лайв коэффициентов.</p>
                    </div>
                  </>
                ) : language === 'de' ? (
                  <>
                    <div className="glossary-item">
                      <h5>Einzelwette</h5>
                      <p>Eine Wette auf ein einzelnes Ereignis. Wenn Ihre Auswahl gewinnt, erhalten Sie Einsatz &times; Quote.</p>
                    </div>
                    <div className="glossary-item">
                      <h5>Kombiwette</h5>
                      <p>Kombiniert 2 oder mehr Auswahlen auf einem Schein. Alle müssen gewinnen, um auszuzahlen. Gewinn: Einsatz &times; Gesamtquote.</p>
                    </div>
                    <div className="glossary-item">
                      <h5>Systemwette</h5>
                      <p>Erlaubt Kombinationen von Auswahlen (z.B. 2/3 System). Sie können auch gewinnen, wenn eine Auswahl verliert.</p>
                    </div>
                    <div className="glossary-item">
                      <h5>Cash Out-Option</h5>
                      <p>Rechnet einen Wettschein vorzeitig ab. Die Auszahlung wird dynamisch durch die aktuellen Live-Quoten berechnet.</p>
                    </div>
                  </>
                ) : language === 'es' ? (
                  <>
                    <div className="glossary-item">
                      <h5>Apuesta Simple</h5>
                      <p>Una apuesta sobre una sola selección. Si su equipo gana, usted recibe Importe &times; Cuota.</p>
                    </div>
                    <div className="glossary-item">
                      <h5>Apuesta Combinada</h5>
                      <p>Combina 2 o más selecciones en un boleto. Todas deben ganar para que se pague. Retorno: Importe &times; Cuota combinada.</p>
                    </div>
                    <div className="glossary-item">
                      <h5>Apuesta de Sistema</h5>
                      <p>Permite colocar combinaciones de selecciones (ej. sistema 2/3). Aún puede ganar si una selección pierde.</p>
                    </div>
                    <div className="glossary-item">
                      <h5>Opción de Cash Out</h5>
                      <p>Liquida un boleto temprano antes de que termine el juego. El pago se determina dinámicamente según las cuotas en vivo.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="glossary-item">
                      <h5>Single Bet</h5>
                      <p>A wager placed on a single selection. If your team wins, you receive Stake &times; Selection Odds.</p>
                    </div>
                    <div className="glossary-item">
                      <h5>Multi Bet (Accumulator)</h5>
                      <p>Combines 2 or more selections on one slip. All selections must win for the payout to trigger. Returns: Stake &times; Combined Odds.</p>
                    </div>
                    <div className="glossary-item">
                      <h5>System Bet</h5>
                      <p>Allows placing combinations of selections (e.g. 2/3 system). You can still win returns even if one or more selections lose.</p>
                    </div>
                    <div className="glossary-item">
                      <h5>Cash Out Option</h5>
                      <p>Settles a ticket early before the game ends. The payout is determined dynamically by the current live odds of the pending matches.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FooterModal;
