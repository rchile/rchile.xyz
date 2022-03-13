(function(d, w) {
  'use strict';
  let allowLoad = true;
  let timeagoIns = timeago();
  let baseURL = location.hostname === 'localhost'
    ? 'http://127.0.0.1:5000/api'
    : 'https://modlog.rchile.net/api';
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
      writtingHiddenReason: '',
      writtingHidden: false,
      savingHidden: false,

      filterAuthor: '',
      filterMod: '',
      filterAction: '',

      details: function(action) {
        app.selectedEntry = action;
        app.writingNotes = action.entry.notes || '';
        app.writtingHidden = action.entry.hidden || false;
        app.writtingHiddenReason = action.entry.hiddenNotes || '';

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
      getUnique: function(name) {
        return this.logEntries.reduce((p, v) => { p.indexOf(v.entry[name]) === -1 && p.push(v.entry[name]); return p; }, []);
      },
      loadMore: function() {
        if (this.loading) {
          return;
        }

        loadEntries(this.logEntries[this.logEntries.length - 1].entry.id);
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
    computed: {
      filteredEntries: function() {
        return this.logEntries.filter(x => {
          if (this.filterAuthor !== '' 
            && x.entry.target_author != null 
            && x.entry.target_author.indexOf(this.filterAuthor) === -1) {
            return false;
          }
          if (this.filterMod !== '' && x.entry.mod.indexOf(this.filterMod) === -1) {
            return false;
          }
          if (this.filterAction !== '' && x.entry.action.indexOf(this.filterAction) === -1) {
            return false;
          }

          return true;
        });
      },
      mods: function() {
        return this.getUnique('mod');
      },
      wetas: function() {
        return this.getUnique('target_author');
      },
      actions: function() {
        return this.getUnique('action');
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
    let endpoint = '/entries' + (after ? '?after=' + after : '');

    app.loading = true;
    allowLoad = false;

    api.get(endpoint).then(resp => {
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
