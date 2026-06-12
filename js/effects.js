        // Effects configuration
        const effectsConfig = {
            actionButtons: 'pulse',   // 'pulse' | 'fade'
            modalOpen:     'slide',   // 'slide' | 'fade'
            modalClose:    'thanos',  // 'thanos' | 'fade'
            pageTransition: 'reveal'  // 'reveal' | 'fade'
        };

        function setEffect(param, val) {
            effectsConfig[param] = val;
            const demoApp = document.querySelector('.demo-app');
            if (param === 'actionButtons') {
                demoApp.classList.toggle('fx-btn-fade', val === 'fade');
            }
            if (param === 'modalOpen') {
                demoApp.classList.toggle('fx-modal-open-fade', val === 'fade');
                demoApp.classList.toggle('fx-modal-from-btn', val === 'fromBtn');
            }
        }

        function openModal(id, e) {
            const overlay = document.getElementById('modal-' + id);
            if (!overlay) return;
            const modal = overlay.querySelector('.modal');
            if (effectsConfig.modalOpen === 'fromBtn' && e && modal) {
                // Temporarily show to measure, then animate
                overlay.style.visibility = 'hidden';
                overlay.style.display = 'flex';
                const mr = modal.getBoundingClientRect();
                overlay.style.display = '';
                overlay.style.visibility = '';

                const cx = (e.clientX !== undefined ? e.clientX : null) ||
                    (e.target ? e.target.getBoundingClientRect().left + e.target.getBoundingClientRect().width / 2 : window.innerWidth / 2);
                const cy = (e.clientY !== undefined ? e.clientY : null) ||
                    (e.target ? e.target.getBoundingClientRect().top + e.target.getBoundingClientRect().height / 2 : window.innerHeight / 2);

                // transform-origin must be set directly on element, not inside keyframes
                const ox = ((cx - mr.left) / mr.width * 100).toFixed(1) + '%';
                const oy = ((cy - mr.top) / mr.height * 100).toFixed(1) + '%';
                modal.style.transformOrigin = ox + ' ' + oy;
                overlay.classList.add('active');
                setTimeout(() => { modal.style.transformOrigin = ''; }, 600);
            } else {
                overlay.classList.add('active');
            }
        }

        function _thanosSnapshot(element, COLS, ROWS) {
            const rect = element.getBoundingClientRect();
            const pw = rect.width / COLS;
            const ph = rect.height / ROWS;

            const buildPieces = (dataUrl) => {
                const frag = document.createDocumentFragment();
                const pieces = [];
                for (let row = 0; row < ROWS; row++) {
                    for (let col = 0; col < COLS; col++) {
                        const piece = document.createElement('div');
                        piece.style.cssText =
                            `position:fixed;width:${(pw+1).toFixed(1)}px;height:${(ph+1).toFixed(1)}px;` +
                            `left:${(rect.left + col * pw).toFixed(1)}px;top:${(rect.top + row * ph).toFixed(1)}px;` +
                            `background:url(${dataUrl}) no-repeat;` +
                            `background-size:${Math.ceil(rect.width)}px ${Math.ceil(rect.height)}px;` +
                            `background-position:-${(col * pw).toFixed(1)}px -${(row * ph).toFixed(1)}px;` +
                            `z-index:2002;pointer-events:none;will-change:transform;`;
                        frag.appendChild(piece);
                        pieces.push(piece);
                    }
                }
                document.body.appendChild(frag);
                return pieces;
            };

            const fallback = () => {
                const c = document.createElement('canvas');
                c.width = Math.ceil(rect.width); c.height = Math.ceil(rect.height);
                const ctx = c.getContext('2d');
                const grad = ctx.createLinearGradient(0, 0, c.width, c.height);
                grad.addColorStop(0, '#0d3b6e'); grad.addColorStop(1, '#1a5296');
                ctx.fillStyle = grad; ctx.fillRect(0, 0, c.width, c.height);
                ctx.fillStyle = 'rgba(0,176,216,0.18)'; ctx.fillRect(0, 0, c.width, 48);
                ctx.fillStyle = 'rgba(0,176,216,0.5)'; ctx.fillRect(0, 48, c.width, 1);
                ctx.fillStyle = 'rgba(26,26,53,0.75)';
                for (let i = 0; i < Math.floor(c.height / 48); i++) {
                    ctx.fillRect(16, 64 + i * 44, c.width - 32, 28);
                }
                return buildPieces(c.toDataURL('image/jpeg', 0.85));
            };

            if (typeof html2canvas !== 'undefined') {
                return html2canvas(element, {
                    backgroundColor: null, scale: 1, useCORS: true,
                    allowTaint: true, logging: false,
                    scrollX: -window.scrollX, scrollY: -window.scrollY
                }).then(canvas => buildPieces(canvas.toDataURL('image/jpeg', 0.82)))
                  .catch(() => Promise.resolve(fallback()));
            }
            return Promise.resolve(fallback());
        }

        function _thanosAnimate(pieces, onDone) {
            let done = 0;
            pieces.forEach(piece => {
                const delay = Math.random() * 420;
                const dx = -(40 + Math.random() * 520);
                const dy = 30 + Math.random() * 640;
                const rot = (Math.random() - 0.5) * 600;
                const dur = 200 + Math.random() * 520;
                setTimeout(() => {
                    piece.style.transition = `transform ${dur}ms ease-in, opacity ${(dur*0.5).toFixed(0)}ms ${(delay*0.3).toFixed(0)}ms ease-in`;
                    piece.style.transform = `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(0.01)`;
                    piece.style.opacity = '0';
                    setTimeout(() => {
                        piece.remove();
                        done++;
                        if (done === pieces.length && onDone) onDone();
                    }, dur + 50);
                }, delay);
            });
        }

        async function closeModal(id) {
            const overlay = document.getElementById('modal-' + id);
            if (!overlay) return;
            const isTech = document.querySelector('.demo-app').classList.contains('theme-tech');

            if (effectsConfig.modalClose === 'fade') {
                const modal = overlay.querySelector('.modal');
                modal.style.animation = 'fadeModalOut 0.5s ease-in forwards';
                overlay.style.transition = 'background 0.45s ease';
                overlay.style.background = 'rgba(0,0,0,0)';
                setTimeout(() => {
                    modal.style.animation = '';
                    overlay.style.background = '';
                    overlay.style.transition = '';
                    overlay.classList.remove('active');
                }, 500);
            } else if (isTech) {
                const modal = overlay.querySelector('.modal');
                overlay.style.transition = 'background 0.08s';
                overlay.style.background = 'rgba(0,0,0,0)';
                const pieces = await _thanosSnapshot(modal, 40, 25);
                modal.style.visibility = 'hidden';
                _thanosAnimate(pieces, () => {
                    modal.style.visibility = '';
                    overlay.style.background = '';
                    overlay.classList.remove('active');
                });
            } else {
                overlay.classList.add('closing');
                setTimeout(() => overlay.classList.remove('active', 'closing'), 260);
            }
        }

        async function toggleNotifications() {
            const panel = document.getElementById('notificationsPanel');
            const isTech = document.querySelector('.demo-app').classList.contains('theme-tech');
            const isOpen = panel.classList.contains('active');
            if (isOpen) {
                if (effectsConfig.modalClose === 'fade') {
                    panel.style.transition = 'right 0.3s ease, opacity 0.45s ease';
                    panel.style.opacity = '0';
                    setTimeout(() => {
                        panel.classList.remove('active');
                        panel.style.opacity = '';
                        panel.style.transition = '';
                    }, 450);
                } else if (isTech) {
                    const pieces = await _thanosSnapshot(panel, 20, 25);
                    panel.classList.remove('active');
                    _thanosAnimate(pieces, null);
                } else {
                    panel.classList.remove('active');
                }
            } else {
                panel.classList.add('active');
            }
        }
