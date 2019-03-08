class ModAction {
  constructor(entry) {
    this.entry = entry; // raw entry
    this.modURL = 'https://reddit.com/user/' + this.entry.mod;
    this.targetPermalink = 'https://reddit.com' + this.entry.target_permalink;
    this.date = ModAction._date(this.entry.created_utc); // UTC ISO date string

    this.icon = 'insert_emoticon';
    this.description = 'Acción: ' + this.entry.action;
    this.details = ModAction._fPostData(this.entry);
    this.content = '';

    // HTML link to author user's profile
    let authorLink = ModAction._userLink(this.entry.target_author);

    switch(this.entry.action) {
      case 'removelink':
        this.description = this.entry.mod === 'AutoModerator' ?
          'Publicación automáticamente eliminada.' : 
          'Publicación eliminada.';
        this.icon = 'delete';
        break;
      case 'editflair':
        this.description = 'Etiqueta de publicación editada.';
        this.icon = 'rate_review';
        break;
      case 'unspoiler':
        this.description = 'Publicación desmarcada como spoiler.';
        this.icon = 'visibility';
        break;
      case 'distinguish':
        this.icon = 'star';
        if (this.entry.target_title) {
          this.description = 'Publicación distinguida.';
        } else {
          this.description = `Comentario de moderador distinguido.`;
          this.content = this.entry.target_body;
        }
        break;
      case 'sticky':
        if (this.entry.target_title) {
          this.description = 'Publicación fijada.';
          this.icon = 'pin_drop';
        } else {
          this.description = `Comentario de moderador fijado.`;
          this.content = this.entry.target_body;
          this.icon = 'location_on';
        }
        break;
      case 'unsticky':
        if (this.entry.target_title) {
          this.description = 'Fijado de publicación quitado.';
          this.icon = 'location_off';
        } else {
          this.description = `Fijado de comentario ${authorLink} quitado.`;
          this.content = this.entry.target_body;
          this.icon = 'location_off';
        }
        break;
      case 'stickydistinguish':
        if (this.entry.target_title) {
          this.description = 'Publicación fijada y distinguida.';
          this.icon = 'folder_special';
        } else {
          this.description = `Comentario de moderador fijado y distinguido.`;
          this.content = this.entry.target_body;
          this.icon = 'local_activity';
        }
        break;
      case 'approvelink':
        this.description = 'Publicación aprobada.';
        this.icon = 'done_all';
        break;
      case 'approvecomment':
        this.description = `Comentario de ${authorLink} aprobado.`;
        this.content = this.entry.target_body;
        this.icon = 'add_comment';
        break;
      case 'removecomment':
        this.description = `Comentario de ${authorLink} eliminado.`;
        this.content = this.entry.target_body;
        this.icon = 'speaker_notes_off';
        break;
      case 'spamcomment':
        this.description = `Comentario de ${authorLink} eliminado como spam.`;
        this.content = this.entry.target_body;
        this.icon = 'report';
        break;
      case 'unbanuser':
        if (this.entry.description === 'was temporary') {
          this.description = 'Fin del ban temporal de ' + 
            ModAction._userLink(this.entry.target_author);
          this.icon = 'how_to_reg';
        }
        break;
      case 'setsuggestedsort':
        this.description = 'Se cambió el orden predeterminado de una publicación.';
        this.icon = 'sort';
        break;
      case 'spamlink':
        if (this.entry.target_title) {
          this.description = 'Publicación eliminada por spam.';
          this.icon = 'delete_sweep';
        } else {
          this.description = `Comentario de ${authorLink} eliminado por spam.`;
          this.content = this.entry.target_body;
          this.icon = 'delete_outline';
        }
        break;
      case 'lock':
        this.description = 'Comentarios de publicación bloqueados.';
        this.icon = 'lock';
        break;
      case 'banuser':
        let banTime = this.entry.details === 'permanent' ? 'permanente' : this.entry.details;
        this.description = `Usuario(a) ${authorLink} baneado(a).`;
        this.details = `Razón: ${this.entry.description || '<em>(sin razón)</em>'}. Período: ${banTime}`;
        this.icon = 'gavel';
        break;
      case 'marknsfw':
        this.description = 'Publicación marcada como NSFW.';
        this.icon = 'airline_seat_recline_extra';
        break;
      case 'unspoiler':
        this.description = 'Publicación desmarcada como spoiler.';
        this.icon = 'visibility';
        break;
      case 'unignorereports':
        if (this.entry.target_title) {
          this.description = 'Ignorado de reportes de publicación revertido.';
          this.icon = 'assignment_turned_in';
        } else {
          this.description = `Ignorado de reportes del comentario de ${authorLink} revertido.`;
          this.content = this.entry.target_body;
          this.icon = 'assignment_turned_in';
        }
        break;
      case 'ignorereports':
        if (this.entry.target_title) {
          this.description = 'Reportes de publicación ignorados.';
          this.icon = 'assignment_returned';
        } else {
          this.description = `Reportes del comentario de ${authorLink} ignorados.`;
          this.content = this.entry.target_body;
          this.icon = 'report_off';
        }
        break;
      case 'community_widgets':
        if (this.entry.details === 'edited_widget') {
          this.description = 'Widget del sidebar editado.';
          this.icon = 'border_color';
        }
        break;
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