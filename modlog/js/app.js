(function(u) {
  'use strict';
  
  let vm = new Vue({
    el: '#app',
    data: {
      loading: false,
      error: null,
      entries: []
    },
    
    mounted: function() {
      this.loadEntries();
    },
    methods: {
      loadEntries: function(after) {
        if (this.loading) return;
        this.loading = true;

        console.log('Loading entries...');

        let url = u + (after ? '?after=' + after : '');
        axios.get(url).then(resp => {
          this.entries = filterEntries(resp.data);
          console.log('Entries loaded.');
        }).catch(err => {
          console.error(err);
        }).finally(() => {
          this.loading = false;
        });
      }
    }
  });
  
})(ENDPOINT);