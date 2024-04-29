let audio = new Howl({
    src: ["audio/main.mp3"],
    autoplay: false, // Установите false, так как мы не хотим автовоспроизведение
    loop: true,
    onplay: function() {
      updatePlayPauseIcon(true);
    },
    onpause: function() {
      updatePlayPauseIcon(false);
    },
    onstop: function() {
      updatePlayPauseIcon(false);
    }
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
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
    } else {
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    }
  }
  
  function setVolume(value) {
    audio.volume(value);
  }
  