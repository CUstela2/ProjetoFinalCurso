(() => {

  const AREAS = [
    { id: 'churr1', name: 'Churrasqueira 1', capacity: 15, allowedStart: 8, allowedEnd: 22 },
    { id: 'churr2', name: 'Churrasqueira 2', capacity: 15, allowedStart: 8, allowedEnd: 22 },
    { id: 'salao',  name: 'Salão de Festas', capacity: 50, allowedStart: 8, allowedEnd: 27 },
    { id: 'quadra', name: 'Quadra Esportiva', capacity: 20, allowedStart: 8, allowedEnd: 22 },
    { id: 'piscina',name: 'Piscina', capacity: 30, allowedStart: 8, allowedEnd: 22 }
  ];

  const STORAGE_KEY = 'condo_reservas_v1';
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>[...r.querySelectorAll(s)];

  const load = ()=>JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
  const save = (l)=>localStorage.setItem(STORAGE_KEY, JSON.stringify(l));
  const uid = ()=>"res_"+Math.random().toString(36).slice(2,9);

  function pad(n){return String(n).padStart(2,"0");}
  function formatHour(h){ return pad(h%24)+":00"; }
  function formatDate(d){ let [y,m,a]=d.split("-"); return `${a}/${m}/${y}`; }

  function toMin(date,h){
    let [Y,M,D]=date.split("-").map(Number);
    if(h>=24){ h-=24; D++; }
    return new Date(Y,M-1,D,h).getTime()/60000;
  }
  function overl(r,d,s,e){
    return toMin(r.date,r.startHour)<toMin(d,e) && toMin(d,s)<toMin(r.date,r.endHour);
  }

  function renderAreas(){
    const box = $('#areas-available');
    box.innerHTML = `<h3>Áreas Disponíveis</h3><p class="subtitle">Espaços para reserva</p>`;
    const wrap = document.createElement("div");
    AREAS.forEach(a=>{
      wrap.innerHTML += `
      <div class="area">
        <div class="area-info">
          <span class="icon">📍</span>
          <div><p>${a.name}</p><small>${a.capacity} pessoas</small></div>
        </div>
        <div class="area-actions">
          <button class="btn-sm btn-primary" data-area="${a.id}">Reservar</button>
        </div>
      </div>`;
    });
    box.appendChild(wrap);
    $$('#areas-available .btn-primary').forEach(b=>b.onclick=()=>openModal(b.dataset.area));
  }

  const modal = $('#reserve-modal'),
        nameF = $('#modal-area-name'),
        idF = $('#area-id'),
        dateF = $('#reserve-date'),
        startF = $('#reserve-start'),
        endF = $('#reserve-end');

  $('#modal-close').onclick = ()=>modal.classList.add("hidden");
  $('#cancel-modal').onclick = ()=>modal.classList.add("hidden");

  function openModal(id){
    const a = AREAS.find(x=>x.id===id);
    $('#modal-title').textContent = "Reservar — "+a.name;
    idF.value = a.id;
    nameF.textContent = `${a.name} • capacidade ${a.capacity}`;
    dateF.value = new Date().toISOString().slice(0,10);

    fillStart(a);
    fillEnd(a);

    modal.classList.remove("hidden");
  }

  dateF.onchange = ()=>fillStart(AREAS.find(a=>a.id===idF.value));

  function fillStart(area){
    startF.innerHTML = "";
    endF.innerHTML = "";
    const reservas = load().filter(r=>r.areaId===area.id && r.date === dateF.value);
    const now = new Date();
    const hoje = now.toISOString().slice(0,10);

    for(let h=area.allowedStart; h<area.allowedEnd; h++){
      if(dateF.value===hoje && h<=now.getHours()) continue;
      if(reservas.some(r=>overl(r,dateF.value,h,h+1))) continue;
      startF.innerHTML += `<option value="${h}">${formatHour(h)}</option>`;
    }
    fillEnd(area);
  }

  startF.onchange = ()=>fillEnd(AREAS.find(a=>a.id===idF.value));

  function fillEnd(area){
    endF.innerHTML = "";
    const reservas = load().filter(r=>r.areaId===area.id && r.date === dateF.value);
    const s = +startF.value;
    for(let h=s+1; h<=area.allowedEnd; h++){
      const conflito = reservas.some(r=>overl(r,dateF.value,s,h));
      if(conflito) break;
      endF.innerHTML += `<option value="${h}">${formatHour(h)}</option>`;
    }
  }

  $('#reserve-form').onsubmit = e=>{
    e.preventDefault();
    const list = load();
    list.push({
      id: uid(),
      areaId: idF.value,
      date: dateF.value,
      startHour: +startF.value,
      endHour: +endF.value
    });
    save(list);
    modal.classList.add("hidden");
    renderMine();
  };

  function renderMine(){
    const box = $('#reservations-list');
    const list = load();
    if(!list.length){ box.innerHTML="Nenhuma reserva ainda."; return; }
    list.sort((a,b)=>toMin(a.date,a.startHour)-toMin(b.date,b.startHour));
    box.innerHTML="";
    list.forEach(r=>{
      const a = AREAS.find(z=>z.id===r.areaId);
      box.innerHTML+=`
      <div class="reserved-item">
        <div class="reserved-left">
          <div class="icon">📍</div>
          <div><p>${a.name}</p><small>${formatDate(r.date)} • ${formatHour(r.startHour)} → ${formatHour(r.endHour)}</small></div>
        </div>
        <button class="btn-sm" data-id="${r.id}">Cancelar</button>
      </div>`;
    });
    $$('#reservations-list .btn-sm').forEach(b=>b.onclick=()=>{
      save(load().filter(x=>x.id!==b.dataset.id));
      renderMine();
    });
  }

  renderAreas();
  renderMine();

})();
