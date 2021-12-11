/**
 * 1.Render songs
 * 2.Scroll top
 * 3. Play / pause /seek
 * 4.CD rotate
 * 5.Next /prev
 * 6.Random
 * 7.Next /Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORE_KEY = 'F8_';

const cd = $('.cd');
const headerTitle = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const btnPlay = $('.btn-toggle-play');
const player = $('.player');
const song = $('.song');
const progress = $('#progress');
const nextSong = $('.btn-next');
const prevSong = $('.btn-prev');
const btnRandom = $('.btn-random');
const btnRepeat = $('.btn-repeat');
const playList = $('.playlist');

let array = [];

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,

  // Lấy ra local storage
  config: JSON.parse(localStorage.getItem(PLAYER_STORE_KEY)) || {},

  // // Lưu vào local storage
  setConfig(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORE_KEY, JSON.stringify(this.config));
  },

  songs: [
    {
      name: 'Bước Qua Nhau',
      singer: 'Vũ',
      path: './assets/music/BuocQuaNhau-Vu-7120388.mp3',
      image: './assets/img/BuocQuaNhau.jpg',
    },
    {
      name: 'Bộ Tộc 2',
      singer: 'Độ Mixi',
      path: './assets/music/DoToc2-MasewDoMixiPhucDuPhao-7064730.mp3',
      image: './assets/img/BoToc2.jpg',
    },

    {
      name: 'Ái Nộ',
      singer: 'Masew, Khôi Vũ',
      path: './assets/music/AiNo1-MasewKhoiVu-7078913.mp3',
      image: './assets/img/AiNo.jpg',
    },
    {
      name: 'Thức Giấc',
      singer: 'Da LAB',
      path: './assets/music/ThucGiac-DaLAB-7048212.mp3',
      image: './assets/img/ThucGiac.jpg',
    },

    {
      name: 'Muộn Rồi Mà Sao Còn',
      singer: 'Sơn Tùng M-TP',
      path: './assets/music/MuonRoiMaSaoCon-SonTungMTP-7011803.mp3',
      image: './assets/img/MuonRoiMaSaoCon.jpg',
    },
    {
      name: 'Chúng Ta Sau Này',
      singer: 'T.R.I',
      path: './assets/music/ChungTaSauNay-TRI-6929586.mp3',
      image: './assets/img/ChungTaSauNay.jpg',
    },

    {
      name: 'Dịu Dàng Em Đến',
      singer: 'Vũ',
      path: './assets/music/DiuDangEmDen-ERIKNinjaZ-7078877.mp3',
      image: './assets/img/DiuDangEmDen.jpg',
    },
    {
      name: 'Miên Man',
      singer: 'DUTZUX',
      path: './assets/music/MienMan-DUTZUX-7120884.mp3',
      image: './assets/img/MienMan.jpg',
    },
  ],

  defineProperties() {
    Object.defineProperty(this, 'currentSongs', {
      get() {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvents() {
    const _this = this;

    // xử lý CD quay

    const cdThumbAnimation = cdThumb.animate(
      [
        {
          transform: 'rotate(360deg)',
        },
      ],
      {
        duration: 10000,
        iterations: Infinity,
      }
    );

    cdThumbAnimation.pause();

    // Scroll top
    const cdWidth = cd.offsetWidth;
    document.addEventListener('scroll', function (e) {
      const scroll =
        document.documentElement.scrollTop || document.body.scrollTop;

      const newWidth = cdWidth - scroll;

      cd.style.width = newWidth > 0 ? newWidth + 'px' : 0;

      // Chia tỷ lệ cdWidth ban đầu 100%
      cd.style.opacity = newWidth / cdWidth;
    });

    //  xử lý khi click vào play
    btnPlay.addEventListener('click', function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    });

    // khi song được play
    audio.addEventListener('play', function (e) {
      _this.isPlaying = true;
      player.classList.add('playing');
      cdThumbAnimation.play();
    });

    // khi song ko được play
    audio.addEventListener('pause', function (e) {
      _this.isPlaying = false;
      player.classList.remove('playing');
      cdThumbAnimation.pause();
    });

    audio.addEventListener('timeupdate', timeUpdate);

    function timeUpdate() {
      if (audio.duration) {
        // Chia tỷ lệ thanh nhạc từ 0% -> 100%
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );

        progress.value = progressPercent;
      }
    }

    // Hủy bỏ lắng nghe khi đang tua song seek on PC
    progress.addEventListener('mousedown', function (e) {
      audio.removeEventListener('timeupdate', timeUpdate);
    });

    // Lắng nghe thay đổi khi tua song seek on PC
    progress.addEventListener('mouseup', function (e) {
      audio.addEventListener('timeupdate', timeUpdate);

      const seek = Math.floor((audio.duration / 100) * e.target.value);
      audio.currentTime = seek;
    });

    // // Lắng nghe thay đổi khi tua song seek on Mobile
    // progress.addEventListener('input', function (e) {
    //   audio.addEventListener('timeupdate', timeUpdate);

    //   const seek = Math.floor((audio.duration / 100) * e.target.value);
    //   audio.currentTime = seek;
    // });

    // chuyển song khi next
    nextSong.addEventListener('click', function (e) {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.activeListSong();
      _this.scrollToActiveSong();
    });

    // trở lại song khi prev
    prevSong.addEventListener('click', function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.activeListSong();
      _this.scrollToActiveSong();
    });

    // Xử lý bật/ tắt RanDom song khi được active
    btnRandom.addEventListener('click', function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom);
      this.classList.toggle('active', _this.isRandom);
    });

    // Xử lý bật/ tắt repeat khi song
    btnRepeat.addEventListener('click', function (e) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat);
      this.classList.toggle('active', _this.isRepeat);
    });

    // Xử lý khi next song audio ended
    audio.addEventListener('ended', function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextSong.click();
      }
    });

    // Lắng nghe hành vi click vào playList
    playList.addEventListener('click', function (e) {
      const songElementNode = e.target.closest('.song:not(.active)');
      if (songElementNode || e.target.closest('.option')) {
        //Xử lý click vào song
        if (songElementNode) {
          _this.currentIndex = Number(songElementNode.dataset.index);
          _this.loadCurrentSong();
          _this.activeListSong();
          _this.setConfig('vietNamese', _this.currentIndex);
          audio.play();
        }

        //Xử lý click vào option
        if (e.target.closest('.option')) {
        }
      }
    });
  },

  nextSong() {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }

    this.loadCurrentSong();
  },

  prevSong() {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }

    this.loadCurrentSong();
  },

  scrollToActiveSong() {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    }, 300);
  },

  activeListSong() {
    const loopSongs = $$('.song');
    for (let song of loopSongs) {
      song.classList.remove('active');
    }

    const activeSong = loopSongs[this.currentIndex];
    activeSong.classList.add('active');
  },

  playRandomSong() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (array.includes(newIndex));

    this.currentIndex = newIndex;
    this.hasPlayedSong();

    // console.log('array:' + array, this.currentIndex);
    // [0,1,2,3,4,5,6,7] -> da phat
    // phat lai sao cho ko trung voi index da phat

    this.loadCurrentSong();
  },

  hasPlayedSong() {
    if (array.length < this.songs.length - 1) {
      array.push(this.currentIndex);
    } else {
      array = [];
      array.push(this.currentIndex);
    }

    console.log(array);
  },

  loadCurrentSong() {
    headerTitle.textContent = this.currentSongs.name;
    cdThumb.style.backgroundImage = 'url(' + this.currentSongs.image + ')';
    audio.src = this.currentSongs.path;
  },

  loadConfig() {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;

    if (this.config.vietNamese >= 0) {
      this.currentIndex = this.config.vietNamese;
    }

    if (this.isRandom) {
      btnRandom.classList.toggle('active', this.isRandom);
    }

    if (this.isRepeat) {
      btnRepeat.classList.toggle('active', this.isRepeat);
    }
  },

  renderListSong() {
    const html = this.songs.map((song, index) => {
      return `<div class="song ${
        index === this.currentIndex ? 'active' : ''
      }" data-index="${index}" >
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`;
    });
    playList.innerHTML = html.join('');
  },

  start() {
    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    // Định nghĩa thuộc tính
    this.defineProperties();

    // lắng nghe các sự kiện xảy ra
    this.handleEvents();

    // tải bản nhạc đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    // render play-list
    this.renderListSong();
  },
};

app.start();
