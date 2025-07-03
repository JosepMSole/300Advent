const totalImagenes = 300;
const gallery = document.getElementById("gallery");
const contadorBtn = document.getElementById("contador-disponibles");
const desbloquearBtn = document.getElementById("desbloquear-todas");

function formatNumber(n) {
  return String(n).padStart(3, '0');
}

const imageDivs = [];
let disponibles = 0;

for (let i = 1; i <= totalImagenes; i++) {
  const numero = formatNumber(i);
  const imgPath = `imagenes/${numero}.jpg`;

  const div = document.createElement("div");
  div.classList.add("image-card");
  div.style.animationDelay = `${i * 5}ms`;

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

  // Añadir el contenedor siempre (en orden)
  gallery.appendChild(div);
}

function updateContador() {
  contadorBtn.textContent = `${disponibles} de ${totalImagenes}`;
}

// Modal
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImage");
const modalLink = document.getElementById("modalLink");
const closeModal = document.getElementById("closeModal");

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

// Botón desbloquear todas
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
