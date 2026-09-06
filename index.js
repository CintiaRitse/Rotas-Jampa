"use strict";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");

if(menuButton && navigation){
  menuButton.addEventListener("click",()=>{
    const open=navigation.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded",String(open));
  });

  navigation.addEventListener("click",event=>{
    if(event.target.closest("a")){
      navigation.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded","false");
    }
  });
}

const routeItems=document.querySelectorAll(".route-item");
const routeImage=document.querySelector("#route-image");
const routeTitle=document.querySelector("#route-title");
const routeText=document.querySelector("#route-text");

routeItems.forEach(item=>{
  item.addEventListener("click",()=>{
    routeItems.forEach(button=>button.classList.remove("active"));
    item.classList.add("active");

    routeImage.src=item.dataset.image;
    routeImage.alt=item.dataset.title;
    routeTitle.textContent=item.dataset.title;
    routeText.textContent=item.dataset.text;
  });
});