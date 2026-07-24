/* ============ Unified Portal JavaScript ============ */
const SUPABASE_URL = 'https://ctdfpuwkicqadhchticn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZGZwdXdraWNxYWRoY2h0aWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwODUxNzYsImV4cCI6MjA5NDY2MTE3Nn0.dPf4YGHD389bGLlsBpbOPklq-SzU0mtYuYqltObs-zY';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentSection = 'dashboard';
let editingId = null;
let editingType = null;
let userToken = '';
let currentUser = null;

// Intercept fetch to add token
const originalFetch = window.fetch;
window.fetch = async function() {
  let [resource, config] = arguments;
  if (typeof resource === 'string' && resource.startsWith('/api/')) {
    config = config || {};
    config.headers = config.headers || {};
    if (config.headers instanceof Headers) {
      config.headers.set('Authorization', 'Bearer ' + userToken);
    } else {
      config.headers['Authorization'] = 'Bearer ' + userToken;
    }
  }
  const response = await originalFetch(resource, config);
  if (response.status === 401 && !resource.includes('/api/users/me')) {
    logout();
  }
  return response;
};

async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = '/';
    return;
  }
  userToken = session.access_token;
  
  try {
    const res = await fetch('/api/users/me');
    if (res.ok) {
      currentUser = await res.json();
      
      // If user is not admin or editor, redirect to profile page
      if (currentUser.role === 'user') {
        window.location.href = '/profile.html';
        return;
      }
      
      enforceRBAC();
      document.getElementById('portal-container').style.display = 'flex';
      
      // Load initial section
      switchSection(currentSection);
    } else {
      logout();
    }
  } catch(e) {
    logout();
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-')) localStorage.removeItem(key);
  });
  window.location.href = '/';
}

// --- Navigation ---
document.querySelectorAll('.nav-item[data-section]').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const section = item.dataset.section;
    switchSection(section);
  });
});

function switchSection(section) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
  if (navItem) navItem.classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const sectionEl = document.getElementById(`section-${section}`);
  if(sectionEl) sectionEl.classList.add('active');
  
  const titleMap = {
    'dashboard': 'Dashboard'
  };
  
  let formattedTitle = titleMap[section] || (section.charAt(0).toUpperCase() + section.slice(1).replace('_', ' '));
  document.getElementById('page-title').textContent = formattedTitle;
  
  currentSection = section;
  loadSectionData(section);
  
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

// Mobile toggle
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// --- Data Loading ---
async function loadSectionData(section) {
  switch(section) {
    case 'dashboard': await loadDashboard(); break;
    case 'services': await loadServices(); break;
    case 'projects': await loadProjects(); break;
    case 'inquiries': await loadInquiries(); break;
    case 'quotation': await loadQuotations(); break;
    case 'users': await loadUsers(); break;
    case 'team': await loadTeam(); break;
    case 'testimonials': await loadTestimonials(); break;
    case 'settings': await loadSettings(); break;
    case 'content': await loadContentData(); break;
    case 'images': await loadContentData(); break;
    case 'brands': await loadBrands(); break;
  }
}

// --- Admin Specific Logic ---

async function loadDashboard() {
  const stats = await fetch('/api/stats').then(r => r.json());
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card"><div class="icon">⚙️</div><div class="value">${stats.totalServices}</div><div class="label">Total Services</div></div>
    <div class="stat-card"><div class="icon">📁</div><div class="value">${stats.totalProjects}</div><div class="label">Projects</div></div>
    <div class="stat-card"><div class="icon">📩</div><div class="value">${stats.totalInquiries}</div><div class="label">Total Inquiries</div></div>
    <div class="stat-card"><div class="icon">🆕</div><div class="value">${stats.newInquiries}</div><div class="label">New Inquiries</div></div>
    <div class="stat-card"><div class="icon">👥</div><div class="value">${stats.totalTeam}</div><div class="label">Team Members</div></div>
    <div class="stat-card"><div class="icon">⭐</div><div class="value">${stats.totalTestimonials}</div><div class="label">Testimonials</div></div>
  `;
  document.getElementById('inquiry-badge').textContent = stats.newInquiries;

  const inquiries = await fetch('/api/inquiries').then(r => r.json());
  const recent = inquiries.slice(-5).reverse();
  document.getElementById('recent-inquiries').innerHTML = recent.length ? recent.map(i => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
      <div><strong style="color:#fff;">${i.name || 'N/A'}</strong><br><span style="font-size:0.8rem;color:#636366;">${i.email || ''} • ${i.service || 'General'}</span></div>
      <span class="status-badge status-${i.status}">${i.status}</span>
    </div>
  `).join('') : '<div class="empty-state">No inquiries yet.</div>';
}

async function loadServices() {
  const data = await fetch('/api/services').then(r => r.json());
  const tbody = document.querySelector('#services-table tbody');
  
  // Group by category
  const groups = { 'digital-marketing': [], 'branding': [], 'development': [], 'other': [] };
  data.forEach(s => {
    if (groups[s.category]) groups[s.category].push(s);
    else groups['other'].push(s);
  });
  
  let html = '';
  for (const [cat, services] of Object.entries(groups)) {
    if (services.length === 0) continue;
    html += `<tr><td colspan="5" style="background: rgba(255,255,255,0.05); padding: 10px 15px; font-weight: bold; color: var(--primary); text-transform: uppercase; letter-spacing: 1px;">${formatCategory(cat)} SERVICES</td></tr>`;
    html += services.map(s => `<tr>
      <td>${s.icon}</td><td>${s.name}</td>
      <td>${formatCategory(s.category)}</td>
      <td><span class="status-badge ${s.active ? 'status-active' : 'status-closed'}">${s.active ? 'Active' : 'Inactive'}</span></td>
      <td><button class="action-btn" onclick="editService(${s.id})">✏️</button><button class="action-btn delete" onclick="deleteItem('services',${s.id})">🗑️</button></td>
    </tr>`).join('');
  }
  tbody.innerHTML = html;
}

async function loadProjects() {
  const data = await fetch('/api/projects').then(r => r.json());
  const tbody = document.querySelector('#projects-table tbody');
  tbody.innerHTML = data.map(p => `<tr>
    <td>${p.title}</td><td>${formatCategory(p.category)}</td><td>${p.client || '-'}</td>
    <td><span class="status-badge ${p.active ? 'status-active' : 'status-closed'}">${p.active ? 'Active' : 'Hidden'}</span></td>
    <td><button class="action-btn" onclick="editProject(${p.id})">✏️</button><button class="action-btn delete" onclick="deleteItem('projects',${p.id})">🗑️</button></td>
  </tr>`).join('');
}

async function loadInquiries() {
  const data = await fetch('/api/inquiries').then(r => r.json());
  const tbody = document.querySelector('#inquiries-table tbody');
  if (!data.length) { tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No inquiries yet.</td></tr>'; return; }
  tbody.innerHTML = data.reverse().map(i => `<tr>
    <td>${new Date(i.date).toLocaleDateString()}</td><td>${i.name}</td><td>${i.email || '-'}</td><td>${i.phone || '-'}</td><td>${i.service || '-'}</td>
    <td><select onchange="updateInquiryStatus(${i.id},this.value)" style="background:#0f0f17;border:1px solid rgba(255,255,255,0.1);color:#fff;padding:4px 8px;border-radius:6px;font-size:0.8rem;">
      <option value="new" ${i.status==='new'?'selected':''}>New</option>
      <option value="contacted" ${i.status==='contacted'?'selected':''}>Contacted</option>
      <option value="closed" ${i.status==='closed'?'selected':''}>Closed</option>
    </select></td>
    <td><button class="action-btn" onclick="viewInquiry(${i.id})" title="View Details">👁️</button><button class="action-btn" style="color:#d97706;" onclick="generateQuotation(${i.id})" title="Create Quotation">📄</button><button class="action-btn delete" onclick="deleteItem('inquiries',${i.id})" title="Delete">🗑️</button></td>
  </tr>`).join('');
}

async function loadQuotations() {
  const data = await fetch('/api/quotations').then(r => r.json());
  const tbody = document.querySelector('#quotations-table tbody');
  if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No quotations yet.</td></tr>'; return; }
  tbody.innerHTML = data.reverse().map(q => `<tr>
    <td>${new Date(q.date).toLocaleDateString()}</td>
    <td><strong>${q.qtNo}</strong></td>
    <td>${q.name}</td>
    <td>${q.service || '-'}</td>
    <td>₹ ${q.totalAmount ? q.totalAmount.toLocaleString('en-IN') : '-'}</td>
    <td>
      <button class="action-btn" style="color:#10b981;" onclick="editQuotation(${q.id})" title="Edit Document">✏️</button>
      <button class="action-btn" style="color:#2563eb;" onclick="viewQuotation(${q.id})" title="View Document">📄</button>
      <button class="action-btn delete" onclick="deleteItem('quotations',${q.id})" title="Delete">🗑️</button>
    </td>
  </tr>`).join('');
}

async function loadTeam() {
  const data = await fetch('/api/team').then(r => r.json());
  const tbody = document.querySelector('#team-table tbody');
  tbody.innerHTML = data.map(t => `<tr>
    <td>${t.name}</td><td>${t.role}</td>
    <td><span class="status-badge ${t.active ? 'status-active' : 'status-closed'}">${t.active ? 'Active' : 'Hidden'}</span></td>
    <td><button class="action-btn" onclick="editTeamMember(${t.id})">✏️</button><button class="action-btn delete" onclick="deleteItem('team',${t.id})">🗑️</button></td>
  </tr>`).join('');
}

async function loadUsers() {
  try {
    const data = await fetch('/api/users').then(r => r.json());
    if (data.error) throw new Error(data.error);
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = data.map(u => {
      const goalFormatted = u.primary_goal ? u.primary_goal.replace('_', ' ').toUpperCase() : '-';
      return `<tr>
        <td>${u.name}</td><td>${u.email}</td>
        <td>${u.phone || '-'}</td><td>${u.brand_domain || '-'}</td><td><span style="font-size:0.8rem;color:#94a3b8;">${goalFormatted}</span></td>
        <td><span class="status-badge" style="background:#1e293b;">${u.role === 'hidden_admin' ? 'DEVELOPER ACCOUNT' : u.role.replace('_', ' ').toUpperCase()}</span></td>
        <td>
          <button class="action-btn" onclick="editUser('${u.id}')">✏️</button>
          <button class="action-btn delete" onclick="deleteItem('users','${u.id}')">🗑️</button>
        </td>
      </tr>`;
    }).join('');
  } catch (err) {
    document.querySelector('#users-table tbody').innerHTML = '<tr><td colspan="7" class="empty-state">Access Denied</td></tr>';
  }
}

async function loadTestimonials() {
  const data = await fetch('/api/testimonials').then(r => r.json());
  const tbody = document.querySelector('#testimonials-table tbody');
  tbody.innerHTML = data.map(t => `<tr>
    <td>${t.client_name}</td><td>${t.company || '-'}</td><td>${'★'.repeat(t.rating)}</td>
    <td><button class="action-btn" onclick="editTestimonial(${t.id})">✏️</button><button class="action-btn delete" onclick="deleteItem('testimonials',${t.id})">🗑️</button></td>
  </tr>`).join('');
}

async function loadSettings() {
  const data = await fetch('/api/settings').then(r => r.json());
  const form = document.getElementById('settings-form');
  const fields = [
    {key:'siteName',label:'Site Name'},{key:'tagline',label:'Tagline'},
    {key:'phone',label:'Phone'},{key:'email',label:'Email'},
    {key:'whatsapp',label:'WhatsApp Number'},{key:'address',label:'Address',full:true},
    {key:'businessHours',label:'Business Hours'},{key:'googleMap',label:'Google Map URL'},
    {key:'facebook',label:'Facebook URL'},{key:'instagram',label:'Instagram URL'},
    {key:'linkedin',label:'LinkedIn URL'},{key:'youtube',label:'YouTube URL'},
    {key:'threads',label:'Threads URL'}
  ];
  form.innerHTML = fields.map(f => `<div class="form-group ${f.full?'full':''}"><label>${f.label}</label><input type="text" class="form-control" name="${f.key}" value="${data[f.key]||''}"></div>`).join('') + '<button type="submit" class="btn-submit full">Save Settings</button>';
  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(form));
    // Preserve trustedBrands if it exists in data
    if (data.trustedBrands) formData.trustedBrands = data.trustedBrands;
    await fetch('/api/settings', {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(formData)});
    showToast('Settings saved!','success');
  };
}

let currentBrandsList = [];

async function loadBrands() {
  try {
    const res = await fetch('/api/clients?t=' + new Date().getTime());
    if (res.ok) {
      currentBrandsList = await res.json();
    } else {
      currentBrandsList = [];
    }
    renderBrandsTable();
  } catch (e) {
    console.error("Failed to load clients", e);
  }
}

function renderBrandsTable() {
  const tbody = document.querySelector('#brands-table tbody');
  if (currentBrandsList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No brands added yet.</td></tr>';
    return;
  }
  
  tbody.innerHTML = currentBrandsList.map((brand, index) => `
    <tr>
      <td>
        ${brand.logo_url ? `<img src="${brand.logo_url}" style="height: 40px; max-width: 120px; object-fit: contain; background: #1e293b; padding: 4px; border-radius: 4px;">` : 'No Logo'}
      </td>
      <td><b>${brand.name || 'Unnamed'}</b></td>
      <td>
        <button class="action-btn" style="color:#10b981;" onclick="editBrand(${index})" title="Edit">✏️</button>
        <button class="action-btn delete" onclick="deleteBrand(${index})" title="Delete">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function editBrand(index) {
  const item = currentBrandsList[index];
  openModal('brand', item);
}

async function deleteBrand(index) {
  const item = currentBrandsList[index];
  if (confirm(`Are you sure you want to remove "${item.name}"?`)) {
    try {
      const response = await fetch(`/api/clients/${item.id}`, { method: 'DELETE' });
      if (response.ok) {
        showToast('Brand deleted successfully!', 'success');
        await loadBrands();
      } else {
        showToast('Failed to delete brand.', 'error');
      }
    } catch (e) {
      showToast('Error deleting brand.', 'error');
    }
  }
}

// --- Content CMS ---
let websiteContent = {};

async function loadContentData() {
  try {
    const res = await fetch('/api/content');
    if(res.ok) websiteContent = await res.json();
    document.getElementById('content-page-select').value = '';
    document.getElementById('content-editor-form').style.display = 'none';
  } catch(e) {
    console.error('Failed to load content', e);
  }
}

function renderContentEditor() {
  const page = document.getElementById('content-page-select').value;
  const form = document.getElementById('content-editor-form');
  const fieldsContainer = document.getElementById('content-fields');
  
  if (!page) {
    form.style.display = 'none';
    return;
  }

  // Auto-create page if not exists
  if (!websiteContent[page]) {
    websiteContent[page] = {
      hero: { title: "", description: "" }
    };
  }
  
  const pageData = websiteContent[page];
  let html = '';
  
  for (const [sectionKey, sectionData] of Object.entries(pageData)) {
    html += `<div style="background:rgba(255,255,255,0.02); padding:20px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">`;
    html += `<h4 style="margin:0 0 15px 0; color:#d97706; text-transform:uppercase; letter-spacing:1px; font-size:0.8rem;">Section: ${sectionKey.replace('_', ' ')}</h4>`;
    
    for (const [fieldKey, val] of Object.entries(sectionData)) {
      let hint = '';
      const keyLower = fieldKey.toLowerCase();
      if (keyLower.includes('title') || keyLower.includes('heading')) hint = ' (Heading / Bada Text)';
      else if (keyLower.includes('desc') || keyLower.includes('para') || keyLower.includes('text') || keyLower.includes('content') || keyLower.includes('lead')) hint = ' (Paragraph / Lamba Text)';
      else if (keyLower.includes('badge') || keyLower.includes('sub')) hint = ' (Chota Heading / Upar ka text)';
      else if (keyLower.includes('btn') || keyLower.includes('button')) hint = ' (Button ka text)';
      else if (keyLower.includes('link') || keyLower.includes('url')) hint = ' (Link / URL)';

      html += `<div class="form-group" style="margin-bottom:15px;">
        <label style="font-size:13px; color:#94a3b8; margin-bottom:5px; display:block; text-transform:capitalize;">
          ${fieldKey.replace(/([A-Z])/g, ' $1').trim()} <span style="color:#64748b; font-size:0.75rem;">${hint}</span>
        </label>`;
      
      if (typeof val === 'string' && (val.length > 60 || keyLower.includes('desc') || keyLower.includes('para'))) {
        html += `<textarea class="form-control" name="${page}.${sectionKey}.${fieldKey}" rows="3" style="padding:10px; background:#0f172a;">${val}</textarea>`;
      } else {
        html += `<input type="text" class="form-control" name="${page}.${sectionKey}.${fieldKey}" value="${String(val).replace(/"/g, '&quot;')}" style="padding:10px; background:#0f172a;">`;
      }
      html += `</div>`;
    }
    
    html += `<button type="button" class="btn-add" style="margin-top:10px; padding:6px 12px; font-size:0.8rem; background: rgba(255,255,255,0.1);" onclick="addNewField('${page}', '${sectionKey}')">+ Naya Field Add Karein</button>`;
    html += `</div>`;
  }
  
  html += `<div style="text-align:center; margin-top:20px;">
             <button type="button" class="btn-add" style="background:#475569;" onclick="addNewSection('${page}')">+ Naya Section Add Karein</button>
           </div>`;
  
  fieldsContainer.innerHTML = html;
  form.style.display = 'block';
}

function addNewField(page, section) {
  const fieldName = prompt("Field ka naam likhein (e.g., 'title', 'description', 'buttonText'):");
  if (fieldName && fieldName.trim()) {
    if (!websiteContent[page]) websiteContent[page] = {};
    if (!websiteContent[page][section]) websiteContent[page][section] = {};
    websiteContent[page][section][fieldName.trim()] = "";
    renderContentEditor();
  }
}

function addNewSection(page) {
  const sectionName = prompt("Section ka naam likhein (e.g., 'hero', 'about', 'footer'):");
  if (sectionName && sectionName.trim()) {
    if (!websiteContent[page]) websiteContent[page] = {};
    websiteContent[page][sectionName.trim()] = { title: "", description: "" };
    renderContentEditor();
  }
}

async function saveContent(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  for (let [name, value] of formData.entries()) {
    const [page, section, field] = name.split('.');
    if (!websiteContent[page]) websiteContent[page] = {};
    if (!websiteContent[page][section]) websiteContent[page][section] = {};
    websiteContent[page][section][field] = value;
  }
  
  try {
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      },
      body: JSON.stringify(websiteContent)
    });
    
    if (res.ok) showToast('Content updated! Changes reflect on the website instantly.', 'success');
    else showToast('Failed to update content.', 'error');
  } catch(err) {
    showToast('Error saving content.', 'error');
  }
}

// --- CMS Images Logic ---
function loadImagePreview() {
  const select = document.getElementById('image-target-select');
  const previewGroup = document.getElementById('image-preview-group');
  const previewImg = document.getElementById('cms-image-preview');
  
  if (!select.value) {
    previewGroup.style.display = 'none';
    return;
  }
  
  const [page, section, field] = select.value.split('.');
  if (websiteContent[page] && websiteContent[page][section] && websiteContent[page][section][field]) {
    previewImg.src = websiteContent[page][section][field];
    previewGroup.style.display = 'block';
  } else {
    previewGroup.style.display = 'none';
  }
}

async function uploadCMSImage(e) {
  e.preventDefault();
  const select = document.getElementById('image-target-select');
  const fileInput = document.getElementById('cms-image-file');
  const btn = document.getElementById('btn-upload-image');
  
  if (!select.value || !fileInput.files[0]) return;
  
  const originalText = btn.textContent;
  btn.textContent = 'Uploading...';
  btn.disabled = true;
  
  try {
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('folder', 'images'); // optional
    
    const token = localStorage.getItem('lookupp_token') || localStorage.getItem('supabase.auth.token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const uploadRes = await fetch('/api/upload-image', {
      method: 'POST',
      headers,
      body: formData
    });
    
    if (!uploadRes.ok) throw new Error('Upload failed');
    const uploadData = await uploadRes.json();
    const imageUrl = uploadData.url;
    
    // Update websiteContent locally
    const [page, section, field] = select.value.split('.');
    if (!websiteContent[page]) websiteContent[page] = {};
    if (!websiteContent[page][section]) websiteContent[page][section] = {};
    websiteContent[page][section][field] = imageUrl;
    
    // Save to backend
    const saveRes = await fetch('/api/content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(websiteContent)
    });
    
    if (saveRes.ok) {
      showToast('Image updated successfully! Changes reflect on the website instantly.', 'success');
      loadImagePreview();
      fileInput.value = '';
    } else {
      showToast('Failed to save image to CMS.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('An error occurred during upload.', 'error');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// --- CRUD Functions (Brands) ---
function openModal(type, data = null) {
  editingType = type;
  editingId = data ? data.id : null;
  const title = document.getElementById('modal-title');
  const form = document.getElementById('modal-form');
  let fields = '';

  if (type === 'brand') {
    title.textContent = data ? 'Edit Brand' : 'Add Brand';
    fields = `
      <div class="form-group"><label>Brand Name</label><input class="form-control" name="name" value="${data?.name||''}" required></div>
      <div class="form-group">
        <label>Logo Image</label>
        <input type="file" class="form-control" name="image" accept="image/*" ${data ? '' : 'required'}>
        ${data?.logo_url ? `<p style="margin-top:8px;">Current Logo: <br><img src="${data.logo_url}" style="height:40px; max-width:120px; object-fit:contain; background:#1e293b; padding:4px; border-radius:4px; margin-top:4px;"></p>` : ''}
      </div>
      <button type="submit" class="btn-submit">${data?'Update':'Add'} Brand</button>`;
  } else if (type === 'service') {
    title.textContent = data ? 'Edit Service' : 'Add Service';
    fields = `
      <div class="form-group"><label>Name</label><input class="form-control" name="name" value="${data?.name||''}" required></div>
      <div class="form-group"><label>Icon (emoji)</label><input class="form-control" name="icon" value="${data?.icon||''}" placeholder="e.g. 📱"></div>
      <div class="form-group"><label>Category</label><select class="form-control" name="category"><option value="digital-marketing" ${data?.category==='digital-marketing'?'selected':''}>Digital Marketing</option><option value="creative-branding" ${data?.category==='creative-branding'?'selected':''}>Creative & Branding</option><option value="development" ${data?.category==='development'?'selected':''}>Development</option></select></div>
      <div class="form-group"><label>Description</label><textarea class="form-control" name="description">${data?.description||''}</textarea></div>
      <button type="submit" class="btn-submit">${data?'Update':'Add'} Service</button>`;
  } else if (type === 'project') {
    title.textContent = data ? 'Edit Project' : 'Add Project';
    fields = `
      <div class="form-group"><label>Title</label><input class="form-control" name="title" value="${data?.title||''}" required></div>
      <div class="form-group"><label>Category</label><select class="form-control" name="category"><option value="website" ${data?.category==='website'?'selected':''}>Website</option><option value="app" ${data?.category==='app'?'selected':''}>App</option><option value="branding" ${data?.category==='branding'?'selected':''}>Branding</option><option value="video" ${data?.category==='video'?'selected':''}>Video</option><option value="social-media" ${data?.category==='social-media'?'selected':''}>Social Media</option><option value="marketing" ${data?.category==='marketing'?'selected':''}>Marketing</option></select></div>
      <div class="form-group"><label>Client</label><input class="form-control" name="client" value="${data?.client||''}"></div>
      <div class="form-group">
        <label>Project Image</label>
        <input type="file" class="form-control" name="image" accept="image/*">
        ${data?.image ? `<p style="margin-top:8px;">Current Image: <br><img src="${data.image}" style="height:50px; max-width:150px; object-fit:contain; border-radius:4px; margin-top:4px;"></p>` : ''}
      </div>
      <div class="form-group"><label>Description</label><textarea class="form-control" name="description">${data?.description||''}</textarea></div>
      <button type="submit" class="btn-submit">${data?'Update':'Add'} Project</button>`;
  } else if (type === 'team') {
    title.textContent = data ? 'Edit Member' : 'Add Member';
    fields = `
      <div class="form-group"><label>Name</label><input class="form-control" name="name" value="${data?.name||''}" required></div>
      <div class="form-group"><label>Role</label><input class="form-control" name="role" value="${data?.role||''}"></div>
      <div class="form-group">
        <label>Member Photo</label>
        <input type="file" class="form-control" name="image" accept="image/*">
        ${data?.image ? `<p style="margin-top:8px;">Current Photo: <br><img src="${data.image}" style="height:50px; max-width:150px; object-fit:contain; border-radius:4px; margin-top:4px;"></p>` : ''}
      </div>
      <div class="form-group"><label>Bio</label><textarea class="form-control" name="bio">${data?.bio||''}</textarea></div>
      <button type="submit" class="btn-submit">${data?'Update':'Add'} Member</button>`;
  } else if (type === 'testimonial') {
    title.textContent = data ? 'Edit Testimonial' : 'Add Testimonial';
    fields = `
      <div class="form-group"><label>Name</label><input class="form-control" name="client_name" value="${data?.client_name||''}" required></div>
      <div class="form-group"><label>Company</label><input class="form-control" name="company" value="${data?.company||''}"></div>
      <div class="form-group"><label>Rating (1-5)</label><input type="number" min="1" max="5" class="form-control" name="rating" value="${data?.rating||5}"></div>
      <div class="form-group"><label>Review Text</label><textarea class="form-control" name="feedback">${data?.feedback||''}</textarea></div>
      <button type="submit" class="btn-submit">${data?'Update':'Add'} Testimonial</button>`;
  } else if (type === 'quotation') {
    title.textContent = data ? 'Edit Quotation' : 'Create New Quotation';
    
    const AVAILABLE_SERVICES = [
      { id: 'web_dev', name: 'Website Development', desc: 'Custom, responsive website design and development.', price: 15000 },
      { id: 'app_dev', name: 'Mobile App Development', desc: 'Native/Hybrid mobile application development for iOS and Android.', price: 25000 },
      { id: 'seo', name: 'SEO Optimization', desc: 'Search Engine Optimization to rank higher and drive organic traffic.', price: 10000 },
      { id: 'smm', name: 'Social Media Marketing', desc: 'End-to-end social media management and ad campaigns.', price: 12000 },
      { id: 'branding', name: 'Creative Branding', desc: 'Logo design, brand identity, and brand guidelines.', price: 8000 },
      { id: 'video', name: 'Video Editing', desc: 'High quality video editing and production services.', price: 5000 },
      { id: 'crm', name: 'CRM & Automation', desc: 'Lead management and workflow automation setup.', price: 15000 }
    ];

    fields = `
      <div class="form-group"><label>Client Name</label><input class="form-control" name="name" value="${data?.name||''}" required></div>
      <div class="form-group"><label>Email</label><input type="email" class="form-control" name="email" value="${data?.email||''}"></div>
      <div class="form-group"><label>Phone</label><input class="form-control" name="phone" value="${data?.phone||''}"></div>
      <div class="form-group"><label>Company</label><input class="form-control" name="company" value="${data?.company||''}"></div>
      
      <div class="form-group full">
        <label>Quotation For (Services)</label>
        <div style="max-height: 180px; overflow-y: auto; background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          ${AVAILABLE_SERVICES.map(s => `
            <label style="display:flex; align-items:center; cursor:pointer; color:#e2e8f0; font-size:0.9rem;">
              <input type="checkbox" name="services[]" value="${s.id}" data-desc="${s.desc}" data-name="${s.name}" data-price="${s.price}" onchange="updateQuotationDescription()" ${data && data.service && data.service.includes(s.name) ? 'checked' : ''} style="margin-right:10px; width:16px; height:16px; cursor:pointer;">
              ${s.name}
            </label>
          `).join('')}
        </div>
      </div>
      <input type="hidden" name="service" id="hidden-service" value="${data?.service||''}">
      
      <div class="form-group full">
        <label>Service Description (Auto-filled)</label>
        <textarea class="form-control" name="description" id="quote-desc" rows="4" style="background:#1e293b; color:#94a3b8;">${data?.description||''}</textarea>
      </div>

      <div class="form-group"><label>Base Subtotal Amount (INR)</label><input type="number" class="form-control" name="subtotal" value="${data?.subtotal||15000}" required></div>
      <button type="submit" class="btn-submit full">${data ? 'Update Quotation' : 'Generate & Save Quotation'}</button>`;
  } else if (type === 'user') {
    title.textContent = data ? 'Edit User' : 'Add User';
    fields = `
      <div class="form-group"><label>Name</label><input class="form-control" name="name" value="${data?.name||''}" required></div>
      <div class="form-group"><label>Email</label><input type="email" class="form-control" name="email" value="${data?.email||''}" required></div>
      <div class="form-group"><label>Password</label><input type="text" class="form-control" name="password" value="${data?.password||''}" placeholder="Leave blank to keep existing"></div>
      <div class="form-group"><label>Role</label><select class="form-control" name="role">
        <option value="super_admin" ${data?.role==='super_admin'?'selected':''}>Super Admin</option>
        <option value="admin" ${data?.role==='admin'?'selected':''}>Admin</option>
        <option value="editor" ${data?.role==='editor'?'selected':''}>Editor / Auditor</option>
        <option value="sub_editor" ${data?.role==='sub_editor'?'selected':''}>Sub Editor</option>
      </select></div>
      <button type="submit" class="btn-submit">${data?'Update':'Add'} User</button>`;
  }

  form.innerHTML = fields;
  form.onsubmit = (e) => handleModalSubmit(e);
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  editingId = null;
  editingType = null;
}

async function handleModalSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('modal-form');
  const endpoints = {service:'services',project:'projects',team:'team',testimonial:'testimonials',quotation:'quotations',user:'users',brand:'clients'};
  const endpoint = endpoints[editingType];

  try {
    let resultData;
    let response;
    const hasFiles = ['project', 'team', 'brand'].includes(editingType);
    
    if (hasFiles) {
      const formData = new FormData(form);
      if (editingId) {
        response = await fetch(`/api/${endpoint}/${editingId}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        response = await fetch(`/api/${endpoint}`, {
          method: 'POST',
          body: formData
        });
      }
    } else {
      let formData = Object.fromEntries(new FormData(form));
      if (formData.rating) formData.rating = parseInt(formData.rating);
      
      // Don't overwrite password with empty string if left blank
      if (editingType === 'user' && !formData.password) {
        delete formData.password;
      }
      
      // Handle Quotation specific mapping to match DB schema
      if (editingType === 'quotation') {
        const payload = {
          name: formData.name || '',
          email: formData.email || '',
          phone: formData.phone || '',
          service: formData.service || '',
          details: formData.description || '', // Map description to details
          totalAmount: formData.subtotal ? Math.round(parseInt(formData.subtotal) * 1.18) : 0
        };
        // Generate qtNo for new quotations if needed
        if (!editingId) {
          payload.qtNo = 'QT-' + Math.floor(1000 + Math.random() * 9000);
          payload.status = 'pending';
        }
        formData = payload;
      } else if (formData.subtotal) {
        // Just in case other types use subtotal
        formData.subtotal = parseInt(formData.subtotal);
        formData.gst = Math.round(formData.subtotal * 0.18);
        formData.totalAmount = formData.subtotal + formData.gst;
      }
      if (editingId) {
        response = await fetch(`/api/${endpoint}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch(`/api/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
    }
    
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
      let errorMsg = `Server error (${response.status})`;
      if (contentType && contentType.includes("application/json")) {
        const errData = await response.json();
        errorMsg = errData.error || errorMsg;
      } else {
        const text = await response.text();
        console.error("API Error Response:", text);
        if (text.includes('<html')) {
          errorMsg = `Server returned HTML instead of data. (Status: ${response.status}). If using PM2, disable --watch.`;
        } else {
          errorMsg = text;
        }
      }
      throw new Error(errorMsg);
    }
    
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Invalid response format from server.");
    }
    
    resultData = await response.json();
    showToast(editingId ? 'Updated successfully!' : 'Added successfully!', 'success');
    closeModal();
    
    if (endpoint === 'quotations' && resultData && resultData.data) {
      viewQuotation(resultData.data.id);
    } else {
      loadSectionData(currentSection);
    }
  } catch(err) { showToast('Error: ' + err.message,'error'); }
}

// --- Edit handlers ---
async function editService(id) {
  const data = await fetch('/api/services').then(r=>r.json());
  const item = data.find(s=>s.id===id);
  if(item) openModal('service', item);
}
async function editProject(id) {
  const data = await fetch('/api/projects').then(r=>r.json());
  const item = data.find(p=>p.id===id);
  if(item) openModal('project', item);
}
async function editTeamMember(id) {
  const data = await fetch('/api/team').then(r=>r.json());
  const item = data.find(t=>t.id===id);
  if(item) openModal('team', item);
}
async function editTestimonial(id) {
  const data = await fetch('/api/testimonials').then(r=>r.json());
  const item = data.find(t=>t.id===id);
  if(item) openModal('testimonial', item);
}
async function editQuotation(id) {
  const data = await fetch('/api/quotations').then(r=>r.json());
  const item = data.find(q=>q.id===id);
  if(item) openModal('quotation', item);
}
async function editUser(id) {
  const data = await fetch('/api/users').then(r=>r.json());
  const item = data.find(u=>u.id===id);
  if(item) {
    // Hide password for security reasons in frontend unless they change it
    item.password = ''; 
    openModal('user', item);
  }
}

// --- Delete ---
async function deleteItem(endpoint, id) {
  if (!confirm('Are you sure you want to delete this item?')) return;
  await fetch(`/api/${endpoint}/${id}`, {method:'DELETE'});
  showToast('Deleted successfully!','success');
  loadSectionData(currentSection);
}

// --- Inquiry helpers ---
async function updateInquiryStatus(id, status) {
  await fetch(`/api/inquiries/${id}`, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
  showToast('Status updated!','success');
}

async function viewInquiry(id) {
  const data = await fetch('/api/inquiries').then(r=>r.json());
  const item = data.find(i=>i.id===id);
  if(!item) return;
  const form = document.getElementById('modal-form');
  document.getElementById('modal-title').textContent = 'Inquiry Details';
  form.innerHTML = `
    <div style="space-y:12px;"><p><strong>Name:</strong> ${item.name}</p><p><strong>Email:</strong> ${item.email||'-'}</p><p><strong>Phone:</strong> ${item.phone||'-'}</p><p><strong>Service:</strong> ${item.service||'-'}</p><p><strong>Message:</strong> ${item.message||'-'}</p><p><strong>Date:</strong> ${new Date(item.date).toLocaleString()}</p><p><strong>Status:</strong> ${item.status}</p></div>`;
  form.onsubmit = (e) => e.preventDefault();
  document.getElementById('modal-overlay').classList.add('open');
}

// --- Helpers ---
function formatCategory(cat) {
  if(!cat) return '-';
  return cat.split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
}

function showToast(msg, type) {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity 0.3s';setTimeout(()=>t.remove(),300);},3000);
}

// --- RBAC Frontend Enforcement ---
function enforceRBAC() {
  if (!currentUser) return;
  
  if (currentUser.role !== 'user') {
    // Show admin navigation links
    document.querySelectorAll('.admin-nav').forEach(el => el.style.display = 'flex');
    document.querySelector('.sidebar-divider.admin-nav').style.display = 'block';
  }
  
  if (currentUser.role === 'editor' || currentUser.role === 'sub_editor') {
    // Hide unnecessary tabs for editors
    document.querySelector('.nav-item[data-section="services"]').style.display = 'none';
    document.querySelector('.nav-item[data-section="projects"]').style.display = 'none';
    document.querySelector('.nav-item[data-section="team"]').style.display = 'none';
    document.querySelector('.nav-item[data-section="testimonials"]').style.display = 'none';
    document.querySelector('.nav-item[data-section="settings"]').style.display = 'none';
    document.querySelector('.nav-item[data-section="content"]').style.display = 'none';
    document.querySelector('.nav-item[data-section="users"]').style.display = 'none';
  }
  
  if (currentUser.role !== 'hidden_admin' && currentUser.role !== 'super_admin') {
    const usersNav = document.querySelector('.nav-item[data-section="users"]');
    if(usersNav) usersNav.style.display = 'none';
  }
  
  if (currentUser.role !== 'hidden_admin' && currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
    const contentNav = document.querySelector('.nav-item[data-section="content"]');
    if(contentNav) contentNav.style.display = 'none';
  }
  
  if (currentUser.role === 'sub_editor') {
    // Hide download button globally
    const style = document.createElement('style');
    style.innerHTML = `button[onclick="downloadQuotation()"] { display: none !important; }`;
    document.head.appendChild(style);
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

// --- Quotation Generator ---
async function generateQuotation(inquiryId) {
  const data = await fetch('/api/inquiries').then(r=>r.json());
  const inquiry = data.find(i=>i.id===inquiryId);
  if(!inquiry) return;
  
  openModal('quotation', {
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    company: '',
    service: inquiry.service,
    subtotal: 15000
  });
}

async function viewQuotation(id) {
  const data = await fetch('/api/quotations').then(r=>r.json());
  const q = data.find(i=>i.id===id);
  if(!q) return;
  
  // Switch to Quotation builder view
  switchSection('quotation-builder');
  
  // Fill Client Details
  document.getElementById('q-client-name').textContent = q.name || '-';
  document.getElementById('q-client-phone').textContent = q.phone || '-';
  document.getElementById('q-client-email').textContent = q.email || '-';
  document.getElementById('q-client-company').textContent = q.company || '-';
  
  // Set meta details
  const today = new Date(q.date);
  const validUntil = new Date(q.date);
  validUntil.setDate(today.getDate() + 15);
  
  const formattedToday = today.toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'});
  const formattedValid = validUntil.toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'});
  
  document.getElementById('q-doc-no').textContent = q.qtNo;
  document.getElementById('q-doc-date').textContent = formattedToday;
  document.getElementById('q-doc-valid').textContent = formattedValid;
  document.getElementById('q-doc-for').textContent = q.service || 'Digital Services';
  
  // Convert totalAmount to subtotal and GST
  const total = q.totalAmount || 0;
  const subtotal = Math.round(total / 1.18);
  const gst = total - subtotal;

  // Render Services based on inputs
  let servicesHtml = '';
  
  servicesHtml += `<tr class="cat-row"><td colspan="5">A. Primary Services</td></tr>`;
  
  servicesHtml += `
    <tr>
      <td>1</td>
      <td><b>${q.service || 'Digital Services'}</b></td>
      <td style="white-space: pre-line;">${q.details || 'Comprehensive management & optimization'}</td>
      <td>One Time / Monthly</td>
      <td style="text-align:right;">₹ ${subtotal.toLocaleString('en-IN')}</td>
    </tr>
  `;
  
  document.getElementById('q-services-body').innerHTML = servicesHtml;
  
  // Calculate Totals
  document.getElementById('q-subtotal').textContent = '₹ ' + subtotal.toLocaleString('en-IN');
  document.getElementById('q-gst').textContent = '₹ ' + gst.toLocaleString('en-IN');
  document.getElementById('q-total').textContent = '₹ ' + total.toLocaleString('en-IN');
  
  // Convert number to words
  document.getElementById('q-amount-words-text').textContent = numberToWords(total) + ' Only.';
}

function numberToWords(num) {
  // Very simplified number to words for demonstration
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
  
  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return; let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return 'Rupees ' + str;
}

function downloadQuotation() {
  const element = document.getElementById('quotation-document');
  const clientName = document.getElementById('q-client-name').textContent.replace(/[^a-zA-Z0-9]/g, '_');
  const opt = {
    margin:       0,
    filename:     `Quotation_${clientName}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'px', format: [794, 1123], orientation: 'portrait' }
  };
  
  showToast('Generating PDF...', 'success');
  html2pdf().set(opt).from(element).save();
}

function sendQuotationEmail() {
  const email = document.getElementById('q-client-email').textContent;
  if(email === '-' || !email) {
    showToast('Client email address not found.', 'error');
    return;
  }
  // Mock sending email
  showToast(`Quotation sent successfully to ${email}!`, 'success');
}

window.updateQuotationDescription = function() {
  const checkboxes = document.querySelectorAll('input[name="services[]"]:checked');
  let selectedNames = [];
  let combinedDesc = [];
  let totalBasePrice = 0;
  
  checkboxes.forEach(cb => {
    selectedNames.push(cb.getAttribute('data-name'));
    combinedDesc.push('• ' + cb.getAttribute('data-desc'));
    totalBasePrice += parseInt(cb.getAttribute('data-price') || 0);
  });
  
  const hiddenInput = document.getElementById('hidden-service');
  const descInput = document.getElementById('quote-desc');
  const subtotalInput = document.querySelector('input[name="subtotal"]');
  
  if (hiddenInput) hiddenInput.value = selectedNames.join(', ');
  if (descInput) descInput.value = combinedDesc.join('\n');
  if (subtotalInput && totalBasePrice > 0) subtotalInput.value = totalBasePrice;
};
