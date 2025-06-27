const bg = document.querySelector('.bg');
const audio = document.querySelector('audio');
const lyricsBox = document.querySelector('.lyricsBox').firstElementChild;
const lyricsList = document.querySelector('.lyrics');
const coverImg = document.querySelector('.coverImg').firstElementChild;
const coverText = document.querySelector('.cover').children[1];
const search = document.querySelector('.search>input');
const songList = document.querySelector('.list');
let listPlayIcon=[];
const colorChoose = document.querySelector('.colorChoose');

const centerTime = document.querySelector('.time');
const indicator = document.querySelector('.indicator');
const centerIcon = document.querySelector('.center.fa-play');

const playIcon = document.querySelector('.buttonBox .fa-play');
const loveIcon = document.querySelector('.buttonBox .fa-heart');

let playbackMode = 0; // 0: 顺序播放 1: 随机播放 2: 单曲循环
const modeIcons = document.querySelector('.buttonBox').firstElementChild.children;

let nowShowTime, nowTime;
let songQuantity = 7, songIndex = 0;
let nowSize, nowColor;
let scrollTimeout;

let isUserScrolling = false;
let isPlaying = false;
let iscanplay = false;
let ishover = false;
let isLoved = new Array(songQuantity).fill(false);

//设置音乐
function setMusic(music) {
    audio.src = music;
    if (iscanplay) {
        audio.play();
    }
}

//设置歌词
function setLyrics(lyrics, time) {
    lyricsList.innerHTML = '';
    for (let i = 1; i <= nowSize; i++) {
        const p = document.createElement('p');
        p.innerHTML = lyrics[i];
        p.setAttribute('data-time', time[i]);
        if (i == 1) {
            p.className = 'active ' + nowColor;
        }
        lyricsList.appendChild(p);
    }
}

//设置封面
function setCover(cover, title, singer) {
    coverImg.src = cover;
    coverText.innerHTML = '';
    const p1 = document.createElement('p');
    const p2 = document.createElement('p');
    p1.innerHTML = title;
    p2.innerHTML = singer;
    coverText.appendChild(p1);
    coverText.appendChild(p2);
}

//找元素中心Y坐标
function getCenterY(obj) {
    const objRect = obj.getBoundingClientRect();
    const objCenterY = objRect.top + objRect.height / 2;
    return objCenterY;
}

//设置显示中心元素
function setCenterElement(index) {
    centerTime.innerHTML = nowShowTime[index];
    centerTime.classList.remove('hidden');
    indicator.classList.remove('hidden');
    centerIcon.classList.remove('hidden');
}

//设置不显示中心元素
function unsetCenterElement() {
    centerTime.classList.add('hidden');
    indicator.classList.add('hidden');
    centerIcon.classList.add('hidden');
}

//定位中心歌词时间
function locateCenterTime() {
    const containerCenterY = getCenterY(lyricsBox);
    let closest = 0;
    let minDistance = Infinity;
    for (let i = 1; i <= nowSize; i++) {
        const p = document.querySelector(`.lyrics>p:nth-child(${i})`);
        const pCenterY = getCenterY(p);
        const distance = Math.abs(pCenterY - containerCenterY);
        if (distance < minDistance) {
            minDistance = distance;
            closest = i;
        }
    }
    return closest;
}

//监听鼠标移入移出
lyricsBox.addEventListener('mouseenter', () => {
    ishover = true;
});
lyricsBox.addEventListener('mouseleave', () => {
    ishover = false;
});

//监听用户手动滚动
lyricsBox.addEventListener('scroll', () => {
    if (!ishover) {
        return;
    }
    isUserScrolling = true;
    setCenterElement(locateCenterTime());
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isUserScrolling = false;
        unsetCenterElement();
    }, 1000);
});

//定位当前歌词
function locateCurrentLyric() {
    const now = audio.currentTime;
    for (let i = 1; i <= nowSize; i++) {
        const p = document.querySelector(`.lyrics>p:nth-child(${i})`);
        if (now >= nowTime[i] && now < nowTime[i + 1]) {
            p.className = 'active ' + nowColor;
            if (!isUserScrolling) {
                p.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
        else {
            p.className = '';
        }
    }
}
audio.addEventListener('timeupdate', locateCurrentLyric);

//点击歌词跳转
lyricsList.addEventListener('click', (e) => {
    if (e.target.tagName == 'P') {
        audio.currentTime = e.target.getAttribute('data-time');
    }
    audio.play();
});

//播放和暂停
playIcon.parentNode.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
    }
    else {
        audio.play();
    }
});
songList.addEventListener('click', (e) => {
    if (e.target.tagName == 'I') {
        if (e.target.className.indexOf('fa-pause') != -1) {
            audio.pause();
        }
        if (e.target.className.indexOf('fa-play') != -1) {
            audio.play();
        }
    }
})
audio.addEventListener('play', () => {
    isPlaying = true;
    playIcon.className = 'fa-solid fa-pause fa-xl';
    listPlayIcon[songIndex].className = 'fa-solid fa-pause fa-lg';
    coverImg.classList.remove('paused');
});
audio.addEventListener('pause', () => {
    isPlaying = false;
    playIcon.className = 'fa-solid fa-play fa-xl';
    listPlayIcon[songIndex].className = 'fa-solid fa-play fa-lg';
    coverImg.classList.add('paused');
});

//标记当前播放歌曲
function setCurrentSong() {
    for (let i = 0; i < songQuantity; i++) {
        songList.children[i].children[3].classList.add('hidden');
    }
    songList.children[songIndex].children[3].classList.remove('hidden');
}

//选择颜色
function chooseColor(op) {
    bg.className = 'bg ' + op;
    nowColor = op;
    locateCurrentLyric();
}
colorChoose.addEventListener('click', (e) => {
    if (e.target.parentNode.className.indexOf('color ') != -1) {
        chooseColor(e.target.parentNode.className.split(' ')[1]);
    }
});


//选择歌曲
function chooseSong(op) {
    songIndex = op;
    nowSize = size[op];
    nowShowTime = showTime[op];
    nowTime = time[op];
    setMusic(music[op]);
    setLyrics(lyrics[op], time[op]);
    setCover(cover[op], title[op], singer[op]);
    setLoved();
    setCurrentSong();
}

//设置播放模式
function setPlaybackMode() {
    for (let i = 0; i < 3; i++) {
        modeIcons[i].classList.add('none');
    }
    modeIcons[playbackMode].classList.remove('none');
    if (playbackMode == 2) {
        modeIcons[0].classList.remove('none');
    }
}
modeIcons[0].parentNode.addEventListener('click', () => {
    playbackMode = (playbackMode + 1) % 3;
    setPlaybackMode();
});

//随机选择歌曲
function chooseRandomSong() {
    let randomIndex = Math.floor(Math.random() * songQuantity);
    while (randomIndex == songIndex) {
        randomIndex = Math.floor(Math.random() * songQuantity);
    }
    chooseSong(randomIndex);
}

//监听播放结束
audio.addEventListener('ended', () => {
    if (playbackMode == 0) {
        chooseSong((songIndex + 1) % songQuantity);
    }
    else if (playbackMode == 1) {
        chooseRandomSong();
    }
    else {
        chooseSong(songIndex);
    }
});

//设置歌曲列表
function setSongList() {
    for (let i = 0; i < songQuantity; i++) {
        const div = document.createElement('div');
        div.innerHTML = `
            <img src="${cover[i]}">
            <p><span>${title[i]}</span><br>${singer[i]}</p>
            <i class="fa-regular fa-heart fa-lg"></i>
            <i class="fa-solid fa-play fa-lg"></i>`;
        listPlayIcon[i] = div.children[3];
        div.className = 'song';
        div.setAttribute('data-index', i);
        div.addEventListener('click', (e) => {
            if (e.target.tagName == 'I') {
                return;
            }
            if (e.target.tagName == 'DIV') {
                e = e.target;
            }
            else if (e.target.tagName == 'SPAN') {
                e = e.target.parentNode.parentNode;
            }
            else {
                e = e.target.parentNode;
            }
            chooseSong(e.getAttribute('data-index'));
        });
        songList.appendChild(div);
    }
}

//搜索歌曲
search.addEventListener('input', () => {
    for (let i = 0; i < songQuantity; i++) {
        const p = songList.children[i].children[1];
        if (p.innerHTML.indexOf(search.value) != -1) {
            songList.children[i].classList.remove('none');
        }
        else {
            songList.children[i].classList.add('none');
        }
    }
});

//选择上一首下一首
document.querySelector('.fa-backward-step').addEventListener('click', () => {
    if (playbackMode == 1) {
        chooseRandomSong();
        return;
    }
    chooseSong((Number(songIndex) - 1 + songQuantity) % songQuantity);
});
document.querySelector('.fa-forward-step').addEventListener('click', () => {
    if (playbackMode == 1) {
        chooseRandomSong();
        return;
    }
    chooseSong((Number(songIndex) + 1) % songQuantity);
});

//标记喜欢
function setLoved() {
    if (isLoved[songIndex]) {
        loveIcon.className = 'fa-solid fa-heart fa-lg';
    }
    else {
        loveIcon.className = 'fa-regular fa-heart fa-lg';
    }
}
loveIcon.parentNode.addEventListener('click', () => {
    if (isLoved[songIndex]) {
        isLoved[songIndex] = false;
    }
    else {
        isLoved[songIndex] = true;
    }
    setLoved();
    for (let i = 0; i < songQuantity; i++) {
        if (isLoved[i]) {
            songList.children[i].children[2].className = 'fa-solid fa-heart fa-lg';
        }
        else {
            songList.children[i].children[2].className = 'fa-regular fa-heart fa-lg';
        }
    }
});
songList.addEventListener('click', (e) => {
    if (e.target.tagName == 'I') {
        if (e.target.className.indexOf('fa-heart') != -1) {
            if (e.target.className.indexOf('fa-solid') != -1) {
                e.target.className = 'fa-regular fa-heart fa-lg';
                isLoved[e.target.parentNode.getAttribute('data-index')] = false;
            }
            else {
                e.target.className = 'fa-solid fa-heart fa-lg';
                isLoved[e.target.parentNode.getAttribute('data-index')] = true;
            }
            if (e.target.parentNode.getAttribute('data-index') == songIndex) {
                setLoved();
            }
        }
    }
});

//初始化
window.onload = () => {
    setSongList();
    chooseSong(0);
    chooseColor('blue');
    iscanplay = true;
}