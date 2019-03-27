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

const patModEntryId = /^ModAction_?[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
/**
 * Verifies if a string is a valid ModAction ID
 * @return {boolean} The result of the verification.
 */
function isModEntryId(id) {
  return patModEntryId.test(id);
}

/**
 * Replaces placeholders in a string.
 * https://stackoverflow.com/a/18234317
 * @return {string} The formatted string.
 */
String.prototype.format = function () {
    'use strict';
    let str = this.toString();
    if (arguments.length) {
        let t = typeof arguments[0];
        let key;
        let args = ('string' === t || 'number' === t) ?
            Array.prototype.slice.call(arguments)
            : arguments[0];

        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};
(function(w) {
  // Create a markdown-it instance and make it to add 'target="_blank"' to every link
  // https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
  let md = markdownit();
  let defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    // If you are sure other plugins can't add `target` - drop check below
    let aIndex = tokens[idx].attrIndex('target');

    if (aIndex < 0) {
      tokens[idx].attrPush(['target', '_blank']); // add new attribute
    } else {
      tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
    }

    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self);
  };

  w.md = md;

  // Implements performance-aware onscroll event
  // https://developer.mozilla.org/en-US/docs/Web/Events/scroll
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
