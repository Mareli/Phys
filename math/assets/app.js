/* ───────────────────────────────────────────────
   Математика ЦТ/ЦЭ — общий движок страниц теории
   ─────────────────────────────────────────────── */

(function(){
  'use strict';

  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.from((r||document).querySelectorAll(s))}

  var TOPIC_COLORS={
    t01:{acc:'#dc2626',bg:'#fef2f2',border:'#fecaca',dim:'#b91c1c',glow:'rgba(220,38,38,.35)'},
    t02:{acc:'#ea580c',bg:'#fff7ed',border:'#fed7aa',dim:'#c2410c',glow:'rgba(234,88,12,.35)'},
    t03:{acc:'#16a34a',bg:'#f0fdf4',border:'#bbf7d0',dim:'#15803d',glow:'rgba(22,163,74,.35)'},
    t04:{acc:'#2563eb',bg:'#eff6ff',border:'#bfdbfe',dim:'#1d4ed8',glow:'rgba(37,99,235,.35)'},
    t05:{acc:'#7c3aed',bg:'#f5f3ff',border:'#ddd6fe',dim:'#6d28d9',glow:'rgba(124,58,237,.35)'},
    t06:{acc:'#b45309',bg:'#fffbeb',border:'#fde68a',dim:'#92400e',glow:'rgba(180,83,9,.35)'},
    t07:{acc:'#0e7490',bg:'#ecfeff',border:'#a5f3fc',dim:'#155e75',glow:'rgba(14,116,144,.35)'},
    t08:{acc:'#be185d',bg:'#fdf2f8',border:'#fbcfe8',dim:'#9d174d',glow:'rgba(190,24,93,.35)'},
    t09:{acc:'#059669',bg:'#ecfdf5',border:'#a7f3d0',dim:'#047857',glow:'rgba(5,150,105,.35)'},
    t10:{acc:'#4338ca',bg:'#eef2ff',border:'#c7d2fe',dim:'#3730a3',glow:'rgba(67,56,202,.35)'},
    t11:{acc:'#0369a1',bg:'#f0f9ff',border:'#bae6fd',dim:'#075985',glow:'rgba(3,105,161,.35)'}
  };

  function setTopicTheme(t){
    var c=TOPIC_COLORS[t];if(!c)return;
    var r=document.documentElement.style;
    r.setProperty('--acc',c.acc);
    r.setProperty('--acc-bg',c.bg);
    r.setProperty('--acc-border',c.border);
    r.setProperty('--acc-dim',c.dim);
    r.setProperty('--acc-glow',c.glow);
  }

  function showSection(id){
    var sec=document.getElementById(id);if(!sec)return;
    $$('.sec').forEach(function(s){s.classList.remove('vis')});
    sec.classList.add('vis');
    $$('.nav-item').forEach(function(b){b.classList.remove('act')});
    var btn=document.querySelector('[data-target="'+id+'"]');
    if(btn)btn.classList.add('act');
    var ct=$('.content');if(ct)ct.scrollTo({top:0,behavior:'smooth'});
    var sb=$('.sidebar');if(sb)sb.classList.remove('open');
    var ov=$('.sidebar-overlay');if(ov)ov.classList.remove('open');
    if(history.replaceState){history.replaceState(null,'',location.pathname+'#'+id)}
  }

  function renderMath(scope){
    if(typeof katex==='undefined')return;
    scope=scope||document;
    $$('[data-tex]',scope).forEach(function(el){
      try{
        katex.render(el.getAttribute('data-tex'),el,{
          throwOnError:false,
          displayMode:el.classList.contains('formula')
        });
      }catch(e){}
    });
  }

  function buildRefPanel(){
    var list=$('.ref-list');if(!list)return;
    list.innerHTML='';
    var autoId=0,prevSecId=null;
    var cards=$$('.fcard, .fchip');
    cards.forEach(function(c){
      var texEl=c.querySelector('[data-tex]');if(!texEl)return;
      var nameEl=c.querySelector('.flabel, .chip-name');if(!nameEl)return;
      var sec=c.closest('.sec');if(!sec||!sec.id)return;
      if(!c.id)c.id='autoref_'+(++autoId);
      var tex=texEl.getAttribute('data-tex');
      var name=nameEl.textContent.trim();
      if(sec.id!==prevSecId){
        var headEl=sec.querySelector('.sec-head h1');
        var headTxt=headEl?headEl.textContent.trim():sec.id;
        var grp=document.createElement('div');
        grp.className='ref-group';
        grp.textContent=headTxt;
        list.appendChild(grp);
        prevSecId=sec.id;
      }
      var item=document.createElement('div');
      item.className='ref-item';
      item.dataset.section=sec.id;
      item.dataset.anchor=c.id;
      item.dataset.text=name+' '+tex;
      var nm=document.createElement('div');nm.className='ri-name';nm.textContent=name;
      var fm=document.createElement('span');fm.className='ri-formula';fm.setAttribute('data-tex',tex);
      item.appendChild(nm);item.appendChild(fm);
      list.appendChild(item);
    });
    renderMath(list);
  }

  function initRefPanel(){
    buildRefPanel();
    var btn=$('.ref-toggle'),pnl=$('.ref-panel'),ov=$('.ref-overlay'),
        cls=$('.ref-close'),inp=$('.ref-search input'),list=$('.ref-list');
    if(!btn||!pnl)return;
    function open(){pnl.classList.add('open');ov.classList.add('open');setTimeout(function(){if(inp)inp.focus()},150)}
    function close(){pnl.classList.remove('open');ov.classList.remove('open')}
    btn.addEventListener('click',open);
    if(cls)cls.addEventListener('click',close);
    if(ov)ov.addEventListener('click',close);
    if(inp&&list){
      inp.addEventListener('input',function(){
        var q=this.value.toLowerCase().trim();
        $$('.ref-item',list).forEach(function(it){
          var t=(it.dataset.text||it.textContent).toLowerCase();
          it.style.display=q===''||t.indexOf(q)>=0?'':'none';
        });
        $$('.ref-group',list).forEach(function(g){
          var visible=false,n=g.nextElementSibling;
          while(n&&!n.classList.contains('ref-group')){
            if(n.classList.contains('ref-item')&&n.style.display!=='none'){visible=true;break}
            n=n.nextElementSibling;
          }
          g.style.display=visible?'':'none';
        });
      });
    }
    if(list){
      list.addEventListener('click',function(e){
        var it=e.target.closest('.ref-item');if(!it)return;
        var target=it.dataset.section;
        if(target){
          showSection(target);
          var anchor=it.dataset.anchor;
          if(anchor){
            setTimeout(function(){
              var a=document.getElementById(anchor);
              if(a){a.scrollIntoView({behavior:'smooth',block:'center'});a.classList.add('flash');setTimeout(function(){a.classList.remove('flash')},1500)}
            },350);
          }
          close();
        }
      });
    }
  }

  function initPalette(){
    var pal=$('.palette');if(!pal)return;
    var inp=$('.palette-input'),list=$('.palette-list');
    var items=[];
    $$('.nav-item[data-target]').forEach(function(b){
      var id=b.dataset.target;
      var sec=document.getElementById(id);if(!sec)return;
      var title=b.textContent.trim().replace(/^\d+\s*/,'');
      items.push({type:'section',title:title,sub:'Раздел',target:id});
      $$('h2,h3',sec).forEach(function(h){
        var hid=h.id||(h.id='hd_'+Math.random().toString(36).slice(2,8));
        items.push({type:'heading',title:h.textContent.trim(),sub:title,target:id,anchor:hid});
      });
    });
    $$('.ref-item').forEach(function(it){
      var nm=it.querySelector('.ri-name'),fm=it.querySelector('.ri-formula');
      items.push({type:'formula',title:nm?nm.textContent.trim():'',sub:fm?(fm.getAttribute('data-tex')||''):'',target:it.dataset.section,anchor:it.dataset.anchor});
    });

    function render(q){
      q=q.toLowerCase().trim();
      var filt=q===''?items.slice(0,30):items.filter(function(i){return (i.title+' '+i.sub).toLowerCase().indexOf(q)>=0}).slice(0,40);
      if(filt.length===0){list.innerHTML='<div class="palette-empty">Ничего не найдено</div>';return}
      list.innerHTML=filt.map(function(i,idx){
        var ic=i.type==='section'?'§':i.type==='heading'?'¶':'ƒ';
        return '<div class="palette-item'+(idx===0?' sel':'')+'" data-target="'+(i.target||'')+'" data-anchor="'+(i.anchor||'')+'">'+
          '<div class="pi-icon">'+ic+'</div>'+
          '<div class="pi-text"><div class="pi-title">'+escapeHtml(i.title)+'</div>'+
          '<div class="pi-sub">'+escapeHtml(i.sub)+'</div></div></div>';
      }).join('');
    }
    function escapeHtml(s){return (s||'').replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]})}
    function open(){pal.classList.add('open');render('');inp.value='';setTimeout(function(){inp.focus()},10)}
    function close(){pal.classList.remove('open')}

    var openBtn=$('#openSearch');
    if(openBtn)openBtn.addEventListener('click',open);

    document.addEventListener('keydown',function(e){
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open()}
      if(e.key==='Escape'&&pal.classList.contains('open')){close()}
      if(pal.classList.contains('open')&&(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='Enter')){
        e.preventDefault();
        var sel=$('.palette-item.sel'),all=$$('.palette-item');
        if(!all.length)return;
        var idx=all.indexOf(sel);
        if(e.key==='ArrowDown')idx=Math.min(all.length-1,idx+1);
        if(e.key==='ArrowUp')idx=Math.max(0,idx-1);
        if(e.key==='Enter'&&sel){
          var t=sel.dataset.target,a=sel.dataset.anchor;
          if(t){showSection(t);if(a){setTimeout(function(){var el=document.getElementById(a);if(el)el.scrollIntoView({behavior:'smooth',block:'center'})},300)}}
          close();return;
        }
        all.forEach(function(it){it.classList.remove('sel')});
        all[idx].classList.add('sel');
        all[idx].scrollIntoView({block:'nearest'});
      }
    });
    inp.addEventListener('input',function(){render(this.value)});
    pal.addEventListener('click',function(e){
      if(e.target===pal){close();return}
      var it=e.target.closest('.palette-item');if(!it)return;
      var t=it.dataset.target,a=it.dataset.anchor;
      if(t){showSection(t);if(a){setTimeout(function(){var el=document.getElementById(a);if(el)el.scrollIntoView({behavior:'smooth',block:'center'})},300)}}
      close();
    });
  }

  function initMobile(){
    var t=$('.mob-toggle'),sb=$('.sidebar'),ov=$('.sidebar-overlay');
    if(!t)return;
    t.addEventListener('click',function(){sb.classList.toggle('open');if(ov)ov.classList.toggle('open')});
    if(ov)ov.addEventListener('click',function(){sb.classList.remove('open');ov.classList.remove('open')});
  }

  function initNav(){
    $$('.nav-item[data-target]').forEach(function(b){
      b.addEventListener('click',function(){showSection(b.dataset.target)});
    });
  }

  document.addEventListener('DOMContentLoaded',function(){
    var topic=document.body.dataset.topic;
    if(topic)setTopicTheme(topic);
    initNav();
    initRefPanel();
    initPalette();
    initMobile();
    renderMath();
    var h=location.hash.slice(1);
    var first=$('.nav-item[data-target]');
    if(h&&document.getElementById(h)){showSection(h)}
    else if(first){showSection(first.dataset.target)}
  });

  window.MathCT={showSection:showSection,renderMath:renderMath,setTopicTheme:setTopicTheme};
})();
