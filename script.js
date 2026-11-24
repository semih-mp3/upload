// ==========================================
// SUPABASE AYARLARI
// ==========================================
const SUPABASE_URL = 'https://vaelmipjkztoccnnirjv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MduuR2nsKw1UzupIjf5SrQ_Mlh0yBPm';
const BUCKET_NAME = 'resimler';

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const loadingBox = document.getElementById('loadingBox');
const resultsArea = document.getElementById('resultsArea');

// Sürükle-Bırak ve Dosya Seçme Olayları
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

async function handleFiles(files) {
    if (!files.length) return;
    loadingBox.style.display = 'block';

    for (let file of files) {
        if (!file.type.startsWith('image/')) {
            alert(file.name + ' bir resim dosyası değil!');
            continue;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert(file.name + ' 10 MB sınırını aşıyor!');
            continue;
        }
        await uploadImage(file);
    }

    loadingBox.style.display = 'none';
    fileInput.value = '';
}

async function uploadImage(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const uploadEndpoint = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${fileName}`;

    try {
        const response = await fetch(uploadEndpoint, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,                
                'Content-Type': file.type
            },
            body: file
        });

        if (!response.ok) {
            const errData = await response.json();
            alert('Yükleme hatası: ' + (errData.message || response.statusText));
            return;
        }

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
        createResultCard(publicUrl, file.name);

    } catch (err) {
        alert('Bağlantı hatası: ' + err.message);
    }
}

function createResultCard(url, fileName) {
    const bbCode = `[img]${url}[/img]`;
    const htmlCode = `<img src="${url}" alt="${fileName}">`;

    const card = document.createElement('div');
    card.className = 'result-card';

    card.innerHTML = `
        <img src="${url}" alt="${fileName}" class="result-preview">
        <div class="result-links">
            <div class="link-group">
                <label>Doğrudan Erişim Linki</label>
                <div class="copy-row">
                    <input type="text" class="copy-input" value="${url}" readonly>
                    <button class="copy-btn" onclick="copyText(this)">Kopyala</button>
                </div>
            </div>
            <div class="link-group">
                <label>Forumlar İçin (BBCode)</label>
                <div class="copy-row">
                    <input type="text" class="copy-input" value="${bbCode}" readonly>
                    <button class="copy-btn" onclick="copyText(this)">Kopyala</button>
                </div>
            </div>
            <div class="link-group">
                <label>Web Siteleri İçin (HTML)</label>
                <div class="copy-row">
                    <input type="text" class="copy-input" value='${htmlCode}' readonly>
                    <button class="copy-btn" onclick="copyText(this)">Kopyala</button>
                </div>
            </div>
        </div>
    `;

    resultsArea.insertBefore(card, resultsArea.firstChild);
}

function copyText(btn) {
    const input = btn.previousElementSibling;
    input.select();
    navigator.clipboard.writeText(input.value);

    const oldText = btn.textContent;
    btn.textContent = 'Kopyalandı ✓';
    btn.style.backgroundColor = '#22c55e';
    btn.style.borderColor = '#22c55e';
    btn.style.color = '#fff';

    setTimeout(() => {
        btn.textContent = oldText;
        btn.style.backgroundColor = '';
        btn.style.borderColor = '';
        btn.style.color = '';
    }, 1500);
}



     


