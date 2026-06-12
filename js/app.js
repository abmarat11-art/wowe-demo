
        const pageTitles = { dashboard: 'Дашборд', requests: 'Заказы', orders: 'Доставки', drivers: 'Водители', map: 'Карта', warehouse: 'Склад', clients: 'Клиенты', analytics: 'Аналитика', settings: 'Настройки' };

        function showPage(pageId, resetFilters = true, e = null) {
            if (resetFilters && fromDashboard) {
                clearAllFilters();
                fromDashboard = false;
            }

            document.querySelectorAll('.demo-nav-item').forEach(item => item.classList.toggle('active', item.dataset.nav === pageId));
            document.querySelectorAll('.tech-nav-btn').forEach(item => item.classList.toggle('active', item.dataset.tnav === pageId));
            document.getElementById('currentPageTitle').textContent = pageTitles[pageId] || pageId;

            if (pageId === 'requests') renderRequests();
            if (pageId === 'orders') renderOrders();
            if (pageId === 'drivers') renderDrivers();

            const isTech = document.querySelector('.demo-app').classList.contains('theme-tech');
            const currentActive = document.querySelector('.demo-page-content.active');
            const nextPage = document.getElementById('page-' + pageId);

            if (!nextPage) { closeNav(); return; }

            // Ripple effect on clicked element (tech-nav-btn or stat-card or demo-nav-item)
            if (isTech && e) {
                const rippleTarget = (e.target && (e.target.closest('.tech-nav-btn') || e.target.closest('.stat-card') || e.target.closest('.demo-nav-item')));
                if (rippleTarget) {
                    const br = rippleTarget.getBoundingClientRect();
                    const rx = ((e.clientX || br.left + br.width / 2) - br.left - 8);
                    const ry = ((e.clientY || br.top + br.height / 2) - br.top - 8);
                    const ripple = document.createElement('span');
                    ripple.style.cssText = `position:absolute;border-radius:50%;background:rgba(0,176,216,0.55);width:16px;height:16px;left:${rx}px;top:${ry}px;transform:scale(0);pointer-events:none;animation:navBtnRipple 0.9s ease-out forwards;`;
                    const wasPos = getComputedStyle(rippleTarget).position;
                    if (wasPos === 'static') rippleTarget.style.position = 'relative';
                    rippleTarget.style.overflow = 'hidden';
                    rippleTarget.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 950);
                }
            }

            // Compute reveal origin relative to .demo-page (the actual clip-path container)
            let ox = '50%', oy = '50%';
            if (isTech && e && e.clientX !== undefined) {
                const container = document.querySelector('.demo-page') || document.querySelector('.preview-frame');
                if (container) {
                    const cr = container.getBoundingClientRect();
                    ox = (((e.clientX - cr.left) / cr.width) * 100).toFixed(1) + '%';
                    oy = (((e.clientY - cr.top) / cr.height) * 100).toFixed(1) + '%';
                }
            }

            const useFade = effectsConfig.pageTransition === 'fade';

            if (useFade) {
                if (currentActive && currentActive !== nextPage) {
                    currentActive.style.animation = 'fadePageOut 0.28s ease-in forwards';
                    setTimeout(() => {
                        currentActive.classList.remove('active');
                        currentActive.style.animation = '';
                        nextPage.classList.add('active');
                        nextPage.style.animation = 'fadePageIn 0.4s ease-out forwards';
                        setTimeout(() => { nextPage.style.animation = ''; }, 420);
                    }, 280);
                } else {
                    document.querySelectorAll('.demo-page-content').forEach(p => p.classList.remove('active'));
                    nextPage.classList.add('active');
                    nextPage.style.animation = 'fadePageIn 0.4s ease-out forwards';
                    setTimeout(() => { nextPage.style.animation = ''; }, 420);
                }
            } else if (isTech && currentActive && currentActive !== nextPage) {
                currentActive.style.animation = 'techPageOut 0.18s ease-in forwards';
                setTimeout(() => {
                    currentActive.classList.remove('active');
                    currentActive.style.animation = '';
                    nextPage.style.setProperty('--reveal-x', ox);
                    nextPage.style.setProperty('--reveal-y', oy);
                    nextPage.classList.add('active');
                    nextPage.style.animation = 'techPageReveal 0.48s cubic-bezier(0.22, 1, 0.36, 1) forwards';
                    setTimeout(() => { nextPage.style.animation = ''; nextPage.style.clipPath = ''; }, 500);
                }, 180);
            } else {
                document.querySelectorAll('.demo-page-content').forEach(p => p.classList.remove('active'));
                nextPage.style.setProperty('--reveal-x', ox);
                nextPage.style.setProperty('--reveal-y', oy);
                nextPage.classList.add('active');
                if (isTech) {
                    nextPage.style.animation = 'techPageReveal 0.48s cubic-bezier(0.22, 1, 0.36, 1) forwards';
                    setTimeout(() => { nextPage.style.animation = ''; nextPage.style.clipPath = ''; }, 500);
                } else {
                    nextPage.style.animation = 'minPageIn 0.2s ease-out forwards';
                    setTimeout(() => { nextPage.style.animation = ''; }, 210);
                }
            }

            closeNav();
        }

        function goToOrdersToday(e) {
            fromDashboard = true;
            activeFilters = { date: ['2026-06-10'] };
            showPage('orders', false, e);
        }

        function goToMap(e) {
            showPage('map', true, e);
        }

        function goToDriversOnShift(e) {
            fromDashboard = true;
            driverStatusFilterActive = true;
            showPage('drivers', false, e);
        }

        function renderRequests() {
            const tbody = document.getElementById('requestsTableBody');
            tbody.innerHTML = requestsData.map((r, idx) => `
                <tr id="req-row-${r.id.replace('#','').replace('-','')}">
                    <td class="table-id">${r.id}</td>
                    <td>${r.client}</td>
                    <td style="max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.product}</td>
                    <td>${r.address}</td>
                    <td>${r.date}</td>
                    <td><span class="table-status ${r.statusClass}">${r.status}</span></td>
                    <td><div class="table-actions">
                        <button class="table-action" title="Просмотр" onclick="openModal('newRequest', event)"><i class="fas fa-eye"></i></button>
                        ${r.status !== 'Отменён' && r.status !== 'В обработке' ? `<button class="table-action" title="Оформить доставку" style="color: var(--demo-green);" onclick="openConvertModal(${idx})"><i class="fas fa-truck"></i></button>` : ''}
                        ${r.status !== 'Отменён' ? `<button class="table-action" title="Отменить" style="color: var(--demo-red);" onclick="cancelRequest(${idx});event.stopPropagation()"><i class="fas fa-times"></i></button>` : ''}
                    </div></td>
                </tr>
            `).join('');
            document.getElementById('requestsSubtitle').textContent = requestsData.length + ' заявок';
        }

        function openConvertModal(idx) {
            const r = requestsData[idx];
            document.getElementById('convertModalTitle').textContent = 'Оформить доставку — ' + r.id;
            document.getElementById('convertRequestInfo').textContent = r.id + ' · ' + r.client + ' → ' + r.address;
            document.getElementById('convertIdx').value = idx;
            openModal('convertRequest');
        }

        function confirmConvert() {
            const idx = parseInt(document.getElementById('convertIdx').value);
            const r = requestsData[idx];
            requestsData[idx].status = 'В обработке';
            requestsData[idx].statusClass = 'blue';
            closeModal('convertRequest');
            showPage('orders');
            setTimeout(() => {
                document.getElementById('newOrderTitle').textContent = 'Доставка из заявки ' + r.id;
                document.getElementById('newOrderClient').value = r.client;
                document.getElementById('newOrderAddress').value = r.address;
                openModal('newOrder');
            }, 980);
        }

        function openNotification(section, entityId, e) {
            toggleNotifications();
            if (section === 'requests') {
                showPage('requests', true, e);
                setTimeout(() => {
                    const rowId = 'req-row-' + entityId.replace('-', '');
                    const row = document.getElementById(rowId);
                    if (row) { row.classList.add('row-highlighted'); setTimeout(() => row.classList.remove('row-highlighted'), 2500); }
                }, 100);
            } else if (section === 'orders') {
                showPage('orders', true, e);
                setTimeout(() => {
                    const rows = document.querySelectorAll('#ordersTableBody tr');
                    rows.forEach(row => {
                        if (row.querySelector('.table-id') && row.querySelector('.table-id').textContent.includes(entityId)) {
                            row.classList.add('row-highlighted');
                            setTimeout(() => row.classList.remove('row-highlighted'), 2500);
                        }
                    });
                }, 150);
            } else if (section === 'drivers') {
                showPage('drivers', true, e);
                setTimeout(() => {
                    const cards = document.querySelectorAll('#driversGrid .profile-card');
                    cards.forEach(card => {
                        if (card.querySelector('.profile-avatar') && card.querySelector('.profile-avatar').textContent === entityId) {
                            card.classList.add('card-highlighted');
                            setTimeout(() => card.classList.remove('card-highlighted'), 2500);
                        }
                    });
                }, 150);
            }
        }

        function renderOrders() {
            const tbody = document.getElementById('ordersTableBody');
            let filtered = ordersData;

            Object.keys(activeFilters).forEach(key => {
                if (activeFilters[key].length > 0) {
                    if (key === 'date') {
                        filtered = filtered.filter(o => activeFilters[key].includes(o.date));
                    } else if (key === 'status') {
                        filtered = filtered.filter(o => activeFilters[key].includes(o.status));
                    } else if (key === 'driver') {
                        filtered = filtered.filter(o => activeFilters[key].includes(o.driver));
                    } else if (key === 'client') {
                        filtered = filtered.filter(o => activeFilters[key].includes(o.client));
                    } else if (key === 'from') {
                        filtered = filtered.filter(o => activeFilters[key].includes(o.from));
                    }
                }
            });

            tbody.innerHTML = filtered.map((o, fi) => {
                const realIdx = ordersData.indexOf(o);
                return `
                <tr id="order-row-${o.id.replace('#','')}">
                    <td class="table-id">${o.id}</td>
                    <td>${o.client}<br><span style="font-size:9px;color:var(--demo-text-muted);">${o.phone}</span></td>
                    <td>${o.from}</td>
                    <td>${o.to}</td>
                    <td>${o.driver}</td>
                    <td><span class="table-status ${o.statusClass}">${o.status}</span></td>
                    <td style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--demo-cyan);">${o.eta}</td>
                    <td><div class="table-actions">
                        <button class="table-action" title="Просмотр" onclick="openOrderDetail(${realIdx})"><i class="fas fa-eye"></i></button>
                        ${o.status !== 'Отменён' && o.status !== 'Доставлен' ? `<button class="table-action" title="Редактировать" onclick="openEditOrder(${realIdx})"><i class="fas fa-edit"></i></button>` : ''}
                        ${o.status !== 'Отменён' && o.status !== 'Доставлен' ? `<button class="table-action" title="Отменить" style="color:var(--demo-red);" onclick="cancelOrder(${realIdx})"><i class="fas fa-ban"></i></button>` : ''}
                    </div></td>
                </tr>`;
            }).join('');

            document.getElementById('ordersSubtitle').textContent = `${filtered.length} заказов`;
            updateFilterTags();
        }

        function renderDrivers() {
            const grid = document.getElementById('driversGrid');
            let filtered = driversData;

            if (driverStatusFilterActive) {
                filtered = filtered.filter(d => d.status === 'online');
            }

            grid.innerHTML = filtered.map(d => `
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="profile-avatar">${d.initials}</div>
                        <div class="profile-info">
                            <h4>${d.name}</h4>
                            <div class="profile-status ${d.status}"><i class="fas fa-circle"></i>${d.statusText}</div>
                        </div>
                    </div>
                    <div class="profile-stats">
                        <div class="profile-stat"><div class="profile-stat-value">${d.shifts}</div><div class="profile-stat-label">Смен</div></div>
                        <div class="profile-stat"><div class="profile-stat-value">${d.trips}</div><div class="profile-stat-label">Выездов</div></div>
                        <div class="profile-stat"><div class="profile-stat-value">${d.plate.split(' ').pop()}</div><div class="profile-stat-label">Номер</div></div>
                    </div>
                    <div class="profile-current"><div class="profile-current-label">Текущее</div><div class="profile-current-text">${d.currentOrder}</div></div>
                </div>
            `).join('');

            document.getElementById('driversSubtitle').textContent = `${filtered.length} водителей`;
            document.getElementById('driverStatusFilter').classList.toggle('active', driverStatusFilterActive);
            document.getElementById('clearDriversFilters').style.display = driverStatusFilterActive ? 'flex' : 'none';
        }

        function toggleFilter(th, column) {
            // Simple toggle for now
            if (!activeFilters[column]) activeFilters[column] = [];
            
            const uniqueValues = [...new Set(ordersData.map(o => o[column]))];
            
            const existing = th.querySelector('.filter-dropdown');
            if (existing) {
                existing.remove();
                return;
            }

            document.querySelectorAll('.filter-dropdown').forEach(d => d.remove());

            const dropdown = document.createElement('div');
            dropdown.className = 'filter-dropdown active';
            dropdown.innerHTML = `
                <input type="text" class="filter-search" placeholder="Поиск..." oninput="filterDropdownOptions(this)">
                <div class="filter-options">
                    ${uniqueValues.map(v => `
                        <div class="filter-option ${activeFilters[column].includes(v) ? 'selected' : ''}" onclick="toggleFilterValue('${column}', '${v}', this)">
                            <div class="filter-checkbox"><i class="fas fa-check"></i></div>
                            <span>${v}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            th.style.position = 'relative';
            th.appendChild(dropdown);

            setTimeout(() => {
                document.addEventListener('click', function closeDropdown(e) {
                    if (!dropdown.contains(e.target) && e.target !== th) {
                        dropdown.remove();
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            }, 0);
        }

        function toggleFilterValue(column, value, el) {
            if (!activeFilters[column]) activeFilters[column] = [];
            
            const idx = activeFilters[column].indexOf(value);
            if (idx > -1) {
                activeFilters[column].splice(idx, 1);
                el.classList.remove('selected');
            } else {
                activeFilters[column].push(value);
                el.classList.add('selected');
            }
            renderOrders();
        }

        function filterDropdownOptions(input) {
            const search = input.value.toLowerCase();
            const options = input.parentElement.querySelectorAll('.filter-option');
            options.forEach(opt => {
                const text = opt.querySelector('span').textContent.toLowerCase();
                opt.style.display = text.includes(search) ? 'flex' : 'none';
            });
        }

        function updateFilterTags() {
            const container = document.getElementById('activeFilterTags');
            const hasFilters = Object.values(activeFilters).some(arr => arr.length > 0);
            
            document.getElementById('clearFiltersBtn').style.display = hasFilters ? 'flex' : 'none';
            
            let html = '';
            Object.keys(activeFilters).forEach(key => {
                activeFilters[key].forEach(val => {
                    html += `<div class="filter-tag">${val}<span class="filter-tag-close" onclick="removeFilter('${key}', '${val}')"><i class="fas fa-times"></i></span></div>`;
                });
            });
            container.innerHTML = html;
        }

        function removeFilter(column, value) {
            const idx = activeFilters[column].indexOf(value);
            if (idx > -1) activeFilters[column].splice(idx, 1);
            renderOrders();
        }

        function clearAllFilters() {
            activeFilters = {};
            renderOrders();
        }

        function toggleDriverStatusFilter() {
            driverStatusFilterActive = !driverStatusFilterActive;
            renderDrivers();
        }

        function clearDriverFilters() {
            driverStatusFilterActive = false;
            renderDrivers();
        }

        function toggleMapFilter(type) {
            // Placeholder for map filters
            document.querySelectorAll('#mapFiltersBar .filter-btn').forEach(b => b.classList.remove('active'));
            event.target.closest('.filter-btn').classList.toggle('active');
        }

        function openOrderDetail(idx) {
            const o = ordersData[idx];
            document.getElementById('viewOrderTitle').textContent = 'Доставка ' + o.id;
            const statusColors = { 'В пути': 'var(--demo-accent)', 'Доставлен': 'var(--demo-green)', 'Ожидает': 'var(--demo-orange)', 'Отменён': 'var(--demo-red)' };
            document.getElementById('viewOrderBody').innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
                    <div class="form-group" style="margin:0;"><label class="form-label">Клиент</label><div style="padding:8px;background:var(--demo-bg);border-radius:6px;font-size:11px;color:var(--demo-text);">${o.client}</div></div>
                    <div class="form-group" style="margin:0;"><label class="form-label">Телефон</label><div style="padding:8px;background:var(--demo-bg);border-radius:6px;font-size:11px;color:var(--demo-cyan);">${o.phone}</div></div>
                    <div class="form-group" style="margin:0;"><label class="form-label">Откуда</label><div style="padding:8px;background:var(--demo-bg);border-radius:6px;font-size:11px;color:var(--demo-text);">${o.from}</div></div>
                    <div class="form-group" style="margin:0;"><label class="form-label">Куда</label><div style="padding:8px;background:var(--demo-bg);border-radius:6px;font-size:11px;color:var(--demo-text);">${o.to}</div></div>
                    <div class="form-group" style="margin:0;"><label class="form-label">Водитель</label><div style="padding:8px;background:var(--demo-bg);border-radius:6px;font-size:11px;color:var(--demo-text);">${o.driver}</div></div>
                    <div class="form-group" style="margin:0;"><label class="form-label">ETA</label><div style="padding:8px;background:var(--demo-bg);border-radius:6px;font-size:11px;color:var(--demo-cyan);font-family:'JetBrains Mono',monospace;">${o.eta}</div></div>
                    <div class="form-group" style="margin:0;"><label class="form-label">Вес / Места</label><div style="padding:8px;background:var(--demo-bg);border-radius:6px;font-size:11px;color:var(--demo-text);">${o.weight}</div></div>
                    <div class="form-group" style="margin:0;"><label class="form-label">Статус</label><div style="padding:8px;background:var(--demo-bg);border-radius:6px;font-size:11px;font-weight:600;color:${statusColors[o.status]||'var(--demo-text)'};">${o.status}</div></div>
                </div>
                <div class="form-group"><label class="form-label" style="margin-bottom:8px;">История статусов</label>
                    <div style="border-left:2px solid var(--demo-border);margin-left:6px;">
                        ${o.history.map(h => `<div style="display:flex;gap:10px;padding:6px 0 6px 12px;position:relative;">
                            <div style="position:absolute;left:-5px;top:10px;width:8px;height:8px;background:var(--demo-accent);border-radius:50%;"></div>
                            <span style="font-size:9px;color:var(--demo-text-muted);white-space:nowrap;font-family:'JetBrains Mono',monospace;">${h.time}</span>
                            <span style="font-size:10px;color:var(--demo-text-secondary);">${h.text}</span>
                        </div>`).join('')}
                    </div>
                </div>`;
            const footer = document.getElementById('viewOrderFooter');
            footer.innerHTML = `<button class="demo-btn demo-btn-secondary" onclick="closeModal('viewOrder')">Закрыть</button>`;
            if (o.status === 'В пути') footer.innerHTML += `<button class="demo-btn demo-btn-primary" onclick="goToMap();closeModal('viewOrder')"><i class="fas fa-map"></i>На карте</button>`;
            openModal('viewOrder');
        }

        function openEditOrder(idx) {
            const o = ordersData[idx];
            document.getElementById('editOrderTitle').textContent = 'Редактировать ' + o.id;
            document.getElementById('editOrderIdx').value = idx;
            document.getElementById('editOrderStatus').value = o.status;
            document.getElementById('editOrderDriver').value = o.driver;
            document.getElementById('editOrderEta').value = o.eta === '—' ? '' : o.eta;
            openModal('editOrder');
        }

        function saveEditOrder() {
            const idx = parseInt(document.getElementById('editOrderIdx').value);
            const statusMap = { 'В пути': 'blue', 'Доставлен': 'green', 'Ожидает': 'orange', 'Отменён': 'red' };
            const newStatus = document.getElementById('editOrderStatus').value;
            ordersData[idx].status = newStatus;
            ordersData[idx].statusClass = statusMap[newStatus] || 'blue';
            ordersData[idx].driver = document.getElementById('editOrderDriver').value;
            const eta = document.getElementById('editOrderEta').value;
            ordersData[idx].eta = eta || '—';
            closeModal('editOrder');
            renderOrders();
        }

        function cancelOrder(idx) {
            askDelete(`Отменить доставку ${ordersData[idx].id}?`, () => {
                ordersData[idx].status = 'Отменён';
                ordersData[idx].statusClass = 'red';
                ordersData[idx].eta = '—';
                ordersData[idx].history.push({time: new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'}), text: 'Отменён оператором'});
                renderOrders();
            });
        }



        function cancelRequest(idx) {
            askDelete(`Отменить заявку ${requestsData[idx].id}?`, () => {
                requestsData[idx].status = 'Отменён';
                requestsData[idx].statusClass = 'red';
                renderRequests();
            });
        }

        let _deleteCallback = null;

        function askDelete(message, callback) {
            _deleteCallback = callback;
            document.getElementById('confirmDeleteText').textContent = message;
            openModal('confirmDelete');
        }

        function executeDelete() {
            const cb = _deleteCallback;
            _deleteCallback = null;
            closeModal('confirmDelete');
            if (cb) setTimeout(cb, 950);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key !== 'Escape') return;
            document.querySelectorAll('.modal-overlay.active').forEach(m => {
                const id = m.id.replace('modal-', '');
                closeModal(id);
            });
            const notif = document.getElementById('notificationsPanel');
            if (notif && notif.classList.contains('active')) toggleNotifications();
            closeNav();
        });

        // Builder controls
        document.querySelectorAll('.toggle-item[data-section]').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('active');
                const navItem = document.querySelector(`.demo-nav-item[data-nav="${item.dataset.section}"]`);
                if (navItem) navItem.style.display = item.classList.contains('active') ? 'flex' : 'none';
            });
        });

        document.querySelectorAll('.toggle-item[data-feature]').forEach(item => {
            item.addEventListener('click', () => item.classList.toggle('active'));
        });

        // Effects controls
        document.querySelectorAll('.effect-opt').forEach(btn => {
            btn.addEventListener('click', () => {
                const param = btn.dataset.effect;
                const val = btn.dataset.val;
                document.querySelectorAll(`.effect-opt[data-effect="${param}"]`).forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                setEffect(param, val);
            });
        });

        const THEMES = {
            tech: {
                '--demo-sidebar': '#0d3b6e',
                '--demo-sidebar-hover': '#1a5296',
                '--demo-menu-active': '#1a5296',
                '--demo-bg': '#e8f4fd',
                '--demo-card': '#ffffff',
                '--demo-card-hover': '#f0f9ff',
                '--demo-border': '#b3d9f0',
                '--demo-text': '#0d2137',
                '--demo-text-secondary': '#2a5f80',
                '--demo-text-muted': '#5a8fa8',
                '--demo-accent': '#00b0d8',
                '--demo-accent-light': 'rgba(0, 176, 216, 0.12)',
                '--demo-cyan': '#0288d1',
                '--demo-green': '#10b981',
                '--demo-green-light': 'rgba(16, 185, 129, 0.15)',
                '--demo-orange': '#f59e0b',
                '--demo-orange-light': 'rgba(245, 158, 11, 0.15)',
                '--demo-red': '#ef4444',
                '--demo-red-light': 'rgba(239, 68, 68, 0.15)',
                '--demo-glow': '0 0 20px rgba(0, 176, 216, 0.3)',
            },
            minimal: {
                '--demo-sidebar': '#ffffff',
                '--demo-sidebar-hover': '#f1f5f9',
                '--demo-menu-active': '#eff6ff',
                '--demo-bg': '#f8fafc',
                '--demo-card': '#ffffff',
                '--demo-card-hover': '#f8fafc',
                '--demo-border': '#e2e8f0',
                '--demo-text': '#1e293b',
                '--demo-text-secondary': '#475569',
                '--demo-text-muted': '#94a3b8',
                '--demo-accent': '#2563eb',
                '--demo-accent-light': 'rgba(37, 99, 235, 0.1)',
                '--demo-cyan': '#0284c7',
                '--demo-green': '#16a34a',
                '--demo-green-light': 'rgba(22, 163, 74, 0.1)',
                '--demo-orange': '#d97706',
                '--demo-orange-light': 'rgba(217, 119, 6, 0.1)',
                '--demo-red': '#dc2626',
                '--demo-red-light': 'rgba(220, 38, 38, 0.1)',
                '--demo-glow': '0 1px 4px rgba(0,0,0,0.06)',
            },
            energy: {
                '--demo-sidebar': '#1e0a00',
                '--demo-sidebar-hover': '#2e1200',
                '--demo-menu-active': 'rgba(249,115,22,0.25)',
                '--demo-bg': '#fef9f0',
                '--demo-card': '#ffffff',
                '--demo-card-hover': '#fff8f0',
                '--demo-border': 'rgba(249,115,22,0.15)',
                '--demo-text': '#1c0500',
                '--demo-text-secondary': '#92400e',
                '--demo-text-muted': '#b45309',
                '--demo-accent': '#f97316',
                '--demo-accent-light': 'rgba(249, 115, 22, 0.12)',
                '--demo-cyan': '#2ec4b6',
                '--demo-green': '#2ec4b6',
                '--demo-green-light': 'rgba(46, 196, 182, 0.12)',
                '--demo-orange': '#f97316',
                '--demo-orange-light': 'rgba(249, 115, 22, 0.12)',
                '--demo-red': '#ef4444',
                '--demo-red-light': 'rgba(239, 68, 68, 0.12)',
                '--demo-glow': '0 4px 20px rgba(249, 115, 22, 0.2)',
            }
        };

        function applyTheme(themeName) {
            const theme = THEMES[themeName];
            if (!theme) return;

            // CSS variables
            const root = document.documentElement;
            Object.entries(theme).forEach(([key, val]) => root.style.setProperty(key, val));

            // Theme class on demo-app
            const demoApp = document.querySelector('.demo-app');
            demoApp.classList.remove('theme-tech', 'theme-minimal', 'theme-energy');
            demoApp.classList.add('theme-' + themeName);

            // Reset sidebar state when switching
            closeNav();
        }

        function toggleNav() {
            const isTech = document.querySelector('.demo-app').classList.contains('theme-tech');
            if (isTech) {
                const overlay = document.getElementById('techNavOverlay');
                if (overlay) overlay.classList.toggle('open');
            } else {
                const sidebar = document.getElementById('demoSidebar');
                const backdrop = document.getElementById('navBackdrop');
                if (sidebar && backdrop) {
                    const isOpen = sidebar.classList.contains('open');
                    sidebar.classList.toggle('open', !isOpen);
                    backdrop.classList.toggle('active', !isOpen);
                }
            }
        }

        function closeNav() {
            const overlay = document.getElementById('techNavOverlay');
            if (overlay) overlay.classList.remove('open');
            const sidebar = document.getElementById('demoSidebar');
            const backdrop = document.getElementById('navBackdrop');
            if (sidebar) sidebar.classList.remove('open');
            if (backdrop) backdrop.classList.remove('active');
        }

        document.querySelectorAll('.style-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                applyTheme(card.dataset.style);
            });
        });

        function openClientView() {
            const config = { sections: [], features: [], effects: { ...effectsConfig } };
            document.querySelectorAll('.toggle-item.active[data-section]').forEach(item => config.sections.push(item.dataset.section));
            document.querySelectorAll('.toggle-item.active[data-feature]').forEach(item => config.features.push(item.dataset.feature));
            const url = window.location.href.split('?')[0] + '?mode=client&config=' + btoa(JSON.stringify(config));
            window.open(url, '_blank');
        }

        // URL params
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'client') {
            document.getElementById('app').classList.add('client-mode');
            document.querySelector('.powered-by').style.display = 'none';
            const configStr = params.get('config');
            if (configStr) {
                try {
                    const config = JSON.parse(atob(configStr));
                    document.querySelectorAll('.demo-nav-item').forEach(item => {
                        if (!config.sections.includes(item.dataset.nav)) item.style.display = 'none';
                    });
                    if (config.effects) {
                        Object.keys(config.effects).forEach(k => setEffect(k, config.effects[k]));
                    }
                } catch(e) {}
            }
        }

        // Init
        renderRequests();
        renderOrders();
        renderDrivers();

        // Map animation
        setInterval(() => {
            document.querySelectorAll('.map-vehicle').forEach(v => {
                const l = parseFloat(v.style.left), t = parseFloat(v.style.top);
                v.style.left = Math.max(15, Math.min(85, l + (Math.random() - 0.5) * 0.6)) + '%';
                v.style.top = Math.max(15, Math.min(85, t + (Math.random() - 0.5) * 0.6)) + '%';
            });
        }, 2000);
