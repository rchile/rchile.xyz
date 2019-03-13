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

      this.description = '';
      this.details = ModAction._fPostData(this.entry);
      this.content = this.entry.target_body;
      this.icon = iconMap[action] || 'insert_emoticon';

      switch(this.entry.action) {
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
        case 'wikirevise':
          this.details = this.entry.details;
          break;
        case 'wikipermlevel':
          this.details = this.entry.description || '(sin detalles)';
          break;
      }

      // Get the default description for the action and format it
      let vars = { 'author': authorLink };
      if (!this.description && descriptionMap[action]) {
        this.description = descriptionMap[action].format(vars);
      } else {
        this.description = 'Acción: ' + action;
      }
    }

    // Calls timeago to parse a timestamp and generate a relative time string (X time ago)
    dateAgo() {
      return timeago().format(this.entry.created_utc*1000, 'es');
    }


  /**
   * Filter and parse modlog entries to shape them better to the app.
   * It can create virtual action types (non standard) to simplify
   * application logic.
   * @param  {array} entries Entries fetched from the API.
   * @return {array}         Filtered entries.
   */
  static filterEntries(entries) {
    let twoTypesList = ['distinguish', 'sticky', 'unsticky', 'stickydistinguish',
                        'spamlink', 'unignorereports', 'ignorereports'];
    let autoTypesList = ['removelink'];

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

      // Distinguish between actions made with posts and comments
      if (twoTypesList.indexOf(curr.action) > -1) {
        curr.action += !!curr.target_title ? 'post' : 'comment';
      }

      // Distinguish AutoModerator actions
      if (autoTypesList.indexOf(curr.action) > -1 && curr.mod === 'AutoModerator') {
        curr.action += 'auto';
      }

      // Special action type for end of temporal ban
      if (curr.action === 'unbanuser' && curr.description === 'was temporary') {
        curr.action = 'tempbanend';
      }

      final.push(new ModAction(curr));
      return final;
    }, []);
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

  // Default icon for every action type (including virtual ones)
  let iconMap = {
    'approvecomment': 'add_comment',
    'approvelink': 'done_all',
    'banuser': 'gavel',
    'community_widgets': 'border_color',
    'distinguishcomment': 'star',
    'distinguishpost': 'star',
    'editflair': 'rate_review',
    'ignorereportscomment': 'report_off',
    'ignorereportspost': 'assignment_returned',
    'lock': 'lock',
    'marknsfw': 'airline_seat_recline_extra',
    'removecomment': 'speaker_notes_off',
    'removelink': 'delete',
    'removelinkauto': 'delete',
    'setsuggestedsort': 'sort',
    'spamcomment': 'report',
    'spamlinkcomment': 'delete_outline',
    'spamlinkpost': 'delete_sweep',
    'stickycomment': 'location_on',
    'stickydistinguishcomment': 'local_activity',
    'stickydistinguishpost': 'folder_special',
    'stickypost': 'pin_drop',
    'tempbanend': 'how_to_reg',
    'unbanuser': 'how_to_reg',
    'unignorereportscomment': 'assignment_turned_in',
    'unignorereportspost': 'assignment_turned_in',
    'unspoiler': 'visibility',
    'unstickycomment': 'location_off',
    'unstickypost': 'location_off',
    'wikipermlevel': 'perm_contact_calendar',
    'wikirevise': 'description'
  };

  // Default descriptions
  let descriptionMap = {
    'removelink': 'Publicación eliminada.',
    'removelinkauto': 'Publicación automáticamente eliminada.',
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
    'ignorereportscomment': 'Reportes del comentario de {author} ignorados.',
    'tempbanend': 'Fin del ban temporal de {author}.',
    'wikirevise': 'Página de la wiki modificada',
    'wikipermlevel': 'Nivel de permisos de wiki modificado'
  };

  w.ModAction = ModAction;
})(window);