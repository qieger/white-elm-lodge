(() => {
  const nightlyPrice = 880;
  let dialog;
  let opener;

  function localDateString(date) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  }

  function nextDay(value) {
    const [year, month, day] = value.split("-").map(Number);
    return localDateString(new Date(year, month - 1, day + 1));
  }

  function createDialog() {
    const el = document.createElement("dialog");
    el.className = "elm-booking";
    el.id = "elm-booking";
    el.setAttribute("aria-labelledby", "elm-booking-title");
    el.innerHTML = `
      <div class="elm-booking__panel">
        <button type="button" class="elm-booking__close" aria-label="关闭入住查询">×</button>
        <h2 id="elm-booking-title">查询入住</h2>
        <p class="elm-booking__intro">选择抵达和离店日期，查看此次入住的房费。</p>
        <form class="elm-booking__form">
          <div class="elm-booking__dates">
            <label>抵达日期<input type="date" name="arrival" required></label>
            <label>离店日期<input type="date" name="departure" required></label>
          </div>
          <label>入住人数<select name="guests">
            <option value="1">1 位住客</option>
            <option value="2" selected>2 位住客</option>
          </select></label>
          <button type="submit" class="elm-booking__action">查看房费 <span aria-hidden="true">→</span></button>
        </form>
        <section class="elm-booking__result" hidden>
          <div class="elm-booking__room"><h3>山景客房</h3><span>¥880 / 晚</span></div>
          <p class="elm-booking__range"></p>
          <div class="elm-booking__total"><span>预计房费</span><strong></strong></div>
          <button type="button" class="elm-booking__action elm-booking__explore">查看客房 <span aria-hidden="true">→</span></button>
          <button type="button" class="elm-booking__edit">修改入住日期</button>
        </section>
        <small class="elm-booking__note">虚构旅馆体验 · 仅供模拟查询</small>
      </div>`;
    document.body.append(el);
    const form = el.querySelector("form");
    const { arrival, departure, guests } = form.elements;
    const heading = el.querySelector("h2");
    const intro = el.querySelector(".elm-booking__intro");
    const result = el.querySelector(".elm-booking__result");

    function syncDates() {
      departure.min = nextDay(arrival.value || arrival.min);
      if (!departure.value || departure.value < departure.min) departure.value = departure.min;
    }

    function showForm() {
      result.hidden = true;
      intro.hidden = false;
      form.hidden = false;
      heading.textContent = "查询入住";
      arrival.min = localDateString(new Date());
      if (!arrival.value || arrival.value < arrival.min) arrival.value = arrival.min;
      syncDates();
    }

    arrival.addEventListener("change", syncDates);
    el.addEventListener("close", () => opener?.focus({ preventScroll: true }));
    el.querySelector(".elm-booking__close").addEventListener("click", () => el.close());
    el.addEventListener("click", event => {
      if (event.target !== el) return;
      const bounds = el.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) el.close();
    });
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const nights = (departure.valueAsNumber - arrival.valueAsNumber) / 86400000;
      el.querySelector(".elm-booking__range").textContent = arrival.value + " 至 " + departure.value + " · " + nights + " 晚 · " + guests.value + " 位住客";
      el.querySelector(".elm-booking__total strong").textContent = "¥" + (nights * nightlyPrice).toLocaleString("zh-CN");
      heading.textContent = "入住明细";
      intro.hidden = true;
      form.hidden = true;
      result.hidden = false;
      heading.tabIndex = -1;
      heading.focus();
    });
    el.querySelector(".elm-booking__edit").addEventListener("click", () => {
      showForm();
      arrival.focus();
    });
    el.querySelector(".elm-booking__explore").addEventListener("click", () => {
      el.close();
      const rooms = document.getElementById("rooms");
      if (rooms) {
        opener = null;
        rooms.setAttribute("tabindex", "-1");
        rooms.focus({ preventScroll: true });
        rooms.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      }
    });
    return { open() { showForm(); el.showModal(); arrival.focus(); } };
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-booking]");
    if (!button) return;
    event.preventDefault();
    opener = button;
    dialog ??= createDialog();
    dialog.open();
  });
})();
