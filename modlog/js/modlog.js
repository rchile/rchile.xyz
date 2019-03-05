(function(d, w) {
  let allowLoad = true;
  let app = new Vue({
    el: '#app',
    data: {
      loading: true,
      error: false,
      modActions: []
    },
    updated: function(){ this.$nextTick(() => {
      M.Collapsible.init(d.querySelectorAll('.collapsible'));
      M.Modal.init(d.querySelectorAll('.modal'));
    })},
    mounted: function () {
      d.querySelector("#app").style.visibility = 'visible';
    }
  });

  function loadEntries(after) {
    let endpoint = 'https://modlog.rchile.xyz/';
    if (after) {
      endpoint += 'after/' + after;
    }

    app.loading = true;
    allowLoad = false;
    axios.post(endpoint, {}).then(resp => {
      app.loading = false;
      allowLoad = true;

      let result = entriesFilter(resp.data);
      app.modActions = app.modActions.concat(result);
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
            last.action == 'distinguish' && curr.action == 'sticky') {
          last.action = 'stickydistinguish';
          final[nEntries-1] = new ModAction(last);
          return final;
        }
      }

      final.push(new ModAction(curr));
      return final;
    }, []);
  }

  w.addScrollListener(scrollY => {
    let nModActions = app.modActions.length;
    if (app.loading || nModActions === 0 || !allowLoad) {
      return;
    }

    let trigger = (scrollY + (w.innerHeight * 1.7)) > docHeight();
    if (trigger && nModActions > 0) {
      let id = app.modActions[nModActions - 1].entry.id.split('_')[1];
      loadEntries(id);
    }
  });

  loadEntries();
})(document, window);
