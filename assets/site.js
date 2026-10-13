(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('#year').textContent = new Date().getFullYear();
  const toggle = $('.menu-toggle');
  const nav = $('.navigation');
  function closeMenu(){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');document.body.classList.remove('menu-open');}
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
  $$('.navigation a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  window.addEventListener('resize',()=>{if(window.innerWidth>850)closeMenu();},{passive:true});
  if('IntersectionObserver' in window){
    if(!reduced){document.documentElement.classList.add('motion-enabled');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('shown');observer.unobserve(entry.target);}}),{threshold:.07});$$('.reveal').forEach(el=>observer.observe(el));}
    const links=$$('.navigation a[href^="#"]');const sections=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)links.forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}),{rootMargin:'-15% 0px -60% 0px'});$$('main section[id]').forEach(el=>sections.observe(el));
  }
  $$('[data-service]').forEach(link=>link.addEventListener('click',()=>{$('#reason').value=link.dataset.service;}));
  $$('[data-dialog]').forEach(button=>button.addEventListener('click',()=>{const d=document.getElementById(button.dataset.dialog);if(typeof d.showModal==='function'){d.showModal();document.body.classList.add('modal-open');}else d.setAttribute('open','');}));
  $$('.modal').forEach(dialog=>{dialog.querySelector('.modal-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});});
      const form=$('#contact-form');const button=$('#submit-button');const status=$('#form-status');const label=$('.submit-label');
      function setStatus(message,type){status.textContent=message;status.className='form-status visible '+type;}
      form.addEventListener('submit',async event=>{
        if(!window.fetch||!window.AbortController)return;
        event.preventDefault();if(button.disabled||!form.reportValidity())return;
        if($('#website').value)return;
        const name=$('#name');const message=$('#message');
        name.setCustomValidity(name.value.trim()?'':'Please enter your name.');message.setCustomValidity(message.value.trim().length>=10?'':'Please tell us a little more (at least 10 characters).');
        if(!form.reportValidity())return;
        const payload=Object.fromEntries(new FormData(form).entries());payload.name=payload.name.trim();payload.message=payload.message.trim();payload._replyto=payload.email;payload._url=window.location.href.split('#')[0];
        button.disabled=true;button.classList.add('is-submitting');label.textContent='Sending your message…';form.setAttribute('aria-busy','true');setStatus('Sending…','pending');
        const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),20000);
        try{
          const response=await fetch('https://formsubmit.co/ajax/kevinpenadelacruz@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
          const result=await response.json();if(!response.ok||!(result.success===true||result.success==='true'))throw new Error('Submission was not accepted.');
          setStatus('Your inquiry has been submitted. We’ll respond using the contact details you provided.','success');form.reset();label.textContent='Send another inquiry';
        }catch(error){
          const message=error.name==='AbortError'?'The connection timed out. Your message may have gone through; please wait before trying again.':'We couldn’t confirm your submission. Your details are still here. Please try again in a moment.';
          setStatus(message,'error');label.textContent='Try again';
        }finally{window.clearTimeout(timeout);button.disabled=false;button.classList.remove('is-submitting');form.removeAttribute('aria-busy');}
      });
      ['name','message'].forEach(id=>document.getElementById(id).addEventListener('input',event=>event.target.setCustomValidity('')));
})();
