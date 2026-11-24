(() => {
  "use strict";

  const story = document.getElementById("story");
  if (!story) return;

  story.innerHTML = `
    <section class="elm-guestbook" id="guestbook" aria-labelledby="elm-guestbook-title">
      <div class="elm-paper">
        <div class="elm-paper-head">
          <span class="elm-small">GUEST BOOK</span>
          <span class="elm-paper-rule"></span>
          <h2 id="elm-guestbook-title">住客手记</h2>
        </div>
        <blockquote class="elm-quote">
          <p>「推开窗就能闻见松针的味道。<br>好久没有睡得这样沉了。」</p>
          <footer>林女士<span aria-hidden="true">／</span> 山景客房</footer>
        </blockquote>
        <div class="elm-marginalia">
          <span class="elm-inkline"></span>
          <p>如果你也住二〇七，<br>晚上记得把浴室门关好。</p>
          <span class="elm-unsigned">房客留字 · 未署名</span>
        </div>
      </div>
    </section>
    <div class="elm-reel" aria-label="白榆旅馆的夜间走廊与二〇七号客房">
      <div class="elm-screen">
        <img class="elm-shot elm-hall" src="assets/corridor.webp" alt="夜里的旅馆走廊，尽头有一扇门。" loading="lazy" decoding="async">
        <img class="elm-shot elm-bedroom" src="assets/hero.webp" alt="又回到了最初那间客房。床头只剩一线微光。" loading="lazy" decoding="async">
        <img class="elm-shot elm-underbed" src="assets/final.webp" alt="床底的黑暗里，一张苍白的脸正侧贴着地板，直直地盯着你。" loading="lazy" decoding="async">
        <div class="elm-cctv" aria-hidden="true"></div>
        <div class="elm-black" aria-hidden="true"></div>
        <div class="elm-viewfinder" aria-hidden="true">
          <span class="elm-rec"><i></i> REC</span>
          <span class="elm-clock">03:17:00</span>
          <span class="elm-camera">CAM 02 &nbsp; / &nbsp; 二层走廊</span>
        </div>
        <div class="elm-captions">
          <p class="elm-caption" data-shot="0">凌晨三点十七分，走廊的灯亮了。</p>
          <p class="elm-caption" data-shot="1">已经是第三扇写着「207」的门了。</p>
          <p class="elm-caption" data-shot="2">浴室门开着。里面没有人。</p>
          <p class="elm-caption" data-shot="3">床底下，有什么东西动了一下。</p>
        </div>
        <div class="elm-last">
          <p>它一直在这里。</p>
          <button class="elm-return" type="button">回到旅馆首页 <span aria-hidden="true">↗</span></button>
        </div>
      </div>
    </div>`;

  const reel = story.querySelector(".elm-reel");
  const screen = story.querySelector(".elm-screen");
  const paper = story.querySelector(".elm-guestbook");
  const clock = story.querySelector(".elm-clock");
  const camera = story.querySelector(".elm-camera");
  const captions = [...story.querySelectorAll(".elm-caption")];
  const ending = story.querySelector(".elm-last");
  const restart = story.querySelector(".elm-return");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (value) => Math.max(0, Math.min(1, value));
  function ramp(value, start, stop) {
    const p = clamp((value - start) / (stop - start));
    return p * p * (3 - 2 * p);
  }

  let frame = 0;
  let previousProgress = -1;
  let previousLight = -1;
  let previousMode;
  function render() {
    frame = 0;
    const rect = reel.getBoundingClientRect();
    const height = screen.offsetHeight;
    const progress = clamp(-rect.top / Math.max(1, rect.height - height));
    const light = clamp((height - rect.top) / Math.max(1, paper.offsetHeight + height));
    const night = rect.top <= 1 && rect.bottom > 0;
    if (previousMode !== night) {
      document.body.classList.toggle("is-night", night);
      document.dispatchEvent(new CustomEvent("whiteelm:night", { detail: { active: night } }));
      previousMode = night;
    }
    if (previousLight !== light) {
      paper.style.setProperty("--ink", light.toFixed(3));
      previousLight = light;
    }
    if (previousProgress === progress) return;
    previousProgress = progress;

    const hallwayZoom = ramp(progress, 0.015, 0.5);
    const room = ramp(progress, 0.48, 0.53);
    const under = ramp(progress, 0.70, 0.88);
    const darkness = Math.max(
      ramp(progress, 0.43, 0.485) * (1 - ramp(progress, 0.51, 0.58)),
      ramp(progress, 0.665, 0.73) * (1 - ramp(progress, 0.76, 0.87))
    );
    const motion = reduced.matches ? 0 : 1;
    const set = (name, value) => screen.style.setProperty(name, value.toFixed(4));
    set("--hall-zoom", 1.02 + motion * hallwayZoom * 0.84);
    set("--hall-pan", motion * hallwayZoom * 2.2);
    set("--room-zoom", 1.04 + motion * ramp(progress, 0.54, 0.72) * 0.16);
    set("--bed-zoom", 1 + motion * ramp(progress, 0.86, 0.965) * 0.14);
    set("--room", room * (1 - under));
    set("--under", under);
    set("--black", darkness);
    set("--cameras", 1 - ramp(progress, 0.68, 0.82));
    clock.textContent = "03:17:" + String(Math.floor(58 * progress)).padStart(2, "0");
    camera.textContent = progress > 0.50 ? "CAM 07　/　二〇七室" : "CAM 02　/　二层走廊";

    const intervals = [[0, 0.04, 0.12, 0.17], [0.18, 0.23, 0.34, 0.41],
      [0.52, 0.56, 0.65, 0.69], [0.69, 0.73, 0.77, 0.80]];
    captions.forEach((caption, i) => {
      const [a, b, c, d] = intervals[i];
      const opacity = ramp(progress, a, b) * (1 - ramp(progress, c, d));
      caption.style.opacity = opacity.toFixed(3);
      caption.setAttribute("aria-hidden", String(opacity < 0.5));
    });
    ending.classList.toggle("is-visible", progress >= 0.963);
    ending.inert = progress < 0.963;
  }
  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(render);
  }
  restart.addEventListener("click", () => {
    const start = document.querySelector("header a[href], main h1, h1");
    if (start) {
      if (!start.matches("a, button, [tabindex]")) start.tabIndex = -1;
      start.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    schedule();
  });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("pageshow", schedule);
  window.addEventListener("load", schedule);
  reduced.addEventListener("change", () => { previousProgress = -1; schedule(); });
  render();
})();
