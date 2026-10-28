// Gráficos de Administración · Indicadores (datos de ejemplo de la maqueta).
// SVG dibujado aquí, sin librerías, para que funcione sin internet. Cada gráfico tiene tooltip al pasar el
// ratón o con el teclado y un botón "Ver tabla" con los mismos datos. Se redibuja al cambiar el ancho.
(function(){
  var NS='http://www.w3.org/2000/svg';
  var DATOS={
    casos:{meses:['May','Jun','Jul','Ago','Sep','Oct'],largo:['Mayo','Junio','Julio','Agosto','Septiembre','Octubre'],
           aprobados:[28,31,26,34,35,32],noAprobados:[5,3,4,2,5,4]},
    componentes:[['ESB',38],['API',31],['EI',24],['APIM',17],['DSS',12],['EI-APIM',9],['ESB-DSS',6]],
    usuarios:{semanas:['03/08','10/08','17/08','24/08','31/08','07/09','14/09','21/09','28/09','05/10','12/10','19/10'],
              valores:[21,24,22,27,25,29,31,28,33,30,34,36]}
  };

  function el(tag,attrs,padre){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(padre)padre.appendChild(e);return e}
  function texto(tag,attrs,valor,padre){var e=el(tag,attrs,padre);e.textContent=valor;return e}
  function techo(v,paso){return Math.ceil(v/paso)*paso}
  // barra con el extremo de datos redondeado (4px) y la base recta
  function columna(x,y,w,h,r){r=Math.min(r,h,w/2);return 'M'+x+','+(y+h)+'V'+(y+r)+'Q'+x+','+y+' '+(x+r)+','+y+'H'+(x+w-r)+'Q'+(x+w)+','+y+' '+(x+w)+','+(y+r)+'V'+(y+h)+'Z'}
  function fila(x,y,w,h,r){r=Math.min(r,w,h/2);return 'M'+x+','+y+'H'+(x+w-r)+'Q'+(x+w)+','+y+' '+(x+w)+','+(y+r)+'V'+(y+h-r)+'Q'+(x+w)+','+(y+h)+' '+(x+w-r)+','+(y+h)+'H'+x+'Z'}

  // tooltip: el valor manda, la etiqueta acompaña; filas con una línea corta del color de la serie
  function tooltip(fig){var t=fig.querySelector('.kr-tip');if(!t){t=document.createElement('div');t.className='kr-tip';t.setAttribute('role','status');fig.appendChild(t)}return t}
  function mostrar(fig,titulo,filas,x,y){
    var t=tooltip(fig);t.textContent='';
    var h=document.createElement('div');h.className='h';h.textContent=titulo;t.appendChild(h);
    filas.forEach(function(f){var r=document.createElement('div');r.className='r';
      if(f.color){var k=document.createElement('i');k.style.background=f.color;r.appendChild(k)}
      var b=document.createElement('b');b.textContent=f.valor;r.appendChild(b);
      var s=document.createElement('span');s.textContent=f.etiqueta;r.appendChild(s);t.appendChild(r)});
    t.classList.add('on');
    var ancho=fig.clientWidth,tw=t.offsetWidth;
    t.style.left=Math.max(8,Math.min(x+12,ancho-tw-8))+'px';t.style.top=Math.max(8,y-t.offsetHeight-12)+'px';
  }
  function ocultar(fig){var t=fig.querySelector('.kr-tip');if(t)t.classList.remove('on')}
  // zona sensible: más grande que la marca; responde a ratón y a foco
  function zona(svg,fig,attrs,alEntrar){
    var z=el('rect',Object.assign({fill:'transparent',tabindex:'0',class:'hit'},attrs),svg);
    var pos=function(ev){var b=fig.getBoundingClientRect();return ev&&ev.clientX!=null?[ev.clientX-b.left,ev.clientY-b.top]:[+attrs.x+(+attrs.width)/2,+attrs.y+20]};
    z.addEventListener('pointermove',function(ev){alEntrar(z,pos(ev))});
    z.addEventListener('focus',function(){alEntrar(z,pos())});
    z.addEventListener('pointerleave',function(){ocultar(fig);z.dispatchEvent(new Event('salir'))});
    z.addEventListener('blur',function(){ocultar(fig);z.dispatchEvent(new Event('salir'))});
    return z;
  }
  function ejeY(svg,m,W,H,max,paso){
    for(var v=0;v<=max;v+=paso){var y=m.t+(H-m.t-m.b)*(1-v/max);
      el('line',{x1:m.l,x2:W-m.r,y1:y,y2:y,class:v===0?'base':'grid'},svg);
      texto('text',{x:m.l-8,y:y+4,'text-anchor':'end',class:'ax'},v,svg)}
  }

  var DIBUJAR={
    casos:function(fig,svg,W){
      var d=DATOS.casos,H=240,m={t:12,r:8,b:28,l:34},max=techo(Math.max.apply(null,d.aprobados.map(function(a,i){return a+d.noAprobados[i]})),10);
      svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.setAttribute('height',H);ejeY(svg,m,W,H,max,10);
      var pw=W-m.l-m.r,banda=pw/d.meses.length,bw=Math.min(24,banda*.5),esc=(H-m.t-m.b)/max,base=H-m.b;
      d.meses.forEach(function(mes,i){
        var x=m.l+banda*i+(banda-bw)/2,ha=d.aprobados[i]*esc,hn=d.noAprobados[i]*esc,g=el('g',{class:'marca'},svg);
        el('rect',{x:x,y:base-ha,width:bw,height:ha,fill:'var(--series-1)'},g);
        el('path',{d:columna(x,base-ha-2-hn,bw,hn,4),fill:'var(--series-2)'},g); // 2px de superficie entre segmentos
        texto('text',{x:x+bw/2,y:H-8,'text-anchor':'middle',class:'ax'},mes,svg);
        zona(svg,fig,{x:m.l+banda*i,y:m.t,width:banda,height:H-m.t},function(z,p){g.classList.add('on');
          mostrar(fig,d.largo[i]+' 2026',[{color:'var(--series-1)',valor:d.aprobados[i],etiqueta:'Aprobados'},{color:'var(--series-2)',valor:d.noAprobados[i],etiqueta:'No aprobados'},{valor:d.aprobados[i]+d.noAprobados[i],etiqueta:'Total revisados'}],p[0],p[1])})
          .addEventListener('salir',function(){g.classList.remove('on')});
      });
    },
    componentes:function(fig,svg,W){
      var d=DATOS.componentes,fh=30,m={t:4,r:40,b:4,l:72},H=m.t+m.b+fh*d.length,max=techo(d[0][1],10),esc=(W-m.l-m.r)/max;
      svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.setAttribute('height',H);
      el('line',{x1:m.l,x2:m.l,y1:m.t,y2:H-m.b,class:'base'},svg);
      d.forEach(function(c,i){
        var y=m.t+fh*i+(fh-16)/2,w=c[1]*esc,g=el('g',{class:'marca'},svg);
        el('path',{d:fila(m.l,y,w,16,4),fill:'var(--series-1)'},g);
        texto('text',{x:m.l-10,y:y+12,'text-anchor':'end',class:'cat'},c[0],svg);
        texto('text',{x:m.l+w+6,y:y+12,class:'val'},c[1],svg);
        zona(svg,fig,{x:0,y:m.t+fh*i,width:W,height:fh},function(z,p){g.classList.add('on');
          mostrar(fig,c[0],[{color:'var(--series-1)',valor:c[1],etiqueta:'servicios con versión vigente'}],p[0],p[1])})
          .addEventListener('salir',function(){g.classList.remove('on')});
      });
    },
    usuarios:function(fig,svg,W){
      var d=DATOS.usuarios,H=220,m={t:16,r:40,b:28,l:34},max=techo(Math.max.apply(null,d.valores),10),n=d.valores.length;
      svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.setAttribute('height',H);ejeY(svg,m,W,H,max,10);
      var X=function(i){return m.l+(W-m.l-m.r)*i/(n-1)},Y=function(v){return m.t+(H-m.t-m.b)*(1-v/max)};
      var linea=d.valores.map(function(v,i){return (i?'L':'M')+X(i)+','+Y(v)}).join('');
      el('path',{d:linea+'L'+X(n-1)+','+(H-m.b)+'L'+X(0)+','+(H-m.b)+'Z',fill:'var(--series-1)','fill-opacity':'.1'},svg);
      el('path',{d:linea,fill:'none',stroke:'var(--series-1)','stroke-width':2,'stroke-linejoin':'round','stroke-linecap':'round'},svg);
      d.semanas.forEach(function(s,i){if(i%2===1||W<520&&i%4!==3)return;texto('text',{x:X(i),y:H-8,'text-anchor':'middle',class:'ax'},s,svg)});
      var ult=n-1;
      el('circle',{cx:X(ult),cy:Y(d.valores[ult]),r:4,fill:'var(--series-1)',stroke:'var(--surface,#FFFFFF)','stroke-width':2},svg);
      texto('text',{x:X(ult)+8,y:Y(d.valores[ult])+4,class:'val'},d.valores[ult],svg);
      var cruz=el('line',{y1:m.t,y2:H-m.b,class:'cruz'},svg),punto=el('circle',{r:4,fill:'var(--series-1)',stroke:'var(--surface,#FFFFFF)','stroke-width':2,class:'cruz'},svg);
      // la cruz busca la semana más cercana; una zona por semana para el teclado
      d.valores.forEach(function(v,i){
        var a=i?(X(i-1)+X(i))/2:m.l,b=i<n-1?(X(i)+X(i+1))/2:W-m.r;
        zona(svg,fig,{x:a,y:m.t,width:b-a,height:H-m.t-m.b},function(z,p){
          cruz.setAttribute('x1',X(i));cruz.setAttribute('x2',X(i));punto.setAttribute('cx',X(i));punto.setAttribute('cy',Y(v));svg.classList.add('cruzando');
          mostrar(fig,'Semana del '+d.semanas[i],[{color:'var(--series-1)',valor:v,etiqueta:'usuarios activos'}],p[0],p[1])})
          .addEventListener('salir',function(){svg.classList.remove('cruzando')});
      });
    }
  };

  // vista de tabla: los mismos datos sin depender del gráfico
  var TABLA={
    casos:function(){var d=DATOS.casos;return [['Mes','Aprobados','No aprobados','Total']].concat(d.largo.map(function(m,i){return [m,d.aprobados[i],d.noAprobados[i],d.aprobados[i]+d.noAprobados[i]]}))},
    componentes:function(){return [['Componente','Servicios']].concat(DATOS.componentes)},
    usuarios:function(){var d=DATOS.usuarios;return [['Semana del','Usuarios activos']].concat(d.semanas.map(function(s,i){return [s,d.valores[i]]}))}
  };
  function tabla(filas){
    var t=document.createElement('table');t.className='kr-t tight';var th=t.createTHead().insertRow(),tb=t.createTBody();
    filas[0].forEach(function(c,i){var e=document.createElement('th');e.textContent=c;if(i)e.className='r';th.appendChild(e)});
    filas.slice(1).forEach(function(f){var r=tb.insertRow();f.forEach(function(c,i){var e=r.insertCell();e.textContent=c;if(i)e.className='r num'})});
    var w=document.createElement('div');w.className='kr-tview hidden';w.appendChild(t);return w;
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-grafico]'),function(fig){
    var tipo=fig.getAttribute('data-grafico'),plot=fig.querySelector('.kr-plot'),ancho=0;
    var svg=el('svg',{role:'img','aria-label':fig.querySelector('figcaption b').textContent+'. Usa "Ver tabla" para ver los datos.',width:'100%'},plot);
    var vista=tabla(TABLA[tipo]());fig.appendChild(vista);
    var pintar=function(){var w=Math.round(plot.clientWidth);if(!w||w===ancho)return;ancho=w;svg.textContent='';DIBUJAR[tipo](fig,svg,w)};
    new ResizeObserver(pintar).observe(plot);pintar();
    var btn=fig.querySelector('[data-vista]');
    if(btn){btn.setAttribute('role','button');btn.setAttribute('tabindex','0');
      var cambiar=function(){var enTabla=vista.classList.toggle('hidden')===false;plot.classList.toggle('hidden',enTabla);
        var ley=fig.querySelector('.kr-legend-row');if(ley)ley.classList.toggle('hidden',enTabla);btn.textContent=enTabla?'Ver gráfico':'Ver tabla';ocultar(fig)};
      btn.addEventListener('click',cambiar);btn.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();cambiar()}});}
  });
})();
