function toggleNav() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}

document.querySelectorAll('.nav-element-head').forEach(n=>{
  n.addEventListener('click', ()=>{
    isActive = n.classList.contains("nes")
    navBod = n.parentElement.children[1]
    console.log(navBod.children.length)
    document.querySelectorAll('.nav-element-head').forEach(nn=>{
      nn.classList.remove("nes")
      nn.parentElement.children[1].style.height = `0`
      nn.parentElement.children[1].style.visibility = `hidden`
      nn.parentElement.children[1].style.padding = `0`
    })
    if(isActive){
      navBod.style.height = `0`
    }else{
      n.classList.add('nes')
      navBod.style.visibility = "visible"
      navBod.style.padding = "0.5em 0.325em 0.325em 1em"
      setTimeout(() => {
        navBod.style.height = `calc(${navBod.children.length} * 2em)`
      }, 10);
    }
  })
})