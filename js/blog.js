document.addEventListener("DOMContentLoaded", () => {
  const newPostButton = document.querySelector(".blog-new-post");
  const createForm = document.querySelector("#blogCreateForm");
  const cancelButton = document.querySelector("#blogCancelButton");
  const form = document.querySelector("#blogCreateForm form");
  const titleInput = document.querySelector("#postTitle");
  const categoryInput = document.querySelector("#postCategory");
  const contentInput = document.querySelector("#postContent");
  const blogPosts = document.querySelector(".blog-posts");
  const blogHero = document.querySelector(".blog-hero");
  const blogWrapper = document.querySelector(".blog-wrapper");
  const filterButtons = document.querySelectorAll(".blog-filter");

  const customSelect = document.querySelector("#blogCategorySelect");
  const customSelectButton = document.querySelector(".blog-custom-select-button");
  const selectedCategoryText = document.querySelector("#blogSelectedCategory");
  const customSelectOptions = document.querySelectorAll(".blog-custom-select-options button");

  if (
    !newPostButton ||
    !createForm ||
    !cancelButton ||
    !form ||
    !titleInput ||
    !categoryInput ||
    !contentInput ||
    !blogPosts ||
    !blogHero ||
    !customSelect ||
    !customSelectButton ||
    !selectedCategoryText ||
    customSelectOptions.length === 0
  ) {
    console.error("Blog JS: Ein benötigtes HTML-Element wurde nicht gefunden.");
    return;
  }

  createForm.classList.remove("is-visible");
createForm.style.display = "none";

  function resetForm() {
    form.reset();

    categoryInput.value = "Tipps & Tricks";
    selectedCategoryText.textContent = "Tipps & Tricks";

    customSelectOptions.forEach((option) => {
      option.classList.remove("is-selected");
    });

    customSelectOptions[0].classList.add("is-selected");
    customSelect.classList.remove("is-open");
  }

  function scrollToBlogOverview() {
    const targetTop = blogHero.getBoundingClientRect().top + window.scrollY - 20;

    window.scrollTo({
      top: targetTop,
      behavior: "smooth"
    });

    document.documentElement.scrollTop = targetTop;
    document.body.scrollTop = targetTop;

    if (blogWrapper) {
      blogWrapper.scrollTop = 0;
    }
  }

  function openCreateForm() {
    createForm.classList.add("is-visible");
    createForm.style.display = "block";

    createForm.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function closeCreateFormAndGoBack() {
    createForm.classList.remove("is-visible");
    createForm.style.display = "none";

    resetForm();

    setTimeout(() => {
      scrollToBlogOverview();
    }, 100);
  }

  function closeCreateFormOnly() {
    createForm.classList.remove("is-visible");
    createForm.style.display = "none";
    resetForm();
  }

  function getPostIcon(category) {
    if (category === "Tipps & Tricks") {
      return "💤";
    }

    if (category === "Schlafhygiene") {
      return "🌙";
    }

    if (category === "Routine") {
      return "⭐";
    }

    if (category === "Probleme") {
      return "💭";
    }

    return "💭";
  }

  function createBlogCard(title, category, content, date) {
    const newArticle = document.createElement("article");
    newArticle.classList.add("blog-card", "blog-card-own");
    newArticle.dataset.category = category;

    newArticle.innerHTML = `
      <div class="blog-card-icon">${getPostIcon(category)}</div>

      <div class="blog-card-content">
        <div class="blog-card-top">
          <span class="blog-tag">${category}</span>

          <button type="button" class="blog-delete-button">
            Löschen
          </button>
        </div>

        <h3>${title}</h3>

        <p>${content}</p>

        <div class="blog-meta">
          <div class="blog-meta-left">
            <span>◷ ${date}</span>
            <span>•</span>
            <span>Du</span>
          </div>

          <div class="blog-meta-right">
            <span>♡ 0</span>
            <span>☁ 0</span>
          </div>
        </div>
      </div>
    `;

    return newArticle;
  }

  customSelectOptions[0].classList.add("is-selected");

  customSelectButton.addEventListener("click", () => {
    customSelect.classList.toggle("is-open");
  });

  customSelectOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.dataset.value;

      categoryInput.value = value;
      selectedCategoryText.textContent = value;

      customSelectOptions.forEach((item) => {
        item.classList.remove("is-selected");
      });

      option.classList.add("is-selected");
      customSelect.classList.remove("is-open");
    });
  });

  document.addEventListener("click", (event) => {
    if (!customSelect.contains(event.target)) {
      customSelect.classList.remove("is-open");
    }
  });

  newPostButton.addEventListener("click", openCreateForm);

  cancelButton.addEventListener("click", () => {
    closeCreateFormAndGoBack();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const content = contentInput.value.trim();

    if (title === "" || content === "") {
      alert("Bitte fülle Titel und Inhalt aus.");
      return;
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("de-CH", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const newArticle = createBlogCard(title, category, content, formattedDate);

    blogPosts.prepend(newArticle);

    closeCreateFormOnly();

    setTimeout(() => {
      newArticle.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 250);
  });

  blogPosts.addEventListener("click", (event) => {
    if (!event.target.classList.contains("blog-delete-button")) {
      return;
    }

    const article = event.target.closest(".blog-card");

    const shouldDelete = confirm("Möchtest du diesen Beitrag wirklich löschen?");

    if (shouldDelete) {
      article.remove();
    }
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCategory = button.dataset.category;
      const allCards = document.querySelectorAll(".blog-card");

      filterButtons.forEach((filterButton) => {
        filterButton.classList.remove("is-active");
      });

      button.classList.add("is-active");

      allCards.forEach((card) => {
        const cardCategory = card.dataset.category;

        if (selectedCategory === "Alle" || selectedCategory === cardCategory) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
});