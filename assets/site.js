(function(){
  var b=document.querySelector('button[aria-controls="mobile-nav"]'),n=document.getElementById('mobile-nav');
  if(b&&n){b.addEventListener('click',function(){var o=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!o));if(o){n.setAttribute('hidden','')}else{n.removeAttribute('hidden')}});}
  var f=document.querySelector('form');
  if(f){f.addEventListener('submit',function(e){e.preventDefault();
    var d=new FormData(f);if(d.get('company'))return;
    var body='שם: '+d.get('name')+'\nטלפון: '+d.get('phone')+'\nאימייל: '+d.get('email')+'\n\n'+d.get('message');
    var st=f.querySelector('[role=status]');if(st)st.textContent='פותחים את תוכנת המייל שלך כדי לשלוח את ההודעה...';
    window.location.href='mailto:chukukids@gmail.com?subject='+encodeURIComponent('הודעה מהאתר - '+d.get('name'))+'&body='+encodeURIComponent(body);
  });}
})();
