import React, { useState, useRef, useEffect } from 'react';
import './LiveChatWidget.css';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface LiveChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  placedBetsCount: number;
  selfExclusionEndTime: number;
  language?: string;
}

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({
  isOpen,
  onClose,
  balance,
  placedBetsCount,
  selfExclusionEndTime,
  language = 'en'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set initial welcoming message in the correct language
  useEffect(() => {
    const getWelcomeMessage = () => {
      switch (language) {
        case 'ru':
          return "👋 Привет! Добро пожаловать в службу поддержки bwin. Я ваш автоматический помощник. Чем могу помочь? (Попробуйте ввести: 'баланс', 'ставки', 'блокировка' или 'вывод')";
        case 'de':
          return "👋 Hallo! Willkommen beim bwin Live-Support. Ich bin Ihr automatisierter Assistent. Wie kann ich Ihnen heute helfen? (Geben Sie ein: 'Guthaben', 'Wetten', 'Ausschluss' oder 'Auszahlung')";
        case 'es':
          return "👋 ¡Hola! Bienvenido al soporte en vivo de bwin. Soy su asistente automatizado. ¿Cómo puedo ayudarle hoy? (Escriba: 'saldo', 'apuestas', 'exclusión' o 'retiro')";
        default:
          return "👋 Hello! Welcome to bwin Live Support. I'm your automated assistant. How can I help you today? (Try typing: 'balance', 'bets', 'exclusion', or 'withdraw')";
      }
    };
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: getWelcomeMessage(),
        timestamp: new Date(),
      }
    ]);
  }, [language, isOpen]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    const query = inputText.toLowerCase().trim();
    setInputText('');
    setIsTyping(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      // eslint-disable-next-line no-useless-assignment
      let botResponseText = '';

      if (language === 'ru') {
        if (query.includes('привет') || query.includes('здравствуй') || query.includes('ку') || query.includes('хей')) {
          botResponseText = "Здравствуйте! Я автоматический агент bwin. Спросите меня о вашем 'балансе', ваших 'ставках' или 'блокировке', и я проверю информацию.";
        } else if (query.includes('баланс') || query.includes('деньги') || query.includes('средства') || query.includes('счет')) {
          botResponseText = `💰 Ваш текущий баланс на счете составляет €${balance.toFixed(2)}. Вы можете моментально внести €500.00 с помощью кнопки быстрого депозита (+) в шапке сайта!`;
        } else if (query.includes('ставк') || query.includes('билет') || query.includes('купон') || query.includes('экспресс') || query.includes('ординар')) {
          botResponseText = `🎫 Вы сделали ${placedBetsCount} ставок в этой сессии. Вы можете просмотреть их в любое время во вкладке "Мои ставки" на правой боковой панели.`;
        } else if (query.includes('блокировк') || query.includes('исключен') || query.includes('лимит') || query.includes('закрыт') || query.includes('бан')) {
          const excluded = selfExclusionEndTime > Date.now();
          if (excluded) {
            const secs = Math.ceil((selfExclusionEndTime - Date.now()) / 1000);
            botResponseText = `🔒 Ваш аккаунт заблокирован (самоисключение). Ставки недоступны еще ${secs} секунд.`;
          } else {
            botResponseText = "🛡️ Вы можете установить ежедневные лимиты депозитов или временно заблокировать аккаунт в разделе 'Ответственная игра' меню подвала.";
          }
        } else if (query.includes('вывод') || query.includes('депозит') || query.includes('выплат') || query.includes('оплат') || query.includes('деньги')) {
          botResponseText = "💳 Депозиты проводятся мгновенно. Выводы обрабатываются в течение 24 часов на вашу платежную систему (PayPal, Skrill, Visa).";
        } else if (query.includes('помощь') || query.includes('правил') || query.includes('вопрос') || query.includes('фак')) {
          botResponseText = "📚 Полные правила игры и глоссарий доступны в разделах 'Правила ставок' или 'Справочный центр' в меню подвала.";
        } else {
          botResponseText = "Я понимаю. Для вопросов конфиденциальности аккаунта или технической поддержки отправьте тикет в разделе 'Связаться с нами' или прочитайте документы Справочного центра.";
        }
      } else if (language === 'de') {
        if (query.includes('hallo') || query.includes('hi') || query.includes('hey') || query.includes('guten tag')) {
          botResponseText = "Hallo! Ich bin Ihr automatisierter bwin-Assistent. Fragen Sie mich nach Ihrem 'Guthaben', Ihren 'Wetten' oder Ihrem 'Ausschluss', und ich werde nachsehen.";
        } else if (query.includes('guthaben') || query.includes('geld') || query.includes('kontostand')) {
          botResponseText = `💰 Ihr aktuelles Guthaben beträgt €${balance.toFixed(2)}. Sie können sofort €500.00 über die Schnelleinzahlung (+) im Header hinzufügen!`;
        } else if (query.includes('wette') || query.includes('schein') || query.includes('wettschein')) {
          botResponseText = `🎫 Sie haben in dieser Sitzung ${placedBetsCount} Wette(n) platziert. Sie können diese jederzeit im Reiter "Meine Wetten" in der rechten Seitenleiste einsehen.`;
        } else if (query.includes('ausschluss') || query.includes('sperre') || query.includes('limit') || query.includes('sperren')) {
          const excluded = selfExclusionEndTime > Date.now();
          if (excluded) {
            const secs = Math.ceil((selfExclusionEndTime - Date.now()) / 1000);
            botResponseText = `🔒 Ihr Konto ist derzeit selbstgesperrt. Wetten ist für die nächsten ${secs} Sekunden gesperrt.`;
          } else {
            botResponseText = "🛡️ Sie können tägliche Einzahlungslimits festlegen oder Ihr Konto sperren (Selbstausschluss) in den 'Verantwortungsbewusstes Spielen'-Einstellungen im Fußbereich.";
          }
        } else if (query.includes('auszahlung') || query.includes('einzahlung') || query.includes('abheben') || query.includes('zahlen')) {
          botResponseText = "💳 Einzahlungen sind sofort verfügbar. Auszahlungen werden innerhalb von 24 Stunden auf Ihre bevorzugte Zahlungsmethode (PayPal, Skrill, Visa) abgewickelt.";
        } else if (query.includes('hilfe') || query.includes('regeln') || query.includes('faq')) {
          botResponseText = "📚 Die vollständigen Richtlinien und Wettregeln finden Sie in den Abschnitten 'Wettregeln' oder 'Hilfebereich' im Fußbereich.";
        } else {
          botResponseText = "Ich verstehe. Für Datenschutzfragen oder technische Fehlerbehebungen senden Sie bitte ein Ticket im Bereich 'Kontaktieren Sie uns' oder lesen Sie unsere Hilfe-Dokumente.";
        }
      } else if (language === 'es') {
        if (query.includes('hola') || query.includes('buenos dias') || query.includes('hey') || query.includes('buenas')) {
          botResponseText = "¡Hola! Soy su agente automatizado de bwin. Pregúnteme sobre su 'saldo', sus 'apuestas' o su 'exclusión' y buscaré la información.";
        } else if (query.includes('saldo') || query.includes('dinero') || query.includes('fondos') || query.includes('cuenta')) {
          botResponseText = `💰 Su saldo de cuenta actual es €${balance.toFixed(2)}. ¡Puede agregar €500.00 al instante usando el botón de depósito rápido (+) en el encabezado!`;
        } else if (query.includes('apuesta') || query.includes('boleto') || query.includes('cupon') || query.includes('ticket')) {
          botResponseText = `🎫 Ha realizado ${placedBetsCount} apuestas en esta sesión. Puede revisarlas en cualquier momento en la pestaña "Mis Apuestas" en la barra lateral derecha.`;
        } else if (query.includes('exclusion') || query.includes('bloqueo') || query.includes('excluir') || query.includes('limite') || query.includes('bloquear')) {
          const excluded = selfExclusionEndTime > Date.now();
          if (excluded) {
            const secs = Math.ceil((selfExclusionEndTime - Date.now()) / 1000);
            botResponseText = `🔒 Su cuenta está actualmente bajo autoexclusión activa. Las apuestas están bloqueadas durante los próximos ${secs} segundos.`;
          } else {
            botResponseText = "🛡️ Puede establecer límites de depósito diarios o bloquear su cuenta (autoexclusión) en la configuración de 'Juego Responsable' en el menú del pie de página.";
          }
        } else if (query.includes('retiro') || query.includes('deposito') || query.includes('pago') || query.includes('retirar') || query.includes('depositar')) {
          botResponseText = "💳 Los depósitos son instantáneos. Los retiros se procesan dentro de las 24 horas a su método de pago preferido (PayPal, Skrill, Visa).";
        } else if (query.includes('ayuda') || query.includes('regla') || query.includes('preguntas') || query.includes('faq')) {
          botResponseText = "📚 Para obtener pautas de juego completas, consulte las 'Reglas de Apuestas' o las preguntas frecuentes del 'Centro de Ayuda' en el menú del pie de página.";
        } else {
          botResponseText = "Comprendo. Para la privacidad de la cuenta o soporte técnico, envíe un ticket en la sección 'Contacto' o lea la documentación del Centro de Ayuda.";
        }
      } else {
        if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
          botResponseText = "Hello! I am your bwin automated agent. Ask me about your 'balance', your 'bets', or 'exclusions', and I'll look them up for you.";
        } else if (query.includes('balance') || query.includes('money') || query.includes('funds')) {
          botResponseText = `💰 Your current account balance is €${balance.toFixed(2)}. You can add €500.00 instantly using the Quick Deposit (+) button in the header!`;
        } else if (query.includes('bet') || query.includes('ticket') || query.includes('slip')) {
          botResponseText = `🎫 You have placed ${placedBetsCount} bet ticket(s) in this session. You can review them anytime in the "My Bets" tab on the right sidebar.`;
        } else if (query.includes('exclude') || query.includes('lock') || query.includes('exclusion') || query.includes('limit')) {
          const excluded = selfExclusionEndTime > Date.now();
          if (excluded) {
            const secs = Math.ceil((selfExclusionEndTime - Date.now()) / 1000);
            botResponseText = `🔒 Your account is currently under active self-exclusion. Betting is locked for the next ${secs} seconds.`;
          } else {
            botResponseText = "🛡️ You can set daily deposit limits or lock your account (self-exclusion) in the 'Responsible Gaming' settings of the footer menu.";
          }
        } else if (query.includes('withdraw') || query.includes('deposit') || query.includes('payout') || query.includes('pay')) {
          botResponseText = "💳 Deposits are instant. Withdrawals are processed within 24 hours back to your preferred payment method (PayPal, Skrill, Visa).";
        } else if (query.includes('help') || query.includes('rule') || query.includes('faq')) {
          botResponseText = "📚 For complete gaming guidelines and glossary, check the 'Betting Rules' or 'Help Center' FAQ search inside the footer menu.";
        } else {
          botResponseText = "I understand. For account privacy or technical troubleshooting, please submit a ticket in the 'Contact Us' section or read our Help Center docs.";
        }
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);
    }, 900);
  };

  const getHeaderText = () => {
    switch (language) {
      case 'ru': return { title: 'Помощник bwin', status: 'Всегда онлайн' };
      case 'de': return { title: 'bwin Assistent', status: 'Immer online' };
      case 'es': return { title: 'Asistente bwin', status: 'Siempre en línea' };
      default: return { title: 'bwin Assistant', status: 'Always Online' };
    }
  };

  const headerText = getHeaderText();

  return (
    <div className="live-chat-widget fade-in-chat">
      <header className="lc-header">
        <div className="lc-agent-info">
          <span className="lc-avatar-dot"></span>
          <div>
            <h4>{headerText.title}</h4>
            <span className="lc-status">{headerText.status}</span>
          </div>
        </div>
        <button className="lc-close-btn" onClick={onClose}>&times;</button>
      </header>

      <div className="lc-messages-container">
        {messages.map(msg => (
          <div key={msg.id} className={`lc-bubble-row ${msg.sender === 'user' ? 'lc-user-row' : 'lc-bot-row'}`}>
            <div className={`lc-bubble ${msg.sender === 'user' ? 'user-style' : 'bot-style'}`}>
              <p>{msg.text}</p>
              <span className="lc-time">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="lc-bubble-row lc-bot-row">
            <div className="lc-bubble bot-style lc-typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form className="lc-input-form" onSubmit={handleSendMessage}>
        <input 
          type="text" 
          placeholder={language === 'ru' ? 'Введите сообщение...' : language === 'de' ? 'Nachricht eingeben...' : language === 'es' ? 'Escriba un mensaje aquí...' : 'Type message here...'}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
          className="lc-input"
        />
        <button type="submit" disabled={isTyping || !inputText.trim()} className="lc-send-btn">
          {language === 'ru' ? 'Отправить' : language === 'de' ? 'Senden' : language === 'es' ? 'Enviar' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default LiveChatWidget;
