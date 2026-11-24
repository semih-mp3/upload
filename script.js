// ==========================================
// SUPABASE AYARLARI (Canlıya alırken burayı doldur)
// ==========================================
const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_MduuR2nsKw1UzupIjf5SrQ_Mlh0yBPm';
const BUCKET_NAME = 'resimler';

let supabaseClient = null;
if (SUPABASE_URL.startsWith('http')) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const loadingBox = document.getElementById('loadingBox');
const resultsArea = document.getElementById('resultsArea');

// Sürükle-Bırak Olayları
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

// Dosyaları İşleme ve Yükleme
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
    let finalUrl = '';

    // Eğer Supabase bilgileri girildiyse buluta yükle
    if (supabaseClient) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { data, error } = await supabaseClient.storage
            .from(BUCKET_NAME)
            .upload(fileName, file);

        if (error) {
            alert('Yükleme hatası: ' + error.message);
            return;
        }

        const { data: publicData } = supabaseClient.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        finalUrl = publicData.publicUrl;
    } else {
        // Supabase henüz bağlanmadıysa yerel önizleme linki üret
        finalUrl = URL.createObjectURL(file);
    }

    createResultCard(finalUrl, file.name);
}

// Link Kartı Oluşturma
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

// Tek Tıkla Kopyalama
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