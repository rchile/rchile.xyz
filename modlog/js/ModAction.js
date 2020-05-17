(function(w) {
  'use strict';
  
  class ModAction {
    constructor(entry) {
      this.entry = entry;
      this.title = entry.action;
      this.body = md.render(entry.target_body || '');
      this.relatime = moment.utc(entry.created_utc*1000).fromNow();

      this.icon = null;
      this.description = null;
      this.content_title = null
      this.permalink = entry.target_permalink;
      this.automatic = entry.mod === 'AutoModerator';

      if (entry.target_title) {
        this.content_title = entry.target_title;
      }
      if (entry.target_author) {
        this.description = 'Content author: /u/' + entry.target_author;
      }
      if (entry.target_permalink) {
        this.permalink = 'https://reddit.com' + this.permalink;
      }

      if (entry.action in ACTION_MAP) {
        this.title = ACTION_MAP[entry.action][0] || entry.action;
        this.icon = ACTION_MAP[entry.action][1] || 'thumbs-up';
      }

      if (entry.action in CONTENT_MAP) {
        let map = CONTENT_MAP[entry.action];
        Object.keys(map).forEach(k => {
          this[k] = map[k].format(entry);
        });
      }
    } // /constructor
  }

  w.ModAction = ModAction;
})(window);