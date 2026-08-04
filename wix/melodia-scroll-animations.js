document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Fade up environment cards
  gsap.utils.toArray(".env-card").forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
        }
      }
    );
  });

  // Fade up section heads
  gsap.utils.toArray(".section-head").forEach((head) => {
    gsap.fromTo(head,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: head,
          start: "top 85%",
        }
      }
    );
  });
});
