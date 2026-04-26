/* AI辅助生成框架: 豆包网页端, 2026-04-21 17:00-18:40;*/
// ==================== 全局状态 ====================
let soundEnabled = false;
let currentSound = null;

// ==================== Toast ====================
function showToast(message, duration = 2500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ==================== 工具 ====================
function gotoSection(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/*function closeDetail() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.style.animation = 'modalFadeOut 0.3s ease forwards';
    setTimeout(() => {
      modal.style.display = 'none';
      modal.style.animation = '';document.body.style.overflow = '';
    }, 280);
  }
}*/

// ==================== 移动端菜单 ====================
function toggleMenu() {
  document.getElementById('hamburger').classList.toggle('active');
  document.getElementById('navMenu').classList.toggle('mobile-open');
}
function closeMenu() {
  document.getElementById('hamburger').classList.remove('active');
  document.getElementById('navMenu').classList.remove('mobile-open');
}

// ====================粒子背景 ====================
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width= canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.6 + 0.2
  }));

  (function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,175,55,${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  })();
}

// ==================== 滚动进入动画 ====================
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.querySelectorAll('.perf-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.val + '%';
        });
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ==================== 智能导航高亮 ====================
function initSmartNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-menu a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (scrollY >= s.offsetTop - 220) current = s.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('nav-active','nav-palace','nav-residence','nav-bridge','nav-craft');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('nav-active');
        const map = {
          palace:'nav-palace', residence:'nav-residence',
          bridge:'nav-bridge', craft:'nav-craft'
        };
        if (map[current]) link.classList.add(map[current]);
      }
    });
  });
}

// ==================== 图表响应式 ====================
function initChartResize() {
  const ids = ['chart-time','chart-area','chart-param','chart-mechanics','chart-rank'];
  window.addEventListener('resize', () => {
    ids.forEach(id => {
      const inst = echarts.getInstanceByDom(document.getElementById(id));
      if (inst) inst.resize();
    });
  });
}

// ==================== 环境音（彻底重写版）====================

// 全局唯一音频实例
let _sound = null;
let _soundPlaying = false;

// 不再用 initAmbientSounds绑定按钮
// 按钮直接用 onclick 属性调用，避免一切事件绑定问题
function initAmbientSounds() {
  // 什么都不做，按钮已经在HTML 里绑定 onclick
 // console.log('音频模块已初始化');
}

// ★ 开始播放 ★
function startSound(soundType) {
  soundType = soundType || 'general';

  // 如果已经在播放，先停掉
  if (_sound) {
    _sound.stop();
    _sound.unload();
    _sound = null;
  }

  const soundFiles = {
    palace:    'audio/palace.mp3',
    courtyard: 'audio/courtyard.mp3',
    south:     'audio/south.mp3',
    bridge:    'audio/bridge.mp3',
    general:   'audio/general.mp3'
  };

  const names = {
    palace: '宫廷鼓乐', courtyard: '四合院晨声',
    south:  '江南丝竹', bridge:    '流水禅音',
    general:'古建环境音'
  };

  _sound = new Howl({
    src: [soundFiles[soundType] || soundFiles.general],
    loop:true,
    volume: 0.45,

    onplay: function() {
      _soundPlaying = true;
      _showPlayingUI();
      showToast('🎵 正在播放：' + (names[soundType] || '环境音效'));
    },

    onloaderror: function() {
      _soundPlaying = false;
      _sound = null;
      _showStoppedUI();
      showToast('⚠️ 音频文件未找到，请在 audio/ 文件夹放入mp3');
    }
  });

  _sound.play();
}

// ★ 停止播放 ★
function stopSound() {
  if (_sound) {
    _sound.stop();
    _sound.unload();
    _sound = null;
  }
  _soundPlaying = false;
  _showStoppedUI();
  showToast('🔇 环境音已停止');
}

// ★ 弹窗内专用：切换指定场景音★
function playSpecificSound(soundType) {
  startSound(soundType);
}

// ★ 旧版兼容（Banner按钮曾用此函数）★
function toggleAmbientSound() {
  if (_soundPlaying) {
    stopSound();
  } else {
    startSound('general');
  }
}

// 内部：显示"播放中"状态
function _showPlayingUI() {
  const playBtn= document.getElementById('soundPlayBtn');
  const stopBtn   = document.getElementById('soundStopBtn');
  const volumeBox = document.getElementById('volumeBox');

  if (playBtn)playBtn.style.display   = 'none';
  if (stopBtn)   stopBtn.style.display   = 'inline-flex';
  if (volumeBox) volumeBox.style.display = 'flex';
}

// 内部：显示"已停止"状态
function _showStoppedUI() {
  const playBtn   = document.getElementById('soundPlayBtn');
  const stopBtn   = document.getElementById('soundStopBtn');
  const volumeBox = document.getElementById('volumeBox');

  if (playBtn)   playBtn.style.display   = 'inline-flex';
  if (stopBtn)   stopBtn.style.display   = 'none';
  if (volumeBox) volumeBox.style.display = 'none';
}

// 音量控制
function changeVolume(val) {
  if (_sound) {
    _sound.volume(val / 100);
  }
}



// ==================== 建筑详情数据 ====================
const buildingData = {
  taihedian: {
    name: '故宫太和殿',
    img:'images/buildings/taihedian.jpg', video: 'video/taihedian.mp4',
    // ★需要修改★ 如果你的图片路径不同，修改上面的 img 路径
    desc: '太和殿，俗称"金銮殿"，是故宫乃至中国现存最高等级的古代宫殿建筑。始建于明永乐十八年（1420年），面阔11间，进深5间，高35.05米，建筑面积2377平方米。重檐庑殿顶，覆黄色琉璃瓦，象征至高无上的皇权礼制。',
    sound: 'palace',
    features: [
      '屋顶形制：重檐庑殿顶（最高等级，九五之尊）',
      '建筑面积：2377㎡，面阔11间（最高规格）',
      '结构特点：72根大楠木柱，斗拱层数多达11踩',
      '琉璃瓦色：黄色（皇帝专用最高等级）',
      '抗震原理：榫卯柔性连接 + 斗拱层减震缓冲',
      '历史意义：明清两朝举行重大典礼的核心场所'
    ],
    fact: '📐 太和殿的72根柱子中，有6根"沥粉贴金"缠龙柱，直径达1.06米。整座建筑不用一颗铁钉，全靠榫卯咬合，已稳立600年。'
  },
  qianqinggong: {
    name: '故宫乾清宫',video: 'video/qianqinggong.mp4',

    img:  'images/buildings/qianqinggong.jpg',
    desc: '乾清宫是内廷后三宫之首，明代皇帝的寝宫，清代成为皇帝理政、接见臣工和外国使节的重要场所。重檐歇山顶，面阔9间，高约20米，"正大光明"匾额高悬其上，清代秘密立储的诏书藏于匾后。',
    sound: 'palace',
    features: [
      '屋顶形制：重檐歇山顶（次高等级）',
      '建筑高度：约20米，面阔9间',
      '历史功能：明代皇帝寝宫，清代御门听政场所',
      '"正大光明"匾：清代秘密立储诏书存放处',
      '内部装饰：金砖铺地，楠木大柱，彩绘天花',
      '礼制地位：内廷三宫之首，帝王权威象征'
    ],
    fact: '🏮 清代雍正皇帝首创"秘密立储制度"，将继位诏书密封于"正大光明"匾后，彻底改变了中国皇权继承的传统方式。'
  },
  siheyuan: {
    name: '北京四合院',video: 'video/siheyuan.mp4',

    img:  'images/buildings/siheyuan.jpg',
    desc: '四合院是北方传统民居建筑的典型代表，以中轴对称、四面围合为核心布局原则。正房、厢房、倒座房围合出内向型院落，体现了中国儒家礼制的家族伦理秩序。青砖灰瓦、木雕门楼，既防寒保温又彰显门第。',
    sound: 'courtyard',
    features: [
      '布局形式：中轴对称，正房坐北朝南（采光最优）',
      '围合结构：正房 + 东西厢房 + 倒座房，内向封闭',
      '气候适应：高墙封闭防风沙，内院保温防寒',
      '材料特点：青砖灰瓦，砖木混合结构',
      '礼制体现：长幼有序，正房归长辈，厢房给晚辈',
      '装饰艺术：门楼砖雕、影壁彩绘、垂花门精雕'
    ],
    fact: '🏠 标准四合院的大门朝向极有讲究：官员宅第大门开在东南角（"巽"位），普通民居则朝南开，门楼规格严格对应主人的社会等级。'
  },
  huipai: {
    name: '徽派马头墙民居',video: 'video/huipai.mp4',

    img:  'images/buildings/huipai.jpg',
    desc: '徽派建筑是中国南方民居的杰出代表，以"粉墙黛瓦马头墙"为显著特征。天井通风采光，高耸的马头墙防火防雨，精美的"三雕"（砖雕、木雕、石雕）承载着徽商的精神文化。依山傍水，与自然山水融为一体。',
    sound: 'south',
    features: [
      '防火设计：马头墙高出屋顶，有效隔断火势蔓延',
      '通风采光：天井形成"穿堂风"，适应南方潮湿气候',
      '三雕艺术：砖雕门楼、木雕梁架、石雕础柱精绝',
      '色彩美学：粉墙黛瓦，与山水环境高度和谐',
      '防潮结构：石础抬柱，防止木柱受潮腐烂',
      '选址智慧：枕山面水，背山为屏，前水为镜'
    ],
    fact: '🌧️ 徽派天井并非单纯审美，而是精妙的气候调节系统——雨水落入天井称"四水归堂"，寓意财源滚滚，同时有效收集雨水并调节室内温湿度。'
  },
  zhaozhouqiao: {
    name: '赵州安济桥',video: 'video/zhaozhouqiao.mp4',

    img:  'images/buildings/zhaozhouqiao.jpg',
    desc: '赵州桥建于隋代大业年间（595—605年），由工匠李春主持建造，是世界上现存最早、保存最完好的大跨度敞肩圆弧石拱桥。主跨37.02米，全长50.82米，距今已有1400余年历史，比欧洲同类桥梁早约1200年。',
    sound: 'bridge',
    features: [
      '核心创新：敞肩拱设计——主拱两侧各有2个小拱',
      '减重效果：敞肩小拱减轻桥体自重约60吨',
      '泄洪功能：洪水时小拱过水，大幅减小水流冲力',
      '拱形选择：圆弧拱（非半圆）降低桥面坡度利于通行',
      '施工工艺：28条并列独立石拱，便于维修替换',
      '历史地位：比欧洲敞肩拱桥早出现约1200年'
    ],
    fact: '🌉 赵州桥1400年来历经10次大洪水、8次战争、多次地震，仍屹立不倒。其敞肩拱结构原理，直到19世纪才在欧洲被独立"重新发明"。'
  },
  lugouqiao: {
    name: '卢沟桥',video: 'video/lugouqiao.mp4',

    img:  'images/buildings/lugouqiao.jpg',
    desc: '卢沟桥始建于金大定二十九年（1189年），是北京现存最古老的多孔联拱石桥。全桥11孔，总长266.5米，桥上雕有501尊形态各异的石狮，"卢沟晓月"被列为燕京八景之一，1937年"七七事变"在此爆发。',
    sound: 'bridge',
    features: [
      '工程规模：11孔联拱，总长266.5m，宽9.3m',
      '石狮艺术：501尊石狮，形态各异无一相同',
      '地基工艺：桥墩迎水面设分水尖，减缓水流冲刷',
      '燕京八景："卢沟晓月"，历代文人题咏不断',
      '历史意义：1937年七七事变爆发地，抗战起点',
      '意大利记录：马可·波罗称其为"世界上最好的桥"'
    ],
    fact: '🦁 卢沟桥石栏柱头的狮子数量历来争议不断，有"卢沟桥的狮子——数不清"的歇后语。经1979年文物局精确普查，共确认501尊石狮。'
  }
};

// ==================== 详情弹窗 ====================
// AI辅助: DeepSeek辅助弹窗和Pannellum调用2026-04-22 13:00-15:30
function openDetail(buildingId) {
  const data= buildingData[buildingId];
  if (!data) return;
  const modal   = document.getElementById('modal');
  const content = document.getElementById('modal-content');

  content.innerHTML = `
    <h2 style="margin-bottom:14px;color:#1f1b17;border-bottom:3px solid #d4af37;
               padding-bottom:10px;font-size:1.8rem;">
      ${data.name}
    </h2>
    <div class="modal-img-container">
  <img src="${data.img}" alt="${data.name}"
       onerror="this.src='images/placeholder.jpg'">
  <div class="img-overlay-tip">▶ 点击图片观看讲解视频</div>
</div>

    <p class="modal-desc">${data.desc}</p>
    <div class="modal-features">
      <h3><i class="fas fa-list-check" style="color:#d4af37"></i> 核心建筑特征</h3>
      <ul>${data.features.map(f => `<li>${f}</li>`).join('')}</ul>
    </div>
    <div class="fun-fact">
      <i class="fas fa-lightbulb"></i>
      <span>${data.fact}</span>
    </div>
    <div class="modal-interactive">
      <h3><i class="fas fa-hand-pointer" style="color:#d4af37"></i> 互动体验</h3>
      <button class="modal-btn gold-btn" onclick="openPanorama('${buildingId}')">
        <i class="fas fa-vr-cardboard"></i> 360° 全景漫游
      </button>
      <button class="modal-btn" onclick="playSpecificSound('${data.sound}')">
        <i class="fas fa-headphones"></i> 开启环境音
      </button>
      <button class="modal-btn"
              onclick="closeDetail()"
              style="background:linear-gradient(135deg,#555,#333)">
        <i class="fas fa-times"></i> 关闭
      </button>
    </div>
  `;

  content.querySelector('.modal-img-container').addEventListener('click', () => openVideo(buildingId));


  modal.style.display = 'flex';
  document.body.style.overflow ='hidden';
}

// ==================== 全景漫游 ====================
// AI辅助: DeepSeek辅助弹窗和Pannellum调用2026-04-22 13:00-15:30
function openVideo(buildingId) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  const data = buildingData[buildingId];

  if (!modal || !content || !data) return;

  const videoSrc = data.video || '';

  content.innerHTML = `
    <h2 style="margin-bottom:12px;color:#1f1b17;
               border-bottom:3px solid #d4af37;padding-bottom:10px;">
      ${data.name} · 讲解视频
    </h2>

    <div style="width:100%;background:#111;border-radius:12px;overflow:hidden;
                box-shadow:0 10px 30px rgba(0,0,0,0.25);">
      ${
        videoSrc
          ? `
            <video
              src="${videoSrc}"
              controls
              autoplay
              playsinline
              style="width:100%;max-height:520px;display:block;background:#000;">
              您的浏览器不支持 video 标签。
            </video>
          `
          : `
            <div style="height:320px;color:#fff;display:flex;align-items:center;
                        justify-content:center;text-align:center;padding:20px;">
              ⚠️ 当前建筑暂未配置讲解视频
            </div>
          `
      }
    </div>

    <div class="fun-fact" style="margin-top:16px;">
      <i class="fas fa-circle-play"></i>
      <span>点击播放按钮即可观看该建筑讲解视频。</span>
    </div>

    <div class="modal-interactive" style="margin-top:20px;">
      <button class="modal-btn gold-btn" onclick="openPanorama('${buildingId}')">
        <i class="fas fa-vr-cardboard"></i> 360° 全景漫游
      </button>

      <button class="modal-btn" onclick="openDetail('${buildingId}')"
              style="background:linear-gradient(135deg,#555,#333)">
        <i class="fas fa-arrow-left"></i> 返回详情
      </button>

      <button class="modal-btn"
              onclick="closeDetail()"
              style="background:linear-gradient(135deg,#c0392b,#e74c3c)">
        <i class="fas fa-times"></i> 关闭
      </button>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function openPanorama(buildingId) {
  const modal= document.getElementById('modal');
  const content = document.getElementById('modal-content');
  const data    = buildingData[buildingId];
  const name    = data ? data.name : buildingId;

  const panoramaUrls = {
    taihedian:'panorama/taihedian.jpg',
    qianqinggong: 'panorama/qianqinggong.jpg',
    siheyuan:     'panorama/siheyuan.jpg',
    huipai:       'panorama/huipai.jpg',
    zhaozhouqiao: 'panorama/zhaozhouqiao.jpg',
    lugouqiao:    'panorama/lugouqiao.jpg'
  };

  content.innerHTML = `
    <h2 style="margin-bottom:12px;color:#1f1b17;
               border-bottom:3px solid #d4af37;padding-bottom:10px;">
      ${name} · 360° 全景漫游
    </h2>
    <div id="panorama-container"
         style="width:100%;height:500px;background:#111;
                border-radius:10px;overflow:hidden;"></div>
    <div class="modal-interactive" style="margin-top:20px;">
      <button class="modal-btn gold-btn"
              onclick="playSpecificSound('${data ? data.sound : 'general'}')">
        <i class="fas fa-headphones"></i> 开启环境音
      </button>
      <button class="modal-btn"
              onclick="openDetail('${buildingId}')"
              style="background:linear-gradient(135deg,#555,#333)">
        <i class="fas fa-arrow-left"></i> 返回详情
      </button><button class="modal-btn"
              onclick="closeDetail()"
              style="background:linear-gradient(135deg,#c0392b,#e74c3c)">
        <i class="fas fa-times"></i> 关闭
      </button>
    </div>
    <div class="fun-fact" style="margin-top:15px;">
      <i class="fas fa-info-circle"></i>
      <span>拖动画面360°自由浏览，滚轮缩放，沉浸式体验古建空间。</span>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    try {
      pannellum.viewer('panorama-container', {
        type: 'equirectangular',
        panorama: panoramaUrls[buildingId],
        autoLoad: true,
        compass: true,
        showZoomCtrl: true,
        showFullscreenCtrl: true
      });
    } catch(e) {
      document.getElementById('panorama-container').innerHTML =
        `<div style="color:#fff;text-align:center;padding-top:200px;font-size:1rem;">⚠️ 全景图加载中，请确认panorama/ 文件夹中有对应图片文件。
         </div>`;
    }
  }, 250);
}

// ==================== 小游戏 ====================
// AI辅助: DeepSeek辅助拖拽和点击交互逻辑2026-04-22 13:00-15:30
function openGame(gameType) {
  const modal   = document.getElementById('modal');
  const content = document.getElementById('modal-content');

  if (gameType === 'sunmao') {
    content.innerHTML = `
      <h2 style="margin-bottom:12px;color:#1f1b17;
                 border-bottom:3px solid #d4af37;padding-bottom:10px;">🔧榫卯拼装体验
      </h2>
      <p style="color:#666;margin-bottom:20px;line-height:1.7;">
        互动玩法：拖拽左侧黄色<strong>【榫头】</strong>，
        精准放入右侧暗色<strong>【卯眼】</strong>完成拼装。
        体验中国木构建筑"不着一钉"的千年智慧。
      </p>
      <div id="game-area"
           style="position:relative;width:100%;height:320px;background:linear-gradient(135deg,#f5f2ec,#ede8dc);
                  border-radius:14px;border:2px dashed #d4af37;overflow:hidden;">
        <!--卯眼 -->
        <div id="target-maoyan"
             style="position:absolute;right:15%;top:50%;transform:translateY(-50%);
                    width:120px;height:160px;background:#6b5535;border-radius:10px;
                    display:flex;justify-content:center;align-items:center;
                    box-shadow:inset 0 8px 24px rgba(0,0,0,0.6);">
          <div style="width:52px;height:82px;background:#3a2512;border-radius:5px;"></div>
          <div style="position:absolute;top:-22px;color:#aaa;font-size:0.78rem;text-align:center;white-space:nowrap;">卯眼（目标）
          </div>
        </div>
        <!-- 榫头 -->
        <div id="drag-suntou" draggable="true"
             style="position:absolute;left:15%;top:50%;transform:translateY(-50%);
                    width:100px;height:80px;
                    background:linear-gradient(135deg,#e4c16f,#d4af37);
                    border-radius:8px;cursor:grab;
                    display:flex;justify-content:center;align-items:center;
                    font-weight:bold;color:#fff;font-size:1rem;
                    box-shadow:0 6px 18px rgba(212,175,55,0.5);user-select:none;">
          榫头<div style="position:absolute;bottom:-22px;color:#aaa;
                      font-size:0.78rem;white-space:nowrap;">拖我过去→</div>
        </div>
        <div id="success-overlay"
             style="position:absolute;inset:0;background:rgba(40,167,69,0.15);
                    border-radius:14px;display:none;
                    align-items:center;justify-content:center;">
          <div style="font-size:3rem;">🎉</div>
        </div>
      </div>
      <div id="game-msg"
           style="text-align:center;height:36px;margin-top:16px;
                  font-size:1.1rem;color:#d4af37;font-weight:bold;"></div>
      <div style="text-align:center;margin-top:12px;">
        <button class="modal-btn gold-btn" onclick="openGame('sunmao')"><i class="fas fa-redo"></i> 重新挑战
        </button><button class="modal-btn"
                onclick="closeDetail()"
                style="background:linear-gradient(135deg,#555,#333)">
          <i class="fas fa-times"></i> 关闭
        </button>
      </div>
    `;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(initDragGame, 200);

  } else if (gameType === 'dougong') {
    content.innerHTML = `
      <h2 style="margin-bottom:12px;color:#1f1b17;
                 border-bottom:3px solid #d4af37;padding-bottom:10px;">
        🏯斗拱层级拆解模拟
      </h2>
      <p style="color:#666;margin-bottom:20px;line-height:1.7;">
        互动玩法：从上往下依次<strong>点击构件</strong>进行拆解，
        观察斗拱一层一层拆除后结构如何变化，体验古建抗震减震的核心原理。
      </p>
      <div id="dougong-area"
           style="width:100%;height:380px;
                  background:linear-gradient(180deg,#f5f2ec,#ede8dc);
                  border-radius:14px;display:flex;flex-direction:column;
                  align-items:center;justify-content:flex-end;
                  padding-bottom:20px;gap:4px;">
        <div class="dg-piece"
             data-info="昂：斗拱最外层悬挑构件，承接屋檐重量并形成向外挑出的弧度"
             style="width:240px;height:44px;
                    background:linear-gradient(90deg,#c39c41,#d4af37);
                    cursor:pointer;text-align:center;color:#fff;line-height:44px;
                    border-radius:6px;box-shadow:0 4px 10px rgba(0,0,0,0.15);
                    transition:all 0.4s;font-size:0.95rem;">
          昂（第一层 ·悬挑减震）
        </div>
        <div class="dg-piece"
             data-info="耍头：斗拱中层横向构件，传递并分散来自上层的荷载"
             style="width:180px;height:44px;
                    background:linear-gradient(90deg,#b2892d,#c39c41);
                    cursor:pointer;text-align:center;color:#fff;line-height:44px;
                    border-radius:6px;box-shadow:0 4px 10px rgba(0,0,0,0.15);
                    transition:all 0.4s;font-size:0.95rem;">
          耍头（第二层 · 横向传力）
        </div>
        <div class="dg-piece"
             data-info="泥道拱：斗拱核心横拱，连接两侧构件，均匀分配压力"
             style="width:200px;height:44px;
                    background:linear-gradient(90deg,#96701b,#b2892d);
                    cursor:pointer;text-align:center;color:#fff;line-height:44px;
                    border-radius:6px;box-shadow:0 4px 10px rgba(0,0,0,0.15);
                    transition:all 0.4s;font-size:0.95rem;">
          泥道拱（第三层 · 压力均布）
        </div>
        <div class="dg-piece"
             data-info="栌斗：斗拱最底层的大斗，直接承坐在柱头上，是整组斗拱的基础"
             style="width:90px;height:54px;
                    background:linear-gradient(90deg,#71520e,#96701b);
                    cursor:pointer;text-align:center;color:#fff;line-height:54px;
                    border-radius:6px;box-shadow:0 4px 10px rgba(0,0,0,0.15);
                    transition:all 0.4s;font-size:0.95rem;">
          栌斗（底座）
        </div>
        <div style="width:50px;height:110px;
                    background:linear-gradient(180deg,#4a3406,#2e1e00);
                    display:flex;justify-content:center;align-items:center;
                    color:#fff;font-size:0.8rem;
                    border-radius:4px 4px 0 0;letter-spacing:2px;">
          立柱
        </div></div>
      <div id="dg-info"
           style="background:#f0f4ff;border-left:4px solid #6a11cb;
                  padding:12px 16px;border-radius:0 8px 8px 0;
                  margin-top:14px;min-height:48px;color:#333;
                  font-size:0.92rem;line-height:1.6;display:none;"></div>
      <div id="dg-msg"
           style="text-align:center;height:32px;margin-top:10px;
                  font-size:1rem;color:#666;"></div>
      <div style="text-align:center;margin-top:12px;">
        <button class="modal-btn gold-btn" onclick="openGame('dougong')">
          <i class="fas fa-hammer"></i> 修复复原
        </button>
        <button class="modal-btn"
                onclick="closeDetail()"
                style="background:linear-gradient(135deg,#555,#333)">
          <i class="fas fa-times"></i> 关闭
        </button>
      </div>
    `;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(initClickGame, 200);
  }
}

function initDragGame() {
  const suntou= document.getElementById('drag-suntou');
  const maoyan  = document.getElementById('target-maoyan');
  const msg     = document.getElementById('game-msg');
  const overlay = document.getElementById('success-overlay');
  if (!suntou || !maoyan) return;

  suntou.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', 'suntou');
    suntou.style.opacity = '0.65';
    suntou.style.cursor= 'grabbing';
  });
  suntou.addEventListener('dragend', () => {
    suntou.style.opacity = '1';
    suntou.style.cursor  = 'grab';
  });
  maoyan.addEventListener('dragover',  e => {
    e.preventDefault();
    maoyan.style.boxShadow = '0 0 0 3px #d4af37, inset 0 8px 24px rgba(0,0,0,0.6)';
  });
  maoyan.addEventListener('dragleave', () => {
    maoyan.style.boxShadow = 'inset 0 8px 24px rgba(0,0,0,0.6)';
  });
  maoyan.addEventListener('drop', e => {
    e.preventDefault();
    maoyan.style.boxShadow = 'none';
    const areaRect= document.getElementById('game-area').getBoundingClientRect();
    const targetRect = maoyan.getBoundingClientRect();
    suntou.style.left      = (targetRect.left - areaRect.left + (targetRect.width  - 100) / 2) + 'px';
    suntou.style.top       = (targetRect.top  - areaRect.top  + (targetRect.height - 80)  / 2) + 'px';
    suntou.style.transform = 'none';
    suntou.draggable       = false;
    suntou.style.cursor    = 'default';
    suntou.style.boxShadow = 'none';
    suntou.style.background = 'linear-gradient(135deg,#2ecc71,#27ae60)';
    if (overlay) overlay.style.display = 'flex';
    msg.innerHTML = '🎉 严丝合缝，不着一钉！榫卯拼装成功！';
    showToast('🏆 触发成就：木作大师！');
  });
}

function initClickGame() {
  const pieces= document.querySelectorAll('.dg-piece');
  const msg     = document.getElementById('dg-msg');
  const infoBox = document.getElementById('dg-info');
  let removedCount = 0;

  pieces.forEach(piece => {
    piece.addEventListener('click', function() {
      if (this.style.opacity === '0') return;
      if (infoBox) {
        infoBox.style.display = 'block';
        infoBox.textContent   = this.dataset.info || '';
      }
      this.style.transform= 'translateX(200px) rotate(15deg)';
      this.style.opacity       = '0';
      this.style.pointerEvents = 'none';
      removedCount++;
      const msgs = [
        '已拆除第一层悬挑构件：屋檐缓冲开始减弱 ⚠️',
        '已拆除横向传力构件：荷载集中现象加剧 ⚠️',
        '已拆除核心压力均布构件：结构已严重弱化 🔴'
      ];
      if (msg) msg.textContent = msgs[Math.min(removedCount - 1, 2)] || '';
      if (removedCount === pieces.length) {
        if (msg) {
          msg.style.color= '#e74c3c';
          msg.style.fontWeight = 'bold';
          msg.textContent      = '⚠️ 斗拱已完全解体！屋顶重力将直接压垮立柱！';
        }
        showToast('💡 这就是斗拱的价值——层层传力，保护立柱！');
      }
    });
  });
}

// ==================== AI 问答助手（智谱GLM版）====================

const AI_CONFIG = {
  apiKey:'e91fce2d7e794c64b5d6b51a8c054aab.sPuLPOvE8oa2PVWK',

  model:   'glm-4-flash',
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
};

const aiKnowledge = {
  '斗拱':'斗拱是中国古建筑独有的结构构件，位于柱头与梁枋之间。通过层层出挑的斗和拱，将屋顶重量分散传递到柱子，同时在地震时通过构件间摩擦滑动耗散能量，起到减震作用。斗拱越多、层数越高，代表建筑等级越高。',
  '榫卯':  '榫卯是中国传统木构建筑连接构件的核心技术，不用铁钉，依靠凸起的"榫"插入凹槽"卯"实现咬合。这种连接方式具有弹性，在地震时可适度形变后恢复，既有刚度又有韧性，是古建筑抗震的核心秘密。',
  '赵州桥':'赵州桥建于隋代（595-605年），由工匠李春主持建造，是世界现存最早的敞肩石拱桥。主拱两侧各设两个小拱，减轻自重约60吨，洪水时小拱过水减少冲击力，比欧洲同类桥梁早约1200年。',
  '四合院':'四合院是北京传统民居，以中轴对称、四面围合为特征。正房坐北朝南获最佳采光，厢房分列两侧，体现儒家长幼有序的礼制观念。高墙防风沙，内院保温，是北方气候与儒家文化的完美结合。',
  '马头墙':'马头墙是徽派建筑的标志性特征，高出屋顶的封火山墙因形似马头而得名。主要功能是防火——阻断相邻建筑火势蔓延，同时兼具防风雨功能，与青山绿水相映成趣。',
  '太和殿':'太和殿是中国现存最高等级的古代宫殿。重檐庑殿顶（最高等级），黄色琉璃瓦（皇帝专用），面阔11间（最高规格），高35.05米。全凭榫卯连接，无一铁钉，600年稳立，体现皇权礼制顶峰。',
  '屋顶':  '中国古建筑屋顶等级由高到低：重檐庑殿顶→重檐歇山顶→单檐庑殿顶→单檐歇山顶→悬山顶→硬山顶。颜色等级：黄（皇家）→绿（王府）→蓝（天坛）→灰（民居）。',
  '卢沟桥':'卢沟桥建于金代（1189年），11孔联拱，总长266.5米，501尊形态各异的石狮。"卢沟晓月"是燕京八景之一，1937年七七事变在此爆发，是中国抗日战争的起点。',
  '琉璃':  '琉璃瓦以高岭土烧制后上釉二次烧成。黄色皇家专用，绿色用于王府，蓝色用于天坛（象征天空），黑色用于文渊阁（藏书楼，黑色属水寓意防火）。',
  '徽派':  '徽派建筑以粉墙黛瓦马头墙为特征。天井通风采光，高马头墙防火，三雕（砖雕、木雕、石雕）精美，依山傍水布局，与自然山水高度融合，是南方民居的杰出代表。'
};

// 系统提示词
const AI_SYSTEM_PROMPT = `你是"华构千年"平台的古建筑知识AI助手，专门解答中国古代建筑相关问题。
知识范围：宫殿建筑、民居建筑、古桥梁、榫卯结构、斗拱工艺、屋顶形制、礼制等级、建筑材料、历史文化。
回答要求：
1. 语言简洁专业，适合科普，200字以内
2. 适当引用数据和历史年份增强可信度
3.遇到与古建筑无关的问题，礼貌引导回古建筑话题
请用中文回答。`;

// 多轮对话历史
let chatHistory = [];

function toggleAI() {
  const panel = document.getElementById('aiPanel');
  const fab= document.getElementById('aiFab');
  panel.classList.toggle('open');
  fab.style.transform = panel.classList.contains('open')
    ? 'rotate(10deg) scale(1.1)' : '';

  const body = document.getElementById('aiChatBody');
  if (panel.classList.contains('open') && body && body.children.length === 0) {
    const hasKey = AI_CONFIG.apiKey && AI_CONFIG.apiKey !== '你的智谱GLM_APIKey填在这里';
    addAIMessage('bot',
      `您好！我是古建智识AI 助手 🏯\n\n` +
      (hasKey
        ? `✅ 已连接智谱 GLM（${AI_CONFIG.model}），可自由提问！`
        : `📚 当前使用本地知识库模式\n请在 script.js 的 AI_CONFIG.apiKey 填入你的智谱Key`) +
      `\n\n请问您想了解哪方面的古建筑知识？`
    );
  }
}

function addAIMessage(role, text) {
  const body = document.getElementById('aiChatBody');
  if (!body) return;
  const msg = document.createElement('div');
  msg.className = `ai-msg ${role}`;
  msg.style.whiteSpace = 'pre-wrap';
  msg.textContent = text;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
  return msg;
}

function showTyping() {
  const body = document.getElementById('aiChatBody');
  if (!body) return null;
  const el = document.createElement('div');
  el.className = 'ai-msg typing';
  el.id = 'typing-indicator';
  el.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>`;
  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
  return el;
}

function localAnswer(question) {
  const q = question.toLowerCase();
  for (const [kw, ans] of Object.entries(aiKnowledge)) {
    if (q.includes(kw.toLowerCase())) return ans;
  }
  const fallback = [
    '这是个好问题！中国古建筑融合了力学、美学与礼制哲学。建议点击页面上的建筑卡片查看详细档案。',
    '古建筑智慧博大精深。可以点击下方快捷按钮，探索榫卯、斗拱、宫殿等具体话题。',
    '您可以通过页面上的互动图表和小游戏深入了解。或者换个关键词再问问我？'
  ];
  return fallback[Math.floor(Math.random() * fallback.length)];
}

async function callGLMAPI(question) {
  chatHistory.push({ role: 'user', content: question });
  if (chatHistory.length > 16) chatHistory = chatHistory.slice(-16);

  const resp = await fetch(AI_CONFIG.baseURL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`
    },
    body: JSON.stringify({
      model:    AI_CONFIG.model,
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        ...chatHistory
      ],
      max_tokens:  500,
      temperature: 0.7,
      stream:      false
    })
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || `请求失败 ${resp.status}`);
  }

  const data   = await resp.json();
  const answer = data.choices?.[0]?.message?.content?.trim() || '抱歉，未获取到回答。';
  chatHistory.push({ role: 'assistant', content: answer });
  return answer;
}

async function aiSend() {
  const input= document.getElementById('aiInput');
  const question = input ? input.value.trim() : '';
  if (!question) return;
  input.value    = '';
  input.disabled = true;

  addAIMessage('user', question);
  const typing = showTyping();

  const hasKey = AI_CONFIG.apiKey && AI_CONFIG.apiKey !== '你的智谱GLM_APIKey填在这里';

  try {
    let answer;
    if (hasKey) {
      answer = await callGLMAPI(question);
    } else {
      await new Promise(r => setTimeout(r, 700+ Math.random() * 400));
      answer = localAnswer(question);
    }
    if (typing) typing.remove();
    addAIMessage('bot', answer);
  } catch(e) {
    if (typing) typing.remove();
    addAIMessage('bot',
      `⚠️ AI 连接失败：${e.message}\n\n` +
      `请检查：\n1. APIKey 是否正确\n2. 网络是否正常\n3. 账户余额是否充足\n\n` +
      `已切换为本地知识库模式↓`
    );
    await new Promise(r => setTimeout(r, 300));
    addAIMessage('bot', localAnswer(question));
  } finally {
    input.disabled = false;
    input.focus();
  }
}

function aiQuickAsk(question) {
  const panel = document.getElementById('aiPanel');
  if (!panel.classList.contains('open')) panel.classList.add('open');
  const input = document.getElementById('aiInput');
  if (input) { input.value = question; aiSend(); }
}

function showAPIConfig() {
  const current = (AI_CONFIG.apiKey && AI_CONFIG.apiKey !== '你的智谱GLM_APIKey填在这里')
    ? AI_CONFIG.apiKey.substring(0, 10) + '...'
    : '（未设置）';
  const key = prompt(
    `当前 APIKey：${current}\n\n请输入你的智谱 GLM APIKey：\n（前往https://open.bigmodel.cn 获取）`,
    ''
  );
  if (key === null) return;
  AI_CONFIG.apiKey = key.trim();
  chatHistory = [];
  const body = document.getElementById('aiChatBody');
  if (body) body.innerHTML = '';
  if (AI_CONFIG.apiKey) {
    addAIMessage('bot', `✅ APIKey 已更新！现在使用智谱 GLM（${AI_CONFIG.model}）回答问题。\n\n请问您想了解什么古建筑知识？`);
    showToast('✅ 智谱 GLM 已连接');
  } else {
    addAIMessage('bot', '📚 已切换回本地知识库模式。');
    showToast('📚 已切换为本地知识库');
  }
}

//==================== 彩蛋 ====================
function initEasterEgg() {
  const trigger = document.getElementById('egg-trigger');
  if (!trigger) return;
  let count = 0, timer = null;
  trigger.addEventListener('click', () => {
    count++;
    clearTimeout(timer);
    timer = setTimeout(() => { count = 0; }, 1200);
    if (count >= 3) { count = 0; showEasterEgg(); }
  });
}

function showEasterEgg() {
  launchConfetti();
  const msg = document.createElement('div');
  msg.className = 'egg-message';
  msg.innerHTML = '🎉 匠心独运，筑韵千年🎉<br><small style="font-size:0.85rem;opacity:0.85">发现隐藏彩蛋！古建传承，你我同行。</small>';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3200);
  showToast('🥚隐藏彩蛋已解锁！');
}

function launchConfetti() {
  const colors = ['#d4af37','#e4c16f','#7a9eb1','#5d8a82','#c0392b','#fff'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; top:-10px;
      left:${Math.random() * 100}vw;
      width:${6 + Math.random() * 6}px;
      height:${6 + Math.random() * 6}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      z-index:999999; pointer-events:none;
      animation:confettiFall ${1.5 + Math.random() * 2}s linear forwards;
      animation-delay:${Math.random() * 0.8}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

// ==================== 图表 ====================
// AI辅助: DeepSeek辅助图表配置，2026-04-25 16:30-17:00
function initChartTime() {
  const el = document.getElementById('chart-time');
  if (!el) return;

  const chart = echarts.init(el);

  const techData = [
    {
      name: '秦汉',
      value: 38,
      img: 'images/history/qinhan.jpg',
      title: '夯土与早期木构体系',
      desc: '秦汉时期宫殿、陵寝和城墙建设规模宏大，夯土台基、高台建筑和早期木构体系逐渐发展。'
    },
    {
      name: '魏晋',
      value: 50,
      img: 'images/history/weijin.jpg',
      title: '佛寺与塔式建筑兴起',
      desc: '魏晋南北朝时期佛教建筑兴盛，寺院、石窟、木塔和砖塔推动了建筑类型的丰富。'
    },
    {
      name: '隋唐',
      value: 70,
      img: 'images/history/suitang.jpg',
      title: '大木作体系趋于成熟',
      desc: '隋唐建筑气势宏大，斗拱、屋顶、柱网和院落布局更加成熟，是中国古建筑发展的高峰阶段。'
    },
    {
      name: '宋辽',
      value: 83,
      img: 'images/history/songliao.jpg',
      title: '建筑制度规范化',
      desc: '宋代《营造法式》系统总结建筑做法，使木构建筑的用材、比例和构件制度更加规范。'
    },
    {
      name: '金元',
      value: 89,
      img: 'images/history/jinyuan.jpg',
      title: '多民族建筑技术融合',
      desc: '金元时期北方建筑、宫殿建筑与宗教建筑相互影响，结构技术和空间形制进一步融合。'
    },
    {
      name: '明清',
      value: 98,
      img: 'images/history/mingqing.jpg',
      title: '官式建筑高度成熟',
      desc: '明清时期官式建筑制度完善，故宫、坛庙、园林等类型体现出严整的等级秩序和高超工艺。'
    }
  ];

  chart.setOption({
    backgroundColor: 'transparent',

    title: {
      text: '中国古建筑历代技术成熟度指数',
      left: 'center',
      top: 16,
      textStyle: {
        color: '#333',
        fontSize: 22,
        fontWeight: 700
      },
      subtext: '从结构体系、营造制度、空间布局与工艺成熟度综合评估',
      subtextStyle: {
        color: '#999',
        fontSize: 13
      }
    },

    tooltip: {
      trigger: 'axis',
      confine: true,
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#d4af37',
      borderWidth: 1,
      padding: 12,
      extraCssText: `
        white-space: normal;
        max-width: 300px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.18);
        border-radius: 10px;
      `,
      textStyle: {
        color: '#333'
      },
      formatter: function (params) {
        const item = params[0].data;

        return `
          <div style="
            width:270px;
            max-width:270px;
            white-space:normal;
            word-break:break-all;
            overflow-wrap:break-word;
            box-sizing:border-box;
          ">
            <img 
              src="${item.img}" 
              style="
                display:block;
                width:100%;
                height:135px;
                object-fit:cover;
                border-radius:8px;
                margin-bottom:10px;
                background:#eee;
              "
              onerror="console.error('历史图表图片加载失败：', this.src);"
            >

            <div style="
              font-size:17px;
              font-weight:bold;
              color:#8b5a2b;
              margin-bottom:4px;
              line-height:1.4;
            ">
              ${item.name} · 成熟度 ${item.value}
            </div>

            <div style="
              font-size:14px;
              font-weight:bold;
              color:#333;
              margin-bottom:6px;
              line-height:1.5;
            ">
              ${item.title}
            </div>

            <div style="
              font-size:13px;
              line-height:1.7;
              color:#555;
            ">
              ${item.desc}
            </div>
          </div>
        `;
      }
    },

    grid: {
      left: 90,
      right: 140,
      top: 125,
      bottom: 95,
      containLabel: true
    },

    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: techData.map(item => item.name),
      axisTick: {
        show: true,
        alignWithLabel: true
      },
      axisLine: {
        lineStyle: {
          color: '#777'
        }
      },
      axisLabel: {
        color: '#666',
        fontSize: 15,
        margin: 16
      }
    },

    yAxis: {
      type: 'value',
      name: '技术成熟指数',
      min: 0,
      max: 100,
      splitNumber: 5,
      nameTextStyle: {
        color: '#777',
        fontSize: 14,
        padding: [0, 0, 10, 0]
      },
      axisLabel: {
        color: '#666',
        fontSize: 14
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(120,120,120,0.18)',
          type: 'solid'
        }
      }
    },



    series: [
      {
        name: '技术成熟度指数',
        type: 'line',
        smooth: true,
        data: techData,

        symbol: 'circle',
        symbolSize: 15,

        lineStyle: {
          color: '#d8aa24',
          width: 5,
          shadowBlur: 8,
          shadowColor: 'rgba(216,170,36,0.35)'
        },

        itemStyle: {
          color: '#d8aa24',
          borderColor: '#fff',
          borderWidth: 3,
          shadowBlur: 8,
          shadowColor: 'rgba(0,0,0,0.18)'
        },

        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(216,170,36,0.28)'
            },
            {
              offset: 1,
              color: 'rgba(216,170,36,0.03)'
            }
          ])
        },

        label: {
          show: true,
          position: 'top',
          distance: 12,
          color: '#d8aa24',
          fontSize: 16,
          fontWeight: 'bold',
          formatter: function (params) {
            return params.data.value;
          }
        },

        emphasis: {
          scale: true,
          itemStyle: {
            color: '#b8860b',
            borderColor: '#fff',
            borderWidth: 4,
            shadowBlur: 18,
            shadowColor: 'rgba(184,134,11,0.45)'
          }
        },

        markPoint: {
          symbol: 'pin',
          symbolSize: 56,
          label: {
            color: '#fff',
            fontWeight: 'bold'
          },
          itemStyle: {
            color: '#8b5a2b'
          },
          data: [
            {
              name: '制度成熟',
              coord: ['宋辽', 83],
              value: '法式'
            },
            {
              name: '巅峰阶段',
              coord: ['明清', 98],
              value: '巅峰'
            }
          ]
        }
      }
    ]
  });

  window.addEventListener('resize', function () {
    chart.resize();
  });
}

function initChartArea() {
  const el = document.getElementById('chart-area');
  if (!el) return;
  echarts.init(el).setOption({
    title:   { text:'古建筑地域风格分布占比', left:'center', textStyle:{color:'#333',fontSize:17} },
    tooltip: { trigger:'item', formatter:'{b}：{c}% ({d}%)' },
    legend:  { orient:'vertical', left:'left', top:'center', textStyle:{color:'#666'} },
    series: [{
      name:'地域分布', type:'pie',
      radius:['35%','68%'], center:['60%','52%'],
      itemStyle: { borderRadius:8, borderColor:'#fff', borderWidth:2 },
      label: { show:false },
      emphasis: { itemStyle:{ shadowBlur:12, shadowColor:'rgba(0,0,0,0.4)' } },
      data: [
        { name:'北方宫殿官式建筑', value:42, itemStyle:{color:'#d4af37'} },
        { name:'北方四合院民居',value:28, itemStyle:{color:'#8b7355'} },
        { name:'南方徽派天井民居', value:20, itemStyle:{color:'#7a9eb1'} },
        { name:'华北古石拱桥',     value:10, itemStyle:{color:'#5d8a82'} }
      ],
      animationType:'scale', animationEasing:'elasticOut'
    }]
  });
}

function initChartParam() {
  const el = document.getElementById('chart-param');
  if (!el) return;
  echarts.init(el).setOption({
    title:   { text:'古建筑高度·跨度·规模工程参数对比', left:'center', textStyle:{color:'#333',fontSize:17} },
    tooltip: { trigger:'axis', axisPointer:{type:'shadow'} },
    legend:  { data:['建筑高度(m)','石拱跨度(m)'], top:'8%', textStyle:{color:'#666'} },
    grid:    { left:'5%', right:'5%', top:'20%', bottom:'10%', containLabel:true },
    xAxis:   { data:['太和殿','乾清宫','四合院','赵州桥','卢沟桥'], axisLabel:{color:'#666',interval:0} },
    yAxis:   { type:'value', name:'米(m)', axisLabel:{color:'#666'} },
    series: [
      { type:'bar', name:'建筑高度(m)', data:[35.05,20,7.8,7.2,10.4],
        itemStyle:{color:'#d4af37',borderRadius:[4,4,0,0]}, emphasis:{itemStyle:{color:'#b8942a'}} },
      { type:'bar', name:'石拱跨度(m)', data:[0,0,0,37.02,21.2],
        itemStyle:{color:'#5d8a82',borderRadius:[4,4,0,0]}, emphasis:{itemStyle:{color:'#4a6e68'}} }
    ],
    animationDuration:1500
  });
}

function initChartMechanics() {
  const el = document.getElementById('chart-mechanics');
  if (!el) return;
  echarts.init(el).setOption({
    title:   { text:'古建筑结构力学性能对比（承重/抗震/耐久）', left:'center', textStyle:{color:'#333',fontSize:17} },
    tooltip: { trigger:'axis' },
    legend:  { data:['承重能力','抗震性能','耐久年限'], top:'8%', textStyle:{color:'#666'} },
    grid:    { left:'5%', right:'5%', top:'20%', bottom:'10%', containLabel:true },
    xAxis:   { data:['太和殿','四合院','赵州桥','卢沟桥','徽派民居'], axisLabel:{color:'#666',interval:0} },
    yAxis:   { type:'value', max:100, name:'性能指数(0-100)', axisLabel:{color:'#666'} },
    series: [
      { type:'bar', name:'承重能力', data:[95,70,90,85,65], itemStyle:{color:'#d4af37',borderRadius:[4,4,0,0]} },
      { type:'bar', name:'抗震性能', data:[90,75,95,80,70], itemStyle:{color:'#7a9eb1',borderRadius:[4,4,0,0]} },
      { type:'bar', name:'耐久年限', data:[85,80,100,90,75], itemStyle:{color:'#5d8a82',borderRadius:[4,4,0,0]} }
    ],
    animationDuration:1500
  });
}
// AI辅助: DeepSeek辅助弹窗和Pannellum调用2026-04-22 13:00-15:30
function initChartRank() {
  const el = document.getElementById('chart-rank');
  if (!el) return;
  echarts.init(el).setOption({
    title:   { text:'古建筑等级·屋顶形制·色彩规制体系', left:'center', textStyle:{color:'#333',fontSize:17} },
    tooltip: {
  trigger: 'item',
  backgroundColor: 'rgba(255, 255, 255, 0.96)',
  borderColor: '#d4af37',
  borderWidth: 1,
  padding: 12,
  textStyle: {
    color: '#333'
  },
  formatter: function (params) {
    const item = params.data;

    return `
      <div style="width:280px;">
        <img 
          src="${item.img}" 
          style="width:100%;height:130px;object-fit:cover;border-radius:8px;margin-bottom:8px;"
        >
        <div style="font-size:16px;font-weight:bold;color:#8b5a2b;margin-bottom:6px;">
          ${item.name}
        </div>
        <div style="font-size:13px;line-height:1.6;color:#555;">
          ${item.desc}
        </div>
        <div style="margin-top:6px;font-size:13px;color:#999;">
          占比：${params.percent}%
        </div>
      </div>
    `;
  }
}
,
    legend:  { orient:'vertical', left:'left', top:'center', textStyle:{color:'#666'} },
    series: [{
      name:'屋顶等级', type:'pie',
      radius:['30%','68%'], center:['60%','52%'],
      itemStyle: { borderRadius:8, borderColor:'#fff', borderWidth:2 },
      label: { show:false },
      emphasis: { itemStyle:{ shadowBlur:12, shadowColor:'rgba(0,0,0,0.4)' } },
      data: [
        { name:'重檐庑殿顶（皇家最高）',  img: 'images/roof/wudian.jpg',
    desc: '等级最高的屋顶形式，多用于皇宫正殿，如太和殿。',value:10, itemStyle:{color:'#d4af37'} },
        { name:'重檐歇山顶（皇家高级）',  img: 'images/roof/xieshan.jpg',
    desc: '等级仅次于庑殿顶，常用于重要宫殿建筑。',value:20, itemStyle:{color:'#b8942a'} },
        { name:'单檐庑殿顶（王府）',img: 'images/roof/danyan-wudian.jpg',
    desc: '用于较高等级建筑，形制庄重。',value:15, itemStyle:{color:'#9c7a1e'} },
        { name:'单檐歇山顶（官员）',  img: 'images/roof/danyan-xieshan.jpg',
    desc: '常见于官式建筑，兼具等级感与装饰性。',    value:25, itemStyle:{color:'#7a9eb1'} },
        { name:'悬山顶/硬山顶（民居）',   img: 'images/roof/minju.jpg',
    desc: '多见于传统民居建筑，实用性较强。',value:30, itemStyle:{color:'#5d8a82'} }
      ],
      animationType:'scale', animationEasing:'elasticOut'
    }]
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initChartTime();
  initChartArea();
  initChartParam();
  initChartMechanics();
  initChartRank();
  initChartResize();
  initParticles();
  initReveal();
  initSmartNavigation();
  initAmbientSounds();
  initEasterEgg();

  if (typeof gsap !== 'undefined') {
    gsap.from('.banner-text h1', {
      duration: 1.4,
      y: 60,
      opacity: 0,
      ease: 'power3.out'
    });

    gsap.from('.banner-text p', {
      duration: 1.2,
      y: 30,
      opacity: 0,
      stagger: 0.25,
      delay: 0.4,
      ease: 'power3.out'
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDetail();
  });

  const modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === this) closeDetail();
    });
  }

  setTimeout(() => {
    showToast('🏯欢迎来到华构千年！点击建筑卡片开始探索');
  }, 1500);
});
function stopAllMedia() {
  // 停止所有视频
  document.querySelectorAll('video').forEach(video => {
    try {
      video.pause();
      video.currentTime = 0;
      video.removeAttribute('src');
      video.load();
    } catch (e) {
      console.warn('视频停止失败：', e);
    }
  });

  // 停止所有 audio 标签音频，包括环境音
  document.querySelectorAll('audio').forEach(audio => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) {
      console.warn('音频停止失败：', e);
    }
  });

  // 停止可能存在的全局环境音变量
  ['ambientAudio', 'bgAudio', 'currentAmbientSound'].forEach(key => {
    if (window[key]) {
      try {
        window[key].pause();
        window[key].currentTime = 0;
      } catch (e) {
        console.warn(`${key} 停止失败：`, e);
      }
    }
  });
}

function closeDetail() {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');

  stopAllMedia();

  if (modal) {
    modal.style.display = 'none';
  }

  if (content) {
    content.innerHTML = '';
  }

  document.body.style.overflow = '';
}



// ==================== 动态样式注入 ====================
(function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confettiFall {
      0%{ transform:translateY(-10px) rotate(0deg);   opacity:1; }
      100% { transform:translateY(100vh)rotate(720deg); opacity:0; }
    }
    @keyframes modalFadeOut {
      from { opacity:1; } to { opacity:0; }}
    @media (max-width: 768px) {
      .hamburger { display:flex !important; }
      .nav-menu {
        display:none; width:100%; flex-direction:column; gap:4px;
        background:rgba(17,12,8,0.98); padding:12px 0;border-top:1px solid rgba(228,193,111,0.2);
      }
      .nav-menu.mobile-open { display:flex !important; }
      .nav-menu a{ padding:10px 20px; }
      .banner-text h1       { font-size:2.2rem !important; letter-spacing:3px !important; }
      .card-wrap            { grid-template-columns:1fr !important; }
      .craft-wrap           { grid-template-columns:1fr !important; }
      .modal-inner{ padding:26px 18px 22px !important; }
      .ai-panel             { width:calc(100vw - 32px) !important; right:16px !important; }
      .build-card{ height:500px !important; }
    }
  `;
  document.head.appendChild(style);
})();
