/**
 * Strips HTML tags from a string.
 * https://stackoverflow.com/a/822486
 * @return {number} The string without HTML tags.
 */
function strip(html) {
  var tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

/**
 * Get real document height.
 * https://stackoverflow.com/a/1147768
 * @return {number} The document height in pixels.
 */
function docHeight() {
  let body = document.body,
      html = document.documentElement;

  return Math.max( body.scrollHeight, body.offsetHeight, 
                   html.clientHeight, html.scrollHeight, html.offsetHeight );
}

/**
 * Replaces placeholders in a string.
 * https://stackoverflow.com/a/18234317
 * @return {string} The formatted string.
 */
String.prototype.format = function () {
    'use strict';
    var str = this.toString();
    if (arguments.length) {
        var t = typeof arguments[0];
        var key;
        var args = ('string' === t || 'number' === t) ?
            Array.prototype.slice.call(arguments)
            : arguments[0];

        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};

// Implements performance-aware onscroll event
(function(w) {
  let lastScroll = 0;
  let ticking = false;
  let callbacks = [];

  w.addEventListener('scroll', function(e) {
    lastScroll = w.scrollY;
    if (!ticking) {
      w.requestAnimationFrame(function() {
        callbacks.forEach(x => x(lastScroll));
        ticking = false;
      });
    }
    ticking = true;
  });

  w.addScrollListener = function(f) {
    callbacks.push(f);
    return f;
  };
})(window);
