(function () {
  "use strict";

  var MOVEMENTS = [
    "Prelude", "Andante", "Allegro", "Adagio", "Scherzo", "Finale",
    "Nocturne", "Rondo", "Cadenza", "Interlude", "Ballade", "March",
    "Etude", "Caprice", "Sonata", "Fugue", "Aria", "Chorale",
    "Minuet", "Gigue", "Toccata", "Pastorale", "Requiem", "Overture",
    "Serenade", "Waltz", "Hymn", "Fanfare", "Elegy", "Coda"
  ];

  var BPM = 128;
  var BEAT_MS = 60000 / BPM;
  var WINDOWS = { perfect: 90, great: 120, good: 160 };
  var LANE_KEYS = { d: 0, f: 1, j: 2, k: 3, a: 0, s: 1 };

  var CHART = [
    0, 1, 2, 3, 0, 2, 1, 3, 0, 1, 2, 3,
    1, 0, 3, 2, 0, 1, 3, 2, 1, 0, 2, 3,
    0, 0, 2, 2, 1, 3, 1, 3
  ];

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function fillCodexGrid(root) {
    if (!root) return;
    root.innerHTML = "";
    MOVEMENTS.forEach(function (label, i) {
      var chip = document.createElement("span");
      chip.className = "game-ui-codex-chip";
      chip.textContent = pad(i + 1) + " · " + label;
      root.appendChild(chip);
    });
  }

  function gradeFromError(ms) {
    var e = Math.abs(ms);
    if (e <= WINDOWS.perfect) return "perfect";
    if (e <= WINDOWS.great) return "great";
    if (e <= WINDOWS.good) return "good";
    return "miss";
  }

  function gradeLabel(grade) {
    return grade.charAt(0).toUpperCase() + grade.slice(1);
  }

  function RhythmStrip(root) {
    this.root = root;
    this.highway = root.querySelector(".game-ui-highway");
    this.lanes = this.highway ? Array.prototype.slice.call(this.highway.querySelectorAll(".game-ui-lane")) : [];
    this.comboEl = root.querySelector("[data-rhythm-combo]");
    this.gradeEl = root.querySelector("[data-rhythm-grade]");
    this.statusEl = root.querySelector("[data-rhythm-status]");
    this.startBtn = root.querySelector("[data-rhythm-start]");
    this.scrollBeats = 2.2;
    this.combo = 0;
    this.maxCombo = 0;
    this.notes = [];
    this.noteEls = {};
    this.running = false;
    this.startTime = 0;
    this.raf = 0;
    this.hitLineRatio = 0.78;
    this.bind();
  }

  RhythmStrip.prototype.bind = function () {
    var self = this;
    if (this.startBtn) {
      this.startBtn.addEventListener("click", function () {
        self.toggle();
      });
    }
    if (!this.highway) return;
    this.lanes.forEach(function (lane, index) {
      lane.setAttribute("tabindex", "0");
      lane.setAttribute("role", "button");
      lane.setAttribute("aria-label", "Lane " + lane.getAttribute("data-lane"));
      lane.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        self.onLaneInput(index);
        lane.classList.add("lane-pressed");
        setTimeout(function () { lane.classList.remove("lane-pressed"); }, 120);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (!self.running) return;
      var key = e.key.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(LANE_KEYS, key)) {
        e.preventDefault();
        self.onLaneInput(LANE_KEYS[key]);
        var lane = self.lanes[LANE_KEYS[key]];
        if (lane) {
          lane.classList.add("lane-pressed");
          setTimeout(function () { lane.classList.remove("lane-pressed"); }, 120);
        }
      }
    });
  };

  RhythmStrip.prototype.buildChart = function () {
    var leadInBeats = 4;
    this.notes = CHART.map(function (lane, i) {
      return {
        id: "n" + i,
        lane: lane,
        hitMs: (leadInBeats + i * 0.5) * BEAT_MS,
        judged: false
      };
    });
    this.durationMs = this.notes[this.notes.length - 1].hitMs + BEAT_MS * 3;
  };

  RhythmStrip.prototype.toggle = function () {
    if (this.running) {
      this.stop();
    } else {
      this.start();
    }
  };

  RhythmStrip.prototype.start = function () {
    this.buildChart();
    this.combo = 0;
    this.maxCombo = 0;
    this.running = true;
    this.startTime = performance.now();
    this.noteEls = {};
    if (this.highway) {
      this.highway.querySelectorAll(".rhythm-note").forEach(function (n) { n.remove(); });
      this.highway.classList.add("is-playing");
    }
    if (this.startBtn) this.startBtn.textContent = "Stop demo";
    this.setStatus("Play! Keys D F J K or tap lanes");
    this.updateCombo();
    this.showGrade("", "");
    var self = this;
    function tick(now) {
      if (!self.running) return;
      var elapsed = now - self.startTime;
      self.spawnAndMove(elapsed);
      self.autoMiss(elapsed);
      if (elapsed >= self.durationMs) {
        self.finish();
        return;
      }
      self.raf = requestAnimationFrame(tick);
    }
    this.raf = requestAnimationFrame(tick);
  };

  RhythmStrip.prototype.stop = function () {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.highway) this.highway.classList.remove("is-playing");
    if (this.startBtn) this.startBtn.textContent = "Play rhythm strip";
    this.setStatus("Stopped");
  };

  RhythmStrip.prototype.finish = function () {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.highway) this.highway.classList.remove("is-playing");
    if (this.startBtn) this.startBtn.textContent = "Play again";
    this.setStatus("Complete — max combo ×" + this.maxCombo);
  };

  RhythmStrip.prototype.spawnAndMove = function (elapsed) {
    var highwayH = this.highway.clientHeight;
    var hitY = highwayH * this.hitLineRatio;
    var scrollPx = highwayH * 0.85;

    this.notes.forEach(function (note) {
      if (note.judged) return;
      var timeToHit = note.hitMs - elapsed;
      var progress = 1 - timeToHit / (this.scrollBeats * BEAT_MS);
      if (progress < -0.15) return;

      var el = this.noteEls[note.id];
      if (!el) {
        el = document.createElement("span");
        el.className = "rhythm-note";
        el.setAttribute("data-lane-index", String(note.lane));
        this.lanes[note.lane].appendChild(el);
        this.noteEls[note.id] = el;
      }
      var y = progress * scrollPx;
      el.style.top = Math.min(y, hitY + 40) + "px";
      el.style.opacity = progress > 1.05 ? "0.35" : "1";
    }, this);
  };

  RhythmStrip.prototype.onLaneInput = function (laneIndex) {
    if (!this.running) return;
    var elapsed = performance.now() - this.startTime;
    var best = null;
    var bestErr = Infinity;

    this.notes.forEach(function (note) {
      if (note.judged || note.lane !== laneIndex) return;
      var err = elapsed - note.hitMs;
      if (Math.abs(err) < Math.abs(bestErr)) {
        bestErr = err;
        best = note;
      }
    });

    if (!best || Math.abs(bestErr) > WINDOWS.good + 80) {
      this.registerJudgment("miss", null);
      return;
    }

    var grade = gradeFromError(bestErr);
    best.judged = true;
    var el = this.noteEls[best.id];
    if (el) {
      el.classList.add("judged-" + grade);
      setTimeout(function () { if (el.parentNode) el.remove(); }, 200);
    }
    this.registerJudgment(grade, bestErr);
  };

  RhythmStrip.prototype.autoMiss = function (elapsed) {
    this.notes.forEach(function (note) {
      if (note.judged) return;
      if (elapsed - note.hitMs > WINDOWS.good + 40) {
        note.judged = true;
        var el = this.noteEls[note.id];
        if (el) el.remove();
        this.registerJudgment("miss", null);
      }
    }, this);
  };

  RhythmStrip.prototype.registerJudgment = function (grade) {
    if (grade === "miss") {
      this.combo = 0;
    } else {
      this.combo += 1;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    }
    this.updateCombo();
    this.showGrade(grade, grade !== "miss" ? WINDOWS[grade] : null);
  };

  RhythmStrip.prototype.updateCombo = function () {
    if (this.comboEl) {
      this.comboEl.textContent = this.combo > 0 ? "COMBO × " + this.combo : "COMBO × 0";
    }
  };

  RhythmStrip.prototype.showGrade = function (grade, windowMs) {
    if (!this.gradeEl) return;
    if (!grade) {
      this.gradeEl.className = "grade-pop game-ui-floating-grade";
      this.gradeEl.innerHTML = "READY<small>tap D F J K</small>";
      return;
    }
    this.gradeEl.className = "grade-pop game-ui-floating-grade " + grade;
    var sub = grade === "miss" ? "miss" : "±" + windowMs + "ms";
    this.gradeEl.innerHTML = gradeLabel(grade).toUpperCase() + "<small>" + sub + "</small>";
  };

  RhythmStrip.prototype.setStatus = function (text) {
    if (this.statusEl) this.statusEl.textContent = text;
  };

  function animatePlaybackHead(head) {
    if (!head || reducedMotion) return;
    var staff = head.closest(".game-ui-staff");
    if (!staff || staff.closest("[data-rhythm-playground]")) return;
    var max = staff.clientWidth - 24;
    var duration = 2400;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var t = ((ts - startTime) % duration) / duration;
      var eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      head.style.left = (8 + eased * max) + "px";
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initDecorativeNotes() {
    document.querySelectorAll(".game-ui-highway[data-animated-notes]").forEach(function (highway) {
      if (highway.closest("[data-rhythm-playground]")) return;
      var lanes = highway.querySelectorAll(".game-ui-lane");
      lanes.forEach(function (lane, laneIndex) {
        for (var i = 0; i < 3; i++) {
          var glyph = document.createElement("span");
          glyph.className = "game-ui-note-glyph";
          glyph.setAttribute("aria-hidden", "true");
          glyph.style.setProperty("--glyph-delay", (laneIndex * 0.4 + i * 0.7) + "s");
          glyph.style.top = (12 + i * 28) + "%";
          lane.appendChild(glyph);
        }
      });
    });
  }

  function init() {
    document.querySelectorAll("[data-codex-grid]").forEach(fillCodexGrid);
    document.querySelectorAll(".game-ui-playback-head").forEach(animatePlaybackHead);
    initDecorativeNotes();
    document.querySelectorAll("[data-rhythm-playground]").forEach(function (el) {
      new RhythmStrip(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
