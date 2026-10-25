/* HMH motion runtime — true-black kinetic set, ported verbatim.
   Scroll wire · warm cursor spotlight · scroll reveals · count-ups · card spotlight + micro-tilt.
   Zero animations when prefers-reduced-motion: everything forced visible, no listeners. */
(function(){
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* scroll progress wire */
  var beam = document.getElementById('beam');
  if (!rm && beam) {
    var onscroll = function(){
      var h = document.documentElement;
      var p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      beam.style.width = (p * 100).toFixed(2) + '%';
    };
    window.addEventListener('scroll', onscroll, { passive: true });
    window.addEventListener('resize', onscroll, { passive: true });
    onscroll();
  }

  /* warm cursor spotlight */
  var spot = document.getElementById('spot');
  if (!rm && spot && window.matchMedia('(pointer: fine)').matches) {
    document.body.classList.add('on');
    window.addEventListener('pointermove', function(e){
      spot.style.setProperty('--sx', e.clientX + 'px');
      spot.style.setProperty('--sy', e.clientY + 'px');
    }, { passive: true });
  }

  /* scroll reveals */
  var io = null;
  if (!rm && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: .1 });
  }
  var revealAll = function(scope){
    var els = (scope || document).querySelectorAll('.reveal:not(.in)');
    for (var i = 0; i < els.length; i++) {
      if (io) { io.observe(els[i]); } else { els[i].classList.add('in'); }
    }
  };
  revealAll(document);

  /* count-ups */
  var cio = null;
  var countAll = function(scope){
    var els = (scope || document).querySelectorAll('[data-count]');
    for (var i = 0; i < els.length; i++) { count(els[i]); }
  };
  function count(el){
    if (rm || !('IntersectionObserver' in window)) { el.textContent = el.dataset.count; return; }
    if (!cio) {
      cio = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (!e.isIntersecting) return;
          var el = e.target, end = parseInt(el.dataset.count, 10), t0 = null;
          var step = function(ts){
            if (!t0) t0 = ts;
            var p = Math.min((ts - t0) / 1100, 1);
            el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          cio.unobserve(el);
        });
      }, { threshold: .5 });
    }
    cio.observe(el);
  }
  countAll(document);

  /* card spotlight + micro tilt (fine pointers only) */
  if (!rm && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.card').forEach(function(card){
      card.addEventListener('pointermove', function(e){
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        card.style.setProperty('--ry', (((x / r.width) - .5) * 4).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (.5 - (y / r.height)) * 3 + 'deg');
      });
      card.addEventListener('pointerleave', function(){
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* re-scan for dynamically rendered rows (articles grid etc.) */
  window.HMH_MOTION = { refresh: function(){ revealAll(document); countAll(document); } };
})();
