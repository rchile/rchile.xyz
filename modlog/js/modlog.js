(function(d, w) {
  let allowLoad = true;
  let app = new Vue({
    el: '#app',
    data: {
      loading: true,
      error: false,
      modActions: [],
      selectedAction: null,
      details: function(action, e) {
        if (e) e.preventDefault();
        app.selectedAction = action;
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

      let result = resp.data.map(entry => new ModAction(entry));
      app.modActions = app.modActions.concat(result);
    }).catch(function(error) {
      app.loading = false;
      app.error = true;
      console.error(error);
    });
  }

  w.addScrollListener(scrollY => {
    let nModActions = app.modActions.length;
    if (app.loading || nModActions === 0 || !allowLoad) {
      return;
    }

    let trigger = (scrollY + (w.innerHeight * 1.7)) > docHeight();
    if (trigger && nModActions > 0) {
      loadEntries(app.modActions[nModActions - 1].entry.id);
    }
  });

  loadEntries();
})(document, window);
