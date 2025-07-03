const totalImagenes = 300;
const gallery = document.getElementById("gallery");
const contadorBtn = document.getElementById("contador-disponibles");
const desbloquearBtn = document.getElementById("desbloquear-todas");
const ordenarSelect = document.getElementById("ordenarPor");

let metadata = {};  // Global metadata

// Función para formatear número a 3 dígitos
function formatNumber(n) {
  return String(n).padStart(3, "0");
}

function updateContador(disponibles) {
  contadorBtn.textContent = `${disponibles} de ${totalImagenes}`;
}

function getMetadataValue(div, criterio) {
  switch (criterio) {
    case "numero":
      return parseInt(div.querySelector("span")?.textContent || "0", 10);
    case "Terror":
    case "Ciencia Ficción":
    case "Oscuras":
      return div.dataset.categorias
        ?.split(",")
        .map((c) => c.trim())
        .includes(criterio);
    case "anio":
      return div.dataset.anio !== "" ? parseInt(div.dataset.anio) : null;
    case "fecha":
      return div.dataset.fecha ? new Date(div.dataset.fecha).getTime() : null;
    case "titulo":
      return div.dataset.titulo ? div.dataset.titulo.toLowerCase() : null;
    default:
      return null;
  }
}

function ordenarYFiltrar() {
  const criterio = ordenarSelect.value;
  const cards = Array.from(gallery.querySelectorAll(".image-card"));

  if (criterio === "numero" || criterio === "anio" || criterio === "fecha" || criterio === "titulo") {
    let filtered = cards.filter((card) => {
      const val = getMetadataValue(card, criterio);
      return val !== null && val !== "" && val !== false;
    });

    filtered.sort((a, b) => {
      const valA = getMetadataValue(a, criterio);
      const valB = getMetadataValue(b, criterio);
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });

    filtered.forEach((card) => {
      card.style.display = "block";
      gallery.appendChild(card);
    });

    cards.forEach((card) => {
      if (!filtered.includes(card)) card.style.display = "none";
    });
  } else if (criterio === "Terror" || criterio === "Ciencia Ficción" || criterio === "Oscuras") {
    cards.forEach((card) => {
      const tieneCategoria = getMetadataValue(card, criterio);
      card.style.display = tieneCategoria ? "block" : "none";
    });
  } else {
    cards.forEach((card) => {
      card.style.display = "block";
    });
  }

  cards.forEach((card) => {
    const labelClass = "metadata-label";
    let label = card.querySelector(`.${labelClass}`);

    if (criterio !== "numero" && criterio !== "titulo") {
      if (!label) {
        label = document.createElement("div");
        label.classList.add(labelClass);
        card.appendChild(label);
      }
      let texto = "";
      switch (criterio) {
        case "anio":
          texto = card.dataset.anio || "";
          break;
        case "fecha":
          texto = card.dataset.fecha || "";
          break;
        case "Terror":
        case "Ciencia Ficción":
        case "Oscuras":
          texto = criterio;
          break;
        default:
          texto = "";
      }
      label.textContent = texto;
      label.style.display = texto ? "block" : "none";
      label.style.textAlign = "left";
    } else if (label) {
      label.style.display = "none";
    }
  });
}

// Función para cargar metadata desde localStorage
function cargarMetadataLocal() {
  const data = localStorage.getItem("metadataGaleria");
  return data ? JSON.parse(data) : {};
}

function construirGaleria() {
  gallery.innerHTML = "";
  const imageDivs = [];
  let disponibles = 0;

  // Usa metadata global (remota o local si remota falla)
  const currentMetadata = metadata;

  for (let i = 1; i <= totalImagenes; i++) {
    const numero = formatNumber(i);
    const imgPath = `imagenes/${numero}.jpg`;

    const div = document.createElement("div");
    div.classList.add("image-card");
    div.style.animationDelay = `${i * 5}ms`;

    if (currentMetadata[numero]) {
      const meta = currentMetadata[numero];
      div.dataset.categorias = meta.categorias ? meta.categorias.join(",") : "";
      div.dataset.anio = meta.anio !== null && meta.anio !== undefined ? meta.anio : "";
      div.dataset.fecha = meta.fecha || "";
      div.dataset.titulo = meta.titulo || "";
      div.title = meta.titulo || "";
    } else {
      div.dataset.categorias = "";
      div.dataset.anio = "";
      div.dataset.fecha = "";
      div.dataset.titulo = "";
    }

    const label = document.createElement("span");
    label.textContent = numero;
    div.appendChild(label);

    const img = new Image();
    img.src = imgPath;

    let desbloqueada = false;

    img.onload = () => {
      disponibles++;
      updateContador(disponibles);
      div.appendChild(img);
    };

    img.onerror = () => {
      div.classList.add("locked");
    };

    div.addEventListener("click", () => {
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

    gallery.appendChild(div);
  }
}

// Modal variables y funciones
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImage");
const modalLink = document.getElementById("modalLink");
const closeModal = document.getElementById("closeModal");

let modalMetadata = document.querySelector(".modal-metadata");
if (!modalMetadata) {
  modalMetadata = document.createElement("div");
  modalMetadata.classList.add("modal-metadata");
  document.querySelector(".modal-wrapper").appendChild(modalMetadata);
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
    let textoCategorias = meta.categorias ? meta.categorias.join(", ") : "N/A";
    let textoAnio = meta.anio !== null && meta.anio !== undefined ? meta.anio : "N/A";
    let textoFecha = meta.fecha || "N/A";
    let textoTitulo = meta.titulo || "N/A";

    modalMetadata.innerHTML = `
      <div><strong>Categorías:</strong> ${textoCategorias}</div>
      <div><strong>Año:</strong> ${textoAnio}</div>
      <div><strong>Fecha:</strong> ${textoFecha}</div>
      <div><strong>Título:</strong> ${textoTitulo}</div>
    `;
    modalMetadata.style.display = "block";
  } else {
    modalMetadata.style.display = "none";
    modalMetadata.innerHTML = "";
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

modal.style.display = "none";

desbloquearBtn.addEventListener("click", () => {
  const cards = Array.from(gallery.querySelectorAll(".image-card"));
  cards.forEach((card) => {
    if (!card.classList.contains("desbloqueada") && !card.classList.contains("locked")) {
      card.classList.remove("unlocked-glitch");
      void card.offsetWidth;
      card.classList.add("unlocked-glitch");

      setTimeout(() => {
        card.classList.remove("unlocked-glitch");
        card.classList.add("desbloqueada");
      }, 600);
    }
  });
});

ordenarSelect.addEventListener("change", ordenarYFiltrar);

// Carga remota y construye galería
window.addEventListener("DOMContentLoaded", () => {
  fetch('https://raw.githubusercontent.com/JosepMSole/300Advent/main/admin/metadata.json')
    .then(response => {
      if (!response.ok) throw new Error('Error al cargar metadata remota');
      return response.json();
    })
    .then(json => {
      metadata = json;
      construirGaleria();
      ordenarYFiltrar();
    })
    .catch(() => {
      // fallback a localStorage si falla carga remota
      metadata = cargarMetadataLocal();
      construirGaleria();
      ordenarYFiltrar();
    });
});
