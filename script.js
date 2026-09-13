(function(){
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const fileRow = document.getElementById('fileRow');
  const thumbVideo = document.getElementById('thumbVideo');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const fileDur = document.getElementById('fileDur');
  const clearBtn = document.getElementById('clearBtn');
  const options = document.getElementById('options');
  const convertBtn = document.getElementById('convertBtn');
  const errorBox = document.getElementById('errorBox');
  const uploadPanel = document.getElementById('uploadPanel');
  const processPanel = document.getElementById('processPanel');
  const resultPanel = document.getElementById('resultPanel');
  const statusText = document.getElementById('statusText');
  const statusPct = document.getElementById('statusPct');
  const progressFill = document.getElementById('progressFill');
  const logEl = document.getElementById('log');
  const vu = document.getElementById('vu');
  const downloadBtn = document.getElementById('downloadBtn');
  const resultMeta = document.getElementById('resultMeta');
  const resetBtn = document.getElementById('resetBtn');
  const bitrateBtns = document.querySelectorAll('.bitrate-btn');

  let currentFile = null;
  let bitrate = 192;
  let vuInterval = null;
  let ffmpeg = null;

  // build VU meter bars
  const BAR_COUNT = 28;
  for(let i=0;i<BAR_COUNT;i++){
    const b = document.createElement('i');
    vu.appendChild(b);
  }
  const bars = vu.querySelectorAll('i');

  function animateVU(active){
    if(vuInterval) clearInterval(vuInterval);
    if(!active){
      bars.forEach(b => b.style.height = '8%');
      vu.classList.remove('active');
      return;
    }
    vu.classList.add('active');
    vuInterval = setInterval(() => {
      bars.forEach(b => {
        const h = 10 + Math.random() * 90;
        b.style.height = h + '%';
      });
    }, 110);
  }

  function log(msg){
    const d = document.createElement('div');
    d.textContent = msg;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function showError(msg){
    errorBox.textContent = msg;
    errorBox.classList.add('show');
  }

  function clearError(){
    errorBox.classList.remove('show');
    errorBox.textContent = '';
  }

  function formatBytes(bytes){
    if(bytes < 1024*1024) return (bytes/1024).toFixed(0) + ' KB';
    return (bytes/(1024*1024)).toFixed(1) + ' MB';
  }

  function formatDuration(sec){
    if(!isFinite(sec)) return '—';
    const m = Math.floor(sec/60);
    const s = Math.floor(sec%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  // ---- file selection ----
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('drag');
    if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => {
    if(fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  function handleFile(file){
    clearError();
    if(!file.type.startsWith('video/')){
      showError('Por favor selecciona un archivo de video.');
      return;
    }
    currentFile = file;
    const url = URL.createObjectURL(file);
    thumbVideo.src = url;
    thumbVideo.addEventListener('loadedmetadata', () => {
      fileDur.textContent = formatDuration(thumbVideo.duration);
    }, { once: true });

    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);
    fileDur.textContent = '—';

    fileRow.classList.add('show');
    options.classList.add('show');
    dropzone.style.display = 'none';
  }

  clearBtn.addEventListener('click', resetUpload);
  function resetUpload(){
    currentFile = null;
    fileInput.value = '';
    fileRow.classList.remove('show');
    options.classList.remove('show');
    dropzone.style.display = '';
    clearError();
  }

  bitrateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      bitrateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      bitrate = parseInt(btn.dataset.rate, 10);
    });
  });

  // ---- ffmpeg setup ----
  async function loadFFmpeg(){
    if(ffmpeg) return ffmpeg;
    const { FFmpeg } = FFmpegWASM;
    const { toBlobURL } = FFmpegUtil;
    ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
      // keep console quiet, only surface progress via progress event
    });
    ffmpeg.on('progress', ({ progress }) => {
      const pct = Math.min(100, Math.round(progress * 100));
      progressFill.style.width = pct + '%';
      statusPct.textContent = pct + '%';
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    return ffmpeg;
  }

  // ---- conversion ----
  convertBtn.addEventListener('click', async () => {
    if(!currentFile) return;
    clearError();
    uploadPanel.style.display = 'none';
    processPanel.classList.add('show');
    animateVU(true);
    logEl.innerHTML = '';
    progressFill.style.width = '0%';
    statusPct.textContent = '0%';

    try{
      statusText.textContent = 'Cargando motor de conversión…';
      log('Inicializando ffmpeg (WebAssembly)');
      const engine = await loadFFmpeg();

      statusText.textContent = 'Leyendo archivo de video…';
      log(`Archivo: ${currentFile.name} (${formatBytes(currentFile.size)})`);
      const { fetchFile } = FFmpegUtil;
      const inputName = 'input' + (currentFile.name.match(/\.[a-zA-Z0-9]+$/) || ['.mp4'])[0];
      await engine.writeFile(inputName, await fetchFile(currentFile));

      statusText.textContent = `Extrayendo y codificando a MP3 (${bitrate} kbps)…`;
      log(`Codificando MP3 a ${bitrate} kbps`);
      await engine.exec(['-i', inputName, '-vn', '-b:a', bitrate + 'k', 'output.mp3']);

      statusText.textContent = 'Finalizando…';
      const data = await engine.readFile('output.mp3');
      const blob = new Blob([data.buffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      const outName = currentFile.name.replace(/\.[^.]+$/, '') + '.mp3';
      downloadBtn.href = url;
      downloadBtn.download = outName;
      resultMeta.textContent = `${outName} · ${formatBytes(blob.size)} · ${bitrate} kbps`;

      log('Conversión completa');
      animateVU(false);
      processPanel.classList.remove('show');
      resultPanel.classList.add('show');

      try{ await engine.deleteFile(inputName); await engine.deleteFile('output.mp3'); }catch(e){}

    }catch(err){
      animateVU(false);
      processPanel.classList.remove('show');
      uploadPanel.style.display = '';
      showError('No se pudo convertir el video. Intenta con otro archivo o vuelve a cargar la página. (' + (err.message || err) + ')');
    }
  });

  resetBtn.addEventListener('click', () => {
    resultPanel.classList.remove('show');
    uploadPanel.style.display = '';
    resetUpload();
  });
})();
