const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "1090",
    width: "840",
    videoId: "1qLThLCHf5M",
    playerVars: {
      playlist: "1qLThLCHf5M",
      loop: 1,
      autoplay: 1,
      controls: 0,
    },
    events: {
      onReady: onPlayerReady,
    },
  });
}

function onPlayerReady(event) {
  event.target.playVideo();
}
