(function(){
  var nav=document.getElementById('nav');
  if(nav){
    var solid=function(){nav.classList.toggle('solid',window.scrollY>40||nav.classList.contains('open')||document.body.classList.contains('light-top'))};
    window.addEventListener('scroll',solid);solid();
    var btn=nav.querySelector('.menu');
    if(btn){btn.addEventListener('click',function(){var o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o?'true':'false');solid();});}
    nav.querySelectorAll('.drawer a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');solid();});});
  }
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in');});
  }
})();
