(() => {
  const info = document.querySelector(".achiv_switcher_info");
  if (!info || document.querySelector(".jutsu-hbfs-times")) return;

  const video = document.querySelector(".videoContent");
  if (!video) return;

  function show(lines) {
    const list = document.createElement("small");
    list.className = "jutsu-hbfs-times";
    for (const { text, description } of lines) {
      const row = document.createElement("small");
      row.textContent = text;
      if (description) row.title = description;
      list.append(row);
    }

    const episode = video.closest(".videoBlockWrapp");
    let heading = episode?.querySelector(".video_plate_title > span");
    if (!heading) {
      // Naruto uses a banner with cover art instead of the usual title plate.
      const plate = document.createElement("div");
      plate.className = "video_plate_title";
      heading = document.createElement("span");
      plate.append(heading);
      video.before(plate);
    }
    heading.append(list);
  }

  function renderAchievements() {
    // The site's overlay plugin stores its Video.js components on the player.
    const player = window.videojs?.getPlayers?.()["my-player"];
    const overlays = player?.overlays_;
    if (!Array.isArray(overlays)) return false;

    const entries = [];
    for (const overlay of overlays) {
      const element = overlay.el();
      const title = element.querySelector(".achievement_text_style_top");
      if (!title) continue;

      const seconds = Math.floor(Number(overlay.options_.start));
      if (!Number.isFinite(seconds) || seconds < 0) continue;

      const name = title.textContent.trim().replace(/^«(.*)»$/s, "$1");
      const time = Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
      entries.push({
        seconds,
        text: name + ": " + time,
        description: element.querySelector(".achievement_text_style_bottom")?.textContent
      });
    }
    if (!entries.length) return false;
    show(entries.sort((a, b) => a.seconds - b.seconds));
    return true;
  }

  if (renderAchievements()) return;
  if (typeof some_achiv_str === "undefined") {
    if (!info.querySelector(".just_show_login_btn")) {
      show([{ text: "Все достижения получены" }]);
    }
    return;
  }

  // The player may initialize after document_idle or on first playback.
  const observer = new MutationObserver(() => {
    if (renderAchievements()) observer.disconnect();
  });
  observer.observe(video, { childList: true, subtree: true });
})();
