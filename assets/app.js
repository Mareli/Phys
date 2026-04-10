/* ───────────────────────────────────────────────
   Физика ЦТ/ЦЭ — общий движок страниц теории
   ─────────────────────────────────────────────── */

(function(){
  'use strict';

  // ─── DOM helpers ─────────────────────────────
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.from((r||document).querySelectorAll(s))}

  // ─── Topic palette (CSS vars) ────────────────
  var TOPIC_COLORS={
    t01:{acc:'#3b82f6',bg:'#eff6ff',border:'#bfdbfe',dim:'#2563eb',glow:'rgba(59,130,246,.35)'},
    t02:{acc:'#6366f1',bg:'#eef2ff',border:'#c7d2fe',dim:'#4f46e5',glow:'rgba(99,102,241,.35)'},
    t03:{acc:'#0891b2',bg:'#ecfeff',border:'#a5f3fc',dim:'#0e7490',glow:'rgba(8,145,178,.35)'},
    t04:{acc:'#10b981',bg:'#ecfdf5',border:'#a7f3d0',dim:'#059669',glow:'rgba(16,185,129,.35)'},
    t05:{acc:'#f97316',bg:'#fff7ed',border:'#fed7aa',dim:'#ea580c',glow:'rgba(249,115,22,.35)'},
    t06:{acc:'#8b5cf6',bg:'#f5f3ff',border:'#ddd6fe',dim:'#7c3aed',glow:'rgba(139,92,246,.35)'},
    t07:{acc:'#eab308',bg:'#fefce8',border:'#fef08a',dim:'#ca8a04',glow:'rgba(234,179,8,.35)'},
    t08:{acc:'#ec4899',bg:'#fdf2f8',border:'#fbcfe8',dim:'#db2777',glow:'rgba(236,72,153,.35)'},
    t09:{acc:'#06b6d4',bg:'#ecfeff',border:'#a5f3fc',dim:'#0891b2',glow:'rgba(6,182,212,.35)'},
    t10:{acc:'#f59e0b',bg:'#fffbeb',border:'#fde68a',dim:'#d97706',glow:'rgba(245,158,11,.35)'},
    t11:{acc:'#d946ef',bg:'#fdf4ff',border:'#f5d0fe',dim:'#c026d3',glow:'rgba(217,70,239,.35)'}
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

  // ─── Section navigation ──────────────────────
  function showSection(id){
    var sec=document.getElementById(id);if(!sec)return;
    $$('.sec').forEach(function(s){s.classList.remove('vis')});
    sec.classList.add('vis');
    $$('.nav-item').forEach(function(b){b.classList.remove('act')});
    var btn=document.querySelector('[data-target="'+id+'"]');
    if(btn)btn.classList.add('act');
    var ct=$('.content');if(ct)ct.scrollTo({top:0,behavior:'smooth'});
    // close mobile sidebar
    var sb=$('.sidebar');if(sb)sb.classList.remove('open');
    var ov=$('.sidebar-overlay');if(ov)ov.classList.remove('open');
    // update hash
    if(history.replaceState){history.replaceState(null,'',location.pathname+'#'+id)}
  }

  // ─── KaTeX render ────────────────────────────
  function renderMath(scope){
    if(typeof katex==='undefined')return;
    scope=scope||document;
    $$('[data-tex]',scope).forEach(function(el){
      try{
        katex.render(el.getAttribute('data-tex'),el,{
          throwOnError:false,
          displayMode:el.classList.contains('formula')||el.tagName==='DIV'
        });
      }catch(e){}
    });
  }

  // ─── Build "All formulas" panel from page content ─
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

      // Section header (once per section)
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

      var nm=document.createElement('div');
      nm.className='ri-name';
      nm.textContent=name;

      var fm=document.createElement('span');
      fm.className='ri-formula';
      fm.setAttribute('data-tex',tex);

      item.appendChild(nm);
      item.appendChild(fm);
      list.appendChild(item);
    });
    renderMath(list);
  }

  // ─── Floating reference panel ────────────────
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
    // search filter
    if(inp&&list){
      inp.addEventListener('input',function(){
        var q=this.value.toLowerCase().trim();
        // show/hide individual items
        $$('.ref-item',list).forEach(function(it){
          var t=(it.dataset.text||it.textContent).toLowerCase();
          it.style.display=q===''||t.indexOf(q)>=0?'':'none';
        });
        // hide empty group headers
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
    // click ref-item → scroll to section
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
              if(a){
                a.scrollIntoView({behavior:'smooth',block:'center'});
                a.classList.add('flash');
                setTimeout(function(){a.classList.remove('flash')},1500);
              }
            },350);
          }
          close();
        }
      });
    }
  }

  // ─── Search palette (Ctrl+K) ─────────────────
  function initPalette(){
    var pal=$('.palette');if(!pal)return;
    var inp=$('.palette-input'),list=$('.palette-list');
    var items=[];
    // Build index from sections + h2/h3 in content
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
    // also reference items
    $$('.ref-item').forEach(function(it){
      var nm=it.querySelector('.ri-name'),fm=it.querySelector('.ri-formula');
      items.push({
        type:'formula',
        title:nm?nm.textContent.trim():'',
        sub:fm?(fm.getAttribute('data-tex')||''):'',
        target:it.dataset.section,anchor:it.dataset.anchor
      });
    });

    function render(q){
      q=q.toLowerCase().trim();
      var filt=q===''?items.slice(0,30):items.filter(function(i){
        return (i.title+' '+i.sub).toLowerCase().indexOf(q)>=0;
      }).slice(0,40);
      if(filt.length===0){list.innerHTML='<div class="palette-empty">Ничего не найдено</div>';return}
      list.innerHTML=filt.map(function(i,idx){
        var ic=i.type==='section'?'§':i.type==='heading'?'¶':'ƒ';
        return '<div class="palette-item'+(idx===0?' sel':'')+
          '" data-target="'+(i.target||'')+'" data-anchor="'+(i.anchor||'')+'">'+
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
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
        e.preventDefault();open();
      }
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
      if(t){
        showSection(t);
        if(a){setTimeout(function(){var el=document.getElementById(a);if(el)el.scrollIntoView({behavior:'smooth',block:'center'})},300)}
      }
      close();
    });
  }

  // ─── Mobile sidebar toggle ───────────────────
  function initMobile(){
    var t=$('.mob-toggle'),sb=$('.sidebar'),ov=$('.sidebar-overlay');
    if(!t)return;
    t.addEventListener('click',function(){
      sb.classList.toggle('open');
      if(ov)ov.classList.toggle('open');
    });
    if(ov)ov.addEventListener('click',function(){
      sb.classList.remove('open');ov.classList.remove('open');
    });
  }

  // ─── Sidebar nav click handler ───────────────
  function initNav(){
    $$('.nav-item[data-target]').forEach(function(b){
      b.addEventListener('click',function(){showSection(b.dataset.target)});
    });
  }

  // ─── Init ────────────────────────────────────
  document.addEventListener('DOMContentLoaded',function(){
    var topic=document.body.dataset.topic;
    if(topic)setTopicTheme(topic);
    initNav();
    initRefPanel();
    initPalette();
    initMobile();
    renderMath();
    // Open section from hash, or first
    var h=location.hash.slice(1);
    var first=$('.nav-item[data-target]');
    if(h&&document.getElementById(h)){showSection(h)}
    else if(first){showSection(first.dataset.target)}
  });

  // expose
  window.PhysCT={showSection:showSection,renderMath:renderMath,setTopicTheme:setTopicTheme};
})();
