// Led Planner PRO — web
// Boton de descarga: version e instalador de la ultima publicacion (API publica de GitHub).
// Novedades: se leen de novedades.json (el mismo archivo que lleva la app).
(function(){
  var REPO='Bhelma/ledplannerpro';
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function fecha(d){try{return new Date(d).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});}catch(e){return d;}}

  // Descarga: antes de descargar se pide una ficha (nombre, empresa, email) que llega por email a
  // soporte a traves de un Google Apps Script (que ademas la apunta en una hoja de calculo).
  // La app no pasa por aqui: se actualiza desde la publicacion de GitHub.
  var AVISO='https://script.google.com/macros/s/AKfycbwPWy8s55j5UGJnBLorK3uxNiCKycw2XBzIrTO0huzAiQAEQT3LsQm7M2CFNJyGzeA/exec';
  var exeUrl='https://github.com/'+REPO+'/releases/latest',exeVer='';
  var dl=document.getElementById('dl'),ver=document.getElementById('ver');
  if(dl){
    fetch('https://api.github.com/repos/'+REPO+'/releases/latest').then(function(r){return r.ok?r.json():null;}).then(function(j){
      if(!j)return;
      var exe=(j.assets||[]).filter(function(a){return /\.exe$/i.test(a.name);})[0];
      if(!exe)return;
      exeUrl=exe.browser_download_url;exeVer=String(j.tag_name||'').replace(/^v/,'');
      dl.textContent='Descargar para Windows · V'+exeVer;
      if(ver)ver.textContent='Versión '+exeVer+' · '+(exe.size/1048576).toFixed(0)+' MB · publicada el '+fecha(j.published_at);
    }).catch(function(){});
  }

  var dlg=null;
  function ficha(){
    if(dlg)return dlg;
    dlg=document.createElement('dialog');dlg.className='fdlg';
    dlg.innerHTML='<form method="dialog" novalidate>'
      +'<button type="button" class="fx" aria-label="Cerrar">&times;</button>'
      +'<h3>Descargar Led Planner PRO</h3>'
      +'<p class="fs">Déjanos tus datos y la descarga empezará automáticamente.</p>'
      +'<label>Nombre de contacto<input name="nombre" autocomplete="name" maxlength="80" required></label>'
      +'<label>Empresa<input name="empresa" autocomplete="organization" maxlength="100" required></label>'
      +'<label>Email<input name="email" type="email" autocomplete="email" maxlength="120" required></label>'
      +'<input name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">'
      +'<label class="chk"><input type="checkbox" name="ok" required> <span>Acepto que mis datos se usen para registrar la descarga y contactar conmigo sobre la aplicación (<a href="privacidad.html" target="_blank">privacidad</a>).</span></label>'
      +'<div class="fmsg" role="status"></div>'
      +'<button type="submit" class="btn">Descargar</button>'
      +'</form>';
    document.body.appendChild(dlg);
    var f=dlg.querySelector('form'),msg=dlg.querySelector('.fmsg'),bt=f.querySelector('[type=submit]');
    dlg.querySelector('.fx').addEventListener('click',function(){dlg.close();});
    dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close();});
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var v=function(n){return f.elements[n].value.trim();};
      var err=!v('nombre')?'Escribe tu nombre de contacto.':!v('empresa')?'Escribe el nombre de la empresa.'
        :!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))?'Escribe un email válido.':!f.elements.ok.checked?'Marca la casilla de privacidad para continuar.':'';
      if(err){msg.className='fmsg err';msg.textContent=err;return;}
      bt.disabled=true;msg.className='fmsg';msg.textContent='Preparando la descarga...';
      var hecho=false;
      function bajar(){
        if(hecho)return;hecho=true;
        location.href=exeUrl;
        msg.className='fmsg ok';
        msg.innerHTML='¡Gracias! La descarga ha empezado. Si no empieza, <a href="'+esc(exeUrl)+'">pulsa aquí</a>. Después mira <a href="./#activar" class="fa">cómo activar la aplicación</a>.';
        msg.querySelector('.fa').addEventListener('click',function(){dlg.close();});
        bt.disabled=false;
      }
      if(v('_honey')){bajar();return;}
      // Apps Script no admite CORS: envio "no-cors" en texto plano (sin preflight); la respuesta no se lee
      fetch(AVISO,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({
        nombre:v('nombre'),empresa:v('empresa'),email:v('email'),version:exeVer,pagina:location.href.split('#')[0]
      })}).catch(function(){}).then(bajar);
      setTimeout(bajar,6000); // si el aviso tarda, la descarga no espera
    });
    return dlg;
  }
  function abrir(e){
    e.preventDefault();
    var d=ficha();d.querySelector('.fmsg').textContent='';d.querySelector('.fmsg').className='fmsg';
    if(d.showModal)d.showModal();else d.setAttribute('open','');
    var n=d.querySelector('[name=nombre]');if(n)n.focus();
  }
  Array.prototype.forEach.call(document.querySelectorAll('#dl,.dl-open'),function(a){a.addEventListener('click',abrir);});
  if(location.hash==='#descargar')setTimeout(function(){abrir({preventDefault:function(){}});},0);

  var box=document.getElementById('notes');
  if(box){
    fetch('novedades.json',{cache:'no-store'}).then(function(r){return r.json();}).then(function(j){
      var n=(j.notes||[]).slice().sort(function(a,b){var x=a.version.split('.').map(Number),y=b.version.split('.').map(Number);for(var i=0;i<3;i++)if(x[i]!==y[i])return y[i]-x[i];return 0;});
      box.innerHTML=n.map(function(v,i){
        return '<div class="nv-card" id="v'+esc(v.version)+'"><div class="nv-h"><span class="nv-v">V'+esc(v.version)+'</span>'+(i===0?'<span class="nv-new">Última versión</span>':'')
          +(v.date?'<span class="nv-d">'+esc(fecha(v.date))+'</span>':'')+'</div>'+(v.title?'<div class="nv-t">'+esc(v.title)+'</div>':'')
          +'<ul>'+(v.items||[]).map(function(t){return '<li>'+esc(t)+'</li>';}).join('')+'</ul></div>';
      }).join('');
      if(location.hash){var t=document.getElementById(location.hash.slice(1));if(t)t.scrollIntoView();}
    }).catch(function(){box.innerHTML='<p>No se han podido cargar las novedades.</p>';});
  }
  var y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();
})();
