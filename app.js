(() => {
});


removeBtn.addEventListener('click', ()=>{
card.remove();
// quitar del array scanned por filename
scanned = scanned.filter(s => s.filename !== file.name);
updateExportButton();
});


return card;
}


function updateExportButton(){
exportBtn.disabled = scanned.length === 0;
}


scanBtn.addEventListener('click', async () => {
const file = fileInput.files[0];
if (!file) return;
scanBtn.disabled = true;
await fakeScanSimulation(file);
// heurística: intentar identificar
const id = identifyPlantFromCanvas();
const plant = findPlantById(id);
const card = createPlantCard(plant, file);
resultList.prepend(card);
// actualizar estado: añadir una entrada básica
scanned.unshift({ filename: file.name, identified: plant.id, common: plant.common, scientific: plant.scientific, timestamp: new Date().toISOString() });
updateExportButton();
scanBtn.disabled = false;
});


exportBtn.addEventListener('click', ()=>{
const data = JSON.stringify(scanned, null, 2);
const blob = new Blob([data], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url; a.download = 'plantscan_export_' + (new Date()).toISOString().slice(0,19).replace(/[:T]/g,'-') + '.json';
document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});


clearBtn.addEventListener('click', ()=>{
if (!confirm('¿Borrar todas las reseñas y reiniciar?')) return;
resultList.innerHTML = ''; scanned = []; updateExportButton();
previewImg.src = ''; previewImg.hidden = true; fileInput.value = null; scanBtn.disabled = true;
});


// habilitar el botón al arrastrar y soltar
const body = document.body;
['dragenter','dragover'].forEach(evt => body.addEventListener(evt, (e)=>{ e.preventDefault(); e.stopPropagation(); body.classList.add('dragover'); }));
['dragleave','drop'].forEach(evt => body.addEventListener(evt, (e)=>{ e.preventDefault(); e.stopPropagation(); body.classList.remove('dragover'); }));


body.addEventListener('drop', (e)=>{
const dt = e.dataTransfer;
if (dt && dt.files && dt.files.length) {
fileInput.files = dt.files;
const ev = new Event('change');
fileInput.dispatchEvent(ev);
}
});


// inicial
enableScanIfFile();
})();
