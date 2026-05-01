document.querySelectorAll('.menu-element').forEach(li=>{
  li.addEventListener('click',()=>{
    document.querySelectorAll('.menu-element').forEach(l=>{
      l.classList.remove('active')
    })
    
    li.classList.add('active')
  })
})