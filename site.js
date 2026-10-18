(function(){
"use strict";
var root = document.documentElement, body = document.body;
var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
var G = (typeof window.gsap !== "undefined" && !reduce) ? window.gsap : null;
if(G){ root.classList.add("has-gsap"); if(window.ScrollTrigger) G.registerPlugin(ScrollTrigger); }
function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

/* ---------- theme ---------- */
function isDark(){ return (getComputedStyle(root).colorScheme || "").indexOf("dark") >= 0; }
$$("[data-theme-toggle]").forEach(function(b){
  b.addEventListener("click", function(){
    var m = isDark() ? "light" : "dark";
    root.classList.remove("force-light", "force-dark"); root.classList.add("force-" + m);
    try{ localStorage.setItem("krexza-theme", m); }catch(e){}
  });
});

/* ---------- header: solid on scroll, hides when scrolling down ---------- */
var hdr = $("#hdr"), lastY = window.scrollY, fab = $(".fab");
function onScroll(){
  var y = window.scrollY;
  if(hdr){
    hdr.classList.toggle("solid", y > 10);
    if(!body.classList.contains("menu-open")) hdr.classList.toggle("away", y > 260 && y > lastY + 2);
    if(y < lastY - 2) hdr.classList.remove("away");
  }
  if(fab) fab.classList.toggle("off", y < 320);
  lastY = y;
}
window.addEventListener("scroll", onScroll, {passive:true}); onScroll();

/* ---------- mobile menu ---------- */
var burger = $(".burger"), mnav = $("#mnav");
function menu(open){
  body.classList.toggle("menu-open", open);
  burger.setAttribute("aria-expanded", String(open)); burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  if(open && G){
    G.fromTo($$(".m-link span", mnav), {yPercent:110}, {yPercent:0, duration:.8, stagger:.06, ease:"expo.out"});
    G.fromTo($$(".m-cta, .m-note", mnav), {y:16, opacity:0}, {y:0, opacity:1, duration:.6, delay:.3, stagger:.08, ease:"power3.out"});
  }
}
if(burger && mnav){
  burger.addEventListener("click", function(){ menu(!body.classList.contains("menu-open")); });
  mnav.addEventListener("click", function(e){ if(e.target.closest("a")) menu(false); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && body.classList.contains("menu-open")){ menu(false); burger.focus(); } });
  window.addEventListener("resize", function(){ if(window.innerWidth > 900 && body.classList.contains("menu-open")) menu(false); });
}

/* ---------- tools filter (supports tools.html#student) ---------- */
var chips = $("#chips");
if(chips){
  var cards = $$("#grid .pcard"), keys = $$(".chip", chips).map(function(c){ return c.getAttribute("data-k"); });
  var apply = function(k, animate){
    $$(".chip", chips).forEach(function(c){ c.setAttribute("aria-pressed", String(c.getAttribute("data-k") === k)); });
    var shown = cards.filter(function(c){ var on = k === "all" || c.getAttribute("data-who").split(" ").indexOf(k) >= 0; c.hidden = !on; return on; });
    $("#empty").hidden = shown.length > 0;
    if(animate && G) G.fromTo(shown, {y:30, opacity:0}, {y:0, opacity:1, duration:.7, stagger:.07, ease:"power3.out", overwrite:true});
    if(window.ScrollTrigger) ScrollTrigger.refresh();
  };
  chips.addEventListener("click", function(e){
    var b = e.target.closest(".chip"); if(!b) return; var k = b.getAttribute("data-k");
    apply(k, true); try{ history.replaceState(null, "", k === "all" ? location.pathname : "#" + k); }catch(err){}
  });
  var h = (location.hash || "").slice(1); apply(keys.indexOf(h) >= 0 ? h : "all", false);
}

/* ---------- FAQ: smooth open/close ---------- */
$$(".qa").forEach(function(d){
  var sum = $("summary", d), ans = $(".qa-a", d);
  sum.addEventListener("click", function(e){
    if(!G) return; e.preventDefault();
    if(d.open){ G.to(ans, {height:0, duration:.45, ease:"power3.inOut", onComplete:function(){ d.open = false; ans.style.height = ""; }}); }
    else { d.open = true; G.fromTo(ans, {height:0}, {height:ans.scrollHeight, duration:.55, ease:"power3.out", onComplete:function(){ ans.style.height = ""; }}); }
  });
});

if(!G) return;

/* ---------- intro: lines rise, fades, logo draws ---------- */
var tl = G.timeline({defaults:{ease:"expo.out"}});
var firstLines = $$("main > section:first-child [data-lines] .ln > span");
var firstFades = $$("main > section:first-child [data-fade]");
tl.from(firstFades.slice(0, 1).concat($$(".crumbs")), {y:14, opacity:0, duration:.8}, 0)
  .from(firstLines, {yPercent:112, duration:1.2, stagger:.09}, .1)
  .from(firstFades.slice(1), {y:22, opacity:0, duration:.9, stagger:.1, ease:"power3.out"}, .45);
$$(".hero-mark .draw").forEach(function(el, i){
  var len = el.getTotalLength ? el.getTotalLength() : 2400;
  G.fromTo(el, {strokeDasharray:len, strokeDashoffset:len}, {strokeDashoffset:0, duration:i < 2 ? 2.2 : 1.1, delay:i < 2 ? .2 + i * .25 : 1.3 + (i - 2) * .15, ease:"power2.inOut", clearProps:"strokeDasharray,strokeDashoffset"});
});
var floats = $$(".hero .float");
if(floats.length){
  tl.from(floats, {y:80, opacity:0, duration:1.4, stagger:.18, ease:"expo.out"}, .9);
  floats.forEach(function(f, i){ G.to(f, {y:i ? 12 : -12, duration:3.6 + i, repeat:-1, yoyo:true, ease:"sine.inOut", delay:2.3}); });
}
G.from(".hdr-in > *", {y:-12, opacity:0, duration:.8, stagger:.08, ease:"power3.out"});

/* ---------- marquee ---------- */
var track = $(".mq-track");
if(track){
  var loop = G.to(track, {xPercent:-50, duration:40, ease:"none", repeat:-1});
  if(window.ScrollTrigger) ScrollTrigger.create({trigger:".marquee", start:"top bottom", end:"bottom top", onUpdate:function(s){ G.to(loop, {timeScale:1 + Math.min(Math.abs(s.getVelocity()) / 600, 3), duration:.2, overwrite:true}); G.to(loop, {timeScale:1, duration:1.2, delay:.25, overwrite:false}); }});
}

if(!window.ScrollTrigger) return;

/* ---------- scroll reveals ---------- */
$$("[data-lines]").forEach(function(h){
  if(h.closest("main > section:first-child")) return;
  G.from($$(".ln > span", h), {yPercent:112, duration:1.1, stagger:.08, ease:"expo.out", scrollTrigger:{trigger:h, start:"top 88%", once:true}});
});
$$("[data-fade]").forEach(function(el){
  if(el.closest("main > section:first-child")) return;
  G.from(el, {y:18, opacity:0, duration:.9, ease:"power3.out", scrollTrigger:{trigger:el, start:"top 90%", once:true}});
});
var rev = $$("[data-reveal]").filter(function(el){ return !el.hidden && !el.closest("main > section:first-child"); });
G.set(rev, {y:40, opacity:0});
ScrollTrigger.batch(rev, {start:"top 90%", once:true, onEnter:function(b){ G.to(b, {y:0, opacity:1, duration:1, stagger:.09, ease:"power3.out", overwrite:true}); }});
$$(".pr-line").forEach(function(l){ G.from(l, {scaleX:0, transformOrigin:"left", duration:1.2, ease:"expo.out", scrollTrigger:{trigger:l, start:"top 90%", once:true}}); });

/* counters */
$$("[data-count]").forEach(function(el){
  var end = +el.getAttribute("data-count"), o = {v:end === 0 ? 9 : 0};
  ScrollTrigger.create({trigger:el, start:"top 90%", once:true, onEnter:function(){
    G.to(o, {v:end, duration:end === 0 ? 1.4 : 1.6, ease:"power3.out", onUpdate:function(){ el.textContent = Math.round(o.v); }});
  }});
});

/* parallax images */
$$("[data-parallax]").forEach(function(img){ G.fromTo(img, {yPercent:-4}, {yPercent:4, ease:"none", scrollTrigger:{trigger:img.parentNode, start:"top bottom", end:"bottom top", scrub:true}}); });
var art = $(".hero-art");
if(art) G.to(art, {yPercent:-10, ease:"none", scrollTrigger:{trigger:".hero", start:"top top", end:"bottom top", scrub:true}});
var qm = $(".q-mark");
if(qm) G.fromTo(qm, {rotation:-8}, {rotation:8, ease:"none", scrollTrigger:{trigger:".quote-sec", start:"top bottom", end:"bottom top", scrub:true}});
G.from(".ftr-word", {yPercent:40, opacity:0, duration:1.4, ease:"expo.out", scrollTrigger:{trigger:".ftr-word", start:"top 95%", once:true}});
window.addEventListener("load", function(){ ScrollTrigger.refresh(); });

/* ---------- desktop-only: image follows cursor on "worlds", magnetic buttons ---------- */
if(fine){
  var follow = $(".follow");
  if(follow){
    var fimg = $("img", follow), fx = G.quickTo(follow, "x", {duration:.6, ease:"power3"}), fy = G.quickTo(follow, "y", {duration:.6, ease:"power3"});
    G.set(follow, {xPercent:-50, yPercent:-50});
    $$(".world").forEach(function(w){
      w.addEventListener("mouseenter", function(){ fimg.src = w.getAttribute("data-img"); G.to(follow, {opacity:1, scale:1, duration:.45, ease:"power3.out"}); });
      w.addEventListener("mouseleave", function(){ G.to(follow, {opacity:0, scale:.85, duration:.35, ease:"power3.out"}); });
      w.addEventListener("mousemove", function(e){ fx(e.clientX + 40); fy(e.clientY); });
    });
  }
  $$(".magnetic").forEach(function(m){
    var mx = G.quickTo(m, "x", {duration:.5, ease:"power3"}), my = G.quickTo(m, "y", {duration:.5, ease:"power3"});
    m.addEventListener("mousemove", function(e){ var r = m.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .25); my((e.clientY - r.top - r.height / 2) * .35); });
    m.addEventListener("mouseleave", function(){ mx(0); my(0); });
  });
}
})();
