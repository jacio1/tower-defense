let audio = new Howl({
    src: ["audio/main.mp3"],
    autoplay: false,
    loop: true,
    onplay: function () {
      updatePlayPauseIcon(true);
    },
    onpause: function () {
      updatePlayPauseIcon(false);
    },
    onstop: function () {
      updatePlayPauseIcon(false);
    },
  });
  
  function toggleAudio() {
    if (audio.playing()) {
      audio.pause();
    } else {
      audio.play();
    }
  }
  
  function updatePlayPauseIcon(isPlaying) {
    const icon = document.getElementById("playPauseIcon");
    if (isPlaying) {
      icon.classList.remove("fa-volume-mute");
      icon.classList.add("fa-volume-up");
    } else {
      icon.classList.remove("fa-volume-up");
      icon.classList.add("fa-volume-mute");
    }
  }
  
  function setVolume(value) {
    audio.volume(value);
  }