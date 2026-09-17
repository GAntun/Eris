const authScreen = document.getElementById('auth-screen');
        const chatScreen = document.getElementById('chat-screen');
        const authError = document.getElementById('auth-error');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginUsername = document.getElementById('login-username');
        const loginPassword = document.getElementById('login-password');
        const regUsername = document.getElementById('reg-username');
        const regPassword = document.getElementById('reg-password');
        const regAvatar = document.getElementById('reg-avatar');
        const messages = document.getElementById('messages');
        const form = document.getElementById('form');
        const input = document.getElementById('input');
        const channelList = document.getElementById('channel-list');
        const channelAddBtn = document.getElementById('channel-add-btn');
        const channelModal = document.getElementById('channel-modal');
        const channelModalTitle = document.getElementById('channel-modal-title');
        const channelModalTypeRow = document.getElementById('channel-modal-type-row');
        const channelModalType = document.getElementById('channel-modal-type');
        const channelModalName = document.getElementById('channel-modal-name');
        const channelModalDesc = document.getElementById('channel-modal-desc');
        const channelModalError = document.getElementById('channel-modal-error');
        const channelModalSaveBtn = document.getElementById('channel-modal-save-btn');
        const channelModalCancelBtn = document.getElementById('channel-modal-cancel-btn');
        const currentChannelEl = document.getElementById('current-channel');
        const channelDescEl = document.getElementById('current-channel-desc');
        const channelError = document.getElementById('channel-error');
        const sidebarAvatar = document.getElementById('sidebar-avatar');
        const sidebarUsername = document.getElementById('sidebar-username');
        const emojiBtn = document.getElementById('emoji-btn');
        const emojiPicker = document.getElementById('emoji-picker');
        const emojiGrid = document.getElementById('emoji-grid');
        const voicePanel = document.getElementById('voice-panel');
        const voiceUsers = document.getElementById('voice-users');
        const voiceChannelName = document.getElementById('voice-channel-name');
        const voiceError = document.getElementById('voice-error');
        const voiceMuteBtn = document.getElementById('voice-mute-btn');
        const voiceLeaveBtn = document.getElementById('voice-leave-btn');
        const settingsScreen = document.getElementById('settings-screen');
        const settingsClose = document.getElementById('settings-close');
        const settingsBtn = document.getElementById('settings-btn');
        const settingsNickname = document.getElementById('settings-nickname');
        const settingsNicknameSave = document.getElementById('settings-nickname-save');
        const settingsAvatarPreview = document.getElementById('settings-avatar-preview');
        const settingsAvatarInput = document.getElementById('settings-avatar-input');
        const settingsAvatarSave = document.getElementById('settings-avatar-save');
        const settingsCurrentPass = document.getElementById('settings-current-pass');
        const settingsNewPass = document.getElementById('settings-new-pass');
        const settingsPassSave = document.getElementById('settings-pass-save');
        const settingsError = document.getElementById('settings-error');
        const themeLightBtn = document.getElementById('theme-light-btn');
        const themeDarkBtn = document.getElementById('theme-dark-btn');
        const themeToggle = document.getElementById('theme-toggle');
        const sidebarUsernameId = document.getElementById('sidebar-username-id');
        const onlineUsersEl = document.getElementById('online-users');
        const onlineSidebar = document.getElementById('online-sidebar');
        const onlineResizeHandle = document.getElementById('online-resize-handle');
        const replyBanner = document.getElementById('reply-banner');
        const replyBannerName = document.getElementById('reply-banner-name');
        const replyBannerText = document.getElementById('reply-banner-text');
        const replyCancel = document.getElementById('reply-cancel');
        const pinnedBar = document.getElementById('pinned-bar');
        const pinnedList = document.getElementById('pinned-list');

        const api = (path) => '/eris' + path;

        const EMOJIS = ['😀','😁','😂','🤣','😊','😍','🥰','😘','😜','🤪','😎','🤩','🥳','😏','😒','😔','😢','😭','😅','😉','🙃','🫠','🤗','🤔','🫡','🤐','😷','🤒','🤕','🥺','😳','😱','😈','🤓','😤','😴','🤤','👻','💀','👽','🤖','💩','😺','😸','🐶','🐱','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦅','🦉','🦄','🐝','🦋','🐢','🐙','🦀','🐳','🐬','🦈','🐊','🌵','🎄','🌲','🌴','🌸','🌹','🌻','🌞','🌝','🌚','⭐','🌟','💫','⚡','🔥','💥','💦','💧','🌈','☀️','⛅','❄️','🌊','🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍒','🍑','🥭','🍍','🥥','🥑','🍆','🥦','🥕','🌽','🌶️','🍄','🥔','🍞','🧀','🥚','🍳','🥞','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🍜','🍣','🍤','🍦','🍩','🍪','🎂','🍰','🧁','🍫','🍬','🍭','🍺','🍻','🥂','☕','🍵','🧃','🥤','⚽','🏀','🏈','⚾','🎾','🏐','🏓','🏸','🏒','🥊','⛳','🏹','🎣','🎿','🏄','🚴','🤸','🧗','🏆','🥇','🥈','🥉','🏅','🎖️','🎯','🎮','🎲','🎰','🃏','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🪕','🎻','🎳','🏁','🚗','🚕','🚑','🚒','🚓','🚜','🏍️','🚲','✈️','🚀','🛸','🚁','⛵','🚢','🚉','🚦','🛑','💺','🗺️','🗽','🗼','🏰','🏯','🏠','💒','⛺','🏕️','🏖️','⛰️','🌋','🗻','🏔️','🎡','🎢','🎠','💡','🔦','🔑','🗝️','⚙️','🔧','🔨','🪓','🧲','🔩','📱','💻','🖥️','🖨️','⌨️','🖱️','💾','💿','📀','📷','📸','🎥','📽️','📺','📻','🎙️','⏰','⌚','📱','🔋','🧯','💊','💉','🩺','🚿','🛁','🪥','🪞','🪒','🧴','🧻','🧹','🧺','🧊','🏋️','🚴','🤼','🤽','🤾','🥌','🛹','🛼','🎱','🎯','🎳','🎰','🎲','♟️','🎴','🀄','🃏','🗒️','🗓️','📅','📆','📈','📉','📊','📋','📌','📍','📎','🖇️','📏','📐','✂️','🗃️','🗄️','🏷️','💰','💴','💵','💶','💷','💸','🪙','💳','🧾','🎁','🎀','🎊','🎉','🪅','🪆','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','🈳','✴️','❇️','✳️','💢','💥','💫','💦','💨','🕳️','💬','💭','🗯️','♨️','🔇','🔈','🔉','🔊','🔔','🔕','📣','📢','⏳','⌛','⏱️','⏲️','🕰️','🌙','☁️','⛸️','🎗️','🎟️','🎫','🎪','🤹','🎭','🗣️','👤','👥','🫂','👶','🧒','👦','👧','🧑','👨','👩','👴','👵','💂','👮','🕵️','👷']

        const SVG = {
            sun: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>',
            moon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
            micMuted: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="2" y1="2" x2="22" y2="22"></line></svg>',
            mic: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>',
            smile: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
            edit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
            trash: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
            close: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
            reply: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>',
            pin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"></path><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z"></path></svg>'
        };

        function isEmojiOnly(text) {
            return !/[A-Za-z0-9]/.test(text) && /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(text);
        }

        function cleanUrl(url) {
            let out = url;
            while (true) {
                const before = out;
                out = out.replace(/\s+$/, '')
                    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F300}-\u{1F5FF}\u2B00-\u2BFF]+$/u, '')
                    .replace(/[.,!?;:)\]}»]+$/, '')
                    .replace(/["'*_~`>]+$/, '')
                    .replace(/\u2026+$/, '');
                if (out === before) break;
            }
            return out;
        }

        function linkifyText(text) {
            const fragment = document.createDocumentFragment();
            const urlRe = /\b(?:https?:\/\/|www\.)[^\s<]+/gi;
            let last = 0;
            let match;
            while ((match = urlRe.exec(text)) !== null) {
                const url = cleanUrl(match[0]);
                if (match.index > last) {
                    fragment.appendChild(document.createTextNode(text.slice(last, match.index)));
                }
                const a = document.createElement('a');
                a.href = url.startsWith('www.') ? 'http://' + url : url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.className = 'text-blue-600 underline hover:text-blue-800 break-all';
                a.textContent = url;
                fragment.appendChild(a);
                last = match.index + match[0].length;
            }
            if (last < text.length) {
                fragment.appendChild(document.createTextNode(text.slice(last)));
            }
            return fragment;
        }

        let socket;
        let currentUsername;
        let selfNickname = '';
        let sessionAvatar = '';
        let currentChannel = 'general';
        let channels = [];
        let onlineUsers = [];
        let theme = localStorage.getItem('eris-theme') || 'light';
        let voiceState = {
            connected: false,
            stream: null,
            peers: new Map(),
            participants: [],
            speaking: new Set(),
            muted: false,
            byChannel: new Map()
        };

        const AVATAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

        function hashString(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
            }
            return Math.abs(hash);
        }

        function initials(name) {
            return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
        }

        function avatarColor(name) {
            return AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];
        }

        function showError(message) {
            authError.textContent = message;
            authError.classList.remove('hidden');
        }

        function clearError() {
            authError.textContent = '';
            authError.classList.add('hidden');
        }

        function showRegister() {
            clearError();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        }

        function showLogin() {
            clearError();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        }

        document.getElementById('show-register').addEventListener('click', showRegister);
        document.getElementById('show-login').addEventListener('click', showLogin);

        async function authenticate(endpoint, username, password) {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Authentication failed');
            return data;
        }

        async function register(username, password, avatarFile) {
            const body = new FormData();
            body.append('username', username);
            body.append('password', password);
            if (avatarFile) body.append('avatar', avatarFile);
            const res = await fetch(api('/register'), { method: 'POST', body });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');
            return data;
        }

        function enterChat(data) {
            authScreen.classList.add('hidden');
            chatScreen.classList.remove('hidden');
            currentUsername = data.username;
            selfNickname = data.nickname || data.username;
            sessionAvatar = data.avatar || '';
            sidebarUsername.textContent = selfNickname;
            sidebarUsernameId.textContent = '*' + data.username;
            applySidebarAvatar();
            messages.innerHTML = '';
            currentChannel = 'general';
            updateChannelHeader();
            connectSocket();
        }

        function updateChannelHeader() {
            currentChannelEl.textContent = currentChannel;
            const ch = channels.find((c) => c.name === currentChannel);
            channelDescEl.textContent = ch && ch.description ? ch.description : '';
        }

        function applyTheme(next) {
            theme = next || theme;
            localStorage.setItem('eris-theme', theme);
            document.body.classList.toggle('theme-dark', theme === 'dark');
            themeToggle.innerHTML = theme === 'dark' ? SVG.sun : SVG.moon;
            themeLightBtn.classList.toggle('bg-blue-500', theme === 'light');
            themeLightBtn.classList.toggle('text-white', theme === 'light');
            themeDarkBtn.classList.toggle('bg-blue-500', theme === 'dark');
            themeDarkBtn.classList.toggle('text-white', theme === 'dark');
        }

        function toggleTheme() {
            applyTheme(theme === 'dark' ? 'light' : 'dark');
        }

        function applySidebarAvatar() {
            sidebarAvatar.innerHTML = '';
            sidebarAvatar.appendChild(avatarEl(currentUsername, sessionAvatar));
        }

        function avatarEl(name, avatarUrl, sizeClass) {
            const SIZE = { 'w-5 h-5': 20, 'w-6 h-6': 24, 'w-8 h-8': 32, 'w-10 h-10': 40, 'w-12 h-12': 48, 'w-14 h-14': 56 };
            const px = SIZE[sizeClass] || (/^\d+px$/.test(sizeClass) ? parseInt(sizeClass, 10) : 32);
            const wrap = document.createElement('div');
            wrap.className = (sizeClass || 'w-8 h-8') + ' rounded-full shrink-0 overflow-hidden flex items-center justify-center text-white text-xs font-semibold select-none';
            wrap.style.width = px + 'px';
            wrap.style.height = px + 'px';
            wrap.style.fontSize = (px >= 40 ? 18 : 12) + 'px';
            wrap.style.backgroundColor = avatarUrl ? 'transparent' : avatarColor(name);
            if (avatarUrl) {
                const img = document.createElement('img');
                img.src = avatarUrl;
                img.alt = name + "'s avatar";
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                wrap.appendChild(img);
            } else {
                wrap.textContent = initials(name);
            }
            return wrap;
        }

        function addMessage(msg) {
            const item = document.createElement('li');
            item.className = 'flex items-start gap-3 py-2 px-4 border-b border-gray-100 group';
            item.dataset.id = msg._id;
            item.appendChild(avatarEl(msg.username || 'Unknown', msg.avatar));
            item.appendChild(buildMessageContent(msg));

            const time = document.createElement('span');
            time.className = 'text-xs text-gray-400 shrink-0 ml-auto self-start';
            time.textContent = formatTime(msg.createdAt);
            item.appendChild(time);

            const actions = document.createElement('span');
            actions.className = 'chat-actions flex flex-row items-center gap-1 rounded-md shrink-0 self-start ml-auto';
            actions.style.backgroundColor = 'rgba(127,127,127,0.15)';
            actions.style.padding = '2px 2px';
            actions.style.width = '144px';
            actions.style.minWidth = '144px';
            actions.style.justifyContent = 'flex-end';
            actions.appendChild(messageAction(SVG.reply, 'Reply', () => replyToMessage(msg)));
            const pinBtn = messageAction(SVG.pin, msg.pinned ? 'Unpin message' : 'Pin message', () => togglePin(msg));
            pinBtn.dataset.action = 'pin';
            if (msg.pinned) pinBtn.style.color = '#FEBE5D';
            actions.appendChild(pinBtn);
            if (msg.username === currentUsername) {
                actions.appendChild(messageAction(SVG.edit, 'Edit message', () => editMessage(msg)));
                actions.appendChild(messageAction(SVG.trash, 'Delete message', () => removeMessage(msg)));
            }
            item.appendChild(actions);

            messages.appendChild(item);
            scrollChatBottom();
        }

        function formatTime(iso) {
            const d = new Date(iso);
            if (!iso || isNaN(d.getTime())) return '';
            const hh = (d.getHours() < 10 ? '0' + d.getHours() : d.getHours());
            const mm = (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes());
            const dd = (d.getDate() < 10 ? '0' + d.getDate() : d.getDate());
            const mo = (d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1);
            const yyyy = d.getFullYear();
            return hh + ':' + mm + '  ' + dd + '-' + mo + '-' + yyyy;
        }

        function scrollChatBottom() {
            messages.scrollTop = messages.scrollHeight;
        }

        function buildMessageContent(msg) {
            const body = document.createElement('div');
            body.className = 'min-w-0 flex-1';
            const nameEl = document.createElement('span');
            nameEl.className = 'block text-xs font-semibold text-gray-500';
            nameEl.textContent = msg.nickname || msg.username || 'Unknown';
            body.appendChild(nameEl);
            if (msg.replyTo && msg.replyTo._id) {
                body.appendChild(replyQuote(msg.replyTo));
            }
            const textEl = document.createElement('span');
            textEl.style.whiteSpace = 'normal';
            textEl.style.wordBreak = 'break-word';
            textEl.style.overflowWrap = 'break-word';
            textEl.style.maxWidth = '100%';
            textEl.className = isEmojiOnly(msg.text)
                ? 'block text-gray-800 break-words text-4xl leading-normal'
                : 'block text-gray-800 break-words';
            if (isEmojiOnly(msg.text)) {
                textEl.textContent = msg.text;
            } else {
                textEl.appendChild(linkifyText(msg.text));
            }
            body.appendChild(nameEl);
            body.appendChild(textEl);
            if (msg.youtube && msg.youtube.id) {
                body.appendChild(youtubeCard(msg.youtube));
            } else if (msg.og && (msg.og.title || msg.og.image)) {
                body.appendChild(ogCard(msg.og));
            }
            return body;
        }

        function replyQuote(r) {
            const q = document.createElement('div');
            q.style.cssText = 'border-left:2px solid #9ca3af;padding-left:8px;margin:4px 0;cursor:pointer;font-size:12px;color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
            const nameSp = document.createElement('span');
            nameSp.style.fontWeight = '600';
            nameSp.textContent = r.nickname || r.username || 'Unknown';
            const textSp = document.createElement('span');
            textSp.textContent = (r.text || '').length > 120
                ? (r.text || '').slice(0, 120) + '…'
                : (r.text || '');
            q.appendChild(nameSp);
            q.appendChild(document.createTextNode(': '));
            q.appendChild(textSp);
            q.title = 'Jump to message';
            q.addEventListener('click', (e) => {
                e.stopPropagation();
                jumpToMessage(r._id);
            });
            return q;
        }

        function messageAction(icon, title, onClick) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'p-1 rounded-md text-xs hover:bg-gray-100 text-gray-400 flex items-center justify-center';
            btn.style.width = '32px';
            btn.style.height = '32px';
            btn.innerHTML = icon;
            btn.title = title;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                onClick();
            });
            return btn;
        }

        async function editMessage(msg) {
            const reply = prompt('Edit message:', msg.text);
            if (reply === null) return;
            const text = reply.trim();
            if (!text || text === msg.text) return;
            const res = await fetch(api('/messages/' + msg._id), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Failed to edit message');
                return;
            }
            msg.text = data.text;
        }

        async function removeMessage(msg) {
            if (!confirm('Delete this message?')) return;
            const res = await fetch(api('/messages/' + msg._id), { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Failed to delete message');
            }
        }

        function ogCard(og) {
            const link = document.createElement('a');
            link.href = og.url || '#';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'mt-1 block max-w-md border border-gray-200 rounded-lg overflow-hidden hover:bg-gray-50 no-underline';

            if (og.image) {
                const img = document.createElement('img');
                img.src = og.image;
                img.alt = '';
                img.loading = 'lazy';
                img.className = 'w-full max-h-40 object-cover';
                img.addEventListener('error', () => img.remove());
                link.appendChild(img);
            }

            const info = document.createElement('div');
            info.className = 'p-3';

            if (og.siteName) {
                const site = document.createElement('div');
                site.className = 'text-xs text-gray-400 font-medium';
                site.textContent = og.siteName;
                info.appendChild(site);
            }
            if (og.title) {
                const title = document.createElement('div');
                title.className = 'text-sm font-semibold text-gray-900 line-clamp-2';
                title.textContent = og.title;
                info.appendChild(title);
            }
            if (og.description) {
                const desc = document.createElement('div');
                desc.className = 'text-xs text-gray-500 line-clamp-3 mt-1';
                desc.textContent = og.description;
                info.appendChild(desc);
            }

            link.appendChild(info);
            return link;
        }

        function youtubeCard(yt) {
            const container = document.createElement('div');
            container.className = 'mt-1 max-w-lg bg-white border border-gray-200 rounded-lg overflow-hidden no-underline';

            const iframe = document.createElement('iframe');
            iframe.width = '560';
            iframe.height = '315';
            iframe.src = 'https://www.youtube.com/embed/' + yt.id;
            iframe.title = 'YouTube video player';
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            iframe.allowFullscreen = true;
            iframe.loading = 'lazy';
            iframe.className = 'w-full max-w-full border-0';
            container.appendChild(iframe);

            if (yt.title || yt.author) {
                const info = document.createElement('div');
                info.className = 'p-3 bg-white';
                const title = document.createElement('div');
                title.className = 'text-sm font-semibold text-gray-900 line-clamp-2';
                title.textContent = yt.title || 'YouTube video';
                info.appendChild(title);
                const meta = document.createElement('div');
                meta.className = 'text-xs text-gray-400 mt-0.5';
                meta.textContent = '▶ YouTube' + (yt.author ? ' · ' + yt.author : '');
                info.appendChild(meta);
                container.appendChild(info);
            }

            return container;
        }

        function renderChannelList() {
            channelList.innerHTML = '';
            voiceSublistEls.clear();
            channels.filter((c) => c.type !== 'voice').forEach((ch) => appendChannelItem(ch, '# ' + ch.name));
            channels.filter((c) => c.type === 'voice').forEach((ch) => {
                appendChannelItem(ch, '🎤 ' + ch.name);
                channelList.appendChild(voiceSublist(ch));
            });
        }

        function renderOnlineUsers() {
            if (!onlineUsersEl) return;
            onlineUsersEl.innerHTML = '';
            const sorted = onlineUsers.slice().sort((a, b) =>
                (a.nickname || a.username).localeCompare(b.nickname || b.username));
            sorted.forEach((u) => {
                const li = document.createElement('li');
                li.className = 'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm' +
                    (u.username === currentUsername ? ' bg-gray-800' : '');
                li.style.display = 'flex';
                li.style.alignItems = 'center';
                li.style.gap = '8px';
                li.appendChild(avatarEl(u.username, u.avatar, '32px'));
                const name = document.createElement('span');
                name.className = 'truncate text-gray-300 flex-1 min-w-0';
                name.style.flex = '1';
                name.style.minWidth = '0';
                name.style.overflow = 'hidden';
                name.style.textOverflow = 'ellipsis';
                name.style.whiteSpace = 'nowrap';
                name.textContent = (u.nickname || u.username) + (u.username === currentUsername ? ' (you)' : '');
                li.appendChild(name);
                onlineUsersEl.appendChild(li);
            });
        }

        function voiceSublist(ch) {
            const ul = document.createElement('ul');
            ul.dataset.voiceChannel = ch.name;
            ul.className = 'ml-5 space-y-0.5 my-0.5';
            const users = voiceState.byChannel.get(ch.name) || [];
            users.forEach((u) => {
                const li = document.createElement('li');
                li.className = 'flex items-center gap-2 px-3 py-0.5 text-xs text-gray-400 rounded';
                if (ch.name === currentChannel && voiceState.connected && voiceState.speaking.has(u.username)) {
                    li.classList.remove('text-gray-400');
                    li.classList.add('text-green-400');
                }
                li.appendChild(avatarEl(u.username, u.avatar, 'w-5 h-5'));
                const span = document.createElement('span');
                span.className = 'truncate';
                span.textContent = (u.nickname || u.username) + (u.username === currentUsername ? ' (you)' : '');
                li.appendChild(span);
                voiceSublistEls.set(ch.name + '|' + u.username, li);
                ul.appendChild(li);
            });
            return ul;
        }

        function appendChannelItem(ch, label) {
            const li = document.createElement('li');
            li.className = 'group flex items-center';
            const btn = document.createElement('button');
            btn.className = 'w-0 flex-1 text-left px-3 py-2 rounded-md text-sm' +
                (ch.name === currentChannel ? ' bg-blue-600' : ' hover:bg-gray-800 text-gray-300');
            btn.textContent = label;
            btn.addEventListener('click', () => switchChannel(ch.name));
            li.appendChild(btn);

            const actions = document.createElement('span');
            actions.className = 'hidden group-hover:flex items-center gap-1 pr-2 shrink-0';
            actions.appendChild(createChannelAction(SVG.edit, 'Rename channel', () => renameChannel(ch)));
            actions.appendChild(createChannelAction(SVG.trash, 'Remove channel', () => removeChannel(ch)));
            li.appendChild(actions);
            channelList.appendChild(li);
        }

        function createChannelAction(icon, title, onClick) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'p-1 rounded-md text-sm hover:bg-gray-600 text-gray-400 flex items-center justify-center';
            btn.innerHTML = icon;
            btn.title = title;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                onClick();
            });
            return btn;
        }

        function renameChannel(ch) {
            openChannelModal('rename', ch);
        }

        let channelModalMode = 'create';
        let channelModalTarget = null;

        function openChannelModal(mode, ch) {
            channelModalMode = mode;
            channelModalTarget = ch || null;
            channelModalError.textContent = '';
            channelModalError.classList.add('hidden');
            if (mode === 'create') {
                channelModalTitle.textContent = 'Create Channel';
                channelModalTypeRow.classList.remove('hidden');
                channelModalType.value = 'text';
                channelModalName.value = '';
                channelModalDesc.value = '';
            } else {
                channelModalTitle.textContent = 'Rename Channel';
                channelModalTypeRow.classList.add('hidden');
                channelModalName.value = ch.name;
                channelModalDesc.value = ch.description || '';
            }
            channelModal.classList.remove('hidden');
            channelModalName.focus();
        }

        function closeChannelModal() {
            channelModal.classList.add('hidden');
            channelModalTarget = null;
        }

        async function saveChannelModal() {
            const name = channelModalName.value.trim();
            const description = channelModalDesc.value.trim().slice(0, 200);
            if (!name) {
                channelModalError.textContent = 'Channel name is required';
                channelModalError.classList.remove('hidden');
                return;
            }
            if (channelModalMode === 'create') {
                const res = await fetch(api('/channels'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, type: channelModalType.value, description })
                });
                const data = await res.json();
                if (!res.ok) {
                    channelModalError.textContent = data.error || 'Failed to create channel';
                    channelModalError.classList.remove('hidden');
                    return;
                }
                channels = await (await fetch(api('/channels'))).json();
                renderChannelList();
                switchChannel(data.name);
            } else {
                const ch = channelModalTarget;
                let updatedName = ch.name;
                if (name !== ch.name) {
                    const res = await fetch(api('/channels/' + encodeURIComponent(ch.name)), {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name })
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        channelModalError.textContent = data.error || 'Rename failed';
                        channelModalError.classList.remove('hidden');
                        return;
                    }
                    updatedName = data.name;
                }
                await fetch(api('/channels/' + encodeURIComponent(updatedName) + '/description'), {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description })
                });
                channels = await (await fetch(api('/channels'))).json();
                renderChannelList();
                updateChannelHeader();
            }
            closeChannelModal();
        }

        async function removeChannel(ch) {
            if (!confirm('Remove channel #' + ch.name + '? All its messages will be deleted.')) return;
            const res = await fetch(api('/channels/' + encodeURIComponent(ch.name)), { method: 'DELETE' });
            const data = await res.json();
            channelError.textContent = res.ok ? '' : (data.error || 'Remove failed');
        }

        let replyTarget = null;

        function replyToMessage(msg) {
            replyTarget = msg;
            replyBannerName.textContent = msg.nickname || msg.username || 'Unknown';
            replyBannerText.textContent = (msg.text || '').replace(/\s+/g, ' ').trim().slice(0, 100) || '(empty message)';
            replyBanner.style.display = 'flex';
            replyBanner.classList.remove('hidden');
            input.focus();
        }

        function cancelReply() {
            replyTarget = null;
            replyBanner.style.display = 'none';
            replyBanner.classList.add('hidden');
        }

        let pinnedMessages = [];

        async function loadPinned() {
            try {
                const res = await fetch(api('/channels/' + encodeURIComponent(currentChannel) + '/pinned'));
                if (!res.ok) {
                    pinnedMessages = [];
                    renderPinned();
                    return;
                }
                pinnedMessages = await res.json();
            } catch (err) {
                pinnedMessages = [];
            }
            renderPinned();
        }

        function renderPinned() {
            if (!pinnedBar || !pinnedList) return;
            pinnedList.innerHTML = '';
            if (!pinnedMessages.length) {
                pinnedBar.style.display = 'none';
                return;
            }
            pinnedBar.style.display = 'flex';
            const label = document.createElement('span');
            label.style.cssText = 'display:flex;align-items:center;gap:4px;flex-shrink:0;color:#FEBE5D;font-weight:600';
            const iconEl = document.createElement('span');
            iconEl.style.display = 'flex';
            iconEl.innerHTML = SVG.pin;
            label.appendChild(iconEl);
            label.appendChild(document.createTextNode('Pinned'));
            pinnedList.appendChild(label);
            pinnedMessages.forEach((m) => {
                const chip = document.createElement('div');
                chip.style.cssText = 'display:flex;align-items:center;gap:6px;flex-shrink:0;background:rgba(127,127,127,0.15);border-radius:6px;padding:2px 10px;cursor:pointer;font-size:12px;color:#d1d5db;white-space:nowrap;max-width:280px;overflow:hidden';
                const name = document.createElement('b');
                name.textContent = m.nickname || m.username || 'Unknown';
                name.style.color = '#e5e7eb';
                const text = document.createElement('span');
                text.textContent = (m.text || '').replace(/\s+/g, ' ').trim().slice(0, 100) || '(empty message)';
                text.style.overflow = 'hidden';
                text.style.textOverflow = 'ellipsis';
                chip.appendChild(name);
                chip.appendChild(document.createTextNode(': '));
                chip.appendChild(text);
                chip.title = 'Jump to message';
                chip.addEventListener('click', () => jumpToMessage(m._id));
                pinnedList.appendChild(chip);
            });
        }

        function jumpToMessage(id) {
            const target = messages.querySelector('[data-id="' + CSS.escape(id) + '"]');
            if (!target) return;
            target.scrollIntoView({ block: 'center' });
            target.style.outline = '2px solid #FEBE5D';
            setTimeout(() => { target.style.outline = ''; }, 1500);
        }

        async function togglePin(msg) {
            const res = await fetch(api('/messages/' + msg._id + '/pin'), {
                method: msg.pinned ? 'DELETE' : 'POST'
            });
            if (!res.ok) return;
            const updated = await res.json();
            msg.pinned = !!updated.pinned;
            const item = messages.querySelector('li[data-id="' + CSS.escape(msg._id) + '"]');
            if (item) {
                const pinBtn = item.querySelector('button[data-action="pin"]');
                if (pinBtn) {
                    pinBtn.title = msg.pinned ? 'Unpin message' : 'Pin message';
                    pinBtn.style.color = msg.pinned ? '#FEBE5D' : '';
                }
            }
            await loadPinned();
        }

        function switchChannel(name) {
            if (name === currentChannel) return;
            cancelReply();
            const prev = currentChannel;
            currentChannel = name;
            updateChannelHeader();
            channelError.textContent = '';
            if (prev !== name) voiceState.byChannel.delete(prev);
            const ch = channels.find((c) => c.name === name);
            if (ch && ch.type === 'voice') {
                enterVoiceChannel(name);
            } else {
                enterTextChannel();
            }
            renderChannelList();
        }

        function enterTextChannel() {
            voicePanel.classList.add('hidden');
            messages.classList.remove('hidden');
            form.classList.remove('hidden');
            messages.innerHTML = '';
            if (voiceState.connected) leaveVoice();
            if (socket && socket.connected) {
                socket.emit('join channel', { channel: currentChannel });
            }
            loadPinned();
        }

        async function enterVoiceChannel(name) {
            voiceUsers.innerHTML = '';
            if (!voiceState.connected) {
                await startVoice();
                voiceState.connected = true;
            }
            voiceChannelName.textContent = name;
            voicePanel.classList.remove('hidden');
            messages.classList.add('hidden');
            form.classList.add('hidden');
            socket.emit('join voice', { channel: name });
        }

        async function startVoice() {
            try {
                const stream = await getMicStream();
                voiceState.stream = stream;
                voiceState.muted = false;
                voiceMuteBtn.innerHTML = SVG.micMuted + ' Mute';
                startSpeakingMonitor();
                renderVoiceUsers();
            } catch (err) {
                console.warn('Microphone unavailable, joining listen-only:', err.message);
                voiceState.stream = null;
                voiceMuteBtn.innerHTML = SVG.micMuted + ' Mute';
            }
        }

        function getMicStream() {
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timed out waiting for microphone')), 5000));
            const stream = navigator.mediaDevices.getUserMedia({ audio: true });
            return Promise.race([stream, timeout]);
        }

        function leaveVoice() {
            voiceState.connected = false;
            stopSpeakingMonitor();
            closeAllPeers();
            if (voiceState.stream) {
                voiceState.stream.getTracks().forEach((t) => t.stop());
                voiceState.stream = null;
            }
            if (socket && socket.connected) socket.emit('leave voice');
            voiceUsers.innerHTML = '';
            voiceError.textContent = '';
        }

        function toggleMute() {
            voiceState.muted = !voiceState.muted;
            if (voiceState.stream) {
                voiceState.stream.getAudioTracks().forEach((t) => { t.enabled = !voiceState.muted; });
            }
            voiceMuteBtn.innerHTML = voiceState.muted ? (SVG.mic + ' Unmute') : (SVG.micMuted + ' Mute');
            renderVoiceUsers();
        }

        let micCtx = null;
        let micMonitor = null;
        let voiceSublistEls = new Map();

        function startSpeakingMonitor() {
            if (!voiceState.stream) return;
            const Ctx = window.AudioContext || window.webkitAudioContext;
            micCtx = new Ctx();
            const source = micCtx.createMediaStreamSource(voiceState.stream);
            const analyser = micCtx.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            const data = new Uint8Array(analyser.fftSize);
            let wasSpeaking = false;
            micMonitor = setInterval(() => {
                analyser.getByteTimeDomainData(data);
                let max = 0;
                for (let i = 0; i < data.length; i++) {
                    const v = Math.abs(data[i] - 128) / 128;
                    if (v > max) max = v;
                }
                const speaking = max > 0.08;
                if (speaking !== wasSpeaking) {
                    wasSpeaking = speaking;
                    socket.emit('voice speaking', { speaking });
                }
            }, 200);
        }

        function stopSpeakingMonitor() {
            if (micMonitor) clearInterval(micMonitor);
            micMonitor = null;
            if (micCtx) { micCtx.close().catch(() => {}); micCtx = null; }
        }

        function renderVoiceUsers() {
            voiceUsers.innerHTML = '';
            const users = voiceState.participants || [];
            if (users.length === 0) {
                const p = document.createElement('div');
                p.className = 'text-gray-500 text-sm text-center py-6';
                p.textContent = 'No one is here yet.';
                voiceUsers.appendChild(p);
                return;
            }
            users.forEach((u) => {
                const row = document.createElement('div');
                row.dataset.username = u.username;
                row.className = 'flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-900 hover:bg-gray-800' +
                    (voiceState.speaking.has(u.username) ? ' bg-gray-700 hover:bg-gray-700' : '');
                row.appendChild(avatarEl(u.username, u.avatar));
                const nameEl = document.createElement('span');
                nameEl.className = 'text-sm text-gray-200 truncate';
                nameEl.textContent = (u.nickname || u.username) + (u.username === currentUsername ? ' (you)' : '');
                row.appendChild(nameEl);
                if (u.username === currentUsername && voiceState.muted) {
                    const m = document.createElement('span');
                    m.className = 'text-xs text-gray-400';
                    m.textContent = '🔇 muted';
                    row.appendChild(m);
                }
                if (voiceState.speaking.has(u.username) && u.username !== currentUsername) {
                    const s = document.createElement('span');
                    s.className = 'speaking-label text-xs text-green-400';
                    s.textContent = '· speaking';
                    row.appendChild(s);
                }
                voiceUsers.appendChild(row);
            });
        }

        function updateVoiceSpeakingUI(username, speaking) {
            const row = voiceUsers.querySelector('[data-username="' + username + '"]');
            if (row) {
                if (speaking) {
                    row.classList.remove('hover:bg-gray-800');
                    row.classList.add('bg-gray-700');
                } else {
                    row.classList.remove('bg-gray-700');
                    row.classList.add('hover:bg-gray-800');
                }
                const label = row.querySelector('.speaking-label');
                if (speaking && !label) {
                    const s = document.createElement('span');
                    s.className = 'speaking-label text-xs text-green-400';
                    s.textContent = '· speaking';
                    row.appendChild(s);
                } else if (!speaking && label) {
                    label.remove();
                }
            }
            const sub = voiceSublistEls.get(currentChannel + '|' + username);
            if (sub) {
                if (speaking) {
                    sub.classList.remove('text-gray-400');
                    sub.classList.add('text-green-400');
                } else {
                    sub.classList.remove('text-green-400');
                    sub.classList.add('text-gray-400');
                }
            }
        }

        const RTC_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

        function getPeer(username) {
            const existing = voiceState.peers.get(username);
            if (existing) return existing;
            const pc = new RTCPeerConnection(RTC_CONFIG);
            if (voiceState.stream) {
                voiceState.stream.getAudioTracks().forEach((t) => pc.addTrack(t, voiceState.stream));
            }
            const audioEl = document.createElement('audio');
            audioEl.autoplay = true;
            pc.ontrack = (ev) => {
                audioEl.srcObject = ev.streams[0] || null;
            };
            pc.onicecandidate = (ev) => {
                if (!ev.candidate) return;
                socket.emit('voice ice', { to: username, candidate: ev.candidate, channel: currentChannel });
            };
            const entry = { pc, audioEl };
            voiceState.peers.set(username, entry);
            return entry;
        }

        async function connectToPeer(username) {
            const entry = getPeer(username);
            try {
                const offer = await entry.pc.createOffer();
                await entry.pc.setLocalDescription(offer);
                socket.emit('voice offer', { to: username, sdp: entry.pc.localDescription, channel: currentChannel });
            } catch (err) {
                console.error('Offer failed for', username, err);
            }
        }

        async function onVoiceOffer(data) {
            const { from, sdp, channel } = data;
            if (channel !== currentChannel) return;
            const entry = getPeer(from);
            try {
                if (entry.pc.signalingState === 'have-local-offer') {
                    await entry.pc.setLocalDescription({ type: 'rollback' });
                }
                await entry.pc.setRemoteDescription(new RTCSessionDescription(sdp));
                if (entry.pc.signalingState === 'have-remote-offer') {
                    const answer = await entry.pc.createAnswer();
                    await entry.pc.setLocalDescription(answer);
                    socket.emit('voice answer', { to: from, sdp: entry.pc.localDescription, channel });
                }
            } catch (err) {
                console.error('Answer failed for', from, err);
            }
        }

        async function onVoiceAnswer(data) {
            const { from, sdp, channel } = data;
            if (channel !== currentChannel) return;
            const entry = voiceState.peers.get(from);
            if (!entry) return;
            try {
                if (entry.pc.signalingState !== 'stable') {
                    await entry.pc.setRemoteDescription(new RTCSessionDescription(sdp));
                }
            } catch (err) {
                console.error('Remote description failed for', from, err);
            }
        }

        async function onVoiceIce(data) {
            const { from, candidate, channel } = data;
            if (channel !== currentChannel) return;
            const entry = voiceState.peers.get(from);
            if (!entry) return;
            try {
                await entry.pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error('Ice candidate failed for', from, err);
            }
        }

        function closePeer(username) {
            const entry = voiceState.peers.get(username);
            if (!entry) return;
            entry.pc.close();
            if (entry.audioEl.srcObject) {
                entry.audioEl.srcObject.getTracks().forEach((t) => t.stop());
            }
            voiceState.speaking.delete(username);
            voiceState.peers.delete(username);
        }

        function closeAllPeers() {
            Array.from(voiceState.peers.keys()).forEach(closePeer);
            voiceState.participants = [];
            voiceState.speaking.clear();
            voiceState.byChannel.clear();
            renderChannelList();
        }

        function handleVoiceParticipants(users) {
            const incoming = users.map((u) => u.username);
            voiceState.participants.map((u) => u.username)
                .forEach((name) => {
                    if (!incoming.includes(name)) closePeer(name);
                });
            incoming.forEach((name) => {
                if (name === currentUsername) return;
                if (!voiceState.peers.has(name)) connectToPeer(name);
            });
            voiceState.participants = users;
            voiceState.connected = true;
            if (currentChannel) voiceState.byChannel.set(currentChannel, users);
            renderVoiceUsers();
            renderChannelList();
        }

        function buildEmojiPicker() {
            const seen = new Set();
            EMOJIS.forEach((emoji) => {
                if (seen.has(emoji)) return;
                seen.add(emoji);
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'rounded-md hover:bg-gray-100 p-1 text-xl';
                btn.textContent = emoji;
                btn.title = emoji;
                btn.addEventListener('click', () => insertEmoji(emoji));
                emojiGrid.appendChild(btn);
            });
        }

        function insertEmoji(emoji) {
            const start = input.selectionStart ?? input.value.length;
            const end = input.selectionEnd ?? input.value.length;
            input.value = input.value.slice(0, start) + emoji + input.value.slice(end);
            input.focus();
            input.selectionStart = input.selectionEnd = start + emoji.length;
        }

        function toggleEmojiPicker() {
            emojiPicker.classList.toggle('hidden');
        }

        emojiBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleEmojiPicker();
        });

        document.addEventListener('click', (e) => {
            if (!emojiPicker.classList.contains('hidden') &&
                !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
                emojiPicker.classList.add('hidden');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !emojiPicker.classList.contains('hidden')) {
                emojiPicker.classList.add('hidden');
            }
        });

        buildEmojiPicker();

        async function fetchChannels() {
            const res = await fetch(api('/channels'));
            if (!res.ok) return;
            channels = await res.json();
            renderChannelList();
        }

        function connectSocket() {
            socket = io({ path: '/eris/socket.io' });

            socket.on('connect', () => {
                fetchChannels();
                socket.emit('join channel', { channel: currentChannel });
                loadPinned();
            });

            socket.on('users online', (users) => {
                onlineUsers = users || [];
                renderOnlineUsers();
            });

            socket.on('connect_error', (err) => {
                console.error('Socket error:', err.message);
            });

            socket.on('channels updated', (updated) => {
                channels = updated;
                renderChannelList();
                updateChannelHeader();
            });

            socket.on('channel renamed', (payload) => {
                const found = channels.find((c) => c.name === payload.old);
                if (found) found.name = payload.new;
                renderChannelList();
                if (currentChannel === payload.old) {
                    switchChannel(payload.new);
                }
            });

            socket.on('channel removed', (payload) => {
                channels = channels.filter((c) => c.name !== payload.name);
                renderChannelList();
                if (currentChannel === payload.name) {
                    switchChannel('general');
                }
            });

            socket.on('join channel error', (err) => {
                channelError.textContent = err;
                currentChannel = 'general';
                updateChannelHeader();
                renderChannelList();
                socket.emit('join channel', { channel: 'general' });
            });

            socket.on('chat history', (history) => {
                history.forEach(addMessage);
                scrollChatBottom();
            });

            socket.on('chat message', addMessage);

            socket.on('message updated', (msg) => {
                const item = messages.querySelector('li[data-id="' + msg._id + '"]');
                if (!item) return;
                item.replaceChild(buildMessageContent(msg), item.querySelector('.min-w-0.flex-1'));
                const pinBtn = item.querySelector('button[data-action="pin"]');
                if (pinBtn) {
                    pinBtn.title = msg.pinned ? 'Unpin message' : 'Pin message';
                    pinBtn.style.color = msg.pinned ? '#FEBE5D' : '';
                }
                if (msg.pinned !== undefined) loadPinned();
            });

            socket.on('message removed', (payload) => {
                const item = messages.querySelector('li[data-id="' + payload._id + '"]');
                if (item) item.remove();
            });

            socket.on('join voice error', (err) => {
                voiceError.textContent = err;
            });

            socket.on('voice participants', (data) => {
                if (data.channel !== currentChannel) return;
                handleVoiceParticipants(data.users);
            });

            socket.on('voice offer', onVoiceOffer);
            socket.on('voice answer', onVoiceAnswer);
            socket.on('voice ice', onVoiceIce);

            socket.on('voice speaking', (data) => {
                if (data.username === currentUsername) return;
                if (data.speaking) {
                    voiceState.speaking.add(data.username);
                    updateVoiceSpeakingUI(data.username, true);
                } else {
                    voiceState.speaking.delete(data.username);
                    updateVoiceSpeakingUI(data.username, false);
                }
            });
        }

        async function refreshSession() {
            try {
                const res = await fetch(api('/me'));
                if (res.ok) {
                    const data = await res.json();
                    enterChat(data);
                }
            } catch (err) {
                console.error('Session restore failed:', err.message);
            }
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError();
            try {
                const data = await authenticate(api('/login'), loginUsername.value, loginPassword.value);
                enterChat(data);
            } catch (err) {
                showError(err.message);
            }
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError();
            try {
                const data = await register(regUsername.value, regPassword.value, regAvatar.files[0]);
                enterChat(data);
            } catch (err) {
                showError(err.message);
            }
        });

        channelAddBtn.addEventListener('click', () => openChannelModal('create'));

        let resizingOnline = false;
        onlineResizeHandle.addEventListener('mousedown', (e) => {
            resizingOnline = true;
            e.preventDefault();
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';
        });
        document.addEventListener('mousemove', (e) => {
            if (!resizingOnline) return;
            const width = Math.min(480, Math.max(120, window.innerWidth - e.clientX));
            onlineSidebar.style.width = width + 'px';
            onlineSidebar.style.flex = '0 0 ' + width + 'px';
        });
        document.addEventListener('mouseup', () => {
            resizingOnline = false;
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        });

        channelModalCancelBtn.addEventListener('click', closeChannelModal);
        channelModal.addEventListener('click', (e) => {
            if (e.target === channelModal) closeChannelModal();
        });
        channelModalSaveBtn.addEventListener('click', saveChannelModal);
        channelModalName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveChannelModal();
            }
        });

        settingsBtn.addEventListener('click', () => {
            settingsNickname.value = selfNickname;
            settingsCurrentPass.value = '';
            settingsNewPass.value = '';
            settingsAvatarInput.value = '';
            settingsError.classList.add('hidden');
            settingsAvatarPreview.innerHTML = '';
            settingsAvatarPreview.appendChild(avatarEl(currentUsername, sessionAvatar, 'w-14 h-14'));
            settingsScreen.classList.remove('hidden');
        });

        settingsClose.addEventListener('click', () => settingsScreen.classList.add('hidden'));
        settingsScreen.addEventListener('click', (e) => {
            if (e.target === settingsScreen) settingsScreen.classList.add('hidden');
        });

        settingsNicknameSave.addEventListener('click', async () => {
            const nickname = settingsNickname.value.trim().slice(0, 32);
            if (!nickname) {
                settingsError.textContent = 'Nickname cannot be empty';
                settingsError.classList.remove('hidden');
                return;
            }
            const res = await fetch(api('/profile'), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname })
            });
            const data = await res.json();
            if (!res.ok) {
                settingsError.textContent = data.error || 'Failed to update nickname';
                settingsError.classList.remove('hidden');
                return;
            }
            selfNickname = data.nickname;
            sidebarUsername.textContent = selfNickname;
            settingsError.classList.add('hidden');
        });

        settingsAvatarSave.addEventListener('click', async () => {
            const file = settingsAvatarInput.files[0];
            if (!file) {
                settingsError.textContent = 'Choose an image file first';
                settingsError.classList.remove('hidden');
                return;
            }
            const body = new FormData();
            body.append('avatar', file);
            const res = await fetch(api('/upload-avatar'), { method: 'POST', body });
            const data = await res.json();
            if (!res.ok) {
                settingsError.textContent = data.error || 'Failed to update avatar';
                settingsError.classList.remove('hidden');
                return;
            }
            sessionAvatar = data.avatar;
            applySidebarAvatar();
            settingsAvatarPreview.innerHTML = '';
            settingsAvatarPreview.appendChild(avatarEl(currentUsername, sessionAvatar, 'w-14 h-14'));
            settingsError.classList.add('hidden');
        });

        settingsPassSave.addEventListener('click', async () => {
            const currentPassword = settingsCurrentPass.value;
            const newPassword = settingsNewPass.value;
            if (!currentPassword || newPassword.length < 6) {
                settingsError.textContent = 'Enter current password and a new password of at least 6 characters';
                settingsError.classList.remove('hidden');
                return;
            }
            const res = await fetch(api('/profile/password'), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (!res.ok) {
                settingsError.textContent = data.error || 'Failed to change password';
                settingsError.classList.remove('hidden');
                return;
            }
            settingsCurrentPass.value = '';
            settingsNewPass.value = '';
            settingsError.textContent = 'Password updated';
            settingsError.className = 'text-sm text-green-500 text-center mt-2';
        });

        themeLightBtn.addEventListener('click', () => applyTheme('light'));
        themeDarkBtn.addEventListener('click', () => applyTheme('dark'));
        themeToggle.addEventListener('click', toggleTheme);
        applyTheme();

        voiceMuteBtn.addEventListener('click', toggleMute);

        voiceLeaveBtn.addEventListener('click', () => {
            currentChannel = 'general';
            updateChannelHeader();
            renderChannelList();
            enterTextChannel();
        });

        document.getElementById('logout-btn').addEventListener('click', async () => {
            if (voiceState.connected) leaveVoice();
            try {
                await fetch(api('/logout'), { method: 'POST' });
            } catch (err) {
                console.error('Logout failed:', err.message);
            }
            if (socket) socket.disconnect();
            socket = null;
            currentUsername = null;
            sessionAvatar = '';
            currentChannel = 'general';
            voicePanel.classList.add('hidden');
            voiceUsers.innerHTML = '';
            messages.classList.remove('hidden');
            form.classList.remove('hidden');
            chatScreen.classList.add('hidden');
            authScreen.classList.remove('hidden');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (input.value && socket) {
                socket.emit('chat message', {
                    text: input.value,
                    channel: currentChannel,
                    replyToId: replyTarget ? replyTarget._id : null
                });
                input.value = '';
                cancelReply();
            }
        });

        replyCancel.addEventListener('click', cancelReply);

        refreshSession();
