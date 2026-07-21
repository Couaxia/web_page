    document.querySelectorAll(".page-link").forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();

            document.body.classList.add("page-turn");

            setTimeout(() => {
                window.location.href = this.href;
            }, 750);
        });
    });
