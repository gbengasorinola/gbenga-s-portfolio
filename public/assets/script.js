document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll(".fade-in-on-scroll");

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // Only fade in once
        }
      });
    }, {
      threshold: 0.1
    });

    elements.forEach(el => observer.observe(el));
  });


const video = document.querySelector('.hero-video');
  video.muted = true;
  video.play().catch((e) => {
    console.log("Autoplay blocked:", e);
  });

function toggleMenu() {
    const nav = document.querySelector('.nav-links');
    nav.classList.toggle('show');
  }

function isValidName(name) {
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\-'\s]{2,30}$/;
    return nameRegex.test(name);
  }

  function capitalizeWords(name) {
    return name
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function validateName() {
    const input = document.getElementById("username");
    const feedback = document.getElementById("name-feedback");
    const name = input.value.trim();

    if (!name) {
      feedback.textContent = "";
      feedback.style.display = "none";
      return;
    }

    if (isValidName(name)) {
      feedback.textContent = "✅ Name looks good!";
      feedback.style.color = "green";
      feedback.style.display = "block";
    } else {
      feedback.textContent = "❌ Only letters allowed.";
      feedback.style.color = "red";
      feedback.style.display = "block";
    }
  }

  function submitName() {
    const input = document.getElementById("username");
    const nameRaw = input.value.trim();

    if (!isValidName(nameRaw)) {
      alert("Please enter a valid name.");
      return;
    }

    const name = capitalizeWords(nameRaw);
    localStorage.setItem("userName", name);
    document.getElementById("dynamic-username").textContent = name;
    document.getElementById("name-overlay").style.display = "none";
  }

  window.addEventListener("DOMContentLoaded", () => {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      document.getElementById("dynamic-username").textContent = savedName;
      document.getElementById("name-overlay").style.display = "none";
    }
  });