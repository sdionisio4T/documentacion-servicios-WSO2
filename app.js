
(function(){
  var $=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var txt=function(e){return (e.textContent||'').replace(/\s+/g,' ').trim()};
  var NAV={'Inicio':'inicio.html','Información WSO2':'info.html','Plantillas':'plantillas.html','Auditoría':'auditoria.html'};
  var BTN={'Iniciar sesión':'inicio.html','Cerrar sesión':'index.html','Ver historial de versiones':'historial.html','Ver docs':'visor.html','Ver documentos':'visor.html',
           'Volver a resultados':'resultados.html','Buscar':'resultados.html','Ir al 7040':'visor.html'};
  function go(u){location.href=u}
  // rol de la maqueta: admin / admin entra como Administrador; cualquier otro usuario, como lector
  var ROL={get:function(){try{return localStorage.getItem('kr-rol')}catch(e){return null}},
           set:function(v){try{v?localStorage.setItem('kr-rol',v):localStorage.removeItem('kr-rol')}catch(e){}}};
  var login=document.getElementById('login');
  if(login){ROL.set(null);
    login.addEventListener('submit',function(e){e.preventDefault();
      var u=document.getElementById('u').value.trim(),p=document.getElementById('p').value;
      ROL.set(u==='admin'&&p==='admin'?'admin':null);go('inicio.html')})}
  if(ROL.get()==='admin'){
    $('.kr-nav').forEach(function(n){if(!$('span',n).some(function(s){return txt(s)==='Auditoría'})){var s=document.createElement('span');s.textContent='Auditoría';n.appendChild(s)}});
    $('.kr-ro').forEach(function(r){r.remove()});
    $('.kr-user').forEach(function(u){$('.kr-avatar',u).forEach(function(a){a.textContent='CR'});$('.kr-uname b',u).forEach(function(b){b.textContent='Carlos Rojas'});
      if(!$('.kr-role',u).length){var r=document.createElement('span');r.className='kr-role';r.textContent='Administrador';u.appendChild(r)}});
  }
  function wire(el,fn){el.setAttribute('role','button');el.setAttribute('tabindex','0');el.addEventListener('click',fn);
    el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fn(e)}})}
  $('.kr-nav span').forEach(function(s){var u=NAV[txt(s)];if(u)wire(s,function(){go(u)})});
  $('.kr-header img').forEach(function(i){wire(i,function(){go('inicio.html')})});
  $('.kr-btn').forEach(function(b){var t=txt(b);
    if(t==='Subir plantilla'&&b.closest('.kr-frame')){wire(b,function(){document.getElementById('upl').classList.remove('hidden')});return}
    if(t==='Cancelar'){wire(b,function(){document.getElementById('upl').classList.add('hidden')});return}
    if(BTN[t]&&!b.closest('.kr-modal.up')&&!b.closest('#login')) wire(b,function(){go(BTN[t])});
  });
  $('.kr-tile,td.svc').forEach(function(e){wire(e,function(){go('resultados.html')})});
  $('.kr-crumb span').forEach(function(e){var t=txt(e);if(t==='Inicio')wire(e,function(){go('inicio.html')});if(t==='Resultados')wire(e,function(){go('resultados.html')})});
  $('.kr-input').forEach(function(i){i.removeAttribute('readonly');i.addEventListener('keydown',function(e){if(e.key==='Enter')go('resultados.html')})});
  var up=document.getElementById('upl');
  if(up){ $('.kr-btn.icon[aria-label="Cerrar"]',up).forEach(function(c){wire(c,function(){up.classList.add('hidden')})});
    $('.kr-btn.primary',up).forEach(function(b){wire(b,function(){up.classList.add('hidden')})}) }
  // filtros desplegables: opciones según la etiqueta del campo
  var AMB=['Producción','Preproducción','Desarrollo','Pruebas'],COMP=['ESB','EI','API','APIM','EI-APIM','DSS','ESB-DSS'],CAT=['Checklist','Manual de usuario','Formato'];
  var OPC={'Ambiente':['Todos los ambientes'].concat(AMB),'Componente':['Todos los componentes'].concat(COMP),'Estado':['Todos los estados','Aprobado','No aprobado'],
           'Fechas':['Últimos 7 días','Últimos 30 días','Últimos 90 días','Este año'],'Usuario':['Todos los usuarios','Andrés Salazar','Carlos Rojas','Juan Pérez','Laura Méndez','María Gómez'],
           'Categoría':['Todas las categorías'].concat(CAT),'Formato':['Todos los formatos','Word','Excel','PDF']};
  var abierto=null;
  function cerrar(){if(abierto){abierto.sel.classList.remove('open');abierto.sel.setAttribute('aria-expanded','false');abierto.menu.remove();abierto=null}}
  function elegir(o){$('span',abierto.sel)[0].textContent=txt(o);cerrar()}
  $('.kr-select').forEach(function(sel){
    var f=sel.closest('.kr-field'),l=f?$('.kr-lbl',f)[0]:$('.kr-flabel',sel.parentNode)[0],et=l?txt(l):'';
    var ops=OPC[et];if(!ops)return;
    if(!f)ops=ops.slice(1); // en el formulario de subida no hay opción "Todas"
    sel.setAttribute('aria-haspopup','listbox');sel.setAttribute('aria-expanded','false');sel.setAttribute('aria-label',et);
    wire(sel,function(e){
      if(abierto&&abierto.sel===sel){cerrar();return}
      cerrar();var cur=txt($('span',sel)[0]),m=document.createElement('div');m.className='kr-menu';m.setAttribute('role','listbox');
      ops.forEach(function(op){var o=document.createElement('div');o.className='kr-opt'+(op===cur?' on':'');o.setAttribute('role','option');o.setAttribute('aria-selected',op===cur);
        o.innerHTML='<span></span><svg class="ic sm" aria-hidden="true"><use href="#i-check-c"/></svg>';o.firstChild.textContent=op;
        o.addEventListener('click',function(ev){ev.stopPropagation();elegir(o)});m.appendChild(o)});
      sel.appendChild(m);sel.classList.add('open');sel.setAttribute('aria-expanded','true');abierto={sel:sel,menu:m,i:Math.max(0,ops.indexOf(cur))};
      $('.kr-opt',m)[abierto.i].classList.add('act');
    });
  });
  document.addEventListener('click',function(e){if(abierto&&!abierto.sel.contains(e.target))cerrar()});
  window.addEventListener('keydown',function(e){if(!abierto)return;var os=$('.kr-opt',abierto.menu);
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){os[abierto.i].classList.remove('act');abierto.i=(abierto.i+(e.key==='ArrowDown'?1:-1)+os.length)%os.length;os[abierto.i].classList.add('act');os[abierto.i].scrollIntoView({block:'nearest'})}
    else if(e.key==='Enter'||e.key===' ')elegir(os[abierto.i]);else if(e.key==='Escape')cerrar();else return;
    e.preventDefault();e.stopImmediatePropagation()},true);
  // visor: cerrar, cambiar de archivo, anterior / siguiente
  var vms=$('.vm');
  if(vms.length){
    var cur=0;
    var show=function(i){cur=(i+vms.length)%vms.length;vms.forEach(function(v,k){v.classList.toggle('hidden',k!==cur)})};
    vms.forEach(function(v){
      $('.kr-btn.icon[aria-label="Cerrar"]',v).forEach(function(c){wire(c,function(){go('resultados.html')})});
      $('.kr-fi',v).forEach(function(f,k){wire(f,function(){show(k)})});
      $('.kr-btn',v).forEach(function(b){var t=txt(b);if(t==='Anterior')wire(b,function(){show(cur-1)});if(t==='Siguiente')wire(b,function(){show(cur+1)})});
    });
    document.addEventListener('keydown',function(e){if(e.key==='ArrowDown')show(cur+1);if(e.key==='ArrowUp')show(cur-1);if(e.key==='Escape')go('resultados.html')});
  }
  // historial: pestañas por ambiente
  var hvs=$('.hv');
  if(hvs.length){ hvs.forEach(function(v){ $('.kr-tab',v).forEach(function(t,k){wire(t,function(){hvs.forEach(function(h,j){h.classList.toggle('hidden',j!==k)})})}) }) }
  // login: mostrar/ocultar contraseña
  var eye=document.getElementById('eye');
  if(eye){eye.addEventListener('click',function(){var p=document.getElementById('p');var show=p.type==='password';p.type=show?'text':'password';eye.setAttribute('aria-label',show?'Ocultar contraseña':'Mostrar contraseña');
    eye.innerHTML='<svg class="ic" aria-hidden="true"><use href="#i-'+(show?'eye-off2':'eye')+'"/></svg>'})}
  if(up&&location.hash==='#subir')up.classList.remove('hidden');
})();
