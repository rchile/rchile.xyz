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
      let id = app.modActions[nModActions - 1].entry.id.split('_')[1];
      loadEntries(id);
    }
  });

  loadEntries();
})(document, window);
