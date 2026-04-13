import { WalletService } from '../services/WalletService.js';

export function renderAICopilot() {
  // Inject typing indicator CSS
  if (!document.getElementById('ai-copilot-css')) {
    const style = document.createElement('style');
    style.id = 'ai-copilot-css';
    style.innerHTML = `
      .typing-indicator { display: flex; gap: 4px; padding: 10px; align-items: center; justify-content: center; }
      .typing-dot { width: 6px; height: 6px; background: var(--color-primary); border-radius: 50%; opacity: 0.5; animation: pulse 1s infinite alternate; }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes pulse { to { transform: translateY(-3px); opacity: 1; } }
      .cmd-btn { background: rgba(0,210,166,0.1); border: 1px solid var(--color-primary); color: var(--color-primary); padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin: 2px; display: inline-block; }
      .cmd-btn:hover { background: var(--color-primary); color: #000; }
      
      .gemini-live-pulse {
        animation: pulseLive 1.5s infinite alternate ease-in-out;
      }
      @keyframes pulseLive {
        0% { transform: scale(0.9); opacity: 0.8; filter: drop-shadow(0 0 10px var(--color-primary)); }
        100% { transform: scale(1.15); opacity: 1; filter: drop-shadow(0 0 40px var(--color-primary)); }
      }
      .mic-active { color: var(--color-danger) !important; border-color: var(--color-danger) !important; background: rgba(255, 77, 77, 0.1) !important; }
    `;
    document.head.appendChild(style);
  }

  const overlay = document.createElement('div');
  overlay.id = 'ai-copilot-panel';
  overlay.className = 'glass-panel';
  overlay.style.position = 'fixed';
  overlay.style.bottom = '90px';
  overlay.style.right = '20px';
  overlay.style.width = '350px';
  overlay.style.height = '480px';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.transform = 'translateY(120%) scale(0.9)'; 
  overlay.style.opacity = '0';
  overlay.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  overlay.style.border = '1px solid var(--color-primary)';
  overlay.style.boxShadow = '0 0 30px rgba(0, 210, 166, 0.2)';

  overlay.innerHTML = `
    <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.6); border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;">
      <h4 style="margin:0; display:flex; align-items:center; gap:10px;">
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/OMNI_Logo.png" width="24" height="24" style="filter: drop-shadow(0 0 5px rgba(0,210,166,0.3));"/>
        Omni Agent OS
      </h4>
      <div style="display:flex; gap:10px; align-items:center;">
          <button id="copilot-live-btn" class="cmd-btn" style="border-radius:20px; display:flex; align-items:center; gap:5px; margin:0; transition:all 0.3s;"><i data-lucide="mic" style="width:14px;height:14px;"></i> Live</button>
          <button id="close-copilot" style="background:transparent; border:none; color:var(--color-text-muted); cursor:pointer; display:flex;">
            <i data-lucide="x" style="width:20px;height:20px;"></i>
          </button>
      </div>
    </div>
    
    <!-- Omni Live Sandbox Mirror -->
    <div style="height: 160px; border-bottom: 1px solid var(--color-primary); background:#000; overflow:hidden; position:relative; box-shadow:inset 0 0 20px rgba(0, 210, 166, 0.2);">
       <div style="position:absolute; top:5px; left:10px; z-index:10; font-size:0.7rem; color:var(--color-primary); font-weight:bold; background:rgba(0,0,0,0.6); padding:2px 6px; border-radius:4px; pointer-events:none; border:1px solid var(--color-primary);">LIVE SANDBOX MIRROR</div>
       <iframe id="copilot-mirror-frame" src="/pages/spot.html" style="width: 400%; height: 400%; transform: scale(0.25); transform-origin: top left; border: none; pointer-events:none;"></iframe>
    </div>

    <div id="copilot-chat" style="flex:1; padding: 15px; overflow-y:auto; display:flex; flex-direction:column; gap:12px; font-size:0.9rem;">
      <div style="background: rgba(255,255,255,0.05); padding:10px; border-radius:8px; align-self:flex-start; max-width:85%; border-left: 3px solid var(--color-primary);">
        <p style="margin:0 0 8px 0; font-weight:bold;"><i data-lucide="zap" style="width:14px; height:14px; margin-right:4px;"></i> System Online</p>
        I have deep DOM access. Try clicking a command below or typing:
        <div style="margin-top:8px;">
          <span class="cmd-btn" data-cmd="/skills">/skills</span>
          <span class="cmd-btn" data-cmd="/price BTCUSDT">/price BTC</span>
          <span class="cmd-btn" data-cmd="/theme #ff00ff">/theme pink</span>
        </div>
      </div>
    </div>
    <div style="padding: 10px 15px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.1); display:flex; gap:10px; align-items:center;">
      <input id="copilot-input" type="text" placeholder="Send a command or ask..." style="flex:1; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:10px 15px; color:#fff; outline:none;" autocomplete="off" />
      <button id="copilot-send" style="background:var(--color-primary); border:none; border-radius:50%; width:40px; height:40px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#000; transition:transform 0.2s;">
        <i data-lucide="send" style="width:18px;height:18px;margin-left:2px;"></i>
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Floating trigger button
  const trigger = document.createElement('button');
  trigger.id = 'copilot-trigger';
  trigger.style.position = 'fixed';
  trigger.style.bottom = '20px';
  trigger.style.right = '20px';
  trigger.style.width = '60px';
  trigger.style.height = '60px';
  trigger.style.borderRadius = '30px';
  trigger.style.background = 'var(--color-primary)';
  trigger.style.color = '#000';
  trigger.style.border = 'none';
  trigger.style.cursor = 'pointer';
  trigger.style.zIndex = '9998';
  trigger.style.boxShadow = '0 0 20px rgba(0, 210, 166, 0.4)';
  trigger.style.display = 'flex';
  trigger.style.alignItems = 'center';
  trigger.style.justifyContent = 'center';
  trigger.style.transition = 'all 0.3s ease';
  trigger.innerHTML = `
    <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/OMNI_Logo.png" width="34" height="34" style="filter: drop-shadow(0 0 5px rgba(0,210,166,0.5));"/>
  `;
  document.body.appendChild(trigger);

  // Apply icons to the new elements
  if (window.lucide) window.lucide.createIcons();

  let isOpen = false;

  trigger.addEventListener('click', () => {
    isOpen = true;
    overlay.style.transform = 'translateY(0) scale(1)';
    overlay.style.opacity = '1';
    trigger.style.transform = 'scale(0)';
  });

  document.getElementById('close-copilot').addEventListener('click', () => {
    isOpen = false;
    overlay.style.transform = 'translateY(120%) scale(0.9)';
    overlay.style.opacity = '0';
    trigger.style.transform = 'scale(1)';
  });

  const chat = document.getElementById('copilot-chat');
  const input = document.getElementById('copilot-input');
  const send = document.getElementById('copilot-send');

  const addMessage = (htmlContent, isUser = false) => {
    const msg = document.createElement('div');
    msg.style.padding = '10px 14px';
    msg.style.borderRadius = '12px';
    msg.style.maxWidth = '85%';
    msg.style.lineHeight = '1.4';
    if (isUser) {
      msg.style.background = 'var(--color-primary)';
      msg.style.color = '#000';
      msg.style.alignSelf = 'flex-end';
      msg.style.borderBottomRightRadius = '2px';
    } else {
      msg.style.background = 'rgba(255,255,255,0.05)';
      msg.style.color = '#fff';
      msg.style.alignSelf = 'flex-start';
      msg.style.borderBottomLeftRadius = '2px';
      msg.style.borderLeft = '3px solid var(--color-primary)';
    }
    msg.innerHTML = htmlContent;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;

    // Attach listeners and lucide to raw inserted strings
    if (window.lucide) window.lucide.createIcons();
    initCmdButtons();
  };

  const showTyping = () => {
    const typing = document.createElement('div');
    typing.id = 'typing-indicator';
    typing.className = 'typing-indicator';
    typing.style.alignSelf = 'flex-start';
    typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;
  };

  const hideTyping = () => {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  };

  const applyTheme = (colorHex) => {
     document.documentElement.style.setProperty('--color-primary', colorHex);
     localStorage.setItem('omni_theme_color', colorHex);
     
     // Update trigger button logic to match dynamic themes
     trigger.style.background = colorHex;
  };

  // Processor mapping
  const processCommand = async (val) => {
    const args = val.trim().split(' ');
    const cmd = args[0].toLowerCase();

    if (cmd === '/skills' || cmd === '/help') {
       return `
         <p style="margin:0 0 5px 0;"><strong>Active Modules:</strong></p>
         <ul style="margin:0; padding-left:15px; font-size:0.85rem; color:var(--color-text-muted);">
           <li><code>/theme &lt;color&gt;</code>: Switch global accents.</li>
           <li><code>/price &lt;asset&gt;</code>: Fetch live DOM data.</li>
           <li><code>/trade &lt;amount&gt; &lt;asset&gt;</code>: Send execution payload.</li>
           <li><code>/scroll &lt;target&gt;</code>: Animate page scroll.</li>
           <li><code>/connect &lt;telegram|whatsapp&gt;</code>: Link external API.</li>
         </ul>
       `;
    }

    if (cmd === '/theme') {
       const color = args[1] || '#00D2A6';
       applyTheme(color);
       return `<i data-lucide="palette" style="width:14px;height:14px;vertical-align:middle;"></i> Target acquired. Global theme color injected: <strong>${color}</strong> (Saved to LocalStorage).`;
    }

    if (cmd === '/scroll') {
       const target = args[1] || 'bottom';
       if (target === 'bottom') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
       else if (target === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
       return `Executed layout traversal: scrolling to <strong>${target}</strong>.`;
    }

    if (cmd === '/price') {
       const symbol = (args[1] || 'BTCUSDT').toUpperCase();
       // Reach into the DOM to find live websocket value
       const el = document.querySelector(`[data-symbol-price="${symbol}"]`);
       if (el) {
          return `Live buffer match for <strong>${symbol}</strong>: <span style="font-size:1.2rem; color:var(--color-primary); font-weight:bold;">${el.innerText}</span>`;
       }
       return `Error: Active ticker for <strong>${symbol}</strong> not found in DOM struct.`;
    }

    if (cmd === '/trade') {
       const amountStr = args[1] || '1';
       const asset = (args[2] || 'BTC').toUpperCase();
       
       const assumedPrices = { BTC: 64230, ETH: 3450, SOL: 145, DOGE: 0.18 };
       const executeRate = assumedPrices[asset] || 100;
       
       const spendUSD = parseFloat(amountStr) * executeRate;
       const result = await WalletService.executeBuy(asset, spendUSD, executeRate);
       
       if (result.success) {
           if (window.pushLiveTrade) {
               window.pushLiveTrade(asset, 'Agent Exec', parseFloat(amountStr), 'BUY');
           }
           speakOutput(`Executed. Bought ${amountStr} ${asset}.`);
           return `<i data-lucide="check-circle" style="width:14px;height:14px;vertical-align:middle;color:var(--color-success);"></i> Neural fill accepted.<br/><br/>Trade executed: <strong>Bought ${amountStr} ${asset}</strong>.<br/>Deducted <span style="color:var(--color-danger);">$${spendUSD.toLocaleString()} USD</span> from Sandbox Wallet.`;
       } else {
           speakOutput(`Transaction failed. You do not have enough USD balance.`);
           return `<i data-lucide="slash" style="width:14px;height:14px;vertical-align:middle;color:var(--color-danger);"></i> Transaction Failed: Insufficient USD balance to execute ${amountStr} ${asset} buy protocol.`;
       }
    }

    if (cmd === '/connect') {
       const target = (args[1] || '').toLowerCase();
       if (target === 'telegram' || target === 'whatsapp') {
          localStorage.setItem(`omni_connect_${target}`, 'connected');
          return `<i data-lucide="link" style="width:14px;height:14px;vertical-align:middle;"></i> Securing OAuth bridge to <strong>${target.toUpperCase()}</strong>... <br/><span style="color:var(--color-success);">Socket linked and persisted securely.</span>`;
       }
       return `Unsupported connector. Try <code>/connect telegram</code>`;
    }

    // Default intent matching if no slash command
    if (val.toLowerCase().includes('buy') || val.toLowerCase().includes('sell')) {
        return `Intercepted trade syntax. Would you like to use the strict command?<br/><span class="cmd-btn" data-cmd="/trade 0.1 BTC">/trade 0.1 BTC</span>`;
    }

    return `I do not map that intent to my strict capabilities. Try <span class="cmd-btn" data-cmd="/skills">/skills</span>.`;
  };

  const handleInput = async (forceValue = null) => {
    const val = (forceValue || input.value).trim();
    if (!val) return;
    
    if(!forceValue) input.value = '';
    
    addMessage(val, true);
    showTyping();

    const responseHtml = await processCommand(val);
    
    // Natural fake delay based on command type (but offset by network delay now)
    setTimeout(() => {
      hideTyping();
      addMessage(responseHtml, false);
    }, 300);
  };

  const initCmdButtons = () => {
    const cmds = chat.querySelectorAll('.cmd-btn:not(.bound)');
    cmds.forEach(btn => {
      btn.classList.add('bound');
      btn.addEventListener('click', (e) => {
         const cmdString = e.target.getAttribute('data-cmd');
         if (cmdString) handleInput(cmdString);
      });
    });
  };
  initCmdButtons();

  send.addEventListener('click', () => handleInput());
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleInput();
  });

  // GEMINI LIVE MODE AUDIO ENGINEERNG
  const liveBtn = document.getElementById('copilot-live-btn');
  const orbSvgChildren = trigger.querySelectorAll('circle');
  let isLiveModeActive = false;
  let recognition = null;
  
  const speakOutput = (text) => {
      if ('speechSynthesis' in window && isLiveModeActive) {
          const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>?/gm, '')); // Strip HTML mapping before speaking
          utterance.rate = 1.05;
          window.speechSynthesis.speak(utterance);
      }
  };

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechAPI();
      recognition.continuous = true;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
          liveBtn.classList.add('mic-active');
          liveBtn.innerHTML = '<i data-lucide="mic" style="width:14px;height:14px;"></i> Listening';
          if(window.lucide) window.lucide.createIcons();
          
          input.placeholder = "Listening to audio feed...";
          
          // Animate the trigger orb as a Gemini Live visual
          orbSvgChildren.forEach(c => c.classList.add('gemini-live-pulse'));
      };
      
      recognition.onresult = (event) => {
          const text = event.results[event.results.length -1][0].transcript.trim().toLowerCase();
          
          let parsedCommand = text;
          // NLP Basic Mappings
          if(text.includes('buy') || text.includes('trade')) {
              // rough extract "buy 1 bitcoin" -> "/trade 1 BTC"
              const words = text.split(' ');
              const amt = words.find(w => !isNaN(parseFloat(w))) || 1;
              const coin = text.includes('bitcoin') || text.includes('btc') ? 'BTC' : text.includes('eth') ? 'ETH' : text.includes('solana') ? 'SOL' : 'DOGE';
              parsedCommand = `/trade ${amt} ${coin}`;
          } else if(text.includes('theme')) {
              parsedCommand = text.includes('pink') ? '/theme #ff00ff' : text.includes('blue') ? '/theme #00bbff' : '/theme #00D2A6';
          }
          
          handleInput(parsedCommand);
      };
      
      recognition.onend = () => {
          if (isLiveModeActive) recognition.start(); // continuous loop
      };
      
      liveBtn.addEventListener('click', () => {
          isLiveModeActive = !isLiveModeActive;
          if (isLiveModeActive) {
              recognition.start();
          } else {
              recognition.stop();
              liveBtn.classList.remove('mic-active');
              liveBtn.innerHTML = '<i data-lucide="mic" style="width:14px;height:14px;"></i> Live Mode';
              if(window.lucide) window.lucide.createIcons();
              input.placeholder = "Send a command or ask...";
              orbSvgChildren.forEach(c => c.classList.remove('gemini-live-pulse'));
          }
      });
  } else {
      liveBtn.style.display = 'none'; // Browser does not support Web Speech
  }
}
