import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";
import { renderLoading, handleSubmit } from "../utils/utils.js";

import headerSrc from "../images/spots-logo.svg";
import avatarSrc from "../images/avatar.jpg";
import pencilSrc from "../images/edit-pencil.svg";
import pencilLightSrc from "../images/edit-pencil-light.svg";
import plusSrc from "../images/plus.svg";

const headerLogo = document.getElementById("header-logo");
headerLogo.src = headerSrc;
const profileAvatar = document.getElementById("profile-avatar");
profileAvatar.src = avatarSrc;
const pencilIcon = document.getElementById("pencil-icon");
pencilIcon.src = pencilSrc;
const pencilIconLight = document.getElementById("pencil-icon-light");
pencilIconLight.src = pencilLightSrc;
const plusIcon = document.getElementById("plus-icon");
plusIcon.src = plusSrc;

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "20d7ae60-cf24-450f-857e-c33e2a6b404b",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, me]) => {
    console.log(cards);
    profileName.textContent = me.name;
    profileDescription.textContent = me.about;
    profileAvatar.src = me.avatar;
    cards.forEach((item) => {
      renderCard(item, "append");
    });
  })
  .catch(console.error);

// Profile elements
const profileEditButton = document.querySelector(".profile__edit-button");
const profileAddButton = document.querySelector(".profile__add-button");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const avatarButton = document.querySelector(".profile__avatar-button");

// Edit form elements
const editModal = document.querySelector("#edit-modal");
const editFormElement = document.forms["edit-profile"];

const editModalSaveButton = editModal.querySelector(".modal__save-button");
const closeButtons = document.querySelectorAll(".modal__close-button");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

// Card form elements
const cardModal = document.querySelector("#add-card-modal");
const cardFormElement = cardModal.querySelector(".modal__form");
const cardModalLinkInput = cardModal.querySelector("#card-link-input");
const cardModalCaptionInput = cardModal.querySelector("#card-caption-input");
const cardModalSaveButton = cardModal.querySelector(".modal__save-button");

const cardsList = document.querySelector(".cards__list");
const cardTemplate = document.querySelector("#card-template");

// Preview modal elements
const previewModal = document.querySelector("#preview-modal");
const previewModalImage = previewModal.querySelector(".modal__image");
const previewModalCaption = previewModal.querySelector(".modal__caption");

// Delete modal elements
const deleteModal = document.querySelector("#delete-modal");
const modalDeleteButton = deleteModal.querySelector(".modal__delete-button");
const modalCancelButton = deleteModal.querySelector(".modal__cancel-button");

// Avatar form elements
const avatarModal = document.querySelector("#avatar-modal");
const avatarFormElement = avatarModal.querySelector(".modal__form");
const avatarModalLinkInput = avatarModal.querySelector("#profile-avatar-input");
const avatarModalSaveButton = avatarModal.querySelector(".modal__save-button");

let selectedCard, selectedCardId;

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".modal_opened");
    closeModal(openedPopup);
  }
}

function handleOverlay(evt) {
  if (evt.target.classList.contains("modal")) {
    const openedPopup = document.querySelector(".modal_opened");
    closeModal(openedPopup);
  }
}

function openDeleteModal(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
  modalDeleteButton.addEventListener("click", handleModalDelete);
  modalCancelButton.addEventListener("click", handleModalCancel);
}

function handleModalDelete(evt) {
  renderLoading(true, modalDeleteButton, "Delete", "Deleting...");
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
      modalDeleteButton.removeEventListener("click", handleModalDelete);
      modalCancelButton.removeEventListener("click", handleModalCancel);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(false, modalDeleteButton, "Delete");
    });
}

function handleModalCancel() {
  closeModal(deleteModal);
  modalDeleteButton.removeEventListener("click", handleModalDelete);
  modalCancelButton.removeEventListener("click", handleModalCancel);
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscape);
  document.addEventListener("click", handleOverlay);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscape);
  document.removeEventListener("click", handleOverlay);
}

function handleAvatarFormSubmit(evt) {
  handleSubmit(
    () =>
      api.editUserAvatar(avatarModalLinkInput.value).then((data) => {
        avatarModalLinkInput.value = data.avatar;
        profileAvatar.src = data.avatar;
        closeModal(avatarModal);
      }),
    evt,
    "Saving..."
  );
}

function handleEditFormSubmit(evt) {
  handleSubmit(
    () =>
      api
        .editUserInfo({
          name: editModalNameInput.value,
          about: editModalDescriptionInput.value,
        })
        .then((data) => {
          profileName.textContent = data.name;
          profileDescription.textContent = data.about;
          closeModal(editModal);
        }),
    evt,
    "Saving..."
  );
}

function handleCardFormSubmit(evt) {
  handleSubmit(
    () =>
      api
        .addNewCard({
          name: cardModalCaptionInput.value,
          link: cardModalLinkInput.value,
        })
        .then((data) => {
          renderCard(data);
          closeModal(cardModal);
        }),
    evt,
    "Saving..."
  );
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardNameElement = cardElement.querySelector(".card__title");
  const cardImageElement = cardElement.querySelector(".card__image");
  const cardLikeButton = cardElement.querySelector(".card__like-button");
  const cardDeleteButton = cardElement.querySelector(".card__delete-button");

  cardNameElement.textContent = data.name;
  cardImageElement.src = data.link;
  cardImageElement.alt = data.name;

  if (data.isLiked) {
    cardLikeButton.classList.add("card__like-button_liked");
  }

  cardLikeButton.addEventListener("click", () => {
    if (cardLikeButton.classList.contains("card__like-button_liked")) {
      api
        .unlikeCard(data._id)
        .then((response) => {
          cardLikeButton.classList.toggle("card__like-button_liked");
          data.isLiked = response.isLiked;
        })
        .catch(console.error);
    } else {
      api
        .likeCard(data._id)
        .then((response) => {
          cardLikeButton.classList.toggle("card__like-button_liked");
          data.isLiked = response.isLiked;
        })
        .catch(console.error);
    }
  });

  cardDeleteButton.addEventListener("click", () => {
    openDeleteModal(cardElement, data._id);
  });

  cardImageElement.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImage.src = data.link;
    previewModalImage.alt = data.name;
    previewModalCaption.textContent = data.name;
  });

  return cardElement;
}

avatarButton.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarFormElement.addEventListener("submit", handleAvatarFormSubmit);

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(
    editFormElement,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );
  openModal(editModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);

profileAddButton.addEventListener("click", () => {
  openModal(cardModal);
});

cardFormElement.addEventListener("submit", handleCardFormSubmit);

closeButtons.forEach((button) => {
  const popup = button.closest(".modal");
  button.addEventListener("click", () => closeModal(popup));
});

function renderCard(item, method = "prepend") {
  const cardElement = getCardElement(item);
  cardsList[method](cardElement);
}

enableValidation(settings);
