document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".button-premium");

  buttons.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Pull button towards cursor
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener("mouseleave", () => {
      // Snap back
      btn.style.transform = `translate(0px, 0px)`;
      btn.style.transition = `transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)`;
    });
    
    btn.addEventListener("mouseenter", () => {
      btn.style.transition = `none`;
    });
  });
});
