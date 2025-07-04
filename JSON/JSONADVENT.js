
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

async function cargarMetadataExterna() {
  const response = await fetch("https://josepmsole.github.io/300Advent/admin/metadata.json");
  if (!response.ok) {
    console.error("Error cargando metadata externa");
    return {};
  }
  return await response.json();
}

window.addEventListener("DOMContentLoaded", async () => {
  function formatNumber(n) {
    return String(n).padStart(3, "0");
  }

  const imageDivs = [];
  let disponibles = 0;
  let imagenesCargadas = 0;
  const metadata = await cargarMetadataExterna();

  gallery.innerHTML = "";

  for (let i = 1; i <= totalImagenes; i++) {
    const numero = formatNumber(i);
    const imgPath = `imagenes/${numero}.jpg`;

    const div = document.createElement("div");
    div.classList.add("image-card");
    div.style.animationDelay = `${i * 5}ms`;

    const meta = metadata[numero] || {};
    div.dataset.categorias = meta.categorias ? meta.categorias.join(",") : "";
    div.dataset.anio = meta.anio ?? "";
    div.dataset.fecha = meta.fecha || "";
    div.dataset.titulo = meta.titulo || "";
    div.dataset.sinopsis = meta.sinopsis || "";
    div.title = meta.titulo || "";

    const label = document.createElement("span");
    label.textContent = numero;
    div.appendChild(label);

    const img = new Image();
    img.src = imgPath;

    let desbloqueada = false;

    function checkCargaCompleta() {
      imagenesCargadas++;
      if (imagenesCargadas === totalImagenes) {
        ordenarSelect.value = "numero";
        ordenarYFiltrar();
      }
    }

    img.onload = () => {
      disponibles++;
      updateContador();
      div.appendChild(img);
      gallery.appendChild(div);

      imageDivs.push({ div, img, desbloqueadaRef: () => desbloqueada, setDesbloqueada: () => (desbloqueada = true) });

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

      checkCargaCompleta();
    };

    img.onerror = () => {
      div.classList.add("locked");
      gallery.appendChild(div);
      imageDivs.push({ div, img: null, desbloqueadaRef: () => false, setDesbloqueada: () => {} });
      checkCargaCompleta();
    };
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
      modalMetadata.innerHTML = `
        <div style="margin-bottom: 10px; font-style: italic;">${meta.sinopsis || ""}</div>
        <div style="margin-bottom: 10px;"><strong>Categorías:</strong> ${meta.categorias?.join(", ") || "N/A"}</div>
        <div style="margin-bottom: 10px;"><strong>Año:</strong> ${meta.anio ?? "N/A"}</div>
        <div style="margin-bottom: 10px;"><strong>Fecha Publicación:</strong> ${formatearFechaCompleta(meta.fecha) || "N/A"}</div>
      `;
      modalMetadata.style.display = "block";
    } else {
      modalMetadata.style.display = "none";
    }

    const wrapper = document.querySelector(".modal-wrapper");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "flex-start";
    wrapper.style.gap = "20px";
  }

  closeModal.onclick = () => (modal.style.display = "none");
  window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

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
      case "numero": return parseInt(div.querySelector("span")?.textContent || "0", 10);
      case "Terror":
      case "Ciencia Ficción":
      case "Oscuras":
        return div.dataset.categorias?.split(",").map((c) => c.trim()).includes(criterio);
      case "anio": return div.dataset.anio ? parseInt(div.dataset.anio) : null;
      case "fecha": return div.dataset.fecha ? new Date(div.dataset.fecha).getTime() : null;
      case "titulo": return div.dataset.titulo?.toLowerCase() || null;
      default: return null;
    }
  }

  function ordenarYFiltrar() {
    const criterio = ordenarSelect.value;
    let filtrados = [...imageDivs];

    if (["numero", "anio", "fecha", "titulo"].includes(criterio)) {
      filtrados = filtrados.filter(({ div }) => {
        const val = getMetadataValue(div, criterio);
        return val !== null && val !== "" && val !== false;
      });

      filtrados.sort((a, b) => {
        const valA = getMetadataValue(a.div, criterio);
        const valB = getMetadataValue(b.div, criterio);
        return valA < valB ? -1 : valA > valB ? 1 : 0;
      });
    } else if (["Terror", "Ciencia Ficción", "Oscuras"].includes(criterio)) {
      filtrados = filtrados.filter(({ div }) => getMetadataValue(div, criterio));
    }

    gallery.innerHTML = "";
    filtrados.forEach(({ div }) => {
      gallery.appendChild(div);
      div.style.display = "block";

      const labelClass = "metadata-label";
      let label = div.querySelector(`.${labelClass}`);
      if (criterio !== "numero" && criterio !== "titulo") {
        if (!label) {
          label = document.createElement("div");
          label.classList.add(labelClass);
          div.appendChild(label);
        }
        let texto = "";
        switch (criterio) {
          case "anio": texto = div.dataset.anio || ""; break;
          case "fecha": texto = formatearFechaCompleta(div.dataset.fecha) || ""; break;
          case "Terror":
          case "Ciencia Ficción":
          case "Oscuras": texto = criterio; break;
        }
        label.textContent = texto;
        label.style.display = texto ? "block" : "none";
      } else if (label) {
        label.style.display = "none";
      }

      const numeroSpan = div.querySelector("span");
      numeroSpan.style.display = criterio === "numero" ? "block" : "none";
    });
  }

  ordenarSelect.addEventListener("change", ordenarYFiltrar);
  modal.style.display = "none";
});
