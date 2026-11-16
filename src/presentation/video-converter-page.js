import { ConvertVideoToMp3 } from '../application/convert-video-to-mp3.js';
import { FFmpegConverter } from '../infrastructure/ffmpeg-converter.js';
import './floating-navigation.js';

const conversion = new ConvertVideoToMp3(new FFmpegConverter({
  ffmpegLibrary: window.FFmpegWASM,
  utilLibrary: window.FFmpegUtil
}));

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileRow = document.getElementById('fileRow');
const thumbVideo = document.getElementById('thumbVideo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const fileDuration = document.getElementById('fileDur');
const clearButton = document.getElementById('clearBtn');
const options = document.getElementById('options');
const convertButton = document.getElementById('convertBtn');
const errorBox = document.getElementById('errorBox');
const uploadPanel = document.getElementById('uploadPanel');
const processPanel = document.getElementById('processPanel');
const resultPanel = document.getElementById('resultPanel');
const statusText = document.getElementById('statusText');
const statusPercent = document.getElementById('statusPct');
const progressFill = document.getElementById('progressFill');
const log = document.getElementById('log');
const meter = document.getElementById('vu');
const downloadButton = document.getElementById('downloadBtn');
const resultMeta = document.getElementById('resultMeta');
const resetButton = document.getElementById('resetBtn');
const bitrateButtons = [...document.querySelectorAll('.bitrate-btn')];
let currentFile = null;
let bitrate = 192;
let meterInterval = null;
let resultUrl = null;

const bars = Array.from({ length: 28 }, () => {
  const bar = document.createElement('i');
  meter.append(bar);
  return bar;
});

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add('show');
}

function clearError() {
  errorBox.textContent = '';
  errorBox.classList.remove('show');
}

function animateMeter(active) {
  clearInterval(meterInterval);
  meter.classList.toggle('active', active);
  bars.forEach((bar) => { bar.style.height = active ? `${10 + Math.random() * 90}%` : '8%'; });
  if (active) {
    meterInterval = setInterval(() => {
      bars.forEach((bar) => { bar.style.height = `${10 + Math.random() * 90}%`; });
    }, 110);
  }
}

function formatBytes(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resetUpload() {
  currentFile = null;
  fileInput.value = '';
  fileRow.classList.remove('show');
  options.classList.remove('show');
  dropzone.style.display = '';
  clearError();
  URL.revokeObjectURL(thumbVideo.src);
  thumbVideo.removeAttribute('src');
}

function selectFile(file) {
  clearError();
  if (!file.type.startsWith('video/')) {
    showError('Por favor selecciona un archivo de video.');
    return;
  }

  resetUpload();
  currentFile = file;
  thumbVideo.src = URL.createObjectURL(file);
  thumbVideo.addEventListener('loadedmetadata', () => {
    const minutes = Math.floor(thumbVideo.duration / 60);
    const seconds = Math.floor(thumbVideo.duration % 60).toString().padStart(2, '0');
    fileDuration.textContent = `${minutes}:${seconds}`;
  }, { once: true });
  fileName.textContent = file.name;
  fileSize.textContent = formatBytes(file.size);
  fileDuration.textContent = '—';
  fileRow.classList.add('show');
  options.classList.add('show');
  dropzone.style.display = 'none';
}

function writeLog(message) {
  const line = document.createElement('div');
  line.textContent = message;
  log.append(line);
  log.scrollTop = log.scrollHeight;
}

dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropzone.classList.add('drag');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
dropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropzone.classList.remove('drag');
  if (event.dataTransfer.files[0]) selectFile(event.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) selectFile(fileInput.files[0]);
});
clearButton.addEventListener('click', resetUpload);

bitrateButtons.forEach((button) => {
  button.addEventListener('click', () => {
    bitrateButtons.forEach((item) => item.classList.toggle('active', item === button));
    bitrate = Number(button.dataset.rate);
  });
});

convertButton.addEventListener('click', async () => {
  if (!currentFile) return;
  clearError();
  uploadPanel.style.display = 'none';
  processPanel.classList.add('show');
  animateMeter(true);
  log.replaceChildren();
  progressFill.style.width = '0%';
  statusPercent.textContent = '0%';

  try {
    statusText.textContent = 'Cargando motor de conversión…';
    writeLog('Inicializando ffmpeg (WebAssembly)');
    statusText.textContent = 'Leyendo archivo de video…';
    writeLog(`Archivo: ${currentFile.name} (${formatBytes(currentFile.size)})`);
    statusText.textContent = `Extrayendo y codificando a MP3 (${bitrate} kbps)…`;
    resultUrl && URL.revokeObjectURL(resultUrl);
    const blob = await conversion.execute(currentFile, bitrate, (percent) => {
      progressFill.style.width = `${percent}%`;
      statusPercent.textContent = `${percent}%`;
    });
    resultUrl = URL.createObjectURL(blob);
    const outputName = currentFile.name.replace(/\.[^.]+$/, '') + '.mp3';
    downloadButton.href = resultUrl;
    downloadButton.download = outputName;
    resultMeta.textContent = `${outputName} · ${formatBytes(blob.size)} · ${bitrate} kbps`;
    writeLog('Conversión completa');
    processPanel.classList.remove('show');
    resultPanel.classList.add('show');
  } catch (error) {
    processPanel.classList.remove('show');
    uploadPanel.style.display = '';
    showError(`No se pudo convertir el video. ${error.message || error}`);
  } finally {
    animateMeter(false);
  }
});

resetButton.addEventListener('click', () => {
  resultPanel.classList.remove('show');
  uploadPanel.style.display = '';
  resetUpload();
});
