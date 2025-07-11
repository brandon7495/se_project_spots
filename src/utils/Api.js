class Api {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  getAppInfo() {
    return Promise.all([this.getInitialCards(), this.getUserInfo()]);
  }

  _request(url, options) {
    return fetch(url, options).then(this._checkResponse);
  }

  _checkResponse(res) {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(`Error: ${res.status}`);
  }

  getUserInfo() {
    return this._request(`${this._baseUrl}/users/me`, {
      headers: this._headers,
    });
  }

  getInitialCards() {
    return this._request(`${this._baseUrl}/cards`, {
      headers: this._headers,
    });
  }

  editUserInfo({ name, about }) {
    return this._request(`${this._baseUrl}/users/me`, {
      headers: this._headers,
      method: "PATCH",
      body: JSON.stringify({
        name,
        about,
      }),
    });
  }

  editUserAvatar(avatar) {
    return this._request(`${this._baseUrl}/users/me/avatar`, {
      headers: this._headers,
      method: "PATCH",
      body: JSON.stringify({
        avatar,
      }),
    });
  }

  addNewCard({ name, link }) {
    return this._request(`${this._baseUrl}/cards`, {
      headers: this._headers,
      method: "POST",
      body: JSON.stringify({
        name,
        link,
      }),
    });
  }

  deleteCard(cardId) {
    return this._request(`${this._baseUrl}/cards/${cardId}`, {
      headers: this._headers,
      method: "DELETE",
    });
  }

  likeCard(cardId) {
    return this._request(`${this._baseUrl}/cards/${cardId}/likes`, {
      headers: this._headers,
      method: "PUT",
    });
  }

  unlikeCard(cardId) {
    return this._request(`${this._baseUrl}/cards/${cardId}/likes`, {
      headers: this._headers,
      method: "DELETE",
    });
  }
}

export default Api;
