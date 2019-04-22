(function(d, w) {
  'use strict';
  let allowLoad = true;
  let timeagoIns = timeago();
  //let API = 'https://modlog.rchile.xyz';
  let API = 'http://127.0.0.1:5000';

  let app = new Vue({
    el: '#app',
    data: {
      api: API,
      error: false,
      loading: true,
      logEntries: [],
      selectedLoading: false,
      selectedEntry: null,
      user: null,
      details: function(action) {
        w.location.hash = action.entry.id;
        app.selectedEntry = action;

        let modal = M.Modal.getInstance(d.querySelector('#entry-modal'));
        if (!modal.isOpen)
          modal.open();
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
      },
      capitalize: function(value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
      }
    },
    updated: function(){ this.$nextTick(() => {
      M.Collapsible.init(d.querySelectorAll('.collapsible'));
    })},
    mounted: function () {
      d.querySelector("#app").style.visibility = 'visible';
      M.Modal.init(d.querySelectorAll('.modal'));

      M.Modal.getInstance(d.querySelector('#entry-modal')).options.onCloseStart = function() {
        history.pushState("", d.title, w.location.pathname + w.location.search);
      };

      checkSession().then(resp => {
        if (resp.data.logged) {
          app.user = resp.data.username;
        }
      });
    }
  });

  function loadEntries(after) {
    let endpoint = API + '/entries';
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

      if (!w.location.hash !== '') {
        loadHashEntry();
      }
    }).catch(function(error) {
      app.loading = false;
      app.error = true;
      console.error(error);
    });
  }

  function loadHashEntry() {
    let hashId = w.location.hash.substr(1);
    if (!isModEntryId(hashId)) {
      return;
    }

    let selected = app.logEntries.find(x => x.entry.id === hashId);
    if (!selected) {
      app.selectedLoading = true;
      axios.get(API + '/entry/' + hashId).then(function(data) {
        app.selectedLoading = false;
        openHashEntry(new ModAction(data.data));
      });
    } else {
      openHashEntry(selected)
    }
  }

  function openHashEntry(entry) {
    let modal = M.Modal.getInstance(d.querySelector('#entry-modal'));
    if (!modal.isOpen && !app.selectedEntry || entry.entry.id !== app.selectedEntry.entry.id) {
      app.selectedEntry = entry;
      modal.open();
    }
  }

  function checkSession() {
    return axios.get(API + '/session', {withCredentials: true});
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
