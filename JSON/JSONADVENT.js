const totalImagenes = 300;
const gallery = document.getElementById("gallery");
const contadorBtn = document.getElementById("contador-disponibles");
const desbloquearBtn = document.getElementById("desbloquear-todas");
const ordenarSelect = document.getElementById("ordenarPor");

function formatearFechaCompleta(fechaStr) {
  if (!fechaStr) return "";
  const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const [year, month, day] = fechaStr.split("-");
  if (!year || !month || !day) return fechaStr;
  const mm = meses[parseInt(month, 10) - 1] || "";
  return `${day}/${mm}/${year}`;
}

window.addEventListener("DOMContentLoaded", () => {
  function cargarMetadataGaleria() {
    const data = localStorage.getItem("metadataGaleria");
    return data ? JSON.parse(data) : {};
  }

  function formatNumber(n) {
    return String(n).padStart(3, "0");
  }

  const imageDivs = [];
  let disponibles = 0;

  const metadata = cargarMetadataGaleria();

  gallery.innerHTML = "";

  for (let i = 1; i <= totalImagenes; i++) {
    const numero = formatNumber(i);
    const imgPath = `imagenes/${numero}.jpg`;

    const div = document.createElement("div");
    div.classList.add("image-card");
    div.style.animationDelay = `${i * 5}ms`;

    if (metadata[numero]) {
      const meta = metadata[numero];
      div.dataset.categorias = meta.categorias ? meta.categorias.join(",") : "";
      div.dataset.anio = meta.anio !== null && meta.anio !== undefined ? meta.anio : "";
      div.dataset.fecha = meta.fecha || "";
      div.dataset.titulo = meta.titulo || "";
      div.dataset.sinopsis = meta.sinopsis || "";
      div.title = meta.titulo || "";
    } else {
      div.dataset.categorias = "";
      div.dataset.anio = "";
      div.dataset.fecha = "";
      div.dataset.titulo = "";
      div.dataset.sinopsis = "";
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
        setDesbloqueada: () => {
          desbloqueada = true;
        },
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

      if (disponibles === totalImagenes) {
        ordenarSelect.value = "numero";
        ordenarYFiltrar();
      }
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
      modalLink.target = "_self";
    } else {
      modalLink.style.display = "none";
    }

    const meta = metadata[numero];
    if (meta) {
      let textoCategorias = meta.categorias ? meta.categorias.join(", ") : "N/A";
      let textoAnio = meta.anio !== null && meta.anio !== undefined ? meta.anio : "N/A";
      let textoFecha = formatearFechaCompleta(meta.fecha) || "N/A";
      let textoSinopsis = meta.sinopsis || "";

      modalMetadata.innerHTML = `
        <div style="margin-bottom: 10px; font-style: italic; max-width: 30ch; word-wrap: break-word;">${textoSinopsis}</div>
        <div style="max-width: 30ch; word-wrap: break-word;"><strong>Categorías:</strong> ${textoCategorias}</div>
        <div style="max-width: 30ch; word-wrap: break-word;"><strong>Año:</strong> ${textoAnio}</div>
        <div style="max-width: 30ch; word-wrap: break-word;"><strong>Fecha Publicación:</strong> ${textoFecha}</div>
      `;
      modalMetadata.style.display = "block";
    } else {
      modalMetadata.style.display = "none";
      modalMetadata.innerHTML = "";
    }

    const wrapper = document.querySelector(".modal-wrapper");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "flex-start";
    wrapper.style.gap = "20px";
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
      case "numero":
        return parseInt(div.querySelector("span")?.textContent || "0", 10);
      case "Terror":
      case "Ciencia Ficción":
      case "Oscuras":
        return div.dataset.categorias?.split(",").map((c) => c.trim()).includes(criterio);
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

    if (
      criterio === "numero" ||
      criterio === "anio" ||
      criterio === "fecha" ||
      criterio === "titulo"
    ) {
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
    } else if (
      criterio === "Terror" ||
      criterio === "Ciencia Ficción" ||
      criterio === "Oscuras"
    ) {
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
      const numeroSpan = card.querySelector("span");
      if (criterio === "numero") {
        numeroSpan.style.display = "block";
      } else {
        numeroSpan.style.display = "none";
      }

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
            texto = formatearFechaCompleta(card.dataset.fecha) || "";
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

  ordenarSelect.addEventListener("change", ordenarYFiltrar);
});
