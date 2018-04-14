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
const accessKey = "?client_id=3d8111e69c640e53830744a10af75c353f60247e6480a6ebe24f6886a7b08bb3";

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
      const imageUrl = data.links.download_location;
      if (data.errors) {
        console.log(data.errors);
      }
      $('#unsplash-author-link').attr("href", data.urls.raw);
      console.log(imageURL);
      document.body.style.backgroundImage = "linear-gradient( rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) ), " + `url(${imageURL})`;
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
