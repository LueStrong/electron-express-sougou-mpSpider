const e = function (selector) {
    return document.querySelector(selector)
};

var moneyBtn = e('#id-button-money')
var img = e('#img')

moneyBtn.addEventListener("click", function(){
  if(img.className == "show" ){
  　img.className = "hide";
  }else{
  img.className='show';
  }
})

var addButton = e('#add-list')
addButton.addEventListener('click', function () {
    var r = new XMLHttpRequest()
    r.open('GET', '/article.json', true)
    // r.setRequestHeader('Content-Type', 'application/json')
    r.onreadystatechange = function () {
        if (r.readyState === 4) {
            // console.log('state change', r, r.status, r.response)
            response = JSON.parse(r.response)
            // console.log('response', response)
        } else {
            console.log('change')
        }
    }
    r.send()
    for (var i = 0; i < response.length; i++) {
        title = response[i].title
        if (response[i].videoUrl == undefined || '') {
            response[i].videoUrl = "https://v.qq.com/iframe/preview.html?width=500&height=375&auto=0&vid=y0502vubduz";
        }
        videoUrl = 'https://v.qq.com/txp/iframe/player.html?vid=' + response[i].videoUrl.split('vid=')[1].slice(0,11)

        coverUrl = response[i].coverUrl
        const Container = e('.container');
        const t = templateVideo(title, videoUrl, coverUrl);

        Container.insertAdjacentHTML('beforeend', t)
    }
    console.log('click');

})

const templateVideo = function (title, videoUrl, coverUrl) {


    return `
    <div class="">
        <p>${title}</p>
        <iframe frameborder="0" src="${videoUrl}" allowFullScreen="true" width="500" height="375"></iframe>
        <img width=150px height=150px src="http://img01.store.sogou.com/net/a/04/link?appid=100520029&url=${coverUrl}" alt="">
    </div>
    `
}

// <iframe frameborder="0" width="500" height="375" allow="autoplay; fullscreen" allowfullscreen="true" src="${videoUrl}"></iframe>