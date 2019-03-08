(function(d, w) {
  let allowLoad = true;
  let app = new Vue({
    el: '#app',
    data: {
      loading: true,
      error: false,
      logEntries: [],
      selectedEntry: null,
      details: function(action, e) {
        if (e) e.preventDefault();
        app.selectedEntry = action;
        M.Modal.getInstance(d.querySelector('#entry-modal')).open();
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
    let endpoint = 'https://modlog2.rchile.xyz/entries';
    if (after) {
      endpoint += '/after/' + after;
    }

    app.loading = true;
    allowLoad = false;
    axios.get(endpoint, {}).then(resp => {
      app.loading = false;
      allowLoad = true;

      let result = entriesFilter(resp.data);
      app.logEntries = app.logEntries.concat(result);
    }).catch(function(error) {
      app.loading = false;
      app.error = true;
      console.error(error);
    });
  }

  /**
   * Filters modlog entries. Currently, it merges the distinguish and sticky actions.
   * @param  {array} entries Entries fetched from the API.
   * @return {array}         Filtered entries.
   */
  function entriesFilter(entries) {
    return entries.reduce((final, curr) => {
      let nEntries = final.length;
      if (nEntries > 0) {
        // Join sticky and distinguish entries
        let last = final[nEntries-1].entry;
        if (last.mod == curr.mod && last.target_fullname == curr.target_fullname && 
            ((last.action == 'distinguish' && curr.action == 'sticky') || 
              (last.action == 'sticky' && curr.action == 'distinguish')
            )) {
          last.action = 'stickydistinguish';
          final[nEntries-1] = new ModAction(last);
          return final;
        }
      }

      final.push(new ModAction(curr));
      return final;
    }, []);
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
