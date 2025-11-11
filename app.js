(() => {
const plant = findPlantById(id);
// build suggested object and show
currentScan = {
tempId: uid('scan'),
filename: file.name,
timestamp: new Date().toISOString(),
suggestedId: plant.id,
suggestedCommon: plant.common,
suggestedScientific: plant.scientific,
dataUrl: previewImg.src
};
suggestionBox.innerHTML = '';
const thumb = document.createElement('img'); thumb.src = currentScan.dataUrl; thumb.alt = plant.common;
const info = document.createElement('div'); info.innerHTML = `<strong>${plant.common}</strong><div class="muted">${plant.scientific}</div><p class="muted">${plant.description}</p>`;
suggestionBox.appendChild(thumb); suggestionBox.appendChild(info);
scanResultsBox.hidden = false;
addToLibraryBtn.disabled = false;
scanBtn.disabled = false;
});


reScanBtn.addEventListener('click', ()=>{ scanResultsBox.hidden = true; addToLibraryBtn.disabled = true; });


addToLibraryBtn.addEventListener('click', ()=>{
if (!currentScan) return; // construir entrada final con notas vacías
const entry = {
id: uid('lib'), filename: currentScan.filename, timestamp: currentScan.timestamp,
suggestedId: currentScan.suggestedId, suggestedCommon: currentScan.suggestedCommon, suggestedScientific: currentScan.suggestedScientific,
dataUrl: currentScan.dataUrl, notes: '', modified: null
};
library.unshift(entry); saveLibrary(); renderLibrary(applyFilters()); // limpiar área
scanResultsBox.hidden = true; addToLibraryBtn.disabled = true; fileInput.value = null; previewImg.src=''; previewImg.hidden=true;
currentScan = null;
});


// export/import
exportBtn.addEventListener('click', ()=>{
const data = JSON.stringify(library, null, 2); const blob = new Blob([data], {type:'application/json'}); const url = URL.createObjectURL(blob);
const a = document.createElement('a'); a.href = url; a.download = 'raizdigital_library_' + (new Date()).toISOString().slice(0,19).replace(/[:T]/g,'-') + '.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});


importBtn.addEventListener('click', ()=>{ const inp = document.createElement('input'); inp.type='file'; inp.accept='application/json'; inp.addEventListener('change', (e)=>{ const f = e.target.files[0]; if (!f) return; const reader = new FileReader(); reader.onload = ()=>{ try{ const data = JSON.parse(reader.result); if (!Array.isArray(data)) throw new Error('Formato inválido'); library = data.concat(library); saveLibrary(); renderLibrary(applyFilters()); alert('Importación completada.'); }catch(err){ alert('No se pudo importar: '+err.message); } }; reader.readAsText(f); }); inp.click(); });


clearBtn.addEventListener('click', ()=>{ if (!confirm('¿Borrar todos los escaneos almacenados? Esta acción no se puede deshacer.')) return; library = []; saveLibrary(); renderLibrary(); });


// search / filter events
searchInput.addEventListener('input', ()=> renderLibrary(applyFilters()));
filterSelect.addEventListener('change', ()=> renderLibrary(applyFilters()));


// drag & drop
['dragenter','dragover'].forEach(evt => document.body.addEventListener(evt, (e)=>{ e.preventDefault(); e.stopPropagation(); document.body.classList.add('dragover'); }));
['dragleave','drop'].forEach(evt => document.body.addEventListener(evt, (e)=>{ e.preventDefault(); e.stopPropagation(); document.body.classList.remove('dragover'); }));
document.body.addEventListener('drop', (e)=>{ const dt = e.dataTransfer; if (dt && dt.files && dt.files.length) { fileInput.files = dt.files; fileInput.dispatchEvent(new Event('change')); } });


// load sample data (for demo)
loadSampleBtn.addEventListener('click', ()=>{
const sample = PLANT_DB.slice(0,3).map((p,i)=>({ id: uid('lib'), filename: p.id + '_example_' + (i+1) + '.jpg', timestamp: new Date(Date.now() - i*3600*1000).toISOString(), suggestedId: p.id, suggestedCommon: p.common, suggestedScientific: p.scientific, dataUrl: placeholderDataUrl(p.common), notes: '', modified: null }));
library = sample.concat(library); saveLibrary(); renderLibrary(applyFilters());
});


// helper to produce a small placeholder image with text (dataURL)
function placeholderDataUrl(text){ const c = document.createElement('canvas'); c.width=600; c.height=360; const ctx = c.getContext('2d'); ctx.fillStyle='#0b1220'; ctx.fillRect(0,0,c.width,c.height); ctx.fillStyle='#9aa4b2'; ctx.font='24px sans-serif'; ctx.fillText(text,20,40); return c.toDataURL('image/png'); }


// inicializar
buildFilterOptions(); loadLibrary(); renderLibrary(); updateExportState();


function updateExportState(){ exportBtn.disabled = library.length===0; }


// cuando la librería cambia, mantener export enabled/disabled y filtros
const originalSave = saveLibrary;
saveLibrary = function(){ originalSave(); updateExportState(); buildFilterOptions(); };


})();
