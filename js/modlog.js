(function(d) {
  let app = new Vue({
    el: '#app',
    data: { 
      entries: [],
      dateFormat: function(theDate) {
        let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        return (new Date(theDate*1000 - tzoffset)).toISOString().slice(0, -1);
      },
      dateAgo: function(theDate) {
        return timeago().format(theDate*1000, 'es')
      }
    },
    updated: function(){ this.$nextTick(() => {
      M.Collapsible.init(d.querySelectorAll('.collapsible'));
      M.Modal.init(d.querySelectorAll('.modal'));
    })}
  });
  
  let endpoint = 'https://modlog.rchile.xyz/';
  axios.post(endpoint, {}).then(resp => {
    app.entries = resp.data;
    d.querySelector("#app").style.visibility = 'visible';
  });
})(document);