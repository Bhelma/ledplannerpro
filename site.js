// Led Planner PRO — web
// Boton de descarga: version e instalador de la ultima publicacion (API publica de GitHub).
// Novedades: se leen de novedades.json (el mismo archivo que lleva la app).
(function(){
  var REPO='Bhelma/ledplannerpro';
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function fecha(d){try{return new Date(d).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});}catch(e){return d;}}

  var dl=document.getElementById('dl'),ver=document.getElementById('ver');
  if(dl){
    fetch('https://api.github.com/repos/'+REPO+'/releases/latest').then(function(r){return r.ok?r.json():null;}).then(function(j){
      if(!j)return;
      var exe=(j.assets||[]).filter(function(a){return /\.exe$/i.test(a.name);})[0];
      if(exe){dl.href=exe.browser_download_url;dl.textContent='Descargar para Windows · V'+String(j.tag_name||'').replace(/^v/,'');}
      if(ver&&exe)ver.textContent='Versión '+String(j.tag_name||'').replace(/^v/,'')+' · '+(exe.size/1048576).toFixed(0)+' MB · publicada el '+fecha(j.published_at);
    }).catch(function(){});
  }

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
