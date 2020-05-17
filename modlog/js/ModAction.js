(function(w) {
  'use strict';
  
  class ModAction {
    constructor(entry) {
      this.entry = entry;
      this.title = entry.action;
      this.description = entry.details;
      this.body = md.render(entry.target_body || '');
      this.icon = '';
      this.relatime = moment.utc(entry.created_utc*1000).fromNow();

      if (entry.action in ACTION_MAP) {
        this.title = ACTION_MAP[entry.action][0] || entry.action;
        this.icon = ACTION_MAP[entry.action][1] || 'thumbs-up';
      }
    } // /constructor
  }

  w.ModAction = ModAction;
})(window);