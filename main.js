// ==========================================================================
// PIXELSQUAD — shared interactions
// ==========================================================================
(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------- NAV: scroll state + mobile menu ---------------- */
  var nav = document.querySelector('.nav');
  var onScroll = function(){
    if(!nav) return;
    if(window.scrollY > 40){ nav.classList.add('scrolled'); }
    else { nav.classList.remove('scrolled'); }
  };
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  var burger = document.querySelector('.nav-burger');
  var mobileMenu = document.querySelector('.mobile-menu');
  if(burger && mobileMenu){
    burger.addEventListener('click', function(){
      var open = mobileMenu.classList.toggle('open');
      burger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        mobileMenu.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* mark active nav link */
  var here = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function(a){
    var href = a.getAttribute('href');
    if(href === here || (here === '' && href === 'index.html')){ a.classList.add('active'); }
  });

  /* ---------------- CUSTOM CURSOR (desktop only) ---------------- */
  if(isFinePointer && !reduceMotion){
    document.body.classList.add('has-cursor');
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.innerHTML = '<span></span>';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx=0, my=0, rx=0, ry=0;
    window.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate('+mx+'px,'+my+'px) translate(-50%,-50%)';
    });
    (function loop(){
      rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
      ring.style.transform = 'translate('+rx+'px,'+ry+'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll('a, button').forEach(function(el){
      el.addEventListener('mouseenter', function(){ ring.classList.add('grow'); });
      el.addEventListener('mouseleave', function(){ ring.classList.remove('grow','view'); ring.querySelector('span').textContent=''; });
    });
    document.querySelectorAll('[data-cursor="view"]').forEach(function(el){
      el.addEventListener('mouseenter', function(){ ring.classList.add('grow','view'); ring.querySelector('span').textContent = el.getAttribute('data-cursor-label') || 'View'; });
    });
  }

  /* ---------------- SCROLL REVEALS ---------------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-scale, .reveal-fade, .pixel-reveal, .tl-item');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {threshold: 0.16, rootMargin: '0px 0px -8% 0px'});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* stagger index for grid children */
  document.querySelectorAll('.stagger').forEach(function(group){
    Array.prototype.forEach.call(group.children, function(child, i){
      child.style.setProperty('--i', i);
    });
  });

  /* ---------------- PIXEL-DISSOLVE GRID BUILDER ---------------- */
  document.querySelectorAll('.pixel-reveal').forEach(function(el){
    var cols = parseInt(el.getAttribute('data-cols') || '8', 10);
    var rows = parseInt(el.getAttribute('data-rows') || '6', 10);
    var grid = document.createElement('div');
    grid.className = 'pixel-grid';
    grid.style.gridTemplateColumns = 'repeat('+cols+', 1fr)';
    grid.style.gridTemplateRows = 'repeat('+rows+', 1fr)';
    var total = cols*rows;
    for(var i=0;i<total;i++){
      var s = document.createElement('i');
      var r = Math.floor(i/cols), c = i % cols;
      var delay = (r+c) * 22 + Math.random()*40;
      s.style.setProperty('--d', delay.toFixed(0));
      grid.appendChild(s);
    }
    el.appendChild(grid);
  });

  /* ---------------- AMBIENT BG GLOW PARALLAX (decorative only) ---------------- */
  if(!reduceMotion){
    var glows = document.querySelectorAll('.bg-glow span, .pixel-field i');
    window.addEventListener('scroll', function(){
      var y = window.scrollY;
      glows.forEach(function(g, i){
        var speed = 0.02 + (i % 3) * 0.015;
        g.style.transform = 'translateY(' + (y*speed) + 'px)';
      });
    }, {passive:true});
  }

  /* ---------------- HERO LOAD ---------------- */
  window.addEventListener('load', function(){
    var hero = document.querySelector('.hero');
    if(hero){ setTimeout(function(){ hero.classList.add('loaded'); }, 120); }
  });

  /* ---------------- STAT COUNTERS ---------------- */
  document.querySelectorAll('[data-count]').forEach(function(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var started = false;
    var run = function(){
      if(started) return; started = true;
      if(reduceMotion){ el.textContent = target; return; }
      var start = null, dur = 1400;
      function step(ts){
        if(!start) start = ts;
        var p = Math.min((ts-start)/dur, 1);
        var eased = 1 - Math.pow(1-p, 3);
        el.textContent = Math.round(target*eased);
        if(p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    if('IntersectionObserver' in window){
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ run(); obs.disconnect(); } });
      }, {threshold:0.5});
      obs.observe(el);
    } else { run(); }
  });

  /* ---------------- SERVICES ACCORDION ---------------- */
  document.querySelectorAll('.service-row').forEach(function(row){
    row.addEventListener('click', function(){
      var wasOpen = row.classList.contains('open');
      document.querySelectorAll('.service-row.open').forEach(function(r){ r.classList.remove('open'); });
      if(!wasOpen){ row.classList.add('open'); }
    });
  });

  /* ---------------- PORTFOLIO FILTER ---------------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var masItems = document.querySelectorAll('.mas-item');
  if(filterBtns.length){
    filterBtns.forEach(function(btn){
      btn.addEventListener('click', function(){
        filterBtns.forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        var f = btn.getAttribute('data-filter');
        masItems.forEach(function(item){
          var cat = item.getAttribute('data-category');
          var show = (f === 'all' || cat === f);
          item.classList.toggle('hidden-item', !show);
        });
      });
    });
  }

  /* ---------------- SCROLL PROGRESS BAR ---------------- */
  var progressBar = document.querySelector('.scroll-progress');
  if(progressBar){
    var updateProgress = function(){
      var h = document.documentElement;
      var scrolled = h.scrollTop || document.body.scrollTop;
      var max = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
      var pct = max > 0 ? scrolled / max : 0;
      progressBar.style.transform = 'scaleX(' + pct + ')';
    };
    document.addEventListener('scroll', updateProgress, {passive:true});
    updateProgress();
  }

  /* ---------------- BACK TO TOP ---------------- */
  var backToTop = document.querySelector('.back-to-top');
  if(backToTop){
    document.addEventListener('scroll', function(){
      backToTop.classList.toggle('show', window.scrollY > 600);
    }, {passive:true});
    backToTop.addEventListener('click', function(){
      window.scrollTo({top:0, behavior: reduceMotion ? 'auto' : 'smooth'});
    });
  }

  /* ---------------- PARALLAX BANNER LAYERS ---------------- */
  var parallaxLayers = document.querySelectorAll('.parallax-bg');
  if(parallaxLayers.length && !reduceMotion){
    var updateParallax = function(){
      parallaxLayers.forEach(function(layer){
        var rect = layer.parentElement.getBoundingClientRect();
        var speed = 0.18;
        var offset = (rect.top) * speed;
        layer.style.transform = 'translateY(' + offset + 'px)';
      });
    };
    document.addEventListener('scroll', updateParallax, {passive:true});
    window.addEventListener('resize', updateParallax);
    updateParallax();
  }

  /* ---------------- PROCESS LINE FILL ---------------- */
  var processLine = document.querySelector('.process-line');
  if(processLine && 'IntersectionObserver' in window){
    var procObs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add('in'); procObs.unobserve(entry.target); }
      });
    }, {threshold: 0.4});
    procObs.observe(processLine);
  } else if(processLine){
    processLine.classList.add('in');
  }

  /* ---------------- MAGNETIC BUTTONS (desktop only) ---------------- */
  if(isFinePointer && !reduceMotion){
    document.querySelectorAll('.magnetic').forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width/2;
        var y = e.clientY - rect.top - rect.height/2;
        el.style.transform = 'translate(' + (x*0.22) + 'px,' + (y*0.28) + 'px)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---------------- CONTACT FORM ---------------- */
  var form = document.querySelector('.form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var success = document.querySelector('.form-success');
      form.querySelectorAll('input,select,textarea').forEach(function(f){ f.disabled = true; });
      var submitBtn = form.querySelector('button[type="submit"]');
      if(submitBtn){ submitBtn.textContent = 'Message Sent'; }
      if(success){ success.classList.add('show'); }
    });
  }

})();
