let videoPlayer = document.getElementById("video-player");
let subtitlesContainer = document.getElementById("subtitle-container");
let subtitles = [];
let prevSubs = [];

function parseSRT(data) {
  const subtitles = [];
  const lines = data.split("\n").map((line) => line.trim());
  let currentIndex = -1;
  lines.forEach((line) => {
    if (/^\d+$/.test(line)) {
      currentIndex++;
    } else if (/^\d+:\d+:\d+,\d+ --> \d+:\d+:\d+,\d+$/.test(line)) {
      let [startTime, endTime] = line
        .split(" --> ")
        .map((time) => time.replace(",", "."));
      startTime = timeToSeconds(startTime);
      endTime = timeToSeconds(endTime);
      subtitles[currentIndex] = { startTime, endTime, text: "" };
    } else if (line === "") {
      currentIndex++;
    } else {
      subtitles[currentIndex].text += "\n" + line;
    }
  });
  return subtitles;
}

function parseASS(data) {
  const lines = data
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("Dialogue:"));
  return lines.map((line) => {
    const data = line.split(",");
    const text = data[9].split("\\N").join("\n");
    return {
      startTime: timeToSeconds(data[1]),
      endTime: timeToSeconds(data[2]),
      text,
    };
  });
}

const handleVideoInputChange = () => {
  const fileInput = document.getElementById("video-input");
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      videoPlayer.src = URL.createObjectURL(file);
      document.title = file.name;
    };

    reader.readAsDataURL(file);
  }
};

const handleSubtitleFileChange = () => {
  const subtitleFileInput = document.getElementById("subtitle-file-input");
  const file = subtitleFileInput.files[0];
  if (file) {
    const ext = file.name.split(".").pop();
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      switch (ext) {
        case "srt":
          subtitles = parseSRT(content);
          break;
        case "ass":
          subtitles = parseASS(content);
          break;
        default:
          alert("Invalid subtitle file");
          return;
      }
    };
    reader.readAsText(file);
  }
};

const timeToSeconds = (timeString) => {
  const [hours, minutes, secondsWithMillis] = timeString.split(":");
  const seconds = parseFloat(secondsWithMillis.replace(/,/g, "."));
  const totalSeconds =
    parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + seconds;
  return totalSeconds;
};

const displaySubtitles = () => {
  const currentTime = videoPlayer.currentTime + offset;
  const currentSubs = subtitles.filter(
    (subtitle) =>
      currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
  );
  let changed = prevSubs.length !== currentSubs.length;
  if (!changed) {
    for (let i = 0; i < prevSubs.length; i++) {
      if (prevSubs[i].text !== currentSubs[i].text) {
        changed = true;
        break;
      }
    }
  }
  if (changed) {
    prevSubs = currentSubs;
    subtitlesContainer.innerHTML = "";
    currentSubs.forEach((subtitle) => {
      const lines = subtitle.text.split("\n");
      lines.forEach((line) => {
        const subtitleElement = document.createElement("div");
        subtitleElement.innerText = line;
        subtitlesContainer.appendChild(subtitleElement);
      });
    });
  }
};

let offset = 0;
const handleSubtitleOffsetChange = () => {
  const subtitleoffsetInput = document.getElementById("subtitle-offset");
  offset = parseInt(subtitleoffsetInput.value, 10) / 1000;
  displaySubtitles();
};

const rewindTime = 10;
document.addEventListener("keydown", function (event) {
  if (document.activeElement !== document.body) {
    return;
  }

  if (event.key === "ArrowLeft" || event.key === "Left") {
    // Rewind by the specified time
    videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - rewindTime);
  }
  if (event.key === "ArrowRight" || event.key === "Right") {
    // Fast forward by the specified time
    videoPlayer.currentTime = Math.min(
      videoPlayer.duration,
      videoPlayer.currentTime + rewindTime
    );
  }

  if (event.key === " ") {
    // Toggle between play and pause
    if (videoPlayer.paused) {
      videoPlayer.play();
    } else {
      videoPlayer.pause();
    }
  }
});

const darkModeKey = "darkMode";
let darkMode = localStorage.getItem(darkModeKey) === "false" ? false : true;
const toggleModeBtn = document.getElementById("toggle-mode-btn");
const toggleDarkMode = () => {
  darkMode = !darkMode;
  updateTheme();
};
const updateTheme = () => {
  if (darkMode) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  toggleModeBtn.innerText = darkMode ? "Light" : "Dark";
  localStorage.setItem(darkModeKey, darkMode);
};
updateTheme();

document
  .getElementById("video-input")
  .addEventListener("change", handleVideoInputChange);
document
  .getElementById("subtitle-file-input")
  .addEventListener("change", handleSubtitleFileChange);
document
  .getElementById("subtitle-offset")
  .addEventListener("change", handleSubtitleOffsetChange);
videoPlayer.addEventListener("timeupdate", displaySubtitles);
toggleModeBtn.addEventListener("click", toggleDarkMode);
