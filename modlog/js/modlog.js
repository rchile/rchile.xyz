(function(d, w) {
  'use strict';
  let allowLoad = true;
  let timeagoIns = timeago();

  let app = new Vue({
    el: '#app',
    data: {
      loading: true,
      error: false,
      logEntries: [],
      selectedEntry: null,
      details: function(action) {
        app.selectedEntry = action;
        M.Modal.getInstance(d.querySelector('#entry-modal')).open();
      },
      md: function (value) {
        return md.render(value);
      },
      dateISOUTC: function(date) {
        let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        return (new Date(date*1000 - tzoffset)).toISOString().slice(0, -1);
      },
      modURL: function(user) {
        return 'https://reddit.com/user/' + user;
      },
      targetPermalink: function(entry) {
        return 'https://reddit.com' + entry.target_permalink;
      }
    },
    filters: {
      timeago: function (value) {
        return timeagoIns.format(value.entry.created_utc*1000, 'es');
      },
      md: function (value) {
        return md.render(value);
      }
    },
    updated: function(){ this.$nextTick(() => {
      M.Collapsible.init(d.querySelectorAll('.collapsible'));
    })},
    mounted: function () {
      d.querySelector("#app").style.visibility = 'visible';
      M.Modal.init(d.querySelectorAll('.modal'));
    }
  });

  function loadEntries(after) {
    let endpoint = 'https://modlog3.rchile.xyz/entries';
    if (after) {
      endpoint += '/after/' + after;
    }

    app.loading = true;
    allowLoad = false;
    axios.get(endpoint, {}).then(resp => {
      app.loading = false;
      allowLoad = true;

      let result = ModAction.filterEntries(resp.data);
      app.logEntries = app.logEntries.concat(result);
    }).catch(function(error) {
      app.loading = false;
      app.error = true;
      console.error(error);
    });
  }

  // Load more entries when the bottom is reached
  w.addScrollListener(scrollY => {
    let nLogEntries = app.logEntries.length;

    // Don't load entries if it's already loading, when no entries
    // where loaded (because something happened), or the app locked
    // loading entries
    if (app.loading || nLogEntries === 0 || !allowLoad) {
      return;
    }

    // Point where the entries load is triggered
    let trigger = (scrollY + (w.innerHeight * 1.7)) > docHeight();
    if (trigger && nLogEntries > 0) {
      // Load entries after the last loaded entry
      loadEntries(app.logEntries[nLogEntries - 1].entry.id);
    }
  });

  loadEntries();
})(document, window);
