(function(w) {
  'use strict';

  class ModAction {
    constructor(entry) {
      this.entry = entry; // raw entry
      let action = this.entry.action; // shorthand
      let authorLink = ModAction._userLink(this.entry.target_author); // html link to author

      this.modURL = 'https://reddit.com/user/' + this.entry.mod;
      this.targetPermalink = 'https://reddit.com' + this.entry.target_permalink;
      this.date = ModAction._date(this.entry.created_utc); // UTC ISO date string

      this.details = ModAction._fPostData(this.entry);
      this.content = this.entry.target_body;
      this.icon = iconMap[action] || 'insert_emoticon';

      switch(this.entry.action) {
        case 'removelink':
          this.description = this.entry.mod === 'AutoModerator' ?
            'Publicación automáticamente eliminada.' : 
            'Publicación eliminada.';
          break;
        case 'unbanuser':
          if (this.entry.description === 'was temporary') {
            this.description = `Fin del ban temporal de {autor}.`;
          }
          break;
        case 'banuser':
          let banTime = this.entry.details === 'permanent' ? 'permanente' : this.entry.details;
          this.description = `Usuario(a) ${authorLink} baneado(a).`;
          this.details = `Razón: ${this.entry.description || '<em>(sin razón)</em>'}. Período: ${banTime}.`;
          break;
        case 'community_widgets':
          if (this.entry.details === 'edited_widget') {
            this.description = 'Widget del sidebar editado.';
          }
          break;
      }

      // Get the default description for the action and format it
      let vars = { 'author': authorLink };
      this.description = 'Acción: ' + action;
      if (descriptionMap[action]) {
        this.description = descriptionMap[action].format(vars);
      }
    }

    // Calls timeago to parse a timestamp and generate a relative time string (X time ago)
    dateAgo() {
      return timeago().format(this.entry.created_utc*1000, 'es');
    }

    // Generates a UTC ISO string from a date
    static _date(theDate) {
      let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      return (new Date(theDate*1000 - tzoffset)).toISOString().slice(0, -1);
    }

    // Creates a string in the format: "'<post_title>' by <author_link>"
    static _fPostData(entry) {
      if (!entry.target_title) {
        return '';
      }

      return `"<em>${strip(entry.target_title)}</em>" por ` + 
        ModAction._userLink(entry.target_author);
    }

    // Generates a HMTL reddit link to the user.
    static _userLink(username) {
      if (username === '[deleted]') {
        return username;
      } else if (!username) {
        return username;
      } else {
        let url = 'https://reddit.com/user/' + username;
        return `<a href="${url}" target="_blank">/u/${username}</a>`;
      }
    }
  }

  let iconMap = {
    'removelink': 'delete', 'editflair': 'rate_review', 'unspoiler': 'visibility', 'distinguishpost': 'star',
    'distinguishcomment': 'star', 'stickypost': 'pin_drop', 'stickycomment': 'location_on', 'unstickypost': 'location_off',
    'unstickycomment': 'location_off', 'stickydistinguishpost': 'folder_special', 'stickydistinguishcomment': 'local_activity',
    'approvelink': 'done_all', 'approvecomment': 'add_comment', 'removecomment': 'speaker_notes_off',
    'spamcomment': 'report', 'unbanuser': 'how_to_reg', 'setsuggestedsort': 'sort', 'spamlinkpost': 'delete_sweep',
    'spamlinkcomment': 'delete_outline', 'lock': 'lock', 'banuser': 'gavel', 'marknsfw': 'airline_seat_recline_extra',
    'unspoiler': 'visibility', 'unignorereportspost': 'assignment_turned_in', 'unignorereportscomment': 'assignment_turned_in',
    'ignorereportspost': 'assignment_returned', 'ignorereportscomment': 'report_off', 'community_widgets': 'border_color'
  };

  let descriptionMap = {
    'removelink': 'Publicación eliminada.',
    'editflair': 'Etiqueta de publicación editada.',
    'unspoiler': 'Publicación desmarcada como spoiler.',
    'distinguishpost': 'Publicación distinguida.',
    'distinguishcomment': 'Comentario de moderador distinguido.',
    'stickypost': 'Publicación fijada.',
    'stickycomment': 'Comentario de moderador fijado.',
    'unstickypost': 'Fijado de publicación quitado.',
    'stickydistinguishcomment': 'Publicación fijada y distinguida.',
    'stickydistinguishcomment': 'Comentario de moderador fijado y distinguido.',
    'approvelink': 'Publicación aprobada.',
    'setsuggestedsort': 'Se cambió el orden predeterminado de una publicación.',
    'spamlinkpost': 'Publicación eliminada por spam.',
    'lock': 'Comentarios de publicación bloqueados.',
    'marknsfw': 'Publicación marcada como NSFW.',
    'unspoiler': 'Publicación desmarcada como spoiler.',
    'unignorereportspost': 'Ignorado de reportes de publicación revertido.',
    'ignorereportspost': 'Reportes de publicación ignorados.',
    'unstickycomment': 'Fijado de comentario {author} quitado.',
    'approvecomment': 'Comentario de {author} aprobado.',
    'removecomment': 'Comentario de {author} eliminado.',
    'spamcomment': 'Comentario de {author} eliminado como spam.',
    'unbanuser': 'Usuario(a) {author} desbaneado(a).',
    'spamlinkcomment': 'Comentario de {author} eliminado por spam.',
    'unignorereportscomment': 'Ignorado de reportes del comentario de {author} revertido.',
    'ignorereportscomment': 'Reportes del comentario de {author} ignorados.'
  };

  w.ModAction = ModAction;
})(window);