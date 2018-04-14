var imgurl = localStorage.getItem("background-img");
// var refreshIntervalId = setInterval(function() {
//   var imgurl = localStorage.getItem("background-img");
//   if (imgurl) {
//     document.body.style.backgroundImage = "linear-gradient( rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) ), " + imgurl;
//     clearInterval(refreshIntervalId);
//   } else {
//     getRandomUnsplashImage();
//   }
// }, 1);

var old;
var btn = document.getElementById("upload-btn-id")
btn.addEventListener("click", showUploadBtn);
const unsplashURL = "https://api.unsplash.com";
const accessKey = "?client_id=d836aa06071e146507104cb6ea769fce4eb40f9bd2d34bca0d857f8759207b6f";

if (imgurl) {
  document.body.style.backgroundImage = "linear-gradient( rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) ), " + imgurl;
  clearInterval(refreshIntervalId);
} else {
  getRandomUnsplashImage();
}

function getRandomUnsplashImage() {
  $.get(
    unsplashURL + "/photos/random/" + accessKey,
    {"orientation" : "landscape"},
    function(data) {
      console.log(data.links.download_location);
      const imageUrl = data.urls.raw;
      if (data.errors) {
        console.log(data.errors);
      }
      $('#unsplash-author-link').attr("href", data.user.links.self);
      $('#unsplash-author-link').text(data.user.name);
      console.log(imageUrl);
      document.body.style.backgroundImage = "linear-gradient( rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) ), " + `url(${imageUrl})`;
    }
);
}

function showUploadBtn() {
    var x = document.createElement("INPUT");
    x.setAttribute("type", "file");
    x.setAttribute("accept", "image/*");
    x.classList.toggle("upload-btn")
    x.onchange = gotImage;
    document.getElementById("settings-popup").replaceChild(x, btn);
    btn = x;
}

function removeUploadBtn() {
    var x = document.createElement("BUTTON");
    x.innerHTML = "Change Background";
    x.setAttribute("id", "upload-btn-id");
    x.classList.toggle("upload-btn")
    x.addEventListener("click", showUploadBtn);

    document.getElementById("settings-popup").replaceChild(x, btn);
    btn = x;
}

function gotImage(event) {
  var file = event.target.files[0];
  var reader = new FileReader();
  reader.onload = function(event) {
    var imgurl = 'url(' + event.target.result + ')'
    document.body.style.backgroundImage = "linear-gradient( rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) ), " + imgurl;
    localStorage.setItem("background-img", imgurl);
    removeUploadBtn();
  };

  reader.readAsDataURL(file);
}
