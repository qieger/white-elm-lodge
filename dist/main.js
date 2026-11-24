"use strict";

const views = [
  { file: "hero", label: "林间客房 · 午后", alt: "山景大床房，午后的阳光落在亚麻被褥上" },
  { file: "bath", label: "私享浴室 · 黄昏", alt: "木门后的浴室，傍晚的光线正在消退" },
  { file: "window", label: "窗边山色 · 入暮", alt: "窗边的山色渐暗，客房里的浴室门敞开着" }
];
let current = 0;
let enlarged = 0;
const album = document.querySelector("#album");
const albumButtons = album.querySelectorAll(".album-controls button");

function wrap(index) {
  return (index + views.length) % views.length;
}
function displayPhoto(img, index) {
  img.src = "assets/" + views[index].file + ".webp";
  img.alt = views[index].alt;
  img.dataset.view = views[index].file;
}
function showHero(index) {
  current = wrap(index);
  displayPhoto(document.querySelector("#hero-img"), current);
  document.querySelector("#counter").textContent = String(current + 1).padStart(2, "0");
  document.querySelector("#caption").textContent = views[current].label;
}
function showAlbum(index) {
  enlarged = wrap(index);
  displayPhoto(album.querySelector("img"), enlarged);
  album.querySelector(".album-controls span").textContent = views[enlarged].label;
}
document.querySelector("#prev").addEventListener("click", () => showHero(current - 1));
document.querySelector("#next").addEventListener("click", () => showHero(current + 1));
document.querySelectorAll("[data-room]").forEach(button => {
  button.addEventListener("click", () => {
    showAlbum(Number(button.dataset.room));
    album.showModal();
  });
});
albumButtons[0].addEventListener("click", () => showAlbum(enlarged - 1));
albumButtons[1].addEventListener("click", () => showAlbum(enlarged + 1));
album.querySelector(".album-close").addEventListener("click", () => album.close());
album.addEventListener("click", event => { if (event.target === album) album.close(); });
album.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") showAlbum(enlarged - 1);
  if (event.key === "ArrowRight") showAlbum(enlarged + 1);
});

// Fine survey lines at the margin of the lodge's printed stationery.
const map = document.querySelector("#terrain");
function paintMap() {
  const width = map.clientWidth;
  const height = map.clientHeight;
  const ratio = Math.min(devicePixelRatio, 2);
  map.width = width * ratio;
  map.height = height * ratio;
  const ctx = map.getContext("2d");
  ctx.scale(ratio, ratio);
  const fade = ctx.createLinearGradient(width * 0.49, height * 0.25, width, height * 0.70);
  fade.addColorStop(0, "rgba(120,127,102,0)");
  fade.addColorStop(1, "rgba(120,127,102,0.28)");
  ctx.strokeStyle = fade;
  ctx.lineWidth = 0.7;
  const unit = Math.max(width, height) / 650;
  for (let level = 0; level < 53; level++) {
    ctx.beginPath();
    for (let y = -5; y <= height + 5; y += 3) {
      const t = y / height;
      const ridge = 40 * Math.sin(t * 7.8 + level * .032) + 18 * Math.sin(t * 15.5 + level * .045) + 9 * Math.sin(t * 31 + level * .043);
      const x = width * 1.37 - unit * (level * 7.8 + ridge) + (0.42 - t) * width * .52;
      if (y === -5) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
new ResizeObserver(paintMap).observe(map);

