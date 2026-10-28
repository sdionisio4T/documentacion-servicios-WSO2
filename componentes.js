// Componentes compartidos: cada <div data-componente="nombre"> se reemplaza por componentes/nombre.html.
// Atributos del hueco: data-activo="inicio|info|plantillas|admin" marca la opción del menú.
// Usa fetch, así que la maqueta se abre con Live Server (con doble clic el navegador lo bloquea).
// Cuando todos los componentes están puestos, carga app.js para que conecte botones y menús.
//
// Los componentes no llevan etiquetas svg escritas: Live Server inyecta su script de recarga delante de
// cada cierre de svg y corta el final del archivo. Por eso iconos.html trae solo los <symbol> (aquí se
// envuelven en el sprite) y los iconos de los componentes se escriben <i class="ic" data-icono="nombre"></i>.
(function(){
  var rol='lector';
  try{if(localStorage.getItem('kr-rol')==='admin')rol='admin'}catch(e){}
  // data-solo también funciona en el contenido de cada página (por ejemplo, Administración)
  function porRol(raiz){Array.prototype.forEach.call(raiz.querySelectorAll('[data-solo]'),function(e){
    if(e.getAttribute('data-solo')!==rol)e.remove();else e.removeAttribute('data-solo')})}
  porRol(document);
  var cache={};
  function leer(n){
    return cache[n]||(cache[n]=fetch('componentes/'+n+'.html').then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.text()})
      // por si Live Server inyecta igualmente (por ejemplo, en una versión distinta): los componentes no llevan scripts
      .then(function(html){return html.replace(/<!--\s*Code injected by live-server\s*-->/gi,'').replace(/<script[\s\S]*?<\/script>/gi,'')}));
  }
  function icono(i){
    var t=document.createElement('template');
    t.innerHTML='<svg class="'+i.className+'" aria-hidden="true"><use href="#i-'+i.getAttribute('data-icono')+'"/></svg>';
    i.replaceWith(t.content);
  }
  function poner(hueco){
    var n=hueco.getAttribute('data-componente');
    return leer(n).then(function(html){
      var t=document.createElement('template');
      t.innerHTML=n==='iconos'?'<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>'+html+'</defs></svg>':html;
      porRol(t.content);
      Array.prototype.forEach.call(t.content.querySelectorAll('i[data-icono]'),icono);
      var act=hueco.getAttribute('data-activo');
      if(act)Array.prototype.forEach.call(t.content.querySelectorAll('[data-nav="'+act+'"]'),function(e){
        e.classList.add('on');e.insertAdjacentHTML('beforeend','<i class="bar"></i>')});
      hueco.replaceWith(t.content);
    }).catch(function(e){console.error('No se pudo cargar el componente "'+n+'". ¿Abriste la maqueta con Live Server?',e)});
  }
  var huecos=Array.prototype.slice.call(document.querySelectorAll('[data-componente]'));
  Promise.all(huecos.map(poner)).then(function(){
    var s=document.createElement('script');s.src='app.js';document.body.appendChild(s);
  });
})();
