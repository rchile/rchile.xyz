class ModAction {
  constructor(entry) {
    this.entry = entry;
    this.modURL = 'https://reddit.com/user/' + this.entry.mod;
    this.targetPermalink = 'https://reddit.com' + this.entry.target_permalink;
    this.date = ModAction._date(this.entry.created_utc);

    this.icon = 'insert_emoticon';
    this.description = 'Acción: ' + this.entry.action;
    this.details = '';
    this.content = '';
    this.initData();
  }

  initData() {
    switch(this.entry.action) {
      case 'removelink':
        this.description = this.entry.mod === 'AutoModerator' ?
          'Publicación automáticamente eliminada.' : 
          'Publicación eliminada.';
        this.details = ModAction._fPostData(this.entry);
        this.icon = 'delete';
        break;
      case 'editflair':
        this.description = 'Etiqueta de publicación editada.';
        this.details = ModAction._fPostData(this.entry);
        this.icon = 'rate_review';
        break;
      case 'unspoiler':
        this.description = 'Publicación desmarcada como spoiler.';
        this.details = ModAction._fPostData(this.entry);
        this.icon = 'visibility';
        break;
      case 'distinguish':
        this.icon = 'star';
        if (this.entry.target_title) {
          this.description = 'Publicación distinguida.';
          this.details = ModAction._fPostData(this.entry);
        } else {
          let ulink = ModAction._userLink(this.entry.target_author);
          this.description = `Comentario de moderador distinguido.`;
          this.content = this.entry.target_body;
        }
        break;
      case 'sticky':
        if (this.entry.target_title) {
          this.description = 'Publicación fijada.';
          this.details = ModAction._fPostData(this.entry);
          this.icon = 'pin_drop';
        } else {
          let ulink = ModAction._userLink(this.entry.target_author);
          this.description = `Comentario de moderador fijado.`;
          this.content = this.entry.target_body;
          this.icon = 'location_on';
        }
        break;
      case 'unsticky':
        if (this.entry.target_title) {
          this.description = 'Fijado de publicación quitado.';
          this.details = ModAction._fPostData(this.entry);
          this.icon = 'location_off';
        } else {
          let ulink = ModAction._userLink(this.entry.target_author);
          this.description = `Fijado de comentario ${ulink} quitado.`;
          this.content = this.entry.target_body;
          this.icon = 'location_off';
        }
        break;
      case 'approvelink':
        this.description = 'Publicación aprobada.';
        this.details = ModAction._fPostData(this.entry);
        this.icon = 'done_all';
        break;
      case 'approvecomment':
        let ulink = ModAction._userLink(this.entry.target_author);
        this.description = `Comentario de ${ulink} aprobado.`;
        this.content = this.entry.target_body;
        this.icon = 'done';
        break;
      case 'removecomment':
        let ulink2 = ModAction._userLink(this.entry.target_author);
        this.description = `Comentario de ${ulink2} eliminado.`;
        this.content = this.entry.target_body;
        this.icon = 'done';
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
        this.details = ModAction._fPostData(this.entry);
        this.icon = 'sort';
        break;
      case 'spamlink':
        if (this.entry.target_title) {
          this.description = 'Publicación eliminada por spam.';
          this.details = ModAction._fPostData(this.entry);
          this.icon = 'delete_sweep';
        } else {
          let ulink3 = ModAction._userLink(this.entry.target_author);
          this.description = `Comentario de ${ulink3} eliminado por spam.`;
          this.content = this.entry.target_body;
          this.icon = 'delete_outline';
        }
        break;
      case 'lock':
        this.description = 'Comentarios de publicación bloqueados.';
        this.details = ModAction._fPostData(this.entry);
        this.icon = 'lock';
        break;
      case 'banuser':
        let ulink4 = ModAction._userLink(this.entry.target_author)
        this.description = `Usuario(a) ${ulink4} baneado(a).`;
        this.details = `${this.entry.description} - ${this.entry.details}.`;
        this.icon = 'gavel';
        break;
      case 'marknsfw':
        this.description = 'Publicación marcada como NSFW.';
        this.details = ModAction._fPostData(this.entry);
        this.icon = 'airline_seat_recline_extra';
        break;
      case 'unspoiler':
        this.description = 'Publicación desmarcada como spoiler.';
        this.details = ModAction._fPostData(this.entry);
        this.icon = 'visibility';
        break;
      case 'unignorereports':
        if (this.entry.target_title) {
          this.description = 'Ignorado de reportes de publicación revertido.';
          this.details = ModAction._fPostData(this.entry);
          this.icon = 'assignment_turned_in';
        } else {
          let ulink5 = ModAction._userLink(this.entry.target_author);
          this.description = `Ignorado de reportes del comentario de ${ulink5} revertido.`;
          this.content = this.entry.target_body;
          this.icon = 'assignment_turned_in';
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

  dateAgo() {
    return timeago().format(this.entry.created_utc*1000, 'es');
  }

  static _date(theDate) {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    return (new Date(theDate*1000 - tzoffset)).toISOString().slice(0, -1);
  }

  static _fPostData(entry) {
    return `"<em>${strip(entry.target_title)}</em>" por ` + 
      ModAction._userLink(entry.target_author);
  }

  static _userLink(username) {
    if (username === '[deleted]') {
      return username;
    } else {
      let url = 'https://reddit.com/user/' + username;
      return `<a href="${url}" target="_blank">/u/${username}</a>`;
    }
  }
}