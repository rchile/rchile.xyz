(function(d, w) {
  'use strict';
  let allowLoad = true;
  let timeagoIns = timeago();
  let baseURL = 'https://modlog.rchile.xyz';
  let api = axios.create({ baseURL: baseURL });

  let app = new Vue({
    el: '#app',
    data: {
      api: baseURL,
      error: false,
      loading: true,
      logEntries: [],
      selectedLoading: false,
      selectedEntry: null,
      user: null,
      savingNotes: false,
      writingNotes: '',
      details: function(action) {
        w.location.hash = action.entry.id;
        app.selectedEntry = action;
        app.writingNotes = action.entry.notes || '';

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
      },
      rawEntry: function(entry) {
        let data = JSON.stringify(app.selectedEntry.entry, null, 2);
        console.log('Datos de la acción:', JSON.parse(data))
        alert("Datos en bruto de la acción:\n\n" + data);
      },
      saveNotes: function() {
        if (app.savingNotes) {
          return;
        }

        let action = app.selectedEntry;
        let data = {notes: app.writingNotes, entry_id: action.entry.id};

        app.savingNotes = true;
        api.post('/entry_notes', data, {withCredentials: true}).then(resp => {
          console.log(resp);
          app.savingNotes = false;
          app.selectedEntry.entry.notes = app.writingNotes;
        }).catch(err => {
          app.savingNotes = false;
          console.log(err);
        });
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

      api.get('/session', {withCredentials: true}).then(resp => {
        if (resp.data.logged) {
          app.user = resp.data.username;
        }
      });
    }
  });

  function loadEntries(after) {
    let endpoint = '/entries' + (after ? '/after/' + after : '');

    app.loading = true;
    allowLoad = false;

    api.get(endpoint).then(resp => {
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
      api.get('/entry/' + hashId).then(function(data) {
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
