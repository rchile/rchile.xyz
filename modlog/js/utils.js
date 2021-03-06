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

/**
 * Filter and parse modlog entries to shape them better to the app.
 * It can create virtual action types (non standard) to simplify
 * application logic.
 * @param  {array} entries Entries fetched from the API.
 * @return {array}         Filtered entries.
 */
function filterEntries(entries) {
  let twoTypesList = ['distinguish', 'sticky', 'unsticky', 'stickydistinguish',
                      'spamlink', 'unignorereports', 'ignorereports'];
  let autoTypesList = ['removelink'];

  return entries.reduce((final, curr) => {
    let nEntries = final.length;
    if (nEntries > 0) {
      // Join sticky and distinguish entries
      let last = final[nEntries-1].entry;
      if (last.mod == curr.mod && last.target_fullname == curr.target_fullname && 
          ((last.action.startsWith('distinguish') && curr.action.startsWith('sticky')) || 
            (last.action.startsWith('sticky') && curr.action.startsWith('distinguish'))
          )) {
        last.action = 'stickydistinguish';
        last.action += !!last.target_title ? 'post' : 'comment';
        final[nEntries-1] = new ModAction(last);
        return final;
      }
    }

    // Distinguish between actions made with posts and comments
    if (twoTypesList.indexOf(curr.action) > -1) {
      curr.action += !!curr.target_title ? 'post' : 'comment';
    }

    // Distinguish AutoModerator actions
    if (autoTypesList.indexOf(curr.action) > -1 && curr.mod === 'AutoModerator') {
      curr.action += 'auto';
    }

    // Special action type for end of temporal ban
    if (curr.action === 'unbanuser' && curr.description === 'was temporary') {
      curr.action = 'tempbanend';
    }

    // Special action type for permanent ban
    if (curr.action === 'banuser' && curr.details === 'permanent') {
      curr.action = 'permabanuser';
    }

    final.push(new ModAction(curr));
    return final;
  }, []);
}

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
})(window);
