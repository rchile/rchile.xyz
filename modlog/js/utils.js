// https://stackoverflow.com/a/822486
function strip(html) {
  var tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// https://stackoverflow.com/a/1147768
function docHeight() {
  let body = document.body,
      html = document.documentElement;

  return Math.max( body.scrollHeight, body.offsetHeight, 
                   html.clientHeight, html.scrollHeight, html.offsetHeight );
}

(function(w) {
  let lastScroll = 0;
  let ticking = false;
  let onScrollCallbacks = [];

  w.addEventListener('scroll', function(e) {
    lastScroll = w.scrollY;
    if (!ticking) {
      w.requestAnimationFrame(function() {
        onScrollCallbacks.forEach(x => x(lastScroll));
        ticking = false;
      });
    }
    ticking = true;
  });

  w.addScrollListener = function(f) {
    onScrollCallbacks.push(f);
    return f;
  };
})(window);
