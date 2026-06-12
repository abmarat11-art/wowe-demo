        const requestsData = [
            { id: '#ZK-0124', client: 'MegaStore', contact: '+998 71 345 67 89', product: 'Кофе Arabica 1кг × 20, Сироп ванильный × 5', address: 'ТЦ Мега, зона C', date: '2026-06-10', status: 'Новый', statusClass: 'blue' },
            { id: '#ZK-0123', client: 'ООО "Технопарк"', contact: '+998 71 234 56 78', product: 'Молоко 3.2% × 50 шт', address: 'ул. Навои, 42', date: '2026-06-10', status: 'На согласовании', statusClass: 'orange' },
            { id: '#ZK-0122', client: 'IP Каримов', contact: '+998 93 456 78 90', product: 'Чай Sencha 500г × 10', address: 'Мирзо Улугбек, 15', date: '2026-06-09', status: 'Подтверждён', statusClass: 'green' },
            { id: '#ZK-0121', client: 'Ресторан "Плов"', contact: '+998 90 876 54 32', product: 'Зерновой кофе Blend × 8 кг', address: 'Яккасарай, 8', date: '2026-06-09', status: 'В обработке', statusClass: 'blue' },
            { id: '#ZK-0120', client: 'Аптека "Здоровье"', contact: '+998 71 555 00 11', product: 'Упаковочный материал 200 шт', address: 'Сергели, 5', date: '2026-06-08', status: 'Отменён', statusClass: 'red' },
            { id: '#ZK-0119', client: 'ООО "ГлобалТрейд"', contact: '+998 71 777 33 22', product: 'Сахар 50кг × 3, Мука в/с 25кг × 5', address: 'Шайхантахур, 22', date: '2026-06-08', status: 'Подтверждён', statusClass: 'green' },
        ];

        const ordersData = [
            { id: '#TX-2847', client: 'ООО "Технопарк"', phone: '+998 71 234 56 78', from: 'Склад-1', to: 'ул. Навои, 42', driver: 'Азиз Р.', weight: '120 кг / 8 мест', eta: '14:30', status: 'В пути', statusClass: 'blue', date: '2026-06-10', history: [{time:'09:15',text:'Заказ создан'},{time:'10:00',text:'Водитель назначен — Азиз Р.'},{time:'11:30',text:'Выехал со склада'}] },
            { id: '#TX-2846', client: 'Саидов Алишер', phone: '+998 90 123 45 67', from: 'Склад-2', to: 'Чиланзар, 9 кв', driver: 'Бахром К.', weight: '15 кг / 2 места', eta: '13:10', status: 'Доставлен', statusClass: 'green', date: '2026-06-10', history: [{time:'08:30',text:'Заказ создан'},{time:'09:00',text:'Водитель назначен — Бахром К.'},{time:'10:20',text:'Выехал со склада'},{time:'13:10',text:'Доставлен клиенту'}] },
            { id: '#TX-2845', client: 'MegaStore', phone: '+998 71 345 67 89', from: 'Юнусабад', to: 'ТЦ Мега, зона C', driver: '—', weight: '340 кг / 24 места', eta: '—', status: 'Ожидает', statusClass: 'orange', date: '2026-06-10', history: [{time:'11:45',text:'Заказ создан'},{time:'11:45',text:'Ожидает назначения водителя'}] },
            { id: '#TX-2844', client: 'IP Каримов', phone: '+998 93 456 78 90', from: 'Склад-1', to: 'Мирзо Улугбек, 15', driver: 'Сардор М.', weight: '60 кг / 4 места', eta: '15:00', status: 'В пути', statusClass: 'blue', date: '2026-06-10', history: [{time:'10:30',text:'Заказ создан'},{time:'11:00',text:'Водитель назначен — Сардор М.'},{time:'12:45',text:'Выехал со склада'}] },
            { id: '#TX-2843', client: 'ООО "ГлобалТрейд"', phone: '+998 71 777 33 22', from: 'Склад-3', to: 'Шайхантахур, 22', driver: 'Дилшод Р.', weight: '280 кг / 12 мест', eta: '12:00', status: 'Доставлен', statusClass: 'green', date: '2026-06-09', history: [{time:'07:00',text:'Заказ создан'},{time:'08:00',text:'Водитель назначен'},{time:'09:30',text:'Выехал со склада'},{time:'12:00',text:'Доставлен клиенту'}] },
            { id: '#TX-2842', client: 'Ресторан "Плов"', phone: '+998 90 876 54 32', from: 'Склад-2', to: 'Яккасарай, 8', driver: 'Жавлон А.', weight: '90 кг / 6 мест', eta: '11:30', status: 'Доставлен', statusClass: 'green', date: '2026-06-09', history: [{time:'07:30',text:'Заказ создан'},{time:'08:15',text:'Водитель назначен'},{time:'09:00',text:'Выехал со склада'},{time:'11:30',text:'Доставлен клиенту'}] },
            { id: '#TX-2841', client: 'Аптека "Здоровье"', phone: '+998 71 555 00 11', from: 'Склад-1', to: 'Сергели, 5', driver: 'Азиз Р.', weight: '45 кг / 3 места', eta: '—', status: 'Отменён', statusClass: 'red', date: '2026-06-08', history: [{time:'14:00',text:'Заказ создан'},{time:'16:30',text:'Отменён клиентом'}] },
        ];

        const driversData = [
            { initials: 'АР', name: 'Азиз Рахимов', status: 'online', statusText: 'На маршруте', deliveries: 127, rating: 4.9, ontime: 98, shifts: 22, trips: 127, plate: '01 A 777 BC', currentOrder: '#TX-2847 → Навои, 42' },
            { initials: 'БК', name: 'Бахром Касымов', status: 'online', statusText: 'Свободен', deliveries: 98, rating: 4.7, ontime: 95, shifts: 20, trips: 98, plate: '01 B 888 CD', currentOrder: 'Готов к заказу' },
            { initials: 'СМ', name: 'Сардор Мирзаев', status: 'online', statusText: 'На маршруте', deliveries: 156, rating: 4.8, ontime: 97, shifts: 24, trips: 156, plate: '01 C 999 EF', currentOrder: '#TX-2844 → Мирзо Улугбек' },
            { initials: 'ДР', name: 'Дилшод Рустамов', status: 'online', statusText: 'На маршруте', deliveries: 89, rating: 4.6, ontime: 92, shifts: 18, trips: 89, plate: '01 D 111 GH', currentOrder: '#TX-2843 → Шайхантахур' },
            { initials: 'ЖА', name: 'Жавлон Азимов', status: 'offline', statusText: 'Оффлайн', deliveries: 112, rating: 4.5, ontime: 90, shifts: 21, trips: 112, plate: '01 E 222 IJ', currentOrder: 'Последняя: 2ч назад' },
            { initials: 'ФШ', name: 'Фаррух Шарипов', status: 'online', statusText: 'Свободен', deliveries: 67, rating: 4.9, ontime: 99, shifts: 15, trips: 67, plate: '01 F 333 KL', currentOrder: 'Готов к заказу' },
        ];

        let activeFilters = {};
        let fromDashboard = false;
        let driverStatusFilterActive = false;

