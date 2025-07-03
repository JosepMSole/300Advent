const totalImagenes = 300;
const gallery = document.getElementById("gallery");
const contadorBtn = document.getElementById("contador-disponibles");
const desbloquearBtn = document.getElementById("desbloquear-todas");
const ordenarSelect = document.getElementById('ordenarPor');

function cargarMetadataGaleria() {
  const data = localStorage.getItem('metadataGaleria');
  return data ? JSON.parse(data) : {};
}

function formatNumber(n) {
  return String(n).padStart(3, '0');
}

const imageDivs = [];
let disponibles = 0;

const metadata = cargarMetadataGaleria();

for (let i = 1; i <= totalImagenes; i++) {
  const numero = formatNumber(i);
  const imgPath = `imagenes/${numero}.jpg`;

  const div = document.createElement("div");
  div.classList.add("image-card");
  div.style.animationDelay = `${i * 5}ms`;

  if (metadata[numero]) {
    const meta = metadata[numero];
    div.dataset.categorias = meta.categorias ? meta.categorias.join(',') : '';
    div.dataset.anio = meta.anio || '';
    div.dataset.fecha = meta.fecha || '';
    div.dataset.titulo = meta.titulo || '';
    div.title = meta.titulo || '';
  }

  const label = document.createElement("span");
  label.textContent = numero;
  div.appendChild(label);

  const img = new Image();
  img.src = imgPath;

  let desbloqueada = false;

  img.onload = () => {
    disponibles++;
    updateContador();
    div.appendChild(img);

    imageDivs.push({
      div,
      img,
      desbloqueadaRef: () => desbloqueada,
      setDesbloqueada: () => { desbloqueada = true; }
    });

    img.addEventListener("click", () => {
      if (!desbloqueada) {
        div.classList.remove("unlocked-glitch");
        void div.offsetWidth;
        div.classList.add("unlocked-glitch");

        setTimeout(() => {
          div.classList.remove("unlocked-glitch");
          div.classList.add("desbloqueada");
          desbloqueada = true;
        }, 600);
      } else {
        openModal(img.src);
      }
    });
  };

  img.onerror = () => {
    div.classList.add("locked");
  };

  gallery.appendChild(div);
}

function updateContador() {
  contadorBtn.textContent = `${disponibles} de ${totalImagenes}`;
}

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImage");
const modalLink = document.getElementById("modalLink");
const closeModal = document.getElementById("closeModal");

let modalMetadata = document.querySelector('.modal-metadata');
if (!modalMetadata) {
  modalMetadata = document.createElement('div');
  modalMetadata.classList.add('modal-metadata');
  document.querySelector('.modal-wrapper').appendChild(modalMetadata);
}

function openModal(src) {
  modal.style.display = "flex";
  modalImg.src = src;

  const numero = src.match(/\/(\d{3})\.jpg$/)?.[1];
  if (numero) {
    modalLink.href = `https://www.disturbingstories.com/${numero}.html`;
    modalLink.style.display = "inline-block";
  } else {
    modalLink.style.display = "none";
  }

  const meta = metadata[numero];
  if (meta) {
    let textoCategorias = meta.categorias ? meta.categorias.join(', ') : 'N/A';
    let textoAnio = meta.anio || 'N/A';
    let textoFecha = meta.fecha || 'N/A';
    let textoTitulo = meta.titulo || 'N/A';

    modalMetadata.innerHTML = `
      <div><strong>Categorías:</strong> ${textoCategorias}</div>
      <div><strong>Año:</strong> ${textoAnio}</div>
      <div><strong>Fecha:</strong> ${textoFecha}</div>
      <div><strong>Título:</strong> ${textoTitulo}</div>
    `;
    modalMetadata.style.display = 'block';
  } else {
    modalMetadata.style.display = 'none';
    modalMetadata.innerHTML = '';
  }
}

closeModal.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

window.addEventListener("DOMContentLoaded", () => {
  modal.style.display = "none";
});

desbloquearBtn.addEventListener("click", () => {
  imageDivs.forEach(({ div, desbloqueadaRef, setDesbloqueada }) => {
    if (!desbloqueadaRef() && !div.classList.contains("locked")) {
      div.classList.remove("unlocked-glitch");
      void div.offsetWidth;
      div.classList.add("unlocked-glitch");

      setTimeout(() => {
        div.classList.remove("unlocked-glitch");
        div.classList.add("desbloqueada");
        setDesbloqueada();
      }, 600);
    }
  });
});

function getMetadataValue(div, criterio) {
  switch (criterio) {
    case 'numero':
      return parseInt(div.querySelector('span')?.textContent || '0', 10);
    case 'Terror':
    case 'Ciencia Ficción':
    case 'Oscuras':
      return div.dataset.categorias?.split(',').map(c => c.trim()).includes(criterio);
    case 'anio':
      return parseInt(div.dataset.anio) || 0;
    case 'fecha':
      return div.dataset.fecha ? new Date(div.dataset.fecha).getTime() : 0;
    case 'titulo':
      return div.dataset.titulo?.toLowerCase() || '';
    default:
      return '';
  }
}

cards.forEach(card => {
  if (criterio !== 'numero' && criterio !== 'titulo') {
    // Mostrar etiqueta metadata si existe y criterio es año, fecha o categoría
    let label = card.querySelector('.metadata-label');
    if (!label) {
      label = document.createElement('div');
      label.classList.add('metadata-label');
      card.appendChild(label);
    }
    let texto = '';
    switch (criterio) {
      case 'anio':
        texto = card.dataset.anio || '';
        break;
      case 'fecha':
        texto = card.dataset.fecha || '';
        break;
      case 'Terror':
      case 'Ciencia Ficción':
      case 'Oscuras':
        texto = criterio;
        break;
      default:
        texto = '';
    }
    label.textContent = texto;
    label.style.display = texto ? 'block' : 'none';
  } else {
    // Ocultar etiqueta en numero y titulo
    const label = card.querySelector('.metadata-label');
    if (label) {
      label.style.display = 'none';
    }
  }
});

ordenarSelect.addEventListener('change', ordenarYFiltrar);
